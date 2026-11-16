# Hoja de ruta

Una sola página para saber **dónde estamos, qué viene y qué está parado y por qué**. Se actualiza en el mismo commit
que cambia el estado de algo. Las decisiones de diseño viven en su documento (`docs/*.md`); aquí solo se apuntan.

_Última revisión: 16 de noviembre de 2026 (plan hacia 2027)._

## Cómo se mantiene

- Cada línea lleva un **id** estable (`R-xx`) para poder citarla en commits y en conversaciones. No se reutilizan.
- Estados: **Hecho**, **En revisión** (terminado, falta el visto bueno para publicar), **En curso**, **Siguiente**,
  **Después**, **Bloqueado** (con la fuente o la decisión que falta) y **Descartado** (con el motivo).
- Al terminar algo: se pasa a «Hecho» con la referencia de la PR y la fecha, no se borra.
- Una línea bloqueada dice **qué desbloquea** y quién lo aporta; si no lo dice, no está bloqueada, está sin pensar.
- Si cambia el alcance, se tacha y se abre una línea nueva; no se reescribe el pasado.
- Revisión: al cerrar cada tanda de trabajo y, como mínimo, una vez al mes.
- Lo que el alumno puede notar se apunta además en `CHANGELOG.md` (registro de cambios, base de las notas de versión),
  en el mismo commit: una línea en «Sin publicar», que al desplegar pasa a su fecha y versión.

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
| Bancos y contenido | Andalucía 2016–2026, DGMM y Baleares por eje; conceptos etiquetados; 129 discrepancias documentadas |
| Curso y ruta | PER y PY enlazados, ruta intercalada con dependencias, test de nivel, plan hasta el examen |
| Estudio | «Estoy listo» con olvido y margen, repaso con fichas, hoja de corrección plegable, tarjetas de memoria |
| Entrada | Hoy y Travesía en estilo C (derrota como carta náutica, faros, rangos, insignias) |
| Material gráfico | Láminas en estilo C: PY completo salvo 2 tipos; PER completo |
| Carta | Mesa de cartas, carta resuelta paso a paso, ejercicios de examen PER y PY |
| Animaciones | Reproductor común y animaciones con física (evolución, hombre al agua, hélice, marea, borrasca y anticiclón, corriente, ciaboga, desatraque) |
| Sanidad | Guía Sanitaria a Bordo (ISM, 2013) como fuente; las divergencias con el curso están resueltas |
| PWA | Instalable, copia de seguridad con aviso, persistencia, accesos directos, tipografía propia, pantalla encendida, compartir el parte |
| Servicio | Sincronización por código de alumno (Worker + D1, registro de operaciones), recordatorio diario por push con tarea horaria, recomposición automática si el servicio pierde un alumno |
| Negocio | Estudio de mercado y planes definidos como hipótesis (`docs/PRODUCTO.md`); refactorización 2.0 planificada y condicionada a la validación (`docs/VERSION-2.md`) |

## Plan hacia la 1.ª convocatoria de 2027 (carta en el móvil y cara nueva)

Decidido el 16 de noviembre de 2026. Objetivo: aprobar la carta del PY en la próxima convocatoria de Andalucía (prevista
hacia marzo de 2027, sin confirmar). Orden por ganancia frente a esfuerzo; las tandas 1 y 2 atacan las dos causas del
suspenso del 14 de noviembre (el tiempo y los fallos de mareas y cálculo). Esfuerzo: S unas horas, M una sesión larga,
L dos o tres. Modelo: Opus para diseñar mecanismos nuevos y todo lo que toque normas o cálculos; Sonnet para construir
lo ya decidido, con pruebas; Haiku solo para trabajo en volumen que se comprueba solo (nunca contenido del examen).
Diseño de referencia: lienzo «Patrón, cinco direcciones», propuesta «Elegida» (carta náutica + modo noche de puente +
reloj de regata).

