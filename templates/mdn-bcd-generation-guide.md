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
[BCD contributing guide](https://github.com/mdn/browser-compat-data/blob/9851c5cb2361b4fe35b6a49b4dbda64792579fd9/docs/contributing.md)
(retrieved 2026-07-22, commit `9851c5cb2361b4fe35b6a49b4dbda64792579fd9`).

## BCD entry structure (reference, not a scaffold)

Every BCD entry for a Web API member requires:

```json
{
  "api": {
    "InterfaceName": {
      "__compat": {
        "spec_url": "<HTTPS URL with fragment — REQUIRED when standard_track:true, optional otherwise>",
        "support": {
          "chrome": { "version_added": "<version string or false>" },
          "chrome_android": "mirror",
          "edge": "mirror",
          "firefox": { "version_added": "<version string or false>" },
          "firefox_android": "mirror",
          "ie": { "version_added": "<version string>" }, # or omit entirely for modern-only APIs
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

- `version_added`: MUST be a version string (e.g., `"120"`) or `false`. Schema
  permits ONLY string|false — `null` and `true` are both forbidden.
- `version_added` means the first browser release represented by BCD's support statement. It is not the browser used for this run, the current stable milestone, the target milestone, an implementation commit position, a flag/trial version, or today's date.
- Keep scheduled stable date, actual stable release date, implementation-first version, target milestone, current stable milestone, and tested browser version as separate typed claims.
- Register every generated non-mirror `version_added` in `launch-acceptance.json` with the BCD asset path/JSON Pointer, fresh primary-source snapshot/JSON Pointer, live source URL, retrieval timestamp, and revision. The online validator must compare all three values.
- A valid JSON shape and passing `npm test` do not establish factual correctness. Missing, stale, contradictory, or unreachable evidence is blocked—not a guessed value.

## Evidence checklist (before submitting BCD PR)

- [ ] Every non-mirror `version_added` has a fresh primary source and exact selector; broad links without the field/value evidence are insufficient
- [ ] BCD asset value, retained source snapshot value, and freshly fetched live value match exactly
- [ ] Target/current/tested/implementation/scheduled-release/actual-release meanings are not conflated
- [ ] `spec_url` points to actual spec section, or omitted if
      `standard_track: false`
- [ ] `status` booleans match the feature's real standards position
- [ ] `npm test` passes (schema validation)
- [ ] `npm run lint:fix` applied
- [ ] No placeholder values remain

**Do NOT submit a BCD entry until this checklist is complete.** A BCD PR with
placeholder or guessed values will fail CI and waste reviewer time.
