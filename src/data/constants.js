// Espacio de diseño de la interfaz (menús, HUD, tienda): se maneja en 1280x720.
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

// Resolución real del canvas. Las cámaras aplican DISPLAY_SCALE (1.5x) para que el
// diseño de 1280x720 llene los 1920x1080 (ver src/systems/Display.js).
const RENDER_WIDTH = 1920;
const RENDER_HEIGHT = 1080;
const DISPLAY_SCALE = RENDER_WIDTH / GAME_WIDTH;
const HUD_OFFSET_X = (RENDER_WIDTH - GAME_WIDTH) / 2;
const HUD_OFFSET_Y = (RENDER_HEIGHT - GAME_HEIGHT) / 2;

const FONT_FAMILY = "'Lilita One', Arial, sans-serif";

const ARENA_WIDTH = 3200;
const ARENA_HEIGHT = 2400;

const TOTAL_WAVES = 9;

const PLAYER_DEF = {
  hp: 30,
  speed: 300,
  radius: 18,
  maxWeapons: 4,
  texture: 'player_sprite',
  spriteHeight: 52
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

// Vibración de pantalla (duración en ms, intensidad como fracción del tamaño de cámara).
const SHAKE = {
  hit: { duration: 45, intensity: 0.0014 },
  hurt: { duration: 110, intensity: 0.006 },
  explosion: { duration: 110, intensity: 0.005 },
  bossDown: { duration: 220, intensity: 0.01 }
};

// Secuencia de muerte: tiempos en segundos reales, cámara lenta y zoom final.
const DEATH = {
  duration: 2.4,
  rampTime: 0.35,
  minTimeScale: 0.18,
  zoomMultiplier: 1.75
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
