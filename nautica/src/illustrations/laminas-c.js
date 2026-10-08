// Láminas fijas rehechas en estilo C (docs/ESTILO-LAMINAS.md): partes del barco, borrasca y anticiclón, efecto de la
// hélice y hombre al agua. Mismas specs y variantes que antes; solo cambia el dibujo. Sin DOM.
//   barco:          { tipo:'barco', resaltar?:[partes], solo?:[partes] }
//   meteo:          { tipo:'meteo', sistema:'borrasca'|'anticiclon' }   (el resto de sistemas sigue en misc.js)
//   helice:         { tipo:'helice', sentido:'dextrogira'|'levogira', marcha:'avante'|'atras' }
//   hombre-al-agua: { tipo:'hombre-al-agua', maniobra:'boutakow'|'anderson' }

import { T, TXT, lienzo, rotulo, cartela, etiqueta, cota, cotaArco, referencia, flecha, ondas, rosaNorte, paso, barco, barquito, arcoD, pol, f1 } from './estilo-c.js';
import { caidaPopa } from '../nautical/helice.js';

// ---------------------------------------------------------------------------
// Partes del barco: planta (proa a la derecha) y sección, con las cotas de eslora, manga, puntal, francobordo y calado.

const NOMBRE_PARTE = { crujia: 'crujía', 'obra-viva': 'obra viva', 'obra-muerta': 'obra muerta', 'linea-flotacion': 'línea de flotación', traves: 'través' };

