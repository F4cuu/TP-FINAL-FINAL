# MEMORIA DE PROYECTO — Pablito: Bacteria Survivor

> Archivo de contexto para retomar el trabajo desde otro dispositivo o sesión.
> Mantenerlo actualizado con cada decisión relevante tomada en el chat.

## 1. Tema y objetivo

- **Género:** Vampire Survivor local, un solo jugador.
- **Plataforma:** Web.
- **Concepto:** Pablito, el 0,01% de bacterias vivas, sobrevive oleadas de desinfectantes.
- **Arte:** figuras geométricas (el GDD lo define así; los mockups geométricos son la vía esperada).
- **Motor/SDK definido con el usuario:** **Phaser 4**. Audio vía **WebAudio** (efectos sintetizados, sin assets externos).

## 2. Documentación del proyecto

- **Documento principal (requisitos):** `GDD PROPUESTA.docx` (raíz). Es un archivo de Word, no texto plano:
  - Se lee descomprimiendo el `.docx` y extrayendo `word/document.xml`, o por Word COM / python-docx.
  - Backup original (pre-ediciones): `C:\Users\facun\AppData\Local\Temp\opencode\GDD PROPUESTA BACKUP.docx`.
- **Instrucciones para el agente:** `AGENTS.md` (raíz). Se aplican al inicio de cada consulta.
- **Este archivo:** `MEMORIA DE PROYECTO.md` (raíz).

## 3. Decisiones de diseño pactadas con el usuario (todas aplicadas al GDD)

### Modo de juego / victoria
- 9 oleadas de enemigos, dificultad creciente.
- Oleadas 3, 6 y 9 = oleada normal + jefe.
- Al vencer las 9 → opción de **terminar partida** o **continuar en modo infinito**.
- Condición de derrota: **HP llega a 0**. No hay cura entre oleadas.

### Escala de oleadas
- Duración por oleada: **20s → 50s, +4s por oleada**.
- Cantidad de enemigos: **8 → 30**.
- Fin de oleada por **tiempo**, no por matanzas.

### Composición de enemigos por oleada
- Oleadas 1 y 2: solo Simples.
- Oleada 3: 1/10 Cazador, resto Simples + **jefe**.
- Oleada 4: 3/10 Cazadores, resto Simples.
- Oleada 5: **únicamente Cazadores**.
- Oleada 6: 4/10 Simples, 4/10 Cazadores, 2/10 Compuestos + **jefe**.
- Oleada 7: 3/10 Simples, 3/10 Cazadores, 4/10 Compuestos.
- Oleada 8: 3/10 Cazadores, 7/10 Compuestos (sin Simples).
- Oleada 9: **un único jefe** + 7/10 Simples + 3/10 Compuestos.
- Modo infinito: crece indefinidamente la cantidad de enemigos simultáneos; **no** escala HP/daño.

### Jugador
- **100 HP inicial** (HP fijo, sin cura).
- Velocidad de movimiento base + mejora (Flagelo acelerado).
- Arena **grande y limitada**, cámara que sigue al jugador.
- Movimiento con **flechas o WASD**. Por ahora **solo PC**; móvil pendiente.

### Armas y combate
- El jugador arranca con **Escupida de toxina nivel 1**.
- Hasta **4 armas equipables**, autodisparo al **enemigo más cercano**.
- Daño base por proyectil: **10**.
- **Progresión de armas**: las armas se compran en la tienda. Cada arma sube de nivel por separado. Al obtener otra copia de un arma ya equipada, el jugador elige: (a) equiparla en un espacio libre, o (b) **acoplarla** a la existente para subirla de nivel (más daño). Costos a definir en el balance.
- Armas (temática bacteriana):
  1. **Escupida de toxina** (básica): proyectil recto, daño 10, cada 0,6s.
  2. **Abanico de exotoxina**: 5 proyectiles en abanico, daño 5 c/u, cada 2s.
  3. **Onda de biofilm** (AOE): onda circular corta que daña y empuja, daño 15, recarga 3s.
  4. **Liberación de esporas**: explosión en el enemigo más lejano, daño 25, recarga 4s.
  5. **Plásmido veloz**: proyectil lento que atraviesa, daño 8/golpe, ráfaga 0,15s durante 1s, recarga 2s.

