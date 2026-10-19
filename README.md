ONLINE VERSION: https://shacchiorca.github.io/Roland-JD-ultimate-converter-manager/


# Roland JD ultimate converter manager
Vibe coded converter and patch manager for jd-08. Based on JD-tools. 
Made using Gemini AI V4.
Converter works with original JD-800 .syx, JD-800 VST .bin and JD-08 .svd

JD-08 Manager & Converter is a lightweight, single-file web application based on JD-tools, built to manage, sort, convert, and back up patches and scenes for the Roland Boutique JD-08 synthesizer. It parses native binary .svd backup files directly in the browser, letting you organize banks and convert legacy JD-800 and modern VST presets into hardware-ready formats without installing external software.
GitHub / Short Description
> Based on JD-tools: A browser-based patch manager, librarian, and format converter for the Roland Boutique JD-08 synthesizer. Manage, sort, inspect, convert (JD-800 SysEx, JD-800 VST), and export complete .svd hardware backup files.

# JD-08 Manager & Converter

A standalone, browser-based patch librarian and format converter for the Roland Boutique JD-08 synthesizer. Built on the foundation of JD-tools, this single-file web app allows you to organize your 256 patches and 128 scenes, inspect synthesis parameters, convert patches from legacy and software formats, and generate ready-to-load .svd backup files for your hardware.

## Key Features

### Dual-Pane Patch & Scene Librarian
* Full Bank Management: View and organize all 256 Patches (Banks A–D) and 128 Scenes/Performances.
* Dual-Pane Interface: Load two files side-by-side to compare banks and build custom patch collections from multiple backups.
* Drag-and-Drop Workflow: Easily reorder patches, swap slots, or copy sounds between different .svd files.
* Batch Editing: Rename, clear, initialize, or move multiple patches at once.

### Multi-Format Conversion Engine
Import and automatically translate patches into native JD-08 format from:
* Original Roland JD-800 Hardware: Standard .syx (SysEx) bulk dumps and single patches.
* Roland Cloud JD-800 VST: Software .bin preset banks.
* Native JD-08 Backups: .svd backup files (JD08Backup.SVD).

### Deep Parameter Inspector
* Tone & Common Breakdown: Inspect internal patch settings, active tones (A/B/C/D), waveform assignments, filter (TVF), amp (TVA), LFOs, and multi-effects parameters before committing them to your bank.

### Zero-Install Architecture
* 100% Client-Side: Runs entirely in your web browser as a single HTML file—no server, Python environment, or installation required.

---

## How to Use

### 1. Creating a Backup from Your JD-08
1. Hold the [EXIT] button and power on your JD-08
2. Connect the JD-08 to your computer via USB.
3. Open the mounted drive and copy the backup file (typically found in the BACKUP folder as JD08Backup.SVD) to your computer as a safety backup.

### 2. Managing & Converting Patches
1. Open index.html (the JD-08 Manager) in any modern web browser or go to: https://shacchiorca.github.io/Roland-JD-ultimate-converter-manager/ .
2. Load Your Primary Bank: Click Load SVD in the main pane and select your JD08Backup.SVD file.
3. Import External Sounds: Use the secondary pane or the Import / Convert tool to load .syx (JD-800), .bin (JD-800 VST), .sdz, or another .svd file.
4. Organize: 
   * Drag and drop patches between panes or slots to arrange your custom banks.
   * Click any patch to open the Parameter Inspector or rename it inline.
   * Switch to the Scenes tab to organize your 128 performance slots.

### 3. Saving & Restoring to Hardware
1. Click Export / Save SVD to download your modified JD08Backup.SVD file.
2. Copy the new .svd file into the RESTORE folder on your JD-08's USB drive.
3. Eject the USB drive safely from your computer and follow the JD-08 hardware restore prompt to write the new bank to internal memory.

---

## Acknowledgements
Based on the binary specifications and conversion logic of JD-tools. Roland, JD-800, JD-08 are registered trademarks of Roland Corporation.

DIDN'T TEST IT FULLY YET, FEEL FREE TO HELP
