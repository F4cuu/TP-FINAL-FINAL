class OptionsScene extends Phaser.Scene {
  constructor() {
    super('OptionsScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    applyUiCamera(this);

    this.add
      .text(GAME_WIDTH / 2, 120, 'Opciones', {
        fontFamily: FONT_FAMILY,
        fontSize: '50px',
        color: '#e8f0ff'
      })
      .setOrigin(0.5);

    this.sfxText = this.add
      .text(GAME_WIDTH / 2, 290, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: '#9be15d'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.sfxText.on('pointerdown', () => this.toggleSfx());

    this.musicText = this.add
      .text(GAME_WIDTH / 2, 360, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: '#9be15d'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.musicText.on('pointerdown', () => this.toggleMusic());

    this.add
      .text(GAME_WIDTH / 2, 470, '[ Volver ]', {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: COLORS.text
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MenuScene'));

    this.refresh();

    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  // Efectos de sonido: disparos, impactos, tienda, etc.
  toggleSfx() {
    AudioManager.enabled = !AudioManager.enabled;
    if (AudioManager.enabled) {
      AudioManager.init();
      AudioManager.beep(600, 0.08, 'sine', 0.05);
    }
    this.refresh();
  }

  // Música de fondo (independiente de los efectos).
  toggleMusic() {
    AudioManager.musicEnabled = !AudioManager.musicEnabled;
    this.refresh();
  }

  refresh() {
    this.sfxText.setText('[ Efectos de sonido: ' + (AudioManager.enabled ? 'ON' : 'OFF') + ' ]');
    this.sfxText.setColor(AudioManager.enabled ? '#9be15d' : '#eb3b5a');
    this.musicText.setText('[ Música: ' + (AudioManager.musicEnabled ? 'ON' : 'OFF') + ' ]');
    this.musicText.setColor(AudioManager.musicEnabled ? '#9be15d' : '#eb3b5a');
  }
}
