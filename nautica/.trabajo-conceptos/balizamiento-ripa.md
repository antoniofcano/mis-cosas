# Conceptos · balizamiento-ripa (estado)

Rama: `feat/conceptos-balizamiento-ripa` (desde origin/main). Alcance: PER UT5 Balizamiento (`per-5-*`) y UT6 RIPA
(`per-6-*`). En el PY no hay RIPA ni balizamiento: el temario del PY (RD 875/2014) no los incluye y las preguntas del PY
que dicen «baliza» son radiobalizas EPIRB, SART o AIS (seguridad y navegación, de otros grupos).

Temario oficial (RD 875/2014, anexo II, PER; texto leído del BOE consolidado):
- UT5 5.1 Normativa IALA: marcas laterales región A, cardinales, peligro aislado, aguas navegables y especiales («En cada
  Resolución de Convocatorias se especificará la normativa IALA»).
- UT6 6.1 Generalidades (Reglas 1–3); 6.2 Rumbo y gobierno (Reglas 4–19); 6.3 Luces y marcas (Reglas 20, 21 y 23–31);
  6.4 Señales acústicas y luminosas (Reglas 32–37); 6.5 Señales de peligro (anexo IV). Excluidos: Regla 22 y anexos I–III.

## Hecho
- `data/conceptos/balizamiento-ripa.json`: **104 conceptos + 22 grupos** (25 de balizamiento, 79 del RIPA). Cada concepto
  lleva el número de regla del RIPA (o el punto 5.1 IALA) en `temario`, sinónimos sacados de enunciados reales de los tres
  tribunales (Andalucía, DGMM, Baleares) y `clases`.
- Leídas las 2 230 preguntas de UT5/UT6 de los tres ejes (las de `practica.json` de cada clase `per-5-*`/`per-6-*` y las de
  `ut` 5/6 sin clase asignada: 76 de DGMM y 115 de Baleares).
- Piloto (conjunto oro): `.trabajo-conceptos/piloto-balizamiento-ripa.json`, **235 preguntas** = muestra aleatoria
  estratificada del 10 % por clase y eje (220; semilla 20261007) + 16 elegidas a mano para que cada concepto tenga al menos
  un ejemplo. Reparto: Andalucía 56, DGMM 68, Baleares 111.
  - Cobertura: 219 de las 219 preguntas aleatorias que son del tema tienen concepto (100 %). Una de la muestra
    (`bal-per-2024-09-f-08`, «¿Cómo se llama la navegación…? Derrota») está en UT6 en el banco pero es de navegación: no se
    etiqueta aquí.
  - Los 104 conceptos aparecen en el piloto.
  - Buscador ingenuo por sinónimos (texto del enunciado + respuesta correcta, sin tildes): top1 79 %, top3 94 %, top5 97 %
    sobre el piloto (antes de añadir sinónimos con la forma real de los enunciados: 57/70/74 %). Ojo: los sinónimos se
    ajustaron mirando el piloto, así que la cifra real fuera de él será algo menor.
- `npm run precache` hecho (el catálogo es un fichero servido) y `npm test` en verde.

## Conceptos por clase
per-5-1: 4 · per-5-2: 6 · per-5-3: 5 · per-5-4: 10 · per-5-5: 8 · per-6-1: 10 · per-6-2: 7 · per-6-3: 9 · per-6-4: 8 ·
per-6-5: 9 · per-6-6: 4 · per-6-7: 13 · per-6-8: 11 · per-6-9: 12 · per-6-10: 4 (un concepto puede estar en dos clases).
Las clases de luces (per-6-7, per-6-8) y señales (per-6-9) pasan de 8 porque cada una cubre muchas reglas distintas y el
examen pregunta cada tipo de buque por separado.

