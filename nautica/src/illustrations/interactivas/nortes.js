// Nortes: verdadero, magnético y de aguja. Mandos: declinación y desvío. Se ve el signo de la corrección total.
import { correccionTotal, signoCt, ewTexto } from '../../nautical/compass.js';
import { conSigno, num } from './kit.js';
import { T, TXT, lienzo, rotulo, cartela, etiqueta, referencia, arcoD, pol, f1, parte } from '../estilo-c.js';

// Estilo C (docs/ESTILO-LAMINAS.md): los tres nortes salen del mismo punto, como en la rosa de una carta; cada ángulo
// va acotado con su arco y su etiqueta en monoespaciada. Convenio del examen: lo que es E suma (+), lo que es W resta (−).
const W = 358;
const H = 330;
const CX = 179;
const CY = 300;
const COL = { nv: T.tinta, nm: T.verdeTxt, na: T.azulTxt, ct: T.magenta };

/** Los ángulos se exageran para que se vean: ×3, o menos si son grandes (el mayor no pasa de 36° en el dibujo). */
const factor = (e, ct) => Math.min(3, Math.floor((36 / Math.max(Math.abs(e.dm), Math.abs(ct), Math.abs(e.desvio), 1)) * 10) / 10);

/** Un norte: línea desde el centro con su punta y su nombre; el trazo lo distingue también sin color. */
function norte(deg, L, nombre, color, p, { dash = '', lado = 0 } = {}) {
  const [x, y] = pol(CX, CY, deg, L);
  const [hx, hy] = pol(CX, CY, deg, L - 13);
  const [ax, ay] = pol(hx, hy, deg + 90, 5);
  const [bx, by] = pol(hx, hy, deg - 90, 5);
  const [tx, ty] = pol(CX, CY, deg, L + 12);
  // lado: si coincide con otro norte, el nombre se aparta a un lado de la punta
  const nombreEl = lado ? rotulo(x + lado * 9, y + 6, nombre, { size: TXT.nombre, weight: 700, estilo: 'serif', color, p, anchor: lado > 0 ? 'start' : 'end' })
    : rotulo(tx, ty + 5, nombre, { size: TXT.nombre, weight: 700, estilo: 'serif', color, p });
  return `<g${parte(p)}><line x1="${CX}" y1="${CY}" x2="${f1(hx)}" y2="${f1(hy)}" stroke="${color}" stroke-width="${p === 'nv' ? 1.8 : 1.5}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>` +
    `<polygon points="${f1(x)},${f1(y)} ${f1(ax)},${f1(ay)} ${f1(bx)},${f1(by)}" fill="${color}"/>${nombreEl}</g>`;
}

/**
 * Cotas de ángulo: cada arco (de a a b en grados ya exagerados) con su etiqueta en una columna a un lado, unida al
 * arco con una línea de referencia; las etiquetas de un mismo lado no se pisan.
 */
