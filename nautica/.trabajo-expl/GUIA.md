# Explicaciones del profe · eje Illes Balears

Trabajo: escribir la explicación del profe de cada pregunta de un lote del banco de exámenes de **Baleares** (PER y
Patrón de Yate) de la app «Patrón» (prepara los exámenes teóricos del PER y del PY). Las preguntas son las de los
exámenes oficiales del Govern de les Illes Balears; la respuesta oficial es la impresa en el cuadernillo.

## Entrada y salida

- Entrada: `nautica/.trabajo-expl/entrada/lote-NN.jsonl`, una pregunta por línea:
  `id, tit (per|py), ut, tema, enunciado, opciones {a..d}, correcta, aceptadas, requiere, bloque, figuras, contexto,
  norma?, notas?, hermanas?, andalucia[]`.
  - `norma` solo aparece si no es «vigente»: `actualizada` (la respuesta oficial era la buena con la norma de su fecha;
    la explicación TIENE que contar qué cambió y cuándo, con la `nota`) o `retirada` (la respuesta oficial ya no es
    correcta: explica la oficial como «era así hasta…» y lo que dice hoy la norma, en `discrepancia`).
  - `notas`: notas del proceso (erratas del tribunal, conflictos resueltos). Léelas.
  - `figuras`: imágenes de la pregunta, en `nautica/data/ejes/baleares/<ruta>`. Míralas (herramienta Read) antes de
    explicar.
  - `hermanas`: otras preguntas del banco de Baleares que preguntan lo mismo con otras opciones. Están en el mismo
    lote: escríbelas a la vez, coherentes entre sí.
  - `andalucia`: hasta dos preguntas parecidas del banco de otra comunidad, con su explicación ya escrita y revisada
    (`parecido` 0–1). Son la BASE de estilo y de contenido cuando preguntan lo mismo.
- Salida: `nautica/.trabajo-expl/salida/lote-NN.json`, un objeto con una entrada por cada `id` del lote:

```json
{
 "bal-per-2019-04-a-24": {
  "explicacion": "…",
  "clave": "…",
  "trampa": "…",
  "ilustraciones": [{ "tipo": "sonido", "senal": "." }],
  "discrepancia": "…",
  "defendible": "b",
  "base": "and-2023-c1-t24",
  "concepto": "and-2023-c1-t24"
 }
}
```

Campos (no uses otros):

| campo | obligatorio | qué es |
|---|---|---|
| `explicacion` | sí | 2–4 frases (≈ 180–380 caracteres; más solo si hace falta un cálculo): por qué la oficial es correcta y por qué fallan las otras, con el dato o la regla concreta. |
| `clave` | sí | una línea para recordar (≈ 30–90 caracteres), tipo regla o fórmula. |
| `trampa` | casi siempre | la confusión a la que lleva el distractor más peligroso, en una frase. |
| `ilustraciones` | opcional | solo especificaciones del catálogo `specs.txt` (copiadas tal cual) que muestren de verdad lo que pregunta. Si dudas, no pongas. |
| `discrepancia` | si procede | cuando la respuesta oficial choca con la norma o con el cálculo, o es discutible: qué dice la norma y por qué. |
| `defendible` | si procede | letra de otra opción que también se puede defender (solo con `discrepancia`). |
| `base` | si reutilizas | el `id` de la candidata de `andalucia` cuya explicación has adaptado. |
| `concepto` | si procede | el `id` (bal-… o and-…) de la pregunta que agrupa a las equivalentes: la `base` si la hay; si no, la primera de las `hermanas` (por orden de id). |

## Reglas

1. **La respuesta oficial manda.** Explica por qué es correcta la de `correcta` (y las de `aceptadas` si hay varias).
   Si crees que no lo es, compruébalo con la norma (RIPA, IALA región A, RD 875/2014, RD 339/2021, Reglamento General de
   Costas art. 73, RD 550/2020, MARPOL…) o con el cálculo. Si sigue sin cuadrar, explica la oficial igualmente y pon
   `discrepancia` (y `defendible` si otra opción es defendible). Verdad = la legislación y las matemáticas.
