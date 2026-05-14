import { useMemo } from "react";
import { Text, View, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { getDailyChallenge } from "@/lib/daily";
import { useDailyStore } from "@/features/daily/store";

export default function Home() {
  const router = useRouter();
  const challenge = useMemo(() => getDailyChallenge(), []);
  const streak = useDailyStore((s) => s.currentStreak);
  const longest = useDailyStore((s) => s.longestStreak);
  const result = useDailyStore((s) => s.results[challenge.dateKey]);
  const hydrated = useDailyStore((s) => s.hydrated);

  return (
    <Screen>
      <View className="flex-row justify-between items-center pt-6">
        <Text className="font-display text-paper text-2xl">do you even brainrot?</Text>
        <Link href="/profile" asChild>
          <Pressable className="px-3 py-2 rounded-full border border-muted active:opacity-70">
            <Text className="font-mono text-paper text-xs">
              {streak > 0 ? `🔥 ${streak}` : "profile"}
            </Text>
          </Pressable>
        </Link>
      </View>

      <View className="flex-1 justify-center">
        <Text className="font-mono text-cyan text-sm">Daily #{challenge.index}</Text>
        <Text className="font-display text-paper text-4xl mt-2 leading-tight">
          5 questions.{"\n"}30 seconds each.{"\n"}<Text className="text-lime">how cooked are you?</Text>
        </Text>
        <Text className="font-body text-muted text-base mt-4">
          mixed categories, mixed difficulty. one shot per day. don&apos;t lose your streak.
        </Text>

        <View className="mt-10">
          {!hydrated ? (
            <Text className="font-body text-muted">Cooking...</Text>
          ) : result ? (
            <View className="gap-3">
              <Text className="font-body text-paper text-base">
                you already played today: <Text className="font-display text-lime">{result.score}/{result.total}</Text>
              </Text>
              <Text className="font-mono text-paper text-2xl tracking-widest">{result.pattern}</Text>
              <Button
                label="see your score card"
                onPress={() => router.push("/result")}
                full
              />
              <Button
                label="back tomorrow ⏰"
                variant="ghost"
                disabled
                full
              />
            </View>
          ) : (
            <Button label="Run it" onPress={() => router.push("/play")} full />
          )}
        </View>
      </View>

      <View className="pb-6">
        <Text className="font-body text-muted text-xs text-center">
          Longest streak: {longest} {longest === 1 ? "day" : "days"}
        </Text>
      </View>
    </Screen>
  );
}
