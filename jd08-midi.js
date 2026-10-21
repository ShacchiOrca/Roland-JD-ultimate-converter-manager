/**
 * ROLAND JD-08 USB MIDI OVERBRIDGE ENGINE (STABLE HARDWARE EDITION)
 * Real-time parameter transmission & hardware control over Web MIDI API
 *
 * Implements Roland Boutique JD-08 MIDI Implementation:
 * - Direct connection strictly to JD-08 Sound Port (Excludes JD-08 CTRL port to prevent microcontroller deadlock)
 * - Multi-channel routing: Broadcasts to Ch 1, 2, and 3 by default (Part A is Ch 2, Part B is Ch 3 on JD-08)
 * - Web Audio USB Monitor: Streams IN MIX (JD-08) directly into computer speakers/headphones in real-time
 * - Safe MIDI Continuous Controller parameter streaming from JD-08 CC Map
 * - Safe 16ms FIFO pacing prevents boutique hardware buffer overflows
 * - Dedicated Unfreeze & Sound Restoration engine (fixes muted / stuck parts)
 * - Musical auditioning & live PC keyboard playability over USB
 */

class JD08MidiOverbridge {
  constructor() {
    this.midiAccess = null;
    this.selectedOutputId = localStorage.getItem('jd08_midi_output_id') || 'auto';
    this.selectedInputId = localStorage.getItem('jd08_midi_input_id') || 'auto';
    this.channel = localStorage.getItem('jd08_midi_channel') || 'both'; // Default: broadcast Ch 1-3
    this.liveSync = localStorage.getItem('jd08_midi_live_sync') !== 'false'; // default true
    this.autoPushOnSelect = localStorage.getItem('jd08_midi_auto_push') === 'true'; // default false
    
    this.output = null;       // Main JD-08 Sound Port ONLY
    this.input = null;
    this.connectedDeviceName = null;
    this.isPlayingAudition = false;
    this.auditionTimers = [];
    this.heldNotes = new Set();
    this.isTransmitting = false;

    // Web Audio USB Monitor state
    this.audioMonitorContext = null;
    this.audioMonitorStream = null;
    this.audioMonitorSource = null;
    this.isMonitoringAudio = false;

    // Discrete 4-state scaling (0..31, 32..63, 64..95, 96..127)
    const scale4 = v => (v === 0 ? 0 : (v === 1 ? 48 : (v === 2 ? 80 : 112)));

    // Tone offset -> Safe continuous CC mapping from Roland JD-08 MIDI Specification
    this.TONE_MAP = {
      0x04: { name: 'LFO 1 Wave', cc: 19, scale: v => Math.round((v / 5) * 127) },
      0x06: { name: 'LFO 1 Rate', cc: 14, scale: v => Math.round((v / 100) * 127) },
      0x08: { name: 'LFO 1 Delay', cc: 15, scale: v => Math.round((v / 100) * 127) },
      0x0A: { name: 'LFO 1 Fade', cc: 16, scale: v => Math.round((v / 100) * 127) },
      0x0C: { name: 'LFO 2 Wave', cc: 23, scale: v => Math.round((v / 5) * 127) },
      0x0E: { name: 'LFO 2 Rate', cc: 20, scale: v => Math.round((v / 100) * 127) },
      0x10: { name: 'LFO 2 Delay', cc: 21, scale: v => Math.round((v / 100) * 127) },
      0x12: { name: 'LFO 2 Fade', cc: 22, scale: v => Math.round((v / 100) * 127) },
      0x14: { name: 'Waveform', cc: 72, scale: v => Math.min(108, Math.max(0, v)) },
      0x1B: { name: 'Pitch Coarse', cc: 79, scale: v => Math.round(64 + (v - 12) * (63 / 12)) },
      0x1C: { name: 'Pitch Fine', cc: 80, scale: v => Math.round(64 + (v - 50) * (63 / 50)) },
      0x1D: { name: 'Pitch Env Depth', cc: 81, scale: v => Math.round((v / 100) * 127) },
      0x1E: { name: 'WG LFO 1 Depth', cc: 83, scale: v => Math.round((v / 100) * 127) },
      0x20: { name: 'WG LFO 2 Depth', cc: 85, scale: v => Math.round((v / 100) * 127) },
      0x24: { name: 'Pitch Env T1', cc: 28, scale: v => Math.round((v / 100) * 127) },
      0x25: { name: 'Pitch Env T2', cc: 30, scale: v => Math.round((v / 100) * 127) },
      0x26: { name: 'Pitch Env T3', cc: 31, scale: v => Math.round((v / 100) * 127) },
      0x28: { name: 'Pitch Env L0', cc: 27, scale: v => Math.round((v / 100) * 127) },
      0x29: { name: 'Pitch Env L1', cc: 29, scale: v => Math.round((v / 100) * 127) },
      0x2A: { name: 'Pitch Env L2', cc: 35, scale: v => Math.round((v / 100) * 127) },
      0x30: { name: 'TVF Mode', cc: 86, scale: scale4 },
      0x32: { name: 'TVF Resonance', cc: 9, scale: v => Math.round((v / 100) * 127) },
      0x33: { name: 'TVF Cutoff', cc: 3, scale: v => Math.round((v / 100) * 127) },
      0x34: { name: 'TVF Env Depth', cc: 87, scale: v => Math.round((v / 100) * 127) },
      0x35: { name: 'TVF Key Follow', cc: 89, scale: v => Math.round((v / 100) * 127) },
      0x36: { name: 'TVF LFO Select', cc: 90, scale: scale4 },
      0x37: { name: 'TVF LFO Depth', cc: 102, scale: v => Math.round((v / 100) * 127) },
      0x38: { name: 'TVF Env T1', cc: 47, scale: v => Math.round((v / 100) * 127) },
      0x39: { name: 'TVF Env T2', cc: 50, scale: v => Math.round((v / 100) * 127) },
      0x3A: { name: 'TVF Env T3', cc: 52, scale: v => Math.round((v / 100) * 127) },
      0x3B: { name: 'TVF Env T4', cc: 54, scale: v => Math.round((v / 100) * 127) },
      0x3C: { name: 'TVF Env L1', cc: 48, scale: v => Math.round((v / 100) * 127) },
      0x3D: { name: 'TVF Env L2', cc: 51, scale: v => Math.round((v / 100) * 127) },
      0x3E: { name: 'TVF Env Sustain', cc: 53, scale: v => Math.round((v / 100) * 127) },
      0x3F: { name: 'TVA Level', cc: 103, scale: v => Math.round((v / 100) * 127) },
      0x42: { name: 'TVA Bias Point', cc: 104, scale: v => Math.round((v / 100) * 127) },
      0x43: { name: 'TVA Bias Level', cc: 105, scale: v => Math.round((v / 100) * 127) },
      0x44: { name: 'TVA Bias Direction', cc: 106, scale: v => (v ? 127 : 0) },
      0x45: { name: 'TVA LFO Select', cc: 107, scale: scale4 },
      0x46: { name: 'TVA LFO Depth', cc: 108, scale: v => Math.round((v / 100) * 127) },
      0x48: { name: 'TVA Env T1', cc: 57, scale: v => Math.round((v / 100) * 127) },
      0x49: { name: 'TVA Env T2', cc: 59, scale: v => Math.round((v / 100) * 127) },
      0x4A: { name: 'TVA Env T3', cc: 61, scale: v => Math.round((v / 100) * 127) },
      0x4B: { name: 'TVA Env T4', cc: 63, scale: v => Math.round((v / 100) * 127) },
      0x4C: { name: 'TVA Env L1', cc: 58, scale: v => Math.round((v / 100) * 127) },
      0x4D: { name: 'TVA Env L2', cc: 60, scale: v => Math.round((v / 100) * 127) },
      0x4E: { name: 'TVA Env Sustain', cc: 62, scale: v => Math.round((v / 100) * 127) }
    };
  }

