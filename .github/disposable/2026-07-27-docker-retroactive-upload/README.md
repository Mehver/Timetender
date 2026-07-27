# Docker Retroactive Upload

## Purpose

Pull Docker images from DockerHub (`titanrgb/timetender:<tag>`) for all past
releases, save them as `timetender-<tag>-docker-<arch>.tar.gz`, and upload as
GitHub Release assets.

Both `amd64` and `arm64` are attempted.  If a platform image doesn't exist for
a given tag, it is silently skipped.

## Usage

Trigger manually via **Actions → Disposable Run → Run workflow**.

- `dry_run` (checkbox): when enabled the script only prints what it would do
  without uploading anything.
- `confirm`: type `YES` to actually modify releases.
