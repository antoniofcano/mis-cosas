// Señales de peligro del Anexo IV del RIPA (texto consolidado vigente, con las enmiendas de 2007: ya no figuran las
// alarmas radiotelegráfica y radiotelefónica; entran la LSD, Inmarsat, radiobalizas y SART), en estilo C
// (docs/ESTILO-LAMINAS.md). Las diecisiete no caben legibles en una hoja a 360 px: van en cuatro hojas y un índice.
//   { tipo:'socorro' }                                    índice: las diecisiete en cuatro grupos, en pequeño
//   { tipo:'socorro', hoja:'pirotecnia'|'sonido'|'radio'|'vista' }   una hoja, con su letra, nombre y detalle
//   { tipo:'socorro', resaltar: clave }                    la hoja de esa señal, con ella resaltada
//   { tipo:'socorro', resaltar: clave, solo: true }        solo esa señal, en grande (las de pirotecnia, la
//                                                          radiobaliza y el SART, con sus cifras y su funcionamiento)
// Solo colores T.* (--lc-*). Los pictogramas no llevan texto: sirven también de anverso de las tarjetas de memoria.

import { T, TXT, lienzo, rotulo, etiqueta, cota, flecha, ondas, referencia, paso, f1 } from './estilo-c.js';
import { panoBandera } from './senales-c.js';
import { rhythmAnimation } from './lights.js';
import { filaPaso } from './carta-c.js';

/** Cada señal: letra del Anexo IV, hoja, rótulos (t y s: los de siempre, con «|» de salto, para las tarjetas), nombre y
 *  detalle (los de la lámina), nota (el texto del Anexo) y forma (cómo es el pictograma, sin decir qué es). */
