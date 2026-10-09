// Balsa salvavidas (PY, UT 1: py-1-5 y py-1-8) en estilo C (docs/ESTILO-LAMINAS.md). Mismo tipo y parámetros que la
// lámina de lección a la que sustituye:
//   { tipo:'balsa', vista:'zafa'|'inflado'|'adrizar'|'lanzar', resaltar? (zafa: contenedor, zafa, trinca, boza, union-debil) }
// Solo colores T.*; la balsa en naranja, como las de verdad, y siempre con su rótulo.

import { T, TXT, lienzo, rotulo, etiqueta, cota, flecha, ondas, referencia, paso, barco, f1 } from './estilo-c.js';
import { filaPaso } from './carta-c.js';

const W = 358;
export const PARTES_BALSA = ['contenedor', 'zafa', 'trinca', 'boza', 'union-debil'];
const serif = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start', ...o });

/** Balsa inflada vista de costado, centrada en (x, y = flotación), de ancho w. */
function balsaPerfil(x, y, w = 70) {
  const h = w * 0.16;
  return `<path d="M${f1(x - w / 2 + 6)},${f1(y - h)} Q${f1(x)},${f1(y - h - w * 0.55)} ${f1(x + w / 2 - 6)},${f1(y - h)}Z" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.2"/>` +
    `<rect x="${f1(x - w / 2)}" y="${f1(y - h - 2)}" width="${f1(w)}" height="${f1(h * 1.1)}" rx="${f1(h * 0.55)}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>` +
    `<rect x="${f1(x - w / 2 + 2)}" y="${f1(y - 2)}" width="${f1(w - 4)}" height="${f1(h)}" rx="${f1(h * 0.5)}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>`;
}
/** Contenedor cilíndrico visto de costado. */
const contenedor = (x, y, w, h, { color = T.tinta, grueso = 1.4 } = {}) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2.4)}" fill="${T.papel}" stroke="${color}" stroke-width="${grueso}"/><line x1="${f1(x + w / 2)}" y1="${f1(y)}" x2="${f1(x + w / 2)}" y2="${f1(y + h)}" stroke="${T.tinta}" stroke-width=".7"/>`;
/** Velero de costado que se hunde (para la secuencia de la zafa). */
const cascoPerfil = (x, y, ang, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${ang}) scale(${s})"><path d="M-30,-6 L30,-6 L24,6 L-22,6Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2" vector-effect="non-scaling-stroke"/><line x1="0" y1="-6" x2="0" y2="-40" stroke="${T.tinta}" stroke-width="1.5" vector-effect="non-scaling-stroke"/></g>`;
const mar = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${T.agua}"/><line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${T.lineaAgua}" stroke-width="1.4"/>`;

// ---------------------------------------------------------------------------
// Contenedor, trinca, zafa y boza

function vistaZafa(spec) {
  const hl = new Set([].concat(spec.resaltar ?? []));
  if ([...hl].some((k) => !PARTES_BALSA.includes(k))) return null;
  const on = (k) => hl.has(k);
  const col = (k, base = T.tinta) => (on(k) ? T.magenta : base);
  const dim = (k) => (hl.size && !on(k) ? ' opacity=".45"' : '');
  const H = 330;
  const alt = `La balsa en su contenedor, sobre su cuna en cubierta: una sola trinca pasa por encima del contenedor y acaba en la zafa hidrostática; la boza va del contenedor a la unión débil, junto a la zafa.${hl.size ? ` Resaltado: ${[...hl].map((k) => k.replace('-', ' ')).join(', ')}.` : ''}`;
  const { out, cierra } = lienzo(W, H, alt);
  const yC = 170;
  out.push(`<rect x="10" y="${yC}" width="${W - 20}" height="12" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>`, serif(16, yC + 30, 'cubierta', { italic: true, color: T.apagado, size: TXT.min }));
  out.push(`<path d="M78,${yC} L92,${yC - 18} L190,${yC - 18} L204,${yC}Z" fill="none" stroke="${T.tinta}" stroke-width="1.4"/>`);
  const [cx0, cy0, cw, ch] = [62, 96, 158, 54];
  out.push(`<g data-parte="contenedor"${dim('contenedor')}>${contenedor(cx0, cy0, cw, ch, { color: col('contenedor'), grueso: on('contenedor') ? 2.2 : 1.4 })}${[92, 122, 160, 190].map((x) => `<circle cx="${x}" cy="${cy0 + ch - 6}" r="2.2" fill="${T.tinta}"/>`).join('')}` +
    rotulo(cx0 + cw / 2, cy0 + 24, 'contenedor', { size: TXT.nota, estilo: 'serif', weight: 700, color: col('contenedor') }) + rotulo(cx0 + cw / 2, cy0 + 40, 'flota; desagües abajo', { size: TXT.min, estilo: 'serif', italic: true }) + '</g>');
  const zx = 248;
  out.push(`<g data-parte="trinca"${dim('trinca')}><path d="M42,${yC} L56,${cy0 + 10} Q141,${cy0 - 34} 224,${cy0 + 10} L${zx},${yC - 16}" fill="none" stroke="${col('trinca', T.apagado)}" stroke-width="${on('trinca') ? 3.4 : 2.6}"/><circle cx="42" cy="${yC - 2}" r="3.5" fill="none" stroke="${T.tinta}" stroke-width="1.4"/>` +
    referencia(100, 50, 108, cy0 - 12) + serif(40, 44, 'trinca: pasa por la zafa', { weight: 700, color: col('trinca') }) + '</g>');
  out.push(`<g data-parte="zafa"${dim('zafa')}><rect x="${zx - 6}" y="${yC - 18}" width="24" height="18" rx="3" fill="${on('zafa') ? T.magenta : T.azul}" stroke="${T.tinta}" stroke-width="1.3"/>` +
    referencia(zx + 6, yC + 12, zx - 30, yC + 52) + serif(16, yC + 64, 'zafa hidrostática', { weight: 700, color: col('zafa') }) + '</g>');
  out.push(`<g data-parte="boza"${dim('boza')}><path d="M${cx0 + cw},${cy0 + 32} Q${zx + 24},${cy0 + 32} ${zx + 36},${yC - 24}" fill="none" stroke="${col('boza')}" stroke-width="${on('boza') ? 2.4 : 1.6}"${on('boza') ? '' : ' stroke-dasharray="5 2"'}/>` +
    referencia(zx + 16, cy0 + 36, 300, cy0 + 2) + rotulo(W - 16, cy0 - 2, 'boza', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'end', weight: 700, color: col('boza') }) + '</g>');
  out.push(`<g data-parte="union-debil"${dim('union-debil')}><circle cx="${zx + 36}" cy="${yC - 19}" r="5.5" fill="none" stroke="${col('union-debil')}" stroke-width="${on('union-debil') ? 2.2 : 1.6}"/><line x1="${zx + 18}" y1="${yC - 9}" x2="${zx + 31}" y2="${yC - 16}" stroke="${T.tinta}" stroke-width="1.4"/>` +
    referencia(zx + 38, yC - 12, W - 40, yC + 48) + rotulo(W - 16, yC + 64, 'unión débil', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'end', weight: 700, color: col('union-debil') }) + '</g>');
  out.push(`<line x1="14" y1="252" x2="${W - 14}" y2="252" stroke="${T.tinta}" stroke-width=".6"/>`);
  out.push(filaPaso(22, 276, 1, 'La zafa suelta la trinca por la presión del agua,', { clave: true }), serif(38, 294, 'antes de 4 m: no con las olas ni con un golpe.', { weight: 700, color: T.magenta }));
  out.push(filaPaso(22, 318, 2, 'Trinca solo con la que pasa por la zafa.'));
  out.push(cierra());
  const CAP = {
    contenedor: 'El contenedor es robusto y flota con la balsa dentro; es estanco en lo posible, pero lleva orificios de desagüe en el fondo.',
    zafa: 'La zafa hidrostática sujeta la balsa y la suelta sola por la presión del agua antes de 4 m de profundidad, no cuando pasan las olas. Se puede soltar a mano.',
    trinca: 'La balsa se trinca solo con la trinca que pasa por la zafa: con trincas de más, la zafa suelta pero la balsa se hunde atada al barco.',
    boza: 'La boza es el cabo que une la balsa al barco: al tensarse dispara la botella de inflado.',
    'union-debil': 'La unión débil es un eslabón de la boza que se rompe cuando la balsa ya está inflada, para que no se vaya al fondo con el barco.',
  };
  return { svg: out.join(''), caption: [...hl].map((k) => CAP[k]).join('\n') || 'La balsa va en un contenedor que flota, trincado con una sola trinca que pasa por la zafa hidrostática. La boza une la balsa al barco a través de la zafa y su unión débil.' };
}

// ---------------------------------------------------------------------------
// Cómo se infla sola: cuatro viñetas

function vistaInflado() {
  const H = 372;
  const alt = 'Cuatro viñetas de un barco que se hunde: 1, antes de 4 metros la zafa suelta la trinca; 2, el contenedor sube a flote con la boza floja; 3, el barco, al seguir bajando, tensa la boza y dispara la botella: la balsa se infla; 4, la unión débil se rompe y la balsa queda libre.';
  const { out, cierra } = lienzo(W, H, alt);
  const vin = [['Antes de 4 m, la zafa', 'suelta la trinca'], ['El contenedor sube', 'a flote: boza floja'], ['El barco tensa la boza:', 'se infla la balsa'], ['La unión débil se', 'rompe: balsa libre']];
  vin.forEach(([a, b], i) => {
    const x0 = 12 + (i % 2) * 172;
    const y0 = 14 + Math.floor(i / 2) * 170;
    const w = 162;
    out.push(paso(x0 + 11, y0 + 14, i + 1), serif(x0 + 26, y0 + 18, a, { weight: 700, size: TXT.min }), serif(x0 + 26, y0 + 34, b, { italic: true, size: TXT.min }));
    const ys = y0 + 64;
    out.push(mar(x0, ys, w, 94));
    const bx = x0 + 102;
    if (i === 0) {
      out.push(cascoPerfil(bx, ys + 60, 14, 0.9), contenedor(bx - 14, ys + 22, 26, 12));
      out.push(cota(x0 + 18, ys, x0 + 18, ys + 72, '', { tope: 4, color: T.magenta }), etiqueta(x0 + 44, ys + 40, '4 m', { color: T.magenta }));
    } else if (i === 1) {
      out.push(cascoPerfil(bx + 6, ys + 72, 18, 0.8), contenedor(bx - 50, ys - 7, 28, 13));
      out.push(`<path d="M${bx - 22},${ys + 3} Q${bx - 24},${ys + 44} ${bx + 4},${ys + 66}" fill="none" stroke="${T.tinta}" stroke-width="1.2" stroke-dasharray="4 2"/>`, serif(x0 + 6, ys + 86, 'boza floja', { italic: true, size: TXT.min }));
    } else if (i === 2) {
      out.push(cascoPerfil(bx + 16, ys + 78, 22, 0.7), balsaPerfil(x0 + 48, ys, 56));
      out.push(`<line x1="${x0 + 76}" y1="${ys + 2}" x2="${bx + 14}" y2="${ys + 70}" stroke="${T.magenta}" stroke-width="2"/>`, serif(x0 + 6, ys + 86, 'boza tensa', { weight: 700, color: T.magenta, size: TXT.min }));
    } else {
      out.push(cascoPerfil(bx + 22, ys + 82, 26, 0.6), balsaPerfil(x0 + 48, ys, 56));
      out.push(`<line x1="${x0 + 76}" y1="${ys + 2}" x2="${x0 + 90}" y2="${ys + 26}" stroke="${T.tinta}" stroke-width="1.4"/>`);
      out.push(`<path d="M${x0 + 93},${ys + 30} l9,9 M${x0 + 102},${ys + 30} l-9,9" stroke="${T.magenta}" stroke-width="2.2" stroke-linecap="round"/>`, serif(x0 + 108, ys + 40, 'rota', { weight: 700, color: T.magenta, size: TXT.min }));
    }
  });
  out.push(rotulo(W / 2, H - 14, 'La zafa suelta la balsa; la unión débil rompe la boza.', { size: TXT.nota, estilo: 'serif', italic: true, weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Si el barco se hunde, antes de 4 m la zafa hidrostática suelta la trinca, el contenedor sube a flote y el barco, al seguir bajando, tensa la boza y dispara la botella. Ya inflada, la unión débil se rompe y la balsa queda libre.' };
}

// ---------------------------------------------------------------------------
// Adrizar una balsa volcada

function vistaAdrizar() {
  const H = 330;
  const alt = 'Una balsa inflada boca abajo, con el toldo bajo el agua. A sotavento, una persona de pie sobre la botella de gas tira de las cinchas de adrizamiento de la parte inferior echándose atrás; el viento levanta el borde de barlovento y la balsa gira hacia ella.';
  const { out, cierra } = lienzo(W, H, alt);
  const yA = 176;
  out.push(mar(0, yA, W, 90), ondas(10, W - 10, yA + 60, { sep: 9 }));
  out.push(flecha(110, 50, 180, 50, { color: T.tinta, w: 1.8 }), flecha(110, 68, 180, 68, { color: T.tinta, w: 1.8 }), serif(110, 38, 'viento', { italic: true }));
  out.push(serif(16, yA + 82, 'barlovento', { italic: true, color: T.apagado }), rotulo(W - 16, yA + 82, 'sotavento', { size: TXT.min + 0.5, estilo: 'serif', italic: true, anchor: 'end', weight: 700, color: T.magenta }));
  // la balsa volcada: suelo arriba, toldo bajo el agua
  out.push(`<path d="M70,${yA + 10} Q150,${yA + 84} 230,${yA + 10}Z" fill="${T.naranja}" fill-opacity=".45" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="4 3"/>`, rotulo(150, yA + 38, 'toldo, bajo el agua', { size: TXT.min, estilo: 'serif', italic: true }));
  out.push(`<rect x="64" y="${yA - 14}" width="172" height="14" rx="7" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/><rect x="64" y="${yA}" width="172" height="12" rx="6" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`);
  out.push(`<path d="M80,${yA - 15} Q150,${yA - 27} 220,${yA - 15}" fill="none" stroke="${T.magenta}" stroke-width="2.6"/>`, referencia(110, 112, 118, yA - 22, { color: T.magenta }), serif(40, 100, 'cinchas de adrizamiento', { weight: 700, color: T.magenta }), serif(40, 116, 'en la parte inferior', { italic: true, color: T.magenta }));
  out.push(`<rect x="212" y="${yA - 24}" width="24" height="10" rx="4" fill="${T.azul}" stroke="${T.tinta}" stroke-width="1"/>`, referencia(236, yA - 18, 280, yA + 22), rotulo(W - 16, yA + 34, 'botella de gas', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'end', weight: 700 }));
  // la persona, de pie sobre la botella y echándose atrás
  out.push(`<path d="M222,${yA - 26} L236,${yA - 42} L238,${yA - 58}" fill="none" stroke="${T.tinta}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);
  out.push(`<line x1="238" y1="${yA - 58}" x2="256" y2="${yA - 92}" stroke="${T.tinta}" stroke-width="9" stroke-linecap="round"/><circle cx="264" cy="${yA - 106}" r="9" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.4"/>`);
  out.push(`<path d="M254,${yA - 86} L212,${yA - 54} L190,${yA - 22}" fill="none" stroke="${T.tinta}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);
  out.push(rotulo(W - 16, yA - 56, 'tira echándote', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'end', weight: 700 }), rotulo(W - 16, yA - 40, 'atrás', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'end', weight: 700 }));
  // el borde de barlovento se levanta y la balsa gira hacia la persona
  out.push(`<path d="M60,${yA - 18} Q30,${yA - 72} 80,${yA - 98}" fill="none" stroke="${T.magenta}" stroke-width="2"/>`, flecha(72, yA - 94, 84, yA - 100, { color: T.magenta, w: 2 }));
  out.push(`<line x1="14" y1="274" x2="${W - 14}" y2="274" stroke="${T.tinta}" stroke-width=".6"/>`);
  out.push(serif(18, 296, 'A sotavento, de pie sobre la botella, tira de las cinchas:'), serif(18, 316, 'el viento la voltea hacia ti. Luego apártate nadando.', { weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Si se infla volcada: nada hasta el lado de la botella, a sotavento; súbete a la botella, agarra las cinchas de la parte inferior y échate atrás tirando. El viento ayuda a voltearla hacia ti; después apártate nadando.' };
}

// ---------------------------------------------------------------------------
// Lanzarla a mano y embarcar

function vistaLanzar() {
  const H = 392;
  const alt = 'El barco visto desde arriba con el viento por su costado: la boza, amarrada a un punto fuerte del costado de sotavento, va hasta la balsa inflada, que queda al costado por sotavento. Debajo, los cinco pasos numerados: amarrar la boza, lanzar por sotavento, sacar toda la boza y dar un tirón, embarcar con la balsa al costado y soltar la boza solo con todos dentro.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(flecha(18, 70, 66, 70, { color: T.tinta, w: 1.8 }), flecha(18, 88, 66, 88, { color: T.tinta, w: 1.8 }), serif(18, 58, 'viento', { italic: true }));
  out.push(serif(18, 192, 'barlovento', { italic: true, color: T.apagado }), rotulo(W - 18, 192, 'sotavento', { size: TXT.min + 0.5, estilo: 'serif', italic: true, anchor: 'end', weight: 700, color: T.magenta }));
  out.push(barco(122, 116, 0, 136, { p: null }), rotulo(122, 128, 'barco', { size: TXT.min, estilo: 'serif', italic: true }));
  const pf = [142, 124];
  const [bx, by] = [244, 124];
  out.push(`<line x1="${pf[0]}" y1="${pf[1]}" x2="${bx - 34}" y2="${by}" stroke="${T.magenta}" stroke-width="2.2"/><circle cx="${pf[0]}" cy="${pf[1]}" r="4" fill="${T.tinta}"/>`);
  out.push(`<circle cx="${bx}" cy="${by}" r="34" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4"/><circle cx="${bx}" cy="${by}" r="25" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1"/>`, rotulo(bx, by + 4, 'balsa', { size: TXT.min + 0.5, estilo: 'serif', weight: 700 }));
  out.push(paso(150, 104, 1), paso(186, 142, 2), paso(bx, by - 48, 3), paso(bx + 50, by, 4));
  out.push(`<rect x="0" y="210" width="${W}" height="${H - 210}" fill="${T.papel}"/><line x1="0" y1="210" x2="${W}" y2="210" stroke="${T.tinta}" stroke-width=".8"/>`);
  ['Amarra la boza a un punto fuerte antes de lanzarla.', 'Suelta las trincas y lánzala por sotavento.', 'Saca toda la boza y da un tirón: se infla.', 'Con la boza amarrada, la balsa sigue al costado.', 'Solo con todos dentro se suelta o se corta la boza.']
    .forEach((t, i) => out.push(filaPaso(22, 236 + i * 24, i + 1, t, { clave: i === 2 })));
  out.push(serif(18, 362, 'Embarca sin mojarte y sin saltar encima de ella;', { italic: true }), serif(18, 380, 'que entre primero alguien fuerte o de más peso.', { italic: true }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Amarra la boza a un punto fuerte, lanza el contenedor por sotavento, saca toda la boza y da un tirón. La balsa queda al costado mientras se embarca, sin mojarse ni saltar encima, y la boza solo se corta cuando todos están dentro.' };
}

export function balsaC(spec = {}) {
  const vista = spec.vista ?? 'zafa';
  if (vista === 'zafa') return vistaZafa(spec);
  if (vista === 'inflado') return vistaInflado();
  if (vista === 'adrizar') return vistaAdrizar();
  if (vista === 'lanzar') return vistaLanzar();
  return null;
}
