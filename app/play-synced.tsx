// Synced friend-room game — Kahoot-style, wall-clock-paced, no backend.
//
// Reached only via /play?room=CODE&start=TS. The play.tsx entry screen
// delegates here when ?start is present. Everyone with the same URL sees the
// same screen at the same moment because the state is a pure function over
// (start_ts, now) — see src/lib/sync.ts.

import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, Text, View, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/Button";
import { CATEGORY_EMOJI, EmojiSplat } from "@/components/EmojiSplat";
import { Confetti } from "@/components/Confetti";
import { Shake } from "@/components/Shake";
import { categoryImage } from "@/lib/category-images";
import { characterImageForQuestion } from "@/lib/character-images";
import { getRoomChallenge, DAILY_QUESTION_COUNT } from "@/lib/daily";
import { questionsById } from "@/lib/questions";
import { buildPattern, buildShareText } from "@/lib/share";
import {
  pickDailyBots,
  botRound,
  type Bot,
} from "@/lib/bots";
import { codeToSeed, isValidRoomCode, normalizeRoomCode } from "@/lib/room";
import {
  computeSyncState,
  syncPointsFor,
  SYNC_QUESTION_MS,
  SYNC_REVEAL_MS,
} from "@/lib/sync";
import { skipHaptic, successHaptic, tapHaptic, wrongHaptic } from "@/lib/haptics";
import type { AnswerOutcome } from "@/features/daily/store";
import type { AnswerId } from "@/lib/questions";

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

