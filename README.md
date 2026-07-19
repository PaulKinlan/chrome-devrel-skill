# Chrome DevRel Skill

A stage-aware copilot for Chrome Developer Relations work across a feature or initiative's full lifecycle.

This project is in public discovery and will be iterated in the open. It is not a canonical Chrome process document.

## Intended users

- Developer relations engineers / developer advocates
- Technical writers
- Product managers
- Engineers and feature owners
- Developer marketing, partnerships, standards, and ecosystem collaborators

## Proposed outcomes

The skill should help a user:

1. Identify the lifecycle stage and the decision they need to make.
2. Test whether the underlying developer problem and demand are real.
3. Find missing evidence, stakeholders, integration risks, and adoption barriers.
4. Choose appropriate DevRel tactics rather than defaulting to an article.
5. Produce a coherent, reusable asset pack when the evidence is ready.
6. Measure adoption, support burden, and learning after launch.

## Architecture

The project will use a **public core**: public process sources, reusable reasoning, evidence discipline, artifact templates, and public-safe evals. If private Chrome overlays are added later, they must remain separate and must never leak internal evidence into public outputs.

The skill supports both directions:

- **Evidence first:** investigate a feature or initiative, expose gaps, and build a credible readiness plan.
- **Artifact first:** accept a request such as “make the launch deck,” but inspect and research the evidence needed to make that artifact accurate and useful before drafting it.

It does not impose a fictional DevRel veto. It records readiness by dimension, explains consequences of missing evidence, and helps teams make better-informed decisions even when Chrome chooses to proceed.

## Initial modes

- `feature`: an individual API or developer-facing change
- `initiative`: a group of capabilities with one developer outcome or platform narrative
- `deprecation`: removal, migration, or behavior change
- `adoption`: scaling an already-shipped capability
- `support`: diagnosing recurring developer problems and feeding them back into product/docs
- `event`: talk, meetup, workshop, conference, or GDE enablement

## Principles

- Interrogate before generating.
- Treat absent evidence as unknown, never positive.
- Separate facts, hypotheses, commitments, and recommendations.
- Fit the work to its lifecycle stage.
- Design for interoperability, framework adoption, server integration, and real deployment—not only an isolated demo.
- Prefer reusable systems and enablement packs over one-off assets.
- Preserve a public/private evidence boundary.
- Never imply that DevRel endorsement replaces API Owner, standards, privacy, security, accessibility, legal, or engineering review.

## Current work

- [Lifecycle and DevRel intervention map](research/blink-lifecycle-map.md)
- [Stakeholder critique module](modules/stakeholder-critique.md)
- [Public case notes: HTML-in-Canvas, Baseline, Prompt API, and WEI](research/public-case-notes.md)
- [Discovery questions](research/discovery-questions.md)
- [Early skill scaffold](SKILL.md)
- [Evaluation design and fixtures](evals/README.md)
