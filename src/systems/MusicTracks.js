// Pistas musicales sintetizadas. AudioManager las reproduce con un planificador de pasos.
//
// Cada pista define:
//   bpm   - tempo (un paso = semicorchea; 16 pasos por compás)
//   bars  - un objeto por compás: raíz del bajo, notas del acorde y melodía
//   play  - qué sonar en cada paso (usa los ayudantes de AudioManager)
// Melodía: [paso 0-15, nota MIDI, duración en pasos].
//
// Pistas: menu (tranquila), battle (rondas normales), boss (jefe presente), defeat (derrota).

const MUSIC_STEPS_PER_BAR = 16;

function buildLeadMap(bars) {
  return bars.map(function (bar) {
    const steps = new Array(MUSIC_STEPS_PER_BAR).fill(null);
    bar.lead.forEach(function (note) {
      steps[note[0]] = { midi: note[1], len: note[2] };
    });
    return steps;
  });
}

// ---------- Menú principal: tranquila ----------
const MUSIC_MENU_BARS = [
  { root: 48, chord: [60, 64, 67], lead: [[0, 76, 6], [8, 79, 4], [12, 76, 4]] },
  { root: 45, chord: [57, 60, 64], lead: [[0, 76, 4], [4, 72, 4], [8, 74, 8]] },
  { root: 41, chord: [53, 57, 60], lead: [[0, 77, 6], [8, 76, 4], [12, 72, 4]] },
  { root: 43, chord: [55, 59, 62], lead: [[0, 74, 6], [8, 71, 4], [12, 74, 4]] },
  { root: 48, chord: [60, 64, 67], lead: [[0, 79, 6], [8, 76, 4], [12, 72, 4]] },
  { root: 45, chord: [57, 60, 64], lead: [[0, 81, 4], [4, 76, 4], [8, 72, 8]] },
  { root: 41, chord: [53, 57, 60], lead: [[0, 77, 4], [4, 81, 4], [8, 79, 8]] },
  { root: 43, chord: [55, 59, 62], lead: [[0, 79, 6], [8, 74, 4], [12, 71, 4]] }
];
const MUSIC_MENU_LEAD = buildLeadMap(MUSIC_MENU_BARS);
const MUSIC_MENU_ARP = [0, 1, 2, 1, 2, 1, 0, 1];

// ---------- Rondas normales: estilo Vampire Survivors ----------
const MUSIC_BATTLE_BARS = [
  {
    root: 45,
    chord: [57, 60, 64],
    lead: [[0, 76, 2], [3, 72, 1], [4, 74, 2], [6, 72, 2], [8, 69, 4], [12, 72, 2], [14, 74, 2]]
  },
  {
    root: 41,
    chord: [53, 57, 60],
    lead: [[0, 77, 2], [2, 76, 2], [4, 74, 2], [6, 72, 2], [8, 74, 4], [12, 72, 4]]
  },
  {
    root: 48,
    chord: [60, 64, 67],
    lead: [[0, 79, 2], [2, 76, 2], [4, 72, 2], [6, 76, 2], [8, 79, 4], [12, 76, 2], [14, 72, 2]]
  },
  {
    root: 43,
    chord: [59, 62, 67],
    lead: [[0, 74, 2], [2, 71, 2], [4, 67, 2], [6, 71, 2], [8, 74, 6], [14, 76, 2]]
  },
  {
    root: 45,
    chord: [57, 60, 64],
    lead: [[0, 81, 2], [2, 76, 2], [4, 72, 2], [6, 76, 2], [8, 81, 4], [12, 79, 2], [14, 76, 2]]
  },
  {
    root: 41,
    chord: [53, 57, 60],
    lead: [[0, 77, 2], [2, 72, 2], [4, 69, 2], [6, 72, 2], [8, 77, 4], [12, 76, 2], [14, 74, 2]]
  },
  {
    root: 43,
    chord: [59, 62, 67],
    lead: [[0, 74, 2], [2, 79, 2], [4, 74, 2], [6, 71, 2], [8, 74, 4], [12, 71, 2], [14, 67, 2]]
  },
  {
    root: 40,
    chord: [59, 64, 67],
    lead: [[0, 76, 4], [4, 71, 2], [6, 74, 2], [8, 76, 6], [14, 79, 2]]
  }
];
const MUSIC_BATTLE_LEAD = buildLeadMap(MUSIC_BATTLE_BARS);

