// Nortes: verdadero, magnético y de aguja. Mandos: declinación y desvío. Se ve el signo de la corrección total.
import { correccionTotal, signoCt, ewTexto } from '../../nautical/compass.js';
import { svgOpen, flecha, arco, texto, pol, conSigno } from './kit.js';

const W = 300;
const H = 250;
const CX = 150;
const CY = 232;
const K = 3; // los ángulos se exageran ×3 para que se vean

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
    const L = 150;
    const out = [svgOpen(W, H, pendiente ? 'Norte verdadero y magnético' : `Norte verdadero, magnético y de aguja. Corrección total ${conSigno(r.ct)}`)];
    const nv = pol(CX, CY, 0, L);
    const nm = pol(CX, CY, e.dm * K, L - 6);
    const na = pol(CX, CY, r.ct * K, L - 24);
    out.push(flecha(CX, CY, nv[0], nv[1], 'var(--l-v)', 3.5, 'nv'), texto(nv[0], nv[1] - 8, 'Nv', { color: 'var(--l-v)', p: 'nv', size: 20, weight: 700 }));
    out.push(flecha(CX, CY, nm[0], nm[1], 'var(--l-m)', 3, 'nm'), texto(nm[0] + (e.dm < 0 ? -10 : 10), nm[1] - 4, 'Nm', { color: 'var(--l-m)', p: 'nm', size: 20, weight: 700, anchor: e.dm < 0 ? 'end' : 'start' }));
    if (!pendiente) out.push(flecha(CX, CY, na[0], na[1], 'var(--l-a)', 3, 'na'), texto(na[0] + (r.ct < 0 ? -10 : 10), na[1] + 14, 'Na', { color: 'var(--l-a)', p: 'na', size: 20, weight: 700, anchor: r.ct < 0 ? 'end' : 'start' }));
    out.push(arco(CX, CY, 118, 0, e.dm * K, 'var(--l-m)', 2.5, 'nm'));
    if (!pendiente) out.push(arco(CX, CY, 92, e.dm * K, r.ct * K, 'var(--l-a)', 2.5, 'na'), arco(CX, CY, 60, 0, r.ct * K, 'var(--l-r)', 5, 'ct'));
    out.push(texto(14, 24, `dm ${ewTexto(e.dm)}`, { color: 'var(--l-m)', anchor: 'start', p: 'nm', size: 18 }));
    out.push(texto(14, 48, `Δ ${ewTexto(e.desvio)}`, { color: 'var(--l-a)', anchor: 'start', p: 'na', size: 18 }));
    out.push(texto(W - 14, 24, pendiente ? 'Ct ?' : `Ct ${conSigno(r.ct)}`, { color: 'var(--l-r)', anchor: 'end', p: 'ct', size: 20, weight: 700 }));
    if (!pendiente) out.push(texto(W - 14, 48, r.signo, { color: 'var(--l-r)', anchor: 'end', p: 'ct', size: 18 }));
    out.push(`<circle cx="${CX}" cy="${CY}" r="4" fill="var(--text)"/>`);
    out.push(texto(W - 14, H - 8, 'ángulos exagerados ×3', { color: 'var(--muted)', size: 14, weight: 400, anchor: 'end' }));
    out.push('</svg>');
    if (pendiente) return { svg: out.join(''), lectura: `Declinación ${ewTexto(e.dm)} y desvío ${ewTexto(e.desvio)}. Responde la pregunta y verás dónde queda el norte de aguja y el signo de la corrección total.` };
    const lado = r.ct < 0 ? `${Math.abs(r.ct)}° al oeste del` : r.ct > 0 ? `${r.ct}° al este del` : 'justo en el';
    const lectura = `Declinación ${ewTexto(e.dm)} (${conSigno(e.dm)}) y desvío ${ewTexto(e.desvio)} (${conSigno(e.desvio)}): Ct = ${conSigno(e.dm)} ${e.desvio < 0 ? '−' : '+'} ${Math.abs(e.desvio)}° = ${conSigno(r.ct)}, ${r.signo}. El norte de aguja queda ${lado} norte verdadero. De aguja a verdadero se suma la Ct con su signo: Rv = Ra + Ct.`;
    return { svg: out.join(''), lectura };
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
