import { Platform, Share } from "react-native";
import * as Clipboard from "expo-clipboard";

// Build the Wordle-style emoji pattern used in the share card.
// Correct = 🟩, wrong = 🟥, skipped = ⬜
export function buildPattern(answers: Array<"correct" | "wrong" | "skipped">): string {
  return answers
    .map((a) => (a === "correct" ? "🟩" : a === "wrong" ? "🟥" : "⬜"))
    .join("");
}

export function buildShareText(args: {
  dailyIndex: number;
  score: number;
  total: number;
  pattern: string;
}): string {
  return `Brainrot Daily #${args.dailyIndex} — ${args.score}/${args.total}\n${args.pattern}\nplaybrainrot.app`;
}

// Best-effort cross-platform share. Returns true if something was triggered.
export async function shareResult(text: string): Promise<"shared" | "copied" | "failed"> {
  if (Platform.OS === "web") {
    const nav: Navigator & { share?: (data: { text: string }) => Promise<void> } =
      globalThis.navigator;
    if (nav && typeof nav.share === "function") {
      try {
        await nav.share({ text });
        return "shared";
      } catch {
        // user dismissed or unsupported — fall through to clipboard
      }
    }
    try {
      await Clipboard.setStringAsync(text);
      return "copied";
    } catch {
      return "failed";
    }
  }
  try {
    await Share.share({ message: text });
    return "shared";
  } catch {
    try {
      await Clipboard.setStringAsync(text);
      return "copied";
    } catch {
      return "failed";
    }
  }
}
