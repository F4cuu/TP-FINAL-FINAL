class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add
      .text(cx, cy - 60, 'PABLITO', {
        fontFamily: FONT_FAMILY,
        fontSize: '72px',
        color: '#e8f0ff'
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 10, 'Bacteria Survivor', {
        fontFamily: FONT_FAMILY,
        fontSize: '32px',
        color: COLORS.text
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(cx, cy + 120, 'Presiona cualquier tecla', {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
        color: COLORS.textDim
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.25,
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    const go = () => {
      AudioManager.init();
      this.scene.start('IntroScene');
    };
    this.input.keyboard.once('keydown', go);
    this.input.once('pointerdown', go);
  }
}
