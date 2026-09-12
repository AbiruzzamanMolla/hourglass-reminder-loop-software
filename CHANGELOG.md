# CHANGELOG

All notable changes to the **Hourglass Timer** desktop application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.1] - 2026-09-12

### Initial Release

#### Features Added
- **Progressive Visual Animations (4 Selectable Designs)**:
  - **Hourglass**: Realistic SVG sand simulation with dynamic level drainage in the top bulb, live particle physics streaming through the neck, and an expanding pyramid mound at the bottom. Includes a 180° rotation flip animation on reset.
  - **Radial Ring**: Sleek gradient circular countdown meter with elapsed percentage.
  - **Liquid Cylinder**: Glass cylinder vessel with double-wave animated fluid simulation that drops with remaining time.
  - **Neon Pulse**: Multi-tiered concentric neon halo ripple rings with a breathing core showing the remaining percentage.
- **Sound Alert System**:
  - Default crisp, electronic 3-pulse **Beep** (880 Hz).
  - Built-in presets: **Chime Bell**, **Digital Alarm**, and **Zen Gong**.
  - **Custom Audio Selector**: Supports user-selected audio files (`.mp3`, `.wav`, `.ogg`, `.flac`, `.aac`) loaded into Web Audio API for zero-lag alerts.
  - **Audio Controls**: Instant sound preview ("Test" button) and quick mute/unmute toggle.
- **Background Running & System Tray Integration**:
  - Intercepts window close (`X`) button to minimize directly to the Windows Notification Area / System Tray.
  - Unthrottled timer execution in the background with continuous live countdown tooltip updates.
  - Right-click tray context menu: *Open*, *Start / Pause*, *Reset*, and *Quit*.
  - Native Windows desktop notifications fired upon timer completion (with dedicated one-click Enable/Disable toggle button).
- **Loop Mode**:
  - One-click Loop toggle (`Loop: ON / OFF`) that rings the chime upon completion and automatically restarts the interval continuously.
- **Time Controls**:
  - Quick presets: `1m`, `5m`, `15m`, `25m`, and `1h`.
  - Manual numerical input pickers for Hours, Minutes, and Seconds.
  - High-precision digital clock display using JetBrains Mono typography.
- **Standalone Packaging**:
  - Built portable Windows single-file executable (`Hourglass-Timer-v0.0.1.exe`) requiring no installer.
