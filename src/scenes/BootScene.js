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
    this.scene.start('StartScene');
  }
}
