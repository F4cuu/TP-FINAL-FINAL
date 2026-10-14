function createTextures(scene) {
  const g = scene.make.graphics({ add: false });

  g.clear();
  g.fillStyle(0x39d353, 1);
  g.fillRoundedRect(0, 0, 36, 52, 18);
  g.fillStyle(0x2fae45, 1);
  g.fillEllipse(18, 14, 24, 9);
  g.generateTexture('player', 36, 52);

  g.clear();
  g.fillStyle(0x4bcffa, 1);
  g.fillCircle(16, 16, 16);
  g.fillStyle(0x9fe8ff, 1);
  g.fillCircle(11, 11, 4);
  g.generateTexture('enemy_simple', 32, 32);

  g.clear();
  g.fillStyle(0xf6e58d, 1);
  g.fillCircle(16, 16, 15);
  g.fillStyle(0xfce38a, 1);
  g.fillCircle(11, 11, 4);
  g.fillCircle(21, 13, 3);
  g.fillCircle(16, 22, 4);
  g.fillCircle(10, 21, 3);
  g.generateTexture('enemy_hunter', 32, 32);

  g.clear();
  g.fillStyle(0x7f8fa6, 1);
  g.fillRoundedRect(0, 0, 48, 40, 6);
  g.fillStyle(0x9aa7bd, 1);
  g.fillRoundedRect(6, 6, 36, 12, 4);
  g.generateTexture('enemy_compound', 48, 40);

  g.clear();
  g.fillStyle(0xe1b12c, 1);
  g.fillRoundedRect(0, 0, 120, 96, 28);
  g.fillStyle(0xf7d76a, 1);
  g.fillRoundedRect(18, 16, 84, 28, 14);
  g.generateTexture('enemy_boss', 120, 96);

  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(6, 6, 6);
  g.generateTexture('projectile', 12, 12);

  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture('particle', 8, 8);

  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillRect(16, 4, 12, 40);
  g.fillRect(4, 16, 40, 12);
  g.generateTexture('spawn_cross', 48, 48);

  g.clear();
  g.fillStyle(COLORS.arena, 1);
  g.fillRect(0, 0, 64, 64);
  g.lineStyle(1, COLORS.grid, 0.5);
  g.strokeRect(0.5, 0.5, 64, 64);
  g.generateTexture('tile', 64, 64);

  g.destroy();
}
