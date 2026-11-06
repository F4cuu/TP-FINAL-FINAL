let ENEMY_ID = 0;

class Enemy {
  constructor(scene, def, x, y) {
    this.scene = scene;
    this.def = def;
    this.id = ++ENEMY_ID;
    this.maxHp = enemyMaxHp(def, scene.wave || 1);
    this.hp = this.maxHp;
    this.damage = def.damage;
    this.speed = def.speed;
    this.radius = def.radius;
    this.contactTimer = 0;
    this.dead = false;
    this.incomingDamage = 0;
    this.isBoss = def.key === 'boss';
    this.name = bossNameForWave(def, scene.wave);

    this.breath = Math.random() * Math.PI * 2;
    this.trailTimer = 0;
    this.blinkTimer = 0;

    this.state = 'chase';
    this.power = this.isBoss ? bossPowerForWave(scene.wave) : null;
    this.abilityTimer = this.isBoss ? BOSS_POWERS[this.power].cooldown : Infinity;
    this.stateTimer = 0;
    this.noContact = false;
    this.hoverScale = 1;
    this.hoverTarget = 1;

    const texture = (def.texturesByWave && def.texturesByWave[scene.wave]) || def.texture;
    this.sprite = scene.add.image(x, y, texture).setDepth(DEPTH.enemy);
    this.baseScale = def.spriteWidth
      ? def.spriteWidth / this.sprite.width
      : (def.spriteHeight || def.radius * 2) / this.sprite.height;
    this.sprite.setScale(this.baseScale);
  }

