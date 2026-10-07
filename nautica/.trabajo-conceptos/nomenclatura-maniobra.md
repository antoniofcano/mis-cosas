# Conceptos · grupo nomenclatura-maniobra

Rama: feat/conceptos-nomenclatura-maniobra (desde origin/main). Reglas: documento común de Conceptos (formato SKOS plano).

Alcance: PER UT 1 (Nomenclatura náutica, per-1-*), UT 2 (Amarre y fondeo, per-2-*), UT 7 (Maniobra y navegación, per-7-*).
PY: el temario del PY (RD 875/2014, anexo II, ap. 4) no tiene nomenclatura, amarre ni maniobra, y ninguna clase py-* es de
este grupo. Lo que se le parece en los bancos del PY (estabilidad, desplazamiento y empuje, abarloarse a un buque que se
hunde, rescate en helicóptero) es de seguridad-legislacion. Por eso todos los conceptos llevan `tit: ["per"]`.

Temario oficial: RD 875/2014, anexo II, 3.A (temario del PER), UT1 1.1–1.7, UT2 2.1–2.3, UT7 7.1–7.3 (texto consolidado
BOE-A-2014-10344, leído del BOE). Cada concepto cita su punto con el texto oficial entre «».

## Hecho
- Catálogo `data/conceptos/nomenclatura-maniobra.json`: 97 conceptos y 23 grupos (raíces `nomen`, `amarre`, `maniobra`).
  Ids solo con [a-z0-9] y puntos (sin guiones), por si el validador es estricto.
- Conceptos por clase: per-1-1 6 · 1-2 6 · 1-3 8 · 1-4 5 · 1-5 6 · 1-6 8 · 1-7 9 · 2-1 9 · 2-2 4 · 2-3 2 · 2-4 4 ·
  2-5 4 · 2-6 5 · 7-1 8 · 7-2 4 · 7-3 5 · 7-4 6 · 7-5 3 · 7-6 3 · 7-7 7 · 7-8 6 (un concepto puede estar en varias clases).
- Leídas todas las preguntas de práctica de las 21 clases en los tres ejes (andalucia 277, dgmm 315, baleares 576 asignaciones).
- Piloto `.trabajo-conceptos/piloto-nomenclatura-maniobra.json`: 122 preguntas (10 % estratificado por eje y clase,
  semilla 20261007; andalucia 30, dgmm 34, baleares 58; solo PER, porque el PY no tiene preguntas de este alcance).
  1.ª pasada: 120/122 encajaban bien; 2 encajaban flojo (corriente de aspiración y expulsión en general; boya que bornea).
  Ajuste: `maniobra.helice.atras` pasa a «Presión lateral de las palas y corriente de expulsión» (cubre la definición
  general) y `nomen.casco.casco` recoge estanqueidad y cualidades del buque. 2.ª pasada: 122/122 (100 %). Conceptos usados: 73 de 97.

## Dudas para revisión humana
- Temario «pendiente»: `nomen.timon.tipos` (tipos de timón, eficacia de la pala) y `nomen.helice.paso` (paso, retroceso,
  cavitación): se preguntan (Baleares, DGMM) pero el punto 1.4/1.5 solo cita partes y tipos de hélice.
- `nomen.fondeo.lineaminima`: el punto 1.3 cita «Línea de fondeo», pero la cifra (5 esloras, cadena ≥ 1 eslora, ≤ 6 m toda
  estacha) sale de la norma de equipos; falta citarla (relación con seguridad-legislacion).
- `nomen.helice.abatibles` junta palas abatibles (temario) y paso variable (no temario).
- Granularidad: «Cuadernas y baos» juntos (se preguntan por confusión); «Eslora» y «Manga» separados; las voces de fondeo
  en tres (filar/virar, pendura, a pique/zarpar/levar/clara). `maniobra.agentes.abatimiento` repite un concepto que
  navegación tendrá (10-9): decidir si se fusiona.
- Baleares llama «abarloado al muelle» a lo que es atracado de costado: esas preguntas van a `maniobra.amarras.*`, no a
  `maniobra.atraque.abarloarse`.

## Preguntas asignadas a mis clases que son de otro grupo (no las etiqueto aquí)
- Remolque: bal-per-2017-07-c-09, bal-per-2019-12-a-07 (per-1-1); bal-per-2018-04-e-07, bal-per-2024-07-be-08 (per-2-1);
  bal-per-2021-06-ci-09 (per-7-1) → seguridad (PER 3.9).
- Incendio, poner la banda a sotavento: bal-per-2021-12-a-08 (per-1-1) → emergencias (PER 8).
- Vías de agua: bal-per-2023-12-a-08 (pallete, per-1-7), bal-per-2024-04-a-09 (per-1-2); bal-per-2020-12-f-09,
  bal-per-2024-04-df-09 (per-1-4, se pueden etiquetar secundariamente con nomen.estructura.grifos / nomen.helice.bocina).
- Viento aparente: dgmm-per-2023-11-74 (per-7-5) → meteorología (PER 9-4).

## Relaciones con otros grupos
- seguridad-legislacion: remolque (3.9); estabilidad, balance y escora (3.1) ↔ nomen.terminos.escora; cierre de grifos de
  fondo con mal tiempo (3.3) ↔ nomen.estructura.grifos; costa a sotavento (3.3) ↔ maniobra.agentes.libresotavento;
  librar la hélice en hombre al agua (3.8); vías de agua, achique e incendio (UT 8) ↔ nomen.estructura.achique;
  equipo obligatorio (línea de fondeo mínima) ↔ nomen.fondeo.lineaminima; posidonia y fondeo (4.7) ↔
  amarre.fondeo.lugar / amarre.fondeo.tenedero; PY 1.1 desplazamiento y empuje ↔ nomen.dimensiones.desplazamiento;
  PY abarloarse a un buque que se hunde ↔ maniobra.atraque.abarloarse.
- balizamiento-ripa: señal de buque fondeado (bola de día, luz todo horizonte; exención < 7 m), que se enseña en per-2-4 ↔
  amarre.fondeo.gira; boyas de amarre como marcas especiales ↔ amarre.elementos.muerto.
- navegacion: abatimiento y deriva (10-9) ↔ maniobra.agentes.abatimiento; enfilaciones y demoras (10-7) ↔
  amarre.fondeo.vigilancia; sonda y mareas (10-8) ↔ amarre.fondeo.cadena.
- meteorologia: viento real y aparente (9-4); rolar el viento ↔ amarre.fondeo.borneo.

## Cómo seguir
- Fuente del catálogo: el JSON es la verdad; para cambios pequeños, editar a mano (un concepto por línea).
- Siguiente paso del proyecto: etiquetar todas las preguntas de las clases per-1-*, per-2-*, per-7-* en
  `data/ejes/<eje>/per/conceptos.json`, usando el piloto como conjunto oro.