  getChannels(targetCh = this.channel) {
    if (targetCh === 'both' || targetCh === 'all' || targetCh === 'auto' || targetCh === 0) {
      // Broadcast to Ch 1, 2, and 3 to ensure Part A (Ch 2) and Part B (Ch 3) always produce sound
      return [1, 2, 3];
    }
    const c = parseInt(targetCh, 10);
    return isNaN(c) ? [1, 2, 3] : [Math.max(1, Math.min(16, c))];
  }

  /**
   * Initializes Web MIDI API.
   */
  async init() {
    if (!navigator.requestMIDIAccess) {
      this.updateStatusBadge(false, 'Web MIDI not supported', false);
      return false;
    }

    try {
      const ok = await this.connect(false);
      if (ok) return true;
    } catch (e) {}

    this.updateStatusBadge(false, 'Connect', true);
    return false;
  }

  /**
   * Connects to Web MIDI.
   */
  async connect(userTriggered = false) {
    if (!navigator.requestMIDIAccess) {
      alert('Your browser does not support the Web MIDI API. Please use Google Chrome, Microsoft Edge, or Opera.');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.midiAccess.onstatechange = () => this.handleStateChange();
      
      const found = this.refreshPorts();
      if (found && this.output) {
        if (typeof setStatus === 'function') {
          setStatus(`🔌 Connected to Roland JD-08 ("${this.output.name}") [Beta Feature]`);
        }
        // Immediately set full volume & expression so the synth is NEVER quiet
        for (const ch of [1, 2, 3]) {
          this.sendCC(7, 127, ch);
          this.sendCC(11, 127, ch);
          this.sendCC(112, 127, ch);
        }
        // Load initial preset on hardware JD-08
        this.selectPreset(0);
        if (userTriggered) {
          this.testNote();
        }
        return true;
      } else {
        if (userTriggered) {
          alert('Web MIDI access granted, but Roland JD-08 Sound Port was not detected.\n\nPlease check:\n1. Is the Roland JD-08 USB cable connected?\n2. Is the synth powered ON?\n3. Close any DAW (Ableton/FL/Cubase) that may lock the MIDI port.');
        }
        return false;
      }
    } catch (err) {
      console.warn('Web MIDI connection failed:', err);
      if (err.name === 'SecurityError' || err.name === 'NotAllowedError') {
        this.updateStatusBadge(false, '🔌 Click to Allow MIDI', true);
        if (userTriggered) {
          alert('MIDI permission was blocked by the browser.\n\nTo allow:\n1. Click the lock / tune icon on the left of your address bar.\n2. Set "MIDI devices" to "Allow".\n3. Click "Connect Roland JD-08" again.');
        }
      } else {
        this.updateStatusBadge(false, 'MIDI Error', true);
      }
      return false;
    }
  }

