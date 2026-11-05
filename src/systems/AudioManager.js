// Música: loop de 8 compases en La menor (124 BPM), sintetizado con WebAudio.
// Cada compás define la raíz del bajo, las notas del arpegio y la melodía.
// Melodía: [paso 0-15, nota MIDI, duración en pasos].
const MUSIC_BPM = 124;
const MUSIC_VOLUME = 0.6;
const MUSIC_BARS = [
  {
    root: 45,
    arp: [57, 60, 64],
    lead: [[0, 76, 2], [3, 72, 1], [4, 74, 2], [6, 72, 2], [8, 69, 4], [12, 72, 2], [14, 74, 2]]
  },
  {
    root: 41,
    arp: [53, 57, 60],
    lead: [[0, 77, 2], [2, 76, 2], [4, 74, 2], [6, 72, 2], [8, 74, 4], [12, 72, 4]]
  },
  {
    root: 48,
    arp: [60, 64, 67],
    lead: [[0, 79, 2], [2, 76, 2], [4, 72, 2], [6, 76, 2], [8, 79, 4], [12, 76, 2], [14, 72, 2]]
  },
  {
    root: 43,
    arp: [59, 62, 67],
    lead: [[0, 74, 2], [2, 71, 2], [4, 67, 2], [6, 71, 2], [8, 74, 6], [14, 76, 2]]
  },
  {
    root: 45,
    arp: [57, 60, 64],
    lead: [[0, 81, 2], [2, 76, 2], [4, 72, 2], [6, 76, 2], [8, 81, 4], [12, 79, 2], [14, 76, 2]]
  },
  {
    root: 41,
    arp: [53, 57, 60],
    lead: [[0, 77, 2], [2, 72, 2], [4, 69, 2], [6, 72, 2], [8, 77, 4], [12, 76, 2], [14, 74, 2]]
  },
  {
    root: 43,
    arp: [59, 62, 67],
    lead: [[0, 74, 2], [2, 79, 2], [4, 74, 2], [6, 71, 2], [8, 74, 4], [12, 71, 2], [14, 67, 2]]
  },
  {
    root: 40,
    arp: [59, 64, 67],
    lead: [[0, 76, 4], [4, 71, 2], [6, 74, 2], [8, 76, 6], [14, 79, 2]]
  }
];
const MUSIC_STEPS_PER_BAR = 16;
const MUSIC_LEAD_MAP = MUSIC_BARS.map(function (bar) {
  const steps = new Array(MUSIC_STEPS_PER_BAR).fill(null);
  bar.lead.forEach(function (note) {
    steps[note[0]] = { midi: note[1], len: note[2] };
  });
  return steps;
});

