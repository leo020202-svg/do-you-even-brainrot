import { type ReactNode } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmojiSplat } from "./EmojiSplat";

type Props = {
  children: ReactNode;
  className?: string;
};

// Responsive content width.
//
// Mobile / narrow tablet  (≤ 720 px)  → fills viewport, no cap.
// Wider tablet            (≤ 1024 px) → 600 px column.
// Desktop                 (> 1024 px) → 720 px column + ambient decor in
//                                       the side gutters so the screen
//                                       feels designed-for-desktop rather
//                                       than "phone preview in a vacuum."
//
// Earlier this was a hard 480 px cap, which made the web build feel like a
// phone screenshot stretched onto a 27" monitor. Players reported it
// reading as "mobile only." This widens the column tier by tier so
// desktop now uses real screen real estate.
function widthForViewport(vw: number): number {
  if (vw <= 720) return Math.min(vw, 720);
  if (vw <= 1024) return 600;
  return 720;
}

const DESKTOP_DECOR_BREAKPOINT = 900;

export function Screen({ children, className }: Props) {
  const { width: viewportWidth } = useWindowDimensions();
  const maxWidth = widthForViewport(viewportWidth);
  const showDesktopDecor =
    Platform.OS === "web" && viewportWidth >= DESKTOP_DECOR_BREAKPOINT;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Desktop-only ambient background decor — fills the side gutters
          with low-opacity scattered emojis so wide screens don't feel
          empty around the centered column. */}
      {showDesktopDecor ? (
        <EmojiSplat seed={viewportWidth * 7} count={18} />
      ) : null}
      <View
        className={`flex-1 px-5 ${className ?? ""}`}
        style={{
          width: "100%",
          maxWidth,
          alignSelf: "center",
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
