# Promote Level-Three Release-Note Headings

## Purpose

Standardize existing GitHub Release notes by promoting Markdown level-three
headings (`###`) to level-two headings (`##`).

## Behavior

- Processes every release in the current repository through the GitHub REST API.
- Promotes ATX level-three headings outside fenced code blocks.
- Keeps level-four-or-deeper headings, code examples, release titles, tags, and
  assets unchanged.
- Supports `DRY_RUN=true`, which reports the releases and headings that would
  change without updating GitHub.

## Usage

Run **Actions -> Disposable Run**, select `promote-h3-headings`, and first keep
`dry_run` enabled. To update release notes, disable `dry_run` and enter `YES`
for `confirm`.
