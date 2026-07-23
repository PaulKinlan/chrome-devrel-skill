# MDN/API reference authoring

Use this module when preparing or reviewing MDN Web Docs API reference
documentation. It integrates primary-source MDN contribution guidelines with the
skill's evidence discipline.

**Review-ready** means deterministic checks pass and required sources are
complete. It does NOT mean Mozilla will approve — MDN review is a community
process with human reviewers.

## Source evidence brief (2026-07-22)

| Source                        | URL                                                                                                                      | Governs                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| Page types                    | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types                               | Valid `page-type` frontmatter values    |
| API landing page template     | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types/API_landing_page_template     | Interface/overview page structure       |
| API reference page template   | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types/API_reference_page_template   | Method/constructor page structure       |
| API property subpage template | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types/API_property_subpage_template | Property page structure                 |
| API event subpage template    | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types/API_event_subpage_template    | Event page structure                    |
| How to write an API reference | https://github.com/mdn/content/blob/main/files/en-us/mdn/writing_guidelines/howto/write_an_api_reference/index.md        | Authoring workflow and conventions      |
| Syntax sections               | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Syntax_sections                          | Syntax block format                     |
| mdn/content CONTRIBUTING      | https://raw.githubusercontent.com/mdn/content/main/CONTRIBUTING.md                                                       | Build, lint, review workflow            |
| PR submission and reviews     | https://developer.mozilla.org/en-US/docs/MDN/Community/Pull_requests                                                     | Review process and expectations         |
| BCD schema                    | https://github.com/mdn/browser-compat-data/blob/main/schemas/compat-data-schema.md                                       | BCD entry structure and required fields |
| BCD contributing              | https://github.com/mdn/browser-compat-data/blob/main/docs/contributing.md                                                | BCD contribution workflow               |
| BCD data guidelines           | https://github.com/mdn/browser-compat-data/blob/HEAD/docs/data-guidelines/README.md                                      | BCD data quality rules                  |

**Unknowns:** MDN review timelines vary; specific reviewer availability cannot
be predicted. Template structures may evolve — recheck canonical sources before
each PR.

## Evidence layer separation

Every API reference page must distinguish:

1. **Normative spec facts:** behavior defined by the specification. Cite spec
   section.
2. **IDL:** Web IDL interface definition. Cite or link to the spec IDL fragment.
3. **BCD compat data:** browser support entries. Cite BCD path and version data.
4. **MDN prose/examples:** explanatory text and code samples authored for MDN.
   Label as documentation, not spec.
5. **Experimental/secure-context/permission flags:** mark in frontmatter and
   page body.
6. **Accessibility:** a11y implications, AT compatibility, semantic equivalence.
7. **Localization:** content must be translatable; avoid idioms,
   culture-specific examples, or untranslatable screenshots.

Never merge these layers — spec facts are normative; MDN prose is descriptive;
BCD is measured data. Disagreements between layers are findings, not things to
silently reconcile.

## Page types and templates

| Page type                  | `page-type` value           | Template file                       |
| -------------------------- | --------------------------- | ----------------------------------- |
| API overview/landing       | `web-api-overview`          | `templates/mdn-api-overview.md`     |
| Interface                  | `web-api-interface`         | `templates/mdn-interface.md`        |
| Constructor                | `web-api-constructor`       | `templates/mdn-constructor.md`      |
| Instance method            | `web-api-instance-method`   | `templates/mdn-method.md`           |
| Instance property          | `web-api-instance-property` | `templates/mdn-property.md`         |
| Event                      | `web-api-event`             | `templates/mdn-event.md`            |
| Examples                   | (embedded or standalone)    | `templates/mdn-examples.md`         |
| BCD entry                  | (JSON, not MDN page)        | `templates/mdn-bcd-entry.json`      |
| Documentation plan         | (internal)                  | `templates/mdn-doc-plan.md`         |
| Review checklist/PR packet | (internal)                  | `templates/mdn-review-checklist.md` |

## Review-ready definition

A page is review-ready when:

- [ ] Frontmatter has correct `page-type` and `title`
- [ ] {{Specifications}} and {{Compat}} macros present
- [ ] Syntax section matches official format
- [ ] Parameters, return value, exceptions documented (for methods)
- [ ] At least one working example with live sample
- [ ] BCD entry exists and validates against schema
- [ ] Spec URL is current and linked
- [ ] Experimental/secure-context/permission flags accurate
- [ ] No invented compat data, spec claims, or reviewer sign-off
- [ ] `npm run fix:md` passes (formatting)
- [ ] Accessibility implications noted where relevant

This is review preparation, not Mozilla approval. Human reviewers may request
changes for style, accuracy, or completeness.

## Lifecycle integration

- **Prototype phase:** draft API overview and interface stubs. Mark as
  experimental.
- **Developer trials:** add examples, test against real implementation. Note
  trial-only behavior.
- **Prepare to ship:** complete all page types, BCD entries, examples. Run
  review checklist.
- **Release:** ensure BCD matches shipped versions. Remove experimental flag if
  shipped stable.

## Publishing target

MDN content targets `mdn/content` (prose) and `mdn/browser-compat-data` (BCD).
See `templates/publishing-targets.manifest.json` for routing.

## Readiness expectation

Documentation readiness (from `modules/readiness-expectations.md`):

- **Supported:** Reference docs, quickstart, samples, FAQ, and known-limitations
  guide tested against real workflows.
- **Partial:** Minimal reference exists but quickstart has gaps or samples are
  toy-only.
- **Unknown:** No documentation prepared.
