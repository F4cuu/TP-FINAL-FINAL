# PABLITO: BACTERIA SURVIVOR

## Documento de Diseño de Juego (GDD)

**Versión:** 2.0 — documento consolidado  
**Fecha:** 23 de octubre de 2026  
**Estado:** versión jugable implementada  
**Documento base:** este GDD describe el comportamiento de la build actual del proyecto. Cuando una regla de una versión anterior no coincide con el juego, se indica en el Anexo B.

---

## Índice

1. Concepto
2. Premisa y narrativa
3. Datos técnicos
4. Público objetivo y experiencia
5. Descripción general del juego
6. Escena de juego
7. Controles
8. Armas y combate
9. Sistema de mejoras y tienda
10. Elementos de la escena
11. Oleadas y composición de enemigos
12. Jefe
13. Flujo del juego y pantallas
14. Interfaz (HUD)
15. Arte, audio y feedback
16. Récords y persistencia
17. Reglas de combate
18. Arquitectura técnica y organización
19. Balance, métricas y criterios de aceptación
20. Limitaciones y trabajo futuro
- Anexo A. Fórmulas y constantes
- Anexo B. Cambios respecto de la versión anterior del GDD
- Anexo C. Glosario

---

## 1. Concepto

**High concept:** un roguelite de supervivencia en tiempo real donde Pablito, un pequeño microbio, resiste nueve oleadas de bacterias rivales, construye su arsenal entre rondas y decide si termina la partida o se interna en un modo infinito.

**Pitch:** Pablito es el 0,01% de bacterias que todavía sigue con vida. Durante pocas horas de juego debe moverse, esquivar, dejar que sus armas disparen solas y administrar las monedas que consigue para sobrevivir a un entorno hostil.

**Pilares de diseño**

- **Supervivencia legible:** el jugador no apunta manualmente; su decisión principal es moverse, leer la arena y elegir dónde estar.
- **Construcción de build:** las armas y las mejoras se combinan para producir partidas distintas.
- **Progresión por rondas:** cada oleada es un bloque corto y autocontenido, con una tienda entre bloques.
- **Rejugabilidad:** la selección aleatoria de la tienda, el modo infinito y los récords invitan a volver a jugar.

**Bucle principal**

1. El jugador aparece en el centro de la arena.
2. Las armas disparan automáticamente al enemigo más cercano dentro de su rango.
3. El jugador esquiva enemigos, recoge monedas y sobrevive hasta que termina el tiempo de la oleada.
4. Entre oleadas, compra mejoras o armas, vende armas y decide cuándo continuar.
5. En las oleadas 3, 6 y 9 aparece un jefe.
6. Al superar la oleada 9 puede terminar la partida o continuar en modo infinito.
7. La partida termina con la victoria, la derrota o el abandono desde el menú de pausa.

---

## 2. Premisa y narrativa

Pablito es el 0,01% de bacterias que aún queda con vida. Su misión es soportar las oleadas de desinfectante para poder propagarse y subsistir.

La narración se presenta en cuatro paneles de texto antes del menú principal. No hay diálogos, cinemáticas 3D ni misiones secundarias. El tono es arcade y humorístico, coherente con nombres como “Torpedo pedorro” o “Escupida de toxina”.

**Conflicto:** el mundo exterior es hostil y las bacterias rivales atacan sin descanso. La única forma de resistir es adaptarse: conseguir armas, subir de nivel y aguantar una oleada más.

**Objetivo narrativo:** que el jugador sienta que Pablito pasa de ser una bacteria diminuta y vulnerable a una amenaza capaz de resistir nueve oleadas.

---

## 3. Datos técnicos

| Campo | Valor |
|---|---|
| Nombre | Pablito: Bacteria Survivor |
| Género | Roguelite de supervivencia / “Vampire Survivors” |
| Perspectiva | Vista cenital 2D |
| Plataforma | Navegador web de escritorio |
| Motor | Phaser 4.2.1, cargado por CDN |
| Lenguaje | JavaScript, HTML5 y CSS |
| Arquitectura | Scripts clásicos sin bundler; datos de balance separados de la lógica |
| Resolución interna | 1280 × 720 px |
| Escalado | `Phaser.Scale.FIT` con centrado automático |
| Modo de juego | Un jugador local |
| Duración de una partida | Aproximadamente 10 a 20 minutos, según la tienda y el modo infinito |
| Idioma | Español |
| Audio | Efectos sintetizados con WebAudio; sin archivos de audio externos |
| Persistencia | Récords en `localStorage` |
| Controles | Teclado y mouse |
| Estado | Jugable de principio a fin |

**Requisitos:** navegador moderno con soporte para Canvas/WebGL, WebAudio y `localStorage`. La carga de Phaser desde CDN requiere conexión a internet.

**Arquitectura general:** el proyecto separa datos, entidades, fábricas, armas, escenas y sistemas. Las escenas funcionan como estados del juego; las armas aplican variantes de disparo; la fábrica crea enemigos; los valores de balance viven en archivos de datos.

