// Registro de las láminas animadas sin mandos (las interactivas animadas, como la marea o la corriente, llevan su
// animación en su propia definición: `animacion` en src/illustrations/interactivas/). Cada una conserva el tipo y los
// parámetros de su spec: validSpec las sigue aceptando y su imagen fija es un fotograma con significado.

import { fotogramaFijo } from './pista.js';
import { pistaEvolucion } from './evolucion.js';
import { pistaHombreAlAgua } from './hombre-al-agua.js';
import { pistaHelice } from './helice.js';
import { pistaCirculacion } from './circulacion.js';
import { caidaPopa } from '../../nautical/helice.js';
import { MANIOBRAS_HAA } from '../../nautical/maniobra.js';
import { pistaCiaboga } from './ciaboga.js';
import { pistaCiabogaDos, PARTES_CIABOGA2 } from './ciaboga-dos.js';

export const ANIMACIONES = {
  'ciaboga-dos-helices': {
    aplica: (s) => ['er', 'br'].includes(s.banda ?? 'er') && [].concat(s.resaltar ?? []).every((k) => PARTES_CIABOGA2.includes(k)),
    pista: (s) => pistaCiabogaDos(s),
    pie: (s) => (s.banda === 'br'
      ? 'Con dos hélices se ciaboga con un motor avante y el otro atrás: la proa cae hacia la banda del que va atrás. A babor: babor atrás y estribor avante. Con giro al exterior, las presiones laterales de las dos palas ayudan.'
      : 'Con dos hélices se ciaboga con un motor avante y el otro atrás: la proa cae hacia la banda del que va atrás. A estribor: estribor atrás y babor avante. Con giro al exterior, las presiones laterales de las dos palas ayudan.'),
  },
  ciaboga: {
    pista: () => pistaCiaboga(),
    pie: 'Para girar en poco espacio con una hélice dextrógira, la ciaboga se hace cayendo a estribor: al dar atrás la hélice lleva la popa a babor y ayuda al giro. Con hélice levógira, al revés: se cae a babor.',
  },
  evolucion: {
    pista: () => pistaEvolucion(),
    pie: 'Trayectoria con todo el timón a estribor: la popa abre, el barco avanza y traslada, y acaba girando en un círculo algo menor que el diámetro táctico.',
  },
  helice: {
    pista: (s) => pistaHelice(s),
    pie: (s) => {
      const atras = s.marcha === 'atras';
      const { popa } = caidaPopa({ marcha: atras ? 'atras' : 'avante', sentido: s.sentido === 'levogira' ? 'levogira' : 'dextrogira', timon: 'via' });
      return `Con hélice ${s.sentido === 'levogira' ? 'levógira' : 'dextrógira'}, dando ${atras ? 'atrás' : 'avante'} la popa tiende a caer a ${popa}${atras ? ' (efecto muy marcado al dar atrás)' : ''}.`;
    },
  },
  // meteo: solo la borrasca y el anticiclón están animados (las demás variantes siguen fijas o interactivas)
  meteo: {
    aplica: (s) => s.sistema === 'borrasca' || s.sistema === 'anticiclon',
    pista: (s) => pistaCirculacion(s.sistema === 'borrasca'),
    pie: (s) => (s.sistema === 'borrasca'
      ? 'En el hemisferio norte el viento gira alrededor de la borrasca en sentido contrario a las agujas del reloj, entrando hacia el centro.'
      : 'En el hemisferio norte el viento gira alrededor del anticiclón en el sentido de las agujas del reloj, saliendo hacia fuera.'),
  },
  'hombre-al-agua': {
    pista: (s) => pistaHombreAlAgua(MANIOBRAS_HAA.includes(s.maniobra) ? s.maniobra : 'boutakow'),
    pie: (s) => ({
      anderson: 'Todo el timón a la banda del náufrago y una sola vuelta de unos 250° hasta tenerlo por la proa: la más rápida si lo has visto caer.',
      scharnow: 'Todo a una banda; a 240°, todo a la otra; al rumbo opuesto vuelves sobre tu derrota, más atrás: para cuando la persona cayó hace un rato.',
    }[s.maniobra] ?? 'Todo el timón a la banda por la que cayó; a 60°, todo a la otra; al rumbo opuesto vuelves por tu estela hasta la persona.'),
  },
};

const cache = new Map();

/** La animación de una spec ({ pista: () => pista, pie }) o null si su lámina no está animada. */
export function animacionDe(spec) {
  const a = spec && ANIMACIONES[spec.tipo];
  if (!a || (a.aplica && !a.aplica(spec))) return null;
  const clave = `${spec.tipo}|${JSON.stringify(spec)}`;
  return { pista: () => { if (!cache.has(clave)) cache.set(clave, a.pista(spec)); return cache.get(clave); }, pie: typeof a.pie === 'function' ? a.pie(spec) : a.pie };
}

/** Imagen fija de una lámina animada: { svg, caption } (o null). */
export function dibujoAnimado(spec) {
  const a = animacionDe(spec);
  if (!a) return null;
  return { svg: fotogramaFijo(a.pista()), caption: a.pie };
}
