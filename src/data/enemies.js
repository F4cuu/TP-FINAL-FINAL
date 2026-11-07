const ENEMY_HP_GROWTH = 0.2;
const BOSS_HP_BY_WAVE = { 3: 1125, 6: 2250, 9: 3750 };
const BOSS_HP_MULTIPLIER = 1.1;

function enemyHpMultiplier(wave) {
  return Math.pow(1 + ENEMY_HP_GROWTH, Math.max(0, wave - 1));
}

function enemyMaxHp(def, wave) {
  if (def.key === 'boss') {
    return Math.round((BOSS_HP_BY_WAVE[wave] || def.hp) * BOSS_HP_MULTIPLIER);
  }
  return Math.round(def.hp * enemyHpMultiplier(wave));
}

const ENEMY_DEFS = {
  simple: {
    key: 'simple',
    name: 'Simple',
    texture: 'enemy_simple_sprite',
    hp: 20,
    damage: 10,
    speed: 250,
    radius: 16,
    spriteHeight: 32,
    color: 0x4bcffa,
    coins: [3, 10]
  },
  hunter: {
    key: 'hunter',
    name: 'Cazador',
    texture: 'enemy_hunter_sprite',
    hp: 38,
    damage: 6,
    speed: 360,
    radius: 15,
    spriteHeight: 32,
    color: 0xf6e58d,
    coins: [7, 15]
  },
  compound: {
    key: 'compound',
    name: 'Compuesto',
    texture: 'enemy_compound_sprite',
    hp: 90,
    damage: 15,
    speed: 305,
    radius: 22,
    spriteHeight: 40,
    color: 0x7f8fa6,
    coins: [15, 30]
  },
  boss: {
    key: 'boss',
    name: 'Jefe',
    namesByWave: { 3: 'Jabonoso Alvo', 6: 'Clororín Bravo', 9: 'Antisepticus Liquidus' },
    texture: 'enemy_boss',
    texturesByWave: { 3: 'enemy_boss_1', 6: 'enemy_boss_2', 9: 'enemy_boss_3' },
    hp: 1125,
    damage: 60,
    speed: 190,
    radius: 60,
    spriteWidth: 120,
    spriteHeight: 96,
    color: 0xe1b12c,
    coins: [50, 100]
  }
};

// Nombre propio del jefe de la oleada (o el nombre genérico del enemigo).
function bossNameForWave(def, wave) {
  return (def.namesByWave && def.namesByWave[wave]) || def.name;
}

// Poderes especiales de los jefes. Cada jefe (oleada 3, 6, 9) usa uno; en el modo infinito se repiten en ciclo.
// Tiempos en segundos, distancias en píxeles del mundo.
const BOSS_POWER_ORDER = ['ram', 'bleach', 'rain'];
const BOSS_POWERS = {
  // Jabonoso Alvo: embiste en línea recta, atraviesa y rebota en las paredes mientras la cámara muestra todo el mapa.
  ram: {
    name: 'Embestida',
    cooldown: 10,
    windTime: 1.2,
    speed: 1100,
    bounces: 5,
    maxTime: 9,
    tint: 0xff6b6b
  },
  // Clororín Bravo: anillo de limpieza que se expande desde él; tiene huecos seguros por los que se puede pasar.
  bleach: {
    name: 'Blanqueamiento total',
    cooldown: 7,
    windTime: 1.2,
    radius: 760,
    ringSpeed: 340,
    ringThickness: 70,
    damage: 20,
    gaps: 3,
    gapWidth: 0.7,
    tint: 0xffffff
  },
  // Antisepticus Liquidus: se eleva y llueve gotas marcadas en el suelo que dejan charcos dañinos.
  rain: {
    name: 'Lluvia antiséptica',
    cooldown: 12,
    windTime: 0.9,
    duration: 3.6,
    dropInterval: 0.22,
    markTime: 0.9,
    puddleRadius: 75,
    puddleLife: 6,
    tickDamage: 5,
    tickInterval: 0.6,
    tint: 0x8fe3ff
  }
};

// Poder del jefe según la oleada.
function bossPowerForWave(wave) {
  const index = (((Math.round((wave || 3) / 3) - 1) % 3) + 3) % 3;
  return BOSS_POWER_ORDER[index];
}
