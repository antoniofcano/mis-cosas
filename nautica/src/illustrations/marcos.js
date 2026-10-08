// Marco de cada lámina en estilo C (docs/ESTILO-LAMINAS.md): los textos que la acompañan en el HTML, escritos a mano.
//   { tema, titulo, clave, nota, datos: [{ cifra, texto }], alt }
//   tema   → eyebrow («Lámina · Balizamiento»)          titulo → nombre de la lámina (galería, ficha, clase)
//   clave  → la regla en una frase                       nota   → lo que conviene recordar
//   datos  → cifras en recuadros (cifra grande + qué es)  alt    → texto alternativo útil de la figura
// Una lámina sin marco se ve como antes (la migración es gradual). Sin DOM.

import { BUOYS } from './buoys.js';
import { caidaPopa } from '../nautical/helice.js';
import { MAREA_EJEMPLO } from './interactivas/marea.js';

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
  return null;
}

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
  return null;
}

const MARCOS = {
  cardinales, boya, canal, bifurcacion, 'sectores-luces': sectoresLuces, cruce, barco, meteo, helice, 'helice-timon': heliceTimon, 'hombre-al-agua': hombreAlAgua, estabilidad, marea,
};

/** Marco de una spec, o null si su lámina aún no está migrada al estilo C. */
export function marcoDe(spec) {
  const f = spec && MARCOS[spec.tipo];
  if (!f) return null;
  try { return f(spec) ?? null; } catch { return null; }
}
