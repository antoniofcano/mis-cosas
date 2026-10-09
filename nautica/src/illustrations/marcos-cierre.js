// Marcos (docs/ESTILO-LAMINAS.md) de las láminas de lección rehechas en estilo C en la tanda de cierre. Mismo formato
// que marcos.js: { tema, titulo, clave, nota, datos: [{ cifra, texto }], alt }. El texto alternativo es el del propio
// dibujo (su aria-label), para que nunca se desacompasen. Los hechos están comprobados en el apéndice de la guía.

import { MARCOS_CIERRE_B } from './marcos-cierre-b.js';
import { MARCOS_NORMATIVA } from './marcos-normativa.js';
import { declinacionC, cuentaDeclinacion, gm, rumboCuadrantalC, cuadrantalACircular, demoraMarcacionC, calidadCorteC } from './per-cola-calculo-c.js';
import { cartaMargenesC, transportadorC, millaC, rumboDirectoC, estimaC, trasladoDemoraC, tangenteC, verilesC, oposicionC } from './per-cola-carta-c.js';

const NAV = 'Navegación';
const TIERRA = 'La Tierra y la carta';

const desEsc = (t) => t.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
/** Texto alternativo de un dibujo: su aria-label. */
export const altDe = (r) => (r?.svg ? desEsc(r.svg.match(/aria-label="([^"]*)"/)?.[1] ?? '') : '');
/** Marco con el alt de su dibujo; null si la spec no se dibuja. */
const con = (fn, spec, m) => { const r = fn(spec); return r ? { ...m, alt: altDe(r) } : null; };
const deg3 = (d) => `${String(Math.round(((d % 360) + 360) % 360)).padStart(3, '0')}°`;
const numD = (n, d = 1) => String(Math.round(n * 10 ** d) / 10 ** d).replace('.', ',');

// ---------------------------------------------------------------------------
// Carta (PER, UT 10 y 11)

const cartaMargenes = (spec) => con(cartaMargenesC, spec, {
  tema: NAV, titulo: 'Coordenadas en los márgenes de la carta', clave: 'La latitud se lee a los lados; la longitud, arriba y abajo.',
  datos: [{ cifra: 'N', texto: 'latitud: crece hacia arriba' }, { cifra: 'W', texto: 'longitud: crece hacia la izquierda' }, { cifra: '0,2′', texto: 'cada parte de la escala' }],
  nota: 'Da las coordenadas en grados, minutos y décimas: 36° 07,3′ N, 005° 58,6′ W. Para situar un punto dado, traza la latitud en horizontal y la longitud en vertical: el punto está en el cruce.',
});

function transportador(spec) {
  if ((spec.caso ?? 'rumbo') === 'faro') {
    const dv = ((Math.round(+(spec.dv ?? 310)) % 360) + 360) % 360;
    return con(transportadorC, spec, {
      tema: NAV, titulo: '¿Demora desde el faro o al faro?', clave: '«Desde el faro» trazas la demora desde el faro; «al faro», el barco está en la opuesta.',
      datos: [{ cifra: deg3(dv), texto: 'desde el faro: la que trazas' }, { cifra: deg3(dv + 180), texto: 'al faro: hacia donde está el barco' }, { cifra: '± 180°', texto: 'una es la opuesta de la otra' }],
      nota: 'Lee bien desde dónde se mide la demora: un rumbo va de la salida a la llegada y una demora, del barco al objeto. «A 4 millas al Sur verdadero del faro»: desde el faro trazas el 180° y mides 4 millas.',
    });
  }
  const rv = ((Math.round(+(spec.rv ?? 75)) % 360) + 360) % 360;
  return con(transportadorC, spec, {
    tema: NAV, titulo: 'Un rumbo con el transportador', clave: 'Centro en el origen, norte paralelo al meridiano, y lees donde corta la línea.',
    datos: [{ cifra: deg3(rv), texto: 'el rumbo verdadero medido' }, { cifra: '000°–359°', texto: 'desde el norte, en el sentido del reloj' }, { cifra: 'Rv, Dv', texto: 'lo que se mide en la carta' }],
    nota: 'Todo lo que trazas en la carta es verdadero. Si te dan un rumbo o una demora de aguja, pásalo antes a verdadero con la corrección total.',
  });
}

const MILLA = {
  carta: {
    titulo: 'Las distancias, en la escala de latitudes', clave: 'Lleva el compás al margen lateral, a la altura donde mides: cada minuto, una milla.',
    datos: [{ cifra: "1′ = 1 M", texto: 'en la escala de latitudes' }, { cifra: '≈ 0,8 M', texto: 'un minuto de longitud a 36° N' }],
    nota: 'En una Mercator la escala de latitudes se estira al alejarse del ecuador: en una carta pequeña como la del Estrecho apenas se nota, pero mide siempre a la misma altura. Nunca en la escala de longitudes.',
  },
  minuto: {
    titulo: 'Un minuto de la escala, dividido', clave: 'Si el minuto viene en cinco partes, cada una son 0,2 millas.',
    datos: [{ cifra: '1′', texto: '1 milla' }, { cifra: '0,2′', texto: 'cada parte: 0,2 millas' }, { cifra: '185,2 m', texto: 'un cable: 0,1 millas' }],
    nota: 'Las cartas del examen dan los minutos y las décimas: lee primero el minuto entero y después cuenta las partes.',
  },
  definicion: {
    titulo: 'La milla: un minuto de círculo máximo', clave: 'La milla náutica es lo que mide un minuto de arco de un círculo máximo: 1852 m.',
    datos: [{ cifra: '1852 m', texto: 'una milla náutica, por convenio' }, { cifra: '60 M', texto: 'un grado de latitud' }, { cifra: '185,2 m', texto: 'un cable' }],
    nota: 'Por eso, en la carta, un minuto de latitud es una milla. La milla terrestre (1609 m) es otra unidad y no se usa en la mar. El nudo es una milla por hora.',
  },
};
const milla = (spec) => (MILLA[spec.vista ?? 'carta'] ? con(millaC, spec, { tema: TIERRA, ...MILLA[spec.vista ?? 'carta'] }) : null);

const rumboDirecto = (spec) => con(rumboDirectoC, spec, {
  tema: NAV, titulo: 'Rumbo directo: Rv en la carta, Ra al timón', clave: 'La carta solo entiende de verdaderos y el timón, de aguja: Ra = Rv − Ct.',
  datos: [{ cifra: '190°', texto: 'Rv medido en la carta' }, { cifra: '+5°', texto: 'Ct = dm + Δ = −1° + 6°' }, { cifra: '185°', texto: 'Ra = Rv − Ct' }],
  nota: 'Fíjate en la llegada exacta del enunciado (un faro, la luz verde de una bocana, la farola de un espigón): con otra luz el rumbo cambia unos grados. Hora de llegada = hora de salida + distancia / velocidad.',
});

function estima(spec) {
  const r = estimaC(spec);
  if (!r) return null;
  const dado = spec.rv != null && spec.ra == null;
  return {
    tema: NAV, titulo: spec.hi || spec.hf ? `Situación de estima de las ${spec.hi ?? '18:20'} a las ${spec.hf ?? '20:35'}` : 'Situación de estima: salida + Rv + d', clave: 'Desde la salida, el Rv y la distancia navegada: el extremo es la estima.',
    datos: [{ cifra: dado ? 'Rv' : 'Rv = Ra + Ct', texto: dado ? 'si te lo dan, se traza tal cual' : 'el rumbo, pasado a verdadero' }, { cifra: 'd = V × t', texto: 'el tiempo, en horas' }, { cifra: '1′ = 1 M', texto: 'la distancia, en la escala de latitudes' }],
    nota: 'La estima es un triángulo en la carta: es donde deberías estar sin viento ni corriente. Pasa los minutos a horas (2 h 15 min = 2,25 h) antes de multiplicar.',
    alt: altDe(r),
  };
}

function trasladoDemora(spec) {
  const r = trasladoDemoraC(spec);
  if (!r) return null;
  if ((spec.caso ?? 'no-simultaneas') === 'simultaneas') {
    return {
      tema: NAV, titulo: 'Marcaciones simultáneas: se cruzan sin trasladar', clave: 'Si las dos se toman a la vez, el corte es la situación; no se traslada nada.',
      datos: [{ cifra: 'a la vez', texto: 'las dos marcaciones' }, { cifra: 'Dv = Rv + M', texto: 'cada marcación, a demora' }, { cifra: 'situación anterior', texto: 'solo para el rumbo y la distancia' }],
      nota: '«Más tarde, dos marcaciones» quiere decir que esas dos son de la misma hora. La situación anterior te da el rumbo para convertir las marcaciones y, si lo piden, la distancia navegada hasta el corte.',
      alt: altDe(r),
    };
  }
  const v = Number(spec.v ?? 6);
  const min = Number(spec.minutos ?? 40);
  return {
    tema: NAV, titulo: 'Demoras no simultáneas: trasladar la primera', clave: 'La primera línea viaja con el barco: se traslada lo navegado y se corta con la segunda.',
    datos: [{ cifra: `${numD((v * min) / 60)} M`, texto: `${numD(v)} nudos durante ${min} min` }, { cifra: 'paralela', texto: 'la primera, a sí misma' }, { cifra: '2.ª hora', texto: 'la hora de la situación' }],
    nota: 'Cruzar las dos líneas sin trasladar da un punto en el que el barco no ha estado. El traslado es el rumbo y la distancia navegados entre las dos tomas.',
    alt: altDe(r),
  };
}

function tangente(spec) {
  const r = tangenteC(spec);
  if (!r) return null;
  const banda = spec.banda ?? 'babor';
  const dv = Number(spec.dv ?? 4);
  const D = Number(spec.D ?? 10);
  const dp = Number(spec.d ?? 2.5);
  const alfa = Math.round((Math.asin(dp / D) * 1800) / Math.PI) / 10;
  const formula = banda === 'babor' ? 'Rv = Dv + α' : banda === 'estribor' ? 'Rv = Dv − α' : 'Dv ± α';
  return {
    tema: NAV, titulo: banda === 'ambas' ? 'Pasar a una distancia: las dos tangentes' : `Pasar a una distancia dejando el faro por ${banda}`,
    clave: 'La tangente a la circunferencia de la distancia de paso es el rumbo: sen α = d / D.',
    datos: [{ cifra: `${numD(alfa)}°`, texto: `α: sen α = ${numD(dp)} / ${numD(D)}` }, { cifra: formula, texto: banda === 'ambas' ? 'babor +, estribor −' : `faro por ${banda}` }, ...(banda === 'ambas' ? [] : [{ cifra: deg3(banda === 'babor' ? dv + alfa : dv - alfa), texto: 'el rumbo verdadero' }])],
    nota: 'Faro por babor (a tu izquierda): la tangente a la derecha de la visual, Dv + α; por estribor, la de la izquierda, Dv − α. Si no dice la banda, la que pasa por el lado del mar. Después, Ra = Rv − Ct.',
    alt: altDe(r),
  };
}

const VERILES = {
  carta: {
    titulo: 'Sondas y veriles', clave: 'Las sondas dan la profundidad desde el cero hidrográfico; los veriles unen las iguales.',
    datos: [{ cifra: 'm', texto: 'sondas en metros' }, { cifra: '5 · 10 · 20', texto: 'veriles, como curvas de nivel' }, { cifra: 'S M G R', texto: 'la naturaleza del fondo' }],
    nota: 'El cero hidrográfico está por debajo de casi todas las bajamares: la profundidad real es la sonda más la altura de la marea. Las zonas someras van en azul.',
  },
  fondos: {
    titulo: 'Naturaleza del fondo en la carta', clave: 'Las letras junto a las sondas dicen de qué es el fondo; la primera, la que predomina.',
    datos: [{ cifra: 'S', texto: 'arena' }, { cifra: 'M', texto: 'fango' }, { cifra: 'R', texto: 'roca' }],
    nota: 'Las abreviaturas vienen del inglés (Carta n.º 1). Arena y fango agarran bien al fondear; la roca, mal. G es cascajo (grava), no guijarro (P); St son piedras, no roca (R).',
  },
};
const veriles = (spec) => (VERILES[spec.vista ?? 'carta'] ? con(verilesC, spec, { tema: TIERRA, ...VERILES[spec.vista ?? 'carta'] }) : null);

const OPOSICION = {
  oposicion: {
    titulo: 'Oposición: estás entre los dos faros', clave: 'La recta de dos faros opuestos ya es una línea de posición: córtala con la opuesta de una demora.',
    datos: [{ cifra: 'entre', texto: 'el corte cae sobre el segmento A–B' }, { cifra: '080° → 260°', texto: 'desde el tercer faro, Dv ± 180°' }, { cifra: 'sin Ct', texto: 'la recta se traza tal cual' }],
    nota: 'La demora va del barco al faro; desde el faro trazas su opuesta. Si te dan la demora de aguja, pásala antes a verdadera con la corrección total.',
  },
  enfilacion: {
    titulo: 'Enfilación cortada con una demora', clave: 'Si un faro tapa al otro, estás en la prolongación de su recta, fuera del segmento.',
    datos: [{ cifra: 'fuera', texto: 'el corte cae en la prolongación' }, { cifra: '205° → 025°', texto: 'desde el tercer faro, Dv ± 180°' }, { cifra: 'sin Ct', texto: 'la recta se traza tal cual' }],
    nota: '«Al sur verdadero de un faro» quiere decir que lo ves al 000°: desde el faro trazas su meridiano hacia el sur y lo cortas con la enfilación.',
  },
};
const oposicion = (spec) => (OPOSICION[spec.caso ?? 'oposicion'] ? con(oposicionC, spec, { tema: NAV, ...OPOSICION[spec.caso ?? 'oposicion'] }) : null);

function declinacion(spec) {
  const c = cuentaDeclinacion(spec);
  return c ? con(declinacionC, spec, {
    tema: TIERRA, titulo: 'Actualizar la declinación de la carta', clave: 'La variación anual por los años pasados, sumada con su signo: E positiva, W negativa.',
    datos: [{ cifra: gm(c.dm), texto: `en la carta, año ${c.anio}` }, { cifra: `${c.n} × ${gm(c.va)}`, texto: `años por variación: ${gm(c.cambio)}` }, { cifra: gm(c.dm2), texto: `en ${c.actual}` }],
    nota: 'La declinación y su variación anual vienen en la rosa de la carta. Si la variación tiene signo contrario a la declinación, esta se hace más pequeña y puede llegar a cambiar de E a W.',
  }) : null;
}
function rumboCuadrantal(spec) {
  const q = cuadrantalACircular(spec.rumbo ?? 'N64W');
  if (!q) return null;
  const nom = `${q.ns}${q.x}${q.ew}`;
  return con(rumboCuadrantalC, spec, {
    tema: TIERRA, titulo: `Cuadrantal y circular: ${nom}`, clave: 'El cuadrantal se cuenta de 0° a 90° desde el N o el S hacia el E o el W.',
    datos: [{ cifra: nom, texto: `desde el ${q.ns}, ${q.x}° hacia el ${q.ew}` }, { cifra: deg3(q.circ), texto: 'en circular' }],
    nota: 'Circular: de 000° a 359° desde el norte, en el sentido de las agujas del reloj. NE: x; SE: 180° − x; SW: 180° + x; NW: 360° − x.',
  });
}
function demoraMarcacion(spec) {
  const rv = spec.rumbo ?? 70;
  const mc = spec.marcacion ?? -100;
  const r = demoraMarcacionC(spec);
  if (!r) return null;
  const dv = (((rv + mc) % 360) + 360) % 360;
  return {
    tema: NAV, titulo: 'Demora y marcación', clave: 'La demora se cuenta desde el norte; la marcación, desde la proa: Dv = Rv + M.',
    datos: [{ cifra: `Rv ${deg3(rv)}`, texto: 'el rumbo verdadero' }, { cifra: `M ${Math.abs(mc)}° ${mc > 0 ? 'Er' : 'Br'}`, texto: mc > 0 ? 'por estribor: se suma' : 'por babor: se resta' }, { cifra: `Dv ${deg3(dv)}`, texto: 'la demora verdadera' }],
    nota: 'Si la suma sale negativa, súmale 360°; si pasa de 360°, réstaselos. La marcación cambia en cuanto cambias el rumbo, aunque el faro siga en el mismo sitio.',
    alt: altDe(r),
  };
}
const calidadCorte = (spec) => con(calidadCorteC, spec, {
  tema: NAV, titulo: 'Calidad del corte de dos líneas', clave: 'Cuanto más se acerque a 90° el ángulo entre las dos líneas, más fiable es la situación.',
  datos: [{ cifra: '90°', texto: 'el mejor corte' }, { cifra: `${spec.angulo ?? 20}°`, texto: 'corte agudo: zona alargada' }],
  nota: 'Con dos líneas casi paralelas, un error pequeño al tomar o trazar una demora mueve mucho el corte a lo largo de ellas. Elige faros cuyas demoras difieran cerca de 90°.',
});

export const MARCOS_CIERRE = {
  oposicion, 'declinacion-anual': declinacion, 'rumbo-cuadrantal': rumboCuadrantal, 'demora-marcacion': demoraMarcacion, 'calidad-corte': calidadCorte,
  'carta-margenes': cartaMargenes, transportador, milla, 'rumbo-directo': rumboDirecto, estima, 'traslado-demora': trasladoDemora, tangente, veriles,
  ...MARCOS_CIERRE_B,
  ...MARCOS_NORMATIVA,
};
