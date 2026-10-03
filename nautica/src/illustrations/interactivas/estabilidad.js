// Estabilidad: un peso que se sube o se baja y se traslada de banda. Una ola deja el barco escorado 15° a estribor:
// se ven G, B (o C, centro de carena), M y el brazo GZ; el barco adriza o vuelca.
import { estabilidad as calc, BARCO } from '../../nautical/estabilidad.js';
import { svgOpen, flecha, texto, num, f1, rad } from './kit.js';

const W = 320;
const H = 300;
const K0 = [160, 232]; // la quilla en pantalla
const PX = 24; // píxeles por metro
const ESCORA = 15;

/** Punto del barco (x: metros a estribor de crujía, z: metros sobre la quilla) a pantalla, con el barco escorado. */
function pant([x, z], esc = ESCORA) {
  const c = Math.cos(rad(esc));
  const s = Math.sin(rad(esc));
  return [K0[0] + (x * c + z * s) * PX, K0[1] - (z * c - x * s) * PX];
}
const lugar = (h) => (h <= 0.6 ? 'en la sentina' : h <= 2 ? 'a la altura de la cubierta' : h <= 3.9 ? 'en la cabina alta' : 'en lo alto del palo');
const banda = (t) => (t === 0 ? 'en crujía' : `${num(Math.abs(t))} m a ${t > 0 ? 'estribor' : 'babor'}`);

