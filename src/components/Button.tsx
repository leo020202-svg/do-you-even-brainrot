import { Pressable, Text, type PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "ghost";

type Props = Omit<PressableProps, "children"> & {
  label: string;
  variant?: Variant;
  full?: boolean;
};

const base =
  "rounded-2xl px-6 py-4 items-center justify-center active:opacity-80 transition-opacity";

const styles: Record<Variant, { box: string; text: string }> = {
  primary: { box: "bg-lime", text: "text-ink font-display text-lg" },
  secondary: { box: "bg-hot", text: "text-paper font-display text-lg" },
  ghost: { box: "border border-muted bg-transparent", text: "text-paper font-body text-base" },
};

export function Button({ label, variant = "primary", full, ...rest }: Props) {
  const v = styles[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`${base} ${v.box} ${full ? "w-full" : ""}`}
      {...rest}
    >
      <Text className={v.text}>{label}</Text>
    </Pressable>
  );
}
