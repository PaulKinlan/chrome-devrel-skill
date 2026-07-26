# MDN/API reference authoring

Use this module when preparing or reviewing MDN Web Docs API reference
documentation. It integrates primary-source MDN contribution guidelines with the
skill's evidence discipline.

**Review-ready** means deterministic checks pass and required sources are
complete. It does NOT mean Mozilla will approve — MDN review is a community
process with human reviewers and no guaranteed timeline.

## Source evidence brief (2026-07-22)

| Source                           | URL                                                                                                                                                                                  | Governs                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Page types                       | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/page_structures/page_types/index.md                                  | Valid `page-type` frontmatter values                                                        |
| API landing page template        | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/page_structures/page_types/api_landing_page_template/index.md        | Overview/landing page structure                                                             |
| API reference page template      | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/page_structures/page_types/api_reference_page_template/index.md      | Interface page structure                                                                    |
| API constructor subpage template | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/page_structures/page_types/api_constructor_subpage_template/index.md | Constructor page structure                                                                  |
| API method subpage template      | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/page_structures/page_types/api_method_subpage_template/index.md      | Method page structure                                                                       |
| API property subpage template    | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/page_structures/page_types/api_property_subpage_template/index.md    | Property page structure                                                                     |
| API event subpage template       | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/page_structures/page_types/api_event_subpage_template/index.md       | Event page structure                                                                        |
| How to write an API reference    | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/howto/write_an_api_reference/index.md                                | Authoring workflow and conventions                                                          |
| Syntax sections                  | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/page_structures/syntax_sections/index.md                             | Syntax block format                                                                         |
| Feature status                   | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/page_structures/feature_status/index.md                              | How experimental/deprecated/non-standard status is derived from BCD (NOT manually authored) |
| API sidebars                     | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/howto/write_an_api_reference/sidebars/index.md                       | GroupData and APIRef macro usage                                                            |
| mdn/content CONTRIBUTING         | https://raw.githubusercontent.com/mdn/content/308f0db4466bb95ff19c004f19c327af707fca98/CONTRIBUTING.md                                                                               | Build, lint, review workflow                                                                |
| PR submission and reviews        | https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/community/pull_requests/index.md                                                        | Review process and expectations                                                             |
| BCD schema                       | https://github.com/mdn/browser-compat-data/blob/9851c5cb2361b4fe35b6a49b4dbda64792579fd9/schemas/compat-data-schema.md                                                               | BCD entry structure and required fields                                                     |
| BCD contributing                 | https://github.com/mdn/browser-compat-data/blob/9851c5cb2361b4fe35b6a49b4dbda64792579fd9/docs/contributing.md                                                                        | BCD contribution workflow                                                                   |
| BCD data guidelines              | https://github.com/mdn/browser-compat-data/blob/9851c5cb2361b4fe35b6a49b4dbda64792579fd9/docs/data-guidelines/README.md                                                              | BCD data quality rules                                                                      |

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
| BCD entry                  | (JSON, generated per entry) | `templates/mdn-bcd-generation-guide.md`                                                              |
| Documentation plan         | (internal)                  | `templates/mdn-doc-plan.md`                                                                          |
| Review checklist/PR packet | (internal)                  | `templates/mdn-review-checklist.md`                                                                  |

## Frontmatter rules (official patterns)

- **Required for all page types:** `title`, `slug`, `page-type`
- **`browser-compat` required for:** interface, constructor, method, property,
  event (all member pages)
- **`browser-compat` NOT required for:** API overview/landing (compat data is on
  member pages)
- **`short-title` required for:** constructor, method, property, event (member
  pages)
- **Forbidden:** `spec-url` (spec linkage via BCD `spec_url`), `experimental`
  (derived from BCD), `short-title` (not in official templates for most page
  types)
- **Title format by page type (colon form, no `prototype`):**
  - Interface: `InterfaceName`
  - Constructor: `InterfaceName: ConstructorName() constructor`
  - Instance method: `InterfaceName: methodName() method`
  - Static method: `InterfaceName: methodName() static method`
  - Instance property: `InterfaceName: propertyName property` (with
    `short-title: "propertyName"`)
  - Static property: `InterfaceName: propertyName static property` (with
    `short-title: "propertyName"`)
  - Event: `InterfaceName: eventName event`
- **Slug format:** `Web/API/InterfaceName` for interface;
  `Web/API/InterfaceName/memberName` for members

## Sidebar and member-list integration

API reference pages use macros for navigation and member lists:

- **GroupData:** defines the sidebar navigation tree for an API. Each API has a
  GroupData entry in `files/jsondata/GroupData.json` that controls which pages
  appear in the left sidebar. New APIs require a GroupData entry.
- **APIRef:** auto-generates the list of constructors, properties, methods, and
  events on interface pages. Reads from the page tree structure — subpages are
  automatically listed.
- **Interface event links:** each event listed in the interface Events section
  must {{DOMxRef}}-link to its event subpage (e.g.,
  `{{DOMxRef("InterfaceName/eventName_event", "eventName")}}`).
- **Static member references:** static members use slash-path `_static` slugs in
  DOMxRef (e.g.,
  `{{DOMxRef("InterfaceName/methodName_static", "InterfaceName.methodName()")}}`)
  and display labels that include "static" (e.g., "`InterfaceName.methodName()`
  static method").

Source:
[API sidebars](https://github.com/mdn/content/blob/308f0db4466bb95ff19c004f19c327af707fca98/files/en-us/mdn/writing_guidelines/howto/write_an_api_reference/sidebars/index.md)
(retrieved 2026-07-22).

## BCD evidence rules

- `version_added` must be a version string (from evidence) or `false` (confirmed
  never-supported). Until evidence exists, do not populate the field — neither
  `null` nor `true` is valid
- Never invent version numbers
- `spec_url` in BCD carries spec linkage (not in MDN frontmatter). Optional
  generally; required when `status.standard_track: true`
- `status.experimental`, `status.standard_track`, `status.deprecated` drive the
  auto-generated status banners
- BCD generation guide (`templates/mdn-bcd-generation-guide.md`) documents valid
  schema types and the evidence workflow
- Validating JSON parse is NOT the same as validating against BCD schema —
  schema validation requires the BCD project's tooling (clone
  `mdn/browser-compat-data`, `npm install`, `npm test`)

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
- [ ] BCD entry exists; `version_added` uses evidence (version string or
      `false`). Neither `null` nor `true` is valid
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
