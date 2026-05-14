import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { EmojiSplat } from "@/components/EmojiSplat";
import { useDailyStore } from "@/features/daily/store";
import { getDailyChallenge, DAILY_QUESTION_COUNT } from "@/lib/daily";
import { buildShareText, shareResult } from "@/lib/share";

type Verdict = { headline: string; line: string; emoji: string; color: string };

function verdictFor(correct: number, total: number): Verdict {
  const r = correct / total;
  if (r === 1) return { headline: "CERTIFIED SIGMA", line: "the lore is in your blood", emoji: "⛓️‍💥", color: "text-lime" };
  if (r >= 0.8) return { headline: "RIZZ-PILLED", line: "you log on. you scroll. you know.", emoji: "🔥", color: "text-cyan" };
  if (r >= 0.6) return { headline: "MID BUT VALID", line: "respectable brainrot showing", emoji: "✨", color: "text-hot" };
  if (r >= 0.4) return { headline: "MILDLY COOKED", line: "you log on sometimes I guess", emoji: "🫠", color: "text-paper" };
  if (r >= 0.2) return { headline: "OHIO ENERGY", line: "go outside? maybe? for like a sec?", emoji: "💀", color: "text-blood" };
  return { headline: "L + RATIO + BRAINROT-LESS", line: "have you... heard of TikTok?", emoji: "🤡", color: "text-blood" };
}

export default function Result() {
  const router = useRouter();
  const params = useLocalSearchParams<{ shareText?: string; correct?: string }>();
  const challenge = useMemo(() => getDailyChallenge(), []);
  const stored = useDailyStore((s) => s.results[challenge.dateKey]);
  const streak = useDailyStore((s) => s.currentStreak);
  const longest = useDailyStore((s) => s.longestStreak);

  const correct = useMemo(() => {
    if (params.correct) return Number(params.correct);
    if (stored) return stored.outcomes.filter((o) => o === "correct").length;
    return 0;
  }, [params.correct, stored]);

  const pattern = stored?.pattern ?? "⬜⬜⬜⬜⬜";
  const verdict = verdictFor(correct, DAILY_QUESTION_COUNT);

  const shareText = useMemo(
    () =>
      params.shareText ??
      buildShareText({
        dailyIndex: challenge.index,
        score: correct,
        total: DAILY_QUESTION_COUNT,
        pattern,
      }),
    [params.shareText, challenge.index, correct, pattern],
  );

  const [shareState, setShareState] = useState<"idle" | "shared" | "copied" | "failed">("idle");

  async function onShare() {
    const r = await shareResult(shareText);
    setShareState(r);
  }

  const shareLabel =
    shareState === "shared"
      ? "shared ✨"
      : shareState === "copied"
        ? "copied 📋"
        : shareState === "failed"
          ? "couldn't share. try again."
          : "share the carnage";

  return (
    <Screen>
      <EmojiSplat seed={challenge.index * 7 + correct} count={10} />

      <View className="flex-1 justify-center">
        <View className="items-center mb-4">
          <Text style={{ fontSize: 96 }}>{verdict.emoji}</Text>
        </View>

        <Sticker tilt={-2} shadow={6} shadowColor="#FF3EA5">
          <View className="bg-ink rounded-3xl border-4 border-paper p-6">
            <Text className="font-mono text-muted text-xs">BRAINROT DAILY · #{challenge.index}</Text>
            <Text className={`font-display text-4xl mt-1 ${verdict.color}`}>{verdict.headline}</Text>
            <Text className="font-body text-paper text-base mt-1">{verdict.line}</Text>

            <View className="flex-row items-end mt-5">
              <Text className="font-display text-lime text-7xl leading-none">{correct}</Text>
              <Text className="font-display text-muted text-3xl ml-1 mb-1">
                / {DAILY_QUESTION_COUNT}
              </Text>
            </View>

            <Text className="font-mono text-paper text-3xl tracking-widest mt-4">{pattern}</Text>

            <Text className="font-body text-muted text-xs mt-4">
              playbrainrot.app · run it back tomorrow
            </Text>
          </View>
        </Sticker>

        <View className="flex-row justify-around mt-6">
          <Sticker tilt={-2} shadow={3} shadowColor="#A8FF3E">
            <View className="bg-ink rounded-xl border-2 border-lime px-4 py-2">
              <Text className="font-mono text-muted text-xs">streak</Text>
              <Text className="font-display text-lime text-3xl">🔥 {streak}</Text>
            </View>
          </Sticker>
          <Sticker tilt={2} shadow={3} shadowColor="#3EFFE9">
            <View className="bg-ink rounded-xl border-2 border-cyan px-4 py-2">
              <Text className="font-mono text-muted text-xs">longest</Text>
              <Text className="font-display text-cyan text-3xl">🏆 {longest}</Text>
            </View>
          </Sticker>
        </View>
      </View>

      <View className="gap-3 pb-6">
        <Button label={shareLabel} emoji="📣" tilt={-1} onPress={onShare} full />
        <Button label="back to home" variant="ghost" onPress={() => router.replace("/")} full />
      </View>
    </Screen>
  );
}
