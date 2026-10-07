# Cambios revisados · grupo nomenclatura-maniobra

Rama: feat/conceptos-cambios-nomenclatura-maniobra (desde origin/feat/conceptos). `version` del grupo: 1 -> 2.
`validar --sin-cobertura`: sin errores (un aviso nuevo y esperado: `maniobra.agentes.abatimiento` sin clases). `npm test` pasa.

## Aplicado (por propuesta)
- nomen.fondeo.lineaminima: temario con RD 339/2021 art. 11 (comprobado en el BOE, BOE-A-2021-8268: 11.1 línea >= 5 esloras;
  11.2 cadena >= 1 eslora, hasta 6 m toda estacha; 11.3 sin empalmes sin grillete; 11.4 tabla; 11.7 alto poder de agarre, +1/3 otros tipos,
  principal >= 75 %); nota ampliada; clases [per-1-6, per-2-4].
  Ajuste: en la nota solo cito el ejemplo de 9 m (14 kg, 8 mm, 12 mm), que sí comprobé; el de L=12 m (20 kg) de la propuesta no
  lo pude contrastar y no lo incluí.
- amarre.fondeo.cadena: nota reescrita y clase per-2-5.
- nomen.fondeo.grillete-medida (nuevo, temario «pendiente»); nomen.fondeo.linea pierde «27,5 metros» y la frase de la nota; relacionados cruzados.
- Fusión abatimiento/deriva (mi mitad): maniobra.agentes.abatimiento con `sustituidoPor: nav.viento-corriente.abatimiento`, nota de sustitución,
  clases []; maniobra.agentes.viento remite a él (nota y relacionados). Piloto: bal-per-2023-12-c-28 -> nav.viento-corriente.abatimiento.
- nomen.estructura.borda (nota), nomen.timon.limera (sin «bovedilla»), nomen.dimensiones.francobordo (nota), nomen.terminos.barlovento (+per-1-7),
  nomen.fondeo.molinete (nota), amarre.fondeo.tenedero (nota + «arcilla»), maniobra.amarras.codera (nota), maniobra.desatraque.punta (sinónimos),
  nomen.estructura.quilla (sin «quilla de balance»; discrepancia de bal-per-2017-03-a-01 y bal-per-2017-09-c-04 en la nota).
- Traslado de timón: «eficacia del timón» y «superficie de la pala» pasan de nomen.timon.tipos (etiqueta «Tipos de timón») a
  maniobra.gobierno.timon (renombrado «Eficacia del timón: velocidad, hélice y superficie», temario «pendiente»).
- Traslado de hélice: «paso variable» y «ángulo de ataque» pasan de nomen.helice.abatibles (etiqueta «Palas abatibles») a nomen.helice.paso
  (renombrado «Paso, retroceso, paso variable y cavitación»).
- maniobra.helice.atras: renombrado y nota (aspiración y timón avante).
- Relacionados: libresotavento <-> costa-sotavento; grifos -> seguridad.mal-tiempo.aberturas; desplazamiento -> estabilidad.desplazamiento;
  helice.atras -> hombre-al-agua.primeras-acciones.
- nomen.dimensiones.asiento: solo discrepancia (and-2017-c1-t01 define asiento como proa menos popa); sin cambio de catálogo. Anotada aquí.

## NO aplicado y por qué
- Nada de las propuestas quedó sin aplicar. Para el responsable: cuatro conceptos tenían estado «duda» en la valoración
  (nomen.timon.tipos, nomen.helice.paso, maniobra.gobierno.timon, maniobra.helice.atras). La «duda» era sobre el temario (ya «pendiente») y
  los cambios propuestos son concretos, así que los apliqué; revisar si se prefiere otra cosa.
- Re-etiquetado de preguntas fuera del piloto (grillete-medida: bal-per-2017-03-ge-05, bal-per-2018-06-b-03, bal-per-2018-12-c-02,
  bal-per-2021-12-a-06, bal-per-2023-12-c-04, bal-per-2018-06-a-06; timón: dgmm-per-2021-10-49, dgmm-per-2021-12-02; hélice:
  bal-per-2017-07-eda-04, bal-per-2022-03-di-04; abatimiento/deriva de per-7-6): no existen aún data/ejes/*/per/conceptos.json en esta
  rama, así que no hay etiquetas de banco que cambiar; deben etiquetarse así cuando se etiquete el banco.
- Discrepancia a documentar: bal-per-2018-06-a-06 (siete grilletes) responde 175 m = 25 m/grillete, frente a 27,5 m de las demás.

## Recall del piloto (122 preguntas, 139 etiquetas)
| | antes | después |
|---|---|---|
| recall@1 principal | 88,5 % | 86,9 % |
| recall@3 principal | 98,4 % | 97,5 % |
| recall@5 principal | 100,0 % | 99,2 % |
| MRR | 0,935 | 0,924 |
La bajada es 1 pregunta: bal-per-2021-12-c-06 (oro amarre.fondeo.garreo; el principal sale fuera de los 5 primeros) por el cambio de
nota/clases de amarre.fondeo.cadena y la etiqueta de la pregunta bal-per-2023-12-c-28, que ahora apunta al concepto de navegación.

## Para otro grupo (navegación)
- Añadir "per-7-6" a las clases de nav.viento-corriente.abatimiento (y que el superviviente cubra también la deriva por corriente si se
  fusiona; si nav.viento-corriente.deriva queda vigente, las preguntas de deriva de per-7-6 -- and-2024-c3-t39, dgmm-per-2019-06-74 --
  van a ese id; bal-per-2023-12-c-28 puede llevar ambos).
- Mi `sustituidoPor` solo apunta a nav.viento-corriente.abatimiento: debe seguir vigente (no sustituido) al juntar ramas.
- Preguntas a abatimiento (viento): and-2021-c2-t40, and-2025-c1-t37, and-2015-c2-t29, dgmm-per-2020-12-119, dgmm-per-2022-04-74,
  bal-per-2022-03-a-28; dgmm-per-2023-11-73 va a maniobra.agentes.viento.
