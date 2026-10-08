// Láminas de seguridad: supervivencia en el agua (hipotermia), balsa salvavidas (zafa, inflado, adrizado,
// lanzamiento), rescate con helicóptero y chaleco / arnés. Cada función es pura: spec → { svg, caption }.
// Estilo común del kit: fondo il-panel, textos en currentColor y superficies con las variables --l-* del tema.

import { open, title, arrow, pol, hullPlan, fx } from '../kit.js';

const RED = 'var(--l-r)';
const MAR = 'style="fill:var(--l-mar)"';

/** Texto de lámina con un único atributo style (color, tamaño y grosor). */
function tx(x, y, t, { c = null, anchor = 'start', bold = false, size = null } = {}) {
  const st = [c ? `fill:${c}` : '', size ? `font-size:${size}px` : '', bold ? 'font-weight:700' : ''].filter(Boolean).join(';');
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${anchor}"${st ? ` style="${st}"` : ''}>${t}</text>`;
}
/** Línea guía fina de una etiqueta a su parte. */
const lead = (x1, y1, x2, y2, c = 'currentColor') => `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" stroke="${c}" stroke-width=".8" opacity=".75"/>`;
const dot = (x, y, c = 'currentColor', r = 2.2) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="${r}" style="fill:${c}"/>`;
/** Superficie del mar desde la altura y hasta el fondo de la lámina, con una línea de ola. */
function mar(y, W, H, x0 = 0) {
  let d = `M${x0},${y}`;
  for (let x = x0; x < W; x += 20) d += ` q5,-3 10,0 q5,3 10,0`;
  return `<rect x="${x0}" y="${y}" width="${W - x0}" height="${H - y}" ${MAR}/><path d="${d}" fill="none" stroke="${'var(--l-v)'}" stroke-width="1.2"/>`;
}
/** Conjunto de partes resaltadas: admite una cadena o una lista. */
const hlSet = (r) => new Set(r == null ? [] : Array.isArray(r) ? r : [r]);
/** Ayudante de resaltado: color, grosor y etiqueta de cada parte. */
function marcador(hl) {
  const on = (k) => hl.has(k);
  return {
    on,
    col: (k) => (on(k) ? RED : 'currentColor'),
    w: (k, base = 1.4) => (on(k) ? base + 1.6 : base),
    t: (x, y, t, k, anchor = 'start') => tx(x, y, t, { c: on(k) ? RED : null, anchor, bold: on(k) }),
  };
}
/** Nota al pie: varias líneas de texto, alineadas a la izquierda. */
const notas = (x, y, lineas, paso = 15) => lineas.map((l, i) => tx(x, y + i * paso, l, { size: 10.5 })).join('');
const tache = (x, y, s = 6) => `<path d="M${x - s},${y - s} L${x + s},${y + s} M${x + s},${y - s} L${x - s},${y + s}" stroke="${RED}" stroke-width="2.4" stroke-linecap="round"/>`;
const PIEL = 'var(--l-casco)';
const HULL = 'style="fill:var(--l-casco);stroke:currentColor"';
const CHAL = 'var(--l-a)';
/** Trazo de miembro (brazo o pierna). */
const miembro = (pts, w = 6) => `<polyline points="${pts.map((p) => p.map(fx).join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`;
const cabeza = (x, y, r = 10) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="${r}" style="fill:${PIEL}" stroke="currentColor" stroke-width="1.4"/>`;
/** Tronco con chaleco: un trazo grueso redondeado del color del chaleco. */
const tronco = (a, b, w = 18) => `<line x1="${fx(a[0])}" y1="${fx(a[1])}" x2="${fx(b[0])}" y2="${fx(b[1])}" style="stroke:${CHAL}" stroke-width="${w}" stroke-linecap="round"/><line x1="${fx(a[0])}" y1="${fx(a[1])}" x2="${fx(b[0])}" y2="${fx(b[1])}" stroke="currentColor" stroke-width="${w + 2}" stroke-linecap="round" opacity=".18"/>`;

// ---------------------------------------------------------------------------
// Supervivencia en el agua. spec: { tipo:'hipotermia', postura:'saltar'|'help'|'grupo' }

export function hipotermiaIllustration(spec) {
  const postura = spec.postura ?? 'help';
  const W = 320;
  if (postura === 'grupo') {
    const H = 260;
    const out = open(W, H, 'Supervivencia en el agua: en piña', 'hg');
    out.push(title(160, 'Varios en el agua: en piña'));
    out.push(`<rect x="10" y="34" width="${W - 20}" height="174" rx="8" ${MAR}/>`);
    out.push(tx(18, 50, 'vista desde arriba', { size: 10 }));
    const cx = 130;
    const cy = 122;
    const R = 50;
    const ps = [0, 72, 144, 216, 288].map((a) => pol(cx, cy, a, R));
    // brazos enlazados entre vecinos (abrazados)
    ps.forEach((p, i) => {
      const q = ps[(i + 1) % ps.length];
      out.push(`<line x1="${fx(p[0])}" y1="${fx(p[1])}" x2="${fx(q[0])}" y2="${fx(q[1])}" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".55"/>`);
    });
    // brazos hacia el del centro
    ps.forEach((p) => out.push(`<line x1="${fx(p[0])}" y1="${fx(p[1])}" x2="${fx((p[0] + cx) / 2)}" y2="${fx((p[1] + cy) / 2)}" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".4"/>`));
    const nadador = (x, y, fuerte) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="15" style="fill:${CHAL}" stroke="${fuerte ? RED : 'currentColor'}" stroke-width="${fuerte ? 2.6 : 1.2}"/>` + cabeza(x, y, 8);
    ps.forEach(([x, y]) => out.push(nadador(x, y, false)));
    out.push(nadador(cx, cy, true));
    out.push(lead(cx + 16, cy + 4, 214, 132, RED), tx(218, 128, 'el más débil,', { c: RED, bold: true }), tx(218, 141, 'en el centro', { c: RED, bold: true }));
    out.push(tx(218, 70, 'abrazados,', { bold: true }), tx(218, 83, 'con el chaleco', { bold: true }), lead(214, 80, ps[1][0] + 14, ps[1][1] - 8));
    out.push(notas(16, 226, ['Juntos conserváis el calor, os animáis y se os ve mejor.', 'Quietos: no nadéis sin algo seguro muy cerca.']));
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Si sois varios en el agua, agrupaos en piña, abrazados y con los más débiles en el centro: conserváis el calor, os dais ánimo y es más fácil que os encuentren.' };
  }
  if (postura === 'saltar') {
    const H = 290;
    const out = open(W, H, 'Supervivencia en el agua: cómo saltar', 'hs');
    out.push(title(160, 'Si no hay más remedio que saltar'));
    const yAgua = 196;
    out.push(mar(yAgua, W, H - 74));
    // costado del barco
    out.push(`<path d="M10,62 L78,62 L72,${yAgua + 14} L10,${yAgua + 14}Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
    out.push(`<line x1="10" y1="62" x2="78" y2="62" stroke="currentColor" stroke-width="2.4"/>`);
    // persona en el aire: de pie, piernas juntas y estiradas
    const x = 130;
    out.push(miembro([[x - 3, 122], [x - 3, 168]], 5), miembro([[x + 3, 122], [x + 3, 168]], 5));
    out.push(tronco([x, 92], [x, 118], 20));
    out.push(cabeza(x, 74, 11));
    out.push(miembro([[x + 8, 88], [x + 14, 80], [x + 6, 76]], 5)); // mano tapando nariz y boca
    out.push(miembro([[x - 9, 88], [x + 4, 104], [x + 10, 100]], 5)); // brazo cruzado sujetando el chaleco
    // caída hacia agua despejada
    out.push(arrow(x, 176, x, yAgua - 4, 'v', 'hs', 2));
    out.push(lead(150, 76, 176, 66), tx(180, 64, 'inspira y tapa', { bold: true }), tx(180, 77, 'nariz y boca', { bold: true }));
    out.push(lead(146, 104, 176, 100), tx(180, 98, 'sujeta el chaleco,', { bold: true }), tx(180, 111, 'brazo cruzado', { bold: true }));
    out.push(lead(138, 150, 176, 146), tx(180, 144, 'piernas juntas', { bold: true }), tx(180, 157, 'y estiradas', { bold: true }));
    out.push(tx(140, 186, 'nadie ni nada debajo'));
    out.push(notas(14, 236, ['Salta desde la menor altura posible, lejos de', 'combustible derramado. Mejor aún: pasa a la balsa', 'desde cubierta sin mojarte.'], 14.5));
    out.push(`<text x="14" y="${H - 6}" class="il-lbl" style="fill:${RED};font-weight:700;font-size:10.5px">× No: piernas plegadas (eso es para flotar).</text>`);
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Si hay que saltar: comprueba que no hay nadie ni nada debajo, salta desde la menor altura posible, de pie, con las piernas juntas y estiradas, tapando nariz y boca con una mano y sujetando el chaleco con el otro brazo.' };
  }
  // postura HELP con chaleco
  const H = 258;
  const out = open(W, H, 'Supervivencia en el agua: postura HELP', 'hh');
  out.push(title(160, 'Con chaleco: postura fetal (HELP)'));
  const yAgua = 104;
  out.push(mar(yAgua, W, 204));
  // figura recostada: espalda a la derecha, rodillas al pecho a la izquierda
  const hom = [104, 120];
  const cad = [90, 172];
  const rod = [70, 120];
  const pie = [62, 168];
  out.push(tronco(hom, cad, 22));
  out.push(miembro([cad, rod, pie], 9));
  out.push(cabeza(108, 96, 12));
  out.push(miembro([[110, 126], [80, 142], [76, 134]], 5), miembro([[100, 124], [84, 150], [92, 152]], 5)); // brazos cruzados
  const zonas = [
    ['cabeza (fuera del agua)', [116, 90], 80],
    ['cuello', [108, 110], 102],
    ['axilas', [110, 128], 124],
    ['costados', [104, 150], 146],
    ['ingles', [92, 172], 168],
  ];
  for (const [t, [px, py], ly] of zonas) out.push(dot(px, py, RED, 3), lead(px + 3, py, 176, ly - 4, RED), tx(180, ly, t, { c: RED, bold: true }));
  out.push(tx(180, 46, 'protege las zonas que'), tx(180, 59, 'más calor pierden:'));
  out.push(notas(14, 224, ['Rodillas al pecho y brazos cruzados. No nades para', 'entrar en calor. Sin chaleco: vertical, despacio.']));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Con chaleco, quieto en postura fetal (HELP): rodillas al pecho y brazos cruzados, para proteger cabeza, cuello, axilas, costados e ingles. Sin chaleco, vertical y con movimientos lentos, lo justo para flotar.' };
}

// ---------------------------------------------------------------------------
// Balsa salvavidas. spec: { tipo:'balsa', vista:'zafa'|'inflado'|'adrizar'|'lanzar', resaltar? (zafa) }

/** Balsa inflada vista de costado, centrada en (x, y = flotación), ancho w. */
function balsaPerfil(x, y, w = 70) {
  const h = w * 0.16;
  return `<path d="M${fx(x - w / 2 + 6)},${fx(y - h)} Q${fx(x)},${fx(y - h - w * 0.5)} ${fx(x + w / 2 - 6)},${fx(y - h)}Z" style="fill:${CHAL}" stroke="currentColor" stroke-width="1.2"/>` +
    `<rect x="${fx(x - w / 2)}" y="${fx(y - h - 2)}" width="${fx(w)}" height="${fx(h * 1.1)}" rx="${fx(h * 0.55)}" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/>` +
    `<rect x="${fx(x - w / 2 + 2)}" y="${fx(y - 2)}" width="${fx(w - 4)}" height="${fx(h)}" rx="${fx(h * 0.5)}" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/>`;
}
/** Contenedor cilíndrico visto de costado. */
const contenedor = (x, y, w, h, extra = '') => `<rect x="${fx(x)}" y="${fx(y)}" width="${fx(w)}" height="${fx(h)}" rx="${fx(h / 2.4)}" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4" ${extra}/><line x1="${fx(x + w / 2)}" y1="${fx(y)}" x2="${fx(x + w / 2)}" y2="${fx(y + h)}" stroke="currentColor" stroke-width="1" opacity=".5"/>`;
/** Casco de un velero de costado, para la secuencia de hundimiento. */
const cascoPerfil = (x, y, ang, s = 1) => `<g transform="translate(${fx(x)} ${fx(y)}) rotate(${ang}) scale(${s})"><path d="M-30,-6 L30,-6 L24,6 L-22,6Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/><line x1="0" y1="-6" x2="0" y2="-40" stroke="currentColor" stroke-width="1.6"/></g>`;

export function balsaIllustration(spec) {
  const vista = spec.vista ?? 'zafa';
  const W = 320;
  if (vista === 'inflado') {
    const H = 330;
    const out = open(W, H, 'Balsa salvavidas: cómo se infla sola', 'bi');
    out.push(title(160, 'Cómo se infla sola'));
    const pasos = [
      ['① Antes de 4 m, la zafa', 'suelta la trinca'],
      ['② El contenedor sube', 'por su flotabilidad'],
      ['③ El barco tensa la boza:', 'se dispara la botella'],
      ['④ La unión débil se', 'rompe: balsa libre'],
    ];
    pasos.forEach(([a, b], i) => {
      const x0 = 8 + (i % 2) * 156;
      const y0 = 32 + Math.floor(i / 2) * 138;
      const w = 148;
      out.push(tx(x0 + 4, y0 + 12, a, { bold: true }), tx(x0 + 4, y0 + 25, b));
      const ys = y0 + 56; // superficie
      out.push(`<rect x="${x0}" y="${ys}" width="${w}" height="76" rx="4" ${MAR}/>`, `<line x1="${x0}" y1="${ys}" x2="${x0 + w}" y2="${ys}" style="stroke:var(--l-v)" stroke-width="1.4"/>`);
      const bx = x0 + 96;
      if (i === 0) {
        out.push(cascoPerfil(bx, ys + 54, 14, 0.9));
        out.push(contenedor(bx - 14, ys + 18, 24, 11));
        out.push(`<line x1="${x0 + 18}" y1="${ys}" x2="${x0 + 18}" y2="${ys + 60}" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2"/>`, `<line x1="${x0 + 13}" y1="${ys + 60}" x2="${x0 + 23}" y2="${ys + 60}" stroke="currentColor" stroke-width="1.2"/>`);
        out.push(tx(x0 + 26, ys + 63, '4 m', { bold: true, c: RED }));
      } else if (i === 1) {
        out.push(cascoPerfil(bx + 6, ys + 66, 18, 0.8));
        out.push(contenedor(bx - 46, ys - 6, 26, 12));
        out.push(`<path d="M${bx - 20},${ys + 2} Q${bx - 22},${ys + 40} ${bx + 4},${ys + 60}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 2"/>`);
        out.push(tx(x0 + 6, ys + 74, 'boza floja'));
      } else if (i === 2) {
        out.push(cascoPerfil(bx + 14, ys + 70, 22, 0.7));
        out.push(balsaPerfil(x0 + 46, ys, 52));
        out.push(`<line x1="${x0 + 72}" y1="${ys + 2}" x2="${bx + 12}" y2="${ys + 64}" stroke="${RED}" stroke-width="2.2"/>`);
        out.push(tx(x0 + 6, ys + 74, 'boza tensa', { c: RED, bold: true }));
      } else {
        out.push(cascoPerfil(bx + 20, ys + 74, 26, 0.6));
        out.push(balsaPerfil(x0 + 46, ys, 52));
        out.push(`<line x1="${x0 + 72}" y1="${ys + 2}" x2="${x0 + 86}" y2="${ys + 24}" stroke="currentColor" stroke-width="1.4"/>`);
        out.push(tache(x0 + 92, ys + 32, 5));
        out.push(tx(x0 + 100, ys + 36, 'rota', { c: RED, bold: true }));
      }
    });
    out.push(notas(14, H - 10, ['Zafa: suelta la balsa. Unión débil: rompe la boza.']));
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Si el barco se hunde, antes de 4 m la zafa hidrostática suelta la trinca, el contenedor sube a flote y el barco, al seguir bajando, tensa la boza y dispara la botella. Ya inflada, la unión débil se rompe y la balsa queda libre.' };
  }
  if (vista === 'adrizar') {
    const H = 290;
    const out = open(W, H, 'Balsa salvavidas: adrizar una balsa volcada', 'ba');
    out.push(title(160, 'Balsa inflada boca abajo: adrizarla'));
    const yA = 150;
    out.push(mar(yA, W, H - 50));
    // viento de izquierda a derecha
    out.push(arrow(116, 52, 184, 52, 'v', 'ba', 2.6), tx(116, 44, 'viento', { c: 'var(--l-v)', bold: true }));
    out.push(tx(14, H - 58, 'barlovento'), tx(W - 14, H - 58, 'sotavento', { anchor: 'end', bold: true }));
    // balsa volcada: suelo arriba, toldo bajo el agua
    out.push(`<path d="M66,${yA + 10} Q140,${yA + 82} 214,${yA + 10}Z" style="fill:${CHAL}" opacity=".45" stroke="currentColor" stroke-dasharray="4 3"/>`);
    out.push(tx(140, yA + 34, 'toldo, bajo el agua', { anchor: 'middle' }));
    out.push(`<rect x="60" y="${yA - 14}" width="160" height="14" rx="7" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.3"/>`, `<rect x="60" y="${yA}" width="160" height="12" rx="6" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.3"/>`);
    // cinchas de la parte inferior (ahora arriba)
    out.push(`<path d="M76,${yA - 15} Q140,${yA - 26} 204,${yA - 15}" fill="none" stroke="${RED}" stroke-width="3"/>`);
    out.push(lead(112, 100, 118, yA - 22, RED), tx(66, 82, 'cinchas de adrizamiento', { c: RED, bold: true }), tx(66, 95, '(parte inferior)', { c: RED }));
    // botella en el lado de sotavento
    out.push(`<rect x="196" y="${yA - 24}" width="22" height="10" rx="4" style="fill:var(--l-g)" stroke="currentColor"/>`);
    out.push(lead(218, yA - 16, 258, yA + 16), tx(W - 14, yA + 28, 'botella', { bold: true, anchor: 'end' }), tx(W - 14, yA + 41, 'de gas', { bold: true, anchor: 'end' }));
    // persona de pie sobre la botella, echándose atrás
    const pie = [208, yA - 26];
    const cad = [222, yA - 56];
    const hom = [240, yA - 88];
    out.push(miembro([pie, [222, yA - 40], cad], 6));
    out.push(tronco(cad, hom, 18));
    out.push(cabeza(248, yA - 104, 10));
    out.push(miembro([[hom[0] - 2, hom[1] + 4], [196, yA - 50], [176, yA - 20]], 4.5));
    out.push(tx(W - 14, yA - 48, 'tira', { bold: true, anchor: 'end' }), tx(W - 14, yA - 35, 'echándote', { bold: true, anchor: 'end' }), tx(W - 14, yA - 22, 'atrás', { bold: true, anchor: 'end' }));
    // el borde de barlovento se levanta y la balsa gira hacia la persona
    out.push(`<path d="M58,${yA - 18} Q28,${yA - 70} 74,${yA - 96}" fill="none" stroke="#16a34a" stroke-width="2.4" marker-end="url(#ba-m)"/>`);
    out.push(notas(14, H - 34, ['A sotavento, de pie sobre la botella, tira de las cinchas:', 'el viento la voltea hacia ti. Luego apártate nadando.']));
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Si se infla volcada: nada hasta el lado de la botella, a sotavento; súbete a la botella, agarra las cinchas de la parte inferior y échate atrás tirando. El viento ayuda a voltearla hacia ti; después apártate nadando.' };
  }
  if (vista === 'lanzar') {
    const H = 320;
    const out = open(W, H, 'Balsa salvavidas: lanzarla a mano y embarcar', 'bl');
    out.push(title(160, 'Lanzarla a mano y embarcar'));
    out.push(`<rect x="10" y="34" width="${W - 20}" height="160" rx="8" ${MAR}/>`);
    out.push(arrow(18, 70, 62, 70, 'v', 'bl', 2.6), tx(18, 60, 'viento', { c: 'var(--l-v)', bold: true }));
    out.push(tx(18, 186, 'barlovento'), tx(W - 18, 186, 'sotavento', { anchor: 'end', bold: true }));
    out.push(`<g transform="translate(120 112)">${hullPlan(130, 50, HULL)}</g>`);
    out.push(tx(112, 150, 'barco', { anchor: 'middle' }));
    // punto fuerte en el costado de sotavento y boza hasta la balsa
    const pf = [140, 120];
    out.push(`<circle cx="${pf[0]}" cy="${pf[1]}" r="4" style="fill:currentColor"/>`);
    const bx = 222;
    const by = 122;
    out.push(`<line x1="${pf[0]}" y1="${pf[1]}" x2="${bx - 32}" y2="${by + 2}" stroke="${RED}" stroke-width="2.4"/>`);
    out.push(`<circle cx="${bx}" cy="${by}" r="32" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/><circle cx="${bx}" cy="${by}" r="24" style="fill:${CHAL}" stroke="currentColor" stroke-width="1"/>`);
    out.push(`<path d="M${bx - 24},${by - 6} L${bx - 24},${by + 6}" stroke="currentColor" stroke-width="3"/>`);
    out.push(tx(bx, by + 4, 'balsa', { anchor: 'middle', bold: true }));
    const num = (x, y, n) => `<circle cx="${x}" cy="${y}" r="8" style="fill:var(--l-fondo)" stroke="currentColor"/><text x="${x}" y="${y + 3.5}" class="il-lbl" text-anchor="middle" style="font-weight:700">${n}</text>`;
    out.push(num(146, 104, 1), num(176, 140, 2), num(bx, by - 44, 3), num(bx + 44, by, 4));
    const pasos = [
      '① Amarra la boza a un punto fuerte antes de lanzarla.',
      '② Suelta las trincas y lánzala por sotavento.',
      '③ Saca toda la boza y da un tirón: se infla.',
      '④ Con la boza amarrada, la balsa sigue al costado.',
      '⑤ Solo con todos dentro se suelta o se corta la boza.',
      'Embarca sin mojarte y sin saltar encima de la balsa;',
      'que entre primero alguien fuerte o de más peso.',
    ];
    out.push(notas(14, 212, pasos, 14.5));
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Amarra la boza a un punto fuerte, lanza el contenedor por sotavento, saca toda la boza y da un tirón. La balsa queda al costado mientras se embarca, sin mojarse ni saltar encima, y la boza solo se corta cuando todos están dentro.' };
  }
  // contenedor, trinca, zafa y boza
  const hl = hlSet(spec.resaltar);
  const m = marcador(hl);
  const H = 290;
  const out = open(W, H, 'Balsa salvavidas: contenedor y zafa hidrostática', 'bz');
  out.push(title(160, 'Contenedor, zafa y boza'));
  const yC = 150; // cubierta
  out.push(`<rect x="10" y="${yC}" width="${W - 20}" height="10" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(tx(14, yC + 22, 'cubierta'));
  // cuna
  out.push(`<path d="M74,${yC} L88,${yC - 18} L182,${yC - 18} L196,${yC}Z" fill="none" stroke="currentColor" stroke-width="1.4"/>`);
  // contenedor
  const cx0 = 60;
  const cy0 = 76;
  const cw = 150;
  const ch = 52;
  out.push(`<g stroke-width="${m.w('contenedor')}">${contenedor(cx0, cy0, cw, ch, `style="fill:var(--l-casco);stroke:${m.col('contenedor')}" stroke-width="${m.w('contenedor')}"`)}</g>`);
  [90, 120, 150, 180].forEach((x) => out.push(`<circle cx="${x}" cy="${cy0 + ch - 5}" r="2.2" style="fill:currentColor"/>`));
  out.push(m.t(cx0 + cw / 2, cy0 + 22, 'contenedor', 'contenedor', 'middle'), tx(cx0 + cw / 2, cy0 + 35, '(flota; desagües abajo)', { anchor: 'middle' }));
  // trinca: de un cáncamo de cubierta, por encima del contenedor, hasta la zafa
  const zx = 236;
  out.push(`<path d="M40,${yC} L54,${cy0 + 10} Q135,${cy0 - 30} 214,${cy0 + 10} L${zx},${yC - 14}" fill="none" stroke="${m.on('trinca') ? RED : 'var(--l-g)'}" stroke-width="${m.on('trinca') ? 4 : 3}"/>`);
  out.push(`<circle cx="40" cy="${yC - 2}" r="3" fill="none" stroke="currentColor" stroke-width="1.4"/>`);
  out.push(m.t(40, 46, 'trinca (pasa por la zafa)', 'trinca'), lead(96, 50, 104, cy0 - 6, m.col('trinca')));
  // zafa hidrostática
  out.push(`<rect x="${zx - 6}" y="${yC - 16}" width="22" height="16" rx="3" style="fill:${m.on('zafa') ? RED : 'var(--l-g)'}" stroke="currentColor" stroke-width="${m.w('zafa')}"/>`);
  // boza: del contenedor a la unión débil junto a la zafa
  out.push(`<path d="M${cx0 + cw},${cy0 + 30} Q${zx + 20},${cy0 + 30} ${zx + 32},${yC - 22}" fill="none" stroke="${m.on('boza') ? RED : 'currentColor'}" stroke-width="${m.w('boza', 1.6)}" stroke-dasharray="${m.on('boza') ? '' : '5 2'}"/>`);
  out.push(`<circle cx="${zx + 32}" cy="${yC - 17}" r="5" fill="none" stroke="${m.col('union-debil')}" stroke-width="${m.w('union-debil', 1.6)}"/>`, `<line x1="${zx + 16}" y1="${yC - 8}" x2="${zx + 28}" y2="${yC - 14}" stroke="currentColor" stroke-width="1.4"/>`);
  out.push(lead(zx + 5, yC + 10, zx - 34, yC + 36, m.col('zafa')), m.t(zx - 36, yC + 46, 'zafa hidrostática', 'zafa', 'end'));
  out.push(lead(zx + 34, yC - 12, W - 30, yC + 36, m.col('union-debil')), m.t(W - 14, yC + 46, 'unión débil', 'union-debil', 'end'));
  out.push(lead(zx + 18, cy0 + 34, W - 40, cy0 + 4, m.col('boza')), m.t(W - 14, cy0, 'boza', 'boza', 'end'));
  out.push(notas(14, 222, ['La zafa suelta la trinca por la presión del agua,', 'antes de 4 m; no con las olas, ni al mojarse ni con', 'un golpe. La mayoría se cambia cada 2 años.', 'Trinca solo la que pasa por la zafa.'], 14.5));
  out.push('</svg>');
  const CAP = {
    contenedor: 'El contenedor es robusto y flota con la balsa dentro; es estanco en lo posible, pero lleva orificios de desagüe en el fondo.',
    zafa: 'La zafa hidrostática sujeta la balsa y la suelta sola por la presión del agua antes de 4 m de profundidad, no cuando pasan las olas. Se puede soltar a mano.',
    trinca: 'La balsa se trinca solo con la trinca que pasa por la zafa: con trincas de más, la zafa suelta pero la balsa se hunde atada al barco.',
    boza: 'La boza es el cabo que une la balsa al barco: al tensarse dispara la botella de inflado.',
    'union-debil': 'La unión débil es un eslabón de la boza que se rompe cuando la balsa ya está inflada, para que no se vaya al fondo con el barco.',
  };
  const caption = [...hl].map((k) => CAP[k]).filter(Boolean).join('\n') || 'La balsa va en un contenedor que flota, trincado con una sola trinca que pasa por la zafa hidrostática. La boza une la balsa al barco a través de la zafa y su unión débil.';
  return { svg: out.join(''), caption };
}

// ---------------------------------------------------------------------------
// Rescate con helicóptero. spec: { tipo:'helicoptero', vista:'rumbo'|'cable'|'senales' }

/** Helicóptero visto desde arriba, morro hacia arriba, centrado en (0, 0). */
const heliPlanta = (grua = false) =>
  `<circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3" opacity=".7"/>` +
  `<ellipse cx="0" cy="0" rx="9" ry="16" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1.2"/>` +
  `<rect x="-2" y="14" width="4" height="26" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1"/><line x1="-7" y1="38" x2="7" y2="38" stroke="currentColor" stroke-width="2"/>` +
  (grua ? `<rect x="9" y="-6" width="7" height="7" style="fill:${RED}" stroke="currentColor"/>` : '');

export function helicopteroIllustration(spec) {
  const vista = spec.vista ?? 'rumbo';
  const W = 320;
  if (vista === 'cable') {
    const H = 290;
    const out = open(W, H, 'Rescate con helicóptero: el cable de izado', 'hc');
    out.push(title(160, 'El cable de izado'));
    const yA = 190;
    out.push(mar(yA, W, H - 66));
    // helicóptero de costado
    out.push(`<g transform="translate(188 58)"><ellipse cx="0" cy="0" rx="34" ry="13" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1.2"/><rect x="30" y="-4" width="56" height="6" style="fill:var(--l-g)" stroke="currentColor"/><line x1="-50" y1="-20" x2="50" y2="-20" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-20" x2="0" y2="-13" stroke="currentColor" stroke-width="2"/><rect x="-26" y="-6" width="10" height="8" style="fill:var(--l-cielo)" stroke="currentColor"/></g>`);
    // barco
    out.push(`<path d="M30,${yA - 14} L140,${yA - 14} L130,${yA + 6} L38,${yA + 6}Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.3"/>`);
    // cable bajando hasta tocar el agua junto al barco
    const cxl = 168;
    out.push(`<line x1="${cxl}" y1="70" x2="${cxl}" y2="${yA + 2}" stroke="currentColor" stroke-width="1.6"/>`);
    out.push(`<path d="M${cxl},${yA + 2} q-5,0 -5,5 q0,5 5,5" fill="none" stroke="currentColor" stroke-width="2"/>`);
    out.push(`<path d="M${cxl + 6},${yA - 12} l6,4 l-4,2 l6,5" fill="none" stroke="${'#d97706'}" stroke-width="1.6"/>`);
    out.push(lead(cxl + 4, yA - 2, 198, 140), tx(202, 116, 'que toque el agua', { bold: true }), tx(202, 129, '(o el casco) antes', { bold: true }), tx(202, 142, 'de cogerlo: lleva', { bold: true }), tx(202, 155, 'electricidad estática', { bold: true }));
    // nunca firme a la cornamusa
    out.push(`<path d="M60,${yA - 14} Q96,${yA - 60} ${cxl},${yA - 70}" fill="none" stroke="${RED}" stroke-width="1.4" stroke-dasharray="4 3"/>`, `<rect x="54" y="${yA - 19}" width="12" height="5" rx="2" style="fill:currentColor"/>`);
    out.push(tache(98, yA - 50, 6), tx(30, 96, 'nunca lo hagas', { c: RED, bold: true }), tx(30, 109, 'firme al barco', { c: RED, bold: true }));
    out.push(notas(14, H - 46, ['Primero puede bajar una línea guía: cóbrala cuando te', 'lo indiquen. En el arnés de izado, brazos pegados al', 'cuerpo o cruzados: no los levantes.'], 14));
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Deja que el cable toque el agua o el casco antes de cogerlo con las manos, porque acumula electricidad estática, y nunca lo hagas firme al barco: un bandazo podría arrastrar al helicóptero.' };
  }
  if (vista === 'senales') {
    const H = 300;
    const out = open(W, H, 'Rescate con helicóptero: guiarlo y señalar', 'hn');
    out.push(title(160, 'Guiarlo: las horas del reloj'));
    const cx = 130;
    const cy = 128;
    const R = 72;
    out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="currentColor" stroke-width="1" opacity=".6"/>`);
    for (let h = 1; h <= 12; h++) {
      const [x, y] = pol(cx, cy, h * 30, R);
      const [x2, y2] = pol(cx, cy, h * 30, R - 6);
      out.push(`<line x1="${fx(x)}" y1="${fx(y)}" x2="${fx(x2)}" y2="${fx(y2)}" stroke="currentColor" stroke-width="1.2"/>`);
      if (h % 3 === 0) {
        const [lx, ly] = pol(cx, cy, h * 30, R + 12);
        out.push(tx(lx, ly + 4, String(h), { anchor: 'middle', bold: true, size: 12 }));
      }
    }
    out.push(`<g transform="translate(${cx} ${cy + 4})">${heliPlanta(false)}</g>`);
    out.push(tx(cx, cy - 36, 'su proa = las 12', { anchor: 'middle' }));
    // nuestro barco a sus 3
    out.push(`<g transform="translate(${cx + R + 30} ${cy})">${hullPlan(34, 13, HULL)}</g>`);
    out.push(tx(W - 12, cy + 34, '«Estamos', { anchor: 'end', bold: true, c: RED }), tx(W - 12, cy + 47, 'a sus 3»', { anchor: 'end', bold: true, c: RED }));
    out.push(notas(14, 240, ['Desde el punto de vista del helicóptero, no del barco.', 'Señala con humo de día, espejo, bengala de mano con', 'cuidado o VHF portátil.']));
    out.push(`<text x="14" y="${H - 8}" class="il-lbl" style="fill:${RED};font-weight:700;font-size:10.5px">× Nunca un cohete con paracaídas cerca de él.</text>`);
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Para guiarlo por radio se usan las horas del reloj desde el punto de vista del helicóptero: su proa son las 12, y «estamos a sus 3» es a su derecha. Con el helicóptero cerca, nunca un cohete con paracaídas.' };
  }
  // rumbo y preparación
  const H = 312;
  const out = open(W, H, 'Rescate con helicóptero: rumbo y preparación', 'hr');
  out.push(title(160, 'Preparar el barco para el izado'));
  out.push(`<rect x="10" y="34" width="${W - 20}" height="232" rx="8" ${MAR}/>`);
  const bx = 200;
  const by = 150;
  const proa = [bx, by - 48];
  out.push(`<g transform="translate(${bx} ${by})">${hullPlan(96, 32, HULL)}<circle cx="0" cy="-8" r="3.5" style="fill:currentColor"/></g>`);
  // viento por la amura de babor (~30°)
  const vA = pol(proa[0], proa[1], 330, 56);
  const vB = pol(proa[0], proa[1], 330, 8);
  out.push(arrow(vA[0], vA[1], vB[0], vB[1], 'v', 'hr', 2.6));
  out.push(`<line x1="${bx}" y1="${proa[1]}" x2="${bx}" y2="${proa[1] - 50}" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>`);
  const a1 = pol(proa[0], proa[1], 0, 34);
  const a2 = pol(proa[0], proa[1], 330, 34);
  out.push(`<path d="M${fx(a1[0])},${fx(a1[1])} A34,34 0 0 0 ${fx(a2[0])},${fx(a2[1])}" fill="none" stroke="#2563eb" stroke-width="1.4"/>`);
  out.push(tx(bx + 6, proa[1] - 30, '≈30°', { c: 'var(--l-v)', bold: true }));
  out.push(tx(20, 56, 'viento por la amura', { c: 'var(--l-v)', bold: true }), tx(20, 69, 'de babor', { c: 'var(--l-v)', bold: true }));
  out.push(tx(bx + 24, by + 6, 'velas arriadas,'), tx(bx + 24, by + 19, 'motor en marcha'));
  // helicóptero a popa, aproado al viento, con la grúa a su derecha
  const hx = 150;
  const hy = 226;
  out.push(`<g transform="translate(${hx} ${hy}) rotate(-30)">${heliPlanta(true)}</g>`);
  out.push(arrow(hx + 22, hy - 34, bx - 12, by + 56, 'g', 'hr', 1.6));
  out.push(tx(20, 206, 'se acerca', { bold: true }), tx(20, 219, 'por tu popa', { bold: true }));
  out.push(lead(hx + 14, hy - 4, 226, 238, RED), tx(230, 236, 'su grúa, a', { c: RED, bold: true }), tx(230, 249, 'su derecha', { c: RED, bold: true }));
  out.push(notas(14, 284, ['Canal 16, chalecos puestos y cubierta despejada.', 'Rumbo y velocidad constantes, sin mirar sus evoluciones.']));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'En un velero, velas arriadas y motor en marcha. Normalmente te pedirán llevar el viento unos 30° por la amura de babor, porque el helicóptero se acerca por tu popa con la grúa a su derecha. Mantén rumbo y velocidad.' };
}

// ---------------------------------------------------------------------------
// Chaleco y arnés. spec: { tipo:'arnes', vista:'chaleco'|'arnes', resaltar? }
// partes chaleco: 'luz'|'silbato'|'reflectante'|'flotabilidad'; partes arnés: 'linea-vida'|'amarre'|'pecho'

export function arnesIllustration(spec) {
  const vista = spec.vista ?? 'chaleco';
  const hl = hlSet(spec.resaltar);
  const m = marcador(hl);
  const W = 320;
  if (vista === 'arnes') {
    const H = 294;
    const out = open(W, H, 'Arnés y línea de vida', 'ar');
    out.push(title(160, 'Arnés y línea de vida'));
    const yC = 170; // cubierta
    out.push(mar(yC + 22, W, 214));
    // casco de perfil, proa a la derecha, con bañera a popa
    out.push(`<path d="M14,${yC} L70,${yC} L70,${yC + 10} L106,${yC + 10} L106,${yC} L306,${yC} L290,${yC + 34} L26,${yC + 34}Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.3"/>`);
    out.push(`<rect x="146" y="${yC - 14}" width="64" height="14" rx="4" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/>`);
    out.push(`<line x1="226" y1="${yC}" x2="226" y2="40" stroke="currentColor" stroke-width="2.4"/>`);
    out.push(tx(88, yC + 24, 'bañera', { anchor: 'middle' }));
    // línea de vida tensa de popa a proa
    const yL = yC - 4;
    out.push(`<line x1="24" y1="${yL}" x2="300" y2="${yL}" stroke="${m.on('linea-vida') ? RED : 'var(--l-v)'}" stroke-width="${m.on('linea-vida') ? 3.4 : 2.4}"/>`);
    out.push(`<circle cx="24" cy="${yL}" r="3" style="fill:currentColor"/><circle cx="300" cy="${yL}" r="3" style="fill:currentColor"/>`);
    // tripulante de pie en cubierta, hacia proa
    const x = 262;
    out.push(miembro([[x - 3, yC - 2], [x - 2, yC - 40]], 5), miembro([[x + 4, yC - 2], [x + 3, yC - 40]], 5));
    out.push(tronco([x, yC - 72], [x, yC - 44], 18));
    out.push(cabeza(x + 1, yC - 90, 10));
    out.push(miembro([[x + 4, yC - 66], [x + 18, yC - 54], [x + 22, yC - 66]], 4.5));
    // arnés: cinta de pecho y enganche en el pecho
    out.push(`<line x1="${x - 10}" y1="${yC - 64}" x2="${x + 10}" y2="${yC - 64}" stroke="${m.col('pecho')}" stroke-width="3"/>`, `<circle cx="${x - 9}" cy="${yC - 64}" r="3" style="fill:${m.on('pecho') ? RED : 'currentColor'}"/>`);
    // línea de amarre de cinta hasta la línea de vida
    out.push(`<path d="M${x - 9},${yC - 64} Q${x - 34},${yC - 30} ${x - 28},${yL}" fill="none" stroke="${m.on('amarre') ? RED : 'var(--l-a)'}" stroke-width="${m.on('amarre') ? 4.5 : 3.5}"/>`);
    out.push(`<path d="M${x - 32},${yL - 6} a5,6 0 1 0 8,0" fill="none" stroke="currentColor" stroke-width="1.8"/>`);
    out.push(lead(x - 12, yC - 66, 214, 88, m.col('pecho')), m.t(212, 84, 'enganche en el pecho', 'pecho', 'end'));
    out.push(lead(x - 30, yC - 30, 200, 128, m.col('amarre')), m.t(196, 112, 'línea de amarre de cinta,', 'amarre', 'end'), m.t(196, 125, '2 m como máximo, mosquetones', 'amarre', 'end'), m.t(196, 138, 'de seguridad', 'amarre', 'end'));
    out.push(m.t(24, yL - 8, 'línea de vida, tensa', 'linea-vida'));
    out.push(notas(14, 232, ['La línea de vida va de proa a popa: engánchate antes de', 'salir de la bañera. El arnés es para no caer al agua, no', 'para ir remolcado. Guárdalo seco, a la sombra y lejos', 'de combustible, pinturas y productos de limpieza.'], 14));
    out.push('</svg>');
    const CAP = {
      'linea-vida': 'La línea de vida se tiende tensa por cubierta, de proa a popa, y te enganchas a ella antes de salir de la bañera.',
      amarre: 'La línea de amarre va del arnés al barco: mejor de cinta que de cabo, con mosquetones de seguridad y 2 m como máximo (ISO 12401).',
      pecho: 'El arnés se engancha por el pecho: si caes, te arrastran boca arriba.',
    };
    const caption = [...hl].map((k) => CAP[k]).filter(Boolean).join('\n') || 'El arnés sirve para no caer al agua. Se engancha por el pecho con una línea de amarre de cinta de 2 m como máximo a la línea de vida, tensa de proa a popa, antes de salir de la bañera.';
    return { svg: out.join(''), caption };
  }
  // chaleco visto de frente
  const H = 290;
  const out = open(W, H, 'Chaleco salvavidas', 'ch');
  out.push(title(160, 'Lo que lleva un chaleco homologado'));
  const cx = 96;
  const flot = m.on('flotabilidad');
  const panel = (s) => `<path d="M${cx + s * 6},50 Q${cx + s * 26},44 ${cx + s * 32},62 L${cx + s * 46},86 L${cx + s * 50},176 Q${cx + s * 30},188 ${cx + s * 6},182 L${cx + s * 6},92 Q${cx + s * 4},70 ${cx + s * 6},50Z" style="fill:${CHAL}" stroke="${flot ? RED : 'currentColor'}" stroke-width="${flot ? 2.8 : 1.4}"/>`;
  out.push(`<path d="M${cx - 30},62 Q${cx},34 ${cx + 30},62 Q${cx},48 ${cx - 30},62Z" style="fill:${CHAL}" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(panel(-1), panel(1));
  // cinta y hebilla
  out.push(`<line x1="${cx - 48}" y1="150" x2="${cx + 48}" y2="150" stroke="currentColor" stroke-width="3.5" opacity=".75"/><rect x="${cx - 7}" y="144" width="14" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>`);
  // bandas retrorreflectantes
  const refl = m.on('reflectante');
  for (const s of [-1, 1]) out.push(`<rect x="${s < 0 ? cx - 44 : cx + 12}" y="112" width="32" height="9" style="fill:var(--l-nube)" stroke="${refl ? RED : 'currentColor'}" stroke-width="${refl ? 2.4 : 1}"/>`, `<rect x="${s < 0 ? cx - 30 : cx + 16}" y="56" width="12" height="7" transform="rotate(${s * 28} ${s < 0 ? cx - 24 : cx + 22} 60)" style="fill:var(--l-nube)" stroke="${refl ? RED : 'currentColor'}" stroke-width="${refl ? 2.4 : 1}"/>`);
  // luz en el hombro izquierdo (a la derecha del dibujo)
  const lx = cx + 34;
  const ly = 70;
  out.push(`<circle cx="${lx}" cy="${ly}" r="6" style="fill:var(--l-luz-blanca)" stroke="${m.col('luz')}" stroke-width="${m.w('luz', 1.4)}"/>`);
  for (const a of [20, 60, 100]) { const [x1, y1] = pol(lx, ly, a, 9); const [x2, y2] = pol(lx, ly, a, 14); out.push(`<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" stroke="#d97706" stroke-width="1.4"/>`); }
  // silbato colgado del pecho
  out.push(`<path d="M${cx + 20},96 Q${cx + 30},110 ${cx + 26},128" fill="none" stroke="currentColor" stroke-width="1"/><rect x="${cx + 20}" y="128" width="14" height="7" rx="3" style="fill:${m.on('silbato') ? RED : 'var(--l-g)'}" stroke="currentColor" stroke-width="1"/>`);
  out.push(lead(lx + 8, ly - 2, 190, 56, m.col('luz')), m.t(194, 52, 'luz blanca', 'luz'), tx(194, 65, '(no roja)'));
  out.push(lead(cx + 35, 131, 190, 96, m.col('silbato')), m.t(194, 98, 'silbato', 'silbato'));
  out.push(lead(cx + 44, 117, 190, 128, m.col('reflectante')), m.t(194, 126, 'bandas', 'reflectante'), m.t(194, 139, 'retrorreflectantes', 'reflectante'));
  out.push(lead(cx + 48, 168, 190, 166, m.col('flotabilidad')), m.t(194, 164, 'flotabilidad: da la', 'flotabilidad'), m.t(194, 177, 'vuelta al inconsciente', 'flotabilidad'), m.t(194, 190, 'y lo deja boca arriba', 'flotabilidad'));
  out.push(notas(14, 214, ['Puesto sin ayuda en 1 minuto, encima de la ropa.', '275 N en zona 1 · 150 N en 2, 3 y 4 · 100 N en 5, 6 y 7.', 'Uno por persona (+1 en zona 1) y uno por niño, a su', 'peso y talla. La radiobaliza personal no es obligatoria.'], 14.5));
  out.push('</svg>');
  const CAP = {
    luz: 'Cada chaleco lleva su luz, y es blanca: la que más se ve de noche y no se confunde con la pirotecnia roja. En zonas 4 a 7, si solo navegas de día, puedes prescindir de ella.',
    silbato: 'El chaleco homologado lleva silbato.',
    reflectante: 'Lleva bandas retrorreflectantes, que devuelven la luz de un foco hacia quien te busca.',
    flotabilidad: 'Debe dar la vuelta a una persona inconsciente y dejarla boca arriba con la boca fuera del agua; lo hace mejor cuanto mayor es su flotabilidad.',
  };
  const caption = [...hl].map((k) => CAP[k]).filter(Boolean).join('\n') || 'Un chaleco homologado lleva luz blanca, silbato y bandas retrorreflectantes, se pone sin ayuda en 1 minuto encima de la ropa y da la vuelta a una persona inconsciente para dejarla boca arriba.';
  return { svg: out.join(''), caption };
}

// ---------------------------------------------------------------------------

export const LAMINAS = {
  hipotermia: { fn: hipotermiaIllustration, params: { postura: ['saltar', 'help', 'grupo'] }, ejemplo: { tipo: 'hipotermia', postura: 'help' } },
  balsa: { fn: balsaIllustration, params: { vista: ['zafa', 'inflado', 'adrizar', 'lanzar'], resaltar: ['contenedor', 'zafa', 'trinca', 'boza', 'union-debil'] }, ejemplo: { tipo: 'balsa', vista: 'zafa' } },
  helicoptero: { fn: helicopteroIllustration, params: { vista: ['rumbo', 'cable', 'senales'] }, ejemplo: { tipo: 'helicoptero', vista: 'rumbo' } },
  arnes: { fn: arnesIllustration, params: { vista: ['chaleco', 'arnes'], resaltar: ['luz', 'silbato', 'reflectante', 'flotabilidad', 'linea-vida', 'amarre', 'pecho'] }, ejemplo: { tipo: 'arnes', vista: 'chaleco' } },
};
