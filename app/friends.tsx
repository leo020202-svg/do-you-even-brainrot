import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { EmojiSplat } from "@/components/EmojiSplat";
import { SeoHead } from "@/components/SeoHead";
import { shareResult } from "@/lib/share";
import {
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
  roomShareUrl,
} from "@/lib/room";

// How far ahead "start synced" schedules the kick-off. Long enough for friends
// to actually open the link + see the countdown, short enough that nobody loses
// interest. 30s feels right on a live call.
const SYNC_LEAD_MS = 30_000;

export default function Friends() {
  const router = useRouter();
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [syncStartTs, setSyncStartTs] = useState<number | null>(null);
  const [joinInput, setJoinInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "shared" | "copied" | "failed">("idle");

  function onCreate() {
    setCreatedCode(generateRoomCode());
    setSyncStartTs(null);
    setCopyState("idle");
  }

  function onSyncStart() {
    if (!createdCode) return;
    const ts = Date.now() + SYNC_LEAD_MS;
    setSyncStartTs(ts);
    setCopyState("idle");
    // Auto-navigate the host into the synced game so they see the same
    // countdown their friends see.
    router.replace(`/play?room=${createdCode}&start=${ts}`);
  }

  function onJoin() {
    const code = normalizeRoomCode(joinInput);
    if (!isValidRoomCode(code)) {
      setJoinError("codes are 6 chars, letters + numbers");
      return;
    }
    setJoinError(null);
    router.push(`/play?room=${code}`);
  }

  async function onShareInvite() {
    if (!createdCode) return;
    const baseUrl = roomShareUrl(createdCode);
    const link = syncStartTs ? `${baseUrl}?start=${syncStartTs}` : baseUrl;
    const heading = syncStartTs
      ? `🧠 brainrot in 30s — join now`
      : `🧠 join my brainrot room`;
    const text = `${heading}\nroom code: ${createdCode}\n${link}`;
    const r = await shareResult(text);
    setCopyState(r);
  }

  const shareLabel =
    copyState === "shared"
      ? "shared ✨"
      : copyState === "copied"
        ? "link copied 📋"
        : copyState === "failed"
          ? "couldn't share, try again"
          : syncStartTs
            ? "send synced invite 📣"
            : "send invite 📣";

  return (
    <Screen>
      <SeoHead
        title="Play with friends"
        description="Spin up a 6-character room code and play the same 5 brainrot trivia questions with friends. Async or synced — no signup needed."
        path="/friends"
      />
      <EmojiSplat seed={888} count={9} />

      <View className="flex-row justify-between items-center pt-6">
        <Sticker tilt={-2} shadow={4} shadowColor="#FF3EA5">
          <View className="bg-ink rounded-xl px-3 py-2 border-2 border-hot">
            <Text className="font-display text-hot text-xl">friends.party</Text>
          </View>
        </Sticker>
        <Button label="← back" variant="ghost" onPress={() => router.back()} />
      </View>

      <View className="mt-8">
        <Sticker tilt={-1} shadow={5} shadowColor="#A8FF3E">
          <View className="bg-ink rounded-3xl border-4 border-lime p-5">
            <Text className="font-mono text-muted text-xs">CREATE A ROOM</Text>
            <Text className="font-body text-paper text-sm mt-1">
              spin up a 6-char code, share the link, choose async (everyone
              plays whenever) or synced (everyone plays at the same time, same
              reveal).
            </Text>
            {createdCode ? (
              <View className="mt-4 gap-3">
                <Sticker tilt={1} shadow={4} shadowColor="#FF3EA5">
                  <View className="bg-lime rounded-2xl border-4 border-ink px-5 py-4 items-center">
                    <Text className="font-mono text-ink text-xs">YOUR CODE</Text>
                    <Text className="font-display text-ink text-5xl mt-1 tracking-widest">
                      {createdCode}
                    </Text>
                  </View>
                </Sticker>
                <Sticker tilt={-0.5} shadow={2} shadowColor="#1A0F2E">
                  <View className="bg-bg rounded-xl border-2 border-muted px-3 py-2">
                    <Text className="font-mono text-muted text-xs">
                      {syncStartTs ? "SYNCED LINK · STARTS IN 30s" : "ASYNC LINK"}
                    </Text>
                    <Text className="font-mono text-cyan text-xs" selectable>
                      {syncStartTs
                        ? `${roomShareUrl(createdCode)}?start=${syncStartTs}`
                        : roomShareUrl(createdCode)}
                    </Text>
                  </View>
                </Sticker>
                <Button label={shareLabel} emoji="📨" onPress={onShareInvite} full />
                {syncStartTs ? null : (
                  <Button
                    label="start synced game (30s)"
                    emoji="⏱️"
                    variant="secondary"
                    tilt={-1}
                    onPress={onSyncStart}
                    full
                  />
                )}
                <Button
                  label={syncStartTs ? "go to countdown 🚀" : "i'll play first"}
                  emoji={syncStartTs ? undefined : "🚀"}
                  variant={syncStartTs ? "primary" : "ghost"}
                  onPress={() =>
                    router.push(
                      syncStartTs
                        ? `/play?room=${createdCode}&start=${syncStartTs}`
                        : `/play?room=${createdCode}`,
                    )
                  }
                  full
                />
              </View>
            ) : (
              <View className="mt-4">
                <Button label="generate code" emoji="🎲" onPress={onCreate} full />
              </View>
            )}
          </View>
        </Sticker>
      </View>

      <View className="mt-5">
        <Sticker tilt={1} shadow={5} shadowColor="#3EFFE9">
          <View className="bg-ink rounded-3xl border-4 border-cyan p-5">
            <Text className="font-mono text-muted text-xs">JOIN A ROOM</Text>
            <Text className="font-body text-paper text-sm mt-1">
              someone sent you a code? paste it here.
            </Text>
            <TextInput
              value={joinInput}
              onChangeText={(t) => {
                setJoinInput(normalizeRoomCode(t));
                setJoinError(null);
              }}
              placeholder="RIZZ42"
              placeholderTextColor="#7A6B99"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              className="bg-bg rounded-xl border-2 border-muted px-4 py-3 mt-3 font-mono text-paper text-2xl tracking-widest text-center"
              style={{ letterSpacing: 6 }}
              onSubmitEditing={onJoin}
            />
            {joinError ? (
              <Text className="font-body text-blood text-xs mt-2">{joinError}</Text>
            ) : null}
            <View className="mt-3">
              <Button label="join 🚪" onPress={onJoin} full />
            </View>
          </View>
        </Sticker>
      </View>

      <View className="pb-6 mt-4">
        <Text className="font-body text-muted text-xs text-center">
          synced rooms use a shared timestamp — no backend needed. true
          realtime w/ live opponent scores ships in Phase 1.
        </Text>
      </View>
    </Screen>
  );
}