---

## 4. Público objetivo y experiencia

**Público objetivo:** jugadores de 13 años en adelante, familiarizados con roguelites de supervivencia o con ganas de probar una partida corta sin apuntado manual. También apunta a jugadores casuales de PC que buscan una experiencia de acción ligera.

**Experiencia buscada**

- Partidas cortas, con progresión visible dentro de cada run.
- Caos controlable: muchos enemigos en pantalla, pero con reglas claras.
- Decisiones de construcción de build en la tienda.
- Sensación de mejora constante: más daño, más cadencia, más área, más vida.
- Un cierre claro en la oleada 9 y una opción de continuar para quien quiera más desafío.

**Propuesta diferencial**

- Combate automático que desplaza la dificultad hacia el movimiento y la posición.
- Tienda entre oleadas con compra múltiple, reroll y venta de armas.
- Jefes con una embestida telegrafiada que obliga a cambiar de posición.
- Modo infinito como extensión de la run, no como modo separado.

---

## 5. Descripción general del juego

*Pablito: Bacteria Survivor* es un juego de supervivencia local con arte de figuras geométricas y sprites simples. El objetivo es sobrevivir a nueve oleadas de enemigos que aumentan su dificultad con cada ronda.

Cada oleada tiene una duración fija. Los enemigos aparecen de forma continua hasta que el tiempo se agota; la oleada no termina por cantidad de bajas. Al finalizar, el escenario se limpia y el jugador recupera toda su vida antes de la siguiente ronda.

El jugador comienza con la **Escupida de toxina** a nivel 1 y puede equipar hasta cuatro armas. Las armas disparan solas al enemigo más cercano dentro de su rango. Durante la partida se consiguen monedas al eliminar enemigos; esas monedas se gastan en la tienda que aparece entre oleadas.

Las oleadas 3, 6 y 9 incluyen un jefe además de la oleada normal. Si el jugador sobrevive a la oleada 9, puede terminar la partida o continuar en modo infinito. La derrota ocurre cuando la vida del jugador llega a 0.

**Condición de victoria:** sobrevivir hasta el final de la oleada 9.  
**Condición de derrota:** perder toda la vida.  
**Condición de continuación:** elegir “Modo infinito” en la pantalla de victoria.

---

## 6. Escena de juego

La partida se desarrolla en una arena rectangular de **3200 × 2400 px**, más grande que la pantalla. La cámara sigue al jugador con suavidad y está limitada a los bordes de la arena. No hay obstáculos, coberturas ni zonas seguras.

**Elementos del escenario**

- Fondo de grilla oscura, con baldosas de 64 × 64 px.
- Borde azul que delimita la arena.
- Jugador, enemigos, proyectiles, partículas y marcadores de aparición.
- HUD fijo a la cámara, independiente del desplazamiento.

**Inicio de una oleada**

- El jugador vuelve al centro de la arena.
- La vida se restaura por completo.
- Se eliminan enemigos, proyectiles y marcadores pendientes.
- Se carga la composición de la oleada y comienza el temporizador.

**Aparición de enemigos**

- Los enemigos normales aparecen a **170–380 px** del jugador.
- El jefe aparece a **260–440 px** del jugador.
- Antes de aparecer, una cruz roja titilante marca el punto durante **0,55 s** (el jefe, **1,15 s**).
- La posición se limita al interior de la arena para evitar apariciones fuera del escenario.
- No hay apariciones sobre el jugador ni fuera de los límites.

**Cámara:** sigue al jugador con interpolación; no hay control manual de cámara. La arena grande permite huir, rodear enemigos y cambiar de posición, pero no permite salir de los límites.

---

## 7. Controles

| Contexto | Acción | Entrada |
|---|---|---|
| Pantalla inicial | Avanzar | Cualquier tecla o clic |
| Introducción | Avanzar panel | Cualquier tecla o clic |
| Menú principal | Navegar | Flechas arriba/abajo o W/S |
| Menú principal | Confirmar | Enter, Espacio o clic |
| Opciones | Activar/desactivar sonido | Clic |
| Opciones | Volver | Escape |
| Partida | Mover | Flechas o WASD |
| Partida | Pausar | Escape o P |
| Pausa | Navegar | Flechas arriba/abajo |
| Pausa | Confirmar | Enter o clic |
| Pausa | Reanudar | Escape |
| Tienda | Comprar opción | 1, 2, 3 o clic |
| Tienda | Reroll | R |
| Tienda | Continuar | Enter, C o clic |
| Tienda | Elegir arma duplicada | E (equipar) o A (acoplar) |
| Tienda | Vender arma | Clic en el chip del arma |
| Recompensa de jefe | Elegir | 1, 2, 3 o clic |
| Victoria | Terminar / Modo infinito | 1 / 2 o clic |

