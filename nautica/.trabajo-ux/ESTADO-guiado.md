# Estado: modo guiado (R-35) y diagnóstico por tipo de error (R-36)

_10 de noviembre de 2026._

## Hecho

- **Kit** (`src/exams/kit.js`): cada operación con valor preguntable deja `steps[i].pide = { paso, pregunta, campos }`;
  `createKit(chart, { error })` resuelve con un error típico. Las soluciones no se han tocado y siguen llegando a la
  oficial (`tests/exams.test.js` en verde).
- **Taxonomía común** (`src/exams/taxonomia.js`): 17 tipos de paso, 32 errores típicos, 35 variantes; ids alineados con
  los de los ejercicios generados.
- **Diagnóstico** (`src/exams/diagnostico.js`): solo con un único error (o «puede ser A o B» con dos); cada valor dentro
  de la tolerancia de examen. Se enseña en la corrección de `#/q/<id>`, en el panel del profe (práctica y revisión de
  un examen terminado) y al final del paso a paso. Nunca con un examen en marcha.
- **Cobertura** (`node tools/diagnostico-cobertura.mjs`): 812 de 4.137 opciones erróneas (19,6 %) con error único;
  Andalucía PER 29,3 %, PY 32,2 %; Baleares 13,9 / 13,1 %; DGMM 16,1 / 12,3 %. Tabla en `docs/CARTA-RESUELTOS.md`.
- **Modo guiado** (`src/exams/guiado.js`, `src/ui/guiado.js`): en `#/q/<id>` (botón y `?guiado=1`, con su carta que
  dibuja cada paso), en el panel del profe de clases y tandas y en la pestaña «Paso a paso» de la mesa de cartas.
  «Dímelo» no cuenta como fallo. «Tomar la situación de la carta» reutiliza la herramienta Punto, como en los ejercicios.
- **Errores del alumno** (`src/store/errores.js`, `nautica.errores.v1` en el aparato): pasos del modo guiado,
  diagnósticos de preguntas reales y de ejercicios generados. «Tus errores más repetidos» en Mi progreso.
- Tests: `tests/guiado.test.js` (cada operación expone su valor, corrección con tolerancias, cada variante en un caso
  hecho a mano, diagnóstico, almacén).

## Verificado en el navegador (Playwright, 360 y 990 px, claro y oscuro)

Paso a paso completo en `and-py-2016-c3-n12` (Ct por oposición), `and-py-2017-c1-n11` (corriente), `and-py-2016-c2-n19`
(mareas) y `and-py-2019-c2-n20` (estima analítica); diagnóstico marcando la a) de `and-py-2016-c3-n12` («Ct con el signo
cambiado»); Mi progreso; pestaña de la mesa (`and-py-2016-c1-n14`); paso a paso desde el panel del profe en una tanda
del tema 4 del PY. Sin desbordamiento horizontal ni errores de la página.

## Pendiente / no verificado

- No probado con lector de pantalla real (solo estructura: etiquetas, `aria-live`, foco al paso siguiente).
- El paso a paso no está en la práctica de las clases fuera del panel del profe (solo tras responder) ni en el ejemplo
  modelo de `#/<tit>/carta-pasos` (son ejemplos propios, sin kit).
- Los errores del alumno no van a la copia de seguridad ni se sincronizan (decisión: no hay colección para ello en el
  Worker).
- Modelos descartados: escala equivocada y «demora tomada como marcación» al revés (ver `docs/CARTA-RESUELTOS.md`).
- Los pasos intermedios de la loxodrómica (Δl, A, ΔL) no se preguntan (falta una magnitud de minutos con signo).
