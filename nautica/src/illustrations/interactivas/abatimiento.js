// Abatimiento: el viento empuja el barco a sotavento. Mandos: banda por la que entra el viento y ángulo.
// Primer eslabón de la cadena rumbo verdadero → superficie → efectivo (la corriente es la lámina «corriente»).
import { cadenaDirecta, abatimientoSigned, ladoDe } from '../../nautical/kinematics.js';
import { dibujaCadena, casillasCadena } from './cadena.js';
import { pad3 } from './kit.js';

/** Velocidad del barco si la spec no la trae (nudos). */
const VB = 6;

export const abatimiento = {
  mandos: [
    { id: 'banda', tipo: 'opciones', etiqueta: 'El viento entra por', opciones: [['babor', 'Babor'], ['estribor', 'Estribor']] },
    { id: 'ang', tipo: 'rango', etiqueta: 'Abatimiento', min: 0, max: 20, paso: 1, texto: (v) => `${v}°`, extremos: ['0°', '20°'] },
  ],
  estado: (spec) => ({ banda: spec.banda === 'estribor' ? 'estribor' : 'babor', ang: Math.abs(Number(spec.ab ?? 10)), rv: Number(spec.rv ?? 40), vb: Number(spec.vb ?? VB) }),
  calcular: (e) => {
    const ab = abatimientoSigned(e.ang, e.banda);
    return { ...cadenaDirecta({ rv: e.rv, vb: e.vb, ab }), ab, vb: e.vb, ic: 0, rc: 0 };
  },
  pie: () => 'El viento empuja el barco a sotavento: el rumbo de superficie se separa del de proa. Rs = Rv + Ab, con el abatimiento positivo si el viento entra por babor y negativo si entra por estribor.',
  dibujar(e, r, { pendiente = false } = {}) {
    const ocultar = pendiente ? ['rs', 'ref'] : [];
    const svg = dibujaCadena(r, { ocultar, viento: e.banda });
    const cadena = casillasCadena(r, ocultar);
    if (pendiente) return { svg, cadena, lectura: `Proa al ${pad3(e.rv)}° y viento por ${e.banda}. Responde la pregunta y verás el rumbo de superficie.` };
    const lado = r.ab > 0 ? 'a estribor' : r.ab < 0 ? 'a babor' : null;
    const lectura = lado
      ? `Proa al ${pad3(e.rv)}° con el viento por ${e.banda}: el barco abate ${e.ang}° ${lado}. Rs = Rv + Ab = ${pad3(e.rv)}° ${r.ab > 0 ? '+' : '−'} ${e.ang}° = ${pad3(r.rs)}°. Sin corriente, el efectivo es el de superficie.`
      : `Sin abatimiento, el rumbo de superficie es el mismo que el verdadero: ${pad3(r.rs)}°.`;
    return { svg, cadena, lectura };
  },
  prediccion(e) {
    const r = abatimiento.calcular(e);
    const lado = ladoDe(r.rs, e.rv);
    return {
      enunciado: `Viento por ${e.banda}: ¿el rumbo de superficie es mayor o menor que el verdadero?`,
      opciones: { a: 'Mayor', b: 'Menor', c: 'Igual' },
      correcta: lado === 'estribor' ? 'a' : lado === 'babor' ? 'b' : 'c',
      tras: 'El viento empuja el barco hacia sotavento, el lado contrario al que entra. Viento por babor: abate a estribor y el Rs es mayor (Ab +). Viento por estribor: abate a babor y el Rs es menor (Ab −). Cambia la banda y compruébalo.',
    };
  },
  partes: {
    rv: 'Rumbo verdadero (Rv): hacia donde apunta la proa, corregido de la aguja. Es el primer eslabón.',
    rs: 'Rumbo de superficie (Rs): por donde avanza el barco sobre el agua cuando el viento lo abate. Rs = Rv + Ab.',
    viento: 'El viento empuja el barco hacia sotavento: el lado contrario al que entra.',
  },
};
