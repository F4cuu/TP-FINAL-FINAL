class OptionsScene extends Phaser.Scene {
  constructor() {
    super('OptionsScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.add
      .text(GAME_WIDTH / 2, 120, 'Opciones', {
        fontFamily: FONT_FAMILY,
        fontSize: '50px',
        color: '#e8f0ff'
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(GAME_WIDTH / 2, 280, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: COLORS.text
      })
      .setOrigin(0.5);

    this.toggleText = this.add
      .text(GAME_WIDTH / 2, 360, '[ Sonido: ON ]', {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: '#9be15d'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.toggleText.on('pointerdown', () => this.toggleSound());

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

  toggleSound() {
    AudioManager.enabled = !AudioManager.enabled;
    if (AudioManager.enabled) {
      AudioManager.init();
      AudioManager.beep(600, 0.08, 'sine', 0.05);
    }
    this.refresh();
  }

  refresh() {
    this.toggleText.setText('[ Sonido: ' + (AudioManager.enabled ? 'ON' : 'OFF') + ' ]');
    this.toggleText.setColor(AudioManager.enabled ? '#9be15d' : '#eb3b5a');
  }
}
