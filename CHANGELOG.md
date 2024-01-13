# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- button SELECT to toggle test mode.

------------------------

## [1.5.1] - 2024-01-11
### Fixed
- alignment of panels and buttons in UI.

------------------------

## [1.5.0] - 2024-01-11
### Added
- telemetry feature to record, aggregate and list user commands.
- button to show/hide telemetry panel.
- button to export telemetry to a JSON file.

------------------------

## [1.4.0] - 2024-01-09
### Added
- switch button on GUI to enable/disable test mode.
- test mode feature to prevent commands from being sent.

------------------------

## [1.3.0] - 2024-01-09
### Added
- joystick configuration in settings panel of GUI.
- user can update active / dead thresholds.
- save/restore joystick settings in browser's local storage.

### Fixed
- prevent out of bounds numbers when user input long press/move durations.

------------------------

## [1.2.0] - 2024-01-08
### Added
- panel to expand with settings.
- form fields to change settings of long commands detection (button / joystick).
- save/restore above settings using browser's local storage.

### Changed
- show on GUI when input is triggered by a joystick (parenthesis).
- show on GUI which joystick triggers an input (L / R).

------------------------

## [1.1.0] - 2024-01-07
### Added
- START button of gamepad to show/hide GUI.

### Fixed
- drop first command after detecting a gamepad.
- prevent multiple commands to be sent while moving joystick in different positions.

### Changed
- improve performance when polling for a gamepad, Chrome only.
- reduce bundle size.

------------------------

## [1.0.1] - 2024-01-07
### Fixed
- randomize case of commands to bypass spamming error from chat.
- chat's input staying focused after sending a command.

------------------------

## [1.0.0] - 2024-01-06
### Added
- plugin with gamepad support for Firefox and Chrome.
- feature to transform gamepad's inputs into chat commands.
- feature to send commands through chat using web UI.
- GUI with some feedbacks about plugin's state.
- shortcut to show/hide GUI.

<!-- Table of releases -->
[Unreleased]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.5.1...HEAD
[1.5.1]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/poirierlouis/twitch-bg3-gamepad/releases/tag/v1.0.0
