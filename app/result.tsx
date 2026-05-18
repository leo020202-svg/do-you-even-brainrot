import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/Button";
import { Sticker } from "@/components/Sticker";
import { EmojiSplat } from "@/components/EmojiSplat";
import { Confetti } from "@/components/Confetti";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

// Streak counts that deserve a confetti burst — landed on these, you're
// doing the daily ritual right.
const STREAK_MILESTONES = new Set([3, 7, 14, 30, 50, 100, 365]);
import { useDailyStore } from "@/features/daily/store";
import { getDailyChallenge, getRoomChallenge, DAILY_QUESTION_COUNT } from "@/lib/daily";
import { buildShareText, shareResult } from "@/lib/share";
import { pickDailyBots, botFinalScores } from "@/lib/bots";
import { codeToSeed, generateRoomCode, isValidRoomCode, normalizeRoomCode, roomShareUrl } from "@/lib/room";

type Verdict = { headline: string; line: string; emoji: string; color: string };

function verdictFor(correct: number, total: number): Verdict {
  const r = correct / total;
  if (r === 1) return { headline: "CERTIFIED SIGMA", line: "the lore is in your blood", emoji: "⛓️‍💥", color: "text-lime" };
  if (r >= 0.8) return { headline: "RIZZ-PILLED", line: "you log on. you scroll. you know.", emoji: "🔥", color: "text-cyan" };
  if (r >= 0.6) return { headline: "MID BUT VALID", line: "respectable brainrot showing", emoji: "✨", color: "text-hot" };
  if (r >= 0.4) return { headline: "MILDLY COOKED", line: "you log on sometimes I guess", emoji: "🫠", color: "text-paper" };
  if (r >= 0.2) return { headline: "OHIO ENERGY", line: "go outside? maybe? for like a sec?", emoji: "💀", color: "text-blood" };
  return { headline: "L + RATIO + BRAINROT-LESS", line: "have you... heard of TikTok?", emoji: "🤡", color: "text-blood" };
}

