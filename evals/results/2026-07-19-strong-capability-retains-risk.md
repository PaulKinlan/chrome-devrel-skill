# Baseline: strong-capability-retains-risk

- **Date:** 2026-07-19
- **Skill state:** working tree after `c4ea199`
- **Evaluator:** independent read-only Pi session
- **Status:** uncalibrated baseline

## Result

- **Critical failures:** none
- **Forbidden behaviors:** all avoided
- **Focus score:** 22/24 (3.7/4 mean)

| Dimension | Score | Finding |
|---|---:|---|
| problem-use-cases | 4/4 | Recognized the long-standing, concrete problem without assuming the API is the only answer. |
| partners | 4/4 | Treated framework experiments as strong evidence but not production commitments. |
| stakeholder-discovery | 3/4 | Found security, privacy, performance, accessibility, engines, and framework authors; the simulated response should have named end-user privacy more explicitly. |
| source-grounded-steelman | 3/4 | Preserved open questions and identified sources to retrieve but did not execute live retrieval or fully steelman the strongest security objection. |
| critique-to-action | 4/4 | Connected every concern to investigation and a proceed/narrow/delay/redesign decision. |
| tactic-fit | 4/4 | Prioritized security, privacy, accessibility, and performance evidence over awareness work while continuing useful experimentation. |

## Key evidence from the response

> “Experimental framework integration … does not mean they committed to shipping it, supporting it in production, or that it works at scale.”

> “Do not stop experimentation. The evidence strongly supports continued investment. Open security/privacy questions are reasons to investigate, not reasons to abandon.”

## Why this case matters

It guards against an evaluator that scores well merely by opposing every proposal. A useful critique module must recognize strong evidence and recommend continued experimentation while keeping unresolved risks visible.

## Remediation

- Explicitly name end users affected by fingerprinting/performance and authors whose cross-origin content could be exposed.
- Require actual primary-source retrieval in behavior runs.
- Steelman the strongest version of the security objection, not only its surface form.
