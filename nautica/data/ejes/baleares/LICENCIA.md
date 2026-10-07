# Licencia del eje Illes Balears

## Origen

Las preguntas, opciones, respuestas oficiales y figuras de esta carpeta proceden de los **exámenes resueltos de Patrón de
Embarcaciones de Recreo y de Patrón de Yate** que publica el **Govern de les Illes Balears** (Direcció General de Ports i
Transport Marítim) en <https://www.caib.es/sites/transportmaritim/es/>, convocatorias de marzo-abril de 2017 a septiembre
de 2026.

El aviso legal del portal caib.es (<https://www.caib.es/webgoib/es/aviso-legal>) dice:

> Toda la información de este portal, así como el diseño, los textos, las imágenes, el sonido y cualquier otro material
> que lo integre, es propiedad intelectual de la Administración de la Comunidad Autónoma de las Illes Balears, aunque se
> puede utilizar con la licencia llamada Creative Commons, en la modalidad Reconocimiento-Compartir Igual (by-sa).

El aviso no indica la versión de la licencia; se usa la vigente, la 4.0.

## Atribución

Fuente: Govern de les Illes Balears – Direcció General de Ports i Transport Marítim, exámenes resueltos de PER y PY
(caib.es), con licencia CC BY-SA.

## Cambios

Los datos de esta carpeta son una **obra derivada**:

- texto extraído de los PDF oficiales (solo las versiones en castellano) y normalizado (espacios, cortes de línea);
- preguntas repetidas entre modelos, islas y convocatorias unidas en una sola (con la lista de sus apariciones);
- erratas anunciadas por el tribunal aplicadas, y las respuestas contradictorias entre convocatorias resueltas contra la
  norma (cada caso, con su motivo, en `tools/bancos/ejes/baleares/correcciones.json`);
- tema, requisitos (carta, anuario), revisión normativa y reserva para el examen final añadidos;
- explicaciones, práctica por clase y resoluciones de carta escritas para esta app.

El proceso está en `tools/bancos/` (`npm run bancos -- baleares`) y el informe de la extracción en
`tools/bancos/informes/baleares.md`.

## Licencia de esta carpeta

Por la condición «Compartir Igual» de la licencia de origen, **todo el contenido de `data/ejes/baleares/`** (preguntas,
explicaciones, práctica, resueltos y figuras) **se distribuye con la licencia Creative Commons
Reconocimiento-CompartirIgual 4.0 Internacional (CC BY-SA 4.0)**: <https://creativecommons.org/licenses/by-sa/4.0/deed.es>.

Esta licencia se aplica solo a los datos de esta carpeta y a las soluciones de carta escritas para ellos
(`src/exams/solutions/baleares-*.js`); el resto de la app no es obra derivada de estos exámenes.
