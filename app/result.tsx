import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { useDailyStore } from "@/features/daily/store";
import { getDailyChallenge, DAILY_QUESTION_COUNT } from "@/lib/daily";
import { buildShareText, shareResult } from "@/lib/share";

function vibeFor(correct: number, total: number): string {
  const ratio = correct / total;
  if (ratio === 1) return "Certified sigma. ⛓️";
  if (ratio >= 0.8) return "Rizz-pilled. 🔥";
  if (ratio >= 0.6) return "Mid but rizz-pilled.";
  if (ratio >= 0.4) return "You log on sometimes.";
  if (ratio >= 0.2) return "Ohio energy detected.";
  return "Have you... heard of TikTok?";
}

export default function Result() {
  const router = useRouter();
  const params = useLocalSearchParams<{ shareText?: string; correct?: string }>();
  const challenge = useMemo(() => getDailyChallenge(), []);
  const stored = useDailyStore((s) => s.results[challenge.dateKey]);
  const streak = useDailyStore((s) => s.currentStreak);

  const correct = useMemo(() => {
    if (params.correct) return Number(params.correct);
    if (stored) return stored.outcomes.filter((o) => o === "correct").length;
    return 0;
  }, [params.correct, stored]);

  const pattern = stored?.pattern ?? "⬜⬜⬜⬜⬜";

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
        ? "copied to clipboard 📋"
        : shareState === "failed"
          ? "couldn't share, try again"
          : "share the carnage";

  return (
    <Screen>
      <View className="flex-1 justify-center">
        <Text className="font-mono text-cyan text-sm">Brainrot Daily #{challenge.index}</Text>
        <Text className="font-display text-paper text-5xl mt-2">
          <Text className="text-lime">{correct}</Text>
          <Text className="text-muted"> / {DAILY_QUESTION_COUNT}</Text>
        </Text>
        <Text className="font-display text-paper text-xl mt-2">{vibeFor(correct, DAILY_QUESTION_COUNT)}</Text>

        <View className="mt-8 rounded-3xl bg-ink p-6 border border-muted">
          <Text className="font-mono text-paper text-3xl tracking-widest">{pattern}</Text>
          <Text className="font-body text-muted text-xs mt-3">
            playbrainrot.app · daily #{challenge.index}
          </Text>
        </View>

        <Text className="font-body text-paper text-base mt-8">
          🔥 streak: <Text className="font-display text-lime">{streak}</Text> {streak === 1 ? "day" : "days"}
        </Text>
      </View>

      <View className="gap-3 pb-6">
        <Button label={shareLabel} onPress={onShare} full />
        <Button label="back to home" variant="ghost" onPress={() => router.replace("/")} full />
      </View>
    </Screen>
  );
}
