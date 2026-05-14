// Palette anchors from docs/DESIGN_NOTES.md. Keep in sync with tailwind.config.js.
export const colors = {
  bg: "#0F0A1E",
  ink: "#1A0F2E",
  paper: "#F5F2FF",
  lime: "#A8FF3E",
  hot: "#FF3EA5",
  cyan: "#3EFFE9",
  blood: "#FF5C3E",
  muted: "#7A6B99",
} as const;

export type ColorName = keyof typeof colors;