| Tanda | Ids | Qué | Ganancia | Esfuerzo | Modelo |
| --- | --- | --- | --- | --- | --- |
| 1 · Lo que más aprueba (diciembre) | ~~R-64~~ | ~~Reloj en el paso a paso y en las preguntas de carta, con objetivo por problema~~ | Hecho (H-54) | S | Sonnet |
| | ~~R-52~~ | ~~Paso a paso «de hoja de examen» en corrientes, abatimiento, demoras y corrección total~~ | Hecho (H-56) | M | Opus el primero, Sonnet el resto |
| | ~~R-65~~ | ~~Avisos «Ojo / No olvides / Así se hace» en cada paso, sacados de los errores típicos~~ | Hecho (H-55) | S | Sonnet |
| 2 · Tu fallo, entrenado (diciembre–enero) | ~~R-55~~ | ~~Catálogo de fallos por paso (mareas, estima, corrección total primero)~~ | Hecho (H-57) | M | Opus |
| | ~~R-56~~ | ~~Dosis de 2 minutos sobre el fallo con nombre y comprobación a los 3 días (empieza por mareas)~~ | Hecho (H-58) | M | Opus motor, Sonnet pantalla |
| 3 · La cara nueva (diciembre–enero) | ~~R-67~~ | ~~Colores, letras, fondo de carta y modo noche de puente (claro, oscuro, automático)~~ | Hecho (H-59) | M | Sonnet |
| | ~~R-68~~ | ~~Hoy rediseñado según la maqueta~~ | Hecho (H-60) | M | Sonnet |
| 4 · Examen de verdad (enero–febrero) | ~~R-57~~ | ~~Simulacro con estrategia: primer minuto con el cuadernillo, reparto del tiempo, descartar~~ | Hecho (H-61) | M | Opus |
| | ~~R-58~~ | ~~Corregir la hoja en papel por pasos~~ | Hecho (H-63) | M | Opus |
| | ~~R-66~~ | ~~Simulacro completo de teoría y carta seguidos (cansancio)~~ | Hecho (H-62) | S | Sonnet |
| 5 · Pulido (si da tiempo) | R-69 | Resto de pantallas al estilo nuevo (Temario, Examen, clase, mesa de cartas) | Media | L | Sonnet; Haiku para capturas |
| | ~~R-53~~ | ~~Estima analítica generada con corriente, cruce del 180° y hemisferio sur~~ | Hecho (H-65) | M | Opus |
| | R-54 | Carta gráfica «por intención» en el móvil (eliges qué trazar y la app lo dibuja) | Media | L | Opus |
| Suelto | R-70 | Comprobar en el Derrotero del IHM la corriente tras el cabo Tres Forcas (R-63) | Baja | S | El autor, en papel |

Publicación: cada tanda al terminarla; en marzo, solo simulacros y repaso, sin cambios grandes.

## Ahora

| Id | Qué | Estado | Notas |
| --- | --- | --- | --- |
| R-26 | Probar en móviles reales el recordatorio diario (la sincronización ya está confirmada: iPhone vinculado el 12 de octubre de 2026) | En curso | Falta activar el aviso en un móvil y comprobar que llega a la hora elegida solo si ese día no se ha estudiado |
| R-27 | Validación comercial: transparencia (presentados y aprobados por convocatoria, listado de escuelas), 5–10 conversaciones con autónomos y escuelas, piloto de un mes con 2–3 centros | Siguiente | Antes de fijar precios (`docs/PRODUCTO.md` §10); aclarar derechos de preguntas y carta (IHM) |

## Siguiente

| Id | Qué | Estado | Notas |
| --- | --- | --- | --- |
| R-04 | Mesa de cartas (pantalla completa) al lenguaje de estilo C | Siguiente | Opcional; la carta de Hoy ya está hecha |
| R-05 | Informe de fin de sesión y «Mi progreso» al estilo nuevo | Siguiente | Hoy conservan su aspecto antiguo (las insignias ya no) |
| R-06 | Hoja propia en la galería para señales pirotécnicas sueltas y sonidos con texto | Siguiente | Hoy se funden con la hoja general (`socorro` + `solo`) |
| R-07 | Animaciones que faltan: frentes en corte, búsqueda con reproductor | Siguiente | Confirmar contra el catálogo de animaciones antes de empezar |
| R-54 | Carta en el móvil, función 1: paso a paso que enseña (primer paso «¿qué tipo es?», avisos Ojo / No olvides / Así se hace, ayuda en escalones, ejemplo resuelto y otro con huecos) | Siguiente | `docs/CARTA-MOVIL.md`; parte de la hoja de examen ya hecha en todos los tipos (H-46, H-54). Primero estima y loxodrómica, mareas y corrección total; la carta gráfica por intención, después |
| ~~R-55~~ | ~~Catálogo de fallos típicos por paso: qué respuesta equivocada corresponde a qué fallo, tipo a tipo y comprobado por test~~ | Hecho | H-55 (catálogo y diagnóstico por paso) y H-57 (cuaderno de fallos) |

## Después

