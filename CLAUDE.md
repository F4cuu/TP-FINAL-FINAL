# CLAUDE.md — TP FINAL (Pablito: Bacteria Survivor)

> Reemplaza a `AGENTS.md` (mismas reglas, actualizadas al estado real del repo). Claude Code lee este archivo automáticamente; `AGENTS.md` puede borrarse o conservarse para otras herramientas.

## 0. Proyecto en una mirada

- Juego estilo Vampire Survivors en **Phaser 4.2.1** (CDN jsDelivr), JavaScript puro con **scripts clásicos** (sin bundler ni módulos ES).
- Para ejecutarlo: abrir `index.html` en el navegador (funciona por `file://`; el CDN necesita internet).
- El orden de carga de los scripts está en `index.html` (datos → sistemas → entidades → fábricas → armas → escenas → `main.js`). Un archivo nuevo debe agregarse ahí.
- Al modificar un `.js`, subir su `?v=N` en `index.html` (caché del navegador).
- Los sprites de `SPRITES/` están embebidos como data URI en `src/data/sprites.js` (el loader de Phaser no carga imágenes por `file://`).
- Verificación disponible: `node --check <archivo>` para sintaxis y prueba manual en el navegador. No hay suite de tests.
- Bitácora de decisiones y cambios: `MEMORIA DE PROYECTO.md`. Registrar ahí los cambios relevantes de cada tarea.

### Resolución y pantalla (importante)

- Canvas real: **1920x1080** (`RENDER_WIDTH/HEIGHT`). La interfaz se diseña en un espacio de **1280x720** (`GAME_WIDTH/HEIGHT`) y las cámaras aplican `DISPLAY_SCALE` (1.5x). Ver `src/systems/Display.js`.
- Escena de menú nueva: llamar `applyUiCamera(this)` al inicio de `create()` y diseñar en coordenadas 1280x720.
- HUD/overlays de `GameScene`: crear los objetos fijos con `.toHud()` (reemplaza a `.setScrollFactor(0)`). No usar `setScrollFactor(0)` directamente: con el zoom de cámara el objeto quedaría desplazado.
- Los textos se rasterizan a 1.5x automáticamente (parche en `Display.js`).

## 1. Alcance y contexto

- Aplicar estas instrucciones al inicio de cada consulta y antes de modificar el proyecto.
- Responder en español y adaptar la profundidad del análisis a la complejidad de la solicitud.
- Documento de requisitos: **`GDD PROPUESTA.md`** (texto plano, en la raíz). Existen también `GDD PROPUESTA - FINAL.docx/.pdf` (versión de entrega) y versiones anteriores (`GDD PROPUESTA.docx`, `(reparado).docx`, `.pdf`); si difieren entre sí, consultar al usuario cuál manda. No existe carpeta `docs/`.
- Los `.docx` son archivos ZIP de Word, no texto plano. Para leerlos: extraer `word/document.xml`, o usar `python-docx`.
- El GDD **no siempre refleja el código actual** (p. ej. vida de los jefes, recompensa de jefe, resolución, música). Las divergencias conocidas se anotan en `MEMORIA DE PROYECTO.md`.
- Revisar la información vigente del GDD; no depender exclusivamente de resúmenes de conversaciones anteriores.
- Preservar el trabajo existente del usuario.

## 2. Revisar la documentación y el requisito

Antes de proponer o implementar una solución:

1. Identificar el requisito solicitado y su comportamiento esperado.
2. Revisar la documentación del proyecto (GDD y `MEMORIA DE PROYECTO.md`).
3. Consultar las secciones pertinentes del GDD:
   - 1 Concepto, 2 Premisa, 3 Datos técnicos, 5 Descripción, 6 Escena de juego, 7 Controles,
     8 Armas y combate, 9 Sistema de mejoras y tienda, 10 Elementos de la escena.
4. Clasificar el requisito como:
   - **Definido:** el GDD describe suficientemente el comportamiento.
   - **Parcialmente definido:** está contemplado, pero faltan detalles necesarios.
   - **No definido:** no aparece en el GDD.
   - **En contradicción:** la solicitud difiere de una regla documentada.
   - **No aplica:** es una consulta técnica o documental sin una regla funcional asociada.
