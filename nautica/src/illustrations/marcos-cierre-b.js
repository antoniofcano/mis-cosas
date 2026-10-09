// Marcos de las láminas de lección del PER rehechas en estilo C en la tanda de cierre (segunda parte): reglamento,
// maniobra, casco, seguridad y meteorología. Mismo formato que marcos.js; el texto alternativo es el del dibujo.

import { dibujoAnimado } from './animaciones/index.js';
import { extintorC, avisosNavegantesC } from './py-cierre-c.js';
import { ripaDefinicionesC, capearCorrerC, fondeoC, estructuraC, rolarC, caboC, remolqueC, hipotermiaC } from './per-cola-c.js';

const RIPA = 'Reglamento (RIPA)';
const MAN = 'Maniobra';
const CASCO = 'El barco';
const SEG = 'Seguridad';
const MET = 'Meteorología';

const desEsc = (t) => t.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
export const altDe = (r) => (r?.svg ? desEsc(r.svg.match(/aria-label="([^"]*)"/)?.[1] ?? '') : '');
/** Marco de una spec con vistas: VISTAS[vista] (o la de por defecto), con el alt de su dibujo. */
export const porVista = (fn, tema, VISTAS, clave = 'vista', def = Object.keys(VISTAS)[0]) => (spec) => {
  const v = VISTAS[spec[clave] ?? def];
  if (!v) return null;
  const r = fn(spec);
  return r ? { tema, ...v, alt: altDe(r) } : null;
};

const ripaDefiniciones = porVista(ripaDefinicionesC, RIPA, {
  'vela-motor': {
    titulo: 'Vela o motor: decide la máquina', clave: 'Con el motor en marcha, un velero es buque de propulsión mecánica.',
    datos: [{ cifra: 'regla 3 c', texto: 'vela: sin usar su maquinaria' }, { cifra: 'regla 3 b', texto: 'propulsión mecánica: la mueve una máquina' }, { cifra: 'regla 25 e', texto: 'cono con el vértice abajo, a proa' }],
    nota: 'Da igual que lleve las velas izadas: si el motor empuja, cumple las reglas de los de propulsión mecánica, sea cual sea su eslora. De noche lleva las luces de motor.',
  },
  categorias: {
    titulo: '¿Por qué no puede apartarse?', clave: 'Sin gobierno, maniobra restringida, pesca y calado: cada uno por una razón distinta.',
    datos: [{ cifra: 'regla 3 f', texto: 'sin gobierno: algo excepcional' }, { cifra: 'regla 3 g', texto: 'maniobra restringida: su trabajo' }, { cifra: 'regla 3 h', texto: 'restringido por su calado' }],
    nota: 'Dedicado a la pesca (regla 3 d) es el que pesca con redes, líneas, arrastre u otras artes que le restringen la maniobra; con curricán no lo es. Restringido por su calado solo puede ser uno de propulsión mecánica.',
  },
});

const capearCorrer = porVista(capearCorrerC, SEG, {
  rumbos: {
    titulo: 'Capear o correr, nunca atravesado', clave: 'Con mala mar, recíbela por la amura o por la aleta; nunca por el través.',
    datos: [{ cifra: 'amura', texto: 'capear: poca máquina avante' }, { cifra: 'aleta o popa', texto: 'correr el temporal' }, { cifra: 'través', texto: 'balances violentos: puede zozobrar' }],
    nota: 'Ajusta rumbo y velocidad para que el barco sufra lo menos posible. Parado tampoco: sin arrancada no hay gobierno y la mar lo atraviesa.',
  },
  costa: {
    titulo: 'La costa, mejor a barlovento', clave: 'Con mal tiempo, la costa peligrosa es la de sotavento: la mar te echa contra ella.',
    datos: [{ cifra: 'barlovento', texto: 'de donde viene el viento: abrigo' }, { cifra: 'sotavento', texto: 'adonde te empujan viento y mar' }],
    nota: 'Si algo falla (el motor, el timón), a sotavento solo hay rocas. Gana distancia a la costa de sotavento y busca mar abierta o un puerto de abrigo.',
  },
});

const fondeo = porVista(fondeoC, MAN, {
  ancla: {
    titulo: 'Partes del ancla y tipos', clave: 'Arganeo, caña, cruz, brazos y uñas; la de almirantazgo añade el cepo.',
    datos: [{ cifra: 'arganeo', texto: 'donde se une la cadena, con un grillete' }, { cifra: 'uñas', texto: 'lo que se clava en el fondo' }, { cifra: 'cepo', texto: 'la barra del ancla de almirantazgo' }],
    nota: 'En una foto: una reja es de arado; dos palas anchas, Danforth; cuatro o cinco brazos, rezón (para embarcaciones pequeñas y para rescatar objetos del fondo).',
  },
  linea: {
    titulo: 'Molinete y línea de fondeo', clave: 'La línea de fondeo mide al menos cinco esloras, con una eslora de cadena como mínimo.',
    datos: [{ cifra: '≥ 5 L', texto: 'largo de la línea de fondeo' }, { cifra: '≥ 1 L', texto: 'tramo de cadena' }, { cifra: '≤ 6 m', texto: 'de eslora: puede ser toda de estacha' }],
    nota: 'Lo pide el artículo 11 del Real Decreto 339/2021, que también exige grilletes en los empalmes. El barbotén (con muescas) mueve la cadena; el cabirón, liso, los cabos.',
  },
  borneo: {
    titulo: 'Círculo de borneo', clave: 'Fondeado, el barco gira alrededor del ancla: dentro del círculo no debe haber nada.',
    datos: [{ cifra: 'radio ≈', texto: 'cadena filada + eslora' }, { cifra: 'nada dentro', texto: 'bajos, costa, boyas ni barcos' }, { cifra: 'menos', texto: 'menos cadena o una segunda ancla' }],
    nota: 'Al rolar el viento o la corriente, el barco bornea. Calcula el radio por exceso; dar máquina no lo reduce.',
  },
  garreo: {
    titulo: 'Garrear: el ancla se arrastra', clave: 'Con poca cadena el tiro va hacia arriba, desclava el ancla y el barco deriva.',
    datos: [{ cifra: 'horizontal', texto: 'el tiro bueno, con cadena suficiente' }, { cifra: 'hacia arriba', texto: 'desclava el ancla' }],
    nota: 'Otras causas del garreo: mal tenedero, mala maniobra al dar fondo, más viento del previsto o el ancla sucia de algas o de un cabo. Comprueba con enfilaciones que no te mueves.',
  },
  orinque: {
    titulo: 'Orinque y boyarín', clave: 'El orinque, firme a la cruz, saca el ancla por la cruz si se enroca.',
    datos: [{ cifra: 'cruz', texto: 'donde se afirma el orinque' }, { cifra: '> profundidad', texto: 'en pleamar: su largo' }, { cifra: 'boyarín', texto: 'marca dónde está el ancla' }],
    nota: 'En fondos de piedra o con cables y restos, el ancla puede enrocarse. Tirando del orinque sale «al revés», por la cruz. El boyarín también avisa a los demás de dónde está tu ancla.',
  },
  voces: {
    titulo: 'Voces de la maniobra de fondeo', clave: 'A la pendura, dar fondo y filar; al levar, virar, a pique, zarpa y clara.',
    datos: [{ cifra: 'a pique', texto: 'cadena vertical, ancla aún en el fondo' }, { cifra: 'zarpa', texto: 'el ancla se despega' }, { cifra: 'clara', texto: 'asoma limpia' }],
    nota: 'Al virar, da avante muy suave hacia el ancla para que el molinete no haga toda la fuerza. Después de clara, el ancla se leva y se estiba.',
  },
});

const estructura = porVista(estructuraC, CASCO, {
  partes: {
    titulo: 'La estructura del casco', clave: 'Quilla, roda y codaste son el espinazo; cuadernas y baos, las costillas y las vigas.',
    datos: [{ cifra: 'quilla', texto: 'longitudinal, abajo' }, { cifra: 'baos', texto: 'transversales: sostienen la cubierta' }, { cifra: 'regala', texto: 'longitudinal, arriba: remata la borda' }],
    nota: 'El mamparo más a proa es el de colisión. El plan es el piso más bajo; debajo, la sentina, donde se acumula el agua que sacan las bombas de achique.',
  },
  'vias-agua': {
    titulo: 'Por dónde entra el agua', clave: 'El agua entra casi siempre por donde algo atraviesa el casco.',
    datos: [{ cifra: 'bocina', texto: 'paso del eje de la hélice' }, { cifra: 'limera', texto: 'paso de la mecha del timón' }, { cifra: 'grifos', texto: 'de fondo y pasacascos' }],
    nota: 'Cierra los grifos de fondo que no uses y revisa sus abrazaderas. El escape del motor puede agrietarse. La hélice no es una vía de agua: está fuera del casco.',
  },
});

const rolar = porVista(rolarC, MET, {
  vocabulario: {
    titulo: 'El viento: dirección e intensidad', clave: 'Rolar es cambiar de dirección; refrescar, caer, calmar y racha hablan de intensidad.',
    datos: [{ cifra: 'rolar', texto: 'cambia de dirección' }, { cifra: 'refrescar', texto: 'aumenta su fuerza' }, { cifra: 'racha', texto: 'subida brusca y breve' }],
    nota: 'El viento se nombra por de dónde viene: un poniente sopla del W. Amainar (caer) es perder fuerza; refrescar no tiene nada que ver con la temperatura.',
  },
  instrumentos: {
    titulo: 'Instrumentos del viento', clave: 'El anemómetro mide la velocidad; la veleta y el catavientos, la dirección.',
    datos: [{ cifra: 'anemómetro', texto: 'velocidad, en nudos' }, { cifra: 'veleta', texto: 'de dónde viene' }, { cifra: 'barómetro', texto: 'la presión, no el viento' }],
    nota: 'Navegando, el anemómetro de a bordo mide el viento aparente, no el real. La veleta apunta hacia donde viene el viento; el catavientos se tiende hacia donde va.',
  },
});

const cabo = porVista(caboC, MAN, {
  partes: {
    titulo: 'Las partes de un cabo', clave: 'Chicote, cada extremo; firme, la parte que trabaja; seno, la que hace curva.',
    datos: [{ cifra: 'chicote', texto: 'cada uno de los extremos' }, { cifra: 'firme', texto: 'soporta la tensión' }, { cifra: 'gaza', texto: 'ojo fijo en un extremo' }],
    nota: 'Si la gaza va a rozar, se protege con un guardacabos. Cobrar es recoger cabo; arriar o lascar, soltarlo poco a poco.',
  },
  cornamusa: {
    titulo: 'Hacer firme en una cornamusa', clave: 'Una vuelta a la base, ochos por los cuernos y la última mordida.',
    datos: [{ cifra: '1', texto: 'vuelta completa a la base' }, { cifra: '2', texto: 'vueltas en ocho' }, { cifra: '3', texto: 'mordida: un cote la bloquea' }],
    nota: 'Sin vueltas de más: un cabo bien hecho firme en una cornamusa se suelta en segundos, aunque esté en tensión.',
  },
  'por-seno': {
    titulo: 'Amarrar por seno', clave: 'Por seno, los dos extremos quedan a bordo: se larga sin nadie en el muelle.',
    datos: [{ cifra: '2', texto: 'extremos a bordo' }, { cifra: 'soltar y cobrar', texto: 'así se larga' }],
    nota: 'Sirve para salir sin ayuda desde tierra. Si algún extremo queda en el muelle, ya no es por seno.',
  },
  encapillar: {
    titulo: 'Encapillar sobre otra gaza', clave: 'Tu gaza pasa por dentro de la otra, de abajo arriba, antes de encapillarla.',
    datos: [{ cifra: 'por dentro', texto: 'de la gaza que ya hay' }, { cifra: 'holgadas', texto: 'las dos gazas' }],
    nota: 'Así cada barco puede sacar su gaza del noray sin tener que quitar la del otro.',
  },
});

const remolque = porVista(remolqueC, SEG, {
  largo: {
    titulo: 'Remolque largo: a la vez en la cresta', clave: 'Con mar, el remolque largo: los dos barcos a la vez en la cresta o en el seno.',
    datos: [{ cifra: '2 olas', texto: 'separación de los dos barcos' }, { cifra: 'peso', texto: 'a mitad del cabo: amortigua' }, { cifra: 'mínima', texto: 'velocidad, sin tirones' }],
    nota: 'El remolcado afirma el cabo a un punto resistente, desembraga y sigue la estela. Ten un cuchillo a mano y acordad un canal de trabajo en VHF.',
  },
  abarloado: {
    titulo: 'Remolque abarloado', clave: 'En puerto, costado con costado: el averiado, entre el través y la aleta del remolcador.',
    datos: [{ cifra: 'aguas abrigadas', texto: 'y espacios reducidos' }, { cifra: '3 amarras', texto: 'y defensas entre los dos' }],
    nota: 'Con la popa del remolcador más a popa que la del averiado, su hélice y su timón gobiernan el conjunto.',
  },
  naufrago: {
    titulo: 'Subir al náufrago por sotavento', clave: 'Punto muerto y el náufrago a sotavento, donde el casco le hace socaire.',
    datos: [{ cifra: 'punto muerto', texto: 'la hélice es el mayor peligro' }, { cifra: 'sotavento', texto: 'al abrigo del casco' }, { cifra: 'aro', texto: 'con rabiza, para acercarlo' }],
    nota: 'Si está agotado, un tripulante con chaleco y amarrado le ayuda. En agua fría, súbelo en horizontal si puedes.',
  },
});

const hipotermia = porVista(hipotermiaC, SEG, {
  help: {
    titulo: 'Con chaleco: postura fetal (HELP)', clave: 'Quieto, rodillas al pecho y brazos cruzados: pierdes menos calor.',
    datos: [{ cifra: 'HELP', texto: 'postura para conservar el calor' }, { cifra: '5 zonas', texto: 'cabeza, cuello, axilas, costados, ingles' }],
    nota: 'Nadar enfría más deprisa: el agua que mueves se lleva el calor. Sin chaleco, mantente vertical con movimientos lentos, lo justo para flotar.',
  },
  saltar: {
    titulo: 'Si no hay más remedio que saltar', clave: 'De pie, piernas juntas, tapando nariz y boca y sujetando el chaleco.',
    datos: [{ cifra: 'menor altura', texto: 'desde la que saltar' }, { cifra: 'debajo', texto: 'ni nadie ni nada' }],
    nota: 'Mejor no mojarse: si puedes, pasa a la balsa desde cubierta. Salta lejos del combustible derramado.',
  },
  grupo: {
    titulo: 'Varios en el agua: en piña', clave: 'Abrazados y con el más débil en el centro: más calor y más fáciles de ver.',
    datos: [{ cifra: 'en piña', texto: 'abrazados, con el chaleco' }, { cifra: 'centro', texto: 'el más débil' }],
    nota: 'Juntos conserváis el calor y os dais ánimo. No nadéis hacia la costa salvo que esté muy cerca y sea segura.',
  },
}, 'postura', 'help');

function ciabogaDos(spec) {
  const r = dibujoAnimado(spec);
  if (!r) return null;
  const br = spec.banda === 'br';
  const [B, O] = br ? ['babor', 'estribor'] : ['estribor', 'babor'];
  return {
    tema: MAN, titulo: `Ciaboga con dos hélices, a ${B}`, clave: 'Un motor avante y el otro atrás: la proa cae hacia la banda del que va atrás.',
    datos: [{ cifra: `${B} atrás`, texto: `y ${O} avante` }, { cifra: 'al exterior', texto: 'dextrógira a Er, levógira a Br: la habitual' }, { cifra: 'casi en el sitio', texto: 'sin la curva de evolución' }],
    nota: `Con giro al exterior, las presiones laterales de las dos palas empujan la popa a ${O} y ayudan al giro; el timón a ${B}, también. Con las dos avante o las dos atrás, los efectos laterales se anulan y el barco va recto.`,
    alt: altDe(r),
  };
}

const extintor = porVista(extintorC, SEG, {
  ambas: {
    titulo: 'El extintor: cómo se reconoce y cómo se usa', clave: 'El de CO₂ no lleva manómetro; cualquiera, con el viento a la espalda y a la base de las llamas.',
    datos: [{ cifra: 'CO₂', texto: 'se pesa: sin manómetro' }, { cifra: 'base', texto: 'de las llamas, barriendo' }, { cifra: 'salida', texto: 'libre, detrás de ti' }],
    nota: 'Antes de atacar: alarma, motor parado y combustible y electricidad cortados. Un extintor portátil se vacía en pocos segundos.',
  },
  co2: {
    titulo: 'Cómo se reconoce un extintor de CO₂', clave: 'Sin manómetro y con la boquilla en trompa: su carga se controla pesándolo.',
    datos: [{ cifra: 'sin manómetro', texto: 'se pesa' }, { cifra: 'trompa', texto: 'no la agarres: se enfría' }, { cifra: 'con tensión', texto: 'no conduce ni deja residuos' }],
    nota: 'Los de polvo sí llevan manómetro, con la aguja en la zona verde. En un espacio cerrado el CO₂ desplaza el oxígeno: ventila antes de volver a entrar.',
  },
  uso: {
    titulo: 'Cómo se usa un extintor', clave: 'Viento a la espalda, salida libre detrás, a la base de las llamas y barriendo.',
    datos: [{ cifra: 'barlovento', texto: 'atacas desde ahí, hacia sotavento' }, { cifra: 'base', texto: 'de las llamas, no a las llamas' }, { cifra: 'segundos', texto: 'lo que dura la descarga' }],
    nota: 'Haz un disparo de prueba antes de acercarte. Barre del borde cercano al fondo, avanzando a medida que el fuego retrocede, y vigila que no se reavive.',
  },
  norma: {
    titulo: 'Cuántos extintores: el RD 339/2021', clave: 'Sin marcado CE: de 34 B y 2 kg, por eslora y por motor; con marcado CE, los del manual.',
    datos: [{ cifra: '34 B', texto: 'eficacia mínima de cada uno' }, { cifra: '≥ 2 kg', texto: 'de agente (polvo o equivalente)' }, { cifra: '0,3 · P', texto: 'capacidad B con más de 220 kW' }],
    nota: 'Revisión (Reglamento de instalaciones de protección contra incendios): tú, cada tres meses; una empresa mantenedora, cada año; y prueba de presión (retimbrado) cada cinco años. Se recarga después de cualquier uso.',
  },
}, 'vista', 'ambas');

const avisosNavegantes = porVista(avisosNavegantesC, 'Publicaciones', {
  correccion: {
    titulo: 'Cada aviso, en la carta', clave: 'Permanentes, a tinta; temporales y preliminares, a lápiz; los generales no corrigen.',
    datos: [{ cifra: 'semanal', texto: 'el Grupo de Avisos del IHM' }, { cifra: '(T) (P)', texto: 'temporales y preliminares: a lápiz' }, { cifra: 'año: nº', texto: 'cada corrección, al margen inferior' }],
    nota: 'Cada aviso lleva el número del grupo semanal y el suyo (32/127) y, por carta, el número de orden de la corrección: así ves si te falta alguno. Si el cambio es difícil de describir, el aviso trae un anexo gráfico que se pega en la carta.',
  },
  radioavisos: {
    titulo: 'Avisos semanales y radioavisos', clave: 'Lo que puede esperar va en el Grupo semanal; lo urgente, por radioaviso.',
    datos: [{ cifra: '21', texto: 'zonas NAVAREA; España coordina la III' }, { cifra: '518 kHz', texto: 'NAVTEX en inglés' }, { cifra: '490 kHz', texto: 'NAVTEX en el idioma del país' }],
    nota: 'Los radioavisos pueden basarse en información incompleta o sin confirmar, y no sirven para corregir cartas: si hace falta, después llega el aviso temporal o permanente.',
  },
});

export const MARCOS_CIERRE_B = {
  extintor, 'avisos-navegantes': avisosNavegantes,
  'ciaboga-dos-helices': ciabogaDos,
  'ripa-definiciones': ripaDefiniciones, 'capear-correr': capearCorrer, fondeo, estructura, rolar, cabo, remolque, hipotermia,
};
