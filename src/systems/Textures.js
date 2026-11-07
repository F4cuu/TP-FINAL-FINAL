function createTextures(scene) {
  const g = scene.make.graphics({ add: false });

  g.clear();
  g.fillStyle(0x39d353, 1);
  g.fillRoundedRect(0, 0, 36, 52, 18);
  g.fillStyle(0x2fae45, 1);
  g.fillEllipse(18, 14, 24, 9);
  g.generateTexture('player', 36, 52);

  g.clear();
  g.fillStyle(0x4bcffa, 1);
  g.fillCircle(16, 16, 16);
  g.fillStyle(0x9fe8ff, 1);
  g.fillCircle(11, 11, 4);
  g.generateTexture('enemy_simple', 32, 32);

  g.clear();
  g.fillStyle(0xf6e58d, 1);
  g.fillCircle(16, 16, 15);
  g.fillStyle(0xfce38a, 1);
  g.fillCircle(11, 11, 4);
  g.fillCircle(21, 13, 3);
  g.fillCircle(16, 22, 4);
  g.fillCircle(10, 21, 3);
  g.generateTexture('enemy_hunter', 32, 32);

  g.clear();
  g.fillStyle(0x7f8fa6, 1);
  g.fillRoundedRect(0, 0, 48, 40, 6);
  g.fillStyle(0x9aa7bd, 1);
  g.fillRoundedRect(6, 6, 36, 12, 4);
  g.generateTexture('enemy_compound', 48, 40);

  g.clear();
  g.fillStyle(0xe1b12c, 1);
  g.fillRoundedRect(0, 0, 120, 96, 28);
  g.fillStyle(0xf7d76a, 1);
  g.fillRoundedRect(18, 16, 84, 28, 14);
  g.generateTexture('enemy_boss', 120, 96);

  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(6, 6, 6);
  g.generateTexture('projectile', 12, 12);

  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture('particle', 8, 8);

  createHandTextures(g);

  // Burbuja de jabón para las transiciones entre pantallas.
  g.clear();
  g.fillStyle(0x8fe3ff, 0.3);
  g.fillCircle(64, 64, 60);
  g.lineStyle(4, 0xd6f7ff, 0.95);
  g.strokeCircle(64, 64, 60);
  g.fillStyle(0xffffff, 0.85);
  g.fillCircle(42, 40, 11);
  g.fillCircle(56, 31, 4);
  g.generateTexture('bubble', 128, 128);

  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillRect(16, 4, 12, 40);
  g.fillRect(4, 16, 40, 12);
  g.generateTexture('spawn_cross', 48, 48);

  g.clear();
  g.fillStyle(COLORS.arena, 1);
  g.fillRect(0, 0, 64, 64);
  g.lineStyle(1, COLORS.grid, 0.5);
  g.strokeRect(0.5, 0.5, 64, 64);
  g.generateTexture('tile', 64, 64);

  g.destroy();
}

// ---- Manos de Pablito y armas que sostiene (pixel art, contorno negro) ----
// Cada pixel del dibujo ocupa 2x2 pixeles de textura. Todas las armas miran hacia la derecha
// (muzzle = +x) y su empuñadura queda en WEAPON_GRIP_X, que es el punto donde se apoya la mano.
const WEAPON_TEX_W = 56;
const WEAPON_TEX_H = 28;
const WEAPON_GRIP_X = 15;
const WEAPON_MUZZLE_X = 54;
const ART_PX = 2;

const HAND_ART = {
  rows: ["..kkkkk..", ".kgghggk.", "kghgggggk", "kgggggggk", "kgggggggk", "kgggggdgk", "kdgggdddk", ".kdddddk.", "..kkkkk.."],
  palette: {"k": 657935, "g": 1951520, "d": 888927, "h": 8257386}
};

