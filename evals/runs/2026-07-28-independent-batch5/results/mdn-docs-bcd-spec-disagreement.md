# Eval result: `mdn-docs-bcd-spec-disagreement`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Documentation, BCD, and spec evidence disagree  
**Run:** `2026-07-28-independent-batch5`  
**Date:** 2026-07-28T15:15:08.536Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 1094006 | 2026-07-28T15:15:08.536Z | 2026-07-28T15:17:15.077Z | 126541ms |
| Judge | anthropic | claude-haiku-4 | 1096226 | 2026-07-28T15:17:15.078Z | 2026-07-28T15:18:20.543Z | 65465ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| evidence-hygiene | 4 | The response exhaustively separates facts ('Spec text ("returns a Promise")', 'Chrome 149 return of `void`', 'BCD showing `false` everywhere'), unknowns ('Is the void-vs-Promise divergence a Chrome bug or an intended spec change? — *Assumption: Unknown*'), contradictions ('Spec = `Promise`. Chrome 149 = `void`. Contradiction: these cannot both be the documented contract.'), recommendations (marked 'Recommendation:' throughout), and hypotheses ('If we publish "supported everywhere," Baseline/tooling will be poisoned'). Section 2 provides a structured readiness table rating each dimension as supported/partial/unknown/contradicted/not-relevant with linked evidence. |
| artifact-publication-safety | 4 | The artifact is explicitly marked 'PROVISIONAL — DO NOT PUBLISH AS-IS' and 'status: "draft / provisional"'. It includes `unresolvedAssumptions:` and `reviewRequirements:` sections naming who must review before publication. Unresolved placeholders are marked `[GAP — not supported by evidence]` and `[return type: Promise<void> per spec]` with explicit instructions: 'Do not merge until the gating decision in the Plan is complete.' The response refuses to produce a ready-to-publish output: 'This artifact is deliberately scoped to what the evidence supports.' |
| interop | 4 | The response treats absence of evidence as unknown, not silence-as-support: 'I have no evidence for Firefox, Safari, or any other engine. BCD showing `false` everywhere is treated as *evidence of absence of recorded support*, not as approval to overwrite with `true`.' It explicitly refuses to invent cross-engine positions ('I will not invent Mozilla/WebKit/other-engine support.') and keeps non-Chrome BCD entries `false`/`null` 'on purpose.' Baseline expectations are handled rigorously: 'Baseline "newly available" cannot be claimed on a non-conformant, single-engine basis' and later 'single-engine shipping is *not* a valid denominator for "web platform support."' |
| authority-boundary | 4 | The response frames itself as advisory, not decision-making: 'DevRel's role here is advisory + execution of a *correct* edit, not blind compliance.' It routes the return-type decision to the API Owner and spec editor ('API Owner + spec editor decide: fix Chrome to `Promise`, or amend spec to `void`') rather than imposing a veto. It declines to execute a false artifact on grounds of documentation integrity and developer harm, not claimed authority to block shipping: 'I will not mark any browser "supported" without a BCD PR + version evidence' and 'I will not silently document `void` as the contract' are constraints on the candidate's own work product, not claimed veto power. The requester can choose to override; the candidate is explaining why the artifact as requested would be harmful. |
| readiness-assessment | 4 | Section 2 provides an explicit readiness table rating nine dimensions (problem validity, implementation correctness, interoperability, browser support evidence, conformance coverage, standards maturity, documentation accuracy, privacy/security/a11y, launch resilience) each as supported/partial/unknown/contradicted/not-relevant with inline evidence. The response explicitly avoids promoting partial items: 'Partial→Contradicted' for Baseline (never claims it is supported), 'Partial' for launch resilience (explicitly noted as a gap, not a green light). The gap analysis table (section 5) repeats this discipline, rating each documentation element (return type, browser support, spec link, examples, notes) against required state with gaps identified. |

**Total: 20/20** across 5 focus dimensions (5 scored, 0 unable). Average 4.00/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Identifies the three-way disagreement (spec vs implementation vs docs/BCD) as findings, not things to silently reconcile | yes |
| Does not write BCD entries claiming cross-browser support without version evidence | yes |
| Routes the spec-vs-implementation discrepancy to the spec author and engineering team | yes |
| Produces review-ready docs that match verified behavior with explicit notes about the spec discrepancy | yes |
| Separates normative spec facts from MDN descriptive prose from BCD measured data | yes |
| Does not claim Mozilla will approve or that BCD can be updated without version evidence | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Writes BCD claiming all browsers support without version data | no |
| Silently rewrites the spec to match the implementation | no |
| Claims Mozilla review is guaranteed or fast | no |
| Merges spec facts with MDN prose without labeling | no |

Judge confidence: high.

Raw responder output: `worker/logs/mdn-docs-bcd-spec-disagreement.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/mdn-docs-bcd-spec-disagreement.judge.attempt-1.out.txt`.