No hay soporte de gamepad ni de movimiento táctil. El mouse se usa para menús, tienda y botones; el movimiento durante la partida es exclusivamente por teclado.

---

## 8. Armas y combate

### Reglas generales

- El jugador comienza con **Escupida de toxina** nivel 1.
- Puede equipar hasta **4 armas**.
- Las armas disparan automáticamente al enemigo más cercano dentro de su rango de adquisición.
- Si no hay enemigo dentro del rango, el arma no dispara y no consume su recarga.
- Los proyectiles desaparecen al impactar, salvo el **Plásmido veloz**, que atraviesa.
- El **Torpedo pedorro** explota al impactar o al alcanzar el final de su vida útil.
- La colisión de proyectiles usa un barrido por segmento para evitar que proyectiles rápidos atraviesen enemigos.
- El daño de un arma sube con su nivel: **+25% del daño base por nivel adicional**.
- Las mejoras de daño, cadencia, área y perforación se aplican a todas las armas.

### Apuntado y anti-solapamiento

Las armas con proyectil reservan el daño sobre el objetivo elegido. Mientras un proyectil está en vuelo, el enemigo queda marcado como “ya condenado” si el daño reservado alcanza para matarlo. Las siguientes armas buscan otro objetivo para no desperdiciar daño. Si todos los enemigos dentro del rango ya van a morir, el arma espera.

Las armas dirigidas (esporas y plásmido) también descartan objetivos condenados, pero no reservan daño. El biofilm no discrimina objetivos: daña a todos los enemigos dentro de su radio.

### Tabla de armas

| Arma | Tipo | Daño base | Recarga | Rango de objetivo | Proyectiles / área | Notas |
|---|---|---:|---:|---:|---|---|
| Escupida de toxina | Proyectil recto | 10 | 0,6 s | 430 px | 1 proyectil, radio 7 | Arma inicial; bajo costo y cadencia alta |
| Abanico de exotoxina | Proyectil en abanico | 5 por proyectil | 2,0 s | 380 px | 5 proyectiles, dispersión 0,6 rad, radio 6 | Cada proyectil impacta por separado |
| Onda de biofilm | Área centrada en el jugador | 15 | 3,0 s | 280 px | Radio 120 px | Daña a todos los enemigos cercanos; no empuja |
| Liberación de esporas | Área dirigida | 25 | 4,0 s | 480 px | Radio 140 px | Explota en el enemigo más cercano dentro del rango |
| Plásmido veloz | Ráfaga perforante | 8 por impacto | 2,0 s | 440 px | 8 disparos cada 0,15 s, radio 6 | Perforación base 99; recorre la arena |
| Torpedo pedorro | Proyectil explosivo | 45 | 3,5 s | 520 px | Explosión de radio 135 px | Explota al impactar o al final de su vida útil |

**Aclaración sobre el alcance:** en las armas de proyectil, el “rango de objetivo” es la distancia máxima a la que el arma busca un enemigo. Salvo el torpedo, los proyectiles tienen una vida útil de 1,6 s y pueden seguir viajando más allá de ese rango. El torpedo tiene una vida de aproximadamente 0,47 s; si no impacta, explota al final de su recorrido.

### Fórmulas de combate

- **Daño de arma:** `daño base × (1 + 0,25 × (nivel − 1)) × multiplicador de daño del jugador`.
- **Cadencia:** `recarga base ÷ multiplicador de cadencia`.
- **Área:** `radio base × multiplicador de área`.
- **Perforación:** `perforación base + bonificación del jugador`.
- **Vida de proyectil:** 1,6 s para armas normales; el torpedo usa una vida calculada a partir de su alcance.

---

## 9. Sistema de mejoras y tienda

La tienda aparece al finalizar cada oleada: desde la oleada 1 hasta la 8 en la run estándar y después de cada oleada en el modo infinito. No tiene límite de tiempo real: el jugador decide cuándo continuar. Mientras la tienda está abierta, el combate está detenido y el temporizador de la oleada no avanza.

La tienda presenta **3 opciones aleatorias** elegidas de un pool compuesto por las 6 mejoras y las 6 armas. Se pueden comprar varias opciones en una misma visita; cada tarjeta se marca como comprada y no se puede volver a comprar en esa visita.

**Precios**

- Los precios se multiplican por `1,35^(oleada − 1)` y se redondean.
- Arma: costo base 40 monedas.
- Mejoras: costos base entre 20 y 35 monedas.
- Reroll: 8 monedas + 4 por cada reroll adicional en la misma tienda, también escalado por oleada.
- Venta de arma: 20 monedas, independientemente de su nivel.

**Ejemplos de precio**

| Artículo | Oleada 1 | Oleada 8 |
|---|---:|---:|
| Arma | 40 | 327 |
| Mejora de 30 | 30 | 245 |
| Reroll inicial | 8 | 65 |

**Compra de armas**

