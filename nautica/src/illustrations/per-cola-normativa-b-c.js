// Láminas de legislación del PER rehechas en estilo C en la tanda de cierre (segunda parte, per-4-1 y per-4-6):
// puerto comercial, seguro obligatorio, contaminación y deber de auxilio. Mismos tipos, parámetros y `resaltar`.
// Fuentes (apéndice de la guía): RD 186/2023, RIPA regla 9 g, RD 607/1999, TRLPEMM art. 310, Ley 14/2014
// (Navegación Marítima) arts. 183.3 y 186.1, SOLAS V/33.1. Sin DOM.

import { T, TXT, lienzo, rotulo, etiqueta, flecha, paso, barco, tierra, f1 } from './estilo-c.js';
import { W, serif, mono, cap, linea, panelNotas, tacha, bien, lista } from './kit-lecciones-c.js';

function marca(spec, validas) {
  const hl = new Set(lista(spec.resaltar));
  if (validas && [...hl].some((k) => !validas.includes(k))) return null;
  const on = (k) => hl.has(k);
  return { hl, on, c: (k, b = T.tinta) => (on(k) ? T.magenta : b), g: (k) => `<g data-parte="${k}"${hl.size && !on(k) ? ' opacity=".45"' : ''}>` };
}
const recuadro = (x, y, w, h, { on = false, borde = T.tinta } = {}) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${T.papel}" stroke="${on ? T.magenta : borde}" stroke-width="${on ? 2.2 : 0.9}"/>`;
const centrado = (x, y, t, o = {}) => serif(x, y, t, { anchor: 'middle', ...o });
const lineas = (x, y, ls, o = {}, p = 16) => ls.map((l, i) => serif(x, y + i * p, l, o)).join('');
const anclita = (x, y, c = T.tinta) => `<g transform="translate(${x},${y})" stroke="${c}" stroke-width="1.6" fill="none"><circle cx="0" cy="-6" r="2"/><line x1="0" y1="-4" x2="0" y2="5"/><path d="M-5,1 Q0,8 5,1"/></g>`;

// ===========================================================================
// Puerto comercial (per-4-1): RD 186/2023 (el recreo de menos de 20 m no estorba) y RIPA, regla 9 g (evitar fondear
// en un canal angosto). «El que sale pasa primero» no se dibuja: no está en esas normas (ESTADO-per-laminas.md).

export const PARTES_PUERTO = ['recreo', 'fondeo'];

export function puertoComercialC(spec = {}) {
  const m = marca(spec, null);
  const H = 360;
  const alt = 'Planta de un puerto comercial: un mercante maniobra dentro con su remolcador mientras un velero de recreo de menos de 20 m se aparta de su camino; en el canal de acceso, un ancla tachada: se evita fondear en él.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(`<rect x="5" y="106" width="${W - 10}" height="166" fill="${T.agua}"/>`);
  out.push(`<rect x="5" y="94" width="190" height="12" fill="${T.apagado}" stroke="${T.tinta}"/><rect x="255" y="94" width="${W - 260}" height="12" fill="${T.apagado}" stroke="${T.tinta}"/>`, cap(12, 88, 'DIQUE'), centrado(225, 124, 'bocana', { size: TXT.min, italic: true }));
  out.push(tierra(`M5,272 L${W - 5},272 L${W - 5},${H - 60} L5,${H - 60}Z`, pt), rotulo(W / 2, 292, 'MUELLE', { size: TXT.min, estilo: 'cap', weight: 700 }));
  out.push(linea(200, 14, 200, 94, { w: 1, extra: 'stroke-dasharray="4 3"' }), linea(250, 14, 250, 94, { w: 1, extra: 'stroke-dasharray="4 3"' }), serif(258, 40, 'canal de', { size: TXT.min, italic: true }), serif(258, 56, 'acceso', { size: TXT.min, italic: true }));
  out.push(`${m.g('fondeo')}${anclita(225, 62, m.c('fondeo'))}${tacha(225, 60, 11)}${serif(14, 40, 'Evita fondear en', { size: TXT.min, weight: 700, color: m.c('fondeo') })}${serif(14, 56, 'el canal (RIPA 9 g)', { size: TXT.min, weight: 700, color: m.c('fondeo') })}</g>`);
  out.push(barco(200, 214, 270, 120, { p: null, crujia: false }), centrado(206, 218, 'mercante', { size: TXT.min, weight: 700 }), barco(286, 214, 270, 28, { p: null, relleno: T.naranja }), centrado(300, 246, 'remolcador', { size: TXT.min }));
  out.push(flecha(132, 250, 104, 250, { color: T.apagado, w: 1.4 }));
  out.push(`${m.g('recreo')}<path d="M120,196 Q74,190 64,160" fill="none" stroke="${T.azul}" stroke-width="1.6" stroke-dasharray="4 3"/>${barco(60, 146, 350, 28, { p: null })}${serif(84, 146, 'recreo de menos', { size: TXT.min, weight: 700, color: m.c('recreo') })}${serif(84, 162, 'de 20 m: se aparta', { size: TXT.min, weight: 700, color: m.c('recreo') })}</g>`);
  out.push(panelNotas(H - 60, H), serif(16, H - 38, 'En las aguas de un puerto comercial, el recreo', { size: TXT.min }), serif(16, H - 20, 'de menos de 20 m no estorba a los buques.', { size: TXT.min, weight: 700 }));
  out.push(cierra());
  const CAP = {
    recreo: 'En las aguas de servicio de un puerto comercial, la embarcación de recreo de menos de 20 m no estorba el tránsito de los demás buques: se aparta, vaya a vela o a motor.',
    fondeo: 'En un canal angosto, como el de acceso a un puerto, los buques evitan fondear siempre que las circunstancias lo permitan.',
  };
  const hl = [...m.hl].filter((k) => CAP[k]);
  return { svg: out.join(''), caption: hl.length ? hl.map((k) => CAP[k]).join(' ') : 'En un puerto comercial, la embarcación de recreo de menos de 20 m no estorba a los buques y se evita fondear en el canal de acceso.' };
}

