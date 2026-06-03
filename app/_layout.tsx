import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts as useSpaceGrotesk,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import "../global.css";
import { useDailyStore } from "@/features/daily/store";
import { useSettingsStore } from "@/features/settings/store";
import { useAchievementsStore } from "@/features/achievements/store";
import { AchievementToast } from "@/components/AchievementToast";

// Keep the splash visible while we load fonts so we never flash unstyled text.
void SplashScreen.preventAutoHideAsync().catch(() => {
  // calling twice / in a not-supported env is fine, swallow.
});

export default function RootLayout() {
  const hydrate = useDailyStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateAchievements = useAchievementsStore((s) => s.hydrate);

  const [fontsLoaded] = useSpaceGrotesk({
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    void hydrate();
    void hydrateSettings();
    void hydrateAchievements();
  }, [hydrate, hydrateSettings, hydrateAchievements]);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync().catch(() => {
        // ignore — the splash may already be hidden on web
      });
    }
  }, [fontsLoaded]);

  // Render nothing until fonts are ready to avoid a fallback-font flash on
  // first paint. The splash screen covers this.
  if (!fontsLoaded) return null;

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
        {/* Global achievement unlock toast — listens to the store and pops
            a sticker overlay every time a new achievement unlocks. */}
        <AchievementToast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