- Si el arma no está equipada, se coloca en un espacio libre.
- Si el arma ya está equipada y hay un espacio libre, el jugador elige entre **equipar una copia nueva** o **acoplarla** para subir el nivel del arma existente.
- Si no hay espacio libre y el arma ya está equipada, se acopla automáticamente.
- Un arma nueva entra siempre a nivel 1.
- No hay límite máximo de nivel.

**Venta**

- Se puede vender cualquier arma equipada haciendo clic en su chip.
- No se puede vender la única arma del jugador.
- La venta devuelve 20 monedas y cuenta como moneda conseguida en las estadísticas finales.

**Mejoras**

| Mejora | Efecto por nivel | Costo base |
|---|---|---:|
| Cápside resistente | +25 de vida máxima y +25 de vida actual | 25 |
| Flagelo acelerado | +10% de velocidad de movimiento | 20 |
| Virulencia | +20% de daño de todas las armas | 30 |
| Metabolismo veloz | +15% de cadencia de disparo | 30 |
| Biofilm denso | +15% de tamaño de proyectiles y áreas | 25 |
| Perforación de membrana | +1 enemigo atravesado | 35 |

Las mejoras son acumulables y no tienen límite de nivel. La vida máxima adicional también se aplica a la vida actual en el momento de la compra, aunque el jugador recupera toda la vida al comenzar cada oleada.

**Recompensa de jefe:** al derrotar a un jefe, se abre una selección gratuita de 3 opciones. El jugador elige una mejora o un arma y luego continúa el flujo normal de la oleada.

---

## 10. Elementos de la escena

### Jugador

| Atributo | Valor |
|---|---:|
| Vida inicial | 30 |
| Velocidad base | 300 px/s |
| Radio de colisión | 18 px |
| Armas iniciales | 1 (Escupida de toxina) |
| Armas máximas | 4 |
| Curación | Completa al comenzar cada oleada |

El jugador se mueve en ocho direcciones, con velocidad normalizada en diagonal. No tiene invulnerabilidad global: cada enemigo que lo toca aplica daño y entra en un enfriamiento de contacto de 0,6 s. Varios enemigos pueden golpearlo casi al mismo tiempo.

### Enemigos

| Tipo | Vida base | Daño | Velocidad | Radio | Monedas | Notas |
|---|---:|---:|---:|---:|---:|---|
| Simple | 20 | 10 | 305 px/s | 16 px | 3–10 | Enemigo básico y más común |
| Cazador | 40 | 6 | 305 px/s | 15 px | 7–15 | Más vida que el Simple, pero menos daño |
| Compuesto | 60 | 15 | 305 px/s | 22 px | 15–30 | Más grande y resistente |
| Jefe | 3000 / 6000 / 10000 | 60 | 300 px/s | 60 px | 50–100 | Vida fija según oleada 3, 6 o 9 |

La vida de los enemigos normales escala con la oleada: `vida base × 1,2^(oleada − 1)`. El daño no escala. Los jefes usan vida fija por oleada y no reciben el escalado normal.

Los enemigos se separan entre sí cuando se superponen, pero mantienen su dirección hacia el jugador. No hay enemigos que disparen a distancia ni ataques de área enemigos, salvo la embestida del jefe.

### Otros elementos

- **Monedas:** no son objetos físicos que se recogen. Al morir un enemigo, las monedas se suman automáticamente y aparece un texto flotante con la cantidad.
- **Proyectiles:** círculos de color según el arma.
- **Marcador de aparición:** cruz roja titilante.
- **Partículas:** rastro de movimiento, impacto y muerte.
- **Piso:** baldosas de grilla; no hay obstáculos ni coberturas.

---

## 11. Oleadas y composición de enemigos

El juego tiene **9 oleadas**. Cada una termina cuando se agota su temporizador, no cuando se eliminan todos los enemigos. Al terminar, se limpia el campo y el jugador recupera toda la vida.

| Oleada | Duración | Intervalo de aparición | Cola inicial | Composición | Jefe |
|---:|---:|---:|---:|---|---|
| 1 | 20 s | 0,70 s | 12 | 100% Simples | No |
| 2 | 24 s | 0,66 s | 16 | 100% Simples | No |
| 3 | 28 s | 0,62 s | 19 | 90% Simples, 10% Cazadores | Sí: 3000 HP |
| 4 | 32 s | 0,58 s | 23 | 70% Simples, 30% Cazadores | No |
| 5 | 36 s | 0,54 s | 26 | 100% Cazadores | No |
| 6 | 40 s | 0,50 s | 30 | 40% Simples, 40% Cazadores, 20% Compuestos | Sí: 6000 HP |
| 7 | 44 s | 0,46 s | 34 | 30% Simples, 30% Cazadores, 40% Compuestos | No |
| 8 | 48 s | 0,42 s | 38 | 30% Cazadores, 70% Compuestos | No |
| 9 | 50 s | 0,38 s | 42 | 70% Simples, 30% Compuestos | Sí: 10000 HP |

