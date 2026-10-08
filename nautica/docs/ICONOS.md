# Iconos

La interfaz tiene **un solo sistema de iconos**: los SVG de línea de `src/ui/iconos.js`. No se usan emojis: cada móvil
los dibuja distinto, no siguen la paleta ni el modo oscuro y chocan con el resto. `tests/iconos.test.js` lo vigila.

## Cómo se usan

```js
import { icono, conIcono } from '../iconos.js';

icono('faro')                       // <span class="ico" aria-hidden="true"><svg…></span>  (decorativo)
icono('podcast', '', 'Tiene podcast') // role="img" + aria-label: cuando el icono es lo único que dice algo
h('h2', conIcono('red', 'Mapas de conceptos'))  // icono + texto (títulos, botones, rótulos): clase .ico-t
h('button', { 'aria-label': 'Pausa' }, icono('pausa'))  // botón con solo icono: el nombre va en el botón
```

- `conIcono()` devuelve un array `[icono, …texto]`; para cambiar el contenido de un botón ya creado:
  `btn.replaceChildren(...conIcono('pausa', 'Pausa'))`.
- Tamaño: `.ico` mide 1,4 em; `.ico-t` (icono delante de texto) 1,15 em, alineado a la línea base. En títulos (`h1`–`h3`,
  `summary`) toma el color de acento; en el resto, el del texto (`currentColor`). Los contenedores que necesiten otro
  tamaño lo fijan en `styles/app.css` (`.tool-icon .ico`, `.mas-fila-ico .ico`, `.tema-faro .ico`…).
- `index.html` lleva ya los SVG de la cabecera (brújula y engranaje): no hay parpadeo de emoji antes de que cargue el JS.
- En los textos para el resumen de la vista (`summary`, `RUTAS:`…) no van iconos ni emojis.
- Temas (`src/theory/blocks.js`), titulaciones, categorías de ejercicios (`src/exercises/define.js`) y mazos de tarjetas
  (`src/course/tarjetas.js`) llevan `ico: '<nombre>'`.
- Las líneas del profe que genera `src/teacher` empiezan por un prefijo de tipo (truco, trampa, regla, nota);
  `lineaProfe()` de `src/ui/profe-steps.js` lo cambia por su icono (`bombilla`, `aviso`, `nudo`, `lapiz`).

## Reglas de dibujo

- `viewBox="0 0 24 24"`, contenido entre 2 y 22 (2 px de margen), coordenadas en la rejilla de medio píxel.
- Trazo **1,75 px**, `stroke-linecap` y `stroke-linejoin` redondeados, `fill="none"`, `stroke="currentColor"` (los pone
  `svgIcono()`; el dibujo solo lleva `path`, `circle`, `rect` y, si hace falta, un `g` con `transform`).
- **Sin colores fijos.** Los estados los pone el CSS con una clase dentro del dibujo: la lámpara del faro
  (`rect.lampara`) se rellena con `--faro-luz` cuando el faro está encendido (`.faro.on`, `.tema-faro.on`…). El
  `barco-marca` de la carta rellena su silueta con `--surface` desde el CSS (`.marca-aqui`) para leerse sobre el mar.
- Pocas piezas y nada menor de 2 px: se tienen que leer a **16–24 px**. Estilo náutico sobrio, ópticamente equilibrado
  (los círculos llegan a r = 9; los cuadrados, a 3…21).

## Cómo añadir uno

1. Dibújalo en `P` de `src/ui/iconos.js`, en su grupo, con las reglas de arriba.
2. Míralo en la hoja de pruebas a 16/20/24/32/64 px en claro y oscuro (un HTML con `svgIcono(nombre)` a esos tamaños;
   el de este cambio está en el scratchpad como `ico-hoja.mjs`). Rehazlo si se emborrona a 16 px.
3. `npm test`: `tests/iconos.test.js` comprueba que cada `icono('…')` usado existe, las reglas de trazo y color, y que
   no entra ningún emoji en `src/ui` (lista blanca: `→ ← ↑ ↓ ↔ ✓ ✗ ▾ ● ○`, signos tipográficos que se leen como texto).

## El set

| Grupo | Iconos |
|---|---|
| Navegación y estructura | `hoy` `temario` `examen` `biblioteca` `ajustes` `mas` `progreso` `calendario` `reloj` `candado` `diana` `instalar` `descargar` `carpeta` `imprimir` `enlace` `lupa` `anadir` `salir` |
| Estudio | `clase` `libro` `documento` `portapapeles` `lista` `tabla` `tarjetas` `lamina` `red` (mapa de conceptos) `nudo` (reglas para recordar) `bombilla` `lapiz` `chincheta` (chuleta) `repaso` `mezclar` `pregunta` `toque` `calculadora` `cuentas` `profe` |
| Estados | `ok` `no` `casi` `aviso` `racha` |
| Sonido y reproducción | `escuchar` `silencio` `podcast` `play` `pausa` `parar` `inicio` `fin` `atras` `adelante` `retroceder` `avanzar` `deshacer` |
| Mesa de cartas | `mapa` `brujula` `compas` `regla` `transportador` `lugar` `texto` `goma` `mover` `etiqueta` `mira` `papelera` `acercar` `alejar` `encuadrar` `arriba-abajo` `minimizar` `ventana` |
| Náutica | `faro` `ancla` `bandera` `velero` `barco` `barco-marca` (estás aquí, en la carta de la derrota) `timon` `boya` `salvavidas` `chaleco` `ley` `nube` `viento` `ola` `luna` `campana` `satelite` |
| Insignias (Travesía) | `ins-guardia` `ins-semana` `ins-rescate` `ins-bloque` `ins-simulacro` `ins-inedito` |

