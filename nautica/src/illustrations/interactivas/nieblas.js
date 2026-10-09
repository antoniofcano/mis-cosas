// Meteo, variantes de niebla, ampliadas a humedad relativa y punto de rocío. Un mando: la temperatura del aire.
// Conmutador: niebla de advección (aire templado sobre mar fría), de radiación (tierra que se enfría de noche) o de
// vapor (aire muy frío sobre agua templada: el agua evapora y satura el aire frío por abajo; se ve como humo).
import { humedadRelativa, hayNiebla } from '../../nautical/meteo.js';
import { num } from './kit.js';
import { T, TXT, lienzo, rotulo, etiqueta, cartela, flecha, ondas, tierra, f1 } from '../estilo-c.js';

// Estilo C (docs/ESTILO-LAMINAS.md): el corte con el agua o la tierra abajo, el aire con su flecha rotulada, un
// termómetro con la temperatura en monoespaciada y la niebla como una banda gris rotulada (no solo por color).
const W = 358;
const H = 290;
const SUELO = 214;

/** Termómetro: tubo con la columna hasta `frac` (0–1) y la temperatura encima. */
function termometro(x, frac, t, color, { p = 't', noche = false } = {}) {
  const alto = Math.max(0, Math.min(1, frac)) * 112;
  return `<g data-parte="${p}"><rect x="${x - 7}" y="48" width="14" height="120" rx="7" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/>` +
    `<circle cx="${x}" cy="172" r="10" fill="${color}" stroke="${T.tinta}" stroke-width="1.2"/><rect x="${x - 3.5}" y="${f1(164 - alto)}" width="7" height="${f1(alto + 4)}" fill="${color}"/>` +
    `</g>${etiqueta(x, 30, `${t} °C`, { p, color: noche ? T.tinta : T.tinta })}`;
}

