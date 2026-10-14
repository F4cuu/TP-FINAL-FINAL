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
    this.kills = 0;
    this.totalTime = 0;
    this.nextSpawnId = 1;

    this.enemies = [];
    this.projectiles = [];
    this.pendingSpawns = [];
    this.uiBlock = null;

    this.cameras.main.setBounds(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.add
      .tileSprite(0, 0, ARENA_WIDTH, ARENA_HEIGHT, 'tile')
      .setOrigin(0)
      .setDepth(DEPTH.arena);
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

    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });

    this.buildHUD();

    this.input.keyboard.on('keydown', (event) => this.onKey(event));

    this.startWave(1);
  }

  onKey(event) {
    if (this.phase === 'shop') {
      this.handleShopKey(event);
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
    if (this.phase !== 'playing') {
      return;
    }

    this.totalTime += dt;

    this.player.update(dt, this.readInput());

    for (let i = 0; i < this.player.weapons.length; i++) {
      this.player.weapons[i].update(dt, this.player, this);
    }

    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateSpawnMarkers(dt);
    this.updateWave(dt);
    this.updateHUD();

    if (this.player.hp <= 0) {
      this.gameOver();
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
      if (d < enemy.radius + this.player.radius && enemy.contactTimer <= 0) {
        enemy.contactTimer = 0.6;
        this.player.takeDamage(enemy.damage);
        this.audio.hurt();
        this.cameras.main.shake(120, 0.006);
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
    this.cameras.main.shake(160, 0.008);
    this.applyAoe(x, y, projectile.explosionRadius, projectile.damage, projectile.explosionColor);
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
      const dx = enemy.x - projectile.sprite.x;
      const dy = enemy.y - projectile.sprite.y;
      if (Math.hypot(dx, dy) < enemy.radius + projectile.radius) {
        if (projectile.explosive) {
          this.explodeProjectile(projectile, enemy.x, enemy.y);
          projectile.dead = true;
          return;
        }
        projectile.hitIds.push(enemy.id);
        this.audio.hit();
        const killed = enemy.takeDamage(projectile.damage);
        if (killed) {
          this.killEnemy(enemy);
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

  killEnemy(enemy) {
    if (enemy.dead) {
      return;
    }
    enemy.dead = true;
    this.kills += 1;
    const gain = Phaser.Math.Between(enemy.def.coins[0], enemy.def.coins[1]);
    this.coins += gain;
    this.spawnCoin(enemy.x, enemy.y, gain);

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
    this.waveTimeLeft -= dt;

    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.spawnInterval;
        const type = this.spawnQueue.shift();
        this.queueSpawn(type);
      }
    }

    if (this.waveTimeLeft <= 0) {
      this.endWave();
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

  startWave(wave) {
    this.wave = wave;
    this.waveTimeLeft = Math.min(20 + 4 * (wave - 1), 50);
    this.spawnQueue = buildSpawnQueue(wave);
    this.spawnInterval = this.waveTimeLeft / Math.max(1, this.spawnQueue.length * 2);
    this.spawnTimer = 0.2;

    if (isBossWave(wave)) {
      this.queueSpawn('boss');
      this.audio.boss();
      this.cameras.main.shake(400, 0.01);
    }
  }

  endWave() {
    this.audio.waveEnd();
    this.clearPendingSpawns();

    if (!this.infinite && this.wave >= TOTAL_WAVES) {
      this.showVictory();
      return;
    }

    this.openShop();
  }

  nextWave() {
    this.startWave(this.wave + 1);
    this.phase = 'playing';
  }

  gameOver() {
    this.phase = 'gameover';
    this.audio.gameOver();
    const records = ScoreStore.save({
      coins: this.coins,
      wave: this.wave,
      time: Math.floor(this.totalTime),
      kills: this.kills
    });
    this.scene.start('GameOverScene', {
      victory: false,
      coins: this.coins,
      wave: this.wave,
      time: Math.floor(this.totalTime),
      kills: this.kills,
      records: records
    });
  }

  showVictory() {
    this.phase = 'victory';
    this.victoryButtons = [
      { label: 'Terminar', action: () => this.finishVictory() },
      { label: 'Modo infinito', action: () => this.enterInfinite() }
    ];
    this.victoryIndex = 0;
    this.buildOverlay('VICTORIA', 'Sobreviviste las 9 oleadas');
    this.renderOverlayButtons(this.victoryButtons);
  }

  finishVictory() {
    const records = ScoreStore.save({
      coins: this.coins,
      wave: this.wave,
      time: Math.floor(this.totalTime),
      kills: this.kills
    });
    this.scene.start('GameOverScene', {
      victory: true,
      coins: this.coins,
      wave: this.wave,
      time: Math.floor(this.totalTime),
      kills: this.kills,
      records: records
    });
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

  openShop() {
    this.phase = 'shop';
    this.shopRerolls = 0;
    this.shopIndex = 0;
    this.shopOptions = this.buildShopOptions();
    this.buildOverlay('TIENDA', 'Monedas: ' + this.coins);
    this.shopCoins = this.overlayTitle;
    this.buildCards();
    this.buildShopButtons();
    this.buildSellSection();
    this.refreshShop();
  }

  buildShopOptions() {
    const pool = [];

    UPGRADE_DEFS.forEach((up) => {
      pool.push({
        kind: 'upgrade',
        name: up.name,
        desc: up.desc,
        cost: up.baseCost,
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
        name: def.name,
        desc: owned ? 'Acoplar (subir nivel)' : 'Nueva arma',
        cost: WEAPON_BASE_COST,
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
        .setScrollFactor(0)
        .setDepth(DEPTH.overlay + 1)
        .setInteractive({ useHandCursor: true });

      card.on('pointerover', () => {
        this.shopIndex = i;
        this.refreshShop();
      });
      card.on('pointerdown', () => this.chooseShopOption(i));

      const title = this.add
        .text(x, y - 70, opt.name, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px',
          color: '#e8f0ff',
          align: 'center',
          wordWrap: { width: 270 }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(DEPTH.overlay + 2);

      const desc = this.add
        .text(x, y + 10, opt.desc, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          color: COLORS.textDim,
          align: 'center',
          wordWrap: { width: 270 }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(DEPTH.overlay + 2);

      const cost = this.add
        .text(x, y + 80, opt.cost + ' monedas', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '20px',
          color: '#9be15d'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(DEPTH.overlay + 2);

      this.shopCards.push({ card, title, desc, cost });
    });
  }

  buildShopButtons() {
    this.destroyShopButtons();

    this.rerollBtn = this.add
      .text(440, 490, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#9be15d'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay + 2)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.rerollShop());

    this.continueBtn = this.add
      .text(840, 490, '[ Enter ] Continuar', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#9be15d'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay + 2)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.closeShop());

    this.shopHint = this.add
      .text(GAME_WIDTH / 2, 688, '1 / 2 / 3 comprar     R reroll     Enter continuar', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: COLORS.textDim
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay + 2);

    this.shopButtons = [this.rerollBtn, this.continueBtn, this.shopHint];
  }

  buildSellSection() {
    this.destroySellSection();

    this.sellTitle = this.add
      .text(24, 575, 'Vender armas (clic):', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: COLORS.text
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay + 2);

    this.sellChips = [];

    if (this.player.weapons.length <= 1) {
      this.sellChips.push(
        this.add
          .text(230, 575, '(no podes vender tu unica arma)', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: COLORS.textDim
          })
          .setOrigin(0, 0.5)
          .setScrollFactor(0)
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
          w.def.name + ' Nv.' + w.level + '  (+' + SELL_WEAPON_VALUE + ')',
          {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: '#ffd166'
          }
        )
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
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
      this.audio.beep(180, 0.1, 'sawtooth', 0.05);
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
    this.audio.buy();
    this.buildSellSection();
    this.refreshShop();
  }

  refreshShop() {
    const rerollCost = REROLL_BASE_COST + REROLL_COST_STEP * this.shopRerolls;
    if (this.rerollBtn) {
      this.rerollBtn.setText('[ R ] Reroll (' + rerollCost + ')');
      this.rerollBtn.setColor(this.coins >= rerollCost ? '#9be15d' : '#eb3b5a');
    }
    if (this.shopCoins) {
      this.shopCoins.setText('Monedas: ' + this.coins);
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
      c.desc.setText(opt.sold ? 'Comprado' : opt.desc);
      c.desc.setColor(opt.sold ? '#6b7690' : COLORS.textDim);
      c.cost.setText(opt.sold ? '--' : opt.cost + ' monedas');
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
      this.audio.beep(180, 0.1, 'sawtooth', 0.05);
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
    const cost = REROLL_BASE_COST + REROLL_COST_STEP * this.shopRerolls;
    if (this.coins < cost) {
      this.audio.beep(180, 0.1, 'sawtooth', 0.05);
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
    const choices = ['Equipar en espacio libre', 'Acoplar (subir nivel)'];
    this.choiceButtons = [];

    choices.forEach((label, i) => {
      const btn = this.add
        .text(GAME_WIDTH / 2, 560 + i * 44, (i === 0 ? '[ E ] ' : '[ A ] ') + label, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '20px',
          color: COLORS.text
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
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
    this.clearOverlay();
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
        .setScrollFactor(0)
        .setDepth(DEPTH.overlay)
    );
    this.overlay.push(
      this.add
        .text(GAME_WIDTH / 2, 150, title, {
          fontFamily: 'Arial Black, sans-serif',
          fontSize: '48px',
          color: '#e8f0ff'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(DEPTH.overlay + 1)
    );
    this.overlayTitle = this.add
      .text(GAME_WIDTH / 2, 220, subtitle, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: COLORS.textDim
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay + 1);
    this.overlay.push(this.overlayTitle);
  }

  renderOverlayButtons(buttons) {
    this.overlayButtons = [];
    buttons.forEach((b, i) => {
      const btn = this.add
        .text(GAME_WIDTH / 2, 400 + i * 70, '[ ' + (i + 1) + ' ] ' + b.label, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '30px',
          color: COLORS.text
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(DEPTH.overlay + 2)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => b.action());
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

  applyAoe(x, y, radius, damage, color) {
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
        const killed = enemy.takeDamage(damage);
        if (killed) {
          this.killEnemy(enemy);
        }
      }
    }
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
        fontFamily: 'Arial, sans-serif',
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
        fontFamily: 'Arial, sans-serif',
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
      .setScrollFactor(0)
      .setDepth(DEPTH.hud);
    this.hpBarFill = this.add
      .rectangle(26, 26, 300, 24, 0x39d353)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(DEPTH.hud);
    this.hpText = this.add
      .text(176, 38, 'HP', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#0b1026'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.hud + 1);

    this.waveText = this.add
      .text(GAME_WIDTH / 2, 26, '', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '26px',
        color: '#e8f0ff'
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.hud);
    this.timerText = this.add
      .text(GAME_WIDTH / 2, 60, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: COLORS.textDim
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.hud);

    this.coinText = this.add
      .text(GAME_WIDTH - 24, 26, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#9be15d'
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.hud);

    this.weaponText = this.add
      .text(24, GAME_HEIGHT - 30, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: COLORS.text
      })
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(DEPTH.hud);

    this.vignette = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setStrokeStyle(26, 0xeb3b5a, 1)
      .setScrollFactor(0)
      .setDepth(DEPTH.hud + 2)
      .setAlpha(0);
  }

  updateHUD() {
    const ratio = Phaser.Math.Clamp(this.player.hp / this.player.maxHp, 0, 1);
    this.hpBarFill.setScale(ratio, 1);
    this.hpBarFill.setFillStyle(ratio > 0.5 ? 0x39d353 : ratio > 0.25 ? 0xf7b731 : 0xeb3b5a);
    this.hpText.setText(Math.ceil(this.player.hp) + ' / ' + this.player.maxHp);

    const waveLabel = this.wave > TOTAL_WAVES ? 'Oleada ' + this.wave + ' (infinita)' : 'Oleada ' + this.wave + ' / ' + TOTAL_WAVES;
    this.waveText.setText(waveLabel);
    this.timerText.setText(Math.max(0, Math.ceil(this.waveTimeLeft)) + 's');
    this.coinText.setText('Monedas: ' + this.coins);

    const weaponNames = this.player.weapons.map(function (w) {
      return w.def.name + ' Nv.' + w.level;
    });
    this.weaponText.setText(weaponNames.join('   '));

    if (ratio < 0.3) {
      this.vignette.setAlpha((1 - ratio / 0.3) * 0.8 + Math.sin(this.totalTime * 8) * 0.1);
    } else {
      this.vignette.setAlpha(0);
    }
  }
}