5. Citar el documento y la sección (número de apartado del GDD) que respaldan el análisis.
6. Diferenciar las reglas documentadas de las propuestas y los supuestos.

Si el GDD no puede leerse, indicarlo claramente y no afirmar que el requisito está definido o ausente.

Un requisito no documentado puede ser una ampliación válida: identificarlo como tal y consultar las decisiones necesarias.

No modificar el GDD para justificar una implementación sin una solicitud explícita del usuario. Si una solicitud explícita del usuario contradice el GDD, implementarla y dejar constancia de la divergencia en el resumen final y en `MEMORIA DE PROYECTO.md`.

## 3. Analizar conflictos e impacto

Antes de modificar una funcionalidad:

- Revisar tanto las reglas del GDD como la implementación existente.
- Identificar dependencias, restricciones compartidas, excepciones, prioridades entre comportamientos y posibles regresiones.
- Analizar las interacciones con otras funcionalidades.
- Comparar el comportamiento actual con el GDD; no asumir que el código existente es necesariamente correcto.
- Detectar contradicciones internas del GDD.
- Comunicar los conflictos relevantes antes de modificar la parte afectada.

Adaptar el análisis al dominio de este videojuego (Vampire Survivors, Phaser 4) considerando cuando corresponda:

- Oleadas: duración fija por oleada que crece entre oleadas (20s→50s, +4s por oleada), jefe en las oleadas 3, 6 y 9.
- Jefes: matar al jefe **no** termina la oleada; esta dura hasta que se acaba el tiempo. La recompensa gratuita se entrega al terminar el tiempo si el jefe fue derrotado. Vida de jefes en `src/data/enemies.js` (`BOSS_HP_BY_WAVE` × `BOSS_HP_MULTIPLIER`).
- Condición de victoria: sobrevivir las 9 oleadas; luego opción de terminar o modo infinito.
- Condición de derrota: barra de vida llega a 0 → secuencia de muerte (cámara lenta y zoom) → estadísticas sobre la partida detenida; no hay cura entre oleadas.
- Movimiento y límites de la arena: arena grande limitada, cámara que sigue al jugador, controles por flechas/WASD.
- Armas: hasta 4 equipables, autodisparo al enemigo más cercano, daño base 10.
- Enemigos: Simples, Cazadores, Compuestos y Jefes, con HP y daño propios.
- Tienda y mejoras: pantalla entre oleadas, elegir entre 3 opciones, mejoras acumulables por niveles.
- Feedback de juego (polvo, vibración de cámara, música): parámetros en `src/data/constants.js` (`SHAKE`, `DEATH`). Música: pistas en `src/systems/MusicTracks.js` y motor en `src/systems/AudioManager.js` (`playMusic(nombre)`); `AudioManager.enabled` = efectos y `musicEnabled` = música. Íconos de estadísticas en `src/systems/StatIcons.js`. Sonidos de interfaz: `AudioManager.uiMove/uiSelect/uiBack/uiToggle/uiDeny`. Cambios de escena: `Transition.go(escena, accion)` y `Transition.in(escena)` (`src/systems/Transition.js`, burbujas). Nombres de jefes: `namesByWave` en `src/data/enemies.js`.
- Controles de PC (teclado) y mobile si aplica.

## 4. Preguntar antes de avanzar ante dudas

Cuando una duda afecte el alcance, las reglas, el comportamiento, la compatibilidad o la implementación:

- Utilizar la herramienta de preguntas al usuario disponible en el entorno (`AskUserQuestion`).
- Formular preguntas concretas.
- Explicar qué decisión falta y por qué importa.
- Ofrecer opciones cuando faciliten la decisión.
- Incluir una recomendación fundamentada cuando corresponda.
- Esperar la respuesta antes de adoptar una decisión que cambie el comportamiento solicitado.
- No inventar reglas para resolver omisiones o contradicciones.
- Continuar con tareas independientes cuyo alcance esté claro.

Si la herramienta de preguntas no está disponible (por ejemplo, en una ejecución sin supervisión), tomar la lectura más razonable del pedido, declararla al inicio del trabajo y dejarla señalada en el resumen final.

