// Láminas de lección del PER que aún tenían el dibujo antiguo, rehechas en estilo C (cierre del PER,
// docs/ESTILO-LAMINAS.md), segunda parte: seguridad, emergencias y meteorología. Mismos tipos, parámetros y `resaltar`
// que las láminas a las que sustituyen (las que devolvían null con una vista o una parte desconocida lo siguen haciendo).
// Lo que no se ha podido comprobar no se dibuja (anotado en .trabajo-ux/ESTADO-per-cierre.md): el «hasta 20 millas» de
// las aguas costeras, los canales de trabajo concretos de Salvamento Marítimo y un umbral en hPa de la bajada rápida.
//   revision-salida:     { vista?: 'resumen'|'motor', resaltar? }                                     (per-3-2)
//   reflector-tormenta:  { vista?: 'reflector'|'tormenta' } (null con otra vista)                       (per-3-4)
//   varada-abordaje:     { vista?: 'varada'|'abordaje', resaltar? }                                    (per-8-4)
//   achique-sentina:     { resaltar? } (null con una parte desconocida)                                 (per-8-5)
//   barometro-tendencia: { vista?: 'instrumentos'|'tendencia', resaltar? } (null si no es de la vista)  (per-9-1)
//   mar-crece:           { vista?: 'factores'|'viento-fondo', resaltar? } (null si no vale)             (per-9-6)
//   prevision-salida:    { vista?: 'fuentes'|'decidir', resaltar? }                                    (per-9-7)

import { T, TXT, lienzo, rotulo, flecha, referencia, paso, pol, f1 } from './estilo-c.js';
import { W, serif, linea, panelNotas, tacha, bien, lista } from './kit-lecciones-c.js';
import { anclaG, recuadro } from './per-cola-c.js';
import { marcaC, escala, rotuloParte, centrado, planta, perfil, numero } from './per-final-c.js';

const agua = (x, y, w, h, fondo = T.agua) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fondo}"/>`;
const lineaAgua = (x1, x2, y) => linea(x1, y, x2, y, { color: T.lineaAgua, w: 1.4 });
const mono = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min, estilo: 'mono', weight: 600, anchor: 'start', ...o });
const lineas = (x, y, ls, o = {}, p = 16) => ls.map((l, i) => serif(x, y + i * p, l, { size: TXT.min, ...o })).join('');
const nube = (x, y, s = 1) => `<path transform="translate(${f1(x)} ${f1(y)}) scale(${s})" d="M0,14 C-8,14 -8,0 4,0 C4,-12 24,-14 30,-4 C36,-12 54,-10 54,2 C64,2 64,14 54,14 Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.1"/>`;

// ===========================================================================
// Revisión antes de salir (per-3-2). RD 875/2014, anexo II, PER UT 3.2: comprobaciones previas (aceite, filtros de
// decantación, refrigerante y refrigeración, correa del alternador, combustible, baterías, fugas, parte meteorológico…).

export const PARTES_REVISION = ['tiempo', 'barco', 'personas', 'tierra', 'aceite', 'refrigeracion', 'correa', 'decantador', 'combustible', 'fugas', 'baterias'];

