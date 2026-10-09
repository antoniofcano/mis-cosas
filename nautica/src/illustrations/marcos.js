// Marco de cada lámina en estilo C (docs/ESTILO-LAMINAS.md): los textos que la acompañan en el HTML, escritos a mano.
//   { tema, titulo, clave, nota, datos: [{ cifra, texto }], alt }
//   tema   → eyebrow («Lámina · Balizamiento»)          titulo → nombre de la lámina (galería, ficha, clase)
//   clave  → la regla en una frase                       nota   → lo que conviene recordar
//   datos  → cifras en recuadros (cifra grande + qué es)  alt    → texto alternativo útil de la figura
// Una lámina sin marco se ve como antes (la migración es gradual). Sin DOM.

import { BUOYS } from './buoys.js';
import { caidaPopa } from '../nautical/helice.js';
import { MAREA_EJEMPLO } from './interactivas/marea.js';
import { FLAGS } from './misc.js';
import { SENALES } from './situations.js';
import { BANDERA_C, patronSonido, SECUENCIA_SONIDO } from './senales-c.js';

const num = (n) => String(n).replace('.', ',');
const BAL = 'Balizamiento';
const RIPA = 'Reglamento (RIPA)';

const CARD = {
  'cardinal-n': ['Norte', 'el norte', 'Q', 'centelleo continuo, sin pausa'],
  'cardinal-e': ['Este', 'el este', 'Q(3) 10 s', 'tres centelleos: las 3 del reloj'],
  'cardinal-s': ['Sur', 'el sur', 'Q(6)+LFl 15 s', 'seis centelleos y uno largo: las 6'],
  'cardinal-w': ['Oeste', 'el oeste', 'Q(9) 15 s', 'nueve centelleos: las 9'],
};
const NOTA_CARD = 'Conos hacia arriba, norte; hacia abajo, sur. Este: base con base, como un huevo. Oeste: punta con punta, como una copa de vino.';
const ALT_CARD = 'Las cuatro marcas cardinales en fichas, cada una con su reloj apuntando al lado del agua segura: norte (conos arriba, negra sobre amarilla, centelleo continuo), este (conos base con base, negra con banda amarilla, tres centelleos), sur (conos abajo, amarilla sobre negra, seis centelleos y uno largo) y oeste (conos punta con punta, amarilla con banda negra, nueve centelleos).';

function cardinales(spec) {
  if (spec.marca) {
    const n = { n: 'Norte', e: 'Este', s: 'Sur', w: 'Oeste' }[spec.marca] ?? 'Norte';
    return {
      tema: BAL, titulo: `Cardinal ${n} junto a un peligro: por dónde se pasa`, clave: 'Cada cardinal está en el cuadrante de su nombre: pásala por ese lado.',
      datos: [{ cifra: '4', texto: 'cuadrantes, separados por NE, SE, SW y NW' }, { cifra: 'blanca', texto: 'la luz de todas las cardinales' }],
      nota: 'La cardinal no está encima del peligro: te dice dónde está el agua segura. Una cardinal Oeste se pasa por el oeste, dejándola entre tú y el peligro.',
      alt: 'Un peligro en el centro, los cuatro cuadrantes y una cardinal en el suyo; una flecha magenta muestra por dónde se pasa.',
    };
  }
  return {
    tema: BAL, titulo: 'Marcas cardinales', clave: 'Pasa por el lado que dice su nombre.',
    datos: [{ cifra: 'Q', texto: 'norte: centelleo continuo' }, { cifra: '3 · 6 · 9', texto: 'este, sur y oeste: las horas de un reloj' }, { cifra: '+ 1 largo', texto: 'el sur añade un destello largo' }],
    nota: NOTA_CARD, alt: ALT_CARD,
  };
}

const BOYAS = {
  babor: { titulo: 'Marca lateral de babor', clave: 'Entrando en puerto, déjala por babor.', datos: [{ cifra: 'roja', texto: 'cuerpo y luz' }, { cifra: 'cilindro', texto: 'su marca de tope' }, { cifra: 'pares', texto: 'su número, contando desde la mar' }], nota: 'Región A: entrando, roja a babor y verde a estribor. Saliendo, al revés. La forma (cilindro) la distingue aunque no se vea el color.' },
  estribor: { titulo: 'Marca lateral de estribor', clave: 'Entrando en puerto, déjala por estribor.', datos: [{ cifra: 'verde', texto: 'cuerpo y luz' }, { cifra: 'cono', texto: 'su marca de tope, con la punta arriba' }, { cifra: 'impares', texto: 'su número, contando desde la mar' }], nota: 'Región A: entrando, verde a estribor y roja a babor. Saliendo, al revés. La forma (cono) la distingue aunque no se vea el color.' },
  'canal-principal-estribor': { titulo: 'Bifurcación: canal principal a estribor', clave: 'Déjala como una roja: el canal principal sigue a estribor.', datos: [{ cifra: 'roja', texto: 'con una banda verde ancha' }, { cifra: 'Fl(2+1) R', texto: 'luz roja, grupo de dos más uno' }, { cifra: 'cilindro', texto: 'tope, como una de babor' }], nota: 'Es una lateral de babor modificada: el color de fondo y el tope son los del canal principal; la banda, los del secundario.' },
  'canal-principal-babor': { titulo: 'Bifurcación: canal principal a babor', clave: 'Déjala como una verde: el canal principal sigue a babor.', datos: [{ cifra: 'verde', texto: 'con una banda roja ancha' }, { cifra: 'Fl(2+1) G', texto: 'luz verde, grupo de dos más uno' }, { cifra: 'cono', texto: 'tope, como una de estribor' }], nota: 'Es una lateral de estribor modificada: el color de fondo y el tope son los del canal principal; la banda, los del secundario.' },
  'peligro-aislado': { titulo: 'Marca de peligro aislado', clave: 'Un peligro pequeño con agua navegable alrededor.', datos: [{ cifra: '2 esferas', texto: 'negras, de tope' }, { cifra: 'Fl(2)', texto: 'luz blanca, dos destellos' }], nota: 'Negra con una banda roja ancha. Está sobre el peligro: no te acerques; pasa por cualquier lado, con resguardo.' },
  'aguas-navegables': { titulo: 'Marca de aguas navegables', clave: 'Agua segura alrededor: centro del canal o recalada.', datos: [{ cifra: 'esfera', texto: 'roja, de tope' }, { cifra: 'LFl 10 s', texto: 'o isofase, ocultaciones o Mo(A)' }], nota: 'Franjas verticales rojas y blancas: la única marca con franjas verticales rojas. Se puede pasar por cualquier lado.' },
  especial: { titulo: 'Marca especial', clave: 'No es para guiarte: señala una zona o un uso especial.', datos: [{ cifra: 'aspa', texto: 'amarilla, de tope' }, { cifra: 'Fl Y', texto: 'luz amarilla' }], nota: 'Balizamiento de playas, conducciones, zonas militares o de ejercicios… Mira la carta o los avisos para saber qué señala.' },
  'nuevo-peligro': { titulo: 'Marca de nuevo peligro', clave: 'Un peligro que aún no está en las cartas.', datos: [{ cifra: 'Al.Bu/Y', texto: 'luz alternativa azul y amarilla' }, { cifra: 'cruz', texto: 'amarilla, de tope' }], nota: 'Franjas verticales azules y amarillas. Mientras no se publica en los avisos a los navegantes, puede balizarse así o con las marcas habituales duplicadas.' },
};

function boya(spec) {
  const b = BUOYS[spec.clase];
  if (!b) return null;
  if (CARD[spec.clase]) {
    const [n, lado, ritmo, luz] = CARD[spec.clase];
    if (spec.reloj === false) {
      return { tema: BAL, titulo: `Marca cardinal ${n}`, clave: `Pásala por ${lado}.`, datos: [{ cifra: ritmo, texto: `luz blanca: ${luz}` }], nota: NOTA_CARD, alt: `Marca cardinal ${n} de lado, con su marca de tope y su luz blanca ${ritmo}. ${b.nota}` };
    }
    return { ...cardinales({}), titulo: `Marca cardinal ${n}`, clave: `Pásala por ${lado}.`, datos: [{ cifra: ritmo, texto: `luz blanca: ${luz}` }] };
  }
  const m = BOYAS[spec.clase];
  return { tema: BAL, ...m, alt: `${b.nombre} de lado: el castillete con sus colores, su marca de tope y su luz con el cronograma del ritmo. ${b.nota}` };
}

