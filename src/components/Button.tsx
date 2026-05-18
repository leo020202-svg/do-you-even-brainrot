import { Pressable, Text, View, type PressableProps } from "react-native";
import { Sticker } from "./Sticker";

type Variant = "primary" | "secondary" | "ghost";

type Props = Omit<PressableProps, "children"> & {
  label: string;
  variant?: Variant;
  full?: boolean;
  /** Tilt the button slightly to feel hand-placed. */
  tilt?: number;
  /** Optional emoji rendered before the label. */
  emoji?: string;
};

const styles: Record<Variant, { box: string; text: string; shadow: string }> = {
  primary: {
    box: "bg-lime border-4 border-ink",
    text: "text-ink font-display text-xl uppercase tracking-wider",
    shadow: "#1A0F2E",
  },
  secondary: {
    box: "bg-hot border-4 border-ink",
    text: "text-paper font-display text-xl uppercase tracking-wider",
    shadow: "#1A0F2E",
  },
  ghost: {
    box: "bg-bg border-2 border-muted",
    text: "text-paper font-body text-base",
    shadow: "#1A0F2E",
  },
};

export function Button({
  label,
  variant = "primary",
  full,
  tilt = 0,
  emoji,
  ...rest
}: Props) {
  const v = styles[variant];
  return (
    // `alignSelf: "stretch"` on the Sticker forces it to fill the flex
    // parent's cross-axis when full=true. Without this the Sticker sized
    // to its child's intrinsic width and the "w-full" on the Pressable
    // had nothing to be 100% of — buttons rendered as content-width chips
    // instead of full-width primary CTAs.
    <Sticker
      tilt={tilt}
      shadow={variant === "ghost" ? 3 : 6}
      shadowColor={v.shadow}
      style={full ? { alignSelf: "stretch" } : undefined}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        className={`rounded-2xl px-6 py-4 items-center justify-center active:opacity-80 ${v.box} ${full ? "w-full" : ""}`}
        {...rest}
      >
        <View className="flex-row items-center gap-2">
          {emoji ? <Text className="text-xl">{emoji}</Text> : null}
          <Text className={v.text}>{label}</Text>
        </View>
      </Pressable>
    </Sticker>
  );
}
