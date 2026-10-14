const ENEMY_DEFS = {
  simple: {
    key: 'simple',
    name: 'Simple',
    texture: 'enemy_simple',
    hp: 20,
    damage: 10,
    speed: 95,
    radius: 16,
    color: 0x4bcffa,
    coins: [3, 10]
  },
  hunter: {
    key: 'hunter',
    name: 'Cazador',
    texture: 'enemy_hunter',
    hp: 10,
    damage: 6,
    speed: 175,
    radius: 15,
    color: 0xf6e58d,
    coins: [7, 15]
  },
  compound: {
    key: 'compound',
    name: 'Compuesto',
    texture: 'enemy_compound',
    hp: 60,
    damage: 15,
    speed: 62,
    radius: 22,
    color: 0x7f8fa6,
    coins: [15, 30]
  },
  boss: {
    key: 'boss',
    name: 'Jefe',
    texture: 'enemy_boss',
    hp: 500,
    damage: 60,
    speed: 34,
    radius: 60,
    color: 0xe1b12c,
    coins: [50, 100]
  }
};
