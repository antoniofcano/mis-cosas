# Tipografía de la app

Tres fuentes con licencia SIL Open Font License 1.1, alojadas aquí para que la app funcione sin conexión y sin depender
de terceros (nada de Google Fonts). Las guarda el service worker (`npm run precache` incluye los `.woff2` de esta carpeta).

| Fichero | Uso | Origen | Licencia |
|---|---|---|---|
| `patron-texto.woff2` (25 KB) | Texto (variable, pesos 400–700) | Source Sans 3, de Adobe | `OFL-SourceSans3.txt` |
| `patron-titulos.woff2` (10 KB) | Títulos y botones (700; se usa también para 600) | Barlow Condensed, de The Barlow Project Authors | `OFL-BarlowCondensed.txt` |
| `patron-mono.woff2` (6 KB) | Cifras que se leen de un vistazo: reloj, horas, minutos, campos de respuesta (600; se usa también para 500) | IBM Plex Mono, de IBM Corp. | `OFL-IBMPlexMono.txt` |

Las dos últimas (R-67) sustituyen a Bitter, la serifa de títulos anterior (que ya no está): 16 KB entre las dos, por debajo
del presupuesto de unos 60 KB de fuentes nuevas.

Son versiones modificadas: subconjunto latino para español (ASCII, letras con tilde, ñ, ü, ¿ ¡, ° ′ ″ · → ← — – « » ’ “ ” … º ª € × − ± ≈ ≤ ≥ ✓ ½ ¼ ¾),
sin hinting, un solo peso por fichero en las nuevas (el eje de peso recortado a 400–700 en el texto) y renombradas («Patron Texto»,
«Patron Titulos», «Patron Mono»), como pide la OFL para las versiones modificadas de una fuente con nombre reservado (IBM Plex
reserva «Plex»).

Cómo se hicieron: los TTF de google/fonts (`ofl/sourcesans3`, `ofl/barlowcondensed` —`BarlowCondensed-Bold.ttf`— e
`ofl/ibmplexmono` —`IBMPlexMono-SemiBold.ttf`—), `fontTools.subset` con esos caracteres y las funciones de OpenType kern, liga,
tnum, case y poco más, salida `woff2` (hace falta `brotli`) y la tabla `name` reescrita. En CSS (`styles/app.css`), `size-adjust:
107 %` en el texto iguala su altura de x a la de las fuentes del sistema, para que el cambio (`font-display: swap`) no salte;
las otras dos, en pesos 600–700 y 500–700, y con `Arial Narrow` / `ui-monospace` como respaldo mientras cargan.
