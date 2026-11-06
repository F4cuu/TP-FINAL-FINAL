class OptionsScene extends Phaser.Scene {
  constructor() {
    super('OptionsScene');
  }

  init(data) {
    this.skipTransition = !!(data && data.skipTransition);
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    applyUiCamera(this);
    if (!this.skipTransition) {
      Transition.in(this);
    }

    this.add
      .text(GAME_WIDTH / 2, 120, t('Opciones'), {
        fontFamily: FONT_FAMILY,
        fontSize: '50px',
        color: '#e8f0ff'
      })
      .setOrigin(0.5);

    this.sfxText = this.add
      .text(GAME_WIDTH / 2, 260, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: '#9be15d'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.sfxText.on('pointerdown', () => this.toggleSfx());

    this.musicText = this.add
      .text(GAME_WIDTH / 2, 330, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: '#9be15d'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.musicText.on('pointerdown', () => this.toggleMusic());

    this.langText = this.add
      .text(GAME_WIDTH / 2, 400, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: '#ffd166'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.langText.on('pointerdown', () => this.toggleLanguage());

    this.add
      .text(GAME_WIDTH / 2, 490, t('[ Volver ]'), {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: COLORS.text
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.goBack());

    this.refresh();

    this.input.keyboard.on('keydown-ESC', () => this.goBack());
  }

  goBack() {
    AudioManager.uiBack();
    Transition.go(this, () => this.scene.start('MenuScene'));
  }

  // Efectos de sonido: disparos, impactos, tienda, etc.
  toggleSfx() {
    AudioManager.enabled = !AudioManager.enabled;
    if (AudioManager.enabled) {
      AudioManager.init();
      AudioManager.uiToggle(true);
    }
    this.refresh();
  }

  // Música de fondo (independiente de los efectos).
  toggleMusic() {
    AudioManager.musicEnabled = !AudioManager.musicEnabled;
    AudioManager.uiToggle(AudioManager.musicEnabled);
    this.refresh();
  }

  // Cambia el idioma y vuelve a armar la pantalla con los textos nuevos.
  toggleLanguage() {
    I18n.toggle();
    AudioManager.init();
    AudioManager.uiToggle(true);
    this.scene.restart({ skipTransition: true });
  }

  refresh() {
    this.langText.setText('[ ' + t('Idioma:') + ' ' + I18n.label() + ' ]');
    this.sfxText.setText(t('[ Efectos de sonido: ' + (AudioManager.enabled ? 'ON' : 'OFF') + ' ]'));
    this.sfxText.setColor(AudioManager.enabled ? '#9be15d' : '#eb3b5a');
    this.musicText.setText(t('[ Música: ' + (AudioManager.musicEnabled ? 'ON' : 'OFF') + ' ]'));
    this.musicText.setColor(AudioManager.musicEnabled ? '#9be15d' : '#eb3b5a');
  }
}