### Combate (reglas)
- Todo el daño es **por contacto**. **Sin ventanas de invulnerabilidad** (i-frames).
- Los enemigos **se empujan entre sí** pero mantienen el rumbo hacia el jugador.
- Los proyectiles **desaparecen al impactar** (salvo el Plásmido veloz, que atraviesa).
- Velocidades relativas: Jugador media / Simples media / Cazadores alta / Compuestos baja / Jefes muy baja.

### Enemigos
| Tipo | HP | Daño | Velocidad | Notas |
|------|-----|------|-----------|-------|
| Simple | 20 | 10 | media | burbuja, los más comunes |
| Cazador | 10 | 6 | alta | burbuja con burbujas adentro; desde oleada 3 |
| Compuesto | 60 | 15 | baja | rectángulo/paño; mucha vida |
| Jefe | 500 | 60 | muy baja | jabón enorme; oleadas 3, 6 y 9 |

- Aparecen de manera aleatoria en la arena y persiguen al jugador.
- **Jefe**: único tipo. Cada **10s** usa su habilidad: se queda quieto y luego **embiste** hacia la última posición registrada del jugador antes del ataque.

### Tienda y mejoras
- **1 minuto de tienda entre oleadas**; se paga con **monedas** de eliminar enemigos.
- Se elige **1 mejora entre 3 opciones aleatorias**; acumulan niveles.
- **Los puntos no gastados se conservan** entre oleadas; los precios suben levemente con la dificultad.
- Monedas por enemigo (aleatorio): Simples 3-10 / Cazadores 7-15 / Compuestos 15-30 / Jefes 50-100.
- Mejoras:
  1. **Cápside resistente**: +25 HP máx (no cura).
  2. **Flagelo acelerado**: +10% velocidad de movimiento/nivel.
  3. **Virulencia**: +20% daño de todas las armas/nivel.
  4. **Metabolismo veloz**: +15% cadencia de disparo/nivel.
  5. **Biofilm denso**: +15% tamaño de proyectiles y AOE/nivel.
  6. **Perforación de membrana**: proyectiles atraviesan 1 enemigo adicional/nivel.

### Flujo de pantallas
- Pantalla inicial (cualquier tecla) → Intro narrativa → Menú principal (Jugar / Opciones / Salir).
- Durante el juego, **pausa** con: Continuar / Opciones / Reiniciar / Salir.
- Al vencer las 9 oleadas: terminar o modo infinito.

### HUD / interfaz
- Barra de vida **con número**.
- **Indicador de oleada** actual.
- **Iconos de armas equipadas** en una esquina, en transparente.
- Contador de tiempo de oleada; monedas/puntaje.

### Arte y feedback visual
- Estilo simple con **figuras geométricas de colores**.
- Jugador: **cilindro verde**. Simples: **burbuja**. Cazadores: **burbuja con muchas burbujas dentro**. Compuestos: **rectángulo (paño)**. Jefe: **jabón enorme**. Armas: varían.
- Parpadeo al recibir daño; **efecto rojo en bordes** con poca vida.
- Entidades "respiran" (pulso) y dejan **partículas detrás** al moverse.
- **Números de daño flotantes** y partículas de impacto; al morir, el enemigo **gira sobre su eje y desaparece**.

### Audio
- Efectos WebAudio por evento: disparo, impacto, daño recibido, aparición de jefe, compra/mejora, fin de oleada, game over.

### Persistencia (localStorage)
- Récords: **puntaje máximo, oleada máxima, tiempo sobrevivido, enemigos eliminados**.

## 4. Cambios aplicados al GDD PROPUESTA.docx

1. Sección 3: motor Phaser 4, audio WebAudio, arquitectura web con datos de balance separados.
2. Sección 5: 7 → 9 oleadas; jefes en 3/6/9; opción de terminar/modo infinito; escala de oleadas (20→50s, 8→30).
3. Sección 6: oleadas por duración fija; puntos canjeables en tienda de 1 minuto entre oleadas.
4. Sección 7: movimiento con flechas o **WASD**, solo PC; armas con autodisparo.
5. Sección 8 (nueva): armas, arranque con toxina niv.1, progresión acoplar/equipar, daño base 10, lista de 5 armas.
6. Sección 9 (nueva): tienda 1 minuto, elegir 1 de 3, monedas por enemigo, puntos persistentes, 6 mejoras.
7. Sección 10 (antes 9): stats de enemigos y jugador (100 HP, sin cura); cazadores desde la 3ra.
8. Sección 11 (nueva): composición de enemigos por oleada + escalado del modo infinito.
9. Sección 12 (nueva): jefe (único) y su habilidad de embestida cada 10s.
10. Sección 13 (nueva): flujo de pantallas y pausa.
11. Sección 14 (nueva): HUD (barra de vida con número, indicador de oleada, iconos de armas).
12. Sección 15 (nueva): arte y feedback visual (formas, efectos, partículas, daño flotante).
13. Sección 16 (nueva): récords en localStorage.
14. Sección 17 (nueva): reglas de combate (contacto, sin i-frames, empuje, proyectiles).

