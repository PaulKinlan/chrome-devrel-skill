# Private-overlay architecture contract

This module defines the boundary between public-core skill content and
organization-local private inputs. It contains **no private data** — only the
contract, schema, and checklist that a team uses to manage their private
overlay.

## Principle

The public skill (SKILL.md, modules/, phases/, evals/) contains only public-safe
content. Organization-local knowledge (internal discussions, unreleased
roadmaps, partner names without consent, private feedback) lives in a separate
private overlay that the team controls.

The skill can consume private inputs for internal work, but any public artifact
must be derivable from public sources alone.

## Boundary rules

1. **Public artifacts must be public-derivable.** If a blog post, ChromeStatus
   entry, or retrospective report cites evidence, that evidence must be publicly
   accessible or explicitly labeled as private-with-consent.
2. **Private inputs improve internal decisions but cannot appear in public
   outputs** without explicit approval from the source.
3. **The skill never stores private data in the public repository.** Private
   overlays live in team-controlled systems.
4. **When boundaries are ambiguous, stop and ask.** Do not guess whether
   something is public-safe.

## Canonical-input manifest schema

Teams maintain a private manifest of internal inputs. The schema is public; the
data is private.

```json
{
  "schemaVersion": 1,
  "team": "_config-required: team name_",
  "lastUpdated": "_ISO date_",
  "inputs": [
    {
      "id": "_stable ID_",
      "type": "roadmap | partner-discussion | internal-feedback | unreleased-spec | decision-thread | measurement-data | other",
      "title": "_short description_",
      "location": "_private system reference (not a public URL)_",
      "owner": "_role or name_",
      "publicSafe": false,
      "consentForPublicUse": "none | partial | full",
      "consentDetails": "_what can be cited publicly, if anything_",
      "expiry": "_ISO date or null_",
      "relatedFeatures": ["_ChromeStatus feature IDs_"]
    }
  ]
}
```

## Public/private checklist

Before producing any artifact:

- [ ] Does every cited source have a public URL or explicit private-use consent?
- [ ] Are partner names used only with documented consent?
- [ ] Is internal roadmap information excluded from public outputs?
- [ ] Are private feedback themes aggregated and anonymized unless consented?
- [ ] Does the artifact distinguish public evidence from private context?

## Integration with skill workflow

- **Diagnose:** Private inputs can inform the mode/stage diagnosis but the
  public intake summary must be public-derivable.
- **Assess:** Readiness ratings can consider private evidence but must label it.
  Public reports cite only public sources.
- **Plan:** Internal plans can reference private inputs. Public plans (launch
  briefs, blog posts) must be public-derivable.
- **Build:** Artifacts carry a `sources` field. Private sources are marked
  `privateUse: true` and excluded from public versions.

## Config-required inputs

Each team must provide:

1. **Private input manifest** (using the schema above) — what internal knowledge
   exists
2. **Consent registry** — which partners/individuals have consented to public
   attribution
3. **Publication review process** — who reviews artifacts before public release
4. **Private system location** — where private overlays are stored (not in the
   public repo)
