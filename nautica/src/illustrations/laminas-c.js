// Láminas fijas rehechas en estilo C (docs/ESTILO-LAMINAS.md): partes del barco. Mismas specs y variantes que antes; solo cambia el dibujo. Sin DOM.
//   barco:          { tipo:'barco', resaltar?:[partes], solo?:[partes] }

import { T, TXT, lienzo, rotulo, cota, referencia, ondas, barco } from './estilo-c.js';

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

// Borrasca y anticiclón: ahora son animadas, en src/illustrations/animaciones/circulacion.js.

// Efecto de la hélice (sin timón): ahora es animada, en src/illustrations/animaciones/helice.js.
// Hombre al agua (Boutakow, Anderson y Scharnow): ahora es animada, en src/illustrations/animaciones/hombre-al-agua.js.
