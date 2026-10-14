class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    createTextures(this);
    this.scene.start('StartScene');
  }
}
