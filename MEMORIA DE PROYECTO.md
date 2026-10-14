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
- **Código:** aun no existe. No se ha creado el esqueleto del juego en Phaser 4.
- **Git:** repositorio inicializado en rama `main`.
  - Remoto: `https://github.com/F4cuu/TP-FINAL-FINAL.git` (origin).
  - Identidad local: `F4cuu` / `f4cundoibanez@gmail.com`.
  - Primer commit: `2a8c8ab` — `docs: agregar GDD, AGENTS.md, memoria de proyecto y gitignore`.
- **Decisión sobre lenguaje/estructura:** queda a criterio del agente (TypeScript o JS puro; datos de balance separados de la lógica).

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