**Lectura de la tabla:** la columna “cola inicial” indica cuántos enemigos se cargan al comenzar la oleada. Cuando la cola se agota, se vuelve a llenar mientras la oleada siga activa. Por eso la cantidad real de apariciones es mayor que la cola inicial: aproximadamente 29 apariciones en la oleada 1 y 132 en la oleada 9, además del jefe.

**Dificultad**

- La duración crece de 20 a 50 s.
- El intervalo de aparición baja de 0,70 a 0,38 s.
- La vida de los enemigos normales escala un 20% acumulativo por oleada.
- La composición incorpora Cazadores desde la oleada 3 y Compuestos desde la oleada 6.
- Los jefes aparecen una sola vez al inicio de las oleadas 3, 6 y 9.

**Modo infinito**

- Se desbloquea al terminar la oleada 9.
- Comienza en la oleada 10.
- Cada oleada dura 50 s.
- La composición es la de la oleada 8: 30% Cazadores y 70% Compuestos.
- La cola inicial es `42 + 8 × (oleada − 9)`.
- El intervalo de aparición es `máx(0,20; 0,30 − 0,02 × (oleada − 9))`.
- La vida de los enemigos sigue escalando; el daño se mantiene.
- No se agregaron jefes adicionales en el modo infinito.
- La tienda sigue apareciendo entre oleadas.

---

## 12. Jefe

Solo existe un tipo de jefe. Aparece al inicio de las oleadas 3, 6 y 9, además de los enemigos normales de esa oleada.

| Atributo | Valor |
|---|---:|
| Vida | 3000 (oleada 3), 6000 (oleada 6), 10000 (oleada 9) |
| Daño de contacto | 60 |
| Velocidad de persecución | 300 px/s |
| Velocidad de embestida | 600 px/s |
| Radio | 60 px |
| Monedas | 50–100 |

**Aparición:** el jefe aparece con un aviso de 1,15 s, más largo que el de los enemigos normales. Su marcador es más grande y parpadea en rojo.

**Habilidad de embestida**

1. Cada 10 s, el jefe entra en estado de telegrafiado durante 1 s.
2. Se detiene, se tiñe de rojo y emite un sonido de aviso.
3. Registra la posición del jugador en ese momento.
4. Durante 0,7 s se desplaza a 600 px/s hacia esa posición fija.
5. Al terminar, vuelve a perseguir al jugador y reinicia el contador de 10 s.

La embestida no sigue al jugador durante el desplazamiento: apunta a la posición registrada antes del ataque. Esto permite esquivarla cambiando de dirección después del telegrafiado.

**Recompensa:** si el jefe muere, se abre una selección gratuita de 3 opciones. Si el temporizador de la oleada termina antes de que el jefe muera, el jefe se elimina con el resto del campo y no se obtiene recompensa. En la oleada 9, la victoria se decide por sobrevivir al temporizador, no por matar al jefe.

---

## 13. Flujo del juego y pantallas

**Flujo principal**

`Boot → Pantalla inicial → Introducción → Menú principal → Partida → Pausa / Tienda / Recompensa de jefe → Victoria o Derrota → Game Over`

**Pantallas**

1. **Boot:** carga los sprites y genera las texturas geométricas.
2. **Pantalla inicial:** título “PABLITO / Bacteria Survivor”; se avanza con cualquier tecla o clic.
3. **Introducción:** cuatro paneles narrativos; se avanza con cualquier tecla o clic.
4. **Menú principal:** muestra los récords y las opciones Jugar, Opciones y Salir.
5. **Opciones:** activa o desactiva el sonido; se vuelve con Escape.
6. **Partida:** arena, HUD, oleadas, tienda, jefes y recompensas.
7. **Pausa:** Continuar, Sonido ON/OFF, Reiniciar y Salir al menú.
8. **Victoria:** se muestra al sobrevivir la oleada 9; permite Terminar o Modo infinito.
9. **Game Over:** se muestra al perder toda la vida o al terminar la partida desde la victoria; incluye estadísticas y récords.
10. **Modo infinito:** continúa desde la oleada 10, sin pantalla de victoria posterior.

**Estados de la partida**

| Estado | Descripción | Salida |
|---|---|---|
| `playing` | Combate activo | Pausa, fin de oleada o derrota |
| `shop` | Tienda entre oleadas | Continuar |
| `bossReward` | Elección gratuita tras matar a un jefe | Elegir una opción |
| `victory` | Supervivencia a la oleada 9 | Terminar o modo infinito |
| `gameover` | Vida agotada o fin de la run | Reintentar o menú |

**Reinicio:** “Reiniciar” en la pausa crea una partida nueva. Los récords guardados se conservan. “Salir al menú” detiene la partida actual y vuelve al menú principal.

---

## 14. Interfaz (HUD)

**Durante la partida**

