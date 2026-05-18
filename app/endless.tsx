// Endless / survival mode.
//
// Why this exists (docs/VIRAL_PLAN.md tier A #1): the daily has scarcity,
// but Wordle + Geoguessr's combined pattern is daily-AND-unlimited. Endless
// fills the unlimited slot with stakes: difficulty ramps every few rounds,
// one wrong/skipped = game over, your survival count is your score. TikTok-
// native because every wipe is a clip; every high-score is a screenshot.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/Button";
import { CATEGORY_EMOJI, EmojiSplat } from "@/components/EmojiSplat";
import { SeoHead } from "@/components/SeoHead";
import { Confetti } from "@/components/Confetti";
import { Shake } from "@/components/Shake";
import { questions, type AnswerId, type Question } from "@/lib/questions";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebKeyboard } from "@/hooks/useWebKeyboard";
import { tapHaptic, successHaptic, wrongHaptic, skipHaptic, finaleHaptic } from "@/lib/haptics";
import { useAchievementsStore } from "@/features/achievements/store";
import { shareResult } from "@/lib/share";

// Difficulty schedule — what level of question the player sees at each
// streak position. Past index 12 we stay on hard forever (the engine
// repeats sampling from the hard pool, so questions cycle through).
function difficultyAt(streak: number): "easy" | "medium" | "hard" {
  if (streak < 3) return "easy";
  if (streak < 7) return "medium";
  return "hard";
}

// Time pressure also ramps. Easy: 20s. Medium: 15s. Hard: 12s.
function timeAtMs(diff: "easy" | "medium" | "hard"): number {
  return diff === "easy" ? 20_000 : diff === "medium" ? 15_000 : 12_000;
}

// Pure RNG that consumes its own seed — used to pick a fresh question each
// round without bringing in the deterministic Mulberry32 daily picker.
function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
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

type Phase = "question" | "reveal" | "over";

