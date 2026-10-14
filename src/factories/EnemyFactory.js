const EnemyFactory = {
  create: function (scene, typeKey, x, y) {
    const def = ENEMY_DEFS[typeKey] || ENEMY_DEFS.simple;
    return new Enemy(scene, def, x, y);
  },

  spawnAtEdge: function (scene, typeKey, player) {
    const def = ENEMY_DEFS[typeKey] || ENEMY_DEFS.simple;
    const margin = def.radius + 40;
    const minDist = 520;
    let x = 0;
    let y = 0;

    for (let attempt = 0; attempt < 12; attempt++) {
      const side = Phaser.Math.Between(0, 3);
      if (side === 0) {
        x = Phaser.Math.Between(margin, ARENA_WIDTH - margin);
        y = margin;
      } else if (side === 1) {
        x = ARENA_WIDTH - margin;
        y = Phaser.Math.Between(margin, ARENA_HEIGHT - margin);
      } else if (side === 2) {
        x = Phaser.Math.Between(margin, ARENA_WIDTH - margin);
        y = ARENA_HEIGHT - margin;
      } else {
        x = margin;
        y = Phaser.Math.Between(margin, ARENA_HEIGHT - margin);
      }

      if (Math.hypot(x - player.x, y - player.y) >= minDist) {
        break;
      }
    }

    return this.create(scene, typeKey, x, y);
  }
};