## 5. Utilizar POO y patrones de diseño

- Modelar las entidades y comportamientos del dominio mediante programación orientada a objetos, respetando el lenguaje, framework, motor y arquitectura del proyecto (Phaser 4).
- Encapsular el estado y las reglas.
- Mantener responsabilidades claras, alta cohesión y bajo acoplamiento.
- Favorecer composición cuando evite jerarquías de herencia innecesarias.
- Separar la lógica de negocio de la presentación y la entrada del usuario.
- Utilizar patrones de diseño cuando resuelvan una necesidad concreta.
- Explicar brevemente la elección y utilidad de los patrones aplicados.
- Evitar abstracciones innecesarias y refactorizaciones ajenas al requisito.

Ejemplos orientativos aplicables a este proyecto:

- State para escenas y transiciones (intro, oleadas, tienda, muerte, game over, modo infinito).
- Strategy para comportamientos de armas o de enemigos.
- Factory para creación de enemigos (Simples, Cazadores, Compuestos, Jefes) y armas.
- Observer para actualizar la interfaz (HUD de vida, puntos, temporizador) ante eventos.

No imponer estos patrones cuando no aporten valor.

## 6. Reutilizar código existente

Antes de crear clases, componentes, servicios o utilidades:

1. Buscar implementaciones relacionadas.
2. Revisar sus contratos, comportamiento y consumidores.
3. Priorizar su reutilización o extensión cuando sean compatibles.
4. Evitar duplicar lógica de negocio.
5. Extraer lógica común cuando exista una necesidad real, preservando el comportamiento de sus consumidores.
6. Respetar las convenciones de estructura, nombres y estilo del proyecto.

Si no existe código reutilizable, indicarlo y diseñar una solución coherente con el proyecto.

Repetir esta revisión en cada tarea; no asumir que la estructura permanece igual entre consultas.

## 7. Consultar sobre sprites y recursos gráficos

Cuando una tarea requiera sprites u otros recursos gráficos:

1. Revisar los recursos disponibles y sus convenciones de uso.
2. Utilizar la herramienta de preguntas al usuario antes de implementar la parte visual para confirmar si desea:
   - **Generar un mockup:** una representación provisional para desarrollar y validar la funcionalidad.
   - **Utilizar un recurso existente:** solicitar el nombre exacto del recurso.
3. Si el recurso indicado no puede localizarse, pedir su ruta o el archivo correspondiente.

Además:

- No asumir qué sprite utilizar ni inventar nombres o rutas.
- Si se elige un mockup, aclarar que es provisional y confirmar el alcance visual necesario.
- Si se elige un recurso existente, comprobar su disponibilidad y compatibilidad con el uso previsto.
- Consultar detalles como spritesheet, fotogramas o animaciones cuando sean necesarios y no estén documentados.
- Si falta el archivo, solicitarlo antes de avanzar con la parte que depende de él.
- Continuar con la lógica independiente de los recursos gráficos mientras se resuelve la consulta.

Notas específicas del proyecto:
- El GDD define un arte representativo de **figuras geométricas**, por lo que los mockups con formas geométricas son la vía esperada salvo indicación contraria.
- Texturas generadas por código: `src/systems/Textures.js` (p. ej. `particle`, `projectile`). Sprites de imagen: carpeta `SPRITES/` embebida en `src/data/sprites.js`.
- Efectos que solo necesitan formas simples (partículas, polvo, destellos) pueden reutilizar la textura `particle` sin consultar.

## 8. Definir y preparar el flujo Git

Estado actual: el proyecto **es un repositorio Git** con remoto `origin` (`https://github.com/F4cuu/TP-FINAL-FINAL.git`). Ramas: `main` y ramas `feature/<descripcion>` (`juego-base`, `balance-tienda-jefes`, `balance-enemigos`, `sprites-jefes`). Antes de empezar, revisar con `git status` y `git branch --show-current` la rama actual y los cambios pendientes.

