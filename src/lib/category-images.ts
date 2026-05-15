import type { ImageSourcePropType } from "react-native";

// Decorative photos per category. All are CC-licensed or public-domain from
// Wikimedia Commons — see data/category-images-credits.json for the full
// attribution list (downloaded by scripts/download-category-images.py).
//
// require() paths must be literal strings at bundle time; don't programmatically
// build them.

export const CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
  italian_brainrot: require("../../assets/categories/italian_brainrot.jpg"),
  skibidi: require("../../assets/categories/skibidi.jpg"),
  gen_alpha_slang: require("../../assets/categories/gen_alpha_slang.jpg"),
  viral_moments: require("../../assets/categories/viral_moments.jpg"),
  creators: require("../../assets/categories/creators.jpg"),
  cross_platform: require("../../assets/categories/cross_platform.jpg"),
  deep_cuts: require("../../assets/categories/deep_cuts.jpg"),
  absurdity: require("../../assets/categories/absurdity.jpg"),
};

export function categoryImage(category: string): ImageSourcePropType | undefined {
  return CATEGORY_IMAGES[category];
}
