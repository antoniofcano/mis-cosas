// Láminas fijas de meteorología y mareas del PY rehechas en estilo C (docs/ESTILO-LAMINAS.md). Mismas specs que antes;
// solo cambia el dibujo. Sin DOM.
//   meteo: { tipo:'meteo', sistema:'buys-ballot'|'brisa-mar'|'brisa-tierra'|'frente-frio-corte'|'frente-calido-corte' }
//   marea: { tipo:'marea', modo:'fases' }   (vivas y muertas; curva, duodécimos y sonda son interactivas)
// Hemisferio norte. Aire frío en azul y cálido en rojo, siempre con su rótulo (nada solo por color).

import { T, TXT, lienzo, rotulo, etiqueta, cartela, flecha, ondas, tierra, arcoD, pol, f1 } from './estilo-c.js';

/** Nube de carta: festón de papel con su contorno. (x, y) es el centro de la base; s, la escala. */
function nube(x, y, s = 1, { torre = false } = {}) {
  const w = 30 * s;
  const d = torre
    ? `M${f1(x - w)},${f1(y)} C${f1(x - w - 6 * s)},${f1(y - 14 * s)} ${f1(x - w + 4 * s)},${f1(y - 24 * s)} ${f1(x - w * 0.55)},${f1(y - 26 * s)} C${f1(x - w * 0.7)},${f1(y - 50 * s)} ${f1(x - w * 0.2)},${f1(y - 66 * s)} ${f1(x)},${f1(y - 60 * s)} C${f1(x + w * 0.3)},${f1(y - 74 * s)} ${f1(x + w * 0.8)},${f1(y - 58 * s)} ${f1(x + w * 0.6)},${f1(y - 36 * s)} C${f1(x + w + 8 * s)},${f1(y - 34 * s)} ${f1(x + w + 8 * s)},${f1(y - 8 * s)} ${f1(x + w)},${f1(y)} Z`
    : `M${f1(x - w)},${f1(y)} C${f1(x - w - 6 * s)},${f1(y - 12 * s)} ${f1(x - w + 6 * s)},${f1(y - 20 * s)} ${f1(x - w * 0.45)},${f1(y - 16 * s)} C${f1(x - w * 0.4)},${f1(y - 28 * s)} ${f1(x + w * 0.2)},${f1(y - 30 * s)} ${f1(x + w * 0.25)},${f1(y - 18 * s)} C${f1(x + w * 0.6)},${f1(y - 26 * s)} ${f1(x + w + 6 * s)},${f1(y - 14 * s)} ${f1(x + w)},${f1(y)} Z`;
  return `<path d="${d}" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.1" stroke-linejoin="round"/>`;
}

/** Trazos de lluvia (inclinados) bajo una nube. */
const lluvia = (x0, x1, y0, y1, paso = 9) => {
  const o = [];
  for (let x = x0; x <= x1; x += paso) o.push(`M${f1(x)},${f1(y0)} l-4,${f1(y1 - y0)}`);
  return `<path d="${o.join('')}" stroke="${T.azulTxt}" stroke-width="1" fill="none"/>`;
};

/** Símbolo de frente en el mapa a lo largo de una línea horizontal: triángulos (frío) o semicírculos (cálido) hacia +x/−y. */
function simboloFrente(x0, x1, y, frio) {
  const o = [`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${frio ? T.azulTxt : T.rojoTxt}" stroke-width="2.2"/>`];
  for (let x = x0 + 10; x < x1 - 8; x += 26) {
    o.push(frio ? `<path d="M${x},${y} l8,0 l-4,-9 z" fill="${T.azulTxt}"/>` : `<path d="M${x},${y} a5,5 0 0 1 10,0 z" fill="${T.rojoTxt}"/>`);
  }
  return o.join('');
}

// ---------------------------------------------------------------------------
// Ley de Buys-Ballot (hemisferio norte): con el viento por la espalda, la borrasca queda a la izquierda, algo
// adelantada, y el anticiclón a la derecha, algo atrasado. El viento cruza las isobaras hacia la baja (unos 20° en la mar).

