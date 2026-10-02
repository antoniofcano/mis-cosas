// Hélice y timón: marcha, sentido de giro y timón → hacia dónde cae la popa. Vista desde arriba, proa arriba.
import { caidaPopa } from '../../nautical/helice.js';
import { svgOpen, flecha, texto, barcoPlanta, f1, rad } from './kit.js';

const W = 320;
const H = 300;
const CX = 160;
const CY = 140;
const L = 150;
const TIMON = { br: 'a babor', via: 'a la vía', er: 'a estribor' };
export const GIRO = { dextrogira: 'dextrógira', levogira: 'levógira' };
const sg = (b) => (b === 'estribor' ? 1 : -1);

/** Dibujo y frase de una combinación; lo reutiliza la lámina de desatraque. */
export function dibujoHelice(e, r, { pendiente = false, alto = H } = {}) {
  const atras = e.marcha === 'atras';
  const out = [svgOpen(W, alto, `${atras ? 'Atrás' : 'Avante'}, hélice ${GIRO[e.sentido]}, timón ${TIMON[e.timon]}`)];
  out.push(texto(CX - 70, 28, 'Br', { size: 18, weight: 700 }), texto(CX + 70, 28, 'Er', { size: 18, weight: 700 }), texto(CX, 24, 'proa ↑', { size: 15 }));
  // el barco gira hacia donde cae la proa (alrededor de su punto de giro)
  const giro = pendiente ? 0 : sg(r.proa) * (r.dominante === 'ambos' ? 16 : 9);
  const piv = atras ? L / 6 : -L / 6;
  const tim = e.timon === 'via' ? 0 : (e.timon === 'er' ? -1 : 1) * 32; // la pala hacia la banda del timón (visto desde arriba, popa abajo)
  const rb = [Math.sin(rad(tim)) * 22, Math.cos(rad(tim)) * 22];
  out.push(`<g transform="rotate(${f1(giro)} ${CX} ${f1(CY + piv)})">`);
  out.push(barcoPlanta(CX, CY, 0, L, 'barco'));
  out.push(`<line data-parte="timon" x1="${CX}" y1="${CY + L / 2}" x2="${f1(CX - rb[0])}" y2="${f1(CY + L / 2 + rb[1])}" stroke="var(--l-v)" stroke-width="5" stroke-linecap="round"/>`);
  out.push(`<rect data-parte="helice" x="${CX - 12}" y="${CY + L / 2 - 10}" width="24" height="5" rx="2" fill="var(--l-a)"/>`);
  out.push(atras ? flecha(CX, CY + L / 2 + 34, CX, CY + L / 2 + 4, 'var(--l-g)', 2.5) : flecha(CX, CY + L / 2 + 2, CX, CY + L / 2 + 34, 'var(--l-g)', 2.5));
  out.push(`<circle cx="${CX}" cy="${CY + piv}" r="4" fill="var(--l-p)"/></g>`);
  // efectos sobre la popa
  const y0 = CY + L / 2 + 20;
  const ef = (lado, y, color, t, p, w = 3) => (lado ? flecha(CX + sg(lado) * 26, y, CX + sg(lado) * 96, y, color, w, p) + texto(CX + sg(lado) * 100, y + 5, t, { color, p, size: 15, anchor: lado === 'estribor' ? 'start' : 'end' }) : '');
  out.push(ef(r.popaHelice, y0 - 34, 'var(--l-a)', 'hélice', 'helice'));
  if (r.popaTimon) out.push(ef(r.popaTimon, y0 - 4, 'var(--l-v)', 'timón', 'timon'));
  if (!pendiente) out.push(ef(r.popa, y0 + 26, 'var(--l-r)', 'popa', 'popa', 5));
  out.push(texto(14, alto - 10, `${atras ? 'dando atrás' : 'avante'} · flecha gris: corriente de la hélice`, { anchor: 'start', size: 13, weight: 400, color: 'var(--muted)' }));
  out.push('</svg>');
  return out.join('');
}

export const heliceTimon = {
  mandos: [
    { id: 'marcha', tipo: 'opciones', etiqueta: 'Máquina', opciones: [['avante', 'Avante'], ['atras', 'Atrás']] },
    { id: 'sentido', tipo: 'opciones', etiqueta: 'Hélice (vista desde popa, avante)', opciones: [['dextrogira', 'Dextrógira'], ['levogira', 'Levógira']] },
    { id: 'timon', tipo: 'opciones', etiqueta: 'Timón', opciones: [['br', 'A babor'], ['via', 'A la vía'], ['er', 'A estribor']] },
  ],
  estado: (spec) => ({ marcha: spec.marcha === 'atras' ? 'atras' : 'avante', sentido: spec.sentido === 'levogira' ? 'levogira' : 'dextrogira', timon: ['br', 'er', 'via'].includes(spec.timon) ? spec.timon : 'via' }),
  calcular: (e) => caidaPopa(e),
  pie: () => 'Hélice dextrógira: avante la popa cae a estribor y atrás a babor (levógira, al revés). Avante manda el timón en cuanto hay arrancada; atrás, con poca arrancada, la hélice.',
  dibujar(e, r, { pendiente = false } = {}) {
    const svg = dibujoHelice(e, r, { pendiente });
    const base = `${e.marcha === 'atras' ? 'Dando atrás' : 'Avante'} con hélice ${GIRO[e.sentido]} y timón ${TIMON[e.timon]}: la hélice empuja la popa a ${r.popaHelice}${r.popaTimon ? ` y el timón a ${r.popaTimon}` : ''}.`;
    if (pendiente) return { svg, lectura: `${base} Responde y verás hacia dónde cae.` };
    return { svg, lectura: `${base} La popa cae a ${r.popa} y la proa a ${r.proa}. ${r.matiz}` };
  },
  prediccion: () => ({
    enunciado: 'Hélice dextrógira dando atrás, con el timón a la vía: ¿adónde cae la popa?',
    opciones: { a: 'A babor', b: 'A estribor', c: 'No cae' },
    correcta: 'a',
    tras: 'Dando atrás, la presión lateral de las palas de una hélice dextrógira lleva la popa a babor, y con fuerza. Prueba ahora avante, con hélice levógira y con el timón.',
    estado: { marcha: 'atras', sentido: 'dextrogira', timon: 'via' },
  }),
  partes: {
    helice: 'La hélice: además de empujar, sus palas «andan» de lado sobre el agua y tiran de la popa hacia una banda (presión lateral).',
    timon: 'El timón: con arrancada, el agua que pasa por la pala empuja la popa. Avante, timón a estribor lleva la popa a babor y la proa a estribor.',
    popa: 'Hacia donde cae la popa al sumar los dos efectos. La proa cae a la banda contraria.',
  },
  botonesPartes: [['helice', 'Hélice'], ['timon', 'Timón'], ['popa', 'Popa']],
};
