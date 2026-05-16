import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { EmojiSplat } from "@/components/EmojiSplat";
import { SeoHead } from "@/components/SeoHead";

export default function About() {
  const router = useRouter();
  return (
    <Screen>
      <SeoHead
        title="About"
        description="Do You Even Brainrot? is a daily trivia game about brainrot meme culture. Free, no signup, share with friends. Built by humans, not AI."
        path="/about"
      />
      <EmojiSplat seed={555} count={6} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="flex-row justify-between items-center pt-6">
          <Sticker tilt={-2} shadow={4} shadowColor="#FF3EA5">
            <View className="bg-ink rounded-xl px-3 py-2 border-2 border-hot">
              <Text className="font-display text-hot text-xl">about.txt</Text>
            </View>
          </Sticker>
          <Button label="← back" variant="ghost" onPress={() => router.back()} />
        </View>

        <View className="mt-6 gap-4">
          <Text className="font-display text-paper text-3xl leading-tight">
            the daily brainrot trivia game.
          </Text>
          <Text className="font-body text-paper text-base leading-relaxed">
            <Text className="font-display text-lime">Do You Even Brainrot?</Text>{" "}
            is a free web and mobile trivia game about Italian brainrot,
            Skibidi Toilet lore, Gen Alpha slang, viral moments, and TikTok
            culture. Five questions a day, 30 seconds each, build a streak,
            share your score with friends.
          </Text>

          <Sticker tilt={-1} shadow={3} shadowColor="#A8FF3E">
            <View className="bg-ink rounded-2xl border-2 border-lime p-4">
              <Text className="font-display text-lime text-lg">200 questions, hand-curated</Text>
              <Text className="font-body text-paper text-sm mt-2">
                Every question is written and checked by humans. We don&apos;t
                auto-generate content. Sources are tracked in the question file
                (data/questions.json) and surfaced on the per-question{" "}
                <Link href="/credits" asChild>
                  <Text className="underline">credits page</Text>
                </Link>{" "}
                for expert-tier questions.
              </Text>
            </View>
          </Sticker>

          <Sticker tilt={1} shadow={3} shadowColor="#3EFFE9">
            <View className="bg-ink rounded-2xl border-2 border-cyan p-4">
              <Text className="font-display text-cyan text-lg">no signup, no install</Text>
              <Text className="font-body text-paper text-sm mt-2">
                Play in your browser. Streak saves on your device. Cross-device
                sync ships when we wire Supabase auth (the last Phase 0 item per{" "}
                <Pressable
                  onPress={() => void Linking.openURL("https://github.com/leo020202-svg/do-you-even-brainrot/blob/main/docs/ROADMAP.md")}
                >
                  <Text className="underline">our roadmap</Text>
                </Pressable>
                ).
              </Text>
            </View>
          </Sticker>

          <Sticker tilt={-0.5} shadow={3} shadowColor="#FF3EA5">
            <View className="bg-ink rounded-2xl border-2 border-hot p-4">
              <Text className="font-display text-hot text-lg">built in the open</Text>
              <Text className="font-body text-paper text-sm mt-2">
                Source on{" "}
                <Pressable onPress={() => void Linking.openURL("https://github.com/leo020202-svg/do-you-even-brainrot")}>
                  <Text className="underline">GitHub</Text>
                </Pressable>
                . Built with Expo + React Native + NativeWind. One codebase
                ships to iOS, Android, and the web.
              </Text>
            </View>
          </Sticker>
        </View>

        <View className="mt-8 gap-3">
          <Button
            label="play today's daily"
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
        </View>

        <View className="mt-8 pb-2 border-t border-ink pt-4">
          <Text className="font-mono text-muted text-xs">
            made by humans · v0.1 · phase 0 · playbrainrot.app
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
