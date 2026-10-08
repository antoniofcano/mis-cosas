// Rosa: rumbo, demora y marcación del mismo faro. Mandos: rumbo y demora. Se ve cambiar la marcación.
import { marcacionBanda } from '../../nautical/compass.js';
import { norm360 } from '../../math/angles.js';
import { pad3 } from './kit.js';
import { T, TXT, lienzo, rotulo, etiqueta, cartela, barco, pol, f1, arcoD, parte } from '../estilo-c.js';

// Estilo C (docs/ESTILO-LAMINAS.md): una rosa de carta graduada de 0° a 360° (cifras cada 30°, en monoespaciada);
// el rumbo y la demora se miden desde el norte, en el sentido de las agujas del reloj; la marcación, desde la proa (magenta).
const W = 358;
const H = 352;
const C = [179, 170];
const R = 118;

function rosaCarta() {
  const o = [`<circle cx="${C[0]}" cy="${C[1]}" r="${R}" fill="${T.agua2}" stroke="${T.tinta}" stroke-width="1.4"/>`, `<circle cx="${C[0]}" cy="${C[1]}" r="${R - 9}" fill="none" stroke="${T.tinta}" stroke-width=".6"/>`];
  const d = [];
  for (let g = 0; g < 360; g += 5) {
    const [x1, y1] = pol(C[0], C[1], g, R);
    const [x2, y2] = pol(C[0], C[1], g, g % 30 === 0 ? R - 13 : g % 10 === 0 ? R - 9 : R - 5);
    d.push(`M${f1(x1)},${f1(y1)}L${f1(x2)},${f1(y2)}`);
  }
  o.push(`<path d="${d.join('')}" stroke="${T.tinta}" stroke-width=".8" fill="none"/>`);
  for (let g = 0; g < 360; g += 30) {
    const [x, y] = pol(C[0], C[1], g, R + 13);
    o.push(rotulo(x, y + 4, pad3(g), { size: TXT.min, estilo: 'mono', color: T.apagado }));
  }
  // cardinales dentro de la rosa
  for (const [t, g] of [['N', 0], ['E', 90], ['S', 180], ['W', 270]]) {
    const [x, y] = pol(C[0], C[1], g, R - 26);
    o.push(rotulo(x, y + 5, t, { size: TXT.nombre, weight: 700, estilo: 'serif', color: g ? T.apagado : T.tinta }));
  }
  return o.join('');
}

/** Etiqueta junto a una línea, a la altura `k` del radio, pegada a un lado (sin pisarla). */
function etiquetaLinea(dir, k, lado, t, color, p) {
  const [x0, y0] = pol(C[0], C[1], dir, R * k);
  const [px, py] = pol(0, 0, dir + 90 * lado, 1);
  const w = t.length * TXT.cota * 0.62 + 10;
  const d = Math.abs(px) * (w / 2) + Math.abs(py) * 9 + 5;
  const x = Math.min(Math.max(x0 + px * d, w / 2 + 8), W - w / 2 - 8);
  return etiqueta(x, y0 + py * d, t, { color, p });
}

const marcTexto = ({ grados, banda }) => (banda === 'proa' ? 'por la proa' : banda === 'popa' ? 'por la popa' : `${grados}° por ${banda}`);

