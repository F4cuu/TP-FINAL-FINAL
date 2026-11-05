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
    texture: 'enemy_boss',
    texturesByWave: { 3: 'enemy_boss_1', 6: 'enemy_boss_2', 9: 'enemy_boss_3' },
    hp: 1125,
    damage: 60,
    speed: 300,
    radius: 60,
    spriteWidth: 120,
    spriteHeight: 96,
    color: 0xe1b12c,
    coins: [50, 100]
  }
};
