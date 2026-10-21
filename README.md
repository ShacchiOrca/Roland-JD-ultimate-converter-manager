# 🎛️ Roland JD-08 Total Patch Commander & Librarian

> A high-performance, browser-based patch librarian, binary `.SVD` editor, and deep sound design workspace engineered for the **Roland Boutique JD-08** and classic **Roland JD-800** synthesizer architecture.

![Web MIDI](https://img.shields.io/badge/Hardware-Web%20MIDI%20API-00e5c8)
![Compatibility](https://img.shields.io/badge/Format-Roland%20SVD5%20Binary-blue)
![Zero Install](https://img.shields.io/badge/Setup-Zero%20Install%20(Browser)-brightgreen)

---

## 🌟 Key Features

### 🗂️ Dual Independent Sound Pools
* **Dual-Pane Architecture (Left & Right Pools)**: Work with two independent banks simultaneously—ideal for comparing sound libraries, sorting favorites, and building custom setlists.
* **Full 256-Patch & 128-Scene Memory**: Direct access across all hardware memory banks (**Patches A, B, C, D**; **Scenes 1–8 & 9–16**).
* **Hardware-Accurate SVD5 Engine**: Directly reads, parses, translates, and generates standard Roland Boutique backup files (`.SVD`) with byte-for-byte checksum integrity.

### ⚡ Seamless Organization & Batch Management
* **Interactive Drag-and-Drop**: Easily move presets within a bank or across pools. Toggle between **⇄ Swap** (exchange slots) and **➔ Copy** (duplicate & overwrite) modes.
* **Central Bridge Utilities**: Instant batch actions for multi-selections (`Copy ➔`, `⬅ Copy`, `⇄ Swap`, `Rename [F2]`, and `Tag Category`).
* **Auto-Relink Scenes**: Automatically keeps Scene Part A / Part B patch pointers intact whenever you move, sort, or reorganize patches in Banks A–D.
* **Bank Management Tools**: Sort alphabetically, group by Category tag (*BASS, LEAD, PAD, PLUCK, FX, ACID*), or **🧹 Compact** banks to eliminate empty slots.
* **Full Undo / Redo History**: Complete action tracking (`Ctrl+Z` / `Ctrl+Y`) with non-destructive state management.

### 🔬 4-Tone Deep Synth Inspector
* **4-Tone Sound Architecture**: Complete visibility into Tone 1–4 layers, each with its Wave Generator (WG), TVF Filter, TVA Amplifier, and Envelopes.
* **Collapsible Ableton-Style Dock**: Bottom LCD console provides immediate parameter feedback, tone solo/mute toggles, and clip status (`Shift+Tab` to collapse/expand).
* **Deep Control Surface**: Press `Space`, `Enter`, or Double-Click any preset to launch the full synthesizer editor with visual faders for Cutoff, Resonance, Pitch, Envelopes, EQ, Chorus, Delay, and Reverb.

### 🔌 Direct Hardware Integration & Sound Preview (Beta)
* **Plug & Play Web MIDI**: Connect your Roland Boutique JD-08 via USB. Operates strictly over the safe JD-08 Sound Port to prevent hardware microcontroller locks.
* **Instant Preset Auditioning**: Clicking any slot in Left or Right pool immediately transmits Bank Select (`CC 0`, `CC 32`) and Program Change to switch the physical synth in real-time.
* **🔈 PC Speaker Audio Monitor**: Route the JD-08's digital USB audio directly into your computer speakers or laptop headphones via the Web Audio API without needing external cables.
* **Playable QWERTY Keyboard**: Play notes and test sounds live using your computer keyboard (`A, W, S, E, D, F, G, Y, H, U, J, K...`) with dynamic velocity.

### 📖 Interactive Tutorial & First-Run Guide
* Includes a built-in 5-step interactive walkthrough that introduces the architecture, librarian tools, synth engine, USB integration, and keyboard shortcuts.
* Accessible anytime via the **`📖 Guide`** button in the header or through the Settings menu.

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` / `Enter` | Open Overview / Deep Synth Inspector |
| `Double Click` | Directly edit active preset |
| `F2` | Quick Rename active slot |
| `F5` | Copy selected slots from Left ➔ Right |
| `F6` | Swap selected slots between Left ⇄ Right |
| `Ctrl + C` / `X` / `V` | Copy / Cut / Paste slots |
| `Ctrl + Z` / `Ctrl + Y` | Undo / Redo history |
| `Shift + Tab` | Collapse / Expand bottom dock console |
| `Delete` / `F8` | Initialize selected slot(s) |
| `A, W, S, E, D, F...` | Play musical notes live to Roland JD-08 |

---

## 🚀 Getting Started

1. **No Installation Required**: Serve the folder from any local web server (e.g. XAMPP, Apache, Python `http.server`, or GitHub Pages).
   ```bash
   # Quick local run with Python
   python -m http.server 8000
   ```
2. Open in any modern Web MIDI-compatible browser: **Google Chrome**, **Microsoft Edge**, **Brave**, or **Opera**.
3. Connect your **Roland Boutique JD-08** via USB, power it on, and click **`Connect`** in the bottom dock or settings.

---

## 📦 Changelog

### [v1.0.0] - Official Release

#### 🎛️ Dual Pool Librarian & File Management
* Dual-Pane Interface: Independent Left and Right pools with quick bank navigation for Patches (Banks A–D, 256 slots) and Scenes (Banks 1–16, 128 slots).
* Drag-and-Drop Modes: Configurable top toolbar switch between **⇄ Swap** and **➔ Copy**.
* Auto-Relink Scenes: Intelligent pointer tracker that preserves Scene Part A / Part B patch assignments when reorganizing patches.
* Central Bridge Strip: High-efficiency toolbar for cross-pane transfers, clipboard operations, categorization, and patch initialization.
* Bank Drawer Tools: Alphabetical sorting, Category grouping, and bank compaction (`🧹 Compact`).
* Multi-Format Import/Export: Load full `.SVD` backups, translate individual SysEx dumps into binary slots, and export Roland-compliant backup files with valid checksums.

#### 🔌 Hardware USB Integration (Beta)
* Safe Web MIDI Connection: Auto-detects and connects to the Roland JD-08 Sound Port.
* Instant Preset Switching: Real-time transmission of Bank Select MSB/LSB and Program Change messages upon slot selection.
* Channel Selection Dropdown: Interactive dropdown supporting broadcast (`CH: ALL 1-3`), Part A (`CH 2`), Part B (`CH 3`), and individual channels `CH 1` through `CH 16`.
* PC Speaker Audio Monitor (`🔈 PC SPK`): Streams digital audio from the JD-08's USB stream directly through computer speakers or headphones.
* Live QWERTY Playability: PC keyboard note-triggering engine with natural octaves and velocity.
* Status Indicators: Clean, non-truncating `Connect` / `Connected` pill with activity blinker and Beta feature notices.

#### 📖 User Onboarding & Interface Refinements
* First-Run Onboarding Tutorial: Interactive 5-step modal covering system architecture, dual pools, 4-Tone engine, USB features, and keyboard shortcuts.
* Startup Remind Toggle: "Don't show this guide on startup" preference persisted in local storage, with on-demand reopening via the top bar `📖 Guide` button.
* Elektron Overbridge Dark Aesthetic: High-contrast cybernetic palette with amber and cyan accents, customizable UI density, and basic/advanced tier toggle.
* Collapsible Dock Console: Compact status strip toggleable via `Shift+Tab` to maximize vertical library space.

#### 🧹 Code Cleanup & Optimizations
* Modularized codebase into dedicated production files (`index.html`, `style.css`, `app.js`, `jd08-midi.js`).
* Purged experimental/dead routines (`pushCurrentPatchToHardware`, `unfreezeHardwareSynth`, legacy audition timers).
* Embedded inline SVG favicon to prevent `/favicon.ico` 404 requests.
* Zero console warnings and 100% verified HTML/JS bracket validation.