export const SOCORRO = {
  canon: {
    letra: '1 a', hoja: 'sonido', t: 'Cañonazo o|detonación', s: 'cada minuto aprox.', nombre: 'Cañonazo o detonación', detalle: 'a intervalos de un minuto, más o menos',
    nota: 'Anexo IV 1 a): un disparo de cañón u otra señal detonante, repetidos a intervalos de un minuto aproximadamente.',
    forma: 'Un cañón en la cubierta de un barco, con el fogonazo de un disparo.',
  },
  'niebla-continua': {
    letra: '1 b', hoja: 'sonido', t: 'Sonido continuo', s: 'con cualquier|aparato de niebla', nombre: 'Sonido continuo', detalle: 'con cualquier aparato de señales de niebla',
    nota: 'Anexo IV 1 b): un sonido continuo producido por cualquier aparato de señales de niebla (pito, sirena, bocina…).',
    forma: 'Una bocina de niebla con ondas de sonido y, debajo, una barra larga sin cortes.',
  },
  'estrellas-rojas': {
    letra: '1 c', hoja: 'pirotecnia', t: 'Cohetes de|estrellas rojas', s: 'o granadas,|uno a uno', nombre: 'Cohetes de estrellas rojas', detalle: 'uno a uno, a cortos intervalos',
    nota: 'Anexo IV 1 c): cohetes o granadas que despidan estrellas rojas, lanzados uno a uno y a cortos intervalos.',
    forma: 'Un cohete que sube y estalla en estrellas rojas.',
  },
  SOS: {
    letra: '1 d', hoja: 'sonido', t: 'SOS en Morse', s: '· · ·  — — —  · · ·', nombre: 'SOS en Morse', detalle: 'con luz, sonido o radio',
    nota: 'Anexo IV 1 d): el grupo SOS del Código Morse (· · · — — — · · ·) emitido por cualquier sistema de señales: luz, sonido o radio.',
    forma: 'Una luz que destella con un ritmo de tres destellos cortos, tres largos y tres cortos.',
  },
  MAYDAY: {
    letra: '1 e', hoja: 'radio', t: '«MAYDAY»|por radio', s: 'radiotelefonía,|VHF canal 16', nombre: '«MAYDAY» por radiotelefonía', detalle: 'en VHF, por el canal 16',
    nota: 'Anexo IV 1 e): la palabra «MAYDAY» emitida por radiotelefonía. En VHF, por el canal 16, precedida de la alerta LSD por el canal 70 si se dispone de ella.',
    forma: 'Un equipo de radio portátil del que sale un bocadillo de voz.',
  },
  NC: {
    letra: '1 f', hoja: 'vista', t: 'Banderas N|sobre C', s: 'Código|Internacional', nombre: 'Banderas N sobre C', detalle: 'Código Internacional de Señales',
    nota: 'Anexo IV 1 f): la señal de peligro NC del Código Internacional de Señales: la bandera N izada encima de la C.',
    forma: 'Dos banderas izadas una encima de otra: arriba, un damero azul y blanco; abajo, franjas azul, blanca, roja, blanca y azul.',
  },
  'cuadrado-bola': {
    letra: '1 g', hoja: 'vista', t: 'Bandera cuadra|y bola', s: 'la bola encima|o debajo', nombre: 'Bandera cuadra y bola', detalle: 'la bola encima o debajo de ella',
    nota: 'Anexo IV 1 g): una bandera cuadrada que tenga encima o debajo de ella una bola u objeto análogo.',
    forma: 'Una bandera cuadrada y, encima, una bola.',
  },
  llamaradas: {
    letra: '1 h', hoja: 'pirotecnia', t: 'Llamaradas|a bordo', s: 'barril de brea,|petróleo…', nombre: 'Llamaradas a bordo', detalle: 'como un barril de brea ardiendo',
    nota: 'Anexo IV 1 h): llamaradas a bordo, como las que se producen al arder un barril de brea, petróleo, etc.',
    forma: 'Llamas a bordo, como de un barril de brea o de aceite ardiendo.',
  },
  'cohete-paracaidas': {
    letra: '1 i', hoja: 'pirotecnia', t: 'Cohete con|paracaídas', s: 'luz roja', nombre: 'Cohete con paracaídas', detalle: 'luz roja que baja colgada',
    nota: 'Anexo IV 1 i): un cohete-bengala con paracaídas que produzca una luz roja. Se dispara casi vertical, siguiendo las instrucciones del fabricante; sube a 300 m o más y la luz arde 40 s o más mientras cae lentamente.',
    forma: 'Una luz roja que baja colgada de un paracaídas.',
  },
  bengala: {
    letra: '1 i', hoja: 'pirotecnia', t: 'Bengala|de mano', s: 'luz roja', nombre: 'Bengala de mano', detalle: 'luz roja',
    nota: 'Anexo IV 1 i): una bengala de mano que produzca una luz roja (arde al menos 1 minuto). Se sostiene con el brazo extendido, por la banda de sotavento.',
    forma: 'Una mano que sostiene una bengala de luz roja.',
  },
  humo: {
    letra: '1 j', hoja: 'pirotecnia', t: 'Señal fumígena', s: 'densa humareda|naranja', nombre: 'Señal fumígena', detalle: 'densa humareda naranja',
    nota: 'Anexo IV 1 j): una señal fumígena que produzca una densa humareda de color naranja. Es la señal pirotécnica de día; la flotante humea 3 minutos o más.',
    forma: 'Un bote que flota y del que sale una densa humareda naranja.',
  },
  brazos: {
    letra: '1 k', hoja: 'vista', t: 'Subir y bajar|los brazos', s: 'extendidos, lento|y repetido', nombre: 'Subir y bajar los brazos', detalle: 'extendidos, lento y repetido',
    nota: 'Anexo IV 1 k): movimientos lentos y repetidos, subiendo y bajando los brazos extendidos lateralmente.',
    forma: 'Una persona en un bote que sube y baja despacio los brazos extendidos a los lados.',
  },
  LSD: {
    letra: '1 l', hoja: 'radio', t: 'Alerta LSD|(DSC)', s: 'VHF canal 70,|2187,5 kHz…', nombre: 'Alerta de socorro LSD', detalle: 'canal 70 de VHF, o en MF/HF',
    nota: 'Anexo IV 1 l): un alerta de socorro por llamada selectiva digital en el canal 70 de VHF o en 2187,5, 4207,5, 6312, 8414,5, 12577 o 16804,5 kHz (MF/HF).',
    forma: 'Un equipo de radio fijo con un botón rojo bajo una tapa y, en la antena, una señal digital.',
  },
  satelite: {
    letra: '1 m', hoja: 'radio', t: 'Alerta por|satélite', s: 'Inmarsat u otro|proveedor', nombre: 'Alerta por satélite', detalle: 'Inmarsat u otro proveedor',
    nota: 'Anexo IV 1 m): un alerta de socorro buque-costera transmitido por la estación terrena de buque de Inmarsat u otro proveedor de servicios móviles por satélite.',
    forma: 'Un satélite que recibe una alerta enviada desde un barco.',
  },
  radiobaliza: {
    letra: '1 n', hoja: 'radio', t: 'Radiobaliza', s: 'RLS (EPIRB)', nombre: 'Radiobaliza (RLS)', detalle: 'su alerta va a los satélites',
    nota: 'Anexo IV 1 n): las señales transmitidas por radiobalizas de localización de siniestros (RLS o EPIRB, de 406 MHz, detectadas por el sistema Cospas-Sarsat).',
    forma: 'Un aparato pequeño con antena y una luz en lo alto, que flota en el agua y emite hacia arriba.',
  },
  SART: {
    letra: '1 o', hoja: 'radio', t: 'Respondedor|de radar (SART)', s: 'y otras señales|aprobadas', nombre: 'Respondedor de radar (SART)', detalle: 'y otras señales de radio aprobadas',
    nota: 'Anexo IV 1 o): señales aprobadas de los sistemas de radiocomunicaciones, incluidos los respondedores de radar de las embarcaciones de supervivencia: el SART aparece en la pantalla del radar como una línea de 12 puntos.',
    forma: 'Una pantalla de radar con una línea de puntos que sale hacia el borde.',
  },
  lona: {
    letra: '3 a', hoja: 'vista', t: 'Lona naranja', s: 'cuadrado y|círculo negros', nombre: 'Lona naranja', detalle: 'cuadrado y círculo negros',
    nota: 'Anexo IV 3 a) (señal que se recuerda, para identificación desde el aire): un trozo de lona de color naranja con un cuadrado negro y un círculo, u otro símbolo pertinente.',
    forma: 'Un paño de color naranja con un cuadrado y un círculo negros dibujados.',
  },
  colorante: {
    letra: '3 b', hoja: 'vista', t: 'Colorante|en el agua', s: 'visible desde|el aire', nombre: 'Marca colorante en el agua', detalle: 'para que la vean desde el aire',
    nota: 'Anexo IV 3 b) (señal que se recuerda): una marca colorante del agua, muy visible desde el aire.',
    forma: 'Una gran mancha de color en el agua alrededor de una balsa, vista desde el aire.',
  },
};

/** Las cuatro hojas, en el orden en que se estudian. */
export const HOJAS_SOCORRO = {
  pirotecnia: { nombre: 'PIROTECNIA Y FUEGO', claves: ['cohete-paracaidas', 'bengala', 'humo', 'estrellas-rojas', 'llamaradas'] },
  sonido: { nombre: 'DETONACIÓN, SONIDO Y MORSE', claves: ['canon', 'niebla-continua', 'SOS'] },
  radio: { nombre: 'RADIO Y SATÉLITE', claves: ['MAYDAY', 'LSD', 'satelite', 'radiobaliza', 'SART'] },
  vista: { nombre: 'A LA VISTA', claves: ['NC', 'cuadrado-bola', 'brazos', 'lona', 'colorante'] },
};

// ---------------------------------------------------------------------------
// Pictogramas: centrados en (0, 0), en una caja de unos 84 × 60. Se escalan sin engordar el trazo.

const anim = (attr, values, dur, extra = '') => `<animate attributeName="${attr}" values="${values}" dur="${dur}s" repeatCount="indefinite"${extra ? ` ${extra}` : ''}/>`;
const mar = (y = 16, h = 14) => `<rect x="-42" y="${y}" width="84" height="${h}" fill="${T.agua}"/><line x1="-38" y1="${y + 7}" x2="38" y2="${y + 7}" stroke="${T.lineaAgua}" stroke-width=".8" stroke-dasharray="6 4"/>`;
const casco = (x = 0, y = 10, w = 52) => `<path d="M${f1(x - w / 2)},${y} L${f1(x + w / 2)},${y} L${f1(x + w / 2 - 6)},${y + 9} L${f1(x - w / 2 + 4)},${y + 9}Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2" stroke-linejoin="round"/>`;

