const BOSS_WAVES = [3, 6, 9];

const WAVE_COMPOSITION = {
  1: { simple: 1 },
  2: { simple: 1 },
  3: { simple: 0.9, hunter: 0.1 },
  4: { simple: 0.7, hunter: 0.3 },
  5: { hunter: 1 },
  6: { simple: 0.4, hunter: 0.4, compound: 0.2 },
  7: { simple: 0.3, hunter: 0.3, compound: 0.4 },
  8: { hunter: 0.3, compound: 0.7 },
  9: { simple: 0.7, compound: 0.3 }
};

function isBossWave(wave) {
  return BOSS_WAVES.indexOf(wave) !== -1;
}

function waveDuration(wave) {
  return 20 + 4 * (wave - 1);
}

function waveEnemyCount(wave) {
  if (wave > TOTAL_WAVES) {
    return 42 + 8 * (wave - TOTAL_WAVES);
  }
  return Math.round(12 + (30 * (wave - 1)) / 8);
}

function waveComposition(wave) {
  if (wave <= TOTAL_WAVES) {
    return WAVE_COMPOSITION[wave];
  }
  return WAVE_COMPOSITION[8];
}

function buildSpawnQueue(wave) {
  const composition = waveComposition(wave);
  const total = waveEnemyCount(wave);
  const queue = [];
  const keys = Object.keys(composition);
  keys.forEach(function (key) {
    const amount = Math.floor(composition[key] * total);
    for (let i = 0; i < amount; i++) {
      queue.push(key);
    }
  });
  while (queue.length < total) {
    queue.push(keys[queue.length % keys.length]);
  }
  Phaser.Utils.Array.Shuffle(queue);
  return queue;
}
