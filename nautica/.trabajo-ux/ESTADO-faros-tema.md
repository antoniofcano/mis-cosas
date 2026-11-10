# La derrota: carta general con faros de tramo y zoom a los temas

## Qué pasaba

1. Los porcentajes de los faros de la Travesía no coincidían con los del Temario: mismo criterio (`luzDeFaro`), distinta
   agrupación (seis faros fijos por bloque del catálogo frente a un faro por tema).
2. Primera solución (commit anterior): un faro por tema. Cuadraba, pero con once temas la carta de la PER crecía
   demasiado (en Hoy, de ≈ 210 a ≈ 300 px).

## Cómo queda (decisión del dueño)

- **Carta general**: pocos faros. PER, 5 tramos que agrupan temas enteros (`tramos` en `src/theory/blocks.js`); PY, 4
  faros, uno por tema. La cuenta de un faro es la suma exacta de las de sus temas y se enciende con el 80 %.
- **Zoom** (solo en la Travesía): tocar un faro abre su carta de aproximación. Tramo con varios temas → una boya por tema
  con las cifras del Temario y enlace al tema. Faro de un solo tema (los del PY y Meteorología en la PER) → una boya por
  clase con el estado de la clase y enlace a la clase. «← Ver toda la derrota» vuelve.
- **Una sola fuente**: `farosDeTemas` (temas, los del Temario) → `farosDeTramos` (carta general) → `boyasDeFaro` (zoom).
- **Hoy**: la carta general compacta vuelve a 210 px de alto a 360 px en PER y PY (228 px a 990). Sin zoom en Hoy.

## Decisiones

- **Tramo de un solo tema**: hace zoom a sus clases (no va directo al tema); el detalle de debajo conserva «Ver el tema».
- **Boyas de clase sin cuenta de ideas**: solo el estado de la clase (`estadoLeccion`). El reparto de ideas por clase de la
  página del tema usa otro criterio y una idea puede estar en varias clases: no cuadraría con los faros.
- **Segundo nivel en la PER** (tema → clases): solo donde el tramo es un tema (Meteorología). En los demás, la boya
  lleva a la página del tema, que ya lista sus clases.
- **Boyas decorativas**: icono genérico `boya` de la app en tinta, en recuadro redondeado; ni laterales ni cardinales, sin
  color ni marca de tope con significado. Documentado en `docs/TRAVESIA.md`.
- **Insignias**: siguen por tema (`tema:<n>`, 100 %); las `bloque:*` antiguas, guardadas. Sin insignia por tramo: los
  cinco tramos no son los seis faros antiguos y reutilizar sus `bloque:*` no sería honesto.
- **Marcador**: en la carta general, el faro del tramo del tema que toca; en el zoom, la boya del tema (o la siguiente
  clase de la ruta). Sobre la bandera va al lado del disco (encima se salía de la carta).
- **«Mi progreso»** (`conceptosPorTema`): ya solo cuenta ideas con alguna pregunta del estudio; sus totales por tema
  coinciden con el Temario y la Travesía (test). Sigue usando su propio criterio de «sabida» para el reparto interno.
- **Ideas sin tema**: no hay ninguna; si la hubiera, faro «Otras ideas» al final.
- La carta «densa» de `trazadoDerrota` (más de seis faros) se conserva sin uso real, con sus tests.

## Comprobado en navegador (Chromium, Playwright; banco de Andalucía; progreso inyectado)

- Hoy, carta general y zoom de cada faro, PER y PY, 360 y 990 px, claro y oscuro: ningún disco, rótulo ni marcador se pisa
  ni se sale; sin desborde horizontal.
- Cifras de las boyas = cifras del Temario (PER: 35/35, 14/17, 0/18 · 10/34, 0/20, 0/20 · 19/21, 35/65 · 7/36, 0/8).
- Foco: al acercarse va a «Ver toda la derrota»; al volver, al faro. Con teclado funciona. Una boya abre su tema.
- Con movimiento, la carta lleva la animación `carta-acerca` / `carta-aleja`; con «reducir movimiento», ninguna.
- Marcador junto a la bandera: comprobado colocándolo a mano en el DOM (no hay forma corta de provocar ese estado).

## Sin comprobar o pendiente

- El aspecto de la animación del zoom (solo se ha comprobado que se aplica, no se ha visto en movimiento).
- El estado real «todos los faros encendidos y sin tema que toque» (marcador en la bandera) no se ha provocado.
- Parte de sesión con un faro de tramo recién encendido: solo por tests.
- DGMM y Baleares: solo por tests. Anchos intermedios y móviles reales, no.
- De las capturas se han mirado una docena; el resto, solo por la medición automática de solapes.
- En una de las pasadas de capturas la consola dio «429 Too Many Requests» al cargar un recurso. El servidor local no
  devuelve ese código; no se ha identificado el recurso y en otra pasada no salió.
- En la rejilla de insignias a 360 px «Nomenclatura» se parte en dos líneas (ya pasaba).
- `tests/listo.test.js` («repaso mezclado») dependía de la fecha real; se le inyectó `ahora` en el commit anterior.
