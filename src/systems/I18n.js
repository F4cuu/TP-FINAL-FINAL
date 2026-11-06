// Idiomas: español (por defecto) e inglés.
//
// Los textos del juego están escritos en español y ese mismo texto es la clave:
//   t('Jugar')                      -> 'Jugar' / 'Play'
//   t('¡{name} se acerca!', { name })  -> reemplaza {name} en ambos idiomas
// Si una clave no tiene traducción, se muestra tal cual (en español).
// El idioma elegido se guarda en localStorage (si está disponible).

const LANG_STORAGE_KEY = 'pablito_lang';

// Traducciones al inglés. Las del archivo de traducción del proyecto están tal cual;
// las marcadas «agregadas» cubren textos que el archivo no incluía.
const EN_TRANSLATIONS = {
  // ---- Archivo de traducción ----
  'Oleada 1/9': 'Wave 1/9',
  'Oleada 2/9': 'Wave 2/9',
  'Oleada 3/9': 'Wave 3/9',
  'Oleada 4/9': 'Wave 4/9',
  'Oleada 5/9': 'Wave 5/9',
  'Oleada 6/9': 'Wave 6/9',
  'Oleada 7/9': 'Wave 7/9',
  'Oleada 8/9': 'Wave 8/9',
  'Oleada 9/9': 'Wave 9/9',
  'Solo uno podra resistir.': 'Only one will be able to resist.',
  '+1 enemigo atravesado': '+1 enemy pierced',
  'Perforacion de membrana': 'Membrane perforation',
  'Monedas conseguidas:': 'Coins obtained:',
  'Biofilm denso': 'Dense biofilm',
  'Oleada:': 'Wave:',
  '+25 de vida maxima': '+25 maximum health',
  'Mayor daño:': 'Greater damage:',
  'ARMAS Y ESTADÍSTICAS': 'WEAPONS AND STATISTICS',
  'Sonido:': 'Sounds:',
  'Virulencia': 'Virulence',
  'Nueve oleadas se alzan entre el y la calma.': 'Nine waves rise between him and the calm.',
  '[Efectos de sonido: OFF]': '[Sound effects: OFF]',
  'Flechas': 'Arrows',
  'PABLITO: Bacteria Survivor': 'PABLITO: Bacterium Survivor',
  'Perforación:': 'Piercing:',
  'Cadencia:': 'Cadence:',
  '+15% de cadencia': '+15% cadence',
  '[ Efectos de sonido: ON ]': '[ Sound effects: ON ]',
  'Su mundo es hostil: odas de bacterias rivales lo atacan sin descanso.':
    'Its world is hostile: hordes of rival bacteria attack it relentlessly.',
  'Bajas:': 'Kills:',
  'Abanico de exotoxina': 'Exotoxin spectrum',
  'un pequeño microbio llamado Pablito lucha por sobrevivir.': 'A tiny microbe named Pablito struggles to survive...',
  'Acoplar (subir nivel)': 'Couple (level up)',
  '1 / 2 / 3 comprar': '1 / 2 / 3 to buy',
  'PAUSA': 'PAUSE',
  'comprar': 'Buy',
  'Flagelo acelerado': 'Accelerated flagellum',
  'Nueva arma': 'New weapon',
  'Efectos de sonido:': 'Sound effects:',
  '(no podes vender tu unica arma)': '(You cannot sell your only weapon)',
  'Plasmido veloz': 'Rapid plasmid',
  '+10% de velocidad': '+10% speed',
  '+15% de tamano de area': '+15% area size',
  '[Efectos de sonido: ON]': '[Sound effects: ON]',
  '[ Música: ON ]': '[ Music: ON ]',
  'Volver': 'Return',
  'Vida maxima:': 'Maximum health:',
  '[ Efectos de sonido: OFF ]': '[ Sound effects: OFF ]',
  'Música:': 'Music:',
  'COMBATE': 'COMBAT',
  'Reiniciar': 'Reset',
  'Salir al menu': 'Quit to menu',
  '+20% de dano': '+20% damage',
  'Capside resistente': 'Resistant capsid',
  'En lo profundo de una gota de agua...': 'Deep within a drop of water...',
  '[Música: OFF]': '[Music: OFF]',
  'Monedas:': 'Coins:',
  'para elegir': 'to select',
  'Oleada alcanzada:': 'Wave reached:',
  'Metabolismo veloz': 'Fast metabolism',
  'Continuar': 'Continue',
  'Elegí una mejora (precios x1.0)': 'Choose an upgrade (prices x1.0)',
  'Presiona cualquier tecla para continuar': 'Press any key to continue',
  'Enemigos derrotados:': 'Defeated enemies:',
  'Enter (continuar)': 'Enter (to continue)',
  'DERROTA': 'DEFEAT',
  'Opciones': 'Settings',
  'Oleada': 'Wave',
  'Tamaño de área:': 'Area size:',
  'Daño aumentado:': 'Increased damage:',
  'Tiempo total:': 'Time survived:',
  'Liberacion de esporas': 'Spore release',
  'Vender armas (clic):': 'Sell weapons (click):',
  'Velocidad alcanzada:': 'Speed reached:',
  'Jugar': 'Play',
  'Jefes derrotados:': 'Defeated bosses:',
  'Torpedo pedorro': 'Farty torpedo',
  '[Música: ON]': '[Music: ON]',
  'Salir': 'Quit',
  'Escupida de toxina': 'Toxic spit',
  '[ Música: OFF ]': '[ Music: OFF ]',

  // ---- Agregadas (no estaban en el archivo) ----
  // Introducción (con los saltos de línea que usa el juego)
  'un pequeño microbio llamado Pablito\nlucha por sobrevivir.': 'A tiny microbe named Pablito\nstruggles to survive...',
  'Su mundo es hostil:\nodas de bacterias rivales\nlo atacan sin descanso.':
    'Its world is hostile:\nhordes of rival bacteria\nattack it relentlessly.',
  'Nueve oleadas se alzan entre el\ny la calma.\n\nSolo uno podra resistir.':
    'Nine waves rise between him\nand the calm.\n\nOnly one will be able to resist.',
  'Bacteria Survivor': 'Bacterium Survivor',
  'Presiona cualquier tecla': 'Press any key',
  // Menú y opciones
  'Flechas / WASD para elegir   ·   Enter para confirmar': 'Arrows / WASD to select   ·   Enter to confirm',
  'Records': 'Records',
  'Tiempo:': 'Time:',
  '[ Volver ]': '[ Return ]',
  'Idioma:': 'Language:',
  // Pausa
  'Efectos:': 'Effects:',
  // Pantalla de derrota / victoria
  'VICTORIA': 'VICTORY',
  'ARMAS EQUIPADAS': 'EQUIPPED WEAPONS',
  'Reintentar': 'Retry',
  'Menu principal': 'Main menu',
  'daño': 'damage',
  'Nv.': 'Lv.',
  'Record': 'Record',
  'Tiempo de combate': 'Combat time',
  // Combate
  '(infinita)': '(endless)',
  '¡{name} se acerca!': '{name} is approaching!',
  '¡{name} DERROTADO!': '{name} DEFEATED!',
  '{name} derrotado: sobreviví hasta que termine el tiempo para tu recompensa':
    '{name} defeated: survive until time runs out to get your reward',
  '{name} DERROTADO': '{name} DEFEATED',
  'JEFE': 'BOSS',
  'Elegí una recompensa gratis (1 / 2 / 3)': 'Choose a free reward (1 / 2 / 3)',
  'Gratis': 'Free',
  'Sobreviviste las 9 oleadas': 'You survived all 9 waves',
  'Terminar': 'Finish',
  'Modo infinito': 'Endless mode',
  // Tienda
  'TIENDA': 'SHOP',
  'Elegí una mejora (precios x{mult})': 'Choose an upgrade (prices x{mult})',
  '{n} monedas': '{n} coins',
  'Comprado': 'Purchased',
  'Equipar en espacio libre': 'Equip in free slot',
  '[ Enter ] Continuar': '[ Enter ] Continue',
  '1 / 2 / 3 comprar     R reroll     Enter continuar': '1 / 2 / 3 to buy     R reroll     Enter to continue',
  'Onda de biofilm': 'Biofilm wave',
  // Poderes de los jefes
  'Embestida': 'Charge',
  'Blanqueamiento total': 'Total bleaching',
  'Lluvia antiséptica': 'Antiseptic rain',
  '¡{name}!': '{name}!'
};

const I18n = {
  lang: 'es',

  load: function () {
    try {
      const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'es' || saved === 'en') {
        this.lang = saved;
      }
    } catch (e) {
      // Sin almacenamiento: se queda el idioma por defecto.
    }
  },

  setLang: function (lang) {
    this.lang = lang === 'en' ? 'en' : 'es';
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, this.lang);
    } catch (e) {
      // Sin almacenamiento: el cambio vale solo para esta sesión.
    }
  },

  toggle: function () {
    this.setLang(this.lang === 'en' ? 'es' : 'en');
  },

  // Nombre del idioma actual, en ese mismo idioma.
  label: function () {
    return this.lang === 'en' ? 'English' : 'Español';
  },

  t: function (key, params) {
    let text = key;
    if (this.lang === 'en' && Object.prototype.hasOwnProperty.call(EN_TRANSLATIONS, key)) {
      text = EN_TRANSLATIONS[key];
    }
    if (params) {
      Object.keys(params).forEach(function (name) {
        text = text.split('{' + name + '}').join(String(params[name]));
      });
    }
    return text;
  }
};

I18n.load();

function t(key, params) {
  return I18n.t(key, params);
}