export function boatIllustration(spec) {
  const hl = new Set(spec.resaltar ?? []);
  // `solo`: dibuja solo esas partes (para no enseñar nombres que la clase aún no ha explicado).
  const solo = spec.solo ? new Set(spec.solo) : null;
  const ver = (...ks) => !solo || ks.some((k) => solo.has(k));
  const SECCION = ['linea-flotacion', 'obra-muerta', 'obra-viva', 'puntal', 'calado', 'francobordo'];
  const conSeccion = ver(...SECCION);
  const W = 358;
  const H = conSeccion ? 336 : 200;
  // resaltado: magenta y en negrita; lo demás, en tinta (o apagado si hay algo resaltado)
  const col = (k) => (hl.size === 0 ? T.tinta : hl.has(k) ? T.magenta : T.apagado);
  const peso = (k) => (hl.has(k) ? 700 : 400);
  const nombre = (k, x, y, t, anchor = 'middle', extra = {}) => (ver(k) ? rotulo(x, y, t, { size: TXT.nota, estilo: 'serif', italic: !hl.has(k), weight: peso(k), color: col(k), anchor, p: k, ...extra }) : '');
  const alt = `Partes del barco. En planta, con la proa a la derecha: ${['proa', 'popa', 'crujia', 'babor', 'estribor', 'amura', 'traves', 'aleta', 'eslora', 'manga'].filter((k) => ver(k)).map((k) => NOMBRE_PARTE[k] ?? k).join(', ')}.` +
    (conSeccion ? ` En sección: ${SECCION.filter((k) => ver(k)).map((k) => NOMBRE_PARTE[k] ?? k).join(', ')}.` : '') + (hl.size ? ` Resaltado: ${[...hl].map((k) => NOMBRE_PARTE[k] ?? k.replace(/-/g, ' ')).join(', ')}.` : '');
  const { out, id, ray, cierra } = lienzo(W, H, alt);
  // --- planta
  out.push(rotulo(16, 26, 'PLANTA', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.apagado }));
  const casco = 'M52,84 L246,84 C300,86 322,100 332,110 C322,120 300,134 246,136 L52,136 Z';
  out.push(`<path d="${casco}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>`);
  if (ver('crujia')) out.push(`<line data-parte="crujia" x1="38" y1="110" x2="344" y2="110" stroke="${col('crujia')}" stroke-width="${hl.has('crujia') ? 1.6 : 1}" stroke-dasharray="7 4"/>`, nombre('crujia', 150, 105, 'crujía'));
  out.push(nombre('proa', 318, 76, 'proa'), nombre('popa', 46, 114, 'popa', 'end'));
  if (ver('babor')) out.push(rotulo(150, 72, 'BABOR', { size: TXT.rotulo, weight: 700, estilo: 'cap', color: hl.size && !hl.has('babor') ? T.apagado : T.rojoTxt, p: 'babor' }));
  if (ver('estribor')) out.push(rotulo(150, 156, 'ESTRIBOR', { size: TXT.rotulo, weight: 700, estilo: 'cap', color: hl.size && !hl.has('estribor') ? T.apagado : T.verdeTxt, p: 'estribor' }));
  out.push(nombre('amura', 268, 72, 'amura'), nombre('aleta', 76, 72, 'aleta'));
  if (ver('traves')) out.push(referencia(214, 136, 214, 160, { color: col('traves') }), nombre('traves', 220, 158, 'través', 'start'));
  if (ver('eslora')) out.push(cota(52, 180, 332, 180, 'eslora', { color: col('eslora'), p: 'eslora' }));
  if (ver('manga')) out.push(cota(236, 84, 236, 136, 'manga', { color: col('manga'), p: 'manga', desplaza: [0, 0] }));
  if (conSeccion) {
    // --- sección (corte por la mitad de la eslora)
    out.push(`<line x1="12" y1="200" x2="${W - 12}" y2="200" stroke="${T.tinta}" stroke-width=".6"/>`);
    out.push(rotulo(16, 222, 'SECCIÓN', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.apagado }));
    const yF = 266; // flotación
    out.push(`<rect x="44" y="${yF}" width="270" height="56" fill="${T.agua}"/>`, ondas(52, 306, yF + 40, { sep: 8 }));
    const sec = 'M120,226 L238,226 L232,272 C228,294 206,304 179,306 C152,304 130,294 126,272 Z';
    out.push(`<clipPath id="${id}-cv"><rect x="0" y="${yF}" width="${W}" height="80"/></clipPath>`);
    out.push(`<path d="${sec}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>`);
    if (ver('obra-viva')) out.push(`<path data-parte="obra-viva" d="${sec}" fill="${ray}" opacity="${hl.has('obra-viva') ? 0.9 : 0.5}" clip-path="url(#${id}-cv)"/>`);
    if (ver('linea-flotacion')) out.push(`<line data-parte="linea-flotacion" x1="86" y1="${yF}" x2="274" y2="${yF}" stroke="${col('linea-flotacion')}" stroke-width="1.6"/>`, nombre('linea-flotacion', 82, yF + 4, 'flotación', 'end'));
    out.push(nombre('obra-muerta', 179, 250, 'obra muerta'), nombre('obra-viva', 179, 290, 'obra viva', 'middle', { color: hl.size && !hl.has('obra-viva') ? T.apagado : T.tinta }));
    if (ver('puntal')) out.push(cota(104, 226, 104, 306, 'puntal', { color: col('puntal'), p: 'puntal', desplaza: [-34, -24] }));
    if (ver('francobordo')) out.push(cota(258, 226, 258, yF, 'francobordo', { color: col('francobordo'), p: 'francobordo', desplaza: [46, 0] }));
    if (ver('calado')) out.push(cota(258, yF, 258, 306, 'calado', { color: col('calado'), p: 'calado', desplaza: [34, 0] }));
  }
  out.push(cierra());
  return { svg: out.join(''), caption: hl.size ? `Fíjate en: ${[...hl].map((x) => NOMBRE_PARTE[x] ?? x.replace(/-/g, ' ')).join(', ')}.` : 'Partes principales del barco.' };
}

// ---------------------------------------------------------------------------
// Borrasca y anticiclón en el hemisferio norte

