import { useEffect } from "react";
import { Platform } from "react-native";

// Per-route browser-tab title + description updater.
//
// Static head content (canonical <title>, OG, Twitter, JSON-LD schema,
// manifest links, etc.) lives in app/+html.tsx — that's what crawlers and
// share-link unfurlers see.
//
// We tried per-route static metadata via react-native-helmet-async
// (expo-router/head wraps it) but on the static export Helmet emits an
// empty <title data-rh> placeholder that conflicts with our +html.tsx
// title. Tracked as a known-limitation; per-route static titles will need
// a post-build script in a future PR.
//
// In the meantime this component bumps document.title and the meta
// description as the user navigates between routes so the browser tab,
// bookmarks, and history reflect where they are. No effect on native, no
// effect on the static export.

const SITE_NAME = "Do You Even Brainrot?";

type Props = {
  title: string;
  description?: string;
  /** path / image / type / noindex accepted but currently unused — see header. */
  path?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

export function SeoHead({ title, description }: Props) {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof document === "undefined") return;
    const full = title === SITE_NAME ? title : `${title} · ${SITE_NAME}`;
    try {
      document.title = full;
      if (description) {
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", description);
      }
    } catch {
      // Defensive — setting title can throw in exotic execution contexts.
    }
  }, [title, description]);
  return null;
}
