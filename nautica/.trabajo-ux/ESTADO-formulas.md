# Fórmulas y tablas en una hoja (R-32)

Estado: hecho en la rama, pendiente del visto bueno (capturas en el resumen de la entrega).

## Qué hay

- `#/<tit>/formulas` (y `?t=<tema>` para las de un tema): una hoja por titulación, por bloques, con buscador (sin
  tildes, varias palabras) e índice de bloques (en el móvil, una tira que se desliza). Cada fórmula: expresión, qué es
  cada letra, signos, cuándo se usa, la trampa y un ejemplo resuelto con las teclas de la calculadora. «Con los
  ejemplos resueltos» se puede quitar (también al imprimir). Imprimible en A4, blanco y negro, dos columnas.
- Datos: `data/comun/formulas.json` (10 bloques; PER 16 fórmulas y 6 tablas, PY 36 fórmulas y 4 tablas). Beaufort y
  Douglas no se copian: salen de `src/illustrations/meteo.js` (las mismas de las láminas y las tarjetas).
- Lógica pura: `src/course/formulas.js` (`CALCULOS` con los motores, teclas, selección, búsqueda, `formulasPermitidas`).
- Vista: `src/ui/views/formulas.js`; estilos en `styles/laminas.css` («Fórmulas y tablas en una hoja», antes del aviso
  del motivo, que un test lee hasta el final del fichero).
- Enlaces: panel de la chuleta de la práctica («Ver todas las fórmulas»), Biblioteca (grupo «Cuentas»), tema del
  Temario («Fórmulas y tablas del tema», si el tema tiene) y «Las cuentas del patrón». Nunca desde un examen.

## Cómo se garantiza el rigor (`tests/formulas.test.js`)

- Cada ejemplo se recalcula con los motores (`CALCULOS[calculo](datos)`); cada valor publicado tiene que coincidir con
  el cálculo (con su tolerancia) y estar escrito en el ejemplo.
- Cada secuencia de teclas se pulsa en el motor de la calculadora de la app y tiene que dar lo que dice el ejemplo.
- Cada fórmula cita sus clases (de su titulación) y una `cita` que tiene que estar escrita igual en una de ellas o en su
  ficha de la chuleta. Las cifras de las tablas tienen que estar en sus clases.
- La estima inversa por latitud media (la de la clase) se compara con la loxodrómica Mercator de la carta.
- Ni el examen enlaza la hoja ni la enlaza nadie más que la chuleta (después de descartar los exámenes), la Biblioteca,
  el Temario y las cuentas; la vista no se abre con el modo examen puesto.

## Discrepancias encontradas (no resueltas en silencio)

1. **Signo de la deriva** (py-3-3): la chuleta dice «Deriva: Rv (o Rs) − Ref» y el ejemplo de la misma clase calcula
   «Deriva = 061 − 040 = 21° hacia estribor» (Ref − Rv). La hoja no da una fórmula con signo para la deriva: la describe
   como el ángulo entre Rs y Ref hacia la banda a la que lleva la corriente.
2. **Polar**: py-3-2 escribe «Ct = 0° − Da» y py-4-1 «Ct = 000° − Za»; la chuleta usa Zv y Za. La hoja usa Za.
3. **Redondeo de la dm**: per-11-2 dice «al grado más próximo»; py-4-1, «valor exacto o al medio grado». La hoja lo
   da por titulación (trampa distinta en PER y PY).
4. **Δλ frente a ΔL**: el ejercicio `estima-analitica` (src/exercises/types/estima-analitica.js) escribe Δλ; las clases y
   la chuleta, ΔL. La hoja usa ΔL.
5. **Presión normal**: per-9-1 da 1013,25 hPa; py-2-1, «1013 hPa (= 1013 mb = 760 mmHg)». La hoja usa 1013,25 para
   cambiar de unidades y 1013 para la corrección de la marea, como las clases.
6. **Tangente de per-11-9**: «α ≈ 14,5° y Rv ≈ 019°»; exacto es 004° + 14,48° = 018,5° → 018°. Sale 019° por redondear
   α antes de sumar. Menor.
