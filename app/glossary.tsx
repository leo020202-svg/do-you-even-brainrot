// /glossary — searchable reference of slang + character + creator terms.
//
// SEO play: this is the "what does X mean" landing page. Each entry is a
// short citation-friendly definition with an authoritative source link.
// AI crawlers (ChatGPT, Claude, Perplexity) cite this kind of structured
// reference content per docs/STRATEGY.md §7.4.

import { useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { EmojiSplat } from "@/components/EmojiSplat";
import { SeoHead } from "@/components/SeoHead";
import { Heading } from "@/components/Heading";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  GLOSSARY,
  type GlossaryCategory,
} from "@/lib/glossary";

const CATEGORY_ORDER: GlossaryCategory[] = [
  "slang",
  "italian-brainrot",
  "skibidi",
  "viral",
  "creators",
  "lore",
];

export default function GlossaryPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<GlossaryCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((e) => {
      if (activeCat !== "all" && e.category !== activeCat) return false;
      if (!q) return true;
      return (
        e.term.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q) ||
        (e.example ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, activeCat]);

  return (
    <Screen>
      <SeoHead
        title="Brainrot Glossary"
        description="Plain-language dictionary of Gen Alpha slang, Italian Brainrot characters, Skibidi Toilet lore, and viral 2024-2026 moments. With sources."
        path="/glossary"
      />
      <EmojiSplat seed={1771} count={7} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="pt-6 flex-row items-center justify-between">
          <Link href="/" asChild>
            <Pressable accessibilityRole="link">
              <Text className="font-mono text-muted text-xs">← playbrainrot.app</Text>
            </Pressable>
          </Link>
          <Text className="font-mono text-cyan text-xs">{GLOSSARY.length} entries</Text>
        </View>

        <View className="mt-4">
          <Heading level={1} accessibilityLabel="Brainrot Glossary">
            <Sticker tilt={-1} shadow={5} shadowColor="#FF3EA5">
              <Text className="font-display text-lime text-4xl leading-tight">
                Brainrot Glossary
              </Text>
            </Sticker>
          </Heading>
          <Text className="font-body text-paper text-base mt-3">
            Plain-language dictionary of the slang, characters, and lore behind
            today's brainrot. Each entry has a source — no guesses, no fan-canon.
          </Text>
        </View>

        {/* Search */}
        <View className="mt-5">
          <Sticker tilt={-0.5} shadow={3} shadowColor="#3EFFE9">
            <View className="bg-ink rounded-2xl border-2 border-cyan p-3">
              <Text className="font-mono text-muted text-xs">SEARCH</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="rizz, skibidi, hawk tuah..."
                placeholderTextColor="#7A6B99"
                autoCorrect={false}
                className="bg-bg rounded-xl border-2 border-muted px-3 py-2 mt-2 font-mono text-paper text-base"
              />
            </View>
          </Sticker>
        </View>

        {/* Category filter chips */}
        <View className="flex-row flex-wrap gap-2 mt-3">
          {(["all", ...CATEGORY_ORDER] as const).map((c, i) => {
            const active = c === activeCat;
            return (
              <Pressable
                key={c}
                onPress={() => setActiveCat(c)}
                accessibilityRole="button"
              >
                <Sticker
                  tilt={active ? (i % 2 === 0 ? -0.5 : 0.5) : 0}
                  shadow={active ? 3 : 2}
                  shadowColor={active ? "#A8FF3E" : "#1A0F2E"}
                >
                  <View
                    className={`rounded-full px-3 py-1 border-2 ${
                      active ? "bg-lime border-ink" : "bg-ink border-muted"
                    }`}
                  >
                    <Text
                      className={`font-mono text-xs ${
                        active ? "text-ink" : "text-paper"
                      }`}
                    >
                      {c === "all"
                        ? "All"
                        : `${CATEGORY_EMOJI[c]} ${CATEGORY_LABEL[c]}`}
                    </Text>
                  </View>
                </Sticker>
              </Pressable>
            );
          })}
        </View>

        {/* Entries — grouped headers when no filter / search */}
        {filtered.length === 0 ? (
          <View className="mt-8">
            <Text className="font-body text-muted text-base">
              no matches. try a different term.
            </Text>
          </View>
        ) : (
          <View className="mt-6 gap-3">
            {filtered.map((e, i) => (
              <View key={e.slug} nativeID={e.slug}>
                <Sticker tilt={i % 2 === 0 ? -0.5 : 0.5} shadow={3} shadowColor="#1A0F2E">
                  <View className="bg-ink rounded-2xl border-2 border-muted p-4">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xl">{CATEGORY_EMOJI[e.category]}</Text>
                      <Text className="font-display text-paper text-xl">{e.term}</Text>
                      <View className="bg-bg rounded-md px-2 py-0.5 border border-muted">
                        <Text className="font-mono text-muted text-xs uppercase">
                          {CATEGORY_LABEL[e.category]}
                        </Text>
                      </View>
                    </View>
                    <Text className="font-body text-paper text-sm mt-2 leading-relaxed">
                      {e.definition}
                    </Text>
                    {e.example ? (
                      <Text className="font-body text-muted text-sm mt-2 italic">
                        e.g. "{e.example}"
                      </Text>
                    ) : null}
                    {e.source ? (
                      <Pressable
                        onPress={() => void Linking.openURL(e.source!.url)}
                        accessibilityRole="link"
                        className="mt-2"
                      >
                        <Text className="font-mono text-cyan text-xs underline">
                          {e.source.label} ↗
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </Sticker>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <View className="mt-10 gap-3 items-center">
          <Text className="font-body text-paper text-base text-center">
            now go test what you actually know.
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