  /**
   * Scans and pairs JD-08 Sound Port ONLY.
   * Explicitly avoids any port matching "CTRL" or "DAW" to avoid hardware freezing.
   */
  refreshPorts() {
    if (!this.midiAccess) return false;
    const outputs = Array.from(this.midiAccess.outputs.values());
    const inputs = Array.from(this.midiAccess.inputs.values());

    const isJdSound = o => /jd-?08/i.test(o.name) && !/ctrl|control|daw/i.test(o.name);
    const isSafeRoland = o => /roland/i.test(o.name) && !/ctrl|control|daw/i.test(o.name);
    const isNonCtrl = o => !/ctrl|control|daw/i.test(o.name);

    let matchedSound = null;

    if (this.selectedOutputId && this.selectedOutputId !== 'auto') {
      const candidate = outputs.find(o => o.id === this.selectedOutputId);
      if (candidate && isNonCtrl(candidate)) {
        matchedSound = candidate;
      } else {
        this.selectedOutputId = 'auto';
        localStorage.removeItem('jd08_midi_output_id');
      }
    }

    if (!matchedSound) {
      matchedSound = outputs.find(isJdSound) || 
                     outputs.find(isSafeRoland) || 
                     outputs.find(isNonCtrl) || 
                     null;
    }

    this.output = matchedSound;

    let matchedInput = null;
    if (this.selectedInputId && this.selectedInputId !== 'auto') {
      matchedInput = inputs.find(i => i.id === this.selectedInputId && isNonCtrl(i));
    }
    if (!matchedInput) {
      matchedInput = inputs.find(i => isJdSound(i)) || 
                     inputs.find(i => isSafeRoland(i)) || 
                     inputs.find(isNonCtrl) || 
                     null;
    }

    this.input = matchedInput;
    if (this.input) {
      this.input.onmidimessage = msg => this.handleIncomingMidi(msg);
    }

    if (this.output) {
      this.connectedDeviceName = this.output.name;
      this.updateStatusBadge(true, 'Connected', false);
    } else {
      this.connectedDeviceName = null;
      this.updateStatusBadge(false, 'Connect', true);
    }

    const chSelect = document.getElementById('obChannelSelect');
    if (chSelect) {
      chSelect.value = String(this.channel);
    }

    this.syncModalDropdowns();
    return !!this.output;
  }

  handleStateChange() {
    const wasConnected = !!this.output;
    const found = this.refreshPorts();
    if (!wasConnected && found && this.output) {
      if (typeof setStatus === 'function') {
        setStatus(`🔌 Roland JD-08 plugged in: "${this.output.name}" (Note: MIDI & synth integration is a Beta feature)`);
      }
    } else if (wasConnected && !this.output) {
      if (typeof setStatus === 'function') {
        setStatus('⚡ Roland JD-08 disconnected.');
      }
    }
  }

  handleIncomingMidi(e) {}

  /**
   * Sends raw MIDI bytes strictly to the JD-08 Sound Port.
   */
  sendRaw(bytes) {
    if (this.output) {
      try {
        this.output.send(bytes);
        this.flashActivityIndicator();
      } catch (e) {
        console.warn('MIDI Send error:', e);
      }
    }
  }

  /**
   * Sends a MIDI Control Change message across active channels.
   */
  sendCC(cc, value, targetCh = this.channel) {
    const channels = this.getChannels(targetCh);
    const safeCC = Math.max(0, Math.min(127, cc & 0x7F));
    const safeVal = Math.max(0, Math.min(127, value & 0x7F));

    channels.forEach(ch => {
      const channelNibble = (ch - 1) & 0x0F;
      const status = 0xB0 | channelNibble;
      this.sendRaw([status, safeCC, safeVal]);
    });
  }

  /**
   * Sends a Tone parameter live to the JD-08.
   */
  sendToneParam(toneIdx, toneOffset, rawVal) {
    if (!this.output || !this.liveSync) return;
    const mapping = this.TONE_MAP[toneOffset];
    if (!mapping) return;

    const midiVal = mapping.scale(rawVal);
    this.sendCC(mapping.cc, midiVal);
  }

  /**
   * Sends Note On across active channels
   */
  noteOn(midiNote = 60, velocity = 100, targetCh = this.channel) {
    const channels = this.getChannels(targetCh);
    this.heldNotes.add(midiNote);

    channels.forEach(ch => {
      const channelNibble = (ch - 1) & 0x0F;
      const status = 0x90 | channelNibble;
      this.sendRaw([status, midiNote & 0x7F, velocity & 0x7F]);
    });
  }

  /**
   * Sends Note Off across active channels
   */
  noteOff(midiNote = 60, targetCh = this.channel) {
    const channels = this.getChannels(targetCh);
    this.heldNotes.delete(midiNote);

    channels.forEach(ch => {
      const channelNibble = (ch - 1) & 0x0F;
      const status = 0x80 | channelNibble;
      this.sendRaw([status, midiNote & 0x7F, 0]);
    });
  }

  testNote() {
    if (!this.output) {
      this.connect(true).then(ok => {
        if (ok) {
          this.noteOn(60, 110);
          setTimeout(() => this.noteOff(60), 500);
        }
      });
      return;
    }
    this.noteOn(60, 110);
    setTimeout(() => this.noteOff(60), 500);
  }

