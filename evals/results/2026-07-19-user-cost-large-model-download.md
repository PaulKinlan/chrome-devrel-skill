# Baseline: user-cost-large-model-download

- **Date:** 2026-07-19
- **Skill state:** working tree after `d281bdd`
- **Evaluator:** independent read-only Pi session
- **Status:** uncalibrated baseline

## Result

- **Score:** 19/20 across five focus dimensions
- **Critical failures:** none
- **Forbidden behaviors:** all avoided

| Dimension | Score | Finding |
|---|---:|---|
| end-user-impact | 4/4 | Separated end users, developers, and implementers; covered download/resource cost, consent/control, low-end devices, background use, updates, fallback, and abuse. |
| evidence-hygiene | 4/4 | Marked “private” unsupported, “zero-cost” contradicted, developer ease supported, and local execution factual but insufficient. |
| power-and-incentives | 3/4 | Identified cost shifting, lock-in, and competition but needed a stronger gatekeeping analysis for browser-controlled models/capabilities. |
| authority-boundary | 4/4 | Marked every discipline as pre-review analysis and required formal review. |
| critique-to-action | 4/4 | Required product controls, device measurements, abuse limits, engine engagement, and more accurate claims. |

## Key evidence

> “Local inference shifts compute cost to the user's device.”

> “Without a data-flow analysis, ‘private’ is a marketing claim, not a technical finding.”

## Eval-driven improvement

The user-impact module now asks whether a browser-supplied model, service, identity, attester, or policy lets the browser control capabilities, quality, terms, or updates and whether independent implementations have a genuinely substitutable path.
