class Projectile {
  constructor(scene, x, y, vx, vy, options) {
    this.scene = scene;
    this.vx = vx;
    this.vy = vy;
    this.damage = options.damage;
    this.radius = options.radius;
    this.pierce = options.pierce || 0;
    this.life = options.life || 1.6;
    this.dead = false;
    this.hitIds = [];
    this.sprite = scene.add.image(x, y, 'projectile');
    this.sprite.setTint(options.color).setDepth(DEPTH.projectile);
    this.sprite.setScale(this.radius / 6);
  }

  update(dt) {
    this.sprite.x += this.vx * dt;
    this.sprite.y += this.vy * dt;
    this.life -= dt;
    if (
      this.life <= 0 ||
      this.sprite.x < -40 ||
      this.sprite.y < -40 ||
      this.sprite.x > ARENA_WIDTH + 40 ||
      this.sprite.y > ARENA_HEIGHT + 40
    ) {
      this.dead = true;
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}
