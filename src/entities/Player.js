class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.maxHp = PLAYER_DEF.hp;
    this.hp = this.maxHp;
    this.baseSpeed = PLAYER_DEF.speed;
    this.radius = PLAYER_DEF.radius;

    this.speedMul = 1;
    this.damageMul = 1;
    this.fireRateMul = 1;
    this.areaMul = 1;
    this.pierceBonus = 0;

    this.weapons = [];
    this.breath = 0;

    this.sprite = scene.add.image(x, y, PLAYER_DEF.texture).setDepth(DEPTH.player);
    this.baseScale = PLAYER_DEF.spriteHeight / this.sprite.height;
    this.sprite.setScale(this.baseScale);
  }

  get x() {
    return this.sprite.x;
  }
  get y() {
    return this.sprite.y;
  }
  get speed() {
    return this.baseSpeed * this.speedMul;
  }

  update(dt, input) {
    let dx = 0;
    let dy = 0;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }

    if (dx < 0) {
      this.sprite.setFlipX(true);
    } else if (dx > 0) {
      this.sprite.setFlipX(false);
    }

    this.sprite.x = Phaser.Math.Clamp(
      this.sprite.x + dx * this.speed * dt,
      this.radius,
      ARENA_WIDTH - this.radius
    );
    this.sprite.y = Phaser.Math.Clamp(
      this.sprite.y + dy * this.speed * dt,
      this.radius,
      ARENA_HEIGHT - this.radius
    );

    this.breath += dt * 4;
    const b = Math.sin(this.breath);
    this.sprite.setScale(this.baseScale * (1 + b * 0.03), this.baseScale * (1 + b * 0.05));
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  hasWeapon(key) {
    return this.weapons.some(function (w) {
      return w.def.key === key;
    });
  }

  getWeapon(key) {
    return this.weapons.find(function (w) {
      return w.def.key === key;
    });
  }
}
