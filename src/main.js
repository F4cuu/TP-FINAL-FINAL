const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: RENDER_WIDTH,
  height: RENDER_HEIGHT,
  backgroundColor: '#0b1026',
  render: {
    pixelArt: false,
    antialias: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    BootScene,
    StartScene,
    IntroScene,
    MenuScene,
    OptionsScene,
    GameScene,
    PauseScene,
    GameOverScene
  ]
};

window.addEventListener('load', function () {
  window.pablitoGame = new Phaser.Game(gameConfig);
});
