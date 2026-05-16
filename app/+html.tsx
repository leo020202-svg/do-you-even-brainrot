// Root HTML template for Expo Router static export.
// This wraps every rendered page and is the canonical place to inject
// site-wide metadata, links, scripts, and dark-mode-safe defaults.
//
// Per-route titles/descriptions are still set via <SeoHead> (see
// src/components/SeoHead.tsx), but the values below act as both the
// site-wide defaults AND the metadata for the home page when it's the
// rendered route (since RN-Web/Helmet integration on static export is
// flaky for per-route head children, the defaults here ensure every
// crawl/share unfurl gets real content even if Helmet drops the override).

import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

const SITE_NAME = "Do You Even Brainrot?";
const SITE_URL = "https://playbrainrot.app";
const DESCRIPTION =
  "The daily brainrot trivia game. 5 questions a day about Italian brainrot, Skibidi lore, Gen Alpha slang, and TikTok culture. Free, no signup, share with friends.";
const OG_IMAGE = `${SITE_URL}/og/default.png`;
const TWITTER_HANDLE = "@playbrainrot";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <title>{SITE_NAME} — daily brainrot trivia</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />

        {/* Open Graph */}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={`${SITE_NAME} — daily brainrot trivia`} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={TWITTER_HANDLE} />
        <meta name="twitter:creator" content={TWITTER_HANDLE} />
        <meta
          name="twitter:title"
          content={`${SITE_NAME} — daily brainrot trivia`}
        />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* PWA / app meta */}
        <meta name="theme-color" content="#A8FF3E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Brainrot" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" type="image/png" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />

        {/* JSON-LD structured data — WebApplication + Game */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: SITE_NAME,
              url: SITE_URL,
              applicationCategory: "GameApplication",
              operatingSystem: "Web, iOS, Android",
              description: DESCRIPTION,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              creator: {
                "@type": "Organization",
                name: "playbrainrot",
                url: SITE_URL,
              },
            }),
          }}
        />

        {/* Default Expo Router scroll-view reset — keeps body from scrolling on web. */}
        <ScrollViewStyleReset />

        {/* Prevent flash of unstyled content while fonts load — bg matches the theme. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body { background-color: #0F0A1E; color: #F5F2FF; }
              body { font-family: Inter, system-ui, -apple-system, sans-serif; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
