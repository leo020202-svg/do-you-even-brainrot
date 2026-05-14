import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Sticker } from "@/components/Sticker";
import { CATEGORY_EMOJI, EmojiSplat } from "@/components/EmojiSplat";
import { getDailyChallenge, DAILY_QUESTION_COUNT } from "@/lib/daily";
import { questionsById } from "@/lib/questions";
import { useDailyStore } from "@/features/daily/store";
import { buildPattern, buildShareText } from "@/lib/share";
import type { AnswerOutcome } from "@/features/daily/store";
import type { AnswerId } from "@/lib/questions";

const PER_QUESTION_MS = 30_000;
const SPEED_BONUS_CEILING = 1000;

function pointsFor(outcome: AnswerOutcome, msTaken: number): number {
  if (outcome !== "correct") return 0;
  const base = 500;
  const speed = Math.max(
    0,
    SPEED_BONUS_CEILING - Math.floor((msTaken / PER_QUESTION_MS) * SPEED_BONUS_CEILING),
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
const OPTION_SHADOW: Record<AnswerId, string> = {
  A: "#1A0F2E",
  B: "#1A0F2E",
  C: "#1A0F2E",
  D: "#1A0F2E",
};
const OPTION_TILT: Record<AnswerId, number> = { A: -1.5, B: 1.5, C: -0.5, D: 0.5 };

export default function Play() {
  const router = useRouter();
  const challenge = useMemo(() => getDailyChallenge(), []);
  const complete = useDailyStore((s) => s.completeDaily);
  const alreadyPlayed = useDailyStore((s) => Boolean(s.results[challenge.dateKey]));

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<AnswerId | null>(null);
  const [outcomes, setOutcomes] = useState<AnswerOutcome[]>([]);
  const [score, setScore] = useState(0);
  const [tick, setTick] = useState(0);

  const questionStartRef = useRef<number>(Date.now());
  const totalStartRef = useRef<number>(Date.now());

  useEffect(() => {
    if (alreadyPlayed) router.replace("/");
  }, [alreadyPlayed, router]);

  useEffect(() => {
    questionStartRef.current = Date.now();
    setTick(0);
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [idx]);

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
  const remainingMs = Math.max(0, PER_QUESTION_MS - elapsed);
  const remainingPct = remainingMs / PER_QUESTION_MS;
  const remainingSec = Math.ceil(remainingMs / 1000);
  const lowTime = remainingPct < 0.25;

  function lockIn(answer: AnswerId | null) {
    if (selected) return;
    const msTaken = Date.now() - questionStartRef.current;
    const outcome: AnswerOutcome =
      answer === null ? "skipped" : answer === q!.correct_answer ? "correct" : "wrong";
    const pts = pointsFor(outcome, msTaken);
    setSelected(answer ?? "A");
    setOutcomes((prev) => [...prev, outcome]);
    setScore((s) => s + pts);

    setTimeout(() => {
      setSelected(null);
      if (idx + 1 >= DAILY_QUESTION_COUNT) {
        finalize([...outcomes, outcome], score + pts);
      } else {
        setIdx((i) => i + 1);
      }
    }, 1100);
  }

  useEffect(() => {
    if (remainingMs <= 0 && !selected) lockIn(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, selected]);

  async function finalize(finalOutcomes: AnswerOutcome[], finalScore: number) {
    const pattern = buildPattern(finalOutcomes);
    const totalMs = Date.now() - totalStartRef.current;
    await complete({
      dateKey: challenge.dateKey,
      score: finalScore,
      total: DAILY_QUESTION_COUNT * (500 + SPEED_BONUS_CEILING),
      pattern,
      outcomes: finalOutcomes,
      timeMs: totalMs,
    });
    const correct = finalOutcomes.filter((o) => o === "correct").length;
    const shareText = buildShareText({
      dailyIndex: challenge.index,
      score: correct,
      total: DAILY_QUESTION_COUNT,
      pattern,
    });
    router.replace({ pathname: "/result", params: { shareText, correct: String(correct) } });
  }

  const categoryEmoji = CATEGORY_EMOJI[q.category] ?? "✨";
  const progressDots = useMemo(
    () =>
      Array.from({ length: DAILY_QUESTION_COUNT }).map((_, i) => {
        if (i < outcomes.length) {
          const o = outcomes[i];
          if (o === "correct") return "🟩";
          if (o === "wrong") return "🟥";
          return "⬜";
        }
        return i === idx ? "🟨" : "⚪";
      }),
    [outcomes, idx],
  );

  return (
    <Screen>
      <EmojiSplat seed={challenge.index + idx * 17 + 3} count={6} />

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
        {q.options.map((opt) => {
          const isSelectedThis = selected === opt.id;
          const correctReveal = selected && opt.id === q.correct_answer;
          const wrongReveal = selected && isSelectedThis && opt.id !== q.correct_answer;
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
              tilt={selected ? 0 : OPTION_TILT[opt.id]}
              shadow={5}
              shadowColor={OPTION_SHADOW[opt.id]}
            >
              <Pressable
                onPress={() => lockIn(opt.id)}
                disabled={Boolean(selected)}
                className={`rounded-2xl px-5 py-4 border-4 active:opacity-80 ${box}`}
                style={Platform.OS === "web" ? { cursor: selected ? "auto" : "pointer" } : undefined}
              >
                <View className="flex-row items-center gap-3">
                  <Text className={`font-display text-2xl ${txt}`}>{opt.id}</Text>
                  <Text className={`font-display text-lg flex-1 ${txt}`}>
                    {opt.text}
                  </Text>
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
