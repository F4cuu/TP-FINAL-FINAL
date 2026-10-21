const AudioManager = {
  ctx: null,
  enabled: true,

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
  }
};