### De qué emoji viene cada uno (para leer el código antiguo)

| Antes | Ahora | Antes | Ahora |
|---|---|---|---|
| 📚 Biblioteca | `biblioteca` | 🎧 Radio / podcast | `podcast` |
| 🃏 Tarjetas | `tarjetas` | 🧮 Calculadora | `calculadora` |
| ➗ Las cuentas | `cuentas` | 📈 Mi progreso | `progreso` |
| 🗓 📅 Plan, fecha | `calendario` | 🧭 Cómo funciona / aguja | `brujula` |
| ⚙️ Ajustes | `ajustes` | 🧑‍🏫 👨‍🏫 Profe | `profe` |
| 🎯 Test de nivel, examen final abierto, jugar | `diana` | 🔒 Examen final cerrado, reservada | `candado` |
| 📌 Chuleta | `chincheta` | 🧠 Regla para recordar | `nudo` |
| 💡 Truco / pista | `bombilla` | ⚠️ Trampa / aviso | `aviso` |
| ✅ ❌ 🟡 Corrección | `ok` `no` `casi` | 🔁 🔄 Repaso, otro | `repaso` |
| 🔀 Repaso mezclado | `mezclar` | ⏱ 5 minutos, reloj | `reloj` |
| 🕸️ Mapas de conceptos | `red` | 🎞️ Láminas | `lamina` |
| 🗺️ Carta, resolver en la carta | `mapa` | 🎓 Clase, tutorial | `clase` |
| 📘 📖 Conceptos, ficha | `libro` | 📄 📜 Preguntas reales, guion | `documento` |
| 📋 Ejercicio, enunciado | `portapapeles` | 🎒 Para llevarse | `lista` |
| 🧰 Mesa de cartas, 📐 estima | `compas` | 📍 Lugar, punto | `lugar` |
| ✋ 📏 📐 🔤 🧽 🏷 ⌖ 🗑 ↶ | `mover` `regla` `transportador` `texto` `goma` `etiqueta` `mira` `papelera` `deshacer` | ▶ ⏸ ⏹ ⏮ ⏭ ◀ ↺ ↻ | `play` `pausa` `parar` `inicio` `fin` `atras`/`adelante` `retroceder` `avanzar` |
| 🔊 🔇 | `escuchar` `silencio` | 🖨️ 💾 📂 📲 ➕ 🔎 🔗 | `imprimir` `descargar` `carpeta` `instalar` `anadir` `lupa` `enlace` |
| 🤔 👆 📊 🏁 ✏️ 📝 | `pregunta` `toque` `tabla` `bandera` `lapiz` `examen` | 🎉 💪 (cierre) | marca de hecho / `repaso` (`icono: 'hecho' \| 'flojo'`) |
| ⚓ 🗼 🛟 (podcast) | `ancla` `faro` `salvavidas` | ⛵ 🛥️ (PER, PY) | `velero` `barco` |

Temas: Nomenclatura `velero` · Amarre y fondeo `ancla` · Seguridad `chaleco` · Legislación `ley` · Balizamiento `boya` ·
RIPA `barco` · Maniobra `timon` · Emergencias `salvavidas` · Meteorología `nube` · Teoría de navegación `brujula` · Carta
`mapa`. Mazos: buques `barco`, balizamiento `boya`, señales acústicas `campana`, socorro `salvavidas`, banderas `bandera`,
Beaufort `viento`, Douglas `ola`, fuego `racha`, GNSS `satelite`. Ejercicios: aguja `brujula`, estima `compas`, situación
`lugar`, corrientes `ola`, viento `viento`, mareas `luna`, hora `reloj`.

## Temario: el faro de cada tema

En `#/<tit>/temario` cada tarjeta lleva el faro del tema con el mismo dibujo, colores y criterio que la Travesía
(`luzDeFaro` de `src/course/travesia.js`: encendido con ≥ 80 % de las ideas dominadas, en curso si hay alguna vista,
apagado si no), la barra fina de ideas dominadas y el límite de fallos como chip («Máx. 2 fallos de 5»). Las ideas se
reparten por tema con `farosPorTema`: cada idea va al tema de la mayoría de sus preguntas (`temaDeIdea` de
`src/course/listo.js`, el mismo reparto que las «ideas por tema» de Mi progreso), porque los faros de la carta agrupan por
bloque del catálogo y no por tema del examen. Sin conceptos etiquetados en el banco, la tarjeta es la de siempre con el
icono del tema.
