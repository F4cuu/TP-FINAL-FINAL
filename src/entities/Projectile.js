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
    this.explosive = !!options.explosive;
    this.explosionRadius = options.explosionRadius || 0;
    this.explosionColor = options.explosionColor || options.color;
    this.exploded = false;
    this.targetId = options.targetId || 0;
    this.reservedDamage = options.reservedDamage || 0;
    this.weaponKey = options.weaponKey || '';
    this.prevX = x;
    this.prevY = y;
    this.sprite = scene.add.image(x, y, 'projectile');
    this.sprite.setTint(options.color).setDepth(DEPTH.projectile);
    this.sprite.setScale(this.radius / 6);
  }

  update(dt) {
    this.prevX = this.sprite.x;
    this.prevY = this.sprite.y;
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
