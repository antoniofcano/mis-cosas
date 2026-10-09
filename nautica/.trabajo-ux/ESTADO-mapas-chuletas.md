# Estado: mapas de conceptos y chuletas en estilo C

Rama `feat/mapas-chuletas-c`. Guía: `docs/ESTILO-LAMINAS.md`, sección «Mapas de conceptos y chuletas». Solo cambia la
apariencia y la accesibilidad: los datos de `data/mapas/*.json`, el curso (`chuleta`, reglas y trampas de cada clase),
las funciones de `src/course/mapas.js` y los bancos no se tocan.

## Antes

- **Mapa entero**: SVG a 150 × 96 por casilla con los colores de la app (`--accent`), nodos redondeados de texto
  13 px y cada relación escrita sobre su flecha a 11 px con un trazo de fondo; con relaciones de hasta 158 caracteres
  los rótulos se pisaban entre sí y con los nodos. Nodos `role="button"` dentro de un SVG `role="img"` (el lector de
  pantalla no los veía). Una relación y una confusión entre los mismos conceptos (Ra–Rv) iban una encima de otra.
- **Explorar**: tarjetas de la app; vecinos como `<button>`; ningún enlace a la ficha de la idea.
- **Chuleta**: lista simple; al imprimir, dos columnas, sin cabecera de titulación ni fecha, y con cada clase entera
  sin partir (`break-inside: avoid`), lo que dejaba medias páginas en blanco. Botón «Imprimir».

## Hecho

1. `src/illustrations/mapa-c.js` (`mapaSvg`, `leyendaMapa`, `lineasNombre`): mapa entero en estilo C. Fondo de carta
   con marco graduado; cartelas con doble filete (un `<a>` por concepto, con `aria-label` «nombre: qué es»); el actual
   en magenta con `aria-current`; flechas con su número en etiqueta de cota; confusiones a trazos magenta con letra;
   aristas paralelas separadas. SVG `role="group"` con nombre. Escala 1 (texto 13,5 / 11,5 px efectivos también a
   360 px), en un recuadro desplazable que se centra en el concepto actual; en el escritorio crece hasta ×1,25.
2. `src/ui/views/mapas.js`: lista de mapas en tarjetas de papel (conceptos · relaciones · trampas en mono); cabecera
   eyebrow + título serif + entradilla; pestañas en mando segmentado; explorar en marco de lámina con enlaces a la
   clase, al mapa entero y a la **ficha de la idea** (`hrefFicha(tit, id, 'mapas/<mapa>')`, solo si el banco activo
   tiene etiquetas y la idea se enseña en esa clase y tiene preguntas: `fichasDeNodo`); vecinos como enlaces; debajo
   del mapa entero, las relaciones numeradas y las confusiones con letra (con enlaces). En el juego, la opción buena y
   la elegida llevan además icono (no solo color).
3. `src/ui/views/idea.js`: `volverDe` admite `desde=mapas/<id>` («El mapa de conceptos»).
4. `src/ui/views/chuleta.js`: hoja de papel con eyebrow, título serif, clases numeradas, «Para recordar» en cartela y
   «Trampa» con rótulo e icono; botón «Imprimir / guardar PDF» (`window.print()`). Impresión (`@media print` al final
   de `styles/laminas.css`): A4, todos los `--lc-*` en blanco y negro en cualquier tema, dos columnas, cabecera con
   «<titulación> (<sigla>) · Chuleta del tema N · <fecha>», sin partir puntos, reglas ni trampas y sin dejar un título
   solo al pie. Sin nombres de centros de formación.
5. CSS antiguo de mapas y chuleta retirado de `styles/app.css` (queda lo común de imprimir: sin cabecera ni barra).
6. Tests: `tests/mapas-chuletas-c.test.js` (texto mínimo, colores `--lc-*`, cartelas que no se pisan y nombres que
   caben, accesibilidad y leyenda, aristas paralelas, fichas, cabecera impresa, reglas de impresión, tamaños del CSS).

## Para revisar en el contenido (no corregido: es contenido normativo o del temario)

- **`py-3-3` (chuleta, PY tema 3)**: «Abatimiento: estela-crujía = Rv-Rs». Con el convenio del resto de la app
  (`Rs = Rv + Ab`, viento por babor +), el abatimiento es `Ab = Rs − Rv`, no `Rv − Rs`. Si la frase quiere decir «el
  ángulo entre la estela y la crujía», el signo de la resta sobra o está al revés.
- **`per-3-7` (chuleta, PER tema 3)**: «Boutakow: … a los 70° todo a la contraria». La guía de láminas
  (`docs/ESTILO-LAMINAS.md`, apéndice «Hombre al agua») y el modelo de la animación usan 60° (IAMSAR, maniobra de
  Williamson). Hay textos que dan 60° y otros 70°: conviene unificar o decir «unos 60–70°».
- Repasadas, sin error encontrado, las chuletas con fórmulas o cifras del PER (temas 1–11) y del PY (temas 1–3), y las
  relaciones del mapa «Rumbos y correcciones». No se ha hecho una revisión jurídica completa de las cifras de equipo
  (RD 339/2021).

## Capturas

360 px y escritorio, claro y oscuro, de la lista de mapas, explorar, mapa entero (PER y PY), juego y chuleta; y la
chuleta impresa (PER tema 5 y PY tema 3, `page.pdf` A4 con el sistema en oscuro).
