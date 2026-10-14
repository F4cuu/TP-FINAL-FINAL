const UPGRADE_DEFS = [
  {
    key: 'capsid',
    name: 'Capside resistente',
    desc: '+25 de vida maxima',
    baseCost: 25,
    apply: function (player) {
      player.maxHp += 25;
      player.hp += 25;
    }
  },
  {
    key: 'flagellum',
    name: 'Flagelo acelerado',
    desc: '+10% de velocidad',
    baseCost: 20,
    apply: function (player) {
      player.speedMul += 0.1;
    }
  },
  {
    key: 'virulence',
    name: 'Virulencia',
    desc: '+20% de dano',
    baseCost: 30,
    apply: function (player) {
      player.damageMul += 0.2;
    }
  },
  {
    key: 'metabolism',
    name: 'Metabolismo veloz',
    desc: '+15% de cadencia',
    baseCost: 30,
    apply: function (player) {
      player.fireRateMul += 0.15;
    }
  },
  {
    key: 'biofilm',
    name: 'Biofilm denso',
    desc: '+15% de tamano de area',
    baseCost: 25,
    apply: function (player) {
      player.areaMul += 0.15;
    }
  },
  {
    key: 'perforation',
    name: 'Perforacion de membrana',
    desc: '+1 enemigo atravesado',
    baseCost: 35,
    apply: function (player) {
      player.pierceBonus += 1;
    }
  }
];

const UPGRADE_COST_STEP = 10;
const WEAPON_BASE_COST = 40;
const REROLL_BASE_COST = 8;
const REROLL_COST_STEP = 4;
const SELL_WEAPON_VALUE = 20;
