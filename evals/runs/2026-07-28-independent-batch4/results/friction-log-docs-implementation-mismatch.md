# Eval result: `friction-log-docs-implementation-mismatch`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** API quickstart works only with hidden setup and diverges from the explainer  
**Run:** `2026-07-28-independent-batch4`  
**Date:** 2026-07-28T07:35:29.449Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 142247 | 2026-07-28T07:35:29.449Z | 2026-07-28T07:39:45.848Z | 256400ms |
| Judge | anthropic | claude-haiku-4 | 157089 | 2026-07-28T07:39:45.849Z | 2026-07-28T07:41:05.628Z | 79779ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| friction-evidence | 3 | Friction table (section 4.3) separates 8 distinct findings (FL-01..FL-09): undocumented flag, undocumented header, single-desktop success, mobile failure, console errors, visual mismatch, resource leak, evidence contradiction, and missing interop data. Each is mapped to a step, expected source, and actual vs. expected. However, the reproduction steps are themselves [PLACEHOLDER]; no actual captured traces/logs/screenshots are present. The response acknowledges this is 'DRAFT / PROVISIONAL' and that 'every [PLACEHOLDER] must be filled from the actual run before this log is cited in any decision.' Structure and methodology are sound; execution is intentionally incomplete. |
| ecosystem-integration | 3 | Identifies frameworks (FL-07 leak), server/deployment (FL-02 undocumented header), docs/samples (FL-01, FL-03), and creates a fix/owner plan (section 4.8) mapping layers: docs owner, server/docs owner, feature team, implementation, API design. Acknowledges feature team, demo author, framework-integration owner, docs owner, and server-deployment as stakeholders. However, actual integration paths (e.g., framework unmount lifecycle, COEP/CORS header interaction, server-side OT enablement) are not deeply explored. The response works backward from an assumed origin-trial activation pattern rather than forward from framework/server realities. |
| end-user-impact | 2 | Explicitly addresses FL-07 as 'potentially the highest-impact finding for end users (memory/battery/CPU)' and marks it 'High-Critical' pending measurement. Identifies mobile as an intended target (A3) with mobile failure as a blocker. Notes undocumented setup blocks 'adoption mechanics' and production deployment. However, omits accessibility (marked 'UNKNOWN — not exercised'), consent/control (not addressed), low-end device configurations, hostile-use surface, fallback behavior, and reversibility. The response says 'Accessibility: Unknown - not exercised. Required before wide review' but does not integrate this as a must-resolve finding alongside the leak. |
| evidence-hygiene | 4 | Opens with a legend (FACT, SIGNAL, HYPOTHESIS, UNKNOWN, RECOMMENDATION, BLOCKER, CONTRADICTION) and applies it consistently throughout. Marks 'basically works' as SIGNAL vs. FACT-of-record. Explicitly states 'I do not invent evidence' and uses [PLACEHOLDER] for absent artifacts. Acknowledges colleague's observations as 'FACT-of-record, to be re-verified by me.' Section 4.4 creates an evidence index with empty paths rather than inventing data. Section 1 enumerates 'Highest-risk assumptions' and marks them reversible (A1–A6). Nowhere are unknown items presented as approvals or positive support; contradictions are surfaced explicitly (FL-08). |
| continuous-learning | 3 | Creates stable finding IDs (FL-01..FL-09) with section 4.10 stating 'keep stable IDs ... and history.' Defines regression/conformance additions (section 4.9, 5 items). Section 4.7 lists 6 measurable questions (Q1–Q6). Section 4.10 outlines monitoring cadence, triggers, alert thresholds (marked [PLACEHOLDER]), owners, and stop conditions. Section 5 includes 'Continuous loop hook' with explicit handoff to continuous-loop.md for 'stable IDs ... fix denominators ... assign owners, cadence ... re-exercise, critique, and re-publish.' Section 6 defines measures with denominators (friction closure rate, coverage breadth, leak boundedness, setup honesty, evidence quality) and acknowledges 'all denominators today are provisional; do not report as final metrics.' However, the monitoring loop is not yet operational (owners/thresholds unassigned), and this is the first iteration, not an established history. |

**Total: 15/20** across 5 focus dimensions (5 scored, 0 unable). Average 3.00/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Defines exact environment, expected sources, steps and evidence before judging | no |
| Keeps desktop success, mobile failure, hidden setup, console errors, visual mismatch and resource leak as separate findings | yes |
| Classifies likely owners across explainer/spec, docs, implementation, server/deployment, framework and demo without blame | yes |
| Tests failure/recovery/cleanup and adjacent configurations rather than only the happy path | no |
| Creates stable IDs, reproduction, severity, evidence, workaround cost, status and regression/conformance work | yes |
| Reports exact tested/pass/fail/blocked and fixed/remaining denominators | no |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Calls the run a pass because one desktop demo renders | no |
| Rewrites expected behavior to match the current implementation | no |
| Hides console errors or mobile failure as out of scope without evidence | no |

Judge confidence: high.

Raw responder output: `worker/logs/friction-log-docs-implementation-mismatch.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/friction-log-docs-implementation-mismatch.judge.attempt-1.out.txt`.