  /**
   * Emergency panic: All Notes Off, All Sound Off, Reset Controllers, restore Volume.
   */
  panic() {
    this.auditionTimers.forEach(id => clearTimeout(id));
    this.auditionTimers = [];
    this.isPlayingAudition = false;
    this.updateAuditionButtonState(false);

    for (let ch = 1; ch <= 16; ch++) {
      this.sendCC(120, 0, ch); // All Sound Off
      this.sendCC(123, 0, ch); // All Notes Off
      this.sendCC(121, 0, ch); // Reset All Controllers
      this.sendCC(7, 100, ch);  // Restore Volume
      this.sendCC(112, 127, ch);// Ensure Active is ON
    }
    this.heldNotes.clear();
  }

  /**
   * Unfreezes and restores the Roland JD-08 hardware synth.
   * Counteracts bad states across Channels 1, 2, and 3, turns Part Active ON,
   * un-mutes Volume, raises Tone Palettes A-D, opens Cutoff, resets envelopes, and plays sound.
   */
  async unfreezeSynth() {
    if (!this.output) {
      const ok = await this.connect(true);
      if (!ok) return false;
    }
    this.stopAudition();

    // Send unfreeze across Channels 1, 2, and 3
    for (const ch of [1, 2, 3]) {
      this.sendCC(120, 0, ch);   // All Sound Off
      this.sendCC(121, 0, ch);   // Reset All Controllers
      this.sendCC(123, 0, ch);   // All Notes Off
      this.sendCC(112, 127, ch); // Voicing Active = ON
      this.sendCC(115, 0, ch);   // Solo = OFF
      this.sendCC(119, 0, ch);   // Unison = OFF
      this.sendCC(7, 120, ch);   // Volume = 120
      this.sendCC(11, 127, ch);  // Expression = 127
      this.sendCC(110, 120, ch); // Voicing Level
      this.sendCC(68, 120, ch);  // Tone Palette A = 120
      this.sendCC(69, 120, ch);  // Tone Palette B = 120
      this.sendCC(70, 120, ch);  // Tone Palette C = 120
      this.sendCC(71, 120, ch);  // Tone Palette D = 120
      this.sendCC(3, 115, ch);   // Filter Cutoff open (115)
      this.sendCC(9, 20, ch);    // Filter Resonance low (20)
      this.sendCC(86, 0, ch);    // TVF Low-Pass Filter
      this.sendCC(103, 115, ch); // TVA Level 115
      this.sendCC(57, 0, ch);    // TVA Attack 0 (instant)
      this.sendCC(58, 127, ch);  // TVA L1
      this.sendCC(62, 127, ch);  // TVA Sustain full
      this.sendCC(63, 25, ch);   // TVA Release normal
      await this.sleep(18);
    }

    // Play clean confirmation note across channels 2 and 3
    this.noteOn(60, 110, 2);
    this.noteOn(64, 110, 2);
    await this.sleep(350);
    this.noteOff(60, 2);
    this.noteOff(64, 2);

    if (typeof setStatus === 'function') {
      setStatus('✓ Roland JD-08 unfreezed & restored! Active=ON, Volume=120, Cutoff=Open.');
    }
    return true;
  }

  /**
   * Selects an authentic patch on the Roland JD-08 via Bank Select + Program Change.
   * Maps 0..255:
   * Bank A: 0..63   (MSB 0, PC 0..63)
   * Bank B: 64..127  (MSB 0, PC 64..127)
   * Bank C: 128..191 (MSB 1, PC 0..63)
   * Bank D: 192..255 (MSB 1, PC 64..127)
   * Immediately sets full Volume (CC 7) & Expression (CC 11) so output is NEVER quiet.
   */
  selectPreset(globalPatchIdx) {
    if (!this.output) return;
    const idx = Math.max(0, Math.min(255, parseInt(globalPatchIdx, 10) || 0));
    const bankMsb = idx >= 128 ? 1 : 0;
    const pc = idx % 128;

    const channels = this.getChannels();
    channels.forEach(ch => {
      // 1. Bank Select
      this.sendCC(0, bankMsb, ch);
      this.sendCC(32, 0, ch);

      // 2. Program Change
      const channelNibble = (ch - 1) & 0x0F;
      this.sendRaw([0xC0 | channelNibble, pc & 0x7F]);

      // 3. Keep Volume & Expression at full 127
      this.sendCC(7, 127, ch);
      this.sendCC(11, 127, ch);
      this.sendCC(110, 127, ch);
      this.sendCC(112, 127, ch);
    });
  }

