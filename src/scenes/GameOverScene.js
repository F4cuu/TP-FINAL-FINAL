class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.result = data || {};
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    const d = this.result;

    this.add
      .text(GAME_WIDTH / 2, 110, d.victory ? 'VICTORIA' : 'DERROTA', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '60px',
        color: d.victory ? '#9be15d' : '#eb3b5a'
      })
      .setOrigin(0.5);

    const summary = [
      'Oleada alcanzada: ' + (d.wave || 0),
      'Tiempo sobrevivido: ' + (d.time || 0) + 's',
      'Enemigos eliminados: ' + (d.kills || 0),
      'Monedas: ' + (d.coins || 0)
    ].join('\n');

    this.add
      .text(GAME_WIDTH / 2, 240, summary, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '26px',
        color: COLORS.text,
        align: 'center',
        lineSpacing: 10
      })
      .setOrigin(0.5);

    const r = d.records || ScoreStore.get();
    this.add
      .text(
        GAME_WIDTH / 2,
        400,
        'Record: Oleada ' + r.maxWave + '  |  Tiempo ' + r.maxTime + 's  |  Bajas ' + r.maxKills + '  |  Monedas ' + r.maxCoins,
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '20px',
          color: COLORS.textDim
        }
      )
      .setOrigin(0.5);

    this.buttons = [
      { label: 'Reintentar', action: () => this.scene.start('GameScene') },
      { label: 'Menu principal', action: () => this.scene.start('MenuScene') }
    ];

    this.items = [];
    this.buttons.forEach((b, i) => {
      const item = this.add
        .text(GAME_WIDTH / 2, 500 + i * 60, b.label, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '30px',
          color: COLORS.text
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      item.on('pointerover', () => {
        this.selected = i;
        this.refresh();
      });
      item.on('pointerdown', () => b.action());
      this.items.push(item);
    });

    this.selected = 0;
    this.refresh();

    this.input.keyboard.on('keydown-UP', () => this.move(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.move(1));
    this.input.keyboard.on('keydown-ENTER', () => this.buttons[this.selected].action());
  }

  move(delta) {
    this.selected = Phaser.Math.Wrap(this.selected + delta, 0, this.items.length);
    this.refresh();
  }

  refresh() {
    this.items.forEach((item, i) => {
      item.setColor(i === this.selected ? '#9be15d' : COLORS.text);
      item.setScale(i === this.selected ? 1.1 : 1);
    });
  }
}