  update(dt, player, enemies) {
    const moved = this.isBoss ? this.updateBoss(dt, player) : false;

    const previousX = this.sprite.x;
    if (!moved) {
      let dirX = player.x - this.sprite.x;
      let dirY = player.y - this.sprite.y;
      const dist = Math.hypot(dirX, dirY) || 1;
      dirX /= dist;
      dirY /= dist;
      this.sprite.x += dirX * this.speed * dt;
      this.sprite.y += dirY * this.speed * dt;
    }

    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, this.radius, ARENA_WIDTH - this.radius);
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, this.radius, ARENA_HEIGHT - this.radius);

    const movedX = this.sprite.x - previousX;
    if (Math.abs(movedX) > 0.01) {
      this.sprite.setFlipX(movedX < 0);
    }

    this.separate(enemies);

    this.hoverScale += (this.hoverTarget - this.hoverScale) * Math.min(1, dt * 6);
    this.breath += dt * 4;
    const b = Math.sin(this.breath);
    this.sprite.setScale(
      this.baseScale * this.hoverScale * (1 + b * 0.05),
      this.baseScale * this.hoverScale * (1 + b * 0.08)
    );

    this.trailTimer -= dt;
    if (this.trailTimer <= 0) {
      this.trailTimer = this.isBoss ? 0.12 : 0.22;
      this.scene.spawnTrail(this.sprite.x, this.sprite.y, this.def.color);
    }

    this.contactTimer -= dt;
    if (this.blinkTimer > 0) {
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        if (this.state === 'wind') {
          this.sprite.setTint(BOSS_POWERS[this.power].tint);
        } else {
          this.sprite.clearTint();
        }
      }
    }
  }

  // Poderes especiales. Devuelve true si el poder controla el movimiento del jefe este cuadro.
  updateBoss(dt, player) {
    const power = BOSS_POWERS[this.power];

    if (this.state === 'chase') {
      this.abilityTimer -= dt;
      if (this.abilityTimer <= 0 && this.scene.phase === 'playing') {
        this.startPower(power);
      }
      return false;
    }

    this.stateTimer -= dt;

    if (this.state === 'wind') {
      this.sprite.setAngle(Math.sin(this.stateTimer * 40) * 7);
      if (this.stateTimer <= 0) {
        this.sprite.setAngle(0);
        this.releasePower(power, player);
      }
      return true;
    }

    if (this.state === 'act') {
      if (this.power === 'ram') {
        this.updateRam(dt, power);
      } else if (this.power === 'rain') {
        this.updateRain(dt, power, player);
      }
      return true;
    }

    // 'recover': breve pausa al terminar el poder.
    if (this.stateTimer <= 0) {
      this.state = 'chase';
      this.abilityTimer = power.cooldown;
      this.sprite.clearTint();
      if (this.power === 'ram') {
        this.scene.endMapView();
      }
    }
    return true;
  }

  startPower(power) {
    this.state = 'wind';
    this.stateTimer = power.windTime;
    this.sprite.setTint(power.tint);
    this.scene.audio.boss();
    this.scene.showNotice(t('¡{name}!', { name: t(power.name) }));
    if (this.power === 'ram') {
      this.scene.beginMapView();
    } else if (this.power === 'bleach') {
      this.scene.spawnBleachWarning(this.sprite.x, this.sprite.y, power.radius, power.windTime);
    } else if (this.power === 'rain') {
      this.hoverTarget = 1.25;
    }
  }

  releasePower(power, player) {
    if (this.power === 'ram') {
      const dx = player.x - this.sprite.x;
      const dy = player.y - this.sprite.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.vx = (dx / dist) * power.speed;
      this.vy = (dy / dist) * power.speed;
      this.bounces = 0;
      this.state = 'act';
      this.stateTimer = power.maxTime;
    } else if (this.power === 'bleach') {
      this.scene.spawnBleachWave(this.sprite.x, this.sprite.y);
      this.sprite.clearTint();
      this.state = 'recover';
      this.stateTimer = 0.6;
    } else {
      this.state = 'act';
      this.stateTimer = power.duration;
      this.dropTimer = 0;
      this.noContact = true;
      this.sprite.setAlpha(0.7);
    }
  }

  // Embestida: avanza en línea recta, atraviesa al jugador y rebota en las paredes.
  updateRam(dt, power) {
    this.sprite.x += this.vx * dt;
    this.sprite.y += this.vy * dt;

    let bounced = false;
    if (this.sprite.x < this.radius && this.vx < 0) {
      this.sprite.x = this.radius;
      this.vx = -this.vx;
      bounced = true;
    } else if (this.sprite.x > ARENA_WIDTH - this.radius && this.vx > 0) {
      this.sprite.x = ARENA_WIDTH - this.radius;
      this.vx = -this.vx;
      bounced = true;
    }
    if (this.sprite.y < this.radius && this.vy < 0) {
      this.sprite.y = this.radius;
      this.vy = -this.vy;
      bounced = true;
    } else if (this.sprite.y > ARENA_HEIGHT - this.radius && this.vy > 0) {
      this.sprite.y = ARENA_HEIGHT - this.radius;
      this.vy = -this.vy;
      bounced = true;
    }

    if (bounced) {
      this.bounces += 1;
      this.scene.shake('bossDown', true);
      this.scene.audio.hit();
    }
    if (this.bounces >= power.bounces || this.stateTimer <= 0) {
      this.state = 'recover';
      this.stateTimer = 0.7;
    }
  }

  // Lluvia antiséptica: flota y marca puntos del suelo donde caerán gotas.
  updateRain(dt, power, player) {
    this.dropTimer -= dt;
    while (this.dropTimer <= 0) {
      this.dropTimer += power.dropInterval;
      this.spawnDrop(player);
    }
    if (this.stateTimer <= 0) {
      this.state = 'recover';
      this.stateTimer = 0.5;
      this.noContact = false;
      this.hoverTarget = 1;
      this.sprite.setAlpha(1);
      this.sprite.clearTint();
    }
  }

  spawnDrop(player) {
    const angle = Math.random() * Math.PI * 2;
    // La mitad de las gotas caen cerca del jugador; el resto, repartidas por la zona.
    const reach = Math.random() < 0.45 ? Math.random() * 110 : 80 + Math.random() * 620;
    const x = Phaser.Math.Clamp(player.x + Math.cos(angle) * reach, 60, ARENA_WIDTH - 60);
    const y = Phaser.Math.Clamp(player.y + Math.sin(angle) * reach, 60, ARENA_HEIGHT - 60);
    this.scene.spawnRainMark(x, y);
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
