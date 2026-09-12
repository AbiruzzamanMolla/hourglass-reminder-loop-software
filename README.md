# ⏳ Hourglass Timer

A sleek, cross-platform desktop timer software with background tray minimization, customizable progressive visual animations, looping countdown, and custom sound alerts.

[![GitHub Release](https://img.shields.io/github/v/release/AbiruzzamanMolla/hourglass-reminder-loop-software?style=flat-square&color=f59e0b)](https://github.com/AbiruzzamanMolla/hourglass-reminder-loop-software/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square)](https://github.com/AbiruzzamanMolla/hourglass-reminder-loop-software/releases)

---

## 🚀 Downloads (v0.0.1)

### 📦 Windows Installable Setups (NSIS)
Select the installer that matches your Windows system architecture:

- **[Download Windows 64-bit Installer (x64)](https://github.com/AbiruzzamanMolla/hourglass-reminder-loop-software/releases/download/v0.0.1/Hourglass-Timer-Setup-v0.0.1-x64.exe)** `(~76.6 MB)` *(Recommended for modern PCs)*
- **[Download Windows 32-bit Installer (ia32)](https://github.com/AbiruzzamanMolla/hourglass-reminder-loop-software/releases/download/v0.0.1/Hourglass-Timer-Setup-v0.0.1-ia32.exe)** `(~71.8 MB)` *(For 32-bit Windows systems)*

*Includes desktop shortcut, start menu shortcut, and custom install directory picker.*

### ⚡ Portable Version (No Installation Required)
- **[Download Standalone Portable .exe](https://github.com/AbiruzzamanMolla/hourglass-reminder-loop-software/releases/download/v0.0.1/Hourglass-Timer-v0.0.1.exe)** `(~69.4 MB)` *(Run directly from any folder or USB)*

---

## ✨ Features

### 1. 🎨 4 Progressive Visual Animations
- **Hourglass**: SVG glass bulb simulation with falling sand particles, upper bulb emptying, and a growing pyramid mound at the bottom. Rotates 180° on reset.
- **Ring**: Modern gradient radial countdown ring with elapsed percentage.
- **Liquid Cylinder**: Cylindrical vessel with animated dual-frequency fluid waves that drop in height as time elapses.
- **Neon Pulse**: Multi-tiered concentric neon ripples radiating outward with a breathing center display.

### 2. 🔊 Sound Alert System & Custom Audio
- **Default Sound**: Crisp 3-pulse **Electronic Beep** (880 Hz).
- **Built-in Presets**:
  - *Beep* (Default)
  - *Chime Bell* (Multi-harmonic chord)
  - *Digital Alarm* (Pulsing high-pitch alert)
  - *Zen Gong* (Deep meditation bowl)
- **Custom Audio Selector**: Load your own sound files (`.mp3`, `.wav`, `.ogg`, `.flac`, `.aac`) directly into memory for instant, zero-lag playback.
- **Preview & Mute**: Instant audio test button and one-click mute/unmute control.

### 3. 🔄 Continuous Loop Mode
- Toggle `Loop: ON / OFF` to automatically chime upon completion and restart the timer cycle indefinitely (ideal for interval work, pomodoros, and repetitive reminders).

### 4. 📌 Taskbar System Tray & Background Running
- **Minimize to Tray**: Closing the window (`X`) minimizes the software directly into the Windows Notification Area (System Tray) rather than exiting.
- **Unthrottled Timer**: The countdown continues accurately in the background.
- **Tray Tooltip**: Hovering over the tray icon displays the live remaining time.
- **Context Menu**: Right-click the tray icon to quickly *Open*, *Start / Pause*, *Reset*, or *Quit*.
- **Desktop Notifications**: Native Windows notifications appear when the timer finishes.

### 5. ⏱️ Flexible Input Controls
- Quick preset buttons: `1m`, `5m`, `15m`, `25m`, and `1h`.
- Custom manual pickers for **Hours**, **Minutes**, and **Seconds**.
- High-contrast digital clock readout with millisecond accuracy.

---

## 🛠️ Development & Building from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation & Local Run
```bash
# Clone repository
git clone https://github.com/AbiruzzamanMolla/hourglass-reminder-loop-software.git
cd hourglass-reminder-loop-software

# Install dependencies
npm install

# Start development application
npm start
```

### Packaging Windows Executable (.exe)
```bash
# Build standalone portable .exe into the /dist directory
npm run dist
```

---

## 📝 Changelog & Release Guide

- **Changelog**: Detailed release notes and history are available in [CHANGELOG.md](CHANGELOG.md).
- **Release Procedure**: For instructions on updating the version, compiling x64/ia32 installers + portable exe, and publishing to GitHub, see [RELEASE_GUIDE.md](RELEASE_GUIDE.md).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
