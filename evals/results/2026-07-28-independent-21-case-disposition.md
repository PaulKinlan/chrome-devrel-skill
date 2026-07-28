# Independent 21-case evaluation disposition

**Date:** 2026-07-28  
**Verdict:** **ACCEPT**, with documented legacy provenance limits.  
**Scope:** artifact completeness, denominator integrity, responder/judge independence, and rubric-result structure. Scores remain judgments of observable responses, not factual verification.

## Exact disposition

| Disposition | Count |
| --- | ---: |
| Complete, independently judged | 21 |
| Unscored | 0 |
| Blocked | 0 |
| Pending | 0 |
| Duplicate authoritative case IDs | 0 |
| Missing case IDs | 0 |
| **Fixed denominator** | **21** |

The 21 authoritative results exactly match the 21 IDs in `evals/cases.json`. The negative control and aborted attempt are outside this denominator.

## Authoritative runs

| Run | Runner | Complete | Independent | Score range (0–4 mean) | Validator |
| --- | ---: | ---: | ---: | ---: | --- |
| `2026-07-27-independent-pilot` | v1 | 3/3 | 3/3 | 4.000–4.000 | 0 errors, 2 legacy warnings |
| `2026-07-27-independent-batch2` | v1 | 5/5 | 5/5 | 3.400–4.000 | 0 errors, 1 legacy warning |
| `2026-07-28-independent-batch3` | v2 | 4/4 | 4/4 | 2.750–4.000 | 0 errors, 0 warnings |
| `2026-07-28-independent-batch4` | v2 | 4/4 | 4/4 | 2.333–3.500 | 0 errors, 0 warnings |
| `2026-07-28-independent-batch5` | v2 | 3/3 | 3/3 | 2.800–4.000 | 0 errors, 0 warnings |
| `2026-07-28-independent-batch6` | v2 | 2/2 | 2/2 | 3.400–3.600 | 0 errors, 0 warnings |
| **Total** | v1: 8 cases; v2: 13 cases | **21/21** | **21/21** | **2.333–4.000** | **0 errors** |

Every completed normalized result has distinct non-null responder/judge PIDs, null shared-session fields, raw-output hashes, zero parse errors, and all focus dimensions scored. Result Markdown and raw responder/judge logs exist for every case.

## Exceptions retained rather than hidden

- **Critical-failure hits:** 0/21.
- **Forbidden-behavior findings:** 0/21.
- **Unable-to-score dimensions:** 0/21.
- **Capped results:** 0/21.
- **Retries:** one. `editorial-blog-hype-and-house-style` used judge attempt 2 after attempt 1 did not yield a usable verdict. The successful attempt and failed-attempt logs are both retained.
- **Non-max scores:** retained. The lowest means were `fixed-denominator-launch-retrospective` at 2.333/4, `devrel-in-a-box` at 2.750/4, and `deep-ecosystem-native-miniapp-agent-research` at 2.800/4. These are learning signals, not rewritten as passes.

## Calibration

`negative-control-1-2026-07-28` is outside the 21-case denominator. The blind judge scored the deliberately bad response 1/12 (mean 0.333), applied the cap, hit all five critical-failure categories, flagged both required forbidden behaviors, and met the fixture expectation. This demonstrates discrimination against this control; it does not prove judge correctness or factual accuracy.

## Legacy and aborted evidence

- The two v1 runs cover 8 cases. They establish independent responder/judge processes through distinct PIDs and raw artifacts, but the v1 runner did not bind its implementation hash or staged skill-tree hash. The pilot also did not record tool configuration. These runs are accepted as independent judgments, **not** as byte-reproducible runner executions.
- The four v2 runs cover 13 cases and bind runner SHA `5143b702c7598c52042765d444e7b7f926462b900187d96c290d7af38c79fc96`, fixed inputs, tool configuration, responder `SKILL.md`, and the staged skill tree.
- Stale attempt `2026-07-27-independent-batch3` is terminally recorded under `evals/aborted/`. It produced no run manifest or result and has no denominator impact. The clean `2026-07-28-independent-batch3` supersedes it.

## Independent review and correction

A separate fresh-context `anthropic/claude-haiku-4` process inspected the six runs and returned **ACCEPT**. Parent-side deterministic reconciliation did not blindly adopt its prose: it corrected the reviewer's mistaken “16 v2 cases” to **13** and its missed retry to **one judge retry**. The disposition above is based on repository validators plus direct JSON/log enumeration.

## Commands

```bash
node evals/validate.mjs
node evals/validate-eval-results.mjs --run 2026-07-27-independent-pilot
node evals/validate-eval-results.mjs --run 2026-07-27-independent-batch2
node evals/validate-eval-results.mjs --run 2026-07-28-independent-batch3
node evals/validate-eval-results.mjs --run 2026-07-28-independent-batch4
node evals/validate-eval-results.mjs --run 2026-07-28-independent-batch5
node evals/validate-eval-results.mjs --run 2026-07-28-independent-batch6
```

## Residual risks

- One fixed judge model does not establish inter-judge agreement.
- High scores do not prove claims are true or recommendations are correct.
- Read-only or unavailable retrieval surfaces reduced execution depth in some research/retrospective cases; the lower scores remain visible.
- The v1 provenance limits cannot be repaired retrospectively without rerunning those 8 cases under v2.
