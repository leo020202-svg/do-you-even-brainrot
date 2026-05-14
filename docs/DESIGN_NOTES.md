# Design Notes

UI/UX direction and content principles. This file is opinions, not requirements — but they're informed opinions. Push back if you disagree, but with a reason.

## Visual direction

**Aesthetic:** Loud, maximalist, internet-native. The opposite of Apple's "neutral grays." Think TikTok comment section colors but legible.

**Palette anchors:**
- Background: deep purple-black (`#0F0A1E`) — feels nocturnal, like 2am scrolling
- Primary action: bright lime (`#A8FF3E`) — chaotic energy
- Secondary: hot pink (`#FF3EA5`)
- Accent / "correct": cyan (`#3EFFE9`)
- Wrong: blood orange (`#FF5C3E`)
- Text: off-white (`#F5F2FF`) on dark, deep purple (`#1A0F2E`) on light

**Typography:**
- Display headings: a heavy, slightly-aggressive sans (Space Grotesk Bold or similar free option)
- Body: Inter — clean, readable, free
- Score card monospace: JetBrains Mono — for the Wordle-grid score share

**Motion:**
- Everything snappy (animations under 250ms)
- Use spring physics, not eases — React Native Reanimated 3
- Question reveals: slight bounce
- Correct answers: cyan glow + haptic tap
- Wrong answers: screen wobble + heavier haptic

## Tone of voice

**App copy is part of the joke.** Generic strings kill the vibe. Examples:

| Generic | Brainrot-voiced |
|---------|-----------------|
| "Loading..." | "Cooking..." |
| "No internet connection" | "Wifi giving Ohio energy. Try again." |
| "Sign in" | "Let's get this rizz" |
| "Settings" | "Settings (yawn)" |
| "You got 8/10!" | "8/10. Mid but rizz-pilled." |
| "Try again" | "Run it back" |
| "Streak: 7 days" | "7-day streak. Sigma behavior." |

Don't go *too* hard — every screen full of slang is exhausting. Roughly 20% of strings get the treatment, the other 80% stay clean.

## Content principles for new questions

When generating or evaluating new questions:

1. **Decoys are the joke.** A "boring correct answer with three boring wrong answers" is a wasted question. Every question needs at least one funny wrong option.
2. **Fact-check the lore.** The Italian brainrot wiki and Know Your Meme are authoritative. Don't invent.
3. **Avoid copyright-risky territory.** No directly quoting song lyrics, no full-paragraph Wikipedia rips.
4. **Avoid the cruel-on-Gaza territory.** Skip Bombardiro Crocodilo's actual narration content. The character is fair game, the original audio is not.
5. **Difficulty calibration:**
   - Easy: any TikTok user would know
   - Medium: you've watched a brainrot tier list video
   - Hard: you're in the comments arguing about lore
   - Expert: you read the Wikipedia article
6. **Source every Expert-tier question.** Tag it with a URL in the JSON `source` field.

## What "good" looks like

**A good Easy question:**
> What does "rizz" mean?
> A) Money  B) Charisma  C) Confidence  D) A dance move
> Answer: B

**A good Hard question with funny decoys:**
> Which of these is NOT a real Italian brainrot character?
> A) Brr Brr Patapim  B) Ballerina Cappuccina  C) Sigma Linguini Provolone  D) Bombombini Gusini
> Answer: C

**A bad question (too obvious, no jokes):**
> What is the capital of Italy?
> A) Milan  B) Rome  C) Venice  D) Naples
> Answer: B
> (Not on-topic, no humor, no value.)

**A bad question (too obscure / fanfic territory):**
> What is Tralalero Tralala's blood type according to fan canon?
> (Made up. Not knowable. Skip.)

## Onboarding philosophy

First-time users should hit a real question within 30 seconds of opening the app. Don't:
- Force a tutorial before the first interaction
- Ask for permissions before they've seen value
- Show login as a hard wall — let guest play first, prompt to save after

## Accessibility

Yes, even for a brainrot game.
- All text must be readable at 200% zoom
- Color is never the only signal (correct/wrong has icon + animation in addition to color)
- Haptics can be disabled in settings
- VoiceOver / TalkBack labels on everything

## Anti-pattern: don't infantilize

The audience is 12-25. They're not children, they're young adults with taste. Don't:
- Use cutesy mascots
- Pad with kid-friendly explainers ("Do you know what a meme is?")
- Censor profanity below R-rated (light cursing is fine, slurs are not)
- Pretend the cringy parts of brainrot aren't cringy — lean into it
