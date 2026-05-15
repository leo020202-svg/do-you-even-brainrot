import { type ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  className?: string;
};

// Phone-app first: cap content at a phone-sized width so the same layout works
// on iOS / Android / desktop web. On a 1900px-wide browser, no max-width meant
// wide answer rows stretched edge-to-edge and the slight Sticker rotations
// made them visually clip into each other.
const MAX_CONTENT_WIDTH = 480;

export function Screen({ children, className }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-bg items-center">
      <View
        className={`flex-1 w-full px-5 ${className ?? ""}`}
        style={{ maxWidth: MAX_CONTENT_WIDTH }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
