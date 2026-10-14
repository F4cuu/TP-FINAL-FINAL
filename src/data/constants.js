const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const ARENA_WIDTH = 3200;
const ARENA_HEIGHT = 2400;

const TOTAL_WAVES = 9;

const PLAYER_DEF = {
  hp: 100,
  speed: 300,
  radius: 18,
  maxWeapons: 4
};

const SPAWN_TELEGRAPH = 0.55;
const SPAWN_NEAR_MIN = 170;
const SPAWN_NEAR_MAX = 380;
const SPAWN_BOSS_MIN = 260;
const SPAWN_BOSS_MAX = 440;

const COLORS = {
  bg: 0x0b1026,
  arena: 0x131d40,
  arenaAlt: 0x17224c,
  grid: 0x23336b,
  player: 0x39d353,
  text: '#e8f0ff',
  textDim: '#93a4c8'
};

const DEPTH = {
  arena: 0,
  trail: 2,
  enemy: 5,
  projectile: 8,
  player: 10,
  effect: 12,
  damageText: 15,
  hud: 100,
  overlay: 200
};
