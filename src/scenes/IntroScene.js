class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
    this.panels = [
      'En lo profundo de una gota de agua...',
      'un pequeño microbio llamado Pablito\nlucha por sobrevivir.',
      'Su mundo es hostil:\nodas de bacterias rivales\nlo atacan sin descanso.',
      'Nueve oleadas se alzan entre el\ny la calma.\n\nSolo uno podra resistir.'
    ];
    this.index = -1;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.text = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '30px',
        color: COLORS.text,
        align: 'center',
        lineSpacing: 10
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.hint = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 70, 'Presiona cualquier tecla para continuar', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: COLORS.textDim
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.advance();

    const go = () => this.advance();
    this.input.keyboard.on('keydown', go);
    this.input.on('pointerdown', go);
  }

  advance() {
    this.index += 1;
    if (this.index >= this.panels.length) {
      this.scene.start('MenuScene');
      return;
    }
    this.text.setText(this.panels[this.index]).setAlpha(0);
    this.hint.setAlpha(0);
    this.tweens.add({ targets: this.text, alpha: 1, duration: 400 });
    this.tweens.add({ targets: this.hint, alpha: 1, duration: 400, delay: 500 });
  }
}
