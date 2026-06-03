// Renders a Schema.org Quiz JSON-LD block in the rendered DOM for the
// category landing pages. Google's docs (`https://developers.google.com/
// search/docs/appearance/structured-data/quiz`) say practice-problem rich
// results need Quiz/QAPage markup with hasPart Question children.
//
// We emit the JSON-LD as a real <script type="application/ld+json"> via
// dangerouslySetInnerHTML — RN's react-native-web doesn't expose <script>,
// so we render the script tag through a hidden HTML container and let
// the browser pick it up.
//
// Native: no-op (mobile crawlers index the web build, not the native app).

import { useEffect } from "react";
import { Platform } from "react-native";
import type { Question } from "@/lib/questions";

type Props = {
  /** Category display name — used as the Quiz `name`. */
  name: string;
  /** Plain-text description used for the Quiz `about` / `description`. */
  description: string;
  /** Canonical URL of this category page. */
  url: string;
  /** Questions to serialize as Question/Answer children. */
  questions: readonly Question[];
};

function buildJsonLd({ name, description, url, questions }: Props): string {
  const json = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: `${name} quiz`,
    description,
    url,
    educationalLevel: "Beginner",
    about: name,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Do You Even Brainrot?",
      url: "https://playbrainrot.app",
    },
    hasPart: questions.map((q) => {
      const correct = q.options.find((o) => o.id === q.correct_answer);
      return {
        "@type": "Question",
        eduQuestionType: "Multiple choice",
        learningResourceType: "Practice problem",
        name: q.question,
        text: q.question,
        ...(q.source
          ? { isBasedOn: { "@type": "CreativeWork", url: q.source } }
          : {}),
        suggestedAnswer: q.options
          .filter((o) => o.id !== q.correct_answer)
          .map((o) => ({
            "@type": "Answer",
            position: o.id,
            text: o.text,
          })),
        acceptedAnswer: {
          "@type": "Answer",
          position: q.correct_answer,
          text: correct?.text ?? "",
        },
      };
    }),
  };
  return JSON.stringify(json);
}

export function QuizSchema(props: Props) {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof document === "undefined") return;
    const id = `quiz-jsonld-${props.url}`;
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = buildJsonLd(props);
    return () => {
      // Leave the tag in place across SPA navigations within the same
      // category; on hard reload it'll be re-emitted. Other category
      // pages overwrite their own id when they mount.
    };
  }, [props]);
  return null;
}
