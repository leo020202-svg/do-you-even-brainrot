import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { getDailyChallenge, DAILY_QUESTION_COUNT } from "@/lib/daily";
import { questionsById } from "@/lib/questions";
import { useDailyStore } from "@/features/daily/store";
import { buildPattern, buildShareText } from "@/lib/share";
import type { AnswerOutcome } from "@/features/daily/store";
import type { AnswerId } from "@/lib/questions";

const PER_QUESTION_MS = 30_000;
const SPEED_BONUS_CEILING = 1000; // points

function pointsFor(outcome: AnswerOutcome, msTaken: number): number {
  if (outcome !== "correct") return 0;
  const base = 500;
  const speed = Math.max(0, SPEED_BONUS_CEILING - Math.floor((msTaken / PER_QUESTION_MS) * SPEED_BONUS_CEILING));
  return base + speed;
}

const OPTION_CLASSES: Record<AnswerId, string> = {
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
    if (alreadyPlayed) {
      router.replace("/");
    }
  }, [alreadyPlayed, router]);

  // Drive the timer ring without re-rendering on every frame.
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
          <Text className="font-body text-paper">no questions loaded</Text>
        </View>
      </Screen>
    );
  }

  const elapsed = tick * 100;
  const remainingMs = Math.max(0, PER_QUESTION_MS - elapsed);
  const remainingPct = remainingMs / PER_QUESTION_MS;
  const remainingSec = Math.ceil(remainingMs / 1000);

  function lockIn(answer: AnswerId | null) {
    if (selected) return; // already locked
    const msTaken = Date.now() - questionStartRef.current;
    const outcome: AnswerOutcome =
      answer === null ? "skipped" : answer === q!.correct_answer ? "correct" : "wrong";
    const pts = pointsFor(outcome, msTaken);
    setSelected(answer ?? "A"); // any non-null locks UI; we don't render selection on skip
    setOutcomes((prev) => [...prev, outcome]);
    setScore((s) => s + pts);

    // brief "reveal" pause, then advance
    setTimeout(() => {
      setSelected(null);
      if (idx + 1 >= DAILY_QUESTION_COUNT) {
        finalize([...outcomes, outcome], score + pts);
      } else {
        setIdx((i) => i + 1);
      }
    }, 900);
  }

  // Auto-skip when time runs out.
  useEffect(() => {
    if (remainingMs <= 0 && !selected) {
      lockIn(null);
    }
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

  return (
    <Screen>
      <View className="flex-row justify-between items-center pt-4">
        <Text className="font-mono text-muted text-xs">
          Q{idx + 1} / {DAILY_QUESTION_COUNT}
        </Text>
        <Text className="font-mono text-paper text-xs">{remainingSec}s</Text>
      </View>

      {/* Timer bar */}
      <View className="h-2 rounded-full bg-ink mt-2 overflow-hidden">
        <View
          className={remainingPct < 0.25 ? "h-full bg-blood" : "h-full bg-cyan"}
          style={{ width: `${remainingPct * 100}%` }}
        />
      </View>

      <View className="flex-1 justify-center">
        <Text className="font-mono text-muted text-xs uppercase tracking-widest">
          {q.category.replace(/_/g, " ")} · {q.difficulty}
        </Text>
        <Text className="font-display text-paper text-3xl mt-2 leading-snug">{q.question}</Text>
      </View>

      <View className="gap-3 pb-6">
        {q.options.map((opt) => {
          const isSelectedThis = selected === opt.id;
          const showCorrect = selected && opt.id === q.correct_answer;
          const showWrong = selected && isSelectedThis && opt.id !== q.correct_answer;
          const box = showCorrect
            ? "bg-cyan"
            : showWrong
              ? "bg-blood"
              : OPTION_CLASSES[opt.id];
          const txt = showCorrect ? "text-ink" : showWrong ? "text-paper" : OPTION_TEXT[opt.id];
          return (
            <Pressable
              key={opt.id}
              onPress={() => lockIn(opt.id)}
              disabled={Boolean(selected)}
              className={`rounded-2xl px-5 py-4 ${box} active:opacity-80`}
              style={Platform.OS === "web" ? { cursor: selected ? "auto" : "pointer" } : undefined}
            >
              <Text className={`font-display text-lg ${txt}`}>
                {opt.id}. {opt.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
