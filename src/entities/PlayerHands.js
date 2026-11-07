// Manos de Pablito: sostiene cada arma que compra, apunta al enemigo más cercano
// y la sacude al disparar (como en Brotato). Las armas se reparten alrededor del cuerpo.

const HANDS = {
  orbit: 34,          // distancia del cuerpo al agarre del arma
  squash: 0.86,       // achata la órbita para que quede más "de frente"
  weaponScale: 0.75,
  turnSpeed: 16,      // rad/s con que gira el arma hacia su objetivo
  recoil: 9,          // retroceso máximo al disparar (px)
  recoilDecay: 9,
  startAngle: 20      // grados del primer lugar (a la derecha, un poco abajo)
};

class PlayerHands {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.holders = [];
    this.faded = false;
  }

  // Vuelve a armar las manos cuando cambian las armas (compra, venta).
  sync() {
    const weapons = this.player.weapons;
    const same =
      this.holders.length === weapons.length &&
      this.holders.every(function (h, i) {
        return h.weapon === weapons[i];
      });
    if (same) {
      return;
    }
    this.holders.forEach(function (h) {
      h.parts.forEach(function (p) {
        p.destroy();
      });
    });
    this.holders = weapons.map((weapon, i) => this.createHolder(weapon, i, weapons.length));
  }

  createHolder(weapon, index, count) {
    const slot = Phaser.Math.DegToRad(HANDS.startAngle) + (index * Math.PI * 2) / count;
    const scene = this.scene;
    const gun = scene.add.image(0, 0, 'weapon_' + weapon.def.key);
    gun.setOrigin(WEAPON_GRIP_X / WEAPON_TEX_W, 0.5).setScale(HANDS.weaponScale);
    const backHand = scene.add.image(0, 0, 'hand').setScale(0.75);
    const parts = [gun, backHand];
    let frontHand = null;
    if (weapon.def.hands > 1) {
      frontHand = scene.add.image(0, 0, 'hand').setScale(0.75);
      parts.push(frontHand);
    }
    return {
      weapon: weapon,
      slot: slot,
      aim: slot,
      recoil: 0,
      gun: gun,
      backHand: backHand,
      frontHand: frontHand,
      parts: parts
    };
  }

  // Posición del agarre del arma (donde apoya la mano).
  anchor(holder) {
    return {
      x: this.player.x + Math.cos(holder.slot) * HANDS.orbit,
      y: this.player.y + Math.sin(holder.slot) * HANDS.orbit * HANDS.squash
    };
  }

  // Boca del arma en el mundo: de ahí salen los proyectiles.
  muzzleFor(weapon) {
    const holder = this.holders.find(function (h) {
      return h.weapon === weapon;
    });
    if (!holder) {
      return { x: this.player.x, y: this.player.y };
    }
    const a = this.anchor(holder);
    const reach = (WEAPON_MUZZLE_X - WEAPON_GRIP_X) * HANDS.weaponScale - holder.recoil;
    return { x: a.x + Math.cos(holder.aim) * reach, y: a.y + Math.sin(holder.aim) * reach };
  }

  // El arma disparó: retroceso y destello en la boca.
  kick(weapon) {
    const holder = this.holders.find(function (h) {
      return h.weapon === weapon;
    });
    if (!holder) {
      return;
    }
    holder.recoil = HANDS.recoil;
    const m = this.muzzleFor(weapon);
    const flash = this.scene.add
      .image(m.x, m.y, 'particle')
      .setTint(weapon.def.color)
      .setDepth(DEPTH.effect)
      .setScale(2.4)
      .setAlpha(0.9);
    this.scene.tweens.add({
      targets: flash,
      scale: 0.4,
      alpha: 0,
      duration: 110,
      onComplete: function () {
        flash.destroy();
      }
    });
  }

  update(dt, game) {
    this.sync();
    const player = this.player;

    this.holders.forEach((h) => {
      const a = this.anchor(h);

      // Hacia dónde apunta: el enemigo más cercano a su alcance; si no hay, hacia afuera del cuerpo.
      const target = game.getNearestEnemy(a.x, a.y, h.weapon.def.range);
      const want = target ? Math.atan2(target.y - a.y, target.x - a.x) : h.slot;
      const diff = Phaser.Math.Angle.Wrap(want - h.aim);
      const maxTurn = HANDS.turnSpeed * dt;
      h.aim += Phaser.Math.Clamp(diff, -maxTurn, maxTurn);

      h.recoil = Math.max(0, h.recoil - HANDS.recoilDecay * dt * 3);

      const dirX = Math.cos(h.aim);
      const dirY = Math.sin(h.aim);
      const gx = a.x - dirX * h.recoil;
      const gy = a.y - dirY * h.recoil;
      const facingLeft = dirX < 0;

      // Los lugares de arriba quedan detrás del cuerpo; el resto, delante.
      const behind = Math.sin(h.slot) < -0.5;
      const depth = DEPTH.player + (behind ? -0.5 : 0.5);

      h.gun.setPosition(gx, gy).setRotation(h.aim).setFlipY(facingLeft).setDepth(depth);
      h.backHand.setPosition(gx, gy).setDepth(depth + 0.1);
      if (h.frontHand) {
        const fore = (WEAPON_MUZZLE_X - WEAPON_GRIP_X) * HANDS.weaponScale * 0.5;
        h.frontHand.setPosition(gx + dirX * fore, gy + dirY * fore).setDepth(depth + 0.1);
      }
    });
  }

  // Al morir las manos se desvanecen junto con Pablito.
  fadeOut(duration) {
    this.holders.forEach((h) => {
      this.scene.tweens.add({ targets: h.parts, alpha: 0, duration: duration });
    });
  }
}
