import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { categoryImage } from "@/lib/category-images";
import creditsData from "../data/category-images-credits.json";

const HEAD_TITLE = "Image credits";
const HEAD_DESC = "Attribution for the CC-licensed category banner images, all from Wikimedia Commons.";

type Credit = {
  title: string;
  descurl: string;
  user: string | null;
  license: string | null;
  source: string;
};

const credits = creditsData as Record<string, Credit>;

// Strip HTML tags out of the API-supplied attribution strings (we get e.g.
// `<a href="...">Frettie</a>` — we just want "Frettie" for the credit line).
function clean(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

export default function Credits() {
  const router = useRouter();
  return (
    <Screen>
      <SeoHead title={HEAD_TITLE} description={HEAD_DESC} path="/credits" />
      <View className="flex-row justify-between items-center pt-6">
        <Sticker tilt={-2} shadow={4} shadowColor="#3EFFE9">
          <View className="bg-ink rounded-xl px-3 py-2 border-2 border-cyan">
            <Text className="font-display text-cyan text-xl">credits.txt</Text>
          </View>
        </Sticker>
        <Button label="← back" variant="ghost" onPress={() => router.back()} />
      </View>

      <Text className="font-body text-paper text-base mt-4">
        Category artwork is licensed from Wikimedia Commons under CC-BY,
        CC-BY-SA, or public domain.
      </Text>

      <ScrollView className="flex-1 mt-3" contentContainerStyle={{ paddingBottom: 24 }}>
        {Object.entries(credits).map(([category, c], i) => {
          const tilt = i % 2 === 0 ? -1 : 1;
          const img = categoryImage(category);
          return (
            <View key={category} className="mb-4">
              <Sticker tilt={tilt} shadow={3} shadowColor="#FF3EA5">
                <View className="bg-ink rounded-2xl border-2 border-muted overflow-hidden">
                  {img ? (
                    <Image source={img} style={{ width: "100%", height: 100 }} resizeMode="cover" />
                  ) : null}
                  <View className="p-3">
                    <Text className="font-display text-paper text-base">
                      {category.replace(/_/g, " ")}
                    </Text>
                    <Text className="font-body text-muted text-xs mt-1">
                      {clean(c.title.replace(/^File:/, ""))}
                    </Text>
                    <Text className="font-body text-paper text-xs mt-1">
                      by{" "}
                      <Text className="text-lime">{clean(c.user) || "unknown"}</Text> ·{" "}
                      <Text className="text-cyan">{c.license || "—"}</Text>
                    </Text>
                    <Pressable
                      onPress={() => {
                        void Linking.openURL(c.descurl);
                      }}
                      className="mt-2"
                    >
                      <Text className="font-mono text-hot text-xs underline">
                        view on commons →
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Sticker>
            </View>
          );
        })}

        <Sticker tilt={-1} shadow={2} shadowColor="#1A0F2E">
          <View className="bg-ink rounded-2xl border-2 border-muted p-4 mt-2">
            <Text className="font-display text-paper text-base">questions</Text>
            <Text className="font-body text-muted text-xs mt-1">
              hand-curated, sourced from the brainrot wiki + Know Your Meme.
              See <Text className="text-cyan">data/questions.json</Text>.
            </Text>
          </View>
        </Sticker>
      </ScrollView>
    </Screen>
  );
}
