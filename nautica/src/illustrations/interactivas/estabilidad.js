// Estabilidad: un peso que se sube o se baja y se traslada de banda. Una ola deja el barco escorado 15° a estribor:
// se ven G, B (o C, centro de carena), M y el brazo GZ; el barco adriza o vuelca.
import { estabilidad as calc, BARCO } from '../../nautical/estabilidad.js';
import { num } from './kit.js';
import { T, TXT, lienzo, rotulo, flecha as flechaC, cota, ondas, f1, rad } from '../estilo-c.js';

// Estilo C (docs/ESTILO-LAMINAS.md): colores de styles/laminas.css; G, B, M y GZ llevan siempre su letra.
const texto = (x, y, t, { color = T.tinta, size = 14, anchor = 'middle', weight = 600, p = null, serif = false } = {}) => rotulo(x, y, t, { size: Math.max(size, TXT.min), anchor, weight, color, p, estilo: serif ? 'serif' : 'sans' });
const flecha = (x1, y1, x2, y2, color, w, p) => flechaC(x1, y1, x2, y2, { color, w: Math.min(w, 2.4), p });

const W = 358;
const H = 300;
const K0 = [179, 238]; // la quilla en pantalla
const PX = 30; // píxeles por metro
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
    const v1 = lienzo(W, H, `Barco escorado ${ESCORA}° visto desde popa, con el peso ${lugar(e.altura)} y ${banda(e.traslado)}: ${r.indiferente ? 'se queda escorado' : r.adriza ? 'adriza' : r.estable ? 'escora más' : 'vuelca'}.`);
    const out = v1.out;
    out.push(`<rect x="0" y="${K0[1] - 1.0 * PX}" width="${W}" height="${H - (K0[1] - 1.0 * PX)}" fill="${T.agua}"/>`, ondas(10, W - 10, K0[1] - 1.0 * PX + 14, { sep: 9 }));
    const casco = [[-2, 2], [2, 2], [1.9, 0.9], [1.2, 0.15], [0, 0], [-1.2, 0.15], [-1.9, 0.9]].map(pant);
    out.push(`<polygon points="${casco.map((q) => q.map(f1).join(',')).join(' ')}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.5" stroke-linejoin="round"/>`);
    const [m0, m1] = [pant([0, 2]), pant([0, 6.4])];
    out.push(`<line x1="${f1(m0[0])}" y1="${f1(m0[1])}" x2="${f1(m1[0])}" y2="${f1(m1[1])}" stroke="${T.tinta}" stroke-width="2.5"/>`);
    const p = pant([e.traslado, e.altura]);
    out.push(`<rect data-parte="peso" x="${f1(p[0] - 10)}" y="${f1(p[1] - 10)}" width="20" height="20" rx="3" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1.2"/>`, texto(p[0] + 16, p[1] + 5, 'peso', { anchor: 'start', size: 12.5, weight: 400, serif: true, p: 'peso' }));
    const G0 = pant([r.GGt, r.KG]);
    out.push(`<circle data-parte="g" cx="${f1(G0[0])}" cy="${f1(G0[1])}" r="6" fill="${T.rojoTxt}" stroke="${T.papel}" stroke-width="1.5"/>`, texto(G0[0] - 10, G0[1] + 5, 'G', { anchor: 'end', size: 14, weight: 700, color: T.rojoTxt, p: 'g', serif: true }));
    out.push(texto(W - 12, 26, r.indiferente ? 'se queda así' : r.adriza ? 'adriza' : r.estable ? 'escora más' : 'vuelca', { anchor: 'end', size: 22, weight: 700, color: r.indiferente ? T.tinta : r.adriza ? T.verdeTxt : T.rojoTxt, p: 'gz', serif: true }));
    out.push(texto(12, H - 10, `visto desde popa · una ola lo escora ${ESCORA}°`, { anchor: 'start', size: 12.5, weight: 400, color: T.apagado, serif: true }));
    out.push(v1.cierra());

    // --- vista 2: detalle ampliado de B, G, M y el brazo GZ (en el plano vertical, con el agua horizontal)
    const DW = 358;
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
    const v2 = lienzo(DW, DH, `Detalle ampliado de G, B y M: GM ${signo(r.GM)} m, GZ ${signo(r.GZ)} m.`);
    const d = v2.out;
    d.push(`<line x1="${f1(M[0])}" y1="20" x2="${f1(M[0])}" y2="${DH - 30}" stroke="${T.azulTxt}" stroke-width="1" stroke-dasharray="5 4" data-parte="b"/>`);
    // crujía escorada (de la quilla hacia arriba)
    const q0 = P(tierra([0, BARCO.KB - 0.15]));
    const q1 = P(tierra([0, BARCO.KM + 0.15]));
    d.push(`<line x1="${f1(q0[0])}" y1="${f1(q0[1])}" x2="${f1(q1[0])}" y2="${f1(q1[1])}" stroke="${T.apagado}" stroke-width="1.2" stroke-dasharray="7 4"/>`, texto(q1[0] + 6, q1[1] + 4, 'crujía', { anchor: 'start', size: 12.5, weight: 400, color: T.apagado, serif: true }));
    d.push(flecha(B[0], B[1], B[0], B[1] - 50, T.azulTxt, 2, 'b'), flecha(G[0], G[1], G[0], G[1] + 50, T.rojoTxt, 2, 'g'));
    const Z = [M[0], G[1]];
    d.push(`<line data-parte="gz" x1="${f1(G[0])}" y1="${f1(G[1])}" x2="${f1(Z[0])}" y2="${f1(Z[1])}" stroke="${r.adriza ? T.verdeTxt : T.rojoTxt}" stroke-width="4"/>`);
    d.push(texto((G[0] + Z[0]) / 2, G[1] - 10, 'GZ', { size: 15, weight: 700, color: r.adriza ? T.verdeTxt : T.rojoTxt, p: 'gz', serif: true }));
    // GM, acotada sobre la crujía
    if (Math.hypot(M[0] - G[0], M[1] - G[1]) > 14) d.push(cota(M[0] + 54, M[1], M[0] + 54, M[1] + (P(tierra([0, r.KG]))[1] - P(tierra([0, BARCO.KM]))[1]), 'GM', { color: T.magenta, p: 'm' }));
    for (const [pt, t, col, pp] of [[G, 'G', T.rojoTxt, 'g'], [B, 'B', T.azulTxt, 'b'], [M, 'M', T.magenta, 'm']]) {
      const izq = pt[0] < M[0] - 2 || (pp === 'g' && G[0] <= M[0]);
      d.push(`<circle data-parte="${pp}" cx="${f1(pt[0])}" cy="${f1(pt[1])}" r="6" fill="${col}"/>`, texto(pt[0] + (izq ? -12 : 12), pt[1] + 6, t, { color: col, p: pp, size: 18, weight: 700, anchor: izq ? 'end' : 'start', serif: true }));
    }
    d.push(texto(16, 30, `GM ${signo(r.GM)} m`, { anchor: 'start', size: 18, weight: 700, color: r.estable ? T.verdeTxt : T.rojoTxt, p: 'm', serif: true }));
    d.push(texto(14, DH - 12, 'ampliado ×6', { anchor: 'start', size: 12.5, weight: 400, color: T.apagado, serif: true }));
    d.push(v2.cierra());

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