// ---------- Jefe presente: pesada y frenética ----------
const MUSIC_BOSS_RIFF_A = [[0, 76, 1], [1, 76, 1], [2, 79, 1], [4, 76, 1], [6, 75, 1], [8, 76, 2], [11, 79, 1], [12, 83, 2], [15, 82, 1]];
const MUSIC_BOSS_RIFF_F = [[0, 77, 1], [1, 77, 1], [2, 81, 1], [4, 77, 1], [6, 76, 1], [8, 77, 2], [11, 81, 1], [12, 84, 2], [15, 83, 1]];
const MUSIC_BOSS_BARS = [
  { root: 40, chord: [64, 67, 71], lead: MUSIC_BOSS_RIFF_A },
  { root: 41, chord: [65, 69, 72], lead: MUSIC_BOSS_RIFF_F },
  { root: 40, chord: [64, 67, 71], lead: [[0, 76, 1], [2, 79, 1], [3, 83, 1], [4, 86, 2], [8, 83, 2], [10, 79, 2], [12, 76, 4]] },
  { root: 38, chord: [62, 66, 69], lead: [[0, 74, 1], [1, 74, 1], [2, 78, 1], [4, 74, 1], [6, 73, 1], [8, 74, 2], [11, 78, 1], [12, 81, 2], [15, 80, 1]] },
  { root: 40, chord: [64, 67, 71], lead: MUSIC_BOSS_RIFF_A },
  { root: 41, chord: [65, 69, 72], lead: MUSIC_BOSS_RIFF_F },
  { root: 43, chord: [67, 71, 74], lead: [[0, 79, 1], [1, 79, 1], [2, 83, 1], [4, 79, 1], [6, 78, 1], [8, 79, 2], [11, 83, 1], [12, 86, 2], [15, 85, 1]] },
  { root: 42, chord: [66, 70, 73], lead: [[0, 78, 1], [2, 78, 1], [4, 81, 1], [6, 85, 1], [8, 84, 2], [10, 81, 2], [12, 78, 2], [14, 76, 2]] }
];
const MUSIC_BOSS_LEAD = buildLeadMap(MUSIC_BOSS_BARS);

// ---------- Derrota: lenta y apagada ----------
const MUSIC_DEFEAT_BARS = [
  { root: 45, chord: [57, 60, 64], lead: [[0, 69, 8], [8, 67, 8]] },
  { root: 41, chord: [53, 57, 60], lead: [[0, 65, 8], [8, 64, 8]] },
  { root: 38, chord: [50, 53, 57], lead: [[0, 62, 8], [8, 65, 8]] },
  { root: 40, chord: [52, 56, 59], lead: [[0, 64, 8], [8, 68, 8]] }
];
const MUSIC_DEFEAT_LEAD = buildLeadMap(MUSIC_DEFEAT_BARS);