| Id | Qué | Estado | Notas |
| --- | --- | --- | --- |
| R-09 | Regenerar el podcast (fase 2) con el contenido corregido | Después | Necesita presupuesto de síntesis de voz; el audio del PER aún dice el ejemplo antiguo de la tangente (2,5 millas, 14,5°, 019°; el curso usa ya 2,6 millas y 15°), «sin aflojarlo» (torniquete) y «aguas costeras hasta 20 millas» (cifra retirada del curso por no verificada) y hay citas a preguntas reservadas que revisar |
| ~~R-10~~ | ~~Pulido de PWA: insignia de la app, notificaciones, pantalla de arranque iOS~~ | — | Se partió: las notificaciones (recordatorio diario) están hechas (H-18); la insignia y la pantalla de arranque pasan a R-18 |
| R-18 | Pulido de PWA: insignia de la app y pantalla de arranque iOS | Después | Media Session, pantalla encendida y compartir el parte ya hechos (H-17) |
| R-11 | Nuevas convocatorias: incorporar las que se publiquen y pasar la reservada a banco | Después | Cada incorporación pasa por la extracción y la cuarentena. Última: Andalucía 3.ª de 2026 (H-49); la reserva sigue siendo de las 5 más recientes |
| R-12 | Otros tribunales y comunidades con examen propio | Después | Orden según volumen y acceso; cada uno es un eje (`docs/BANCOS.md`) |
| R-13 | Vigilancia de cambios normativos (BOE) con aviso sobre las preguntas afectadas | Después | Hoy el filtro normativo es manual |
| R-14 | Calibrar los umbrales de «estoy listo» con datos reales de uso | Después | Hoy son hipótesis razonadas, no medidas; la comparación predicción–resultado tras el examen (H-43) es la primera fuente, ver R-51 |
| R-15 | Vista de profesor y cuentas | Después | Solo si hay un grupo que la use; implica backend y protección de datos. Diseño en `docs/VERSION-2.md` (V2-F4 y V2-F5) |
| R-16 | Fotografías con licencia clara para identificar elementos reales | Después | Cada foto con su autoría y licencia en el apéndice |
| R-17 | Más titulaciones (PNB, Capitán…) | Después | Una entrada en `TITULACIONES` y su banco por eje |
| R-23 | Versión 2.0: refactorización por fases (cimientos, contenido, núcleo, cliente, servicio, aula, operación) | Después | `docs/VERSION-2.md`; se decide con la puerta de 90 días de `docs/PRODUCTO.md` §10 |
| R-24 | Producto como servicio: planes de particulares y canon de academias, a validar con un piloto | Después | `docs/PRODUCTO.md`; precios son hipótesis; antes de cobrar, aclarar derechos de preguntas y carta (IHM) |
| R-25 | Aula virtual: mesa compartida con carta, láminas y test en clase | Después | `docs/PRODUCTO.md` §7 y `docs/VERSION-2.md` V2-F6; prototipo de sala sobre Durable Objects primero |
| R-28 | Pantalla «Novedades» en la app y número de versión legible, alimentados por `CHANGELOG.md` | Después | Hoy la versión es el identificador del service worker; el registro ya existe (H-22) |
| R-29 | Revisar las 102 preguntas que siguen en la práctica de una clase de otro tema (54 de tema dudoso y 48 de clases que se quedarían cortas) y las 281 candidatas de la auditoría de temas | Después | `.trabajo-ux/AUDITORIA-temas.md` y `tools/bancos/practica-excepciones.json`; decidir si la clase del Anuario del PY pasa al tema de carta |
| R-30 | Probar en iPhone real el bloc (teclado) y la carta a pantalla completa (bordes, gestos del sistema, giro con la app instalada) | Siguiente | Solo probado en un navegador que lo simula; decidir si el manifiesto deja de fijar la orientación vertical |
| R-37 | Estrategia de examen: verificar lo pendiente (convocatoria de Baleares; tiempo por módulo del PY en Andalucía y Baleares; documento en Madrid) y calibrar los umbrales de «Tu estrategia» | Después | La página lo muestra como «pendiente de verificar» |
| R-38 | Hoja de fórmulas: revisar la redacción didáctica de los ejemplos nuevos (hora, estabilidad, humedad, radar) | Después | Calculados y comprobados por test; las discrepancias entre curso, chuleta y motores quedaron resueltas (H-33) |
| R-39 | Sincronizar y copiar «Tus errores más repetidos» (hoy solo en el aparato) | Después | Pide un tipo de dato nuevo en el servidor: con la versión 2 |
| R-40 | Vídeos del PY: contrastar los 8 hechos «por verificar» antes de dibujarlos y sustituir en el podcast las preguntas reservadas que leen sus minijuegos | Después | `docs/VIDEOS-PY.md` |
| R-46 | Revisar la lista del día del examen y la estrategia con la convocatoria vigente de cada tribunal (Baleares sin leer; Andalucía 2026) y confirmar dónde publica cada uno las listas de admitidos y la sede | Después | Hoy el enlace por defecto es la página oficial del banco |
| R-47 | Limpiar los alumnos de prueba que las pruebas automáticas dieron de alta en producción (10 de noviembre de 2026) | Después | Solo con decisión del dueño, filtrando por fecha y sin borrados generales (incidente de octubre) |
| R-51 | Calibrar «¿Estás listo?» y los avisos por materia con las comparaciones predicción–resultado que vayan apuntando los alumnos | Después | Hoy solo en el aparato o la cuenta de cada alumno; juntarlas pide su consentimiento y la versión 2 (complementa R-14) |
| ~~R-53~~ | ~~Ejercicio generado de estima analítica con corriente, cruce del 180° y hemisferio sur, como pone hoy el tribunal~~ | Hecho | H-65. Queda: la corriente que actúa solo un rato en medio (el tribunal la pone hasta el final), los rumbos de aguja con desvíos (DGMM) y el error de contar mal las horas que actúa la corriente |
| ~~R-56~~ | ~~Carta en el móvil, función 2: cuaderno de fallos con nombre, dosis de uno o dos minutos con reloj y comprobación días después sin pistas~~ | Hecho | H-58. Lo corregido en papel ya llega al cuaderno (H-63, origen «papel»). Queda: que el cuaderno y el tiempo por tipo alimenten «¿Estás listo?» |
| R-57 | Carta en el móvil, función 3: simulacro con estrategia (primer minuto con el cuadernillo, reparto del tiempo, estimar y descartar, simulacro completo de teoría y carta seguidas) | Hecho (H-61, H-62) | Cose H-35, H-36, H-37, H-42 y H-43; la carta en papel y el móvil de reloj y corrector. El simulacro completo es el ensayo general (R-66, H-62) |
| ~~R-58~~ | ~~Corregir la hoja en papel por pasos: el alumno mete el resultado de cada paso y la app dice en cuál se desvió~~ | Hecho | H-63. Queda: la carta gráfica se corrige por sus números (rumbos, distancias, situación), no por el trazado; si el alumno elige mal el tramo de la tabla de mareas, se ve como un desvío sin nombre |
| R-59 | Más herramientas de dibujo de la mesa de cartas para el móvil | Descartado | La pantalla pequeña no da para trazar; la mesa queda para tablet y ordenador (`docs/CARTA-MOVIL.md`) |
| ~~R-62~~ | ~~La travesía y el mapa de Hoy con un módulo elegido~~ | Hecho | H-51: la travesía, el mapa de Hoy y los faros del Temario siguen el módulo; los temas del otro módulo quedan aparte en el Temario, con enlace |
| ~~R-63~~ | ~~Retoques de clases y fichas por los huecos de la 3.ª de 2026~~ | Hecho | H-53. Queda pendiente comprobar en el Derrotero del IHM la dirección de cada rama de la corriente tras el cabo Tres Forcas (anotado en la verificación de py-2-9) |

