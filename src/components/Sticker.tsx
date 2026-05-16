import { type ReactNode } from "react";
import { Platform, View, type ViewStyle } from "react-native";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  children: ReactNode;
  /** Tilt in degrees. ±1–4 reads as a sticker that landed crooked. */
  tilt?: number;
  /** Shadow offset in px. Bigger = chunkier. */
  shadow?: number;
  /** Shadow color — defaults to ink (deep purple), but use a palette accent for pop. */
  shadowColor?: string;
  className?: string;
  style?: ViewStyle;
};

// "Sticker" look: a chunky, opaque, offset drop-shadow with optional tilt.
// Works on iOS, Android, and web — RN's shadow props are flaky on Android and
// invisible on web, so we also emit a `boxShadow` on web for parity.
export function Sticker({
  children,
  tilt = 0,
  shadow = 6,
  shadowColor = "#1A0F2E",
  className,
  style,
}: Props) {
  // Honour OS-level reduced-motion: drop the rotation and halve the chunky
  // offset shadow so the UI reads as still-stylised but not animated.
  const reducedMotion = useReducedMotion();
  const effectiveTilt = reducedMotion ? 0 : tilt;
  const effectiveShadow = reducedMotion ? Math.max(2, Math.floor(shadow / 2)) : shadow;
  const baseShadow: ViewStyle =
    Platform.OS === "web"
      ? ({
          boxShadow: `${effectiveShadow}px ${effectiveShadow}px 0 0 ${shadowColor}`,
        } as ViewStyle)
      : {
          shadowColor,
          shadowOffset: { width: effectiveShadow, height: effectiveShadow },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: effectiveShadow,
        };
  return (
    <View
      className={className}
      style={[{ transform: [{ rotate: `${effectiveTilt}deg` }] }, baseShadow, style ?? {}]}
    >
      {children}
    </View>
  );
}
