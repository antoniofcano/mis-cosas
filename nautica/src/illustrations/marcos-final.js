// Marcos de las láminas de lección del PER rehechas en estilo C en el cierre del PER (per-final-c.js y per-final-b-c.js).
// Mismo formato que marcos.js; el texto alternativo es el del dibujo. Fuente de cada hecho, en el apéndice de
// docs/ESTILO-LAMINAS.md.

import { altDe, porVista } from './marcos-cierre-b.js';
import { cubiertaC, timonC, muertoBoyaC, nudosC, tenederoC, fondeoGiraC, gobiernoRabeoC, atraqueC } from './per-final-c.js';
import { revisionSalidaC, reflectorTormentaC, varadaAbordajeC, achiqueSentinaC, barometroTendenciaC, marCreceC, previsionSalidaC } from './per-final-b-c.js';

const CASCO = 'El barco';
const MAN = 'Maniobra';
const SEG = 'Seguridad';
const EMER = 'Emergencias';
const MET = 'Meteorología';

/** Marco de una lámina sin vistas. */
const fijo = (fn, tema, m) => (spec) => {
  const r = fn(spec);
  return r ? { tema, ...m, alt: altDe(r) } : null;
};

const cubierta = fijo(cubiertaC, CASCO, {
  titulo: 'En cubierta: luz, aire y agua', clave: 'La lumbrera da luz y aire; el manguerote, solo aire; por el imbornal sale el agua.',
  datos: [{ cifra: 'lumbrera', texto: 'tapa acristalada: luz y aire' }, { cifra: 'manguerote', texto: 'solo ventila' }, { cifra: 'imbornal', texto: 'el agua de cubierta, al mar' }],
  nota: 'Los candeleros son los postes; los guardamancebos, los cables que van de uno a otro alrededor de la cubierta para que nadie caiga al agua. Portillos y tragaluces dan luz; los portillos practicables, también aire.',
});

const timonVistas = porVista(timonC, CASCO, {
  partes: {
    titulo: 'Partes del timón', clave: 'La pala desvía el agua; la mecha es su eje y entra en el casco por la limera.',
    datos: [{ cifra: 'pala', texto: 'o azafrán: desvía el agua' }, { cifra: 'mecha', texto: 'el eje de la pala' }, { cifra: 'limera', texto: 'paso de la mecha, estanco' }],
    nota: 'Se gobierna con caña, unida a la cabeza de la mecha, o con rueda, que la mueve con los guardines (cables o cadenas) o con un sistema hidráulico. La limera es uno de los puntos por los que puede entrar agua.',
  },
  cana: {
    titulo: 'Caña o rueda: hacia dónde cae la proa', clave: 'Con caña, la proa cae al lado contrario; con rueda, al mismo, como un coche.',
    datos: [],
    nota: '«Meter el timón a estribor» habla de la pala o de la rueda: la proa cae a estribor. Dando atrás, con poca arrancada, manda más la hélice que el timón.',
  },
  tipos: {
    titulo: 'Tipos de timón según la pala', clave: 'Compensado: parte de la pala va a proa de la mecha y cuesta menos girarla.',
    datos: [{ cifra: 'ordinario', texto: 'toda la pala a popa' }, { cifra: 'compensado', texto: 'parte a proa de la mecha' }, { cifra: 'suspendido', texto: 'cuelga solo de la mecha' }],
    nota: 'El semicompensado solo está compensado en la parte baja. El suspendido, sin apoyo del casco por abajo, es el habitual en los veleros modernos.',
  },
}, 'vista', 'partes');
/** La vista de la caña cambia con la banda: su título y sus cifras la dicen. */
const timon = (spec) => {
  const m = timonVistas(spec);
  if (!m || spec.vista !== 'cana') return m;
  const [cana, cae] = spec.cana === 'estribor' ? ['estribor', 'babor'] : ['babor', 'estribor'];
  return { ...m, titulo: `Caña a ${cana}: la proa cae a ${cae}`, datos: [{ cifra: `caña a ${cana}`, texto: `pala y proa a ${cae}` }, { cifra: `rueda a ${cae}`, texto: `proa a ${cae}` }, { cifra: 'avante', texto: 'con arrancada avante' }] };
};

const muertoBoya = fijo(muertoBoyaC, MAN, {
  titulo: 'Amarrado a una boya: muerto y cabo', clave: 'El muerto sujeta la boya al fondo; a la boya te amarras tú.',
  datos: [{ cifra: 'muerto', texto: 'hormigón o hierro en el fondo' }, { cifra: 'gaza', texto: 'el ojo del extremo' }, { cifra: 'chicote', texto: 'el extremo libre' }],
  nota: 'En un cabo, el firme es la parte que trabaja, el seno la curva que forma al doblarlo y el chicote cada extremo. La gaza se hace con un nudo (as de guía) o con una costura.',
});