export default function PlaySynced() {
  const router = useRouter();
  const params = useLocalSearchParams<{ room?: string; start?: string }>();

  const roomCode = useMemo(() => {
    if (!params.room) return null;
    const c = normalizeRoomCode(params.room);
    return isValidRoomCode(c) ? c : null;
  }, [params.room]);

  const startTs = useMemo(() => {
    const n = params.start ? Number(params.start) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.start]);

  // Wall-clock ticker — drives the pure-function pacing state.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, []);

  const totalQuestions = DAILY_QUESTION_COUNT;
  const sync = useMemo(
    () =>
      startTs !== null
        ? computeSyncState(startTs, totalQuestions)
        : null,
    // Re-derive every render so the state follows wall-clock without holding it in state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startTs, totalQuestions, Date.now()],
  );

  const challenge = useMemo(
    () => (roomCode ? getRoomChallenge(roomCode, codeToSeed(roomCode)) : null),
    [roomCode],
  );

  const bots = useMemo<Bot[]>(
    () => (roomCode ? pickDailyBots(codeToSeed(roomCode) % 100000) : []),
    [roomCode],
  );

  // Per-question answer history kept locally on this device. The reveal
  // phase uses the current question's recorded answer (if any).
  const [picks, setPicks] = useState<Record<number, AnswerId | null>>({});
  const [pickTimestamps, setPickTimestamps] = useState<Record<number, number>>({});
  const finalizedRef = useRef(false);
  // Tracks which question index has already triggered its reveal haptic so we
  // don't re-fire it every wall-clock tick during the reveal window.
  const hapticedIdxRef = useRef<number>(-1);

  if (!roomCode || !challenge || !sync || startTs === null) {
    return (
      <Screen>
        <View className="flex-1 justify-center items-center">
          <Text className="font-display text-paper text-2xl">cooking... 🍳</Text>
          <Text className="font-body text-muted text-sm mt-2">joining the synced room</Text>
        </View>
      </Screen>
    );
  }

  const currentQ = questionsById[challenge.questionIds[sync.idx] ?? ""];

  // ── Outcome haptic, once per question on reveal entry ───────────────────
  useEffect(() => {
    if (!sync || !challenge || sync.phase !== "reveal") return;
    if (hapticedIdxRef.current === sync.idx) return;
    hapticedIdxRef.current = sync.idx;
    const qid = challenge.questionIds[sync.idx];
    const qq = qid ? questionsById[qid] : undefined;
    if (!qq) return;
    const pick = picks[sync.idx] ?? null;
    if (pick === null) skipHaptic();
    else if (pick === qq.correct_answer) successHaptic();
    else wrongHaptic();
  }, [sync, challenge, picks]);

  // ── End-of-game: navigate to result once ────────────────────────────────
  useEffect(() => {
    if (sync.phase !== "done" || finalizedRef.current) return;
    finalizedRef.current = true;
    const outcomes: AnswerOutcome[] = [];
    let score = 0;
    for (let i = 0; i < totalQuestions; i++) {
      const qid = challenge.questionIds[i];
      const q = qid ? questionsById[qid] : undefined;
      const pick = picks[i] ?? null;
      const pickTs = pickTimestamps[i] ?? startTs + (i + 1) * (SYNC_QUESTION_MS + SYNC_REVEAL_MS);
      const msTaken = Math.max(0, pickTs - (startTs + i * (SYNC_QUESTION_MS + SYNC_REVEAL_MS)));
      const outcome: AnswerOutcome =
        pick === null
          ? "skipped"
          : q && pick === q.correct_answer
            ? "correct"
            : "wrong";
      outcomes.push(outcome);
      score += syncPointsFor(outcome === "correct", msTaken);
    }
    const pattern = buildPattern(outcomes);
    const correct = outcomes.filter((o) => o === "correct").length;
    const shareText = buildShareText({
      dailyIndex: 0,
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
        score: String(score),
        total: String(totalQuestions),
        practice: "0",
        room: roomCode,
        seed: "0",
      },
    });
  }, [sync.phase, sync.idx, picks, pickTimestamps, challenge.questionIds, roomCode, startTs, totalQuestions, router]);

  // ── Render: pre-game countdown ───────────────────────────────────────────
  if (sync.phase === "pre-game") {
    const secs = Math.ceil(sync.msUntilStart / 1000);
    return (
      <Screen>
        <EmojiSplat seed={codeToSeed(roomCode)} count={11} />
        <View className="pt-6 items-center">
          <Sticker tilt={-2} shadow={3} shadowColor="#3EFFE9">
            <View className="bg-cyan rounded-md px-3 py-1 border-2 border-ink">
              <Text className="font-mono text-ink text-xs uppercase tracking-widest">
                👯 SYNCED ROOM · {roomCode}
              </Text>
            </View>
          </Sticker>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="font-mono text-muted text-sm">starting in</Text>
          <Text className="font-display text-lime text-9xl mt-2">{secs}</Text>
          <Text className="font-body text-paper text-base mt-4 text-center px-6">
            everyone with this link sees the same countdown. when it hits zero,
            the first question drops at the same time for everyone.
          </Text>
        </View>
        <View className="pb-8 items-center">
          <Text className="font-body text-muted text-xs">5 questions · 30s each · shared reveals</Text>
        </View>
      </Screen>
    );
  }

  // ── Render: question phase (live) ────────────────────────────────────────
  if (sync.phase === "question" && currentQ) {
    const q = currentQ;
    const remainingSec = Math.ceil(sync.msRemainingInPhase / 1000);
    const remainingPct = sync.msRemainingInPhase / SYNC_QUESTION_MS;
    const lowTime = remainingPct < 0.25;
    const currentPick = picks[sync.idx] ?? null;
    const isLocked = currentPick !== null;

    function lockIn(answer: AnswerId) {
      tapHaptic();
      setPicks((p) => ({ ...p, [sync!.idx]: answer }));
      setPickTimestamps((p) => ({ ...p, [sync!.idx]: Date.now() }));
    }

    const categoryEmoji = CATEGORY_EMOJI[q.category] ?? "✨";
    const banner = characterImageForQuestion(q) ?? categoryImage(q.category);

    return (
      <Screen>
        <EmojiSplat seed={codeToSeed(roomCode) + sync.idx * 17} count={6} />

        <View className="items-center pt-3">
          <Sticker tilt={-2} shadow={3} shadowColor="#3EFFE9">
            <View className="bg-cyan rounded-md px-3 py-1 border-2 border-ink">
              <Text className="font-mono text-ink text-xs uppercase tracking-widest">
                👯 SYNCED · {roomCode}
              </Text>
            </View>
          </Sticker>
        </View>

        <View className="flex-row justify-between items-center pt-3">
          <Text className="font-mono text-paper text-sm">
            Q{sync.idx + 1} / {totalQuestions}
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

        <View className="h-3 rounded-full bg-ink mt-2 overflow-hidden border-2 border-ink">
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
          {isLocked ? (
            <View className="items-center mt-4">
              <Sticker tilt={-1} shadow={3} shadowColor="#A8FF3E">
                <View className="bg-lime rounded-md px-3 py-2 border-2 border-ink">
                  <Text className="font-display text-ink text-base">
                    locked in 🔒 · waiting for everyone else
                  </Text>
                </View>
              </Sticker>
            </View>
          ) : null}
        </View>

        <View className="gap-3 pb-6">
          {q.options.map((opt) => {
            const dimmed = isLocked && currentPick !== opt.id;
            return (
              <Sticker
                key={opt.id}
                tilt={isLocked ? 0 : OPTION_TILT[opt.id]}
                shadow={isLocked ? 3 : 5}
                shadowColor="#1A0F2E"
              >
                <Pressable
                  onPress={() => lockIn(opt.id)}
                  disabled={isLocked}
                  className={`rounded-2xl px-5 py-4 border-4 border-ink ${OPTION_BG[opt.id]} ${
                    dimmed ? "opacity-40" : "active:opacity-80"
                  }`}
                  style={Platform.OS === "web" ? { cursor: isLocked ? "auto" : "pointer" } : undefined}
                >
                  <View className="flex-row items-center gap-3">
                    <Text className={`font-display text-2xl ${OPTION_TEXT[opt.id]}`}>{opt.id}</Text>
                    <Text className={`font-display text-lg flex-1 ${OPTION_TEXT[opt.id]}`}>
                      {opt.text}
                    </Text>
                    {currentPick === opt.id ? <Text className="text-xl">🔒</Text> : null}
                  </View>
                </Pressable>
              </Sticker>
            );
          })}
        </View>
      </Screen>
    );
  }

  // ── Render: shared reveal phase ──────────────────────────────────────────
  if (sync.phase === "reveal" && currentQ) {
    const q = currentQ;
    const pick = picks[sync.idx] ?? null;
    const correct = pick !== null && pick === q.correct_answer;
    const skipped = pick === null;
    const correctOption = q.options.find((o) => o.id === q.correct_answer);
    const remainingSec = Math.ceil(sync.msRemainingInPhase / 1000);
    const banner = characterImageForQuestion(q) ?? categoryImage(q.category);

    // Lightweight leaderboard during reveal — running scores against bots
    // (cumulative through current question for both the player AND the bots).
    const leaderboard = useMemo(() => {
      const playerScore = (() => {
        let s = 0;
        for (let i = 0; i <= sync.idx; i++) {
          const pk = picks[i] ?? null;
          const qid = challenge.questionIds[i];
          const qq = qid ? questionsById[qid] : undefined;
          if (!qq) continue;
          const ok = pk !== null && pk === qq.correct_answer;
          const pts = syncPointsFor(
            ok,
            Math.max(0, (pickTimestamps[i] ?? Date.now()) - (startTs + i * (SYNC_QUESTION_MS + SYNC_REVEAL_MS))),
          );
          s += pts;
        }
        return s;
      })();
      const botScores = bots.map((b) => {
        let s = 0;
        for (let i = 0; i <= sync.idx; i++) {
          const qid = challenge.questionIds[i];
          const qq = qid ? questionsById[qid] : undefined;
          if (!qq) continue;
          s += botRound(b, qq, codeToSeed(roomCode), i).points;
        }
        return {
          key: b.name,
          name: b.name,
          emoji: b.emoji,
          score: s,
          isYou: false as const,
        };
      });
      const rows = [
        ...botScores,
        { key: "you", name: "you", emoji: "🫵", score: playerScore, isYou: true as const },
      ];
      return rows.sort((a, b) => b.score - a.score);
    }, [sync.idx, picks, pickTimestamps, challenge.questionIds, bots, roomCode, startTs]);

    const playerRank = leaderboard.findIndex((r) => r.isYou) + 1;

    // Points earned just for THIS question — feeds the +N pts badge below.
    const pointsThisRound = (() => {
      const pickTs =
        pickTimestamps[sync.idx] ??
        startTs + sync.idx * (SYNC_QUESTION_MS + SYNC_REVEAL_MS) + SYNC_QUESTION_MS;
      const msTaken = Math.max(
        0,
        pickTs - (startTs + sync.idx * (SYNC_QUESTION_MS + SYNC_REVEAL_MS)),
      );
      return correct ? syncPointsFor(true, msTaken) : 0;
    })();

    return (
      <Screen>
        <Confetti show={correct} count={50} />
        <EmojiSplat seed={codeToSeed(roomCode) + sync.idx * 31 + 99} count={6} />

        {banner ? (
          <View className="pt-2">
            <Sticker tilt={-1.5} shadow={4} shadowColor="#FF3EA5">
              <View className="rounded-2xl overflow-hidden border-4 border-paper">
                <Image source={banner} style={{ width: "100%", height: 80 }} resizeMode="cover" />
                <View className="absolute left-2 bottom-2 bg-ink/80 rounded-md px-2 py-1 border border-paper">
                  <Text className="font-mono text-paper text-xs uppercase tracking-widest">
                    {q.category.replace(/_/g, " ")}
                  </Text>
                </View>
              </View>
            </Sticker>
          </View>
        ) : null}

        <View className="pt-3 items-center">
          <Sticker tilt={-2} shadow={5} shadowColor={correct ? "#A8FF3E" : "#FF5C3E"}>
            <View
              className={`rounded-2xl px-5 py-3 border-4 ${
                correct ? "bg-lime border-ink" : skipped ? "bg-ink border-muted" : "bg-blood border-paper"
              }`}
            >
              <Text
                className={`font-display text-2xl ${
                  correct ? "text-ink" : "text-paper"
                }`}
              >
                {correct ? "✅ NAILED IT" : skipped ? "⏰ SKIPPED" : "💀 NOPE"}
              </Text>
            </View>
          </Sticker>
          {pointsThisRound > 0 ? (
            <View className="mt-2">
              <Sticker tilt={3} shadow={3} shadowColor="#3EFFE9">
                <View className="bg-cyan rounded-full px-4 py-1 border-2 border-ink">
                  <Text className="font-display text-ink text-xl">
                    +{pointsThisRound.toLocaleString()} pts
                  </Text>
                </View>
              </Sticker>
            </View>
          ) : null}
        </View>

        <View className="mt-3">
          <Text className="font-mono text-muted text-xs">CORRECT ANSWER</Text>
          <Sticker tilt={-1} shadow={4} shadowColor="#3EFFE9">
            <View className="bg-ink rounded-2xl border-4 border-cyan px-4 py-3 mt-1">
              <Text className="font-display text-cyan text-xl">
                {q.correct_answer}. {correctOption?.text ?? "?"}
              </Text>
            </View>
          </Sticker>
        </View>

        <View className="mt-4 flex-1">
          <Text className="font-mono text-muted text-xs">LEADERBOARD · after Q{sync.idx + 1}</Text>
          <View className="mt-2 gap-2">
            {leaderboard.map((r, i) => {
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
                    <Text className={`font-display text-lg w-8 ${r.isYou ? "text-ink" : "text-paper"}`}>
                      {i === 0 ? "👑" : `${i + 1}`}
                    </Text>
                    <Text className="text-xl mr-2">{r.emoji}</Text>
                    <Text
                      className={`font-display flex-1 ${r.isYou ? "text-ink text-base" : "text-paper text-sm"}`}
                    >
                      {r.name}
                    </Text>
                    <Text
                      className={`font-mono ${r.isYou ? "text-ink font-display text-base" : "text-paper text-sm"}`}
                    >
                      {r.score.toLocaleString()}
                    </Text>
                  </View>
                </Sticker>
              );
            })}
          </View>
          <Text className="font-body text-muted text-xs text-center mt-2 italic">
            you&apos;re #{playerRank}/{leaderboard.length}
          </Text>
        </View>

        <View className="pb-6 items-center">
          <Text className="font-mono text-cyan text-sm">next in {remainingSec}s ⏱️</Text>
        </View>
      </Screen>
    );
  }

  // Fallback (shouldn't hit thanks to the done branch above).
  return (
    <Screen>
      <View className="flex-1 justify-center items-center">
        <Text className="font-display text-paper text-2xl">wrapping up... 🏁</Text>
      </View>
    </Screen>
  );
}
