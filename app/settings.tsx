import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { EmojiSplat } from "@/components/EmojiSplat";
import { SeoHead } from "@/components/SeoHead";
import { setLocale, SUPPORTED_LOCALES, useLocale, type Locale } from "@/lib/i18n";
import {
  useSettingsStore,
  QUESTIONS_OPTIONS,
  SECONDS_OPTIONS,
  DIFFICULTY_OPTIONS,
  type DifficultyPreset,
} from "@/features/settings/store";

const DIFFICULTY_LABEL: Record<DifficultyPreset, { name: string; line: string; emoji: string }> = {
  chill: { name: "chill", line: "mostly easy. vibes only.", emoji: "😌" },
  mixed: { name: "mixed", line: "the daily's default mix.", emoji: "✨" },
  spicy: { name: "spicy", line: "mostly hard. prove the lore.", emoji: "🔥" },
};

function OptionRow<T extends string | number | boolean>({
  options,
  value,
  onPick,
  format,
}: {
  options: readonly T[];
  value: T;
  onPick: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <View className="flex-row gap-2 mt-3">
      {options.map((opt, i) => {
        const active = opt === value;
        const tilt = i % 2 === 0 ? -0.5 : 0.5;
        return (
          <Sticker
            key={String(opt)}
            tilt={active ? tilt : 0}
            shadow={active ? 4 : 2}
            shadowColor={active ? "#A8FF3E" : "#1A0F2E"}
            style={{ flex: 1 }}
          >
            <Pressable
              onPress={() => onPick(opt)}
              className={`rounded-xl px-3 py-3 border-2 items-center ${
                active ? "bg-lime border-ink" : "bg-ink border-muted"
              }`}
            >
              <Text
                className={`font-display text-base ${active ? "text-ink" : "text-paper"}`}
              >
                {format ? format(opt) : String(opt)}
              </Text>
            </Pressable>
          </Sticker>
        );
      })}
    </View>
  );
}

