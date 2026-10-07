# Andalucía 2015–2019 en el eje vivo (fase F5) · estado del trabajo

Rama: `feat/andalucia-2015-2019` (desde origin/main). Fichero de notas para retomar el trabajo sin contexto.

## Datos de partida

- Extracción (solo caché, no en git): `nautica/.cache/bancos/andalucia/` copiada de
  `.claude/worktrees/agent-a79feab3cb540097a/nautica/.cache/bancos/andalucia/` (PDF, páginas, etapas).
  Si falta: `npm run bancos -- andalucia --todas` (las rutas `/export/drupaljda/` van por rangos).

## Cómo se rehace el banco (reproducible)

`config.json` de Andalucía: `salida: "data"`, `publicadas: "conservar"` → la etapa escribir deja las publicadas tal
cual y añade detrás las nuevas; las idénticas (enunciado + opciones + respuesta por texto) a una publicada (o a otra nueva
anterior) se unen a su `apareceEn` (salvo si aquella solo sale en convocatorias reservadas). Para rehacerlo desde cero:

```
git checkout origin/main -- data/ejes/andalucia/per/preguntas.json data/ejes/andalucia/py/preguntas.json
node tools/bancos/ejes/andalucia/figuras.mjs        # recorta las 5 figuras (PDF en la caché)
npm run bancos -- andalucia --todas --sin-red --desde extraer
node tools/bancos/ejes/andalucia/explicaciones.mjs fusionar      # explicaciones de los lotes + concepto
node tools/bancos/ejes/andalucia/revision-normativa.mjs --escribir  # norma de cada marca + notas «actualizada»
node tools/bancos/ejes/andalucia/huella.mjs                         # huella de las 2015–2019 (tests)
node tools/bancos/practica.mjs andalucia --ampliar --escribir       # práctica: solo añade
```
(Para rehacer solo las explicaciones: `git checkout origin/main -- data/ejes/andalucia/{per,py}/explicaciones.json`,
`fusionar` y `revision-normativa.mjs --escribir`.)
Volver a ejecutar `npm run bancos` sobre el banco ya escrito no cambia nada (idempotente: 0 nuevas).

Resultado: PER 1499 (810 + 689 nuevas; 31 unidas a otra), PY 1329 (720 + 609; 31 unidas). Las 5 idénticas a preguntas
reservadas de 2025 no se unen: and-2015-c1-t29, and-2016-c2-t28, and-2016-c3-t38, and-2017-c1-t37, and-2017-c3-t39.

## Lotes en subsesiones (ramas `trabajo/and1519-*`, encargos en esta carpeta)

| Lote | Rama | Sesión |
|---|---|---|
| expl per 01–07 | trabajo/and1519-expl-per-0N | 01 session_01QWVkuSdW2vtibBZyMQSWSi · 02 session_013sz1CQEcWxWVg7SG1zEZmC · 03 session_0166YfptyCgqPktLQZNNT9E2 · 04 session_01Rmz2ftRs53W5wqzrpouFYd · 05 session_01Mvr4MsRN18dva3YvwcfqLN · 06 session_01CYfiaXzyMaujqheTD8QPuK · 07 session_01QZHbXLdvyCRK5nPaUnDCz2 |
| expl py 01–05 | trabajo/and1519-expl-py-0N | 01 session_01Pco6xsWq7sdGYMmvPS3DyM · 02 session_01189vBG1bvoV9TSUqapdcRT · 03 session_01D5M33sVusDZ41bZf6UydgP · 04 session_01MgT4rCiCpfHLwpSSnyrdv3 · 05 session_01AjZ68aw9PU2vu2G2XTR6go |
| carta per 2015–16 / 2017–18 / 2019 | trabajo/and1519-carta-per-a / -b / -c | session_01XKTLMF9tFYSk5HgKaDqstd / session_01F21mhqcYqAsAWd2uE7vmhF / session_01W7HK47mvLrVyvC8nTzN8Ai |
| expl carta py 01 / 02 | trabajo/and1519-expl-pycarta-01 / -02 | session_01HCDk9CEFvzR9PStYhpkhyy / session_019zk18MQJE6zdi8B1cvgffS |
| carta per+py resolver | trabajo/and1519-carta-resolver | (11 que solo estaban documentadas) |
| carta py 2015…2019 | trabajo/and1519-carta-py-AAAA | 2015 session_01PTDqCzGa1DSbWaeyuvJKVX · 2016 session_01JE8NmBzRHWBwcBsp6ESy7r · 2017 session_01QKhCTAveZmVhvUZohZ7fAV · 2018 session_01XYaASLJqePDgTr6xonbSQv · 2019 session_01V11ZGt6nUJ9NbcZsDAFUfC |

Recoger: `git fetch origin 'refs/heads/trabajo/and1519-*:refs/remotes/origin/trabajo/and1519-*'` y traer solo sus
ficheros (`git checkout origin/<rama> -- <fichero>`): explicaciones/<tit>-NN.json y notas-*.md; andalucia-<tit>-AAAA.js.

## Plan / hecho

- [x] 1. Fusión en `data/ejes/andalucia/{per,py}/preguntas.json` por la etapa escribir (solo añadir; duplicados → apareceEn).
  Arreglos: guiones de sílaba de 2015 (-raw), «MAREAS.» con punto, tabla del anuario en el enunciado (2/2016),
  formato «Hora Alt.» de 2016–2018, clasificación de mareas/loxodrómica, 5 figuras recortadas.
- [x] 2. Revisión normativa: 474 marcas resueltas (456 vigente, 14 actualizada, 4 retirada: and-2018-c2-t12, and-2018-c4-t11 (RD 128/2022), and-py-2019-c1-g07 (RD 339/2021 y RD 587/2022, balsas), and-2017-c3-t12 (franja de baño, Orden de 1964 derogada)). Notas de las actualizadas en sus explicaciones.
- [x] 3. Explicaciones: 1234 nuevas (PER 625; PY 488 + 121 de carta), las adaptadas llevan `concepto`. Auditoría del 5 % de las 1113 de teoría: 2 errores de 56 (3,6 %), corregidos.
- [x] 4. Soluciones de carta: PER 63 + 1 documentada (and-2018-c3-q45); PY 151 + 7 documentadas (discrepancia) + 2 de mareas sin tabla (`requiere: ["anuario"]`).
- [x] 5. Práctica por clase (`practica.mjs --ampliar`): PER +683, PY +607; no se pierde ninguna.
- [x] 6. Puertas ✓, npm test 1841/1841, huella (1530 originales + 1298 nuevas), humo con Playwright ✓ (progreso conservado, 2015–2019 en la lista, examen 2016 corregido, retirada en la revisión, 0 errores de página).

Pendiente (abierto): fecha de las convocatorias de 2015; nota de alegaciones de 2018 (no se pudo descargar);
tema (UT) posicional en las de tema dudoso.

## Decisiones

- Las 5 duplicadas de preguntas reservadas (2025) NO se funden: fundirlas sacaría esas preguntas de la reserva (en modo
  «examen», una pregunta que sale también en una convocatoria pública deja de estar reservada). Se crean con su id propio.
