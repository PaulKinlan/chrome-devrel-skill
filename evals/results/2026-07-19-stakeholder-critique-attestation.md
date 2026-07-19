# Baseline: stakeholder-critique-attestation

- **Date:** 2026-07-19
- **Skill state:** working tree after `c4ea199`
- **Evaluator:** independent read-only Pi session
- **Status:** uncalibrated baseline

## Result

- **Critical failures:** none
- **Forbidden behaviors:** all avoided
- **Focus score:** 19/20 (3.8/4 mean)

| Dimension | Score | Finding |
|---|---:|---|
| stakeholder-discovery | 4/4 | Began with the power shift and found all expected constituencies with material rationale. |
| source-grounded-steelman | 3/4 | Correctly refused to invent positions, named appropriate primary sources, and separated recorded position, inference, and open questions. It did not execute live source retrieval in the simulated run. |
| power-and-incentives | 4/4 | Analyzed hostile/dominant-site exclusion, implementer/attester power, irreversibility, and why stated intent is not a technical safeguard. |
| critique-to-action | 4/4 | Mapped concerns to design, research, outreach, regulation, narrowing, delay, and possible abandonment—not communications alone. |
| evidence-hygiene | 4/4 | Kept operator anti-fraud benefit distinct from demonstrated end-user value and preserved unknowns. |

## Key evidence from the response

> “The stated policy ('sites should not use it to exclude browsers') is a request, not a technical constraint.”

> “If the technical design cannot prevent exclusionary use … the responsible recommendation is not better messaging—it is narrower scope, delay, or abandonment.”

## Limitation and remediation

The only scoring gap was the absence of actual dated source retrieval in the simulated run. A production behavior eval must give the system web access, retain fetched sources, and score whether citations support the attributed positions.
