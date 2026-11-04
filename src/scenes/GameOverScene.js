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

  weaponMetric(entry, metric) {
    if (!entry) {
      return '—';
    }
    if (metric === 'damage') {
      return entry.name + ' (' + entry.damage + ' daño)';
    }
    if (metric === 'shots') {
      return entry.name + ' (' + entry.shots + ' disparos)';
    }
    return entry.name + ' (' + entry.kills + ' bajas)';
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
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

    this.add
      .text(70, 150, 'COMBATE', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: '#9be15d'
      })
      .setOrigin(0, 0.5);

    const combatLines = [
      'Monedas conseguidas: ' + (stats.coinsEarned != null ? stats.coinsEarned : d.coins || 0),
      'Enemigos comunes: ' + (byType.simple || 0),
      'Enemigos cazadores: ' + (byType.hunter || 0),
      'Enemigos compuestos: ' + (byType.compound || 0),
      'Jefes derrotados: ' + (stats.bosses != null ? stats.bosses : byType.boss || 0),
      'Total de enemigos: ' + (stats.kills != null ? stats.kills : d.kills || 0)
    ];

    this.add
      .text(70, 184, combatLines.join('\n'), {
        fontFamily: FONT_FAMILY,
        fontSize: '19px',
        color: COLORS.text,
        lineSpacing: 9
      })
      .setOrigin(0, 0);

    this.add
      .text(70, 405, 'ARMAS EQUIPADAS', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: '#9be15d'
      })
      .setOrigin(0, 0.5);

    const equipped = stats.weapons || [];
    if (equipped.length === 0) {
      this.add
        .text(70, 433, '—', {
          fontFamily: FONT_FAMILY,
          fontSize: '16px',
          color: COLORS.textDim
        })
        .setOrigin(0, 0);
    } else {
      equipped.slice(0, 4).forEach((weapon, i) => {
        this.add
          .text(70 + (i % 2) * 300, 433 + Math.floor(i / 2) * 29, weapon.name + ' Nv.' + weapon.level, {
            fontFamily: FONT_FAMILY,
            fontSize: '16px',
            color: COLORS.textDim
          })
          .setOrigin(0, 0);
      });
    }

    this.add
      .text(690, 150, 'ARMAS Y ESTADÍSTICAS', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: '#9be15d'
      })
      .setOrigin(0, 0.5);

    const performanceLines = [
      'Mayor daño: ' + this.weaponMetric(stats.bestDamage, 'damage'),
      'Más disparos: ' + this.weaponMetric(stats.bestShots, 'shots'),
      'Más bajas: ' + this.weaponMetric(stats.bestKills, 'kills'),
      'Vida máxima: ' + (player.maxHp || PLAYER_DEF.hp),
      'Velocidad: ' +
        (player.speed || PLAYER_DEF.speed) +
        ' (+' +
        (player.speedPct || 0) +
        '%)',
      'Daño aumentado: +' + (player.damagePct || 0) + '%',
      'Cadencia: +' + (player.fireRatePct || 0) + '%',
      'Tamaño de área: +' + (player.areaPct || 0) + '%',
      'Perforación: +' + (player.pierce || 0)
    ];

    this.add
      .text(690, 184, performanceLines.join('\n'), {
        fontFamily: FONT_FAMILY,
        fontSize: '19px',
        color: COLORS.text,
        lineSpacing: 9
      })
      .setOrigin(0, 0);

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
      { label: 'Reintentar', action: () => this.scene.start('GameScene') },
      { label: 'Menu principal', action: () => this.scene.start('MenuScene') }
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