export default function Settings() {
  const router = useRouter();
  const hydrated = useSettingsStore((s) => s.hydrated);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const questionsPerRound = useSettingsStore((s) => s.questionsPerRound);
  const secondsPerQuestion = useSettingsStore((s) => s.secondsPerQuestion);
  const difficulty = useSettingsStore((s) => s.difficulty);
  const soundsEnabled = useSettingsStore((s) => s.soundsEnabled);
  const update = useSettingsStore((s) => s.update);
  const reset = useSettingsStore((s) => s.reset);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  return (
    <Screen>
      <SeoHead title="Game settings" path="/settings" noindex />
      <EmojiSplat seed={777} count={6} />

      <View className="flex-row justify-between items-center pt-6">
        <Sticker tilt={-2} shadow={4} shadowColor="#FF3EA5">
          <View className="bg-ink rounded-xl px-3 py-2 border-2 border-hot">
            <Text className="font-display text-hot text-xl">settings.cfg</Text>
          </View>
        </Sticker>
        <Button label="← back" variant="ghost" onPress={() => router.back()} />
      </View>

      <ScrollView className="flex-1 mt-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="font-body text-muted text-xs italic mb-3">
          settings apply to unlimited mode. the daily + friend rooms use the
          canonical 5 questions / 30s mix so everyone gets the same game.
        </Text>

        <Sticker tilt={-1} shadow={4} shadowColor="#A8FF3E">
          <View className="bg-ink rounded-2xl border-4 border-lime p-4">
            <Text className="font-display text-paper text-lg">questions per round</Text>
            <Text className="font-body text-muted text-xs">how many you face per unlimited run.</Text>
            <OptionRow
              options={QUESTIONS_OPTIONS}
              value={questionsPerRound}
              onPick={(v) => void update({ questionsPerRound: v })}
            />
          </View>
        </Sticker>

        <View className="mt-4">
          <Sticker tilt={1} shadow={4} shadowColor="#3EFFE9">
            <View className="bg-ink rounded-2xl border-4 border-cyan p-4">
              <Text className="font-display text-paper text-lg">seconds per question</Text>
              <Text className="font-body text-muted text-xs">how long you have to lock in.</Text>
              <OptionRow
                options={SECONDS_OPTIONS}
                value={secondsPerQuestion}
                onPick={(v) => void update({ secondsPerQuestion: v })}
                format={(v) => `${v}s`}
              />
            </View>
          </Sticker>
        </View>

        <View className="mt-4">
          <Sticker tilt={-0.5} shadow={4} shadowColor="#FF3EA5">
            <View className="bg-ink rounded-2xl border-4 border-hot p-4">
              <Text className="font-display text-paper text-lg">difficulty</Text>
              <Text className="font-body text-muted text-xs">
                {DIFFICULTY_LABEL[difficulty].line}
              </Text>
              <OptionRow
                options={DIFFICULTY_OPTIONS}
                value={difficulty}
                onPick={(v) => void update({ difficulty: v })}
                format={(v) => `${DIFFICULTY_LABEL[v].emoji} ${DIFFICULTY_LABEL[v].name}`}
              />
            </View>
          </Sticker>
        </View>

        {/* Sounds — applies globally (taps, reveals, finale, achievement
            unlocks). Off by default for people who hate snappy chiptune. */}
        <View className="mt-4">
          <Sticker tilt={0.5} shadow={4} shadowColor="#A8FF3E">
            <View className="bg-ink rounded-2xl border-4 border-lime p-4">
              <Text className="font-display text-paper text-lg">sounds</Text>
              <Text className="font-body text-muted text-xs">
                snappy synth chimes on every tap, reveal, and unlock. (web only
                for now — native sounds in a later drop.)
              </Text>
              <OptionRow
                options={[true, false]}
                value={soundsEnabled}
                onPick={(v) => void update({ soundsEnabled: v })}
                format={(v) => (v ? "🔊 on" : "🔇 off")}
              />
            </View>
          </Sticker>
        </View>

        {/* Language — brainrot is literally Italian, so we ship in it. */}
        <LocaleRow />
      </ScrollView>

      <View className="pb-6 gap-2">
        <Button
          label="try unlimited round ♾️"
          onPress={() => router.push("/play?practice=1")}
          full
        />
        <Button
          label="reset to defaults"
          variant="ghost"
          onPress={() => void reset()}
          full
        />
      </View>
    </Screen>
  );
}

// Language picker row — rendered inside the settings ScrollView.
function LocaleRow() {
  const locale = useLocale();
  return (
    <View className="mt-4">
      <Sticker tilt={-0.5} shadow={4} shadowColor="#3EFFE9">
        <View className="bg-ink rounded-2xl border-4 border-cyan p-4">
          <Text className="font-display text-paper text-lg">language · lingua</Text>
          <Text className="font-body text-muted text-xs">
            UI strings only. Questions stay in English (the brainrot proper
            nouns are Italian anyway).
          </Text>
          <View className="flex-row gap-2 mt-3">
            {SUPPORTED_LOCALES.map((l, i) => {
              const active = locale === l.code;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => setLocale(l.code as Locale)}
                  accessibilityRole="button"
                  className="flex-1"
                >
                  <Sticker
                    tilt={active ? (i % 2 === 0 ? -0.5 : 0.5) : 0}
                    shadow={active ? 4 : 2}
                    shadowColor={active ? "#A8FF3E" : "#1A0F2E"}
                  >
                    <View
                      className={`rounded-xl px-3 py-3 border-2 items-center ${
                        active ? "bg-lime border-ink" : "bg-ink border-muted"
                      }`}
                    >
                      <Text
                        className={`font-display text-base ${
                          active ? "text-ink" : "text-paper"
                        }`}
                      >
                        {l.flag} {l.name}
                      </Text>
                    </View>
                  </Sticker>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Sticker>
    </View>
  );
}
