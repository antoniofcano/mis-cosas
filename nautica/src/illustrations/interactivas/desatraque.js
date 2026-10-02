// Desatraque de costado: viento, esprín que trabaja y máquina → abre la proa, abre la popa o se queda contra el
// muelle. Barco atracado por babor con hélice dextrógira; reutiliza el cálculo de hélice y timón.
import { desatraque as calc } from '../../nautical/desatraque.js';
import { svgOpen, flecha, texto, barcoPlanta, f1 } from './kit.js';

const W = 320;
const H = 300;
const CY = 196;
const L = 170;
const PROA = 160 - L / 2; // x de la proa (a la izquierda)
const POPA = 160 + L / 2;
const MUELLE = CY + (L * 0.34) / 2; // el costado de babor toca el muelle
const NOMBRE = { 'abre-popa': 'Abre la popa', 'abre-proa': 'Abre la proa', 'se-queda': 'Se queda contra el muelle', 'se-separa': 'El viento lo separa' };
const VIENTO = { calma: 'en calma', tierra: 'de tierra (sopla desde el muelle)', mar: 'de la mar (lo aprieta contra el muelle)' };

export const desatraque = {
  mandos: [
    { id: 'viento', tipo: 'opciones', etiqueta: 'Viento', opciones: [['calma', 'Calma'], ['tierra', 'De tierra'], ['mar', 'De la mar']] },
    { id: 'esprin', tipo: 'opciones', etiqueta: 'Cabo que dejas trabajando', opciones: [['proa', 'Esprín de proa'], ['popa', 'Esprín de popa']] },
    { id: 'maquina', tipo: 'opciones', etiqueta: 'Máquina', opciones: [['avante', 'Avante'], ['atras', 'Atrás']] },
  ],
  estado: (spec) => {
    const popa = (spec.abrir ?? 'popa') !== 'proa';
    return { viento: spec.viento ?? 'calma', esprin: spec.esprin ?? (popa ? 'proa' : 'popa'), maquina: spec.maquina ?? (popa ? 'avante' : 'atras') };
  },
  calcular: (e) => calc(e),
  pie: () => 'Abrir la popa: esprín de proa, avante y timón al muelle; se sale atrás. Abrir la proa: esprín de popa y atrás; se sale avante. Con viento de la mar, normalmente se abre primero la popa.',
  dibujar(e, r, { pendiente = false } = {}) {
    const out = [svgOpen(W, H, `Desatraque: viento ${e.viento}, esprín de ${e.esprin}, ${e.maquina}`)];
    out.push(`<rect x="0" y="${f1(MUELLE + 2)}" width="${W}" height="${f1(H - MUELLE - 2)}" fill="var(--land)" stroke="var(--land-stroke)"/>`, texto(W - 12, H - 12, 'MUELLE', { anchor: 'end', size: 15, weight: 700 }));
    // viento
    if (e.viento === 'calma') out.push(texto(W - 14, 30, 'calma', { anchor: 'end', size: 15, color: 'var(--muted)' }));
    for (const x of e.viento === 'calma' ? [] : [60, 160, 260]) {
      out.push(e.viento === 'tierra' ? flecha(x, 92, x, 46, 'var(--l-g)', 3, 'viento') : flecha(x, 30, x, 76, 'var(--l-g)', 3, 'viento'));
    }
    if (e.viento !== 'calma') out.push(texto(14, 30, `viento ${e.viento === 'tierra' ? 'de tierra' : 'de la mar'}`, { anchor: 'start', size: 15, color: 'var(--l-g)' }));
    // el barco: fantasma en su sitio y, si se mueve, en la posición final
    const pivProa = [PROA + 20, MUELLE];
    const pivPopa = [POPA - 14, MUELLE];
    const mov = pendiente ? '' : { 'abre-popa': `rotate(-24 ${pivProa[0]} ${pivProa[1]})`, 'abre-proa': `rotate(22 ${pivPopa[0]} ${pivPopa[1]})`, 'se-separa': 'translate(0 -34)', 'se-queda': '' }[r.resultado];
    const casco = barcoPlanta(160, CY, -90, L, 'barco');
    if (mov) out.push(`<g opacity=".3">${casco}</g>`);
    const tim = r.timon === 'br' ? `<line x1="${POPA}" y1="${CY}" x2="${POPA + 14}" y2="${CY + 12}" stroke="var(--l-v)" stroke-width="4" stroke-linecap="round"/>` : `<line x1="${POPA}" y1="${CY}" x2="${POPA + 18}" y2="${CY}" stroke="var(--l-v)" stroke-width="4" stroke-linecap="round"/>`;
    out.push(`<g transform="${mov}">${casco}${tim}</g>`);
    out.push(texto(PROA - 4, CY - 20, 'proa', { anchor: 'start', size: 14 }));
    // el esprín y la defensa (en el pivote)
    const [a, b] = e.esprin === 'proa' ? [[PROA + 22, MUELLE - 4], [PROA + 110, MUELLE + 16]] : [[POPA - 18, MUELLE - 4], [POPA - 106, MUELLE + 16]];
    out.push(`<line data-parte="esprin" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="var(--l-a)" stroke-width="3" ${r.trabaja ? '' : 'stroke-dasharray="6 5"'}/><circle cx="${b[0]}" cy="${b[1]}" r="6" fill="var(--text)"/>`);
    out.push(texto(14, H - 12, `esprín de ${e.esprin}${r.trabaja ? '' : ' (en banda)'}`, { anchor: 'start', size: 15, weight: 700, color: 'var(--text)', p: 'esprin' }));
    const piv = e.esprin === 'proa' ? pivProa : pivPopa;
    out.push(`<rect data-parte="defensa" x="${piv[0] - 6}" y="${piv[1] - 5}" width="12" height="10" rx="4" fill="var(--l-v)"/>`);
    out.push(e.maquina === 'avante' ? flecha(POPA - 60, CY, POPA - 110, CY, 'var(--l-r)', 3, 'maquina') : flecha(POPA - 110, CY, POPA - 60, CY, 'var(--l-r)', 3, 'maquina'));
    out.push('</svg>');
    const base = `Atracado por babor, con hélice dextrógira y viento ${VIENTO[e.viento]}: dejas el esprín de ${e.esprin} y das ${e.maquina === 'avante' ? 'avante' : 'atrás'}.`;
    if (pendiente) return { svg: out.join(''), lectura: `${base} Responde y verás qué pasa.` };
    return { svg: out.join(''), lectura: `${base} ${r.texto}`, casillas: [['Resultado', NOMBRE[r.resultado]], ['El esprín', r.trabaja ? 'trabaja (hace de pivote)' : 'no trabaja (en banda)']] };
  },
  prediccion: () => ({
    enunciado: 'Viento de la mar, que te aprieta contra el muelle: ¿por dónde sales?',
    opciones: { a: 'Abriendo la proa', b: 'Abriendo la popa', c: 'Separándote de costado' },
    correcta: 'b',
    tras: 'Con viento de fuera no puedes separarte de costado, y la proa abierta te la devuelve el viento. Se abre primero la popa sobre el esprín de proa, avante y con el timón al muelle, y se sale atrás. Prueba las combinaciones.',
    estado: { viento: 'mar', esprin: 'popa', maquina: 'atras' },
  }),
  partes: {
    esprin: 'El esprín que trabaja hace de pivote: el barco gira alrededor de la defensa en lugar de avanzar o retroceder.',
    defensa: 'La defensa en la amura (o en la aleta) protege el casco donde se apoya mientras gira.',
    maquina: 'Hacia donde empuja la máquina: avante o atrás.',
    viento: 'El viento de tierra te separa del muelle; el de la mar te aprieta contra él.',
  },
};