// Ideas: toxin = pistola de baba con tanque, exotoxin = abanico plegable, biofilm = megafono con ondas,
// spores = hongo lanzador, plasmid = subfusil con tambor en anillo, torpedo = lanzamisiles con un trasero en la punta.
const WEAPON_ART = {
  toxin: {
    rows: [
      "............................",
      "........kkkkkkkk............",
      ".......kllwlllglk...........",
      ".....kkklglllwllkkkk...kk...",
      "....kgllllllllggggggkkkggkk.",
      "....kggggggggggggggGGGGggkgk",
      "....kggggggggggggggGGGGggklk",
      "....kggggggggggggggGGGGggkk.",
      "....kGGGGGGGGGGGGGGGkkkGGk..",
      ".....kgGGGkkkkkkkkkk...kgk..",
      ".....kgGGGk............klk..",
      ".....kgGGGk............kgk..",
      ".....kgGGGk.............k...",
      "......kkkk.................."
    ],
    palette: {"g": 10215773, "G": 5218090, "l": 14155696, "w": 16777215, "k": 657935}
  },
  exotoxin: {
    rows: [
      "..................kyooyyyk..",
      "................kkooyyyyyk..",
      "...............kyoyyyyyyyrk.",
      "..............kyooyyyoorryk.",
      "............kkooyyyoooyyyyk.",
      "...kkkkkkkkkooyyoooyyyyyyyk.",
      "..kBBBBBBoookoooyyyyyyyyyyk.",
      "..kBBBBBBolokooooooooooorrrk",
      "..kbbbbbboookoooyyyyyyyyyyk.",
      "...kkkkkkkkkooyyoooyyyyyyyk.",
      "............kkooyyyoooyyyyk.",
      "..............kyooyyyoorryk.",
      "...............kyoyyyyyyyrk.",
      "................kkooyyyyyk.."
    ],
    palette: {"y": 16767083, "o": 16226847, "r": 14701615, "B": 9132587, "b": 6044186, "l": 16774084, "k": 657935}
  },
  biofilm: {
    rows: [
      "...................kkkcck...",
      ".................kklBkkkck..",
      "...............kkllkk.kkkck.",
      "............kkkllkklBkcckkck",
      ".........kkkllkbbkblBkkckkck",
      ".....kkkklllbbkbkbblBk.kckck",
      "....kBDDDbbbbkkbkbbBBk.kckcc",
      "....kBDDDBBBbbkbkbbBBk.kckck",
      "....kBDDDDkkBBkbbkbBBkkckkck",
      "....kBDDDDk.kkkBBkkBBkcckkck",
      ".....kDDDk.....kkBBkk.kkkck.",
      ".....kDDDk.......kkBBkkkck..",
      ".....kDDDk.........kkkcck...",
      "......kkk.............kk...."
    ],
    palette: {"D": 2976944, "B": 3111108, "b": 4565746, "l": 12576511, "c": 13495039, "k": 657935}
  },
  spores: {
    rows: [
      ".................kPkkk......",
      "................kpPPPPk.....",
      "................kpPPPPPk..k.",
      "................kpPPLLPPkkLk",
      "................kpPPPPPPk.k.",
      "....kkkkkkkkkkkkkpPPPPPPk...",
      "...kswwwwwwwwwwsspPPPPPLLk..",
      "...kssssssssssssspPPPPPPk...",
      "...kSSSSSSSSSSSSSpPPLPPPk.k.",
      "....kkkkkkkkkkkkkpPPPLPPkkLk",
      "................kpPPPPPk.kk.",
      "................kpPPPPk.kLk.",
      ".................kPkkk...k..",
      "..................k........."
    ],
    palette: {"s": 15984328, "S": 13219724, "w": 16775398, "P": 10837738, "p": 7288248, "L": 14862591, "k": 657935}
  },
  plasmid: {
    rows: [
      "............................",
      "............................",
      "........k.k.k.k.k.k.........",
      ".....kkkwkwkwkwkwkwkk.......",
      "....kRhhhhhhhhhhhhhhRk...kk.",
      "....kRRRRRRRRRRRRRRRRkkkkddk",
      "....kRRRRRRRRRpppRRRdddddddk",
      "....kRRRRRRRRpppppRRdddddddk",
      "....kdddddddppdddppddkkkkddk",
      ".....kRdddkkppkkkppkk....kk.",
      ".....kRdddkkppkkkppk........",
      ".....kRdddk.kpppppk.........",
      ".....kRdddk..kpppk..........",
      "......kkkk....kkk..........."
    ],
    palette: {"R": 15416154, "d": 9182515, "h": 16747168, "p": 16757697, "w": 16769254, "k": 657935}
  },
  torpedo: {
    rows: [
      "..........................k.",
      "......................kkkkGk",
      ".....................kSSSqkG",
      "....kkkkkkkkkkkkkkkkkSWSSSkk",
      "...kaaaannaaaannaaaakSSSSSk.",
      "...kNNNNnnNNNNnnNNNNkSSSSSk.",
      "...kNNNNnnNNNNnnNNNNqqqqqqqk",
      "...kNNNNnnNNNNnnNNNNqqqqqqqk",
      "...kNNNNnnNNNNnnNNNNkSSSSSk.",
      "...knnnnnnnnnnnnnnnnkSSSSSk.",
      "....kkkknnnnkkkkkkkkkSqSSSkk",
      ".......knnnnk.......kSSSqSkG",
      ".......knnnnk........kSSSkGG",
      "........kkkk..........kkk.kk"
    ],
    palette: {"N": 9132587, "n": 6044186, "a": 11565635, "S": 16103328, "q": 13664362, "W": 16770006, "G": 9425231, "k": 657935}
  }
};

function drawPixelArt(g, art) {
  art.rows.forEach(function (row, y) {
    for (let x = 0; x < row.length; x++) {
      const ch = row.charAt(x);
      if (ch === '.') continue;
      g.fillStyle(art.palette[ch], 1);
      g.fillRect(x * ART_PX, y * ART_PX, ART_PX, ART_PX);
    }
  });
}

function createHandTextures(g) {
  g.clear();
  drawPixelArt(g, HAND_ART);
  g.generateTexture('hand', HAND_ART.rows[0].length * ART_PX, HAND_ART.rows.length * ART_PX);

  Object.keys(WEAPON_ART).forEach(function (key) {
    g.clear();
    drawPixelArt(g, WEAPON_ART[key]);
    g.generateTexture('weapon_' + key, WEAPON_TEX_W, WEAPON_TEX_H);
  });
}