// ===========================================================================
// Seguro obligatorio de responsabilidad civil (per-4-1): RD 607/1999

export function seguroRcC() {
  const H = 392;
  const alt = 'Seguro obligatorio de responsabilidad civil de las embarcaciones de recreo: cubre a terceros (muerte o lesiones, daños materiales, daños a otros buques por colisión o sin contacto) y no cubre los daños de tu barco ni los del propietario, el tomador o el patrón. Límites: 120.202,42 euros por víctima y 240.404,84 por siniestro en daños personales, y 96.161,94 por siniestro en daños materiales.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(serif(16, 30, 'Obligatorio: a motor (también motos náuticas)', { size: TXT.min, weight: 700 }), serif(16, 46, 'y sin motor de más de 6 m de eslora.', { size: TXT.min, weight: 700 }));
  out.push(recuadro(12, 60, 164, 174, { borde: T.verdeTxt }), recuadro(182, 60, 164, 174, { borde: T.magenta }));
  out.push(bien(26, 78, 6), serif(40, 83, 'Sí cubre: terceros', { weight: 700, color: T.verdeTxt }), tacha(196, 78, 5), serif(208, 83, 'No cubre', { weight: 700, color: T.magenta }));
  out.push(barco(70, 114, 90, 40, { p: null }), barco(122, 114, 270, 40, { p: null }), `<path d="M96,104 l3,5 5,-2 -2,5 5,3 -5,2 2,5 -5,-2 -3,5 -3,-5 -5,2 2,-5 -5,-3 5,-2 -2,-5 5,2 Z" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width=".8"/>`);
  out.push(barco(264, 114, 90, 52, { p: null }), centrado(264, 142, 'el tuyo', { size: TXT.min, weight: 700 }));
  out.push(lineas(20, 160, ['muerte o lesiones', 'daños materiales', 'daños a otros buques,', 'por colisión o sin', 'contacto'], { size: TXT.min }, 15));
  out.push(lineas(190, 160, ['los daños de tu barco', 'los del propietario', 'o del tomador', 'los del patrón'], { size: TXT.min }, 15));
  out.push(panelNotas(246, H), cap(16, 268, 'LÍMITES DEL SEGURO'));
  const L = [['daños personales, por víctima', '120.202,42 €'], ['daños personales, por siniestro', '240.404,84 €'], ['daños materiales, por siniestro', '96.161,94 €']];
  L.forEach(([t, c], i) => out.push(serif(16, 292 + i * 22, t, { size: TXT.min }), mono(W - 16, 292 + i * 22, c, { anchor: 'end', weight: 700 })));
  out.push(serif(16, 366, 'Regatas y competiciones: un seguro especial.', { size: TXT.min, italic: true }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'El seguro obligatorio cubre la responsabilidad civil frente a terceros (personas, bienes y otros buques), no los daños de tu propio barco ni los del propietario, el tomador o el patrón.' };
}

// ===========================================================================
// Contaminación (per-4-6): responsables solidarios (TRLPEMM, art. 310) y deber de comunicarla (Ley 14/2014, art. 186.1)

export const RESPONSABLES = ['naviero', 'propietario', 'asegurador', 'patron'];
const mancha = (x, y, s = 1) => `<path transform="translate(${x},${y}) scale(${s})" d="M-34,4 C-40,-8 -20,-16 -4,-12 C10,-20 34,-12 36,0 C42,12 20,18 4,14 C-10,20 -32,16 -34,4 Z" fill="${T.negro}" fill-opacity=".55" stroke="${T.tinta}" stroke-width=".8"/>`;

function contaminacionAviso() {
  const H = 350;
  const alt = 'Un barco de recreo ve una mancha de hidrocarburo junto a un buque y avisa por radio a Salvamento Marítimo (VHF canal 16, teléfono 900 202 202 o 112), dando su posición y la hora, el aspecto y la extensión de la mancha y, si lo sabe, el buque que la ha causado.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(serif(16, 30, 'Avisa a Salvamento Marítimo:', { weight: 700 }), etiqueta(W / 2, 56, 'VHF 16 · 900 202 202 · 112', { color: T.magenta }));
  out.push(`<rect x="5" y="80" width="${W - 10}" height="78" fill="${T.agua}"/>`, mancha(232, 124, 1.3), barco(306, 116, 270, 60, { p: null, relleno: T.apagado }), centrado(214, 98, 'mancha', { size: TXT.min, weight: 700 }));
  out.push(barco(64, 124, 90, 44, { p: null }), centrado(64, 150, 'tú', { size: TXT.min, weight: 700 }), linea(64, 116, 64, 102, { w: 1.4 }));
  for (const r of [7, 13]) out.push(`<path d="M${f1(64 - r * 0.7)},${f1(100 - r * 0.7)} A${r},${r} 0 0 1 ${f1(64 + r * 0.7)},${f1(100 - r * 0.7)}" fill="none" stroke="${T.azul}" stroke-width="1.6"/>`);
  out.push(serif(16, 186, 'Da sin demora:', { weight: 700 }));
  ['tu posición y la hora', 'aspecto y extensión de la mancha', 'el buque que la ha causado, si lo sabes'].forEach((t, i) => out.push(paso(26, 206 + i * 26, i + 1, { color: T.tinta }), serif(42, 210 + i * 26, t, { size: TXT.min })));
  out.push(panelNotas(286, H), serif(16, 308, 'El capitán comunica a la Capitanía Marítima', { size: TXT.min }), serif(16, 326, 'todo episodio de contaminación que observe.', { size: TXT.min, weight: 700 }));
  out.push(cierra());
  return out.join('');
}

export function contaminacionC(spec = {}) {
  if (spec.vista === 'aviso') {
    return { svg: contaminacionAviso(), caption: 'Si ves una mancha o un vertido, avisa sin demora a Salvamento Marítimo (VHF canal 16, 900 202 202 o 112) con tu posición y la hora, el aspecto y la extensión de la mancha y, si lo sabes, el buque que la ha causado.' };
  }
  const m = marca(spec, RESPONSABLES);
  if (!m) return null;
  const H = 320;
  const alt = 'Un barco con una mancha de contaminación en el centro, unido a cuatro recuadros: el naviero, el propietario, el asegurador de responsabilidad civil y el patrón (capitán). Responden solidariamente: se puede exigir la responsabilidad entera a cualquiera de los cuatro.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(`<rect x="114" y="106" width="130" height="56" fill="${T.agua}"/>`, mancha(179, 142, 0.95), barco(179, 126, 90, 44, { p: null }));
  out.push(centrado(179, 84, 'infracción por', { weight: 700, size: TXT.min }), centrado(179, 99, 'contaminación', { weight: 700, size: TXT.min }));
  const P = [['naviero', 'naviero', 12, 24], ['propietario', 'propietario', 206, 24], ['asegurador', 'asegurador de RC', 12, 190], ['patron', 'patrón (capitán)', 206, 190]];
  for (const [k, t, x, y] of P) out.push(`${m.g(k)}${recuadro(x, y, 140, 32, { on: m.on(k) })}${centrado(x + 70, y + 21, t, { weight: 700, size: TXT.min, color: m.c(k) })}</g>`);
  out.push(linea(82, 56, 128, 108, { w: 0.9 }), linea(276, 56, 230, 108, { w: 0.9 }), linea(82, 190, 128, 160, { w: 0.9 }), linea(276, 190, 230, 160, { w: 0.9 }));
  out.push(panelNotas(236, H), serif(16, 258, 'Responden solidariamente: se puede exigir', { size: TXT.min, weight: 700 }), serif(16, 276, 'la responsabilidad entera a cualquiera.', { size: TXT.min, weight: 700 }), tacha(22, 298, 4.5), serif(34, 302, 'Falso: «solo» uno de ellos.', { size: TXT.min, color: T.magenta }));
  out.push(cierra());
  const CAP = { naviero: 'El naviero responde.', propietario: 'El propietario responde.', asegurador: 'El asegurador de la responsabilidad civil responde.', patron: 'El patrón (capitán) responde.' };
  const hl = [...m.hl];
  const base = 'De las infracciones por contaminación desde un barco responden solidariamente el naviero, el propietario, el asegurador de la responsabilidad civil y el patrón: la Administración puede exigir la responsabilidad entera a cualquiera de ellos.';
  return { svg: out.join(''), caption: hl.length ? `${hl.map((k) => CAP[k]).join(' ')} ${base}` : base };
}

// ===========================================================================
// Deber de auxilio (per-4-6): SOLAS V/33.1 y Ley 14/2014, art. 183.3

export function deberAuxilioC(spec = {}) {
  const m = marca(spec, ['acudir', 'no-acudir']);
  if (!m) return null;
  const H = 400;
  const alt = 'Diagrama: sabes, por cualquier medio, que hay personas en peligro en el mar. ¿Puedes ayudar sin grave peligro para tu barco y los tuyos? Si puedes, acudes a toda velocidad, informas a las víctimas o a salvamento y dejas constancia en el diario. Si no acudes, anotas el motivo en el diario e informas a salvamento.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(recuadro(40, 16, W - 80, 44), centrado(W / 2, 34, 'Sabes, por cualquier medio, que hay', { size: TXT.min }), centrado(W / 2, 51, 'personas en peligro en el mar', { size: TXT.min, weight: 700 }));
  out.push(flecha(W / 2, 60, W / 2, 76, { color: T.apagado, w: 1.4 }));
  out.push(`<path d="M${W / 2},78 L${W - 14},112 L${W / 2},146 L14,112 Z" fill="${T.papel}" stroke="${T.tinta}"/>`, centrado(W / 2, 108, '¿Puedes ayudar sin grave peligro', { size: TXT.min, weight: 700 }), centrado(W / 2, 124, 'para tu barco y los tuyos?', { size: TXT.min, weight: 700 }));
  out.push(flecha(90, 132, 90, 164, { color: T.apagado, w: 1.4 }), flecha(268, 132, 268, 164, { color: T.apagado, w: 1.4 }), serif(80, 156, 'sí', { anchor: 'end', weight: 700 }), serif(278, 156, 'no', { weight: 700 }));
  out.push(`${m.g('acudir')}${recuadro(12, 166, 162, 120, { on: m.on('acudir'), borde: T.verdeTxt })}${lineas(20, 188, ['Acude a toda velocidad,', 'informa a las víctimas', 'o a salvamento y deja', 'constancia en el diario', 'de navegación.'], { size: TXT.min, color: m.c('acudir') }, 18)}</g>`);
  out.push(`${m.g('no-acudir')}${recuadro(184, 166, 162, 120, { on: m.on('no-acudir') })}${lineas(192, 188, ['No basta con seguir tu', 'rumbo: anota el motivo', 'en el diario e informa', 'al servicio de', 'salvamento.'], { size: TXT.min, color: m.c('no-acudir') }, 18)}</g>`);
  out.push(panelNotas(300, H), serif(16, 322, 'Sea cual sea su nacionalidad o condición,', { size: TXT.min, weight: 700 }), serif(16, 340, 'aunque nadie te lo pida.', { size: TXT.min, weight: 700 }), tacha(22, 366, 4.5), serif(34, 370, 'Falso: «solo si es de mi bandera»', { size: TXT.min, color: T.magenta }), serif(34, 388, 'o «si me lo piden».', { size: TXT.min, color: T.magenta }));
  out.push(cierra());
  const CAP = {
    acudir: 'Si puedes ayudar, acudes a toda velocidad, informas a las víctimas o al servicio de salvamento y lo dejas anotado en el diario de navegación.',
    'no-acudir': 'Si no puedes acudir, o no es razonable porque otro barco mejor preparado ya está allí, anotas el motivo en el diario de navegación e informas al servicio de salvamento.',
  };
  const hl = [...m.hl];
  return { svg: out.join(''), caption: hl.length ? hl.map((k) => CAP[k]).join(' ') : 'Quien sabe que hay personas en peligro en el mar debe acudir a toda velocidad si puede hacerlo sin grave peligro, sea cual sea su nacionalidad; si no acude, anota el motivo en el diario e informa a salvamento.' };
}
