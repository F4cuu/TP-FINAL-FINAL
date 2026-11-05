class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.result = data || {};
  }

  formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return minutes + ':' + String(secs).padStart(2, '0');
  }

  weaponMetric(entry) {
    if (!entry) {
      return '—';
    }
    return entry.name + ' (' + entry.damage + ' daño)';
  }

  // Fila de estadística: ícono geométrico + texto.
  addStatRow(x, y, kind, label) {
    createStatIcon(this, kind, x + 14, y);
    this.add
      .text(x + 42, y, label, {
        fontFamily: FONT_FAMILY,
        fontSize: '19px',
        color: COLORS.text
      })
      .setOrigin(0, 0.5);
  }

  create() {
    // Sin color de fondo: se ve la partida detenida de GameScene por detrás.
    applyUiCamera(this);
    AudioManager.playMusic(this.result.victory ? 'menu' : 'defeat');
    this.buildBackdrop();
    const d = this.result;
    const stats = d.stats || {};
    const byType = stats.killsByType || {};
    const player = stats.player || {};
    const totalTime = stats.time != null ? stats.time : d.time || 0;

    this.add
      .text(GAME_WIDTH / 2, 46, d.victory ? 'VICTORIA' : 'DERROTA', {
        fontFamily: FONT_FAMILY,
        fontSize: '50px',
        color: d.victory ? '#9be15d' : '#eb3b5a'
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        96,
        'Oleada alcanzada: ' + (d.wave || 0) + '     Tiempo total: ' + this.formatTime(totalTime),
        {
          fontFamily: FONT_FAMILY,
          fontSize: '19px',
          color: COLORS.textDim
        }
      )
      .setOrigin(0.5);

    // COMBATE: solo totales.
    this.add
      .text(70, 150, 'COMBATE', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: '#9be15d'
      })
      .setOrigin(0, 0.5);

    const combatRows = [
      ['kills', 'Enemigos derrotados: ' + (stats.kills != null ? stats.kills : d.kills || 0)],
      ['bosses', 'Jefes derrotados: ' + (stats.bosses != null ? stats.bosses : byType.boss || 0)],
      ['coins', 'Monedas conseguidas: ' + (stats.coinsEarned != null ? stats.coinsEarned : d.coins || 0)]
    ];
    combatRows.forEach((row, i) => this.addStatRow(70, 198 + i * 40, row[0], row[1]));

    this.add
      .text(70, 340, 'ARMAS EQUIPADAS', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: '#9be15d'
      })
      .setOrigin(0, 0.5);

    const equipped = stats.weapons || [];
    if (equipped.length === 0) {
      this.add
        .text(70, 368, '—', {
          fontFamily: FONT_FAMILY,
          fontSize: '16px',
          color: COLORS.textDim
        })
        .setOrigin(0, 0);
    } else {
      equipped.slice(0, 4).forEach((weapon, i) => {
        this.add
          .text(70 + (i % 2) * 300, 368 + Math.floor(i / 2) * 29, weapon.name + ' Nv.' + weapon.level, {
            fontFamily: FONT_FAMILY,
            fontSize: '16px',
            color: COLORS.textDim
          })
          .setOrigin(0, 0);
      });
    }

    // ARMAS Y ESTADÍSTICAS: arma con mayor daño y mejoras acumuladas.
    this.add
      .text(690, 150, 'ARMAS Y ESTADÍSTICAS', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: '#9be15d'
      })
      .setOrigin(0, 0.5);

    const performanceRows = [
      ['weapon', 'Mayor daño: ' + this.weaponMetric(stats.bestDamage)],
      ['health', 'Vida máxima: ' + (player.maxHp || PLAYER_DEF.hp)],
      [
        'speed',
        'Velocidad alcanzada: ' + (player.speed || PLAYER_DEF.speed) + ' (+' + (player.speedPct || 0) + '%)'
      ],
      ['damage', 'Daño aumentado: +' + (player.damagePct || 0) + '%'],
      ['fireRate', 'Cadencia: +' + (player.fireRatePct || 0) + '%'],
      ['area', 'Tamaño de área: +' + (player.areaPct || 0) + '%'],
      ['pierce', 'Perforación: +' + (player.pierce || 0)]
    ];
    performanceRows.forEach((row, i) => this.addStatRow(690, 198 + i * 38, row[0], row[1]));

    const r = d.records || ScoreStore.get();
    this.add
      .text(
        GAME_WIDTH / 2,
        500,
        'Record: Oleada ' +
          r.maxWave +
          '  |  Tiempo de combate ' +
          this.formatTime(r.maxTime) +
          '  |  Bajas ' +
          r.maxKills +
          '  |  Monedas ' +
          r.maxCoins,
        {
          fontFamily: FONT_FAMILY,
          fontSize: '17px',
          color: COLORS.textDim
        }
      )
      .setOrigin(0.5);

    this.buttons = [
      { label: 'Reintentar', action: () => this.leaveTo('GameScene') },
      { label: 'Menu principal', action: () => this.leaveTo('MenuScene') }
    ];

    this.items = [];
    this.buttons.forEach((b, i) => {
      const item = this.add
        .text(GAME_WIDTH / 2, 550 + i * 58, b.label, {
          fontFamily: FONT_FAMILY,
          fontSize: '28px',
          color: COLORS.text
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      item.on('pointerover', () => {
        this.selected = i;
        this.refresh();
      });
      item.on('pointerdown', () => b.action());
      this.items.push(item);
    });

    this.selected = 0;
    this.refresh();

    this.input.keyboard.on('keydown-UP', () => this.move(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.move(1));
    this.input.keyboard.on('keydown-ENTER', () => this.buttons[this.selected].action());
  }

  // Atenúa la partida detenida y le da un panel a cada columna de estadísticas.
  buildBackdrop() {
    const dim = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070f, 0.72)
      .setAlpha(0);

    const panels = this.add.graphics();
    panels.fillStyle(0x0b1026, 0.7);
    panels.fillRoundedRect(46, 124, 610, 350, 16);
    panels.fillRoundedRect(666, 124, 568, 350, 16);
    panels.lineStyle(2, 0x3a5bd0, 0.7);
    panels.strokeRoundedRect(46, 124, 610, 350, 16);
    panels.strokeRoundedRect(666, 124, 568, 350, 16);
    panels.setAlpha(0);

    this.tweens.add({ targets: [dim, panels], alpha: 1, duration: 600 });
  }

  leaveTo(sceneKey) {
    this.scene.stop('GameScene');
    this.scene.start(sceneKey);
  }

  move(delta) {
    this.selected = Phaser.Math.Wrap(this.selected + delta, 0, this.items.length);
    this.refresh();
  }

  refresh() {
    this.items.forEach((item, i) => {
      item.setColor(i === this.selected ? '#9be15d' : COLORS.text);
      item.setScale(i === this.selected ? 1.1 : 1);
    });
  }
}
