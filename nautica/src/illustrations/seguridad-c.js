// Láminas fijas de seguridad del PY rehechas en estilo C (docs/ESTILO-LAMINAS.md): movimientos del barco, patrones de
// búsqueda y fuego (tetraedro y clases). Mismas specs que antes; solo cambia el dibujo. Sin DOM.
//   movimiento: { tipo:'movimiento', mov:'balance'|'cabezada'|'guinada' }
//   busqueda:   { tipo:'busqueda', patron:'cuadrado'|'sectores' }
//   fuego:      { tipo:'fuego', vista:'tetraedro'|'clases' }   (con modo:'apagar' es interactiva: interactivas/per-basicas.js)

import { T, TXT, lienzo, rotulo, etiqueta, cartela, cota, cotaArco, flecha, ondas, rosaNorte, paso, barco, arcoD, pol, f1 } from './estilo-c.js';
import { CLASES_FUEGO } from './seamanship.js';

// ---------------------------------------------------------------------------
// Movimientos del barco: balance (alrededor del eje proa-popa), cabezada (del eje de babor a estribor) y guiñada (del
// eje vertical). La animación (el vaivén) ya estaba; en el dibujo parado se ven las dos posiciones extremas a trazos.

const MOV = {
  balance: { nombre: 'BALANCE', vista: 'visto de proa', eje: 'eje proa-popa', ang: 16 },
  cabezada: { nombre: 'CABEZADA', vista: 'visto de costado', eje: 'eje de babor a estribor', ang: 9 },
  guinada: { nombre: 'GUIÑADA', vista: 'visto desde arriba', eje: 'eje vertical', ang: 14 },
};