export default function Result() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    shareText?: string;
    correct?: string;
    pattern?: string;
    score?: string;
    total?: string;
    practice?: string;
    room?: string;
    seed?: string;
  }>();
  const totalQuestions = params.total ? Number(params.total) : DAILY_QUESTION_COUNT;
  const isPractice = params.practice === "1";
  const roomCode = useMemo(() => {
    if (!params.room) return null;
    const c = normalizeRoomCode(params.room);
    return isValidRoomCode(c) ? c : null;
  }, [params.room]);
  const isRoom = roomCode !== null;
  const challenge = useMemo(
    () =>
      isRoom && roomCode
        ? getRoomChallenge(roomCode, codeToSeed(roomCode))
        : getDailyChallenge(),
    [isRoom, roomCode],
  );
  const stored = useDailyStore((s) => s.results[challenge.dateKey]);
  const streak = useDailyStore((s) => s.currentStreak);
  const longest = useDailyStore((s) => s.longestStreak);

  const correct = useMemo(() => {
    if (params.correct) return Number(params.correct);
    if (stored && !isPractice && !isRoom) return stored.outcomes.filter((o) => o === "correct").length;
    return 0;
  }, [params.correct, stored, isPractice, isRoom]);

  const pattern =
    isPractice || isRoom
      ? (params.pattern ?? "⬜⬜⬜⬜⬜")
      : (stored?.pattern ?? params.pattern ?? "⬜⬜⬜⬜⬜");
  const verdict = verdictFor(correct, totalQuestions);
  const playerTotalScore =
    isPractice || isRoom
      ? params.score
        ? Number(params.score)
        : 0
      : (stored?.score ?? 0);

  // Animated score climb — feels heavier than just slapping the final number on.
  const animatedScore = useAnimatedNumber(playerTotalScore, 900);
  const animatedCorrect = useAnimatedNumber(correct, 700);

  // Confetti rules: perfect score on any mode always pops; daily landings on
  // a streak milestone also pop (3 / 7 / 14 / 30 / 50 / 100 / 365 days).
  const isPerfect = correct === totalQuestions;
  const showMilestoneConfetti = !isPractice && !isRoom && STREAK_MILESTONES.has(streak);
  const showResultConfetti = isPerfect || showMilestoneConfetti;

  // Final standings vs the 4 fake bots that played today.
  const bots = useMemo(() => pickDailyBots(challenge.index), [challenge.index]);
  const finalBotScores = useMemo(
    () => botFinalScores(bots, challenge.questionIds, challenge.index),
    [bots, challenge.questionIds, challenge.index],
  );
  const standings = useMemo(() => {
    const rows = [
      ...bots.map((b) => ({
        key: b.name,
        name: b.name,
        emoji: b.emoji,
        score: finalBotScores[b.name] ?? 0,
        isYou: false,
      })),
      { key: "you", name: "you", emoji: "🫵", score: playerTotalScore, isYou: true },
    ];
    return rows.sort((a, b) => b.score - a.score);
  }, [bots, finalBotScores, playerTotalScore]);
  const playerRank = standings.findIndex((r) => r.isYou) + 1;

  const shareText = useMemo(() => {
    if (isRoom && roomCode) {
      return `🧠 brainrot room ${roomCode}\n${correct}/${totalQuestions}\n${pattern}\nbeat me: ${roomShareUrl(roomCode)}`;
    }
    return (
      params.shareText ??
      buildShareText({
        dailyIndex: challenge.index,
        score: correct,
        total: totalQuestions,
        pattern,
      })
    );
  }, [params.shareText, challenge.index, correct, pattern, isRoom, roomCode]);

  const [shareState, setShareState] = useState<"idle" | "shared" | "copied" | "failed">("idle");

  async function onShare() {
    const r = await shareResult(shareText);
    setShareState(r);
  }

  const shareLabel =
    shareState === "shared"
      ? "shared ✨"
      : shareState === "copied"
        ? "copied 📋"
        : shareState === "failed"
          ? "couldn't share. try again."
          : "share the carnage";

  return (
    <Screen>
      <SeoHead title="Your score" path="/result" noindex />
      <Confetti show={showResultConfetti} count={isPerfect ? 80 : 60} />
      <EmojiSplat seed={challenge.index * 7 + correct} count={10} />

      <View className="pt-2 items-center">
        <Text style={{ fontSize: 72 }}>{verdict.emoji}</Text>
      </View>

      {isPractice ? (
        <View className="items-center mb-2">
          <Sticker tilt={-2} shadow={3} shadowColor="#FF3EA5">
            <View className="bg-hot rounded-md px-3 py-1 border-2 border-ink">
              <Text className="font-mono text-ink text-xs uppercase tracking-widest">
                ♾️ UNLIMITED · streak untouched
              </Text>
            </View>
          </Sticker>
        </View>
      ) : isRoom && roomCode ? (
        <View className="items-center mb-2">
          <Sticker tilt={-2} shadow={3} shadowColor="#3EFFE9">
            <View className="bg-cyan rounded-md px-3 py-1 border-2 border-ink">
              <Text className="font-mono text-ink text-xs uppercase tracking-widest">
                👯 ROOM · {roomCode}
              </Text>
            </View>
          </Sticker>
        </View>
      ) : null}

      <Sticker tilt={-2} shadow={6} shadowColor="#FF3EA5">
        <View className="bg-ink rounded-3xl border-4 border-paper p-5">
          <Text className="font-mono text-muted text-xs">
            {isPractice
              ? "UNLIMITED ROUND"
              : isRoom && roomCode
                ? `FRIEND ROOM · ${roomCode}`
                : `BRAINROT DAILY · #${challenge.index}`}
          </Text>
          <Text className={`font-display text-3xl mt-1 ${verdict.color}`}>{verdict.headline}</Text>
          <Text className="font-body text-paper text-sm mt-1">{verdict.line}</Text>

          <View className="flex-row items-end mt-3">
            <Text className="font-display text-lime text-6xl leading-none">{animatedCorrect}</Text>
            <Text className="font-display text-muted text-2xl ml-1 mb-1">
              / {totalQuestions}
            </Text>
          </View>

          <Text className="font-mono text-paper text-2xl tracking-widest mt-3">{pattern}</Text>

          <Text className="font-mono text-muted text-xs mt-3">
            <Text className="text-cyan">{animatedScore.toLocaleString()}</Text> pts · playbrainrot.app · run it back tomorrow
          </Text>
        </View>
      </Sticker>

      <View className="mt-5">
        <Text className="font-mono text-muted text-xs">FINAL STANDINGS</Text>
        <View className="mt-2 gap-2">
          {standings.map((r, i) => {
            const tilt = i % 2 === 0 ? -0.5 : 0.5;
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
            return (
              <Sticker
                key={r.key}
                tilt={tilt}
                shadow={r.isYou ? 4 : 2}
                shadowColor={r.isYou ? "#A8FF3E" : "#1A0F2E"}
              >
                <View
                  className={`flex-row items-center rounded-xl px-3 py-2 border-2 ${
                    r.isYou ? "bg-lime border-ink" : "bg-ink border-muted"
                  }`}
                >
                  <Text className={`font-display text-xl w-9 ${r.isYou ? "text-ink" : "text-paper"}`}>
                    {medal}
                  </Text>
                  <Text className="text-xl mr-2">{r.emoji}</Text>
                  <Text
                    className={`font-display flex-1 ${
                      r.isYou ? "text-ink text-base" : "text-paper text-sm"
                    }`}
                  >
                    {r.name}
                  </Text>
                  <Text
                    className={`font-mono ${
                      r.isYou ? "text-ink font-display text-base" : "text-paper text-sm"
                    }`}
                  >
                    {r.score.toLocaleString()}
                  </Text>
                </View>
              </Sticker>
            );
          })}
        </View>
        <Text className="font-body text-muted text-xs mt-2 text-center italic">
          {playerRank === 1 ? "you mogged all the bots fr 👑" : `you came in #${playerRank}/${standings.length}`}
        </Text>
      </View>

      <View className="flex-row justify-around mt-4">
        <Sticker tilt={-2} shadow={3} shadowColor="#A8FF3E">
          <View className="bg-ink rounded-xl border-2 border-lime px-4 py-2">
            <Text className="font-mono text-muted text-xs">streak</Text>
            <Text className="font-display text-lime text-2xl">🔥 {streak}</Text>
          </View>
        </Sticker>
        <Sticker tilt={2} shadow={3} shadowColor="#3EFFE9">
          <View className="bg-ink rounded-xl border-2 border-cyan px-4 py-2">
            <Text className="font-mono text-muted text-xs">longest</Text>
            <Text className="font-display text-cyan text-2xl">🏆 {longest}</Text>
          </View>
        </Sticker>
      </View>

      {isRoom && roomCode ? (
        <View className="mt-4">
          <Sticker tilt={-0.5} shadow={3} shadowColor="#FF3EA5">
            <View className="bg-ink rounded-xl border-2 border-hot px-3 py-2">
              <Text className="font-mono text-muted text-xs">SEND THIS LINK TO FRIENDS</Text>
              <Text className="font-mono text-cyan text-xs mt-1" selectable>
                {roomShareUrl(roomCode)}
              </Text>
            </View>
          </Sticker>
        </View>
      ) : null}

      <View className="gap-3 pb-6 mt-5">
        {isRoom ? (
          <Button
            label="play again 🔄"
            emoji="🎲"
            tilt={-1}
            onPress={() => router.replace(`/play?room=${generateRoomCode()}`)}
            full
          />
        ) : isPractice ? (
          <Button
            label="play again 🔄"
            emoji="🎯"
            tilt={-1}
            onPress={() => router.replace(`/play?practice=1&t=${Date.now()}`)}
            full
          />
        ) : (
          <Button label={shareLabel} emoji="📣" tilt={-1} onPress={onShare} full />
        )}
        {isRoom ? (
          <Button label={shareLabel} emoji="📣" variant="secondary" onPress={onShare} full />
        ) : isPractice ? (
          <Button label="share" variant="secondary" onPress={onShare} full />
        ) : (
          <Button
            label="unlimited mode ♾️"
            variant="secondary"
            onPress={() => router.replace("/play?practice=1")}
            full
          />
        )}
        <Button label="back to home" variant="ghost" onPress={() => router.replace("/")} full />
      </View>
    </Screen>
  );
}
