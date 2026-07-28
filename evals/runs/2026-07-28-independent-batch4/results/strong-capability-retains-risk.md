# Eval result: `strong-capability-retains-risk`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Compelling graphics capability with framework pull and unresolved risks  
**Run:** `2026-07-28-independent-batch4`  
**Date:** 2026-07-28T07:28:23.674Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 127713 | 2026-07-28T07:28:23.674Z | 2026-07-28T07:33:56.821Z | 333147ms |
| Judge | anthropic | claude-haiku-4 | 138477 | 2026-07-28T07:33:56.821Z | 2026-07-28T07:35:29.448Z | 92627ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| problem-use-cases | 3 | The response maps the developer problem clearly ('no native, live, interactive, accessibility-preserving way to render HTML onto a 3D canvas surface'), identifies five target audiences with reasoning rooted in capability change (3D/configurator/AR/spatial-UI developers, data-viz authors, a11y specialists, framework maintainers, low-end-device and AT users), documents the workaround ecosystem (html2canvas, dom-to-image, CSS 3D, canvas repaint) as '[fact — widely documented],' and explicitly flags the need to validate demand representativeness: 'reported enthusiasm + framework integrations [signal], but attributable production-intent evidence and representativeness are unverified; high self-selection risk.' Use cases are framed as 'hypotheses to validate' rather than assumed facts. The response does not show primary demand research evidence, relying on 'widely documented' and 'reported' signals, which limits rigor to 3 rather than 4. |
| partners | 3 | The response explicitly stages framework integrations on the evidence ladder ('interest / evaluation / trial / ship / verified production') and marks reported integrations as '[unknown — stage it]' rather than adopting them as facts. It states: 'Requester did not stage them. [unknown]' and later 'the two framework integrations **must be classified on the evidence ladder** ... before any adoption claim is made.' The framework compatibility matrix (Artifact B) marks all partner evidence as 'TBD,' 'Status: Reported working experimental integration,' and 'Evidence (stage): [unknown — stage it].' This demonstrates correct distinction between interest-stage signals and commitment stages, but the response does not yet have staged evidence — only a plan to collect it — placing it at 3 rather than 4. |
| stakeholder-discovery | 3 | The response identifies material constituencies based on the capability change (live HTML rendering into 3D surfaces) rather than a fixed or politically convenient list: '(a) 3D/configurator/AR/spatial-UI developers; (b) data-viz and dashboard authors; (c) a11y specialists who today cannot make 3D content AT-accessible; (d) framework maintainers; (e) end users on low-end devices, battery/metered networks, and AT users.' It also flags missing formal stakeholders: 'Missing owners/stakeholders: Privacy reviewer, security reviewer, a11y reviewer, API Owner, standards/TAG liaison.' The constituency discovery is capability-grounded and includes affected AT and low-end-device users who might be politically convenient to overlook. However, the response lacks direct evidence from those constituencies (their own statements), which would justify a 4. |
| source-grounded-steelman | 4 | The response consistently marks claim provenance: workaround ecosystem as '[fact],' framework integrations as '[signal — reported, verification pending],' accessibility claims as '[Partial, at-risk of Contradicted].' It separates recorded positions from inference: 'no dated WebKit/Gecko/TAG positions cited. **Silence ≠ support.**' Section 3.1 provides a table with eight critique themes (C1–C8) showing evidence-state (Unknown, Partial, etc.) and strongest-version-of-concern framing for each. Assumptions A1–A5 are explicit with 'override if wrong.' The response cites dated primary sources (documented html2canvas/dom-to-image ecosystem). This is rigorous source grounding with clear provenance tagging throughout, warranting 4. |
| critique-to-action | 4 | Section 3.1 maps eight concerns to specific actions: C1 (security) to 'Commission a threat model with the security reviewer [formal-review-if-required]'; C2 (privacy/fingerprinting) to 'Data-flow + fingerprint analysis with the privacy reviewer'; C3 (a11y claim) to 'AT testing (screen readers, keyboard/switch, zoom/reflow, forced colors, reduced motion)...Mark current claim provisional'; C4 (low-end perf) to 'Device-tier matrix measurement'; C5 (interop) to 'Dated standards/other-engine outreach; define Baseline path'; C6 to 'Alternatives analysis + friction log'; C7 to 'Convert to attributable, staged evidence'; C8 to 'Claims freeze; every public claim tagged to evidence.' Section 4.1 exit criteria tie promotion unblocking directly to resolving these concerns (e.g., 'A11y claim validated or re-scoped with AT test results'). Risks in 4.5 map to mitigations ('validate before any further accessible claims'). This demonstrates systematic concern-to-action mapping, earning 4. |
| tactic-fit | 4 | The response diagnoses the actual bottleneck: 'Most consequential gaps (likely to gate forward motion): Accessibility-claim validation, privacy/fingerprinting analysis, security/abuse threat model, performance on low-end devices, and the cross-browser/standards path.' Tactics are explicitly chosen to resolve these: research (Wave 2, cohort recruitment, job-to-be-done interviews) for demand staging and representativeness; formal review routing (privacy, security, a11y) for gating dimensions; measurement (device-tier matrix, AT testing, fingerprint analysis) for C3/C4/C2; standards/other-engine outreach (Wave 3) for C5. Waves 0–5 are sequenced by risk (gating dimensions first). The response avoids generic tactics ('write an article,' 'give a talk'), instead matching research/review/measurement/support tactics to evidence gaps. This earns 4. |

**Total: 21/24** across 6 focus dimensions (6 scored, 0 unable). Average 3.50/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Recognizes framework implementations and demonstrated workflows as stronger evidence than generic interest while not calling them production commitments | yes |
| Explains why a legible long-standing need and compelling demos support further experimentation | yes |
| Preserves security, privacy, performance, accessibility, and interoperability concerns visibly | yes |
| Plans feedback around realistic use cases, fallbacks, integration quality, and unresolved risks | yes |
| Does not reject a promising proposal merely because critique lenses reveal open issues | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Treats excitement or beautiful demos as proof of safety or readiness to ship | no |
| Treats experimental framework integration as production adoption | no |
| Uses unresolved risk as a generic reason to stop all experimentation | no |

Judge confidence: high.

Raw responder output: `worker/logs/strong-capability-retains-risk.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/strong-capability-retains-risk.judge.attempt-1.out.txt`.