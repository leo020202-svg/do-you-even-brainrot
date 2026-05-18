import { View, type ViewProps } from "react-native";

// Semantic heading wrapper. RN-Web translates accessibilityRole="header" +
// aria-level into <h1>…<h6>, giving search engines the heading hierarchy
// they use to understand page content. Without this every <Text> renders
// as <div> and Google sees a wall of unstructured text.
//
// Renders a <View> rather than <Text> so it can contain visual children
// (Sticker stacks, decorative wrappers). On native this is just a View
// with the right accessibility role — no visual change.
//
// Pass `accessibilityLabel` so screen readers + Google's accessibility
// crawler get a clean text version even when the visual content is split
// across nested elements.

type Level = 1 | 2 | 3 | 4 | 5 | 6;

type Props = ViewProps & {
  level: Level;
  children: ViewProps["children"];
  /** Plain-text version for assistive tech + SEO crawlers. */
  accessibilityLabel: string;
};

export function Heading({ level, children, accessibilityLabel, ...rest }: Props) {
  // aria-level passed via spread because RN's ViewProps type doesn't
  // expose it directly but RN-Web honors it on header elements.
  const ariaProps = { "aria-level": level };
  return (
    <View
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel}
      {...ariaProps}
      {...rest}
    >
      {children}
    </View>
  );
}
