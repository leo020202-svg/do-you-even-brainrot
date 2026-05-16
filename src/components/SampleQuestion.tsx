import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Sticker } from "./Sticker";
import type { AnswerId, Question } from "@/lib/questions";

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

// Marketing-only sample question. Lets a cold visitor TASTE the content
// without committing. Tap any option to peek the correct answer.

type Props = {
  question: Question;
};

export function SampleQuestion({ question }: Props) {
  const [picked, setPicked] = useState<AnswerId | null>(null);
  const revealed = picked !== null;
  const correctId = question.correct_answer;

  return (
    <View>
      <Text className="font-mono text-muted text-xs uppercase tracking-widest">
        a real question (tap an answer)
      </Text>
      <Sticker tilt={-1} shadow={4} shadowColor="#3EFFE9">
        <View className="bg-ink rounded-2xl border-2 border-paper px-4 py-3 mt-2">
          <Text className="font-display text-paper text-lg leading-snug">
            {question.question}
          </Text>
        </View>
      </Sticker>
      <View className="gap-2 mt-3">
        {question.options.map((opt) => {
          const isCorrect = opt.id === correctId;
          const isPicked = picked === opt.id;
          const showCorrect = revealed && isCorrect;
          const showWrong = revealed && isPicked && !isCorrect;
          const bg = showCorrect
            ? "bg-cyan"
            : showWrong
              ? "bg-blood"
              : OPTION_BG[opt.id];
          const txt = showCorrect
            ? "text-ink"
            : showWrong
              ? "text-paper"
              : OPTION_TEXT[opt.id];
          return (
            <Pressable
              key={opt.id}
              onPress={() => setPicked(opt.id)}
              disabled={revealed}
              className={`rounded-xl px-3 py-2 border-2 border-ink ${bg} ${
                revealed && !isCorrect && !isPicked ? "opacity-50" : "active:opacity-80"
              }`}
            >
              <View className="flex-row items-center gap-2">
                <Text className={`font-display text-base ${txt}`}>{opt.id}.</Text>
                <Text className={`font-body text-sm flex-1 ${txt}`}>{opt.text}</Text>
                {showCorrect ? <Text className="text-base">✅</Text> : null}
                {showWrong ? <Text className="text-base">💀</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {revealed ? (
        <Text className="font-body text-muted text-xs italic mt-3">
          {picked === correctId
            ? "nice — that's why you're playing the daily."
            : "the real game has a 30s timer and a streak. tap RUN IT above."}
        </Text>
      ) : null}
    </View>
  );
}
