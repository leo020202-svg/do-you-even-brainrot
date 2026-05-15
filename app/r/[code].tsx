import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/room";

/**
 * /r/[code] — pretty shortlink that just bounces to /play?room=CODE so all the
 * gameplay lives in one place. Used by the invite-link share text.
 */
export default function RoomShortlink() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    const raw = params.code ?? "";
    const code = normalizeRoomCode(raw);
    if (!code || !isValidRoomCode(code)) {
      router.replace("/friends");
      return;
    }
    router.replace(`/play?room=${code}`);
  }, [params.code, router]);

  return (
    <Screen>
      <View className="flex-1 justify-center items-center">
        <Text className="font-display text-paper text-2xl">cooking... 🍳</Text>
        <Text className="font-body text-muted text-sm mt-2">joining the room</Text>
      </View>
    </Screen>
  );
}
