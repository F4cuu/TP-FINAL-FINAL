// Soporte de resolución 1920x1080.
//
// La interfaz (menús, HUD, tienda) está diseñada en un espacio de 1280x720
// (GAME_WIDTH x GAME_HEIGHT). El canvas real es de RENDER_WIDTH x RENDER_HEIGHT y
// cada cámara aplica DISPLAY_SCALE (1.5x) para que ese diseño llene la pantalla.
//
// - Escenas de menú: applyUiCamera(scene) hace zoom y centra la cámara.
// - GameScene: la cámara principal usa zoom DISPLAY_SCALE y los objetos fijos del
//   HUD se crean con .toHud(), que reemplaza a .setScrollFactor(0) y los traslada
//   para que el zoom los deje en la posición de diseño.

function applyUiCamera(scene) {
  const camera = scene.cameras.main;
  camera.setZoom(DISPLAY_SCALE);
  camera.centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);
}

(function patchPhaserForDisplay() {
  // Objeto fijo en pantalla (no se mueve con la cámara) en coordenadas de diseño.
  Phaser.GameObjects.GameObject.prototype.toHud = function () {
    this.setScrollFactor(0);
    this.x += HUD_OFFSET_X;
    this.y += HUD_OFFSET_Y;
    return this;
  };

  // Todos los textos se rasterizan a DISPLAY_SCALE para que el zoom no los vuelva borrosos.
  const factory = Phaser.GameObjects.GameObjectFactory
    ? Phaser.GameObjects.GameObjectFactory.prototype
    : null;
  if (factory && typeof factory.text === 'function') {
    const originalText = factory.text;
    factory.text = function () {
      const text = originalText.apply(this, arguments);
      if (text && typeof text.setResolution === 'function') {
        text.setResolution(DISPLAY_SCALE);
      }
      return text;
    };
  }
})();
