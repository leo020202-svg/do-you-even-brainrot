import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, Text, View, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/Button";
import { CATEGORY_EMOJI, EmojiSplat } from "@/components/EmojiSplat";
import { SeoHead } from "@/components/SeoHead";
import { Confetti } from "@/components/Confetti";
import { Shake } from "@/components/Shake";
import { categoryImage } from "@/lib/category-images";
import { characterImageForQuestion } from "@/lib/character-images";
import {
  getDailyChallenge,
  getPracticeChallenge,
  getRoomChallenge,
  DAILY_QUESTION_COUNT,
} from "@/lib/daily";
import { questionsById } from "@/lib/questions";
import { useDailyStore } from "@/features/daily/store";
import { useSettingsStore, difficultyMixFor } from "@/features/settings/store";
import { buildPattern, buildShareText } from "@/lib/share";
import { pickDailyBots, botRound, answerHistogram, type Bot } from "@/lib/bots";
import { codeToSeed, isValidRoomCode, normalizeRoomCode } from "@/lib/room";
import { useWebKeyboard } from "@/hooks/useWebKeyboard";
import {
  finaleHaptic,
  skipHaptic,
  successHaptic,
  tapHaptic,
  wrongHaptic,
} from "@/lib/haptics";
import type { AnswerOutcome } from "@/features/daily/store";
import type { AnswerId, Question } from "@/lib/questions";

const DEFAULT_PER_QUESTION_MS = 30_000;
const SPEED_BONUS_CEILING = 1000;
const REVEAL_AUTO_ADVANCE_MS = 5000;

function pointsFor(outcome: AnswerOutcome, msTaken: number, perQuestionMs: number): number {
  if (outcome !== "correct") return 0;
  const base = 500;
  const speed = Math.max(
    0,
    SPEED_BONUS_CEILING - Math.floor((msTaken / perQuestionMs) * SPEED_BONUS_CEILING),
  );
  return base + speed;
}

const OPTION_BG: Record<AnswerId, string> = {
  A: "bg-lime",
  B: "bg-hot",
  C: "bg-cyan",
  D: "bg-blood",
};
const OPTION_TEXT: Record<AnswerId, string> = {
  A: "text-ink",
  B: "text-paper",
  C: "text-ink",
  D: "text-paper",
};
const OPTION_TILT: Record<AnswerId, number> = { A: -1.5, B: 1.5, C: -0.5, D: 0.5 };

type Phase = "question" | "reveal";

// Re-exporting the synced flow under the same /play route — when ?start is
// present, the URL refers to a Kahoot-style time-paced game that everyone in
// the room sees at the same wall-clock moment. See app/play-synced.tsx and
// src/lib/sync.ts.
import PlaySynced from "./play-synced";