## Criterios usados (para etiquetar el resto)
- Cada familia de marca se parte en `uso` (qué señala), `aspecto` (color, forma y tope) y `luz`; la cardinal además en
  `significado`, `tope`, `colores`, `luz` y `maniobra` (dejarla a un rumbo dado). «Esta luz, ¿qué marca es?» va al concepto
  `luz` de la familia; `baliza.iala.reconocer` solo cuando la pregunta es transversal (p. ej. «qué marcas tienen luz blanca»,
  tope visto sin color).
- RIPA: un concepto por regla o subregla que se pregunta por separado. Encuentros: `ripa.alcance.*`, `ripa.vuelta-encontrada`,
  `ripa.cruce`, `ripa.cede-paso`, `ripa.sigue-rumbo`, `ripa.vela.*`, `ripa.jerarquia.*`. Si la pregunta da luces o marcación
  y hay que deducir la situación, primer concepto el de la regla y segundo `ripa.situacion.por-luces` (o al revés si lo
  esencial es leer las luces).
- Definiciones de la Regla 3 (`ripa.def.*`) frente a luces y marcas de la parte C (`ripa.luces.*`, `ripa.marcas.*`): «¿qué es
  un buque sin gobierno?» → `ripa.def.sin-gobierno`; «¿qué luces lleva?» → `ripa.luces.sin-gobierno`.
- Señales: las del canal angosto (adelantar, recodo) van a `ripa.canal.*` aunque sean de la Regla 34.

## Dudas para revisión humana
- `baliza.nuevo-peligro`: la boya de pecio y los nuevos peligros no se nombran en la lista del punto 5.1, pero se preguntan
  (sobre todo en Baleares) y son normativa IALA; anclado a 5.1 con esa salvedad.
- Algunas preguntas de RIPA anexo IV (LSD por el canal 70, radiobalizas) solapan con seguridad (PER UT3/UT8, PY UT1): aquí
  van a `ripa.peligro.senales`.
- Hay preguntas en la práctica de una clase que son de otra (p. ej. Baleares `bal-per-2017-07-c-21`, dragaminas a 1000 m,
  en per-6-2; `bal-per-2018-09-d-27`, LSD canal 70, en per-6-3; `dgmm-per-2022-06-17`, ritmos de especiales, en per-5-3):
  se etiquetan por lo que preguntan, no por la clase. No se ha tocado `practica.json`.
- `ripa.luces.def.alcance-remolque` junta luz de alcance y de remolque (mismo sector); si el examen las separa mucho, partir.
- `ripa.vela.misma-banda` incluye la definición de banda de barlovento (Regla 12 b), que se pregunta poco por separado.

## Relaciones con otros grupos (no creados aquí)
- seguridad-legislacion: señales de peligro y radiobalizas/LSD (anexo IV ↔ PER UT3/UT8, PY UT1); bandera «A» y distancia a
  buceadores (RD 550/2020) ↔ `ripa.luces.draga-buceo`; luces/linternas obligatorias en el equipo.
- navegacion: faros, luces de sector, enfilaciones, alcance luminoso (Regla 22, excluida aquí) y lectura de la característica
  de luces en la carta ↔ `baliza.luz.ritmos`; radar, punteo y demora ↔ `ripa.riesgo-abordaje.*`, `ripa.visibilidad.radar`;
  AIS como ayuda anticolisión.
- nomenclatura-maniobra: babor/estribor, amura, través, aleta, barlovento (`ripa.vela.misma-banda`), arrancada y velocidad de
  gobierno (`ripa.visibilidad.senal-proa`), derrota.
- meteorologia: niebla y visibilidad reducida como fenómeno (aquí solo la conducta y las señales).

## Pendiente / cómo seguir
- Etiquetar todas las preguntas de UT5/UT6 en `data/ejes/<eje>/per/conceptos.json` (fichero común a los cinco grupos: hacerlo
  al fusionar para no pisarse). Usar el piloto como oro del buscador de candidatos y los criterios de arriba.
- Al fusionar ramas: `sw-lista.js` y `sw.js` chocarán entre grupos; regenerarlos con `npm run precache` tras la fusión.