**Pendiente estético:** la sección 4 del GDD no existe (salta del 3 al 5), heredado del original. Consultar con el usuario si crearla.

## 5. Estado del proyecto

- **Estructura actual:**
  - `GDD PROPUESTA.docx` (editado).
  - `AGENTS.md` (creado).
  - `MEMORIA DE PROYECTO.md` (este archivo).
  - `.gitignore` (creado).
- **Código (implementado):** esqueleto jugable en Phaser 4.
  - `index.html`: carga Phaser 4.2.1 por CDN (jsDelivr) + scripts clásicos (sin bundler) en orden de dependencia.
  - `src/main.js`: config `Phaser.Game` (1280x720, Scale.FIT, lista de escenas).
  - `src/data/`: `constants.js`, `enemies.js`, `weapons.js`, `waves.js`, `upgrades.js` (balance separado de la lógica).
  - `src/entities/`: `Player.js`, `Enemy.js`, `Projectile.js` (POO; física manual por distancia).
  - `src/factories/EnemyFactory.js`: creación + spawn en borde de arena lejos del jugador.
  - `src/weapons/Weapon.js`: Strategy de disparo (`projectile`, `aoe`, `aoe_target`, `burst`).
  - `src/scenes/`: `Boot`, `Start`, `Intro`, `Menu`, `Options`, `Game`, `Pause`, `GameOver` (patrón State).
  - `src/systems/`: `Textures.js` (texturas geométricas generadas), `AudioManager.js` (WebAudio sintetizado), `ScoreStore.js` (récords en localStorage).
- **Cómo ejecutar:** abrir `index.html` en el navegador (los scripts clásicos no requieren servidor). El CDN de Phaser necesita internet.
- **Simplificaciones actuales:** el tiempo de tienda no está limitado a 1 minuto real (es una pantalla entre oleadas); el bucle de vidas/cura respeta el GDD.

### Ajustes de jugabilidad aplicados (post-esqueleto)
- **Velocidades aumentadas (todas):** jugador 210→300; Simple 95→150; Cazador 175→260; Compuesto 62→100; Jefe 34→60; proyectiles toxin 560→800, exotoxina 500→700, plásmido 380→620, torpedo 430. Ritmo de aparición de enemigos ~1,5× más rápido.
- **Spawn cerca del jugador con aviso:** los enemigos ya no aparecen en el borde lejano; ahora aparecen a 170-380 px del jugador (jefe 260-440) y antes de aparecer se dibuja una **cruz roja titilante** en la posición de aparición (`SPAWN_TELEGRAPH` = 0,9 s). El jefe titila 1,5 s.
- **Alcance de armas (rango):** cada arma tiene un `range` máximo de objetivo; si no hay enemigo dentro del rango, no dispara (toxina 430, exotoxina 380, biofilm 280, esporas 480, plásmido 440, torpedo 520).
- **Arma nueva — Torpedo pedorro:** proyectil lento que **explota en área** (radio 135), daño 45, recarga lenta 3,5 s. Tipo `explosive` en `Weapon`/`Projectile`.
- **Tienda rediseñada (multi-compra):** permite **comprar varias opciones** por visita; botón **Continuar** (Enter/C); **Reroll** (costo 8 + 4/nivel, tecla R); **vender armas** haciendo clic en el chip del arma (+20 monedas, no se puede vender la única arma).

