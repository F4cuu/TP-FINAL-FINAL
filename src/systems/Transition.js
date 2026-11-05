// Transición entre pantallas: una oleada de burbujas de jabón.
//
// - Transition.go(scene, accion): las burbujas suben desde abajo, crecen y tapan la
//   pantalla con un fondo azul oscuro; recién entonces se ejecuta `accion` (cambio de escena).
// - Transition.in(scene): en la escena nueva, las burbujas estallan de arriba hacia abajo
//   y revelan la pantalla.
//
// Las capas usan scrollFactor 0 + el desplazamiento del HUD, igual que .toHud(), así que
// funcionan tanto en las escenas de menú como en GameScene (cámaras con zoom 1.5).

const Transition = {
  COLS: 8,
  ROWS: 5,
  DEPTH: 1000,
  busy: false,

  buildLayer: function (scene) {
    const cx = HUD_OFFSET_X + GAME_WIDTH / 2;
    const cy = HUD_OFFSET_Y + GAME_HEIGHT / 2;
    const fade = scene.add
      .rectangle(cx, cy, GAME_WIDTH + 400, GAME_HEIGHT + 400, 0x07102b, 1)
      .setScrollFactor(0)
      .setDepth(this.DEPTH);

    const bubbles = [];
    const cellW = GAME_WIDTH / this.COLS;
    const cellH = GAME_HEIGHT / this.ROWS;
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const x = HUD_OFFSET_X + (c + 0.5) * cellW + (Math.random() - 0.5) * cellW * 0.5;
        const y = HUD_OFFSET_Y + (r + 0.5) * cellH + (Math.random() - 0.5) * cellH * 0.5;
        const bubble = scene.add
          .image(x, y, 'bubble')
          .setScrollFactor(0)
          .setDepth(this.DEPTH + 1)
          .setAlpha(0.9);
        bubble.targetScale = 1.7 + Math.random() * 0.7;
        bubble.rowRatio = r / (this.ROWS - 1);
        bubbles.push(bubble);
      }
    }
    return { fade: fade, bubbles: bubbles };
  },

  destroyLayer: function (layer) {
    layer.fade.destroy();
    layer.bubbles.forEach(function (b) {
      b.destroy();
    });
  },

  // Tapa la pantalla y luego ejecuta `action`.
  go: function (scene, action) {
    if (this.busy) {
      return;
    }
    this.busy = true;
    AudioManager.transitionOut();

    const layer = this.buildLayer(scene);
    layer.fade.setAlpha(0);
    layer.bubbles.forEach(function (b) {
      b.setScale(0);
      scene.tweens.add({
        targets: b,
        scale: b.targetScale,
        delay: (1 - b.rowRatio) * 150 + Math.random() * 60,
        duration: 220,
        ease: 'Back.easeOut'
      });
    });
    scene.tweens.add({
      targets: layer.fade,
      alpha: 1,
      delay: 80,
      duration: 320,
      onComplete: () => {
        this.busy = false;
        action();
      }
    });
  },

  // Al entrar a una escena: las burbujas estallan y descubren la pantalla.
  in: function (scene, silent) {
    if (!silent) {
      AudioManager.transitionIn();
    }
    const layer = this.buildLayer(scene);
    layer.bubbles.forEach(function (b) {
      b.setScale(b.targetScale);
      scene.tweens.add({
        targets: b,
        scale: 0,
        alpha: 0,
        delay: b.rowRatio * 150 + Math.random() * 60,
        duration: 220,
        ease: 'Sine.easeIn'
      });
    });
    scene.tweens.add({
      targets: layer.fade,
      alpha: 0,
      duration: 400,
      onComplete: () => this.destroyLayer(layer)
    });
  }
};