/** Banda de niebla (o de bruma, más clara), rotulada. */
function bandaNiebla(y0, y1, op, texto) {
  return `<g data-parte="niebla"><path d="M0,${y0 + 8} Q90,${y0 - 6} 179,${y0 + 6} T${W},${y0} L${W},${y1} L0,${y1}Z" fill="${T.apagado}" fill-opacity="${op}"/>` +
    rotulo(120, (y0 + y1) / 2 + 6, texto, { size: TXT.nota, weight: 700, estilo: 'cap', color: T.tinta }) + '</g>';
}
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
    const alt = adv
      ? `Niebla de advección: aire templado y húmedo a ${e.t} °C que llega sobre la mar fría y se enfría${pendiente ? '' : `; humedad relativa ${Math.round(r.hr)} %${r.niebla ? ', hay niebla' : ''}`}.`
      : `Niebla de radiación: noche despejada y sin viento, la tierra se enfría y enfría el aire a ${e.t} °C${pendiente ? '' : `; humedad relativa ${Math.round(r.hr)} %${r.niebla ? ', hay niebla' : ''}`}.`;
    const { out, pt, cierra } = lienzo(W, H, alt, { fondo: adv ? T.papel : T.agua2 });
    if (adv) {
      out.push(`<rect x="0" y="${SUELO}" width="${W}" height="${H - SUELO}" fill="${T.agua}"/>`, ondas(12, W - 12, SUELO + 26, { sep: 10 }));
      out.push(cartela(W - 82, SUELO + 34, 'MAR FRÍA', null, { color: T.azulTxt, ancho: 112 }));
      out.push(flecha(20, 120, 150, 120, { color: T.rojoTxt, w: 2.2, p: 'aire' }), rotulo(20, 106, 'aire templado y húmedo', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start', color: T.rojoTxt, p: 'aire' }));
    } else {
      out.push(`<path d="M52,36 a14,14 0 1 0 12,22 a10,10 0 1 1 -12,-22 z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>`, rotulo(78, 46, 'noche despejada,', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start' }), rotulo(78, 62, 'sin viento', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start' }));
      out.push(tierra(`M0,${SUELO} H${W} V${H} H0 Z`, pt));
      out.push(cartela(W - 116, SUELO + 34, 'LA TIERRA SE ENFRÍA', null, { ancho: 196 }));
      out.push(`<path d="M40,${SUELO - 4} v-24 M90,${SUELO - 4} v-24 M140,${SUELO - 4} v-24" stroke="${T.azulTxt}" stroke-width="1.2" stroke-dasharray="3 3"/>`);
    }
    // la niebla: aparece al saturarse (y una bruma cuando falta poco)
    if (!pendiente && (r.niebla || r.hr >= 90)) out.push(bandaNiebla(150, SUELO, r.niebla ? 0.55 : 0.22, r.niebla ? 'niebla' : 'bruma'));
    out.push(termometro(W - 40, (e.t - 8) / 14, e.t, T.rojo));
    if (!pendiente) out.push(etiqueta(110, H - 22, `humedad relativa ${Math.round(r.hr)} %`, { color: r.niebla ? T.magenta : T.tinta, p: 'hr' }));
    out.push(cierra());
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
  const alt = `Niebla de vapor: aire muy frío, a ${e.t} °C, sobre agua templada a ${AGUA} °C${pendiente ? '' : `: el agua está ${num(r.salto)} °C más templada${r.niebla ? ' y humea' : ''}`}.`;
  const { out, cierra } = lienzo(W, H, alt);
  out.push(`<rect data-parte="agua" x="0" y="${SUELO}" width="${W}" height="${H - SUELO}" fill="${T.agua}"/>`, ondas(12, W - 12, SUELO + 26, { sep: 10 }));
  out.push(cartela(W - 104, SUELO + 34, `AGUA TEMPLADA · ${AGUA} °C`, null, { color: T.rojoTxt, ancho: 196, p: 'agua', size: TXT.min }));
  out.push(flecha(20, 84, 150, 84, { color: T.azulTxt, w: 2.2, p: 'aire' }), rotulo(20, 70, 'aire muy frío', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start', color: T.azulTxt, p: 'aire' }));
  // el «humo»: columnas que suben del agua cuando hay salto suficiente
  const op = pendiente ? 0 : r.niebla ? 0.55 : r.salto >= SALTO - 3 ? 0.22 : 0;
  if (op) {
    const cols = [30, 85, 140, 195, 250].map((x) => `<path d="M${x},${SUELO} q-9,-14 0,-28 q9,-14 0,-28 q-6,-10 0,-20" fill="none" stroke="${T.apagado}" stroke-opacity="${op}" stroke-width="14" stroke-linecap="round"/>`).join('');
    out.push(`<g data-parte="niebla">${cols}${rotulo(112, 128, r.niebla ? 'el agua humea' : 'empieza a humear', { size: TXT.nota, weight: 700, estilo: 'cap', color: T.tinta })}</g>`);
  }
  out.push(termometro(W - 40, e.t / 22, e.t, T.azul));
  if (!pendiente) out.push(etiqueta(126, H - 22, `el agua, ${num(r.salto)} °C más templada`, { color: r.niebla ? T.magenta : T.tinta, p: 'hr' }));
  out.push(cierra());
  const casillas = [['Aire', `${e.t} °C`], ['Agua', `${AGUA} °C`], ['Diferencia', pendiente ? '?' : `${num(r.salto)} °C`]];
  if (pendiente) return { svg: out.join(''), casillas, lectura: `Aire a ${e.t} °C sobre agua a ${AGUA} °C. Responde y verás qué pasa.` };
  const fin = r.niebla
    ? 'El agua evapora y el vapor satura el aire frío que tiene encima: el agua «humea». Es una niebla de evaporación, no de enfriamiento, y suele ser poco espesa.'
    : `Aún no: con el aire solo ${num(r.salto)} °C más frío que el agua, el vapor se mezcla sin llegar a saturar. Enfría más el aire.`;
  return { svg: out.join(''), casillas, lectura: `Aire a ${e.t} °C sobre agua templada a ${AGUA} °C. ${fin}` };
}
