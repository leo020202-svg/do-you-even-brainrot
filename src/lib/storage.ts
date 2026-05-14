import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tiny cross-platform key/value layer. AsyncStorage on native, localStorage on web.
// Used by the daily-streak Zustand store so a player's streak survives reloads
// without needing Supabase wired up.

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        globalThis.localStorage?.setItem(key, value);
      } catch {
        // localStorage can throw in private mode / quota — silent best-effort.
      }
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        globalThis.localStorage?.removeItem(key);
      } catch {
        // ignore
      }
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};
