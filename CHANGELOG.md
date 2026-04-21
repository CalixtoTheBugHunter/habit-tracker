# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.2] - 2026-04-22

### Changed

- Production version and changelogs are updated only via the Tag workflow; remove PR-gated release-notes CI

## [0.4.1] - 2026-04-21

### Added

- Manual GitHub Actions workflow to tag production releases on `main` (`v*` semver tags) and prepend locale changelog sections

## [0.4.0] - 2026-04-20

### Added

- User notification before service worker reload with dismissible toast and reload/dismiss buttons

## [0.3.3] - 2026-04-17

### Changed

- Replace custom dependency review workflow with actions/dependency-review-action@v4

## [0.3.2] - 2026-04-16

### Added

- Commitlint and Husky for commit message enforcement

## [0.3.0] - 2026-04-16

### Added

- Statistics view with side menu navigation

## [0.2.0] - 2026-04-14

### Added

- Automatic data backup and safe upgrades between app versions

## [0.1.0] - 2026-04-13

### Added

- Initial version with support to track habits, multi-language support and theme customization