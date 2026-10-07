# Informe de extracción · Murcia (adaptador `subrayado`)

Escrito a mano el 2026-10-07 a partir de `npm run bancos -- murcia` y `node tools/bancos/ejes/murcia/verificar.mjs`.
**Licencia**: el aviso legal de carm.es solo autoriza el uso personal no comercial y prohíbe la modificación. Por eso la
salida del eje se queda en la caché (`.cache/bancos/murcia/salida/`, `config.salida = "cache"`) y el informe detallado
de la etapa validar, que cita textos de preguntas, también (`.cache/bancos/murcia/informe.md`,
`config.informeEnCache`). Este informe solo da recuentos; no se sube ninguna pregunta, respuesta ni PDF de Murcia.

## Estado

- Manifiesto: 69 documentos (PER 36, PY 33) del inventario verificado a mano
  (`tools/bancos/ejes/murcia/manifiesto_murcia.csv`, prioridad A). carm.es tiene CAPTCHA: la descarga es manual y el
  usuario deja cada PDF en `.cache/bancos/murcia/pdf/` con el nombre de la columna `archivo_local`.
- En la caché de esta máquina: solo las **6 muestras** descargadas al investigar (PER 2026-06 T1; PY 2015-03, 2015-11,
  2022-11 y 2026-06 T1/T2). Faltan 63.
- `verificar.mjs` comprueba cada fichero: FALTA, CAPTCHA (página HTML de Radware guardada como .pdf), NO-PDF, TAMAÑO
  (frente al tamaño publicado en la página) u OK con el resumen del subrayado.

## Resultado en las muestras

| Muestra | Preguntas (texto / subrayado) | Una sola opción subrayada | Incidencias |
|---|---|---|---|
| PER 2026-06 T1 | 45 / 45 | 45 | — |
| PY 2015-03 T1 | 40 / 40 | 40 | P17: opción c de dos líneas, con «c)» separado del texto (el detector original no la veía) |
| PY 2015-11 T1 | 40 / 40 | 39 | P31: las cuatro opciones subrayadas → anulada (lectura comprobada sobre la imagen al investigar). P36: «-P-» al final de línea + «a)» (pdftotext se comía el guion y la opción a) |
| PY 2022-11 T1 | 40 / 40 | 40 | — |
| PY 2026-06 T1 | 40 / 40 | 40 | P18: opciones cortas en columna que pdftotext desordena; se toman de PyMuPDF |
| PY 2026-06 T2 | 40 / 40 | 40 | ídem P18 |

- Las claves leídas coinciden con las de la investigación (research_notes/…/murcia.md §4) en PER 2026-06 T1, PY 2022-11
  y PY 2026-06 T1/T2; en PY 2015-03 la P17, que allí quedó «?», sale c, la que se vio subrayada en la imagen.
- **Tipo 1 frente a Tipo 2** (PY 2026-06): las 40 preguntas se emparejan (etapa repetidas) y el texto de la opción
  subrayada es el mismo en los dos tipos en 40/40: 0 conflictos.
- Proceso completo sobre las muestras: PER 45 preguntas; PY 200 apariciones → 152 preguntas distintas (40 pares T1/T2 y
  7 preguntas repetidas entre convocatorias), 1 anulada (2015-11 P31), 0 conflictos, 0 errores de validación.
  7 parejas quedan como «posibles duplicados no unidos» (similitud 0,87–0,89: redacciones distintas o preguntas
  distintas sobre lo mismo); se revisan en el informe de la caché.

## Diferencias con `murcia_herramientas/underline.py`

- Las líneas de la misma altura se unen en una fila y una opción son todas sus filas: subrayado en cualquiera cuenta.
- Una fila deja de ser de la opción si está en otra página o a más de 20 puntos de la anterior (el rótulo subrayado
  «ESPACIO PARA OPERACIONES» que sigue a la última opción de las preguntas de carta no cuenta como subrayado).
- Las preguntas empiezan en «Unidad teórica 1» (la tabla de la portada trae «1 - 4», «18 - 27»…) y se sigue la
  numeración (n = anterior + 1).
- Un segmento subraya una fila si se solapa con ella en al menos el 30 % de su anchura o 20 puntos.

## Pendiente

- Descargar a mano los 63 PDF que faltan (guía: research_notes/…/murcia.md §6) y repasar con `verificar.mjs`.
- Preguntas con 0, 2 o 3 opciones subrayadas: van a «Lecturas dudosas» del informe de la caché; se resuelven a mano en
  `ejes/murcia/correcciones.json` (no hay correcciones publicadas por la CARM).
- Autorización de reutilización a `nautica@carm.es` antes de publicar el eje.