### Ajustes de jugabilidad — segunda tanda
- **Más y más rápidos enemigos:** cantidad por oleada 8→12 … 30→42 (`waveEnemyCount`), intervalo de aparición más corto (`waveTimeLeft / (cola * 2)`), primer spawn a 0,2 s y telegrafiado reducido a `SPAWN_TELEGRAPH` 0,9→**0,55** s (jefe 1,15 s).
- **Apuntado inteligente (anti-overkill):** cada arma reserva su daño sobre el objetivo elegido en `enemy.incomingDamage` (los proyectiles en vuelo "comprometen" daño). Al elegir objetivo se descartan los enemigos que ya van a morir (`hp - incomingDamage <= 0`) y se apunta a otro; si no hay otro, no se dispara. La reserva se libera cuando el proyectil se destruye (`GameScene.releaseReservation`). Nuevos helpers `GameScene.acquireTarget` y `getNearestEnemy/getFarthestEnemy(..., skipDoomed)`; `Weapon` reescrito a `tryFire`/`fireSpread`/`fireSingle`/`fireTorpedo`.

### Ajustes de jugabilidad — tercera tanda
- **Aparición ilimitada por oleada:** ya no hay tope de enemigos. `updateWave` recarga la cola (`buildSpawnQueue`) cuando se agota y sigue apareciendo hasta que termina el tiempo de la oleada. Los **jefes** quedan exceptuados (aparecen una sola vez al inicio de las oleadas 3/6/9).
- **Velocidad de aparición por oleada:** nuevo `waveSpawnInterval(wave)` en `waves.js`: 0,70 s (oleada 1) → 0,38 s (oleada 9), y 0,28 → … en modo infinito (mín. 0,20). Reemplaza la fórmula anterior basada en tamaño de cola.

### Ajustes de jugabilidad — cuarta tanda (velocidades)
- **Enemigos:** Simple 150→260 (muy rápido), Cazador 260→340 (rapidísimo), Compuesto 100→190 (rápido), Jefe 60→300 (igual al jugador). La embestida del jefe pasó de `speed*7` a `speed*2` (~600).
- **Proyectiles MUY rápidos:** toxina 800→1600, exotoxina 700→1500, plásmido 620→1400, torpedo 430→1400.
- **Colisión barrida:** `Projectile` guarda `prevX/prevY` y `GameScene.segmentDistance` calcula la distancia punto-segmento del recorrido, para que los proyectiles ultra rápidos no atraviesen enemigos (tunneling).

### Ajustes de jugabilidad — quinta tanda (balance de enemigos)
- **Simple:** 305→250 px/s (más lento que el jugador).
- **Cazador:** 305→360 px/s (más rápido que el jugador).
- **Compuesto:** 60→90 HP (+50%); conserva 305 px/s.
- **Jefes:** vida 3000/6000/10000→1500/3000/5000 (mitad); el fallback `ENEMY_DEFS.boss.hp` también queda en 1500.

