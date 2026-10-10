# Hoja de ruta

Una sola página para saber **dónde estamos, qué viene y qué está parado y por qué**. Se actualiza en el mismo commit
que cambia el estado de algo. Las decisiones de diseño viven en su documento (`docs/*.md`); aquí solo se apuntan.

_Última revisión: 10 de octubre de 2026._

## Cómo se mantiene

- Cada línea lleva un **id** estable (`R-xx`) para poder citarla en commits y en conversaciones. No se reutilizan.
- Estados: **Hecho**, **En revisión** (terminado, falta el visto bueno para publicar), **En curso**, **Siguiente**,
  **Después**, **Bloqueado** (con la fuente o la decisión que falta) y **Descartado** (con el motivo).
- Al terminar algo: se pasa a «Hecho» con la referencia de la PR y la fecha, no se borra.
- Una línea bloqueada dice **qué desbloquea** y quién lo aporta; si no lo dice, no está bloqueada, está sin pensar.
- Si cambia el alcance, se tacha y se abre una línea nueva; no se reescribe el pasado.
- Revisión: al cerrar cada tanda de trabajo y, como mínimo, una vez al mes.

## Principios que no se negocian

1. **La verdad es la legislación y las matemáticas.** Cada hecho dibujado o explicado cita su fuente; lo no
   verificable no se dibuja y queda anotado. Si la fuente oficial y la práctica actual difieren, el curso lo dice.
2. **Los bancos de cada tribunal son independientes** (Andalucía, DGMM, Baleares): una explicación solo cita el criterio
   de su banco.
3. **Las convocatorias recientes reservadas son el «examen final»** y no se tocan (`docs/CUARENTENA.md`).
4. **Nada se publica sin visto bueno** en lo visual y en lo de contenido; las capturas van antes.
5. **Sin nombres de academias ni escuelas** en el repositorio, y sin material con derechos (cartas escaneadas,
   PDFs, datos de terceros).
6. Todo con `npm test` en verde, claro y oscuro, a 360 px, y respetando «reducir movimiento».

## Dónde estamos

| Área | Estado |
| --- | --- |
| Bancos y contenido | Andalucía 2016–2026, DGMM y Baleares por eje; conceptos etiquetados; 127 discrepancias documentadas |
| Curso y ruta | PER y PY enlazados, ruta intercalada con dependencias, test de nivel, plan hasta el examen |
| Estudio | «Estoy listo» con olvido y margen, repaso con fichas, hoja de corrección plegable, tarjetas de memoria |
| Entrada | Hoy y Travesía en estilo C (derrota como carta náutica, faros, rangos, insignias) |
| Material gráfico | Láminas en estilo C: PY completo salvo 2 tipos; PER completo salvo lo que cierre `R-01` |
| Carta | Mesa de cartas, carta resuelta paso a paso, ejercicios de examen PER y PY |
| Animaciones | Reproductor común y animaciones con física (evolución, hombre al agua, hélice, marea, borrasca y anticiclón, corriente, ciaboga, desatraque) |
| Sanidad | Guía Sanitaria a Bordo (ISM, 2013) como fuente; las divergencias con el curso se resuelven en `R-01` |
| PWA | Instalable, copia de seguridad con aviso, persistencia, accesos directos, tipografía propia |

## Ahora

| Id | Qué | Estado | Notas |
| --- | --- | --- | --- |
| R-01 | Cierre del PER: 15 láminas pendientes, sanidad coherente, auditoría de punta a punta | En revisión | Rama `feat/per-cierre`; falta el visto bueno |
| R-02 | Decidir `per-9-7`: «hasta 20 millas» y canales 10/74 no verificados | Bloqueado | Decisión del autor: retirar los canales; dejar la cifra solo si una pregunta la exige |

## Siguiente

| Id | Qué | Estado | Notas |
| --- | --- | --- | --- |
| R-04 | Mesa de cartas (pantalla completa) al lenguaje de estilo C | Siguiente | Opcional; la carta de Hoy ya está hecha |
| R-05 | Informe de fin de sesión y «Mi progreso» al estilo nuevo | Siguiente | Hoy conservan su aspecto antiguo (las insignias ya no) |
| R-06 | Hoja propia en la galería para señales pirotécnicas sueltas y sonidos con texto | Siguiente | Hoy se funden con la hoja general (`socorro` + `solo`) |
| R-07 | Animaciones que faltan: frentes en corte, búsqueda con reproductor | Siguiente | Confirmar contra el catálogo de animaciones antes de empezar |

## Después