7. **Huso justo en 7° 30′**: la clase dice «si el resto pasa de 7° 30′, al siguiente»; `husoDe` (src/nautical/hora.js)
   redondea con `Math.round`, que con 7° 30′ exactos ya da el huso siguiente. Solo en el límite.
8. **Viento aparente**: las clases (per-9-4) lo enseñan sin cuentas y el PY no lo trata; la cuenta está en la chuleta
   (tema 9 del PER) y en el ejercicio `viento-aparente` (PER y PY). Incluida, con la justificación a la vista.
9. **Estima inversa**: la clase usa latitud media; los motores de la carta, partes meridionales (Mercator). En el
   ejemplo difieren menos de 0,3° y 0,3 millas (lo comprueba el test). No es un error; se anota.
10. La ficha `mareas` de la chuleta (PY) no menciona la corrección por presión (sí `mareas-per` y la clase py-4-9).
11. Fuera de esta tarea: al imprimir la chuleta del tema, el rótulo «Chuleta · PY · tema N» sale en el papel, porque
   `.mc-hoja-cab .lc-eti { display: flex }` gana a `.mc-eti-pantalla { display: none }`. En la hoja de fórmulas está
   corregido solo para ella (`.formulas .mc-hoja-cab .mc-eti-pantalla`).

## Decisiones abiertas

- Con un examen a medias (no en marcha) la hoja se puede abrir: el modo examen solo está puesto mientras la vista del
  examen está abierta. Si se quiere bloquear también con `testEnCurso`, es una línea en la vista.
- El alcance de las luces de navegación (RIPA, anexo I) no está en el curso con cifras: no se ha añadido.
- Con ejemplos, la versión impresa ocupa 5 páginas en el PER y 9 en el PY; sin ejemplos, 3 y 5.

## Discrepancias resueltas al integrar (10 de noviembre de 2026)

Decisión del dueño: no publicar con discrepancias abiertas. Cómo queda cada una, igual en el curso, la chuleta, la hoja y
los motores:

1. **Deriva:** `Deriva = Ref − Rs` (sin viento, `Ref − Rv`), + a estribor y − a babor. Corregida la chuleta de `py-3-3`
   (decía lo contrario que su propio ejemplo) y añadida a la hoja.
2. **Polar:** `Ct = Zv − Za = 000° − Za` en `py-3-2`, `py-4-1`, la chuleta, la hoja y las claves del podcast. Se dice
   expresamente que el examen llama a veces al Za «demora de aguja de la Polar» (por eso las explicaciones de preguntas
   reales siguen escribiendo `0° − Da`: es lo mismo).
3. **Redondeo de la declinación:** una sola regla en PER y PY: *haz lo que diga el enunciado*; si pide el grado más
   próximo, se redondea; si no, valor exacto y se redondea solo el resultado final. Comprobado en los bancos: los
   enunciados que lo piden lo dicen, y sus resoluciones programadas ya usan la declinación redondeada.
4. **ΔL / Δλ:** el ejercicio de estima analítica pasa a ΔL, como las clases. Las abreviaturas y la hoja dicen que Δλ es lo
   mismo (aparece en explicaciones de preguntas reales).
5. **Presión normal:** 1013,25 hPa es el valor exacto y 1013 el que usa el examen; `py-2-1` lo dice así.
6. **Tangente de `per-11-9`:** el ejemplo pasa a 2,6 millas (α ≈ 15°, Rv = 019°), sin el medio grado que daba 018° o 019°
   según se redondeara. Cambiado en la lámina, la pregunta de la clase, su explicación y las claves del podcast.
7. **Huso en el límite:** `husoDe` deja 7° 30′ exactos en el huso menor, como dice la clase («si el resto pasa de 7° 30′»).
8. **Viento aparente:** la fórmula sale solo en la hoja del PER (el PY no lo trata), con su nota.
9. **Estima inversa:** la hoja explica que el método del examen es la latitud media y que medir en la carta difiere en
   décimas.
10. **Chuleta de mareas del PY:** añadida la corrección por presión.
11. **Impresión de la chuleta del tema:** el rótulo de pantalla ya no sale en el papel.

Queda para la regeneración del podcast (R-09): el audio del PER dice el ejemplo antiguo de la tangente (2,5 millas, 14,5°,
019°); el texto del episodio ya está al día.
