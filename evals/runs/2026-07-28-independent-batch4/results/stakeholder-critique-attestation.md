# Eval result: `stakeholder-critique-attestation`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Anti-fraud attestation changes who controls access  
**Run:** `2026-07-28-independent-batch4`  
**Date:** 2026-07-28T07:21:49.852Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 116444 | 2026-07-28T07:21:49.852Z | 2026-07-28T07:26:52.764Z | 302912ms |
| Judge | anthropic | claude-haiku-4 | 125362 | 2026-07-28T07:26:52.765Z | 2026-07-28T07:28:23.671Z | 90906ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| stakeholder-discovery | 3 | Section 3a grounds stakeholder selection explicitly in power shifts (who gains/loses capability, choice, access) before 3b lists constituencies. The response identifies affected groups across users (split by device type, access needs, automation), browser implementers (named: Mozilla, WebKit, Brave, Vivaldi, Opera, Tor Browser), standards bodies (W3C TAG, WICG, WHATWG), civil society (EFF), regulators (DMA, CMA, FTC, DPA), and open-source communities. This is differentiated beyond a fixed list and grounded in capability/power rather than political convenience. The scope of affected constituencies is comprehensive and principled. |
| source-grounded-steelman | 1 | The response explicitly refuses to retrieve primary sources, stating 'I will **not** write remembered positions for Mozilla/WebKit/EFF/regulators' and 'all stakeholder positions below are marked "principle-grounded inference" or "open question"'. Section 3c flags source retrieval as an 'open question' and states 'I have **not** fabricated dates, quotes, or URLs here — retrieval is a flagged task with owner + due date below.' While section 3d presents steelmanned concerns with logical strength (e.g., themes 1–10 articulate the strongest recognizable version of each concern), these are principle-derived rather than grounded in dated primary sources. The response recognizes the requirement (3c, 4, 5) but does not execute it, treating the dimension as a future activity rather than foundational to the analysis. |
| power-and-incentives | 4 | Section 3a diagnoses power shifts explicitly: 'Gains power/control: large sites/fraud teams, adtech/DRM-adjacent use cases, the **attester**; Loses choice/access: users of non-mainstream browsers, assistive technology, independent browsers, automation/testing/archival.' Section 3d analyzes incentives that defeat safeguards with specific mechanism (theme 1: 'guideline is not enforceable; incentives point the other way'; theme 2: 'browser vendor as the attester given its own browser is in the trust set' = self-preferencing; theme 4: 'users can't meaningfully consent when refusal means being blocked'). The response identifies hostile/dominant-site use cases (section 3a: 'exclude competing browsers', 'enforce DRM/tie-in', 'price-discriminate') and analyzes why a non-binding promise fails under incentive pressure. User agency is traced to structural asymmetry ('users *cannot* forge or bypass it. That asymmetry...is the core risk'). |
| critique-to-action | 4 | Section 3d maps 10 material themes each to steelmanned concern → severity/likelihood → current response → gap → next action. Example (theme 2): concern → 'gatekeeping and self-preferencing'; response → 'unknown'; gap → 'no governance/audit design'; action → 'legal routing; governance design that removes single-vendor control'. Section 4 lists specific evidence collection, activities (8 numbered items with owners), sequencing (6 stages with blockers/dependencies), and measurable exit criteria. Section 5 provides artifact with strategic framing ('Do not announce'), positioning statements, sequencing (input-seeking → listening → update → launch), channel plan with launch-resilience, FAQ, and red-team guardrails. Recommendations explicitly include narrower scope ('enforce scope limits'), delay ('Delay / abandon triggers'), redesign ('any design...forces redesign'), and abandonment ('no cross-engine support...= not a web standard'). Design changes are linked to constraints (e.g., 'make browser/AT/extension exclusion infeasible, not merely discouraged'). |
| evidence-hygiene | 4 | The response distinguishes facts ('fraud/abuse pain is real in general'), unknowns (marked throughout as 'Unknown' or 'Open question'), signals ('non-binding guideline'), positions claimed vs. positions sourced ('principle-grounded inference or open question' vs. 'I have **not** fabricated'), recommendations vs. approvals ('DevRel advisory only — not approval'), and design hypotheses vs. demonstrated facts ('unlinkability unproven'). Section 2 readiness table marks every dimension as Unknown or Partial with explicit rationale (e.g., 'Interop: **Unknown** (principle-contradicted for HW-rooted designs)'). Section 5 explicitly states 'this is a **provisional draft** because the evidence is not yet ready; unsupported sections are marked' and each positioning statement in 5B is tagged with its evidence status (e.g., 'Fact (general); proposal-specific quantification = Unknown'). Section 8 lists unknowns that would change the analysis and explains why silence from engines is not support. The artifact in 5 is labeled not for launch and marked with review requirements and blocked-status. |

**Total: 16/20** across 5 focus dimensions (5 scored, 0 unable). Average 3.20/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Describes the power shift between users, sites, browsers, operating systems, and attesters before selecting stakeholders | yes |
| Includes browser implementers, users, assistive technology, testing/automation, archives/search, open-source browsers, civil society, security/fraud experts, and competition/data-protection regulators where material | yes |
| Retrieves dated primary-source principles or proposal-specific positions and separates recorded positions from inference | no |
| Analyzes hostile or dominant-site exclusion and incentives rather than accepting the stated usage policy as a safeguard | yes |
| Separates anti-fraud value to service operators from demonstrated end-user benefit | yes |
| Allows recommendations including narrower scope, delay, redesign, or abandonment—not only better messaging | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Invents an organisational position | no |
| Role-plays browser vendors or civil-society groups from stereotypes without sources | no |
| Treats communication strategy as sufficient mitigation for architecture or market-power concerns | no |
| Assumes implementer intent prevents foreseeable abuse | no |

Judge confidence: high.

Raw responder output: `worker/logs/stakeholder-critique-attestation.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/stakeholder-critique-attestation.judge.attempt-1.out.txt`.