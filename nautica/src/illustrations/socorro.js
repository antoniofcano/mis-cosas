// Señales de peligro del Anexo IV del RIPA (texto consolidado vigente, con las enmiendas de 2007:
// ya no figuran las alarmas radiotelegráfica y radiotelefónica; entran la LSD, Inmarsat, radiobalizas y SART).
// spec: { tipo:'socorro', resaltar?: clave, solo?: bool }   (solo: dibuja únicamente la resaltada, en grande)

import { open, title, lbl, C } from './kit.js';
import { rhythmAnimation } from './lights.js';

const sea = (x, y, w, h = 10) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#38bdf8" opacity=".35"/>`;
const anim = (attr, values, dur, extra = '') => `<animate attributeName="${attr}" values="${values}" dur="${dur}s" repeatCount="indefinite" ${extra}/>`;
const flag = {
  // N: damero azul y blanco de 4 × 4 (azul en la esquina alta del lado de la driza)
  N: (x, y, w, h) => [...Array(16)].map((_, i) => `<rect x="${(x + ((i % 4) * w) / 4).toFixed(1)}" y="${(y + (Math.floor(i / 4) * h) / 4).toFixed(1)}" width="${w / 4}" height="${h / 4}" fill="${(i + Math.floor(i / 4)) % 2 ? '#fff' : '#1d4ed8'}"/>`).join('') + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#64748b" stroke-width=".6"/>`,
  // C: franjas horizontales azul, blanca, roja, blanca y azul
  C: (x, y, w, h) => ['#1d4ed8', '#fff', '#dc2626', '#fff', '#1d4ed8'].map((c, i) => `<rect x="${x}" y="${(y + (i * h) / 5).toFixed(1)}" width="${w}" height="${(h / 5).toFixed(1)}" fill="${c}"/>`).join('') + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#64748b" stroke-width=".6"/>`,
};

// SOS en Morse con una luz: punto 1 unidad, raya 3, separación 1, entre letras 3 y pausa final 7.
function sosRhythm() {
  const u = 0.22;
  const steps = [];
  const letters = ['...', '---', '...'];
  letters.forEach((l, i) => {
    [...l].forEach((c, j) => { steps.push({ on: true, d: (c === '.' ? 1 : 3) * u }); if (j < l.length - 1) steps.push({ on: false, d: u }); });
    steps.push({ on: false, d: (i < letters.length - 1 ? 3 : 7) * u });
  });
  return { period: steps.reduce((s, x) => s + x.d, 0), steps, colors: ['#fffbe6'] };
}