const NUDO = {
  llano: { titulo: 'Nudo llano', clave: 'Une dos cabos de la misma mena por sus chicotes.', datos: [{ cifra: 'unir', texto: 'dos cabos iguales' }, { cifra: 'rizo', texto: 'su otro nombre' }], nota: 'Con tensión aguanta y sin ella se deshace con facilidad. No sirve para cabos de distinta mena o material.' },
  rezon: { titulo: 'Vuelta de rezón', clave: 'Para amarrar a una argolla: dos vueltas y un remate que no se afloja.', datos: [{ cifra: 'argolla', texto: 'o anillo' }, { cifra: '2 vueltas', texto: 'y remate con el chicote' }], nota: 'Muy segura y no se afloja con los tirones: para una defensa colgada mucho tiempo.' },
  ballestrinque: { titulo: 'Ballestrinque', clave: 'A un palo o candelero, en un momento; con tirones puede correrse.', datos: [{ cifra: '2 vueltas', texto: 'cruzadas alrededor del palo' }, { cifra: 'rápido', texto: 'para poco tiempo' }], nota: 'Se hace y se deshace muy rápido, pero con tirones laterales o intermitentes se corre: para colgar una defensa un rato.' },
  'as-de-guia': { titulo: 'As de guía', clave: 'Una gaza fija que ni corre ni se aprieta, y se deshace fácil.', datos: [{ cifra: 'gaza fija', texto: 'no corre ni se aprieta' }, { cifra: 'noray', texto: 'para encapillar una amarra' }], nota: 'También para afirmar escotas o rodear a una persona por el pecho e izarla a bordo: la gaza no la estrangula.' },
};
const nudos = (spec) => {
  const r = nudosC(spec);
  if (!r) return null;
  const v = NUDO[spec.nudo] ?? {
    titulo: 'Los cuatro nudos del PER', clave: 'Llano para unir, rezón a una argolla, ballestrinque a un palo y as de guía para una gaza fija.',
    datos: [{ cifra: 'llano', texto: 'unir dos cabos' }, { cifra: 'rezón', texto: 'a una argolla' }, { cifra: 'as de guía', texto: 'gaza fija' }],
    nota: 'El temario pide saber para qué se emplea cada uno. El ballestrinque es el más rápido de hacer, pero el que peor aguanta los tirones.',
  };
  return { tema: MAN, ...v, alt: altDe(r) };
};

const tenedero = porVista(tenederoC, MAN, {
  elegir: {
    titulo: 'Qué miras antes de fondear', clave: 'Ningún factor decide solo: abrigo, profundidad, fondo, corriente, espacio y la carta.',
    datos: [{ cifra: '6', texto: 'factores a la vez' }, { cifra: 'bajamar', texto: 'el agua que habrá' }, { cifra: 'borneo', texto: 'espacio para girar' }],
    nota: 'Fondeadero es el lugar; tenedero, la calidad del fondo para que el ancla agarre. Mira en la carta y el derrotero si hay fondeo prohibido, cables o canales, y si el viento puede rolar y dejarte sin abrigo.',
  },
  fondos: {
    titulo: 'Los tenederos, de mejor a peor', clave: 'Arena y fango duro, sí; fango blando, algas y piedra, no.',
    datos: [{ cifra: 'buenos', texto: 'arena compacta, fango duro' }, { cifra: 'regulares', texto: 'arcilla, cascajo' }, { cifra: 'malos', texto: 'fango blando, algas, piedra' }],
    nota: 'Ojo al adjetivo: el fango duro es de los mejores y el fango blando de los peores. En piedra el ancla no se clava y puede enrocarse: para eso está el orinque.',
  },
}, 'vista', 'elegir');

const fondeoGira = porVista(fondeoGiraC, MAN, {
  maniobra: {
    titulo: 'Fondeo a la gira, paso a paso', clave: 'Freno puesto y desembragado; «¡fondo!» con el barco parado y se dosifica con el freno.',
    datos: [{ cifra: 'pendura', texto: 'el ancla, colgando, lista' }, { cifra: 'freno', texto: 'dosifica la cadena' }, { cifra: 'filar', texto: 'mientras cae atrás' }],
    nota: 'Para levar es al revés: embragas y dejas libre el freno, y el motor vira la cadena. No mezcles las dos secuencias.',
  },
  cadena: {
    titulo: 'Cuánta cadena filar', clave: 'Unas 3 veces la profundidad con buen tiempo y 5 o más con malo: el tiro, horizontal.',
    datos: [{ cifra: '3 × d', texto: 'buen tiempo' }, { cifra: '5 × d', texto: 'mal tiempo, o más' }, { cifra: 'd', texto: 'la sonda, con la marea' }],
    nota: 'Es una regla práctica, no una norma. Con cabo en lugar de cadena hace falta más longitud. Comprueba que agarra dando atrás suave y toma referencias o pon la alarma de fondeo.',
  },
}, 'vista', 'maniobra');