// SOS en Morse con una luz: punto 1 unidad, raya 3, separación 1, entre letras 3 y pausa final 7.
function sosRitmo() {
  const u = 0.22;
  const steps = [];
  ['...', '---', '...'].forEach((l, i) => {
    [...l].forEach((c, j) => { steps.push({ on: true, d: (c === '.' ? 1 : 3) * u }); if (j < l.length - 1) steps.push({ on: false, d: u }); });
    steps.push({ on: false, d: (i < 2 ? 3 : 7) * u });
  });
  return { period: steps.reduce((s, x) => s + x.d, 0), steps, colors: ['luz'] };
}

/** Puntos y rayas del Morse dibujados (no con caracteres), centrados en (x, y). */
function morseDibujado(x, y, grupos, { u = 3.2, color = T.tinta } = {}) {
  const ancho = grupos.reduce((s, g, i) => s + [...g].reduce((a, c, j) => a + (c === '.' ? u : 3 * u) + (j < g.length - 1 ? u : 0), 0) + (i < grupos.length - 1 ? 3 * u : 0), 0);
  let cx = x - ancho / 2;
  const o = [];
  grupos.forEach((g, i) => {
    [...g].forEach((c, j) => {
      if (c === '.') o.push(`<circle cx="${f1(cx + u / 2)}" cy="${f1(y)}" r="${f1(u * 0.6)}" fill="${color}"/>`);
      else o.push(`<rect x="${f1(cx)}" y="${f1(y - u * 0.55)}" width="${f1(3 * u)}" height="${f1(u * 1.1)}" fill="${color}"/>`);
      cx += (c === '.' ? u : 3 * u) + (j < g.length - 1 ? u : 0);
    });
    if (i < grupos.length - 1) cx += 3 * u;
  });
  return o.join('');
}