export function borrascaAnticiclon(B) {
  const W = 358;
  const H = 334;
  const cx = 179;
  const cy = 172;
  const alt = B
    ? 'Borrasca en el hemisferio norte: isobaras cerradas de 996, 1000 y 1004 hPa alrededor de una B de baja presión; el viento gira en sentido antihorario y cruza las isobaras hacia el centro.'
    : 'Anticiclón en el hemisferio norte: isobaras cerradas de 1032, 1028 y 1024 hPa alrededor de una A de alta presión; el viento gira en sentido horario y cruza las isobaras hacia fuera.';
  const { out, cierra } = lienzo(W, H, alt);
  const isobara = (r, i) => {
    const rx = r * 1.32;
    const p = B ? 996 + i * 4 : 1032 - i * 4;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${f1(rx)}" ry="${r}" fill="none" stroke="${T.tinta}" stroke-width="1.2" transform="rotate(-8 ${cx} ${cy})"/>` + etiqueta(cx + rx * 0.99, cy - rx * 0.14, String(p));
  };
  [38, 72, 104].forEach((r, i) => out.push(isobara(r, i)));
  out.push(rotulo(cx, cy + 12, B ? 'B' : 'A', { size: 40, weight: 700, estilo: 'serif', color: B ? T.rojoTxt : T.azulTxt }));
  out.push(rotulo(cx, cy + 30, B ? 'BAJA' : 'ALTA', { size: TXT.min, weight: 700, estilo: 'cap', color: B ? T.rojoTxt : T.azulTxt }));
  // flechas de viento: en la borrasca giran en sentido antihorario y convergen; en el anticiclón, horario y divergen
  const flechas = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 + Math.PI / 8;
    const x = cx + Math.cos(a) * 88 * 1.32;
    const y = cy + Math.sin(a) * 88;
    const tang = B ? a - Math.PI / 2 : a + Math.PI / 2; // dirección del giro (y hacia abajo)
    const radial = B ? -0.4 : 0.4;
    const dx = Math.cos(tang) + Math.cos(a) * radial;
    const dy = Math.sin(tang) + Math.sin(a) * radial;
    const n = Math.hypot(dx, dy);
    flechas.push(flecha(x - (dx / n) * 14, y - (dy / n) * 14, x + (dx / n) * 14, y + (dy / n) * 14, { color: T.magenta, w: 2 }));
  }
  out.push(`<g data-parte="viento">${flechas.join('')}<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="${B ? -360 : 360} ${cx} ${cy}" dur="24s" repeatCount="indefinite"/></g>`);
  out.push(cartela(84, 28, 'HEMISFERIO NORTE', null, { ancho: 140 }), rosaNorte(W - 34, 34));
  out.push(cartela(cx, H - 32, B ? 'GIRO ANTIHORARIO' : 'GIRO HORARIO', B ? 'el viento converge hacia el centro' : 'el viento diverge hacia fuera', { ancho: 236 }));
  out.push(cierra());
  return {
    svg: out.join(''),
    caption: B ? 'En el hemisferio norte el viento gira alrededor de la borrasca en sentido contrario a las agujas del reloj, entrando hacia el centro.' : 'En el hemisferio norte el viento gira alrededor del anticiclón en el sentido de las agujas del reloj, saliendo hacia fuera.',
  };
}

// ---------------------------------------------------------------------------
// Efecto de la hélice (sin timón): la hélice vista desde popa y hacia dónde cae la popa

