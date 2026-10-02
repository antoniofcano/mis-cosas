// Rosa: rumbo, demora y marcación del mismo faro. Mandos: rumbo y demora. Se ve cambiar la marcación.
import { marcacionBanda } from '../../nautical/compass.js';
import { norm360 } from '../../math/angles.js';
import { svgOpen, rosa as rosaSvg, flecha, arco, texto, barcoPlanta, pol, pad3 } from './kit.js';

const W = 320;
const H = 344;
const C = 160;
const R = 118;

/** Rótulo junto a una flecha, desplazado a un lado para no pisarla. */
function rotulo(dir, lado, t, color, p) {
  const [x0, y0] = pol(C, C, dir, R * 0.58);
  const [x, y] = pol(x0, y0, dir + 90 * lado, 16);
  const s = Math.sin(((dir + 90 * lado) * Math.PI) / 180);
  return texto(x, y + 6, t, { color, p, size: 17, anchor: s > 0.3 ? 'start' : s < -0.3 ? 'end' : 'middle' });
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
    const out = [svgOpen(W, H, [e.rumbo != null ? `Rumbo ${pad3(e.rumbo)}°` : '', e.demora != null ? `demora ${pad3(e.demora)}°` : ''].filter(Boolean).join(', ')), rosaSvg(C, C, R)];
    if (e.rumbo != null) {
      const [rx, ry] = pol(C, C, e.rumbo, R - 18);
      out.push(barcoPlanta(C, C, e.rumbo, 40, 'rumbo'));
      out.push(flecha(C, C, rx, ry, 'var(--l-v)', 3.5, 'rumbo'));
      out.push(rotulo(e.rumbo, -1, `rumbo ${pad3(e.rumbo)}°`, 'var(--l-v)', 'rumbo'));
    }
    if (e.demora != null) {
      const [fx, fy] = pol(C, C, e.demora, R - 6);
      out.push(flecha(C, C, fx, fy, 'var(--l-p)', 2.5, 'demora', 'stroke-dasharray="6 5"'));
      out.push(`<circle data-parte="demora" cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="8" fill="var(--l-faro)" stroke="var(--text)" stroke-width="1"/>`);
      out.push(rotulo(e.demora, 1, `${e.etiqueta} ${pad3(e.demora)}°`, 'var(--l-p)', 'demora'));
      if (r.marcacion && r.marcacion.banda !== 'proa') {
        out.push(arco(C, C, 46, e.rumbo, e.demora, 'var(--l-r)', 3, 'marcacion'));
        out.push(texto(C, H - 12, `marcación ${marcTexto(r.marcacion)}`, { color: 'var(--l-r)', p: 'marcacion', size: 18, weight: 700 }));
      }
    }
    out.push('</svg>');
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