function revisionResumen(m) {
  const H = 300;
  const alt = 'Tres fichas con lo que revisa el patrón antes de soltar amarras: el tiempo, con la previsión para toda la travesía y su evolución; el barco, con motor, gobierno, combustible y equipo de seguridad; y las personas, quién va a bordo y si saben qué hacer en una emergencia. Debajo, una cuarta: dejar dicho en tierra adónde vas, por dónde y cuándo vuelves.';
  const { out, cierra } = lienzo(W, H, alt);
  const cols = [
    ['tiempo', 'El tiempo', ['previsión de', 'toda la travesía', 'y su evolución,', 'no solo el cielo', 'de ahora']],
    ['barco', 'El barco', ['motor, gobierno,', 'combustible y', 'equipo de', 'seguridad']],
    ['personas', 'Las personas', ['quién va a bordo', 'y si saben qué', 'hacer en una', 'emergencia']],
  ];
  cols.forEach(([k, t, ls], i) => {
    const x = 12 + i * 113;
    const cx = x + 53;
    const g = [m.g(k), recuadro(x, 14, 106, 186, { on: m.on(k), fondo: T.papel })];
    if (k === 'tiempo') g.push(`<circle cx="${cx - 10}" cy="40" r="10" fill="${T.amarillo}" stroke="${T.tinta}"/>`, nube(cx - 22, 40, 0.7));
    else if (k === 'barco') g.push(`<path d="M${cx - 26},48 L${cx + 26},48 L${cx + 19},62 L${cx - 21},62 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1"/><rect x="${cx - 9}" y="36" width="16" height="12" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1"/>`);
    else for (const dx of [-16, 0, 16]) g.push(`<circle cx="${cx + dx}" cy="38" r="5.5" fill="${T.casco}" stroke="${T.tinta}"/><path d="M${cx + dx - 8},62 Q${cx + dx - 8},46 ${cx + dx},46 Q${cx + dx + 8},46 ${cx + dx + 8},62 Z" fill="${T.naranja}" stroke="${T.tinta}"/>`);
    g.push(centrado(cx, 88, t, { weight: 700, size: TXT.rotulo, color: m.c(k) }), lineas(cx, 110, ls, { anchor: 'middle' }), '</g>');
    out.push(g.join(''));
  });
  out.push(`${m.g('tierra')}${recuadro(12, 212, 332, 74, { on: m.on('tierra'), fondo: T.papel })}<path d="M26,250 L42,234 L58,250 Z" fill="${T.rojo}" stroke="${T.tinta}"/><rect x="30" y="250" width="24" height="20" fill="${T.casco}" stroke="${T.tinta}"/>`);
  out.push(serif(70, 234, 'Dilo en tierra, a alguien de confianza:', { size: TXT.min, weight: 700, color: m.c('tierra') }), serif(70, 252, 'adónde vas, por dónde y cuándo vuelves.', { size: TXT.min }), serif(70, 270, 'Si no llegas, alguien dará la alarma.', { size: TXT.min, italic: true }), '</g>');
  out.push(cierra());
  const CAP = {
    tiempo: 'El tiempo: la predicción para toda la travesía y cómo va a evolucionar, no solo el cielo que ves ahora.',
    barco: 'El barco: motor, gobierno, combustible y equipo de seguridad.',
    personas: 'Las personas: quién va a bordo y si saben qué hacer en una emergencia.',
    tierra: 'Deja dicho en tierra adónde vas, por dónde y cuándo piensas volver: si no llegas, alguien dará la alarma.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'Antes de salir, el patrón comprueba el tiempo, el barco y las personas, y deja dicho en tierra adónde va, por dónde y cuándo piensa volver.') };
}

function revisionMotor(m) {
  const S = W / 320;
  const { abre, P } = escala(S, 0, 8 - 32 * S);
  const H = 360;
  const alt = 'El motor y el combustible en la cámara, con siete puntos numerados: 1, el aceite, con su varilla; 2, la refrigeración, con el grifo de fondo, el filtro de agua salada y la salida de agua por el escape; 3, la correa del alternador; 4, el filtro decantador sin agua; 5, el combustible del tanque, para toda la travesía con reserva; 6, sin fugas de aceite ni de combustible; 7, las baterías cargadas.';
  const { out, cierra } = lienzo(W, H, alt);
  const st = (k, w) => `stroke="${m.c(k)}" stroke-width="${m.on(k) ? w + 1.2 : w}"`;
  const o = [abre, agua(8, 134, 304, 20), `<path d="M8,124 L276,124 L276,58 L284,58 L284,134 Q150,150 8,134 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1"/>`, `<rect x="8" y="118" width="268" height="6" fill="${T.apagado}" opacity=".45"/>`];
  o.push(`${m.g('combustible')}<rect x="14" y="62" width="44" height="54" rx="4" fill="${T.papel}" ${st('combustible', 1.3)}/><rect x="15" y="82" width="42" height="33" rx="3" fill="${T.amarillo}" opacity=".7"/></g>`);
  o.push(linea(58, 70, 80, 70, { color: T.apagado, w: 2 }), linea(80, 70, 80, 74, { color: T.apagado, w: 2 }), linea(94, 80, 112, 80, { color: T.apagado, w: 2 }));
  o.push(`${m.g('decantador')}<rect x="74" y="74" width="20" height="30" rx="5" fill="${T.papel}" ${st('decantador', 1.3)}/><rect x="76" y="80" width="16" height="22" rx="4" fill="${T.amarillo}" opacity=".45"/></g>`);
  o.push(`<rect x="112" y="58" width="82" height="56" rx="6" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.5"/>`);
  o.push(`${m.g('correa')}<circle cx="128" cy="72" r="6" fill="${T.papel}" stroke="${T.tinta}"/><circle cx="128" cy="98" r="9" fill="${T.papel}" stroke="${T.tinta}"/><line x1="122" y1="72" x2="119" y2="98" ${st('correa', 1.5)}/><line x1="134" y1="72" x2="137" y2="98" ${st('correa', 1.5)}/></g>`);
  o.push(`${m.g('aceite')}<line x1="182" y1="58" x2="182" y2="42" ${st('aceite', 1.6)}/><circle cx="182" cy="38" r="4" fill="none" ${st('aceite', 1.4)}/></g>`);
  o.push(`${m.g('refrigeracion')}<path d="M208,128 L208,122 M202,132 L214,124 M202,124 L214,132" fill="none" ${st('refrigeracion', 1.5)}/><line x1="208" y1="122" x2="208" y2="104" stroke="${T.azul}" stroke-width="2"/><rect x="200" y="82" width="16" height="22" rx="3" fill="${T.papel}" ${st('refrigeracion', 1.3)}/><path d="M208,82 L208,76 L194,76" fill="none" stroke="${T.azul}" stroke-width="2"/>${[[6, 6], [10, 14], [7, 22], [12, 28]].map(([dx, dy]) => `<circle cx="${284 + dx}" cy="${100 + dy}" r="2.2" fill="${T.azul}"/>`).join('')}</g>`);
  o.push(`<path d="M194,64 L264,64 L264,100 L284,100" fill="none" stroke="${T.tinta}" stroke-width="2.2"/>`);
  o.push(`${m.g('baterias')}<rect x="226" y="88" width="30" height="20" rx="2" fill="${T.papel}" ${st('baterias', 1.3)}/><rect x="230" y="84" width="5" height="4" fill="${T.tinta}"/><rect x="247" y="84" width="5" height="4" fill="${T.tinta}"/></g>`);
  o.push(`${m.g('fugas')}<path d="M150,114 q-4,6 0,8 q4,-2 0,-8 Z" fill="${T.amarillo}" ${st('fugas', 1)}/></g>`, '</g>');
  out.push(o.join(''));
  out.push(centrado(...P(153, 104), 'MOTOR', { weight: 700 }));
  const items = [
    ['aceite', 196, 40, ['Aceite: nivel correcto y sin fugas.']],
    ['refrigeracion', 228, 128, ['Refrigeración: grifo de fondo abierto, filtro', 'limpio y, al arrancar, agua por el escape.']],
    ['correa', 148, 72, ['Correa del alternador: tensa y en buen estado.']],
    ['decantador', 84, 50, ['Filtro decantador: sin agua.']],
    ['combustible', 36, 50, ['Combustible: para toda la travesía, con reserva.']],
    ['fugas', 168, 130, ['Fugas de aceite o combustible: ninguna.']],
    ['baterias', 241, 74, ['Baterías: cargadas.']],
  ];
  let y = 170;
  out.push(panelNotas(152, H));
  items.forEach(([k, mx, my, txt], i) => {
    out.push(numero(m, k, ...P(mx, my), i + 1));
    out.push(`<g data-parte="${k}">${mono(16, y, String(i + 1), { color: m.c(k) })}${lineas(30, y, txt, { color: m.c(k), weight: m.on(k) ? 700 : 400 })}</g>`);
    y += 16 * txt.length + 8;
  });
  out.push(cierra());
  const CAP = {
    aceite: 'Aceite del motor: nivel correcto y sin fugas.',
    refrigeracion: 'Refrigeración: grifo de fondo abierto, filtro de agua salada limpio y, al arrancar, comprobar que sale agua por el escape.',
    correa: 'La correa del alternador debe estar tensa y en buen estado: mueve el alternador y, en muchos motores, la bomba de agua.',
    decantador: 'El filtro decantador separa el agua del combustible: antes de salir, que no tenga agua.',
    combustible: 'Combustible suficiente para toda la travesía, con un buen margen de reserva.',
    fugas: 'Mira que no haya fugas de aceite o combustible en la sentina ni en el motor.',
    baterias: 'Baterías cargadas.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'Antes de salir se revisa el motor: aceite, refrigeración (sale agua por el escape), correa del alternador, filtro decantador sin agua, fugas y baterías, y se lleva combustible para toda la travesía con reserva.') };
}

export function revisionSalidaC(spec = {}) {
  const m = marcaC(spec, PARTES_REVISION);
  return spec.vista === 'motor' ? revisionMotor(m) : revisionResumen(m);
}

// ===========================================================================
// Reflector radar y tormenta eléctrica (per-3-4). RD 875/2014, anexo II, PER UT 3.4 y 3.5; RD 339/2021, art. 12
// (reflector de radar en todas las zonas, en las embarcaciones de casco no metálico).

function reflectorC() {
  const S = W / 320;
  const { abre, P } = escala(S, 0, 8 - 30 * S);
  const H = 318;
  const alt = 'Un velero de fibra con el reflector radar en lo alto del palo y un mercante con su radar: las ondas del radar del mercante llegan al velero, rebotan en el reflector y vuelven, y el mercante lo ve en su pantalla. El reflector es pasivo: no emite ni gasta energía. El RD 339/2021 lo exige en todas las zonas a las embarcaciones de casco no metálico.';
  const { out, cierra } = lienzo(W, H, alt);
  const o = [abre, agua(0, 160, 320, 30), lineaAgua(0, 320, 160)];
  o.push(`<path d="M24,156 L118,156 L106,170 L36,170 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>`, linea(70, 156, 70, 60, { w: 1.8 }));
  o.push(`<path d="M72,64 L108,150 L72,150 Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>`);
  o.push(`<g transform="translate(70,82)"><path d="M0,-11 L10,0 L0,11 L-10,0 Z" fill="${T.apagado}" stroke="${T.magenta}" stroke-width="1.6"/><path d="M0,-11 V11 M-10,0 H10" stroke="${T.tinta}" stroke-width="1"/></g>`);
  o.push(`<path d="M206,150 L314,150 L310,172 L214,172 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/><rect x="270" y="122" width="34" height="28" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1"/>`);
  o.push(linea(287, 122, 287, 104, { w: 1.5 }), `<rect x="276" y="100" width="22" height="4" rx="1" fill="${T.tinta}"/>`);
  for (const r of [10, 18, 26]) o.push(`<path d="M${287 - r},${f1(102 - r * 0.55)} A${r},${r} 0 0 0 ${287 - r},${f1(102 + r * 0.55)}" fill="none" stroke="${T.azul}" stroke-width="1.3"/>`);
  o.push(flecha(254, 96, 86, 80, { color: T.azul, w: 1.8 }), flecha(86, 92, 252, 112, { color: T.magenta, w: 2.2 }), '</g>');
  out.push(o.join(''));
  out.push(centrado(...P(70, 44), 'reflector radar', { weight: 700, color: T.magenta }), centrado(...P(70, 58), 'lo más alto posible', { italic: true }));
  out.push(centrado(...P(172, 74), 'las ondas de su radar', { weight: 700, color: T.azulTxt }), centrado(...P(172, 126), 'rebotan y vuelven: te ve', { weight: 700, color: T.magenta }));
  out.push(centrado(...P(259, 188), 'mercante con radar', { italic: true }), centrado(...P(64, 188), 'fibra o madera', { italic: true }));
  out.push(panelNotas(206, H));
  out.push(serif(16, 228, 'Pasivo: no emite nada ni gasta energía.', { size: TXT.min }), serif(16, 246, 'No mejora tu radar ni se orienta a mano.', { size: TXT.min }));
  out.push(serif(16, 270, 'RD 339/2021, art. 12: en todas las zonas,', { weight: 700 }), serif(16, 288, 'si el casco no es metálico.', { weight: 700 }), serif(16, 306, 'Con niebla, clave.', { size: TXT.min, italic: true }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'El reflector radar es pasivo: devuelve las ondas de los radares de otros barcos para que te vean en sus pantallas; no mejora tu radar. Se iza lo más alto posible y el RD 339/2021 lo exige en los barcos de casco no metálico, en todas las zonas.' };
}

function tormentaC() {
  const S = W / 320;
  const { abre, P } = escala(S, 0, 8 - 30 * S);
  const H = 326;
  const alt = 'Un velero bajo una tormenta eléctrica, de costado: un rayo cae desde la nube; la persona está dentro de la cámara, lejos del palo y de los obenques; la descarga baja por el palo, unido a la quilla, hasta el agua. Arriba a la derecha, la aguja después de la tormenta: puede quedar con un desvío anómalo, temporal o permanente; la declinación no cambia.';
  const { out, cierra } = lienzo(W, H, alt);
  const o = [abre, nube(16, 44, 1.05)];
  const rayo = 'M52,58 L66,62 L60,66 L96,72 L74,72 L82,76 L117,77';
  o.push(`<path d="${rayo}" fill="none" stroke="${T.amarillo}" stroke-width="3" stroke-linejoin="round"/><path d="${rayo}" fill="none" stroke="${T.tinta}" stroke-width=".7" stroke-linejoin="round"/>`);
  o.push(agua(0, 170, 320, 44), lineaAgua(0, 320, 170));
  o.push(`<path d="M30,160 L206,160 L190,184 L50,184 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/><path d="M106,184 L134,184 L128,206 L112,206 Z" fill="${T.apagado}" stroke="${T.tinta}" stroke-width="1.1"/>`);
  o.push(linea(120, 160, 120, 76, { w: 2.2 }), linea(120, 80, 52, 160, { w: 0.9 }), linea(120, 80, 192, 160, { w: 0.9 }));
  o.push(`<path d="M126,82 L126,198" fill="none" stroke="${T.azul}" stroke-width="1.8" stroke-dasharray="4 3"/>`, flecha(130, 196, 148, 210, { color: T.azul, w: 1.6, punta: 6 }));
  o.push(`<rect x="148" y="146" width="40" height="14" rx="2" fill="${T.papel}" stroke="${T.tinta}"/><circle cx="170" cy="148" r="3.2" fill="${T.magenta}"/><path d="M170,151 V158 M166,154 H174" stroke="${T.magenta}" stroke-width="2" stroke-linecap="round"/>`);
  const [cx, cy] = [270, 64];
  o.push(`<circle cx="${cx}" cy="${cy}" r="20" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.5"/><path d="M${cx},${cy - 16} V${cy + 16}" stroke="${T.tinta}" stroke-width=".8" stroke-dasharray="2 2"/>`);
  o.push(`<g transform="rotate(24 ${cx} ${cy})"><path d="M${cx},${cy - 16} L${cx + 4},${cy} L${cx - 4},${cy} Z" fill="${T.rojo}"/><path d="M${cx},${cy + 16} L${cx + 4},${cy} L${cx - 4},${cy} Z" fill="${T.apagado}"/></g>`, '</g>');
  out.push(o.join(''));
  out.push(serif(...P(158, 204), 'palo unido a la quilla:', { size: TXT.min, weight: 700, color: T.azulTxt }), serif(...P(158, 218), 'la descarga va al agua', { size: TXT.min, color: T.azulTxt }));
  out.push(serif(...P(194, 138), 'tú: dentro, lejos', { size: TXT.min, weight: 700, color: T.magenta }), serif(...P(194, 152), 'del palo y obenques', { size: TXT.min, weight: 700, color: T.magenta }));
  out.push(serif(...P(244, 42), 'la aguja', { anchor: 'end', weight: 700 }), serif(346, P(0, 100)[1], 'desvío anómalo', { anchor: 'end', weight: 700, color: T.magenta }), serif(346, P(0, 115)[1], 'temporal o permanente', { anchor: 'end', size: TXT.min, italic: true }));
  out.push(panelNotas(232, H));
  out.push(serif(16, 252, 'No toques el palo, los obenques ni los metales.', { size: TXT.min }), serif(16, 270, 'Apaga la electrónica no imprescindible.', { size: TXT.min }));
  out.push(serif(16, 292, 'Después: comprueba la aguja (con una enfilación);', { size: TXT.min, weight: 700 }), serif(16, 310, 'si ha cambiado, nueva tablilla. La declinación, no.', { size: TXT.min, weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Con tormenta eléctrica, dentro y lejos del palo, los obenques y los metales, sin tocarlos, y con la electrónica no imprescindible apagada. El rayo puede producir un desvío anómalo de la aguja, temporal o permanente: compruébala después. La declinación magnética no cambia.' };
}

export function reflectorTormentaC(spec = {}) {
  const v = spec.vista ?? 'reflector';
  if (v === 'reflector') return reflectorC();
  if (v === 'tormenta') return tormentaC();
  return null;
}

// ===========================================================================
// Varada y abordaje (per-8-4). RD 875/2014, anexo II, PER UT 8.2 y 8.3; Ley 14/2014 de Navegación Marítima, art. 186
// (comunicar de inmediato el accidente y declarar dentro de las 24 horas hábiles siguientes a la llegada a puerto).

export const PARTES_VARADA = ['heridos', 'danos', 'sondar', 'marea', 'pleamar', 'pesos', 'ancla', 'escorar', 'remolque', 'separar', 'despues', 'parte'];

function varadaC(m) {
  const H = 350;
  const alt = 'Un barco varado de costado, con la proa sobre el fondo de la costa. Alrededor, lo que se hace: sondar alrededor, esperar a la pleamar, pasar pesos y líquidos para cambiar el asiento y llevar un ancla hacia aguas profundas. Debajo, dos listas: primero, sin prisas, heridos, daños y vías de agua, sonda y marea; para reflotar, pleamar, pesos, ancla, escorar el velero y motor suave o remolque. Nada de dar atrás a toda al primer momento.';
  const { out, pt, cierra } = lienzo(W, H, alt);
  const ys = 62;
  out.push(agua(5, ys, W - 10, 80), lineaAgua(5, W - 5, ys));
  const costa = `M5,${ys + 6} Q100,${ys + 8} 156,${ys + 16} T353,${ys + 66} L353,146 L5,146Z`;
  out.push(`<path d="${costa}" fill="${T.tierra}" stroke="${T.tinta}"/><path d="${costa}" fill="${pt}" opacity=".5"/>`);
  out.push(`<g transform="rotate(-4 134 ${ys})">${perfil(94, ys + 2, 90)}</g>`);
  out.push(`${m.g('ancla')}<path d="M180,${ys - 8} Q244,${ys + 22} 296,${ys + 54}" fill="none" stroke="${m.c('ancla')}" stroke-width="${m.w('ancla', 1.5, 2.4)}"/>${anclaG(298, ys + 54, 0.55, -60, m.c('ancla'))}${serif(344, ys + 22, 'ancla hacia', { anchor: 'end', size: TXT.min, color: m.c('ancla') })}${serif(344, ys + 37, 'lo hondo', { anchor: 'end', size: TXT.min, color: m.c('ancla') })}</g>`);
  out.push(`${m.g('pleamar')}${flecha(30, ys + 20, 30, ys - 22, { color: m.c('pleamar', T.azul), w: 2 })}${serif(40, ys - 24, 'pleamar', { size: TXT.min, weight: 700, color: m.c('pleamar') })}</g>`);
  out.push(`${m.g('sondar')}${[[66, ys + 7], [208, ys + 24]].map(([x, yy]) => `<line x1="${x}" y1="${ys}" x2="${x}" y2="${yy}" stroke="${m.c('sondar')}" stroke-width="1.5" stroke-dasharray="2 2"/>`).join('')}${centrado(208, ys + 42, 'sondar', { color: m.c('sondar') })}</g>`);
  out.push(`${m.g('pesos')}${flecha(116, ys - 5, 156, ys - 7, { color: m.c('pesos', T.apagado), w: 1.8 })}${serif(166, 30, 'pasar pesos', { size: TXT.min, color: m.c('pesos') })}</g>`);
  const y1 = 168;
  out.push(panelNotas(150, H), serif(14, y1, 'Primero, sin prisas', { weight: 700 }));
  [['heridos', '¿Hay heridos?'], ['danos', 'Daños: vías de agua'], ['sondar', 'Sondar alrededor'], ['marea', 'Marea: ¿sube o baja?']].forEach(([k, t], i) => {
    out.push(`<g data-parte="${k}">${paso(24, y1 + 18 + i * 26, i + 1, { color: m.on(k) ? T.magenta : T.tinta })}${serif(38, y1 + 22 + i * 26, t, { size: TXT.min, weight: m.on(k) ? 700 : 400, color: m.c(k) })}</g>`);
  });
  out.push(serif(186, y1, 'Para reflotar', { weight: 700 }));
  [['pleamar', 'aprovecha la pleamar'], ['pesos', 'pasa pesos y líquidos'], ['ancla', 'ancla hacia lo hondo'], ['escorar', 'velero: escorarlo'], ['remolque', 'motor suave o remolque']].forEach(([k, t], i) => {
    out.push(`<g data-parte="${k}">${serif(186, y1 + 22 + i * 19, `· ${t}`, { size: TXT.min, weight: m.on(k) ? 700 : 400, color: m.c(k) })}</g>`);
  });
  out.push(linea(14, 290, 344, 290, { w: 0.6 }), tacha(24, 308, 5), serif(38, 312, 'Nada de atrás a toda al primer momento', { size: TXT.min, weight: 700, color: T.magenta }), serif(38, 330, 'ni abrir portillos: entraría más agua.', { size: TXT.min }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Tras embarrancar, nada brusco: mira si hay heridos, busca vías de agua, sonda alrededor y mira la marea. Para reflotar, aprovecha la pleamar, traslada pesos y trasvasa líquidos (rompe el efecto ventosa del fondo blando), lleva un ancla hacia aguas profundas y cobra; en un velero de quilla, escóralo; motor con suavidad, y si no sales, remolque.' };
}

function abordajeC(m) {
  const H = 350;
  const alt = 'Dos barcos vistos desde arriba tras un abordaje: la proa de uno está metida en el costado del otro y tapona la brecha. Debajo, los pasos: 1, vías de agua y daños, sobre todo bajo la flotación; 2, antes de separar, acordarlo con el otro patrón, con estanqueidad, apuntalamientos y achique preparados; 3, después, ayuda mutua, datos, seguro, Salvamento Marítimo si hay peligro y el diario; 4, parte a Capitanía de inmediato y declarar en las 24 horas hábiles siguientes a la llegada a puerto.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.papel });
  out.push(agua(5, 5, W - 10, 118));
  for (let y = 20; y < 120; y += 24) out.push(`<path d="M5,${y} ${Array.from({ length: 14 }, () => 'q6,-3 12,0 t12,0').join(' ')}" fill="none" stroke="${T.lineaAgua}" stroke-width="1"/>`);
  out.push(planta(130, 50, 90, 124, 36), planta(136, 98, 0, 52, 20));
  out.push(`<path d="M126,67 l4,-4 l3,5 l4,-5 l3,4" fill="none" stroke="${T.magenta}" stroke-width="2"/>`);
  out.push(`<rect x="214" y="72" width="128" height="40" fill="${T.papel}" stroke="${T.tinta}" stroke-width=".8"/>`, serif(222, 89, 'su proa tapona', { size: TXT.min, weight: 700, color: T.magenta }), serif(222, 105, 'la brecha', { size: TXT.min, weight: 700, color: T.magenta }));
  out.push(referencia(214, 88, 146, 70, { color: T.magenta }));
  const pasos = [
    ['danos', 'Vías de agua y daños', ['sobre todo bajo la flotación']],
    ['separar', 'Antes de separar, acuérdalo con el otro', ['estanqueidad, apuntalamientos y achique;', 'buen tiempo, sin prisa; mala mar, cuanto antes']],
    ['despues', 'Después', ['ayuda mutua, datos y seguro; Salvamento', 'Marítimo si hay peligro; el diario']],
    ['parte', 'Parte a Capitanía Marítima', ['de inmediato; a declarar en las 24 h hábiles', 'siguientes a la llegada a puerto']],
  ];
  let y = 148;
  out.push(panelNotas(130, H));
  pasos.forEach(([k, t, notas], i) => {
    out.push(`<g data-parte="${k}">${paso(22, y - 4, i + 1, { color: m.on(k) ? T.magenta : T.tinta })}${serif(38, y, t, { size: TXT.min, weight: 700, color: m.c(k) })}${lineas(38, y + 16, notas, { italic: true })}</g>`);
    y += 22 + notas.length * 16;
  });
  out.push(cierra());
  return { svg: out.join(''), caption: 'Lo primero, las vías de agua y los daños bajo la flotación: la proa de uno puede estar taponando la brecha del otro. Antes de separar, estanqueidad, apuntalamientos y achique, y acordarlo con el otro patrón; con buen tiempo sin prisa, con mala mar cuanto antes. Después, ayuda mutua, datos, aviso a Salvamento si hay peligro, y parte a Capitanía.' };
}

export function varadaAbordajeC(spec = {}) {
  const m = marcaC(spec, PARTES_VARADA);
  return spec.vista === 'abordaje' ? abordajeC(m) : varadaC(m);
}

// ===========================================================================
// Agua en la sentina: el achique (per-8-5). RD 339/2021, art. 20 (medios de achique por zona).

export const ACHIQUE = [['manual', 'Bomba manual'], ['electrica', 'Bomba eléctrica automática: arranca sola'], ['baldes', 'Baldes (de al menos 5 litros)'], ['motor', 'Motor en marcha: carga las baterías'], ['refrigeracion', 'Emergencia: la toma de refrigeración']];
export const ZONAS_ACHIQUE = [['zonas-1-3', 'Zonas 1–3', 'bomba de motor + manual + 2 baldes'], ['zonas-4-6', 'Zonas 4–6', 'bomba manual o eléctrica + 1 balde'], ['zona-7', 'Zona 7', 'bomba manual o eléctrica (o achicador)']];

export function achiqueSentinaC(spec = {}) {
  const m = marcaC(spec, [...ACHIQUE.map((a) => a[0]), ...ZONAS_ACHIQUE.map((z) => z[0])], { estricta: true });
  if (!m) return null;
  const S = W / 320;
  const { abre, P } = escala(S, 0, 8 - 34 * S);
  const H = 384;
  const alt = 'Un barco de costado con agua en la sentina y los medios de achique numerados: 1, la bomba manual con su aspiración en la sentina; 2, la bomba eléctrica automática con su flotador; 3, un balde; 4, el motor en marcha, que carga las baterías; 5, la toma de refrigeración del motor con el grifo de fondo cerrado y el manguito en la sentina. Debajo, el mínimo del RD 339/2021: zonas 1 a 3, bomba de motor, bomba manual y dos baldes de 5 litros; zonas 4 a 6, bomba manual o eléctrica y un balde; zona 7, bomba manual o eléctrica, o un achicador.';
  const { out, cierra } = lienzo(W, H, alt);
  const n = (k) => ACHIQUE.findIndex((a) => a[0] === k) + 1;
  const st = (k, w) => `stroke="${m.c(k)}" stroke-width="${m.on(k) ? w + 1.2 : w}"`;
  const o = [abre, agua(0, 84, 320, 64), `<path d="M14,40 L306,36 Q300,104 262,132 L66,132 L62,96 L16,88 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`, linea(6, 84, 312, 84, { color: T.lineaAgua, w: 1, extra: 'stroke-dasharray="4 3"' })];
  o.push(`<path d="M67,117 L282,117 Q274,126 262,131 L67,131 Z" fill="${T.azul}" fill-opacity=".4"/>`, linea(65, 116, 283, 116, { w: 1.3 }));
  o.push(`${m.g('motor')}<rect x="94" y="92" width="34" height="23" rx="3" fill="${T.apagado}" ${st('motor', 1)}/>${linea(94, 108, 54, 108, { w: 1.5 })}<ellipse cx="54" cy="108" rx="2" ry="8" fill="${T.apagado}" stroke="${T.tinta}" stroke-width=".8"/></g>`);
  o.push(`${m.g('refrigeracion')}<path d="M128,104 Q148,104 148,126" fill="none" stroke="${m.c('refrigeracion', T.azul)}" stroke-width="${m.on('refrigeracion') ? 3 : 2}"/>${linea(166, 126, 166, 135, { w: 2 })}${tacha(166, 123, 4)}</g>`);
  o.push(`${m.g('manual')}<rect x="36" y="52" width="12" height="16" rx="2" fill="${T.papel}" ${st('manual', 1.1)}/>${linea(42, 52, 56, 44, { w: 2 })}<path d="M42,68 L42,104 Q42,124 72,124" fill="none" ${st('manual', 1.3)}/><path d="M36,60 L22,60" stroke="${T.tinta}" stroke-width="1.3"/><circle cx="22" cy="60" r="2.4" fill="${T.tinta}"/></g>`);
  o.push(`${m.g('electrica')}<rect x="200" y="120" width="14" height="8" rx="1.5" fill="${T.apagado}" ${st('electrica', 1)}/><circle cx="222" cy="119" r="3.4" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width=".8"/>${linea(214, 124, 220, 120, { w: 0.8 })}<path d="M207,120 L207,60" fill="none" ${st('electrica', 1.3)}/><circle cx="207" cy="60" r="2.4" fill="${T.tinta}"/></g>`);
  o.push(`${m.g('baldes')}<path d="M244,96 L262,96 L259,115 L247,115 Z" fill="${T.papel}" ${st('baldes', 1.1)}/><path d="M245,96 Q253,85 261,96" fill="none" stroke="${T.tinta}"/></g>`, '</g>');
  out.push(o.join(''));
  out.push(serif(...P(170, 146), 'grifo cerrado', { anchor: 'middle', size: TXT.min, weight: 700, color: m.c('refrigeracion') }));
  for (const [k, x, y] of [['manual', 64, 60], ['electrica', 190, 72], ['baldes', 278, 74], ['refrigeracion', 182, 102], ['motor', 140, 82]]) out.push(numero(m, k, ...P(x, y), n(k)));
  out.push(panelNotas(162, H));
  ACHIQUE.forEach(([k, t], i) => {
    const y = 184 + i * 20;
    out.push(`<g data-parte="${k}">${paso(24, y - 4, i + 1, { color: m.on(k) ? T.magenta : T.tinta })}${serif(40, y, t, { size: TXT.min, weight: m.on(k) ? 700 : 400, color: m.c(k) })}</g>`);
  });
  out.push(serif(40, 282, 'grifo de fondo cerrado y manguito a la sentina', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(linea(14, 294, 344, 294, { w: 0.6 }), serif(14, 312, 'Mínimo obligatorio (RD 339/2021, art. 20)', { weight: 700 }));
  ZONAS_ACHIQUE.forEach(([k, z, t], i) => {
    const y = 332 + i * 18;
    out.push(`<g data-parte="${k}">${m.on(k) ? recuadro(10, y - 13, 338, 17, { on: true }) : ''}${serif(16, y, z, { size: TXT.min, weight: 700, color: m.c(k) })}${serif(90, y, t, { size: TXT.min })}</g>`);
  });
  out.push(cierra());
  const CAP = {
    manual: 'La bomba manual: la maneja un tripulante mientras los demás achican con baldes.',
    electrica: 'Las bombas eléctricas automáticas arrancan solas cuando sube el nivel de la sentina; comprueba de vez en cuando que funcionan.',
    baldes: 'Los baldes, de al menos 5 litros: dos en las zonas 1 a 3 y uno en las zonas 4 a 6.',
    refrigeracion: 'Truco de emergencia: se cierra el grifo de fondo de la refrigeración, se suelta el manguito y se mete en la sentina; el motor achica.',
    motor: 'El motor, siempre en marcha: carga las baterías de las bombas eléctricas y te permite llegar a puerto.',
    'zonas-1-3': 'Zonas 1, 2 y 3: una bomba accionada por el motor (u otra fuente de energía), una bomba manual y dos baldes de al menos 5 litros.',
    'zonas-4-6': 'Zonas 4, 5 y 6: una bomba manual o eléctrica y un balde de al menos 5 litros.',
    'zona-7': 'Zona 7: una bomba manual o eléctrica, o un achicador de 2 litros si mide 6 m o menos y tiene cámaras de flotabilidad.',
  };
  return { svg: out.join(''), caption: m.hl.size === 1 ? CAP[[...m.hl][0]] : 'Con agua en la sentina, todos los medios de achique en marcha y el motor encendido. El mínimo obligatorio depende de la zona: en las 1 a 3, bomba de motor, bomba manual y dos baldes; en las 4 a 6, una bomba y un balde; en la 7, una bomba.' };
}

// ===========================================================================
// Barómetros y tendencia (per-9-1). RD 875/2014, anexo II, PER UT 9.2. Aneroide: cápsula con vacío, fuerzas elásticas,
// lectura directa; mercurio marino: estrechamiento capilar (respuestas oficiales de Andalucía, 2022 y 2024). La
// tendencia es el cambio de la presión en las últimas horas (Glosario de Meteorología de la AMS, «pressure tendency»).

export const TENDENCIAS = [
  ['subida', 'Subida lenta y continuada', 'tiempo que mejora o se mantiene bueno', [0, 0.35, 0.7, 1]],
  ['bajada-lenta', 'Bajada lenta', 'empeoramiento general', [0.9, 0.72, 0.52, 0.34]],
  ['bajada-rapida', 'Bajada rápida', 'llega una borrasca o un frente: viento fuerte', [1, 0.92, 0.42, 0]],
  ['estable', 'Estable', 'seguirá como está, sea bueno o malo', [0.5, 0.52, 0.49, 0.5]],
];

/** Esfera de aneroide de 960 a 1060 hPa en 270°; ref: lectura anterior (aguja de referencia). */
function esfera(cx, cy, r, lect, ref = null) {
  const ang = (p) => -135 + ((p - 960) / 100) * 270;
  const o = [`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.8"/>`, `<circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="none" stroke="${T.tinta}" stroke-width=".6"/>`];
  for (let p = 960; p <= 1060; p += 5) {
    const [x1, y1] = pol(cx, cy, ang(p), r - 4);
    const [x2, y2] = pol(cx, cy, ang(p), r - (p % 20 === 0 ? 11 : 7));
    o.push(linea(x1, y1, x2, y2, { w: p % 20 === 0 ? 1.3 : 0.7 }));
  }
  if (r >= 44) for (const p of [980, 1040]) { const [x, y] = pol(cx, cy, ang(p), r - 24); o.push(mono(x, y + 4, String(p), { anchor: 'middle', weight: 400 })); }
  if (ref != null) { const [x, y] = pol(cx, cy, ang(ref), r - 6); o.push(`<line x1="${cx}" y1="${cy}" x2="${f1(x)}" y2="${f1(y)}" stroke="${T.magenta}" stroke-width="2.2" stroke-dasharray="4 2"/>`); }
  const [x, y] = pol(cx, cy, ang(lect), r - 8);
  o.push(`<line x1="${cx}" y1="${cy}" x2="${f1(x)}" y2="${f1(y)}" stroke="${T.tinta}" stroke-width="2.4" stroke-linecap="round"/>`, `<circle cx="${cx}" cy="${cy}" r="3.4" fill="${T.tinta}"/>`);
  return o.join('');
}

function instrumentosC(m) {
  const H = 330;
  const alt = 'Dos barómetros. A la izquierda, el de mercurio: un tubo con vacío arriba y una columna de 760 milímetros sobre la cubeta, sostenida por la presión del aire; el modelo marino lleva un estrechamiento capilar; es el más exacto, pero frágil. A la derecha, el aneroide: una esfera con aguja de lectura directa movida por una cápsula metálica estanca con vacío y un muelle, que equilibra la presión con fuerzas elásticas; es robusto pero menos exacto.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(linea(179, 14, 179, 290, { w: 0.6 }));
  const tx = 74;
  out.push(`${m.g('mercurio')}${recuadro(10, 10, 164, 282, { on: m.on('mercurio') })}${centrado(92, 30, 'De mercurio', { weight: 700, size: TXT.rotulo, color: m.c('mercurio') })}`);
  out.push(`<rect x="40" y="206" width="68" height="28" rx="2" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.1"/><rect x="41" y="214" width="66" height="19" fill="${T.apagado}"/>`);
  out.push(`<path d="M${tx - 5},224 L${tx - 5},192 L${tx - 2},186 L${tx - 2},180 L${tx - 5},174 L${tx - 5},62 A5,5 0 0 1 ${tx + 5},62 L${tx + 5},174 L${tx + 2},180 L${tx + 2},186 L${tx + 5},192 L${tx + 5},224" fill="none" stroke="${T.tinta}" stroke-width="1.1"/>`);
  out.push(`<path d="M${tx - 4},96 L${tx + 4},96 L${tx + 4},174 L${tx + 1.4},180 L${tx + 1.4},186 L${tx + 4},192 L${tx + 4},214 L${tx - 4},214 L${tx - 4},192 L${tx - 1.4},186 L${tx - 1.4},180 L${tx - 4},174 Z" fill="${T.apagado}"/>`);
  out.push(serif(tx + 10, 78, 'vacío', { size: TXT.min, italic: true }));
  out.push(linea(tx - 18, 96, tx - 18, 214, { color: T.magenta, w: 1.3 }), linea(tx - 23, 96, tx - 7, 96, { color: T.magenta, w: 0.8 }), linea(tx - 23, 214, tx - 7, 214, { color: T.magenta, w: 0.8 }));
  out.push(mono(tx - 22, 150, '760', { anchor: 'end', color: T.magenta }), mono(tx - 22, 166, 'mm', { anchor: 'end', color: T.magenta }));
  out.push(serif(tx + 10, 176, 'estrechamiento', { size: TXT.min }), serif(tx + 10, 192, 'capilar (marino)', { size: TXT.min }));
  out.push(flecha(50, 186, 50, 210, { color: T.azul, w: 1.6, punta: 7 }), flecha(98, 194, 98, 212, { color: T.azul, w: 1.6, punta: 7 }));
  out.push(centrado(tx, 252, 'presión del aire', { color: T.azulTxt }), centrado(92, 276, 'el más exacto, pero frágil', { weight: 700, color: m.c('mercurio') }), '</g>');
  out.push(`${m.g('aneroide')}${recuadro(184, 10, 164, 282, { on: m.on('aneroide') })}${centrado(266, 30, 'Aneroide', { weight: 700, size: TXT.rotulo, color: m.c('aneroide') })}${centrado(266, 46, '(«sin líquido»)', { italic: true })}`);
  out.push(esfera(266, 104, 46, 1010), centrado(266, 168, 'aguja: lectura directa'));
  const [mx, my] = [212, 222];
  out.push(`<path d="M${mx - 22},${my} q5.5,-6 11,0 t11,0 t11,0 t11,0 v12 q-5.5,6 -11,0 t-11,0 t-11,0 t-11,0 Z" fill="${T.apagado}" stroke="${T.tinta}"/>`);
  out.push(`<path d="M${mx},${my - 3} l-6,-3 l12,-4 l-12,-4 l12,-4 l-12,-4 l6,-3" fill="none" stroke="${T.magenta}" stroke-width="1.6"/>`);
  out.push(serif(mx + 30, my - 20, 'muelle: fuerzas', { size: TXT.min, color: T.magenta }), serif(mx + 30, my - 5, 'elásticas', { size: TXT.min, weight: 700, color: T.magenta }), serif(mx + 30, my + 12, 'cápsula estanca', { size: TXT.min }), serif(mx + 30, my + 27, 'con vacío', { size: TXT.min, weight: 700 }));
  out.push(centrado(266, 276, 'robusto; menos exacto', { weight: 700, color: m.c('aneroide') }), '</g>');
  out.push(panelNotas(298, H), centrado(179, 318, '1 atm = 1013,25 hPa = 760 mmHg', { weight: 700 }));
  out.push(cierra());
  const CAP = {
    mercurio: 'Barómetro de mercurio: la presión sostiene una columna de 760 mm en condiciones normales. Es el más exacto, pero frágil; el modelo marino lleva un estrechamiento capilar que amortigua los balances.',
    aneroide: 'Aneroide: una cápsula metálica estanca con vacío que se deforma con la presión, equilibrada por un muelle con fuerzas elásticas. Lectura directa y robusto, pero menos exacto que el de mercurio.',
  };
  return { svg: out.join(''), caption: m.hl.size === 1 ? CAP[[...m.hl][0]] : 'El de mercurio es el más exacto, pero frágil; el marino lleva un estrechamiento capilar. El aneroide no lleva líquido: una cápsula con vacío y un muelle (fuerzas elásticas) mueven una aguja de lectura directa.' };
}

function tendenciaC(m) {
  const H = 340;
  const alt = 'Arriba, un aneroide con dos agujas: la de referencia, a trazos, dejada sobre la lectura anterior, y la aguja de la lectura de ahora. Debajo, cuatro curvas de la presión en las últimas horas: subida lenta y continuada, el tiempo mejora o sigue bueno; bajada lenta, empeoramiento general; bajada rápida, llega una borrasca o un frente con viento fuerte; estable, seguirá como está.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(esfera(64, 70, 50, 1004, 1012));
  out.push(serif(128, 34, 'aguja de referencia', { weight: 700, color: T.magenta }), serif(128, 50, '(a trazos): la dejas', { size: TXT.min, color: T.magenta }), serif(128, 66, 'sobre la lectura anterior', { size: TXT.min, color: T.magenta }));
  out.push(serif(128, 90, 'aguja: la lectura de ahora', { size: TXT.min, weight: 700 }), serif(128, 110, 'Anota la presión al salir', { size: TXT.min, italic: true }), serif(128, 126, 'y cada pocas horas.', { size: TXT.min, italic: true }));
  out.push(linea(14, 140, 344, 140, { w: 0.6 }));
  TENDENCIAS.forEach(([k, nombre, sentido, ys], i) => {
    const y = 150 + i * 46;
    const g = [m.g(k), m.on(k) ? recuadro(8, y - 4, 342, 42, { on: true }) : ''];
    g.push(`<rect x="16" y="${y}" width="60" height="32" fill="${T.papel}" stroke="${T.tinta}" stroke-width=".8"/>`);
    g.push(`<polyline points="${ys.map((v, j) => `${f1(21 + j * 17)},${f1(y + 27 - v * 22)}`).join(' ')}" fill="none" stroke="${m.c(k, k === 'bajada-rapida' ? T.rojoTxt : T.azul)}" stroke-width="${m.on(k) ? 3 : 2.2}" stroke-linejoin="round" stroke-linecap="round"/>`);
    g.push(serif(88, y + 13, nombre, { weight: 700, color: m.c(k) }), serif(88, y + 29, sentido, { size: TXT.min, italic: true }), '</g>');
    out.push(g.join(''));
  });
  out.push(cierra());
  const CAP = {
    subida: 'Subida lenta y continuada del barómetro: el tiempo mejora o se mantiene bueno.',
    'bajada-lenta': 'Bajada lenta: empeoramiento general del tiempo.',
    'bajada-rapida': 'Bajada rápida: se acerca una borrasca o un frente, con viento fuerte.',
    estable: 'Barómetro estable: el tiempo seguirá como está, sea bueno o malo.',
  };
  return { svg: out.join(''), caption: m.hl.size === 1 ? CAP[[...m.hl][0]] : 'La aguja de referencia del aneroide se deja sobre la lectura anterior para ver la tendencia. Subida lenta: mejora; bajada lenta: empeora; bajada rápida: borrasca o frente con viento fuerte; estable: sigue igual.' };
}

export function barometroTendenciaC(spec = {}) {
  const vista = spec.vista ?? 'instrumentos';
  if (!['instrumentos', 'tendencia'].includes(vista)) return null;
  const m = marcaC(spec, vista === 'tendencia' ? TENDENCIAS.map((x) => x[0]) : ['mercurio', 'aneroide'], { estricta: true });
  if (!m) return null;
  return vista === 'tendencia' ? tendenciaC(m) : instrumentosC(m);
}

// ===========================================================================
// La mar (per-9-6). AEMET, glosario de la predicción marítima: mar de viento, el oleaje que levanta el viento donde
// sopla; mar de fondo (o de leva), el que se propaga fuera de la zona donde se generó. Los tres factores, de la clase.

export const PARTES_MAR = ['intensidad', 'persistencia', 'fetch'];

function marFactoresC(m) {
  const S = W / 320;
  const { abre, P } = escala(S, 0, 8 - 32 * S);
  const H = 330;
  const alt = 'Un viento que sopla desde la costa hacia la mar: junto a la costa las olas son pequeñas y crecen con la distancia hasta un tope, la mar totalmente desarrollada. Tres factores: la intensidad, la fuerza del viento; la persistencia, el tiempo que lleva soplando igual, con un reloj; y el fetch, la extensión de mar sobre la que sopla, con una cota.';
  const { out, pt, cierra } = lienzo(W, H, alt);
  const [y0, xT] = [140, 46];
  const o = [abre];
  o.push(`${m.g('intensidad')}${[52, 112, 172].map((x) => flecha(x, 56, x + 44, 56, { color: m.c('intensidad', T.azul), w: m.on('intensidad') ? 2.6 : 1.8 })).join('')}</g>`);
  const [cx, cy] = [262, 54];
  o.push(`${m.g('persistencia')}<circle cx="${cx}" cy="${cy}" r="12" fill="${T.papel}" stroke="${m.c('persistencia')}" stroke-width="${m.on('persistencia') ? 2.4 : 1.4}"/>${linea(cx, cy, cx, cy - 8, { w: 1.5 })}${linea(cx, cy, cx + 6, cy + 2, { w: 1.5 })}</g>`);
  const costa = `M8,104 L30,100 L${xT},112 L${xT + 4},${y0} L${xT},180 L8,180Z`;
  o.push(`<path d="${costa}" fill="${T.tierra}" stroke="${T.tinta}"/><path d="${costa}" fill="${pt}" opacity=".5"/>`);
  const amp = (x) => 1 + 17 * Math.min(1, Math.max(0, (x - xT - 10) / 190)) ** 1.3;
  const ps = [];
  for (let x = xT + 4; x <= 312; x += 2) { const Lw = 10 + 26 * Math.min(1, (x - xT) / 180); ps.push([x, y0 - amp(x) * Math.cos((2 * Math.PI * (x - xT)) / Lw) * 0.5 - amp(x) * 0.5]); }
  const d = ps.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)},${f1(y)}`).join('');
  o.push(`<path d="${d}L312,180L${xT + 4},180Z" fill="${T.agua}"/><path d="${d}" fill="none" stroke="${T.lineaAgua}" stroke-width="1.6"/>`);
  const yF = 100;
  o.push(`${m.g('fetch')}${linea(xT + 4, yF - 6, xT + 4, yF + 6)}${linea(310, yF - 6, 310, yF + 6)}${flecha(178, yF, xT + 7, yF, { color: m.c('fetch', T.tinta), w: m.on('fetch') ? 2.2 : 1.4, punta: 7 })}${flecha(178, yF, 307, yF, { color: m.c('fetch', T.tinta), w: m.on('fetch') ? 2.2 : 1.4, punta: 7 })}</g>`);
  o.push('</g>');
  out.push(o.join(''));
  out.push(rotuloParte(m, 'intensidad', P(52, 44), 'viento', { weight: 700 }), rotuloParte(m, 'persistencia', P(cx + 16, cy + 4), 'horas'), rotuloParte(m, 'fetch', P(178, yF - 8), 'fetch: extensión de mar', { anchor: 'middle', weight: 700 }));
  out.push(serif(...P(12, 94), 'tierra', { size: TXT.min, italic: true }));
  out.push(serif(...P(xT + 2, 198), 'poco fetch,', { size: TXT.min }), serif(...P(xT + 2, 211), 'poca mar', { size: TXT.min }), serif(...P(312, 198), 'la ola ya no crece:', { anchor: 'end', size: TXT.min }), serif(...P(312, 211), 'mar totalmente desarrollada', { anchor: 'end', size: TXT.min }));
  out.push(panelNotas(236, H));
  [['intensidad', 'Intensidad', '= fuerza del viento'], ['persistencia', 'Persistencia', '= tiempo soplando igual'], ['fetch', 'Fetch', '= extensión (espacio) de mar']].forEach(([k, nm, t], i) => {
    const y = 258 + i * 20;
    out.push(`<g data-parte="${k}">${serif(16, y, nm, { weight: 700, color: m.c(k) })}${serif(120, y, t, { size: TXT.min, weight: m.on(k) ? 700 : 400 })}</g>`);
  });
  out.push(centrado(179, 320, 'Cuanto mayores los tres, más alta la ola.', { weight: 700 }));
  out.push(cierra());
  return out.join('');
}

function marVientoFondoC() {
  const S = W / 320;
  const { abre, P } = escala(S, 0, 8 - 36 * S);
  const H = 300;
  const alt = 'A la izquierda, bajo un temporal lejano, la mar de viento: olas cortas, irregulares y de cresta puntiaguda que rompe. A la derecha, junto a una costa en calma, la mar de fondo: olas largas, regulares y redondeadas que se formaron lejos y han viajado hasta allí. Mares cruzadas o contra corriente dan mar confusa.';
  const { out, pt, cierra } = lienzo(W, H, alt);
  const y0 = 128;
  const o = [abre, nube(16, 50, 1), flecha(30, 90, 70, 90, { color: T.azul, w: 2 }), flecha(80, 90, 120, 90, { color: T.azul, w: 2 })];
  const costa = 'M290,100 L312,100 L312,150 L296,150 L292,128Z';
  o.push(`<path d="${costa}" fill="${T.tierra}" stroke="${T.tinta}"/><path d="${costa}" fill="${pt}" opacity=".5"/>`);
  let d = `M8,${y0}`;
  for (let x = 8, i = 0; x < 128; x += 12, i++) { const h = [10, 14, 8, 12, 15, 9, 13, 11, 14, 10][i % 10]; d += ` Q${x + 7},${y0 - h * 0.5} ${x + 9},${y0 - h} L${x + 12},${y0}`; }
  o.push(`<path d="${d} L128,150 L8,150Z" fill="${T.agua}"/><path d="${d}" fill="none" stroke="${T.lineaAgua}" stroke-width="1.6"/>`);
  for (const x of [17, 53, 89, 113]) o.push(`<path d="M${x},${y0 - 12} l3,3 l-2,1 l3,3" fill="none" stroke="${T.tinta}" stroke-width="1"/>`);
  const p2 = [];
  for (let x = 128; x <= 292; x += 2) p2.push([x, y0 - 4 - 5 * Math.cos((2 * Math.PI * (x - 128)) / 54)]);
  const d2 = p2.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)},${f1(y)}`).join('');
  o.push(`<path d="${d2}L292,150L128,150Z" fill="${T.agua}"/><path d="${d2}" fill="none" stroke="${T.lineaAgua}" stroke-width="1.8"/>`);
  o.push(linea(128, 104, 128, 152, { w: 0.8, extra: 'stroke-dasharray="3 3"' }), flecha(150, 108, 250, 108, { color: T.tinta, w: 1.4, punta: 7 }), '</g>');
  out.push(o.join(''));
  out.push(serif(...P(96, 50), 'temporal lejano', { size: TXT.min, italic: true }), centrado(...P(250, 62), 'aquí: calma', { italic: true }), centrado(...P(250, 76), 'u otro viento', { italic: true }), centrado(...P(200, 100), 'viaja hasta ti', { italic: true }));
  out.push(panelNotas(166, H));
  out.push(rotulo(16, 186, 'MAR DE VIENTO', { size: TXT.min, estilo: 'cap', weight: 700, anchor: 'start', color: T.azulTxt }), serif(16, 202, 'la levanta el viento de ese momento y lugar', { size: TXT.min }), serif(16, 218, 'cortas, irregulares, cresta puntiaguda', { size: TXT.min, italic: true }));
  out.push(rotulo(16, 240, 'MAR DE FONDO', { size: TXT.min, estilo: 'cap', weight: 700, anchor: 'start', color: T.magenta }), serif(16, 256, 'o mar de leva: se formó lejos y viaja hasta ti', { size: TXT.min }), serif(16, 272, 'largas, regulares, cresta redondeada', { size: TXT.min, italic: true }));
  out.push(serif(16, 290, 'Mares cruzadas o contra corriente: mar confusa.', { size: TXT.min, weight: 700 }));
  out.push(cierra());
  return out.join('');
}

export function marCreceC(spec = {}) {
  const vista = spec.vista ?? 'factores';
  if (vista === 'viento-fondo') {
    if (lista(spec.resaltar).length) return null;
    return { svg: marVientoFondoC(), caption: 'Mar de viento: la levanta el viento que sopla ahí y entonces; olas cortas, irregulares y de cresta puntiaguda. Mar de fondo (o de leva): se formó lejos y llega larga, regular y redondeada, aunque aquí haya calma o sople otro viento.' };
  }
  if (vista !== 'factores') return null;
  const m = marcaC(spec, PARTES_MAR, { estricta: true });
  if (!m) return null;
  const CAP = {
    intensidad: 'Intensidad: la fuerza del viento sobre la mar. Con más fuerza, más ola.',
    persistencia: 'Persistencia: el tiempo que lleva soplando con la misma dirección e intensidad.',
    fetch: 'Fetch: la extensión de mar sobre la que sopla el viento con la misma dirección e intensidad. Un viento de tierra levanta poca mar cerca de la costa porque apenas tiene fetch.',
  };
  return { svg: marFactoresC(m), caption: m.hl.size === 1 ? CAP[[...m.hl][0]] : 'La ola crece con la intensidad (fuerza), la persistencia (tiempo) y el fetch (extensión) del viento, hasta la mar totalmente desarrollada. Cerca de una costa de la que sopla el viento hay poco fetch y poca mar.' };
}

// ===========================================================================
// Previsión (per-9-7). RD 875/2014, anexo II, PER UT 9.1 (formas de obtener la previsión). Salvamento Marítimo anuncia
// sus boletines por el canal 16 y los lee en un canal de trabajo (respuestas oficiales de la DGMM y de Baleares);
// NAVTEX, 518 y 490 kHz (OMI MSC.1/Circ.1403).

export const PARTES_PREVISION = ['aemet', 'vhf', 'navtex', 'apps'];

function previsionFuentesC(m) {
  const H = 338;
  const alt = 'De dónde sale la previsión oficial: AEMET elabora las predicciones y los avisos. Te llegan por tres caminos: su web y su aplicación, con aguas costeras, alta mar y avisos; Salvamento Marítimo por VHF, que anuncia el boletín por el canal 16 y lo lee en un canal de trabajo; y el NAVTEX, que muestra solo los avisos, en 518 kHz en inglés y 490 kHz en el idioma nacional. Las aplicaciones de modelos, siempre contrastadas.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(`${m.g('aemet')}${recuadro(84, 12, 190, 46, { on: m.on('aemet'), fondo: T.papel })}${rotulo(179, 32, 'AEMET', { size: TXT.rotulo, estilo: 'cap', weight: 700, color: m.c('aemet') })}${centrado(179, 50, 'elabora predicciones y avisos')}</g>`);
  const cols = [
    ['aemet', 'Web y app', ['aguas costeras', 'y alta mar;', 'avisos de', 'fenómenos', 'adversos']],
    ['vhf', 'Salvamento', ['Marítimo (VHF):', 'anuncio por el', 'canal 16; se lee', 'en un canal', 'de trabajo']],
    ['navtex', 'NAVTEX', ['solo avisos:', '518 kHz, inglés;', '490 kHz, idioma', 'nacional']],
  ];
  cols.forEach(([k, t, ls], i) => {
    const x = 12 + i * 113;
    const cx = x + 53;
    out.push(flecha(179 + (i - 1) * 40, 58, cx, 78, { color: T.apagado, w: 1.4, punta: 7 }));
    out.push(`${m.g(k)}${recuadro(x, 80, 106, 120, { on: m.on(k), fondo: T.papel })}${centrado(cx, 100, t, { weight: 700, color: m.c(k) })}${lineas(cx, 120, ls, { anchor: 'middle' })}</g>`);
  });
  for (let i = 0; i < 3; i++) out.push(flecha(65 + i * 113, 200, 179 + (i - 1) * 22, 220, { color: T.apagado, w: 1.4, punta: 7 }));
  out.push(planta(150, 236, 90, 44, 16), serif(180, 240, 'tú: antes de salir', { weight: 700 }), serif(180, 256, 'y navegando', { size: TXT.min }));
  out.push(`${m.g('apps')}${panelNotas(276, H)}${serif(16, 298, 'Apps de modelos: útiles, pero contrástalas', { size: TXT.min, weight: m.on('apps') ? 700 : 400, color: m.c('apps') })}${serif(16, 316, 'siempre con la predicción y los avisos oficiales.', { size: TXT.min, weight: m.on('apps') ? 700 : 400, color: m.c('apps') })}</g>`);
  out.push(cierra());
  const CAP = {
    aemet: 'AEMET es la fuente oficial: elabora las predicciones para aguas costeras y alta mar, y los avisos de fenómenos adversos.',
    vhf: 'Los centros de Salvamento Marítimo emiten por VHF los boletines y avisos costeros: se anuncian por el canal 16 y se leen en un canal de trabajo.',
    navtex: 'El NAVTEX recibe solo los avisos meteorológicos y de seguridad: 518 kHz en inglés y 490 kHz en el idioma nacional.',
    apps: 'Las aplicaciones de modelos meteorológicos son útiles, pero hay que contrastarlas siempre con la predicción y los avisos oficiales.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'AEMET elabora la predicción y los avisos oficiales para navegar; te llegan por su web y su aplicación, por VHF desde Salvamento Marítimo y por NAVTEX.') };
}

function previsionDecidirC() {
  const H = 340;
  const alt = 'Cómo se decide antes de zarpar: el parte (viento en Beaufort y si rola, refresca o cae; mar en Douglas y mar de fondo aparte; visibilidad y nieblas; avisos en vigor) y lo que ves (el barómetro, el cielo, el viento real en el puerto) llevan a una pregunta: ¿lo llevan con comodidad tu barco y tu tripulación, también a la vuelta? Si sí, sales con un plan B: puerto de refugio, rumbo alternativo y hora límite. Si no, no sales o cambias el plan.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(recuadro(12, 12, 162, 122, { fondo: T.papel }), recuadro(184, 12, 162, 122, { fondo: T.papel }));
  out.push(centrado(93, 32, 'El parte', { weight: 700 }), centrado(265, 32, 'Lo que ves', { weight: 700 }));
  out.push(lineas(20, 52, ['viento: Beaufort;', '¿rola, refresca, cae?', 'mar: Douglas;', 'la de fondo, aparte', 'visibilidad, nieblas', 'avisos en vigor'], {}, 14));
  out.push(lineas(192, 52, ['barómetro:', '¿baja deprisa?', 'el cielo', 'el viento real', 'en el puerto'], {}, 14));
  out.push(flecha(93, 134, 140, 152, { color: T.apagado, w: 1.4, punta: 7 }), flecha(265, 134, 218, 152, { color: T.apagado, w: 1.4, punta: 7 }));
  out.push(recuadro(30, 154, 298, 48, { fondo: T.papel }), centrado(179, 174, '¿Lo llevan con comodidad tu barco y', { weight: 700 }), centrado(179, 192, 'tu tripulación? ¿Empeora a la vuelta?', { weight: 700 }));
  out.push(flecha(100, 202, 92, 218, { color: T.apagado, w: 1.4, punta: 7 }), flecha(258, 202, 266, 218, { color: T.apagado, w: 1.4, punta: 7 }));
  out.push(recuadro(12, 220, 162, 62, { fondo: T.papel }), recuadro(184, 220, 162, 62, { fondo: T.papel }));
  out.push(bien(26, 238, 5), serif(38, 242, 'Sí: sal con plan B', { size: TXT.min, weight: 700, color: T.verdeTxt }), lineas(20, 260, ['refugio, rumbo', 'alternativo, hora límite'], { italic: true }, 15));
  out.push(tacha(198, 238, 4.5), serif(210, 242, 'No: no salgas', { size: TXT.min, weight: 700, color: T.magenta }), lineas(192, 260, ['quédate en puerto', 'o cambia el plan'], { italic: true }, 15));
  out.push(panelNotas(292, H), serif(16, 312, 'Navegando: si el barómetro cae deprisa o el viento', { size: TXT.min, weight: 700 }), serif(16, 328, 'refresca más de lo previsto, vuelve antes.', { size: TXT.min, weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Con el parte oficial y lo que ves (barómetro, cielo y viento en puerto) decides: si tu barco y tu tripulación lo llevan con comodidad, sales con un plan B; si no, te quedas o cambias el plan.' };
}

export function previsionSalidaC(spec = {}) {
  return spec.vista === 'decidir' ? previsionDecidirC() : previsionFuentesC(marcaC(spec, PARTES_PREVISION));
}

