/**
 * ELEKTRON OVERBRIDGE INSPIRED MASTER JAVASCRIPT ENGINE — JD-08 / JD-800 LIBRARIAN
 * Precision Synthesizer Workstation, Dual-Pane Transfer Sound Pool & Rotary Encoder UI
 */

// ============================================================================
// 1. CONSTANTS, WAVEFORMS & BINARY HEADERS
// ============================================================================
const PATCH_SIZE_JD08 = 2048;
const SCENE_SIZE_JD08 = 11524;
const JD08_PATCH_HEADER = new Uint8Array([0x00,0x00,0x00,0x00, 0x01,0x01,0x05,0x00, 0x0F,0x00,0x00,0x00, 0x00,0x00,0x00,0x00]);

const WAVES = "Syn Saw 1|Syn Saw 2|FAT Saw|FAT Square|Syn Pulse1|Syn Pulse2|Syn Pulse3|Syn Pulse4|Syn Pulse5|Pulse Mod|Triangle|Sine|Soft Saw|Synced Saw|HPF Saw|Digital 1|Digital 2|Digital 3|Digital 4|Digital 5|Digital 6|Digital 7|Glass Wave|Bell Wave|Organ 1|Organ 2|E.Organ 1|E.Organ 2|Vocal 1|Vocal 2|Choir|Voice Pad|Piano|E.Piano 1|E.Piano 2|Clav|Harpsichord|Celesta|Marimba|Vibe|Xylophone|Steel Drum|Kalimba|Gamelan 1|Gamelan 2|Bell 1|Bell 2|Chime|Fingered B|Picked Bass|Fretless|Slap Bass|Synth Bass|Acoustic G|Nylong Gt|E.Guitar 1|E.Guitar 2|Dist Gt|Muted Gt|Gt Harm|Sitar|Pluck 1|Pluck 2|Harp|Strings|Pizzicato|Trumpet|Trombone|French Hrn|Brass|Alto Sax|Tenor Sax|Baritone S|Flute|Pan Flute|Shakuhachi|Blow Pipe|Bottle|Lead Wave|White Noise|Pink Noise|Pitch Wind|Vox Noise|Breath|Metal Hit|Anvil|Wind Agogo|Feedback|Thump|Sparkle|Pole lp|Glass Hit|Cutters|Wood Crack|Scratch|Drop|E.Piano Atk|Piano Atk|Shamisen|Koto|Tuba|Log Drum|Timbale|Cabasa|Snare|Kick|Hi-Hat|Tom"
  .split("|").map((n, i) => `${String(i + 1).padStart(3, '0')}: ${n}`);
const LFO_SHAPES = ["TRI", "SAW", "SQR", "S&H", "RND"];
const TVF_MODES  = ["OFF", "LPF", "BPF", "HPF"];
const CATEGORIES = ["ALL", "BASS", "PAD", "LEAD", "KEYS", "BELL", "SYNTH", "INIT"];

const COMMON_PARAMS = [
  { label: 'Patch Level', offsets: [0x7B3, 0x24], fmt: 'val' },
  { label: 'Key Mode', offsets: [0x20], fmt: 'val' },
  { label: 'Active Tones', offsets: [0x20, 0x36], fmt: 'bitmask4' },
  { label: 'Bender Down', offsets: [0x84], fmt: 'val' },
  { label: 'Bender Up', offsets: [0x86], fmt: 'val' },
  { label: 'Solo SW', offsets: [0x54], fmt: 'onoff' },
  { label: 'Legato SW', offsets: [0x56], fmt: 'onoff' },
  { label: 'Portamento SW', offsets: [0x58], fmt: 'onoff' },
  { label: 'Portamento Mode', offsets: [0x5A], fmt: 'val' },
  { label: 'Portamento Time', offsets: [0x5C], fmt: 'val' }
];

const TONE_WG_PARAMS = [
  { label: 'Active', off: 0x00, fmt: 'onoff' },
  { label: 'Waveform ID', off: 0x14, fmt: 'wave' },
  { label: 'Coarse', off: 0x1B, fmt: 'semi' },
  { label: 'Fine', off: 0x1C, fmt: 'val' },
  { label: 'Pitch Env Depth', off: 0x1D, fmt: 'val' }
];

const TONE_LFO_PARAMS = [
  { label: 'LFO1 Shape', off: 0x04, fmt: 'lfo' },
  { label: 'LFO1 Rate', off: 0x06, fmt: 'val' },
  { label: 'LFO1 Delay', off: 0x08, fmt: 'val' },
  { label: 'LFO1 Fade', off: 0x0A, fmt: 'val' },
  { label: 'LFO2 Shape', off: 0x0C, fmt: 'lfo' },
  { label: 'LFO2 Rate', off: 0x0E, fmt: 'val' }
];

const TONE_TVF_PARAMS = [
  { label: 'Mode', off: 0x30, fmt: 'tvf' },
  { label: 'Cutoff', off: 0x33, fmt: 'val' },
  { label: 'Resonance', off: 0x32, fmt: 'val' },
  { label: 'Env Depth', off: 0x34, fmt: 'val' },
  { label: 'TVF Env T1', off: 0x38, fmt: 'val' },
  { label: 'TVF Env T2', off: 0x39, fmt: 'val' },
  { label: 'TVF Env T3', off: 0x3A, fmt: 'val' },
  { label: 'TVF Env T4', off: 0x3B, fmt: 'val' },
  { label: 'TVF Env L1', off: 0x3C, fmt: 'val' },
  { label: 'TVF Env L2', off: 0x3D, fmt: 'val' },
  { label: 'TVF Env L3', off: 0x3E, fmt: 'val' }
];

const TONE_TVA_PARAMS = [
  { label: 'Level', off: 0x3F, fmt: 'val' },
  { label: 'Pan', off: 0x41, fmt: 'pan' },
  { label: 'Bias Direction', off: 0x42, fmt: 'val' },
  { label: 'Bias Point', off: 0x43, fmt: 'val' },
  { label: 'TVA Env T1', off: 0x48, fmt: 'val' },
  { label: 'TVA Env T2', off: 0x49, fmt: 'val' },
  { label: 'TVA Env T3', off: 0x4A, fmt: 'val' },
  { label: 'TVA Env T4', off: 0x4B, fmt: 'val' },
  { label: 'TVA Env L1', off: 0x4C, fmt: 'val' },
  { label: 'TVA Env L2', off: 0x4D, fmt: 'val' },
  { label: 'TVA Env L3', off: 0x4E, fmt: 'val' }
];

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const readU32LE = (b, o) => ((b[o]) | (b[o+1]<<8) | (b[o+2]<<16) | (b[o+3]<<24)) >>> 0;

function setStatus(msg) {
  const el = $('globalStatus');
  if (el) {
    el.textContent = msg;
    if (msg.includes('Beta')) {
      el.style.borderColor = 'var(--el-amber)';
      el.style.color = 'var(--el-amber)';
      setTimeout(() => {
        el.style.borderColor = '';
        el.style.color = '';
      }, 5000);
    }
  }
}

// ============================================================================
// 2. STATE MANAGEMENT & PREFERENCES SYSTEM
// ============================================================================
const defaultSettings = {
  hideScenes: false,
  defaultDragMode: 'swap', // 'swap' | 'copy'
  doubleClickAction: 'inspect', // 'inspect' | 'rename' | 'clipboard'
  slotNumberStyle: 'matrix', // 'matrix' (A11-D88) | 'index' (#01-#64) | 'both' (A11 · #01)
  confirmClear: true,
  autoRelink: true,
  uiDensity: 'standard' // 'standard' | 'compact'
};

const appSettings = Object.assign({}, defaultSettings);

function loadAppSettings() {
  try {
    const raw = localStorage.getItem('jd08_app_settings');
    if (raw) Object.assign(appSettings, JSON.parse(raw));
  } catch (e) {
    console.error('Failed to load settings', e);
  }
}

