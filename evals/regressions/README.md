# Behavioral regression contracts

These fixtures preserve user-reported behavior that the skill must not regress. They are machine-validated contract inputs, not model-scored eval results and not part of the fixed 21-case independent baseline denominator.

A fixture records the triggering prompt, required behavior, forbidden behavior, evidence boundary, and arithmetic invariants. Future independent responder/judge runs may promote a fixture into a versioned scored eval without rewriting the historical 21-case baseline.

## Current fixtures

- `launch-management-execution.json` — a DevRel request to manage a named feature launch must build and run samples/demos, derive friction from execution, and create patch-ready docs instead of returning only a plan.
- `standards-incubation-link-closure.json` — standards-position and launch reviews must treat no signal as no recorded position, read complete Mozilla/WebKit/TAG/incubation records, and disposition every substantive cross-link instead of copying dashboard labels.
- `implementation-browser-completion.json` — readiness work must search implementation trackers/source/tests across engines, launch and validate in Chrome through chrome-devtools-mcp, and continue implied reversible work until success or a confirmed blocker.
