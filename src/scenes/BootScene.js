class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('player_sprite', 'SPRITES/pablito.png');
    this.load.image('enemy_simple_sprite', 'SPRITES/enemigo_común.png');
    this.load.image('enemy_hunter_sprite', 'SPRITES/enemigo_cazador.png');
    this.load.image('enemy_compound_sprite', 'SPRITES/enemigo_compuesto.png');
  }

  create() {
    createTextures(this);
    this.scene.start('StartScene');
  }
}
