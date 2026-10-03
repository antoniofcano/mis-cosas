// Meteo, variantes de niebla, ampliadas a humedad relativa y punto de rocío. Un mando: la temperatura del aire.
// Conmutador: niebla de advección (aire templado sobre mar fría), de radiación (tierra que se enfría de noche) o de
// vapor (aire muy frío sobre agua templada: el agua evapora y satura el aire frío por abajo; se ve como humo).
import { humedadRelativa, hayNiebla } from '../../nautical/meteo.js';
import { svgOpen, flecha, texto, num } from './kit.js';

const W = 320;
const H = 250;
const TD = 12; // punto de rocío del ejemplo: la cantidad de vapor no cambia
const AGUA = 16; // niebla de vapor: agua templada a 16 °C
const SALTO = 8; // y aparece cuando el aire está unos 8 °C (o más) más frío que el agua
const PIE = {
  adveccion: 'Aire templado y húmedo que se desplaza sobre una superficie más fría (agua fría) y se enfría hasta saturarse. Es la niebla típica de la mar y puede durar días aunque sople el viento.',
  radiacion: 'Se forma en tierra en noches despejadas y con poco viento, cuando el suelo pierde calor por radiación. Suele disiparse por la mañana al calentar el sol y afecta poco a la mar abierta.',
  vapor: 'Aire muy frío que pasa sobre agua más templada: el agua evapora y el vapor satura el aire frío de abajo, que humea como una olla. Es de evaporación, no de enfriamiento: se ve en invierno en dársenas, ríos y mares cerrados.',
};

export const nieblas = {
  conmutador: { id: 'tipo', etiqueta: 'Tipo de niebla', opciones: [['adveccion', 'De advección (mar)'], ['radiacion', 'De radiación (tierra)'], ['vapor', 'De vapor (agua templada)']] },
  mandos: [
    { id: 't', tipo: 'rango', etiqueta: 'Temperatura del aire', min: 0, max: 22, paso: 1, texto: (v) => `${v} °C`, extremos: ['más fría', 'más templada'] },
  ],
  estado: (spec) => {
    const tipo = { 'niebla-radiacion': 'radiacion', 'niebla-vapor': 'vapor' }[spec.sistema] ?? 'adveccion';
    return { tipo, t: Number(spec.t ?? (tipo === 'vapor' ? 4 : 18)) };
  },
  calcular: (e) => (e.tipo === 'vapor'
    ? { hr: e.t <= AGUA - SALTO ? 100 : Math.max(60, 100 - 5 * (e.t - (AGUA - SALTO))), niebla: e.t <= AGUA - SALTO, salto: AGUA - e.t }
    : { hr: humedadRelativa(e.t, TD), niebla: hayNiebla(e.t, TD) }),
  pie: (e) => PIE[e.tipo],
  dibujar(e, r, { pendiente = false } = {}) {
    if (e.tipo === 'vapor') return vapor(e, r, pendiente);
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
    aire: 'En la de advección el aire templado y húmedo viene de otro sitio y se enfría al pasar sobre el agua fría; en la de vapor, el aire es muy frío y el agua, más templada.',
    agua: 'El agua templada evapora: en la niebla de vapor, ese vapor satura el aire frío que tiene encima.',
  },
};

/** Niebla de vapor: aire frío sobre agua templada; con salto de unos 8 °C o más, el agua «humea». */
function vapor(e, r, pendiente) {
  const out = [svgOpen(W, H, 'Niebla de vapor')];
  out.push(`<rect width="${W}" height="${H}" rx="10" fill="var(--l-cielo)"/>`);
  out.push(`<rect data-parte="agua" x="0" y="180" width="${W}" height="70" fill="var(--l-mar)"/>`, texto(W - 12, 204, `agua templada · ${AGUA} °C`, { anchor: 'end', size: 15, weight: 700, color: 'var(--l-r)', p: 'agua' }));
  out.push(flecha(20, 72, 140, 72, 'var(--l-v)', 3, 'aire'), texto(20, 60, 'aire muy frío', { anchor: 'start', size: 14, color: 'var(--l-v)', p: 'aire' }));
  // termómetro del aire
  out.push(`<rect x="${W - 44}" y="40" width="14" height="110" rx="7" fill="var(--surface)" stroke="var(--text)"/>`);
  const alto = (e.t / 22) * 100;
  out.push(`<rect data-parte="t" x="${W - 41}" y="${147 - alto}" width="8" height="${alto}" rx="4" fill="var(--l-v)"/>`, texto(W - 37, 30, `${e.t} °C`, { size: 15, weight: 700, p: 't' }));
  // el «humo»: columnas que suben del agua cuando hay salto suficiente
  const op = pendiente ? 0 : r.niebla ? 0.85 : r.salto >= SALTO - 3 ? 0.3 : 0;
  if (op) {
    for (const x of [30, 85, 140, 195, 250]) out.push(`<path data-parte="niebla" d="M${x},180 q-9,-12 0,-24 q9,-12 0,-24 q-6,-8 0,-16" fill="none" stroke="var(--l-niebla)" stroke-width="14" stroke-linecap="round" opacity="${op}"/>`);
  }
  if (!pendiente) out.push(texto(14, H - 12, `el agua está ${num(r.salto)} °C más templada`, { anchor: 'start', size: 16, weight: 700, color: r.niebla ? 'var(--l-r)' : 'var(--text)', p: 'hr' }));
  out.push('</svg>');
  const casillas = [['Aire', `${e.t} °C`], ['Agua', `${AGUA} °C`], ['Diferencia', pendiente ? '?' : `${num(r.salto)} °C`]];
  if (pendiente) return { svg: out.join(''), casillas, lectura: `Aire a ${e.t} °C sobre agua a ${AGUA} °C. Responde y verás qué pasa.` };
  const fin = r.niebla
    ? 'El agua evapora y el vapor satura el aire frío que tiene encima: el agua «humea». Es una niebla de evaporación, no de enfriamiento, y suele ser poco espesa.'
    : `Aún no: con el aire solo ${num(r.salto)} °C más frío que el agua, el vapor se mezcla sin llegar a saturar. Enfría más el aire.`;
  return { svg: out.join(''), casillas, lectura: `Aire a ${e.t} °C sobre agua templada a ${AGUA} °C. ${fin}` };
}
