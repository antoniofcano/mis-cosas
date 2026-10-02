// Luces de un buque según desde dónde lo miras (Regla 21). Un mando: rodear el barco. Vista cenital y vista del
// observador enlazadas: tocar una luz la resalta en las dos.
import { lucesVisibles, lucesTexto } from '../../nautical/luces.js';
import { planta, noche, desde, MANDO_ASPECTO, PARTES_LUCES, BOTONES_LUCES, PIE_PLANTA, NOTA_BUQUE } from './luces-buque.js';

export const sectoresLuces = {
  mandos: [MANDO_ASPECTO],
  estado: (spec) => ({ aspecto: Number(spec.aspecto ?? 60) }),
  calcular: (e) => lucesVisibles(e.aspecto),
  pie: () => 'Tope: blanca, 225° hacia proa. Costados: verde a estribor y roja a babor, 112,5° cada una, desde la proa hasta 22,5° a popa del través. Alcance: blanca, 135° hacia popa.',
  dibujar(e, v) {
    return {
      vistas: [{ svg: planta(e.aspecto), pie: PIE_PLANTA }, { svg: noche(e.aspecto), pie: 'Lo que ves tú, de noche' }],
      nota: NOTA_BUQUE,
      lectura: `Lo miras ${desde(e.aspecto)}: ves ${lucesTexto(v)}.`,
    };
  },
  prediccion: () => ({
    enunciado: 'De noche ves una sola luz blanca y ninguna de color. ¿Desde dónde lo estás viendo?',
    opciones: { a: 'Por la proa', b: 'Por el costado', c: 'Por la popa' },
    correcta: 'c',
    tras: 'Es la luz de alcance, la única que se ve desde más de 22,5° a popa del través. Da la vuelta al barco con el mando y mira cuándo aparecen las de costado.',
  }),
  partes: PARTES_LUCES,
  botonesPartes: BOTONES_LUCES,
};
