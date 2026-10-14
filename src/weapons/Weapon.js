class Weapon {
  constructor(def) {
    this.def = def;
    this.level = 1;
    this.timer = 0;
    this.burstLeft = 0;
    this.burstTimer = 0;
  }

  get damage() {
    return this.def.damage * (1 + 0.25 * (this.level - 1));
  }

  get pierce() {
    return this.def.pierce + this._player.pierceBonus;
  }

  update(dt, player, game) {
    this._player = player;
    this.timer -= dt;

    if (this.burstLeft > 0) {
      this.burstTimer -= dt;
      if (this.burstTimer <= 0) {
        this.burstTimer = this.def.burstInterval;
        this.burstLeft -= 1;
        this.fireSingle(player, game);
      }
    }

    if (this.timer <= 0) {
      const target = game.getNearestEnemy(player.x, player.y);
      if (target) {
        this.fire(target, player, game);
      }
    }
  }

  fire(target, player, game) {
    const cooldown = this.def.cooldown / player.fireRateMul;
    this.timer = cooldown;

    if (this.def.type === 'projectile') {
      this.fireSpread(target, player, game);
    } else if (this.def.type === 'burst') {
      this.burstLeft = this.def.burstCount;
      this.burstTimer = 0;
    } else if (this.def.type === 'aoe') {
      const radius = this.def.radius * player.areaMul;
      game.applyAoe(player.x, player.y, radius, this.damage * player.damageMul, this.def.color);
    } else if (this.def.type === 'aoe_target') {
      const radius = this.def.radius * player.areaMul;
      game.applyAoe(target.x, target.y, radius, this.damage * player.damageMul, this.def.color);
    }
  }

  fireSpread(target, player, game) {
    const count = this.def.count;
    const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
    const spread = this.def.spread;
    const damage = this.damage * player.damageMul;
    const radius = this.def.radius * player.areaMul;

    for (let i = 0; i < count; i++) {
      let angle = baseAngle;
      if (count > 1) {
        angle = baseAngle - spread / 2 + (spread * i) / (count - 1);
      }
      const vx = Math.cos(angle) * this.def.projectileSpeed;
      const vy = Math.sin(angle) * this.def.projectileSpeed;
      game.spawnProjectile(player.x, player.y, vx, vy, {
        damage: damage,
        radius: radius,
        pierce: this.pierce,
        color: this.def.color
      });
    }
    game.audio.shoot();
  }

  fireSingle(player, game) {
    const target = game.getNearestEnemy(player.x, player.y);
    if (!target) {
      this.burstLeft = 0;
      return;
    }
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    const vx = Math.cos(angle) * this.def.projectileSpeed;
    const vy = Math.sin(angle) * this.def.projectileSpeed;
    game.spawnProjectile(player.x, player.y, vx, vy, {
      damage: this.damage * player.damageMul,
      radius: this.def.radius * player.areaMul,
      pierce: this.pierce,
      color: this.def.color
    });
    game.audio.shoot();
  }
}
