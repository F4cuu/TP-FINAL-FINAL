const WEAPON_DEFS = {
  toxin: {
    key: 'toxin',
    name: 'Escupida de toxina',
    type: 'projectile',
    damage: 10,
    cooldown: 0.6,
    projectileSpeed: 560,
    color: 0x9be15d,
    radius: 7,
    count: 1,
    spread: 0,
    pierce: 0
  },
  exotoxin: {
    key: 'exotoxin',
    name: 'Abanico de exotoxina',
    type: 'projectile',
    damage: 5,
    cooldown: 2,
    projectileSpeed: 500,
    color: 0xf7b731,
    radius: 6,
    count: 5,
    spread: 0.6,
    pierce: 0
  },
  biofilm: {
    key: 'biofilm',
    name: 'Onda de biofilm',
    type: 'aoe',
    damage: 15,
    cooldown: 3,
    color: 0x45aaf2,
    radius: 120
  },
  spores: {
    key: 'spores',
    name: 'Liberación de esporas',
    type: 'aoe_target',
    damage: 25,
    cooldown: 4,
    color: 0xa55eea,
    radius: 140
  },
  plasmid: {
    key: 'plasmid',
    name: 'Plásmido veloz',
    type: 'burst',
    damage: 8,
    cooldown: 2,
    projectileSpeed: 380,
    color: 0xeb3b5a,
    radius: 6,
    count: 1,
    pierce: 99,
    burstCount: 8,
    burstInterval: 0.15
  }
};
