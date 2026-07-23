# YouTube launch assets

Use this module when preparing video announcement content for a Chrome feature,
initiative, or developer resource. It covers announcement scripts, demo
planning, accessibility, localization, and review/hold/correction workflows.

Every claim in a YouTube asset must be evidence-backed. Unsupported hype,
overclaims, or omission of known limitations are anti-patterns.

## Script structure

Every announcement script defines:

- **Audience:** developers, partners, press, internal?
- **Outcome:** what should the viewer do or understand after watching?
- **Hook:** evidence-backed opening claim (cite source)
- **Claims:** each factual claim linked to spec, ChromeStatus, or research
  evidence
- **Timed narration:** timestamped script with word count per section
- **Demo beats:** what is shown on screen at each timestamp
- **Limitations:** what the feature does NOT do, disclosed honestly

## Variants

| Variant   | Length  | Audience              | Use case                                            |
| --------- | ------- | --------------------- | --------------------------------------------------- |
| Short     | 30–60s  | Social/YouTube Shorts | Hook + single benefit + CTA                         |
| Standard  | 3–5min  | Developer audience    | Problem → solution → demo → integration → CTA       |
| Deep-dive | 8–15min | Advanced developers   | Full technical context + alternatives + limitations |

## Accessibility requirements

- **Captions:** human-reviewed captions for all spoken content (not auto-only)
- **Transcript:** full text transcript published alongside video
- **Audio description:** key visual actions described in audio or separate track
- **On-screen text:** sufficient contrast, readable at mobile size, not
  conveying info solely through color
- **Chapters:** timestamped chapter markers with descriptive titles
- **Flashing:** no more than 3 flashes per second (photosensitive seizure
  safety)

## Localization

- Script must be translatable (avoid idioms, culture-specific references)
- On-screen text should be replaceable for dubbing/subtitling
- Demo screenshots must be locale-neutral or easily swapped
- Title and description support multiple language variants

## Title and thumbnail

- **Title options:** 3 variants with different angles (benefit, technical,
  curiosity)
- **Thumbnail options:** 2-3 variants tested for clarity and click-through
  honesty
- **Title rules:** no clickbait, no unsupported superlatives, disclose
  experimental/trial status
- **Thumbnail rules:** must represent actual content, not misleading imagery

## Description and links

- **Description:** summary, key timestamps, source links, CTA
- **Source links:** spec, ChromeStatus, MDN, sample repos — all public URLs
- **CTA:** try it, read the docs, file feedback — specific and actionable

## Owner and review status

- **Owner:** who wrote the script, who reviews, who approves publication
- **Review status:** draft → internal review → approved → published → stale
- **Review checklist:** all claims verified, limitations disclosed,
  accessibility checked

## Fallback, hold, and correction plan

- **Hold language prepared:** if the feature is delayed, have alternate publish
  date messaging
- **Correction protocol:** if a factual error is discovered post-publication:
  1. Pin a comment with the correction
  2. Add errata to description
  3. If material, re-edit or re-record the affected section
  4. Document what went wrong and improve the review checklist

## Integration

- **Lifecycle:** used in Release communication (phase 7) and Adoption (phase 8)
- **Artifact template:** see `templates/youtube-announcement-script.md`
- **Publishing target:** `youtube-announcement` in publishing-targets manifest
- **Readiness:** claims must be evidence-backed per
  `modules/readiness-expectations.md`
- **Evidence:** every claim cites its source; no claim rests on excitement alone
