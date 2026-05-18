// "Home" — the app-shell home screen for returning players.
//
// Restructured into a dashboard-style layout so a returning player who's
// already done today's daily sees their result + stats + next-action CTA
// without scrolling. The marketing-flex hero ("DO YOU EVEN BRAINROT?")
// lives at /; here we just need to celebrate the streak and route them
// to the next round.

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
import { questionsById, type Category } from "@/lib/questions";
import { CATEGORY_EMOJI } from "@/components/EmojiSplat";

const TAGLINES = [
  "how cooked are you?",
  "prove the rizz, fr",
  "ohio detector engaged",
  "sigma test incoming",
  "no thoughts, head full",
  "skibidi or skibidon't",
];

const VIBE_QUOTE_BY_RATIO: Array<{ min: number; line: string; color: string }> = [
  { min: 1, line: "certified sigma. lore in your blood.", color: "text-lime" },
  { min: 0.8, line: "rizz-pilled. you log on.", color: "text-cyan" },
  { min: 0.6, line: "mid but valid.", color: "text-hot" },
  { min: 0.4, line: "you log on sometimes I guess.", color: "text-paper" },
  { min: 0.2, line: "ohio energy detected.", color: "text-blood" },
  { min: 0, line: "have you... heard of TikTok?", color: "text-blood" },
];

