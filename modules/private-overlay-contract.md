# Private-overlay architecture contract

This module defines the boundary between public-core skill content and
organization-local private inputs. It contains **no private data** — only the
contract, JSON Schema, and checklist.

## Output classification

| Output type                                                   | May contain private refs?                          | Public claims require?                                                                      |
| ------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Internal work product** (diagnosis, plans, internal briefs) | Yes — private inputs may inform internal decisions | N/A — not published                                                                         |
| **Public-safe artifact** (blog, ChromeStatus, docs, talks)    | No                                                 | A public/verifiable evidence record, OR explicit disclosure + authorized publication review |

A public claim may cite a private source **only if**:

1. The source has `consentForPublicUse: "partial"` or `"full"` in the private
   overlay manifest
2. The `consentDetails` field specifies exactly what can be cited
3. Publication review has approved the specific citation

Private system locations (URLs, doc IDs, CRM references) are **never** exposed
in public artifacts. Use opaque descriptions only ("a partner representative
stated...").

## Boundary rules

1. **Public artifacts must be public-derivable OR explicitly disclose
   private-sourced claims.** If a claim rests on private evidence, label it and
   confirm consent.
2. **Private inputs inform internal work** — diagnosis, readiness assessment,
   planning. They do not appear in public outputs without consent.
3. **The skill never stores private data in the public repository.**
4. **When boundaries are ambiguous, stop and ask.**

## JSON Schema

See `schemas/private-overlay-manifest.schema.json` for the machine-readable
schema.

## Safe example

See `templates/private-overlay-manifest.example.json` for a consented example
with:

- An internal roadmap entry (`publicSafe: false`, `consentForPublicUse: "none"`)
- A consented partner discussion (`consentForPublicUse: "partial"` with specific
  consent details)

## Public/private checklist

Before producing any public artifact:

- [ ] Does every cited source have a public URL or explicit private-use consent
      from the manifest?
- [ ] Are partner names used only with documented consent?
- [ ] Is internal roadmap information excluded?
- [ ] Are private feedback themes aggregated/anonymized unless consented?
- [ ] Does the artifact distinguish public evidence from private context?
- [ ] Has publication review approved any private-sourced citations?

## Config-required inputs

Each team must provide:

1. **Private input manifest** — using
   `schemas/private-overlay-manifest.schema.json`, stored in team-controlled
   system (NOT in this repo)
2. **Consent registry** — which partners/individuals consented to public
   attribution
3. **Publication review process** — who reviews artifacts before public release
4. **Private system location** — where private overlays are stored