export function propellerIllustration(spec) {
  const dex = spec.sentido !== 'levogira';
  const atras = spec.marcha === 'atras';
  const marcha = atras ? 'atras' : 'avante';
  // giro visto desde popa: dextrógira avante = horario. Dando atrás invierte.
  const cw = dex !== atras;
  const { popa: caida } = caidaPopa({ marcha, sentido: dex ? 'dextrogira' : 'levogira', timon: 'via' });
  const W = 358;
  const H = 268;
  const alt = `Hélice ${dex ? 'dextrógira' : 'levógira'} dando ${atras ? 'atrás' : 'avante'}: vista desde popa gira ${cw ? 'a la derecha (sentido horario)' : 'a la izquierda (sentido antihorario)'} y la popa del barco cae a ${caida}.`;
  const { out, cierra } = lienzo(W, H, alt);
  // --- la hélice, vista desde popa
  const [hx, hy] = [96, 128];
  out.push(rotulo(hx, 34, 'VISTA DESDE POPA', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado }));
  out.push(`<circle cx="${hx}" cy="${hy}" r="54" fill="${T.agua}" stroke="${T.tinta}" stroke-width="1"/>`);
  const pala = (g) => `<path d="M0,0 C-10,-18 -8,-40 0,-46 C10,-40 12,-18 0,0Z" transform="rotate(${g})" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1.3" stroke-linejoin="round"/>`;
  out.push(`<g data-parte="helice" transform="translate(${hx} ${hy})"><g>${pala(0)}${pala(120)}${pala(240)}<circle r="7" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.3"/>` +
    `<animateTransform attributeName="transform" type="rotate" from="0" to="${cw ? 360 : -360}" dur="1.6s" repeatCount="indefinite"/></g></g>`);
  // flecha curva del sentido de giro (no depende de la animación)
  const [a0, a1] = cw ? [300, 60] : [60, 300];
  const d = cw ? arcoD(hx, hy, 66, a0, a1) : arcoD(hx, hy, 66, a1, a0);
  const fin = a1;
  const [ex, ey] = pol(hx, hy, fin, 66);
  const tg = fin + (cw ? 90 : -90);
  const [px, py] = pol(ex, ey, tg, 9);
  const [qx, qy] = pol(ex, ey, tg + 150, 7);
  const [rx, ry] = pol(ex, ey, tg - 150, 7);
  out.push(`<path d="${d}" fill="none" stroke="${T.magenta}" stroke-width="1.6"/><polygon points="${f1(px)},${f1(py)} ${f1(qx)},${f1(qy)} ${f1(rx)},${f1(ry)}" fill="${T.magenta}"/>`);
  out.push(rotulo(hx, 222, cw ? 'gira a la derecha' : 'gira a la izquierda', { size: TXT.nota, estilo: 'serif', italic: true }), rotulo(hx, 238, cw ? '(sentido horario)' : '(sentido antihorario)', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  // --- el barco en planta y la caída de la popa
  const bx = 262;
  const dir = caida === 'babor' ? -1 : 1;
  out.push(rotulo(bx, 34, 'PROA', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado }));
  out.push(`<g><g>${barco(bx, 116, 0, 136, { p: 'barco' })}</g><animateTransform attributeName="transform" type="rotate" values="0 ${bx} 116; ${-dir * 12} ${bx} 116; 0 ${bx} 116" dur="3s" repeatCount="indefinite"/></g>`);
  out.push(flecha(bx + dir * 18, 176, bx + dir * 66, 176, { color: T.magenta, w: 2.4, p: 'popa' }));
  out.push(cartela(bx, 226, 'LA POPA CAE', `a ${caida}`, { color: T.magenta, ancho: 132 }));
  out.push(cierra());
  return { svg: out.join(''), caption: `Con hélice ${dex ? 'dextrógira' : 'levógira'}, dando ${atras ? 'atrás' : 'avante'} la popa tiende a caer a ${caida}${atras ? ' (efecto muy marcado al dar atrás)' : ''}.` };
}

// ---------------------------------------------------------------------------
// Hombre al agua: curva de Boutakow (Williamson) y maniobra de Anderson, en planta.
// Las derrotas se construyen con arcos de radio R (giro con todo el timón) y tramos rectos: la de Boutakow acaba
// exactamente sobre la estela inicial y al rumbo opuesto; la de Anderson, tras 250° de caída, apunta al náufrago.

function leyenda(items, x, y0, dy = 50) {
  return items.map(([n, l1, l2], i) => {
    const y = y0 + i * dy;
    return paso(x, y, n) + rotulo(x + 16, y - 2, l1, { size: TXT.rotulo, estilo: 'serif', anchor: 'start' }) + rotulo(x + 16, y + 14, l2, { size: TXT.rotulo, estilo: 'serif', anchor: 'start' });
  }).join('');
}

