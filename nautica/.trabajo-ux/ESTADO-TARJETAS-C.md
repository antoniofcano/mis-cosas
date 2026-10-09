# Estado: tarjetas de memoria en estilo C

Rama `feat/tarjetas-c`. Guía: `docs/ESTILO-LAMINAS.md`. Solo cambia la apariencia: la lógica de repaso
(`src/course/repaso.js`, `sesionMazo`, `tarjetasPorRepasar`) y las claves de progreso (`tarjeta:<mazo>:<id>`) son las
de siempre.

## Inventario (antes)

| Mazo | Titulación | Tarjetas | Anverso | Reverso |
| --- | --- | --- | --- | --- |
| Luces y marcas de buques (`buques`) | PER | 32 | lámina `buque` (dibujo antiguo) sin el título | nombre del buque |
| Balizamiento (`balizamiento`) | PER | 12 | lámina `boya` (estilo C) sin rótulos: quedaba un recuadro vacío | nombre + nota + ritmo |
| Señales acústicas (`sonidos`) | PER | 16 | botón «Escuchar» y los puntos (• ▬) en texto; las de campana, sin nada visible | significado |
| Señales de peligro (`socorro`) | PER y PY | 18 | lámina `socorro` (dibujo antiguo) sin rótulos | nombre + nota del Anexo IV |
| Banderas (`banderas`) | PER | 10 | lámina `bandera` (antigua) sin rótulos: **el significado se veía** (iba en un foreignObject) | nombre + significado |
| Escala Beaufort / Douglas | PER y PY | 13 / 10 | «Fuerza 6» / «Grado 3» en texto | nombre + nudos / altura |
| Clases de fuego (`fuego`) | PER y PY | 5 | «Clase B» en texto | qué arde |
| Siglas del GNSS (`gnss`) | PY | 9 | la sigla; **la de la ETA enseñaba la fórmula entera** (no tiene prefijo «SIGLA:») | significado |

Pintado antes: caja de la app (`.tarjeta`), dibujo + pregunta gris; el reverso aparecía debajo tras una línea
discontinua; botones «No lo sabía» / «Lo sabía»; ningún aviso del resultado; el texto alternativo de todos los
dibujos era «Tarjeta: ¿qué es?».

## Hecho

1. **Tarjeta en estilo C** (`src/ui/views/tarjetas.js`, CSS `.tc-*` al final de `styles/laminas.css`): papel de
   carta con filete exterior, graduación alterna y filete interior; eyebrow «Tarjeta · <mazo>» en versalitas magenta;
   estímulo grande; pregunta en serifa cursiva. Reverso: «Respuesta», nombre en versalitas, respuesta en serifa (tres
   tamaños según su largo), dato en monoespaciada en un recuadro, «Nota» con borde discontinuo y miniatura del dibujo.
2. **Volteo** 3D (`rotateY`, `backface-visibility`) que solo se anima con `prefers-reduced-motion: no-preference`
   (`--dur-larga`, `--ease-sale`); la cara oculta lleva `inert` y `aria-hidden`. Al voltear, el foco va a la respuesta;
   al pasar de tarjeta, al anverso nuevo. Tocar la tarjeta también la voltea; el botón es el camino del teclado.
3. **Respuesta**: «No la sabía» / «La sabía» (52 px de alto). Línea `aria-live` con lo que acaba de pasar:
   «Anterior, «Dos pitadas cortas»: no la sabías; vuelve mañana.» (lee el `rep` guardado, no lo calcula).
4. **Avance del mazo como la Travesía**: una fila de faros (encendido = la sabías, en camino = vuelve al repaso,
   apagado = por ver; el actual, con contorno) y «3 / 10» en mono. En la lista, cada mazo con su barra
   `.barra-trav.on` (sabidas / total), «N sabidas de M» y «N por repasar hoy» en magenta.
5. **Anversos** (`src/illustrations/tarjetas-c.js`, `anversoTarjeta(mazo, carta)` → `{ svg | texto, alt, estiloC }`):
   - balizamiento: la marca grande en el agua (`marcaC`) con su luz, el ritmo en mono y el cronograma (`cronoC`);
   - banderas y sonidos: las láminas nuevas sin rótulos (ver 6);
   - Beaufort y Douglas: «Fuerza 6» en serifa grande y una regla graduada con el grado en magenta (la regla se
     repite en el reverso);
   - fuego: «Clase B»; GNSS: la sigla en mono;
   - buques y señales de peligro: su lámina antigua sin rótulos dentro del marco de la tarjeta.
   Texto alternativo de cada anverso: cómo es, nunca qué es (la marca y su luz; las luces y marcas del buque, de
   arriba abajo; el pictograma de cada señal de peligro; la forma de cada bandera; el patrón de pitadas).
6. **Dos láminas migradas al estilo C** (`src/illustrations/senales-c.js`), con marco en `marcos.js` y en `PILOTO`:
   - `bandera` (10 códigos): asta con perilla y driza, paño con colores `--lc-*` y cartela «A · ALFA»;
   - `sonido` (16 señales): bocina o campana y cronograma de pitadas (corta magenta, larga tinta, repique rayado,
     gong punteado) sobre un eje de al menos 8 s, con «1 s» / «4–6 s» / «≈ 5 s» en mono.
   Se quitaron `flagIllustration` y `soundIllustration` (y los colores fijos de `FLAGS`).
7. **Correcciones de contenido**: la bandera N decía «con la C encima» (NC es N encima de C); la tarjeta de la ETA
   enseñaba la respuesta en el anverso (ahora pregunta «ETA y TTG»); la bandera ya no enseña su significado.

También: `docs/ESTILO-LAMINAS.md` (dónde está cada pieza y apéndice de verificación de banderas y señales acústicas).

Tests nuevos: `tests/tarjetas-c.test.js` (cada mazo con anverso, texto alternativo y reverso; el anverso no enseña la
respuesta; colores `--lc-*` en claro y oscuro y texto ≥ 10,5 px en los dibujos nuevos; CSS sin colores fijos y volteo
solo sin «reducir movimiento»; accesibilidad; mismos mazos, claves e intervalos 1/3/7) y las 26 láminas nuevas en
`PILOTO` de `tests/laminas-estilo.test.js`.

Capturas: scratchpad `tar-capturas/` (`antes-*`, `d*-*`, `despues-*`; láminas `*-lamina-*`; volteo animado
`volteo-medio.png` y `volteo-fin.png`). Scripts: `tar-captura.mjs`, `tar-laminas.mjs`, `tar-volteo.mjs`. Sin desborde a
360, 390 ni 990 px, en claro ni en oscuro; el único error de consola es el 404 de `favicon.ico` del servidor de
desarrollo (también antes). Teclado comprobado: Tab hasta «Ver la respuesta», Intro voltea y el foco pasa a la
respuesta (el anverso queda `inert`), Tab llega a «No la sabía» / «La sabía» y, al responder, el aviso se actualiza y el
foco va al anverso de la siguiente.

## Pendiente (fuera de esta tarea)

- Migrar al estilo C las láminas `buque` (32 tarjetas, ~20 láminas) y `socorro` (18): en las tarjetas siguen con su
  dibujo antiguo (texto pequeño, colores fijos, el panel claro del pictograma en modo oscuro).
