class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.audio = AudioManager;
    this.phase = 'playing';
    this.wave = 0;
    this.waveTimeLeft = 0;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1;
    this.infinite = false;
    this.coins = 0;
    this.totalCoinsEarned = 0;
    this.kills = 0;
    this.killsByType = { simple: 0, hunter: 0, compound: 0, boss: 0 };
    this.weaponStats = {};
    this.totalTime = 0;
    this.runTime = 0;
    this.nextSpawnId = 1;
    this.bossDefeatedThisWave = false;
    this.deathElapsed = 0;
    this.lastHitShake = 0;
    this.tweens.timeScale = 1;
    this.time.timeScale = 1;
    this.audio.setMusicTempo(1);
    this.musicMode = 'battle';
    this.audio.playMusic('battle');

    this.enemies = [];
    this.projectiles = [];
    this.pendingSpawns = [];
    this.uiBlock = null;

    this.cameras.main.setZoom(DISPLAY_SCALE);
    Transition.in(this);
    this.cameras.main.setBounds(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.add
      .tileSprite(0, 0, ARENA_WIDTH, ARENA_HEIGHT, 'tile')
      .setOrigin(0)
      .setDepth(DEPTH.arena);
    this.decor = ArenaDecor.draw(this);
    this.add
      .rectangle(
        ARENA_WIDTH / 2,
        ARENA_HEIGHT / 2,
        ARENA_WIDTH,
        ARENA_HEIGHT,
        0x000000,
        0
      )
      .setStrokeStyle(8, 0x3a5bd0, 1)
      .setDepth(DEPTH.arena + 1);

    this.player = new Player(this, ARENA_WIDTH / 2, ARENA_HEIGHT / 2);
    this.player.weapons.push(new Weapon(WEAPON_DEFS.toxin));
    this.hands = new PlayerHands(this, this.player);
    this.hands.sync();

    this.cameras.main.startFollow(this.player.sprite, false, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });

    this.buildHUD();
    this.mapView = { want: false, blend: 0, engaged: false };
    this.hazards = [];
    this.hazardGfx = this.add.graphics().setDepth(DEPTH.trail + 1);
    this.hudCompActive = false;
    // Elementos fijos del HUD: se reescalan cuando la cámara se aleja (vista del mapa completo).
    this.hudFix = [
      this.hpBarBg, this.hpBarFill, this.hpText, this.waveText, this.timerText,
      this.coinPanel, this.coinText, this.weaponText, this.noticeText, this.vignette
    ].map(function (obj) {
      return { obj: obj, x: obj.x, y: obj.y };
    });
    this.buildBossBar();

    this.input.keyboard.on('keydown', (event) => this.onKey(event));

    this.startWave(1);
  }

  onKey(event) {
    if (this.phase === 'shop') {
      this.handleShopKey(event);
    } else if (this.phase === 'bossReward') {
      this.handleBossRewardKey(event);
    } else if (this.phase === 'victory') {
      this.handleVictoryKey(event);
    } else if (this.phase === 'playing') {
      if (event.code === 'Escape' || event.code === 'KeyP') {
        this.pauseGame();
      }
    }
  }

  pauseGame() {
    this.scene.launch('PauseScene');
    this.scene.pause();
  }

  update(time, delta) {
    const dt = delta / 1000;
    if (this.phase === 'dying') {
      this.updateDeath(dt);
      return;
    }
    if (this.phase === 'playing' || this.phase === 'shop' || this.phase === 'bossReward') {
      this.runTime += dt;
    }
    if (this.phase !== 'playing') {
      return;
    }

    this.totalTime += dt;
    this.decor.update(dt);

    this.player.update(dt, this.readInput());
    this.hands.update(dt, this);

    for (let i = 0; i < this.player.weapons.length; i++) {
      this.player.weapons[i].update(dt, this.player, this);
    }

    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateSpawnMarkers(dt);
    this.updateWave(dt);
    this.updateHazards(dt);
    this.updateMapView(dt);
    this.updateMusicMode();
    this.updateHUD();
    this.applyHudComp();

    if (this.player.hp <= 0) {
      this.beginDeath();
    }
  }

  readInput() {
    return {
      left: this.cursors.left.isDown || this.wasd.left.isDown,
      right: this.cursors.right.isDown || this.wasd.right.isDown,
      up: this.cursors.up.isDown || this.wasd.up.isDown,
      down: this.cursors.down.isDown || this.wasd.down.isDown
    };
  }

  updateEnemies(dt) {
    this.enemies = this.enemies.filter(function (e) {
      return !e.dead;
    });

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.dead) {
        continue;
      }
      enemy.update(dt, this.player, this.enemies);

      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const d = Math.hypot(dx, dy);
      if (
        this.phase === 'playing' &&
        d < enemy.radius + this.player.radius &&
        enemy.contactTimer <= 0 &&
        !enemy.noContact
      ) {
        enemy.contactTimer = 0.6;
        this.damagePlayer(enemy.damage);
      }
    }
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);
      if (p.dead) {
        if (p.explosive && !p.exploded) {
          this.explodeProjectile(p, p.sprite.x, p.sprite.y);
        }
        this.releaseReservation(p);
        p.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }
      this.checkProjectileHits(p);
    }
  }

  explodeProjectile(projectile, x, y) {
    projectile.exploded = true;
    this.audio.hit();
    this.shake('explosion', true);
    this.applyAoe(
      x,
      y,
      projectile.explosionRadius,
      projectile.damage,
      projectile.explosionColor,
      projectile.weaponKey
    );
  }

  checkProjectileHits(projectile) {
    for (let j = 0; j < this.enemies.length; j++) {
      const enemy = this.enemies[j];
      if (enemy.dead) {
        continue;
      }
      if (projectile.hitIds.indexOf(enemy.id) !== -1) {
        continue;
      }
      const dist = this.segmentDistance(
        enemy.x,
        enemy.y,
        projectile.prevX,
        projectile.prevY,
        projectile.sprite.x,
        projectile.sprite.y
      );
      if (dist < enemy.radius + projectile.radius) {
        if (projectile.explosive) {
          this.explodeProjectile(projectile, enemy.x, enemy.y);
          projectile.dead = true;
          return;
        }
        projectile.hitIds.push(enemy.id);
        this.audio.hit();
        this.shake('hit');
        this.registerWeaponDamage(
          projectile.weaponKey,
          Math.min(projectile.damage, Math.max(0, enemy.hp))
        );
        const killed = enemy.takeDamage(projectile.damage);
        if (killed) {
          this.killEnemy(enemy, projectile.weaponKey);
        }
        if (projectile.pierce > 0) {
          projectile.pierce -= 1;
        } else {
          projectile.dead = true;
          return;
        }
      }
    }
  }

  killEnemy(enemy, weaponKey) {
    if (enemy.dead) {
      return;
    }
    enemy.dead = true;
    this.kills += 1;
    const typeKey = enemy.def.key;
    this.killsByType[typeKey] = (this.killsByType[typeKey] || 0) + 1;
    this.registerWeaponKill(weaponKey);
    const gain = Phaser.Math.Between(enemy.def.coins[0], enemy.def.coins[1]);
    this.coins += gain;
    this.totalCoinsEarned += gain;
    this.spawnCoin(enemy.x, enemy.y, gain);

    if (enemy.isBoss && this.phase === 'playing') {
      this.onBossDefeated(enemy);
    }

    const sprite = enemy.sprite;
    this.tweens.add({
      targets: sprite,
      angle: 360,
      scale: 0,
      alpha: 0,
      duration: 300,
      onComplete: () => sprite.destroy()
    });
  }

  updateWave(dt) {
    if (this.phase !== 'playing') {
      return;
    }
    this.waveTimeLeft = Math.max(0, this.waveTimeLeft - dt);

    if (this.spawnQueue.length === 0) {
      this.spawnQueue = buildSpawnQueue(this.wave);
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnInterval;
      const type = this.spawnQueue.shift();
      this.queueSpawn(type);
    }

    // Ronda de jefe: si el tiempo se acabó pero el jefe sigue vivo (o por aparecer), la oleada se prolonga.
    if (this.waveTimeLeft <= 0 && !this.bossPending()) {
      this.endWave();
    }
  }

  bossPending() {
    if (!isBossWave(this.wave) || this.bossDefeatedThisWave) {
      return false;
    }
    return true;
  }

  // ---- Poderes de los jefes ----

  damagePlayer(amount) {
    this.player.takeDamage(amount);
    this.audio.hurt();
    this.shake('hurt', true);
  }

  // Embestida: la cámara se aleja hasta encuadrar toda la arena y queda fija.
  beginMapView() {
    if (this.phase === 'playing') {
      this.mapView.want = true;
    }
  }

  endMapView(immediate) {
    const mv = this.mapView;
    if (!mv) {
      return;
    }
    mv.want = false;
    if (immediate) {
      mv.blend = 0;
      this.finishMapView();
    }
  }

  finishMapView() {
    const mv = this.mapView;
    if (!mv.engaged) {
      return;
    }
    mv.engaged = false;
    const camera = this.cameras.main;
    camera.setZoom(DISPLAY_SCALE);
    camera.centerOn(this.player.x, this.player.y);
    camera.setBounds(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    camera.startFollow(this.player.sprite, false, 0.1, 0.1);
    this.applyHudComp();
  }

  updateMapView(dt) {
    const mv = this.mapView;
    const target = mv.want ? 1 : 0;
    if (mv.blend === target && !mv.engaged) {
      return;
    }
    const camera = this.cameras.main;
    if (!mv.engaged) {
      mv.engaged = true;
      camera.stopFollow();
      camera.removeBounds();
    }
    const step = dt / MAP_VIEW_BLEND_TIME;
    mv.blend = mv.blend < target ? Math.min(target, mv.blend + step) : Math.max(target, mv.blend - step);
    const e = mv.blend * mv.blend * (3 - 2 * mv.blend);
    camera.setZoom(Phaser.Math.Linear(DISPLAY_SCALE, MAP_VIEW_ZOOM, e));
    camera.centerOn(
      Phaser.Math.Linear(this.player.x, ARENA_WIDTH / 2, e),
      Phaser.Math.Linear(this.player.y, ARENA_HEIGHT / 2, e)
    );
    if (mv.blend === 0 && !mv.want) {
      this.finishMapView();
    }
  }

  // Con el zoom alejado, el HUD (scrollFactor 0) se achicaría: se compensa posición y escala.
  applyHudComp() {
    const k = DISPLAY_SCALE / this.cameras.main.zoom;
    const active = Math.abs(k - 1) > 0.001;
    if (!active && !this.hudCompActive) {
      return;
    }
    this.hudCompActive = active;
    const cx = RENDER_WIDTH / 2;
    const cy = RENDER_HEIGHT / 2;
    this.hudFix.forEach((item) => {
      item.obj.setPosition(cx + (item.x - cx) * k, cy + (item.y - cy) * k);
      if (item.obj === this.hpBarFill) {
        item.obj.setScale(item.obj.scaleX * k, k);
      } else {
        item.obj.setScale(k);
      }
    });
    this.bossBar.setScale(k);
  }

  spawnBleachWarning(x, y, radius, duration) {
    this.hazards.push({ kind: 'warn', x: x, y: y, r: radius, dur: duration, age: 0 });
  }

  spawnBleachWave(x, y) {
    this.hazards.push({
      kind: 'ring',
      x: x,
      y: y,
      r: 30,
      age: 0,
      hit: false,
      offset: Math.random() * Math.PI * 2
    });
    this.audio.boss();
    this.shake('bossDown', true);
  }

  spawnRainMark(x, y) {
    this.hazards.push({ kind: 'mark', x: x, y: y, age: 0 });
  }

  // ¿El ángulo cae en uno de los huecos seguros del anillo?
  inRingGap(angle, offset, power) {
    for (let i = 0; i < power.gaps; i++) {
      const center = offset + (i * Math.PI * 2) / power.gaps;
      let diff = Math.abs(angle - center) % (Math.PI * 2);
      if (diff > Math.PI) {
        diff = Math.PI * 2 - diff;
      }
      if (diff < power.gapWidth / 2) {
        return true;
      }
    }
    return false;
  }

  updateHazards(dt) {
    const g = this.hazardGfx;
    g.clear();
    const bleach = BOSS_POWERS.bleach;
    const rain = BOSS_POWERS.rain;

    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.age += dt;
      let done = false;
      const dx = this.player.x - h.x;
      const dy = this.player.y - h.y;
      const dist = Math.hypot(dx, dy);

      if (h.kind === 'warn') {
        const pulse = 0.5 + 0.5 * Math.sin(h.age * 14);
        g.fillStyle(0xffffff, 0.05 + 0.08 * pulse);
        g.fillCircle(h.x, h.y, h.r);
        g.lineStyle(6, 0xff5e5e, 0.45 + 0.4 * pulse);
        g.strokeCircle(h.x, h.y, h.r);
        done = h.age >= h.dur;
      } else if (h.kind === 'ring') {
        h.r += bleach.ringSpeed * dt;
        const thick = bleach.ringThickness;
        g.fillStyle(0xe8fbff, 0.85);
        const step = (thick * 0.4) / h.r;
        for (let a = 0; a < Math.PI * 2; a += step) {
          if (!this.inRingGap(a, h.offset, bleach)) {
            g.fillCircle(h.x + Math.cos(a) * h.r, h.y + Math.sin(a) * h.r, thick / 2);
          }
        }
        if (!h.hit && this.phase === 'playing' && Math.abs(dist - h.r) < thick / 2 + this.player.radius * 0.5) {
          if (!this.inRingGap(Math.atan2(dy, dx), h.offset, bleach)) {
            h.hit = true;
            this.damagePlayer(bleach.damage);
          }
        }
        done = h.r > bleach.radius + thick;
      } else if (h.kind === 'mark') {
        const t = Math.min(1, h.age / rain.markTime);
        g.fillStyle(0x4bcffa, 0.18 + 0.2 * t);
        g.fillCircle(h.x, h.y, rain.puddleRadius * t);
        g.lineStyle(4, 0xff9f43, 0.55 + 0.35 * Math.sin(h.age * 18));
        g.strokeCircle(h.x, h.y, rain.puddleRadius);
        if (h.age >= rain.markTime) {
          h.kind = 'puddle';
          h.age = 0;
          h.tick = 0;
          this.audio.hit();
        }
      } else if (h.kind === 'puddle') {
        const fade = Math.min(1, (rain.puddleLife - h.age) / 1);
        g.fillStyle(0x7fdcff, 0.38 * fade);
        g.fillCircle(h.x, h.y, rain.puddleRadius);
        g.lineStyle(3, 0xcff6ff, 0.8 * fade);
        g.strokeCircle(h.x, h.y, rain.puddleRadius);
        h.tick -= dt;
        if (this.phase === 'playing' && dist < rain.puddleRadius + this.player.radius * 0.6 && h.tick <= 0) {
          h.tick = rain.tickInterval;
          this.damagePlayer(rain.tickDamage);
        }
        done = h.age >= rain.puddleLife;
      }

      if (done) {
        this.hazards.splice(i, 1);
      }
    }
  }

  // Con un jefe presente (o a punto de aparecer) suena la pista pesada; si no, la de ronda normal.
  updateMusicMode() {
    // En la tienda y en la recompensa del jefe manda la pista de tienda.
    if (this.phase !== 'playing') {
      return;
    }
    const bossPresent =
      this.enemies.some(function (e) {
        return e.isBoss && !e.dead;
      }) ||
      this.pendingSpawns.some(function (ps) {
        return ps.type === 'boss';
      });
    const mode = bossPresent ? 'boss' : 'battle';
    if (mode !== this.musicMode) {
      this.musicMode = mode;
      this.audio.playMusic(mode);
    }
  }

  queueSpawn(type) {
    const isBoss = type === 'boss';
    const pos = EnemyFactory.randomNearPlayer(
      type,
      this.player,
      isBoss ? SPAWN_BOSS_MIN : SPAWN_NEAR_MIN,
      isBoss ? SPAWN_BOSS_MAX : SPAWN_NEAR_MAX
    );
    const def = ENEMY_DEFS[type] || ENEMY_DEFS.simple;
    const marker = this.add
      .image(pos.x, pos.y, 'spawn_cross')
      .setTint(0xeb3b5a)
      .setDepth(DEPTH.trail + 1);
    const baseScale = (def.radius / 16) * (isBoss ? 1.6 : 1);
    marker.setScale(baseScale);
    this.pendingSpawns.push({
      x: pos.x,
      y: pos.y,
      type: type,
      timer: isBoss ? SPAWN_TELEGRAPH + 0.6 : SPAWN_TELEGRAPH,
      marker: marker,
      baseScale: baseScale
    });
  }

  updateSpawnMarkers(dt) {
    for (let i = this.pendingSpawns.length - 1; i >= 0; i--) {
      const ps = this.pendingSpawns[i];
      ps.timer -= dt;
      const blink = 0.25 + 0.65 * Math.abs(Math.sin(ps.timer * 16));
      ps.marker.setAlpha(blink);
      ps.marker.setScale(ps.baseScale * (1 + Math.sin(ps.timer * 22) * 0.12));

      if (ps.timer <= 0) {
        ps.marker.destroy();
        this.enemies.push(EnemyFactory.create(this, ps.type, ps.x, ps.y));
        this.pendingSpawns.splice(i, 1);
      }
    }
  }

  clearPendingSpawns() {
    this.pendingSpawns.forEach(function (ps) {
      ps.marker.destroy();
    });
    this.pendingSpawns = [];
  }

  clearBattlefield() {
    this.clearPendingSpawns();
    this.endMapView(true);
    this.hazards = [];
    this.hazardGfx.clear();

    this.enemies.forEach((enemy) => {
      if (enemy.sprite && enemy.sprite.active) {
        this.tweens.killTweensOf(enemy.sprite);
        enemy.sprite.destroy();
      }
      enemy.dead = true;
    });
    this.enemies = [];

    this.projectiles.forEach((projectile) => {
      if (projectile.sprite && projectile.sprite.active) {
        projectile.sprite.destroy();
      }
    });
    this.projectiles = [];
  }

  resetArenaForWave() {
    this.clearBattlefield();
    this.player.hp = this.player.maxHp;
    this.player.sprite.setPosition(ARENA_WIDTH / 2, ARENA_HEIGHT / 2);
    this.cameras.main.centerOn(ARENA_WIDTH / 2, ARENA_HEIGHT / 2);
  }

  startWave(wave) {
    this.resetArenaForWave();
    this.bossDefeatedThisWave = false;
    this.wave = wave;
    this.waveTimeLeft = waveDuration(wave);
    this.spawnQueue = buildSpawnQueue(wave);
    this.spawnInterval = waveSpawnInterval(wave);
    this.spawnTimer = 0.2;

    if (isBossWave(wave)) {
      this.queueSpawn('boss');
      this.showNotice(t('¡{name} se acerca!', { name: bossNameForWave(ENEMY_DEFS.boss, wave) }));
      this.audio.boss();
      this.cameras.main.shake(400, 0.01);
    }
  }

  endWave() {
    this.audio.waveEnd();
    this.clearBattlefield();

    // La recompensa del jefe se entrega al terminar el tiempo de la oleada.
    if (this.bossDefeatedThisWave) {
      this.bossDefeatedThisWave = false;
      this.showBossReward();
      return;
    }

    this.afterWave();
  }

  afterWave() {
    if (!this.infinite && this.wave >= TOTAL_WAVES) {
      this.showVictory();
      return;
    }

    this.openShop();
  }

  onBossDefeated(enemy) {
    this.bossDefeatedThisWave = true;
    this.defeatedBossName = enemy.name;
    this.endMapView();
    this.audio.waveEnd();
    this.shake('bossDown', true);
    this.spawnBannerText(enemy.x, enemy.y - 90, t('¡{name} DERROTADO!', { name: enemy.name.toUpperCase() }));
    if (this.waveTimeLeft > 0) {
      this.showNotice(t('{name} derrotado: sobreviví hasta que termine el tiempo para tu recompensa', { name: enemy.name }));
    }
  }

  nextWave() {
    this.startWave(this.wave + 1);
    this.phase = 'playing';
  }

  showBossReward() {
    this.phase = 'bossReward';
    this.playShopMusic();
    this.bossRewardOptions = this.buildShopOptions();
    this.buildOverlay(
      t('{name} DERROTADO', { name: (this.defeatedBossName || t('JEFE')).toUpperCase() }),
      t('Elegí una recompensa gratis (1 / 2 / 3)')
    );
    this.raiseCoinHud();
    this.buildBossRewardCards();
  }

  buildBossRewardCards() {
    const startX = GAME_WIDTH / 2 - 340;
    this.bossRewardOptions.forEach((opt, i) => {
      const x = startX + i * 340;
      const y = 360;

      const card = this.add
        .rectangle(x, y, 300, 230, 0x1d2a54, 0.95)
        .setStrokeStyle(3, 0x9be15d, 1)
        .toHud()
        .setDepth(DEPTH.overlay + 1)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.chooseBossReward(i));

      const title = this.add
        .text(x, y - 70, opt.name, {
          fontFamily: FONT_FAMILY,
          fontSize: '24px',
          color: '#e8f0ff',
          align: 'center',
          wordWrap: { width: 270 }
        })
        .setOrigin(0.5)
        .toHud()
        .setDepth(DEPTH.overlay + 2);

      const desc = this.add
        .text(x, y + 10, opt.desc, {
          fontFamily: FONT_FAMILY,
          fontSize: '18px',
          color: COLORS.textDim,
          align: 'center',
          wordWrap: { width: 270 }
        })
        .setOrigin(0.5)
        .toHud()
        .setDepth(DEPTH.overlay + 2);

      const cost = this.add
        .text(x, y + 80, t('Gratis'), {
          fontFamily: FONT_FAMILY,
          fontSize: '22px',
          color: '#9be15d'
        })
        .setOrigin(0.5)
        .toHud()
        .setDepth(DEPTH.overlay + 2);

      this.overlay.push(card, title, desc, cost);
    });
  }

  handleBossRewardKey(event) {
    if (event.key === '1' || event.key === '2' || event.key === '3') {
      this.chooseBossReward(parseInt(event.key, 10) - 1);
    }
  }

  chooseBossReward(index) {
    if (this.phase !== 'bossReward') {
      return;
    }
    const opt = this.bossRewardOptions[index];
    if (!opt || opt.sold) {
      return;
    }

    if (opt.kind === 'upgrade') {
      opt.apply(this.player);
    } else {
      const owned = this.player.getWeapon(opt.weaponKey);
      if (owned) {
        owned.level += 1;
      } else {
        this.player.weapons.push(new Weapon(WEAPON_DEFS[opt.weaponKey]));
      }
    }
    opt.sold = true;
    this.audio.buy();
    this.clearOverlay();
    this.restoreCoinHud();
    this.afterWave();
  }

  buildRunStats() {
    let bestDamage = null;
    let bestShots = null;
    let bestKills = null;

    Object.keys(this.weaponStats).forEach((key) => {
      const def = WEAPON_DEFS[key];
      const entry = {
        key: key,
        name: def ? def.name : key,
        damage: Math.round(this.weaponStats[key].damage),
        shots: this.weaponStats[key].shots,
        kills: this.weaponStats[key].kills
      };
      if (!bestDamage || entry.damage > bestDamage.damage) {
        bestDamage = entry;
      }
      if (!bestShots || entry.shots > bestShots.shots) {
        bestShots = entry;
      }
      if (!bestKills || entry.kills > bestKills.kills) {
        bestKills = entry;
      }
    });

    return {
      coinsEarned: this.totalCoinsEarned,
      kills: this.kills,
      killsByType: {
        simple: this.killsByType.simple || 0,
        hunter: this.killsByType.hunter || 0,
        compound: this.killsByType.compound || 0,
        boss: this.killsByType.boss || 0
      },
      bosses: this.killsByType.boss || 0,
      time: Math.floor(this.runTime),
      bestDamage: bestDamage,
      bestShots: bestShots,
      bestKills: bestKills,
      weapons: this.player.weapons.map(function (weapon) {
        return { name: weapon.def.name, level: weapon.level };
      }),
      player: {
        maxHp: this.player.maxHp,
        speed: Math.round(this.player.speed),
        speedPct: Math.round((this.player.speedMul - 1) * 100),
        damagePct: Math.round((this.player.damageMul - 1) * 100),
        fireRatePct: Math.round((this.player.fireRateMul - 1) * 100),
        areaPct: Math.round((this.player.areaMul - 1) * 100),
        pierce: this.player.pierceBonus
      }
    };
  }

  // Muerte: cámara lenta + zoom hacia el personaje antes de mostrar las estadísticas.
  beginDeath() {
    this.phase = 'dying';
    this.endMapView(true);
    this.deathElapsed = 0;
    this.clearPendingSpawns();
    this.setHudVisible(false);
    this.audio.gameOver();
    this.audio.fadeMusic(DEATH.duration);

    const camera = this.cameras.main;
    camera.removeBounds();
    camera.flash(220, 255, 70, 70);
    this.deathStartZoom = camera.zoom;
    this.deathDir = this.player.sprite.flipX ? -1 : 1;
    this.player.sprite.setTint(0xff5555);
    this.hands.fadeOut(DEATH.duration * 400);
    this.shake('hurt', true);
    this.spawnDeathBurst(this.player.x, this.player.y);
  }

  updateDeath(realDt) {
    this.deathElapsed += realDt;
    const elapsed = this.deathElapsed;

    const ramp = Phaser.Math.Clamp(elapsed / DEATH.rampTime, 0, 1);
    const slow = Phaser.Math.Linear(1, DEATH.minTimeScale, ramp * ramp * (3 - 2 * ramp));
    this.tweens.timeScale = slow;
    this.time.timeScale = slow;
    this.audio.setMusicTempo(slow);

    const dt = realDt * slow;
    this.updateEnemies(dt);
    this.updateProjectiles(dt);

    const t = Math.min(1, elapsed / DEATH.duration);
    const ease = t * t * (3 - 2 * t);
    this.cameras.main.setZoom(
      Phaser.Math.Linear(this.deathStartZoom, this.deathStartZoom * DEATH.zoomMultiplier, ease)
    );

    const sprite = this.player.sprite;
    const shrink = this.player.baseScale * (1 - 0.3 * ease);
    sprite.setScale(shrink, shrink);
    sprite.setAngle(this.deathDir * 80 * ease);
    sprite.setAlpha(1 - 0.45 * ease);

    if (elapsed >= DEATH.duration) {
      this.finishRun(false);
    }
  }

  spawnDeathBurst(x, y) {
    for (let i = 0; i < 16; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(50, 140);
      const size = Phaser.Math.FloatBetween(0.5, 1.1);
      const p = this.add.image(x, y, 'particle').setDepth(DEPTH.effect);
      p.setTint(i % 3 === 0 ? 0xff5555 : COLORS.player).setScale(size);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        scale: size * 0.2,
        alpha: 0,
        duration: Phaser.Math.Between(700, 1200),
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  // Cierra la partida (derrota o victoria) y muestra las estadísticas sobre la partida detenida.
  finishRun(victory) {
    const stats = this.buildRunStats();
    const time = Math.floor(this.totalTime);
    const records = ScoreStore.save({
      coins: this.coins,
      wave: this.wave,
      time: time,
      kills: this.kills
    });
    this.clearOverlay();
    this.setHudVisible(false);
    this.phase = 'finished';
    this.scene.launch('GameOverScene', {
      victory: victory,
      coins: this.coins,
      wave: this.wave,
      time: time,
      kills: this.kills,
      records: records,
      stats: stats
    });
    this.scene.pause();
  }

  setHudVisible(visible) {
    [
      this.hpBarBg,
      this.hpBarFill,
      this.hpText,
      this.waveText,
      this.timerText,
      this.coinPanel,
      this.coinText,
      this.weaponText,
      this.vignette,
      this.noticeText,
      this.bossBar
    ].forEach(function (obj) {
      if (obj) {
        obj.setVisible(visible);
      }
    });
  }

  showVictory() {
    this.phase = 'victory';
    this.victoryButtons = [
      { label: t('Terminar'), action: () => this.finishVictory() },
      { label: t('Modo infinito'), action: () => this.enterInfinite() }
    ];
    this.victoryIndex = 0;
    this.buildOverlay(t('VICTORIA'), t('Sobreviviste las 9 oleadas'));
    this.renderOverlayButtons(this.victoryButtons);
  }

  finishVictory() {
    this.finishRun(true);
  }

  enterInfinite() {
    this.clearOverlay();
    this.infinite = true;
    this.nextWave();
  }

  handleVictoryKey(event) {
    if (event.key === '1') {
      this.finishVictory();
    } else if (event.key === '2') {
      this.enterInfinite();
    }
  }

  // La tienda y la recompensa del jefe comparten pista.
  playShopMusic() {
    if (this.musicMode !== 'shop') {
      this.musicMode = 'shop';
      this.audio.playMusic('shop');
    }
  }

  openShop() {
    this.phase = 'shop';
    this.playShopMusic();
    this.shopRerolls = 0;
    this.shopIndex = 0;
    this.shopOptions = this.buildShopOptions();
    this.buildOverlay(
      t('TIENDA'),
      t('Elegí una mejora (precios x{mult})', { mult: shopPriceMultiplier(this.wave).toFixed(1) })
    );
    this.raiseCoinHud();
    this.buildCards();
    this.buildShopButtons();
    this.buildSellSection();
    this.refreshShop();
  }

  getRerollCost() {
    const base = REROLL_BASE_COST + REROLL_COST_STEP * this.shopRerolls;
    return shopPrice(base, this.wave);
  }

  raiseCoinHud() {
    this.coinPanel.setDepth(DEPTH.overlay + 3);
    this.coinText.setDepth(DEPTH.overlay + 4);
  }

  restoreCoinHud() {
    this.coinPanel.setDepth(DEPTH.hud);
    this.coinText.setDepth(DEPTH.hud + 1);
  }

  buildShopOptions() {
    const pool = [];

    UPGRADE_DEFS.forEach((up) => {
      pool.push({
        kind: 'upgrade',
        name: t(up.name),
        desc: t(up.desc),
        cost: shopPrice(up.baseCost, this.wave),
        apply: up.apply,
        sold: false
      });
    });

    Object.keys(WEAPON_DEFS).forEach((key) => {
      const def = WEAPON_DEFS[key];
      const owned = this.player.hasWeapon(key);
      if (!owned && this.player.weapons.length >= PLAYER_DEF.maxWeapons) {
        return;
      }
      pool.push({
        kind: 'weapon',
        weaponKey: key,
        name: t(def.name),
        desc: owned ? t('Acoplar (subir nivel)') : t('Nueva arma'),
        cost: shopPrice(WEAPON_BASE_COST, this.wave),
        owned: owned,
        sold: false
      });
    });

    Phaser.Utils.Array.Shuffle(pool);
    return pool.slice(0, 3);
  }

  buildCards() {
    this.destroyCards();
    this.shopCards = [];
    const startX = GAME_WIDTH / 2 - 340;

    this.shopOptions.forEach((opt, i) => {
      const x = startX + i * 340;
      const y = 330;

      const card = this.add
        .rectangle(x, y, 300, 230, 0x1d2a54, 0.95)
        .setStrokeStyle(3, 0x3a5bd0, 1)
        .toHud()
        .setDepth(DEPTH.overlay + 1)
        .setInteractive({ useHandCursor: true });

      card.on('pointerover', () => {
        if (this.shopIndex !== i) {
          this.audio.uiMove();
        }
        this.shopIndex = i;
        this.refreshShop();
      });
      card.on('pointerdown', () => this.chooseShopOption(i));

      const title = this.add
        .text(x, y - 70, opt.name, {
          fontFamily: FONT_FAMILY,
          fontSize: '24px',
          color: '#e8f0ff',
          align: 'center',
          wordWrap: { width: 270 }
        })
        .setOrigin(0.5)
        .toHud()
        .setDepth(DEPTH.overlay + 2);

      const desc = this.add
        .text(x, y + 10, opt.desc, {
          fontFamily: FONT_FAMILY,
          fontSize: '18px',
          color: COLORS.textDim,
          align: 'center',
          wordWrap: { width: 270 }
        })
        .setOrigin(0.5)
        .toHud()
        .setDepth(DEPTH.overlay + 2);

      const cost = this.add
        .text(x, y + 80, t('{n} monedas', { n: opt.cost }), {
          fontFamily: FONT_FAMILY,
          fontSize: '20px',
          color: '#9be15d'
        })
        .setOrigin(0.5)
        .toHud()
        .setDepth(DEPTH.overlay + 2);

      this.shopCards.push({ card, title, desc, cost });
    });
  }

  buildShopButtons() {
    this.destroyShopButtons();

    this.rerollBtn = this.add
      .text(440, 490, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
        color: '#9be15d'
      })
      .setOrigin(0.5)
      .toHud()
      .setDepth(DEPTH.overlay + 2)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.rerollShop());

    this.continueBtn = this.add
      .text(840, 490, t('[ Enter ] Continuar'), {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
        color: '#9be15d'
      })
      .setOrigin(0.5)
      .toHud()
      .setDepth(DEPTH.overlay + 2)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.closeShop());

    this.shopHint = this.add
      .text(GAME_WIDTH / 2, 688, t('1 / 2 / 3 comprar     R reroll     Enter continuar'), {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: COLORS.textDim
      })
      .setOrigin(0.5)
      .toHud()
      .setDepth(DEPTH.overlay + 2);

    this.shopButtons = [this.rerollBtn, this.continueBtn, this.shopHint];
  }

  buildSellSection() {
    this.destroySellSection();

    this.sellTitle = this.add
      .text(24, 575, t('Vender armas (clic):'), {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: COLORS.text
      })
      .setOrigin(0, 0.5)
      .toHud()
      .setDepth(DEPTH.overlay + 2);

    this.sellChips = [];

    if (this.player.weapons.length <= 1) {
      this.sellChips.push(
        this.add
          .text(230, 575, t('(no podes vender tu unica arma)'), {
            fontFamily: FONT_FAMILY,
            fontSize: '16px',
            color: COLORS.textDim
          })
          .setOrigin(0, 0.5)
          .toHud()
          .setDepth(DEPTH.overlay + 2)
      );
      return;
    }

    this.player.weapons.forEach((w, i) => {
      const chipX = 24 + i * 300;
      const chip = this.add
        .text(
          chipX,
          615,
          t(w.def.name) + ' ' + t('Nv.') + w.level + '  (+' + SELL_WEAPON_VALUE + ')',
          {
            fontFamily: FONT_FAMILY,
            fontSize: '16px',
            color: '#ffd166'
          }
        )
        .setOrigin(0, 0.5)
        .toHud()
        .setDepth(DEPTH.overlay + 3)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => chip.setColor('#ff9f43'))
        .on('pointerout', () => chip.setColor('#ffd166'))
        .on('pointerdown', () => this.sellWeapon(w.def.key));
      this.sellChips.push(chip);
    });
  }

  sellWeapon(weaponKey) {
    if (this.player.weapons.length <= 1) {
      this.audio.uiDeny();
      return;
    }
    const idx = this.player.weapons.findIndex(function (w) {
      return w.def.key === weaponKey;
    });
    if (idx === -1) {
      return;
    }
    this.player.weapons.splice(idx, 1);
    this.coins += SELL_WEAPON_VALUE;
    this.totalCoinsEarned += SELL_WEAPON_VALUE;
    this.audio.buy();
    this.buildSellSection();
    this.refreshShop();
  }

  refreshShop() {
    const rerollCost = this.getRerollCost();
    this.coinText.setText(t('Monedas:') + ' ' + this.coins);
    if (this.rerollBtn) {
      this.rerollBtn.setText('[ R ] Reroll (' + rerollCost + ')');
      this.rerollBtn.setColor(this.coins >= rerollCost ? '#9be15d' : '#eb3b5a');
    }

    if (!this.shopCards) {
      return;
    }

    this.shopCards.forEach((c, i) => {
      const opt = this.shopOptions[i];
      const selected = i === this.shopIndex;
      const affordable = this.coins >= opt.cost && !opt.sold;

      c.card.setStrokeStyle(3, opt.sold ? 0x555f7a : selected ? 0x9be15d : 0x3a5bd0, 1);
      c.card.setFillStyle(opt.sold ? 0x161d33 : 0x1d2a54, 0.95);
      c.title.setColor(opt.sold ? '#6b7690' : '#e8f0ff');
      c.desc.setText(opt.sold ? t('Comprado') : opt.desc);
      c.desc.setColor(opt.sold ? '#6b7690' : COLORS.textDim);
      c.cost.setText(opt.sold ? '--' : t('{n} monedas', { n: opt.cost }));
      c.cost.setColor(opt.sold ? '#6b7690' : affordable ? '#9be15d' : '#eb3b5a');
    });
  }

  handleShopKey(event) {
    if (this.choiceButtons) {
      return;
    }
    if (event.key === '1' || event.key === '2' || event.key === '3') {
      this.chooseShopOption(parseInt(event.key, 10) - 1);
    } else if (event.key === 'r' || event.key === 'R') {
      this.rerollShop();
    } else if (event.key === 'Enter' || event.key === 'c' || event.key === 'C') {
      this.closeShop();
    }
  }

  chooseShopOption(index) {
    const opt = this.shopOptions[index];
    if (!opt || opt.sold) {
      return;
    }
    if (this.coins < opt.cost) {
      this.audio.uiDeny();
      return;
    }

    if (opt.kind === 'upgrade') {
      this.purchaseUpgrade(opt);
      return;
    }

    const owned = this.player.hasWeapon(opt.weaponKey);
    const freeSlot = this.player.weapons.length < PLAYER_DEF.maxWeapons;
    if (owned && freeSlot) {
      this.showWeaponChoice(opt, index);
    } else {
      this.purchaseWeapon(opt, owned ? 'annex' : 'equip');
    }
  }

  purchaseUpgrade(opt) {
    this.coins -= opt.cost;
    opt.apply(this.player);
    opt.sold = true;
    this.audio.buy();
    this.refreshShop();
  }

  purchaseWeapon(opt, mode) {
    this.coins -= opt.cost;
    if (mode === 'annex') {
      const weapon = this.player.getWeapon(opt.weaponKey);
      if (weapon) {
        weapon.level += 1;
      }
    } else {
      this.player.weapons.push(new Weapon(WEAPON_DEFS[opt.weaponKey]));
    }
    opt.sold = true;
    this.audio.buy();
    this.buildSellSection();
    this.refreshShop();
  }

  rerollShop() {
    const cost = this.getRerollCost();
    if (this.coins < cost) {
      this.audio.uiDeny();
      return;
    }
    this.coins -= cost;
    this.shopRerolls += 1;
    this.shopIndex = 0;
    this.shopOptions = this.buildShopOptions();
    this.buildCards();
    this.refreshShop();
    this.audio.buy();
  }

  showWeaponChoice(opt, index) {
    this.weaponChoice = opt;
    this.weaponChoiceIndex = index;
    const choices = [t('Equipar en espacio libre'), t('Acoplar (subir nivel)')];
    this.choiceButtons = [];

    choices.forEach((label, i) => {
      const btn = this.add
        .text(GAME_WIDTH / 2, 560 + i * 44, (i === 0 ? '[ E ] ' : '[ A ] ') + label, {
          fontFamily: FONT_FAMILY,
          fontSize: '20px',
          color: COLORS.text
        })
        .setOrigin(0.5)
        .toHud()
        .setDepth(DEPTH.overlay + 6)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.resolveWeaponChoice(i === 1 ? 'annex' : 'equip'));
      this.choiceButtons.push(btn);
    });

    this.choiceKey = (event) => {
      if (event.key === 'e' || event.key === 'E') {
        this.resolveWeaponChoice('equip');
      } else if (event.key === 'a' || event.key === 'A') {
        this.resolveWeaponChoice('annex');
      }
    };
    this.input.keyboard.on('keydown', this.choiceKey);
  }

  resolveWeaponChoice(mode) {
    if (this.choiceKey) {
      this.input.keyboard.off('keydown', this.choiceKey);
      this.choiceKey = null;
    }
    if (this.choiceButtons) {
      this.choiceButtons.forEach((b) => b.destroy());
      this.choiceButtons = null;
    }
    this.purchaseWeapon(this.weaponChoice, mode);
  }

  closeShop() {
    this.audio.uiSelect();
    this.clearOverlay();
    this.restoreCoinHud();
    this.nextWave();
  }

  destroyCards() {
    if (this.shopCards) {
      this.shopCards.forEach((c) => {
        c.card.destroy();
        c.title.destroy();
        c.desc.destroy();
        c.cost.destroy();
      });
      this.shopCards = null;
    }
  }

  destroyShopButtons() {
    if (this.shopButtons) {
      this.shopButtons.forEach((b) => b.destroy());
      this.shopButtons = null;
    }
  }

  destroySellSection() {
    if (this.sellTitle) {
      this.sellTitle.destroy();
      this.sellTitle = null;
    }
    if (this.sellChips) {
      this.sellChips.forEach((c) => c.destroy());
      this.sellChips = null;
    }
  }

  clearCards() {
    this.destroyCards();
    this.destroyShopButtons();
    this.destroySellSection();
  }

  buildOverlay(title, subtitle) {
    this.overlay = [];
    this.overlay.push(
      this.add
        .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070f, 0.8)
        .toHud()
        .setDepth(DEPTH.overlay)
    );
    this.overlay.push(
      this.add
        .text(GAME_WIDTH / 2, 150, title, {
          fontFamily: FONT_FAMILY,
          fontSize: '48px',
          color: '#e8f0ff'
        })
        .setOrigin(0.5)
        .toHud()
        .setDepth(DEPTH.overlay + 1)
    );
    this.overlayTitle = this.add
      .text(GAME_WIDTH / 2, 200, subtitle, {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
        color: COLORS.textDim
      })
      .setOrigin(0.5)
      .toHud()
      .setDepth(DEPTH.overlay + 1);
    this.overlay.push(this.overlayTitle);
  }

  renderOverlayButtons(buttons) {
    this.overlayButtons = [];
    buttons.forEach((b, i) => {
      const btn = this.add
        .text(GAME_WIDTH / 2, 400 + i * 70, '[ ' + (i + 1) + ' ] ' + b.label, {
          fontFamily: FONT_FAMILY,
          fontSize: '30px',
          color: COLORS.text
        })
        .setOrigin(0.5)
        .toHud()
        .setDepth(DEPTH.overlay + 2)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.audio.uiSelect();
          b.action();
        });
      this.overlayButtons.push(btn);
    });
  }

  clearOverlay() {
    if (this.overlay) {
      this.overlay.forEach((o) => o.destroy());
      this.overlay = null;
    }
    this.clearCards();
    if (this.overlayButtons) {
      this.overlayButtons.forEach((b) => b.destroy());
      this.overlayButtons = null;
    }
  }

  spawnProjectile(x, y, vx, vy, options) {
    this.projectiles.push(new Projectile(this, x, y, vx, vy, options));
  }

  getWeaponStats(key) {
    if (!this.weaponStats[key]) {
      this.weaponStats[key] = { shots: 0, damage: 0, kills: 0 };
    }
    return this.weaponStats[key];
  }

  registerWeaponShot(key) {
    if (!key) {
      return;
    }
    this.getWeaponStats(key).shots += 1;
  }

  registerWeaponDamage(key, amount) {
    if (!key || amount <= 0) {
      return;
    }
    this.getWeaponStats(key).damage += amount;
  }

  registerWeaponKill(key) {
    if (!key) {
      return;
    }
    this.getWeaponStats(key).kills += 1;
  }

  applyAoe(x, y, radius, damage, color, weaponKey) {
    const ring = this.add.image(x, y, 'particle').setDepth(DEPTH.effect);
    ring.setTint(color);
    ring.setDisplaySize(radius, radius).setAlpha(0.5);
    this.tweens.add({
      targets: ring,
      displayWidth: radius * 2.4,
      displayHeight: radius * 2.4,
      alpha: 0,
      duration: 350,
      onComplete: () => ring.destroy()
    });

    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (enemy.dead) {
        continue;
      }
      const d = Math.hypot(enemy.x - x, enemy.y - y);
      if (d < radius + enemy.radius) {
        this.registerWeaponDamage(weaponKey, Math.min(damage, Math.max(0, enemy.hp)));
        const killed = enemy.takeDamage(damage);
        if (killed) {
          this.killEnemy(enemy, weaponKey);
        }
      }
    }
  }

  // Vibración breve de cámara. `force` interrumpe una vibración en curso.
  shake(kind, force) {
    const preset = SHAKE[kind];
    if (!preset) {
      return;
    }
    if (kind === 'hit') {
      const now = performance.now();
      if (now - this.lastHitShake < 90) {
        return;
      }
      this.lastHitShake = now;
    }
    this.cameras.main.shake(preset.duration, preset.intensity, !!force);
  }

  // Polvo que levanta el personaje al moverse (dirX/dirY: dirección normalizada de avance).
  spawnDust(x, y, dirX, dirY) {
    for (let i = 0; i < 2; i++) {
      const size = Phaser.Math.FloatBetween(0.35, 0.7);
      const puff = this.add
        .image(x + Phaser.Math.Between(-7, 7), y + Phaser.Math.Between(-3, 3), 'particle')
        .setDepth(DEPTH.player - 1)
        .setTint(0xd8d2c0)
        .setAlpha(0.45)
        .setScale(size);
      this.tweens.add({
        targets: puff,
        x: puff.x - dirX * Phaser.Math.Between(14, 30) + Phaser.Math.Between(-8, 8),
        y: puff.y - dirY * Phaser.Math.Between(14, 30) - Phaser.Math.Between(4, 12),
        scale: size * Phaser.Math.FloatBetween(1.8, 2.6),
        alpha: 0,
        duration: Phaser.Math.Between(350, 550),
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy()
      });
    }
  }

  spawnBannerText(x, y, message) {
    const text = this.add
      .text(x, y, message, {
        fontFamily: FONT_FAMILY,
        fontSize: '30px',
        color: '#ffd166'
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.damageText);
    text.setShadow(0, 3, '#000000', 6, true, true);
    this.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 1800,
      ease: 'Quad.easeIn',
      onComplete: () => text.destroy()
    });
  }

  // Aviso temporal en el HUD.
  showNotice(message) {
    this.tweens.killTweensOf(this.noticeText);
    this.noticeText.setText(message).setAlpha(1);
    this.tweens.add({ targets: this.noticeText, alpha: 0, delay: 3000, duration: 600 });
  }

  spawnTrail(x, y, color) {
    const p = this.add.image(x, y, 'particle').setDepth(DEPTH.trail);
    p.setTint(color).setAlpha(0.4).setScale(0.7);
    this.tweens.add({
      targets: p,
      alpha: 0,
      scale: 0.1,
      duration: 300,
      onComplete: () => p.destroy()
    });
  }

  spawnDamageText(x, y, amount) {
    const text = this.add
      .text(x, y - 10, String(Math.round(amount)), {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#ffe066'
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.damageText);
    this.tweens.add({
      targets: text,
      y: y - 45,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy()
    });
  }

  spawnCoin(x, y, amount) {
    const text = this.add
      .text(x, y - 20, '+' + amount, {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: '#9be15d'
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.damageText);
    this.tweens.add({
      targets: text,
      y: y - 55,
      alpha: 0,
      duration: 700,
      onComplete: () => text.destroy()
    });
  }

  segmentDistance(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const len2 = abx * abx + aby * aby;
    let t = 0;
    if (len2 > 0) {
      t = ((px - ax) * abx + (py - ay) * aby) / len2;
      t = Phaser.Math.Clamp(t, 0, 1);
    }
    const cx = ax + abx * t;
    const cy = ay + aby * t;
    return Math.hypot(px - cx, py - cy);
  }

  getNearestEnemy(x, y, maxDist, skipDoomed) {
    let best = null;
    let bestDist = maxDist || Infinity;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.dead) {
        continue;
      }
      if (skipDoomed && e.hp - e.incomingDamage <= 0) {
        continue;
      }
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = e;
      }
    }
    return best;
  }

  getFarthestEnemy(x, y, maxDist, skipDoomed) {
    let best = null;
    let bestDist = -1;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.dead) {
        continue;
      }
      if (skipDoomed && e.hp - e.incomingDamage <= 0) {
        continue;
      }
      const d = Math.hypot(e.x - x, e.y - y);
      if (maxDist && d > maxDist) {
        continue;
      }
      if (d > bestDist) {
        bestDist = d;
        best = e;
      }
    }
    return best;
  }

  acquireTarget(x, y, range, damage) {
    const target = this.getNearestEnemy(x, y, range, true);
    if (target) {
      target.incomingDamage += damage;
    }
    return target;
  }

  releaseReservation(projectile) {
    if (!projectile.targetId || !projectile.reservedDamage) {
      return;
    }
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.id === projectile.targetId) {
        e.incomingDamage = Math.max(0, e.incomingDamage - projectile.reservedDamage);
        return;
      }
    }
  }

  buildHUD() {
    const fixed = { scrollFactor: 0 };
    this.hpBarBg = this.add
      .rectangle(24, 24, 304, 28, 0x000000, 0.5)
      .setOrigin(0)
      .setStrokeStyle(2, 0x3a5bd0, 1)
      .toHud()
      .setDepth(DEPTH.hud);
    this.hpBarFill = this.add
      .rectangle(26, 26, 300, 24, 0x39d353)
      .setOrigin(0)
      .toHud()
      .setDepth(DEPTH.hud);
    this.hpText = this.add
      .text(176, 38, 'HP', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: '#0b1026'
      })
      .setOrigin(0.5)
      .toHud()
      .setDepth(DEPTH.hud + 1);

    this.waveText = this.add
      .text(GAME_WIDTH / 2, 26, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '26px',
        color: '#e8f0ff'
      })
      .setOrigin(0.5, 0)
      .toHud()
      .setDepth(DEPTH.hud);
    this.timerText = this.add
      .text(GAME_WIDTH / 2, 60, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: COLORS.textDim
      })
      .setOrigin(0.5, 0)
      .toHud()
      .setDepth(DEPTH.hud);

    this.coinPanel = this.add
      .rectangle(24, 58, 196, 34, 0x000000, 0.5)
      .setOrigin(0)
      .setStrokeStyle(2, 0x3a5bd0, 1)
      .toHud()
      .setDepth(DEPTH.hud);

    this.coinText = this.add
      .text(36, 75, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: '#9be15d'
      })
      .setOrigin(0, 0.5)
      .toHud()
      .setDepth(DEPTH.hud + 1);

    this.weaponText = this.add
      .text(24, GAME_HEIGHT - 30, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: COLORS.text
      })
      .setOrigin(0, 1)
      .toHud()
      .setDepth(DEPTH.hud);

    this.noticeText = this.add
      .text(GAME_WIDTH / 2, 112, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
        color: '#ffd166'
      })
      .setOrigin(0.5, 0)
      .toHud()
      .setDepth(DEPTH.hud)
      .setAlpha(0);

    this.vignette = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setStrokeStyle(26, 0xeb3b5a, 1)
      .toHud()
      .setDepth(DEPTH.hud + 2)
      .setAlpha(0);
  }

  buildBossBar() {
    const width = 190;
    const height = 14;
    this.bossBar = this.add.container(0, 0).setDepth(DEPTH.damageText).setVisible(false);
    this.bossBarBg = this.add
      .rectangle(0, 0, width + 6, height + 6, 0x000000, 0.75)
      .setStrokeStyle(2, 0xeb3b5a, 0.9);
    this.bossBarFill = this.add
      .rectangle(-width / 2, 0, width, height, 0xeb3b5a)
      .setOrigin(0, 0.5);
    this.bossBarText = this.add
      .text(0, -16, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        color: '#ffb3c1'
      })
      .setOrigin(0.5);
    this.bossBar.add([this.bossBarBg, this.bossBarFill, this.bossBarText]);
  }

  updateHUD() {
    const ratio = Phaser.Math.Clamp(this.player.hp / this.player.maxHp, 0, 1);
    this.hpBarFill.setScale(ratio, 1);
    this.hpBarFill.setFillStyle(ratio > 0.5 ? 0x39d353 : ratio > 0.25 ? 0xf7b731 : 0xeb3b5a);
    this.hpText.setText(Math.ceil(this.player.hp) + ' / ' + this.player.maxHp);

    const waveLabel = this.wave > TOTAL_WAVES ? t('Oleada') + ' ' + this.wave + ' ' + t('(infinita)') : t('Oleada') + ' ' + this.wave + ' / ' + TOTAL_WAVES;
    this.waveText.setText(waveLabel);
    this.timerText.setText(this.waveTimeLeft <= 0 && this.bossPending() ? '∞' : Math.ceil(this.waveTimeLeft) + 's');
    this.coinText.setText(t('Monedas:') + ' ' + this.coins);

    const weaponNames = this.player.weapons.map(function (w) {
      return t(w.def.name) + ' ' + t('Nv.') + w.level;
    });
    this.weaponText.setText(weaponNames.join('   '));

    const boss = this.enemies.find(function (enemy) {
      return enemy.isBoss && !enemy.dead;
    });
    if (boss) {
      const bossRatio = Phaser.Math.Clamp(boss.hp / boss.maxHp, 0, 1);
      this.bossBar.setVisible(true);
      this.bossBar.setPosition(boss.sprite.x, boss.sprite.y - boss.sprite.displayHeight / 2 - 24);
      this.bossBarFill.setScale(bossRatio, 1);
      this.bossBarText.setText(boss.name.toUpperCase() + '  ' + Math.ceil(boss.hp) + ' / ' + boss.maxHp);
    } else {
      this.bossBar.setVisible(false);
    }

    if (ratio < 0.3) {
      this.vignette.setAlpha((1 - ratio / 0.3) * 0.8 + Math.sin(this.totalTime * 8) * 0.1);
    } else {
      this.vignette.setAlpha(0);
    }
  }
}
