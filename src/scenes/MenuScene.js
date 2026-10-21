class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.add
      .text(GAME_WIDTH / 2, 120, 'PABLITO: Bacteria Survivor', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '46px',
        color: '#e8f0ff'
      })
      .setOrigin(0.5);

    const records = ScoreStore.get();
    this.add
      .text(
        GAME_WIDTH / 2,
        200,
        'Records   Oleada: ' +
          records.maxWave +
          '   Tiempo: ' +
          records.maxTime +
          's   Bajas: ' +
          records.maxKills +
          '   Monedas: ' +
          records.maxCoins,
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          color: COLORS.textDim
        }
      )
      .setOrigin(0.5);

    this.options = [
      { label: 'Jugar', action: () => this.scene.start('GameScene') },
      { label: 'Opciones', action: () => this.scene.start('OptionsScene') },
      { label: 'Salir', action: () => this.scene.start('StartScene') }
    ];
    this.selected = 0;
    this.items = [];

    const startY = 320;
    this.options.forEach((opt, i) => {
      const item = this.add
        .text(GAME_WIDTH / 2, startY + i * 70, opt.label, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '32px',
          color: COLORS.text
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      item.on('pointerover', () => {
        this.selected = i;
        this.refresh();
      });
      item.on('pointerdown', () => this.activate(i));
      this.items.push(item);
    });

    this.refresh();

    this.input.keyboard.on('keydown-UP', () => this.move(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.move(1));
    this.input.keyboard.on('keydown-W', () => this.move(-1));
    this.input.keyboard.on('keydown-S', () => this.move(1));
    this.input.keyboard.on('keydown-ENTER', () => this.activate(this.selected));
    this.input.keyboard.on('keydown-SPACE', () => this.activate(this.selected));
  }

  move(delta) {
    this.selected = Phaser.Math.Wrap(this.selected + delta, 0, this.items.length);
    this.refresh();
    AudioManager.beep(300, 0.04, 'square', 0.03);
  }

  refresh() {
    this.items.forEach((item, i) => {
      item.setColor(i === this.selected ? '#9be15d' : COLORS.text);
      item.setScale(i === this.selected ? 1.1 : 1);
    });
  }

  activate(index) {
    AudioManager.init();
    AudioManager.beep(600, 0.08, 'sine', 0.05);
    this.options[index].action();
  }
}
