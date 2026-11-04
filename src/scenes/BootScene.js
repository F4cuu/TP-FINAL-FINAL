class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    Object.keys(SPRITE_DATA).forEach((key) => {
      this.load.image(key, SPRITE_DATA[key]);
    });
  }

  create() {
    createTextures(this);
    const start = () => this.scene.start('StartScene');
    if (document.fonts && document.fonts.load) {
      Promise.race([
        document.fonts.load('16px "Lilita One"'),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]).then(start, start);
    } else {
      start();
    }
  }
}
