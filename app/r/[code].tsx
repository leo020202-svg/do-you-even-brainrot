import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/room";

/**
 * /r/[code] — pretty shortlink that just bounces to /play?room=CODE so all the
 * gameplay lives in one place. Passes through ?start=TIMESTAMP for synced
 * rooms so friends arrive on the countdown screen.
 */
export default function RoomShortlink() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; start?: string }>();

  useEffect(() => {
    const raw = params.code ?? "";
    const code = normalizeRoomCode(raw);
    if (!code || !isValidRoomCode(code)) {
      router.replace("/friends");
      return;
    }
    const startTs = params.start ? Number(params.start) : NaN;
    const tail = Number.isFinite(startTs) ? `&start=${startTs}` : "";
    router.replace(`/play?room=${code}${tail}`);
  }, [params.code, params.start, router]);

  return (
    <Screen>
      <View className="flex-1 justify-center items-center">
        <Text className="font-display text-paper text-2xl">cooking... 🍳</Text>
        <Text className="font-body text-muted text-sm mt-2">joining the room</Text>
      </View>
    </Screen>
  );
}
