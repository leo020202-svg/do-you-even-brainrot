// /category/[slug] — per-category SEO landing page.
//
// Lists the curated questions for one category with the correct answer
// revealed, plus an intro paragraph for human + AI-search readers. Plays
// double duty as a study guide and as the topical-authority anchor for
// each cluster of keywords (see docs/STRATEGY.md §7).

import { Image, Text, View, ScrollView, Pressable, Linking } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { EmojiSplat } from "@/components/EmojiSplat";
import { SeoHead } from "@/components/SeoHead";
import { categoryBySlug } from "@/lib/categories";
import { questions } from "@/lib/questions";
import { ALL_CHARACTERS_IMAGE } from "@/lib/character-images";
import { useAchievementsStore } from "@/features/achievements/store";
import { useEffect } from "react";

export default function CategoryPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const meta = params.slug ? categoryBySlug(params.slug) : undefined;
  // Visiting any category page = "Lore-pilled" achievement.
  const unlockAchievement = useAchievementsStore((s) => s.unlock);
  useEffect(() => {
    if (meta) void unlockAchievement("lore_pilled");
  }, [meta, unlockAchievement]);

  if (!meta) {
    return (
      <Screen>
        <SeoHead
          title="Category not found"
          description="That category doesn't exist. Try one of the eight categories on the home page."
          path={`/category/${params.slug ?? ""}`}
          noindex
        />
        <View className="flex-1 justify-center items-center">
          <Text className="font-display text-paper text-2xl">no such category</Text>
          <View className="mt-6">
            <Button label="← back to home" onPress={() => router.replace("/")} />
          </View>
        </View>
      </Screen>
    );
  }

  const categoryQuestions = questions.filter((q) => q.category === meta.key);

  return (
    <Screen>
      <SeoHead
        title={`${meta.name} Quiz`}
        description={meta.blurb}
        path={`/category/${meta.slug}`}
      />
      <EmojiSplat seed={meta.slug.length * 31 + 7} count={6} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row items-center justify-between pt-6">
          <Link href="/" asChild>
            <Pressable>
              <Text className="font-mono text-muted text-xs">← playbrainrot.app</Text>
            </Pressable>
          </Link>
          <Text className="font-mono text-cyan text-xs">{categoryQuestions.length} questions</Text>
        </View>

        {/* Italian-brainrot category gets the cast-composite hero image
            (Public Domain, Wikimedia Commons). Other categories use just
            the emoji + name. */}
        {meta.slug === "italian-brainrot" ? (
          <View className="mt-4">
            <Sticker tilt={-1.5} shadow={5} shadowColor="#FF3EA5">
              <View className="rounded-2xl overflow-hidden border-4 border-paper">
                <Image
                  source={ALL_CHARACTERS_IMAGE}
                  style={{ width: "100%", aspectRatio: 16 / 9 }}
                  resizeMode="cover"
                />
              </View>
            </Sticker>
          </View>
        ) : null}

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <View className="mt-4">
          <Text className="text-5xl mb-2">{meta.emoji}</Text>
          <Sticker tilt={-1} shadow={5} shadowColor="#FF3EA5">
            <Text className="font-display text-lime text-4xl leading-tight">
              {meta.name}
            </Text>
          </Sticker>
          <Text className="font-display text-paper text-xl mt-3">
            Quiz · {categoryQuestions.length} questions · daily-rotation pool
          </Text>
        </View>

        {/* ── Intro paragraph (citation-friendly) ──────────────────────── */}
        <View className="mt-6">
          <Sticker tilt={-0.5} shadow={3} shadowColor="#1A0F2E">
            <View className="bg-ink rounded-2xl border-2 border-muted p-4">
              <Text className="font-body text-paper text-base leading-relaxed">{meta.intro}</Text>
            </View>
          </Sticker>
        </View>

        {/* ── CTAs ─────────────────────────────────────────────────────── */}
        <View className="gap-3 mt-6">
          <Button
            label="play today's daily"
            emoji="🔥"
            tilt={-1}
            onPress={() => router.push("/play")}
            full
          />
          <Button
            label="unlimited mode with these questions"
            emoji="🎯"
            variant="secondary"
            onPress={() => router.push("/play?practice=1")}
            full
          />
        </View>

        {/* ── Sources ──────────────────────────────────────────────────── */}
        {meta.sources.length > 0 ? (
          <View className="mt-8">
            <Text className="font-mono text-muted text-xs uppercase tracking-widest">
              Sources
            </Text>
            <View className="gap-2 mt-2">
              {meta.sources.map((s) => (
                <Pressable
                  key={s.url}
                  onPress={() => void Linking.openURL(s.url)}
                  accessibilityRole="link"
                >
                  <Text className="font-mono text-cyan text-xs underline">
                    {s.label} ↗
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── Question list ────────────────────────────────────────────── */}
        <View className="mt-8">
          <Text className="font-display text-paper text-2xl">all questions</Text>
          <Text className="font-body text-muted text-sm mt-1">
            answers revealed for studying. play the daily for the timed version.
          </Text>
          <View className="gap-3 mt-3">
            {categoryQuestions.map((q, i) => {
              const correct = q.options.find((o) => o.id === q.correct_answer);
              const tilt = i % 2 === 0 ? -0.5 : 0.5;
              return (
                <Sticker key={q.id} tilt={tilt} shadow={3} shadowColor="#1A0F2E">
                  <View className="bg-ink rounded-2xl border-2 border-muted p-4">
                    <View className="flex-row items-center gap-2 mb-2">
                      <Text className="font-mono text-muted text-xs">
                        Q{(i + 1).toString().padStart(2, "0")}
                      </Text>
                      <View className="bg-bg rounded-md px-2 py-0.5 border border-muted">
                        <Text className="font-mono text-hot text-xs uppercase">
                          {q.difficulty}
                        </Text>
                      </View>
                    </View>
                    <Text className="font-display text-paper text-base">{q.question}</Text>
                    <View className="gap-1 mt-3">
                      {q.options.map((opt) => {
                        const isCorrect = opt.id === q.correct_answer;
                        return (
                          <View
                            key={opt.id}
                            className={`flex-row items-center gap-2 rounded-md px-2 py-1 ${
                              isCorrect ? "bg-lime" : "bg-bg"
                            }`}
                          >
                            <Text
                              className={`font-display text-sm ${
                                isCorrect ? "text-ink" : "text-paper"
                              }`}
                            >
                              {opt.id}.
                            </Text>
                            <Text
                              className={`font-body text-sm flex-1 ${
                                isCorrect ? "text-ink" : "text-paper"
                              }`}
                            >
                              {opt.text}
                            </Text>
                            {isCorrect ? (
                              <Text className="text-base">✅</Text>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                    {q.source ? (
                      <Pressable onPress={() => void Linking.openURL(q.source!)} accessibilityRole="link" className="mt-3">
                        <Text className="font-mono text-muted text-xs underline">source ↗</Text>
                      </Pressable>
                    ) : null}
                    {correct ? (
                      <Text className="sr-only" accessibilityLabel={`Correct answer: ${correct.text}`} />
                    ) : null}
                  </View>
                </Sticker>
              );
            })}
          </View>
        </View>

        {/* ── Footer CTA ───────────────────────────────────────────────── */}
        <View className="mt-10 gap-3 items-center">
          <Text className="font-body text-muted text-sm">
            think you've got the lore down?
          </Text>
          <Button
            label="play today's daily"
            emoji="🔥"
            tilt={-1}
            onPress={() => router.push("/play")}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
