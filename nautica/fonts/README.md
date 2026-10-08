# Tipografía de la app

Dos fuentes con licencia SIL Open Font License 1.1, alojadas aquí para que la app funcione sin conexión y sin depender
de terceros. Las guarda el service worker (`npm run precache` incluye los `.woff2` de esta carpeta).

| Fichero | Uso | Origen | Licencia |
|---|---|---|---|
| `patron-texto.woff2` (25 KB) | Texto (variable, pesos 400–700) | Source Sans 3, de Adobe | `OFL-SourceSans3.txt` |
| `patron-titulos.woff2` (17 KB) | Títulos (700) | Bitter, de The Bitter Project Authors | `OFL-Bitter.txt` |

Son versiones modificadas: subconjunto latino para español (letras con tilde, ñ, ü, ¿ ¡, ° ′ ″ · → ← — « » ’ “ ” … º ª € × −),
sin hinting, el eje de peso recortado (400–700 en el texto; 700 fijo en los títulos) y renombradas («Patron Texto»,
«Patron Titulos»), como pide la OFL para las versiones modificadas de una fuente con nombre reservado.

Cómo se hicieron: los TTF variables de google/fonts (`ofl/sourcesans3`, `ofl/bitter`), `fontTools.subset` con esos
caracteres, `fontTools.varLib.instancer` para el peso y la tabla `name` reescrita. En CSS (`styles/app.css`), `size-adjust:
107 %` en el texto iguala su altura de x a la de las fuentes del sistema, para que el cambio (`font-display: swap`) no salte.
