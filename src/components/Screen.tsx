import { type ReactNode } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmojiSplat } from "./EmojiSplat";

type Props = {
  children: ReactNode;
  className?: string;
};

// Phone-app first: cap content at a phone-sized width so the same layout
// works on iOS / Android / desktop web. On big desktop browsers the column
// is centered against a flat ink background — gives the app a "phone-frame"
// feel without an actual frame UI element.
//
// Width is enforced inline rather than via NativeWind classes — earlier we
// hit a case where `items-center` on the parent + `w-full` on the child
// rendered as content-width (~280 px) instead of 480 px on Chrome desktop.
// Inline width + maxWidth + alignSelf is the deterministic shape.
const MAX_CONTENT_WIDTH = 480;
// Below this viewport width we don't render the background-decor splat —
// it'd just overlap the content column.
const DESKTOP_DECOR_BREAKPOINT = 900;

export function Screen({ children, className }: Props) {
  const { width: viewportWidth } = useWindowDimensions();
  const showDesktopDecor =
    Platform.OS === "web" && viewportWidth >= DESKTOP_DECOR_BREAKPOINT;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Desktop-only background decoration. Renders at the SafeAreaView
          level (full viewport) so it fills the empty space on either side
          of the phone-sized column. Low opacity + large emojis so it reads
          as ambient texture, not UI. */}
      {showDesktopDecor ? (
        <EmojiSplat seed={viewportWidth * 7} count={18} />
      ) : null}
      <View
        className={`flex-1 px-5 ${className ?? ""}`}
        style={{
          width: "100%",
          maxWidth: MAX_CONTENT_WIDTH,
          alignSelf: "center",
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