function saveAppSettings() {
  try {
    localStorage.setItem('jd08_app_settings', JSON.stringify(appSettings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

const state = {
  L: { data: null, bank: 0, selectedIdx: 0, selectedList: [0], lastClickedIdx: 0, fileName: 'Template_L.svd', visibleIndices: [], sortDrawerOpen: false },
  R: { data: null, bank: 1, selectedIdx: 64, selectedList: [64], lastClickedIdx: 64, fileName: 'Template_R.svd', isSharedWithL: false, visibleIndices: [], sortDrawerOpen: false },
  activePane: 'L',
  dragMode: 'swap',
  viewMode: 'grid', // 'grid' | 'list'
  dragSource: null,
  clipboard: { isScene: false, items: [] },
  undoStack: [],
  redoStack: [],
  lcdEditSnapshotSaved: false,
  elActiveTrack: 0, // Currently active track (0=Tone A, 1=Tone B, 2=Tone C, 3=Tone D)
  elSynthView: 'encoders' // 'encoders' (Overbridge rotary dials) | 'matrix' (4-track strips)
};

const isSceneBank = b => b === 'PRF1' || b === 'PRF2';
const getPatchCode = i => (i < 0 || i > 255) ? '---' : `${'ABCD'[i >> 6]}${((i & 63) >> 3) + 1}${(i & 7) + 1}`;
const getSceneCode = i => `S${String((i >> 3) + 1).padStart(2, '0')}-${(i & 7) + 1}`;

function formatSlotDisplay(i, isScene = false) {
  if (isScene) return getSceneCode(i);
  const baseCode = getPatchCode(i);
  if (appSettings.slotNumberStyle === 'index') {
    return `#${String((i & 63) + 1).padStart(2, '0')}`;
  }
  if (appSettings.slotNumberStyle === 'both') {
    return `${baseCode} #${(i & 63) + 1}`;
  }
  return baseCode;
}

function snapshotDoc(doc) {
  return doc ? {
    patches: doc.patches.map(p => ({ raw: new Uint8Array(p.raw), format: p.format, modified: p.modified, category: p.category })),
    scenes: doc.scenes.map(s => ({ raw: new Uint8Array(s.raw), modified: s.modified }))
  } : null;
}

function pushUndoState(label = 'Action') {
  state.undoStack.push({
    label,
    L: snapshotDoc(state.L.data),
    R: (!state.R.isSharedWithL) ? snapshotDoc(state.R.data) : null
  });
  if (state.undoStack.length > 40) state.undoStack.shift();
  state.redoStack = [];
  updateUndoButtons();
}

function restoreSnapshot(snap) {
  if (snap.L && state.L.data) {
    state.L.data.patches = snap.L.patches.map(p => {
      const pat = parsePatchBlock(new Uint8Array(p.raw), p.format, p.modified);
      if (p.category) pat.category = p.category;
      return pat;
    });
    state.L.data.scenes  = snap.L.scenes.map(s => parseSceneBlock(new Uint8Array(s.raw), s.modified));
  }
  if (snap.R && state.R.data && !state.R.isSharedWithL) {
    state.R.data.patches = snap.R.patches.map(p => {
      const pat = parsePatchBlock(new Uint8Array(p.raw), p.format, p.modified);
      if (p.category) pat.category = p.category;
      return pat;
    });
    state.R.data.scenes  = snap.R.scenes.map(s => parseSceneBlock(new Uint8Array(s.raw), s.modified));
  }
  refreshAll();
  if ($('diOverlay')?.classList.contains('open')) renderDeepInspector();
}

function undo() {
  if (!state.undoStack.length) return;
  const snap = state.undoStack.pop();
  state.redoStack.push({ label: snap.label, L: snapshotDoc(state.L.data), R: (!state.R.isSharedWithL) ? snapshotDoc(state.R.data) : null });
  restoreSnapshot(snap);
  setStatus(`Undid: ${snap.label}`);
}

function redo() {
  if (!state.redoStack.length) return;
  const snap = state.redoStack.pop();
  state.undoStack.push({ label: snap.label, L: snapshotDoc(state.L.data), R: (!state.R.isSharedWithL) ? snapshotDoc(state.R.data) : null });
  restoreSnapshot(snap);
  setStatus(`Redid: ${snap.label}`);
}

function updateUndoButtons() {
  const u = $('undoBtn'), r = $('redoBtn');
  if (u) {
    u.disabled = !state.undoStack.length;
    u.textContent = `↩ Undo (${state.undoStack.length})`;
  }
  if (r) {
    r.disabled = !state.redoStack.length;
    r.textContent = `↪ Redo (${state.redoStack.length})`;
  }
}

// ============================================================================
// 3. BINARY TRANSLATORS: SVD5, VST .BIN & SYSEX .SYX
// ============================================================================
function decodeAscii(buf, start, len) {
  let s = '';
  for (let i = 0; i < len; i++) {
    const c = buf[start + i];
    if (c === 0) { s += ' '; continue; }
    s += (c >= 32 && c < 127) ? String.fromCharCode(c) : ' ';
  }
  return s;
}

function writeAscii(buf, start, len, str) {
  const p = String(str || "Init Patch").padEnd(len, ' ').slice(0, len);
  for (let i = 0; i < len; i++) {
    const c = p.charCodeAt(i);
    buf[start + i] = (c >= 32 && c < 127) ? c : 32;
  }
}

function detectPatchCategory(name, tones) {
  const n = name.trim().toLowerCase();
  if (!n || n.startsWith('init ') || n === 'init patch' || n === 'init tone' || !tones.some(t => t.active)) return 'INIT';
  if (/bass|bs|sub|fret|slap/.test(n)) return 'BASS';
  if (/pad|choir|str|atmo|sweep|vox|voice|warm/.test(n)) return 'PAD';
  if (/lead|ld|solo|sync|saw/.test(n)) return 'LEAD';
  if (/ep|piano|clav|org|key|harpsi|celest/.test(n)) return 'KEYS';
  if (/bell|glass|vibe|marimba|chime|kalimba|gamelan|pluck|harp/.test(n)) return 'BELL';
  const act = tones.filter(t => t.active);
  if (act.some(t => t.waveIdx >= 48 && t.waveIdx <= 52)) return 'BASS';
  if (act.some(t => t.waveIdx >= 24 && t.waveIdx <= 37)) return 'KEYS';
  if (act.some(t => t.waveIdx >= 38 && t.waveIdx <= 47)) return 'BELL';
  return (act.reduce((a, t) => a + t.tvaEnv.T1, 0) / act.length >= 25) ? 'PAD' : 'SYNTH';
}

function parsePatchBlock(block, format = 'JD-08 .SVD', modified = false) {
  const raw = new Uint8Array(PATCH_SIZE_JD08);
  raw.set(block.slice(0, PATCH_SIZE_JD08));
  raw.set(JD08_PATCH_HEADER, 0);

  const name = decodeAscii(raw, 0x010, 16);
  const patchLevel = raw[0x7B3] || raw[0x24] || 80;
  const tones = [0, 1, 2, 3].map(t => {
    const o = 0x670 + t * 80;
    const waveIdx = raw[o + 0x14] | (raw[o + 0x15] << 8);
    return {
      active: raw[o] === 1 || ((raw[0x20] & (1 << t)) !== 0 && raw[o] !== 0),
      waveIdx,
      waveName: WAVES[waveIdx] || `Wave #${waveIdx + 1}`,
      coarse: (raw[o + 0x1B] || 12) - 12,
      lfo1Rate: raw[o + 0x06] || 0,
      lfo1Shape: LFO_SHAPES[raw[o + 0x04]] || 'TRI',
      tvfMode: TVF_MODES[raw[o + 0x30]] || 'LPF',
      cutoff: raw[o + 0x33] || 0,
      resonance: raw[o + 0x32] || 0,
      level: raw[o + 0x3F] || 0,
      pan: (raw[o + 0x41] || 50) - 50,
      tvaEnv: {
        T1: raw[o+0x48]||0, T2: raw[o+0x49]||0, T3: raw[o+0x4A]||0, T4: raw[o+0x4B]||0,
        L1: raw[o+0x4C]||0, L2: raw[o+0x4D]||0, L3: raw[o+0x4E]||0
      }
    };
  });
  return { name, patchLevel, tones, category: detectPatchCategory(name, tones), format, modified, raw };
}

function createInitPatchRaw(name = 'INIT PATCH      ', tpl = null) {
  const b = tpl ? new Uint8Array(tpl) : new Uint8Array(PATCH_SIZE_JD08);
  b.set(JD08_PATCH_HEADER, 0);
  writeAscii(b, 0x010, 16, name);
  b[0x24] = 80; b[0x2E] = 1; b[0x2F] = 1; b[0x30] = 0x0D;
  b[0x36] = 1;  b[0x38] = 2; b[0x39] = 2;
  b[0x50] = 0x5D; b[0x51] = 1; b[0x52] = 0x7F; b[0x53] = 0x7F;
  b[0x88] = 0x32; b[0x8A] = 0x32; b[0x8C] = 0x40; b[0x8E] = 0x7F;
  b[0x7B3] = 80;
  for (let t = 0; t < 4; t++) {
    const o = 0x670 + t * 80;
    b[o] = t === 0 ? 1 : 0;
    b[o+0x04] = 0; b[o+0x06] = 40; b[o+0x14] = 0; b[o+0x15] = 0;
    b[o+0x1B] = 12; b[o+0x30] = 1; b[o+0x32] = 0; b[o+0x33] = 100;
    b[o+0x3F] = 80; b[o+0x41] = 50;
    b[o+0x48] = 0; b[o+0x49] = 50; b[o+0x4A] = 50; b[o+0x4B] = 20;
    b[o+0x4C] = 100; b[o+0x4D] = 80; b[o+0x4E] = 70;
  }
  return b;
}

function createInitSceneRaw(index = 0) {
  const b = new Uint8Array(SCENE_SIZE_JD08);
  writeAscii(b, 0x000, 16, `Init Scene ${String(index + 1).padStart(3, ' ')}`);
  const tempoVal = 12000;
  b[0x012] = tempoVal & 0xFF;
  b[0x013] = (tempoVal >> 8) & 0xFF;
  b[0x034] = index % 256;
  b[0x035] = 100;
  b[0x088] = (index + 1) % 256;
  b[0x089] = 100;
  return b;
}

function parseSceneBlock(block, modified = false) {
  const raw = new Uint8Array(SCENE_SIZE_JD08);
  raw.set(block.slice(0, SCENE_SIZE_JD08));
  const tempoRaw = (raw[0x012] | (raw[0x013] << 8));
  const tempo = (tempoRaw > 2000 && tempoRaw < 30000 ? tempoRaw / 100 : 120).toFixed(1);
  return {
    name: decodeAscii(raw, 0x000, 16),
    tempo,
    partAPatchIdx: raw[0x034] || 0,
    partALevel: raw[0x035] || 100,
    partBPatchIdx: raw[0x088] || 0,
    partBLevel: raw[0x089] || 100,
    modified,
    raw
  };
}

function createBlankSvdDocument() {
  const rawBuffer = new Uint8Array(2000908);
  const hdr = [
    0x4e,0x00,0x53,0x56,0x44,0x35,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x50,0x52,0x46,0x61,0x44,0x44,0x30,0x37,0x50,0x00,0x00,0x00,0x10,0x82,0x16,0x00,
    0x50,0x41,0x54,0x61,0x44,0x44,0x30,0x37,0x60,0x82,0x16,0x00,0x10,0x00,0x08,0x00,
    0x53,0x59,0x53,0x61,0x44,0x44,0x30,0x37,0x70,0x82,0x1e,0x00,0x6c,0x05,0x00,0x00,
    0x44,0x49,0x46,0x61,0x44,0x44,0x30,0x37,0xdc,0x87,0x1e,0x00,0x30,0x00,0x00,0x00
  ];
  rawBuffer.set(hdr, 0);
  const prfBaseOffset = 0x50;
  const patBaseOffset = 0x168260;
  rawBuffer.set([0x80,0x00,0x00,0x00, 0x04,0x2d,0x00,0x00, 0x10,0x00,0x00,0x00, 0x00,0x00,0x00,0x00], prfBaseOffset);
  rawBuffer.set([0x00,0x01,0x00,0x00, 0x00,0x08,0x00,0x00, 0x10,0x00,0x00,0x00, 0x00,0x00,0x00,0x00], patBaseOffset);

  const patches = Array.from({ length: 256 }, (_, i) => {
    const raw = createInitPatchRaw(`Init ${getPatchCode(i)}`);
    rawBuffer.set(raw, patBaseOffset + 16 + i * PATCH_SIZE_JD08);
    return parsePatchBlock(raw, 'INIT', false);
  });
  const scenes = Array.from({ length: 128 }, (_, i) => {
    const raw = createInitSceneRaw(i);
    rawBuffer.set(raw, prfBaseOffset + 16 + i * SCENE_SIZE_JD08);
    return parseSceneBlock(raw, false);
  });
  return { rawBuffer, prfBaseOffset, patBaseOffset, patches, scenes };
}

function parseSvdBuffer(uint8) {
  if (uint8.length < 0x100 || decodeAscii(uint8, 2, 4) !== 'SVD5') {
    throw new Error('Invalid .SVD header (expected SVD5).');
  }
  let prfBaseOffset = 0x50, patBaseOffset = -1;
  for (let i = 16; i < 128; i += 16) {
    const tag = decodeAscii(uint8, i, 8);
    const off = readU32LE(uint8, i + 8);
    if (tag.startsWith('PRFa')) prfBaseOffset = off;
    if (tag.startsWith('PATa')) patBaseOffset = off;
  }
  if (patBaseOffset === -1) throw new Error('PATaDD07 section not found in .SVD file.');

  const patches = Array.from({ length: 256 }, (_, i) => {
    const start = patBaseOffset + 16 + i * PATCH_SIZE_JD08;
    return parsePatchBlock(uint8.slice(start, start + PATCH_SIZE_JD08), 'JD-08 .SVD', false);
  });

  const hasScenes = prfBaseOffset + 16 + 128 * SCENE_SIZE_JD08 <= uint8.length;
  const scenes = Array.from({ length: 128 }, (_, i) => {
    if (!hasScenes) return parseSceneBlock(createInitSceneRaw(i), false);
    const start = prfBaseOffset + 16 + i * SCENE_SIZE_JD08;
    return parseSceneBlock(uint8.slice(start, start + SCENE_SIZE_JD08), false);
  });

  return { rawBuffer: new Uint8Array(uint8), prfBaseOffset, patBaseOffset, patches, scenes };
}

function parseBIN(uint8) {
  const magic = decodeAscii(uint8, 0, 4);
  if (magic !== 'SVZa') throw new Error('Invalid .BIN file (expected SVZa header).');
  const decomp = pako.inflate(uint8.slice(0x60));
  if (decodeAscii(decomp, 0, 4) !== 'SVDx') throw new Error('Invalid inner SVDx stream after .BIN decompression.');

  const headerSize = readU32LE(decomp, 4);
  const itemSize   = readU32LE(decomp, 8);
  const count      = readU32LE(decomp, 12);

  const patches = [];
  for (let i = 0; i < count; i++) {
    const start = headerSize + i * itemSize;
    const data = new Uint8Array(PATCH_SIZE_JD08);
    data.set(decomp.slice(start, start + PATCH_SIZE_JD08));
    const vstLevel = data[6];
    data.set(JD08_PATCH_HEADER, 0);
    if (data[0x24] === 0 && vstLevel > 0) data[0x24] = vstLevel;
    if (data[0x7B3] === 0) data[0x7B3] = data[0x24] || 80;
    data[0x2F] = 0x01;
    patches.push(parsePatchBlock(data, 'VST .BIN', true));
  }
  return patches;
}

function convertJD800Syx384ToJD08(syx384) {
  const data = createInitPatchRaw(decodeAscii(syx384, 0, 16));
  const patchLevel = syx384[18] <= 100 ? syx384[18] : 80;
  data[0x24] = patchLevel;
  data[0x7B3] = patchLevel;
  const activeTones = syx384[26] & 0x0F;
  data[0x20] = activeTones;
  data[0x36] = activeTones;
  data[0x84] = syx384[27];
  data[0x86] = syx384[28];
  data[0x54] = syx384[29];
  data[0x56] = syx384[30];
  data[0x58] = syx384[31];
  data[0x5A] = syx384[32];
  data[0x5C] = syx384[33];

  const toneOffsetsJD800 = [96, 168, 240, 312];
  const toneClassicOffsetsJD08 = [0x670, 0x6C0, 0x710, 0x760];
  const toneEngineOffsetsJD08  = [0xD8,  0x148, 0x1B8, 0x228];

  for (let t = 0; t < 4; t++) {
    const srcOff = toneOffsetsJD800[t];
    if (srcOff + 72 > syx384.length) break;
    const tone = syx384.slice(srcOff, srcOff + 72);
    const isAct = (activeTones & (1 << t)) ? 1 : 0;

    const waveMSB = tone[8], waveLSB = tone[9];
    const waveID  = ((waveMSB & 0x01) << 7) | (waveLSB & 0x7F);
    const coarse  = tone[11];
    const fine    = tone[12];
    const cutoff  = tone[32];
    const res     = tone[33];
    const tvaLvl  = tone[52];

    const cOff = toneClassicOffsetsJD08[t];
    data[cOff]        = isAct;
    data[cOff + 0x04] = tone[18] || 0;
    data[cOff + 0x06] = tone[19] || 40;
    data[cOff + 0x14] = waveID & 0xFF;
    data[cOff + 0x15] = (waveID >> 8) & 0xFF;
    data[cOff + 0x1B] = Math.max(0, Math.min(24, coarse - 36));
    data[cOff + 0x30] = (tone[31] % 4) || 1;
    data[cOff + 0x32] = res;
    data[cOff + 0x33] = cutoff;
    data[cOff + 0x3F] = tvaLvl;
    data[cOff + 0x41] = 50;
    data[cOff + 0x48] = tone[56] || 0;
    data[cOff + 0x49] = tone[58] || 50;
    data[cOff + 0x4A] = tone[60] || 50;
    data[cOff + 0x4B] = tone[62] || 20;
    data[cOff + 0x4C] = tone[57] || 100;
    data[cOff + 0x4D] = tone[59] || 80;
    data[cOff + 0x4E] = tone[61] || 70;

    const eOff = toneEngineOffsetsJD08[t];
    data[eOff + 0x00] = cutoff;
    data[eOff + 0x14] = isAct;
    data[eOff + 0x1A] = waveID + 1;
    data[eOff + 0x22] = tvaLvl;
    data[eOff + 0x28] = Math.min(255, cutoff * 2);
    data[eOff + 0x2A] = res;
    data[eOff + 0x2C] = coarse;
    data[eOff + 0x2E] = fine;
  }
  return parsePatchBlock(data, 'JD-800 .SYX', true);
}

function parseSYX(uint8) {
  const memory = new Map();
  let i = 0;
  while (i < uint8.length) {
    if (uint8[i] === 0xF0) {
      let end = i + 1;
      while (end < uint8.length && uint8[end] !== 0xF7) end++;
      if (end < uint8.length && uint8[i+1] === 0x41 && uint8[i+3] === 0x3D && uint8[i+4] === 0x12) {
        const a1 = uint8[i+5], a2 = uint8[i+6], a3 = uint8[i+7];
        const linearAddr = (a1 << 14) | (a2 << 7) | a3;
        const payload = uint8.slice(i + 8, end - 1);
        for (let b = 0; b < payload.length; b++) memory.set(linearAddr + b, payload[b]);
      }
      i = end + 1;
    } else i++;
  }

  const patches = [];
  const bankBase = (0x05 << 14);
  for (let p = 0; p < 64; p++) {
    const pAddr = bankBase + p * 384;
    if (memory.has(pAddr)) {
      const syx384 = new Uint8Array(384);
      for (let b = 0; b < 384; b++) syx384[b] = memory.get(pAddr + b) || 0;
      patches.push(convertJD800Syx384ToJD08(syx384));
    }
  }

  if (!patches.length && memory.has(0)) {
    const syx384 = new Uint8Array(384);
    for (let b = 0; b < 384; b++) syx384[b] = memory.get(b) || 0;
    patches.push(convertJD800Syx384ToJD08(syx384));
  }

  if (!patches.length) {
    const sortedAddrs = Array.from(memory.keys()).sort((a,b) => a - b);
    if (sortedAddrs.length >= 384) {
      const flat = new Uint8Array(sortedAddrs.length);
      for (let k = 0; k < sortedAddrs.length; k++) flat[k] = memory.get(sortedAddrs[k]);
      const startOff = flat.length >= 64 * 384 ? flat.length - 64 * 384 : 0;
      for (let pos = startOff; pos + 384 <= flat.length; pos += 384) {
        patches.push(convertJD800Syx384ToJD08(flat.slice(pos, pos + 384)));
      }
    }
  }
  if (!patches.length) throw new Error('No valid JD-800 SysEx patch messages found in .SYX file.');
  return patches;
}

function applySceneRelinkMap(doc, oldToNewMap) {
  if (!doc || !$('autoRelinkCheckbox')?.checked || !oldToNewMap.size) return;
  doc.scenes.forEach(sc => {
    if (oldToNewMap.has(sc.partAPatchIdx)) { sc.raw[0x034] = sc.partAPatchIdx = oldToNewMap.get(sc.partAPatchIdx); sc.modified = true; }
    if (oldToNewMap.has(sc.partBPatchIdx)) { sc.raw[0x088] = sc.partBPatchIdx = oldToNewMap.get(sc.partBPatchIdx); sc.modified = true; }
  });
}

// ============================================================================
// 4. FILE MANAGEMENT & EXPORT
// ============================================================================
function initBlankSvdInPane(k, silent = false) {
  if (!silent) pushUndoState(`New Blank SVD (${k})`);
  const p = state[k];
  p.data = createBlankSvdDocument();
  p.fileName = `JD08Backup_${k}.svd`;
  if (k === 'R') p.isSharedWithL = false;
  else if (state.R.isSharedWithL) { state.R.data = p.data; updatePaneUI('R'); }
  updatePaneUI(k);
  if (!silent) setStatus(`Initialized blank 256-Patch / 128-Scene SVD5 template in Pane ${k}.`);
}

async function handleFileLoad(k, file) {
  if (!file) return;
  try {
    const uint8 = new Uint8Array(await file.arrayBuffer());
    const ext = file.name.split('.').pop().toLowerCase();
    const p = state[k];

    if (ext === 'svd') {
      pushUndoState(`Load SVD (${k})`);
      p.data = parseSvdBuffer(uint8);
      p.fileName = file.name;
      if (k === 'R') p.isSharedWithL = false;
      else if (state.R.isSharedWithL) { state.R.data = p.data; state.R.fileName = file.name; updatePaneUI('R'); }
      const s = isSceneBank(p.bank) ? (p.bank === 'PRF1' ? 0 : 64) : p.bank * 64;
      p.selectedIdx = s; p.selectedList = [s]; p.lastClickedIdx = s;
      updatePaneUI(k);
      setActivePane(k);
      setStatus(`Loaded full JD-08 .SVD backup: ${file.name} (256 Patches, 128 Scenes)`);
    } else if (['bin', 'syx'].includes(ext)) {
      let importedPatches = [];
      if (ext === 'bin') importedPatches = parseBIN(uint8);
      else if (ext === 'syx') importedPatches = parseSYX(uint8);

      if (!p.data) p.data = createBlankSvdDocument();
      if (isSceneBank(p.bank)) switchBankTab(k, 0, true);

      pushUndoState(`Import ${ext.toUpperCase()} (${k})`);
      const baseIdx = importedPatches.length >= 64 ? (p.bank * 64) : p.selectedIdx;
      const newSel = [];
      importedPatches.forEach((patObj, offset) => {
        const target = baseIdx + offset;
        if (target < 256) {
          p.data.patches[target] = patObj;
          newSel.push(target);
        }
      });
      p.fileName = `${file.name} ➔ SVD`;
      if (k === 'R') p.isSharedWithL = false;
      if (newSel.length) { p.selectedList = newSel; p.selectedIdx = newSel[0]; p.lastClickedIdx = newSel[0]; }
      updatePaneUI(k);
      setActivePane(k);
      setStatus(`Translated & imported ${newSel.length} patches from ${file.name} into Pane ${k} (${getPatchCode(baseIdx)}..${getPatchCode(newSel[newSel.length-1])}).`);
    } else {
      throw new Error('Unsupported file extension. Use .svd, .bin, or .syx');
    }
  } catch (err) {
    alert(`File Import Error: ${err.message}`);
  }
}

function linkRightToLeft() {
  if (!state.L.data) return;
  Object.assign(state.R, { data: state.L.data, fileName: state.L.fileName, isSharedWithL: true });
  const s = isSceneBank(state.R.bank) ? (state.R.bank === 'PRF1' ? 0 : 64) : state.R.bank * 64;
  state.R.selectedIdx = s; state.R.selectedList = [s]; state.R.lastClickedIdx = s;
  updatePaneUI('R');
  setStatus('Right Pane linked to Left Pane memory (Shared Pool Mode).');
}

function saveSvd(k) {
  const doc = state[k].data;
  if (!doc) return;
  doc.scenes.forEach((s, i) => doc.rawBuffer.set(s.raw, doc.prfBaseOffset + 16 + i * SCENE_SIZE_JD08));
  doc.patches.forEach((p, i) => {
    p.raw.set(JD08_PATCH_HEADER, 0);
    doc.rawBuffer.set(p.raw, doc.patBaseOffset + 16 + i * PATCH_SIZE_JD08);
  });
  const url = URL.createObjectURL(new Blob([doc.rawBuffer], { type: 'application/octet-stream' }));
  const dlName = state[k].fileName.toLowerCase().endsWith('.svd') ? state[k].fileName : 'JD08Backup.svd';
  Object.assign(document.createElement('a'), { href: url, download: dlName }).click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  setStatus(`Exported ${dlName} (${doc.rawBuffer.length.toLocaleString()} bytes).`);
}

// ============================================================================
// 5. WORKSPACE DOM GENERATOR & RENDERING ENGINE
// ============================================================================
function buildWorkspaceDOM() {
  const paneHtml = (k, title, defBank) => `
    <section class="pane ${k==='L'?'act':''}" id="pane${k}" onclick="setActivePane('${k}')">
      <div class="p-hdr">
        <div class="p-tit"><span>[${title}]</span><span class="bdg" id="badge${k}">Blank Template</span></div>
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:nowrap">
          <div class="search-box-wrap">
            <span class="search-icon">🔍</span>
            <input type="text" id="search${k}" class="sbox" placeholder="Filter..." oninput="renderPane('${k}')">
          </div>
          <select id="catFilter${k}" class="flt-sel" onchange="renderPane('${k}')" title="Filter by Category Tag">
            ${CATEGORIES.map(c => `<option value="${c}">${c === 'ALL' ? '🏷️ All' : c}</option>`).join('')}
          </select>
          ${k==='R' ? `<button id="linkSameFileBtn" onclick="linkRightToLeft()" title="Link Right Pane to Left Pane memory">🔗 Link</button>` : ''}
          <button onclick="initBlankSvdInPane('${k}')" title="Create fresh 256-Patch / 128-Scene SVD5 in this pane">📄 New</button>
          <div class="io-btn-group" title="Bank File Operations">
            <label class="io-btn io-load" title="Load Roland .SVD backup, or import .BIN / .SYX SysEx banks into this pool" style="cursor:pointer">
              <span class="io-icon">📂</span><span>LOAD</span><input type="file" id="fileInput${k}" accept=".svd,.bin,.syx">
            </label>
            <button id="saveBtn${k}" class="io-btn io-save" onclick="saveSvd('${k}')" title="Download & Save full Roland JD08Backup.svd from this pool">
              <span class="io-icon">💾</span><span>SAVE</span>
            </button>
          </div>
        </div>
      </div>
      <div class="b-bar">
        <div class="tabs" id="tabs${k}">
          ${(appSettings.hideScenes ? [0,1,2,3] : [0,1,2,3,'PRF1','PRF2']).map(b => {
            const lbl = b==='PRF1'?'SCENES 1-8':b==='PRF2'?'SCENES 9-16':`BANK ${'ABCD'[b]}`;
            return `<div class="tab ${String(b).startsWith('PRF')?'sc-tab':''} ${b===defBank?'active':''}" data-bank="${b}">${lbl}</div>`;
          }).join('')}
        </div>
        <button class="tab sort-toggle-tab" id="sortToggleTab${k}" onclick="toggleSortDrawer('${k}')" title="Click to show / hide bank sort and batch selection tools">
          ⚡ SORT &amp; SELECT <span class="arrow" id="sortArrow${k}">▾</span>
        </button>
      </div>
      <div class="sort-drawer collapsed" id="sortDrawer${k}">
        <div class="sort-drawer-inner">
          <div class="sort-tool-group">
            <span class="sort-tool-title">SELECTION:</span>
            <div class="btn-group">
              <button onclick="selectAllInBank('${k}')" title="Select all visible slots (Ctrl+A)">☑ All</button>
              <button onclick="selectNoneInBank('${k}')" title="Deselect all (Esc)">☐ None</button>
            </div>
          </div>
          <div class="sort-drawer-divider"></div>
          <div class="sort-tool-group">
            <span class="sort-tool-title">ORGANIZE:</span>
            <div class="btn-group">
              <button onclick="sortBankAlpha('${k}')" title="Sort active bank alphabetically A-Z">🔤 A-Z</button>
              <button onclick="sortBankByCategory('${k}')" title="Group patches by category tag">🏷️ Tag</button>
              <button onclick="compactBank('${k}')" title="Move non-empty patches to beginning">🧹 Compact</button>
            </div>
          </div>
          <button class="sort-drawer-close" onclick="toggleSortDrawer('${k}')" title="Collapse tools strip">✕</button>
        </div>
      </div>
      <div class="g-wrap" id="wrap${k}"></div>
    </section>`;

  $('workspace').innerHTML = paneHtml('L', 'LEFT POOL', 0) + `
    <div class="bridge">
      <span class="b-lbl" id="selCountLabel">Sel: 1</span>
      <button class="bbtn pri" id="deepInspBtn" onclick="openDeepInspector()" title="Open Synth Control Surface (Space / Enter / Double-Click)">
        <span>🎛️ OVERVIEW</span><small>[Space/DblClick]</small>
      </button>
      <button class="bbtn pri" id="copyLtoRBtn" onclick="transferSelected('L','R',false)" title="Copy selected from Left to Right (F5)">
        <span>Copy ➔</span><small>[F5] L->R</small>
      </button>
      <button class="bbtn" id="copyRtoLBtn" onclick="transferSelected('R','L',false)" title="Copy selected from Right to Left">
        <span>⬅ Copy</span><small>R->L</small>
      </button>
      <button class="bbtn" id="swapLRBtn" onclick="transferSelected('L','R',true)" title="Swap selected slots between Left and Right (F6)">
        <span>⇄ Swap</span><small>[F6] L&lt;-&gt;R</small>
      </button>
      <hr style="width:100%;border:0;border-top:1px solid var(--el-border-mid)">
      <div style="display:flex;width:100%;gap:2px">
        <button class="bbtn" id="copyClipBtn" onclick="copySelectionToClipboard(false)" title="Copy to clipboard (Ctrl+C)" style="padding:4px 0"><span>📋</span><small>Copy</small></button>
        <button class="bbtn" id="cutClipBtn" onclick="copySelectionToClipboard(true)" title="Cut to clipboard (Ctrl+X)" style="padding:4px 0"><span>✂️</span><small>Cut</small></button>
        <button class="bbtn" id="pasteClipBtn" disabled onclick="pasteClipboard()" title="Paste from clipboard (Ctrl+V)" style="padding:4px 0"><span>📥</span><small>Paste</small></button>
      </div>
      <hr style="width:100%;border:0;border-top:1px solid var(--el-border-mid)">
      <button class="bbtn" id="renameBtn" onclick="quickRenameSelected()" title="Rename active slot (F2)"><span>✏️ Rename</span><small>[F2]</small></button>
      <button class="bbtn" id="tagBtn" onclick="openTagModal()" title="Set category tag for selected slot(s)"><span>🏷️ Tag</span><small>Category</small></button>
      <button class="bbtn dng" id="initSlotBtn" onclick="deleteSelectedSlots()" title="Initialize selected slots (Del / F8)"><span>🗑️ Init</span><small>[Del/F8]</small></button>
    </div>` + paneHtml('R', 'RIGHT POOL', 1);
}

function refreshAll() {
  renderPane('L');
  renderPane('R');
  updateInspector();
  updateBridgeButtons();
  updateUndoButtons();
}

function updatePaneUI(k) {
  const p = state[k];
  if (!p.data) return;
  const b = $(`badge${k}`);
  b.textContent = (k === 'R' && p.isSharedWithL) ? `🔗 Linked L (${p.fileName})` : p.fileName;
  b.className = (k === 'R' && p.isSharedWithL) ? 'bdg shd' : 'bdg';
  renderPane(k);
  updateBridgeButtons();
}

function updateBridgeButtons() {
  const act = state[state.activePane], cnt = act.selectedList.length;
  $('selCountLabel').textContent = `Sel: ${cnt} (${state.activePane})`;
  $('pasteClipBtn').disabled = !state.clipboard.items.length;
}

function renderPane(k) {
  const p = state[k];
  if (!p.data) return;
  const wrap = $(`wrap${k}`);
  const q = $(`search${k}`).value.trim().toLowerCase();
  const catFlt = $(`catFilter${k}`).value;
  const scMode = isSceneBank(p.bank);

  wrap.innerHTML = '';
  p.visibleIndices = [];

  const isFiltering = q !== '' || (!scMode && catFlt !== 'ALL');
  const start = isFiltering ? 0 : (scMode ? (p.bank === 'PRF1' ? 0 : 64) : p.bank * 64);
  const end   = isFiltering ? (scMode ? 128 : 256) : start + 64;

  const container = document.createElement('div');
  if (state.viewMode === 'grid') {
    container.className = 'grid';
  } else {
    container.className = 'list-tbl';
    container.innerHTML = scMode
      ? `<div class="list-hdr"><div>SLOT</div><div>SCENE NAME</div><div>TEMPO</div><div>PART A</div><div>PART B</div></div>`
      : `<div class="list-hdr"><div>SLOT</div><div>PATCH NAME</div><div>TAG</div><div>TONES</div><div style="text-align:right">SOURCE</div></div>`;
  }

  const frag = document.createDocumentFragment();
  for (let i = start; i < end; i++) {
    if (scMode) {
      const sc = p.data.scenes[i], code = formatSlotDisplay(i, true);
      const pA = getPatchCode(sc.partAPatchIdx), pB = getPatchCode(sc.partBPatchIdx);
      const nA = p.data.patches[sc.partAPatchIdx]?.name.trim() || '', nB = p.data.patches[sc.partBPatchIdx]?.name.trim() || '';
      if (q && ![sc.name, code, getSceneCode(i), nA, nB].some(x => x.toLowerCase().includes(q))) continue;

      p.visibleIndices.push(i);
      const ord = p.selectedList.indexOf(i), sel = ord !== -1;
      const init = !sc.name.trim() || sc.name.trim().toLowerCase().startsWith('init scene');

      const el = document.createElement('div');
      el.draggable = true;
      if (state.viewMode === 'grid') {
        el.className = `cell sc ${sel?'sel':''} ${i===p.selectedIdx?'pri-sel':''} ${init?'emp':''} ${sc.modified?'mod':''}`;
        el.innerHTML = `${sel && p.selectedList.length>1 ? `<span class="s-ord">${ord+1}</span>`:''}
          <div class="cid"><span>${code}</span><span>${Math.round(sc.tempo)}BPM</span></div>
          <div class="cname">${esc(sc.name.trim() || '(Scene)')}</div>
          <div class="cmeta"><span>A:${pA}</span><span>B:${pB}</span></div>`;
      } else {
        el.className = `list-row sc ${sel?'sel':''} ${i===p.selectedIdx?'pri-sel':''} ${init?'emp':''}`;
        el.innerHTML = `<div class="cid">[${code}]${sc.modified?'*':''}</div>
          <div class="cname">${esc(sc.name)}</div>
          <div>${sc.tempo}</div>
          <div>A:${pA}</div>
          <div>B:${pB}</div>`;
      }
      bindSlotEvents(el, k, true, i);
      frag.appendChild(el);
    } else {
      const pat = p.data.patches[i], code = formatSlotDisplay(i, false), rawCode = getPatchCode(i);
      if (catFlt !== 'ALL' && pat.category !== catFlt) continue;
      const wMatch = pat.tones.some(t => t.active && t.waveName.toLowerCase().includes(q));
      if (q && !pat.name.toLowerCase().includes(q) && !code.toLowerCase().includes(q) && !rawCode.toLowerCase().includes(q) && !wMatch && !pat.category.toLowerCase().includes(q)) continue;

      p.visibleIndices.push(i);
      const ord = p.selectedList.indexOf(i), sel = ord !== -1;
      const firstT = pat.tones.find(t => t.active);

      const el = document.createElement('div');
      el.draggable = true;
      if (state.viewMode === 'grid') {
        el.className = `cell ${sel?'sel':''} ${i===p.selectedIdx?'pri-sel':''} ${pat.category==='INIT'?'emp':''} ${pat.modified?'mod':''}`;
        el.innerHTML = `${sel && p.selectedList.length>1 ? `<span class="s-ord">${ord+1}</span>`:''}
          <div class="cid"><span>${code}</span><div class="dots">${pat.tones.map(t=>`<span class="dot ${t.active?'on':''}"></span>`).join('')}</div></div>
          <div class="cname">${esc(pat.name.trim() || '(Empty)')}</div>
          <div class="cmeta"><span class="ctag ${pat.category}">${pat.category}</span><span>W:${esc(firstT ? firstT.waveName.slice(0,3) : '---')}</span></div>`;
      } else {
        el.className = `list-row ${sel?'sel':''} ${i===p.selectedIdx?'pri-sel':''} ${pat.category==='INIT'?'emp':''}`;
        el.innerHTML = `<div class="cid">[${code}]${pat.modified?'*':''}</div>
          <div class="cname">${esc(pat.name)}</div>
          <div><span class="ctag ${pat.category}">${pat.category}</span></div>
          <div><div class="dots">${pat.tones.map(t=>`<span class="dot ${t.active?'on':''}"></span>`).join('')}</div></div>
          <div style="text-align:right;font-size:.63rem;color:var(--el-text-muted)">${esc(pat.format)}</div>`;
      }
      bindSlotEvents(el, k, false, i);
      frag.appendChild(el);
    }
  }
  container.appendChild(frag);
  wrap.appendChild(container);
}

function bindSlotEvents(el, k, isScene, i) {
  let lastTap = 0;
  el.onclick = e => {
    e.stopPropagation();
    handleSlotSelection(k, i, e);
  };
  el.ondblclick = e => {
    e.stopPropagation();
    handleSlotSelection(k, i, e);
    if (e.altKey) {
      quickRenamePrompt(k, i, isScene);
      return;
    }
    if (appSettings.doubleClickAction === 'rename') {
      quickRenamePrompt(k, i, isScene);
    } else if (appSettings.doubleClickAction === 'clipboard') {
      copySelectionToClipboard(false);
      setStatus(`Copied slot ${formatSlotDisplay(i, isScene)} to clipboard.`);
    } else {
      openDeepInspector();
    }
  };
  el.ontouchend = e => {
    const now = Date.now();
    if (now - lastTap < 350) {
      e.preventDefault();
      handleSlotSelection(k, i, e);
      openDeepInspector();
    }
    lastTap = now;
  };
  el.ondragstart = e => {
    const p = state[k];
    if (!p.selectedList.includes(i)) { p.selectedList = [i]; p.selectedIdx = i; renderPane(k); }
    state.dragSource = { pane: k, isScene, indices: [...p.selectedList] };
    e.dataTransfer.effectAllowed = 'copyMove';
  };
  el.ondragover = e => {
    if (state.dragSource && state.dragSource.isScene === isScene) {
      e.preventDefault();
      el.classList.add('d-over');
    }
  };
  el.ondragleave = () => el.classList.remove('d-over');
  el.ondrop = e => {
    e.preventDefault();
    el.classList.remove('d-over');
    if (state.dragSource && state.dragSource.isScene === isScene) {
      const isCrossPane = state.dragSource.pane !== k;
      const useSwap = isCrossPane ? (state.dragMode === 'swap') : (state.dragMode === 'swap');
      executeBatchTransfer(state.dragSource.pane, state.dragSource.indices, k, i, isScene, useSwap);
      state.dragSource = null;
    }
  };
}

function handleSlotSelection(k, idx, e) {
  const p = state[k];
  if (e.shiftKey && p.lastClickedIdx !== null) {
    const v = p.visibleIndices, a = v.indexOf(p.lastClickedIdx), b = v.indexOf(idx);
    p.selectedList = (a !== -1 && b !== -1) ? v.slice(Math.min(a, b), Math.max(a, b) + 1) : [idx];
    p.selectedIdx = idx;
  } else if (e.ctrlKey || e.metaKey) {
    const pos = p.selectedList.indexOf(idx);
    if (pos >= 0 && p.selectedList.length > 1) p.selectedList.splice(pos, 1);
    else if (pos < 0) p.selectedList.push(idx);
    p.selectedIdx = p.selectedList[p.selectedList.length - 1];
    p.lastClickedIdx = idx;
  } else {
    p.selectedList = [idx]; p.selectedIdx = idx; p.lastClickedIdx = idx;
  }
  setActivePane(k);
  if (window.JD08Midi && !isSceneBank(p.bank)) {
    JD08Midi.selectPreset(idx);
  }
}

// ============================================================================
// 6. BATCH OPERATIONS: TRANSFER, BANK COPY, SORTING & CLIPBOARD
// ============================================================================
function executeBatchTransfer(srcPane, srcIndices, dstPane, dstStartIdx, isScene, isSwap) {
  const sDoc = state[srcPane].data, dDoc = state[dstPane].data;
  if (!sDoc || !dDoc || !srcIndices.length) return;
  pushUndoState(isSwap ? 'Swap Slots' : 'Copy Slots');
  const max = isScene ? 128 : 256, newSel = [];

  if (isSwap && sDoc === dDoc) {
    const arr = isScene ? sDoc.scenes : sDoc.patches;
    const perm = Array.from({ length: max }, (_, i) => i);
    srcIndices.forEach((sIdx, off) => {
      const tIdx = dstStartIdx + off;
      if (tIdx >= max) return;
      [arr[sIdx], arr[tIdx]] = [arr[tIdx], arr[sIdx]];
      arr[sIdx].modified = true; arr[tIdx].modified = true;
      [perm[sIdx], perm[tIdx]] = [perm[tIdx], perm[sIdx]];
      newSel.push(tIdx);
    });
    if (!isScene) {
      const map = new Map();
      perm.forEach((oldPos, newPos) => { if (oldPos !== newPos) map.set(oldPos, newPos); });
      applySceneRelinkMap(sDoc, map);
    }
  } else {
    const cSrc = srcIndices.map(i => {
      const item = isScene ? sDoc.scenes[i] : sDoc.patches[i];
      return { raw: new Uint8Array(item.raw), format: item.format };
    });
    const cDst = srcIndices.map((_, o) => {
      if (dstStartIdx + o >= max) return null;
      const item = isScene ? dDoc.scenes[dstStartIdx + o] : dDoc.patches[dstStartIdx + o];
      return { raw: new Uint8Array(item.raw), format: item.format };
    });

    srcIndices.forEach((sIdx, o) => {
      const tIdx = dstStartIdx + o;
      if (tIdx >= max) return;
      if (isScene) {
        if (isSwap && cDst[o]) sDoc.scenes[sIdx] = parseSceneBlock(cDst[o].raw, true);
        dDoc.scenes[tIdx] = parseSceneBlock(cSrc[o].raw, true);
      } else {
        if (isSwap && cDst[o]) sDoc.patches[sIdx] = parsePatchBlock(cDst[o].raw, cDst[o].format, true);
        dDoc.patches[tIdx] = parsePatchBlock(cSrc[o].raw, cSrc[o].format, true);
      }
      newSel.push(tIdx);
    });
  }
  Object.assign(state[dstPane], { selectedList: newSel, selectedIdx: newSel[0] ?? dstStartIdx, lastClickedIdx: newSel[0] ?? dstStartIdx });
  setStatus(`${isSwap ? 'Swapped' : 'Copied'} ${newSel.length} slot(s) to Pane ${dstPane}.`);
  setActivePane(dstPane);
}

function transferSelected(from, to, isSwap) {
  if (isSceneBank(state[from].bank) !== isSceneBank(state[to].bank)) {
    return alert('Both pools must be in the same mode (Patches or Scenes)!');
  }
  executeBatchTransfer(from, state[from].selectedList, to, state[to].selectedIdx, isSceneBank(state[from].bank), isSwap);
}

function copyEntireActiveBank() {
  const from = state.activePane, to = from === 'L' ? 'R' : 'L';
  if (isSceneBank(state[from].bank) !== isSceneBank(state[to].bank)) {
    return alert('Both pools must be in the same mode to copy an entire bank!');
  }
  const sc = isSceneBank(state[from].bank);
  const srcStart = sc ? (state[from].bank === 'PRF1' ? 0 : 64) : state[from].bank * 64;
  const dstStart = sc ? (state[to].bank === 'PRF1' ? 0 : 64) : state[to].bank * 64;
  const indices = Array.from({ length: 64 }, (_, i) => srcStart + i);
  executeBatchTransfer(from, indices, to, dstStart, sc, false);
}

function selectAllInBank(k) {
  const p = state[k];
  if (!p.visibleIndices.length) return;
  p.selectedList = [...p.visibleIndices];
  p.selectedIdx = p.visibleIndices[0];
  setActivePane(k);
}

function selectNoneInBank(k) {
  const p = state[k];
  p.selectedList = [p.selectedIdx];
  setActivePane(k);
}

function copySelectionToClipboard(isCut = false) {
  const p = state[state.activePane];
  if (!p.selectedList.length) return;
  const sc = isSceneBank(p.bank);
  state.clipboard = {
    isScene: sc,
    items: p.selectedList.map(i => {
      const it = sc ? p.data.scenes[i] : p.data.patches[i];
      return { raw: new Uint8Array(it.raw), format: it.format || 'CLIPBOARD' };
    })
  };
  $('clipStatus').textContent = `Clipboard: ${state.clipboard.items.length} ${sc ? 'Scene(s)' : 'Patch(es)'}`;
  if (isCut) deleteSelectedSlots(); else updateBridgeButtons();
}

function pasteClipboard() {
  const p = state[state.activePane];
  if (!state.clipboard.items.length) return;
  const sc = isSceneBank(p.bank);
  if (sc !== state.clipboard.isScene) return alert('Clipboard data type does not match active tab!');
  pushUndoState('Paste Clipboard');
  const max = sc ? 128 : 256, newSel = [];
  state.clipboard.items.forEach((item, o) => {
    const t = p.selectedIdx + o;
    if (t >= max) return;
    if (sc) p.data.scenes[t] = parseSceneBlock(new Uint8Array(item.raw), true);
    else p.data.patches[t] = parsePatchBlock(new Uint8Array(item.raw), item.format, true);
    newSel.push(t);
  });
  p.selectedList = newSel;
  setStatus(`Pasted ${newSel.length} item(s) into Pane ${state.activePane}.`);
  refreshAll();
}

function deleteSelectedSlots() {
  const p = state[state.activePane];
  if (!p.selectedList.length) return;
  if (appSettings.confirmClear) {
    const sc = isSceneBank(p.bank);
    const type = sc ? 'scene(s)' : 'patch(es)';
    if (!confirm(`Are you sure you want to initialize ${p.selectedList.length} ${type} to default blank state?`)) return;
  }
  pushUndoState('Init Slots');
  const sc = isSceneBank(p.bank);
  p.selectedList.forEach(i => {
    if (sc) p.data.scenes[i] = parseSceneBlock(createInitSceneRaw(i), true);
    else p.data.patches[i] = parsePatchBlock(createInitPatchRaw('INIT PATCH      ', p.data.patches[i].raw), 'INIT', true);
  });
  setStatus(`Initialized ${p.selectedList.length} slot(s) in Pane ${state.activePane}.`);
  refreshAll();
}

function reorderBank(k, comparator, label = 'Reorder') {
  const p = state[k];
  pushUndoState(label);
  if (isSceneBank(p.bank)) {
    const s = p.bank === 'PRF1' ? 0 : 64;
    const sub = p.data.scenes.slice(s, s + 64).sort(comparator);
    for (let i = 0; i < 64; i++) { sub[i].modified = true; p.data.scenes[s + i] = sub[i]; }
  } else {
    const s = p.bank * 64;
    const indexed = Array.from({ length: 64 }, (_, i) => ({ oldIdx: s + i, item: p.data.patches[s + i] }))
      .sort((a, b) => comparator(a.item, b.item));
    const map = new Map();
    indexed.forEach((entry, i) => {
      const nIdx = s + i;
      entry.item.modified = true;
      p.data.patches[nIdx] = entry.item;
      if (entry.oldIdx !== nIdx) map.set(entry.oldIdx, nIdx);
    });
    applySceneRelinkMap(p.data, map);
  }
  setStatus(`${label} completed in Pane ${k}.`);
  setActivePane(k);
}

const isInitItem = x => x.category ? x.category === 'INIT' : (!x.name.trim() || x.name.trim().toLowerCase().startsWith('init scene'));
const compactBank = k => reorderBank(k, (a, b) => (isInitItem(a) ? 1 : 0) - (isInitItem(b) ? 1 : 0), 'Compact Bank');
const sortBankAlpha = k => reorderBank(k, (a, b) => isInitItem(a) !== isInitItem(b) ? (isInitItem(a) ? 1 : -1) : a.name.trim().localeCompare(b.name.trim()), 'Sort A-Z');
const sortBankByCategory = k => reorderBank(k, (a, b) => {
  if (isInitItem(a) !== isInitItem(b)) return isInitItem(a) ? 1 : -1;
  const c = (a.category || '').localeCompare(b.category || '');
  return c !== 0 ? c : a.name.trim().localeCompare(b.name.trim());
}, 'Sort by Tag');

function quickRenameSelected() {
  const p = state[state.activePane];
  quickRenamePrompt(state.activePane, p.selectedIdx, isSceneBank(p.bank));
}

function quickRenamePrompt(k, idx, sc) {
  const p = state[k], item = sc ? p.data.scenes[idx] : p.data.patches[idx];
  const next = prompt(`Rename ${sc ? getSceneCode(idx) : getPatchCode(idx)} (max 16 chars):`, item.name.trimEnd());
  if (next === null) return;
  pushUndoState('Rename');
  writeAscii(item.raw, sc ? 0 : 0x010, 16, next);
  if (sc) p.data.scenes[idx] = parseSceneBlock(item.raw, true);
  else p.data.patches[idx] = parsePatchBlock(item.raw, item.format, true);
  refreshAll();
  if ($('diOverlay')?.classList.contains('open')) renderDeepInspector();
}

const AVAILABLE_TAGS = ["BASS", "PAD", "LEAD", "KEYS", "BELL", "SYNTH", "INIT", "FX", "ARP", "ORGAN", "BRASS", "STRINGS"];

function openTagModal() {
  const p = state[state.activePane];
  if (!p || !p.data) return;
  if (isSceneBank(p.bank)) {
    return alert('Category tags apply to Patches. Please select a Patch Bank (A-D) to assign category tags.');
  }
  if (!p.selectedList.length) return;
  const modal = $('tagOverlay');
  if (!modal) return;
  const currentPat = p.data.patches[p.selectedIdx];
  const currentCat = currentPat?.category || 'SYNTH';
  const sub = $('tagModalSub');
  if (sub) sub.textContent = `Target: ${p.selectedList.length} patch(es) in Pane [${state.activePane}] (e.g. Slot ${formatSlotDisplay(p.selectedIdx)})`;
  const grid = $('tagQuickGrid');
  if (grid) {
    grid.innerHTML = AVAILABLE_TAGS.map(cat => `
      <button class="tag-chip-btn ${cat === currentCat ? 'active' : ''}" onclick="setCategoryForSelection('${cat}')">${cat}</button>
    `).join('');
  }
  const inp = $('tagCustomInput');
  if (inp) {
    inp.value = '';
    setTimeout(() => inp.focus(), 50);
  }
  modal.classList.add('open');
}

function closeTagModal() {
  const modal = $('tagOverlay');
  if (modal) modal.classList.remove('open');
}

function setCategoryForSelection(cat) {
  const p = state[state.activePane];
  if (!p || !p.data || !p.selectedList.length) return;
  const cleanCat = String(cat).trim().toUpperCase().slice(0, 8) || 'SYNTH';
  pushUndoState(`Set Tag ${cleanCat}`);
  p.selectedList.forEach(idx => {
    const pat = p.data.patches[idx];
    if (pat) {
      pat.category = cleanCat;
      pat.modified = true;
    }
  });
  closeTagModal();
  refreshAll();
  setStatus(`Updated category tag to "${cleanCat}" for ${p.selectedList.length} patch(es).`);
}

function applyCustomTag() {
  const inp = $('tagCustomInput');
  if (!inp) return;
  const val = inp.value.trim().toUpperCase();
  if (!val) return;
  setCategoryForSelection(val);
}

// ============================================================================
// 7. FOOTER CONSOLE (ELEKTRON OLED & TRACK MONITOR)
// ============================================================================
function updateScenePartPatch(part, val) {
  const p = state[state.activePane], idx = parseInt(val, 10);
  if (!isSceneBank(p.bank) || isNaN(idx)) return;
  pushUndoState('Scene Part Link');
  const sc = p.data.scenes[p.selectedIdx];
  if (part === 'A') sc.raw[0x034] = sc.partAPatchIdx = idx;
  else sc.raw[0x088] = sc.partBPatchIdx = idx;
  sc.modified = true;
  refreshAll();
}

function updateInspector() {
  const k = state.activePane, p = state[k];
  if (!p.data) return;
  const scMode = isSceneBank(p.bank), inp = $('lcdNameInput');
  $('lcdPaneInfo').textContent = `POOL: [${k}] | SEL: ${p.selectedList.length}`;

  if (scMode) {
    const sc = p.data.scenes[p.selectedIdx], pA = getPatchCode(sc.partAPatchIdx), pB = getPatchCode(sc.partBPatchIdx);
    $('lcdSlotInfo').textContent = `${getSceneCode(p.selectedIdx)} (#${p.selectedIdx + 1})`;
    if (document.activeElement !== inp) inp.value = sc.name.trimEnd();
    $('lcdExtraLeft').textContent = `TEMPO: ${sc.tempo} BPM`;
    $('lcdExtraRight').textContent = `DUAL SCENE`;
    const opts = sel => p.data.patches.map((pt, i) => `<option value="${i}" ${i===sel?'selected':''}>${getPatchCode(i)}: ${esc(pt.name.trim()||'(Empty)')}</option>`).join('');
    $('tonesContainer').innerHTML = ['A','B'].map((pt, i) => {
      const pIdx = i===0 ? sc.partAPatchIdx : sc.partBPatchIdx, lvl = i===0 ? sc.partALevel : sc.partBLevel;
      return `<div class="t-card act" style="grid-column:span 2;border-top-color:var(--${i===0?'el-cyan':'el-amber'})">
        <div style="display:flex;justify-content:space-between;color:#fff;font-weight:700"><span>PART ${pt}</span><span>SLOT: ${getPatchCode(pIdx)}</span></div>
        <select class="sc-sel" onchange="updateScenePartPatch('${pt}',this.value)">${opts(pIdx)}</select>
        <div class="p-row"><span>Level</span><span class="p-val">${lvl}</span></div>
      </div>`;
    }).join('');
    $('envDetails').textContent = `Routing ➔ Part A: ${pA} | Part B: ${pB}`;
  } else {
    const pat = p.data.patches[p.selectedIdx];
    const actStr = ['A','B','C','D'].map((l, i) => pat.tones[i].active ? l : '-').join('');
    $('lcdSlotInfo').textContent = `SLOT ${getPatchCode(p.selectedIdx)} (#${p.selectedIdx + 1})`;
    if (document.activeElement !== inp) inp.value = pat.name.trimEnd();
    $('lcdExtraLeft').textContent = `TAG: ${pat.category} | [${actStr}]`;
    $('lcdExtraRight').textContent = `LVL: ${pat.patchLevel} | ${pat.format}`;
    $('tonesContainer').innerHTML = pat.tones.map((t, i) => {
      const isAct = t.active;
      return `
        <div class="t-card interactive ${isAct ? 'act' : 'muted'}" data-trk="${i}" ondblclick="setELActiveTrack(${i});openDeepInspector()" title="Double-click to open full Synth Workstation">
          <div class="overview-card-hdr">
            <span>TRK ${i+1} (${'ABCD'[i]})</span>
            <button class="overview-mute-btn ${isAct ? 'act' : ''}" onclick="event.stopPropagation();toggleOverviewToneActive(${i})" title="Toggle Tone Active (CC 112)">
              ${isAct ? 'ON' : 'MUTE'}
            </button>
          </div>
          <select class="overview-wave-sel" onchange="event.stopPropagation();updateOverviewToneWave(${i}, parseInt(this.value))" title="PCM Waveform (CC 72)">
            ${WAVES.map((w, wIdx) => `<option value="${wIdx}" ${wIdx === t.waveIdx ? 'selected' : ''}>${esc(w)}</option>`).join('')}
          </select>
          <div class="overview-ctrl-row">
            <span class="overview-lbl">CUT</span>
            <input type="range" class="overview-slider cyan" min="0" max="100" value="${t.cutoff}" 
                   oninput="event.stopPropagation();updateOverviewToneParam(${i}, 0x33, parseInt(this.value), 'val-cut-${i}')" 
                   title="TVF Cutoff: ${t.cutoff} (CC 3)">
            <span class="overview-val" id="val-cut-${i}">${t.cutoff}</span>
            <span class="overview-lbl">RES</span>
            <input type="range" class="overview-slider cyan" min="0" max="100" value="${t.resonance}" 
                   oninput="event.stopPropagation();updateOverviewToneParam(${i}, 0x32, parseInt(this.value), 'val-res-${i}')" 
                   title="TVF Resonance: ${t.resonance} (CC 9)">
            <span class="overview-val" id="val-res-${i}">${t.resonance}</span>
          </div>
          <div class="overview-ctrl-row">
            <span class="overview-lbl">LVL</span>
            <input type="range" class="overview-slider amber" min="0" max="100" value="${t.level}" 
                   oninput="event.stopPropagation();updateOverviewToneParam(${i}, 0x3F, parseInt(this.value), 'val-lvl-${i}')" 
                   title="TVA Level: ${t.level} (CC 103)">
            <span class="overview-val" id="val-lvl-${i}">${t.level}</span>
            <span class="overview-lbl">CRS</span>
            <input type="range" class="overview-slider amber" min="-24" max="24" value="${t.coarse}" 
                   oninput="event.stopPropagation();updateOverviewToneParam(${i}, 0x1B, parseInt(this.value) + 12, 'val-crs-${i}')" 
                   title="Pitch Coarse: ${t.coarse > 0 ? '+' : ''}${t.coarse} (CC 79)">
            <span class="overview-val" id="val-crs-${i}">${t.coarse > 0 ? '+' : ''}${t.coarse}</span>
          </div>
        </div>`;
    }).join('');
    const used = [];
    p.data.scenes.forEach((sc, i) => {
      if (sc.partAPatchIdx === p.selectedIdx || sc.partBPatchIdx === p.selectedIdx) {
        used.push(`${getSceneCode(i)} (${sc.name.trim()})`);
      }
    });
    $('envDetails').textContent = `Scene References (${used.length}): ${used.join(', ') || 'None (Safe to overwrite)'}`;
  }
  updateCollapsedFooterBar();
}

const updateLcdOverview = () => updateInspector();

// Interactive Overview Live Hardware Controllers
let overviewParamUndoTimeout = null;
function updateOverviewToneParam(toneIdx, offset, val, displayId) {
  const p = state[state.activePane];
  if (!p || !p.data || isSceneBank(p.bank)) return;
  const pat = p.data.patches[p.selectedIdx];
  const targetOff = 0x670 + toneIdx * 80 + offset;
  
  if (!overviewParamUndoTimeout) {
    pushUndoState('Tweak Overview Parameter');
  }
  clearTimeout(overviewParamUndoTimeout);
  overviewParamUndoTimeout = setTimeout(() => { overviewParamUndoTimeout = null; }, 1200);

  pat.raw[targetOff] = val;
  pat.modified = true;

  if (displayId) {
    const el = $(displayId);
    if (el) {
      if (offset === 0x1B) {
        const coarse = val - 12;
        el.textContent = (coarse > 0 ? '+' : '') + coarse;
      } else {
        el.textContent = val;
      }
    }
  }

  // Stream parameter over USB MIDI to Roland JD-08
  if (window.JD08Midi) {
    JD08Midi.sendToneParam(toneIdx, offset, val);
  }
}

function updateOverviewToneWave(toneIdx, waveId) {
  const p = state[state.activePane];
  if (!p || !p.data || isSceneBank(p.bank)) return;
  pushUndoState('Change Waveform');
  const pat = p.data.patches[p.selectedIdx];
  const base = 0x670 + toneIdx * 80;
  pat.raw[base + 0x14] = waveId & 0xFF;
  pat.raw[base + 0x15] = (waveId >> 8) & 0xFF;
  pat.modified = true;
  p.data.patches[p.selectedIdx] = parsePatchBlock(pat.raw, pat.format, true);
  if (window.JD08Midi) {
    JD08Midi.sendToneParam(toneIdx, 0x14, waveId & 0x7F);
  }
  refreshAll();
}

function toggleOverviewToneActive(toneIdx) {
  const p = state[state.activePane];
  if (!p || !p.data || isSceneBank(p.bank)) return;
  pushUndoState('Toggle Tone Active');
  const pat = p.data.patches[p.selectedIdx];
  const base = 0x670 + toneIdx * 80;
  const curActive = pat.tones[toneIdx].active;
  const nextActive = !curActive;
  pat.raw[base] = nextActive ? 1 : 0;
  pat.raw[0x20] = (pat.raw[0x20] & ~(1 << toneIdx)) | (nextActive ? (1 << toneIdx) : 0);
  pat.modified = true;
  p.data.patches[p.selectedIdx] = parsePatchBlock(pat.raw, pat.format, true);
  if (window.JD08Midi) {
    JD08Midi.sendToneParam(toneIdx, 0x00, nextActive ? 1 : 0);
  }
  refreshAll();
}

function getCurrentFocusedPatch() {
  const p = state[state.activePane];
  if (!p || !p.data) return null;
  if (isSceneBank(p.bank)) {
    const sc = p.data.scenes[p.selectedIdx];
    return p.data.patches[sc ? sc.partAPatchIdx : 0] || null;
  }
  return p.data.patches[p.selectedIdx] || null;
}

function handleOverbridgePillClick() {
  if (!window.JD08Midi) return;
  if (!JD08Midi.output) {
    JD08Midi.connect(true);
  } else {
    openSettingsModalTab('midi');
  }
}

function handleChannelSelectChange(val) {
  if (!window.JD08Midi) return;
  JD08Midi.setChannel(val);
  const chSel = $('settingMidiChannel');
  if (chSel && chSel.value !== val) chSel.value = val;
  const label = val === 'both' ? 'Broadcast All (Ch 1+2+3)' : `Channel ${val} (Part ${val === '2' ? 'A' : (val === '3' ? 'B' : '1')})`;
  setStatus(`MIDI Channel set to: ${label}`);
}

function cycleMidiChannel() {
  if (!window.JD08Midi) return;
  const cur = String(JD08Midi.channel);
  let next = 'both';
  if (cur === 'both' || cur === 'all') next = '2';
  else if (cur === '2') next = '3';
  else if (cur === '3') next = '1';
  else next = 'both';

  handleChannelSelectChange(next);
}

async function toggleUsbAudioMonitor() {
  if (!window.JD08Midi) return;
  await JD08Midi.toggleAudioMonitor();
}

// ============================================================================
// 6B. FIRST-TIME ONBOARDING & ARCHITECTURE TUTORIAL
// ============================================================================
let currentTutorialStep = 0;
const TOTAL_TUTORIAL_STEPS = 5;

function openTutorialModal(step = 0) {
  currentTutorialStep = Math.max(0, Math.min(step, TOTAL_TUTORIAL_STEPS - 1));
  renderTutorialStep();
  const overlay = $('tutorialOverlay');
  if (overlay) overlay.classList.add('open');
}

function closeTutorialModal() {
  const overlay = $('tutorialOverlay');
  if (overlay) overlay.classList.remove('open');
  const chk = $('tutorialDontShowAgain');
  if (chk && chk.checked) {
    localStorage.setItem('jd08_tutorial_seen', 'true');
  } else {
    localStorage.removeItem('jd08_tutorial_seen');
  }
}

function skipTutorial() {
  closeTutorialModal();
  setStatus('Tutorial closed. Click 📖 Guide in the top bar to review anytime.');
}

function nextTutorialStep() {
  if (currentTutorialStep < TOTAL_TUTORIAL_STEPS - 1) {
    currentTutorialStep++;
    renderTutorialStep();
  } else {
    closeTutorialModal();
    setStatus('Ready! Welcome to Roland JD-08 Commander.');
  }
}

function prevTutorialStep() {
  if (currentTutorialStep > 0) {
    currentTutorialStep--;
    renderTutorialStep();
  }
}

function goToTutorialStep(step) {
  currentTutorialStep = Math.max(0, Math.min(step, TOTAL_TUTORIAL_STEPS - 1));
  renderTutorialStep();
}

function renderTutorialStep() {
  for (let i = 0; i < TOTAL_TUTORIAL_STEPS; i++) {
    const slide = $(`tutSlide${i}`);
    const btn = $(`tutStepBtn${i}`);
    if (slide) slide.style.display = i === currentTutorialStep ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', i === currentTutorialStep);
  }
  const prevBtn = $('tutPrevBtn');
  const nextBtn = $('tutNextBtn');
  if (prevBtn) {
    if (currentTutorialStep === 0) {
      prevBtn.style.visibility = 'hidden';
      prevBtn.style.pointerEvents = 'none';
    } else {
      prevBtn.style.visibility = 'visible';
      prevBtn.style.pointerEvents = 'auto';
    }
  }
  if (nextBtn) {
    nextBtn.textContent = currentTutorialStep === TOTAL_TUTORIAL_STEPS - 1 ? 'Get Started 🚀' : 'Next ▶';
  }
  const tutBody = document.querySelector('.tutorial-body');
  if (tutBody) tutBody.scrollTop = 0;
}

function openSettingsModalTab(tabId) {
  openSettingsModal();
  switchSettingsTab(tabId);
}

const QWERTY_MIDI_MAP = {
  'KeyZ': 48, 'KeyS': 49, 'KeyX': 50, 'KeyD': 51, 'KeyC': 52, 'KeyV': 53, 'KeyG': 54, 'KeyB': 55, 'KeyH': 56, 'KeyN': 57, 'KeyJ': 58, 'KeyM': 59,
  'KeyQ': 60, 'Digit2': 61, 'KeyW': 62, 'Digit3': 63, 'KeyE': 64, 'KeyR': 65, 'Digit5': 66, 'KeyT': 67, 'Digit6': 68, 'KeyY': 69, 'Digit7': 70, 'KeyU': 71, 'KeyI': 72
};

// ============================================================================
// 8. ELEKTRON OVERBRIDGE SYNTH WORKSTATION & ROTARY ENCODERS
// ============================================================================

function fmtParam(raw, off, fmt) {
  const v = raw[off] || 0;
  if (fmt === 'onoff') return v ? 'ON' : 'OFF';
  if (fmt === 'lfo') return LFO_SHAPES[v] || `#${v}`;
  if (fmt === 'tvf') return TVF_MODES[v] || `#${v}`;
  if (fmt === 'semi') { const s = v - 12; return (s >= 0 ? '+' : '') + s + ' st'; }
  if (fmt === 'pan') { const s = v - 50; return s === 0 ? 'C' : (s < 0 ? 'L' + Math.abs(s) : 'R' + s); }
  if (fmt === 'wave') { const id = raw[off] | (raw[off + 1] << 8); return `${id} — ${WAVES[id] || 'Unknown'}`; }
  if (fmt === 'bitmask4') return ['A','B','C','D'].map((l, i) => (v & (1 << i)) ? l : '-').join('');
  return String(v);
}

function fmtCommonParam(raw, p) {
  if (p.fmt === 'bitmask4') {
    const v = raw[p.offsets[0]] || raw[p.offsets[1]] || 0;
    return ['A','B','C','D'].map((l, i) => (v & (1 << i)) ? l : '-').join('');
  }
  for (const off of p.offsets) { if (raw[off]) return p.fmt === 'onoff' ? (raw[off] ? 'ON' : 'OFF') : String(raw[off]); }
  return p.fmt === 'onoff' ? 'OFF' : '0';
}

// Vector Oscilloscope Envelope Visualizer
function drawEnvSVG(t1, t2, t3, t4, l1, l2, l3, stroke = '#00e5c8', fill = 'rgba(0,229,200,0.14)', label = '') {
  const w = 175, h = 46, pad = 4;
  const totalT = Math.max(1, t1 + t2 + t3 + t4);
  const sx = i => (pad + (i / totalT) * (w - 2 * pad)).toFixed(1);
  const sy = v => (h - pad - ((Math.min(127, Math.max(0, v)) / 127) * (h - 2 * pad))).toFixed(1);
  let x = 0;
  const pts = [[0, 0], [x += t1, l1], [x += t2, l2], [x += t3, l3], [x += t4, 0]];
  const pathD = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0])},${sy(p[1])}`).join(' ');
  const areaD = `${pathD} L${sx(x)},${sy(0)} L${sx(0)},${sy(0)} Z`;
  return `<svg width="${w}" height="${h}" style="background:#090a0e;border:1px solid #1c1f2b;border-radius:4px;display:block;width:100%">
    <line x1="${pad}" y1="${h/2}" x2="${w-pad}" y2="${h/2}" stroke="#141722" stroke-width="1" stroke-dasharray="3 3"/>
    <line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" stroke="#141722" stroke-width="1"/>
    <path d="${areaD}" fill="${fill}" />
    <path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round" />
    ${pts.map(p => `<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="2.5" fill="${stroke}" stroke="#000" stroke-width="1"/>`).join('')}
    ${label ? `<text x="${w - 6}" y="12" text-anchor="end" fill="${stroke}" font-size="8.5" font-family="'JetBrains Mono', Consolas, monospace" font-weight="800">${label}</text>` : ''}
  </svg>`;
}

// Precision Elektron Overbridge Rotary Encoder (Knob)
function renderElektronKnob(label, value, min, max, toneIdx, offset, color = '#f5a623', isSigned = false) {
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const circumference = 106.81; // 2 * PI * 17
  const arcLength = 80.11;     // 270 / 360 * circumference
  const dashOffset = (arcLength * (1 - ratio)).toFixed(2);
  const dispVal = isSigned ? (value > 0 ? `+${value}` : value) : value;

  // Pointer angle (sweep from 135deg to 405deg)
  const angleDeg = 135 + ratio * 270;
  const rad = angleDeg * Math.PI / 180;
  const x1 = (22 + 6 * Math.cos(rad)).toFixed(1);
  const y1 = (22 + 6 * Math.sin(rad)).toFixed(1);
  const x2 = (22 + 12 * Math.cos(rad)).toFixed(1);
  const y2 = (22 + 12 * Math.sin(rad)).toFixed(1);

  return `
    <div class="el-knob-box" 
         data-tone="${toneIdx}" 
         data-offset="${offset}"
         onmousedown="startKnobDrag(event, ${toneIdx}, ${offset}, ${min}, ${max}, ${isSigned})" 
         onwheel="handleKnobWheel(event, ${toneIdx}, ${offset}, ${min}, ${max}, ${isSigned})"
         title="${label}: ${dispVal} (Drag vertically or scroll wheel to adjust)">
      <div class="el-knob-lbl">${label}</div>
      <svg class="el-knob-svg" viewBox="0 0 44 44">
        <!-- Inactive background track -->
        <circle cx="22" cy="22" r="17" fill="none" stroke="#202432" stroke-width="3" 
                stroke-dasharray="80.11 106.81" transform="rotate(135 22 22)" stroke-linecap="round"/>
        <!-- Active colored arc -->
        <circle class="knob-arc" cx="22" cy="22" r="17" fill="none" stroke="${color}" stroke-width="3" 
                stroke-dasharray="80.11 106.81" stroke-dashoffset="${dashOffset}" 
                transform="rotate(135 22 22)" stroke-linecap="round"/>
        <!-- Center Knob Cap -->
        <circle cx="22" cy="22" r="12" fill="#141722" stroke="#252938" stroke-width="1.2"/>
        <!-- Pointer Needle -->
        <line class="knob-needle" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <div class="el-knob-val">${dispVal}</div>
    </div>`;
}

// Smooth 60FPS Hardware Knob Dragging Handler
function startKnobDrag(e, toneIdx, offset, min, max, isSigned = false) {
  e.preventDefault();
  const knobBox = e.currentTarget;
  const arcEl = knobBox.querySelector('.knob-arc');
  const needleEl = knobBox.querySelector('.knob-needle');
  const valEl = knobBox.querySelector('.el-knob-val');

  const startY = e.clientY;
  const targetOff = (toneIdx >= 0) ? (0x670 + toneIdx * 80 + offset) : offset;
  const p = state[state.activePane];
  if (!p || !p.data) return;
  const pat = p.data.patches[p.selectedIdx];
  const startVal = pat.raw[targetOff] || 0;
  pushUndoState('Tweak Encoder');

  function updateVisual(val) {
    const ratio = Math.max(0, Math.min(1, (val - min) / (max - min)));
    const arcLength = 80.11;
    const dashOffset = (arcLength * (1 - ratio)).toFixed(2);
    const dispVal = isSigned ? (val > 0 ? `+${val}` : val) : val;
    const angleDeg = 135 + ratio * 270;
    const rad = angleDeg * Math.PI / 180;
    const x1 = (22 + 6 * Math.cos(rad)).toFixed(1);
    const y1 = (22 + 6 * Math.sin(rad)).toFixed(1);
    const x2 = (22 + 12 * Math.cos(rad)).toFixed(1);
    const y2 = (22 + 12 * Math.sin(rad)).toFixed(1);

    if (arcEl) arcEl.setAttribute('stroke-dashoffset', dashOffset);
    if (needleEl) {
      needleEl.setAttribute('x1', x1);
      needleEl.setAttribute('y1', y1);
      needleEl.setAttribute('x2', x2);
      needleEl.setAttribute('y2', y2);
    }
    if (valEl) valEl.textContent = dispVal;

    if (offset >= 0x38 && offset <= 0x3E) {
      updateEnvelopeScopeDirect('tvf', toneIdx);
    } else if (offset >= 0x48 && offset <= 0x4E) {
      updateEnvelopeScopeDirect('tva', toneIdx);
    }
  }

  function onMove(me) {
    const deltaY = startY - me.clientY;
    const range = max - min;
    const step = (range / 140) * deltaY;
    const nextVal = Math.round(Math.max(min, Math.min(max, startVal + step)));
    if (pat.raw[targetOff] !== nextVal) {
      pat.raw[targetOff] = nextVal;
      updateVisual(nextVal);
      if (window.JD08Midi) {
        JD08Midi.sendToneParam(toneIdx, offset, nextVal);
      }
    }
  }

  function onUp() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    pat.modified = true;
    p.data.patches[p.selectedIdx] = parsePatchBlock(pat.raw, pat.format, true);
    refreshAll();
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

function handleKnobWheel(e, toneIdx, offset, min, max, isSigned = false) {
  e.preventDefault();
  const targetOff = (toneIdx >= 0) ? (0x670 + toneIdx * 80 + offset) : offset;
  const p = state[state.activePane];
  if (!p || !p.data) return;
  const pat = p.data.patches[p.selectedIdx];
  const curVal = pat.raw[targetOff] || 0;
  const step = e.deltaY < 0 ? 1 : -1;
  const nextVal = Math.max(min, Math.min(max, curVal + step));
  if (nextVal !== curVal) {
    pushUndoState('Scroll Encoder');
    pat.raw[targetOff] = nextVal;
    pat.modified = true;
    if (window.JD08Midi) {
      JD08Midi.sendToneParam(toneIdx, offset, nextVal);
    }
    p.data.patches[p.selectedIdx] = parsePatchBlock(pat.raw, pat.format, true);
    refreshAll();
    renderDeepInspector();
  }
}

function updateEnvelopeScopeDirect(type, toneIdx) {
  const p = state[state.activePane];
  if (!p || !p.data || toneIdx < 0) return;
  const raw = p.data.patches[p.selectedIdx].raw;
  const base = 0x670 + toneIdx * 80;
  if (type === 'tvf') {
    const el = $('scopeTVF');
    if (el) {
      const tT1 = raw[base + 0x38]||0, tT2 = raw[base + 0x39]||0, tT3 = raw[base + 0x3A]||0, tT4 = raw[base + 0x3B]||0;
      const tL1 = raw[base + 0x3C]||0, tL2 = raw[base + 0x3D]||0, tL3 = raw[base + 0x3E]||0;
      el.innerHTML = `
        <div class="el-scope-hdr"><span style="color:var(--el-cyan)">TVF ENVELOPE</span><span>FILTER</span></div>
        ${drawEnvSVG(tT1, tT2, tT3, tT4, tL1, tL2, tL3, '#00e5c8', 'rgba(0,229,200,0.15)', 'TVF')}
      `;
    }
  } else if (type === 'tva') {
    const el = $('scopeTVA');
    if (el) {
      const aT1 = raw[base + 0x48]||0, aT2 = raw[base + 0x49]||0, aT3 = raw[base + 0x4A]||0, aT4 = raw[base + 0x4B]||0;
      const aL1 = raw[base + 0x4C]||0, aL2 = raw[base + 0x4D]||0, aL3 = raw[base + 0x4E]||0;
      el.innerHTML = `
        <div class="el-scope-hdr"><span style="color:var(--el-amber)">TVA ENVELOPE</span><span>AMP</span></div>
        ${drawEnvSVG(aT1, aT2, aT3, aT4, aL1, aL2, aL3, '#f5a623', 'rgba(245,166,35,0.15)', 'TVA')}
      `;
    }
  }
}

function updatePatchParamDirect(toneIdx, offset, val) {
  const p = state[state.activePane];
  if (!p || !p.data || isSceneBank(p.bank)) return;
  const pat = p.data.patches[p.selectedIdx];
  const targetOff = (toneIdx >= 0) ? (0x670 + toneIdx * 80 + offset) : offset;
  pat.raw[targetOff] = val;
  pat.modified = true;
  if (window.JD08Midi) {
    JD08Midi.sendToneParam(toneIdx, offset, val);
  }
  p.data.patches[p.selectedIdx] = parsePatchBlock(pat.raw, pat.format, true);
  refreshAll();
  renderDeepInspector();
}

function setELActiveTrack(t) {
  state.elActiveTrack = t;
  renderDeepInspector();
}

function toggleELTrackActive(t) {
  const p = state[state.activePane];
  if (!p.data || isSceneBank(p.bank)) return;
  pushUndoState(`Toggle Track ${t+1}`);
  const pat = p.data.patches[p.selectedIdx];
  const base = 0x670 + t * 80;
  const cur = pat.raw[base];
  const next = cur ? 0 : 1;
  pat.raw[base] = next;
  if (next) {
    pat.raw[0x20] |= (1 << t);
    pat.raw[0x36] |= (1 << t);
  } else {
    pat.raw[0x20] &= ~(1 << t);
    pat.raw[0x36] &= ~(1 << t);
  }
  pat.modified = true;
  if (window.JD08Midi) {
    JD08Midi.sendToneParam(t, 0x00, next);
  }
  p.data.patches[p.selectedIdx] = parsePatchBlock(pat.raw, pat.format, true);
  refreshAll();
  renderDeepInspector();
}

function setELSynthView(v) {
  state.elSynthView = v;
  renderDeepInspector();
}

function openDeepInspector() {
  const p = state[state.activePane];
  if (!p || !p.data) return;
  $('diOverlay').classList.add('open');
  renderDeepInspector();
}

function closeDeepInspector() {
  $('diOverlay').classList.remove('open');
}

function navigateInspector(step) {
  const k = state.activePane, p = state[k];
  if (!p || !p.data) return;
  const scMode = isSceneBank(p.bank);
  const max = scMode ? 128 : 256;
  const v = p.visibleIndices.length ? p.visibleIndices : Array.from({length: max}, (_, i) => i);
  const curPos = v.indexOf(p.selectedIdx);
  const nextPos = curPos === -1 ? 0 : Math.min(v.length - 1, Math.max(0, curPos + step));
  const nextIdx = v[nextPos];
  p.selectedIdx = nextIdx;
  p.selectedList = [nextIdx];
  p.lastClickedIdx = nextIdx;
  if (window.JD08Midi && !scMode) JD08Midi.selectPreset(nextIdx);
  renderPane(k);
  updateInspector();
  renderDeepInspector();
}

function quickRenameFromInspector() {
  const k = state.activePane, p = state[k], sc = isSceneBank(p.bank);
  quickRenamePrompt(k, p.selectedIdx, sc);
  renderDeepInspector();
}

// Master Overbridge Synth Workstation Renderer
function renderDeepInspector() {
  const k = state.activePane, p = state[k];
  if (!p || !p.data) return;
  const scMode = isSceneBank(p.bank);

  if (scMode) {
    // Bi-Timbral Scene Performance Matrix
    const sc = p.data.scenes[p.selectedIdx];
    $('diSubTitle').textContent = `SCENE ${getSceneCode(p.selectedIdx)} (#${p.selectedIdx + 1}) — ${sc.name.trim() || '(Untitled Scene)'} [${k}]`;
    const pA = sc.partAPatchIdx, pB = sc.partBPatchIdx;
    const patA = p.data.patches[pA], patB = p.data.patches[pB];
    const optsA = p.data.patches.map((pt, i) => `<option value="${i}" ${i === pA ? 'selected' : ''}>${getPatchCode(i)}: ${esc(pt.name.trim() || '(Empty)')}</option>`).join('');
    const optsB = p.data.patches.map((pt, i) => `<option value="${i}" ${i === pB ? 'selected' : ''}>${getPatchCode(i)}: ${esc(pt.name.trim() || '(Empty)')}</option>`).join('');

    const scHtml = `
      <div class="el-track-bar">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span class="di-badge">BI-TIMBRAL <span>PERFORMANCE</span> MATRIX</span>
          <span class="status-pill">TEMPO: <b>${sc.tempo} BPM</b></span>
        </div>
        <div style="font-size:0.68rem;color:var(--el-text-muted)">Dual Channel Performance Routing</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div class="el-module" style="border-top:2px solid var(--el-cyan)">
          <div class="el-mod-hdr"><span class="el-mod-title" style="color:var(--el-cyan)">PART A CHANNEL</span><span class="el-mod-tag cyan">SLOT ${getPatchCode(pA)}</span></div>
          <div class="p-row"><span>Target Patch</span><select class="sc-sel" onchange="updateScenePartPatch('A',this.value);renderDeepInspector()">${optsA}</select></div>
          <div class="p-row"><span>Category</span><span class="ctag ${patA?.category||'INIT'}">${patA?.category||'INIT'}</span></div>
          <div class="el-knobs-row" style="justify-content:center;padding:12px 0">
            ${renderElektronKnob('LEVEL', sc.partALevel, 0, 100, -1, 0x035, '#00e5c8')}
          </div>
          <div class="p-row"><span>Active Tones</span><span>${patA ? ['A','B','C','D'].map((l,i)=>patA.tones[i].active?`<b style="color:var(--el-cyan)">${l}</b>`:`<span style="opacity:.25">-</span>`).join(' ') : '----'}</span></div>
        </div>
        <div class="el-module" style="border-top:2px solid var(--el-amber)">
          <div class="el-mod-hdr"><span class="el-mod-title" style="color:var(--el-amber)">PART B CHANNEL</span><span class="el-mod-tag">SLOT ${getPatchCode(pB)}</span></div>
          <div class="p-row"><span>Target Patch</span><select class="sc-sel" onchange="updateScenePartPatch('B',this.value);renderDeepInspector()">${optsB}</select></div>
          <div class="p-row"><span>Category</span><span class="ctag ${patB?.category||'INIT'}">${patB?.category||'INIT'}</span></div>
          <div class="el-knobs-row" style="justify-content:center;padding:12px 0">
            ${renderElektronKnob('LEVEL', sc.partBLevel, 0, 100, -1, 0x089, '#f5a623')}
          </div>
          <div class="p-row"><span>Active Tones</span><span>${patB ? ['A','B','C','D'].map((l,i)=>patB.tones[i].active?`<b style="color:var(--el-amber)">${l}</b>`:`<span style="opacity:.25">-</span>`).join(' ') : '----'}</span></div>
        </div>
      </div>`;
    $('diPanel0').innerHTML = scHtml;
    $('diPanel1').innerHTML = `<div style="padding:20px;color:var(--el-text-muted);text-align:center">Switch to Patch Bank A–D to edit individual tone parameters.</div>`;
    $('diPanel2').innerHTML = `<div style="padding:20px;color:var(--el-text-muted);text-align:center">Part A Patch #${pA} | Part B Patch #${pB}</div>`;
    $('diPanel3').innerHTML = `<div style="padding:20px;color:var(--el-text-muted);text-align:center">Scene FX routed through Part A & Part B sound processors.</div>`;
    renderHexViewer(sc.raw, SCENE_SIZE_JD08);
    return;
  }

  // Active Patch
  const pat = p.data.patches[p.selectedIdx];
  const raw = pat.raw;
  $('diSubTitle').textContent = `PATCH ${getPatchCode(p.selectedIdx)} (#${p.selectedIdx + 1}) — ${pat.name.trim()} [${k}]`;

  const trk = state.elActiveTrack; // 0=A, 1=B, 2=C, 3=D
  const base = 0x670 + trk * 80;

  // TAB 0: ELEKTRON OVERBRIDGE SYNTH WORKSTATION
  let elHtml = `
    <!-- Top Track Step Key Ribbon -->
    <div class="el-track-bar">
      <div class="el-track-keys">
        ${[0,1,2,3].map(t => {
          const tBase = 0x670 + t * 80;
          const toneActive = raw[tBase] === 1 || (((raw[0x20] || raw[0x36] || 0) & (1 << t)) !== 0 && raw[tBase] !== 0);
          return `
            <div class="el-trk-key ${t === trk ? 'active' : ''}" onclick="setELActiveTrack(${t})">
              <div class="el-led-pip ${toneActive ? 'on' : ''}" onclick="event.stopPropagation();toggleELTrackActive(${t})" title="Toggle Track Active/Mute"></div>
              <span>TRACK ${t+1} (${'ABCD'[t]})</span>
            </div>`;
        }).join('')}
      </div>

      <div style="display:flex;align-items:center;gap:12px;font-family:var(--font-mono);font-size:0.72rem">
        <span style="color:var(--el-text-muted)">TAG: <b class="ctag ${pat.category}">${pat.category}</b></span>
        <span style="color:var(--el-text-muted)">LEVEL: <b>${raw[0x7B3] || raw[0x24] || 80}</b></span>
        <span style="color:var(--el-amber)">BEND: <b>-${raw[0x84]||0}/+${raw[0x86]||0}</b></span>
        <span style="color:var(--el-cyan)">PORTA: <b>${raw[0x58] ? 'ON' : 'OFF'} (${raw[0x5C]||0})</b></span>
      </div>

      <div class="mode-sw">
        <button class="mode-btn ${state.elSynthView==='encoders'?'active':''}" onclick="setELSynthView('encoders')">🎛️ Encoders</button>
        <button class="mode-btn ${state.elSynthView==='matrix'?'active':''}" onclick="setELSynthView('matrix')">▦ 4-Track</button>
      </div>
    </div>`;

  if (state.elSynthView === 'encoders') {
    // ROTARY ENCODER LAYOUT (Precision Overbridge Rack)
    const waveID = raw[base + 0x14] | (raw[base + 0x15] << 8);
    const waveName = WAVES[waveID] || `Wave #${waveID + 1}`;
    const coarse = (raw[base + 0x1B] || 12) - 12;
    const fine = raw[base + 0x1C] || 0;
    const pEnvD = raw[base + 0x1D] || 0;

    const lfo1Shp = raw[base + 0x04] || 0, lfo1Rate = raw[base + 0x06] || 0, lfo1Delay = raw[base + 0x08] || 0;
    const lfo2Rate = raw[base + 0x0E] || 0;

    const tvfMode = raw[base + 0x30] || 1, cutoff = raw[base + 0x33] || 0, res = raw[base + 0x32] || 0, tvfEnvD = raw[base + 0x34] || 0;
    const tT1 = raw[base + 0x38]||0, tT2 = raw[base + 0x39]||0, tT3 = raw[base + 0x3A]||0, tT4 = raw[base + 0x3B]||0;
    const tL1 = raw[base + 0x3C]||0, tL2 = raw[base + 0x3D]||0, tL3 = raw[base + 0x3E]||0;

    const tvaLvl = raw[base + 0x3F] || 0, panRaw = (raw[base + 0x41] || 50) - 50;
    const aT1 = raw[base + 0x48]||0, aT2 = raw[base + 0x49]||0, aT3 = raw[base + 0x4A]||0, aT4 = raw[base + 0x4B]||0;
    const aL1 = raw[base + 0x4C]||0, aL2 = raw[base + 0x4D]||0, aL3 = raw[base + 0x4E]||0;

    elHtml += `
      <div class="el-rack-grid">
        <!-- PITCH & WG MODULE -->
        <div class="el-module">
          <div class="el-mod-hdr"><span class="el-mod-title">PITCH & WAVE GENERATOR</span><span class="el-mod-tag">TRK ${trk+1}</span></div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <span style="font-size:0.62rem;color:var(--el-text-muted);letter-spacing:0.8px;font-weight:700">PCM WAVE SELECT</span>
            <select class="sc-sel" onchange="updatePatchParamDirect(${trk}, 0x14, parseInt(this.value)&0xFF); updatePatchParamDirect(${trk}, 0x15, (parseInt(this.value)>>8)&0xFF)">
              ${WAVES.map((w, i) => `<option value="${i}" ${i === waveID ? 'selected' : ''}>${esc(w)}</option>`).join('')}
            </select>
          </div>
          <div class="el-knobs-row">
            ${renderElektronKnob('COARSE', coarse, -24, 24, trk, 0x1B, '#f5a623', true)}
            ${renderElektronKnob('FINE', fine, -50, 50, trk, 0x1C, '#f5a623', true)}
            ${renderElektronKnob('P-ENV', pEnvD, 0, 100, trk, 0x1D, '#f5a623')}
          </div>
        </div>

        <!-- LFO MODULATION MODULE -->
        <div class="el-module">
          <div class="el-mod-hdr"><span class="el-mod-title">LFO 1 & 2 MODULATION</span><span class="el-mod-tag cyan">DUAL LFO</span></div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="font-size:0.62rem;color:var(--el-text-muted);letter-spacing:0.8px;font-weight:700">LFO 1 SHAPE</div>
            <div class="el-seg-group">
              ${LFO_SHAPES.map((s, idx) => `
                <button class="el-seg-btn ${lfo1Shp === idx ? 'active' : ''}" onclick="updatePatchParamDirect(${trk}, 0x04, ${idx})">
                  <div class="el-led-pip ${lfo1Shp === idx ? 'on' : ''}"></div>${s}
                </button>`).join('')}
            </div>
          </div>
          <div class="el-knobs-row">
            ${renderElektronKnob('LFO1 RATE', lfo1Rate, 0, 100, trk, 0x06, '#00e5c8')}
            ${renderElektronKnob('LFO1 DELAY', lfo1Delay, 0, 100, trk, 0x08, '#00e5c8')}
            ${renderElektronKnob('LFO2 RATE', lfo2Rate, 0, 100, trk, 0x0E, '#00e5c8')}
          </div>
        </div>

        <!-- FILTER / TVF MODULE -->
        <div class="el-module" style="grid-column:span 2">
          <div class="el-mod-hdr">
            <span class="el-mod-title" style="color:var(--el-cyan)">TIME VARIANT FILTER (TVF)</span>
            <span class="el-mod-tag cyan">${TVF_MODES[tvfMode] || 'LPF'}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 220px;gap:14px;align-items:center">
            <div style="display:flex;flex-direction:column;gap:8px">
              <div class="el-seg-group">
                ${TVF_MODES.map((m, idx) => `
                  <button class="el-seg-btn ${tvfMode === idx ? 'active' : ''}" onclick="updatePatchParamDirect(${trk}, 0x30, ${idx})">
                    <div class="el-led-pip ${tvfMode === idx ? 'on' : ''}"></div>${m}
                  </button>`).join('')}
              </div>
              <div class="el-knobs-row">
                ${renderElektronKnob('CUTOFF', cutoff, 0, 100, trk, 0x33, '#00e5c8')}
                ${renderElektronKnob('RESON', res, 0, 100, trk, 0x32, '#00e5c8')}
                ${renderElektronKnob('ENV-D', tvfEnvD, 0, 100, trk, 0x34, '#00e5c8')}
                ${renderElektronKnob('T1', tT1, 0, 100, trk, 0x38, '#00e5c8')}
                ${renderElektronKnob('T2', tT2, 0, 100, trk, 0x39, '#00e5c8')}
                ${renderElektronKnob('T3', tT3, 0, 100, trk, 0x3A, '#00e5c8')}
                ${renderElektronKnob('T4', tT4, 0, 100, trk, 0x3B, '#00e5c8')}
                ${renderElektronKnob('L1', tL1, 0, 100, trk, 0x3C, '#00e5c8')}
                ${renderElektronKnob('L2', tL2, 0, 100, trk, 0x3D, '#00e5c8')}
                ${renderElektronKnob('L3', tL3, 0, 100, trk, 0x3E, '#00e5c8')}
              </div>
            </div>
            <div class="el-scope-window" id="scopeTVF">
              <div class="el-scope-hdr"><span style="color:var(--el-cyan)">TVF ENVELOPE</span><span>FILTER</span></div>
              ${drawEnvSVG(tT1, tT2, tT3, tT4, tL1, tL2, tL3, '#00e5c8', 'rgba(0,229,200,0.15)', 'TVF')}
            </div>
          </div>
        </div>

        <!-- AMP & PAN / TVA MODULE -->
        <div class="el-module" style="grid-column:span 2">
          <div class="el-mod-hdr">
            <span class="el-mod-title" style="color:var(--el-amber)">TIME VARIANT AMPLIFIER (TVA)</span>
            <span class="el-mod-tag">AMPLITUDE & PAN</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 220px;gap:14px;align-items:center">
            <div style="display:flex;flex-direction:column;gap:8px">
              <div class="el-knobs-row">
                ${renderElektronKnob('LEVEL', tvaLvl, 0, 100, trk, 0x3F, '#f5a623')}
                ${renderElektronKnob('PAN', panRaw, -50, 50, trk, 0x41, '#f5a623', true)}
                ${renderElektronKnob('T1', aT1, 0, 100, trk, 0x48, '#f5a623')}
                ${renderElektronKnob('T2', aT2, 0, 100, trk, 0x49, '#f5a623')}
                ${renderElektronKnob('T3', aT3, 0, 100, trk, 0x4A, '#f5a623')}
                ${renderElektronKnob('T4', aT4, 0, 100, trk, 0x4B, '#f5a623')}
                ${renderElektronKnob('L1', aL1, 0, 100, trk, 0x4C, '#f5a623')}
                ${renderElektronKnob('L2', aL2, 0, 100, trk, 0x4D, '#f5a623')}
                ${renderElektronKnob('L3', aL3, 0, 100, trk, 0x4E, '#f5a623')}
              </div>
            </div>
            <div class="el-scope-window" id="scopeTVA">
              <div class="el-scope-hdr"><span style="color:var(--el-amber)">TVA ENVELOPE</span><span>AMP</span></div>
              ${drawEnvSVG(aT1, aT2, aT3, aT4, aL1, aL2, aL3, '#f5a623', 'rgba(245,166,35,0.15)', 'TVA')}
            </div>
          </div>
        </div>
      </div>`;
  } else {
    // 4-TRACK SIMULTANEOUS OVERVIEW
    elHtml += `<div class="grid" style="grid-template-columns:repeat(4, 1fr);gap:8px">`;
    for (let t = 0; t < 4; t++) {
      const b = 0x670 + t * 80;
      const tAct = raw[b] === 1 || (((raw[0x20] || raw[0x36] || 0) & (1 << t)) !== 0 && raw[b] !== 0);
      const wID = raw[b + 0x14] | (raw[b + 0x15] << 8);
      const wName = WAVES[wID] || `Wave #${wID + 1}`;
      const cCoarse = (raw[b + 0x1B] || 12) - 12;
      const cCutoff = raw[b + 0x33] || 0, cRes = raw[b + 0x32] || 0;
      const cLvl = raw[b + 0x3F] || 0;

      const tT1 = raw[b + 0x38]||0, tT2 = raw[b + 0x39]||0, tT3 = raw[b + 0x3A]||0, tT4 = raw[b + 0x3B]||0;
      const tL1 = raw[b + 0x3C]||0, tL2 = raw[b + 0x3D]||0, tL3 = raw[b + 0x3E]||0;

      const aT1 = raw[b + 0x48]||0, aT2 = raw[b + 0x49]||0, aT3 = raw[b + 0x4A]||0, aT4 = raw[b + 0x4B]||0;
      const aL1 = raw[b + 0x4C]||0, aL2 = raw[b + 0x4D]||0, aL3 = raw[b + 0x4E]||0;

      elHtml += `
        <div class="el-module" style="${tAct ? 'border-top:2px solid var(--el-cyan)' : 'opacity:0.45'}">
          <div class="el-mod-hdr">
            <span class="el-mod-title">TRACK ${t+1} (${'ABCD'[t]})</span>
            <span class="el-mod-tag ${tAct ? 'cyan' : ''}">${tAct ? 'ACTIVE' : 'MUTE'}</span>
          </div>
          <div class="w-bdg" title="${esc(wName)}">${esc(wName)}</div>
          <div class="p-row"><span>Tune</span><span class="p-val">${cCoarse >= 0 ? '+' : ''}${cCoarse} st</span></div>
          <div class="p-row"><span>Cut / Res</span><span class="p-val">${cCutoff} / ${cRes}</span></div>
          ${drawEnvSVG(tT1, tT2, tT3, tT4, tL1, tL2, tL3, '#00e5c8', 'rgba(0,229,200,0.12)', 'TVF')}
          <div class="p-row"><span>Level</span><span class="p-val">${cLvl}</span></div>
          ${drawEnvSVG(aT1, aT2, aT3, aT4, aL1, aL2, aL3, '#f5a623', 'rgba(245,166,35,0.12)', 'TVA')}
        </div>`;
    }
    elHtml += `</div>`;
  }
  $('diPanel0').innerHTML = elHtml;

  // TAB 1: 4X TONE DETAILED MATRIX
  let html1 = '<div class="grid" style="grid-template-columns:repeat(4, 1fr);gap:8px">';
  for (let t = 0; t < 4; t++) {
    const b = 0x670 + t * 80;
    const isAct = raw[b] === 1 || (((raw[0x20] || raw[0x36] || 0) & (1 << t)) !== 0 && raw[b] !== 0);
    html1 += `<div class="el-module" style="${isAct ? 'border-top:2px solid var(--el-cyan)' : 'opacity:0.4'}">`;
    html1 += `<div class="el-mod-hdr"><span class="el-mod-title">TRACK ${t+1} (${'ABCD'[t]})</span><span class="el-mod-tag ${isAct?'cyan':''}">${isAct ? 'ON' : 'MUTE'}</span></div>`;
    html1 += '<div style="font-size:0.62rem;color:var(--el-amber);font-weight:800;letter-spacing:0.8px;margin-top:2px">WG & PITCH</div>';
    TONE_WG_PARAMS.forEach(param => {
      html1 += `<div class="p-row"><span>${param.label}</span><span class="p-val">${fmtParam(raw, b + param.off, param.fmt)}</span></div>`;
    });
    html1 += '<div style="font-size:0.62rem;color:var(--el-cyan);font-weight:800;letter-spacing:0.8px;margin-top:4px">LFO MODULATION</div>';
    TONE_LFO_PARAMS.forEach(param => {
      html1 += `<div class="p-row"><span>${param.label}</span><span class="p-val">${fmtParam(raw, b + param.off, param.fmt)}</span></div>`;
    });
    html1 += '<div style="font-size:0.62rem;color:var(--el-cyan);font-weight:800;letter-spacing:0.8px;margin-top:4px">TVF FILTER</div>';
    TONE_TVF_PARAMS.forEach(param => {
      html1 += `<div class="p-row"><span>${param.label}</span><span class="p-val">${fmtParam(raw, b + param.off, param.fmt)}</span></div>`;
    });
    html1 += '<div style="font-size:0.62rem;color:var(--el-amber);font-weight:800;letter-spacing:0.8px;margin-top:4px">TVA AMPLIFIER</div>';
    TONE_TVA_PARAMS.forEach(param => {
      html1 += `<div class="p-row"><span>${param.label}</span><span class="p-val">${fmtParam(raw, b + param.off, param.fmt)}</span></div>`;
    });
    html1 += '</div>';
  }
  html1 += '</div>';
  $('diPanel1').innerHTML = html1;

  // TAB 2: COMMON & CONTROL
  let html2 = '<table class="di-tbl"><tr><th>Parameter</th><th>Value</th><th>Memory Offset</th></tr>';
  COMMON_PARAMS.forEach(cp => {
    const val = fmtCommonParam(raw, cp);
    const offStr = cp.offsets.map(o => '0x' + o.toString(16).toUpperCase().padStart(3, '0')).join(', ');
    html2 += `<tr><td>${cp.label}</td><td><b style="color:#fff">${val}</b></td><td style="color:var(--el-text-muted)">${offStr}</td></tr>`;
  });
  html2 += '</table>';
  $('diPanel2').innerHTML = html2;

  // TAB 3: MULTI-FX & EQ DECODED
  let html3 = '<div style="font-size:0.74rem;color:var(--el-amber);font-weight:800;margin-bottom:8px">ROLAND MULTI-EFFECTS & EQ DECODED (0x3C0–0x560)</div>';
  html3 += '<table class="di-tbl"><tr><th>Offset</th><th>Parameter Description</th><th>Value (Dec)</th><th>Hex Byte</th></tr>';
  for (let off = 0x3C0; off < 0x560 && off < PATCH_SIZE_JD08; off += 4) {
    const vals = [];
    for (let b = 0; b < 4 && off + b < 0x560; b++) vals.push(raw[off + b]);
    let desc = 'FX Parameter Group';
    if (off === 0x3C0) desc = 'Equalizer (Low Freq / Low Gain / High Freq / High Gain)';
    else if (off === 0x3C8) desc = 'Distortion / Overdrive (Drive / Level)';
    else if (off === 0x3D0) desc = 'Phaser (Rate / Depth / Manual / Res)';
    else if (off === 0x3D8) desc = 'Spectrum / Enhancer';
    else if (off === 0x3E0) desc = 'Chorus / Flanger (Rate / Depth / Feedback / Level)';
    else if (off === 0x3E8) desc = 'Chorus Pre-Delay / Mode';
    else if (off === 0x3F0) desc = 'Delay (Time / Feedback / Level)';
    else if (off === 0x400) desc = 'Reverb (Type / Time / Level)';
    html3 += `<tr><td style="color:var(--el-amber)">0x${off.toString(16).toUpperCase().padStart(3,'0')}</td><td>${desc}</td><td>${vals.join(', ')}</td><td style="color:var(--el-text-muted)">${vals.map(v => v.toString(16).toUpperCase().padStart(2,'0')).join(' ')}</td></tr>`;
  }
  html3 += '</table>';
  $('diPanel3').innerHTML = html3;

  // TAB 4: 2048B HEX VIEWER & L/R DIFF
  renderHexViewer(raw, PATCH_SIZE_JD08);
}

function renderHexViewer(raw, size) {
  const k = state.activePane;
  const otherK = k === 'L' ? 'R' : 'L';
  const otherDoc = state[otherK].data;
  const otherRaw = otherDoc ? (isSceneBank(state[otherK].bank) ? state[otherK].data.scenes[state[otherK].selectedIdx]?.raw : state[otherK].data.patches[state[otherK].selectedIdx]?.raw) : null;
  const hasDiff = otherRaw && otherRaw.length >= size;

  let hexHtml = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
    <span style="font-size:0.72rem;color:var(--el-amber);font-weight:800">HEX MEMORY STREAM (${size} BYTES)</span>
    <span style="font-size:0.68rem;color:var(--el-text-muted)">${hasDiff ? 'DIFF VS POOL ' + otherK + ' (Coral = Modified Byte)' : 'SINGLE POOL VIEW'}</span>
  </div>`;
  hexHtml += '<div class="hex-wrap">';
  const limit = Math.min(size, 2048);
  for (let row = 0; row < limit; row += 16) {
    let hexPart = '', ascPart = '';
    for (let col = 0; col < 16 && row + col < limit; col++) {
      const addr = row + col, bv = raw[addr];
      const isDiff = hasDiff && otherRaw[addr] !== bv;
      const cls = isDiff ? ' class="hex-diff"' : '';
      hexPart += `<span${cls}>${bv.toString(16).toUpperCase().padStart(2, '0')}</span> `;
      const ch = (bv >= 32 && bv < 127) ? String.fromCharCode(bv) : '.';
      ascPart += `<span${cls}>${esc(ch)}</span>`;
    }
    hexHtml += `<span class="hex-addr">${row.toString(16).toUpperCase().padStart(4, '0')}</span>  ${hexPart} <span class="hex-ascii">${ascPart}</span>\n`;
  }
  hexHtml += '</div>';
  $('diPanel4').innerHTML = hexHtml;
}

// ============================================================================
// 9. UI EVENT LISTENERS, TABS & KEYBOARD SHORTCUTS
// ============================================================================
function setActivePane(k) {
  state.activePane = k;
  $('paneL').classList.toggle('act', k === 'L');
  $('paneR').classList.toggle('act', k === 'R');
  refreshAll();
}

function setDragMode(m) {
  state.dragMode = m;
  $('modeSwapBtn').classList.toggle('active', m === 'swap');
  $('modeCopyBtn').classList.toggle('active', m === 'copy');
}

function setViewMode(v) {
  state.viewMode = v;
  $('viewGridBtn').classList.toggle('active', v === 'grid');
  $('viewListBtn').classList.toggle('active', v === 'list');
  refreshAll();
}

function toggleSortDrawer(k) {
  state[k].sortDrawerOpen = !state[k].sortDrawerOpen;
  const drawer = $(`sortDrawer${k}`);
  const tab = $(`sortToggleTab${k}`);
  const arrow = $(`sortArrow${k}`);
  if (drawer) drawer.classList.toggle('collapsed', !state[k].sortDrawerOpen);
  if (tab) tab.classList.toggle('active', state[k].sortDrawerOpen);
  if (arrow) arrow.textContent = state[k].sortDrawerOpen ? '▴' : '▾';
}

function bindBankTabEvents(k) {
  const container = $(`tabs${k}`);
  if (!container) return;
  container.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = e => { e.stopPropagation(); switchBankTab(k, tab.dataset.bank); setActivePane(k); };
    tab.ondragover = e => {
      e.preventDefault();
      tab.classList.add('drag-t');
      if (String(state[k].bank) !== tab.dataset.bank) switchBankTab(k, tab.dataset.bank, true);
    };
    tab.ondragleave = () => tab.classList.remove('drag-t');
    tab.ondrop = e => {
      e.preventDefault();
      tab.classList.remove('drag-t');
      const b = tab.dataset.bank, sc = isSceneBank(b);
      if (state.dragSource && state.dragSource.isScene === sc) {
        executeBatchTransfer(state.dragSource.pane, state.dragSource.indices, k, sc ? (b==='PRF1'?0:64) : parseInt(b,10)*64, sc, state.dragMode === 'swap');
        state.dragSource = null;
      }
    };
  });
}

function renderPaneTabs(k) {
  const container = $(`tabs${k}`);
  if (!container) return;
  const currentBank = state[k].bank;
  const banks = appSettings.hideScenes ? [0, 1, 2, 3] : [0, 1, 2, 3, 'PRF1', 'PRF2'];
  container.innerHTML = banks.map(b => {
    const lbl = b === 'PRF1' ? 'SCENES 1-8' : b === 'PRF2' ? 'SCENES 9-16' : `BANK ${'ABCD'[b]}`;
    return `<div class="tab ${String(b).startsWith('PRF') ? 'sc-tab' : ''} ${String(b) === String(currentBank) ? 'active' : ''}" data-bank="${b}">${lbl}</div>`;
  }).join('');
  bindBankTabEvents(k);
}

function switchBankTab(k, bVal, preserveSel = false) {
  const p = state[k];
  $(`tabs${k}`).querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.bank === String(bVal)));
  p.bank = isSceneBank(bVal) ? bVal : parseInt(bVal, 10);
  if (!preserveSel) {
    const s = isSceneBank(p.bank) ? (p.bank === 'PRF1' ? 0 : 64) : p.bank * 64;
    p.selectedIdx = s; p.selectedList = [s]; p.lastClickedIdx = s;
  }
  renderPane(k);
}

function initEventHandlers() {
  ['L', 'R'].forEach(k => {
    $(`fileInput${k}`).onchange = e => {
      if (e.target.files.length) handleFileLoad(k, e.target.files[0]);
      e.target.value = '';
    };
    bindBankTabEvents(k);
  });

  // Modal Tab Switching
  $('diTabs').querySelectorAll('.di-tab').forEach(tab => {
    tab.onclick = () => {
      $('diTabs').querySelectorAll('.di-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.di-panel').forEach(p => p.classList.remove('active'));
      const panel = $('diPanel' + tab.dataset.ditab);
      if (panel) panel.classList.add('active');
    };
  });

  document.body.ondragover = e => e.preventDefault();
  document.body.ondrop = e => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFileLoad(state.activePane, e.dataTransfer.files[0]);
  };

  $('lcdNameInput').onfocus = () => state.lcdEditSnapshotSaved = false;
  $('lcdNameInput').oninput = e => {
    const p = state[state.activePane];
    if (!p.data) return;
    if (!state.lcdEditSnapshotSaved) { pushUndoState('Rename'); state.lcdEditSnapshotSaved = true; }
    const n = e.target.value.padEnd(16, ' ').slice(0, 16);
    if (isSceneBank(p.bank)) {
      const sc = p.data.scenes[p.selectedIdx];
      sc.name = n; sc.modified = true;
      writeAscii(sc.raw, 0, 16, n);
    } else {
      const pat = p.data.patches[p.selectedIdx];
      pat.name = n; pat.modified = true;
      writeAscii(pat.raw, 0x010, 16, n);
      pat.category = detectPatchCategory(n, pat.tones);
    }
    renderPane('L'); renderPane('R');
  };

  window.addEventListener('keydown', e => {
    const isTutorialOpen = $('tutorialOverlay')?.classList.contains('open');
    const isSettingsOpen = $('settingsOverlay')?.classList.contains('open');
    const isModalOpen = $('diOverlay')?.classList.contains('open');

    if (e.key === 'Escape') {
      if (isTutorialOpen) { closeTutorialModal(); return; }
      if ($('tagOverlay')?.classList.contains('open')) { closeTagModal(); return; }
      if (isSettingsOpen) { closeSettingsModal(); return; }
      if (isModalOpen) { closeDeepInspector(); return; }
    }
    if (isTutorialOpen) {
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); nextTutorialStep(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevTutorialStep(); return; }
      return;
    }
    if (isSettingsOpen) return;

    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      toggleFooterCollapse();
      return;
    }

    if (isModalOpen) {
      if (['INPUT','SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigateInspector(-1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigateInspector(1); return; }
      if (e.key === 'F2') { e.preventDefault(); quickRenameFromInspector(); return; }
      const midiN = QWERTY_MIDI_MAP[e.code];
      if (midiN && !e.repeat && window.JD08Midi) {
        JD08Midi.noteOn(midiN, 100);
        return;
      }
      return;
    }
    if (['INPUT','SELECT'].includes(e.target.tagName)) return;
    const midiN = QWERTY_MIDI_MAP[e.code];
    if (midiN && !e.repeat && window.JD08Midi) {
      JD08Midi.noteOn(midiN, 100);
      return;
    }
    const p = state[state.activePane], k = e.key.toLowerCase();
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      openDeepInspector();
      return;
    }
    if (['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.key) && p.visibleIndices.length) {
      e.preventDefault();
      const step = state.viewMode === 'list' ? {ArrowRight:1,ArrowLeft:-1,ArrowDown:1,ArrowUp:-1}[e.key] : {ArrowRight:1,ArrowLeft:-1,ArrowDown:8,ArrowUp:-8}[e.key];
      const cur = p.visibleIndices.indexOf(p.selectedIdx);
      const nextPos = cur === -1 ? 0 : Math.min(p.visibleIndices.length - 1, Math.max(0, cur + step));
      const nextIdx = p.visibleIndices[nextPos];
      if (e.shiftKey && p.lastClickedIdx !== null) {
        const a = Math.max(0, p.visibleIndices.indexOf(p.lastClickedIdx));
        p.selectedList = p.visibleIndices.slice(Math.min(a, nextPos), Math.max(a, nextPos) + 1);
        p.selectedIdx = nextIdx;
      } else {
        p.selectedIdx = nextIdx; p.selectedList = [nextIdx]; p.lastClickedIdx = nextIdx;
      }
      if (window.JD08Midi && !isSceneBank(p.bank)) JD08Midi.selectPreset(nextIdx);
      return refreshAll();
    }
    if (e.ctrlKey || e.metaKey) {
      if (k === 'z') { e.preventDefault(); undo(); }
      if (k === 'y') { e.preventDefault(); redo(); }
      if (k === 'a') { e.preventDefault(); selectAllInBank(state.activePane); }
      if (k === 'c') { e.preventDefault(); copySelectionToClipboard(false); }
      if (k === 'x') { e.preventDefault(); copySelectionToClipboard(true); }
      if (k === 'v') { e.preventDefault(); pasteClipboard(); }
    } else if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'F8') {
      e.preventDefault(); deleteSelectedSlots();
    } else if (e.key === 'F2') {
      e.preventDefault(); quickRenameSelected();
    } else if (e.key === 'F5') {
      e.preventDefault(); transferSelected(state.activePane, state.activePane === 'L' ? 'R' : 'L', false);
    } else if (e.key === 'F6') {
      e.preventDefault(); transferSelected('L', 'R', true);
    }
  });

  window.addEventListener('keyup', e => {
    if (['INPUT','SELECT'].includes(e.target.tagName)) return;
    const midiN = QWERTY_MIDI_MAP[e.code];
    if (midiN && window.JD08Midi) {
      JD08Midi.noteOff(midiN);
    }
  });
}

// ============================================================================
// 10. THEMES, ACCENT COLOR SYSTEM & PRESETS
// ============================================================================
const THEME_PRESETS = {
  elektron: {
    name: 'Elektron Dark',
    amber: '#f5a623',
    cyan: '#00e5c8',
    coral: '#ff5533',
    chassis: '#0f1116',
    deep: '#08090c'
  },
  jd800: {
    name: 'Roland JD-800 Classic',
    amber: '#ff5500',
    cyan: '#00d2be',
    coral: '#ff2a2a',
    chassis: '#14171d',
    deep: '#0a0c10'
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    amber: '#c084fc',
    cyan: '#06b6d4',
    coral: '#f43f5e',
    chassis: '#120d1c',
    deep: '#0a0612'
  },
  matrix: {
    name: 'Phosphor Matrix',
    amber: '#22c55e',
    cyan: '#86efac',
    coral: '#ef4444',
    chassis: '#09120b',
    deep: '#040805'
  },
  nord: {
    name: 'Nord Modular',
    amber: '#ef4444',
    cyan: '#38bdf8',
    coral: '#f59e0b',
    chassis: '#180e10',
    deep: '#0c0708'
  },
  monochrome: {
    name: 'Minimal Monochrome',
    amber: '#e2e8f0',
    cyan: '#38bdf8',
    coral: '#f43f5e',
    chassis: '#13151b',
    deep: '#090a0d'
  }
};

function hexToRgba(hex, alpha) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

function openSettingsModal() {
  const modal = $('settingsOverlay');
  if (!modal) return;
  modal.classList.add('open');
  syncSettingsModalFields();
}

function closeSettingsModal() {
  const modal = $('settingsOverlay');
  if (modal) modal.classList.remove('open');
}

function switchSettingsTab(tab) {
  $('setTab-general').classList.toggle('active', tab === 'general');
  if ($('setTab-midi')) $('setTab-midi').classList.toggle('active', tab === 'midi');
  $('setTab-themes').classList.toggle('active', tab === 'themes');
  $('setPanel-general').classList.toggle('active', tab === 'general');
  if ($('setPanel-midi')) $('setPanel-midi').classList.toggle('active', tab === 'midi');
  $('setPanel-themes').classList.toggle('active', tab === 'themes');
  if (tab === 'midi' && window.JD08Midi) {
    JD08Midi.syncModalDropdowns();
  }
}

function syncSettingsModalFields() {
  syncSettingsModalPickers();
  if ($('settingHideScenes')) $('settingHideScenes').checked = !!appSettings.hideScenes;
  if ($('settingDragMode')) $('settingDragMode').value = appSettings.defaultDragMode;
  if ($('settingDoubleClick')) $('settingDoubleClick').value = appSettings.doubleClickAction;
  if ($('settingSlotFormat')) $('settingSlotFormat').value = appSettings.slotNumberStyle;
  if ($('settingConfirmClear')) $('settingConfirmClear').checked = !!appSettings.confirmClear;
  if ($('settingAutoRelink')) $('settingAutoRelink').checked = !!appSettings.autoRelink;
  if ($('settingUiDensity')) $('settingUiDensity').value = appSettings.uiDensity;
  if (window.JD08Midi) {
    JD08Midi.syncModalDropdowns();
  }
}

function updateSettingHideScenes(val) {
  appSettings.hideScenes = !!val;
  saveAppSettings();
  applyHideScenesSetting();
}

function applyHideScenesSetting() {
  ['L', 'R'].forEach(k => {
    if (appSettings.hideScenes && isSceneBank(state[k].bank)) {
      state[k].bank = 0;
      state[k].selectedIdx = (k === 'L') ? 0 : 64;
      state[k].selectedList = [state[k].selectedIdx];
      state[k].lastClickedIdx = state[k].selectedIdx;
    }
    renderPaneTabs(k);
    renderPane(k);
  });
  const relinkWrap = $('autoRelinkCheckbox')?.closest('.chk-box');
  if (relinkWrap) {
    relinkWrap.style.display = appSettings.hideScenes ? 'none' : 'inline-flex';
  }
  updateInspector();
  setStatus(appSettings.hideScenes ? 'Scene tabs hidden (Patches A-D active).' : 'Scene management tabs enabled.');
}

function updateSettingDragMode(val) {
  appSettings.defaultDragMode = val;
  saveAppSettings();
  setDragMode(val);
  setStatus(`Default drag mode set to: ${val === 'copy' ? 'Copy / Overwrite' : 'Swap'}`);
}

function updateSettingDoubleClick(val) {
  appSettings.doubleClickAction = val;
  saveAppSettings();
}

function updateSettingSlotFormat(val) {
  appSettings.slotNumberStyle = val;
  saveAppSettings();
  renderPane('L');
  renderPane('R');
  updateInspector();
}

function updateSettingConfirmClear(val) {
  appSettings.confirmClear = !!val;
  saveAppSettings();
}

function updateSettingAutoRelink(val) {
  appSettings.autoRelink = !!val;
  saveAppSettings();
  const chk = $('autoRelinkCheckbox');
  if (chk) chk.checked = appSettings.autoRelink;
}

function updateSettingUiDensity(val) {
  appSettings.uiDensity = val;
  saveAppSettings();
  applyUiDensitySetting();
}

function applyUiDensitySetting() {
  document.body.classList.toggle('density-compact', appSettings.uiDensity === 'compact');
}

function resetAllSettingsToDefault() {
  if (!confirm('Reset all preferences, workflow settings, and theme colors to factory defaults?')) return;
  Object.assign(appSettings, defaultSettings);
  saveAppSettings();
  applyHideScenesSetting();
  setDragMode(appSettings.defaultDragMode);
  applyUiDensitySetting();
  resetThemeDefaults();
  syncSettingsModalFields();
  setStatus('Reset all preferences & themes to defaults.');
}

function syncSettingsModalPickers() {
  const cs = getComputedStyle(document.documentElement);
  const amb = cs.getPropertyValue('--el-amber').trim() || '#f5a623';
  const cya = cs.getPropertyValue('--el-cyan').trim() || '#00e5c8';
  const cor = cs.getPropertyValue('--el-coral').trim() || '#ff5533';
  const cha = cs.getPropertyValue('--el-bg-chassis').trim() || '#0f1116';

  if ($('pickerAmber')) $('pickerAmber').value = amb;
  if ($('hexAmber')) $('hexAmber').textContent = amb;
  if ($('pickerCyan')) $('pickerCyan').value = cya;
  if ($('hexCyan')) $('hexCyan').textContent = cya;
  if ($('pickerCoral')) $('pickerCoral').value = cor;
  if ($('hexCoral')) $('hexCoral').textContent = cor;
  if ($('pickerChassis')) $('pickerChassis').value = cha;
  if ($('hexChassis')) $('hexChassis').textContent = cha;
}

function applyThemePreset(key) {
  const preset = THEME_PRESETS[key];
  if (!preset) return;
  applyTheme(preset, true);
  document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
  const card = $(`tc-${key}`);
  if (card) card.classList.add('active');
}

function applyTheme(t, save = true) {
  const root = document.documentElement;
  if (t.amber) {
    root.style.setProperty('--el-amber', t.amber);
    root.style.setProperty('--el-amber-hover', t.amber);
    root.style.setProperty('--el-amber-dim', hexToRgba(t.amber, 0.16));
    root.style.setProperty('--el-amber-glow', hexToRgba(t.amber, 0.4));
  }
  if (t.cyan) {
    root.style.setProperty('--el-cyan', t.cyan);
    root.style.setProperty('--el-cyan-dim', hexToRgba(t.cyan, 0.14));
    root.style.setProperty('--el-cyan-glow', hexToRgba(t.cyan, 0.35));
  }
  if (t.coral) {
    root.style.setProperty('--el-coral', t.coral);
    root.style.setProperty('--el-coral-dim', hexToRgba(t.coral, 0.16));
  }
  if (t.chassis) root.style.setProperty('--el-bg-chassis', t.chassis);
  if (t.deep) root.style.setProperty('--el-bg-deep', t.deep);

  syncSettingsModalPickers();
  if (save) {
    localStorage.setItem('jd08_theme_custom', JSON.stringify({
      amber: t.amber, cyan: t.cyan, coral: t.coral, chassis: t.chassis, deep: t.deep
    }));
  }
}

function updateCustomColor(prop, val) {
  const root = document.documentElement;
  root.style.setProperty(prop, val);
  if (prop === '--el-amber') {
    root.style.setProperty('--el-amber-hover', val);
    root.style.setProperty('--el-amber-dim', hexToRgba(val, 0.16));
    root.style.setProperty('--el-amber-glow', hexToRgba(val, 0.4));
    if ($('hexAmber')) $('hexAmber').textContent = val;
  } else if (prop === '--el-cyan') {
    root.style.setProperty('--el-cyan-dim', hexToRgba(val, 0.14));
    root.style.setProperty('--el-cyan-glow', hexToRgba(val, 0.35));
    if ($('hexCyan')) $('hexCyan').textContent = val;
  } else if (prop === '--el-coral') {
    root.style.setProperty('--el-coral-dim', hexToRgba(val, 0.16));
    if ($('hexCoral')) $('hexCoral').textContent = val;
  } else if (prop === '--el-bg-chassis') {
    if ($('hexChassis')) $('hexChassis').textContent = val;
  }
  document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
  saveCurrentThemeToStorage();
}

function saveCurrentThemeToStorage() {
  const cs = getComputedStyle(document.documentElement);
  const themeObj = {
    amber: cs.getPropertyValue('--el-amber').trim(),
    cyan: cs.getPropertyValue('--el-cyan').trim(),
    coral: cs.getPropertyValue('--el-coral').trim(),
    chassis: cs.getPropertyValue('--el-bg-chassis').trim(),
    deep: cs.getPropertyValue('--el-bg-deep').trim()
  };
  localStorage.setItem('jd08_theme_custom', JSON.stringify(themeObj));
}

function resetThemeDefaults() {
  localStorage.removeItem('jd08_theme_custom');
  applyThemePreset('elektron');
}

function initThemeFromStorage() {
  try {
    const saved = localStorage.getItem('jd08_theme_custom');
    if (saved) {
      applyTheme(JSON.parse(saved), false);
    }
  } catch (e) { console.error('Failed to load theme from storage', e); }
}

// ============================================================================
// 11. BASIC / ADVANCED UI TIERS (CLEANUP ENGINE)
// ============================================================================
function setUiTier(tier) {
  state.uiTier = tier;
  document.body.classList.toggle('tier-basic', tier === 'basic');
  document.body.classList.toggle('tier-advanced', tier === 'advanced');

  if ($('tierBasicBtn')) $('tierBasicBtn').classList.toggle('active', tier === 'basic');
  if ($('tierAdvBtn')) $('tierAdvBtn').classList.toggle('active', tier === 'advanced');

  localStorage.setItem('jd08_ui_tier', tier);
}

function initUiTierFromStorage() {
  const saved = localStorage.getItem('jd08_ui_tier') || 'basic';
  setUiTier(saved);
}

// ============================================================================
// 12. ABLETON-STYLE COLLAPSIBLE DOCK FOOTER
// ============================================================================
function toggleFooterCollapse() {
  const footer = $('footerConsole') || document.querySelector('footer');
  if (!footer) return;
  const isCollapsed = footer.classList.toggle('collapsed');
  state.footerCollapsed = isCollapsed;
  localStorage.setItem('jd08_footer_collapsed', isCollapsed ? 'true' : 'false');
  updateCollapsedFooterBar();
}

function updateCollapsedFooterBar() {
  const bar = $('footerCollapsedBar');
  if (!bar) return;
  const p = state[state.activePane];
  if (!p || !p.data) return;

  if (isSceneBank(p.bank)) {
    const sc = p.data.scenes[p.selectedIdx];
    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px">
        <span style="color:var(--el-cyan);font-weight:800">[${state.activePane}] SCENE ${sc ? sc.name.trim() : 'NONE'}</span>
        <span>TEMPO: <b>${sc ? sc.tempo : 120} BPM</b></span>
        <span>PART A: <b>#${sc ? sc.partAPatch + 1 : 1}</b> | PART B: <b>#${sc ? sc.partBPatch + 1 : 1}</b></span>
      </div>
      <button class="footer-unfold-btn" onclick="event.stopPropagation();toggleFooterCollapse()" title="Expand Preset Overview (Shift+Tab)">
        ▲ Expand Dock [Shift+Tab]
      </button>`;
  } else {
    const pat = p.data.patches[p.selectedIdx];
    const tonesStr = pat ? ['A','B','C','D'].map((l, i) => pat.tones[i].active ? `<b style="color:var(--el-cyan)">${l}</b>` : `<span style="opacity:0.3">-</span>`).join(' ') : '----';
    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px">
        <span style="color:var(--el-amber);font-weight:800">[${state.activePane}] SLOT ${getPatchCode(p.selectedIdx)}: ${pat ? pat.name.trim() : 'EMPTY'}</span>
        <span>TONES: <b>${tonesStr}</b></span>
        <span>CAT: <b class="ctag ${pat?.category||'INIT'}">${pat?.category||'INIT'}</b></span>
      </div>
      <button class="footer-unfold-btn" onclick="event.stopPropagation();toggleFooterCollapse()" title="Expand Preset Overview (Shift+Tab)">
        ▲ Expand Dock [Shift+Tab]
      </button>`;
  }
}

function initFooterCollapseFromStorage() {
  const isCol = localStorage.getItem('jd08_footer_collapsed') === 'true';
  const footer = $('footerConsole') || document.querySelector('footer');
  if (footer && isCol) {
    footer.classList.add('collapsed');
    state.footerCollapsed = true;
  }
  updateCollapsedFooterBar();
}

// ============================================================================
// 13. APP ENTRYPOINT
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  loadAppSettings();
  initThemeFromStorage();
  buildWorkspaceDOM();
  initEventHandlers();
  applyHideScenesSetting();
  setDragMode(appSettings.defaultDragMode || 'swap');
  applyUiDensitySetting();
  if ($('autoRelinkCheckbox')) $('autoRelinkCheckbox').checked = appSettings.autoRelink;
  initBlankSvdInPane('L', true);
  linkRightToLeft();
  setActivePane('L');
  initUiTierFromStorage();
  initFooterCollapseFromStorage();
  if (window.JD08Midi) JD08Midi.init();

  const seenTutorial = localStorage.getItem('jd08_tutorial_seen');
  if (!seenTutorial) {
    setTimeout(() => {
      openTutorialModal(0);
    }, 400);
  }
});