const gobiernoRabeo = porVista(gobiernoRabeoC, MAN, {
  gobierno: {
    titulo: 'Velocidad de gobierno y arrancada', clave: 'Por debajo de la velocidad de gobierno, el barco no obedece al timón.',
    datos: [{ cifra: 'arrancada', texto: 'la inercia, sin máquina' }, { cifra: 'gobierno', texto: 'velocidad mínima con timón' }],
    nota: 'La velocidad de gobierno depende de cada barco y del viento. «Parado y sin arrancada» quiere decir que no se mueve respecto al agua.',
  },
  rabeo: {
    titulo: 'El rabeo de la popa', clave: 'La proa cae a un lado y la popa barre hacia el otro: deja espacio por esa banda.',
    datos: [{ cifra: '1/3', texto: 'de la eslora: punto de giro' }, { cifra: 'popa', texto: 'barre al lado contrario' }],
    nota: 'Avante, el barco gira alrededor de un punto a un tercio de la eslora desde la proa. Pegado a un muelle, si metes el timón para separarte, la popa se te va contra él.',
  },
}, 'vista', 'gobierno');

const atraque = (spec) => {
  const r = atraqueC(spec);
  if (!r) return null;
  const md = spec.modo ?? 'costado';
  const lev = spec.helice === 'levogira';
  const V = {
    costado: {
      titulo: `Atraque de costado con hélice ${lev ? 'levógira' : 'dextrógira'}`, clave: `Con hélice ${lev ? 'levógira' : 'dextrógira'}, atraca por ${lev ? 'estribor' : 'babor'}: al dar atrás, la popa se arrima sola.`,
      datos: [{ cifra: '20–30°', texto: 'ángulo de entrada' }, { cifra: lev ? 'estribor' : 'babor', texto: 'la banda buena' }, { cifra: '1.º', texto: 'largo de proa con corriente' }],
      nota: 'Con viento de tierra o corriente de proa, el primer cabo a tierra es el largo de proa. Por la banda «mala», entra más paralelo y más despacio: al dar atrás, la popa se abrirá.',
    },
    punta: spec.viento === 'costado' ? {
      titulo: 'De punta con viento de costado', clave: 'Los dos largos al noray de barlovento y el muerto, tesado cuanto antes.',
      datos: [{ cifra: '2 largos', texto: 'al noray de barlovento' }, { cifra: 'muerto', texto: 'tesar cuanto antes' }],
      nota: 'Un largo al noray de sotavento quedaría en banda mientras el viento empuja el barco. Si hay dos muertos, primero el de barlovento.',
    } : {
      titulo: 'Atraque de punta: popa al muelle', clave: 'Dos largos al muelle y el otro extremo sujeto con el muerto, una codera o el ancla.',
      datos: [{ cifra: '2 largos', texto: 'al muelle' }, { cifra: 'muerto', texto: 'su guía, desde el muelle' }, { cifra: 'defensas', texto: 'a las dos bandas' }],
      nota: 'Es el atraque típico de los puertos deportivos del Mediterráneo. Con viento de tierra das los largos y el viento te separa; con viento de mar, te separas con el motor y tesas el muerto.',
    },
    abarloado: {
      titulo: 'Abarloado a otro barco', clave: 'Avisa al otro barco, defensas de sobra y los palos desfasados.',
      datos: [{ cifra: 'defensas', texto: 'de sobra, entre los dos' }, { cifra: 'palos', texto: 'no a la misma altura' }],
      nota: 'Si el otro está fondeado o en una boya, acércate por su popa; si arde o echa gases, por barlovento. Con marea, deja seno a los cabos.',
    },
    boya: {
      titulo: 'Amarrar a una boya', clave: 'Proa a lo que más empuje, muy despacio, y el cabo por seno para soltarte desde a bordo.',
      datos: [{ cifra: 'amura', texto: 'la boya, por ahí' }, { cifra: 'por seno', texto: 'te sueltas desde a bordo' }],
      nota: 'Si no puedes llegar proa al viento, ponte a barlovento de la boya y deja que el viento te arrime. Nunca fondees junto a una boya de amarre: te enredarías con su muerto.',
    },
  };
  const v = V[md] ?? V.costado;
  return { tema: MAN, ...v, alt: altDe(r) };
};

