class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.createDecorations();
    this.createTitle();
    this.createRecords();
    this.createOptions();
    this.createFooter();

    this.input.keyboard.on('keydown-UP', () => this.move(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.move(1));
    this.input.keyboard.on('keydown-W', () => this.move(-1));
    this.input.keyboard.on('keydown-S', () => this.move(1));
    this.input.keyboard.on('keydown-ENTER', () => this.activate(this.selected));
    this.input.keyboard.on('keydown-SPACE', () => this.activate(this.selected));
  }

  createDecorations() {
    const cx = GAME_WIDTH / 2;

    const grid = this.add.graphics().setDepth(-30);
    grid.lineStyle(1, 0x23336b, 0.22);
    for (let x = 0; x <= GAME_WIDTH; x += 64) {
      grid.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 64) {
      grid.lineBetween(0, y, GAME_WIDTH, y);
    }

    this.add.circle(cx, 130, 250, 0x3a5bd0, 0.1).setDepth(-29);
    this.add.circle(cx, 130, 170, 0x39d353, 0.06).setDepth(-29);
    this.add.circle(120, 560, 170, 0x4bcffa, 0.05).setDepth(-29);
    this.add.circle(GAME_WIDTH - 100, 120, 200, 0x9be15d, 0.04).setDepth(-29);

    const glow = this.add.circle(cx, 120, 220, 0x3a5bd0, 0.1).setDepth(-28);
    this.tweens.add({
      targets: glow,
      alpha: 0.18,
      scale: 1.08,
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const orbit = this.add.container(cx, 150).setDepth(-27);
    const ring = this.add.graphics();
    ring.lineStyle(1, 0x4bcffa, 0.22);
    ring.strokeCircle(0, 0, 150);
    ring.lineStyle(1, 0x9be15d, 0.16);
    ring.strokeCircle(0, 0, 190);
    orbit.add(ring);
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const dot = this.add.circle(
        Math.cos(angle) * 150,
        Math.sin(angle) * 150,
        i % 3 === 0 ? 4 : 2,
        i % 3 === 0 ? 0x9be15d : 0x4bcffa,
        0.55
      );
      orbit.add(dot);
    }
    this.tweens.add({
      targets: orbit,
      rotation: Math.PI * 2,
      duration: 30000,
      repeat: -1
    });

    const microbes = [
      { x: 110, y: 500, r: 24, color: 0x4bcffa, alpha: 0.14, dx: 16, dy: -18, duration: 4200 },
      { x: 1170, y: 430, r: 18, color: 0x9be15d, alpha: 0.13, dx: -14, dy: 20, duration: 5000 },
      { x: 220, y: 160, r: 14, color: 0xf6e58d, alpha: 0.12, dx: 10, dy: 14, duration: 3800 },
      { x: 1050, y: 600, r: 26, color: 0xeb3b5a, alpha: 0.1, dx: -18, dy: -14, duration: 4600 },
      { x: 80, y: 300, r: 10, color: 0x9be15d, alpha: 0.14, dx: 12, dy: -10, duration: 3600 }
    ];

    microbes.forEach((microbe) => {
      const container = this.add.container(microbe.x, microbe.y).setDepth(-26);
      const body = this.add.graphics();
      body.fillStyle(microbe.color, microbe.alpha);
      body.fillCircle(0, 0, microbe.r);
      body.lineStyle(2, microbe.color, microbe.alpha + 0.08);
      body.strokeCircle(0, 0, microbe.r);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        body.fillCircle(
          Math.cos(angle) * microbe.r,
          Math.sin(angle) * microbe.r,
          microbe.r * 0.16
        );
      }
      container.add(body);
      this.tweens.add({
        targets: container,
        x: microbe.x + microbe.dx,
        y: microbe.y + microbe.dy,
        duration: microbe.duration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    for (let i = 0; i < 16; i++) {
      const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const y = Phaser.Math.Between(80, GAME_HEIGHT - 40);
      const bubble = this.add
        .circle(x, y, Phaser.Math.Between(2, 5), 0x9be15d, 0.16)
        .setDepth(-25);
      this.tweens.add({
        targets: bubble,
        y: y - Phaser.Math.Between(50, 120),
        alpha: 0,
        duration: Phaser.Math.Between(3200, 7000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1
      });
    }

    const frame = this.add.graphics().setDepth(-24);
    frame.lineStyle(2, 0x3a5bd0, 0.55);
    frame.strokeRect(18, 18, GAME_WIDTH - 36, GAME_HEIGHT - 36);
    frame.lineStyle(2, 0x9be15d, 0.7);
    const corner = 34;
    frame.lineBetween(18, 18, 18 + corner, 18);
    frame.lineBetween(18, 18, 18, 18 + corner);
    frame.lineBetween(GAME_WIDTH - 18, 18, GAME_WIDTH - 18 - corner, 18);
    frame.lineBetween(GAME_WIDTH - 18, 18, GAME_WIDTH - 18, 18 + corner);
    frame.lineBetween(18, GAME_HEIGHT - 18, 18 + corner, GAME_HEIGHT - 18);
    frame.lineBetween(18, GAME_HEIGHT - 18, 18, GAME_HEIGHT - 18 - corner);
    frame.lineBetween(GAME_WIDTH - 18, GAME_HEIGHT - 18, GAME_WIDTH - 18 - corner, GAME_HEIGHT - 18);
    frame.lineBetween(GAME_WIDTH - 18, GAME_HEIGHT - 18, GAME_WIDTH - 18, GAME_HEIGHT - 18 - corner);
  }

  createTitle() {
    const cx = GAME_WIDTH / 2;
    const plate = this.add.graphics().setDepth(-10);
    plate.fillStyle(0x0b1026, 0.72);
    plate.fillRoundedRect(cx - 350, 70, 700, 100, 18);
    plate.lineStyle(2, 0x3a5bd0, 0.8);
    plate.strokeRoundedRect(cx - 350, 70, 700, 100, 18);

    this.add
      .text(cx, 120, 'PABLITO: Bacteria Survivor', {
        fontFamily: FONT_FAMILY,
        fontSize: '46px',
        color: '#e8f0ff'
      })
      .setOrigin(0.5)
      .setShadow(0, 4, '#000000', 8, true, true)
      .setDepth(-9);

    const underline = this.add.graphics().setDepth(-9);
    underline.lineStyle(3, 0x9be15d, 0.85);
    underline.lineBetween(cx - 130, 178, cx + 130, 178);
  }

  createRecords() {
    const cx = GAME_WIDTH / 2;
    const records = ScoreStore.get();
    const panel = this.add.graphics().setDepth(-10);
    panel.fillStyle(0x0b1026, 0.55);
    panel.fillRoundedRect(cx - 340, 190, 680, 44, 12);
    panel.lineStyle(1, 0x3a5bd0, 0.5);
    panel.strokeRoundedRect(cx - 340, 190, 680, 44, 12);

    this.add
      .text(
        cx,
        212,
        'Records   Oleada: ' +
          records.maxWave +
          '   Tiempo: ' +
          records.maxTime +
          's   Bajas: ' +
          records.maxKills +
          '   Monedas: ' +
          records.maxCoins,
        {
          fontFamily: FONT_FAMILY,
          fontSize: '18px',
          color: COLORS.textDim
        }
      )
      .setOrigin(0.5)
      .setDepth(-9);
  }

  createOptions() {
    const cx = GAME_WIDTH / 2;
    this.options = [
      { label: 'Jugar', action: () => this.scene.start('GameScene') },
      { label: 'Opciones', action: () => this.scene.start('OptionsScene') },
      { label: 'Salir', action: () => this.scene.start('StartScene') }
    ];
    this.selected = 0;
    this.items = [];

    const startY = 310;
    this.options.forEach((opt, i) => {
      const container = this.add.container(cx, startY + i * 78);
      const bg = this.add.graphics();
      const text = this.add
        .text(0, 0, opt.label, {
          fontFamily: FONT_FAMILY,
          fontSize: '32px',
          color: COLORS.text
        })
        .setOrigin(0.5);
      container.add([bg, text]);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-180, -29, 360, 58),
        Phaser.Geom.Rectangle.Contains
      );
      container.input.cursor = 'pointer';
      container.on('pointerover', () => {
        this.selected = i;
        this.refresh();
      });
      container.on('pointerdown', () => this.activate(i));
      this.items.push({ container, bg, text });
    });

    this.refresh();
  }

  createFooter() {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'Flechas / WASD para elegir   ·   Enter para confirmar', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: COLORS.textDim
      })
      .setOrigin(0.5)
      .setDepth(-9);
  }

  move(delta) {
    this.selected = Phaser.Math.Wrap(this.selected + delta, 0, this.items.length);
    this.refresh();
    AudioManager.beep(300, 0.04, 'square', 0.03);
  }

  refresh() {
    this.items.forEach((item, i) => {
      const selected = i === this.selected;
      item.bg.clear();
      item.bg.fillStyle(selected ? 0x1f8a4c : 0x101a3a, selected ? 0.55 : 0.42);
      item.bg.fillRoundedRect(-180, -29, 360, 58, 14);
      item.bg.lineStyle(2, selected ? 0x9be15d : 0x3a5bd0, selected ? 1 : 0.55);
      item.bg.strokeRoundedRect(-180, -29, 360, 58, 14);
      if (selected) {
        item.bg.fillStyle(0x9be15d, 1);
        item.bg.fillTriangle(-200, -7, -200, 7, -188, 0);
      }
      item.text.setColor(selected ? '#9be15d' : COLORS.text);
      item.container.setScale(selected ? 1.04 : 1);
    });
  }

  activate(index) {
    AudioManager.init();
    AudioManager.beep(600, 0.08, 'sine', 0.05);
    this.options[index].action();
  }
}
