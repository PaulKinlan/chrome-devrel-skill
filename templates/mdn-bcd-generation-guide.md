# BCD entry generation guide

**This is NOT a submittable BCD file.** It is a checklist and structure guide
for creating a valid BCD entry. Do not copy this into `mdn/browser-compat-data`
— it contains no evidence.

## Required workflow

```sh
# Clone the BCD repository
git clone https://github.com/mdn/browser-compat-data.git
cd browser-compat-data
npm install

# After creating/editing your entry:
npm test          # runs schema validation + data tests
npm run lint:fix  # auto-fixes style issues

# npm test MUST pass before submitting a PR.
```

Source:
[BCD contributing guide](https://github.com/mdn/browser-compat-data/blob/main/docs/contributing.md)
(retrieved 2026-07-22, commit `9851c5cb2361b4fe35b6a49b4dbda64792579fd9`).

## BCD entry structure (reference, not a scaffold)

Every BCD entry for a Web API member requires:

```json
{
  "api": {
    "InterfaceName": {
      "__compat": {
        "spec_url": "<valid HTTPS URL with fragment to spec section>",
        "support": {
          "chrome": { "version_added": "<version string or false>" },
          "chrome_android": "mirror",
          "edge": "mirror",
          "firefox": { "version_added": "<version string or false>" },
          "firefox_android": "mirror",
          "ie": { "version_added": "<version string or false>" },
          "oculus": "mirror",
          "opera": { "version_added": "<version string or false>" },
          "opera_android": "mirror",
          "safari": { "version_added": "<version string or false>" },
          "safari_ios": "mirror",
          "samsunginternet_android": "mirror",
          "webview_android": "mirror",
          "webview_ios": "mirror"
        },
        "status": {
          "experimental": <boolean>,
          "standard_track": <boolean>,
          "deprecated": <boolean>
        }
      }
    }
  }
}
```

## Evidence rules

- `version_added`: MUST be a version string (e.g., `"120"`) or `false`. NOT
  `null` — `null` is forbidden by schema.
- `version_added: false` means confirmed never-supported. Use only with
  evidence.
- `version_added: true` means supported at an unknown version. Avoid; prefer
  specific versions.
- `"mirror"` inherits from upstream browser. Valid for derivatives.
- `spec_url`: MUST be a valid HTTPS URL with a fragment pointing to the specific
  spec section. If no spec exists, omit `spec_url` entirely (do NOT use
  placeholder URLs).
- `standard_track: true` requires a real `spec_url`. If `standard_track: false`,
  do not include `spec_url`.
- `status` booleans are factual claims — set them only with evidence of the
  feature's standards status.
- `webview_ios` is a required browser key (added in recent BCD schema versions).

## Evidence checklist (before submitting BCD PR)

- [ ] Every non-mirror `version_added` has a source: release notes,
      ChromeStatus, bug tracker, or test
- [ ] `spec_url` points to the actual spec section (not a placeholder)
- [ ] `status` booleans match the feature's real standards position
- [ ] `npm test` passes (schema validation)
- [ ] `npm run lint:fix` applied
- [ ] No placeholder values remain

**Do NOT submit a BCD entry until this checklist is complete.** A BCD PR with
placeholder or guessed values will fail CI and waste reviewer time.
