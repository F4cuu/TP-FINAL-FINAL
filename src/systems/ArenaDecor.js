// Decoración del fondo del mapa: una "muestra de microscopio" con manchas de agar, células, bacilos
// y burbujas. La base (agar, motas y viñeta) se dibuja una sola vez; las células, bacilos y burbujas
// son imágenes sueltas que se mueven MUY despacio (deriva, giro lento, pulso suave), pensado como
// un detalle que se nota cuando uno está tranquilo y no como distracción. Colores de poco contraste
// y azar determinista (misma decoración en cada partida).
const ArenaDecor = {
  rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  // Texturas reutilizables: pocas variantes por tipo, que luego se varían con escala, giro y brillo.
  ensureTextures(scene) {
    if (scene.textures.exists('decor_cluster_0')) {
      return;
    }
    const rand = this.rng(777);
    const between = function (a, b) {
      return a + (b - a) * rand();
    };
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    // Cúmulos de células: bolitas con membrana y núcleo.
    for (let v = 0; v < 4; v++) {
      const size = 150;
      const c = size / 2;
      g.clear();
      const n = Math.floor(between(4, 9));
      for (let j = 0; j < n; j++) {
        const a = rand() * Math.PI * 2;
        const d = between(0, 44);
        const x = c + Math.cos(a) * d;
        const y = c + Math.sin(a) * d;
        const r = between(10, 24);
        g.fillStyle(0x1f3a7a, 0.42);
        g.fillCircle(x, y, r);
        g.lineStyle(2, 0x3c63c4, 0.4);
        g.strokeCircle(x, y, r);
        g.fillStyle(0x2c5a9e, 0.5);
        g.fillCircle(x + r * 0.15, y + r * 0.1, r * 0.38);
        g.fillStyle(0x7fa6ff, 0.22);
        g.fillCircle(x - r * 0.4, y - r * 0.4, r * 0.18);
      }
      g.generateTexture('decor_cluster_' + v, size, size);
    }

    // Bacilos: cadenitas de bolitas formando cápsulas (azules y verde azulado).
    const tints = [0x24478a, 0x1f6a78, 0x2a4f9a];
    for (let v = 0; v < 3; v++) {
      const w = 64;
      const h = 20;
      g.clear();
      const len = 3 + v * 2;
      const r = 5;
      const x0 = w / 2 - ((len - 1) * r * 1.1) / 2;
      for (let k = 0; k < len; k++) {
        g.fillStyle(tints[v], 0.5);
        g.fillCircle(x0 + k * r * 1.1, h / 2, r);
      }
      g.fillStyle(0x8fb4ff, 0.14);
      g.fillCircle(x0, h / 2 - 2, 2);
      g.generateTexture('decor_rod_' + v, w, h);
    }

    // Burbujas.
    for (let v = 0; v < 3; v++) {
      const r = 8 + v * 4;
      const size = r * 2 + 6;
      const c = size / 2;
      g.clear();
      g.fillStyle(0x4f7bff, 0.07);
      g.fillCircle(c, c, r);
      g.lineStyle(2, 0x6f95ff, 0.28);
      g.strokeCircle(c, c, r);
      g.fillStyle(0xdbe6ff, 0.3);
      g.fillCircle(c - r * 0.4, c - r * 0.4, Math.max(1.5, r * 0.18));
      g.generateTexture('decor_bubble_' + v, size, size);
    }
    g.destroy();
  },

  draw(scene) {
    this.ensureTextures(scene);
    const W = ARENA_WIDTH;
    const H = ARENA_HEIGHT;
    const rand = this.rng(20261107);
    const between = function (a, b) {
      return a + (b - a) * rand();
    };
    const margin = 40;
    const px = function () { return between(margin, W - margin); };
    const py = function () { return between(margin, H - margin); };

    // ---- Capa fija: agar y motas ----
    const base = scene.add.graphics().setDepth(DEPTH.arena + 0.4);
    for (let i = 0; i < 16; i++) {
      const x = px();
      const y = py();
      const r = between(90, 230);
      base.fillStyle(0x1d2c62, 0.28);
      base.fillCircle(x, y, r);
      base.fillStyle(0x23367a, 0.16);
      base.fillCircle(x + r * 0.08, y - r * 0.06, r * 0.7);
      base.fillStyle(0x2b428f, 0.1);
      base.fillCircle(x + r * 0.14, y - r * 0.12, r * 0.38);
    }
    for (let i = 0; i < 320; i++) {
      base.fillStyle(0x4c6fd6, between(0.12, 0.32));
      base.fillCircle(between(8, W - 8), between(8, H - 8), between(1, 2.8));
    }

    // ---- Elementos móviles ----
    const items = [];
    const add = function (key, n, cfg) {
      for (let i = 0; i < n; i++) {
        const variant = Math.floor(rand() * cfg.variants);
        const img = scene.add.image(px(), py(), key + variant).setDepth(DEPTH.arena + 0.5);
        const baseScale = cfg.scale ? between(cfg.scale[0], cfg.scale[1]) : 1;
        img.setScale(baseScale).setRotation(rand() * Math.PI * 2);
        const heading = cfg.rise ? -Math.PI / 2 : rand() * Math.PI * 2;
        const speed = between(cfg.speed[0], cfg.speed[1]);
        items.push({
          img: img,
          vx: Math.cos(heading) * speed,
          vy: Math.sin(heading) * speed,
          spin: (rand() < 0.5 ? -1 : 1) * between(cfg.spin[0], cfg.spin[1]),
          swayAmp: cfg.sway || 0,
          swayRate: between(0.15, 0.35),
          phase: rand() * Math.PI * 2,
          pulse: cfg.pulse || 0,
          baseScale: baseScale,
          pad: cfg.pad
        });
      }
    };
    //            textura            cant. variantes  velocidad px/s  giro rad/s     otros
    add('decor_cluster_', 18, { variants: 4, speed: [1.5, 4], spin: [0.01, 0.04], pulse: 0.03, pad: 90 });
    add('decor_rod_', 46, { variants: 3, speed: [2, 5], spin: [0.02, 0.07], scale: [0.9, 1.3], pad: 50 });
    add('decor_bubble_', 34, { variants: 3, speed: [4, 9], spin: [0, 0], rise: true, sway: 6, pad: 40 });

    // ---- Viñeta (encima de todo lo decorativo) ----
    const vig = scene.add.graphics().setDepth(DEPTH.arena + 0.7);
    for (let i = 0; i < 9; i++) {
      const inset = i * 14;
      vig.lineStyle(14, 0x050912, 0.38 - i * 0.04);
      vig.strokeRect(inset + 7, inset + 7, W - inset * 2 - 14, H - inset * 2 - 14);
    }

    let clock = 0;
    return {
      items: items,
      update(dt) {
        clock += dt;
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          const img = it.img;
          img.x += it.vx * dt;
          img.y += it.vy * dt;
          if (it.swayAmp) {
            img.x += Math.cos(clock * it.swayRate + it.phase) * it.swayAmp * it.swayRate * dt;
          }
          img.rotation += it.spin * dt;
          if (it.pulse) {
            img.setScale(it.baseScale * (1 + Math.sin(clock * 0.5 + it.phase) * it.pulse));
          }
          // Al salir por un lado reaparecen por el opuesto (siempre fuera de la vista, tras el borde).
          if (img.x < -it.pad) img.x = W + it.pad;
          else if (img.x > W + it.pad) img.x = -it.pad;
          if (img.y < -it.pad) img.y = H + it.pad;
          else if (img.y > H + it.pad) img.y = -it.pad;
        }
      }
    };
  }
};
