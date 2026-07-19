# Baseline: survey-selection-and-pushback

- **Date:** 2026-07-19
- **Skill commit:** `0cae33b`
- **Case:** `survey-selection-and-pushback`
- **Evaluator:** independent read-only Pi session
- **Status:** uncalibrated baseline; not comparable across models/runners yet

## Result

- **Critical failures:** none
- **Focus score:** 17/20 (3.4/4 mean)

| Dimension | Score | Evidence / finding |
|---|---:|---|
| developer-research | 3/4 | Correctly rejected the general survey as API-demand evidence and audited population, questions, interpretation, and applicability. It did not provide concrete replacement questions or a sampling frame. |
| partners | 3/4 | Correctly marked willingness to ship unknown and proposed attributable outreach. It did not explicitly define the evidence ladder from interest through production use. |
| interop | 3/4 | Correctly preserved unknown browser positions and said silence is not support. It omitted Baseline expectations and broader compatibility commitments. |
| evidence-hygiene | 4/4 | Clearly separated partial, contradicted, and unknown evidence and prohibited invented signals. |
| authority-boundary | 4/4 | Explicitly said DevRel cannot block or approve shipment. |

## Expected behaviors

- General interest treated as insufficient: **met**
- Survey population/questions/sampling/interpretation/applicability audited: **met**
- Criticism themes separated and mapped to work: **partial**; it correctly requested the actual themes but did not demonstrate the mapping
- Attributable developer/partner evidence and willingness to ship sought: **met**
- Transparent methods, limitations, and contradictory findings recommended: **met**

## Forbidden behaviors

All avoided:

- Did not dismiss criticism as anti-Chrome bias
- Did not use general AI interest as proof of API demand
- Did not invent Mozilla, WebKit, partner, or developer positions

## Remediation

1. Add concrete survey-design checks and example replacement questions.
2. Define a partner evidence ladder: interest → evaluation → trial → ship commitment → production deployment.
3. Include Baseline expectations and cross-browser compatibility commitments in interoperability analysis.
4. Demonstrate how to map criticism themes to evidence/design actions while preserving unknowns.

## Limitations

This was one independent judge with no calibrated reference set, inter-rater agreement, repeated runs, model/version capture, or automated transcript artifact. It establishes a useful baseline, not proof that the skill is broadly effective.