- Respetar el flujo existente: una rama `feature/<descripcion>` por tarea, integrada a `main` solo por pedido expreso.
- Si no hay una estrategia definida para el caso, consultar al usuario la rama base y el nombre.
- No asumir que `develop` existe ni imponer GitFlow completo sin acordarlo.

Crear (o reutilizar, si corresponde a la tarea) una rama de trabajo antes de modificar el código, con un nombre descriptivo. Ejemplos:

- `feature/<descripcion>`
- `fix/<descripcion>`
- `docs/<descripcion>`
- `refactor/<descripcion>`

No implementar directamente sobre `main`, `master` o `develop`.

Si existen cambios previos del usuario:

- Preservarlos.
- Identificar si interfieren con la tarea.
- Consultar antes de realizar operaciones que puedan moverlos, descartarlos o mezclarlos con otros cambios.

## 9. Implementar y verificar

- Definir criterios de aceptación a partir del requisito, el GDD y las aclaraciones del usuario.
- Realizar cambios enfocados en el alcance acordado.
- Ejecutar las comprobaciones disponibles y pertinentes al cambio: `node --check` sobre los `.js` tocados y, cuando sea posible, prueba en el navegador (Phaser 4 por CDN).
- Verificar las interacciones identificadas durante el análisis de impacto.
- Agregar pruebas cuando aporten valor para validar reglas o prevenir regresiones.
- Evitar pruebas que solo repliquen la implementación.
- Informar qué se verificó y qué quedó pendiente.
- No afirmar resultados que no fueron comprobados (si no se pudo ejecutar el juego, decirlo).

## 10. Solicitar confirmación y realizar commit y push

Cuando termine la implementación:

1. Presentar al usuario:
   - Resumen del comportamiento implementado.
   - Archivos afectados.
   - Verificaciones realizadas y sus resultados.
   - Pendientes o limitaciones reales.
   - Rama de trabajo utilizada.
2. Utilizar la herramienta de preguntas para solicitar:
   - Confirmación de que la implementación es aceptada.
   - Autorización explícita para realizar commit y push.
3. Esperar la respuesta.
4. Si el usuario solicita ajustes:
   - Realizarlos.
   - Repetir las verificaciones afectadas.
   - Volver a solicitar confirmación.

Después de recibir autorización:

1. Revisar `git status`, `git diff` y `git log --oneline -10`.
2. Revisar los archivos nuevos que se incluirán.
3. Preparar únicamente los cambios correspondientes a la tarea, sin incluir cambios ajenos ni secretos.
4. Crear un commit descriptivo, coherente con las convenciones del repositorio (`feat:`, `fix:`, `docs:`…, en español).
5. Realizar push de la rama al remoto acordado, configurando su seguimiento cuando corresponda.
6. Informar:
   - Nombre de la rama.
   - Identificador y mensaje del commit.
   - Resultado del push.

No realizar commit ni push sin autorización explícita del usuario.

No hacer force push, omitir hooks, modificar la configuración de Git ni fusionar ramas sin una solicitud expresa.

Si un hook o comprobación falla, resolver el problema antes de continuar. Si commit o push falla, informar el resultado sin afirmar que la operación se completó.

La creación de un pull request y la integración en la rama base requieren autorización adicional.

## 11. Comunicar el análisis y los resultados

Antes de implementar, presentar un análisis breve con los puntos pertinentes:

### Análisis previo
- **Requisito:** comportamiento solicitado.
- **Documentación:** estado y referencias (GDD y sección).
- **Conflictos e impacto:** funcionalidades y reglas afectadas.
- **Reutilización:** código existente aprovechable.
- **Diseño:** enfoque POO y patrones pertinentes.
- **Recursos gráficos:** recursos confirmados o consulta pendiente.
- **Git:** rama base y rama de trabajo.
- **Dudas:** decisiones que requieren respuesta del usuario.

Para consultas simples, reducir el formato a los puntos aplicables.

Al finalizar, resumir:

- Cambios y archivos afectados.
- Decisiones relevantes.
- Verificaciones ejecutadas.
- Pendientes reales.
- Confirmación solicitada al usuario.
- Resultado de commit y push, únicamente si fueron autorizados y ejecutados.

No presentar propuestas como funcionalidades implementadas.