export const estabilidad = {
  mandos: [
    { id: 'altura', tipo: 'rango', etiqueta: 'Altura del peso', min: 0, max: 6, paso: 0.5, texto: (v) => `${num(v)} m, ${lugar(v)}`, extremos: ['sentina', 'cubierta', 'palo'] },
    { id: 'traslado', tipo: 'rango', etiqueta: 'Traslado del peso', min: -2, max: 2, paso: 0.5, texto: (v) => banda(v), extremos: ['babor (banda alta)', 'crujía', 'estribor (banda baja)'] },
  ],
  estado: (spec) => ({ altura: Number(spec.altura ?? ({ inestable: 5, indiferente: 3.9 }[spec.caso] ?? 1.5)), traslado: Number(spec.traslado ?? 0) }),
  // Indiferente: G sobre M (GM ≈ 0) y el peso en crujía: no hay par y el barco se queda con la escora.
  calcular: (e) => { const r = calc({ altura: e.altura, traslado: e.traslado, escora: ESCORA }); return { ...r, indiferente: e.traslado === 0 && Math.abs(r.GM) < 0.005 }; },
  pie: () => 'Estable: M por encima de G, el par adriza. Indiferente: G en M, se queda escorado. Inestable: G por encima de M, el par vuelca. Subir pesos sube G; bajarlos lo baja.',
  dibujar(e, r) {
    const signo = (n) => num(n, 2).replace('-', '−');
    // --- vista 1: el barco escorado con el peso
    const out = [svgOpen(W, H, `Barco escorado ${ESCORA}° con el peso ${lugar(e.altura)}`)];
    out.push(`<rect x="0" y="${K0[1] - 1.0 * PX}" width="${W}" height="${H - (K0[1] - 1.0 * PX)}" fill="var(--l-mar)"/>`);
    const casco = [[-2, 2], [2, 2], [1.9, 0.9], [1.2, 0.15], [0, 0], [-1.2, 0.15], [-1.9, 0.9]].map(pant);
    out.push(`<polygon points="${casco.map((q) => q.map(f1).join(',')).join(' ')}" fill="var(--l-casco)" stroke="var(--text)" stroke-width="1.5" opacity=".9"/>`);
    const [m0, m1] = [pant([0, 2]), pant([0, 6.4])];
    out.push(`<line x1="${f1(m0[0])}" y1="${f1(m0[1])}" x2="${f1(m1[0])}" y2="${f1(m1[1])}" stroke="var(--text)" stroke-width="2.5"/>`);
    const p = pant([e.traslado, e.altura]);
    out.push(`<rect data-parte="peso" x="${f1(p[0] - 10)}" y="${f1(p[1] - 10)}" width="20" height="20" rx="3" fill="var(--l-a)" stroke="var(--text)"/>`);
    const G0 = pant([r.GGt, r.KG]);
    out.push(`<circle data-parte="g" cx="${f1(G0[0])}" cy="${f1(G0[1])}" r="6" fill="var(--l-r)" stroke="var(--surface)" stroke-width="1.5"/>`);
    out.push(texto(W - 12, 26, r.indiferente ? 'se queda así' : r.adriza ? 'adriza ↺' : r.estable ? 'escora más ↻' : 'vuelca ↻', { anchor: 'end', size: 22, weight: 700, color: r.indiferente ? 'var(--l-a)' : r.adriza ? 'var(--l-m)' : 'var(--l-r)', p: 'gz' }));
    out.push(texto(12, H - 10, `visto desde popa · una ola lo escora ${ESCORA}°`, { anchor: 'start', size: 15, weight: 400, color: 'var(--muted)' }));
    out.push('</svg>');

    // --- vista 2: detalle ampliado de B, G, M y el brazo GZ (en el plano vertical, con el agua horizontal)
    const DW = 320;
    const DH = 260;
    const ZM = 150; // píxeles por metro en el detalle
    const s = Math.sin(rad(ESCORA));
    const c = Math.cos(rad(ESCORA));
    const tierra = ([x, z]) => [x * c + z * s, z * c - x * s]; // metros, barco escorado
    const Mt = tierra([0, BARCO.KM]);
    const Gt = tierra([r.GGt, r.KG]);
    const Bt = [Mt[0], tierra([0, BARCO.KB])[1]]; // B en la vertical de M
    const cx = DW / 2 - Mt[0] * ZM;
    const top = 44;
    const zMax = Mt[1] + 0.2;
    const P = ([x, z]) => [cx + x * ZM, top + (zMax - z) * ZM];
    const [M, G, B] = [P(Mt), P(Gt), P(Bt)];
    const d = [`<svg viewBox="0 0 ${DW} ${DH}" class="il lam-svg" role="img" aria-label="Detalle ampliado: GM ${signo(r.GM)} m, GZ ${signo(r.GZ)} m"><rect width="${DW}" height="${DH}" rx="10" fill="var(--l-fondo)"/>`];
    d.push(`<line x1="${f1(M[0])}" y1="20" x2="${f1(M[0])}" y2="${DH - 30}" stroke="var(--l-v)" stroke-width="1.5" stroke-dasharray="5 4" data-parte="b"/>`);
    // crujía escorada (de la quilla hacia arriba)
    const q0 = P(tierra([0, BARCO.KB - 0.15]));
    const q1 = P(tierra([0, BARCO.KM + 0.15]));
    d.push(`<line x1="${f1(q0[0])}" y1="${f1(q0[1])}" x2="${f1(q1[0])}" y2="${f1(q1[1])}" stroke="var(--muted)" stroke-width="1.5"/>`, texto(q1[0] + 6, q1[1] + 4, 'crujía', { anchor: 'start', size: 13, weight: 400, color: 'var(--muted)' }));
    d.push(flecha(B[0], B[1], B[0], B[1] - 50, 'var(--l-v)', 3, 'b'), flecha(G[0], G[1], G[0], G[1] + 50, 'var(--l-r)', 3, 'g'));
    const Z = [M[0], G[1]];
    d.push(`<line data-parte="gz" x1="${f1(G[0])}" y1="${f1(G[1])}" x2="${f1(Z[0])}" y2="${f1(Z[1])}" stroke="${r.adriza ? 'var(--l-m)' : 'var(--l-r)'}" stroke-width="5"/>`);
    d.push(texto((G[0] + Z[0]) / 2, G[1] - 10, 'GZ', { size: 15, weight: 700, color: r.adriza ? 'var(--l-m)' : 'var(--l-r)', p: 'gz' }));
    for (const [pt, t, col, pp] of [[G, 'G', 'var(--l-r)', 'g'], [B, 'B', 'var(--l-v)', 'b'], [M, 'M', 'var(--l-p)', 'm']]) {
      const izq = pt[0] < M[0] - 2 || (pp === 'g' && G[0] <= M[0]);
      d.push(`<circle data-parte="${pp}" cx="${f1(pt[0])}" cy="${f1(pt[1])}" r="6" fill="${col}"/>`, texto(pt[0] + (izq ? -12 : 12), pt[1] + 6, t, { color: col, p: pp, size: 18, weight: 700, anchor: izq ? 'end' : 'start' }));
    }
    d.push(texto(12, 26, `GM ${signo(r.GM)} m`, { anchor: 'start', size: 18, weight: 700, color: r.estable ? 'var(--l-m)' : 'var(--l-r)', p: 'm' }));
    d.push(texto(12, DH - 10, 'ampliado ×6', { anchor: 'start', size: 13, weight: 400, color: 'var(--muted)' }));
    d.push('</svg>');

    const estado = r.indiferente
      ? 'G coincide con M (GM 0): no hay par que lo adrice ni que lo vuelque, y el barco se queda con la escora. Es el equilibrio indiferente.'
      : r.adriza
      ? `M queda por encima de G (GM ${signo(r.GM)} m): el empuje y el peso forman un par que adriza el barco.`
      : r.estable
        ? 'G aún está por debajo de M, pero el peso trasladado a la banda baja vence al par: el barco no se recupera y escora más.'
        : `G está por encima de M (GM ${signo(r.GM)} m): el par vuelca el barco en vez de adrizarlo.`;
    return {
      vistas: [{ svg: out.join(''), pie: 'El barco y el peso' }, { svg: d.join(''), pie: 'G, B y M de cerca (ampliado)' }],
      apiladas: true,
      lectura: `Peso ${lugar(e.altura)} y ${banda(e.traslado)}. ${estado}`,
    };
  },
  prediccion: () => ({
    enunciado: 'Si subes peso a cubierta, ¿el barco adriza mejor o peor?',
    opciones: { a: 'Mejor', b: 'Peor', c: 'Igual' },
    correcta: 'b',
    tras: 'Al subir un peso sube el centro de gravedad G, baja la altura metacéntrica GM y el brazo adrizante GZ se hace más corto. Si G llega a pasar por encima de M, el barco vuelca. Sube y baja el peso y míralo.',
  }),
  partes: {
    g: 'G, centro de gravedad: donde se concentra el peso del barco. Sube si subes pesos y se va hacia la banda a la que los trasladas.',
    b: 'B (o C), centro de carena: donde empuja el agua hacia arriba. Al escorar se va hacia la banda que se hunde.',
    m: 'M, metacentro: el punto por el que pasa la vertical del empuje al escorar un poco. Si G queda por debajo de M, el barco es estable.',
    gz: 'GZ, brazo adrizante: la distancia entre la vertical del peso y la del empuje. Cuanto más largo, más fuerza para adrizar.',
    peso: 'El peso que mueves: subirlo sube G; trasladarlo a una banda lleva G hacia esa banda.',
  },
  botonesPartes: [['g', 'G'], ['b', 'B'], ['m', 'M'], ['gz', 'GZ']],
};
