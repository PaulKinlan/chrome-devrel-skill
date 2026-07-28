# Completion-driven execution loop

Use this module whenever the user asks the skill to manage, build, write, test, audit, validate, fix, prepare, or launch something. Treat those verbs as goals to achieve, not menu options to return to the user. For a concrete launch/readiness run, also load `modules/launch-acceptance.md`: only its validator may compute success; worker-authored statuses and prose are candidate input.

## Default autonomy

For public research and reversible local work, continue without asking whether to perform the next obvious step. In particular:

- “docs are missing” means create and validate the local draft/patch;
- “a demo is needed” means build and run it;
- “this should be tested” means create the case, launch the required runtime, execute it, and retain evidence;
- “this may be broken” means attempt reproduction before calling it observed friction;
- “more sources are needed” means continue the declared source/query frontier;
- “a fix is needed” means apply a reversible local correction and re-run the failed checks when the target workspace permits it.

Do not end with “Would you like me to write/test/build…?” when that work is already an implied goal and can be completed safely with current access.

## Goal ledger

Create stable goal IDs and track each as:

- `pending`;
- `in_progress`;
- `succeeded` with evidence;
- `failed_retryable` with the next bounded correction;
- `blocked` with an exact external access/environment/authority dependency;
- `decision_required` when bounded materially distinct corrections are exhausted and an authorized product/engineering/scope decision is required;
- `not_applicable` with evidence, never as a synonym for untested.

For each goal define observable success, required evidence, validation command/runtime, dependencies, mutation/authority boundary, attempt count, artifact paths, and residual risk.

Use exact arithmetic:

- `goal_total = pending + in_progress + succeeded + failed_retryable + blocked + decision_required + not_applicable`;
- `goal_terminal = succeeded + blocked + decision_required + not_applicable`;
- completion requires `pending = 0`, `in_progress = 0`, and `failed_retryable = 0`, so `goal_total = goal_terminal`;
- **Succeeded** requires `blocked = 0` and `decision_required = 0`;
- a partial/stopped run may contain blocked or decision-required goals only when each exact dependency/decision and impact is reported.

## Execute until success or terminal blockage

Repeat:

1. select the highest-value unblocked goal;
2. retrieve missing public evidence;
3. create or modify the reversible local artifact;
4. execute the smallest representative validation;
5. inspect actual output, browser state, console/network, tests, build, and artifact integrity as applicable;
6. record pass/failure evidence;
7. on failure, diagnose and apply a bounded correction;
8. re-run the exact failed case plus adjacent regression cases;
9. re-run full semantic-fact and artifact-integrity gates, then add any newly discovered friction to the frontier;
10. run the online launch-acceptance validator and feed its exact structured failures into the next correction;
11. continue until the validator succeeds, or every remaining goal is not applicable with evidence or terminally blocked.

Do not loop indefinitely. Default to at most three correction attempts for the same goal in the same environment. Every retry must record a materially changed hypothesis, artifact/code change, input, configuration, browser/runtime environment, or evidence source plus the expected discriminating result; an identical retry is forbidden. New external evidence or a materially different environment may open a new bounded attempt series.

A goal is `blocked` only when an exact external access, hardware, browser build/platform, credential, authority, service, or network dependency prevents progress. Retry-budget exhaustion alone is not a blocker. If three materially distinct attempts fail and no further novel local correction is justified, mark `decision_required` with the attempts, remaining hypotheses, evidence, and required owner decision. Preserve partial artifacts and exact attempts.

## Questions that justify stopping

Ask the user only when progress requires one of these:

- a product, scope, policy, risk-acceptance, or standards decision that evidence cannot make;
- approved private evidence or credentials not already available;
- a destructive, irreversible, external, public, production, or reputation-bearing action;
- confirmed authority to represent a team or open/publish an external change;
- unavailable hardware, browser channel/build, operating system, account, service, or network capability;
- conflicting canonical requirements with no authorized owner decision;
- a material ambiguity where choosing silently could invalidate the work.

A missing public link, absent local file, failing test, incomplete demo, stale docs page, or untried browser case is not by itself a reason to ask the user. Research, build, test, fix, or mark the genuinely unavailable environment blocked.

## Chrome launch gate

For a Chrome feature launch/readiness goal, content creation is not successful until the comprehensive standalone samples and demos have been launched in Chrome and their expected behavior exercised. Source review, lint, unit tests, screenshots of static markup, mocks, prose, or a model-authored transcript are insufficient runtime evidence.

Use `chrome-devtools-mcp` for Chrome browser validation when the host provides it. The parent/integrator—not the artifact-writing leaf—records the exact browser version, MCP event log, interactions, console/network captures, assertions, and saved screenshot files in the run bundle. If the tool cannot be connected or the required Chrome build/platform cannot be launched, record the runtime goal as blocked; do not call the demo, documentation example, friction run, or launch enablement successful.

## Completion report

Return only after the loop reaches one of these:

- **Succeeded:** all applicable goals have current execution evidence and the online launch-acceptance validator computed `succeeded`.
- **Partial — terminally blocked:** all currently executable work is complete and every remaining blocked goal has an exact external dependency, attempts, impact, and owner/next action.
- **Stopped for decision/authority:** all currently executable work is complete and every `decision_required` goal records the three materially distinct attempts, remaining hypotheses, and authorized owner question.

Report:

1. goal denominator and state counts;
2. created/changed artifact paths;
3. validations and runtime environments actually executed;
4. failures corrected and re-run evidence;
5. terminal blockers and what each prevents claiming;
6. remaining human decisions or external actions.

A plan, recommendation list, content draft without runtime validation, claimed-but-unsaved screenshot, unverified BCD/release value, open or fixed-unverified friction item, or question about whether to perform an already implied task is not completion.
