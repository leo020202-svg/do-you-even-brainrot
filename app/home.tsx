// "Home" — drop-in dashboard for returning players.
//
// The product is a quiz game you hop into for chaos: bots fill the lobby
// when no humans are around, friends join via codes. "Today's daily" is
// one named variant, not the centerpiece — it lives as a small status
// card in the corner, not as the headline.

import { useMemo } from "react";
import { Image, Text, View, Pressable, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { EmojiSplat } from "@/components/EmojiSplat";
import { SeoHead } from "@/components/SeoHead";
import { getDailyChallenge } from "@/lib/daily";
import { useDailyStore } from "@/features/daily/store";
import { ALL_CHARACTERS_IMAGE } from "@/lib/character-images";
import { useMidnightCountdown } from "@/lib/countdown";

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
  const allResults = useDailyStore((s) => s.results);
  const hydrated = useDailyStore((s) => s.hydrated);
  const countdown = useMidnightCountdown();

  const tagline = useMemo(
    () => TAGLINES[challenge.index % TAGLINES.length] ?? TAGLINES[0],
    [challenge.index],
  );

  const stats = useMemo(() => {
    const dailies = Object.values(allResults);
    const totalPlayed = dailies.length;
    const totalQuestions = dailies.reduce((acc, r) => acc + r.outcomes.length, 0);
    const totalCorrect = dailies.reduce(
      (acc, r) => acc + r.outcomes.filter((o) => o === "correct").length,
      0,
    );
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    return { totalPlayed, accuracy };
  }, [allResults]);

  const dailyDone = Boolean(result);

  return (
    <Screen>
      <SeoHead title="Home" path="/home" noindex />
      <EmojiSplat seed={challenge.index + 1} count={9} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <View className="flex-row justify-between items-center pt-5">
          <Sticker tilt={-3} shadow={4} shadowColor="#FF3EA5">
            <View className="bg-ink rounded-xl px-3 py-2 border-2 border-hot">
              <Text className="font-display text-hot text-lg">brainrot</Text>
            </View>
          </Sticker>
          <View className="flex-row gap-2">
            <Link href="/settings" asChild>
              <Pressable>
                <Sticker tilt={-2} shadow={3} shadowColor="#FF3EA5">
                  <View className="bg-ink rounded-full px-3 py-2 border-2 border-hot">
                    <Text className="font-display text-paper text-base">⚙️</Text>
                  </View>
                </Sticker>
              </Pressable>
            </Link>
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
        </View>

        {/* ── Cast banner ──────────────────────────────────────────────── */}
        <View className="mt-4">
          <Sticker tilt={-1.5} shadow={5} shadowColor="#FF3EA5">
            <View className="rounded-2xl overflow-hidden border-4 border-paper">
              <Image
                source={ALL_CHARACTERS_IMAGE}
                style={{ width: "100%", aspectRatio: 21 / 9 }}
                resizeMode="cover"
              />
              <View className="absolute left-3 bottom-3 bg-ink/80 rounded-md px-2 py-1 border border-paper">
                <Text className="font-display text-paper text-xs">↳ {tagline}</Text>
              </View>
            </View>
          </Sticker>
        </View>

        {/* ── Primary actions ──────────────────────────────────────────── */}
        <View className="mt-5 gap-3">
          <Button
            label="PLAY NOW"
            emoji="🔥"
            tilt={-1}
            onPress={() => router.push("/play?practice=1")}
            full
          />
          <Button
            label="endless mode"
            emoji="♾️"
            variant="secondary"
            onPress={() => router.push("/endless")}
            full
          />
          <Button
            label="play with friends"
            emoji="👯"
            variant="ghost"
            onPress={() => router.push("/friends")}
            full
          />
        </View>

        <Text className="font-mono text-muted text-xs text-center mt-3 italic">
          bots fill the lobby when no humans are around. you&apos;re never alone.
        </Text>

        {/* ── Today's daily — secondary status card ────────────────────── */}
        <View className="mt-5">
          <Pressable
            onPress={() => router.push("/play")}
            disabled={dailyDone}
          >
            <Sticker tilt={-0.5} shadow={3} shadowColor="#A8FF3E">
              <View
                className={`rounded-2xl border-2 p-3 flex-row items-center justify-between ${
                  dailyDone ? "bg-ink border-muted" : "bg-ink border-lime"
                }`}
              >
                <View className="flex-1">
                  <Text className="font-mono text-muted text-xs uppercase tracking-widest">
                    📅 today&apos;s daily #{challenge.index}
                  </Text>
                  {hydrated && dailyDone && result ? (
                    <Text className="font-display text-paper text-base mt-1">
                      done · <Text className="text-lime">{result.outcomes.filter((o) => o === "correct").length}/{result.outcomes.length}</Text>{" "}
                      <Text className="font-mono text-paper text-sm">{result.pattern}</Text>
                    </Text>
                  ) : (
                    <Text className="font-display text-paper text-base mt-1">
                      ranked · streak on the line
                    </Text>
                  )}
                </View>
                <View className="items-end">
                  <Text className="font-mono text-muted text-xs">
                    {dailyDone ? "next in" : "play →"}
                  </Text>
                  <Text className="font-display text-cyan text-base">{countdown}</Text>
                </View>
              </View>
            </Sticker>
          </Pressable>
        </View>

        {/* ── Stats strip ──────────────────────────────────────────────── */}
        <View className="flex-row gap-2 mt-4">
          <View className="flex-1">
            <Sticker tilt={-0.5} shadow={2} shadowColor="#FF3EA5">
              <View className="bg-ink rounded-2xl border-2 border-muted p-3">
                <Text className="font-mono text-muted text-xs">🔥 STREAK</Text>
                <Text className="font-display text-lime text-2xl">{streak}</Text>
              </View>
            </Sticker>
          </View>
          <View className="flex-1">
            <Sticker tilt={0.5} shadow={2} shadowColor="#3EFFE9">
              <View className="bg-ink rounded-2xl border-2 border-muted p-3">
                <Text className="font-mono text-muted text-xs">ACCURACY</Text>
                <Text className="font-display text-cyan text-2xl">{stats.accuracy}%</Text>
              </View>
            </Sticker>
          </View>
          <View className="flex-1">
            <Sticker tilt={-0.5} shadow={2} shadowColor="#A8FF3E">
              <View className="bg-ink rounded-2xl border-2 border-muted p-3">
                <Text className="font-mono text-muted text-xs">PLAYED</Text>
                <Text className="font-display text-paper text-2xl">{stats.totalPlayed}</Text>
              </View>
            </Sticker>
          </View>
        </View>

        <View className="pt-5 flex-row justify-between">
          <Link href="/credits" asChild>
            <Pressable>
              <Text className="font-mono text-muted text-xs underline">image credits</Text>
            </Pressable>
          </Link>
          <Text className="font-mono text-muted text-xs">longest: {longest}d · v0.1</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