2. **Reutilizar de Andalucía, solo si es el mismo concepto Y la misma respuesta.** Si la candidata pregunta lo mismo
   y su respuesta correcta dice lo mismo que la oficial de aquí, adapta su explicación a ESTE enunciado y a ESTAS
   opciones (las letras cambian: nunca copies «la b)» sin comprobarla), conserva su estilo y sus ilustraciones si
   siguen valiendo, y pon `base` y `concepto`. Si la respuesta correcta es otra (aunque el tema sea el mismo), NO la
   reutilices: escribe una nueva. No nombres nunca la otra comunidad.
3. **Hermanas:** misma idea, misma clave; la explicación de cada una habla de SUS opciones.
4. **Estilo** (el de los ejemplos de abajo): castellano de España, claro y directo, tuteo ocasional, frases cortas,
   sin relleno («Esta pregunta trata de…», «Es importante recordar que…»), sin emojis ni negritas. Cita las opciones por
   letra y contenido cuando ayude: «la c) (tres pitadas cortas) es dar atrás». Números con coma decimal.
5. **Prohibido** nombrar academias, escuelas, centros de formación o marcas comerciales. Nada de «según el temario».
6. **Mareas con anuario** (`requiere` contiene «anuario»): el tribunal entrega un extracto del Anuario de Mareas que no
   se publica. Explica el método paso a paso (hora y altura de las pleamares/bajamares del día, duración y amplitud,
   corrección por presión: 1 cm por hPa respecto a 1013, altura en un instante con la fórmula del seno cuadrado o la
   tabla del anuario, sonda = sonda de carta + altura de marea, adelanto horario), con los datos del enunciado, y di
   que los valores del anuario no vienen en la pregunta. No inventes alturas ni horas del anuario.
7. **Cálculos sin carta** (loxodrómica, coeficiente de corredera, hora…): resuélvelos y comprueba que llegas a la
   oficial; si no, `discrepancia`.
8. **Preguntas con figura**: mira la imagen. Si la pregunta habla de una imagen que no está (`figuras` vacío),
   explica la respuesta con lo que describen las opciones y dilo en una frase.
9. Nada de HTML ni Markdown dentro de los textos.

## Comprobación

Antes de entregar, valida el lote: `node nautica/.trabajo-expl/validar.mjs NN` (sin errores). Luego relee una de cada
diez explicaciones contra su pregunta (respuesta oficial, letras, datos).

## Ejemplos (estilo de referencia, del banco ya revisado)

```json
{"enunciado":"Los buques que naveguen a lo largo de un canal angosto:","opciones":{"a":"Deberán encender las luces de navegación, incluso de día","b":"No pueden superar los tres nudos de velocidad","c":"Se mantendrán lo más cerca posible del límite exterior del canal que quede por su costado de estribor, siempre que ello no entrañe peligro","d":"Todas las respuestas anteriores son correctas"},"correcta":"c"}
{"explicacion":"La Regla 9 a) dice que el buque que navegue por un canal angosto se mantendrá lo más cerca posible del límite exterior del canal que quede por su costado de estribor, siempre que pueda hacerlo sin peligro. El Reglamento no impone ni luces de día ni un límite de velocidad fijo en los canales.","clave":"En canal angosto, pégate a tu estribor."}
```

```json
{"enunciado":"¿Qué indican las marcas especiales según la normativa IALA?:","opciones":{"a":"Marcan un canal de navegación","b":"Indican áreas especiales como zonas de recreo, cables o tuberías submarinas","c":"Señalan aguas seguras para la navegación","d":"Indican el lado de babor al entrar en un puerto"},"correcta":"b"}
{"explicacion":"Las marcas especiales (amarillas, tope en aspa amarilla, luz amarilla) indican zonas o configuraciones especiales que figuran en la carta, como zonas de recreo, cables o tuberías submarinas, zonas militares o de vertidos. No señalan canales, aguas seguras ni el lado de babor.","clave":"Especial = amarilla = «consulta la carta».","trampa":"La c) describe la marca de aguas navegables.","ilustraciones":[{"tipo":"boya","clase":"especial"}]}
```

