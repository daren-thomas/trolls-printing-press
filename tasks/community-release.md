# Community release preparation

## Verified on 2026-09-07

- Official `eslint-plugin-obsidianmd` recommended checks pass without warnings.
- Lint runs in both CI and the tagged-release workflow.
- Settings use the searchable definitions API introduced in Obsidian 1.13.0.
- Saved settings and worker errors are checked before use.
- Disabling the plugin disposes its compiler and worker.
- Build and 48 automated tests pass.
- Packaged `main.js` and `manifest.json` installed in a separate vault with no other community plugins.
- All six publishing commands regenerated valid PDFs in Obsidian 1.13.7 on Windows.
- The output folder persisted across disable/re-enable; an empty value restored the default.
- Commands disappeared on disable and returned on enable; no compiler workers remained after disable.
- Test setup and checks are reproducible using the scripts documented in README.md.

## Before submitting

- Review bundled third-party license distribution in the release assets.
- Consider adding sample PDF screenshots to the README.
- Runtime testing so far covers Windows / Obsidian 1.13.7, not macOS, Linux, or precisely 1.13.0.
- Commit and push release preparation, and confirm GitHub CI passes.
- Tag the chosen version (currently `0.1.0`), matching `manifest.json` exactly.
- Review and publish the draft GitHub release produced by the existing workflow.
- Sign in to the Obsidian Community directory, connect GitHub, and submit the repository via New plugin.
- Resolve directory review feedback and publish the listing.

References:

- https://docs.obsidian.md/plugins/releasing/submit-plugin
- https://docs.obsidian.md/community-directory/submission-requirements-for-plugins
- https://github.com/obsidianmd/eslint-plugin
