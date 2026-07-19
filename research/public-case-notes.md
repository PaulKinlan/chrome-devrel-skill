# Public case notes

Status: early source bundles for future historical evals. Retrieved 2026-07-19. These notes are not complete causal evaluations and must not be used with hindsight-only facts when replaying an earlier decision point.

## HTML-in-Canvas — promising capability with visible ecosystem pull

### Public record

- [Chrome's origin-trial introduction](https://developer.chrome.com/blog/html-in-canvas-origin-trial) describes an API for drawing live, interactive, accessible DOM content into Canvas 2D and WebGL/WebGPU textures. It documents experimental Three.js and PlayCanvas support, demos, cross-origin restrictions, and main-thread performance limitations.
- [WICG explainer](https://github.com/WICG/html-in-canvas) contains concrete 2D/3D examples and a detailed read-back security/privacy model that excludes cross-origin content, visited-link state, autofill information, system preferences, and other sensitive rendering.
- [Three.js pull request #31233](https://github.com/mrdoob/three.js/pull/31233) and [PlayCanvas pull request #8519](https://github.com/playcanvas/engine/pull/8519) are attributable experimental framework implementations rather than generic expressions of interest.
- [Intent to Experiment](https://groups.google.com/a/chromium.org/g/blink-dev/c/t_nGEmJ_v4s) records developer signals and unresolved interoperability/security concerns. The thread corrected Gecko's status to **No Signal**; it must not be reported as positive or negative without a later labeled position.

### Candidate lessons to test

- A legible, long-standing developer problem plus capability-expanding demos can make value obvious.
- Framework implementation is stronger evidence than social engagement, but experimental support is not a production ship commitment.
- Delight and organic uptake do not resolve privacy, fingerprinting, accessibility, performance, or interoperability concerns.
- A strong DevRel treatment should present impressive demos and the security model/limitations together.

## Baseline — ecosystem-level developer workflow

### Public record

- [Baseline definition](https://web-platform-dx.github.io/baseline/) is cross-browser by construction, using Safari, Chrome, Edge, and Firefox as its core set.
- [Baseline resources](https://web.dev/baseline) connect the shared status model to tools and case studies.
- [Target case study](https://web.dev/case-studies/target-baseline) reports a data-informed browser policy, progressive enhancement decisions, and a 10% JavaScript bundle reduction while integrating Baseline into development practice.
- [Cybozu case study](https://web.dev/case-studies/cybozu-baseline) reports 98.8% user coverage for its chosen policy, build-time tooling, reduced manual browser-version maintenance, and a shared vocabulary across teams.
- [Browserslist integration](https://web.dev/articles/use-baseline-with-browserslist) shows how the concept becomes actionable in existing build tools rather than remaining content alone.

### Candidate lessons to test

- Broad success can come from reducing uncertainty across developers' existing workflow rather than launching one new API.
- Neutral, cross-browser framing and shared data can reduce contention.
- Tooling, common vocabulary, RUM/analytics, case studies, and integration into linters/build systems are adoption mechanisms; articles alone are not.
- Initiative success should be measured through workflow and business outcomes, not only awareness.

## Prompt API — evidence presentation and interoperability dispute

### Public record

- [Mozilla standards position #1213](https://github.com/mozilla/standards-positions/issues/1213) records a negative position and detailed concerns about model-specific behavior, neutrality, policies, interoperability, and the need for more userland experimentation.
- [W3C TAG design review #1093](https://tag-github-bot.w3.org/gh/w3ctag/design-reviews/1093) records lack of consensus plus concerns including model variability, low-end devices, compute costs, privacy, model acquisition, and testable guarantees.
- [Blink Intent to Ship](https://groups.google.com/a/chromium.org/g/blink-dev/c/iR6R7-nQeHI) contains first-party discussion acknowledging that initially presented developer sentiment could have been fresher and more complete, plus requests for attributable partners, interoperability work, and an open eval suite.

### Candidate lessons to test

- General interest in AI is not evidence for one API shape or its interoperability.
- Evidence quality includes public presentation, methods, denominators, representativeness, and contradictory findings—not only whether private research occurred.
- Vendor-specific model behavior and terms can become platform-neutrality and compatibility concerns.
- An open, use-case-based eval suite can be both product evidence and an interoperability mechanism for non-deterministic APIs.

## Web Environment Integrity — unanticipated or insufficiently addressed constituencies

### Public record

- The [proposal explainer](https://github.com/explainers-by-googlers/Web-Environment-Integrity/blob/main/explainer.md) is marked no longer pursued and acknowledges tension between anti-fraud utility and exclusion of browsers, operating systems, or users.
- [Mozilla standards position #852](https://github.com/mozilla/standards-positions/issues/852) records a negative position grounded in openness, access, assistive technology, testing, archiving, and search concerns.
- [EFF critique](https://www.eff.org/deeplinks/2023/08/your-computer-should-say-what-you-tell-it-say-1) argues that attestation shifts control from users to service operators and creates foreseeable browser/OS exclusion and competition risks.

### Candidate lessons to test

- Anti-fraud benefits to service operators cannot automatically be described as user benefits.
- Analyze hostile and dominant-site use, not only intended use.
- Accessibility, automation, testing, archiving, browser choice, open-source implementation, gatekeeping, and competition were materially affected constituencies.
- A safeguard must be tested against the incentives of sites and attesters; a stated intention against abuse is not evidence that abuse will not occur.
- Early stakeholder critique may reveal that narrowing scope or abandoning an open-web API is better than communications work.

## Evaluation discipline

For a historical replay:

1. Freeze sources to those available by the simulated decision date.
2. Hide later outcomes from the system under evaluation.
3. Ask for stakeholder discovery, evidence assessment, and recommended action.
4. Score whether it identifies concerns that were knowable then—not whether it predicts history perfectly.
5. Run both strong and weak cases to prevent an evaluator that merely rejects every proposal.