const PICTO = {
  canon: () => mar() + casco(-6, 9, 60) +
    `<rect x="-22" y="-2" width="30" height="7" rx="3" fill="${T.tinta}" transform="rotate(-18 -22 2)"/><circle cx="-17" cy="6" r="5" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/>` +
    `<path d="M16,-8 l6,-10 l2,9 l10,-5 l-6,9 l11,2 l-11,4 l7,8 l-10,-3 l-1,10 l-5,-9 l-6,6 l1,-9Z" fill="${T.amarillo}" stroke="${T.rojoTxt}" stroke-width="1">${anim('opacity', '0;1;0;0;0', 2, 'calcMode="discrete"')}</path>`,
  'niebla-continua': () => `<path d="M-36,-8 L-24,-8 L-8,-18 L-8,8 L-24,-2 L-36,-2Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2" stroke-linejoin="round"/>` +
    [0, 1, 2].map((i) => `<path d="M${i * 9},${-16 - i * 4} q${8 + i * 3},${11 + i * 4} 0,${22 + i * 8}" fill="none" stroke="${T.tinta}" stroke-width="1.4">${anim('opacity', '.25;1;.25', 1.2, `begin="${f1(i * 0.3)}s"`)}</path>`).join('') +
    `<rect x="-36" y="22" width="72" height="5" fill="${T.magenta}"/>`,
  'estrellas-rojas': () => `<line x1="-24" y1="28" x2="-2" y2="-4" stroke="${T.tinta}" stroke-width="1.2" stroke-dasharray="3 2"/>` +
    `<g>${[0, 60, 120, 180, 240, 300].map((a) => `<circle cx="${f1(Math.cos((a * Math.PI) / 180) * 14)}" cy="${f1(-14 + Math.sin((a * Math.PI) / 180) * 14)}" r="3.4" fill="${T.rojo}" stroke="${T.tinta}" stroke-width=".6"/>`).join('')}` +
    `<circle cx="0" cy="-14" r="3.8" fill="${T.rojo}" stroke="${T.tinta}" stroke-width=".6"/>${anim('opacity', '.15;1;1;.15', 2.4)}</g>`,
  SOS: () => { const rh = sosRitmo(); return `<circle cx="0" cy="-8" r="17" fill="${T.noche}" stroke="${T.tinta}" stroke-width="1.2"/><circle cx="0" cy="-8" r="12" fill="${T.luzBlanca}" opacity=".3">${rhythmAnimation(rh)}</circle><circle cx="0" cy="-8" r="6.5" fill="${T.luzBlanca}">${rhythmAnimation(rh)}</circle>` + morseDibujado(0, 22, ['...', '---', '...']); },
  MAYDAY: () => `<rect x="-34" y="-12" width="20" height="38" rx="4" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/><line x1="-19" y1="-12" x2="-19" y2="-28" stroke="${T.tinta}" stroke-width="2.2" stroke-linecap="round"/>` +
    `<rect x="-30" y="-7" width="12" height="9" fill="${T.agua2}" stroke="${T.tinta}" stroke-width=".7"/><circle cx="-24" cy="12" r="3" fill="none" stroke="${T.tinta}" stroke-width=".8"/>` +
    `<path d="M-6,-24 h40 a4,4 0 0 1 4,4 v18 a4,4 0 0 1 -4,4 h-28 l-8,8 l1,-8 h-5 a4,4 0 0 1 -4,-4 v-18 a4,4 0 0 1 4,-4z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2" stroke-linejoin="round"/>` +
    `<path d="M0,-17 h30 M0,-11 h30 M0,-5 h20" stroke="${T.magenta}" stroke-width="2.2" stroke-linecap="round">${anim('opacity', '1;.3;1', 1.6)}</path>`,
  NC: () => `<line x1="-17" y1="-31" x2="-17" y2="30" stroke="${T.tinta}" stroke-width="2.4" stroke-linecap="round"/>${panoBandera('N', -15, -28, 32, 24)}${panoBandera('C', -15, 0, 32, 24)}`,
  'cuadrado-bola': () => `<line x1="-17" y1="-31" x2="-17" y2="30" stroke="${T.tinta}" stroke-width="2.4" stroke-linecap="round"/><line x1="-14" y1="-28" x2="-14" y2="20" stroke="${T.tinta}" stroke-width=".7"/>` +
    `<circle cx="-3" cy="-19" r="8" fill="${T.negro}" stroke="${T.tinta}" stroke-width="1.2"/><rect x="-13" y="-7" width="26" height="26" fill="${T.azul}" stroke="${T.tinta}" stroke-width="1.4"/>`,
  llamaradas: () => mar(18) + casco(0, 10, 72) +
    `<rect x="-7" y="-3" width="14" height="13" fill="${T.tierra}" stroke="${T.tinta}" stroke-width="1"/><path d="M-7,1 h14 M-7,6 h14" stroke="${T.tinta}" stroke-width=".7"/>` +
    `<path d="M-9,-3 q-5,-15 4,-23 q0,10 6,6 q2,-10 -2,-17 q15,9 9,34Z" fill="${T.naranja}" stroke="${T.tinta}" stroke-width=".8">${anim('opacity', '1;.6;1', 0.6)}</path><path d="M-3,-3 q-2,-8 3,-13 q4,7 2,13Z" fill="${T.amarillo}"/>`,
  'cohete-paracaidas': () => mar(22, 8) + `<line x1="-24" y1="22" x2="-6" y2="-26" stroke="${T.tinta}" stroke-width="1.1" stroke-dasharray="3 2"/>` +
    `<g><path d="M-8,-24 a12,9 0 0 1 24,0 Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.1"/><path d="M-8,-24 L4,-12 L16,-24" fill="none" stroke="${T.tinta}" stroke-width=".7"/>` +
    `<circle cx="4" cy="-9" r="8" fill="${T.rojo}" opacity=".35"/><circle cx="4" cy="-9" r="3.6" fill="${T.rojo}" stroke="${T.tinta}" stroke-width=".6"/><animateTransform attributeName="transform" type="translate" values="0,0;3,22" dur="5s" repeatCount="indefinite"/></g>`,
  bengala: () => `<path d="M-36,26 L-15,8 L-8,15 L-29,31Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1" stroke-linejoin="round"/>` +
    `<rect x="-12" y="-10" width="7" height="26" fill="${T.tinta}" transform="rotate(30 -9 3)"/>` +
    `<circle cx="1" cy="-15" r="14" fill="${T.rojo}" opacity=".3">${anim('r', '12;16;12', 0.4)}</circle><circle cx="1" cy="-15" r="6" fill="${T.rojo}" stroke="${T.tinta}" stroke-width=".6">${anim('opacity', '1;.7;1', 0.3)}</circle>`,
  humo: () => mar(16) + `<rect x="-6" y="6" width="12" height="15" rx="2" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.1"/>` +
    `<circle cx="2" cy="-2" r="6" fill="${T.naranja}" opacity=".7"/><circle cx="11" cy="-13" r="9" fill="${T.naranja}" opacity=".55"/><circle cx="25" cy="-22" r="11" fill="${T.naranja}" opacity=".4"/>` +
    [0, 1, 2].map((i) => `<circle cx="0" cy="2" r="6" fill="${T.naranja}" opacity="0"><animate attributeName="cy" values="2;-28" dur="3s" begin="${i}s" repeatCount="indefinite"/><animate attributeName="r" values="6;14" dur="3s" begin="${i}s" repeatCount="indefinite"/><animate attributeName="cx" values="0;22" dur="3s" begin="${i}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="3s" begin="${i}s" repeatCount="indefinite"/></circle>`).join(''),
  brazos: () => mar(20, 10) + casco(0, 13, 56) +
    `<circle cx="0" cy="-20" r="5.5" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/><line x1="0" y1="-14" x2="0" y2="5" stroke="${T.tinta}" stroke-width="3" stroke-linecap="round"/><path d="M0,5 L-5,13 M0,5 L5,13" stroke="${T.tinta}" stroke-width="2.4" stroke-linecap="round"/>` +
    `<path d="M0,-10 L-22,-26 M0,-10 L22,-26" stroke="${T.apagado}" stroke-width="2" stroke-dasharray="3 2" stroke-linecap="round"/>` +
    `<path d="M0,-10 L-24,-4 M0,-10 L24,-4" stroke="${T.tinta}" stroke-width="2.6" stroke-linecap="round"/>` +
    `<path d="M-30,-8 q-3,-9 -6,-14 M30,-8 q3,-9 6,-14" fill="none" stroke="${T.magenta}" stroke-width="1.3"/>`,
  LSD: () => `<rect x="-38" y="-14" width="70" height="30" rx="3" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/><rect x="-33" y="-9" width="32" height="13" fill="${T.agua2}" stroke="${T.tinta}" stroke-width=".7"/>` +
    `<rect x="6" y="-8" width="18" height="18" fill="${T.rojo}" stroke="${T.tinta}" stroke-width="1"/><path d="M4,-10 L26,-10 L24,-20 L6,-20Z" fill="none" stroke="${T.tinta}" stroke-width="1"/>` +
    `<line x1="28" y1="-14" x2="28" y2="-30" stroke="${T.tinta}" stroke-width="1.8" stroke-linecap="round"/><polyline points="31,-26 34,-26 34,-31 37,-31 37,-26 40,-26 40,-31 42,-31" fill="none" stroke="${T.magenta}" stroke-width="1.3">${anim('opacity', '1;.25;1', 1)}</polyline>` +
    `<path d="M-33,10 h28" stroke="${T.tinta}" stroke-width=".8"/>`,
  satelite: () => `<g transform="translate(18 -20)"><rect x="-5" y="-5" width="10" height="10" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.1"/><rect x="-22" y="-3" width="15" height="6" fill="${T.azul}" stroke="${T.tinta}" stroke-width=".7"/><rect x="7" y="-3" width="15" height="6" fill="${T.azul}" stroke="${T.tinta}" stroke-width=".7"/></g>` +
    mar(18) + casco(-14, 12, 40) + `<circle cx="-16" cy="6" r="5" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>` +
    `<line x1="-13" y1="1" x2="13" y2="-15" stroke="${T.magenta}" stroke-width="1.6" stroke-dasharray="4 3">${anim('stroke-dashoffset', '14;0', 0.8)}</line>`,
  radiobaliza: () => mar(14, 16) + `<rect x="-7" y="-6" width="14" height="26" rx="4" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1.2"/><line x1="0" y1="-6" x2="0" y2="-27" stroke="${T.tinta}" stroke-width="2" stroke-linecap="round"/>` +
    `<circle cx="0" cy="-9" r="3.6" fill="${T.luzBlanca}" stroke="${T.tinta}" stroke-width=".6">${anim('opacity', '1;.15;.15;.15', 1, 'calcMode="discrete"')}</circle>` +
    [0, 1].map((i) => `<path d="M${8 + i * 8},${-31 - i * 3} q${6 + i * 3},${8 + i * 2} 0,${16 + i * 6}" fill="none" stroke="${T.magenta}" stroke-width="1.5">${anim('opacity', '.2;1;.2', 1.2, `begin="${f1(i * 0.3)}s"`)}</path>`).join(''),
  SART: () => `<circle r="27" fill="${T.noche}" stroke="${T.tinta}" stroke-width="1.2"/><circle r="18" fill="none" stroke="${T.luzVerde}" stroke-width=".5" opacity=".5"/><circle r="9" fill="none" stroke="${T.luzVerde}" stroke-width=".5" opacity=".5"/><circle r="1.8" fill="${T.luzVerde}"/>` +
    [...Array(12)].map((_, i) => `<circle cx="${f1(5 + i * 1.6)}" cy="${f1(-5 - i * 1.6)}" r="1.3" fill="${T.luzVerde}"/>`).join('') +
    `<line x1="0" y1="0" x2="0" y2="-27" stroke="${T.luzVerde}" stroke-width="1" opacity=".7"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite"/></line>`,
  lona: () => `<rect x="-36" y="-23" width="72" height="46" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.2"/><rect x="-27" y="-10" width="20" height="20" fill="${T.negro}"/><circle cx="16" cy="0" r="10" fill="${T.negro}"/>`,
  colorante: () => `<rect x="-42" y="-28" width="84" height="56" fill="${T.agua}"/><ellipse cx="0" cy="0" rx="30" ry="17" fill="${T.verde}" opacity=".7">${anim('rx', '24;34;24', 4)}</ellipse><circle cx="0" cy="0" r="5" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1"/>`,
};