export function movimientoIllustration(spec) {
  const mov = MOV[spec.mov] ? spec.mov : 'balance';
  const m = MOV[mov];
  const W = 358;
  const H = 250;
  const alt = {
    balance: 'Balance, visto de proa: el barco se escora alternativamente a una y otra banda, girando alrededor del eje proa-popa; a trazos, las dos posiciones extremas.',
    cabezada: 'Cabezada, visto de costado: la proa y la popa suben y bajan alternativamente, girando alrededor del eje de babor a estribor; a trazos, las dos posiciones extremas.',
    guinada: 'Guiñada, visto desde arriba: la proa se va a uno y otro lado del rumbo, girando alrededor del eje vertical; a trazos, las dos posiciones extremas y la línea del rumbo.',
  }[mov];
  const { out, cierra } = lienzo(W, H, alt, { fondo: mov === 'guinada' ? T.agua2 : T.papel });
  const C = mov === 'guinada' ? [179, 134] : [179, mov === 'balance' ? 140 : 146];
  let forma;
  if (mov === 'balance') {
    out.push(`<rect x="0" y="146" width="${W}" height="${H - 146}" fill="${T.agua}"/>`, ondas(12, W - 12, 176, { sep: 10 }));
    forma = `<path d="M119,120 L239,120 L229,160 L199,180 L159,180 L129,160Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/><line x1="179" y1="120" x2="179" y2="52" stroke="${T.tinta}" stroke-width="2"/>`;
  } else if (mov === 'cabezada') {
    out.push(`<rect x="0" y="150" width="${W}" height="${H - 150}" fill="${T.agua}"/>`, ondas(12, W - 12, 182, { sep: 10 }));
    forma = `<path d="M74,126 L294,126 L276,166 L96,166Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/><line x1="179" y1="126" x2="179" y2="58" stroke="${T.tinta}" stroke-width="2"/>`;
    out.push(rotulo(300, 120, 'proa', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start' }), rotulo(68, 120, 'popa', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'end' }));
  } else {
    out.push(`<line x1="179" y1="22" x2="179" y2="236" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="7 4"/>`, rotulo(186, 34, 'rumbo', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start' }));
    forma = barco(179, 134, 0, 150, { p: null });
    out.push(rosaNorte(W - 30, H - 40));
  }
  // las dos posiciones extremas (a trazos) y la que se mueve
  for (const s of [-1, 1]) out.push(`<g transform="rotate(${s * m.ang} ${C[0]} ${C[1]})" opacity=".45" fill="none">${forma.replace(/fill="[^"]*"/g, 'fill="none"').replace(/stroke-width="1.4"/g, 'stroke-width="1" stroke-dasharray="4 3"')}</g>`);
  out.push(`<g>${forma}<animateTransform attributeName="transform" type="rotate" values="${-m.ang} ${C[0]} ${C[1]};${m.ang} ${C[0]} ${C[1]};${-m.ang} ${C[0]} ${C[1]}" dur="4s" repeatCount="indefinite"/></g>`);
  // el eje de giro (perpendicular al papel en balance y cabezada: un punto con su círculo) y el vaivén, en magenta
  if (mov !== 'guinada') out.push(`<circle cx="${C[0]}" cy="${C[1]}" r="6" fill="${T.papel}" stroke="${T.magenta}" stroke-width="1.6"/><circle cx="${C[0]}" cy="${C[1]}" r="2" fill="${T.magenta}"/>`);
  else out.push(`<circle cx="${C[0]}" cy="${C[1]}" r="6" fill="${T.papel}" stroke="${T.magenta}" stroke-width="1.6"/><circle cx="${C[0]}" cy="${C[1]}" r="2" fill="${T.magenta}"/>`);
  const r = mov === 'guinada' ? 88 : 100;
  const [a, b] = [-m.ang - 6, m.ang + 6];
  out.push(`<path d="${arcoD(C[0], C[1], r, a, b)}" fill="none" stroke="${T.magenta}" stroke-width="1.8"/>`);
  for (const d of [a, b]) {
    const [x, y] = pol(C[0], C[1], d, r);
    const t = d + (d > 0 ? 90 : -90);
    const [p1x, p1y] = pol(x, y, t + 150, 9);
    const [p2x, p2y] = pol(x, y, t - 150, 9);
    const [tx, ty] = pol(x, y, t, 2);
    out.push(`<polygon points="${f1(tx)},${f1(ty)} ${f1(p1x)},${f1(p1y)} ${f1(p2x)},${f1(p2y)}" fill="${T.magenta}"/>`);
  }
  out.push(cartela(84, 30, m.nombre, m.vista, { color: T.magenta, ancho: 132 }));
  out.push(rotulo(mov === 'guinada' ? 14 : W / 2, H - 14, `gira alrededor del ${m.eje}`, { size: TXT.nota, estilo: 'serif', italic: true, anchor: mov === 'guinada' ? 'start' : 'middle' }));
  out.push(cierra());
  const cap = { balance: 'El balance es el movimiento de escora alternativo a una y otra banda; lo provoca sobre todo la mar de través.', cabezada: 'La cabezada (o arfada) es el sube y baja alternativo de proa y popa; lo provoca la mar de proa o de popa.', guinada: 'La guiñada es el desvío de la proa a uno y otro lado del rumbo; es típica con mar de popa o de aleta.' };
  return { svg: out.join(''), caption: cap[mov] };
}

// ---------------------------------------------------------------------------
// Patrones de búsqueda (IAMSAR, vol. III): cuadrado expansivo y por sectores. La derrota se ve entera; encima, la
// animación que ya tenía (la derrota que se va trazando), en magenta.

export function busquedaIllustration(spec) {
  const cuad = (spec.patron ?? 'cuadrado') === 'cuadrado';
  const W = 358;
  const H = 330;
  const cx = 179;
  const cy = 168;
  const alt = cuad
    ? 'Búsqueda en cuadrado expansivo vista desde arriba: desde el datum, tramos que crecen cada dos giros de 90° a estribor (S, S, 2S, 2S, 3S, 3S…).'
    : 'Búsqueda por sectores vista desde arriba: tramos radiales que pasan por el datum, con giros de 120° a estribor, hasta barrer el círculo en tres triángulos.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(rosaNorte(W - 30, 36));
  let d;
  if (cuad) {
    const s = 28;
    const pts = [[cx, cy]];
    let [x, y] = [cx, cy];
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (let i = 0; i < 12; i++) {
      const len = Math.floor(i / 2 + 1) * s;
      x += dirs[i % 4][0] * len;
      y += dirs[i % 4][1] * len;
      pts.push([x, y]);
    }
    d = `M${pts.map((p) => p.join(',')).join(' L')}`;
    // cada tramo, con su longitud (S, S, 2S, 2S, 3S, 3S…) por fuera
    // un tramo de cada par, con su longitud (S, 2S, 3S), por fuera (a la izquierda del sentido de avance)
    [[1, 'S'], [3, '2S'], [5, '3S'], [7, '4S']].forEach(([i, t]) => {
      const [a0, a1] = [pts[i], pts[i + 1]];
      const m = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2];
      const [ux, uy] = dirs[i % 4];
      out.push(etiqueta(m[0] + uy * 13, m[1] - ux * 13, t, { size: TXT.min }));
    });
    out.push(cartela(W / 2, H - 28, 'GIROS DE 90° A ESTRIBOR', 'cada dos tramos, uno más largo', { ancho: 230 }));
  } else {
    const R = 104;
    const P = (deg) => pol(cx, cy, deg, R);
    // IAMSAR: todos los giros de 120° a estribor → sectores en el orden 0°, 240°, 120°
    const seq = [0, 240, 120].flatMap((a) => [P(a), P(a + 60)]);
    d = `M${cx},${cy} ${seq.map((p, i) => `L${f1(p[0])},${f1(p[1])}${i % 2 ? ` L${cx},${cy}` : ''}`).join(' ')}`;
    out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${T.tinta}" stroke-width=".7" stroke-dasharray="3 4"/>`);
    // el radio y el giro de 120° en el primer vértice
    const [p0x, p0y] = P(0);
    out.push(cota(cx - 16, cy, p0x - 16, p0y, '', { tope: 3 }), etiqueta(cx - 34, cy - R / 2, 'R', { size: TXT.min }));
    out.push(`<line x1="${f1(p0x)}" y1="${f1(p0y)}" x2="${f1(p0x)}" y2="${f1(p0y - 26)}" stroke="${T.tinta}" stroke-width=".7" stroke-dasharray="4 3"/>`);
    out.push(cotaArco(p0x, p0y, 18, 0, 120, '', { color: T.magenta }), etiqueta(p0x + 34, p0y - 18, '120°', { color: T.magenta, size: TXT.min }));
    out.push(paso(...pol(cx, cy, -8, R * 0.5), 1), paso(...pol(cx, cy, 30, R * 0.98), 2), paso(...pol(cx, cy, 72, R * 0.5), 3));
    out.push(cartela(W / 2, H - 28, 'GIROS DE 120° A ESTRIBOR', 'pasando cada vez por el datum', { ancho: 230 }));
  }
  out.push(`<path d="${d}" fill="none" stroke="${T.tinta}" stroke-width="1.5" stroke-linejoin="round"/>`);
  out.push(`<path d="${d}" fill="none" stroke="${T.magenta}" stroke-width="2.2" stroke-linejoin="round" stroke-dasharray="1400" stroke-dashoffset="1400"><animate attributeName="stroke-dashoffset" from="1400" to="0" dur="8s" repeatCount="indefinite"/></path>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="8" fill="${T.papel}" stroke="${T.magenta}" stroke-width="1.8"/><circle cx="${cx}" cy="${cy}" r="3" fill="${T.magenta}"/>`);
  out.push(rotulo(16, 30, 'datum: última posición', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start', color: T.magenta, weight: 700 }), rotulo(16, 46, 'conocida o más probable', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }));
  out.push(cierra());
  return {
    svg: out.join(''),
    caption: cuad
      ? 'Desde el punto más probable (datum) se navega en tramos que crecen cada dos giros de 90°: cubre bien un área pequeña cuando la posición se conoce con bastante exactitud.'
      : 'Se pasa varias veces por el datum en tramos radiales, girando 120° al final de cada uno, hasta barrer el círculo por sectores. Es útil cuando el objeto está cerca del datum y el área es pequeña.',
  };
}

// ---------------------------------------------------------------------------
// Fuego: el tetraedro (y cómo se apaga quitando cada elemento) y las clases de fuego (UNE-EN 2).

export function fuegoIllustration(spec) {
  const W = 358;
  if ((spec.vista ?? 'tetraedro') === 'clases') {
    const H = 300;
    const { out, cierra } = lienzo(W, H, 'Clases de fuego: A, sólidos (madera, tela, papel); B, líquidos (combustible, pintura); C, gases (butano, propano); D, metales; F, aceites de cocina. La E ya no es una clase.');
    CLASES_FUEGO.forEach(([k, t], i) => {
      const y = 34 + i * 46;
      const [n, ej] = t.split(' (');
      out.push(`<rect x="22" y="${y - 6}" width="36" height="36" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.4"/><rect x="25" y="${y - 3}" width="30" height="30" fill="none" stroke="${T.tinta}" stroke-width=".5"/>`,
        rotulo(40, y + 20, k, { size: 22, weight: 700, estilo: 'serif', color: T.magenta }),
        rotulo(72, y + 9, n, { size: TXT.nombre, weight: 700, estilo: 'serif', anchor: 'start' }),
        ej ? rotulo(72, y + 26, ej.replace(')', ''), { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }) : '');
    });
    out.push(`<line x1="16" y1="266" x2="${W - 16}" y2="266" stroke="${T.tinta}" stroke-width=".6"/>`, rotulo(W / 2, 286, 'La E (eléctricos) ya no es una clase: es un riesgo', { size: TXT.min + 0.5, estilo: 'serif', italic: true }));
    out.push(cierra());
    return { svg: out.join(''), caption: 'Cada clase pide su agente. El agua a chorro sirve para sólidos (A), pero no para líquidos inflamables (los esparce) ni con tensión eléctrica; el polvo polivalente ABC es el extintor habitual a bordo. Algunos temarios antiguos hablan de clase E (eléctricos): hoy no es una clase, sino un riesgo a tener en cuenta al elegir el agente.' };
  }
  const H = 300;
  const { out, cierra } = lienzo(W, H, 'Tetraedro del fuego: combustible, comburente (oxígeno), calor y reacción en cadena. Se apaga quitando uno: retirando el combustible, sofocando, enfriando o inhibiendo la reacción.');
  const P = { t: [179, 52], l: [94, 216], r: [264, 216], c: [192, 166] };
  const cara = (a, b, c, col, op) => `<path d="M${P[a].join(',')} L${P[b].join(',')} L${P[c].join(',')}Z" fill="${col}" fill-opacity="${op}" stroke="${T.tinta}" stroke-width="1.2" stroke-linejoin="round"/>`;
  out.push(cara('t', 'l', 'c', T.amarillo, 0.55), cara('t', 'c', 'r', T.rojo, 0.45), cara('l', 'c', 'r', T.amarillo, 0.3));
  out.push(`<path d="M${P.t.join(',')} L${P.l.join(',')} L${P.r.join(',')}Z" fill="none" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>`);
  out.push(cartela(74, 110, 'COMBUSTIBLE', 'se retira', { ancho: 128 }), cartela(292, 110, 'OXÍGENO', 'se sofoca', { ancho: 104 }));
  out.push(cartela(110, 254, 'CALOR', 'se enfría', { ancho: 96 }), cartela(258, 254, 'REACCIÓN', 'se inhibe', { ancho: 100 }));
  out.push(`<path d="M104,128 L136,146 M262,128 L224,146 M136,236 L156,214 M230,236 L206,190" stroke="${T.tinta}" stroke-width=".7" stroke-dasharray="4 3" fill="none"/>`);
  out.push(rotulo(W / 2, 30, 'faltando uno, se apaga', { size: TXT.nota, estilo: 'serif', italic: true, color: T.magenta, weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Para que haya fuego hacen falta los cuatro: combustible, comburente (oxígeno), calor y la reacción en cadena. Se apaga quitando uno: enfriando, sofocando, eliminando el combustible o inhibiendo la reacción.' };
}
