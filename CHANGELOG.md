# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
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
[Unreleased]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/poirierlouis/twitch-bg3-gamepad/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/poirierlouis/twitch-bg3-gamepad/releases/tag/v1.0.0
