// Marketing landing — first-time visitor entry. Returning players auto-bounce
// to /home so the daily flow stays one tap away. The full strategy + layout
// rationale is in docs/STRATEGY.md §5.

import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Link, Redirect, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { EmojiSplat } from "@/components/EmojiSplat";
import { SeoHead } from "@/components/SeoHead";
import { useDailyStore } from "@/features/daily/store";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/room";
import { useMidnightCountdown } from "@/lib/countdown";
import { getDailyChallenge } from "@/lib/daily";
import { questionsById } from "@/lib/questions";
import { SampleQuestion } from "@/components/SampleQuestion";

// Sample question shown on the landing. q001 (Tralalero Tralala) is iconic
// enough that it gives a cold visitor an immediate sense of the content
// without spoiling anything they'd reasonably encounter as a daily later.
const SAMPLE_Q_ID = "q001";

const MODES: Array<{ emoji: string; title: string; line: string; href: string; color: string }> = [
  {
    emoji: "🔥",
    title: "Daily Challenge",
    line: "one shot per day. 5 questions. build a streak. lose it overnight.",
    href: "/play",
    color: "#A8FF3E",
  },
  {
    emoji: "👯",
    title: "Friend Rooms (async)",
    line: "share a 6-char code. everyone gets the same 5 questions. play whenever.",
    href: "/friends",
    color: "#FF3EA5",
  },
  {
    emoji: "⚡",
    title: "Friend Rooms (synced)",
    line: "Kahoot-style countdown. everyone plays at once. shared reveals. discord-call ready.",
    href: "/friends",
    color: "#3EFFE9",
  },
  {
    emoji: "♾️",
    title: "Unlimited Mode",
    line: "play as many rounds as you want. doesn't touch your streak. configure question count + timer in settings.",
    href: "/play?practice=1",
    color: "#FF5C3E",
  },
];

const CATEGORIES: Array<{ slug: string; emoji: string; name: string }> = [
  { slug: "italian-brainrot", emoji: "🍝", name: "Italian Brainrot" },
  { slug: "skibidi", emoji: "🚽", name: "Skibidi Lore" },
  { slug: "gen-alpha-slang", emoji: "💀", name: "Gen Alpha Slang" },
  { slug: "viral-moments", emoji: "📱", name: "Viral Moments" },
  { slug: "creators", emoji: "🎬", name: "Creators" },
  { slug: "cross-platform", emoji: "🌐", name: "Cross-Platform" },
  { slug: "deep-cuts", emoji: "🕳️", name: "Deep Cuts" },
  { slug: "absurdity", emoji: "🤡", name: "Absurdity" },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "is this free?",
    a: "yes. daily challenges and friend rooms are free forever. Phase 1 will add an optional $2.99 unlock for extra question packs.",
  },
  {
    q: "do i need to sign up?",
    a: "nope. just open it. your streak saves on your device. cross-device sync ships when we wire Supabase auth (Phase 0 close-out).",
  },
  {
    q: "how do i play with friends?",
    a: "tap 'play with friends' → generate a 6-char code → send the link. everyone on the link gets the same 5 questions.",
  },
  {
    q: "what's brainrot anyway?",
    a: "internet-native humor that's deliberately incoherent. AI-generated Italian creatures, Skibidi Toilet, Gen Alpha slang, TikTok comment-section lore. if you're not chronically online it sounds like noise. that's the joke.",
  },
  {
    q: "who picks the questions?",
    a: "humans. 200 hand-curated questions sourced from Italian Brainrot Wiki, Know Your Meme, and TikTok comment sections. weekly drops add ~25 more.",
  },
];

