// Audio sintetizado con WebAudio.
//   enabled      -> efectos de sonido (disparos, impactos, tienda...)
//   musicEnabled -> música de fondo (pistas definidas en MusicTracks.js)
const MUSIC_VOLUME = 0.6;

const AudioManager = {
  ctx: null,
  enabled: true,
  musicEnabled: true,

  music: {
    track: 'battle',
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

  beep: function (freq, duration, type, volume, delay) {
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
    const start = this.ctx.currentTime + (delay || 0);
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.04, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
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

  // ---- Interfaz (menús, tienda, pausa) ----

  // Mover la selección (flechas o pasar el mouse).
  uiMove: function () {
    this.beep(520, 0.035, 'triangle', 0.03);
  },
  // Confirmar una opción: dos notas ascendentes.
  uiSelect: function () {
    this.init();
    this.beep(660, 0.06, 'sine', 0.05);
    this.beep(990, 0.09, 'sine', 0.045, 0.05);
  },
  // Volver atrás: dos notas descendentes.
  uiBack: function () {
    this.beep(500, 0.06, 'sine', 0.045);
    this.beep(330, 0.09, 'sine', 0.04, 0.05);
  },
  // Activar / desactivar una opción.
  uiToggle: function (on) {
    this.init();
    this.beep(on ? 600 : 420, 0.05, 'sine', 0.05);
    this.beep(on ? 900 : 300, 0.08, 'sine', 0.045, 0.05);
  },
  // Acción no permitida (sin monedas, etc.).
  uiDeny: function () {
    this.beep(180, 0.1, 'sawtooth', 0.05);
  },
  // Transición entre pantallas: burbujas que suben al taparse y estallan al abrirse.
  transitionOut: function () {
    for (let i = 0; i < 5; i++) {
      this.beep(280 + i * 140, 0.07, 'sine', 0.04, i * 0.05);
    }
  },
  transitionIn: function () {
    for (let i = 0; i < 4; i++) {
      this.beep(960 - i * 150, 0.05, 'sine', 0.035, i * 0.045);
    }
  },

  // ---- Música ----

  // Reproduce una pista ('menu', 'battle', 'boss', 'shop', 'defeat'). Si ya suena, no la reinicia.
  playMusic: function (name) {
    if (!MUSIC_TRACKS[name]) {
      return;
    }
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
    m.tc = 0.3;

    const changed = m.track !== name;
    if (m.playing && !changed) {
      return;
    }
    m.track = name;
    m.step = 0;
    if (!m.playing) {
      m.playing = true;
      m.nextTime = this.ctx.currentTime + 0.1;
      m.schedulerId = setInterval(() => this.musicTick(), 90);
    } else {
      // Cambio de pista: corte breve y entrada con fundido.
      const now = this.ctx.currentTime;
      m.master.gain.cancelScheduledValues(now);
      m.master.gain.setValueAtTime(0, now);
    }
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
      const length = Math.floor(this.ctx.sampleRate * 0.5);
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
    const target = this.musicEnabled ? MUSIC_VOLUME * m.level * m.duck : 0;
    m.master.gain.setTargetAtTime(target, this.ctx.currentTime, m.tc);
  },

  musicTick: function () {
    const m = this.music;
    if (!m.playing || !this.ctx || !m.master) {
      return;
    }
    this.applyMusicVolume();
    if (!this.musicEnabled) {
      m.nextTime = this.ctx.currentTime + 0.1;
      return;
    }
    const track = MUSIC_TRACKS[m.track];
    const totalSteps = track.bars.length * MUSIC_STEPS_PER_BAR;
    const stepDuration = 60 / track.bpm / 4 / m.tempo;
    const horizon = this.ctx.currentTime + 0.3;
    while (m.nextTime < horizon) {
      const barIndex = Math.floor(m.step / MUSIC_STEPS_PER_BAR);
      track.play(this, barIndex, m.step % MUSIC_STEPS_PER_BAR, m.nextTime, stepDuration);
      m.nextTime += stepDuration;
      m.step = (m.step + 1) % totalSteps;
    }
  },

  midiToFreq: function (note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  },

  // Nota con envolvente: ataque corto y caída exponencial. `lowpass` en Hz (0 = sin filtro).
  musicTone: function (note, start, duration, type, volume, lowpass, attack) {
    const m = this.music;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const rise = Math.min(attack || 0.008, duration * 0.9);
    osc.type = type;
    osc.frequency.value = this.midiToFreq(note);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + rise);
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

  musicKick: function (start, volume, fromFreq, toFreq) {
    const m = this.music;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(fromFreq, start);
    osc.frequency.exponentialRampToValueAtTime(toFreq, start + 0.12);
    gain.gain.setValueAtTime(volume, start);
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