const revisionSalida = porVista(revisionSalidaC, SEG, {
  resumen: {
    titulo: 'Antes de soltar amarras', clave: 'El tiempo, el barco y las personas; y tu plan, dicho en tierra.',
    datos: [{ cifra: '3', texto: 'tiempo, barco y personas' }, { cifra: 'plan', texto: 'adónde, por dónde y cuándo' }],
    nota: 'La previsión, para toda la travesía y su evolución. A la tripulación, enséñale dónde están los chalecos, el aro, los extintores y la pirotecnia, y cómo pedir socorro por VHF.',
  },
  motor: {
    titulo: 'El motor y el combustible, en el pantalán', clave: 'Aceite, refrigeración, correa, decantador, combustible, fugas y baterías.',
    datos: [{ cifra: '7', texto: 'comprobaciones del motor' }, { cifra: 'escape', texto: 'que salga agua al arrancar' }, { cifra: 'reserva', texto: 'combustible de sobra' }],
    nota: 'Antes de arrancar, ventila la cámara del motor y la sentina (con gasolina, 4 minutos) y comprueba que no huele a combustible ni a gas.',
  },
}, 'vista', 'resumen');

const reflectorTormenta = porVista(reflectorTormentaC, SEG, {
  reflector: {
    titulo: 'Reflector radar: para que te vean', clave: 'No emite nada: devuelve las ondas del radar de los demás para que te vean.',
    datos: [{ cifra: 'pasivo', texto: 'sin energía' }, { cifra: 'arriba', texto: 'lo más alto posible' }, { cifra: 'art. 12', texto: 'RD 339/2021, todas las zonas' }],
    nota: 'Lo exige el Real Decreto 339/2021 en las embarcaciones de casco no metálico, en todas las zonas. Los cascos de fibra o madera apenas dan eco: sin reflector pueden ser casi invisibles en la pantalla de un mercante.',
  },
  tormenta: {
    titulo: 'Tormenta eléctrica a bordo', clave: 'Dentro y lejos de los metales; después, comprueba la aguja.',
    datos: [{ cifra: 'aguja', texto: 'desvío anómalo posible' }, { cifra: 'declinación', texto: 'no cambia' }],
    nota: 'Un rayo cercano puede alterar el magnetismo de la aguja y de los hierros de a bordo, de forma temporal o permanente. Compruébala con una enfilación y, si ha cambiado, haz una nueva tablilla de desvíos.',
  },
}, 'vista', 'reflector');

const varadaAbordaje = porVista(varadaAbordajeC, EMER, {
  varada: {
    titulo: 'Varada: primero evaluar, luego reflotar', clave: 'Nada brusco: heridos, vías de agua, sonda y marea antes de intentar salir.',
    datos: [{ cifra: 'pleamar', texto: 'el agua que viene' }, { cifra: 'pesos', texto: 'y líquidos: cambia el asiento' }, { cifra: 'ancla', texto: 'hacia lo hondo' }],
    nota: 'En fondo blando el casco queda pegado por efecto ventosa: trasladar pesos y trasvasar líquidos para cambiar el asiento es la respuesta que da por buena el examen. Dar atrás a toda nada más varar puede abrir el casco o meter fango en la refrigeración.',
  },
  abordaje: {
    titulo: 'Abordaje: antes de separar los barcos', clave: 'La proa de uno puede estar taponando la brecha del otro: prepara la estanqueidad antes de separarlos.',
    datos: [{ cifra: 'flotación', texto: 'mira bajo ella primero' }, { cifra: 'de inmediato', texto: 'parte a Capitanía' }, { cifra: '24 h', texto: 'hábiles, para declarar' }],
    nota: 'Lo pide la Ley 14/2014 de Navegación Marítima (art. 186): comunicar el accidente de inmediato a la Capitanía Marítima y presentarse a declarar dentro de las 24 horas hábiles siguientes a la llegada a puerto.',
  },
}, 'vista', 'varada');

const achiqueSentina = fijo(achiqueSentinaC, EMER, {
  titulo: 'Agua en la sentina: el achique', clave: 'Todo el achique en marcha y el motor encendido: carga las baterías de las bombas.',
  datos: [{ cifra: 'zonas 1–3', texto: 'motor + manual + 2 baldes' }, { cifra: 'zonas 4–6', texto: 'una bomba + 1 balde' }, { cifra: '5 l', texto: 'cada balde, como mínimo' }],
  nota: 'Real Decreto 339/2021, artículo 20. En la zona 7, una bomba manual o eléctrica (o un achicador de 2 litros si mide 6 m o menos y tiene cámaras de flotabilidad). Los veleros de las zonas 1 a 6 llevan una bomba manual fija que se acciona desde la bañera.',
});

