# MDN/API reference authoring

Use this module when preparing or reviewing MDN Web Docs API reference
documentation. It integrates primary-source MDN contribution guidelines with the
skill's evidence discipline.

**Review-ready** means deterministic checks pass and required sources are
complete. It does NOT mean Mozilla will approve — MDN review is a community
process with human reviewers and no guaranteed timeline.

## Source evidence brief (2026-07-22)

| Source                           | URL                                                                                                                         | Governs                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Page types                       | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types                                  | Valid `page-type` frontmatter values                                                        |
| API landing page template        | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types/API_landing_page_template        | Overview/landing page structure                                                             |
| API reference page template      | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types/API_reference_page_template      | Interface page structure                                                                    |
| API constructor subpage template | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types/API_constructor_subpage_template | Constructor page structure                                                                  |
| API method subpage template      | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types/API_method_subpage_template      | Method page structure                                                                       |
| API property subpage template    | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types/API_property_subpage_template    | Property page structure                                                                     |
| API event subpage template       | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Page_types/API_event_subpage_template       | Event page structure                                                                        |
| How to write an API reference    | https://github.com/mdn/content/blob/main/files/en-us/mdn/writing_guidelines/howto/write_an_api_reference/index.md           | Authoring workflow and conventions                                                          |
| Syntax sections                  | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Syntax_sections                             | Syntax block format                                                                         |
| Feature status                   | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Feature_status                              | How experimental/deprecated/non-standard status is derived from BCD (NOT manually authored) |
| API sidebars                     | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Howto/Write_an_api_reference/Sidebars                       | GroupData and APIRef macro usage                                                            |
| mdn/content CONTRIBUTING         | https://raw.githubusercontent.com/mdn/content/main/CONTRIBUTING.md                                                          | Build, lint, review workflow                                                                |
| PR submission and reviews        | https://developer.mozilla.org/en-US/docs/MDN/Community/Pull_requests                                                        | Review process and expectations                                                             |
| BCD schema                       | https://github.com/mdn/browser-compat-data/blob/main/schemas/compat-data-schema.md                                          | BCD entry structure and required fields                                                     |
| BCD contributing                 | https://github.com/mdn/browser-compat-data/blob/main/docs/contributing.md                                                   | BCD contribution workflow                                                                   |
| BCD data guidelines              | https://github.com/mdn/browser-compat-data/blob/HEAD/docs/data-guidelines/README.md                                         | BCD data quality rules                                                                      |

**Retrieval date:** 2026-07-22 for all sources. Recheck before each PR — MDN
evolves.

**Unknowns:** MDN review timelines vary; specific reviewer availability cannot
be predicted. Template structures may evolve.

## Evidence layer separation

Every API reference page must distinguish:

1. **Normative spec facts:** behavior defined by the specification. Cite spec
   section via BCD `spec_url`.
2. **IDL:** Web IDL interface definition. Part of the spec, not MDN-authored.
3. **BCD compat data:** browser support entries. `version_added` requires
   release/test evidence — never invent versions. Status
   (experimental/standard_track/deprecated) is derived from BCD, not manually
   authored in page frontmatter.
4. **MDN prose/examples:** explanatory text and code samples authored for MDN.
   Label as documentation, not spec.
5. **Feature status flags:** `{{SeeCompatTable}}`, `{{Deprecated_Header}}`,
   `{{Non-standard_Header}}` — derived automatically from BCD status fields, NOT
   manually authored. Do not add `experimental: true` to frontmatter.
6. **SecureContext/AvailableInWorkers:** separate macros
   (`{{SecureContext_Header}}`, `{{AvailableInWorkers}}`) — not part of feature
   status banners.
7. **Accessibility:** a11y implications, AT compatibility, semantic equivalence.
8. **Localization:** content must be translatable; avoid idioms,
   culture-specific examples, or untranslatable screenshots.

Never merge these layers. Disagreements between spec, BCD, and prose are
findings to resolve, not things to silently reconcile.

## Page types and templates

