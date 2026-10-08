// Hélice y timón: marcha, sentido de giro y timón → hacia dónde cae la popa. Vista desde arriba, proa arriba.
// Estilo C (docs/ESTILO-LAMINAS.md): agua de carta, cada efecto con su flecha y su rótulo (hélice a trazos, timón fino,
// la popa en magenta y más gruesa).
import { caidaPopa } from '../../nautical/helice.js';
import { T, TXT, lienzo, rotulo, cartela, flecha, ondas, barco, f1, rad } from '../estilo-c.js';

const W = 358;
const H = 330;
const CX = 179;
const CY = 146;
const L = 150;
const TIMON = { br: 'a babor', via: 'a la vía', er: 'a estribor' };
export const GIRO = { dextrogira: 'dextrógira', levogira: 'levógira' };
const sg = (b) => (b === 'estribor' ? 1 : -1);

/** Dibujo y frase de una combinación. */
export function dibujoHelice(e, r, { pendiente = false, alto = H } = {}) {
  const atras = e.marcha === 'atras';
  const alt = `${atras ? 'Dando atrás' : 'Avante'}, hélice ${GIRO[e.sentido]}, timón ${TIMON[e.timon]}` + (pendiente ? '.' : `: la popa cae a ${r.popa} y la proa a ${r.proa}.`);
  const { out, cierra } = lienzo(W, alto, alt, { fondo: T.agua2 });
  out.push(ondas(10, W - 10, alto - 30, { sep: 9 }));
  out.push(rotulo(CX - 86, 32, 'BABOR', { size: TXT.rotulo, weight: 700, estilo: 'cap', color: T.rojoTxt }), rotulo(CX + 86, 32, 'ESTRIBOR', { size: TXT.rotulo, weight: 700, estilo: 'cap', color: T.verdeTxt }),
    rotulo(CX, 32, 'PROA', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado }));
  // el barco gira hacia donde cae la proa (alrededor de su punto de giro)
  const giro = pendiente ? 0 : sg(r.proa) * (r.dominante === 'ambos' ? 16 : 9);
  const piv = atras ? L / 6 : -L / 6;
  const tim = e.timon === 'via' ? 0 : (e.timon === 'er' ? -1 : 1) * 32; // la pala hacia la banda del timón (visto desde arriba, popa abajo)
  const rb = [Math.sin(rad(tim)) * 22, Math.cos(rad(tim)) * 22];
  out.push(`<g transform="rotate(${f1(giro)} ${CX} ${f1(CY + piv)})">`);
  out.push(barco(CX, CY, 0, L, { p: 'barco' }));
  out.push(`<line data-parte="timon" x1="${CX}" y1="${CY + L / 2}" x2="${f1(CX - rb[0])}" y2="${f1(CY + L / 2 + rb[1])}" stroke="${T.tinta}" stroke-width="5" stroke-linecap="round"/>`);
  out.push(`<rect data-parte="helice" x="${CX - 13}" y="${CY + L / 2 - 11}" width="26" height="6" rx="2" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1"/>`);
  out.push(atras ? flecha(CX, CY + L / 2 + 36, CX, CY + L / 2 + 6, { color: T.apagado, w: 1.4, discontinua: true }) : flecha(CX, CY + L / 2 + 4, CX, CY + L / 2 + 36, { color: T.apagado, w: 1.4, discontinua: true }));
  out.push(`<circle cx="${CX}" cy="${CY + piv}" r="4" fill="${T.magenta}"/></g>`);
  // efectos sobre la popa
  const y0 = CY + L / 2 + 20;
  const ef = (lado, y, t, p, o) => (lado ? flecha(CX + sg(lado) * 28, y, CX + sg(lado) * 96, y, { p, ...o }) + rotulo(CX + sg(lado) * 102, y + 4.5, t, { size: TXT.nota, estilo: 'serif', italic: p !== 'popa', weight: p === 'popa' ? 700 : 400, color: o.color, p, anchor: lado === 'estribor' ? 'start' : 'end' }) : '');
  out.push(ef(r.popaHelice, y0 - 36, 'hélice', 'helice', { color: T.tinta, w: 1.6, discontinua: true }));
  if (r.popaTimon) out.push(ef(r.popaTimon, y0 - 8, 'timón', 'timon', { color: T.tinta, w: 1.6 }));
  if (!pendiente) out.push(ef(r.popa, y0 + 22, 'popa', 'popa', { color: T.magenta, w: 3 }));
  out.push(rotulo(16, alto - 12, `${atras ? 'dando atrás' : 'avante'} · flecha gris: corriente de la hélice`, { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }));
  out.push(cierra());
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
