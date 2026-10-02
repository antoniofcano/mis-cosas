// Corriente: el agua arrastra el barco. Mandos: rumbo e intensidad de la corriente y rumbo propio.
// Conmutador: «adónde voy» (rumbo efectivo) o «qué rumbo doy para llegar» (problema inverso).
import { cadenaDirecta, cadenaInversa, ladoDe } from '../../nautical/kinematics.js';
import { norm360 } from '../../math/angles.js';
import { dibujaCadena, casillasCadena } from './cadena.js';
import { pad3, num } from './kit.js';

/** Velocidad del barco si la spec no la trae (nudos). */
const VB = 6;
const lado = (l) => (l === 'igual' ? 'sobre tu rumbo' : `a ${l}`);

export const corriente = {
  conmutador: { id: 'modo', etiqueta: '¿Qué quieres saber?', opciones: [['directa', 'Adónde voy'], ['inversa', 'Qué rumbo doy para llegar']] },
  mandos: (e) => [
    { id: 'rc', tipo: 'rango', etiqueta: 'La corriente va hacia', min: 0, max: 355, paso: 5, texto: (v) => `${pad3(v)}°`, extremos: ['000° (N)', '355°'] },
    { id: 'ic', tipo: 'rango', etiqueta: 'Intensidad de la corriente', min: 0, max: 4, paso: 0.5, texto: (v) => `${num(v)} nudos`, extremos: ['0', '4 nudos'] },
    { id: 'rumbo', tipo: 'rango', etiqueta: e.modo === 'inversa' ? 'Rumbo al destino' : 'Tu rumbo verdadero (proa)', min: 0, max: 359, paso: 1, texto: (v) => `${pad3(v)}°`, extremos: ['000° (N)', '359°'] },
  ],
  estado: (spec) => {
    const inversa = spec.caso === 'rumbo-a-dar';
    return { modo: inversa ? 'inversa' : 'directa', rumbo: Number(spec.rumbo ?? (inversa ? 50 : 40)), rc: Number(spec.rc ?? 120), ic: Number(spec.ic ?? 2.5), ab: Number(spec.ab ?? 0), vb: Number(spec.vb ?? VB) };
  },
  /** Al cambiar de pregunta, el rumbo del mando pasa a ser el otro extremo de la misma cadena: el dibujo no salta. */
  ajustar(e, id) {
    if (id !== 'modo') return e;
    const r = e.modo === 'inversa' ? cadenaDirecta({ rv: e.rumbo, vb: e.vb, ab: e.ab, rc: e.rc, ic: e.ic }) : cadenaInversa({ ref: e.rumbo, vb: e.vb, ab: e.ab, rc: e.rc, ic: e.ic });
    return { ...e, rumbo: Math.round(norm360(e.modo === 'inversa' ? r.ref : r.rv)) % 360 };
  },
  calcular: (e) => {
    const p = { vb: e.vb, ab: e.ab, rc: e.rc, ic: e.ic };
    const r = e.modo === 'inversa' ? cadenaInversa({ ref: e.rumbo, ...p }) : cadenaDirecta({ rv: e.rumbo, ...p });
    return { ...r, ...p, inversa: e.modo === 'inversa' };
  },
  pie: (e) => (e.modo === 'inversa'
    ? 'Primero la corriente desde la salida; con centro en su extremo y radio la velocidad del barco cortas la línea al destino: esa dirección es el rumbo a dar. La salida-corte es el efectivo.'
    : 'El barco avanza con su rumbo y velocidad y la corriente lo arrastra: la suma de los dos vectores es el rumbo y la velocidad efectivos (sobre el fondo).'),
  dibujar(e, r, { pendiente = false } = {}) {
    const ocultar = pendiente ? (r.inversa ? ['rv', 'rs'] : ['ref']) : [];
    const svg = dibujaCadena(r, { ocultar });
    const cadena = casillasCadena(r, ocultar);
    const corr = r.ic ? `la corriente (hacia el ${pad3(e.rc)}°, ${num(e.ic)} nudos)` : null;
    if (pendiente) return { svg, cadena, lectura: r.inversa ? `Quieres ir al ${pad3(e.rumbo)}°. Responde la pregunta y verás el rumbo que tienes que dar.` : `Proa al ${pad3(e.rumbo)}° a ${num(e.vb)} nudos. Responde la pregunta y verás tu rumbo efectivo.` };
    let lectura;
    if (r.inversa) {
      lectura = corr
        ? `Para avanzar al ${pad3(r.ref)}° con ${corr}, a ${num(r.vb)} nudos das rumbo de superficie ${pad3(r.rs)}°, ${lado(ladoDe(r.rs, r.ref))} del destino, para compensarla${r.ab ? ` y, quitando el abatimiento, rumbo verdadero ${pad3(r.rv)}°` : ''}. Llegas a ${num(r.vef)} nudos.`
        : `Sin corriente, el rumbo a dar es el del destino: ${pad3(r.rv)}°.`;
    } else {
      lectura = corr
        ? `Proa al ${pad3(r.rv)}° a ${num(r.vb)} nudos${r.ab ? `, superficie ${pad3(r.rs)}°` : ''}. ${corr[0].toUpperCase()}${corr.slice(1)} te lleva ${lado(ladoDe(r.ref, r.rs))}: rumbo efectivo ${pad3(r.ref)}° a ${num(r.vef)} nudos.`
        : `Sin corriente, el rumbo efectivo es el de superficie: ${pad3(r.ref)}° a ${num(r.vb)} nudos.`;
    }
    return { svg, cadena, lectura };
  },
  prediccion(e) {
    const r = corriente.calcular(e);
    if (r.inversa) {
      const l = ladoDe(r.rs, r.ref);
      return {
        enunciado: `Quieres ir al ${pad3(r.ref)}° y la corriente va hacia el ${pad3(e.rc)}°. ¿El rumbo que tienes que dar queda a babor o a estribor del rumbo al destino?`,
        opciones: { a: 'A babor', b: 'A estribor', c: 'Igual que el del destino' },
        correcta: l === 'babor' ? 'a' : l === 'estribor' ? 'b' : 'c',
        tras: 'Se da rumbo hacia el lado del que viene la corriente, para que su arrastre te devuelva a la línea del destino. Mueve el rumbo de la corriente y mira cómo cambia el rumbo a dar.',
      };
    }
    const l = ladoDe(r.ref, r.rs);
    return {
      enunciado: `Navegas al ${pad3(r.rv)}° y la corriente va hacia el ${pad3(e.rc)}°. ¿Tu rumbo efectivo queda a babor o a estribor de tu proa?`,
      opciones: { a: 'A babor', b: 'A estribor', c: 'Igual que la proa' },
      correcta: l === 'babor' ? 'a' : l === 'estribor' ? 'b' : 'c',
      tras: 'La corriente te lleva hacia donde va el agua: el efectivo cae hacia ese lado. Mueve el rumbo de la corriente y compruébalo.',
    };
  },
  partes: {
    rv: 'Rumbo verdadero (Rv): hacia donde apunta la proa.',
    rs: 'Rumbo de superficie (Rs): por donde avanza el barco sobre el agua (Rv + abatimiento).',
    corriente: 'Corriente: se nombra por hacia dónde va el agua (rumbo) y su velocidad (intensidad, en nudos).',
    ref: 'Rumbo efectivo (Ref): por donde avanza el barco sobre el fondo, que es lo que se dibuja en la carta.',
  },
};
