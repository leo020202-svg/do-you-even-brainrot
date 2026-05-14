import { Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { useDailyStore } from "@/features/daily/store";

export default function Profile() {
  const router = useRouter();
  const streak = useDailyStore((s) => s.currentStreak);
  const longest = useDailyStore((s) => s.longestStreak);
  const results = useDailyStore((s) => s.results);
  const reset = useDailyStore((s) => s.reset);

  const recent = Object.values(results)
    .sort((a, b) => (a.dateKey > b.dateKey ? -1 : 1))
    .slice(0, 14);

  return (
    <Screen>
      <View className="flex-row justify-between items-center pt-6">
        <Text className="font-display text-paper text-2xl">profile</Text>
        <Button label="back" variant="ghost" onPress={() => router.back()} />
      </View>

      <View className="mt-8 rounded-3xl bg-ink p-6 border border-muted">
        <View className="flex-row justify-between">
          <View>
            <Text className="font-body text-muted text-xs">current streak</Text>
            <Text className="font-display text-lime text-5xl">{streak}</Text>
          </View>
          <View>
            <Text className="font-body text-muted text-xs">longest</Text>
            <Text className="font-display text-cyan text-5xl">{longest}</Text>
          </View>
        </View>
      </View>

      <Text className="font-display text-paper text-lg mt-8 mb-2">recent dailies</Text>
      <ScrollView className="flex-1">
        {recent.length === 0 ? (
          <Text className="font-body text-muted">no dailies yet. go run today&apos;s.</Text>
        ) : (
          recent.map((r) => (
            <View
              key={r.dateKey}
              className="flex-row justify-between items-center py-3 border-b border-ink"
            >
              <View>
                <Text className="font-mono text-paper text-sm">{r.dateKey}</Text>
                <Text className="font-mono text-paper text-base tracking-widest">{r.pattern}</Text>
              </View>
              <Text className="font-display text-lime text-base">
                {r.outcomes.filter((o) => o === "correct").length}/5
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View className="pb-6">
        <Button label="wipe local data" variant="ghost" onPress={() => void reset()} full />
      </View>
    </Screen>
  );
}
