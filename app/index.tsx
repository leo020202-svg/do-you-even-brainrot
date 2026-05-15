import { useMemo } from "react";
import { Text, View, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { EmojiSplat } from "@/components/EmojiSplat";
import { getDailyChallenge } from "@/lib/daily";
import { useDailyStore } from "@/features/daily/store";

const TAGLINES = [
  "how cooked are you?",
  "prove the rizz, fr",
  "ohio detector engaged",
  "sigma test incoming",
  "no thoughts, head full",
  "skibidi or skibidon't",
];

export default function Home() {
  const router = useRouter();
  const challenge = useMemo(() => getDailyChallenge(), []);
  const streak = useDailyStore((s) => s.currentStreak);
  const longest = useDailyStore((s) => s.longestStreak);
  const result = useDailyStore((s) => s.results[challenge.dateKey]);
  const hydrated = useDailyStore((s) => s.hydrated);

  const tagline = useMemo(
    () => TAGLINES[challenge.index % TAGLINES.length] ?? TAGLINES[0],
    [challenge.index],
  );

  return (
    <Screen>
      <EmojiSplat seed={challenge.index + 1} count={11} />

      <View className="flex-row justify-between items-start pt-6">
        <Sticker tilt={-3} shadow={4} shadowColor="#FF3EA5">
          <View className="bg-ink rounded-xl px-3 py-2 border-2 border-hot">
            <Text className="font-mono text-cyan text-xs">DAILY #{challenge.index}</Text>
          </View>
        </Sticker>
        <Link href="/profile" asChild>
          <Pressable>
            <Sticker tilt={2} shadow={4} shadowColor="#A8FF3E">
              <View className="bg-ink rounded-full px-4 py-2 border-2 border-lime">
                <Text className="font-display text-paper text-base">
                  {streak > 0 ? `🔥 ${streak}` : "👤 profile"}
                </Text>
              </View>
            </Sticker>
          </Pressable>
        </Link>
      </View>

      <View className="flex-1 justify-center -mt-4">
        <View>
          <Sticker tilt={-2} shadow={5} shadowColor="#3EFFE9">
            <Text className="font-display text-lime text-6xl leading-none">DO YOU</Text>
          </Sticker>
        </View>
        <View className="self-end mt-1">
          <Sticker tilt={3} shadow={5} shadowColor="#FF3EA5">
            <Text className="font-display text-cyan text-6xl leading-none">EVEN</Text>
          </Sticker>
        </View>
        <View className="mt-1">
          <Sticker tilt={-1} shadow={5} shadowColor="#FF5C3E">
            <Text className="font-display text-hot text-6xl leading-none">BRAINROT?</Text>
          </Sticker>
        </View>

        <Text className="font-body text-paper text-base mt-6 italic">↳ {tagline}</Text>

        <View className="mt-10 gap-3">
          {!hydrated ? (
            <Text className="font-body text-muted">Cooking... 🍳</Text>
          ) : result ? (
            <>
              <Sticker tilt={-1} shadow={5} shadowColor="#A8FF3E">
                <View className="bg-ink rounded-3xl border-4 border-lime p-5">
                  <Text className="font-body text-paper text-sm">you already cooked today:</Text>
                  <Text className="font-display text-lime text-4xl mt-1">
                    {result.outcomes.filter((o) => o === "correct").length}/{result.outcomes.length} ✨
                  </Text>
                  <Text className="font-mono text-paper text-2xl tracking-widest mt-2">
                    {result.pattern}
                  </Text>
                </View>
              </Sticker>
              <Button label="see your score card" emoji="🪪" onPress={() => router.push("/result")} full />
              <Button
                label="play with friends"
                emoji="👯"
                variant="secondary"
                onPress={() => router.push("/friends")}
                full
              />
              <Button
                label="practice mode"
                emoji="🎯"
                variant="ghost"
                onPress={() => router.push("/play?practice=1")}
                full
              />
            </>
          ) : (
            <>
              <Button label="RUN IT" emoji="🔥" tilt={-1} onPress={() => router.push("/play")} full />
              <Button
                label="play with friends"
                emoji="👯"
                variant="secondary"
                onPress={() => router.push("/friends")}
                full
              />
              <Button
                label="practice mode"
                emoji="🎯"
                variant="ghost"
                onPress={() => router.push("/play?practice=1")}
                full
              />
            </>
          )}
        </View>
      </View>

      <View className="pb-6 flex-row justify-between">
        <Text className="font-mono text-muted text-xs">
          longest: <Text className="text-paper">{longest}d</Text>
        </Text>
        <Text className="font-mono text-muted text-xs">v0.1 · phase 0</Text>
      </View>
    </Screen>
  );
}