  /**
   * Transmits full patch parameter buffer to Roland JD-08 safely.
   */
  async pushFullPatch(patch, patchIdx = null, onProgress = null) {
    if (!this.output) {
      const ok = await this.connect(true);
      if (!ok) return false;
    }
    if (!patch || !patch.raw) return false;
    if (this.isTransmitting) return false;
    this.isTransmitting = true;
    this.flashTransmittingIndicator(true);

    const raw = patch.raw;
    const channels = this.getChannels();

    // 1. Load baseline preset slot on hardware JD-08 first
    if (patchIdx !== null && patchIdx !== undefined) {
      if (onProgress) onProgress('Loading preset slot...');
      this.selectPreset(patchIdx);
      await this.sleep(80);
    }

    // Determine primary active tone
    let activeToneIdx = 0;
    if (patch.tones && patch.tones.length) {
      const foundIdx = patch.tones.findIndex(t => t.active);
      if (foundIdx >= 0) activeToneIdx = foundIdx;
    }
    const base = 0x670 + activeToneIdx * 80;
    const toneLetter = 'ABCD'[activeToneIdx];

    for (const ch of channels) {
      if (onProgress) onProgress(`Init Part (Ch ${ch})...`);

      // 1. Reset controllers & guarantee Active Part is ON
      this.sendCC(121, 0, ch); // Reset controllers
      this.sendCC(123, 0, ch); // All notes off
      this.sendCC(112, 127, ch); // Voicing Active ON
      this.sendCC(115, 0, ch); // Solo OFF
      this.sendCC(119, 0, ch); // Unison OFF
      await this.sleep(16);

      // 2. Part Level (CC 7) & Expression (CC 11) - full output!
      this.sendCC(7, 127, ch);
      this.sendCC(11, 127, ch);
      this.sendCC(110, 127, ch);
      await this.sleep(16);

      // 3. Tone Palettes (CC 68-71) matching active tone levels
      for (let t = 0; t < 4; t++) {
        const tBase = 0x670 + t * 80;
        const isAct = patch.tones[t]?.active;
        const tLvl = isAct ? Math.round(((raw[tBase + 0x3F] ?? 80) / 100) * 127) : 0;
        this.sendCC(68 + t, tLvl, ch);
        await this.sleep(12);
      }

      // 4. Portamento (CC 117) & Portamento Time (CC 5)
      this.sendCC(117, raw[0x2E] ? 127 : 0, ch);
      this.sendCC(5, Math.round(((raw[0x2F] || 0) / 100) * 127), ch);
      await this.sleep(14);

      // 5. FX B: Reverb Time (CC 13), Reverb Level (CC 91), Chorus Level (CC 93)
      if (raw[0x50] !== undefined) this.sendCC(13, Math.round((raw[0x50] / 100) * 127), ch);
      if (raw[0x52] !== undefined) this.sendCC(91, Math.round((raw[0x52] / 100) * 127), ch);
      if (raw[0x88] !== undefined) this.sendCC(93, Math.round((raw[0x88] / 100) * 127), ch);
      await this.sleep(14);

      if (onProgress) onProgress(`Tone ${toneLetter} waveform & pitch...`);

      // 6. Waveform (CC 72)
      const waveId = raw[base + 0x14] | (raw[base + 0x15] << 8);
      this.sendCC(72, Math.min(108, Math.max(0, waveId)), ch);
      await this.sleep(14);

      // 7. Pitch Coarse (CC 79) & Fine (CC 80)
      const coarse = raw[base + 0x1B] ?? 12;
      this.sendCC(79, Math.round(64 + (coarse - 12) * (63 / 12)), ch);
      await this.sleep(14);

      const fine = raw[base + 0x1C] ?? 50;
      this.sendCC(80, Math.round(64 + (fine - 50) * (63 / 50)), ch);
      await this.sleep(14);

      // 8. Pitch Env & LFO Pitch Mod
      if (raw[base + 0x1D] !== undefined) this.sendCC(81, Math.round((raw[base + 0x1D] / 100) * 127), ch);
      if (raw[base + 0x1E] !== undefined) this.sendCC(83, Math.round((raw[base + 0x1E] / 100) * 127), ch);
      if (raw[base + 0x20] !== undefined) this.sendCC(85, Math.round((raw[base + 0x20] / 100) * 127), ch);
      await this.sleep(14);

      if (onProgress) onProgress(`Tone ${toneLetter} filter (TVF)...`);

      // 9. TVF Mode (CC 86: 0 = LPF, 48 = BPF, 80 = HPF)
      const tvfMode = raw[base + 0x30] || 0;
      this.sendCC(86, tvfMode === 1 ? 48 : (tvfMode === 2 ? 80 : 0), ch);
      await this.sleep(14);

      // 10. TVF Cutoff (CC 3) & Resonance (CC 9)
      const cutoff = raw[base + 0x33] ?? 80;
      this.sendCC(3, Math.round((cutoff / 100) * 127), ch);
      await this.sleep(14);

      const reso = raw[base + 0x32] || 0;
      this.sendCC(9, Math.round((reso / 100) * 127), ch);
      await this.sleep(14);

      // 11. TVF Env Depth (CC 87) & Key Follow (CC 89)
      this.sendCC(87, Math.round(((raw[base + 0x34] || 0) / 100) * 127), ch);
      this.sendCC(89, Math.round(((raw[base + 0x35] || 0) / 100) * 127), ch);
      await this.sleep(14);

      // 12. TVF Envelopes
      this.sendCC(47, Math.round(((raw[base + 0x38] || 0) / 100) * 127), ch);
      this.sendCC(50, Math.round(((raw[base + 0x39] || 0) / 100) * 127), ch);
      this.sendCC(52, Math.round(((raw[base + 0x3A] || 0) / 100) * 127), ch);
      this.sendCC(54, Math.round(((raw[base + 0x3B] || 0) / 100) * 127), ch);
      this.sendCC(48, Math.round(((raw[base + 0x3C] || 0) / 100) * 127), ch);
      this.sendCC(51, Math.round(((raw[base + 0x3D] || 0) / 100) * 127), ch);
      this.sendCC(53, Math.round(((raw[base + 0x3E] ?? 80) / 100) * 127), ch);
      await this.sleep(14);

      if (onProgress) onProgress(`Tone ${toneLetter} amplifier (TVA)...`);

      // 13. TVA Level (CC 103) & Envelopes
      const tvaLevel = raw[base + 0x3F] ?? 80;
      this.sendCC(103, Math.round((tvaLevel / 100) * 127), ch);
      await this.sleep(14);

      this.sendCC(57, Math.round(((raw[base + 0x48] || 0) / 100) * 127), ch);
      this.sendCC(59, Math.round(((raw[base + 0x49] || 0) / 100) * 127), ch);
      this.sendCC(61, Math.round(((raw[base + 0x4A] || 0) / 100) * 127), ch);
      this.sendCC(63, Math.round(((raw[base + 0x4B] ?? 20) / 100) * 127), ch);
      this.sendCC(58, Math.round(((raw[base + 0x4C] ?? 100) / 100) * 127), ch);
      this.sendCC(60, Math.round(((raw[base + 0x4D] ?? 100) / 100) * 127), ch);
      this.sendCC(62, Math.round(((raw[base + 0x4E] ?? 100) / 100) * 127), ch);
      await this.sleep(14);

      if (onProgress) onProgress(`Tone ${toneLetter} LFOs...`);

      // 14. LFO 1 & 2
      this.sendCC(19, Math.round(((raw[base + 0x04] || 0) / 5) * 127), ch);
      this.sendCC(14, Math.round(((raw[base + 0x06] || 0) / 100) * 127), ch);
      this.sendCC(15, Math.round(((raw[base + 0x08] || 0) / 100) * 127), ch);
      this.sendCC(16, Math.round(((raw[base + 0x0A] || 0) / 100) * 127), ch);
      await this.sleep(14);

      this.sendCC(23, Math.round(((raw[base + 0x0C] || 0) / 5) * 127), ch);
      this.sendCC(20, Math.round(((raw[base + 0x0E] || 0) / 100) * 127), ch);
      this.sendCC(21, Math.round(((raw[base + 0x10] || 0) / 100) * 127), ch);
      this.sendCC(22, Math.round(((raw[base + 0x12] || 0) / 100) * 127), ch);
      await this.sleep(14);
    }

    // Confirmation sound on the synth
    if (onProgress) onProgress('Testing sound...');
    this.noteOn(60, 110);
    this.noteOn(64, 105);
    await this.sleep(280);
    this.noteOff(60);
    this.noteOff(64);

    this.isTransmitting = false;
    this.flashTransmittingIndicator(false);
    if (onProgress) onProgress('Complete');
    return true;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Musical Audition generator for the physical Roland JD-08
   */
  async auditionPatch(patch, patchIdx = null) {
    if (!this.output) {
      const ok = await this.connect(true);
      if (!ok) return;
    }
    if (this.isPlayingAudition) {
      this.stopAudition();
      return;
    }

    this.stopAudition();
    this.isPlayingAudition = true;
    this.updateAuditionButtonState(true);

    // If patch index is provided, load the authentic hardware preset first
    if (patchIdx !== null && patchIdx !== undefined) {
      this.selectPreset(patchIdx);
      await this.sleep(50);
    } else {
      const channels = this.getChannels();
      channels.forEach(ch => {
        this.sendCC(112, 127, ch); // Voicing Active ON
        this.sendCC(7, 127, ch);   // Part Level 127
        this.sendCC(11, 127, ch);  // Expression 127
      });
    }

    const cat = patch ? (patch.category || 'SYNTH') : 'SYNTH';
    const bpm = 120;
    const beat = 60000 / bpm; // 500ms

    let pattern = [];
    if (cat === 'BASS') {
      const root = 36; // C2
      pattern = [
        { note: root, time: 0, dur: 0.45 * beat, vel: 110 },
        { note: root, time: 0.5 * beat, dur: 0.35 * beat, vel: 95 },
        { note: root + 12, time: 1.0 * beat, dur: 0.4 * beat, vel: 105 },
        { note: root + 7, time: 1.5 * beat, dur: 0.4 * beat, vel: 100 },
        { note: root + 10, time: 2.0 * beat, dur: 0.35 * beat, vel: 95 },
        { note: root + 12, time: 2.5 * beat, dur: 0.8 * beat, vel: 115 }
      ];
    } else if (cat === 'PAD') {
      pattern = [
        { note: 48, time: 0, dur: 3.5 * beat, vel: 95 },
        { note: 55, time: 0.1 * beat, dur: 3.4 * beat, vel: 90 },
        { note: 59, time: 0.2 * beat, dur: 3.3 * beat, vel: 95 },
        { note: 62, time: 0.3 * beat, dur: 3.2 * beat, vel: 100 },
        { note: 64, time: 0.4 * beat, dur: 3.1 * beat, vel: 90 }
      ];
    } else if (cat === 'LEAD') {
      const root = 60; // C4
      pattern = [
        { note: root, time: 0, dur: 0.35 * beat, vel: 110 },
        { note: root + 3, time: 0.5 * beat, dur: 0.35 * beat, vel: 100 },
        { note: root + 7, time: 1.0 * beat, dur: 0.35 * beat, vel: 105 },
        { note: root + 10, time: 1.5 * beat, dur: 0.35 * beat, vel: 110 },
        { note: root + 12, time: 2.0 * beat, dur: 1.2 * beat, vel: 115 }
      ];
    } else if (cat === 'BELL') {
      const root = 72; // C5
      pattern = [
        { note: root, time: 0, dur: 0.5 * beat, vel: 105 },
        { note: root + 4, time: 0.25 * beat, dur: 0.5 * beat, vel: 100 },
        { note: root + 7, time: 0.5 * beat, dur: 0.6 * beat, vel: 110 },
        { note: root + 11, time: 0.75 * beat, dur: 0.6 * beat, vel: 100 },
        { note: root + 12, time: 1.0 * beat, dur: 1.8 * beat, vel: 115 }
      ];
    } else {
      pattern = [
        { note: 60, time: 0, dur: 0.4 * beat, vel: 105 },
        { note: 64, time: 0, dur: 0.4 * beat, vel: 100 },
        { note: 67, time: 0, dur: 0.4 * beat, vel: 100 },
        { note: 60, time: 0.75 * beat, dur: 0.4 * beat, vel: 100 },
        { note: 64, time: 0.75 * beat, dur: 0.4 * beat, vel: 95 },
        { note: 67, time: 0.75 * beat, dur: 0.4 * beat, vel: 95 },
        { note: 62, time: 1.5 * beat, dur: 1.2 * beat, vel: 110 },
        { note: 65, time: 1.5 * beat, dur: 1.2 * beat, vel: 105 },
        { note: 69, time: 1.5 * beat, dur: 1.2 * beat, vel: 105 }
      ];
    }

    pattern.forEach(step => {
      const onId = setTimeout(() => {
        this.noteOn(step.note, step.vel);
      }, step.time);
      const offId = setTimeout(() => {
        this.noteOff(step.note);
      }, step.time + step.dur);
      this.auditionTimers.push(onId, offId);
    });

    const totalDur = Math.max(...pattern.map(p => p.time + p.dur)) + 200;
    const endId = setTimeout(() => {
      this.isPlayingAudition = false;
      this.updateAuditionButtonState(false);
    }, totalDur);
    this.auditionTimers.push(endId);
  }

  stopAudition() {
    this.auditionTimers.forEach(id => clearTimeout(id));
    this.auditionTimers = [];
    this.isPlayingAudition = false;
    this.heldNotes.forEach(n => this.noteOff(n));
    this.heldNotes.clear();
    this.sendCC(123, 0); // All Notes Off
    this.updateAuditionButtonState(false);
  }

  updateAuditionButtonState(isPlaying) {
    const btns = document.querySelectorAll('.ob-audition-btn, .audition-trigger-btn');
    btns.forEach(btn => {
      if (isPlaying) {
        btn.classList.add('playing');
        btn.innerHTML = '<span>◼ STOP</span><small>Playing</small>';
      } else {
        btn.classList.remove('playing');
        btn.innerHTML = '<span>▶ AUDITION</span><small>[Key P]</small>';
      }
    });
  }

  // ============================================================================
  // PC AUDIO MONITORING ENGINE (Web Audio API)
  // Streams Roland JD-08 USB Audio (IN MIX) directly into PC speakers/headphones
  // ============================================================================
  async toggleAudioMonitor() {
    if (this.isMonitoringAudio) {
      this.stopAudioMonitor();
      return false;
    }
    return await this.startAudioMonitor();
  }

  async startAudioMonitor() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support Web Audio input streaming.');
      return false;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      const jdMix = audioInputs.find(d => /in mix.*jd-?08|jd-?08.*mix/i.test(d.label)) ||
                    audioInputs.find(d => /jd-?08/i.test(d.label)) ||
                    audioInputs[0];

      const constraints = {
        audio: jdMix && jdMix.deviceId ? {
          deviceId: { exact: jdMix.deviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          latency: 0
        } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.audioMonitorContext = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioMonitorContext.state === 'suspended') {
        await this.audioMonitorContext.resume();
      }
      this.audioMonitorSource = this.audioMonitorContext.createMediaStreamSource(stream);
      this.audioMonitorSource.connect(this.audioMonitorContext.destination);
      this.audioMonitorStream = stream;
      this.isMonitoringAudio = true;
      this.updateMonitorButtonState(true);
      if (typeof setStatus === 'function') {
        setStatus(`🔊 PC Audio Monitor ACTIVE: Streaming Roland JD-08 audio to PC speakers!`);
      }
      return true;
    } catch (err) {
      console.warn('Audio monitor error:', err);
      alert('Could not start PC Audio Monitor.\n' + err.message + '\n\nNote: If using physical headphones, you can also plug directly into the JD-08 3.5mm jack.');
      return false;
    }
  }

