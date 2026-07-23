# Editorial blog authoring

Use this module when writing blog posts for web.dev/blog or
developer.chrome.com/blog. It applies house-style patterns derived from a
stratified close-reading corpus (see
`research/editorial-house-style-research.md` and
`research/editorial-corpus-manifest.json`).

**House-style aligned / review-prepared** means the draft matches shared
structural patterns and passes deterministic checks. It does NOT mean an editor
will accept it — editorial review is a human process.

## Publication routing

| Publication               | Focus                                 | When to use                                                                 |
| ------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| web.dev/blog              | Cross-browser, Baseline, web platform | Cross-engine features, Baseline milestones, Interop, web platform education |
| developer.chrome.com/blog | Chrome-specific                       | Chrome-only features, DevTools, Chrome experiments, case studies            |

If a feature is cross-browser, default to web.dev. If Chrome-specific, default
to developer.chrome.com.

## Shared structural requirements

Every post must have:

- **Title:** descriptive, no hype, no unsupported superlatives
- **Lead:** 1-3 concrete sentences (what shipped, why it matters)
- **Body:** H2/H3 structure, code blocks with language tags, inline links to
  spec/ChromeStatus/MDN
- **Evidence:** every factual claim cites a source
- **Limitations:** experimental/trial status, browser gaps, known issues
  disclosed
- **CTA:** specific next action ("Try the demo," "Read the MDN docs," "File
  feedback")
- **Metadata:** author(s), date, tags, description (for SEO)

## Voice rules

- Second person ("you") for instructional content
- First person plural ("we") for Chrome team announcements
- Conversational but technically precise
- No hype words: revolutionary, game-changing, groundbreaking, ultimate,
  powerful (without measurement)
- Claims backed by spec, measurement, or developer evidence — never by
  excitement

## Genre templates

| Genre                 | Template                                  | Publication          |
| --------------------- | ----------------------------------------- | -------------------- |
| Launch announcement   | `templates/blog-launch-announcement.md`   | Both                 |
| Technical deep dive   | `templates/blog-technical-deep-dive.md`   | Both                 |
| Release roundup       | `templates/blog-release-roundup.md`       | Both                 |
| Case study            | `templates/blog-case-study.md`            | developer.chrome.com |
| Deprecation/migration | `templates/blog-deprecation-migration.md` | Both                 |
| Performance guidance  | `templates/blog-performance-guidance.md`  | web.dev              |

## Anti-slop doctrine

Apply these checks to every draft:

1. **Concrete mechanism:** does each paragraph advance a specific technical
   point? Delete filler.
2. **Evidence density:** how many claims have sources? Target: every factual
   claim.
3. **Transitions:** does each section flow from the previous? No non-sequiturs.
4. **Cadence:** vary sentence length. Short sentences for emphasis. Longer for
   explanation. No wall-of-text.
5. **Claims:** are limitations disclosed as prominently as benefits?
6. **Endings:** does the post end with a specific CTA, not a vague wrap-up?
7. **Failure modes:** check against the 8 anti-patterns in the research
   artifact.

## Review-ready checklist

- [ ] Title is descriptive, no hype
- [ ] Lead states what shipped and why (concrete, not "we're excited")
- [ ] Every factual claim has a source
- [ ] Code examples are working, not pseudo-code
- [ ] Experimental/trial status disclosed
- [ ] Browser support stated with versions or Baseline status
- [ ] Limitations section present
- [ ] CTA is specific and actionable
- [ ] Author metadata complete
- [ ] No generic AI copy (every paragraph has a specific technical point)
- [ ] Anti-slop checks pass
- [ ] Terminology consistent throughout