function canal(spec) {
  const entrando = (spec.sentido ?? 'entrando') === 'entrando';
  return {
    tema: BAL,
    titulo: entrando ? 'Canal balizado: entrando' : 'Canal balizado: saliendo',
    clave: entrando ? 'Entrando: rojas a babor, verdes a estribor.' : 'Saliendo, al revés: rojas a estribor, verdes a babor.',
    datos: [{ cifra: 'pares', texto: 'las rojas, cilíndricas' }, { cifra: 'impares', texto: 'las verdes, cónicas' }, { cifra: 'desde la mar', texto: 'sentido del balizamiento y de los números' }],
    nota: 'Las marcas no cambian cuando sales: cambia tu banda. Piensa siempre «como si entrara» y dale la vuelta.',
    alt: entrando
      ? 'Canal visto desde arriba, con el puerto arriba y la mar abajo. El barco entra: las rojas cilíndricas (2, 4, 6) le quedan a babor y las verdes cónicas (1, 3, 5) a estribor.'
      : 'El mismo canal visto desde arriba. El barco sale hacia la mar: las rojas cilíndricas le quedan ahora a estribor y las verdes cónicas a babor.',
  };
}

function bifurcacion(spec) {
  const est = spec.marca !== 'canal-principal-babor';
  const principal = spec.ruta !== 'secundario';
  const lado = est ? 'estribor' : 'babor';
  const deja = (est === principal) ? 'babor' : 'estribor';
  return {
    tema: BAL,
    titulo: `Bifurcación con el principal a ${lado}: ${principal ? 'sigues el principal' : 'tomas el secundario'}`,
    clave: `${principal ? 'Para seguir el principal' : 'Para tomar el secundario'}, déjala por ${deja}.`,
    datos: [{ cifra: est ? 'Fl(2+1) R' : 'Fl(2+1) G', texto: `luz ${est ? 'roja' : 'verde'}, dos más uno` }, { cifra: est ? 'roja' : 'verde', texto: `con banda ${est ? 'verde' : 'roja'}: el principal sigue a ${lado}` }],
    nota: `Se lee como la lateral de su color: ${est ? 'una roja se deja por babor' : 'una verde se deja por estribor'} para seguir el canal principal. Para el secundario, por la otra banda.`,
    alt: `Canal que se divide en dos, visto desde arriba y entrando desde la mar. En la punta del bajo, la marca de bifurcación ${est ? 'roja con banda verde' : 'verde con banda roja'}. El barco ${principal ? 'sigue el canal principal' : 'toma el canal secundario'} y la deja por ${deja}.`,
  };
}

const ALT_LUCES = 'Buque de motor visto desde arriba con sus sectores acotados: verde a estribor y roja a babor, de 112,5° cada una; blanca de alcance a popa, de 135°; y, por fuera, el arco magenta de 225° de la luz de tope. Debajo, lo que ve de noche quien lo mira desde el punto marcado.';
const DATOS_LUCES = [{ cifra: '225°', texto: 'tope, blanca: el arco magenta' }, { cifra: '112,5°', texto: 'cada costado, verde y roja' }, { cifra: '135°', texto: 'alcance, blanca: el arco a trazos' }];

const sectoresLuces = () => ({
  tema: RIPA, titulo: 'Luces de un buque de motor', clave: 'Verde a estribor, roja a babor.', datos: DATOS_LUCES,
  nota: 'Si solo ves la luz verde, el buque te enseña su costado de estribor; si solo ves la roja, el de babor. Si solo ves una blanca, lo estás viendo por la popa.',
  alt: ALT_LUCES,
});

const CRUCES = {
  cruce: { titulo: 'Cruce de dos buques de motor', clave: 'Si ves su roja, te apartas tú.', datos: [{ cifra: 'Regla 15', texto: 'se aparta quien tiene al otro por su estribor' }, { cifra: 'Regla 17', texto: 'el otro mantiene rumbo y velocidad' }], nota: 'Apártate pronto y claro, a ser posible pasándole por la popa: no le cortes la proa (Regla 16).' },
  'vuelta-encontrada': { titulo: 'Vuelta encontrada', clave: 'Proa con proa: los dos caen a estribor.', datos: [{ cifra: 'Regla 14', texto: 'los dos maniobran' }, { cifra: 'verde y roja', texto: 'lo que ves: sus dos costados' }], nota: 'Cayendo los dos a estribor os pasáis babor con babor. Ante la duda de si es vuelta encontrada, considera que lo es.' },
  alcance: { titulo: 'Alcance', clave: 'El que alcanza se aparta, siempre.', datos: [{ cifra: 'Regla 13', texto: 'quien alcanza se mantiene apartado' }, { cifra: '22,5°', texto: 'a popa del través: desde ahí, alcanzas' }], nota: 'De noche, si solo le ves la blanca de alcance, lo estás alcanzando tú, aunque seas más grande o vayas a vela.' },
  'vela-amuras': { titulo: 'Dos veleros con amuras distintas', clave: 'Se aparta el que recibe el viento por babor.', datos: [{ cifra: 'Regla 12', texto: 'a i): amuras distintas' }, { cifra: 'babor', texto: 'amurado a babor: cede' }], nota: 'La amura es la banda por la que entra el viento. El amurado a estribor mantiene rumbo y velocidad.', alt: 'Dos veleros que se cruzan con el viento por arriba: el amurado a babor cae y pasa por la popa del amurado a estribor, que sigue a rumbo.' },
  'vela-barlovento': { titulo: 'Dos veleros con la misma amura', clave: 'Se aparta el de barlovento.', datos: [{ cifra: 'Regla 12', texto: 'a ii): misma amura' }, { cifra: 'barlovento', texto: 'el que recibe antes el viento: cede' }], nota: 'Barlovento es el lado de donde viene el viento. El de sotavento mantiene rumbo y velocidad.', alt: 'Dos veleros con la misma amura: el de barlovento se aparta pasando por la popa del de sotavento, que sigue a rumbo.' },
};

function cruce(spec) {
  const s = spec.situacion ?? 'cruce';
  const m = CRUCES[s];
  if (!m) return null;
  return { tema: RIPA, ...m, alt: m.alt ?? 'Buque de motor visto desde arriba con sus sectores; cada sector dice qué situación es si lo ves desde ahí: por su verde se aparta él, por su roja te apartas tú, por su popa lo alcanzas y te apartas tú, de proa es vuelta encontrada. Debajo, sus luces de noche.' };
}

const ZONA = { proa: 'la proa', 'amura-er': 'la amura de estribor', 'traves-er': 'el través de estribor', 'aleta-er': 'la aleta de estribor', popa: 'la popa', 'aleta-br': 'la aleta de babor', 'traves-br': 'el través de babor', 'amura-br': 'la amura de babor' };

function barco(spec) {
  if (spec.modo === 'viento') {
    return {
      tema: 'Nomenclatura náutica', titulo: `Barlovento y sotavento: viento por ${ZONA[spec.viento] ?? ZONA['traves-er']}`, clave: 'Barlovento es por donde entra el viento; babor y estribor no cambian.',
      datos: [{ cifra: 'babor', texto: 'a la izquierda, mirando a proa' }, { cifra: 'estribor', texto: 'a la derecha, mirando a proa' }],
      nota: 'Babor y estribor son del barco; barlovento y sotavento dependen del viento. Con el viento por la amura de estribor, estribor es barlovento.',
      alt: 'Barco visto desde arriba con la flecha del viento entrando por una de sus zonas (amura, través, aleta); se sombrea la banda de barlovento.',
    };
  }
  return {
    tema: 'Nomenclatura náutica', titulo: 'Partes del barco', clave: 'Mirando a proa: babor a la izquierda, estribor a la derecha.',
    datos: [{ cifra: 'eslora', texto: 'el largo, de proa a popa' }, { cifra: 'manga', texto: 'el ancho máximo' }, { cifra: 'calado', texto: 'de la flotación a la quilla' }],
    nota: 'En la sección, el francobordo (de la flotación a la cubierta) más el calado (de la flotación a la quilla) dan el puntal.',
    alt: 'Barco en planta, con la proa a la derecha: crujía, babor arriba y estribor abajo, amura, través y aleta, con las cotas de eslora y manga. Debajo, su sección: flotación, obra muerta y obra viva, con las cotas de puntal, francobordo y calado.',
  };
}

