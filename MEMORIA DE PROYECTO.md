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

### Jugador
- **100 HP inicial** (HP fijo, sin cura).
- Velocidad de movimiento base + mejora (Flagelo acelerado).
- Arena **grande y limitada**, cámara que sigue al jugador.
- Movimiento con flechas del teclado.

### Armas y combate
- Hasta **4 armas equipables**, autodisparo al **enemigo más cercano**.
- Daño base por proyectil: **10**.
- Armas (temática bacteriana):
  1. **Escupida de toxina** (básica): proyectil recto, daño 10, cada 0,6s.
  2. **Abanico de exotoxina**: 5 proyectiles en abanico, daño 5 c/u, cada 2s.
  3. **Onda de biofilm** (AOE): onda circular corta que daña y empuja, daño 15, recarga 3s.
  4. **Liberación de esporas**: explosión en el enemigo más lejano, daño 25, recarga 4s.
  5. **Plásmido veloz**: proyectil lento que atraviesa, daño 8/golpe, ráfaga 0,15s durante 1s, recarga 2s.

### Enemigos
| Tipo | HP | Daño | Velocidad | Notas |
|------|-----|------|-----------|-------|
| Simple | 20 | 10 | normal | los más comunes |
| Cazador | 10 | 6 | alta | desde oleada 2, más recurrentes desde la 3 |
| Compuesto | 60 | 15 | lenta | mucha vida |
| Jefe | 500 | 60 | baja | oleadas 3, 6 y 9 |

- Aparecen de manera aleatoria en la arena y persiguen al jugador.

### Tienda y mejoras
- **1 minuto de tienda entre oleadas**; puntos obtenidos por eliminar enemigos.
- Se elige **1 mejora entre 3 opciones aleatorias**; acumulan niveles.
- Mejoras:
  1. **Cápside resistente**: +25 HP máx (no cura).
  2. **Flagelo acelerado**: +10% velocidad de movimiento/nivel.
  3. **Virulencia**: +20% daño de todas las armas/nivel.
  4. **Metabolismo veloz**: +15% cadencia de disparo/nivel.
  5. **Biofilm denso**: +15% tamaño de proyectiles y AOE/nivel.
  6. **Perforación de membrana**: proyectiles atraviesan 1 enemigo adicional/nivel.

### HUD / interfaz
- Contador de tiempo de oleada (arriba al centro).
- Puntos por eliminar enemigos (arriba a la derecha).
- Barra de vida del jugador (100 HP).

### Audio
- Efectos WebAudio por evento: disparo, impacto, daño recibido, aparición de jefe, compra/mejora, fin de oleada, game over.

## 4. Cambios aplicados al GDD PROPUESTA.docx

1. Sección 3: se agregó motor Phaser 4 y audio WebAudio.
2. Sección 5: 7 → 9 oleadas; jefes en 3/6/9; opción de terminar/modo infinito; escala de oleadas (20→50s, 8→30).
3. Sección 6: oleadas por duración fija; puntos canjeables en tienda de 1 minuto entre oleadas.
4. Sección 7: armas con autodisparo al enemigo más cercano.
5. Nueva sección **8. Armas y combate**: hasta 4 armas, daño base 10, lista de 5 armas.
6. Nueva sección **9. Sistema de mejoras y tienda**: tienda 1 minuto, elegir 1 de 3, lista de 6 mejoras.
7. Sección 10 (antes 9): stats de enemigos y jugador (100 HP, sin cura).

**Pendiente estético:** la sección 4 del GDD no existe (salta del 3 al 5), heredado del original. Consultar con el usuario si crearla.

## 5. Estado del proyecto

- **Estructura actual:**
  - `GDD PROPUESTA.docx` (editado).
  - `AGENTS.md` (creado).
  - `MEMORIA DE PROYECTO.md` (este archivo).
- **Código:** aun no existe. No se ha creado el esqueleto del juego en Phaser 4.
- **Git:** NO es repositorio. No hay remoto. Consultar al usuario antes de `git init` o configurar remoto (según AGENTS.md, sección 8).

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