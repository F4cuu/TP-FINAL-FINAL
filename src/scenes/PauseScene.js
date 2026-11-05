class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    applyUiCamera(this);
    AudioManager.duckMusic(true);
    this.events.once('shutdown', () => AudioManager.duckMusic(false));

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070f, 0.75);

    this.add
      .text(GAME_WIDTH / 2, 140, 'PAUSA', {
        fontFamily: FONT_FAMILY,
        fontSize: '52px',
        color: '#e8f0ff'
      })
      .setOrigin(0.5);

    this.buttons = [
      { label: 'Continuar', action: () => this.resumeGame() },
      { label: 'Efectos: ' + (AudioManager.enabled ? 'ON' : 'OFF'), action: () => this.toggleSound() },
      { label: 'Música: ' + (AudioManager.musicEnabled ? 'ON' : 'OFF'), action: () => this.toggleMusic() },
      { label: 'Reiniciar', action: () => this.restartGame() },
      { label: 'Salir al menu', action: () => this.exitToMenu() }
    ];

    this.items = [];
    this.buttons.forEach((b, i) => {
      const item = this.add
        .text(GAME_WIDTH / 2, 250 + i * 64, b.label, {
          fontFamily: FONT_FAMILY,
          fontSize: '30px',
          color: COLORS.text
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      item.on('pointerover', () => {
        if (this.selected !== i) {
          AudioManager.uiMove();
        }
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
    this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
  }

  move(delta) {
    this.selected = Phaser.Math.Wrap(this.selected + delta, 0, this.items.length);
    this.refresh();
    AudioManager.uiMove();
  }

  refresh() {
    this.items.forEach((item, i) => {
      item.setColor(i === this.selected ? '#9be15d' : COLORS.text);
      item.setScale(i === this.selected ? 1.1 : 1);
    });
  }

  resumeGame() {
    AudioManager.uiBack();
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  toggleSound() {
    AudioManager.enabled = !AudioManager.enabled;
    this.buttons[1].label = 'Efectos: ' + (AudioManager.enabled ? 'ON' : 'OFF');
    this.items[1].setText(this.buttons[1].label);
    AudioManager.uiToggle(AudioManager.enabled);
  }

  toggleMusic() {
    AudioManager.musicEnabled = !AudioManager.musicEnabled;
    this.buttons[2].label = 'Música: ' + (AudioManager.musicEnabled ? 'ON' : 'OFF');
    this.items[2].setText(this.buttons[2].label);
    AudioManager.uiToggle(AudioManager.musicEnabled);
  }

  restartGame() {
    AudioManager.uiSelect();
    Transition.go(this, () => {
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    });
  }

  exitToMenu() {
    AudioManager.uiSelect();
    Transition.go(this, () => {
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });
  }
}