const barometroTendencia = porVista(barometroTendenciaC, MET, {
  instrumentos: {
    titulo: 'Barómetro de mercurio y aneroide', clave: 'El aneroide: cápsula con vacío y fuerzas elásticas, de lectura directa.',
    datos: [{ cifra: '760 mm', texto: 'de mercurio: 1 atmósfera' }, { cifra: '1013,25', texto: 'hPa, el valor normal' }, { cifra: 'elásticas', texto: 'las fuerzas del aneroide' }],
    nota: 'El de mercurio es el más exacto, pero frágil; el modelo marino lleva un estrechamiento capilar que amortigua los balances. El estrechamiento capilar nunca es del aneroide.',
  },
  tendencia: {
    titulo: 'Lo que importa: la tendencia', clave: 'Más que la lectura, cuenta cómo cambia: si baja deprisa, llega mal tiempo.',
    datos: [{ cifra: 'sube', texto: 'mejora o sigue bueno' }, { cifra: 'baja rápido', texto: 'borrasca o frente' }, { cifra: 'estable', texto: 'sigue como está' }],
    nota: 'La segunda aguja del aneroide se deja sobre la lectura anterior: así se ve de un vistazo si la presión sube o baja. Anota la presión al salir y cada pocas horas.',
  },
}, 'vista', 'instrumentos');

const marCrece = porVista(marCreceC, MET, {
  factores: {
    titulo: 'Qué hace crecer la mar', clave: 'Intensidad es fuerza, persistencia es tiempo y fetch es extensión de mar.',
    datos: [{ cifra: 'intensidad', texto: 'fuerza del viento' }, { cifra: 'persistencia', texto: 'tiempo soplando igual' }, { cifra: 'fetch', texto: 'extensión de mar' }],
    nota: 'La ola crece hasta la mar totalmente desarrollada: por mucho que siga soplando, ya no crece. Un viento de tierra levanta poca mar junto a la costa porque apenas tiene fetch.',
  },
  'viento-fondo': {
    titulo: 'Mar de viento y mar de fondo', clave: 'La mar de viento nace donde sopla; la de fondo llega de lejos, larga y regular.',
    datos: [{ cifra: 'de viento', texto: 'corta e irregular' }, { cifra: 'de fondo', texto: 'o de leva: larga, redonda' }],
    nota: 'La mar de fondo puede llegar con calma o con un viento local de otra dirección. Mares cruzadas, o mar contra corriente, dan mar confusa.',
  },
}, 'vista', 'factores');

const previsionSalida = porVista(previsionSalidaC, MET, {
  fuentes: {
    titulo: 'La previsión oficial: de dónde sale', clave: 'AEMET la elabora; te llega por su web, por VHF desde Salvamento Marítimo y por NAVTEX.',
    datos: [{ cifra: 'canal 16', texto: 'anuncio del boletín' }, { cifra: '518 kHz', texto: 'NAVTEX en inglés' }, { cifra: '490 kHz', texto: 'en el idioma nacional' }],
    nota: 'Los centros de Salvamento Marítimo anuncian los boletines por el canal 16 y los leen en un canal de trabajo que dicen en el anuncio. Las aplicaciones de modelos, siempre contrastadas con lo oficial.',
  },
  decidir: {
    titulo: 'Decidir antes de zarpar', clave: 'Si tu barco y tu tripulación no lo llevan con comodidad, no se sale.',
    datos: [{ cifra: 'plan B', texto: 'refugio y hora límite' }, { cifra: 'avisos', texto: 'en vigor: mira la vuelta' }],
    nota: 'Completa el parte con lo que ves: el barómetro, el cielo y el viento real en el puerto. Navegando, si el barómetro cae deprisa o el viento refresca más de lo previsto, vuelve antes.',
  },
}, 'vista', 'fuentes');

export const MARCOS_FINAL = {
  cubierta, timon, 'muerto-boya': muertoBoya, nudos, tenedero, 'fondeo-gira': fondeoGira, 'gobierno-rabeo': gobiernoRabeo, atraque,
  'revision-salida': revisionSalida, 'reflector-tormenta': reflectorTormenta, 'varada-abordaje': varadaAbordaje, 'achique-sentina': achiqueSentina,
  'barometro-tendencia': barometroTendencia, 'mar-crece': marCrece, 'prevision-salida': previsionSalida,
};
