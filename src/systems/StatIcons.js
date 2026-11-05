// Íconos geométricos (24x24 aprox., centrados en el origen) para las estadísticas de la
// pantalla de derrota. Se dibujan con Graphics, en línea con el arte de figuras geométricas.
const STAT_ICON_COLORS = {
  kills: 0xe8f0ff,
  bosses: 0xffd166,
  coins: 0xffd166,
  weapon: 0xbfd0ff,
  health: 0xeb3b5a,
  speed: 0xf6e58d,
  damage: 0xf0932b,
  fireRate: 0x4bcffa,
  area: 0x9be15d,
  pierce: 0xa29bfe
};

const STAT_ICON_PAINTERS = {
  // Calavera: enemigos derrotados.
  kills: function (g, color) {
    g.fillStyle(color, 1);
    g.fillCircle(0, -2, 9);
    g.fillRect(-5, 4, 10, 7);
    g.fillStyle(0x0b1026, 1);
    g.fillCircle(-4, -2, 2.6);
    g.fillCircle(4, -2, 2.6);
    g.fillTriangle(0, 1, -1.8, 4, 1.8, 4);
    g.fillRect(-2.5, 7, 1, 4);
    g.fillRect(1.5, 7, 1, 4);
  },

  // Corona: jefes derrotados.
  bosses: function (g, color) {
    g.fillStyle(color, 1);
    g.fillRect(-10, 4, 20, 7);
    g.fillTriangle(-10, 4, -7, -9, -2, 4);
    g.fillTriangle(-5, 4, 0, -11, 5, 4);
    g.fillTriangle(2, 4, 7, -9, 10, 4);
    g.fillStyle(0xeb3b5a, 1);
    g.fillCircle(0, 7.5, 1.6);
  },

  // Moneda: monedas conseguidas.
  coins: function (g, color) {
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, 11);
    g.lineStyle(2, 0xb7791f, 1);
    g.strokeCircle(0, 0, 7);
    g.fillStyle(0xb7791f, 1);
    g.fillRect(-1, -4, 2, 8);
  },

  // Espada: arma con mayor daño.
  weapon: function (g, color) {
    g.lineStyle(4, color, 1);
    g.lineBetween(-2, 2, 10, -10);
    g.lineStyle(3, 0x93a4c8, 1);
    g.lineBetween(-6, -2, 2, 6);
    g.lineStyle(4, 0xb7791f, 1);
    g.lineBetween(-2, 2, -9, 9);
    g.fillStyle(0xffd166, 1);
    g.fillCircle(-10, 10, 2);
  },

  // Corazón: vida máxima.
  health: function (g, color) {
    g.fillStyle(color, 1);
    g.fillCircle(-5, -4, 6);
    g.fillCircle(5, -4, 6);
    g.fillTriangle(-10.6, -1, 10.6, -1, 0, 11);
  },

  // Rayo: velocidad alcanzada.
  speed: function (g, color) {
    g.fillStyle(color, 1);
    g.fillTriangle(4, -12, -6, 1, -1, 1);
    g.fillTriangle(4, -12, -1, 1, 1, -2);
    g.fillTriangle(-1, 1, -4, 12, 7, -2);
    g.fillTriangle(-1, 1, 7, -2, 1, -2);
  },

  // Estallido: daño aumentado.
  damage: function (g, color) {
    g.lineStyle(3, color, 1);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      g.lineBetween(
        Math.cos(angle) * 5,
        Math.sin(angle) * 5,
        Math.cos(angle) * 12,
        Math.sin(angle) * 12
      );
    }
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, 4);
  },

  // Doble flecha: cadencia de disparo.
  fireRate: function (g, color) {
    g.lineStyle(3, color, 1);
    g.lineBetween(-10, -8, -3, 0);
    g.lineBetween(-3, 0, -10, 8);
    g.lineBetween(1, -8, 8, 0);
    g.lineBetween(8, 0, 1, 8);
  },

  // Diana: tamaño de área.
  area: function (g, color) {
    g.lineStyle(2, color, 1);
    g.strokeCircle(0, 0, 11);
    g.strokeCircle(0, 0, 6);
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, 2.2);
  },

  // Flecha que atraviesa un aro: perforación.
  pierce: function (g, color) {
    g.lineStyle(2, color, 1);
    g.strokeCircle(2, 0, 8);
    g.lineStyle(3, 0xe8f0ff, 1);
    g.lineBetween(-12, 0, 8, 0);
    g.fillStyle(0xe8f0ff, 1);
    g.fillTriangle(12, 0, 6, -5, 6, 5);
  }
};

// Crea un ícono en (x, y) y devuelve el objeto Graphics.
function createStatIcon(scene, kind, x, y) {
  const g = scene.add.graphics({ x: x, y: y });
  const paint = STAT_ICON_PAINTERS[kind];
  if (paint) {
    paint(g, STAT_ICON_COLORS[kind]);
  }
  return g;
}