function meteo(spec) {
  if (spec.sistema === 'borrasca') {
    return {
      tema: 'Meteorología', titulo: 'Borrasca en el hemisferio norte', clave: 'El viento gira al revés que las agujas del reloj y entra hacia el centro.',
      datos: [{ cifra: 'B', texto: 'baja presión en el centro' }, { cifra: 'antihorario', texto: 'giro del viento' }, { cifra: 'hacia dentro', texto: 'converge, el aire sube: nubes y lluvia' }],
      nota: 'Con el viento de espaldas, la borrasca te queda a la izquierda y algo adelantada (ley de Buys-Ballot). En el hemisferio sur, el giro es al revés.',
      alt: 'Isobaras cerradas alrededor de una B de baja presión (996, 1000 y 1004 hPa, menor en el centro). Las flechas del viento giran en sentido antihorario y cruzan las isobaras hacia el centro.',
    };
  }
  if (spec.sistema === 'anticiclon') {
    return {
      tema: 'Meteorología', titulo: 'Anticiclón en el hemisferio norte', clave: 'El viento gira como las agujas del reloj y sale hacia fuera.',
      datos: [{ cifra: 'A', texto: 'alta presión en el centro' }, { cifra: 'horario', texto: 'giro del viento' }, { cifra: 'hacia fuera', texto: 'diverge, el aire baja: buen tiempo' }],
      nota: 'En el centro del anticiclón el viento es flojo; con las isobaras muy separadas, calmas. En el hemisferio sur, el giro es al revés.',
      alt: 'Isobaras cerradas alrededor de una A de alta presión (1032, 1028 y 1024 hPa, mayor en el centro). Las flechas del viento giran en sentido horario y cruzan las isobaras hacia fuera.',
    };
  }
  if (spec.sistema === 'isobaras' && spec.centro === 'A') return { ...METEO.isobaras, titulo: 'Isobaras y viento en un anticiclón' };
  return METEO[spec.sistema] ?? null;
}

const MET = 'Meteorología';
const NOTA_NIEBLA = 'La niebla aparece cuando el aire llega a su punto de rocío (humedad relativa del 100 %). Con el psicrómetro: si el termómetro seco y el húmedo marcan casi lo mismo, el aire está cerca de saturarse.';
const METEO = {
  'buys-ballot': {
    tema: MET, titulo: 'Ley de Buys-Ballot', clave: 'De espaldas al viento, la borrasca queda a la izquierda y algo adelantada.',
    datos: [{ cifra: 'izquierda', texto: 'la baja presión (hemisferio norte)' }, { cifra: 'derecha', texto: 'la alta, algo atrasada' }, { cifra: 'al revés', texto: 'en el hemisferio sur' }],
    nota: 'El viento no sopla paralelo a las isobaras: las cruza hacia la baja presión (en la mar, unos 20°). Por eso la borrasca no queda justo a 90°, sino algo adelantada.',
    alt: 'Isobaras alrededor de una borrasca (B, a la izquierda) y de un anticiclón (A, a la derecha); en medio, tú, con el viento por la espalda: la línea a trazos hacia la B queda a la izquierda y algo por delante de hacia donde miras.',
  },
  isobaras: {
    tema: MET, titulo: 'Isobaras y viento', clave: 'Isobaras juntas, más viento; el viento las cruza hacia la baja.',
    datos: [{ cifra: '4 hPa', texto: 'entre isobaras, en los mapas' }, { cifra: 'juntas', texto: 'gradiente fuerte: mucho viento' }, { cifra: 'B · A', texto: 'antihorario y hacia dentro; horario y hacia fuera' }],
    nota: 'El gradiente horizontal de presión es la diferencia de presión por unidad de distancia: cuanto más juntas las isobaras, mayor gradiente y más viento. Hemisferio norte.',
    alt: 'Isobaras circulares con su presión alrededor de una borrasca o un anticiclón; tu barco en un punto de una de ellas y, en magenta, la flecha del viento, que cruza las isobaras y es más larga y gruesa cuanto más juntas están.',
  },
  frentes: {
    tema: MET, titulo: 'Los frentes de una borrasca', clave: 'El frente frío es una cuña empinada; el cálido, una rampa suave.',
    datos: [{ cifra: 'triángulos', texto: 'frente frío, hacia donde avanza' }, { cifra: 'semicírculos', texto: 'frente cálido, hacia donde avanza' }, { cifra: 'sector cálido', texto: 'entre los dos frentes' }],
    nota: 'Al pasar una borrasca por el norte de tu posición, primero llega el frente cálido (lluvia continua), luego el sector cálido y después el frío (chubascos y rachas; el viento rola y el barómetro sube).',
    alt: 'Un bloque en perspectiva con el mapa del tiempo en el suelo (la borrasca con sus frentes frío y cálido y el sector cálido entre ellos) y el corte A–A′ en la pared del fondo; al lado, el mapa y el corte en plano.',
  },
  'frente-frio-corte': {
    tema: MET, titulo: 'Frente frío, en corte', clave: 'El aire frío entra como una cuña y levanta de golpe el cálido.',
    datos: [{ cifra: 'Cb', texto: 'cumulonimbos: chubascos, rachas y tormenta' }, { cifra: 'rola', texto: 'el viento, al paso del frente' }, { cifra: 'sube', texto: 'la presión, y el cielo se limpia' }],
    nota: 'Tras el frente frío bajan la temperatura y la humedad, sube la presión y la visibilidad mejora mucho. En el mapa: línea azul con triángulos hacia donde avanza.',
    alt: 'Corte vertical de un frente frío que avanza hacia la derecha: la cuña empinada de aire frío por debajo, el aire cálido levantado delante, un cumulonimbo con chubascos sobre el frente y, abajo, el símbolo de triángulos.',
  },
  'frente-calido-corte': {
    tema: MET, titulo: 'Frente cálido, en corte', clave: 'El aire cálido sube despacio sobre el frío: nubes en capas y lluvia continua.',
    datos: [{ cifra: 'Ci · Cs', texto: 'lo anuncian de lejos (halo)' }, { cifra: 'As · Ns', texto: 'después; lluvia continua y débil' }, { cifra: 'baja', texto: 'la presión antes de su paso' }],
    nota: 'Las nubes altas llegan cientos de kilómetros por delante del frente: un cielo que se cubre de cirros y cirrostratos con halo avisa de que se acerca. En el mapa: línea roja con semicírculos.',
    alt: 'Corte vertical de un frente cálido que avanza hacia la derecha: la rampa suave del aire cálido sobre el frío, con cirros, cirrostratos, altostratos y nimbostratos con lluvia continua cerca del frente; abajo, el símbolo de semicírculos.',
  },
  'niebla-adveccion': {
    tema: MET, titulo: 'Niebla de advección', clave: 'Aire templado y húmedo que se enfría al pasar sobre agua fría.',
    datos: [{ cifra: 'la de la mar', texto: 'la típica de la navegación' }, { cifra: 'días', texto: 'puede durar, aunque sople el viento' }, { cifra: '100 %', texto: 'humedad relativa: aparece la niebla' }],
    nota: NOTA_NIEBLA,
    alt: 'Corte con la mar fría abajo y una flecha de aire templado y húmedo que llega sobre ella; un termómetro con la temperatura del aire y, cuando se satura, una banda gris de niebla sobre el agua.',
  },
  'niebla-radiacion': {
    tema: MET, titulo: 'Niebla de radiación', clave: 'En tierra, en noches despejadas y sin viento: el suelo se enfría y enfría el aire.',
    datos: [{ cifra: 'de noche', texto: 'cielo despejado y calma' }, { cifra: 'por la mañana', texto: 'se disipa al calentar el sol' }, { cifra: 'en tierra', texto: 'afecta poco a la mar abierta' }],
    nota: NOTA_NIEBLA,
    alt: 'Corte de noche con la luna: la tierra se enfría por radiación, el termómetro baja y, al saturarse el aire, aparece una banda gris de niebla pegada al suelo.',
  },
  'niebla-vapor': {
    tema: MET, titulo: 'Niebla de vapor', clave: 'Aire muy frío sobre agua más templada: el agua humea.',
    datos: [{ cifra: '≈ 8 °C', texto: 'o más de diferencia entre agua y aire' }, { cifra: 'evaporación', texto: 'no enfriamiento: satura el aire de abajo' }, { cifra: 'invierno', texto: 'dársenas, rías y mares cerrados' }],
    nota: 'Es poco espesa y de poca altura, pero puede tapar la visión de cerca en una dársena. Se llama también humo de mar.',
    alt: 'Corte con agua templada abajo y una flecha de aire muy frío encima; un termómetro con la temperatura del aire y, cuando la diferencia es grande, columnas grises de vapor que suben del agua.',
  },
  'brisa-mar': {
    tema: MET, titulo: 'Brisa marina (virazón)', clave: 'De día, la tierra se calienta más: en superficie el viento entra del mar.',
    datos: [{ cifra: 'de día', texto: 'máxima por la tarde' }, { cifra: 'mar → tierra', texto: 'en superficie' }, { cifra: 'asciende', texto: 'el aire sobre la tierra caliente' }],
    nota: 'Es una circulación cerrada: el aire sube sobre la tierra, vuelve hacia el mar en altura y baja sobre él. De noche se invierte: el terral.',
    alt: 'Corte de la costa de día: el aire asciende sobre la tierra caliente, vuelve en altura hacia el mar, desciende sobre él y en superficie entra del mar a tierra (flecha magenta).',
  },
  'brisa-tierra': {
    tema: MET, titulo: 'Terral', clave: 'De noche, la tierra se enfría más: en superficie el viento sale hacia el mar.',
    datos: [{ cifra: 'de noche', texto: 'máximo al amanecer' }, { cifra: 'tierra → mar', texto: 'en superficie' }, { cifra: 'desciende', texto: 'el aire sobre la tierra fría' }],
    nota: 'Suele ser más flojo que la virazón, porque la diferencia de temperatura de noche es menor. De día se invierte: la brisa marina.',
    alt: 'Corte de la costa de noche: el aire desciende sobre la tierra fría, sale en superficie hacia el mar (flecha magenta), asciende sobre él y vuelve a tierra en altura.',
  },
};