export function buysBallot() {
  const W = 358;
  const H = 330;
  const alt = 'Ley de Buys-Ballot en el hemisferio norte: el observador tiene el viento por la espalda; la borrasca (B, isobaras de 996 a 1004 hPa) le queda a la izquierda y algo adelantada, y el anticiclón (A) a la derecha y algo atrasado. El viento cruza las isobaras hacia la baja.';
  const { out, id, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const O = [206, 192];
  const B = pol(O[0], O[1], -70, 132);
  const A = pol(O[0], O[1], 110, 116);
  out.push(`<clipPath id="${id}-c"><rect x="6" y="6" width="${W - 12}" height="${H - 12}"/></clipPath><g clip-path="url(#${id}-c)">`);
  // isobaras: la exterior de la borrasca pasa por el observador
  [44, 88, 132].forEach((r) => out.push(`<circle cx="${f1(B[0])}" cy="${f1(B[1])}" r="${r}" fill="none" stroke="${T.tinta}" stroke-width="1.1"/>`));
  [40, 80].forEach((r) => out.push(`<circle cx="${f1(A[0])}" cy="${f1(A[1])}" r="${r}" fill="none" stroke="${T.tinta}" stroke-width="1.1"/>`));
  out.push('</g>');
  out.push(etiqueta(...pol(B[0], B[1], 160, 44), '996', { size: TXT.min }), etiqueta(...pol(B[0], B[1], 160, 88), '1000', { size: TXT.min }), etiqueta(...pol(B[0], B[1], 42, 132), '1004', { size: TXT.min }));
  out.push(etiqueta(...pol(A[0], A[1], -30, 40), '1024', { size: TXT.min }), etiqueta(...pol(A[0], A[1], -18, 80), '1020', { size: TXT.min }));
  out.push(rotulo(B[0], B[1] + 14, 'B', { size: 40, weight: 700, estilo: 'serif', color: T.rojoTxt }), rotulo(A[0], A[1] + 14, 'A', { size: 40, weight: 700, estilo: 'serif', color: T.azulTxt }));
  // el observador, de espaldas al viento: mira hacia donde va el viento (arriba)
  out.push(`<line x1="${O[0]}" y1="${O[1]}" x2="${f1(B[0])}" y2="${f1(B[1])}" stroke="${T.rojoTxt}" stroke-width="1.2" stroke-dasharray="5 4"/>`);
  out.push(`<line x1="${O[0]}" y1="${O[1]}" x2="${O[0]}" y2="${O[1] - 110}" stroke="${T.tinta}" stroke-width=".8" stroke-dasharray="4 3"/>`);
  out.push(rotulo(O[0] + 6, O[1] - 98, 'hacia donde miras', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start' }));
  out.push(`<path d="${arcoD(O[0], O[1], 54, -70, 0)}" fill="none" stroke="${T.rojoTxt}" stroke-width="1.4"/>`);
  out.push(flecha(O[0], O[1] + 92, O[0], O[1] + 20, { color: T.magenta, w: 2.4 }));
  out.push(`<circle cx="${O[0]}" cy="${O[1]}" r="13" fill="${T.magenta}" stroke="${T.papel}" stroke-width="2"/>`, rotulo(O[0], O[1] + 4.5, 'tú', { size: TXT.rotulo, weight: 700, estilo: 'serif', color: T.papel }));
  out.push(rotulo(O[0] + 10, O[1] + 66, 'viento por', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start', color: T.magenta, weight: 700 }), rotulo(O[0] + 10, O[1] + 81, 'la espalda', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start', color: T.magenta, weight: 700 }));
  out.push(cartela(96, 288, 'LA BORRASCA', 'a la izquierda, adelantada', { color: T.rojoTxt, ancho: 160 }));
  out.push(rotulo(W - 16, 26, 'HEMISFERIO NORTE', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'end', color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Con el viento de espaldas, en el hemisferio norte la baja presión queda a tu izquierda (algo adelantada) y la alta a tu derecha.' };
}

// ---------------------------------------------------------------------------
// Brisa marina (de día) y terral (de noche): circulación cerrada entre la mar y la tierra.

export function brisa(mar) {
  const W = 358;
  const H = 272;
  const alt = mar
    ? 'Brisa marina (virazón), de día: la tierra se calienta más que el mar, el aire sobre ella asciende y en superficie entra el aire del mar hacia tierra; arriba vuelve hacia el mar y desciende sobre él.'
    : 'Terral, de noche: la tierra se enfría más que el mar, el aire sobre ella desciende y en superficie sale hacia el mar; sobre el mar asciende y arriba vuelve hacia tierra.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: mar ? T.papel : T.agua2 });
  // mar a la izquierda, tierra a la derecha
  out.push(`<rect x="0" y="196" width="180" height="${H - 196}" fill="${T.agua}"/>`, ondas(12, 170, 222, { sep: 10 }));
  out.push(tierra(`M180,${H} L180,192 C220,186 250,180 300,178 C320,176 340,172 ${W},170 L${W},${H} Z`, pt));
  out.push(rotulo(90, 254, 'MAR', { size: TXT.min, weight: 700, estilo: 'cap', color: T.tinta }), rotulo(270, 236, 'TIERRA', { size: TXT.min, weight: 700, estilo: 'cap', color: T.tinta }));
  // sol o luna
  if (mar) out.push(`<circle cx="306" cy="52" r="16" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1"/>`, rotulo(306, 84, 'de día', { size: TXT.min, estilo: 'serif', italic: true }));
  else out.push(`<path d="M58,36 a16,16 0 1 0 14,26 a12,12 0 1 1 -14,-26 z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>`, rotulo(58, 84, 'de noche', { size: TXT.min, estilo: 'serif', italic: true }));
  // la circulación: en superficie (magenta, la brisa que se nota), subida, retorno arriba y bajada
  const [xm, xt] = [74, 262];
  const loop = mar ? `M${xm},160 L${xt},160 L${xt},92 L${xm},92 Z` : `M${xt},150 L${xm},150 L${xm},92 L${xt},92 Z`;
  out.push(`<path d="${loop}" fill="none" stroke="${T.apagado}" stroke-width="1.2" stroke-dasharray="8 6"><animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.2s" repeatCount="indefinite"/></path>`);
  if (mar) {
    out.push(flecha(xm + 18, 160, xt - 18, 160, { color: T.magenta, w: 2.4 }), flecha(xt, 146, xt, 108, { color: T.rojoTxt, w: 1.8 }), flecha(xt - 20, 92, xm + 20, 92, { color: T.apagado, w: 1.4 }), flecha(xm, 106, xm, 144, { color: T.azulTxt, w: 1.8 }));
  } else {
    out.push(flecha(xt - 18, 150, xm + 18, 150, { color: T.magenta, w: 2.4 }), flecha(xm, 136, xm, 106, { color: T.rojoTxt, w: 1.8 }), flecha(xm + 20, 92, xt - 20, 92, { color: T.apagado, w: 1.4 }), flecha(xt, 106, xt, 136, { color: T.azulTxt, w: 1.8 }));
  }
  out.push(etiqueta(mar ? xt + 4 : xm + 4, 126, 'asciende', { color: T.rojoTxt }), etiqueta(mar ? xm + 4 : xt + 4, 126, 'desciende', { color: T.azulTxt }));
  out.push(rotulo(168, 84, 'retorno en altura', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  out.push(cartela(168, 36, mar ? 'VIRAZÓN' : 'TERRAL', mar ? 'del mar hacia tierra' : 'de tierra hacia el mar', { color: T.magenta, ancho: 156 }));
  out.push(cierra());
  return { svg: out.join(''), caption: mar ? 'De día, en superficie, el viento sopla del mar hacia tierra.' : 'De noche, en superficie, el viento sopla de tierra hacia el mar.' };
}

// ---------------------------------------------------------------------------
// Frente frío y frente cálido, en corte vertical. Los dos avanzan hacia la derecha.

export function frenteCorte(frio) {
  const W = 358;
  const H = 290;
  const alt = frio
    ? 'Frente frío en corte: una cuña empinada de aire frío avanza por debajo del cálido y lo levanta de golpe; sobre el frente, cumulonimbos con chubascos y rachas. Abajo, su símbolo en el mapa: línea con triángulos hacia donde avanza.'
    : 'Frente cálido en corte: el aire cálido avanza y sube despacio por una rampa suave sobre el frío; por delante, cirros, cirrostratos, altostratos y, cerca del frente, nimbostratos con lluvia continua. Abajo, su símbolo en el mapa: línea con semicírculos hacia donde avanza.';
  const { out, cierra } = lienzo(W, H, alt);
  const Y0 = 220; // el suelo
  if (frio) {
    // aire cálido delante (derecha) y la cuña fría detrás (izquierda), empinada
    out.push(`<rect x="0" y="40" width="${W}" height="${Y0 - 40}" fill="${T.rojo}" fill-opacity=".16"/>`);
    out.push(`<path d="M0,${Y0} L0,64 C70,70 120,110 168,${Y0} Z" fill="${T.azul}" fill-opacity=".3" stroke="${T.azulTxt}" stroke-width="1.6"/>`);
    out.push(nube(172, 116, 1.25, { torre: true }), lluvia(150, 200, 120, 196, 8));
    out.push(etiqueta(174, 78, 'Cb', { size: TXT.rotulo }));
    out.push(cartela(66, 176, 'AIRE FRÍO', 'detrás del frente', { color: T.azulTxt, ancho: 112 }));
    out.push(cartela(278, 176, 'AIRE CÁLIDO', 'delante', { color: T.rojoTxt, ancho: 120 }));
    out.push(rotulo(244, 120, 'chubascos, rachas', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start' }), rotulo(244, 136, 'y tormenta', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start' }));
    out.push(flecha(120, 56, 168, 56, { color: T.tinta, w: 1.6 }), rotulo(116, 60, 'avanza', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end' }));
  } else {
    // aire frío delante (derecha), el cálido detrás sube por una rampa suave
    out.push(`<rect x="0" y="40" width="${W}" height="${Y0 - 40}" fill="${T.rojo}" fill-opacity=".16"/>`);
    out.push(`<path d="M64,${Y0} C150,200 250,150 ${W},96 L${W},${Y0} Z" fill="${T.azul}" fill-opacity=".3" stroke="${T.rojoTxt}" stroke-width="1.6"/>`);
    out.push(nube(118, 174, 1.15), lluvia(96, 150, 180, 214, 7));
    out.push(etiqueta(118, 144, 'Ns', { size: TXT.rotulo }), etiqueta(206, 126, 'As', { size: TXT.rotulo }), etiqueta(268, 92, 'Cs', { size: TXT.rotulo }), etiqueta(318, 62, 'Ci', { size: TXT.rotulo }));
    out.push(`<path d="M190,140 h40 M250,104 h40 M302,74 h36" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="3 3"/>`);
    out.push(cartela(66, 76, 'AIRE CÁLIDO', 'sube despacio', { color: T.rojoTxt, ancho: 118 }));
    out.push(cartela(286, 190, 'AIRE FRÍO', 'delante', { color: T.azulTxt, ancho: 104 }));
    out.push(rotulo(90, 210, 'lluvia continua', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'end' }));
    out.push(flecha(20, 128, 66, 128, { color: T.tinta, w: 1.6 }), rotulo(20, 118, 'avanza', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start' }));
  }
  // el suelo y, debajo, el símbolo del frente en el mapa
  out.push(`<line x1="0" y1="${Y0}" x2="${W}" y2="${Y0}" stroke="${T.tinta}" stroke-width="1.4"/>`);
  out.push(rotulo(16, 252, 'en el mapa:', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }));
  out.push(simboloFrente(100, 330, 256, frio));
  out.push(rotulo(215, 278, frio ? 'triángulos hacia donde avanza' : 'semicírculos hacia donde avanza', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  out.push(cierra());
  return {
    svg: out.join(''),
    caption: frio
      ? 'El aire frío entra como una cuña bajo el cálido y lo levanta bruscamente: cumulonimbos, chubascos, rachas y tormenta; tras el paso, rola el viento, baja la temperatura, sube la presión y el cielo se limpia.'
      : 'El aire cálido sube despacio por encima del frío: las nubes se anuncian de lejos (cirros, cirrostratos con halo, altostratos) y llega lluvia continua y débil con nimbostratos; baja la presión antes de su paso.',
  };
}

// ---------------------------------------------------------------------------
// Mareas vivas y muertas: Sol, Tierra y Luna. La Luna gira (la animación que ya tenía); el dibujo parado ya marca las
// cuatro fases: sicigias (nueva y llena, vivas) y cuadraturas (cuartos, muertas).

export function mareasVivasMuertas() {
  const W = 358;
  const H = 352;
  const alt = 'Mareas vivas y muertas: el Sol a la izquierda, la Tierra en el centro y la órbita de la Luna con sus cuatro fases. Con luna nueva y llena (sicigias) Sol, Tierra y Luna están alineados: mareas vivas, de más amplitud. En los cuartos (cuadraturas) están en ángulo recto: mareas muertas, de menos amplitud. Debajo, las dos curvas comparadas.';
  const { out, cierra } = lienzo(W, H, alt);
  const E = [214, 120];
  const R = 76;
  const dur = 16;
  // el Sol y sus rayos
  out.push(`<circle cx="-34" cy="${E[1]}" r="70" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1.2"/>`, rotulo(16, E[1] + 5, 'Sol', { size: TXT.nombre, weight: 700, estilo: 'serif', anchor: 'middle' }));
  out.push(`<path d="${[-30, -10, 10, 30].map((d) => `M48,${E[1] + d} h40`).join('')}" stroke="${T.tinta}" stroke-width=".8" stroke-dasharray="4 4"/>`);
  // la órbita y las cuatro fases (vista desde el norte: la Luna gira en sentido antihorario)
  out.push(`<circle cx="${E[0]}" cy="${E[1]}" r="${R}" fill="none" stroke="${T.tinta}" stroke-width=".8" stroke-dasharray="3 4"/>`);
  out.push(`<line x1="${E[0] - R - 14}" y1="${E[1]}" x2="${E[0] + R + 14}" y2="${E[1]}" stroke="${T.magenta}" stroke-width="1" stroke-dasharray="6 3"/>`);
  const fase = (dx, dy, t, color, a, ox, oy) => `<circle cx="${E[0] + dx}" cy="${E[1] + dy}" r="8" fill="${T.papel}" stroke="${color}" stroke-width="1.4"/>` + rotulo(E[0] + dx + ox, E[1] + dy + oy, t, { size: TXT.min, estilo: 'serif', italic: true, anchor: a, color });
  out.push(fase(-R, 0, 'nueva', T.magenta, 'middle', 0, 24), fase(R, 0, 'llena', T.magenta, 'middle', 0, 24));
  out.push(fase(0, R, 'cuarto creciente', T.tinta, 'middle', 0, 24), fase(0, -R, 'cuarto menguante', T.tinta, 'middle', 0, -14));
  // la Luna que gira, y el abultamiento del agua hacia ella (más con las sicigias)
  out.push(`<g><animateTransform attributeName="transform" type="rotate" from="0 ${E[0]} ${E[1]}" to="-360 ${E[0]} ${E[1]}" dur="${dur}s" repeatCount="indefinite"/>` +
    `<ellipse cx="${E[0]}" cy="${E[1]}" rx="36" ry="21" fill="${T.agua}" stroke="${T.lineaAgua}" stroke-width="1"><animate attributeName="rx" values="36;26;36;26;36" dur="${dur}s" repeatCount="indefinite"/></ellipse>` +
    `<circle cx="${E[0] - R}" cy="${E[1]}" r="8" fill="${T.apagado}" stroke="${T.tinta}" stroke-width="1"/></g>`);
  out.push(`<circle cx="${E[0]}" cy="${E[1]}" r="15" fill="${T.azul}" stroke="${T.tinta}" stroke-width="1"/>`, rotulo(E[0], E[1] - 20, 'Tierra', { size: TXT.min, estilo: 'serif', weight: 700 }));
  // las dos situaciones, cada una sobre su curva: vivas (más amplitud) y muertas (menos)
  out.push(`<line x1="14" y1="222" x2="${W - 14}" y2="222" stroke="${T.tinta}" stroke-width=".6"/>`);
  out.push(cartela(90, 246, 'ALINEADOS', 'sicigias: nueva y llena', { color: T.magenta, ancho: 152 }), cartela(266, 246, 'EN ÁNGULO RECTO', 'cuadraturas: cuartos', { ancho: 152, size: TXT.min }));
  const curva = (x0, A, color, w) => { const p = []; for (let i = 0; i <= 40; i++) p.push(`${f1(x0 + i * 3.4)},${f1(300 + A * Math.cos((i / 40) * 4 * Math.PI))}`); return `<polyline points="${p.join(' ')}" fill="none" stroke="${color}" stroke-width="${w}"/>`; };
  out.push(curva(22, 24, T.magenta, 2), curva(198, 9, T.tinta, 1.8));
  out.push(`<line x1="16" y1="300" x2="162" y2="300" stroke="${T.apagado}" stroke-width=".6" stroke-dasharray="3 3"/><line x1="192" y1="300" x2="338" y2="300" stroke="${T.apagado}" stroke-width=".6" stroke-dasharray="3 3"/>`);
  out.push(rotulo(90, 342, 'vivas: más amplitud', { size: TXT.min, estilo: 'serif', italic: true, color: T.magenta, weight: 700 }), rotulo(266, 342, 'muertas: menos amplitud', { size: TXT.min, estilo: 'serif', italic: true }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Con luna nueva y luna llena (sicigias) el Sol, la Tierra y la Luna están alineados y sus atracciones se suman: mareas vivas, de mayor amplitud. En los cuartos creciente y menguante (cuadraturas) se contrarrestan: mareas muertas, de menor amplitud. Ocurren cada unos 15 días.' };
}
