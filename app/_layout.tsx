import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import { useDailyStore } from "@/features/daily/store";
import { useSettingsStore } from "@/features/settings/store";

export default function RootLayout() {
  const hydrate = useDailyStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
    void hydrateSettings();
  }, [hydrate, hydrateSettings]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0F0A1E" }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0F0A1E" },
            animation: "fade",
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