## Bloqueado por fuente

| Id | Qué | Qué lo desbloquea |
| --- | --- | --- |
| R-18 | PY `vientos-regionales` (`py-2-4`) | Una fuente fiable de nombres y direcciones (derrotero, AEMET) |
| R-19 | PY `corriente-estrecho` (`py-2-9`) | El derrotero del Instituto Hidrográfico de la Marina sobre las corrientes del Estrecho |
| R-20 | Tabla de agentes extintores por clase de fuego | Poder consultar la UNE-EN 3-7 |
| R-21 | `dgmm-per-2021-12-32` («grave si más del 33 %») | Una fuente oficial para esa cifra; hoy no está en la guía del ISM |

## Decisiones abiertas (del autor)

- Qué hacer con los conceptos sin preguntas en un banco (109 en Andalucía, 57 en DGMM, 22 en Baleares): ¿se dejan
  sin repasar o se redactan preguntas de práctica propias, marcadas como tales?
- Luces de boyas y ritmos con «reducir movimiento»: hoy se quedan fijas encendidas (decidido así; avísame si prefieres
  que sigan destellando).
- Modelo de negocio: precios de los pases y tramos del canon de academias (hipótesis en `docs/PRODUCTO.md`), a
  contrastar con el piloto.
- Proveedor de PostgreSQL gestionado (UE) y de comerciante de registro, al llegar a V2-F4 (`docs/VERSION-2.md`).
- Presupuesto de tiempo y dinero para V2, y si se contrata revisión externa o un segundo desarrollador.