const MUSIC_TRACKS = {
  menu: {
    bpm: 72,
    bars: MUSIC_MENU_BARS,
    play: function (audio, barIndex, s, time, d) {
      const bar = MUSIC_MENU_BARS[barIndex];
      // Colchón de acordes sostenido todo el compás.
      if (s === 0) {
        bar.chord.forEach(function (note) {
          audio.musicTone(note, time, d * 16, 'sine', 0.03, 1400, 0.5);
        });
        audio.musicTone(bar.root, time, d * 14, 'sine', 0.07, 500, 0.1);
      }
      // Arpegio suave.
      if (s % 2 === 0) {
        const note = bar.chord[MUSIC_MENU_ARP[s / 2]] + 12;
        audio.musicTone(note, time, d * 2.2, 'triangle', 0.03, 2200, 0.01);
      }
      // Melodía escasa.
      const lead = MUSIC_MENU_LEAD[barIndex][s];
      if (lead) {
        audio.musicTone(lead.midi, time, d * lead.len, 'sine', 0.045, 2400, 0.04);
      }
    }
  },

  battle: {
    bpm: 124,
    bars: MUSIC_BATTLE_BARS,
    play: function (audio, barIndex, s, time, d) {
      const bar = MUSIC_BATTLE_BARS[barIndex];
      // Bajo: corcheas con salto de octava al final del medio compás.
      if (s % 2 === 0) {
        const octave = s % 8 === 6 ? 12 : 0;
        audio.musicTone(bar.root + octave, time, d * 1.7, 'triangle', 0.1, 0, 0.008);
      }
      // Arpegio.
      audio.musicTone(bar.chord[[0, 1, 2, 1][s % 4]], time, d * 0.9, 'square', 0.022, 1800, 0.008);
      // Melodía.
      const lead = MUSIC_BATTLE_LEAD[barIndex][s];
      if (lead) {
        audio.musicTone(lead.midi, time, d * lead.len * 0.95, 'square', 0.035, 2600, 0.008);
      }
      // Percusión.
      if (s % 4 === 0) {
        audio.musicKick(time, 0.14, 150, 45);
      }
      if (s % 4 === 2) {
        audio.musicNoise(time, 0.05, 6500, 'highpass', 0.03);
      }
      if (s === 4 || s === 12) {
        audio.musicNoise(time, 0.13, 1800, 'bandpass', 0.05);
      }
    }
  },

  boss: {
    bpm: 150,
    bars: MUSIC_BOSS_BARS,
    play: function (audio, barIndex, s, time, d) {
      const bar = MUSIC_BOSS_BARS[barIndex];
      // Bajo sierra en semicorcheas, con acentos.
      const bassNote = bar.root + (s % 8 === 7 ? 12 : s === 10 ? 7 : 0);
      audio.musicTone(bassNote, time, d * 0.9, 'sawtooth', s % 4 === 0 ? 0.085 : 0.06, 520, 0.004);
      // Acordes de potencia sincopados.
      if (s === 0 || s === 3 || s === 6 || s === 10 || s === 12) {
        audio.musicTone(bar.root + 12, time, d * 1.6, 'sawtooth', 0.032, 1800, 0.004);
        audio.musicTone(bar.root + 19, time, d * 1.6, 'sawtooth', 0.026, 1800, 0.004);
      }
      // Arpegio agudo y veloz.
      audio.musicTone(bar.chord[[0, 1, 2, 1][s % 4]] + 12, time, d * 0.7, 'square', 0.016, 3000, 0.004);
      // Riff principal.
      const lead = MUSIC_BOSS_LEAD[barIndex][s];
      if (lead) {
        audio.musicTone(lead.midi, time, d * lead.len * 0.9, 'sawtooth', 0.036, 3200, 0.004);
      }
      // Percusión: bombo doble, caja y hi-hat constante.
      if (s % 4 === 0) {
        audio.musicKick(time, 0.17, 160, 42);
      }
      if (s === 6 || s === 14) {
        audio.musicKick(time, 0.11, 140, 42);
      }
      if (s === 4 || s === 12) {
        audio.musicNoise(time, 0.12, 2000, 'bandpass', 0.075);
      }
      audio.musicNoise(time, 0.03, 7500, 'highpass', s % 2 === 1 ? 0.03 : 0.018);
      if (s === 0 && barIndex % 4 === 0) {
        audio.musicNoise(time, 0.5, 3500, 'highpass', 0.05);
      }
    }
  },

  defeat: {
    bpm: 54,
    bars: MUSIC_DEFEAT_BARS,
    play: function (audio, barIndex, s, time, d) {
      const bar = MUSIC_DEFEAT_BARS[barIndex];
      if (s === 0) {
        bar.chord.forEach(function (note) {
          audio.musicTone(note, time, d * 16, 'triangle', 0.035, 700, 0.6);
        });
        audio.musicTone(bar.root, time, d * 14, 'sine', 0.08, 400, 0.15);
        // Latido sordo.
        audio.musicKick(time, 0.07, 90, 38);
        audio.musicKick(time + d * 2, 0.05, 80, 38);
      }
      const lead = MUSIC_DEFEAT_LEAD[barIndex][s];
      if (lead) {
        audio.musicTone(lead.midi, time, d * lead.len, 'sine', 0.05, 900, 0.12);
      }
    }
  }
};