| Page type                  | `page-type` value           | Template file                                                                                        |
| -------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| API overview/landing       | `web-api-overview`          | `templates/mdn-api-overview.md`                                                                      |
| Interface                  | `web-api-interface`         | `templates/mdn-interface.md`                                                                         |
| Constructor                | `web-api-constructor`       | `templates/mdn-constructor.md`                                                                       |
| Instance method            | `web-api-instance-method`   | `templates/mdn-method.md`                                                                            |
| Static method              | `web-api-static-method`     | `templates/mdn-method.md` (adapt: title uses `InterfaceName.methodName()`, slug omits `prototype`)   |
| Instance property          | `web-api-instance-property` | `templates/mdn-property.md`                                                                          |
| Static property            | `web-api-static-property`   | `templates/mdn-property.md` (adapt: title uses `InterfaceName.propertyName`, slug omits `prototype`) |
| Event                      | `web-api-event`             | `templates/mdn-event.md`                                                                             |
| Examples                   | (embedded or standalone)    | `templates/mdn-examples.md`                                                                          |
| BCD entry                  | (JSON, not MDN page)        | `templates/mdn-bcd-entry.json`                                                                       |
| Documentation plan         | (internal)                  | `templates/mdn-doc-plan.md`                                                                          |
| Review checklist/PR packet | (internal)                  | `templates/mdn-review-checklist.md`                                                                  |

## Frontmatter rules (official patterns)

- **Required:** `title`, `slug`, `page-type`, `browser-compat`
- **Forbidden:** `spec-url` (spec linkage via BCD `spec_url`), `experimental`
  (derived from BCD), `short-title` (not in official templates for most page
  types)
- **Title format by page type:**
  - Interface: `InterfaceName`
  - Constructor: `InterfaceName() constructor`
  - Instance method: `InterfaceName.prototype.methodName()`
  - Static method: `InterfaceName.methodName()`
  - Instance property: `InterfaceName.prototype.propertyName`
  - Static property: `InterfaceName.propertyName`
  - Event: `InterfaceName.eventName event`
- **Slug format:** `Web/API/InterfaceName` for interface;
  `Web/API/InterfaceName/memberName` for members

## BCD evidence rules

- `version_added` must be `null` (unknown) until release/test evidence exists
- Never invent version numbers
- `spec_url` carries spec linkage in BCD, not in MDN frontmatter
- `status.experimental`, `status.standard_track`, `status.deprecated` drive the
  auto-generated status banners
- Template uses `null` placeholders with `"REPLACE with evidence"` notes
- Validating JSON parse is NOT the same as validating against BCD schema —
  schema validation requires the BCD project's tooling
  (`npx @mdn/browser-compat-data`)

## Review process (official)

1. **Before starting:** file an issue or proposal in mdn/content. Wait for
   maintainer response.
2. **PR:** focused, single concern. Link with `Fixes #N` or `Relates #N`.
   Include dependencies and example context.
3. **CODEOWNERS:** auto-assigned reviewers based on directory ownership.
4. **CI:** GitHub Actions run automated checks. Resolve all failures.
5. **Local checks:** `npm install`, `npm start` (preview), inspect rendered
   preview for flaws, `npm run fix:md` (format).
6. **Style/code guides:** follow MDN writing guidelines. Code examples must be
   tested.
7. **Feedback:** address reviewer comments. Be responsive but patient.
8. **No guarantee/timeline:** review is a community process. Do not claim
   Mozilla will approve quickly.

## Review-ready definition

A page is review-ready when:

- [ ] Frontmatter has correct `page-type`, `title`, `slug`, `browser-compat` (no
      `spec-url`, no `experimental`)
- [ ] {{Specifications}} and {{Compat}} macros present
- [ ] Syntax section matches official format (methods/constructors only)
- [ ] Property pages have Value section (no Syntax)
- [ ] Event pages have Event type and Description
- [ ] Parameters, return value, exceptions documented (methods/constructors)
- [ ] Interface pages list constructor, properties, methods, events
- [ ] At least one working example with {{EmbedLiveSample}} under descriptive H3
- [ ] BCD entry exists; `version_added` uses evidence or `null` (never invented)
- [ ] Status derived from BCD (not manually authored)
- [ ] {{SecureContext_Header}} / {{AvailableInWorkers}} used where applicable
- [ ] No invented compat data, spec claims, or reviewer sign-off
- [ ] `npm run fix:md` passes (formatting)
- [ ] Accessibility implications noted where relevant

This is review preparation, not Mozilla approval.

## Lifecycle integration

- **Prototype phase:** draft API overview and interface stubs.
- **Developer trials:** add examples, test against real implementation.
- **Prepare to ship:** complete all page types, BCD entries with version
  evidence.
- **Release:** ensure BCD matches shipped versions.

## Publishing target

MDN content targets `mdn/content` (prose) and `mdn/browser-compat-data` (BCD).
See `templates/publishing-targets.manifest.json` for routing.
