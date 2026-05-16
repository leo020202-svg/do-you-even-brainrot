import { Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { EmojiSplat } from "@/components/EmojiSplat";
import { SeoHead } from "@/components/SeoHead";
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

  const totalPlayed = Object.keys(results).length;
  const totalCorrect = Object.values(results).reduce(
    (acc, r) => acc + r.outcomes.filter((o) => o === "correct").length,
    0,
  );
  const totalQuestions = Object.values(results).reduce(
    (acc, r) => acc + r.outcomes.length,
    0,
  );
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <Screen>
      <SeoHead title="Profile" path="/profile" noindex />
      <EmojiSplat seed={123 + totalPlayed} count={8} />

      <View className="flex-row justify-between items-center pt-6">
        <Sticker tilt={-2} shadow={4} shadowColor="#A8FF3E">
          <View className="bg-ink rounded-xl px-3 py-2 border-2 border-lime">
            <Text className="font-display text-lime text-2xl">profile.exe</Text>
          </View>
        </Sticker>
        <Button label="← back" variant="ghost" onPress={() => router.back()} />
      </View>

      <View className="flex-row justify-between mt-8 gap-3">
        <View className="flex-1">
          <Sticker tilt={-2} shadow={5} shadowColor="#FF3EA5">
            <View className="bg-ink rounded-3xl p-5 border-4 border-hot">
              <Text className="font-mono text-muted text-xs">CURRENT</Text>
              <Text className="font-display text-paper text-base mt-1">🔥 streak</Text>
              <Text className="font-display text-lime text-5xl mt-2">{streak}</Text>
            </View>
          </Sticker>
        </View>
        <View className="flex-1">
          <Sticker tilt={2} shadow={5} shadowColor="#3EFFE9">
            <View className="bg-ink rounded-3xl p-5 border-4 border-cyan">
              <Text className="font-mono text-muted text-xs">LONGEST</Text>
              <Text className="font-display text-paper text-base mt-1">🏆 ever</Text>
              <Text className="font-display text-cyan text-5xl mt-2">{longest}</Text>
            </View>
          </Sticker>
        </View>
      </View>

      <View className="mt-4">
        <Sticker tilt={-0.5} shadow={4} shadowColor="#A8FF3E">
          <View className="bg-ink rounded-2xl p-4 border-2 border-muted flex-row justify-between">
            <View>
              <Text className="font-mono text-muted text-xs">PLAYED</Text>
              <Text className="font-display text-paper text-2xl">{totalPlayed}</Text>
            </View>
            <View>
              <Text className="font-mono text-muted text-xs">ACCURACY</Text>
              <Text className="font-display text-lime text-2xl">{accuracy}%</Text>
            </View>
            <View>
              <Text className="font-mono text-muted text-xs">CORRECT</Text>
              <Text className="font-display text-cyan text-2xl">{totalCorrect}</Text>
            </View>
          </View>
        </Sticker>
      </View>

      <Text className="font-display text-paper text-lg mt-6 mb-2">↳ recent dailies</Text>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 12 }}>
        {recent.length === 0 ? (
          <Sticker tilt={-1} shadow={3} shadowColor="#FF3EA5">
            <View className="bg-ink rounded-2xl p-5 border-2 border-hot">
              <Text className="font-body text-paper text-base">
                no dailies yet. 💤 go run today&apos;s.
              </Text>
            </View>
          </Sticker>
        ) : (
          recent.map((r, i) => {
            const correct = r.outcomes.filter((o) => o === "correct").length;
            const tilt = i % 2 === 0 ? -1 : 1;
            const color = i % 3 === 0 ? "#A8FF3E" : i % 3 === 1 ? "#FF3EA5" : "#3EFFE9";
            return (
              <View key={r.dateKey} className="mb-3">
                <Sticker tilt={tilt} shadow={3} shadowColor={color}>
                  <View className="bg-ink rounded-2xl p-4 border-2 border-muted flex-row justify-between items-center">
                    <View>
                      <Text className="font-mono text-muted text-xs">{r.dateKey}</Text>
                      <Text className="font-mono text-paper text-xl tracking-widest mt-1">
                        {r.pattern}
                      </Text>
                    </View>
                    <Text className="font-display text-lime text-3xl">{correct}/5</Text>
                  </View>
                </Sticker>
              </View>
            );
          })
        )}
      </ScrollView>

      <View className="pb-6 gap-2">
        <Button
          label="game settings ⚙️"
          variant="secondary"
          onPress={() => router.push("/settings")}
          full
        />
        <Button
          label="image credits 📜"
          variant="ghost"
          onPress={() => router.push("/credits")}
          full
        />
        <Button label="wipe local data 🧹" variant="ghost" onPress={() => void reset()} full />
      </View>
    </Screen>
  );
}