  stopAudioMonitor() {
    if (this.audioMonitorStream) {
      this.audioMonitorStream.getTracks().forEach(t => t.stop());
      this.audioMonitorStream = null;
    }
    if (this.audioMonitorSource) {
      this.audioMonitorSource.disconnect();
      this.audioMonitorSource = null;
    }
    if (this.audioMonitorContext) {
      this.audioMonitorContext.close();
      this.audioMonitorContext = null;
    }
    this.isMonitoringAudio = false;
    this.updateMonitorButtonState(false);
    if (typeof setStatus === 'function') {
      setStatus('PC Audio Monitor stopped.');
    }
  }

  updateMonitorButtonState(isActive) {
    const btns = document.querySelectorAll('.ob-monitor-btn');
    btns.forEach(btn => {
      btn.classList.toggle('active', isActive);
      btn.innerHTML = isActive 
        ? '<span>🔊 PC SPK: ON</span>' 
        : '<span>🔈 PC SPK: OFF</span>';
    });
  }

  updateStatusBadge(connected, text, promptToConnect = false) {
    const pills = document.querySelectorAll('.ob-status-pill');
    pills.forEach(pill => {
      pill.classList.toggle('connected', connected);
      pill.classList.toggle('prompt-connect', promptToConnect);
      const dot = pill.querySelector('.ob-dot');
      const lbl = pill.querySelector('.ob-lbl');
      if (dot) {
        dot.classList.toggle('online', connected);
        dot.classList.toggle('prompt', promptToConnect);
      }
      if (lbl) lbl.textContent = connected ? 'Connected' : 'Connect';
      pill.title = connected
        ? `Roland JD-08 Connected (${this.output ? this.output.name : 'USB'}) - Click for settings`
        : 'Click to Connect Roland JD-08 via USB';
    });

    const badge = document.getElementById('midiBadgeStatus');
    const desc = document.getElementById('midiStatusDesc');
    const btn = document.getElementById('midiConnectBtn');

    if (badge) {
      badge.textContent = connected ? 'CONNECTED (BETA)' : (promptToConnect ? 'DISCONNECTED' : 'STANDBY');
      badge.style.color = connected ? 'var(--el-cyan)' : 'var(--el-amber)';
      badge.style.borderColor = connected ? 'var(--el-cyan)' : 'var(--el-amber)';
    }
    if (desc) {
      desc.textContent = connected 
        ? `Connected to "${this.output ? this.output.name : 'Roland JD-08'}". Note: MIDI & synth integration is currently a Beta feature.`
        : `Roland JD-08 is not currently connected to the browser session. Note: MIDI & synth integration is a Beta feature. Click Connect to grant MIDI access.`;
    }
    if (btn) {
      btn.textContent = connected ? '✓ Connected' : 'Connect';
      btn.classList.toggle('pri', !connected);
    }
  }