export function hombreAlAguaIllustration(spec) {
  const bout = (spec.maniobra ?? 'boutakow') === 'boutakow';
  const W = 358;
  const H = 360;
  const alt = bout
    ? 'Curva de Boutakow vista desde arriba: el barco cae con todo el timón a la banda de la caída; separado 60° del rumbo inicial, mete todo a la otra banda y gira hasta el rumbo opuesto, que le devuelve por su estela hasta el náufrago.'
    : 'Maniobra de Anderson vista desde arriba: el barco mete todo el timón a la banda del náufrago, cae unos 250° en una sola vuelta y se dirige hacia él.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(ondas(10, W - 10, 334, { sep: 9 }), rosaNorte(W - 30, 34));
  const X = 110;
  let d;
  let mob;
  if (bout) {
    const R = 44;
    // A = (X, 230): todo a estribor 60° (arco), tramo recto, todo a babor 240° (arco) hasta el rumbo opuesto, sobre la estela
    const A = [X, 230];
    const P1 = [A[0] + 0.5 * R, A[1] - 0.866 * R];
    const P2 = [P1[0] + 1.155 * R * 0.866, P1[1] - 1.155 * R * 0.5];
    const P3 = [A[0], P2[1] - 0.866 * R];
    d = `M${X},334 L${X},${A[1]} A${R},${R} 0 0 1 ${f1(P1[0])},${f1(P1[1])} L${f1(P2[0])},${f1(P2[1])} A${R},${R} 0 1 0 ${f1(P3[0])},${f1(P3[1])} L${X},242`;
    mob = [X, 250];
    out.push(`<line x1="${f1(P1[0])}" y1="${f1(P1[1])}" x2="${f1(P1[0])}" y2="${f1(P1[1] - 40)}" stroke="${T.tinta}" stroke-width=".7" stroke-dasharray="4 3"/>`);
    out.push(cotaArco(P1[0], P1[1], 30, 0, 60, '60°', { color: T.magenta, rEt: 46, p: 'angulo' }));
    out.push(paso(A[0] - 18, A[1], 1), paso(P1[0] + 16, P1[1] + 14, 2), paso(P3[0] - 18, P3[1] + 6, 3));
    out.push(leyenda([[1, 'todo el timón', 'a su banda'], [2, 'a 60°: todo', 'a la otra banda'], [3, 'rumbo opuesto:', 'por tu estela']], 226, 112));
  } else {
    const R = 50;
    const A = [X, 190];
    const C = [A[0] + R, A[1]];
    const E = [A[0] + 1.342 * R, A[1] + 0.94 * R];
    mob = [X, A[1] + 1.428 * R];
    d = `M${X},334 L${X},${A[1]} A${R},${R} 0 1 1 ${f1(E[0])},${f1(E[1])} L${f1(mob[0] + 8)},${f1(mob[1] - 3)}`;
    out.push(cotaArco(C[0], C[1], 24, 270, 160, '≈ 250°', { color: T.magenta, rEt: 0, p: 'angulo' }));
    out.push(paso(A[0] - 18, A[1], 1), paso(E[0] + 14, E[1] + 12, 2));
    out.push(leyenda([[1, 'todo el timón a', 'la banda de la caída'], [2, 'a unos 250°: a la', 'vía, hacia él']], 226, 132, 56));
  }
  out.push(`<path data-parte="derrota" d="${d}" fill="none" stroke="${T.tinta}" stroke-width="1.6" stroke-dasharray="7 4"/>`);
  out.push(`<g data-parte="barco">${barquito(1.2)}<animateMotion dur="10s" repeatCount="indefinite" rotate="auto" path="${d}"/></g>`);
  // el náufrago
  out.push(`<g data-parte="naufrago"><circle cx="${mob[0]}" cy="${mob[1]}" r="10" fill="none" stroke="${T.magenta}" stroke-width="1.4"/><circle cx="${mob[0]}" cy="${mob[1]}" r="5" fill="${T.magenta}"/>` +
    `${rotulo(mob[0] - 16, mob[1] + 5, 'náufrago', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'end', color: T.magenta, weight: 700 })}</g>`);
  out.push(rotulo(X - 16, 324, 'rumbo inicial', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end', color: T.apagado }));
  out.push(cierra());
  return {
    svg: out.join(''),
    caption: bout
      ? 'Todo el timón a la banda por la que cayó (la popa se aparta de él). Al separarte unos 60° del rumbo inicial, todo el timón a la banda contraria hasta quedar al rumbo opuesto: vuelves sobre tu estela.'
      : 'Todo el timón a la banda del náufrago y se completa una vuelta de unos 250° hasta aproximarse a él. Es rápida y útil cuando se ha visto caer a la persona.',
  };
}