export default function Landing() {
  const router = useRouter();
  const hydrated = useDailyStore((s) => s.hydrated);
  const hasHistory = useDailyStore((s) => Object.keys(s.results).length > 0);
  const streak = useDailyStore((s) => s.currentStreak);

  // Returning players (anyone with at least one completed daily) auto-bounce
  // to /home so the daily CTA is one tap away. First-time visitors stay here.
  // Using <Redirect> instead of router.replace() so the navigation is queued
  // against the router's "ready" lifecycle — imperative navigation in a
  // useEffect races the Root Layout's font-load gate and throws
  // "Attempted to navigate before mounting the Root Layout".
  if (hydrated && hasHistory) {
    return <Redirect href="/home" />;
  }

  // Inline room-code input. Kahoot.it's whole joiner flow is one box; we
  // shouldn't make players click through to /friends just to type a code
  // they were given. See docs/COMPETITOR_LANDING_AUDIT.md.
  const [roomInput, setRoomInput] = useState("");
  const [roomError, setRoomError] = useState<string | null>(null);
  function onJoinRoom() {
    const code = normalizeRoomCode(roomInput);
    if (!isValidRoomCode(code)) {
      setRoomError("codes are 6 chars · letters + numbers");
      return;
    }
    setRoomError(null);
    router.push(`/play?room=${code}`);
  }

  const dailyPlayerCount = useMemo(() => "pre-launch · join the first wave", []);
  const challenge = useMemo(() => getDailyChallenge(), []);
  const sampleQuestion = useMemo(() => questionsById[SAMPLE_Q_ID], []);
  const countdown = useMidnightCountdown();

  return (
    <Screen>
      <SeoHead
        title="Do You Even Brainrot?"
        description="The daily brainrot trivia game. 5 questions about Italian brainrot, Skibidi lore, Gen Alpha slang, and TikTok culture. Free, no signup, share with friends."
        path="/"
      />
      <EmojiSplat seed={3001} count={11} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Prominent daily chip — clickable, headline-treatment. Replaces the
            tiny tag this used to be; per docs/COMPETITOR_LANDING_AUDIT.md,
            Wordle leads with the daily and we should too. */}
        <View className="pt-5">
          <Pressable onPress={() => router.push("/play")}>
            <Sticker tilt={-1.5} shadow={4} shadowColor="#A8FF3E">
              <View className="bg-lime rounded-2xl border-4 border-ink px-4 py-3 flex-row items-center justify-between">
                <View>
                  <Text className="font-mono text-ink text-xs uppercase tracking-widest">
                    🔥 today&apos;s daily
                  </Text>
                  <Text className="font-display text-ink text-2xl">#{challenge.index}</Text>
                </View>
                <View className="items-end">
                  <Text className="font-mono text-ink text-xs">next drops in</Text>
                  <Text className="font-display text-ink text-base">{countdown}</Text>
                </View>
              </View>
            </Sticker>
          </Pressable>
        </View>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <View className="pt-6">
          <Sticker tilt={-2} shadow={5} shadowColor="#3EFFE9">
            <Text className="font-display text-lime text-5xl leading-none">DO YOU</Text>
          </Sticker>
          <View className="self-end mt-1">
            <Sticker tilt={3} shadow={5} shadowColor="#FF3EA5">
              <Text className="font-display text-cyan text-5xl leading-none">EVEN</Text>
            </Sticker>
          </View>
          <View className="mt-1">
            <Sticker tilt={-1} shadow={5} shadowColor="#FF5C3E">
              <Text className="font-display text-hot text-5xl leading-none">BRAINROT?</Text>
            </Sticker>
          </View>

          <Text className="font-body text-paper text-base mt-5">
            the daily trivia game about Italian brainrot, Skibidi lore, Gen
            Alpha slang, and TikTok culture. 5 questions. 30 seconds each.
            <Text className="font-display text-lime"> how cooked are you?</Text>
          </Text>

          <View className="gap-3 mt-6">
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

          {/* Inline room-code join — the single biggest conversion win per
              docs/COMPETITOR_LANDING_AUDIT.md §"what to fix". Friend gives
              you the code, you paste it here, no click-through to /friends. */}
          <View className="mt-5">
            <Sticker tilt={-0.5} shadow={3} shadowColor="#3EFFE9">
              <View className="bg-ink rounded-2xl border-2 border-cyan p-3">
                <Text className="font-mono text-muted text-xs mb-2">
                  got a friend&apos;s room code?
                </Text>
                <View className="flex-row gap-2">
                  <TextInput
                    value={roomInput}
                    onChangeText={(t) => {
                      setRoomInput(normalizeRoomCode(t));
                      setRoomError(null);
                    }}
                    placeholder="RIZZ42"
                    placeholderTextColor="#7A6B99"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={6}
                    onSubmitEditing={onJoinRoom}
                    className="bg-bg rounded-xl border-2 border-muted px-3 py-2 flex-1 font-mono text-paper text-xl tracking-widest text-center"
                    style={{ letterSpacing: 6 }}
                  />
                  <Pressable
                    onPress={onJoinRoom}
                    className="bg-cyan rounded-xl border-2 border-ink px-4 py-2 items-center justify-center active:opacity-80"
                  >
                    <Text className="font-display text-ink text-base">join 🚪</Text>
                  </Pressable>
                </View>
                {roomError ? (
                  <Text className="font-body text-blood text-xs mt-2">{roomError}</Text>
                ) : null}
              </View>
            </Sticker>
          </View>

          {/* Trust strip — Kahoot's "No credit card needed" equivalent. */}
          <View className="flex-row flex-wrap gap-2 mt-5">
            {[
              "no signup",
              "no install",
              "free forever",
              streak > 0 ? `🔥 ${streak}` : "200 hand-curated qs",
            ].map((label, i) => (
              <Sticker key={label} tilt={i % 2 === 0 ? -0.5 : 0.5} shadow={2} shadowColor="#1A0F2E">
                <View className="bg-ink rounded-full border border-muted px-3 py-1">
                  <Text className="font-mono text-paper text-xs">{label}</Text>
                </View>
              </Sticker>
            ))}
          </View>

          <Text className="font-mono text-muted text-xs mt-3 italic">
            {dailyPlayerCount}
          </Text>
        </View>

        {/* ── Sample question (tap-to-peek) ────────────────────────────── */}
        {sampleQuestion ? (
          <View className="mt-10">
            <Text className="font-display text-paper text-2xl">taste the content</Text>
            <Text className="font-body text-muted text-sm mt-1 mb-3">
              not a real round — no streak, no timer. just so you see what
              you&apos;re signing up for.
            </Text>
            <SampleQuestion question={sampleQuestion} />
          </View>
        ) : null}

        {/* ── How it works ─────────────────────────────────────────────── */}
        <View className="mt-10">
          <Text className="font-display text-paper text-2xl">how it works</Text>
          <View className="gap-3 mt-3">
            {[
              { n: "01", t: "open it.", l: "no signup, no download. 30 seconds and you're in." },
              { n: "02", t: "5 questions a day.", l: "italian brainrot, skibidi lore, slang, viral moments. mixed difficulty." },
              { n: "03", t: "don't lose your streak.", l: "share your score card, drag your friends in, climb." },
            ].map((s, i) => (
              <Sticker key={s.n} tilt={i % 2 === 0 ? -0.5 : 0.5} shadow={3} shadowColor="#1A0F2E">
                <View className="bg-ink rounded-2xl border-2 border-muted p-4 flex-row gap-3">
                  <Text className="font-display text-lime text-2xl">{s.n}</Text>
                  <View className="flex-1">
                    <Text className="font-display text-paper text-lg">{s.t}</Text>
                    <Text className="font-body text-muted text-sm mt-1">{s.l}</Text>
                  </View>
                </View>
              </Sticker>
            ))}
          </View>
        </View>

        {/* ── Modes ────────────────────────────────────────────────────── */}
        <View className="mt-10">
          <Text className="font-display text-paper text-2xl">three modes</Text>
          <View className="gap-3 mt-3">
            {MODES.map((m, i) => (
              <Link key={m.title} href={m.href as never} asChild>
                <Pressable>
                  <Sticker tilt={i % 2 === 0 ? -1 : 1} shadow={4} shadowColor={m.color}>
                    <View className="bg-ink rounded-2xl border-4 p-4 flex-row items-center gap-3"
                          style={{ borderColor: m.color }}>
                      <Text className="text-4xl">{m.emoji}</Text>
                      <View className="flex-1">
                        <Text className="font-display text-paper text-lg">{m.title}</Text>
                        <Text className="font-body text-muted text-sm mt-1">{m.line}</Text>
                      </View>
                      <Text className="font-display text-paper text-xl">→</Text>
                    </View>
                  </Sticker>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>

        {/* ── Categories preview (SEO + browsing) ──────────────────────── */}
        <View className="mt-10">
          <Text className="font-display text-paper text-2xl">categories</Text>
          <Text className="font-body text-muted text-sm mt-1">8 categories, 200 hand-curated questions, weekly drops.</Text>
          <View className="flex-row flex-wrap gap-2 mt-3">
            {CATEGORIES.map((c, i) => (
              <Link key={c.slug} href={`/category/${c.slug}` as never} asChild>
                <Pressable>
                  <Sticker tilt={i % 2 === 0 ? -1 : 1} shadow={2} shadowColor="#1A0F2E">
                    <View className="bg-ink rounded-xl border-2 border-muted px-3 py-2 flex-row items-center gap-2">
                      <Text className="text-lg">{c.emoji}</Text>
                      <Text className="font-display text-paper text-sm">{c.name}</Text>
                    </View>
                  </Sticker>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <View className="mt-10">
          <Text className="font-display text-paper text-2xl">faq</Text>
          <View className="gap-3 mt-3">
            {FAQ.map((f, i) => (
              <Sticker key={f.q} tilt={i % 2 === 0 ? -0.5 : 0.5} shadow={2} shadowColor="#1A0F2E">
                <View className="bg-ink rounded-2xl border-2 border-muted p-4">
                  <Text className="font-display text-lime text-base">{f.q}</Text>
                  <Text className="font-body text-paper text-sm mt-1">{f.a}</Text>
                </View>
              </Sticker>
            ))}
          </View>
        </View>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <View className="mt-10 pb-2 border-t border-ink pt-4">
          <View className="flex-row justify-between flex-wrap gap-2">
            <Link href="/credits" asChild>
              <Pressable>
                <Text className="font-mono text-muted text-xs underline">image credits</Text>
              </Pressable>
            </Link>
            <Link href="/friends" asChild>
              <Pressable>
                <Text className="font-mono text-muted text-xs underline">play with friends</Text>
              </Pressable>
            </Link>
            <Link href="/profile" asChild>
              <Pressable>
                <Text className="font-mono text-muted text-xs underline">profile</Text>
              </Pressable>
            </Link>
          </View>
          <Text className="font-mono text-muted text-xs mt-3">
            made by humans · v0.1 · phase 0 · playbrainrot.app
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