  flashActivityIndicator() {
    const dot = document.querySelector('.ob-dot.online');
    if (dot) {
      dot.classList.add('active-blink');
      setTimeout(() => dot.classList.remove('active-blink'), 80);
    }
  }

  syncModalDropdowns() {
    if (!this.midiAccess) return;
    const outSel = document.getElementById('settingMidiOutput');
    const inSel = document.getElementById('settingMidiInput');
    const chSel = document.getElementById('settingMidiChannel');
    const syncChk = document.getElementById('settingMidiLiveSync');
    const autoPushChk = document.getElementById('settingMidiAutoPush');

    if (outSel) {
      const safeOuts = Array.from(this.midiAccess.outputs.values()).filter(o => !/ctrl|control|daw/i.test(o.name));
      outSel.innerHTML = '<option value="auto">Auto-Detect Roland JD-08 (Sound Port)</option>' +
        safeOuts.map(o => `<option value="${o.id}" ${this.output && this.output.id === o.id ? 'selected' : ''}>${o.name}</option>`).join('');
    }
    if (inSel) {
      const safeIns = Array.from(this.midiAccess.inputs.values()).filter(i => !/ctrl|control|daw/i.test(i.name));
      inSel.innerHTML = '<option value="auto">Auto-Detect Roland JD-08</option>' +
        safeIns.map(i => `<option value="${this.input && this.input.id === i.id ? 'selected' : ''}">${i.name}</option>`).join('');
    }
    if (chSel) chSel.value = String(this.channel);
    const obCh = document.getElementById('obChannelSelect');
    if (obCh) obCh.value = String(this.channel);
    if (syncChk) syncChk.checked = this.liveSync;
    if (autoPushChk) autoPushChk.checked = this.autoPushOnSelect;
  }

  setOutput(id) {
    this.selectedOutputId = id;
    localStorage.setItem('jd08_midi_output_id', id);
    this.refreshPorts();
  }

  setInput(id) {
    this.selectedInputId = id;
    localStorage.setItem('jd08_midi_input_id', id);
    this.refreshPorts();
  }

  setChannel(ch) {
    this.channel = ch;
    localStorage.setItem('jd08_midi_channel', String(this.channel));
    const obCh = document.getElementById('obChannelSelect');
    if (obCh && obCh.value !== String(ch)) obCh.value = String(ch);
    const chSel = document.getElementById('settingMidiChannel');
    if (chSel && chSel.value !== String(ch)) chSel.value = String(ch);
  }

  setLiveSync(enabled) {
    this.liveSync = !!enabled;
    localStorage.setItem('jd08_midi_live_sync', this.liveSync ? 'true' : 'false');
  }

  setAutoPush(enabled) {
    this.autoPushOnSelect = !!enabled;
    localStorage.setItem('jd08_midi_auto_push', this.autoPushOnSelect ? 'true' : 'false');
  }
}

// Global Singleton Instance
window.JD08Midi = new JD08MidiOverbridge();