- **Vida:** barra en la esquina superior izquierda con número `HP actual / HP máximo`.
  - Verde por encima del 50%.
  - Amarilla entre 25% y 50%.
  - Roja por debajo del 25%.
- **Oleada:** texto centrado en la parte superior, por ejemplo “Oleada 3 / 9”.
- **Temporizador:** segundos restantes de la oleada, debajo del indicador de oleada.
- **Monedas:** panel en la esquina superior izquierda, debajo de la barra de vida.
- **Armas equipadas:** lista en la esquina inferior izquierda con nombre y nivel, por ejemplo “Escupida de toxina Nv.2”.
- **Aviso de vida baja:** borde rojo pulsante cuando la vida baja del 30%.
- **Feedback:** números de daño flotantes, texto de monedas, partículas de impacto y pequeños temblores de cámara.

No se usan iconos de armas: las armas se muestran como texto.

**Tienda**

- Tarjetas con nombre, descripción y precio.
- Las tarjetas compradas quedan deshabilitadas.
- Botón de reroll con costo visible.
- Botón de continuar.
- Sección de venta de armas con el valor de venta.
- El HUD de monedas se eleva por encima del overlay para poder consultarlo.

**Game Over**

- Título “VICTORIA” o “DERROTA”.
- Oleada alcanzada y tiempo total de la partida.
- Monedas conseguidas, enemigos comunes, cazadores, compuestos, jefes y total de enemigos.
- Armas equipadas con su nivel.
- Mejor arma por daño, por cantidad de activaciones y por bajas.
- Vida máxima, velocidad, daño aumentado, cadencia, área y perforación.
- Récords históricos.
- Botones Reintentar y Menú principal.

---

## 15. Arte, audio y feedback

**Estilo visual**

El juego combina sprites simples con formas geométricas generadas por código. La paleta principal es azul oscuro, con acentos verdes, celestes, amarillos y rojos.

| Elemento | Representación |
|---|---|
| Fondo | Grilla azul oscura de 64 × 64 px |
| Jugador | Cápsula verde con detalles más oscuros |
| Simple | Burbuja celeste |
| Cazador | Burbuja amarilla con varias burbujas internas |
| Compuesto | Rectángulo gris redondeado |
| Jefe | Forma amarilla grande tipo jabón |
| Proyectiles | Círculos de color según el arma |
| Marcador de aparición | Cruz roja titilante |

**Feedback visual**

- El jugador y los enemigos “respiran” con un pulso suave.
- Los enemigos dejan un rastro de partículas al moverse.
- Al recibir daño, el enemigo parpadea en blanco.
- Los números de daño flotan y se desvanecen.
- Al morir, el enemigo gira, se encoge y desaparece.
- La cámara tiembla al recibir daño y en las explosiones.
- El borde de la pantalla se tiñe de rojo con vida baja.
- La tienda y las recompensas usan overlays oscuros con tarjetas.

**Audio**

Todos los sonidos son efectos sintetizados con WebAudio; no hay música ni archivos externos. Se registran al menos estos eventos:

- Disparo.
- Impacto.
- Daño recibido.
- Aparición de jefe.
- Compra o mejora.
- Fin de oleada.
- Game over.
- Beeps de navegación y confirmación en menús.

El sonido se puede desactivar desde Opciones o desde la pausa. La preferencia no se guarda entre recargas.

---

## 16. Récords y persistencia

Los récords se guardan en `localStorage` bajo la clave `pablito.records`. Se actualizan al terminar una partida por derrota o por victoria.

| Récord | Significado |
|---|---|
| `maxCoins` | Mayor cantidad de monedas **en posesión** al terminar una partida |
| `maxWave` | Oleada máxima alcanzada |
| `maxTime` | Mayor tiempo de combate acumulado, sin contar tienda, pausa ni recompensas |
| `maxKills` | Mayor cantidad de enemigos eliminados en una partida |

Los récords se muestran en el menú principal y en la pantalla de Game Over. No existe guardado de partida: si se cierra el navegador o se abandona la run, se pierde el estado de esa partida, pero los récords permanecen.

**Tiempos**

- **Tiempo total de la partida:** incluye combate, tienda y recompensas de jefe; no incluye la pausa.
- **Tiempo de combate:** solo cuenta mientras el estado es `playing`; se usa para el récord `maxTime`.

**Estadísticas de la run**

Además de los récords, el Game Over muestra las monedas totales conseguidas (incluidas las ventas), las bajas por tipo, los jefes derrotados, las armas equipadas y las mejoras acumuladas. “Disparos” cuenta activaciones de arma, no proyectiles individuales.

---

## 17. Reglas de combate