const helice = (spec) => {
  const dex = spec.sentido !== 'levogira';
  const atras = spec.marcha === 'atras';
  const r = caidaPopa({ marcha: atras ? 'atras' : 'avante', sentido: dex ? 'dextrogira' : 'levogira', timon: 'via' });
  return {
    tema: 'Maniobra', titulo: `Hélice ${dex ? 'dextrógira' : 'levógira'} dando ${atras ? 'atrás' : 'avante'}`, clave: `La popa cae a ${r.popa}; la proa, a ${r.proa}.`,
    datos: [{ cifra: atras ? 'muy marcado' : 'pequeño', texto: `el efecto, dando ${atras ? 'atrás' : 'avante'}` }, { cifra: dex ? 'horario' : 'antihorario', texto: 'giro avante, visto desde popa' }],
    nota: 'Dextrógira: avante la popa cae a estribor y atrás a babor. Levógira, al revés. Por eso un barco de hélice dextrógira atraca mejor por babor.',
    alt: `A la izquierda, la hélice vista desde popa girando; a la derecha, el barco en planta con una flecha que lleva la popa a ${r.popa}.`,
  };
};

function heliceTimon(spec) {
  const e = { marcha: spec.marcha === 'atras' ? 'atras' : 'avante', sentido: spec.sentido === 'levogira' ? 'levogira' : 'dextrogira', timon: ['br', 'er', 'via'].includes(spec.timon) ? spec.timon : 'via' };
  const r = caidaPopa(e);
  const timon = { br: 'timón a babor', er: 'timón a estribor', via: 'timón a la vía' }[e.timon];
  return {
    tema: 'Maniobra', titulo: `Hélice y timón: ${e.marcha === 'atras' ? 'dando atrás' : 'avante'}, ${timon}${e.sentido === 'levogira' ? ', hélice levógira' : ''}`,
    clave: `La popa cae a ${r.popa}; la proa, a ${r.proa}.`,
    datos: [{ cifra: 'atrás', texto: 'con poca arrancada manda la hélice' }, { cifra: 'avante', texto: 'con arrancada manda el timón' }],
    nota: 'Hélice dextrógira: avante la popa cae a estribor y atrás a babor; levógira, al revés. La proa cae siempre a la banda contraria de la popa.',
    alt: 'Barco en planta con la proa arriba, su hélice y su timón; flechas a la altura de la popa: el empuje lateral de la hélice, el del timón y, más gruesa, hacia dónde cae la popa.',
  };
}

function hombreAlAgua(spec) {
  if ((spec.maniobra ?? 'boutakow') === 'anderson') {
    return {
      tema: 'Seguridad', titulo: 'Hombre al agua: maniobra de Anderson', clave: 'Todo a la banda del náufrago y una vuelta de unos 250°.',
      datos: [{ cifra: '≈ 250°', texto: 'de caída antes de enfilarlo' }, { cifra: '1 vuelta', texto: 'la más rápida si lo has visto caer' }],
      nota: 'Al meter el timón a su banda, la popa (y la hélice) se aparta de la persona. Grita «¡hombre al agua!», lanza el aro y no la pierdas de vista.',
      alt: 'Derrota vista desde arriba: el barco mete todo el timón a la banda del náufrago, da una vuelta de unos 250° y se acerca a él por su proa.',
    };
  }
  return {
    tema: 'Seguridad', titulo: 'Hombre al agua: curva de Boutakow', clave: 'Todo a su banda; a 60°, todo a la otra: vuelves por tu estela.',
    datos: [{ cifra: '60°', texto: 'separado del rumbo inicial, cambias el timón' }, { cifra: '180°', texto: 'acabas al rumbo opuesto, sobre tu estela' }],
    nota: 'Es la maniobra de Williamson. Va bien de noche, con poca visibilidad o si no has visto caer a la persona: te devuelve por donde has pasado.',
    alt: 'Derrota vista desde arriba: el barco cae a una banda hasta separarse 60° de su rumbo, mete todo el timón a la otra y da la vuelta hasta el rumbo opuesto, sobre su propia estela, hasta el náufrago.',
  };
}

function estabilidad(spec) {
  const caso = spec.caso ?? 'estable';
  const t = { estable: 'Estabilidad: el barco adriza', inestable: 'Estabilidad: el barco vuelca', indiferente: 'Estabilidad: se queda escorado' }[caso] ?? 'Estabilidad transversal';
  return {
    tema: 'Estabilidad', titulo: t, clave: 'Si M está por encima de G, el barco adriza.',
    datos: [{ cifra: 'GM > 0', texto: 'estable: el par adriza' }, { cifra: 'GZ', texto: 'brazo adrizante: GM · sen(escora)' }, { cifra: 'peso arriba', texto: 'sube G, acorta GM y GZ' }],
    nota: 'Lo pesado, abajo y en crujía. Subir pesos (gente en la cabina alta, cosas en el palo) sube G; si G llega a M, el barco ya no adriza.',
    alt: 'Barco escorado visto desde popa con un peso que se sube, se baja o se traslada; debajo, el detalle ampliado de G, B y M con el brazo adrizante GZ y la altura metacéntrica GM acotada.',
  };
}