## Fuera de alcance (proyecto aparte)

- Ideas sin planificar: `docs/IDEAS.md`.
- La carta en el móvil (tres funciones, qué se descarta): `docs/CARTA-MOVIL.md`.
- Vídeo y avatares de profesor. El aula virtual (R-25) no aloja vídeo: la voz y el vídeo van por un enlace externo.
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
| H-14 | Sincronización automática del progreso entre dispositivos (código de alumno, QR, Cloudflare Worker + D1) | PR #128 |
| H-16 | Cierre de PER: 15 láminas, sanidad coherente con la Guía del ISM y auditoría; retirados los canales 10/74 y las «20 millas» de `per-9-7` | PR de cierre de PER |
| H-17 | Pantalla encendida durante la sesión y botón «Compartir mi parte» | PR de la tanda 1 de PWA |
| H-15 | Preguntas de carta sin solución: motivo a la vista, fuera de la práctica y discrepancias revisadas (R-22) | PR #129 |
| H-18 | Recordatorio diario opcional: push web (9, 13, 18 o 21 h) solo si ese día no se ha estudiado, `.ics` donde no hay push; Worker con tarea horaria, migración `0002` y claves VAPID desplegados | PR #133 |
| H-19 | Sincronización: recomponer el servicio si pierde un alumno y avisar de un código aún sin registrar | PR #134 |
| H-20 | Investigación de mercado y diseño del producto como servicio, y plan de la versión 2.0 | PR #136 |
| H-21 | Carta: tutorial desde la práctica, oposición Espartel–Malabata desde el primer paso y «Problema modelo» con carta y calculadora | PR #135 |
| H-22 | Registro de cambios (`CHANGELOG.md`), rellenado hacia atrás desde el 8 de octubre | Noviembre 2026 |
| H-23 | Derrota con faros por tramos (PER) o por tema (PY), zoom a temas y clases, y cuentas iguales en Temario, Travesía y Mi progreso | Noviembre 2026 |
| H-24 | Bloc de notas en ejercicios y preguntas de cuentas; carta a pantalla completa en el móvil | Noviembre 2026 |
| H-25 | «¿No es de este tema?»: corrección del tema por el alumno, auditoría de temas y práctica de cada clase con preguntas de su tema | Noviembre 2026 |
| H-26 | Simulacro por módulos en el PY y arreglo de la pregunta equivalente del minijuego del podcast | Noviembre 2026 |
| H-27 | Estrategia de examen por titulación y tribunal, con normas con fuente y «Tu estrategia» (R-31) | Noviembre 2026 |
| H-28 | Fórmulas y tablas en una hoja, con ejemplos comprobados por test (R-32) | Noviembre 2026 |
| H-29 | Modo «la semana antes» (R-33) | Noviembre 2026 |
| H-30 | Fichas de vídeo de las ideas difíciles del PY, `docs/VIDEOS-PY.md` (R-34) | Noviembre 2026 |
| H-31 | Resolver paso a paso y diagnóstico por tipo de error en las preguntas reales (R-35, R-36) | Noviembre 2026 |
| H-32 | Simulacro por módulos del PY corregido con el criterio oficial por materias (RD 875/2014) | Noviembre 2026 |
| H-33 | Discrepancias entre curso, chuleta, hoja de fórmulas y motores resueltas (deriva, Polar, redondeo de la declinación, ΔL, presión, tangente, huso límite) | Noviembre 2026 |
| H-34 | Todas las chuletas en una hoja, por temas, imprimible (`#/<tit>/chuletas`) | Noviembre 2026 |
| H-35 | Ensayo general en papel: cuadernillo imprimible, reloj del tribunal, hoja de respuestas y corrección real (R-41) | Noviembre 2026 |
| H-36 | Tu velocidad en carta: tiempo por pregunta en los exámenes y por tipo de problema en «Tu estrategia» (R-42) | Noviembre 2026 |
| H-37 | Simulacro de tus errores, con índice de distractores por banco (R-43) | Noviembre 2026 |
| H-38 | Lista del día del examen por tribunal, tu convocatoria (hora, sede, enlace) y recordatorio de admitidos (R-44) | Noviembre 2026 |
| H-39 | Repaso exprés de la víspera, paso del penúltimo día de «la semana antes» (R-45) | Noviembre 2026 |
| H-40 | En local la app no sincroniza con el servidor real (las pruebas daban de alta alumnos de prueba) | Noviembre 2026 |
| H-41 | Lista de ramas remotas regenerada (182 ramas: 7 a conservar, el resto clasificado para borrar) y copias de trabajo locales de los agentes retiradas | Noviembre 2026 |
| H-42 | Tus fallos por materia frente a su límite, en «¿Estás listo?» y la semana del examen (R-48) | Noviembre 2026 |
| H-43 | Foto de la predicción en la semana del examen y, tras él, el resultado por materia comparado con ella (R-49) | Noviembre 2026 |
| H-44 | Recuperar un solo módulo del PY: «¿Estás listo?» y la semana del examen del módulo que queda (R-50; BOE-A-2026-510, anexo III C) | Noviembre 2026 |
| H-45 | Estilos de pantalla del ensayo en papel y de la velocidad en carta, que una llave sin cerrar dejaba solo para imprimir desde #140; prueba que vigila las llaves | Noviembre 2026 |
| H-46 | Paso a paso «de hoja de examen» en la estima analítica y en las mareas: un paso por tramo y por cuenta intermedia, tabla, croquis, lo que se trae y lo que se plantea (kit: `traigo`, `plantea`, `lineas`, `tabla`, `croquis`; magnitud `minutos`) | Noviembre 2026 |
| H-47 | `RAMAS.md` con la dirección completa del repositorio en cada comando (no depende de la carpeta) y las ramas nuevas: 186, 7 a conservar | Noviembre 2026 |
| H-48 | Limpieza de ramas remotas hecha: 179 borradas, quedan las 7 a conservar; `RAMAS.md` reducido a las que se conservan y a cómo borrar las nuevas | Noviembre 2026 |
| H-49 | Andalucía, 3.ª convocatoria de 2026 (14 de noviembre): PER y PY en el banco y reservadas para el examen final (sale de la reserva la 1.ª de 2025); los dos cuadernillos del PY venían enlazados con el nombre del otro módulo: corrección en `config.json` (`documentos`) y aviso del adaptador por la portada | Noviembre 2026 |
| H-51 | ¿De qué te examinas? (R-61): elección de módulo en el PY (`modulos_<tit>`, `src/course/foco.js`); el motor recorta estructura, curso, ruta y preguntas al módulo (siguiente parada, plan con fecha —rehecho al cambiar—, avance, «¿Estás listo?», simulacro). Sin elección, el módulo que queda tras un resultado apuntado | Noviembre 2026 |
| H-52 | Clase: la tanda de 10 preguntas se retoma donde se dejó (ajuste del aparato `tandaClase`, `src/course/tanda-clase.js`) y se puede ir directo a ella (primera tarjeta, aviso de apoyos y lista de clases del tema) | Noviembre 2026 |
| H-53 | Huecos de la 3.ª de 2026 cubiertos (R-63): py-2-9 corriente de la costa norte de África (Ceuta al SE, Tres Forcas; concepto `meteo.corrientes.norte-africa`), py-2-4 siroco en la vanguardia de las depresiones, py-4-9 tramo de marea que cruza la medianoche; per-6-1 Regla 3 «no pueden apartarse», per-2-5 borneo y profundidad, per-11-7 enfilación y distancia; concepto `ripa.dst.sin-preferencia` (6 preguntas reetiquetadas) | Noviembre 2026 |
| H-50 | Tu examen oficial (R-60): pasar la hoja del examen de verdad, corregirla con la plantilla y que sus fallos entren en el repaso, en «Tus fallos por materia» y en el resultado del examen; la convocatoria hecha sale del examen final del alumno | Noviembre 2026 |
| H-54 | Reloj del paso a paso y de las preguntas de carta de la práctica (R-64): `course/reloj-paso.js` (objetivo = `tiempoDisponible` de R-42, estados, tiempo por paso), `ui/reloj-paso.js` y pausa en `relojVisible`; el paso a paso guarda su tiempo en `store/tiempos.js` (clave `guiado:<id>`); sin reloj en exámenes ni simulacros | Noviembre 2026 |
| H-55 | Avisos «Ojo / No olvides / Así se hace» en cada paso del paso a paso (R-65): catálogo de los 32 errores típicos (`src/exams/avisos-pasos.js`), cada paso del kit lleva `errores` (los `E(...)` que evalúa, afinados por paso en `erroresDelPaso`), «Ojo» previo si el alumno ya ha fallado ese error o, sin datos, el más frecuente del tribunal (`data/comun/errores-frecuentes.json`), «No olvides» plegado, error con nombre al fallar (`diagnosticarPaso`, a nivel de paso) y «Así se hace» al acertar | Noviembre 2026 |
| H-56 | Paso a paso «de hoja de examen» en el resto de la carta (R-52): corrección total (dm del año, Ct = dm + Δ, Rv/Ra/Dv con su signo, marcación, Ct por enfilación, oposición y Polar), líneas de posición y traslado, abatimiento (banda y Rs = Rv ± Ab), corriente (efectiva, rumbo a dar, rumbo y velocidad, desconocida) y estima; croquis nuevos `ct` (tres nortes), `abatimiento` y `corriente` (triángulo de velocidades), que enseñan lo buscado solo al contestar. Test: en todas las soluciones reales, la cuenta de cada paso llega al valor pedido | Noviembre 2026 |
| H-57 | Cuaderno de fallos (R-55, cierre): cada fallo es un error típico con nombre en un tipo de problema (`<error>.<tipo>`), con sus veces, fechas y origen (paso a paso, opción marcada, ejercicio generado, simulacro, examen, tu examen oficial), sin contar dos veces la misma pregunta el mismo día; `#/<tit>/fallos`; ajustes compartidos `fallo_<id>` (docs/SYNC.md); el paso a paso ya apunta el error del paso y lo reconoce aunque la resolución con el error se salga de la tabla de mareas; el ejercicio de mareas reconoce el adelanto al revés | Noviembre 2026 |
| H-58 | Dosis de 2 minutos y comprobación (R-56): micro-tarjetas con números generados y trampas exactas para 21 errores (mareas, corrección total, viento y corriente, marcación, opuesta, horas decimales) con reloj compacto (`src/course/dosis.js`); sin tarjetas, preguntas del estudio con esa trampa o un ejercicio; comprobación a los 3 días con un problema completo sin pistas (vigilando a 7 días, resuelto con dos seguidas; mal, dosis antes); tarjeta en Hoy, actividad `dosis` del motor detrás de lo principal y fallos que se abren en el resultado de simulacros y del examen oficial | Noviembre 2026 |
| H-59 | Colores, letras, fondo de carta y modo noche de puente (R-67): paleta de la maqueta «Elegida» en tokens de `styles/app.css` (claro: fondo `#EEF3F5`, tinta `#17262F`, acento magenta `#9E1462`, aviso ámbar; oscuro «puente»: `#0A1418`, texto `#D3E2E8`, magenta `#F06AB4` y `#C2337E` en botones, ámbar, cian en entradas, verde), con el bloque oscuro en `@media` (automático) y en `:root[data-theme="dark"]` (forzado), idénticos; los demás `prefers-color-scheme` pasan a tokens (el profe, el botón de la hoja). Ajuste «Aspecto» (automático por defecto, claro, oscuro) en Ajustes, del aparato (no se sincroniza): `src/ui/tema.js` y un script de `<head>` que pone `data-theme` y la meta `theme-color` antes de pintar. Letras propias en `fonts/`: Barlow Condensed 700 (títulos y botones; sustituye a Bitter) e IBM Plex Mono 600 (cifras y campos de respuesta), OFL y subconjunto latino, 16 KB en total. Retícula de carta como `background-image` con dos degradados, sin retícula en el modo concentración. Las láminas (`--lc-*`) y la carta interactiva conservan sus colores. Test `tests/tema.test.js`: elección del tema, forzado = automático, contrastes AA calculados y presupuesto de letras | Noviembre 2026 |
| H-60 | Hoy según la maqueta «Elegida» (R-68): mismos datos y misma lógica, nueva piel y nuevo orden. La derrota, la tarjeta «Siguiente parada» (título grande en condensada, filete de acento, botón de acción en mayúsculas) y, justo debajo, «cómo vas» (rango, semana, ¿estás listo?), el cuaderno de fallos y la tarjeta de foco; lo secundario (test de nivel, podcast, guía, progreso) detrás. Dentro de Hoy, la Travesía y la semana, los `--lc-*` de la carta siguen los colores de la app (claro y oscuro) y las cartelas pierden el doble filete. No se ha quitado ninguna función ni se ha inventado ningún dato |  Noviembre 2026 |
| H-61 | Simulacro con estrategia (R-57): antes del reloj, «el primer minuto» (localizar Anuario de Mareas, desvíos, declinación de la carta, figuras y faros; tipos que trae el examen, fáciles y caros para ese alumno según su velocidad por tipo, sus aciertos y su cuaderno de fallos, o el reparto orientativo sin datos) y el reparto del tiempo (teoría primero, carta fácil después, cara al final, cuáles no merecen la pena si va justo sin pasar del límite del tema, hitos), en el simulacro, las convocatorias y el ensayo en papel; aviso discreto en una línea si se desvía (pregunta que se alarga o ritmo atrasado; en papel, los hitos); informe con plan frente a lo hecho y dónde convenía estimar. Siete reglas de descarte honestas (`src/course/descarte.js`: hora dentro del tramo de marea, sonda entre bajamar y pleamar, cuadrante del rumbo, distancia entre dos puntos, velocidad efectiva, rumbo efectivo entre barco y corriente, lo que da tiempo a navegar), probadas sobre las 2484 preguntas del estudio de PER y PY sin descartar nunca la oficial; 54 preguntas reales con algo que descartar. Lógica en `src/course/plan-examen.js`, interfaz en `src/ui/plan-examen.js`; puntuación y límites sin tocar | Noviembre 2026 |
| H-62 | Ensayo general (R-66, `#/<tit>/test/general?s=…`): en el PY, el módulo genérico y el de navegación seguidos, cada uno con su tiempo oficial y su primer minuto (con `modulos_py` en un módulo, solo ese); en el PER, el examen entero. Se corrige con las reglas de siempre y se guarda como un simulacro (`general: true`); al final, parte a parte, el informe del plan y el cansancio (primera mitad del tiempo frente a la segunda, con el ritmo frente al plan), con la hora a la que se contestó cada pregunta | Noviembre 2026 |
| H-63 | Corregir la hoja en papel por pasos (R-58): «Lo hice en papel» en la pregunta de carta (`#/q/<id>?papel=1`), en el resultado del ensayo en papel y en tu examen oficial; nunca en un examen. Lógica en `src/exams/papel.js`: el kit sigue con los valores del alumno (`createKit(chart, { fijos })`), así un paso que cuadra con sus datos anteriores está bien hecho (arrastrado) y solo cuenta el primer desvío; el error se nombra con las variantes de la taxonomía, también si se cometió en un paso que no escribió; tolerancias del paso a paso (×2 en lo medido). El primer fallo con nombre va al cuaderno con el origen nuevo `papel`. Test con 1203 preguntas reales del estudio y 8131 errores simulados: el primer desvío, siempre; ningún arrastrado marcado en el 99,9 % | Noviembre 2026 |
| H-65 | Estima analítica generada como la pone hoy el tribunal (R-53): de 2 a 5 rumbos a una velocidad, corriente (Rc, a veces por su nombre, e Ihc) toda la navegación o desde una hora hasta el final, sumada como una fila más de la tabla (Ihc × horas que actúa), como en las resoluciones reales; zonas junto al meridiano 180° (siempre lo cruza), ecuador (lo cruza), hemisferio sur y golfo de Cádiz, en mar abierto y con latitudes por debajo de 55° (latitud media, fórmulas de `data/comun/formulas.json`: estima-tramo, estima-directa, estima-inversa y meridiano-180); a veces, rumbo y distancia directos. Paso a paso con el kit (`src/exams/ejercicios.js`: `resolverEstima`, `guiadoDeEjercicio` con cuatro opciones de la semilla) en la vista del ejercicio. Errores nuevos de la taxonomía con su aviso y variantes del kit: `antimeridiano` (`:letra`, `:resta`), `corriente-al-reves` y `lm-hemisferios` (`:llegada`, `:media`); el kit escribe la latitud con signo en el hemisferio S y el cambio de letra al pasar de 180°. La longitud se corrige por el camino corto (`analysis/quantities.js`). Una distractora real del tribunal queda explicada por `antimeridiano` (índice regenerado). Test `tests/estima-analitica.test.js` | Noviembre 2026 |

## Mantenimiento recurrente

- **Antes de publicar:** capturas a 360 y 990 px en claro y oscuro, `npm test`, y revisar que el diff no incluye PDFs,
  cartas escaneadas ni nombres de centros de formación.
- **Al incorporar una fuente:** anotarla en el apéndice de `docs/ESTILO-LAMINAS.md` o en el documento del banco, y
  las divergencias con el curso en `.trabajo-ux/`, sin resolverlas en silencio.
- **Limpieza de ramas:** las ramas de trabajo ya fusionadas se borran del remoto; se conservan `main`, la rama de
  despliegue y las que se indiquen.
- **Pruebas sin tocar producción:** la app servida en local no sincroniza con el servidor real (`docs/SYNC.md`); nunca
  se borran ni se crean datos en la base de producción para probar.
- **Claves y credenciales de servicios externos:** viven fuera del repositorio y se borran al terminar el trabajo que
  las usa.
