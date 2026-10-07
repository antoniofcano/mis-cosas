# Conceptos · grupo seguridad-legislacion

Rama: feat/conceptos-seguridad-legislacion (desde origin/main). Reglas: conceptos-comun.md (scratchpad del orquestador).
Alcance: PER UT 3 (per-3-*), UT 4 (per-4-*), UT 8 (per-8-*) y PY UT 1 (py-1-*).
Catálogo: data/conceptos/seguridad-legislacion.json. Piloto (conjunto oro): .trabajo-conceptos/piloto-seguridad-legislacion.json.

## Hecho
- Temario oficial leído en el BOE (RD 875/2014, anexo II consolidado): PER UT 3.1–3.10, 4.1–4.7, 8.1–8.6; PY UT 1.1–1.4.
  Cada concepto cita en «temario» el punto («RD 875/2014, anexo II: PER UT 3.7 (Material de seguridad); PY UT 1.2 (…)»).
- Norma vigente anclada en la «nota» de cada concepto afectado (sin campos nuevos, para no dar avisos en el validador):
  RD 339/2021 (equipo y aguas sucias; deroga la Orden FOM/1144/2003), RD 587/2022 (balsas), RD 128/2022 (desechos; deroga
  el RD 1381/2002), RD 550/2020 + RD 1188/2025 (buceo, 50 m), RD 876/2014 art. 73 (zonas de baño; la Orden de 1964 está
  derogada por el RD 186/2023), RD 186/2023 (navegación en puertos), RD 191/2026 (posidonia), RD 875/2014 arts. 8–11
  (atribuciones; art. 10 cambiado por el RD 1188/2025 desde el 1-10-2026).
- Leídas las 1 878 preguntas distintas asignadas a esas clases en los tres ejes (andalucia, dgmm, baleares; per y py) y las
  de esos temas que no están en ninguna práctica (reservadas o retiradas).
- Catálogo: 121 conceptos y 17 grupos (raíces: estabilidad, seguridad, legis, emergencia). Pasa el validador de la rama
  feat/conceptos-motor (tools/conceptos/validar.mjs) sin errores ni avisos.
- Piloto: 187 preguntas (≈10 %: 29 and/per, 39 and/py, 25 dgmm/per, 13 dgmm/py, 64 bal/per, 17 bal/py), muestra
  determinista (md5(id) % 100 < 10; en dgmm/py, además 10–19 para tener ≥ 10). Cobertura: 1.ª pasada 184/187 (98,4 %;
  un hueco y dos encajes forzados) → ajustes → 187/187 (100 %).
- npm run precache (data/conceptos/ se sirve) y npm test en verde.

## Pendiente (fuera de esta tarea)
- Etiquetar todo el banco (data/ejes/<eje>/<tit>/conceptos.json) con este catálogo; el piloto sirve de conjunto oro.
- Revisión humana de las dudas de abajo.

## Cómo seguir
- Fuente del catálogo: el JSON es la verdad; se generó con un script de un solo uso (no versionado). Para cambiarlo,
  editar el JSON a mano: no renombrar ids publicados.
- Preguntas de cada clase: data/ejes/<eje>/<tit>/practica.json (ids) → preguntas.json.

## Dudas para revisión humana
- Temario «pendiente» (13): grupo legis.embarcacion y sus conceptos (registro, certificado de navegabilidad, seguro,
  atribuciones de títulos, infracciones), seguridad.equipo.homologacion, seguridad.equipo.otros, legis.hidrocarburos,
  legis.notificacion-sucesos, emergencia.auxilios.valoracion (PLS), emergencia.abordaje.prevencion,
  seguridad.salvamento.rescate-buque. Se preguntan en la UT 3/4/8 o PY 1 pero no figuran en el anexo II.
- Granularidad: helicóptero en 3 conceptos (preparación, maniobra, izado); pirotecnia en 3 (dotación, características,
  uso); chalecos y aros en dotación/características; aguas sucias en 3 (descarga, prohibición, retención); MARPOL V en 4
  (ámbito, regla 3, regla 4, regla 6). Anderson y Boutakow separados.
- estabilidad.* incluye conceptos solo PY (metacentro, GM, equilibrio) y otros PER+PY (G, par adrizante, traslado de pesos,
  superficies libres), porque DGMM y Baleares los preguntan en el PER aunque el temario diga «sin entrar en su estudio».
- Preguntas antiguas «actualizada» (aguas sucias con Orden FOM/1144/2003, chalecos 4,5 m, posidonia antes del RD 191/2026)
  van al concepto con la norma vigente.
- Práctica: hay preguntas asignadas a una clase que no les toca (remolque y balsa en per-3-1, hipotermia en per-3-1/3-4,
  zona 5 y RD 1435/2010 en per-4-4…). No se ha tocado practica.json; el concepto no depende de la clase.

## Relaciones con otros grupos
- balizamiento-ripa: bandera «A» y buque de maniobra restringida (legis.buceo.banderas); señales acústicas con niebla
  (seguridad.niebla); prevención de abordajes (emergencia.abordaje.prevencion); señales de peligro (pirotecnia, per-6-10);
  canales de acceso a playas balizados con marcas laterales (legis.zona-bano.balizada).
- nomenclatura-maniobra: grifos de fondo, bocina, limera (seguridad.mal-tiempo.aberturas, emergencia.via-agua.puntos-riesgo);
  asiento y flotación (per-1-7) frente a estabilidad.definicion; fondeo y posidonia (per-2-3, legis.espacios.posidonia);
  línea de fondeo reglamentaria (RD 339/2021 art. 11); remolque y maniobra (per-7-*), cabos y nudos.
- meteorologia: parte meteorológico antes de salir (seguridad.antes-de-salir.general, per-9-7); niebla (py-2-7) frente a
  seguridad.niebla; tormentas.
- navegacion: aguja y desvíos (seguridad.tormentas.aguja ↔ per-10-5); radar y AIS (py-3-8, py-3-10) frente a
  seguridad.radio.sart; GNSS (py-3-9) frente a seguridad.hombre-al-agua.gnss-mob; publicaciones y material náutico.