### Fix — carga de sprites desde file://
- **Problema:** el loader de Phaser 4 **no puede cargar imágenes por `file://`** (falla para todos los PNG) y WebGL las rechaza por cross-origin (canvas tainted). Por eso los sprites de `SPRITES/` no se veían.
- **Solución:** se embeben los 4 PNG como **data URI base64** en `src/data/sprites.js` (`SPRITE_DATA`) y `BootScene.preload` los carga con `this.load.image(key, SPRITE_DATA[key])`. Funciona abriendo `index.html` directamente (file://) y con renderer WebGL. `index.html` incluye `sprites.js`. El jefe usa la textura geométrica `enemy_boss` como respaldo; sus sprites propios se agregaron después (ver «Sprites de los jefes»).

### Sprites de los jefes
- Se agregaron `SPRITES/Jefe 1.png`, `Jefe 2.png` y `Jefe 3.png` (963×411 cada uno, fondo transparente). Se recortaron los márgenes transparentes antes de embeberlos como data URI en `SPRITE_DATA` (`enemy_boss_1`, `enemy_boss_2`, `enemy_boss_3`).
- **Mapeo por oleada:** 3 → Jefe 1 (286×174), 6 → Jefe 2 (175×337), 9 → Jefe 3 (176×369).
- `ENEMY_DEFS.boss.texturesByWave` define el mapeo; `Enemy` elige la textura según `scene.wave` y escala a un ancho visual de 120 px (`spriteWidth`) para mantener coherencia con el radio de colisión de 60 px.
- `enemy_boss` (geométrica) queda como respaldo si la oleada no tiene un sprite asignado.
- **Actualización:** se regeneraron los data URI de `enemy_boss_2` y `enemy_boss_3` con los PNG revisados (mismo recorte de 175×337 y 176×369). `sprites.js` pasó a `?v=8` en `index.html`.

### Presentación y balance — sexta tanda
- **Tipografía:** todas las escenas usan `FONT_FAMILY` (`'Lilita One', Arial, sans-serif`) definida en `src/data/constants.js`. `index.html` carga Lilita One desde Google Fonts y `BootScene` espera `document.fonts.load('16px "Lilita One"')` (con respaldo de 2 s) antes de iniciar. Si la fuente no está disponible, se usa Arial.
- **Menú principal:** decoración geométrica animada (grilla, halos, aro orbitando, microbios flotantes, burbujas y marco de esquinas), con paneles para título, récords y opciones. Navegación con flechas/WASD, confirmación con Enter/Espacio y mouse (hover/clic).
- **Cazador:** vida 40→38 (−5%).
- **Jefes:** vida 1500/3000/5000→1125/2250/3750 (−25%); el fallback `ENEMY_DEFS.boss.hp` queda en 1125.
- **Barra de vida del jefe:** contenedor en coordenadas de mundo sobre el sprite del jefe (`y - displayHeight/2 - 24`), 190×14 px, relleno proporcional a `hp/maxHp` y texto `JEFE hp / maxHp`. Se oculta cuando no hay un jefe vivo. Profundidad `DEPTH.damageText`.
- **Caché:** los scripts modificados pasan a `?v=9` en `index.html`; `sprites.js` conserva `?v=8`.

### Game feel, resolución y música — séptima tanda
- **Resolución 1920x1080:** `main.js` usa `RENDER_WIDTH/HEIGHT`. La interfaz sigue diseñada en 1280x720 (`GAME_WIDTH/HEIGHT`) y las cámaras aplican zoom 1,5 (`DISPLAY_SCALE`); nuevo `src/systems/Display.js` (`applyUiCamera`, `.toHud()` para el HUD fijo y textos rasterizados a 1,5x). La vista del mundo es la misma de antes, por lo que la dificultad no cambia. Si se quisiera ver más arena, habría que bajar el zoom de `GameScene` y reubicar el HUD.
- **Polvo al moverse:** `Player.emitDust` → `GameScene.spawnDust` (textura `particle`, tween de ~0,45 s).
- **Vibración de pantalla:** presets `SHAKE` en `constants.js` y `GameScene.shake()`: golpe de proyectil (45 ms, con enfriamiento), daño al jugador (110 ms), explosión (110 ms), jefe derrotado (220 ms).
- **Jefes:** vida ×1,1 (`BOSS_HP_MULTIPLIER`): 1238 / 2475 / 4125. Matar al jefe ya no corta la oleada: sigue hasta que se acaba el tiempo y entonces se entrega la recompensa gratuita (`bossDefeatedThisWave`, `endWave` → `showBossReward` → `afterWave`).
- **Muerte:** fase `dying` (2,4 s reales): cámara lenta hasta 0,18x (también tweens y música), zoom ×1,75 hacia el personaje, que se inclina y se apaga; sin daño por contacto ni nuevas apariciones. Luego `finishRun()` lanza `GameOverScene` con `scene.launch` y pausa `GameScene`: las estadísticas se ven sobre la partida detenida (también en la victoria). `GameOverScene.leaveTo()` detiene `GameScene` antes de reiniciar o ir al menú.
- **Música:** loop de 8 compases en La menor sintetizado con WebAudio en `AudioManager` (bajo, arpegio, melodía, percusión). Respeta el interruptor de sonido, se atenúa en la pausa y se apaga con la muerte.
- **Divergencias con el GDD (el GDD no se modificó):** §3 resolución interna 1280x720; §12 recompensa y fin de oleada al matar al jefe; «no hay música»; vida de jefes (el GDD ya figuraba desactualizado: 3000/6000/10000).
- **Verificación:** `node --check` de todos los `.js`; prueba de lógica con Phaser simulado (jefe sin cortar la oleada, recompensa al terminar el tiempo, secuencia de muerte, `GameOverScene`) y del planificador de música con WebAudio simulado. **No se ejecutó en un navegador real:** falta probar visualmente el zoom/HUD, la vibración, el polvo y el sonido.

### Música por escena, opciones de audio y pantalla de derrota — octava tanda
- **Pistas** (`src/systems/MusicTracks.js`, reproducidas por `AudioManager.playMusic(nombre)`): `menu` (tranquila, 72 BPM, sin percusión), `battle` (rondas normales, 124 BPM), `boss` (150 BPM, bajo sierra, doble bombo y riffs; suena mientras haya un jefe vivo o por aparecer, vía `GameScene.updateMusicMode`) y `defeat` (lenta y apagada, 54 BPM, filtrada). La victoria reutiliza `menu`. El cambio de pista corta y entra con fundido; durante la muerte la pista de ronda se frena y se apaga antes de entrar `defeat`.
- **Opciones/Pausa:** `AudioManager.enabled` ahora controla solo los efectos y la nueva `AudioManager.musicEnabled` solo la música. Opciones muestra «Efectos de sonido» y «Música»; la pausa muestra «Efectos» y «Música». No se guardan entre sesiones.
- **Derrota** (`GameOverScene`): COMBATE muestra solo enemigos derrotados (total), jefes derrotados y monedas; ARMAS EQUIPADAS sin cambios; ARMAS Y ESTADÍSTICAS muestra arma con mayor daño, vida máxima, velocidad alcanzada, daño aumentado, cadencia, tamaño de área y perforación. Cada estadística lleva un ícono geométrico dibujado por código (`src/systems/StatIcons.js`: calavera, corona, moneda, espada, corazón, rayo, estallido, doble flecha, diana, flecha con aro). Ya no se muestran «más disparos», «más bajas» ni el desglose por tipo (los datos siguen en `buildRunStats`).
- **Verificación:** `node --check`; prueba con WebAudio simulado (las 4 pistas recorren dos vueltas sin errores y las banderas de música/efectos son independientes) y con Phaser simulado (cambio `battle`↔`boss` al aparecer/morir el jefe, textos de la derrota, Opciones y Pausa). No se probó en un navegador real: falta oír las pistas y revisar el diseño de la derrota.

### Sonidos de interfaz, música de tienda, jefes con nombre y transiciones — novena tanda
- **Sonidos de UI** (`AudioManager`): `uiMove` (mover selección / pasar el mouse), `uiSelect` (confirmar), `uiBack` (volver), `uiToggle(on)` (activar/desactivar), `uiDeny` (sin monedas) y `transitionOut/In`. `beep` ahora acepta un `delay` para encadenar notas. Se usan en Inicio, Intro, Menú, Opciones, Pausa, Derrota y en la tienda/recompensa de jefe. Dependen del interruptor de efectos.
- **Música de tienda:** pista `shop` (104 BPM, do mayor con acordes de séptima, bajo saltarín y melodía a pizzicato). Suena en la tienda y en la recompensa del jefe (`GameScene.playShopMusic`); `updateMusicMode` solo actúa en fase `playing` y al volver a jugar elige `battle`/`boss`.
- **Jefes con nombre:** `ENEMY_DEFS.boss.namesByWave` = oleada 3 «Jabonoso Alvo», 6 «Clororín Bravo», 9 «Antisepticus Liquidus» (`bossNameForWave`, `Enemy.name`). Aparece en la barra del jefe, el aviso al empezar la oleada, el cartel «DERROTADO» y el título de la recompensa. En el modo infinito (oleadas > 9) vuelve a «Jefe».
- **Transiciones** (`src/systems/Transition.js`, textura `bubble` en `Textures.js`): `Transition.go(escena, accion)` tapa la pantalla con burbujas de jabón (suben desde abajo, fondo azul oscuro) y recién entonces cambia de escena; `Transition.in(escena)` las hace estallar de arriba hacia abajo al entrar. Usa `scrollFactor 0` + desplazamiento del HUD, igual que `.toHud()`. Aplicada en Inicio→Intro→Menú→Juego/Opciones, Pausa (reiniciar/salir) y Derrota (reintentar/menú). La tienda no usa transición.
- **Verificación:** `node --check`; pruebas con Phaser/WebAudio simulados (5 pistas, nombres de jefe, cambio de música en la recompensa y la tienda, `Transition.go/in` con bloqueo mientras está activa). **No se probó en un navegador real:** los efectos visuales y de sonido nuevos están sin ver ni oír.

### Poderes de los jefes — décima tanda
- **Jefes más lentos:** velocidad 300 → 190. Se quitó la carga genérica anterior; cada jefe usa su poder (`BOSS_POWERS` en `enemies.js`; `bossPowerForWave`; en modo infinito se repiten en ciclo, aunque el nombre vuelve a «Jefe»). Los poderes se activan al cumplirse su enfriamiento con un aviso en pantalla, una espera con el jefe sacudiéndose y teñido, la acción y una breve pausa.
- **Jabonoso Alvo — Embestida (cada 10 s):** la cámara se aleja con suavidad hasta encuadrar toda la arena (`MAP_VIEW_ZOOM` = 0,45) y queda fija; tras 1,2 s de aviso el jefe se lanza en línea recta hacia donde estaba el jugador a 1100 px/s, sigue de largo y rebota en 2 paredes; luego la cámara vuelve a seguir al jugador. Con el zoom alejado el HUD se reescala (`GameScene.applyHudComp`) para verse del mismo tamaño. Se corta de inmediato si el jugador muere, se limpia el campo o el jefe cae.
- **Clororín Bravo — Blanqueamiento total (cada 7 s):** se agita 1,2 s mientras un círculo de advertencia (radio 760) pulsa en el suelo; luego libera un anillo que se expande a 340 px/s y hace 20 de daño una sola vez si lo toca. **El anillo tiene 3 huecos seguros** (~40° cada uno, en posición aleatoria) por los que se puede pasar; es una decisión de diseño para que sea esquivable.
- **Antisepticus Liquidus — Lluvia antiséptica (cada 12 s):** se eleva (más grande, translúcido y sin daño por contacto) durante 3,6 s y marca puntos de impacto cada 0,22 s (45 % cerca del jugador); tras 0,9 s cada marca se vuelve un charco de 75 px que daña 5 cada 0,6 s y desaparece a los 6 s.
- **Implementación:** los peligros del suelo son `GameScene.hazards` (tipos `warn`, `ring`, `mark`, `puddle`) dibujados con un único `Graphics` (`updateHazards`). Valores de balance en `BOSS_POWERS`.
- **Verificación:** `node --check` y simulación con Phaser simulado (estados de cada poder, zoom 1,5 → 0,45 → 1,5, daño del anillo y de los charcos, reposición de la cámara). **No se vio en un navegador real:** el balance, la cámara y los efectos visuales están sin probar a ojo.

### Traducción al inglés — undécima tanda
- **Sistema:** `src/systems/I18n.js` (cargado antes de Textures). `t('texto en español', { params })` devuelve el texto en el idioma activo; la clave es el propio texto en español y si falta la traducción se muestra el español. `I18n.setLang/toggle/label`; el idioma se guarda en `localStorage` (`pablito_lang`) y por defecto es español. Los parámetros van como `{name}`, `{n}`, `{mult}`.
- **Diccionario:** `EN_TRANSLATIONS` en `I18n.js`. Incluye el archivo de traducción del proyecto (JSON con `key`/`translate`) tal cual, salvo cuatro correcciones: «Oleada 8/9» (estaba sin traducir), «[Efectos de sonido: ON]» (sin traducir), «Músic:» → «Music:» y «+25% maximum health» → «+25 maximum health» (la mejora da +25 de vida fija, no un porcentaje). Los textos que el archivo no tenía están en la sección «Agregadas».
- **Selector:** Opciones → «[ Idioma: Español / English ]» (reinicia la escena de opciones sin transición). Los nombres de armas y mejoras se traducen al mostrarse (`t(def.name)`); los datos en `data/` siguen en español. Los nombres de los jefes no se traducen.
- **Pendiente / a revisar:** el JSON trae claves que el código ya no usa (p. ej. «Oleada 3/9» o «Sonido:»; ahora se arma con «Oleada» + número). Quedó «odas de bacterias» (sic) en el texto en español de la intro porque la clave del diccionario debe coincidir con él.
- **Verificación:** `node --check` y simulación en español e inglés (avisos de jefe, tienda, creación de escenas, cambio de idioma). No se vio en un navegador real.

- **Git:** repositorio inicializado en rama `main`.
  - Remoto: `https://github.com/F4cuu/TP-FINAL-FINAL.git` (origin).
  - Identidad local: `F4cuu` / `f4cundoibanez@gmail.com`.
  - Commits en `main`: `2a8c8ab` (docs iniciales) y `93a6a0b` (GDD ampliado).
  - Rama de trabajo actual: `feature/juego-base` (contiene el código, sin commitear).
- **Decisión sobre lenguaje/estructura:** JavaScript puro + Phaser por CDN (sin bundler); datos de balance separados de la lógica.
- **Verificación:** sintaxis de los 22 archivos JS validada con `node --check`; prueba smoke en Chrome headless (`--dump-dom`) recorriendo Boot, GameScene, tienda, victoria, modo infinito, game over, menú, opciones, intro y pausa → 0 errores.

### Manos y armas sostenidas, mapa más chico — duodécima tanda

- Pablito tiene manos verdes (pixel art, contorno negro) que sostienen cada arma comprada, orbitando alrededor suyo como en Brotato (referencia, no calco). Apuntan al enemigo más cercano en rango; las armas con `hands: 2` usan dos manos.
- `src/entities/PlayerHands.js` (nuevo): `sync()` crea un holder por arma, `muzzleFor(weapon)` da la boca del arma, `kick()` aplica retroceso, `fadeOut()` en la muerte. Los proyectiles salen de la boca del arma (`Weapon.origin`).
- Diseños pixel art (texturas `weapon_<key>` y `hand` en `Textures.js`, 1 px de arte = 2x2): toxin = pistola de baba con tanque, exotoxin = abanico plegable, biofilm = megáfono con ondas, spores = hongo lanzador, plasmid = subfusil con tambor en anillo, torpedo pedorro = lanzamisiles con un trasero en la punta.
- Mapa achicado al 50% por lado: `ARENA_WIDTH/HEIGHT` 3200x2400 → 1600x1200 (`MAP_VIEW_ZOOM` pasa a 0.9).
- Sin probar en navegador real; solo `node --check` y smoke test con Phaser simulado.

### Rondas de jefe, una mano por arma — decimotercera tanda

- Rondas de jefe: si el tiempo se acaba y el jefe sigue vivo, la oleada se prolonga (el reloj muestra ∞) hasta que muera; si muere antes, la ronda sigue hasta que termine el tiempo y después viene la recompensa (`bossPending()` en `GameScene`).
- Ronda 3 (Jabonoso Alvo) dura 40 s (`WAVE_DURATION_OVERRIDES` en `waves.js`; `startWave` usa `waveDuration`).
- Embestida: 5 rebotes (antes 2), `maxTime` 9 s.
- Todas las armas se sostienen con una sola mano: se eliminó el campo `hands` y la segunda mano de `PlayerHands`.

### Fondo del mapa decorado — decimocuarta tanda

- `src/systems/ArenaDecor.js` (nuevo): dibuja una vez, en un `Graphics` estático (depth arena + 0.5), una "muestra de microscopio": manchas de agar, cúmulos de células, bacilos, burbujas, motas y una viñeta oscura hacia el borde. Colores de bajo contraste y azar determinista (semilla fija). Se llama desde `GameScene.create` justo después del `tileSprite`.
- Captura de referencia generada fuera del juego (no se vio en navegador real).
- Movimiento lento: células, bacilos y burbujas son imágenes con texturas reutilizables (`decor_cluster_/rod_/bubble_`) que derivan a 1.5–9 px/s, giran apenas, las células pulsan ±3% y las burbujas suben con vaivén; reaparecen por el lado opuesto. `GameScene.decor.update(dt)` se llama solo mientras `phase === 'playing'`. Agar, motas y viñeta quedan estáticos.

## 6. Convenciones técnicas y de trabajo

- Responder en español.
- POO + patrones: State (escenas), Strategy (armas/enemigos), Factory (creación de enemigos y armas), Observer (HUD).
- No imponer patrones si no aportan valor.
- Reutilizar código existente antes de crear clases/componentes nuevos.
- Consultar sobre sprites/recursos gráficos antes de implementar la parte visual (mockups geométricos preferidos).
- No commit/push sin autorización explícita del usuario.

## 7. Notas técnicas para editar el .docx (descubiertas en la sesión)

- **NO usar Word COM** en PowerShell: abre diálogos ocultos y se cuelga (timeout).
- **Método confiable:** editar `word/document.xml` dentro del `.docx` (que es un ZIP) con `System.IO.Compression`, reemplazando el contenido del entry y reinsertándolo.
- Límite de **255 caracteres** en `Find.Execute` de Word: para textos largos, reemplazar el `w:t` directamente por XML.
- Los scripts de edición viven en `C:\Users\facun\AppData\Local\Temp\opencode\` (gdd_edit.ps1, gdd_verif.txt, gdd_xml.txt), persistieron las ediciones correctamente.