/** El pictograma de una señal en (x, y), a escala s; el trazo no engorda al escalar. */
export function pictoSocorro(k, x, y, s = 1) {
  const f = PICTO[k];
  if (!f) return '';
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${f().replace(/stroke-width="/g, 'vector-effect="non-scaling-stroke" stroke-width="')}</g>`;
}

// ---------------------------------------------------------------------------
// Índice, hojas y señal sola

const W = 358;
const letraDe = (k) => `${SOCORRO[k].letra})`;

/** Índice: las cuatro hojas en una cuadrícula de dos por dos, cada señal en pequeño con su letra. */
function indice() {
  const H = 452;
  const alt = 'Las diecisiete señales del Anexo IV del RIPA en cuatro grupos, cada una con su pictograma y su letra: pirotecnia y fuego (1 c, 1 h, 1 i y 1 j), detonación, sonido y Morse (1 a, 1 b y 1 d), radio y satélite (1 e, 1 l, 1 m, 1 n y 1 o) y a la vista (1 f, 1 g, 1 k y las complementarias 3 a y 3 b).';
  const { out, cierra } = lienzo(W, H, alt);
  const paneles = [['pirotecnia', 14, 16], ['sonido', 182, 16], ['radio', 14, 232], ['vista', 182, 232]];
  for (const [h, x0, y0] of paneles) {
    const pw = 162;
    out.push(`<rect x="${x0}" y="${y0}" width="${pw}" height="206" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>`);
    out.push(rotulo(x0 + pw / 2, y0 + 18, HOJAS_SOCORRO[h].nombre.split(',')[0].replace(' Y MORSE', ''), { size: TXT.min, weight: 700, estilo: 'cap', color: T.magenta, espacio: 1 }));
    HOJAS_SOCORRO[h].claves.forEach((k, i) => {
      const cx = x0 + 42 + (i % 2) * 78;
      const cy = y0 + 52 + Math.floor(i / 2) * 60;
      out.push(pictoSocorro(k, cx, cy, 0.68), rotulo(cx, cy + 31, letraDe(k), { size: TXT.min, estilo: 'mono', weight: 700 }));
    });
  }
  out.push(cierra());
  return { svg: out.join(''), caption: 'Juntas o por separado, indican peligro y necesidad de ayuda; está prohibido usarlas para otra cosa o hacer señales que se confundan con ellas. Las antiguas alarmas radiotelegráfica y radiotelefónica ya no figuran. La lona y el colorante (punto 3) son señales complementarias para que te localicen desde el aire.' };
}

/** Una hoja: cada señal en una fila con su pictograma, su letra, su nombre y su detalle. */
function hojaSocorro(h, hl = null) {
  const claves = HOJAS_SOCORRO[h].claves;
  const fila = 72;
  const H = 40 + claves.length * fila + 6;
  const alt = `Señales de peligro del Anexo IV, ${HOJAS_SOCORRO[h].nombre.toLowerCase()}: ${claves.map((k) => `${SOCORRO[k].letra}), ${SOCORRO[k].nombre.toLowerCase()}, ${SOCORRO[k].detalle}`).join('; ')}.${hl ? ` Resaltada: ${SOCORRO[hl].nombre.toLowerCase()}.` : ''}`;
  const { out, cierra } = lienzo(W, H, alt);
  out.push(rotulo(16, 27, `ANEXO IV · ${HOJAS_SOCORRO[h].nombre}`, { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.apagado, espacio: 1 }));
  claves.forEach((k, i) => {
    const s = SOCORRO[k];
    const y = 38 + i * fila;
    const on = hl === k;
    const dim = hl && !on ? ' opacity=".42"' : '';
    out.push(`<g data-parte="${k}"${dim}><rect x="12" y="${y}" width="${W - 24}" height="${fila - 6}" fill="${T.papel}" stroke="${on ? T.magenta : T.tinta}" stroke-width="${on ? 2 : 1}"/>`,
      `<rect x="17" y="${y + 5}" width="92" height="${fila - 16}" fill="${T.fondo}" stroke="${T.tinta}" stroke-width=".5"/>`,
      pictoSocorro(k, 63, y + (fila - 6) / 2, 0.86),
      etiqueta(122 + (s.letra.length + 1) * 3.6, y + 17, letraDe(k), { size: TXT.min, color: on ? T.magenta : T.tinta }),
      rotulo(120, y + 40, s.nombre, { size: 14, weight: 700, estilo: 'serif', anchor: 'start', color: on ? T.magenta : T.tinta }),
      rotulo(120, y + 57, s.detalle, { size: TXT.min + 0.5, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }), '</g>');
  });
  out.push(cierra());
  return { svg: out.join(''), caption: hl ? SOCORRO[hl].nota : `Señales de peligro del Anexo IV del RIPA: ${HOJAS_SOCORRO[h].nombre.toLowerCase()}. Juntas o por separado, indican peligro y necesidad de ayuda.` };
}

// --- La señal sola, en grande. Las cinco que se estudian a fondo llevan sus cifras y su funcionamiento.

/** Cabecera común de la señal sola: su letra en una etiqueta. */
const cabecera = (k) => etiqueta(W - 16 - (`ANEXO IV · ${letraDe(k)}`.length * TXT.min * 0.31) - 5, 24, `ANEXO IV · ${letraDe(k)}`, { size: TXT.min, color: T.magenta });

function soloGenerica(k) {
  const s = SOCORRO[k];
  const H = 290;
  const { out, cierra } = lienzo(W, H, `${s.forma} Es la señal de peligro ${s.letra}) del Anexo IV del RIPA: ${s.nombre.toLowerCase()}, ${s.detalle}.`);
  out.push(cabecera(k));
  out.push(`<rect x="70" y="44" width="218" height="160" fill="${T.fondo}" stroke="${T.tinta}" stroke-width=".7"/>`, pictoSocorro(k, 179, 124, 2.4));
  out.push(rotulo(W / 2, 236, s.nombre, { size: TXT.nombre + 2, weight: 700, estilo: 'serif' }), rotulo(W / 2, 260, s.detalle, { size: TXT.nota + 0.5, estilo: 'serif', italic: true, color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: s.nota };
}

/** Cohete con paracaídas: sube a 300 m o más y su luz roja baja colgada del paracaídas (Código IDS, 3.1). */
function soloCohete() {
  const H = 330;
  const alt = 'Cohete con paracaídas lanzado desde un barco: la estela a trazos sube hasta 300 metros o más, acotados desde el agua; allí se abre el paracaídas y la luz roja, de 30.000 candelas o más, arde 40 segundos o más mientras baja a no más de 5 metros por segundo.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(cabecera('cohete-paracaidas'));
  out.push(`<rect x="0" y="286" width="${W}" height="${H - 286}" fill="${T.agua}"/>`, ondas(10, W - 10, 304, { sep: 9 }));
  // el barco y la estela del cohete
  out.push(`<path d="M44,276 L118,276 L110,288 L52,288Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/><line x1="76" y1="276" x2="76" y2="226" stroke="${T.tinta}" stroke-width="1.6"/>`);
  out.push(`<path d="M100,272 C116,200 138,120 168,72" fill="none" stroke="${T.tinta}" stroke-width="1.2" stroke-dasharray="5 4"/>`);
  // apogeo, paracaídas y luz que baja
  out.push(`<circle cx="168" cy="72" r="3" fill="${T.tinta}"/>`, referencia(168, 72, 40, 72));
  out.push(cota(40, 286, 40, 72, '', { tope: 6 }), etiqueta(40, 180, '≥ 300 m', { color: T.magenta }));
  out.push(`<path d="M196,96 a20,14 0 0 1 40,0 Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.3"/><path d="M196,96 L216,124 L236,96 M216,96 L216,124" fill="none" stroke="${T.tinta}" stroke-width=".8"/>`);
  out.push(`<circle cx="216" cy="130" r="16" fill="${T.rojo}" opacity=".3"/><circle cx="216" cy="130" r="7" fill="${T.rojo}" stroke="${T.tinta}" stroke-width="1"/>`);
  out.push(flecha(216, 156, 216, 214, { color: T.tinta, w: 1.4 }), etiqueta(268, 186, '≤ 5 m/s', {}));
  out.push(etiqueta(292, 118, '≥ 30.000 cd', { color: T.rojoTxt }), etiqueta(292, 142, '≥ 40 s', { color: T.rojoTxt }));
  out.push(rotulo(W - 16, 268, 'luz roja', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'end', color: T.rojoTxt, weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Anexo IV 1 i). Según el Código IDS (3.1), sube a 300 m como mínimo y su luz roja da 30.000 cd o más durante 40 s o más, bajando a no más de 5 m/s.' };
}

/** Bengala de mano: por sotavento, con el brazo por fuera de la borda (Código IDS, 3.2). */
function soloBengala() {
  const H = 300;
  const alt = 'Bengala de mano vista desde popa: el tripulante, con el viento por la espalda, la sostiene con el brazo extendido por fuera de la borda de sotavento; luz roja de 15.000 candelas o más durante 1 minuto o más, y el humo se aleja del barco.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(cabecera('bengala'));
  out.push(`<rect x="0" y="232" width="${W}" height="${H - 232}" fill="${T.agua}"/>`, ondas(10, W - 10, 254, { sep: 9 }));
  // el barco en sección (visto desde popa) y el tripulante en la banda de sotavento (derecha)
  out.push(`<path d="M86,196 L246,196 L232,240 L196,256 L136,256 L100,240Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/><line x1="166" y1="196" x2="166" y2="58" stroke="${T.tinta}" stroke-width="2"/>`);
  out.push(`<circle cx="222" cy="140" r="9" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.4"/><line x1="222" y1="149" x2="222" y2="182" stroke="${T.tinta}" stroke-width="5" stroke-linecap="round"/><path d="M222,182 L214,196 M222,182 L230,196" stroke="${T.tinta}" stroke-width="3.4" stroke-linecap="round"/>`);
  out.push(`<path d="M222,156 L262,148" stroke="${T.tinta}" stroke-width="4" stroke-linecap="round"/><rect x="260" y="128" width="6" height="26" fill="${T.tinta}" transform="rotate(12 263 141)"/>`);
  out.push(`<circle cx="267" cy="120" r="20" fill="${T.rojo}" opacity=".3"><animate attributeName="r" values="17;22;17" dur=".5s" repeatCount="indefinite"/></circle><circle cx="267" cy="120" r="8" fill="${T.rojo}" stroke="${T.tinta}" stroke-width="1"/>`);
  out.push(`<path d="M278,108 C296,96 300,80 322,70" fill="none" stroke="${T.apagado}" stroke-width="5" stroke-linecap="round" opacity=".5"/>`);
  // el viento, por la espalda (de barlovento, izquierda)
  out.push(flecha(18, 104, 76, 104, { color: T.tinta, w: 1.6 }), flecha(18, 124, 76, 124, { color: T.tinta, w: 1.6 }), rotulo(18, 92, 'viento', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start' }));
  out.push(rotulo(110, 186, 'barlovento', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }), rotulo(272, 186, 'sotavento', { size: TXT.min, estilo: 'serif', italic: true, color: T.magenta, weight: 700 }));
  out.push(etiqueta(300, 54, '≥ 15.000 cd', { color: T.rojoTxt }), etiqueta(300, 78, '≥ 1 min', { color: T.rojoTxt }));
  out.push(rotulo(W / 2, H - 14, 'brazo extendido por fuera de la borda', { size: TXT.nota, estilo: 'serif', italic: true }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Anexo IV 1 i). Según el Código IDS (3.2), arde en rojo con 15.000 cd o más durante 1 minuto o más, y sigue ardiendo tras sumergirla 10 s a 100 mm.' };
}

/** Señal fumígena flotante: humo naranja durante 3 minutos o más, de día (Código IDS, 3.3). */
function soloHumo() {
  const H = 290;
  const alt = 'Señal fumígena flotante en el agua: suelta una densa humareda naranja que el viento se lleva, durante 3 minutos o más; es la señal de día, que se ve bien desde el aire y marca un punto en el agua.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(cabecera('humo'));
  out.push(`<rect x="0" y="206" width="${W}" height="${H - 206}" fill="${T.agua}"/>`, ondas(10, W - 10, 228, { sep: 9 }));
  out.push(`<rect x="70" y="190" width="22" height="26" rx="3" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.4"/><rect x="74" y="184" width="14" height="7" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>`);
  const nubes = [[86, 168, 12], [108, 146, 18], [140, 124, 24], [182, 104, 30], [234, 90, 34], [290, 80, 36]];
  nubes.forEach(([x, y, r], i) => out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${T.naranja}" opacity="${f1(0.75 - i * 0.09)}"/>`));
  out.push(flecha(20, 64, 82, 64, { color: T.tinta, w: 1.6 }), rotulo(20, 52, 'viento', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start' }));
  out.push(etiqueta(150, 196, '≥ 3 min', { color: T.magenta }), rotulo(150, 222, 'flota', { size: TXT.nota, estilo: 'serif', italic: true }));
  out.push(rotulo(W - 16, 168, 'humo naranja:', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'end', weight: 700 }), rotulo(W - 16, 184, 'la señal de día', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'end', weight: 700 }));
  out.push(rotulo(W / 2, H - 14, 'marca un punto en el agua (hombre al agua)', { size: TXT.nota, estilo: 'serif', italic: true }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Anexo IV 1 j). Según el Código IDS (3.3), la señal fumígena flotante echa humo naranja durante 3 minutos como mínimo en aguas tranquilas, sin llama, y no se anega con mar encrespada.' };
}

/** Radiobaliza: de la RLS a Salvamento Marítimo, por los satélites Cospas-Sarsat. */
function soloRadiobaliza() {
  const H = 392;
  const alt = 'Cadena de una alerta de radiobaliza: 1, la radiobaliza flota en el agua y emite en 406 MHz con la identidad del barco; 2, un satélite Cospas-Sarsat la recibe; 3, la estación terrena la recoge; 4, el centro de control (el español, en Maspalomas) la pasa; 5, a Salvamento Marítimo, que coordina el rescate. Además, emite en 121,5 MHz la señal de recalada para los medios de rescate.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(cabecera('radiobaliza'));
  // mar a la izquierda, tierra a la derecha
  out.push(`<rect x="0" y="214" width="196" height="54" fill="${T.agua}"/>`, ondas(10, 186, 236, { sep: 9 }));
  out.push(`<path d="M196,268 L196,214 C230,206 300,204 ${W},200 L${W},268Z" fill="${T.tierra}" stroke="${T.tinta}" stroke-width="1"/><path d="M196,268 L196,214 C230,206 300,204 ${W},200 L${W},268Z" fill="${pt}" opacity=".5"/>`);
  out.push(pictoSocorro('radiobaliza', 74, 210, 1.25));
  // el satélite
  out.push(`<g transform="translate(184 74)"><rect x="-8" y="-8" width="16" height="16" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.3"/><rect x="-34" y="-5" width="24" height="10" fill="${T.azul}" stroke="${T.tinta}" stroke-width="1"/><rect x="10" y="-5" width="24" height="10" fill="${T.azul}" stroke="${T.tinta}" stroke-width="1"/><line x1="0" y1="8" x2="0" y2="16" stroke="${T.tinta}" stroke-width="1.4"/></g>`);
  // la estación terrena (antena parabólica) y el centro de control
  out.push(`<path d="M248,200 l8,-14 l8,14Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/><path d="M240,180 a18,18 0 0 0 32,-14" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.3"/><line x1="256" y1="176" x2="262" y2="168" stroke="${T.tinta}" stroke-width="1.2"/>`);
  out.push(`<rect x="296" y="168" width="40" height="34" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.3"/><path d="M292,168 L316,152 L340,168Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.3"/><rect x="310" y="184" width="12" height="18" fill="${T.tinta}"/>`);
  // los enlaces
  out.push(`<line x1="82" y1="180" x2="170" y2="88" stroke="${T.magenta}" stroke-width="1.8" stroke-dasharray="6 4"/>`, etiqueta(104, 128, '406 MHz', { color: T.magenta }));
  out.push(`<line x1="196" y1="88" x2="252" y2="166" stroke="${T.tinta}" stroke-width="1.3" stroke-dasharray="6 4"/>`, flecha(272, 186, 292, 186, { color: T.tinta, w: 1.4 }));
  // la recalada: arcos cortos alrededor de la baliza
  out.push(`<path d="M42,198 a34,34 0 0 1 0,-30 M30,204 a48,48 0 0 1 0,-42" fill="none" stroke="${T.tinta}" stroke-width="1.1"/>`, rotulo(12, 160, 'recalada', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start' }), rotulo(12, 146, '121,5 MHz', { size: TXT.min, estilo: 'mono', anchor: 'start' }));
  out.push(paso(100, 238, 1), paso(212, 54, 2), paso(236, 214, 3), paso(316, 222, 4));
  // la cuenta, en filas numeradas
  out.push(`<line x1="14" y1="276" x2="${W - 14}" y2="276" stroke="${T.tinta}" stroke-width=".6"/>`);
  [
    'La radiobaliza emite en 406 MHz, con su MMSI',
    'Un satélite Cospas-Sarsat la recibe',
    'La estación terrena la recoge',
    'El centro de control (Maspalomas) la pasa',
    'a Salvamento Marítimo, que coordina el rescate',
  ].forEach((t, i) => out.push(filaPaso(22, 298 + i * 21, i + 1, t, { clave: i === 4 })));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Anexo IV 1 n). La alerta de 406 MHz llega a Salvamento Marítimo por los satélites Cospas-Sarsat; los barcos de alrededor no la oyen. La de 121,5 MHz sirve para recalar sobre ella.' };
}

/** SART: en la pantalla del radar, una línea de 12 puntos que sale de su posición hacia fuera. */
function soloSart() {
  const H = 330;
  const alt = 'A la izquierda, una balsa con el SART en su soporte, a un metro o más sobre el agua. A la derecha, la pantalla del radar del buque que busca: el SART aparece como una línea de 12 puntos que empieza en su posición y se aleja del centro en su misma demora.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(cabecera('SART'));
  // la balsa con el SART
  out.push(`<rect x="0" y="244" width="140" height="50" fill="${T.agua}"/>`, ondas(8, 132, 262, { sep: 9 }));
  out.push(`<path d="M24,246 C24,214 104,214 104,246Z" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.4"/><rect x="20" y="240" width="88" height="10" rx="5" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.4"/>`);
  out.push(`<line x1="64" y1="222" x2="64" y2="164" stroke="${T.tinta}" stroke-width="1.6"/><rect x="57" y="140" width="14" height="26" rx="3" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1.3"/>`);
  out.push(cota(116, 244, 116, 152, '', { tope: 5 }), etiqueta(116, 198, '≥ 1 m', { color: T.magenta }), referencia(72, 152, 116, 152));
  out.push(rotulo(64, 286, 'balsa', { size: TXT.nota, estilo: 'serif', italic: true }));
  out.push(rotulo(20, 72, 'banda X', { size: TXT.nota, estilo: 'serif', anchor: 'start', weight: 700 }), etiqueta(48, 96, '9 GHz', {}));
  out.push(rotulo(20, 124, 'se enciende a mano', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }));
  // la pantalla del radar
  const [cx, cy, R] = [252, 168, 92];
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${T.noche}" stroke="${T.tinta}" stroke-width="1.6"/>`);
  for (const k of [1 / 3, 2 / 3]) out.push(`<circle cx="${cx}" cy="${cy}" r="${f1(R * k)}" fill="none" stroke="${T.luzVerde}" stroke-width=".7" opacity=".45"/>`);
  out.push(`<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - R}" stroke="${T.luzVerde}" stroke-width="1" opacity=".6"/><circle cx="${cx}" cy="${cy}" r="3" fill="${T.luzVerde}"/>`);
  const ang = (300 * Math.PI) / 180;
  const ux = Math.sin(ang);
  const uy = -Math.cos(ang);
  for (let i = 0; i < 12; i++) { const r = R * 0.3 + i * (R * 0.62 / 11); out.push(`<circle cx="${f1(cx + ux * r)}" cy="${f1(cy + uy * r)}" r="2.6" fill="${T.luzVerde}"/>`); }
  out.push(`<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - R}" stroke="${T.luzVerde}" stroke-width="1.4" opacity=".8"><animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="3s" repeatCount="indefinite"/></line>`);
  const p0 = [cx + ux * R * 0.3, cy + uy * R * 0.3];
  out.push(referencia(p0[0], p0[1], 196, 252, { color: T.magenta }), rotulo(200, 268, 'el SART está aquí', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.magenta, weight: 700 }));
  out.push(etiqueta(cx + 4, 56, '12 puntos hacia fuera', { color: T.magenta }));
  out.push(rotulo(W / 2, H - 34, 'de cerca, los puntos se vuelven arcos', { size: TXT.nota, estilo: 'serif', italic: true }), rotulo(W / 2, H - 16, 'y, muy cerca, círculos concéntricos', { size: TXT.nota, estilo: 'serif', italic: true }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Anexo IV 1 o). El SART responde al radar de banda X (9 GHz) de quien busca: en su pantalla, una línea de 12 puntos que empieza en el SART y se aleja en su misma demora.' };
}

const SOLO = { 'cohete-paracaidas': soloCohete, bengala: soloBengala, humo: soloHumo, radiobaliza: soloRadiobaliza, SART: soloSart };

export function socorroIllustration(spec) {
  const hl = spec.resaltar && SOCORRO[spec.resaltar] ? spec.resaltar : null;
  if (spec.resaltar && !hl) return null;
  if (spec.hoja != null && !HOJAS_SOCORRO[spec.hoja]) return null;
  if (hl && spec.solo) return (SOLO[hl] ?? soloGenerica)(hl);
  if (hl) return hojaSocorro(SOCORRO[hl].hoja, hl);
  if (spec.hoja) return hojaSocorro(spec.hoja);
  return indice();
}
