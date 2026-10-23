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
      this.tryFire(player, game);
    }
  }

  tryFire(player, game) {
    const damage = this.damage * player.damageMul;
    const type = this.def.type;

    if (type === 'aoe') {
      if (!game.getNearestEnemy(player.x, player.y, this.def.range)) {
        return;
      }
      this.timer = this.def.cooldown / player.fireRateMul;
      game.registerWeaponShot(this.def.key);
      game.applyAoe(
        player.x,
        player.y,
        this.def.radius * player.areaMul,
        damage,
        this.def.color,
        this.def.key
      );
      game.audio.shoot();
      return;
    }

    if (type === 'aoe_target') {
      const target = game.getNearestEnemy(player.x, player.y, this.def.range, true);
      if (!target) {
        return;
      }
      this.timer = this.def.cooldown / player.fireRateMul;
      game.registerWeaponShot(this.def.key);
      game.applyAoe(
        target.x,
        target.y,
        this.def.radius * player.areaMul,
        damage,
        this.def.color,
        this.def.key
      );
      game.audio.shoot();
      return;
    }

    if (type === 'burst') {
      if (!game.getNearestEnemy(player.x, player.y, this.def.range, true)) {
        return;
      }
      this.timer = this.def.cooldown / player.fireRateMul;
      game.registerWeaponShot(this.def.key);
      this.burstLeft = this.def.burstCount;
      this.burstTimer = 0;
      return;
    }

    const target = game.acquireTarget(player.x, player.y, this.def.range, damage);
    if (!target) {
      return;
    }
    this.timer = this.def.cooldown / player.fireRateMul;
    game.registerWeaponShot(this.def.key);

    if (type === 'explosive') {
      this.fireTorpedo(target, damage, player, game);
    } else {
      this.fireSpread(target, damage, player, game);
    }
  }

  fireTorpedo(target, damage, player, game) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    const vx = Math.cos(angle) * this.def.projectileSpeed;
    const vy = Math.sin(angle) * this.def.projectileSpeed;
    game.spawnProjectile(player.x, player.y, vx, vy, {
      damage: damage,
      radius: this.def.radius * player.areaMul,
      pierce: 0,
      color: this.def.color,
      explosive: true,
      explosionRadius: this.def.explosionRadius * player.areaMul,
      explosionColor: 0xf0932b,
      life: this.def.range / this.def.projectileSpeed + 0.1,
      targetId: target.id,
      reservedDamage: damage,
      weaponKey: this.def.key
    });
    game.audio.shoot();
  }

  fireSpread(target, damage, player, game) {
    const count = this.def.count;
    const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
    const spread = this.def.spread;
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
        color: this.def.color,
        targetId: i === 0 ? target.id : 0,
        reservedDamage: i === 0 ? damage : 0,
        weaponKey: this.def.key
      });
    }
    game.audio.shoot();
  }

  fireSingle(player, game) {
    const damage = this.damage * player.damageMul;
    const target = game.acquireTarget(player.x, player.y, this.def.range, damage);
    if (!target) {
      this.burstLeft = 0;
      return;
    }
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    const vx = Math.cos(angle) * this.def.projectileSpeed;
    const vy = Math.sin(angle) * this.def.projectileSpeed;
    game.spawnProjectile(player.x, player.y, vx, vy, {
      damage: damage,
      radius: this.def.radius * player.areaMul,
      pierce: this.pierce,
      color: this.def.color,
      targetId: target.id,
      reservedDamage: damage,
      weaponKey: this.def.key
    });
    game.audio.shoot();
  }
}