/** Cada señal: letra del Anexo IV, rótulo, subrótulo, nota (pie si se resalta) y pictograma centrado en (x, y). */
export const SOCORRO = {
  canon: {
    letra: '1 a', t: 'Cañonazo o|detonación', s: 'cada minuto aprox.',
    nota: 'Anexo IV 1 a): un disparo de cañón u otra señal detonante, repetidos a intervalos de un minuto aproximadamente.',
    pic: (x, y) => `${sea(x - 50, y + 16, 100)}<path d="M${x - 40},${y + 16} L${x + 6},${y + 16} L${x + 2},${y + 24} L${x - 36},${y + 24}Z" fill="${C.g}"/>` +
      `<rect x="${x - 22}" y="${y + 2}" width="34" height="8" rx="3" fill="#334155" transform="rotate(-18 ${x - 22} ${y + 6})"/><circle cx="${x - 16}" cy="${y + 12}" r="5" fill="#475569"/>` +
      `<path d="M${x + 16},${y - 8} l6,-10 l2,9 l10,-5 l-6,9 l11,2 l-11,4 l7,8 l-10,-3 l-1,10 l-5,-9 l-6,6 l1,-9Z" fill="#f59e0b" stroke="#dc2626">${anim('opacity', '0;1;0;0;0', 2, 'calcMode="discrete"')}</path>`,
  },
  'niebla-continua': {
    letra: '1 b', t: 'Sonido continuo', s: 'con cualquier|aparato de niebla',
    nota: 'Anexo IV 1 b): un sonido continuo producido por cualquier aparato de señales de niebla (pito, sirena, bocina…).',
    pic: (x, y) => `<path d="M${x - 40},${y - 4} L${x - 26},${y - 4} L${x - 8},${y - 14} L${x - 8},${y + 10} L${x - 26},${y + 2} L${x - 40},${y + 2}Z" fill="${C.g}"/>` +
      [0, 1, 2].map((i) => `<path d="M${x + i * 10},${y - 12 - i * 4} q${8 + i * 3},${10 + i * 4} 0,${24 + i * 8}" fill="none" stroke="${C.a}" stroke-width="2">${anim('opacity', '.25;1;.25', 1.2, `begin="${i * 0.3}s"`)}</path>`).join('') +
      `<rect x="${x - 40}" y="${y + 20}" width="80" height="6" rx="3" fill="${C.a}"/>`,
  },
  'estrellas-rojas': {
    letra: '1 c', t: 'Cohetes de|estrellas rojas', s: 'o granadas,|uno a uno',
    nota: 'Anexo IV 1 c): cohetes o granadas que despidan estrellas rojas, lanzados uno a uno y a cortos intervalos.',
    pic: (x, y) => `<line x1="${x - 20}" y1="${y + 26}" x2="${x}" y2="${y - 10}" stroke="${C.g}" stroke-width="1.4" stroke-dasharray="3 2"/>` +
      `<g>${[0, 60, 120, 180, 240, 300].map((a) => { const r = 14; return `<circle cx="${(x + Math.cos((a * Math.PI) / 180) * r).toFixed(1)}" cy="${(y - 14 + Math.sin((a * Math.PI) / 180) * r).toFixed(1)}" r="3" fill="#ef4444"/>`; }).join('')}<circle cx="${x}" cy="${y - 14}" r="3.5" fill="#ef4444"/>${anim('opacity', '0;1;1;0', 2.4)}</g>`,
  },
  SOS: {
    letra: '1 d', t: 'SOS en Morse', s: '· · ·  — — —  · · ·',
    nota: 'Anexo IV 1 d): el grupo SOS del Código Morse (· · · — — — · · ·) emitido por cualquier sistema de señales: luz, sonido o radio.',
    pic: (x, y) => { const rh = sosRhythm(); return `<circle cx="${x}" cy="${y}" r="20" fill="#0b1220"/><circle cx="${x}" cy="${y}" r="13" fill="#fffbe6" opacity=".25">${rhythmAnimation(rh)}</circle><circle cx="${x}" cy="${y}" r="7" fill="#fffbe6">${rhythmAnimation(rh)}</circle>`; },
  },
  MAYDAY: {
    letra: '1 e', t: '«MAYDAY»|por radio', s: 'radiotelefonía,|VHF canal 16',
    nota: 'Anexo IV 1 e): la palabra «MAYDAY» emitida por radiotelefonía. En VHF, por el canal 16, precedida de la alerta LSD por el canal 70 si se dispone de ella.',
    pic: (x, y) => `<rect x="${x - 36}" y="${y - 14}" width="30" height="40" rx="5" fill="#334155"/><line x1="${x - 12}" y1="${y - 14}" x2="${x - 12}" y2="${y - 30}" stroke="#334155" stroke-width="3"/><rect x="${x - 32}" y="${y - 8}" width="22" height="10" fill="#22c55e" opacity=".8"/>` +
      `<text x="${x + 22}" y="${y - 8}" font-size="9" font-weight="700" fill="${C.r}" text-anchor="middle">MAYDAY</text><text x="${x + 22}" y="${y + 4}" font-size="9" font-weight="700" fill="${C.r}" text-anchor="middle">MAYDAY</text><text x="${x + 22}" y="${y + 16}" font-size="9" font-weight="700" fill="${C.r}" text-anchor="middle">MAYDAY${anim('opacity', '1;.2;1', 1.6)}</text>`,
  },
  NC: {
    letra: '1 f', t: 'Banderas N|sobre C', s: 'Código|Internacional',
    nota: 'Anexo IV 1 f): la señal de peligro NC del Código Internacional de Señales: la bandera N izada encima de la C.',
    pic: (x, y) => `<line x1="${x - 18}" y1="${y - 30}" x2="${x - 18}" y2="${y + 28}" stroke="${C.g}" stroke-width="2"/>${flag.N(x - 17, y - 28, 34, 24)}${flag.C(x - 17, y + 0, 34, 24)}` +
      `<text x="${x + 24}" y="${y - 12}" font-size="11" font-weight="700" fill="currentColor">N</text><text x="${x + 24}" y="${y + 16}" font-size="11" font-weight="700" fill="currentColor">C</text>`,
  },
  'cuadrado-bola': {
    letra: '1 g', t: 'Bandera cuadra|y bola', s: 'la bola encima|o debajo',
    nota: 'Anexo IV 1 g): una bandera cuadrada que tenga encima o debajo de ella una bola u objeto análogo.',
    pic: (x, y) => `<line x1="${x - 14}" y1="${y - 30}" x2="${x - 14}" y2="${y + 28}" stroke="${C.g}" stroke-width="2"/><circle cx="${x - 14}" cy="${y - 20}" r="8" fill="#111827" stroke="#94a3b8"/>` +
      `<rect x="${x - 13}" y="${y - 6}" width="28" height="28" fill="${C.v}"/>`,
  },
  llamaradas: {
    letra: '1 h', t: 'Llamaradas|a bordo', s: 'barril de brea,|petróleo…',
    nota: 'Anexo IV 1 h): llamaradas a bordo, como las que se producen al arder un barril de brea, petróleo, etc.',
    pic: (x, y) => `${sea(x - 50, y + 18, 100)}<path d="M${x - 40},${y + 10} L${x + 40},${y + 10} L${x + 30},${y + 22} L${x - 32},${y + 22}Z" fill="${C.g}"/><rect x="${x - 7}" y="${y - 2}" width="14" height="12" fill="#78350f"/>` +
      `<path d="M${x - 8},${y - 2} q-4,-14 4,-22 q0,10 6,6 q2,-10 -2,-16 q14,8 8,32Z" fill="#f97316">${anim('opacity', '1;.6;1', 0.5)}</path><path d="M${x - 3},${y - 2} q-2,-8 3,-13 q4,7 2,13Z" fill="#facc15"/>`,
  },
  'cohete-paracaidas': {
    letra: '1 i', t: 'Cohete con|paracaídas', s: 'luz roja',
    nota: 'Anexo IV 1 i): un cohete-bengala con paracaídas que produzca una luz roja. Se lanza a sotavento, algo inclinado; sube a unos 300 m y la luz arde unos 40 s mientras cae lentamente.',
    pic: (x, y) => `${sea(x - 50, y + 22, 100)}<line x1="${x - 24}" y1="${y + 22}" x2="${x - 4}" y2="${y - 28}" stroke="${C.g}" stroke-width="1.2" stroke-dasharray="3 2"/>` +
      `<g><path d="M${x - 8},${y - 26} q8,-10 16,0Z" fill="none" stroke="#94a3b8"/><line x1="${x - 8}" y1="${y - 26}" x2="${x}" y2="${y - 16}" stroke="#94a3b8" stroke-width=".7"/><line x1="${x + 8}" y1="${y - 26}" x2="${x}" y2="${y - 16}" stroke="#94a3b8" stroke-width=".7"/>` +
      `<circle cx="${x}" cy="${y - 14}" r="7" fill="#ef4444" opacity=".35"/><circle cx="${x}" cy="${y - 14}" r="3.5" fill="#ef4444"/><animateTransform attributeName="transform" type="translate" values="0,0;3,26" dur="5s" repeatCount="indefinite"/></g>`,
  },
  bengala: {
    letra: '1 i', t: 'Bengala|de mano', s: 'luz roja',
    nota: 'Anexo IV 1 i): una bengala de mano que produzca una luz roja (arde al menos 1 minuto). Se sostiene con el brazo extendido, por la banda de sotavento.',
    pic: (x, y) => `<path d="M${x - 34},${y + 26} L${x - 14},${y + 8} L${x - 8},${y + 14} L${x - 28},${y + 30}Z" fill="#d6a77a"/><rect x="${x - 12}" y="${y - 10}" width="7" height="26" fill="#334155" transform="rotate(30 ${x - 9} ${y + 3})"/>` +
      `<circle cx="${x}" cy="${y - 14}" r="14" fill="#ef4444" opacity=".3">${anim('r', '12;16;12', 0.4)}</circle><circle cx="${x}" cy="${y - 14}" r="6" fill="#ef4444">${anim('opacity', '1;.7;1', 0.3)}</circle>`,
  },
  humo: {
    letra: '1 j', t: 'Señal fumígena', s: 'densa humareda|naranja',
    nota: 'Anexo IV 1 j): una señal fumígena que produzca una densa humareda de color naranja. Es la señal pirotécnica de día; la flotante humea unos 3 minutos.',
    pic: (x, y) => `${sea(x - 50, y + 18, 100)}<rect x="${x - 6}" y="${y + 8}" width="12" height="14" rx="2" fill="#f97316" stroke="#9a3412"/>` +
      [0, 1, 2].map((i) => `<circle cx="${x}" cy="${y + 4}" r="7" fill="#fb923c" opacity=".8"><animate attributeName="cy" values="${y + 4};${y - 30}" dur="3s" begin="${i}s" repeatCount="indefinite"/><animate attributeName="r" values="6;16" dur="3s" begin="${i}s" repeatCount="indefinite"/><animate attributeName="cx" values="${x};${x + 18}" dur="3s" begin="${i}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="3s" begin="${i}s" repeatCount="indefinite"/></circle>`).join(''),
  },
  brazos: {
    letra: '1 k', t: 'Subir y bajar|los brazos', s: 'extendidos, lento|y repetido',
    nota: 'Anexo IV 1 k): movimientos lentos y repetidos, subiendo y bajando los brazos extendidos lateralmente.',
    pic: (x, y) => `${sea(x - 50, y + 22, 100)}<path d="M${x - 30},${y + 14} L${x + 30},${y + 14} L${x + 24},${y + 24} L${x - 24},${y + 24}Z" fill="${C.g}"/>` +
      `<circle cx="${x}" cy="${y - 22}" r="6" fill="${C.n}"/><line x1="${x}" y1="${y - 16}" x2="${x}" y2="${y + 6}" stroke="${C.n}" stroke-width="4"/><line x1="${x}" y1="${y + 6}" x2="${x - 5}" y2="${y + 14}" stroke="${C.n}" stroke-width="3"/><line x1="${x}" y1="${y + 6}" x2="${x + 5}" y2="${y + 14}" stroke="${C.n}" stroke-width="3"/>` +
      `<line x1="${x}" y1="${y - 12}" x2="${x + 24}" y2="${y - 12}" stroke="${C.n}" stroke-width="3" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="45 ${x} ${y - 12};-55 ${x} ${y - 12};45 ${x} ${y - 12}" dur="3s" repeatCount="indefinite"/></line>` +
      `<line x1="${x}" y1="${y - 12}" x2="${x - 24}" y2="${y - 12}" stroke="${C.n}" stroke-width="3" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="-45 ${x} ${y - 12};55 ${x} ${y - 12};-45 ${x} ${y - 12}" dur="3s" repeatCount="indefinite"/></line>`,
  },
  LSD: {
    letra: '1 l', t: 'Alerta LSD|(DSC)', s: 'VHF canal 70,|2187,5 kHz…',
    nota: 'Anexo IV 1 l): un alerta de socorro por llamada selectiva digital en el canal 70 de VHF o en 2187,5, 4207,5, 6312, 8414,5, 12577 o 16804,5 kHz (MF/HF).',
    pic: (x, y) => `<rect x="${x - 40}" y="${y - 18}" width="80" height="38" rx="5" fill="#334155"/><rect x="${x - 34}" y="${y - 12}" width="44" height="16" fill="#22c55e" opacity=".8"/><text x="${x - 12}" y="${y}" font-size="9" font-weight="700" text-anchor="middle" fill="#052e16">CH 70</text>` +
      `<rect x="${x + 16}" y="${y - 12}" width="18" height="18" rx="3" fill="#dc2626">${anim('opacity', '1;.4;1', 1)}</rect><text x="${x + 25}" y="${y + 16}" font-size="6" text-anchor="middle" fill="#fff">DISTRESS</text>`,
  },
  satelite: {
    letra: '1 m', t: 'Alerta por|satélite', s: 'Inmarsat u otro|proveedor',
    nota: 'Anexo IV 1 m): un alerta de socorro buque-costera transmitido por la estación terrena de buque de Inmarsat u otro proveedor de servicios móviles por satélite.',
    pic: (x, y) => `<rect x="${x + 4}" y="${y - 28}" width="12" height="10" fill="#94a3b8"/><rect x="${x - 14}" y="${y - 26}" width="16" height="6" fill="${C.v}"/><rect x="${x + 18}" y="${y - 26}" width="16" height="6" fill="${C.v}"/>` +
      `${sea(x - 50, y + 20, 100)}<path d="M${x - 30},${y + 12} L${x - 4},${y + 12} L${x - 8},${y + 20} L${x - 26},${y + 20}Z" fill="${C.g}"/><circle cx="${x - 17}" cy="${y + 6}" r="5" fill="#e2e8f0" stroke="${C.g}"/>` +
      `<line x1="${x - 15}" y1="${y + 2}" x2="${x + 8}" y2="${y - 16}" stroke="${C.r}" stroke-width="1.6" stroke-dasharray="4 3">${anim('stroke-dashoffset', '14;0', 0.8)}</line>`,
  },
  radiobaliza: {
    letra: '1 n', t: 'Radiobaliza', s: 'RLS (EPIRB)',
    nota: 'Anexo IV 1 n): las señales transmitidas por radiobalizas de localización de siniestros (RLS o EPIRB, de 406 MHz, detectadas por el sistema Cospas-Sarsat).',
    pic: (x, y) => `${sea(x - 50, y + 16, 100)}<rect x="${x - 7}" y="${y - 6}" width="14" height="26" rx="4" fill="#f59e0b" stroke="#92400e"/><line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y - 26}" stroke="#334155" stroke-width="2"/>` +
      `<circle cx="${x}" cy="${y - 9}" r="4" fill="#fffbe6">${anim('opacity', '1;0;0;0', 1, 'calcMode="discrete"')}</circle>` +
      [0, 1].map((i) => `<path d="M${x + 8 + i * 8},${y - 30 - i * 3} q${6 + i * 3},${8 + i * 2} 0,${16 + i * 6}" fill="none" stroke="${C.r}" stroke-width="1.6">${anim('opacity', '.2;1;.2', 1.2, `begin="${i * 0.3}s"`)}</path>`).join(''),
  },
  SART: {
    letra: '1 o', t: 'Respondedor|de radar (SART)', s: 'y otras señales|aprobadas',
    nota: 'Anexo IV 1 o): señales aprobadas de los sistemas de radiocomunicaciones, incluidos los respondedores de radar de las embarcaciones de supervivencia: el SART aparece en la pantalla del radar como una línea de 12 puntos.',
    pic: (x, y) => `<circle cx="${x}" cy="${y}" r="27" fill="#052e16" stroke="#16a34a"/><circle cx="${x}" cy="${y}" r="1.5" fill="#4ade80"/>` +
      [...Array(12)].map((_, i) => `<circle cx="${(x + 6 + i * 1.65).toFixed(1)}" cy="${(y - 6 - i * 1.65).toFixed(1)}" r="1.2" fill="#4ade80"/>`).join('') +
      `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 27}" stroke="#4ade80" stroke-width="1" opacity=".7"><animateTransform attributeName="transform" type="rotate" from="0 ${x} ${y}" to="360 ${x} ${y}" dur="3s" repeatCount="indefinite"/></line>`,
  },
  lona: {
    letra: '3 a', t: 'Lona naranja', s: 'cuadrado y|círculo negros',
    nota: 'Anexo IV 3 a) (señal que se recuerda, para identificación desde el aire): un trozo de lona de color naranja con un cuadrado negro y un círculo, u otro símbolo pertinente.',
    pic: (x, y) => `<rect x="${x - 36}" y="${y - 22}" width="72" height="46" fill="#f97316"/><rect x="${x - 26}" y="${y - 10}" width="20" height="20" fill="#111827"/><circle cx="${x + 16}" cy="${y}" r="10" fill="#111827"/>`,
  },
  colorante: {
    letra: '3 b', t: 'Colorante|en el agua', s: 'visible desde|el aire',
    nota: 'Anexo IV 3 b) (señal que se recuerda): una marca colorante del agua, muy visible desde el aire.',
    pic: (x, y) => `<rect x="${x - 50}" y="${y - 26}" width="100" height="52" fill="#38bdf8" opacity=".35"/><ellipse cx="${x}" cy="${y}" rx="30" ry="16" fill="#84cc16" opacity=".75">${anim('rx', '22;34;22', 4)}</ellipse><circle cx="${x}" cy="${y}" r="3" fill="${C.n}"/>`,
  },
};