export const rosa = {
  // Solo hay mando para lo que la spec dibuja: una rosa de rumbo no tiene faro, y una de demora no tiene barco.
  mandos: (e) => [
    e.rumbo != null ? { id: 'rumbo', tipo: 'rango', etiqueta: 'Rumbo', min: 0, max: 359, paso: 1, texto: (v) => `${pad3(v)}°`, extremos: ['000° (N)', '359°'] } : null,
    e.demora != null ? { id: 'demora', tipo: 'rango', etiqueta: `Demora del ${e.etiqueta}`, min: 0, max: 359, paso: 1, texto: (v) => `${pad3(v)}°`, extremos: ['000° (N)', '359°'] } : null,
  ].filter(Boolean),
  estado: (spec) => ({
    rumbo: spec.rumbo == null ? (spec.demora == null ? 30 : null) : norm360(Math.round(Number(spec.rumbo))),
    demora: spec.demora == null ? null : norm360(Math.round(Number(spec.demora))),
    etiqueta: spec.etiqueta ?? 'faro',
  }),
  calcular: (e) => (e.demora == null || e.rumbo == null ? { marcacion: null } : { marcacion: marcacionBanda(e.demora, e.rumbo) }),
  pie: () => 'Rumbo y demora se miden desde el norte, en el sentido de las agujas del reloj; la marcación se mide desde la proa.',
  dibujar(e, r) {
    const alt = [e.rumbo != null ? `Rosa graduada con el barco en el centro y la proa al ${pad3(e.rumbo)}°` : 'Rosa graduada',
      e.demora != null ? `${e.rumbo != null ? '; ' : ' con '}el ${e.etiqueta} en la demora ${pad3(e.demora)}°` : '',
      r.marcacion ? `: lo ves ${marcTexto(r.marcacion)}, la marcación, medida desde la proa.` : '. Se mide desde el norte, en el sentido de las agujas del reloj.'].join('');
    const { out, cierra } = lienzo(W, H, alt);
    out.push(rosaCarta());
    // a qué lado de cada línea va su etiqueta: el rumbo y la demora, cada uno por fuera del ángulo entre los dos
    const ladoR = r.marcacion && r.marcacion.banda === 'estribor' ? -1 : 1;
    if (e.demora != null) {
      const [fx, fy] = pol(C[0], C[1], e.demora, R - 18);
      out.push(`<g${parte('demora')}><line x1="${C[0]}" y1="${C[1]}" x2="${f1(fx)}" y2="${f1(fy)}" stroke="${T.tinta}" stroke-width="1.5" stroke-dasharray="7 4"/>` +
        `<circle cx="${f1(fx)}" cy="${f1(fy)}" r="7" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1.2"/><circle cx="${f1(fx)}" cy="${f1(fy)}" r="2" fill="${T.tinta}"/></g>`);
      out.push(etiquetaLinea(e.demora, 0.5, -ladoR, `${e.etiqueta} ${pad3(e.demora)}°`, T.tinta, 'demora'));
    }
    if (e.rumbo != null) {
      const [rx, ry] = pol(C[0], C[1], e.rumbo, R - 16);
      out.push(`<g${parte('rumbo')}><line x1="${C[0]}" y1="${C[1]}" x2="${f1(rx)}" y2="${f1(ry)}" stroke="${T.tinta}" stroke-width="1.8"/>` +
        `<polygon points="${[pol(rx, ry, e.rumbo, 4), pol(rx, ry, e.rumbo + 150, 12), pol(rx, ry, e.rumbo - 150, 12)].map((q) => q.map(f1).join(',')).join(' ')}" fill="${T.tinta}"/></g>`);
      out.push(barco(C[0], C[1], e.rumbo, 44, { p: 'rumbo' }));
      out.push(etiquetaLinea(e.rumbo, 0.5, ladoR, `rumbo ${pad3(e.rumbo)}°`, T.tinta, 'rumbo'));
    } else {
      out.push(`<circle cx="${C[0]}" cy="${C[1]}" r="4" fill="${T.tinta}"/>`);
    }
    // el ángulo que se mide: desde el norte (rumbo o demora) o, si hay los dos, la marcación desde la proa
    if (r.marcacion && r.marcacion.banda !== 'proa') {
      const [a, b] = r.marcacion.banda === 'estribor' ? [e.rumbo, e.demora] : [e.demora, e.rumbo];
      out.push(`<path${parte('marcacion')} d="${arcoD(C[0], C[1], 40, a, b)}" fill="none" stroke="${T.magenta}" stroke-width="2.2"/>`);
      out.push(cartela(C[0], H - 22, 'MARCACIÓN', marcTexto(r.marcacion), { color: T.magenta, ancho: 164, p: 'marcacion' }));
    } else {
      const g = e.rumbo ?? e.demora;
      if (g) out.push(`<path${parte(e.rumbo != null ? 'rumbo' : 'demora')} d="${arcoD(C[0], C[1], 40, 0, g)}" fill="none" stroke="${T.magenta}" stroke-width="2.2"/>`);
      out.push(cartela(C[0], H - 22, e.rumbo != null ? 'RUMBO' : 'DEMORA', 'desde el norte, en horario', { color: T.magenta, ancho: 196 }));
    }
    out.push(cierra());
    const lectura = e.rumbo == null
      ? `Demora del ${e.etiqueta} ${pad3(e.demora)}°: el ángulo desde el norte hasta el ${e.etiqueta}, en el sentido de las agujas del reloj.`
      : e.demora == null
      ? `Rumbo ${pad3(e.rumbo)}°: la proa apunta ${pad3(e.rumbo)}° desde el norte, en el sentido de las agujas del reloj.`
      : `Rumbo ${pad3(e.rumbo)}° y demora del ${e.etiqueta} ${pad3(e.demora)}°: lo ves ${marcTexto(r.marcacion)}. Marcación = demora − rumbo = ${pad3(e.demora)}° − ${pad3(e.rumbo)}°.`;
    return { svg: out.join(''), lectura };
  },
  prediccion(e) {
    if (e.rumbo == null || e.demora == null) return null; // sin rumbo y demora no hay marcación que predecir
    let est = e;
    const m0 = marcacionBanda(est.demora, est.rumbo);
    const m1 = marcacionBanda(est.demora, est.rumbo + 20);
    // Si al caer 20° el faro cambia de banda, la pregunta sería ambigua: se parte de un faro por el través de estribor.
    if (m0.banda !== m1.banda || m0.banda === 'proa' || m0.banda === 'popa') est = { ...est, demora: norm360(est.rumbo + 90) };
    const a = marcacionBanda(est.demora, est.rumbo);
    const b = marcacionBanda(est.demora, est.rumbo + 20);
    const correcta = b.grados > a.grados ? 'a' : b.grados < a.grados ? 'b' : 'c';
    return {
      enunciado: `Ves el ${est.etiqueta} ${marcTexto(a)}. Si caes 20° a estribor, ¿su marcación sube o baja?`,
      opciones: { a: 'Sube', b: 'Baja', c: 'No cambia' },
      correcta,
      tras: `Al caer a estribor la proa gira hacia la derecha: lo que ves por estribor se acerca a la proa (su marcación baja) y lo que ves por babor se aleja (sube). La demora no cambia: el ${est.etiqueta} sigue en su sitio. Pruébalo con el mando del rumbo.`,
      estado: est === e ? null : { demora: est.demora },
    };
  },
  partes: {
    rumbo: 'Rumbo: el ángulo desde el norte hasta la proa, en el sentido de las agujas del reloj (de 000° a 359°).',
    demora: 'Demora: el ángulo desde el norte hasta el objeto. No depende de hacia dónde apunte tu proa.',
    marcacion: 'Marcación: el ángulo desde la proa hasta el objeto, por estribor o por babor. Marcación = demora − rumbo.',
  },
};