function vibeFor(correct: number, total: number) {
  const ratio = total > 0 ? correct / total : 0;
  return VIBE_QUOTE_BY_RATIO.find((v) => ratio >= v.min) ?? VIBE_QUOTE_BY_RATIO[VIBE_QUOTE_BY_RATIO.length - 1]!;
}

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

  // Inline stats — total dailies played + lifetime accuracy.
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

  // Today's question categories, surfaced as little chips so the player
  // sees what mix the daily tested them on.
  const todaysCategories = useMemo(() => {
    const cats: Category[] = [];
    for (const qid of challenge.questionIds) {
      const q = questionsById[qid];
      if (q && !cats.includes(q.category)) cats.push(q.category);
    }
    return cats;
  }, [challenge.questionIds]);

  const correctCount = result ? result.outcomes.filter((o) => o === "correct").length : 0;
  const totalCount = result?.outcomes.length ?? 5;
  const vibe = result ? vibeFor(correctCount, totalCount) : null;

  return (
    <Screen>
      <SeoHead title="Today's daily" path="/home" noindex />
      <EmojiSplat seed={challenge.index + 1} count={9} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* ── Top bar: daily badge + settings + profile/streak ─────────── */}
        <View className="flex-row justify-between items-center pt-5">
          <Sticker tilt={-3} shadow={4} shadowColor="#FF3EA5">
            <View className="bg-ink rounded-xl px-3 py-2 border-2 border-hot">
              <Text className="font-mono text-cyan text-xs">DAILY #{challenge.index}</Text>
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

        {/* ── Cast banner — Italian-brainrot composite as the eye-catch ─ */}
        <View className="mt-4">
          <Sticker tilt={-1.5} shadow={5} shadowColor="#FF3EA5">
            <View className="rounded-2xl overflow-hidden border-4 border-paper">
              <Image
                source={ALL_CHARACTERS_IMAGE}
                style={{ width: "100%", aspectRatio: 21 / 9 }}
                resizeMode="cover"
              />
              <View className="absolute left-3 bottom-3 bg-ink/80 rounded-md px-2 py-1 border border-paper">
                <Text className="font-display text-paper text-xs">
                  {tagline}
                </Text>
              </View>
            </View>
          </Sticker>
        </View>

        {!hydrated ? (
          <View className="mt-6">
            <Text className="font-body text-muted">Cooking... 🍳</Text>
          </View>
        ) : result && vibe ? (
          <>
            {/* ── Result celebration card ─────────────────────────────── */}
            <View className="mt-4">
              <Sticker tilt={-1} shadow={5} shadowColor="#A8FF3E">
                <View className="bg-ink rounded-3xl border-4 border-lime p-4">
                  <Text className="font-mono text-muted text-xs uppercase tracking-widest">
                    you already cooked today
                  </Text>
                  <View className="flex-row items-baseline mt-1">
                    <Text className="font-display text-lime text-6xl leading-none">
                      {correctCount}
                    </Text>
                    <Text className="font-display text-muted text-3xl ml-1">
                      / {totalCount}
                    </Text>
                  </View>
                  <Text className={`font-display text-xl mt-1 ${vibe.color}`}>
                    {vibe.line}
                  </Text>
                  <Text className="font-mono text-paper text-2xl tracking-widest mt-3">
                    {result.pattern}
                  </Text>
                </View>
              </Sticker>
            </View>

            {/* ── Stats strip + next-drop countdown ──────────────────── */}
            <View className="flex-row gap-2 mt-3">
              <View className="flex-1">
                <Sticker tilt={-0.5} shadow={3} shadowColor="#FF3EA5">
                  <View className="bg-ink rounded-2xl border-2 border-hot p-3">
                    <Text className="font-mono text-muted text-xs">STREAK</Text>
                    <Text className="font-display text-lime text-2xl">🔥 {streak}</Text>
                  </View>
                </Sticker>
              </View>
              <View className="flex-1">
                <Sticker tilt={0.5} shadow={3} shadowColor="#3EFFE9">
                  <View className="bg-ink rounded-2xl border-2 border-cyan p-3">
                    <Text className="font-mono text-muted text-xs">ACCURACY</Text>
                    <Text className="font-display text-cyan text-2xl">{stats.accuracy}%</Text>
                  </View>
                </Sticker>
              </View>
              <View className="flex-1">
                <Sticker tilt={-0.5} shadow={3} shadowColor="#A8FF3E">
                  <View className="bg-ink rounded-2xl border-2 border-lime p-3">
                    <Text className="font-mono text-muted text-xs">LONGEST</Text>
                    <Text className="font-display text-paper text-2xl">🏆 {longest}d</Text>
                  </View>
                </Sticker>
              </View>
            </View>

            {/* ── Today's category mix ───────────────────────────────── */}
            <View className="mt-4">
              <Text className="font-mono text-muted text-xs">
                today&apos;s mix
              </Text>
              <View className="flex-row flex-wrap gap-2 mt-2">
                {todaysCategories.map((cat, i) => (
                  <Link key={cat} href={`/category/${cat.replace(/_/g, "-")}` as never} asChild>
                    <Pressable>
                      <Sticker
                        tilt={i % 2 === 0 ? -0.5 : 0.5}
                        shadow={2}
                        shadowColor="#1A0F2E"
                      >
                        <View className="bg-ink rounded-full border-2 border-muted px-3 py-1 flex-row items-center gap-1">
                          <Text className="text-base">{CATEGORY_EMOJI[cat] ?? "✨"}</Text>
                          <Text className="font-mono text-paper text-xs">
                            {cat.replace(/_/g, " ")}
                          </Text>
                        </View>
                      </Sticker>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </View>

            {/* ── Actions: unlimited is primary now ──────────────────── */}
            <View className="mt-5 gap-3">
              <Button
                label="play unlimited"
                emoji="♾️"
                tilt={-1}
                onPress={() => router.push("/play?practice=1")}
                full
              />
              <Button
                label="play with friends"
                emoji="👯"
                variant="secondary"
                onPress={() => router.push("/friends")}
                full
              />
              <Button
                label="see your score card"
                emoji="🪪"
                variant="ghost"
                onPress={() => router.push("/result")}
                full
              />
            </View>

            <Text className="font-mono text-muted text-xs text-center mt-4">
              next daily drops in <Text className="text-cyan">{countdown}</Text> · don&apos;t lose the streak
            </Text>
          </>
        ) : (
          // ── Not played yet today ─────────────────────────────────────
          <>
            <View className="mt-4">
              <Sticker tilt={-1} shadow={5} shadowColor="#3EFFE9">
                <View className="bg-ink rounded-3xl border-4 border-lime p-4">
                  <Text className="font-mono text-muted text-xs">TODAY&apos;S DAILY</Text>
                  <Text className="font-display text-paper text-2xl mt-1">
                    {totalCount} questions · {totalCount * 30}s timer · streak on the line
                  </Text>
                  <Text className="font-body text-muted text-sm mt-2 italic">
                    ↳ {tagline}
                  </Text>
                </View>
              </Sticker>
            </View>

            <View className="mt-5 gap-3">
              <Button
                label="RUN IT"
                emoji="🔥"
                tilt={-1}
                onPress={() => router.push("/play")}
                full
              />
              <Button
                label="play with friends"
                emoji="👯"
                variant="secondary"
                onPress={() => router.push("/friends")}
                full
              />
              <Button
                label="unlimited mode"
                emoji="♾️"
                variant="ghost"
                onPress={() => router.push("/play?practice=1")}
                full
              />
            </View>

            <View className="flex-row gap-2 mt-4">
              <View className="flex-1">
                <Sticker tilt={-0.5} shadow={2} shadowColor="#1A0F2E">
                  <View className="bg-ink rounded-2xl border-2 border-muted p-3">
                    <Text className="font-mono text-muted text-xs">STREAK</Text>
                    <Text className="font-display text-lime text-2xl">🔥 {streak}</Text>
                  </View>
                </Sticker>
              </View>
              <View className="flex-1">
                <Sticker tilt={0.5} shadow={2} shadowColor="#1A0F2E">
                  <View className="bg-ink rounded-2xl border-2 border-muted p-3">
                    <Text className="font-mono text-muted text-xs">LONGEST</Text>
                    <Text className="font-display text-paper text-2xl">🏆 {longest}d</Text>
                  </View>
                </Sticker>
              </View>
              <View className="flex-1">
                <Sticker tilt={-0.5} shadow={2} shadowColor="#1A0F2E">
                  <View className="bg-ink rounded-2xl border-2 border-muted p-3">
                    <Text className="font-mono text-muted text-xs">PLAYED</Text>
                    <Text className="font-display text-paper text-2xl">{stats.totalPlayed}</Text>
                  </View>
                </Sticker>
              </View>
            </View>
          </>
        )}

        <View className="pt-6 flex-row justify-between">
          <Link href="/credits" asChild>
            <Pressable>
              <Text className="font-mono text-muted text-xs underline">image credits</Text>
            </Pressable>
          </Link>
          <Text className="font-mono text-muted text-xs">v0.1 · phase 0</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