- **Daño por contacto:** no hay ataques a distancia enemigos, salvo la embestida del jefe.
- **Sin invulnerabilidad global:** el jugador puede recibir daño de varios enemigos a la vez.
- **Enfriamiento por enemigo:** cada enemigo puede volver a dañar al jugador después de 0,6 s.
- **Separación:** los enemigos se empujan entre sí para no superponerse, pero mantienen el rumbo hacia el jugador.
- **Límites:** jugador y enemigos quedan contenidos dentro de la arena.
- **Proyectiles:** colisión por barrido; cada proyectil lleva un registro de enemigos ya golpeados para no aplicar daño múltiple al mismo objetivo.
- **Perforación:** el Plásmido veloz atraviesa enemigos; las demás armas se detienen al impactar. La mejora de perforación añade impactos adicionales.
- **Explosiones:** el torpedo aplica daño en un radio al impactar o al agotar su vida útil.
- **Fin de oleada:** los enemigos y proyectiles restantes se eliminan; no otorgan monedas ni bajas.
- **Sin estados alterados:** no hay veneno, ralentización, empuje de biofilm ni curación por golpe.
- **Sin recogida manual:** las monedas se acreditan automáticamente.

---

## 18. Arquitectura técnica y organización

**Estructura**

| Carpeta / archivo | Responsabilidad |
|---|---|
| `index.html` | Carga Phaser y los scripts en orden de dependencia |
| `src/main.js` | Configuración del juego, resolución, escalado y lista de escenas |
| `src/data/` | Constantes, enemigos, armas, oleadas y mejoras |
| `src/entities/` | Jugador, enemigo y proyectil |
| `src/factories/` | Creación y posicionamiento de enemigos |
| `src/weapons/` | Comportamiento de disparo de las armas |
| `src/scenes/` | Estados y pantallas del juego |
| `src/systems/` | Texturas, audio y persistencia |
| `SPRITES/` | Sprites del jugador y de tres enemigos |

**Patrones y decisiones**

- **State:** las escenas representan estados del juego y controlan transiciones.
- **Strategy:** el tipo de arma define el comportamiento de disparo (proyectil, área, área dirigida, ráfaga, explosivo).
- **Factory:** `EnemyFactory` centraliza la creación y la aparición de enemigos.
- **Data-driven:** los valores de balance están en archivos de datos separados de la lógica.
- **Física manual:** las colisiones se resuelven por distancia y por distancia punto-segmento; no se usa el sistema Arcade de Phaser.
- **Sin bundler:** se usan scripts clásicos y variables globales; el orden de carga es importante.

**Dependencias:** Phaser 4.2.1 por CDN. El resto es código propio y APIs del navegador (`localStorage`, WebAudio, Canvas/WebGL).

---

## 19. Balance, métricas y criterios de aceptación

**Objetivos de balance**

- Que cada oleada dure entre 20 y 50 s.
- Que la dificultad crezca por densidad, composición y vida, no por daño enemigo.
- Que la tienda ofrezca decisiones significativas sin detener el ritmo durante demasiado tiempo.
- Que los jefes obliguen a cambiar de posición y no solo a tener más daño.
- Que una run completa se sienta como una curva de mejora constante.

**Métricas actuales**

- Vida inicial del jugador: 30. Un Simple hace 10 de daño; tres contactos sin curarse matan al jugador.
- El jugador recupera toda la vida al comenzar cada oleada; el desafío es dentro de la oleada.
- La vida de los enemigos normales crece un 20% acumulativo por oleada.
- Los jefes tienen 3000, 6000 y 10000 HP, respectivamente.
- La densidad de aparición crece de 0,70 s a 0,38 s entre enemigos.

**Criterios de aceptación**

| Requisito | Estado |
|---|---|
| Flujo Boot → Inicio → Intro → Menú | Implementado |
| Movimiento con flechas y WASD | Implementado |
| Combate automático con apuntado al más cercano | Implementado |
| Cuatro espacios de armas | Implementado |
| Seis armas con comportamientos distintos | Implementado |
| Oleadas 1 a 9 con duración fija | Implementado |
| Jefes en oleadas 3, 6 y 9 | Implementado |
| Tienda entre oleadas con compra, reroll y venta | Implementado |
| Recompensa gratuita al derrotar un jefe | Implementado |
| Victoria, modo infinito y derrota | Implementado |
| Pausa con reanudar, reiniciar y salir | Implementado |
| HUD de vida, oleada, tiempo, monedas y armas | Implementado |
| Récords persistentes | Implementado |
| Estadísticas finales de la run | Implementado |
| Audio sintetizado y opción de silencio | Implementado |

**Verificación realizada:** se ejecutaron pruebas de humo en Chrome headless recorriendo menú, partida, tienda, victoria, modo infinito, Game Over, opciones, introducción y pausa, sin errores de JavaScript. La sintaxis de los archivos se validó con `node --check`.

---

## 20. Limitaciones y trabajo futuro

**Alcance actual**