function cotas(lista) {
  const out = [];
  const et = [];
  for (const { a, b, r, t, color, p, w = 1.2 } of lista) {
    if (Math.abs(a - b) < 0.01) continue;
    const [d0, d1] = a < b ? [a, b] : [b, a];
    const mid = (d0 + d1) / 2;
    const tope = (d) => { const [x1, y1] = pol(CX, CY, d, r - 5); const [x2, y2] = pol(CX, CY, d, r + 5); return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${color}" stroke-width="1.2"/>`; };
    out.push(`<path${parte(p)} d="${arcoD(CX, CY, r, d0, d1)}" fill="none" stroke="${color}" stroke-width="${w}"/>`, `<g${parte(p)}>${tope(d0)}${tope(d1)}</g>`);
    const [mx, my] = pol(CX, CY, mid, r);
    et.push({ mx, my, y: my, lado: mid < 0 ? -1 : 1, t, color, p });
  }
  for (const lado of [-1, 1]) {
    const grupo = et.filter((x) => x.lado === lado).sort((u, v) => u.y - v.y);
    for (let i = 1; i < grupo.length; i++) grupo[i].y = Math.max(grupo[i].y, grupo[i - 1].y + 24);
    for (const x of grupo) {
      const ex = lado < 0 ? 50 : W - 50;
      out.push(`<g${parte(x.p)}>${referencia(x.mx, x.my, ex - lado * 32, x.y, { color: x.color })}${etiqueta(ex, x.y, x.t, { color: x.color })}</g>`);
    }
  }
  return out.join('');
}

function dibujaNortes(e, r, pendiente) {
  const K = factor(e, r.ct);
  const alt = pendiente
    ? `Norte verdadero y norte magnético separados por la declinación, ${ewTexto(e.dm)}. El norte de aguja aún no se dibuja.`
    : `Los tres nortes desde un mismo punto: verdadero, magnético a ${ewTexto(e.dm)} del verdadero (declinación) y de aguja a ${ewTexto(e.desvio)} del magnético (desvío). La corrección total, de ${conSigno(r.ct)}, es el ángulo del verdadero al de aguja.`;
  const { out, cierra } = lienzo(W, H, alt);
  // cartelas: los datos y la corrección total
  out.push(cartela(62, 30, 'DECLINACIÓN', `dm ${ewTexto(e.dm)}`, { color: COL.nm, ancho: 108, p: 'nm' }));
  out.push(cartela(179, 30, 'DESVÍO', `Δ ${ewTexto(e.desvio)}`, { color: COL.na, ancho: 108, p: 'na' }));
  out.push(cartela(296, 30, 'CORRECCIÓN', pendiente ? 'Ct ?' : `Ct ${conSigno(r.ct)}`, { color: COL.ct, ancho: 108, p: 'ct' }));
  // cotas: dm del verdadero al magnético; Δ del magnético al de aguja; Ct (magenta) del verdadero al de aguja
  const lista = [{ a: 0, b: e.dm * K, r: 128, t: `dm ${ewTexto(e.dm)}`, color: COL.nm, p: 'nm' }];
  if (!pendiente) lista.push({ a: e.dm * K, b: r.ct * K, r: 100, t: `Δ ${ewTexto(e.desvio)}`, color: COL.na, p: 'na' }, { a: 0, b: r.ct * K, r: 72, t: `Ct ${conSigno(r.ct)}`, color: COL.ct, p: 'ct', w: 1.6 });
  out.push(cotas(lista));
  // los nortes: verdadero (continuo), magnético (a trazos) y de aguja (trazo y punto); si dos coinciden, sus nombres se apartan
  const cerca = (x, y) => Math.abs(x - y) * K < 9;
  out.push(norte(0, 230, 'Nv', COL.nv, 'nv'));
  out.push(norte(e.dm * K, 216, 'Nm', COL.nm, 'nm', { dash: '7 4', lado: cerca(e.dm, 0) ? -1 : 0 }));
  if (!pendiente) out.push(norte(r.ct * K, 202, 'Na', COL.na, 'na', { dash: '9 3 2 3', lado: cerca(r.ct, e.dm) || cerca(r.ct, 0) ? 1 : 0 }));
  out.push(`<circle cx="${CX}" cy="${CY}" r="3.5" fill="${T.tinta}"/>`);
  out.push(rotulo(14, H - 14, 'W · resta', { size: TXT.min, estilo: 'mono', anchor: 'start', color: T.apagado }), rotulo(W - 14, H - 14, 'suma · E', { size: TXT.min, estilo: 'mono', anchor: 'end', color: T.apagado }));
  out.push(rotulo(CX, H - 14, `ángulos ×${num(K)}`, { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  out.push(cierra());
  return out.join('');
}

export const nortes = {
  mandos: [
    { id: 'dm', tipo: 'rango', etiqueta: 'Declinación magnética', min: -15, max: 15, paso: 1, texto: (v) => ewTexto(v), extremos: ['W (resta)', 'E (suma)'] },
    { id: 'desvio', tipo: 'rango', etiqueta: 'Desvío de la aguja', min: -10, max: 10, paso: 1, texto: (v) => ewTexto(v), extremos: ['W (resta)', 'E (suma)'] },
  ],
  estado: (spec) => ({ dm: Math.round(Number(spec.dm ?? -4)), desvio: Math.round(Number(spec.desvio ?? 2)) }),
  pie: (e) => {
    const ct = correccionTotal(e.dm, e.desvio);
    return `Ct = dm + Δ = ${conSigno(e.dm)} ${e.desvio < 0 ? '−' : '+'} ${Math.abs(e.desvio)}° = ${conSigno(ct)}. Rv = Ra + Ct y Dv = Da + Ct: de aguja a verdadero se suma la Ct con su signo.`;
  },
  calcular: (e) => {
    const ct = correccionTotal(e.dm, e.desvio);
    return { ct, signo: signoCt(ct) };
  },
  dibujar(e, r, { pendiente = false } = {}) {
    const svg = dibujaNortes(e, r, pendiente);
    if (pendiente) return { svg, lectura: `Declinación ${ewTexto(e.dm)} y desvío ${ewTexto(e.desvio)}. Responde la pregunta y verás dónde queda el norte de aguja y el signo de la corrección total.` };
    const lado = r.ct < 0 ? `${Math.abs(r.ct)}° al oeste del` : r.ct > 0 ? `${r.ct}° al este del` : 'justo en el';
    const lectura = `Declinación ${ewTexto(e.dm)} (${conSigno(e.dm)}) y desvío ${ewTexto(e.desvio)} (${conSigno(e.desvio)}): Ct = ${conSigno(e.dm)} ${e.desvio < 0 ? '−' : '+'} ${Math.abs(e.desvio)}° = ${conSigno(r.ct)}, ${r.signo}. El norte de aguja queda ${lado} norte verdadero. De aguja a verdadero se suma la Ct con su signo: Rv = Ra + Ct.`;
    return { svg, lectura };
  },
  prediccion(e) {
    const ct = correccionTotal(e.dm, e.desvio);
    const signo = signoCt(ct);
    return {
      enunciado: `Con declinación ${ewTexto(e.dm)} y desvío ${ewTexto(e.desvio)}, ¿la corrección total es positiva o negativa?`,
      opciones: { a: 'Positiva', b: 'Negativa', c: 'Cero' },
      correcta: signo === 'positiva' ? 'a' : signo === 'negativa' ? 'b' : 'c',
      tras: `Ct = dm + Δ, cada uno con su signo: lo que es E suma y lo que es W resta. Aquí ${conSigno(e.dm)} ${e.desvio < 0 ? '−' : '+'} ${Math.abs(e.desvio)}° = ${conSigno(ct)}. Mueve los mandos y mira hacia dónde gira el norte de aguja.`,
    };
  },
  partes: {
    nv: 'Norte verdadero (Nv): el del meridiano, el de la carta. Es la referencia de todo.',
    nm: 'Norte magnético (Nm): adonde apuntaría una aguja sin hierros cerca. Se separa del verdadero la declinación (dm), que viene en la carta.',
    na: 'Norte de aguja (Na): adonde apunta la aguja de tu barco. Se separa del magnético el desvío (Δ), que depende del rumbo y sale de la tablilla.',
    ct: 'Corrección total (Ct): el ángulo entre el norte verdadero y el de aguja. Ct = dm + Δ. Si el Na queda al E del Nv es positiva; al W, negativa.',
  },
};
