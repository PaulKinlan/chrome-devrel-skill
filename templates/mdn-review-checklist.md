# MDN review checklist / PR packet

## Before starting

- [ ] File an issue or proposal in mdn/content describing what you plan to
      document
- [ ] Wait for maintainer response before starting work

## Pre-PR checks

- [ ] Frontmatter: correct `page-type`, `title`, `slug`, `browser-compat`
- [ ] NO `spec-url` in frontmatter (spec linkage via BCD `spec_url`)
- [ ] NO `experimental` in frontmatter (derived from BCD status)
- [ ] NO `short-title` unless official template uses it for this page type
- [ ] Title format matches official pattern for page type
- [ ] {{Specifications}} macro present
- [ ] {{Compat}} macro present
- [ ] Syntax section matches official format (methods/constructors only)
- [ ] Property pages have Value section, NOT Syntax
- [ ] Event pages have Event type, Description, and trigger context
- [ ] Interface pages list: Constructor, Instance properties, Static properties,
      Instance methods, Static methods, Events
- [ ] Parameters documented with types (methods/constructors); "None" if no
      parameters
- [ ] Return value documented (methods/constructors)
- [ ] Exceptions documented (methods/constructors)
- [ ] At least one working example with {{EmbedLiveSample}} under descriptive H3
      heading
- [ ] Example is keyboard-accessible
- [ ] BCD entry created/updated; `version_added` uses evidence or `null`
- [ ] NO invented version numbers in BCD
- [ ] Status fields in BCD drive auto-generated banners (not manually authored)
- [ ] {{SecureContext_Header}} / {{AvailableInWorkers}} where applicable
- [ ] {{SeeCompatTable}} only if experimental (derived from BCD)
- [ ] No claims of Mozilla review approval
- [ ] No disagreements between spec/BCD/prose left unexplained

## Local build checks

```sh
npm install
npm start          # preview at localhost:8080
# inspect rendered page for visual/structural flaws
npm run fix:md     # auto-format markdown
```

## PR packet

- **Repository:** mdn/content (prose) and/or mdn/browser-compat-data (BCD)
- **Branch:** descriptive name
- **PR title:** conventional format
- **Description:** what changed, why, linked issue (`Fixes #N` or `Relates #N`)
- **Dependencies:** note any related PRs (e.g., BCD PR that must merge first)
- **Reviewers:** auto-assigned via CODEOWNERS; do not tag specific people unless
  they asked
- **CI status:** all GitHub Actions checks must pass before review

## Post-review

- Address reviewer feedback promptly
- Resolve merge conflicts
- Do not claim Mozilla approved until PR is merged
- Update internal doc plan status

## No guarantee/timeline

MDN review is a community process. Reviewer availability and review depth vary.
Do not promise delivery dates to stakeholders.
