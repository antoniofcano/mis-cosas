// Meteo, variantes de niebla, ampliadas a humedad relativa y punto de rocío. Un mando: la temperatura del aire.
// Conmutador: niebla de advección (aire templado sobre mar fría) o de radiación (tierra que se enfría de noche).
import { humedadRelativa, hayNiebla } from '../../nautical/meteo.js';
import { svgOpen, flecha, texto, num } from './kit.js';

const W = 320;
const H = 250;
const TD = 12; // punto de rocío del ejemplo: la cantidad de vapor no cambia
const PIE = {
  adveccion: 'Aire templado y húmedo que se desplaza sobre una superficie más fría (agua fría) y se enfría hasta saturarse. Es la niebla típica de la mar y puede durar días aunque sople el viento.',
  radiacion: 'Se forma en tierra en noches despejadas y con poco viento, cuando el suelo pierde calor por radiación. Suele disiparse por la mañana al calentar el sol y afecta poco a la mar abierta.',
};

export const nieblas = {
  conmutador: { id: 'tipo', etiqueta: 'Tipo de niebla', opciones: [['adveccion', 'De advección (mar)'], ['radiacion', 'De radiación (tierra)']] },
  mandos: [
    { id: 't', tipo: 'rango', etiqueta: 'Temperatura del aire', min: 8, max: 22, paso: 1, texto: (v) => `${v} °C`, extremos: ['más fría', 'más templada'] },
  ],
  estado: (spec) => ({ tipo: spec.sistema === 'niebla-radiacion' ? 'radiacion' : 'adveccion', t: Number(spec.t ?? 18) }),
  calcular: (e) => ({ hr: humedadRelativa(e.t, TD), niebla: hayNiebla(e.t, TD) }),
  pie: (e) => PIE[e.tipo],
  dibujar(e, r, { pendiente = false } = {}) {
    const adv = e.tipo === 'adveccion';
    const out = [svgOpen(W, H, adv ? 'Niebla de advección' : 'Niebla de radiación')];
    out.push(`<rect width="${W}" height="${H}" rx="10" fill="${adv ? 'var(--l-cielo)' : 'var(--l-noche)'}"/>`);
    if (adv) {
      out.push(`<rect x="0" y="180" width="${W}" height="70" fill="var(--l-mar)"/>`, texto(W - 12, 204, 'mar fría', { anchor: 'end', size: 15, weight: 700, color: 'var(--l-v)' }));
      out.push(flecha(20, 120, 140, 120, 'var(--l-r)', 3, 'aire'), texto(20, 108, 'aire templado y húmedo', { anchor: 'start', size: 14, color: 'var(--l-r)', p: 'aire' }));
    } else {
      out.push(`<circle cx="60" cy="50" r="13" fill="var(--l-luz-blanca)"/>`, texto(84, 48, 'noche despejada,', { anchor: 'start', size: 14, color: 'var(--l-luz-blanca)' }), texto(84, 66, 'sin viento', { anchor: 'start', size: 14, color: 'var(--l-luz-blanca)' }));
      out.push(`<rect x="0" y="180" width="${W}" height="70" fill="var(--land)"/>`, texto(W - 12, 204, 'la tierra se enfría', { anchor: 'end', size: 15, weight: 700, color: 'var(--text)' }));
    }
    // termómetro
    out.push(`<rect x="${W - 44}" y="40" width="14" height="110" rx="7" fill="var(--surface)" stroke="var(--text)"/>`);
    const alto = ((e.t - 8) / 14) * 100;
    out.push(`<rect data-parte="t" x="${W - 41}" y="${147 - alto}" width="8" height="${alto}" rx="4" fill="var(--l-r)"/>`, texto(W - 37, 30, `${e.t} °C`, { size: 15, weight: 700, p: 't', color: adv ? 'var(--text)' : 'var(--l-luz-blanca)' }));
    // la niebla: aparece al saturarse (y una bruma cuando falta poco)
    const op = pendiente ? 0 : r.niebla ? 0.9 : r.hr >= 90 ? 0.35 : 0;
    if (op) out.push(`<path data-parte="niebla" d="M0,140 Q80,125 160,140 T320,140 L320,182 L0,182Z" fill="var(--l-niebla)" opacity="${op}"/>`);
    if (!pendiente) out.push(texto(14, H - 12, `humedad relativa ${Math.round(r.hr)} %`, { anchor: 'start', size: 16, weight: 700, color: r.niebla ? 'var(--l-r)' : 'var(--text)', p: 'hr' }));
    out.push('</svg>');
    const casillas = [['Temperatura', `${e.t} °C`], ['Punto de rocío', `${TD} °C`], ['Humedad relativa', pendiente ? '?' : `${Math.round(r.hr)} %`]];
    if (pendiente) return { svg: out.join(''), casillas, lectura: `Aire a ${e.t} °C con el punto de rocío a ${TD} °C. Responde y verás qué pasa al enfriarlo.` };
    const como = adv ? 'El aire se enfría al pasar sobre el agua fría' : 'El aire se enfría en contacto con el suelo, que pierde calor de noche';
    const fin = r.niebla
      ? `${como} hasta su punto de rocío: se satura (100 %), el vapor se condensa y aparece la niebla.`
      : `${como}. Le faltan ${num(e.t - TD)} °C para llegar al punto de rocío: ${r.hr >= 90 ? 'hay bruma, pero aún no niebla' : 'todavía no hay niebla'}.`;
    return { svg: out.join(''), casillas, lectura: `Aire a ${e.t} °C con el punto de rocío a ${TD} °C: humedad relativa del ${Math.round(r.hr)} %. ${fin}` };
  },
  prediccion: () => ({
    enunciado: 'El aire se enfría sin añadir agua. ¿La humedad relativa sube o baja?',
    opciones: { a: 'Sube', b: 'Baja', c: 'No cambia' },
    correcta: 'a',
    tras: 'El vapor es el mismo, pero el aire frío admite menos: la humedad relativa sube. Al llegar al punto de rocío llega al 100 % y aparece la niebla. Baja la temperatura y míralo.',
  }),
  partes: {
    t: 'La temperatura del aire: cuanto más frío, menos vapor admite.',
    hr: 'Humedad relativa: el vapor que tiene el aire comparado con el que podría tener a esa temperatura.',
    niebla: 'Niebla: gotitas de agua que se forman cuando el aire llega a su punto de rocío (100 % de humedad).',
    aire: 'En la de advección el aire templado y húmedo viene de otro sitio y se enfría al pasar sobre el agua fría.',
  },
};