function marea(spec) {
  const m = spec.modo ?? 'curva';
  const { bm, pm } = MAREA_EJEMPLO;
  const amp = num(Math.round((pm.h - bm.h) * 10) / 10);
  const horas = (pm.hora - bm.hora) / 60;
  if (m === 'duodecimos') {
    return {
      tema: 'Mareas', titulo: 'La regla de los doceavos', clave: 'Cada hora sube 1, 2, 3, 3, 2 y 1 doceavos de la amplitud.',
      datos: [{ cifra: '1-2-3-3-2-1', texto: 'doceavos, hora a hora' }, { cifra: '6/12', texto: 'a las 3 horas: la mitad' }, { cifra: `${amp} m`, texto: 'amplitud del ejemplo' }],
      nota: 'Sirve para una marea semidiurna de unas 6 horas. La mitad de la subida ocurre en las dos horas centrales: ahí la corriente de marea es más fuerte.',
      alt: `Curva de la marea de la bajamar a la pleamar (${horas} horas, ${amp} m de amplitud), con seis franjas, una por hora: 1, 2, 3, 3, 2 y 1 doceavos. Debajo, el bajo en corte.`,
    };
  }
  if (m === 'sonda') {
    return {
      tema: 'Mareas', titulo: 'Sonda del momento y agua bajo la quilla', clave: 'Sonda de la carta + marea − calado = agua bajo la quilla.',
      datos: [{ cifra: '1,2 m', texto: 'sonda de la carta' }, { cifra: '1,8 m', texto: 'calado del barco' }, { cifra: 'cero', texto: 'hidrográfico: desde ahí se mide' }],
      nota: 'Las sondas de la carta se miden desde el cero hidrográfico, casi la bajamar más baja: con marea, casi siempre hay más agua que la de la carta.',
      alt: 'Arriba, la curva de la marea con la hora marcada; debajo, el bajo en corte con el cero hidrográfico, la sonda de la carta, la altura de la marea, el calado y el agua que queda bajo la quilla.',
    };
  }
  if (m === 'curva') {
    return {
      tema: 'Mareas', titulo: 'La curva de la marea', clave: 'Sube despacio, deprisa en las horas centrales y otra vez despacio.',
      datos: [{ cifra: `${amp} m`, texto: 'amplitud: pleamar menos bajamar' }, { cifra: `${horas} h`, texto: 'duración de la creciente' }],
      nota: 'Las horas del anuario vienen en tiempo universal: súmale el adelanto para tener la hora oficial.',
      alt: `Curva de la marea entre la bajamar (${num(bm.h)} m) y la pleamar (${num(pm.h)} m), con la hora marcada y su altura; debajo, el bajo en corte.`,
    };
  }
  if (m === 'fases') {
    return {
      tema: 'Mareas', titulo: 'Mareas vivas y mareas muertas', clave: 'Sol y Luna alineados, mareas vivas; en ángulo recto, muertas.',
      datos: [{ cifra: 'nueva y llena', texto: 'sicigias: mareas vivas, más amplitud' }, { cifra: 'cuartos', texto: 'cuadraturas: mareas muertas' }, { cifra: '≈ 15 días', texto: 'de unas vivas a las siguientes' }],
      nota: 'En mareas vivas sube más la pleamar y baja más la bajamar: hay más agua en la pleamar, menos en la bajamar y más corriente de marea.',
      alt: 'El Sol a la izquierda, la Tierra en el centro y la órbita de la Luna con sus cuatro fases: alineadas (nueva y llena) dan mareas vivas; en ángulo recto (cuartos), mareas muertas. Debajo, una curva de marea viva, más alta, y una de marea muerta, más baja.',
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Carta (PY, UT 3 y 4): nortes, rosa, abatimiento, corriente, enfilación, demoras y estima. Convenio del examen:
// E (+), W (−); Ct = dm + Δ; Rv = Ra + Ct; Rs = Rv + Ab (Ab + con el viento por babor); la corriente, hacia donde va.
const NAV = 'Navegación';

const nortes = () => ({
  tema: NAV, titulo: 'Corrección total: los tres nortes', clave: 'Ct = dm + Δ: lo que es E suma y lo que es W resta.',
  datos: [{ cifra: 'Ct = dm + Δ', texto: 'corrección total, cada una con su signo' }, { cifra: 'Rv = Ra + Ct', texto: 'de aguja a verdadero, se suma la Ct' }, { cifra: 'E + · W −', texto: 'el convenio de signos' }],
  nota: 'La declinación (dm) viene en la carta y cambia con los años; el desvío (Δ) sale de la tablilla y depende del rumbo de aguja. Si el norte de aguja queda al W del verdadero, la Ct es negativa.',
  alt: 'Los tres nortes salen de un mismo punto: el verdadero (Nv), el magnético (Nm), separado del verdadero por la declinación, y el de aguja (Na), separado del magnético por el desvío. Cada ángulo va acotado; en magenta, la corrección total, del verdadero al de aguja.',
});

function rosa(spec) {
  if (spec.rumbo != null && spec.demora != null) {
    return {
      tema: NAV, titulo: 'Rumbo, demora y marcación', clave: 'Rumbo y demora, desde el norte; la marcación, desde la proa.',
      datos: [{ cifra: '000°–359°', texto: 'rumbo y demora: desde el norte, en sentido horario' }, { cifra: '0°–180°', texto: 'marcación: por estribor o por babor' }, { cifra: 'Dv = Rv + M', texto: 'M positiva a estribor, negativa a babor' }],
      nota: 'La demora de un objeto no cambia al cambiar de rumbo; su marcación sí. Al caer a estribor, lo que ves por estribor se acerca a la proa y su marcación baja.',
      alt: 'Rosa graduada de 000° a 359° con el barco en el centro: la flecha del rumbo, la línea a trazos de la demora hasta el faro y, en magenta, el arco de la marcación, de la proa al faro.',
    };
  }
  if (spec.rumbo != null) {
    return {
      tema: NAV, titulo: 'El rumbo', clave: 'Del norte a la proa, en el sentido de las agujas del reloj.',
      datos: [{ cifra: '000°–359°', texto: 'siempre con tres cifras' }, { cifra: '090°', texto: 'proa al este; 180°, al sur; 270°, al oeste' }],
      nota: 'El rumbo se cuenta de 000° a 359° desde el norte; no hay rumbos negativos ni «a babor». Lo que va por bandas es la marcación.',
      alt: 'Rosa graduada de 000° a 359° con el barco en el centro y la flecha de su rumbo; en magenta, el arco que se mide desde el norte hasta la proa en el sentido de las agujas del reloj.',
    };
  }
  return {
    tema: NAV, titulo: 'La demora', clave: 'Del norte al objeto, en el sentido de las agujas del reloj.',
    datos: [{ cifra: '000°–359°', texto: 'siempre con tres cifras' }, { cifra: 'Dv ± 180°', texto: 'la opuesta: la que se traza desde el objeto' }],
    nota: 'La demora no depende de hacia dónde apunte tu proa: si cambias de rumbo, el faro sigue en la misma demora.',
    alt: 'Rosa graduada de 000° a 359° con el observador en el centro y una línea a trazos hasta el faro; en magenta, el arco que se mide desde el norte hasta el faro en el sentido de las agujas del reloj.',
  };
}

function abatimiento(spec) {
  const br = spec.banda !== 'estribor';
  return {
    tema: NAV, titulo: `Abatimiento: viento por ${br ? 'babor' : 'estribor'}`, clave: `Rs = Rv + Ab, con el Ab ${br ? 'positivo' : 'negativo'}: el viento entra por ${br ? 'babor' : 'estribor'}.`,
    datos: [{ cifra: 'Rs = Rv + Ab', texto: 'rumbo de superficie' }, { cifra: 'Ab +', texto: 'viento por babor: abate a estribor' }, { cifra: 'Ab −', texto: 'viento por estribor: abate a babor' }],
    nota: 'El viento empuja el barco a sotavento, al lado contrario al que entra. En el problema inverso (qué rumbo dar) la proa se mete hacia el viento: Rv = Rs − Ab.',
    alt: `El barco en la carta, con la proa (Rv, a trazos) y, separado por el ángulo acotado del abatimiento, el rumbo de superficie (Rs); tres flechas de viento le entran por ${br ? 'babor' : 'estribor'}.`,
  };
}

function corriente(spec) {
  const inversa = spec.caso === 'rumbo-a-dar';
  const datos = [{ cifra: 'Rc', texto: 'la corriente: hacia dónde va el agua' }, { cifra: 'Ihc', texto: 'su intensidad, en nudos' }];
  const nota = 'La corriente se nombra por hacia dónde va, al revés que el viento, que se nombra por de dónde viene. En la carta se dibuja el efectivo: es por donde pasa de verdad el barco.';
  if (inversa) {
    return {
      tema: NAV, titulo: 'Corriente: rumbo a dar para llegar', clave: 'Primero la corriente; desde su extremo, la velocidad del barco corta la línea al destino.',
      datos: [...datos, { cifra: 'Rs', texto: 'el rumbo a dar sale hacia el lado de donde viene la corriente' }], nota,
      alt: 'Construcción en la carta: desde la salida, el vector de la corriente (tres puntas); con centro en su extremo, un arco de radio la velocidad del barco corta la línea al destino; esa dirección es el rumbo de superficie, y de la salida al corte, el efectivo en magenta.',
    };
  }
  return {
    tema: NAV, titulo: 'Corriente: rumbo y velocidad efectivos', clave: 'El efectivo es la suma del vector del barco y el de la corriente.',
    datos: [...datos, { cifra: 'Ref · Vef', texto: 'rumbo y velocidad sobre el fondo' }], nota,
    alt: 'Triángulo de velocidades en la carta, una hora de navegación: el rumbo de superficie del barco (una punta), a continuación la corriente (tres puntas) y, en magenta, el rumbo efectivo de la salida al final (dos puntas).',
  };
}

const enfilacion = () => ({
  tema: NAV, titulo: 'Enfilación y corrección total', clave: 'Ct = Dv − Da: la demora de la carta menos la de la aguja.',
  datos: [{ cifra: 'Dv', texto: 'la de la enfilación, medida en la carta' }, { cifra: 'Da', texto: 'con la aguja, al verlas enfiladas' }, { cifra: 'Δ = Ct − dm', texto: 'y de ahí, el desvío' }],
  nota: 'Una enfilación da una demora verdadera exacta sin calcular nada: por eso sirve para hallar la corrección total. Si la Da es mayor que la Dv, la Ct es negativa.',
  alt: 'A la izquierda, dos faros en la costa vistos uno detrás de otro y el barco sobre su enfilación, con la demora verdadera acotada desde el norte. A la derecha, el norte verdadero y el de aguja separados por la corrección total, y la cuenta Ct = Dv − Da.',
});

function demoras(spec) {
  if (spec.modo === 'traslado') {
    return {
      tema: NAV, titulo: spec.linea === 'segunda' ? 'Demoras no simultáneas: trasladar la segunda' : 'Demoras no simultáneas: el traslado', clave: 'Se traslada la primera lo navegado; el corte es la situación a la hora de la segunda.',
      datos: [{ cifra: '1.ª', texto: 'la línea que viaja contigo' }, { cifra: 'rumbo y millas', texto: 'lo navegado entre las dos' }, { cifra: '2.ª hora', texto: 'la hora de la situación' }],
      nota: 'El traslado es lo navegado de verdad: el Rv sin viento, el Rs con viento y el efectivo con corriente. Si trasladas la segunda hacia atrás, el corte sale bien, pero es la situación de la primera hora.',
      alt: 'Dos faros con sus líneas de demora; la primera se traslada paralela a sí misma el rumbo y la distancia navegados (flecha magenta acotada) y su corte con la segunda, en magenta, es la situación.',
    };
  }
  return {
    tema: NAV, titulo: 'Situación por dos demoras simultáneas', clave: 'Cada demora se traza desde su faro con la opuesta; el barco está en el corte.',
    datos: [{ cifra: 'Dv = Da + Ct', texto: 'cada demora, pasada a verdadera' }, { cifra: 'Dv ± 180°', texto: 'lo que se traza desde el faro' }, { cifra: '≈ 90°', texto: 'el mejor corte: casi perpendiculares' }],
    nota: 'Toma las dos demoras a la vez y pásalas a verdaderas con la Ct del rumbo que llevas. Si las líneas se cortan muy agudas, un error pequeño en una demora mueve mucho la situación.',
    alt: 'Costa con dos faros, A y B; desde cada uno sale su línea de demora hacia la mar (una continua y otra a trazos) y su corte, en magenta, es la situación del barco.',
  };
}

function loxodromica(spec) {
  const datos = [{ cifra: 'Δl = D · cos R', texto: 'minutos de latitud (= millas)' }, { cifra: 'A = D · sen R', texto: 'apartamiento, en millas' }, { cifra: 'ΔL = A / cos lm', texto: 'minutos de longitud' }];
  const nota = 'Una milla es un minuto de latitud, pero no de longitud: los meridianos se juntan hacia los polos. Por eso el apartamiento se divide por el coseno de la latitud media.';
  if (spec.modo === 'triangulo') {
    return {
      tema: NAV, titulo: 'Estima: del apartamiento a la longitud', clave: 'Cuanto más lejos del ecuador, más minutos de longitud por cada milla.', datos, nota,
      alt: 'Triángulo de estima con sus catetos acotados (diferencia de latitud y apartamiento) y la distancia y el rumbo en magenta; debajo, dos barras a la misma escala comparan el apartamiento en millas con la diferencia de longitud en minutos.',
    };
  }
  return {
    tema: NAV, titulo: 'Estima loxodrómica: el triángulo', clave: 'Δl = D · cos R y A = D · sen R; luego, ΔL = A / cos lm.', datos, nota,
    alt: 'Triángulo rectángulo de estima: de la salida a la llegada, la distancia D al rumbo R (en magenta); el cateto norte-sur es la diferencia de latitud y el este-oeste, el apartamiento; al lado, ΔL = A / cos lm.',
  };
}

const tangenteViento = (spec) => ({
  tema: NAV, titulo: spec.banda === 'estribor' ? 'Rumbo para pasar a una distancia, con viento, dejándolo por estribor' : 'Rumbo para pasar a una distancia, con viento', clave: 'La tangente es el Rs; la proa se mete hacia el viento: Rv = Rs − Ab.',
  datos: [{ cifra: 'sen α = d / D', texto: 'α: de la visual al faro a la tangente' }, { cifra: 'Rs = Dv ± α', texto: '+ si dejas el faro por babor' }, { cifra: 'Ra = Rv − Ct', texto: 'y al final, a la aguja' }],
  nota: 'Primero la derrota sobre el agua (la tangente, Rs); después el viento (Rv) y al final la aguja (Ra). Si tomas la tangente como proa, el viento te saca de ella y no pasas a la distancia que querías.',
  alt: 'Desde la situación, la visual al faro y la tangente a la circunferencia de la distancia de paso, con el ángulo α acotado; la tangente es el rumbo de superficie y, en magenta y a trazos, la proa metida hacia el viento con el abatimiento acotado. Debajo, la cuenta en cinco pasos.',
});

const travesDerrota = (spec) => ({
  tema: NAV, titulo: spec.banda === 'estribor' ? 'Faro por el través de estribor y derrota' : 'Faro por el través y derrota', clave: 'El través se mide con la proa (Rv ± 90°) y se corta con la derrota (Rs).',
  datos: [{ cifra: 'Rv ± 90°', texto: 'el través: + estribor, − babor' }, { cifra: 'Dv + 180°', texto: 'lo que se traza desde el faro' }, { cifra: 'Rs', texto: 'la derrota con la que se corta' }],
  nota: 'Con viento, la proa y la derrota no coinciden. El través es perpendicular a la proa; hacerlo con el Rs da un punto muy cercano, pero erróneo.',
  alt: 'La derrota (Rs) desde la salida; del faro sale la línea del través, perpendicular a la proa (Rv, a trazos, con su ángulo recto), y su corte con la derrota es la situación, en magenta. Apagada, la trampa: el través trazado con el Rs. Debajo, la cuenta.',
});

const corrienteDesconocida = () => ({
  tema: NAV, titulo: 'Corriente desconocida: de la estima a la observada', clave: 'La corriente va de la situación estimada a la observada, a la misma hora.',
  datos: [{ cifra: 'Se → So', texto: 'el rumbo de la corriente (Rc)' }, { cifra: 'Ihc = d / t', texto: 'millas entre las dos, entre las horas' }, { cifra: '2 nudos', texto: 'en el ejemplo: 3,0 millas en 1,5 h' }],
  nota: 'La estima se hace sin corriente (rumbo y velocidad, con el viento si lo hay). La diferencia con la situación observada es lo que ha hecho la corriente desde la última situación fiable.',
  alt: 'Carta del Estrecho: de la salida de las 10:00, la estima (Rv 100°, 9 millas) hasta la situación estimada de las 11:30; las demoras de Punta Paloma y Punta Cires dan la observada; la corriente, en magenta, va de la estimada a la observada. Debajo, la resolución.',
});

const loxoOrto = () => ({
  tema: NAV, titulo: 'Loxodrómica y ortodrómica', clave: 'La loxodrómica mantiene el rumbo; la ortodrómica es la más corta.',
  datos: [{ cifra: 'α constante', texto: 'loxodrómica: el mismo rumbo con cada meridiano' }, { cifra: 'recta', texto: 'la loxodrómica, en la Mercator' }, { cifra: 'círculo máximo', texto: 'ortodrómica: la distancia más corta' }],
  nota: 'En costa y en el examen se navega por loxodrómica: en distancias cortas la diferencia con la ortodrómica es despreciable. En las travesías oceánicas la ortodrómica se sigue por tramos loxodrómicos.',
  alt: 'La misma travesía en el globo y en la carta Mercator: la loxodrómica, en magenta y continua, corta todos los meridianos con el mismo ángulo α y en la Mercator es una recta; la ortodrómica, a trazos, sale curvada hacia el polo.',
});

// ---------------------------------------------------------------------------
// Viento aparente (PER, UT 9; PY, UT 2): la suma del real y del de avance.
const VA = {
  general: ['Viento aparente: real más de avance', 'A bordo se nota la suma del viento real y del de avance.'],
  cenida: ['Viento aparente ciñendo', 'Ciñendo, el aparente es más fuerte que el real y entra más a proa.'],
  traves: ['Viento aparente con el real de través', 'Con el real de través, el aparente entra por delante del través, algo más fuerte.'],
  aleta: ['Viento aparente con el real por la aleta', 'Por la aleta, el aparente es más flojo que el real y entra más a proa.'],
  popa: ['Viento aparente en popa', 'En popa, el aparente es el real menos tu velocidad.'],
};
function vientoAparenteMarco(spec) {
  const v = VA[spec.rumbo ?? 'general'];
  if (!v) return null;
  return {
    tema: MET, titulo: v[0], clave: v[1],
    datos: [{ cifra: 'de avance', texto: 'igual y contrario a tu velocidad: de proa' }, { cifra: 'aparente', texto: 'el que marcan la veleta y el anemómetro' }, { cifra: 'más a proa', texto: 'que el real, salvo en popa cerrada' }],
    nota: 'Las velas se ajustan al aparente. Cuanto más rápido vas, más se cierra hacia la proa; en popa, a tu misma velocidad, no notarías viento.',
    alt: 'A la izquierda, el barco visto desde arriba con las direcciones por las que entran el viento real y el aparente, cada una con su ángulo desde la proa acotado; a la derecha, la suma de vectores: real más de avance igual a aparente, con sus nudos.',
  };
}

// ---------------------------------------------------------------------------
// Seguridad (PY, UT 1): movimientos del barco, patrones de búsqueda y fuego.
const SEG = 'Seguridad';
const NOTA_MOV = 'Balance, cabezada y guiñada son giros alrededor de los tres ejes del barco. Si el periodo de las olas coincide con el del barco, el movimiento se amplifica (sincronismo): cambia de rumbo o de velocidad.';
const MOVS = {
  balance: { titulo: 'Balance', clave: 'El barco se escora a una y otra banda: sobre todo con mar de través.', datos: [{ cifra: 'proa-popa', texto: 'el eje alrededor del que gira' }, { cifra: 'de través', texto: 'la mar que más lo provoca' }], alt: 'Barco visto de proa sobre el agua, escorado a una banda; a trazos, sus dos posiciones extremas y, en magenta, el vaivén alrededor del eje proa-popa.' },
  cabezada: { titulo: 'Cabezada', clave: 'Proa y popa suben y bajan: con mar de proa o de popa.', datos: [{ cifra: 'babor-estribor', texto: 'el eje alrededor del que gira' }, { cifra: 'de proa', texto: 'o de popa: la mar que la provoca' }], alt: 'Barco visto de costado sobre el agua; a trazos, la proa arriba y la popa abajo y al revés; en magenta, el vaivén alrededor del eje de babor a estribor.' },
  guinada: { titulo: 'Guiñada', clave: 'La proa se va a uno y otro lado del rumbo: típica con mar de popa o de aleta.', datos: [{ cifra: 'vertical', texto: 'el eje alrededor del que gira' }, { cifra: 'de popa', texto: 'o de aleta: la mar que la provoca' }], alt: 'Barco visto desde arriba sobre la línea de su rumbo; a trazos, la proa desviada a una y otra banda y, en magenta, el vaivén alrededor del eje vertical.' },
};
const movimiento = (spec) => { const m = MOVS[spec.mov] ?? MOVS.balance; return { tema: SEG, ...m, nota: NOTA_MOV }; };

function busqueda(spec) {
  if (spec.patron === 'sectores') {
    return {
      tema: SEG, titulo: 'Búsqueda por sectores', clave: 'Tramos radiales que pasan por el datum, con giros de 120° a estribor.',
      datos: [{ cifra: '120°', texto: 'cada giro, a estribor' }, { cifra: 'R', texto: 'el radio: igual en cada tramo' }, { cifra: '3 triángulos', texto: 'barren el círculo' }],
      nota: 'Es la mejor cuando el objeto está cerca del datum: se pasa por él muchas veces. Si no aparece, se repite con el patrón girado unos 30°.',
      alt: 'Búsqueda por sectores vista desde arriba: desde el datum, en magenta, tramos radiales de radio R con giros de 120° a estribor (acotado en el primer vértice) que forman tres triángulos dentro del círculo.',
    };
  }
  return {
    tema: SEG, titulo: 'Búsqueda en cuadrado expansivo', clave: 'Desde el datum, giros de 90° a estribor y tramos que crecen cada dos.',
    datos: [{ cifra: 'S, S, 2S, 2S…', texto: 'la longitud de los tramos' }, { cifra: '90°', texto: 'cada giro, a estribor' }, { cifra: 'datum', texto: 'la posición más probable' }],
    nota: 'Sirve cuando se conoce bastante bien la posición del objeto y el área es pequeña. La separación S depende de la visibilidad y de lo que se busca.',
    alt: 'Búsqueda en cuadrado expansivo vista desde arriba: desde el datum, en magenta, la derrota en espiral cuadrada con giros de 90° a estribor y tramos acotados que crecen cada dos (S, 2S, 3S, 4S).',
  };
}

function fuego(spec) {
  if (spec.modo) return null; // «apagar» es la lámina interactiva del PER, aún sin migrar
  if (spec.vista === 'clases') {
    return {
      tema: SEG, titulo: 'Clases de fuego', clave: 'A sólidos, B líquidos, C gases, D metales y F aceites de cocina.',
      datos: [{ cifra: 'ABC', texto: 'polvo polivalente: el extintor habitual a bordo' }, { cifra: 'agua', texto: 'solo en la A: nunca en líquidos ni con tensión' }, { cifra: 'E', texto: 'ya no es una clase' }],
      nota: 'Cada clase pide su agente. El agua a chorro esparce los líquidos inflamables y conduce la electricidad; en un fuego eléctrico, corta antes la corriente.',
      alt: 'Las cinco clases de fuego en una lista: A, sólidos como madera, tela o papel; B, líquidos como combustible o pintura; C, gases como butano o propano; D, metales; F, aceites de cocina. Debajo, que la E ya no es una clase.',
    };
  }
  return {
    tema: SEG, titulo: 'Tetraedro del fuego', clave: 'Si falta uno de los cuatro, el fuego se apaga.',
    datos: [{ cifra: 'enfriar', texto: 'quita el calor (agua)' }, { cifra: 'sofocar', texto: 'quita el oxígeno (CO₂, manta)' }, { cifra: 'inhibir', texto: 'corta la reacción (polvo)' }],
    nota: 'Quitar el combustible (cerrar el paso del gas o del combustible) también lo apaga. Para elegir el agente, mira la clase de fuego.',
    alt: 'Un tetraedro con sus caras y cuatro cartelas: combustible (se retira), oxígeno (se sofoca), calor (se enfría) y reacción en cadena (se inhibe).',
  };
}

// ---------------------------------------------------------------------------
// Señales: banderas del Código Internacional y señales acústicas (RIPA, reglas 32 a 35)

const SEN = 'Señales';
const BANDERAS = {
  A: ['Bandera A (Alfa)', 'Alfa: tengo un buzo sumergido; manténgase alejado y a poca velocidad.', 'cola de golondrina: el corte en V del batiente',
    'Blanca junto al asta y azul con cola de golondrina. No es la de buceo recreativo (roja con diagonal blanca): las dos piden lo mismo, apartarse y moderar la velocidad.'],
  buceo: ['Bandera de buceo', 'Roja con una diagonal blanca: hay buceadores en inmersión.', 'roja con una franja diagonal blanca',
    'Es la señal tradicional de buceo recreativo, la de la norma anterior. En España, desde el RD 550/2020, la señal de buceo es la bandera Alfa del Código Internacional, con un resguardo mínimo de 50 m. Con cualquiera de las dos, apártate y navega despacio.'],
  O: ['Bandera O (Oscar)', 'Oscar: ¡hombre al agua!', 'roja y amarilla, partida en diagonal',
    'Roja la mitad de arriba, hacia el batiente, y amarilla la de abajo, junto al asta. Se iza para que los demás sepan que hay alguien en el agua.'],
  N: ['Bandera N (November)', 'November: no (negativo).', 'damero azul y blanco de cuatro por cuatro',
    'Izada encima de la C forma NC, una señal de peligro del Anexo IV del RIPA. Para recordarla: N de «no», a cuadros como un tablero.'],
  C: ['Bandera C (Charlie)', 'Charlie: sí (afirmativo).', 'franjas azul, blanca, roja, blanca y azul',
    'Debajo de la N forma NC, señal de peligro. C de «confirmo»: sí.'],
  B: ['Bandera B (Bravo)', 'Bravo: cargo, descargo o transporto mercancías peligrosas.', 'toda roja, con cola de golondrina',
    'Roja como el fuego: lleva mercancías peligrosas. Se ve en los barcos que cargan combustible.'],
  H: ['Bandera H (Hotel)', 'Hotel: tengo práctico a bordo.', 'blanca junto al asta y roja al batiente',
    'Mitad blanca y mitad roja, en vertical. El práctico ya está a bordo; no confundir con la que lo pide.'],
  U: ['Bandera U (Uniform)', 'Uniform: se dirige usted hacia un peligro.', 'cuatro cuarteles rojos y blancos',
    'Rojo arriba junto al asta y abajo al batiente. Es un aviso al otro barco: va hacia un bajo, una piedra u otro peligro.'],
  V: ['Bandera V (Victor)', 'Victor: necesito asistencia.', 'blanca con un aspa roja',
    'Pide ayuda, pero no es una señal de peligro del Anexo IV. La W pide asistencia médica.'],
  W: ['Bandera W (Whiskey)', 'Whiskey: necesito asistencia médica.', 'azul, recuadro blanco y centro rojo',
    'Tres recuadros, uno dentro de otro, como una diana. V pide ayuda; W, ayuda médica.'],
};

function bandera(spec) {
  const b = BANDERAS[spec.codigo];
  const c = BANDERA_C[spec.codigo];
  if (!b || !c) return null;
  const [titulo, clave, como, nota] = b;
  return {
    tema: SEN, titulo, clave,
    datos: [{ cifra: c.letra ?? 'roja', texto: c.letra ? `${c.fonetica.toLowerCase().replace(/^./, (x) => x.toUpperCase())}, del Código Internacional de Señales: ${como}` : `${como}; no es una letra del Código Internacional` }],
    nota, alt: `${titulo}, izada en su asta. ${c.forma} Significa: ${FLAGS[spec.codigo].nota}`,
  };
}

// [título, frase clave, datos, nota]
const SONIDOS = {
  '.': ['Una pitada corta', 'Una corta: caigo a estribor.', [['≈ 1 s', 'dura la pitada corta'], ['regla 34', 'maniobra, entre buques que se ven']],
    'Solo vale entre buques que se ven. Se puede reforzar con un destello de luz blanca por cada pitada.'],
  '..': ['Dos pitadas cortas', 'Dos cortas: caigo a babor.', [['≈ 1 s', 'cada pitada corta'], ['regla 34', 'maniobra, entre buques que se ven']],
    'Una, estribor; dos, babor; tres, atrás: se aprenden juntas y en ese orden.'],
  '...': ['Tres pitadas cortas', 'Tres cortas: estoy dando atrás.', [['≈ 1 s', 'cada pitada corta'], ['regla 34', 'maniobra, entre buques que se ven']],
    'Dando atrás es la máquina, aunque el barco todavía avance por su arrancada.'],
  '.....': ['Cinco pitadas cortas o más', 'Cinco o más cortas y rápidas: no entiendo sus intenciones o dudo de su maniobra.', [['≥ 5', 'pitadas cortas y rápidas'], ['regla 34 d', 'señal de duda']],
    'Es la señal de duda: se puede completar con al menos cinco destellos cortos y rápidos.'],
  '-': ['Una pitada larga', 'Una larga: me acerco a un recodo; en niebla, buque de motor con arrancada.', [['4–6 s', 'dura la pitada larga'], ['≤ 2 min', 'entre señales, en niebla']],
    'En el recodo, quien la oye al otro lado contesta con otra larga.'],
  '--': ['Dos pitadas largas', 'Dos largas cada 2 minutos: buque de motor parado, sin arrancada, en niebla.', [['≈ 2 s', 'entre las dos largas'], ['≤ 2 min', 'entre señales']],
    'Una larga, motor que avanza; dos largas, motor parado. Las dos solo en visibilidad reducida.'],
  '-..': ['Una larga y dos cortas', 'Una larga y dos cortas cada 2 minutos: buque que no puede apartarse con facilidad, en niebla.', [['≤ 2 min', 'entre señales'], ['regla 35 c', 'visibilidad reducida']],
    'La dan el buque sin gobierno, el de maniobra restringida, el restringido por su calado, el de vela, el que pesca y el que remolca o empuja.'],
  '--.': ['Dos largas y una corta', 'Dos largas y una corta: en un canal angosto, quiero alcanzarle por su estribor.', [['regla 34 c', 'canal o paso angosto'], ['1 corta', 'estribor, como al caer']],
    'Las cortas del final dicen la banda: una corta, estribor; dos cortas, babor.'],
  '--..': ['Dos largas y dos cortas', 'Dos largas y dos cortas: en un canal angosto, quiero alcanzarle por su babor.', [['regla 34 c', 'canal o paso angosto'], ['2 cortas', 'babor, como al caer']],
    'Las cortas del final dicen la banda: una corta, estribor; dos cortas, babor.'],
  '-.-.': ['Larga, corta, larga y corta', 'Larga, corta, larga, corta: el buque alcanzado está conforme.', [['regla 34 c', 'canal o paso angosto'], ['4', 'pitadas alternas']],
    'Si no está conforme, contesta con la señal de duda: cinco o más cortas y rápidas.'],
  '-...': ['Una larga y tres cortas', 'Una larga y tres cortas: el buque remolcado, en niebla, justo después del remolcador.', [['≤ 2 min', 'entre señales'], ['regla 35 e', 'el último del tren, si va tripulado']],
    'El remolcador da una larga y dos cortas; el remolcado contesta enseguida con una larga y tres cortas.'],
  '.-.': ['Corta, larga y corta', 'Corta, larga, corta: buque fondeado que avisa de su posición a quien se acerca.', [['regla 35 g', 'fondeado'], ['además', 'de la campana']],
    'Es opcional y se suma a la campana: advierte del riesgo de abordaje a un buque que se aproxima.'],
  '....': ['Cuatro pitadas cortas', 'Cuatro cortas: la embarcación del práctico se identifica.', [['regla 35 k', 'práctico en servicio'], ['además', 'de su señal de niebla']],
    'Cuatro cortas, la H del Morse: H de Hotel, la bandera de «tengo práctico a bordo».'],
  campana: ['Repique de campana', 'Repique rápido de unos 5 segundos cada minuto: buque fondeado en niebla.', [['≈ 5 s', 'de repique'], ['≤ 1 min', 'entre repiques']],
    'Se da a proa. Los menores de 20 m no están obligados a la campana, pero deben hacer otra señal eficaz como mucho cada 2 minutos.'],
  'campana-gong': ['Campana a proa y gong a popa', 'Campana a proa y, enseguida, gong a popa cada minuto: fondeado de 100 m o más en niebla.', [['≥ 100 m', 'de eslora'], ['≤ 1 min', 'entre señales']],
    'El gong solo lo llevan los de 100 m o más; con él se sabe que el fondeado es grande.'],
  varado: ['Golpes y repique de campana', 'Tres golpes, repique y tres golpes: buque varado en niebla.', [['3 + 3', 'golpes claros y separados'], ['≤ 1 min', 'entre señales']],
    'Es la campana del fondeado con tres golpes antes y tres después. Con 100 m o más, además el gong.'],
};

function sonido(spec) {
  const x = SONIDOS[spec.senal ?? '.'];
  if (!x || !SENALES[spec.senal ?? '.']) return null;
  const [titulo, clave, datos, nota] = x;
  const campana = !!SECUENCIA_SONIDO[spec.senal];
  return {
    tema: RIPA, titulo: spec.texto ? spec.texto.split(':')[0] : titulo, clave,
    datos: datos.map(([cifra, texto]) => ({ cifra, texto })), nota,
    alt: `Cronograma de una señal ${campana ? 'de campana' : 'de pito'}: ${patronSonido(spec.senal ?? '.')}. ${SENALES[spec.senal ?? '.']}`,
  };
}

const MARCOS = {
  cardinales, boya, canal, bifurcacion, 'sectores-luces': sectoresLuces, cruce, barco, meteo, helice, 'helice-timon': heliceTimon, 'hombre-al-agua': hombreAlAgua, estabilidad, marea,
  nortes, rosa, abatimiento, corriente, enfilacion, demoras, loxodromica,
  'tangente-viento': tangenteViento, 'traves-derrota': travesDerrota, 'corriente-desconocida': corrienteDesconocida, 'loxo-orto': loxoOrto,
  movimiento, busqueda, fuego, 'viento-aparente': vientoAparenteMarco, bandera, sonido,
};

/** Marco de una spec, o null si su lámina aún no está migrada al estilo C. */
export function marcoDe(spec) {
  const f = spec && MARCOS[spec.tipo];
  if (!f) return null;
  try { return f(spec) ?? null; } catch { return null; }
}