- Solo PC; no hay controles táctiles ni gamepad.
- La tienda no tiene límite de tiempo real.
- No hay música, solo efectos sintetizados.
- No hay guardado de partida; solo se conservan los récords.
- El modo infinito no incorpora jefes adicionales.
- No hay objetos recogibles, coberturas ni modificadores de escenario.
- No hay sistema de progresión permanente entre partidas.
- No hay opciones de accesibilidad avanzadas (volumen, remapeo, alto contraste, subtítulos).
- La carga del motor depende de un CDN y de conexión a internet.
- Las pruebas se limitaron a Chrome; falta validar otros navegadores.

**Trabajo futuro**

- Añadir más tipos de enemigos y patrones de ataque.
- Incorporar jefes al modo infinito y variantes de jefe.
- Agregar evolución de armas y sinergias entre mejoras.
- Añadir música y un control de volumen independiente.
- Implementar controles táctiles y soporte para gamepad.
- Guardar la preferencia de sonido y, opcionalmente, una run en curso.
- Añadir objetos recogibles, coberturas y eventos de arena.
- Incorporar opciones de accesibilidad y localización.
- Optimizar con pooling de proyectiles y enemigos si la densidad aumenta.
- Ampliar las pruebas automatizadas y de rendimiento.

---

## Anexo A. Fórmulas y constantes

| Regla | Fórmula / valor |
|---|---|
| Resolución interna | 1280 × 720 |
| Arena | 3200 × 2400 |
| Duración de oleada | `mín(20 + 4 × (oleada − 1), 50)` |
| Vida de enemigo normal | `vida base × 1,2^(oleada − 1)` |
| Vida de jefe | 3000 / 6000 / 10000 según oleada |
| Intervalo de aparición | `máx(0,30; 0,70 − 0,04 × (oleada − 1))` |
| Cola inicial | `round(12 + 30 × (oleada − 1) ÷ 8)` |
| Cola en infinito | `42 + 8 × (oleada − 9)` |
| Intervalo en infinito | `máx(0,20; 0,30 − 0,02 × (oleada − 9))` |
| Vida del jugador | 30 |
| Velocidad del jugador | 300 px/s |
| Radio del jugador | 18 px |
| Armas máximas | 4 |
| Daño por nivel de arma | `base × (1 + 0,25 × (nivel − 1))` |
| Precio de tienda | `round(base × 1,35^(oleada − 1))` |
| Reroll | `(8 + 4 × rerolls) × 1,35^(oleada − 1)` |
| Venta de arma | 20 monedas |
| Enfriamiento de contacto | 0,6 s por enemigo |
| Aviso de aparición | 0,55 s (normal), 1,15 s (jefe) |
| Embestida del jefe | 1 s de telegrafiado + 0,7 s a 600 px/s |

---

## Anexo B. Cambios respecto de la versión anterior del GDD

La versión anterior del documento contenía valores y reglas que no coincidían con la build actual. Este GDD los corrige:

| Tema | Versión anterior | Build actual |
|---|---|---|
| Vida del jugador | 100 HP | 30 HP |
| Curación entre oleadas | No se cura | Recupera toda la vida al comenzar cada oleada |
| Vida del Cazador | 10 HP | 40 HP |
| Vida del Jefe | 500 HP | 3000 / 6000 / 10000 HP |
| Velocidad de enemigos | Cazador rápido, Compuesto lento, Jefe muy lento | Todos los normales a 305 px/s; jefe a 300 px/s y embestida a 600 px/s |
| Tienda | 1 minuto de tiempo real | Sin límite de tiempo; se continúa manualmente |
| Biofilm | Daña y empuja | Solo daña en área |
| Esporas | Explotan en el enemigo más lejano | Explotan en el enemigo más cercano dentro del rango |
| Cantidad de enemigos | 8 a 30 | Cola inicial de 12 a 42, con recarga continua; unas 29 a 132 apariciones por oleada |
| Escalado infinito | Sin aumento de HP | El HP sigue escalando; no hay jefes adicionales |
| Iconos de armas | Iconos transparentes | Lista de texto con nombre y nivel |
| Récords | Puntaje máximo | Monedas en posesión, oleada, tiempo de combate y bajas |
| Sección 4 | Ausente | “Público objetivo y experiencia” |

También se corrigió la duración de la oleada 9: la fórmula se limita a 50 s, por lo que la oleada 9 dura 50 s y no 52 s.

---

## Anexo C. Glosario

- **Build:** combinación de armas y mejoras de una partida.
- **Oleada:** bloque de combate con duración fija.
- **Rango de objetivo:** distancia máxima a la que un arma busca enemigos.
- **Reserva de daño:** daño comprometido por un proyectil en vuelo para evitar que varias armas apunten al mismo enemigo.
- **Perforación:** cantidad de enemigos adicionales que un proyectil puede atravesar.
- **Reroll:** acción de reemplazar las opciones de la tienda pagando monedas.
- **Modo infinito:** continuación de la partida después de la oleada 9, sin condición de victoria.
- **Run:** una partida completa, desde el inicio hasta la derrota, la victoria o el abandono.