| Id | Qué | Estado | Notas |
| --- | --- | --- | --- |
| R-09 | Regenerar el podcast (fase 2) con el contenido corregido | Después | Necesita presupuesto de síntesis de voz; el podcast PER aún dice «sin aflojarlo» (torniquete) y hay citas a preguntas reservadas que revisar |
| R-10 | Pulido de PWA: Media Session, bloqueo de pantalla, insignia de la app, notificaciones, pantalla de arranque iOS | Después | Plan en el documento de PWA; valorado como no urgente |
| R-11 | Nuevas convocatorias: incorporar las que se publiquen y pasar la reservada a banco | Después | Cada incorporación pasa por la extracción y la cuarentena |
| R-12 | Otros tribunales y comunidades con examen propio | Después | Orden según volumen y acceso; cada uno es un eje (`docs/BANCOS.md`) |
| R-13 | Vigilancia de cambios normativos (BOE) con aviso sobre las preguntas afectadas | Después | Hoy el filtro normativo es manual |
| R-14 | Calibrar los umbrales de «estoy listo» con datos reales de uso | Después | Hoy son hipótesis razonadas, no medidas |
| R-15 | Vista de profesor y cuentas | Después | Solo si hay un grupo que la use; implica backend y protección de datos |
| R-16 | Fotografías con licencia clara para identificar elementos reales | Después | Cada foto con su autoría y licencia en el apéndice |
| R-17 | Más titulaciones (PNB, Capitán…) | Después | Una entrada en `TITULACIONES` y su banco por eje |

## Bloqueado por fuente

| Id | Qué | Qué lo desbloquea |
| --- | --- | --- |
| R-18 | PY `vientos-regionales` (`py-2-4`) | Una fuente fiable de nombres y direcciones (derrotero, AEMET) |
| R-19 | PY `corriente-estrecho` (`py-2-9`) | El derrotero del Instituto Hidrográfico de la Marina sobre las corrientes del Estrecho |
| R-20 | Tabla de agentes extintores por clase de fuego | Poder consultar la UNE-EN 3-7 |
| R-21 | `dgmm-per-2021-12-32` («grave si más del 33 %») | Una fuente oficial para esa cifra; hoy no está en la guía del ISM |

## Decisiones abiertas (del autor)

- `R-02`: el contenido no verificable de `per-9-7`.
- Qué hacer con los conceptos sin preguntas en un banco (109 en Andalucía, 57 en DGMM, 22 en Baleares): ¿se dejan
  sin repasar o se redactan preguntas de práctica propias, marcadas como tales?
- Luces de boyas y ritmos con «reducir movimiento»: propuesta (en `R-01`) de dejarlas fijas encendidas; falta tu
  confirmación.

## Fuera de alcance (proyecto aparte)

- Vídeo y avatares de profesor.
- Una app nativa: la PWA cubre el caso; solo se reconsidera si falla la instalación en un dispositivo concreto.

## Hecho

| Id | Qué | Referencia |
| --- | --- | --- |
| H-01 | Informe de discrepancias oficiales por tribunal y dos etiquetas corregidas | PR #104 |
| H-02 | Estudio: «estoy listo» con olvido, repaso con fichas, hoja de corrección plegable | Octubre 2026 |
| H-03 | Tipografía propia, iconos, efectos opcionales, entrada única, Travesía | Octubre 2026 |
| H-04 | Persistencia, copia de seguridad, instalación guiada, accesos directos | Octubre 2026 |
| H-05 | Láminas de estilo C del PY (carta, meteo, seguridad, señales) y tarjetas de memoria | Octubre 2026 |
| H-06 | Carta resuelta paso a paso | Octubre 2026 |
| H-07 | Animaciones con reproductor común y física | PR #119 |
| H-08 | Mapas de conceptos y chuletas imprimibles en estilo C | PR #120 |
| H-09 | Láminas finales del PY: socorro, Beaufort y Douglas, radar, GNSS, AIS, coordenadas, balsa | PR #121 |
| H-10 | Hoy y Travesía en estilo C | PR #122 |
| H-11 | Cola del PY: humedad, nubes, olas, viento, helicóptero, arnés, superficies libres, husos | PR #123 |
| H-12 | PER en estilo C: láminas, 32 buques y animaciones de ciaboga y desatraque | PR #124 |
| H-13 | Cierre de láminas: carta, cálculo, normativa y sanidad del PER; extintores y avisos del PY | PR #125 |

## Mantenimiento recurrente

- **Antes de publicar:** capturas a 360 y 990 px en claro y oscuro, `npm test`, y revisar que el diff no incluye PDFs,
  cartas escaneadas ni nombres de centros de formación.
- **Al incorporar una fuente:** anotarla en el apéndice de `docs/ESTILO-LAMINAS.md` o en el documento del banco, y
  las divergencias con el curso en `.trabajo-ux/`, sin resolverlas en silencio.
- **Limpieza de ramas:** las ramas de trabajo ya fusionadas se borran del remoto; se conservan `main`, la rama de
  despliegue y las que se indiquen.
- **Claves y credenciales de servicios externos:** viven fuera del repositorio y se borran al terminar el trabajo que
  las usa.
