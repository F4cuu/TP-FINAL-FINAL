let ENEMY_ID = 0;

class Enemy {
  constructor(scene, def, x, y) {
    this.scene = scene;
    this.def = def;
    this.id = ++ENEMY_ID;
    this.maxHp = def.hp;
    this.hp = def.hp;
    this.damage = def.damage;
    this.speed = def.speed;
    this.radius = def.radius;
    this.contactTimer = 0;
    this.dead = false;
    this.isBoss = def.key === 'boss';

    this.breath = Math.random() * Math.PI * 2;
    this.trailTimer = 0;
    this.blinkTimer = 0;

    this.state = 'chase';
    this.abilityTimer = this.isBoss ? 10 : Infinity;
    this.chargeTarget = null;
    this.chargeTimer = 0;

    this.sprite = scene.add.image(x, y, def.texture).setDepth(DEPTH.enemy);
  }

  update(dt, player, enemies) {
    if (this.isBoss) {
      this.updateBoss(dt, player);
    }

    let dirX = player.x - this.sprite.x;
    let dirY = player.y - this.sprite.y;
    const dist = Math.hypot(dirX, dirY) || 1;
    dirX /= dist;
    dirY /= dist;

    if (this.state === 'telegraph') {
      this.chargeTimer -= dt;
      if (this.chargeTimer <= 0) {
        this.state = 'charge';
        this.chargeTimer = 0.7;
      }
    } else if (this.state === 'charge') {
      this.chargeTimer -= dt;
      const cx = this.chargeTarget.x - this.sprite.x;
      const cy = this.chargeTarget.y - this.sprite.y;
      const cl = Math.hypot(cx, cy) || 1;
      const chargeSpeed = this.speed * 7;
      this.sprite.x += (cx / cl) * chargeSpeed * dt;
      this.sprite.y += (cy / cl) * chargeSpeed * dt;
      if (this.chargeTimer <= 0) {
        this.state = 'chase';
        this.abilityTimer = 10;
      }
    } else {
      this.sprite.x += dirX * this.speed * dt;
      this.sprite.y += dirY * this.speed * dt;
    }

    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, this.radius, ARENA_WIDTH - this.radius);
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, this.radius, ARENA_HEIGHT - this.radius);

    this.separate(enemies);

    this.breath += dt * 4;
    const b = Math.sin(this.breath);
    this.sprite.setScale(1 + b * 0.05, 1 + b * 0.08);

    this.trailTimer -= dt;
    if (this.trailTimer <= 0) {
      this.trailTimer = this.isBoss ? 0.12 : 0.22;
      this.scene.spawnTrail(this.sprite.x, this.sprite.y, this.def.color);
    }

    this.contactTimer -= dt;
    if (this.blinkTimer > 0) {
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        this.sprite.clearTint();
      }
    }
  }

  updateBoss(dt, player) {
    if (this.state === 'chase') {
      this.abilityTimer -= dt;
      if (this.abilityTimer <= 0) {
        this.state = 'telegraph';
        this.chargeTimer = 1;
        this.chargeTarget = { x: player.x, y: player.y };
        this.sprite.setTint(0xff6b6b);
        this.scene.audio.boss();
      }
    }
  }

  separate(enemies) {
    for (let i = 0; i < enemies.length; i++) {
      const other = enemies[i];
      if (other === this || other.dead) {
        continue;
      }
      const dx = this.sprite.x - other.sprite.x;
      const dy = this.sprite.y - other.sprite.y;
      const d = Math.hypot(dx, dy) || 1;
      const min = this.radius + other.radius;
      if (d < min) {
        const push = ((min - d) / min) * 60;
        this.sprite.x += (dx / d) * push;
        this.sprite.y += (dy / d) * push;
      }
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.sprite.setTint(0xffffff);
    this.blinkTimer = 0.06;
    this.scene.spawnDamageText(this.sprite.x, this.sprite.y, amount);
    return this.hp <= 0;
  }

  get x() {
    return this.sprite.x;
  }
  get y() {
    return this.sprite.y;
  }

  destroy() {
    this.sprite.destroy();
  }
}