```json
{"enunciado":"Llamamos Fetch a:","opciones":{"a":"La mar encontrada producida por el cambio en la dirección del viento.","b":"Una zona o extensión en la que el viento sopla en la misma dirección y con la misma intensidad.","c":"Una zona o extensión en la que el viento sopla en varias direcciones y con la misma intensidad.","d":"El cambio en la dirección del viento"},"correcta":"b"}
{"explicacion":"El fetch es la extensión de mar en la que el viento sopla con la misma dirección y la misma intensidad. Si sopla en varias direcciones ya no hay fetch homogéneo, y la mar encontrada o el cambio de dirección del viento son conceptos distintos.","clave":"Fetch = extensión, misma dirección y misma fuerza.","trampa":"El fetch es una distancia (extensión de mar); la persistencia es un tiempo. No los confundas."}
```

```json
{"enunciado":"¿Cuál de las siguientes afirmaciones es correcta?:","opciones":{"a":"En caso de contaminación el patrón de la embarcación es el único responsable de la misma","b":"La obligación del capitán de un barco, de prestar auxilio a otra embarcación es acudir al lugar sólo si recibe la petición de ayuda de un Centro de Salvamento","c":"Dentro de la zona de baño, en un tramo de costa que no esté balizado, se permite navegar a una velocidad no superior a tres nudos","d":"Las respuestas a) y c) son correctas"},"correcta":"c"}
{"explicacion":"En un tramo de costa no balizado se presume una zona de baño (200 m en playas, 50 m en el resto) en la que solo se puede navegar a 3 nudos como máximo. La a es falsa porque la responsabilidad por contaminación es solidaria (naviero, propietario, asegurador y patrón), y la b también, porque la obligación de auxilio existe aunque ningún centro de salvamento lo pida.","clave":"Costa sin balizar: máximo 3 nudos en la franja de baño.","trampa":"La d incluye la a, que es falsa."}
```

Con discrepancia:

```json
{"enunciado":"¿Cuál de los siguientes tipos de fondo es un buen tenedero?","opciones":{"a":"Cascajo","b":"Arcilla","c":"Fango duro","d":"Fango blando"},"correcta":"c"}
{"explicacion":"El fango duro es un buen tenedero porque el ancla se clava y queda bien sujeta. El fango blando no ofrece resistencia y el cascajo (piedra suelta y grava) impide que el ancla se entierre.","clave":"Bueno: arena, fango duro. Malo: fango blando, piedra, cascajo.","trampa":"Fango duro, sí; fango blando, no.","discrepancia":"La arcilla (b) también se considera un buen tenedero en muchos manuales; la oficial se queda con el fango duro, pero la pregunta es discutible.","defendible":"b"}
```

Datos de referencia útiles (normativa vigente a octubre de 2026):
- RD 339/2021 (equipo de seguridad): chaleco por persona (+1 en zona 1), flotabilidad 275 N zona 1, 150 N zonas 2–4,
  100 N zonas 5–7; aro con luz y rabiza en zonas 1–4; bengalas de mano 6 (zonas 1–3), 3 (zonas 4–6); cohetes 6
  (zonas 1–3), 3 (zona 4); fumígenas 2 (zona 1), 1 (zonas 2–3); reflector de radar en cascos no metálicos (zonas 1–4);
  aguas sucias: a más de 3 millas de la línea de base si están desmenuzadas y desinfectadas, a más de 12 sin tratar,
  descargando en ruta a 4 nudos o más.
- Reglamento General de Costas, art. 73: zona de baño balizada = prohibido navegar; sin balizar, franja de 200 m en
  playas y 50 m en el resto de la costa, máximo 3 nudos dentro.
- RD 550/2020 (buceo): bandera «Alfa» en la boya de superficie; mantenerse a 50 m como mínimo de la zona de buceo.
- RD 191/2026: prohibido fondear sobre praderas de posidonia y cymodocea en todo el Mediterráneo (en Baleares ya lo
  prohibía el Decreto 25/2018).
- RD 875/2014 (atribuciones de los títulos): si una pregunta depende de ellas, compruébalas en el texto consolidado del BOE (BOE-A-2014-10344) antes de explicarlas.
- Los 3 nudos generales en el interior de los puertos (Orden de 1964) ya no existen: cada puerto fija su velocidad.