export default function Play() {
  const router = useRouter();
  const params = useLocalSearchParams<{ practice?: string; room?: string; start?: string }>();

  // Delegate to the synced screen whenever ?start is a valid future-or-recent
  // timestamp + ?room is set. Async/daily/practice still run the player-paced
  // logic below.
  const startNum = params.start ? Number(params.start) : NaN;
  if (params.room && Number.isFinite(startNum)) {
    return <PlaySynced />;
  }

  const isPractice = params.practice === "1";
  const roomCode = useMemo(() => {
    if (!params.room) return null;
    const c = normalizeRoomCode(params.room);
    return isValidRoomCode(c) ? c : null;
  }, [params.room]);
  const isRoom = roomCode !== null;

  // Settings only affect practice mode — see src/features/settings/store.ts.
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const settingsQuestions = useSettingsStore((s) => s.questionsPerRound);
  const settingsSeconds = useSettingsStore((s) => s.secondsPerQuestion);
  const settingsDifficulty = useSettingsStore((s) => s.difficulty);
  useEffect(() => {
    if (!settingsHydrated) void hydrateSettings();
  }, [settingsHydrated, hydrateSettings]);

  // Stable seed for practice runs so re-renders don't reshuffle the question set.
  const practiceSeed = useRef<number>(Date.now()).current;
  const practiceMix = useMemo(
    () => difficultyMixFor(settingsDifficulty, settingsQuestions),
    [settingsDifficulty, settingsQuestions],
  );
  const challenge = useMemo(() => {
    if (isRoom && roomCode) return getRoomChallenge(roomCode, codeToSeed(roomCode));
    if (isPractice) return getPracticeChallenge(practiceSeed, practiceMix);
    return getDailyChallenge();
  }, [isRoom, roomCode, isPractice, practiceSeed, practiceMix]);

  // Number of questions for THIS run — practice uses the setting, others stay 5.
  const totalQuestions = isPractice ? settingsQuestions : DAILY_QUESTION_COUNT;
  // Time per question — practice uses the setting, others stay 30s.
  const perQuestionMs = isPractice ? settingsSeconds * 1000 : DEFAULT_PER_QUESTION_MS;
  const complete = useDailyStore((s) => s.completeDaily);
  const dailyAlreadyPlayed = useDailyStore((s) => Boolean(s.results[challenge.dateKey]));
  // Only the real daily blocks replays; practice + rooms always let you replay.
  const alreadyPlayed = !isPractice && !isRoom && dailyAlreadyPlayed;

  // Show a first-time onboarding tooltip on Q1 of the daily if the player has
  // never finished one before. Dismissable; auto-hides after 6 seconds.
  const hasHistory = useDailyStore((s) => Object.keys(s.results).length > 0);
  const showOnboarding =
    !isPractice && !isRoom && !hasHistory;
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  useEffect(() => {
    if (!showOnboarding) return;
    const id = setTimeout(() => setOnboardingDismissed(true), 6000);
    return () => clearTimeout(id);
  }, [showOnboarding]);

  // Bots seeded off whatever uniquely identifies this run.
  const bots = useMemo(() => {
    if (isRoom && roomCode) return pickDailyBots(codeToSeed(roomCode) % 100000);
    if (isPractice) return pickDailyBots(practiceSeed % 100000);
    return pickDailyBots(challenge.index);
  }, [isRoom, roomCode, isPractice, practiceSeed, challenge.index]);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [playerPick, setPlayerPick] = useState<AnswerId | null>(null);
  const [playerOutcome, setPlayerOutcome] = useState<AnswerOutcome | null>(null);
  const [playerMs, setPlayerMs] = useState<number>(0);
  const [pointsThisRound, setPointsThisRound] = useState(0);
  const [outcomes, setOutcomes] = useState<AnswerOutcome[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [tick, setTick] = useState(0);

  const questionStartRef = useRef<number>(Date.now());
  const totalStartRef = useRef<number>(Date.now());

  // Running bot scores across rounds (rebuilt deterministically when idx changes).
  const botRunningScores = useMemo(() => {
    const out: Record<string, number> = {};
    for (const b of bots) out[b.name] = 0;
    for (let i = 0; i < idx; i++) {
      const qid = challenge.questionIds[i];
      if (!qid) continue;
      const q = questionsById[qid];
      if (!q) continue;
      for (const b of bots) {
        const r = botRound(b, q, challenge.index, i);
        out[b.name] = (out[b.name] ?? 0) + r.points;
      }
    }
    return out;
  }, [bots, challenge.index, challenge.questionIds, idx]);

  useEffect(() => {
    if (alreadyPlayed) router.replace("/");
  }, [alreadyPlayed, router]);

  // Timer ticks only during the question phase.
  useEffect(() => {
    if (phase !== "question") return;
    questionStartRef.current = Date.now();
    setTick(0);
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [idx, phase]);

  // Auto-advance after the reveal screen has been on long enough.
  useEffect(() => {
    if (phase !== "reveal") return;
    const id = setTimeout(advance, REVEAL_AUTO_ADVANCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  const q = questionsById[challenge.questionIds[idx] ?? ""];
  if (!q) {
    return (
      <Screen>
        <View className="flex-1 justify-center">
          <Text className="font-body text-paper">no questions loaded 💀</Text>
        </View>
      </Screen>
    );
  }

  const elapsed = tick * 100;
  const remainingMs = Math.max(0, perQuestionMs - elapsed);
  const remainingPct = phase === "question" ? remainingMs / perQuestionMs : 0;
  const remainingSec = Math.ceil(remainingMs / 1000);
  const lowTime = remainingPct < 0.25 && remainingPct > 0;

  // Web-only: 1/2/3/4 (and A/B/C/D) lock in the corresponding answer,
  // Enter on the reveal screen advances. Ignored if a modifier is held so
  // we don't hijack browser shortcuts like Cmd+Shift+1.
  const keyMap: Record<string, AnswerId> = {
    "1": "A",
    "2": "B",
    "3": "C",
    "4": "D",
    a: "A",
    b: "B",
    c: "C",
    d: "D",
  };
  useWebKeyboard((e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (phase === "question") {
      const pick = keyMap[e.key.toLowerCase()];
      if (pick) {
        e.preventDefault();
        lockIn(pick);
      }
    } else if (phase === "reveal") {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    }
  });

  function lockIn(answer: AnswerId | null) {
    if (phase !== "question") return;
    const msTaken = answer === null ? perQuestionMs : Date.now() - questionStartRef.current;
    const outcome: AnswerOutcome =
      answer === null ? "skipped" : answer === q!.correct_answer ? "correct" : "wrong";
    const pts = pointsFor(outcome, msTaken, perQuestionMs);
    setPlayerPick(answer);
    setPlayerOutcome(outcome);
    setPlayerMs(msTaken);
    setPointsThisRound(pts);
    setPlayerScore((s) => s + pts);
    setOutcomes((prev) => [...prev, outcome]);
    // Haptics: the tap if you picked, the warning if you timed out, then the
    // outcome ding once we land on the reveal screen.
    if (answer === null) skipHaptic();
    else tapHaptic();
    setTimeout(() => {
      if (outcome === "correct") successHaptic();
      else if (outcome === "wrong") wrongHaptic();
    }, 60);
    // Jump straight to reveal — no waiting for the timer.
    setPhase("reveal");
  }

  function advance() {
    if (idx + 1 >= totalQuestions) {
      finaleHaptic();
      finalize(outcomes, playerScore);
    } else {
      setIdx((i) => i + 1);
      setPlayerPick(null);
      setPlayerOutcome(null);
      setPlayerMs(0);
      setPointsThisRound(0);
      setPhase("question");
    }
  }

  // Auto-skip when question time runs out.
  useEffect(() => {
    if (phase === "question" && remainingMs <= 0) lockIn(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, phase]);

  async function finalize(finalOutcomes: AnswerOutcome[], finalScore: number) {
    const pattern = buildPattern(finalOutcomes);
    const totalMs = Date.now() - totalStartRef.current;
    // Only the real daily updates the streak / persists a result.
    if (!isPractice && !isRoom) {
      await complete({
        dateKey: challenge.dateKey,
        score: finalScore,
        total: totalQuestions * (500 + SPEED_BONUS_CEILING),
        pattern,
        outcomes: finalOutcomes,
        timeMs: totalMs,
      });
    }
    const correct = finalOutcomes.filter((o) => o === "correct").length;
    const shareText = buildShareText({
      dailyIndex: isPractice || isRoom ? 0 : challenge.index,
      score: correct,
      total: totalQuestions,
      pattern,
    });
    router.replace({
      pathname: "/result",
      params: {
        shareText,
        correct: String(correct),
        pattern,
        score: String(finalScore),
        total: String(totalQuestions),
        practice: isPractice ? "1" : "0",
        room: isRoom && roomCode ? roomCode : "",
        seed: String(practiceSeed),
      },
    });
  }

  const categoryEmoji = CATEGORY_EMOJI[q.category] ?? "✨";

  const progressDots = useMemo(
    () =>
      Array.from({ length: totalQuestions }).map((_, i) => {
        if (i < outcomes.length) {
          const o = outcomes[i];
          if (o === "correct") return "🟩";
          if (o === "wrong") return "🟥";
          return "⬜";
        }
        return i === idx ? "🟨" : "⚪";
      }),
    [outcomes, idx, totalQuestions],
  );

  if (phase === "reveal") {
    return (
      <RevealScreen
        question={q}
        questionIdx={idx}
        dailyIndex={challenge.index}
        totalQuestions={totalQuestions}
        playerPick={playerPick}
        playerOutcome={playerOutcome}
        playerMs={playerMs}
        playerScore={playerScore}
        pointsEarned={pointsThisRound}
        bots={bots}
        botRunningScores={botRunningScores}
        onNext={advance}
      />
    );
  }

  return (
    <Screen>
      <SeoHead title="Playing" path="/play" noindex />
      <EmojiSplat seed={challenge.index + idx * 17 + 3} count={6} />

      {showOnboarding && !onboardingDismissed && idx === 0 ? (
        <Pressable onPress={() => setOnboardingDismissed(true)} className="pt-3">
          <Sticker tilt={-1} shadow={4} shadowColor="#FF3EA5">
            <View className="bg-ink rounded-2xl border-2 border-lime px-4 py-3">
              <Text className="font-display text-lime text-sm">first round? quick rules:</Text>
              <Text className="font-body text-paper text-xs mt-1">
                · 30s per question · answer fast for bonus points
                {Platform.OS === "web" ? " · press 1–4 or tap" : " · tap to lock in"}
              </Text>
              <Text className="font-mono text-muted text-xs mt-1">tap to dismiss</Text>
            </View>
          </Sticker>
        </Pressable>
      ) : null}

      {isPractice ? (
        <View className="items-center pt-3">
          <Sticker tilt={-2} shadow={3} shadowColor="#FF3EA5">
            <View className="bg-hot rounded-md px-3 py-1 border-2 border-ink">
              <Text className="font-mono text-ink text-xs uppercase tracking-widest">
                ♾️ UNLIMITED · doesn&apos;t count
              </Text>
            </View>
          </Sticker>
        </View>
      ) : isRoom && roomCode ? (
        <View className="items-center pt-3">
          <Sticker tilt={-2} shadow={3} shadowColor="#3EFFE9">
            <View className="bg-cyan rounded-md px-3 py-1 border-2 border-ink">
              <Text className="font-mono text-ink text-xs uppercase tracking-widest">
                👯 ROOM · {roomCode}
              </Text>
            </View>
          </Sticker>
        </View>
      ) : null}

      <View className="flex-row justify-between items-center pt-4">
        <Text className="font-mono text-paper text-base tracking-widest">
          {progressDots.join(" ")}
        </Text>
        <Sticker tilt={-2} shadow={3} shadowColor={lowTime ? "#FF5C3E" : "#3EFFE9"}>
          <View
            className={`rounded-xl px-3 py-1 border-2 ${
              lowTime ? "bg-blood border-paper" : "bg-cyan border-ink"
            }`}
          >
            <Text className={`font-display text-lg ${lowTime ? "text-paper" : "text-ink"}`}>
              {remainingSec}s
            </Text>
          </View>
        </Sticker>
      </View>

      <View className="h-3 rounded-full bg-ink mt-3 overflow-hidden border-2 border-ink">
        <View
          className={lowTime ? "h-full bg-blood" : "h-full bg-cyan"}
          style={{ width: `${remainingPct * 100}%` }}
        />
      </View>

      <View className="flex-1 justify-center">
        <View className="flex-row items-center gap-2 mb-3">
          <Text className="text-3xl">{categoryEmoji}</Text>
          <Sticker tilt={-1} shadow={2} shadowColor="#FF3EA5">
            <View className="bg-ink rounded-md px-2 py-1 border border-hot">
              <Text className="font-mono text-hot text-xs uppercase tracking-widest">
                {q.category.replace(/_/g, " ")} · {q.difficulty}
              </Text>
            </View>
          </Sticker>
        </View>
        <Sticker tilt={-1.5} shadow={6} shadowColor="#3EFFE9">
          <View className="bg-ink rounded-3xl border-4 border-paper px-5 py-6">
            <Text className="font-display text-paper text-2xl leading-snug">{q.question}</Text>
          </View>
        </Sticker>
      </View>

      <View className="gap-3 pb-6">
        {q.options.map((opt) => (
          <Sticker
            key={opt.id}
            tilt={OPTION_TILT[opt.id]}
            shadow={5}
            shadowColor="#1A0F2E"
          >
            <Pressable
              onPress={() => lockIn(opt.id)}
              className={`rounded-2xl px-5 py-4 border-4 border-ink active:opacity-80 ${OPTION_BG[opt.id]}`}
              style={Platform.OS === "web" ? { cursor: "pointer" } : undefined}
            >
              <View className="flex-row items-center gap-3">
                <Text className={`font-display text-2xl ${OPTION_TEXT[opt.id]}`}>{opt.id}</Text>
                <Text className={`font-display text-lg flex-1 ${OPTION_TEXT[opt.id]}`}>
                  {opt.text}
                </Text>
              </View>
            </Pressable>
          </Sticker>
        ))}
      </View>
    </Screen>
  );
}

// ─── reveal phase ──────────────────────────────────────────────────────────

type RevealProps = {
  question: Question;
  questionIdx: number;
  dailyIndex: number;
  totalQuestions: number;
  playerPick: AnswerId | null;
  playerOutcome: AnswerOutcome | null;
  playerMs: number;
  playerScore: number;
  pointsEarned: number;
  bots: Bot[];
  botRunningScores: Record<string, number>;
  onNext: () => void;
};

function RevealScreen({
  question,
  questionIdx,
  dailyIndex,
  totalQuestions,
  playerPick,
  playerOutcome,
  playerScore,
  pointsEarned,
  bots,
  botRunningScores,
  onNext,
}: RevealProps) {
  // Bot results for THIS question (used for histogram + leaderboard delta).
  const botResults = useMemo(
    () => bots.map((b) => botRound(b, question, dailyIndex, questionIdx)),
    [bots, question, dailyIndex, questionIdx],
  );

  const histogram = useMemo(
    () => answerHistogram(bots, question, dailyIndex, questionIdx, playerPick),
    [bots, question, dailyIndex, questionIdx, playerPick],
  );
  const totalAnswers = histogram.A + histogram.B + histogram.C + histogram.D;
  const correctCount = histogram[question.correct_answer];
  const correctPct = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

  const correctOption = question.options.find((o) => o.id === question.correct_answer);
  const correct = playerOutcome === "correct";
  const skipped = playerOutcome === "skipped";

  // Build leaderboard rows after this question.
  const rows = useMemo(() => {
    const playerRow = {
      key: "you",
      name: "you",
      emoji: correct ? "🔥" : skipped ? "💤" : "🫠",
      score: playerScore,
      isYou: true,
    };
    const botRows = bots.map((b) => ({
      key: b.name,
      name: b.name,
      emoji: b.emoji,
      score: botRunningScores[b.name] ?? 0,
      isYou: false,
    }));
    return [...botRows, playerRow].sort((a, b) => b.score - a.score);
  }, [bots, botRunningScores, playerScore, correct, skipped]);

  const playerRank = rows.findIndex((r) => r.isYou) + 1;

  // Prefer per-character art when the question mentions a known character;
  // fall back to the generic category banner. Both come from Wikimedia
  // Commons under safe licenses — see data/character-images-credits.json
  // and data/category-images-credits.json.
  const banner =
    characterImageForQuestion(question) ?? categoryImage(question.category);
  const isCorrect = playerOutcome === "correct";
  const isWrong = playerOutcome === "wrong";
  // Trigger shake every time we land on a wrong reveal. The counter changes
  // per (question, correctness) so subsequent wrong answers re-shake.
  const shakeTrigger = `${questionIdx}-${isWrong ? "wrong" : "ok"}`;

  return (
    <Screen>
      <Confetti show={isCorrect} count={50} />
      <EmojiSplat seed={dailyIndex + questionIdx * 31 + 99} count={6} />

      {banner ? (
        <View className="pt-3">
          <Sticker tilt={-1.5} shadow={4} shadowColor="#FF3EA5">
            <View className="rounded-2xl overflow-hidden border-4 border-paper">
              <Image
                source={banner}
                style={{ width: "100%", height: 120 }}
                resizeMode="cover"
              />
              <View className="absolute left-2 bottom-2 bg-ink/80 rounded-md px-2 py-1 border border-paper">
                <Text className="font-mono text-paper text-xs uppercase tracking-widest">
                  {question.category.replace(/_/g, " ")}
                </Text>
              </View>
            </View>
          </Sticker>
        </View>
      ) : null}

      <View className="pt-4 items-center">
        <Sticker tilt={-2} shadow={5} shadowColor={correct ? "#A8FF3E" : "#FF5C3E"}>
          <View
            className={`rounded-2xl px-5 py-3 border-4 ${
              correct ? "bg-lime border-ink" : skipped ? "bg-ink border-muted" : "bg-blood border-paper"
            }`}
          >
            <Text
              className={`font-display text-3xl ${
                correct ? "text-ink" : skipped ? "text-paper" : "text-paper"
              }`}
            >
              {correct ? "✅ NAILED IT" : skipped ? "⏰ SKIPPED" : "💀 NOPE"}
            </Text>
          </View>
        </Sticker>
        {pointsEarned > 0 ? (
          <View className="mt-3">
            <Sticker tilt={3} shadow={4} shadowColor="#3EFFE9">
              <View className="bg-cyan rounded-full px-5 py-1 border-2 border-ink">
                <Text className="font-display text-ink text-2xl">+{pointsEarned.toLocaleString()} pts</Text>
              </View>
            </Sticker>
          </View>
        ) : null}
      </View>

      <Shake trigger={shakeTrigger}>
      <View className="mt-6">
        <Text className="font-mono text-muted text-xs">CORRECT ANSWER</Text>
        <Sticker tilt={-1} shadow={5} shadowColor="#3EFFE9">
          <View className="bg-ink rounded-2xl border-4 border-cyan px-5 py-4 mt-1">
            <Text className="font-display text-cyan text-2xl">
              {question.correct_answer}. {correctOption?.text ?? "?"}
            </Text>
            <Text className="font-body text-paper text-xs mt-2">
              {correctCount} of {totalAnswers} got this right ({correctPct}%)
            </Text>
          </View>
        </Sticker>
      </View>
      </Shake>

      {playerPick && !correct && !skipped ? (
        <Text className="font-body text-muted text-xs mt-3">
          you picked <Text className="text-blood font-display">{playerPick}</Text> with
          {" " + (histogram[playerPick] - 1)} of these clowns. {goofyDecoyLine(histogram[playerPick] - 1)}
        </Text>
      ) : null}

      <View className="mt-6 flex-1">
        <Text className="font-mono text-muted text-xs">LEADERBOARD · after Q{questionIdx + 1}</Text>
        <View className="mt-2 gap-2">
          {rows.map((r, i) => {
            const isFirst = i === 0;
            const tilt = i % 2 === 0 ? -0.5 : 0.5;
            return (
              <Sticker
                key={r.key}
                tilt={tilt}
                shadow={r.isYou ? 4 : 2}
                shadowColor={r.isYou ? "#A8FF3E" : "#1A0F2E"}
              >
                <View
                  className={`flex-row items-center rounded-xl px-3 py-2 border-2 ${
                    r.isYou ? "bg-lime border-ink" : "bg-ink border-muted"
                  }`}
                >
                  <Text className={`font-display text-xl w-8 ${r.isYou ? "text-ink" : "text-paper"}`}>
                    {isFirst ? "👑" : `${i + 1}`}
                  </Text>
                  <Text className="text-2xl mr-2">{r.emoji}</Text>
                  <Text
                    className={`font-display flex-1 ${r.isYou ? "text-ink text-lg" : "text-paper text-base"}`}
                  >
                    {r.name}
                  </Text>
                  <Text
                    className={`font-mono ${r.isYou ? "text-ink font-display text-lg" : "text-paper"}`}
                  >
                    {r.score.toLocaleString()}
                  </Text>
                </View>
              </Sticker>
            );
          })}
        </View>
        <Text className="font-body text-muted text-xs mt-3 text-center italic">
          {playerRank === 1
            ? "you on top fr fr 👑"
            : playerRank === rows.length
              ? `last place but you tried. ${rows.length}/${rows.length} — own it.`
              : `you're #${playerRank}. ${rows.length - playerRank} to chase.`}
        </Text>
      </View>

      <View className="pb-6">
        <Button
          label={questionIdx + 1 >= totalQuestions ? "see your verdict 🪪" : "next question →"}
          emoji="🚀"
          tilt={-1}
          onPress={onNext}
          full
        />
        <Text className="font-body text-muted text-xs text-center mt-2">
          auto-advance in 5s · or just tap
        </Text>
      </View>
    </Screen>
  );
}

function goofyDecoyLine(n: number): string {
  if (n <= 0) return "absolutely no one else fell for it. just you. lol.";
  if (n === 1) return "1 other person also fumbled it.";
  if (n <= 3) return `${n} others also got rizzed.`;
  return `${n} of you really thought that was real 😭`;
}