const AudioManager = {
  ctx: null,
  enabled: true,

  music: {
    playing: false,
    schedulerId: null,
    stopId: null,
    master: null,
    noise: null,
    nextTime: 0,
    step: 0,
    tempo: 1,
    level: 1,
    duck: 1,
    tc: 0.3
  },

  init: function () {
    if (this.ctx) {
      return;
    }
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor) {
      try {
        this.ctx = new Ctor();
      } catch (e) {
        this.ctx = null;
      }
    }
  },

  beep: function (freq, duration, type, volume) {
    if (!this.enabled) {
      return;
    }
    this.init();
    if (!this.ctx) {
      return;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  shoot: function () {
    this.beep(440, 0.05, 'square', 0.025);
  },
  hit: function () {
    this.beep(220, 0.04, 'triangle', 0.025);
  },
  hurt: function () {
    this.beep(120, 0.15, 'sawtooth', 0.05);
  },
  boss: function () {
    this.beep(80, 0.5, 'sawtooth', 0.07);
  },
  buy: function () {
    this.beep(660, 0.1, 'sine', 0.05);
  },
  waveEnd: function () {
    this.beep(520, 0.2, 'sine', 0.05);
  },
  gameOver: function () {
    this.beep(150, 0.6, 'sawtooth', 0.07);
  },

  // ---- Música ----

  startMusic: function () {
    this.init();
    if (!this.ctx) {
      return;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const m = this.music;
    this.ensureMusicNodes();
    if (m.stopId) {
      clearTimeout(m.stopId);
      m.stopId = null;
    }
    m.level = 1;
    m.tempo = 1;
    m.tc = 0.4;
    if (m.playing) {
      return;
    }
    m.playing = true;
    m.step = 0;
    m.nextTime = this.ctx.currentTime + 0.1;
    m.schedulerId = setInterval(() => this.musicTick(), 90);
  },

  // Baja el volumen hasta silencio en `seconds` y detiene el loop.
  fadeMusic: function (seconds) {
    const m = this.music;
    if (!m.playing) {
      return;
    }
    m.level = 0;
    m.tc = Math.max(0.02, seconds / 3);
    if (m.stopId) {
      clearTimeout(m.stopId);
    }
    m.stopId = setTimeout(() => this.stopMusicNow(), seconds * 1000 + 250);
  },

  // Velocidad relativa del loop (1 = normal, <1 = más lento).
  setMusicTempo: function (scale) {
    this.music.tempo = Math.max(0.2, scale);
  },

  // Atenúa la música (por ejemplo, durante la pausa).
  duckMusic: function (on) {
    const m = this.music;
    m.duck = on ? 0.35 : 1;
    m.tc = 0.15;
  },

  stopMusicNow: function () {
    const m = this.music;
    if (m.schedulerId) {
      clearInterval(m.schedulerId);
    }
    m.schedulerId = null;
    m.stopId = null;
    m.playing = false;
    if (m.master && this.ctx) {
      m.master.gain.cancelScheduledValues(this.ctx.currentTime);
      m.master.gain.value = 0;
    }
  },

  ensureMusicNodes: function () {
    const m = this.music;
    if (!m.master) {
      m.master = this.ctx.createGain();
      m.master.gain.value = 0;
      m.master.connect(this.ctx.destination);
    }
    if (!m.noise) {
      const length = Math.floor(this.ctx.sampleRate * 0.25);
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      m.noise = buffer;
    }
  },

  applyMusicVolume: function () {
    const m = this.music;
    const target = this.enabled ? MUSIC_VOLUME * m.level * m.duck : 0;
    m.master.gain.setTargetAtTime(target, this.ctx.currentTime, m.tc);
  },

  musicTick: function () {
    const m = this.music;
    if (!m.playing || !this.ctx || !m.master) {
      return;
    }
    this.applyMusicVolume();
    if (!this.enabled) {
      m.nextTime = this.ctx.currentTime + 0.1;
      return;
    }
    const horizon = this.ctx.currentTime + 0.3;
    const stepDuration = 60 / MUSIC_BPM / 4 / m.tempo;
    while (m.nextTime < horizon) {
      this.scheduleMusicStep(m.step, m.nextTime, stepDuration);
      m.nextTime += stepDuration;
      m.step = (m.step + 1) % (MUSIC_BARS.length * MUSIC_STEPS_PER_BAR);
    }
  },

  scheduleMusicStep: function (step, time, stepDuration) {
    const barIndex = Math.floor(step / MUSIC_STEPS_PER_BAR);
    const s = step % MUSIC_STEPS_PER_BAR;
    const bar = MUSIC_BARS[barIndex];

    // Bajo: corcheas con salto de octava al final del medio compás.
    if (s % 2 === 0) {
      const octave = s % 8 === 6 ? 12 : 0;
      this.musicTone(bar.root + octave, time, stepDuration * 1.7, 'triangle', 0.1, 0);
    }

    // Arpegio.
    const arpNote = bar.arp[[0, 1, 2, 1][s % 4]];
    this.musicTone(arpNote, time, stepDuration * 0.9, 'square', 0.022, 1800);

    // Melodía.
    const lead = MUSIC_LEAD_MAP[barIndex][s];
    if (lead) {
      this.musicTone(lead.midi, time, stepDuration * lead.len * 0.95, 'square', 0.035, 2600);
    }

    // Percusión.
    if (s % 4 === 0) {
      this.musicKick(time);
    }
    if (s % 4 === 2) {
      this.musicNoise(time, 0.05, 6500, 'highpass', 0.03);
    }
    if (s === 4 || s === 12) {
      this.musicNoise(time, 0.13, 1800, 'bandpass', 0.05);
    }
  },

  midiToFreq: function (note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  },

  musicTone: function (note, start, duration, type, volume, lowpass) {
    const m = this.music;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = this.midiToFreq(note);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    if (lowpass) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = lowpass;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(m.master);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  },

  musicKick: function (start) {
    const m = this.music;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, start);
    osc.frequency.exponentialRampToValueAtTime(45, start + 0.12);
    gain.gain.setValueAtTime(0.14, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
    osc.connect(gain);
    gain.connect(m.master);
    osc.start(start);
    osc.stop(start + 0.18);
  },

  musicNoise: function (start, duration, frequency, filterType, volume) {
    const m = this.music;
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    source.buffer = m.noise;
    filter.type = filterType;
    filter.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(m.master);
    source.start(start);
    source.stop(start + duration + 0.02);
  }
};
