# AGENTS.md — TP FINAL (Pablito: Bacteria Survivor)

## 1. Alcance y contexto

- Aplicar estas instrucciones al inicio de cada consulta y antes de modificar el proyecto.
- Responder en español y adaptar la profundidad del análisis a la complejidad de la solicitud.
- Documento principal de requisitos: `GDD PROPUESTA.docx`, en la raíz del proyecto. No existe carpeta `docs/`.
- El `GDD PROPUESTA.docx` es un archivo de Microsoft Word, NO texto plano. Para leerlo:
  - Descomprimir el `.docx` (es un ZIP) y extraer el texto de `word/document.xml`, o
  - Usar Word vía COM / una librería que lea `.docx` (ej. python-docx).
- Revisar la información vigente del GDD; no depender exclusivamente de resúmenes de conversaciones anteriores.
- Preservar el trabajo existente del usuario.

## 2. Revisar la documentación y el requisito

Antes de proponer o implementar una solución:

1. Identificar el requisito solicitado y su comportamiento esperado.
2. Revisar la carpeta de documentación del proyecto (actualmente no existe `docs/`, verificar cada vez).
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

No modificar el GDD para justificar una implementación sin una solicitud explícita del usuario.

## 3. Analizar conflictos e impacto

Antes de modificar una funcionalidad:

- Revisar tanto las reglas del GDD como la implementación existente.
- Identificar dependencias, restricciones compartidas, excepciones, prioridades entre comportamientos y posibles regresiones.
- Analizar las interacciones con otras funcionalidades.
- Comparar el comportamiento actual con el GDD; no asumir que el código existente es necesariamente correcto.
- Detectar contradicciones internas del GDD.
- Comunicar los conflictos relevantes antes de modificar la parte afectada.

Adaptar el análisis al dominio de este videojuego (Vampire Survivor, Phaser 4) considerando cuando corresponda:

- Oleadas: duración fija por oleada que crece entre oleadas (20s→50s, +4s por oleada), jefe en las oleadas 3, 6 y 9.
- Condición de victoria: sobrevivir las 9 oleadas; luego opción de terminar o modo infinito.
- Condición de derrota: barra de vida (100 HP) llega a 0; no hay cura entre oleadas.
- Movimiento y límites de la arena: arena grande limitada, cámara que sigue al jugador, controles por flechas.
- Armas: hasta 4 equipables, autodisparo al enemigo más cercano, daño base 10.
- Enemigos: Simples, Cazadores, Compuestos y Jefes, con HP y daño propios.
- Tienda y mejoras: 1 minuto entre oleadas, elegir 1 de 3 opciones, mejoras acumulables por niveles.
- Controles de PC (teclado) y mobile si aplica.

## 4. Preguntar antes de avanzar ante dudas

Cuando una duda afecte el alcance, las reglas, el comportamiento, la compatibilidad o la implementación:

- Utilizar la herramienta de preguntas al usuario disponible en el entorno (por ejemplo `question`).
- Formular preguntas concretas.
- Explicar qué decisión falta y por qué importa.
- Ofrecer opciones cuando faciliten la decisión.
- Incluir una recomendación fundamentada cuando corresponda.
- Esperar la respuesta antes de adoptar una decisión que cambie el comportamiento solicitado.
- No inventar reglas para resolver omisiones o contradicciones.
- Continuar con tareas independientes cuyo alcance esté claro.

Si la herramienta de preguntas no está disponible, preguntar directamente en la conversación y esperar la aclaración necesaria.

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

- State para escenas y transiciones (intro, oleadas, tienda, game over, modo infinito).
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

Nota específica del proyecto: el GDD define un arte representativo de **figuras geométricas**, por lo que los mockups con formas geométricas son la vía esperada salvo indicación contraria.

## 8. Definir y preparar el flujo Git

Estado actual: el proyecto **no es un repositorio Git** y no tiene remoto configurado. Informar la situación y consultar antes de inicializarlo, configurarlo o crear un remoto.

Una vez que exista Git:

- Revisar el estado del repositorio, la rama actual, los remotos y la estrategia de ramas documentada.
- Respetar el flujo existente.
- Si se utiliza GitFlow, seguir sus ramas y convenciones para features, fixes, hotfixes y releases según corresponda.
- Si no hay una estrategia definida, consultar al usuario la rama base, la convención de nombres y el remoto.
- No asumir que develop existe ni imponer GitFlow completo sin acordarlo.

Crear una rama de trabajo antes de modificar el código, con un nombre descriptivo conforme a las convenciones del repositorio. Ejemplos:

- `feature/<descripcion>`
- `fix/<descripcion>`
- `docs/<descripcion>`
- `refactor/<descripcion>`

Si ya existe una rama apropiada para la tarea, verificar si corresponde continuar en ella.

No implementar directamente sobre `main`, `master` o `develop`.

Si existen cambios previos del usuario:

- Preservarlos.
- Identificar si interfieren con la tarea.
- Consultar antes de realizar operaciones que puedan moverlos, descartarlos o mezclarlos con otros cambios.

## 9. Implementar y verificar

- Definir criterios de aceptación a partir del requisito, el GDD y las aclaraciones del usuario.
- Realizar cambios enfocados en el alcance acordado.
- Ejecutar las comprobaciones disponibles y pertinentes al cambio (según el stack definido en el GDD: Phaser 4).
- Verificar las interacciones identificadas durante el análisis de impacto.
- Agregar pruebas cuando aporten valor para validar reglas o prevenir regresiones.
- Evitar pruebas que solo repliquen la implementación.
- Informar qué se verificó y qué quedó pendiente.
- No afirmar resultados que no fueron comprobados.

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
4. Crear un commit descriptivo, coherente con las convenciones del repositorio.
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