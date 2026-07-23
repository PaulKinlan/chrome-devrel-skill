# Editorial blog house-style research

**Date:** 2026-07-22\
**Corpus:** 19 posts (8 web.dev, 11 developer.chrome.com) across 5 genres\
**Method:** Stratified close-reading of blog index + individual posts. Not every
post was analyzed.

See `research/editorial-corpus-manifest.json` for the full inventory with URLs,
dates, authors, genres, and selection rationale.

## Shared house patterns (both publications)

### Structure

- **Title:** descriptive, benefit-oriented or feature-named. No clickbait. No
  unsupported superlatives.
- **Dek/subtitle:** present on developer.chrome.com; web.dev uses first
  paragraph as implicit dek.
- **Lead:** 1-3 sentences stating what shipped/changed and why it matters.
  Concrete, not "we're excited to announce."
- **Heading depth:** typically H2 for major sections, H3 for subsections. Rarely
  deeper than H3.
- **TOC:** not standard on either publication; structure is linear.
- **Code blocks:** syntax-highlighted, language-tagged.web.dev uses `js-nolint`
  for non-lintable examples.
- **Links:** inline to spec, ChromeStatus, MDN, GitHub. Not footnoted.
- **CTA:** "Try it," "Read the docs," "File feedback" — specific and actionable,
  not generic "learn more."
- **Update notes:** present when content is revised post-publication (e.g.,
  corrected version numbers).
- **Authors:** named with social links (GitHub, Mastodon, Bluesky).

### Voice

- Second person ("you") for instructional content.
- First person plural ("we") for team/Chrome announcements.
- Conversational but technically precise. No slang, no hype words
  ("revolutionary," "game-changing").
- Claims backed by spec, measurement, or developer evidence.

### Claim/citation/caveat patterns

- Factual claims cite spec sections, ChromeStatus entries, or measurement data.
- Browser support stated explicitly with version numbers or Baseline status.
- Experimental/trial status disclosed prominently ({{SeeCompatTable}}, "origin
  trial").
- Limitations noted in dedicated sections or inline caveats.

## web.dev-specific patterns

- **Baseline digest format:** monthly structure with "Newly available" → "Widely
  available" → "Community" sections.
- **Cross-browser focus:** emphasizes Firefox/Safari support, not Chrome-only.
- **Rachel Andrew's "New to the web platform"** series: structured by stable
  releases, then per-feature subsections with spec links.
- **Course announcements:** structured curriculum overview, target audience,
  learning path.
- **Engineering blog** posts: technical implementation details, build process,
  architecture decisions.

## developer.chrome.com-specific patterns

- **"New in Chrome N"** series: Pete LePage/Adriana Jara first-person ("I'm Pete
  LePage, let's dive in"), bulleted highlights, links to release notes and
  ChromeStatus.
- **Case studies:** quantified metrics tables (before/after, impact numbers),
  narrative with partner quotes.
- **Origin trial announcements:** key terms defined, prerequisites, flow
  diagrams, demo links.
- **DevTools updates:** per-feature subsections with screenshots and workflow
  descriptions.
- **I/O roundups:** numbered sections, each a mini-announcement with links.
- **Beta releases:** feature list with "Unless otherwise noted" caveat, links to
  ChromeStatus.

## Genre-specific patterns

| Genre                 | Typical structure                                 | Length          | Key elements                                    |
| --------------------- | ------------------------------------------------- | --------------- | ----------------------------------------------- |
| Launch announcement   | Problem → API → code → try it                     | 800-1500 words  | Spec link, demo, CTA, trial status              |
| Technical deep dive   | Problem → solution → implementation → limitations | 1500-3000 words | Code blocks, performance data, edge cases       |
| Release roundup       | Milestone intro → bulleted features → links       | 500-1200 words  | ChromeStatus links, version numbers             |
| Case study            | Context → implementation → metrics → impact       | 1000-2000 words | Metrics table, partner quote, quantified ROI    |
| Deprecation/migration | What changes → timeline → migration path → tools  | 800-1500 words  | Timeline, detection tooling, fallback           |
| Event/community       | Event context → numbered updates → links          | 800-2000 words  | Session links, demo links, community references |
| Performance guidance  | Problem → measurement → optimization → results    | 1500-3000 words | Before/after metrics, Lighthouse data, code     |

## Author variation and counterexamples

- Pete LePage's "New in Chrome" uses first-person singular; other
  developer.chrome.com posts use "we" or third person.
- web.dev posts vary by author: Rachel Andrew is structured/encyclopedic; Jeremy
  Wagner is tutorial-style; Mat Marquis is conversational.
- Historical posts (Chrome 80 era) were more casual; recent posts are more
  structured and evidence-dense.
- Case studies vary: NHS England uses a metrics table; other case studies may
  use narrative-only.

**These variations are real. House-style alignment means matching the shared
patterns, not flattening individual voice.**

## Common failure modes (anti-patterns)

1. **Hype without evidence:** "revolutionary," "game-changing," "loved by
   developers" without data.
2. **Chrome-only framing on web.dev:** web.dev emphasizes cross-browser;
   Chrome-only framing belongs on developer.chrome.com.
3. **Missing limitations:** not disclosing experimental status, known bugs, or
   browser gaps.
4. **Toy examples:** code that works in isolation but doesn't show real
   integration.
5. **No CTA:** ending without telling the reader what to do next.
6. **Inconsistent terminology:** using different names for the same API across
   sections.
7. **Stale update notes:** saying "updated" without noting what changed or when.
8. **Generic AI copy:** smooth, confident, evidence-free prose that could
   describe any feature.
