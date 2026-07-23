# MDN review checklist / PR packet

## Pre-PR checks

- [ ] Frontmatter: correct `page-type`, `title`, `slug`, `browser-compat`
- [ ] {{Specifications}} macro present
- [ ] {{Compat}} macro present
- [ ] Syntax section matches official format (see Syntax sections guide)
- [ ] Parameters documented with types and descriptions (methods)
- [ ] Return value documented (methods)
- [ ] Exceptions documented (methods)
- [ ] At least one working example with {{EmbedLiveSample}}
- [ ] Example is keyboard-accessible
- [ ] BCD entry created/updated and validates against schema
- [ ] Spec URL current and linked
- [ ] Experimental flag accurate
- [ ] Secure context requirement noted if applicable
- [ ] Permission requirement noted if applicable
- [ ] No invented compat data
- [ ] No claims of Mozilla review approval
- [ ] `npm run fix:md` passes formatting
- [ ] No disagreements between spec/BCD/prose left unexplained

## PR packet

- **Repository:** mdn/content (prose) and/or mdn/browser-compat-data (BCD)
- **Branch:** descriptive name
- **PR title:** conventional format
- **Description:** what changed, why, linked ChromeStatus/spec
- **Reviewers:** auto-assigned by MDN process; do not tag specific people unless
  they asked
- **CI status:** all checks must pass before review

## Post-review

- Address reviewer feedback
- Do not claim Mozilla approved until PR is merged
- Update internal doc plan status