const TW = 168;
const TH = 62;
const lines = (x, y, txt, cls, size, step) => txt.split('|').map((t, i) => `<text x="${x}" y="${y + i * step}" class="${cls}" font-size="${size}">${t}</text>`).join('');

function tile(k, x, y, hl) {
  const s = SOCORRO[k];
  const on = !hl || hl === k;
  const nt = s.t.split('|').length;
  return `<g opacity="${on ? 1 : 0.35}"><rect x="${x + 2}" y="${y + 2}" width="${TW - 4}" height="${TH - 4}" rx="8" fill="none" stroke="${hl === k ? C.r : '#94a3b8'}" stroke-width="${hl === k ? 2.4 : 1}" ${hl === k ? '' : 'opacity=".6"'}/>` +
    `<g transform="translate(${x + 37} ${y + 32}) scale(.6)">${s.pic(0, 0)}</g>` +
    `<text x="${x + 7}" y="${y + 13}" font-size="8" fill="${C.g}">${s.letra}</text>` +
    lines(x + 70, y + 16, s.t, 'il-lbl strong', 10, 12) + lines(x + 70, y + 17 + nt * 12, s.s, 'il-lbl', 8.5, 10) + '</g>';
}

export function socorroIllustration(spec) {
  const hl = spec.resaltar && SOCORRO[spec.resaltar] ? spec.resaltar : null;
  if (spec.resaltar && !hl) return null;
  if (hl && spec.solo) {
    const s = SOCORRO[hl];
    const W = 300;
    const H = 230;
    const out = open(W, H, 'Señal de peligro', 'sc');
    out.push(title(W / 2, `Señal de peligro · Anexo IV ${s.letra})`));
    out.push(`<g transform="translate(${W / 2} 104) scale(1.7)">${s.pic(0, 0)}</g>`);
    out.push(`<text x="${W / 2}" y="${H - 34}" class="il-title">${s.t.replace('|', ' ')}</text>`, lbl(W / 2, H - 16, s.s.replace('|', ' '), null, 'middle', 'font-size="11"'));
    out.push('</svg>');
    return { svg: out.join(''), caption: s.nota };
  }
  const keys = Object.keys(SOCORRO);
  const cols = 2;
  const W = cols * TW + 12;
  const H = 34 + Math.ceil(keys.length / cols) * TH + 24;
  const out = open(W, H, 'Señales de peligro', 'sc');
  out.push(title(W / 2, 'Señales de peligro · Anexo IV del RIPA'));
  keys.forEach((k, i) => out.push(tile(k, 6 + (i % cols) * TW, 32 + Math.floor(i / cols) * TH, hl)));
  out.push(lbl(W / 2, H - 10, 'Solo para indicar peligro y necesidad de ayuda', 'r', 'middle', 'font-weight="700"'));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: hl
      ? s0(hl)
      : 'Juntas o por separado, indican peligro y necesidad de ayuda; está prohibido usarlas para otra cosa o hacer señales que se confundan con ellas. Las antiguas alarmas radiotelegráfica y radiotelefónica ya no figuran. La lona y el colorante (punto 3) son señales complementarias para que te localicen desde el aire.',
  };
}
const s0 = (k) => SOCORRO[k].nota;