export default function Endless() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const hydrateAchievements = useAchievementsStore((s) => s.hydrate);
  const unlockAchievement = useAchievementsStore((s) => s.unlock);
  const recordEndlessRun = useAchievementsStore((s) => s.recordEndlessRun);
  const highScore = useAchievementsStore((s) => s.endlessHighScore);
  const achievementsHydrated = useAchievementsStore((s) => s.hydrated);

  useEffect(() => {
    if (!achievementsHydrated) void hydrateAchievements();
  }, [achievementsHydrated, hydrateAchievements]);

  // Pre-partitioned question pools by difficulty so picking is O(1) at run-
  // time and we don't repeatedly filter the 200-question array.
  const poolsByDiff = useMemo(() => ({
    easy: questions.filter((q) => q.difficulty === "easy"),
    medium: questions.filter((q) => q.difficulty === "medium"),
    hard: questions.filter((q) => q.difficulty === "hard"),
  }), []);

  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [playerPick, setPlayerPick] = useState<AnswerId | null>(null);
  const [pointsThisQuestion, setPointsThisQuestion] = useState(0);
  const [tick, setTick] = useState(0);
  const questionStartRef = useRef<number>(Date.now());
  const finalizedRef = useRef(false);

  const currentDifficulty = difficultyAt(streak);
  const perQuestionMs = timeAtMs(currentDifficulty);

  // First-load + every new question: pick a fresh one, prefer unseen, fall
  // back to repeats if we've burned the pool.
  const pickNextQuestion = useCallback(() => {
    const diff = difficultyAt(streak);
    const pool = poolsByDiff[diff];
    const unseen = pool.filter((q) => !seenIds.has(q.id));
    const candidate = pickRandom(unseen.length > 0 ? unseen : pool);
    if (candidate) {
      setCurrentQ(candidate);
      setSeenIds((prev) => new Set(prev).add(candidate.id));
    }
    setPlayerPick(null);
    setPointsThisQuestion(0);
    setPhase("question");
    setTick(0);
    questionStartRef.current = Date.now();
    void unlockAchievement("first_run");
  }, [streak, poolsByDiff, seenIds, unlockAchievement]);

  // Boot the first question on mount.
  useEffect(() => {
    if (currentQ === null && phase === "question") {
      pickNextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drive the timer.
  useEffect(() => {
    if (phase !== "question") return;
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [phase, currentQ]);

  const elapsedMs = tick * 100;
  const remainingMs = Math.max(0, perQuestionMs - elapsedMs);
  const remainingPct = phase === "question" ? remainingMs / perQuestionMs : 0;
  const remainingSec = Math.ceil(remainingMs / 1000);
  const lowTime = remainingPct > 0 && remainingPct < 0.25;

  const lockIn = useCallback(
    (answer: AnswerId | null) => {
      if (phase !== "question" || !currentQ) return;
      const msTaken = answer === null ? perQuestionMs : Date.now() - questionStartRef.current;
      const isCorrect = answer !== null && answer === currentQ.correct_answer;
      const pts = isCorrect
        ? 100 + Math.max(0, 200 - Math.floor((msTaken / perQuestionMs) * 200))
        : 0;
      setPlayerPick(answer);
      setPointsThisQuestion(pts);
      setPhase("reveal");
      if (answer === null) skipHaptic();
      else tapHaptic();
      setTimeout(() => {
        if (isCorrect) successHaptic();
        else wrongHaptic();
      }, 60);
      if (isCorrect) {
        setScore((s) => s + pts);
        setStreak((s) => s + 1);
      } else {
        // Game over after a brief reveal pause.
        setTimeout(() => {
          setPhase("over");
          finaleHaptic();
        }, 1500);
      }
    },
    [phase, currentQ, perQuestionMs],
  );

  // Auto-skip when the timer runs out.
  useEffect(() => {
    if (phase === "question" && remainingMs <= 0) {
      lockIn(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, phase]);

  // Auto-advance from reveal → next question on success.
  useEffect(() => {
    if (phase !== "reveal") return;
    if (playerPick === null || !currentQ) return;
    const correct = playerPick === currentQ.correct_answer;
    if (!correct) return;
    const id = setTimeout(() => {
      pickNextQuestion();
    }, 1200);
    return () => clearTimeout(id);
  }, [phase, playerPick, currentQ, pickNextQuestion]);

  // On game over: record high-score + unlock marathon achievement.
  useEffect(() => {
    if (phase !== "over" || finalizedRef.current) return;
    finalizedRef.current = true;
    void recordEndlessRun(streak);
    if (streak >= 10) void unlockAchievement("marathon");
  }, [phase, streak, recordEndlessRun, unlockAchievement]);

  // Keyboard shortcuts on web.
  useWebKeyboard(
    useCallback(
      (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
        if (phase !== "question" || !currentQ) return;
        const map: Record<string, AnswerId> = {
          "1": "A", "2": "B", "3": "C", "4": "D",
          a: "A", b: "B", c: "C", d: "D",
        };
        const pick = map[e.key.toLowerCase()];
        if (pick) {
          e.preventDefault();
          lockIn(pick);
        }
      },
      [phase, currentQ, lockIn],
    ),
  );

  // ── Game-over screen ────────────────────────────────────────────────────
  if (phase === "over") {
    const beatHighScore = streak > 0 && streak >= highScore;
    return <EndlessOver streak={streak} score={score} highScore={highScore} beat={beatHighScore} onReplay={() => {
      // Hard reset.
      finalizedRef.current = false;
      setStreak(0);
      setScore(0);
      setSeenIds(new Set());
      setCurrentQ(null);
      setPhase("question");
      pickNextQuestion();
    }} onHome={() => router.replace("/home")} />;
  }

  // ── Render: question or reveal ──────────────────────────────────────────
  if (!currentQ) {
    return (
      <Screen>
        <View className="flex-1 justify-center items-center">
          <Text className="font-display text-paper text-2xl">cooking... 🍳</Text>
        </View>
      </Screen>
    );
  }
  const q = currentQ;
  const categoryEmoji = CATEGORY_EMOJI[q.category] ?? "✨";
  const isReveal = phase === "reveal";
  const isCorrect = playerPick !== null && playerPick === q.correct_answer;
  const shakeTrigger = `${streak}-${isReveal && !isCorrect ? "wrong" : "ok"}`;

  return (
    <Screen>
      <SeoHead title="Endless mode" path="/endless" noindex />
      <Confetti show={isReveal && isCorrect} count={40} />
      <EmojiSplat seed={streak * 17 + 9} count={5} />

      {/* HUD */}
      <View className="flex-row justify-between items-center pt-4">
        <Sticker tilt={-2} shadow={3} shadowColor="#FF3EA5">
          <View className="bg-hot rounded-md px-3 py-1 border-2 border-ink">
            <Text className="font-mono text-ink text-xs uppercase tracking-widest">
              ♾️ ENDLESS · {currentDifficulty}
            </Text>
          </View>
        </Sticker>
        <View className="flex-row gap-2">
          <Sticker tilt={1} shadow={3} shadowColor="#A8FF3E">
            <View className="bg-ink rounded-md border-2 border-lime px-3 py-1">
              <Text className="font-mono text-muted text-xs">SURVIVED</Text>
              <Text className="font-display text-lime text-lg leading-none">{streak}</Text>
            </View>
          </Sticker>
          <Sticker tilt={-1} shadow={3} shadowColor="#3EFFE9">
            <View className="bg-ink rounded-md border-2 border-cyan px-3 py-1">
              <Text className="font-mono text-muted text-xs">SCORE</Text>
              <Text className="font-display text-cyan text-lg leading-none">{score}</Text>
            </View>
          </Sticker>
        </View>
      </View>

      {/* Timer */}
      <View className="h-3 rounded-full bg-ink mt-3 overflow-hidden border-2 border-ink">
        <View
          className={lowTime ? "h-full bg-blood" : "h-full bg-cyan"}
          style={{ width: `${remainingPct * 100}%` }}
        />
      </View>
      <Text className={`font-mono text-xs mt-1 text-right ${lowTime ? "text-blood" : "text-muted"}`}>
        {phase === "question" ? `${remainingSec}s` : isCorrect ? `+${pointsThisQuestion} pts · next →` : "💀 game over"}
      </Text>

      {/* Question */}
      <View className="flex-1 justify-center">
        <View className="flex-row items-center gap-2 mb-3">
          <Text className="text-3xl">{categoryEmoji}</Text>
          <Sticker tilt={-1} shadow={2} shadowColor="#FF3EA5">
            <View className="bg-ink rounded-md px-2 py-1 border border-hot">
              <Text className="font-mono text-hot text-xs uppercase tracking-widest">
                {q.category.replace(/_/g, " ")}
              </Text>
            </View>
          </Sticker>
        </View>

        <Shake trigger={shakeTrigger}>
          <Sticker tilt={-1.5} shadow={6} shadowColor="#3EFFE9">
            <View className="bg-ink rounded-3xl border-4 border-paper px-5 py-6">
              <Text className="font-display text-paper text-2xl leading-snug">{q.question}</Text>
            </View>
          </Sticker>
        </Shake>
      </View>

      {/* Answer options */}
      <View className="gap-3 pb-6">
        {q.options.map((opt) => {
          const correctReveal = isReveal && opt.id === q.correct_answer;
          const wrongReveal = isReveal && playerPick === opt.id && opt.id !== q.correct_answer;
          const box = correctReveal
            ? "bg-cyan border-paper"
            : wrongReveal
              ? "bg-blood border-paper"
              : `${OPTION_BG[opt.id]} border-ink`;
          const txt = correctReveal
            ? "text-ink"
            : wrongReveal
              ? "text-paper"
              : OPTION_TEXT[opt.id];
          return (
            <Sticker
              key={opt.id}
              tilt={isReveal ? 0 : OPTION_TILT[opt.id]}
              shadow={5}
              shadowColor="#1A0F2E"
            >
              <Pressable
                onPress={() => lockIn(opt.id)}
                disabled={isReveal}
                className={`rounded-2xl px-5 py-4 border-4 active:opacity-80 ${box}`}
                style={Platform.OS === "web" ? { cursor: isReveal ? "auto" : "pointer" } : undefined}
              >
                <View className="flex-row items-center gap-3">
                  <Text className={`font-display text-2xl ${txt}`}>{opt.id}</Text>
                  <Text className={`font-display text-lg flex-1 ${txt}`}>{opt.text}</Text>
                  {correctReveal ? <Text className="text-2xl">✅</Text> : null}
                  {wrongReveal ? <Text className="text-2xl">💀</Text> : null}
                </View>
              </Pressable>
            </Sticker>
          );
        })}
      </View>
    </Screen>
  );
}

// ── Game-over screen — high-score + share + replay ───────────────────────
function EndlessOver({
  streak,
  score,
  highScore,
  beat,
  onReplay,
  onHome,
}: {
  streak: number;
  score: number;
  highScore: number;
  beat: boolean;
  onReplay: () => void;
  onHome: () => void;
}) {
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied" | "failed">("idle");
  async function onShare() {
    const text = `🧠 ♾️ brainrot endless — survived ${streak} questions · ${score.toLocaleString()} pts · playbrainrot.app/endless`;
    const r = await shareResult(text);
    setShareState(r);
  }
  const shareLabel = shareState === "shared"
    ? "shared ✨"
    : shareState === "copied"
      ? "copied 📋"
      : shareState === "failed"
        ? "share failed, try again"
        : "share your streak 📣";
  return (
    <Screen>
      <SeoHead title="Endless · game over" path="/endless" noindex />
      <Confetti show={beat} count={70} />
      <EmojiSplat seed={streak * 31 + 99} count={9} />

      <View className="flex-1 justify-center">
        <View className="items-center">
          <Text style={{ fontSize: 96 }}>{beat ? "👑" : "💀"}</Text>
        </View>
        <Sticker tilt={-2} shadow={6} shadowColor="#FF3EA5">
          <View className="bg-ink rounded-3xl border-4 border-paper p-5 mt-2">
            <Text className="font-mono text-muted text-xs">ENDLESS · GAME OVER</Text>
            <Text className="font-display text-paper text-3xl mt-1">
              {beat ? "NEW HIGH SCORE 👑" : "you got cooked."}
            </Text>
            <View className="flex-row items-baseline mt-4">
              <Text className="font-display text-lime text-6xl leading-none">{streak}</Text>
              <Text className="font-display text-muted text-2xl ml-2">survived</Text>
            </View>
            <Text className="font-mono text-cyan text-base mt-2">
              {score.toLocaleString()} pts
            </Text>
            <Text className="font-mono text-muted text-xs mt-2">
              prev high: <Text className="text-paper">{highScore}</Text>
            </Text>
          </View>
        </Sticker>
      </View>

      <View className="gap-3 pb-6">
        <Button label="run it back ♾️" emoji="🔥" tilt={-1} onPress={onReplay} full />
        <Button label={shareLabel} emoji="📣" variant="secondary" onPress={onShare} full />
        <Button label="back to home" variant="ghost" onPress={onHome} full />
      </View>
    </Screen>
  );
}
