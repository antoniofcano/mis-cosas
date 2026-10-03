// Segundas láminas del Patrón de Yate: superficies libres (py-1-3), el extintor de CO₂ y cómo se usa un
// extintor (py-1-7), los modelos de viento con sus fuerzas (py-2-3), el psicrómetro y el punto de rocío
// (py-2-5) y las nubes de cada piso con su aspecto (py-2-6).
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) para destacar la que trata cada paso.
// Los colores van con variables CSS de styles/app.css para leerse en claro y oscuro.

import { open, title, fx } from '../kit.js';

// Acentos que se adaptan al tema (texto, trazos y puntas de flecha).
const K = { v: 'var(--l-v)', r: 'var(--l-r)', a: 'var(--l-a)', m: 'var(--l-m)', p: 'var(--l-p)', g: 'var(--l-g)', t: 'currentColor' };
const marks = (id) => `<defs>${Object.entries(K).map(([k, c]) => `<marker id="${id}-k${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:${c}"/></marker>`).join('')}</defs>`;
const start = (W, H, label, id) => [...open(W, H, label, id), marks(id)];
const close = (out) => { out.push('</svg>'); return out.join(''); };
const lista = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v]);

/** Partes resaltadas; null si alguna no existe. */
function marcas(spec, validas) {
  const s = new Set(lista(spec.resaltar));
  if ([...s].some((p) => !validas.includes(p))) return null;
  return { activo: s.size > 0, on: (p) => s.has(p), op: (p) => (s.size && !s.has(p) ? ' opacity=".38"' : '') };
}

const flecha = (x1, y1, x2, y2, k, id, w = 2.2, extra = '') =>
  `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${K[k]}" stroke-width="${w}" marker-end="url(#${id}-k${k})" ${extra}/>`;
const linea = (x1, y1, x2, y2, k = 't', w = 1.2, extra = '') =>
  `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${K[k] ?? k}" stroke-width="${w}" ${extra}/>`;

/** Texto con halo del color del fondo. o = { c, a, s, b, extra } */
const tx = (x, y, t, o = {}) => {
  // Que no se salga del panel (ancho estimado del texto).
  const w = String(t).replace(/<[^>]*>|&[a-z]+;/g, 'x').length * (o.s ?? 10) * (o.b ? 0.58 : 0.52);
  const a = o.a ?? 'start';
  const [i0, i1] = a === 'start' ? [0, w] : a === 'end' ? [-w, 0] : [-w / 2, w / 2];
  if (x + i0 < 6) x = 6 - i0;
  else if (x + i1 > 314) x = 314 - i1;
  const c = o.c ? (K[o.c] ?? o.c) : 'currentColor';
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${o.a ?? 'start'}"${o.s ? ` font-size="${o.s}"` : ''}${o.b ? ' font-weight="700"' : ''}${o.halo === false ? ` style="fill:${c}"` : ` style="fill:${c};paint-order:stroke;stroke:var(--bg);stroke-width:3px;stroke-linejoin:round"`} ${o.extra ?? ''}>${t}</text>`;
};

// Rotación de un punto local (x, y) un ángulo en grados (horario en pantalla) alrededor de (cx, cy).
const rot = (cx, cy, deg, [x, y]) => {
  const r = (deg * Math.PI) / 180;
  return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
};

// ===========================================================================
// 1. Superficies libres (py-1-3).
// spec: { tipo:'superficies-libres', resaltar?: 'lleno'|'medias'|'vacio'|'mamparo' o lista }

const PARTES_SL = ['lleno', 'medias', 'vacio', 'mamparo'];

export function superficiesLibresIllustration(spec) {
  const m = marcas(spec, PARTES_SL);
  if (!m) return null;
  const id = 'psl';
  const W = 320;
  const H = 296;
  const out = start(W, H, 'Superficies libres', id);
  out.push(title(160, 'Superficies libres: tanque a medias'));
  const esc = 14; // escora en grados (a estribor: banda derecha abajo)
  const cx = 92;
  const cy = 112; // línea de flotación en crujía
  // Mar.
  out.push(`<rect x="8" y="${cy}" width="168" height="${168 - cy}" style="fill:var(--l-mar)"/>`);
  // Casco escorado (sección transversal).
  const P = (x, y) => rot(cx, cy, esc, [x, y]);
  const p = (pt) => P(...pt).map(fx).join(',');
  out.push(`<path d="M${p([-70, -46])} L${p([70, -46])} L${p([70, 4])} Q${p([70, 38])} ${p([38, 40])} L${p([-38, 40])} Q${p([-70, 38])} ${p([-70, 4])}Z" style="fill:var(--l-casco);stroke:currentColor" stroke-width="1.4"/>`);
  // Tanque: rectángulo local x −52..52, y 10..34; líquido a medias (nivel local 22 en reposo).
  const tq = [[-52, 10], [52, 10], [52, 34], [-52, 34]].map((q) => P(...q));
  const tqPath = `M${tq.map((q) => q.map(fx).join(',')).join(' L')}Z`;
  const [, yl] = P(0, 22); // la superficie del líquido queda horizontal y pasa por el centro
  out.push(`<clipPath id="${id}-tq"><path d="${tqPath}"/></clipPath>`);
  out.push(`<rect x="${cx - 70}" y="${fx(yl)}" width="140" height="60" style="fill:var(--l-v)" opacity=".55" clip-path="url(#${id}-tq)"/>`);
  out.push(`<path d="${tqPath}" fill="none" stroke="currentColor" stroke-width="1.4"/>`);
  // Flecha del líquido que corre a la banda baja.
  out.push(flecha(cx - 30, yl + 2, cx + 26, yl + 2 + 0, 'v', id, 2));
  // Crujía (discontinua) y puntos M, G y G virtual sobre ella.
  const [x0, y0] = P(0, -62);
  const [x1, y1] = P(0, 40);
  out.push(linea(x0, y0, x1, y1, 't', 1, 'stroke-dasharray="4 3" stroke-opacity=".6"'));
  const Mp = P(0, -56);
  const Gp = P(0, -6);
  const Gv = P(0, -30);
  out.push(`<circle cx="${fx(Mp[0])}" cy="${fx(Mp[1])}" r="3.5" fill="currentColor"/>`, tx(Mp[0] + 7, Mp[1] + 4, 'M', { b: true }));
  out.push(flecha(Gp[0], Gp[1] - 4, Gv[0] + 0.5, Gv[1] + 6, 'r', id, 2));
  out.push(`<circle cx="${fx(Gp[0])}" cy="${fx(Gp[1])}" r="4" style="fill:var(--l-m)"/>`, tx(Gp[0] - 8, Gp[1] + 4, 'G', { b: true, c: 'm', a: 'end' }));
  out.push(`<circle cx="${fx(Gv[0])}" cy="${fx(Gv[1])}" r="4" style="fill:var(--l-r)"/>`, tx(Gv[0] - 8, Gv[1] + 4, 'Gv', { b: true, c: 'r', a: 'end' }));
  // Explicación a la derecha.
  const ex = 182;
  out.push(tx(ex, 50, '1. El líquido corre', { b: true, c: 'v' }), tx(ex, 62, 'hacia la banda baja.'));
  out.push(tx(ex, 82, '2. Es como subir G:', { b: true, c: 'r' }), tx(ex, 94, 'G pasa a G virtual (Gv).'));
  out.push(tx(ex, 114, '3. Gv M &lt; G M:', { b: true }), tx(ex, 126, 'menos GM y menos'), tx(ex, 138, 'brazo adrizante.'));
  out.push(tx(ex, 158, 'Escora exagerada', { s: 10, c: 'g' }));
  // Cuatro tanques pequeños escorados.
  out.push(linea(8, 176, W - 8, 176, 't', 1, 'stroke-opacity=".3"'));
  const casos = [
    ['lleno', 'Lleno', 1, 'no se mueve', true],
    ['medias', 'A medias', 0.5, 'resta GM', false],
    ['vacio', 'Vacío', 0, 'sin líquido', true],
    ['mamparo', 'Mamparo', 0.5, 'pierde menos', true],
  ];
  casos.forEach(([k, nom, nivel, nota, ok], i) => {
    const xc = 44 + i * 77;
    const yc = 216;
    const on = m.on(k);
    const Q = (x, y) => rot(xc, yc, esc, [x, y]);
    const pts = [[-26, -14], [26, -14], [26, 14], [-26, 14]].map((q) => Q(...q));
    const path = `M${pts.map((q) => q.map(fx).join(',')).join(' L')}Z`;
    out.push(`<g${m.op(k)}>`);
    out.push(`<clipPath id="${id}-c${i}"><path d="${path}"/></clipPath>`);
    if (nivel === 1) out.push(`<path d="${path}" style="fill:var(--l-v)" opacity=".55"/>`);
    else if (nivel > 0) {
      if (k === 'mamparo') {
        // Dos mitades: cada una con su superficie libre propia, más estrecha.
        for (const dx of [-13, 13]) {
          const [, yy] = Q(dx, 0);
          const half = [[dx - 13, -14], [dx + 13, -14], [dx + 13, 14], [dx - 13, 14]].map((q) => Q(...q));
          out.push(`<clipPath id="${id}-c${i}${dx > 0 ? 'b' : 'a'}"><path d="M${half.map((q) => q.map(fx).join(',')).join(' L')}Z"/></clipPath>`);
          out.push(`<rect x="${xc - 40}" y="${fx(yy)}" width="80" height="40" style="fill:var(--l-v)" opacity=".55" clip-path="url(#${id}-c${i}${dx > 0 ? 'b' : 'a'})"/>`);
        }
        const [a0, a1] = [Q(0, -14), Q(0, 14)];
        out.push(linea(a0[0], a0[1], a1[0], a1[1], 't', 2));
      } else {
        const [, yy] = Q(0, 0);
        out.push(`<rect x="${xc - 40}" y="${fx(yy)}" width="80" height="40" style="fill:var(--l-v)" opacity=".55" clip-path="url(#${id}-c${i})"/>`);
        out.push(flecha(xc - 14, yy + 3, xc + 12, yy + 3, 'v', id, 1.8));
      }
    }
    out.push(`<path d="${path}" fill="none" stroke="currentColor" stroke-width="${on ? 3 : 1.4}"/>`);
    out.push(tx(xc, 252, nom, { a: 'middle', b: true, c: on ? (ok ? 'm' : 'r') : null }));
    out.push(tx(xc, 266, `${nota} ${ok ? '✓' : '✗'}`, { a: 'middle', c: ok ? 'm' : 'r', b: !ok || on }));
    out.push('</g>');
  });
  out.push(tx(160, 286, 'La pérdida depende de lo ancho del tanque.', { a: 'middle', s: 10 }));
  const CAP = {
    lleno: 'Un tanque lleno del todo no tiene superficie libre: el líquido no puede moverse y no resta estabilidad.',
    medias: 'Un tanque a medias tiene superficie libre: al escorar, el líquido corre a la banda baja y es como subir G. Se pierde GM y brazo adrizante.',
    vacio: 'Un tanque vacío no tiene superficie libre: no hay líquido que se mueva.',
    mamparo: 'Un mamparo longitudinal divide la superficie libre en dos más estrechas: la pérdida depende de lo ancho que sea el tanque, así que se reduce mucho.',
  };
  const hl = lista(spec.resaltar);
  const caption = hl.length === 1 ? CAP[hl[0]] : 'En un tanque a medias el líquido corre hacia la banda baja al escorar: es como subir G (G virtual) y se pierde GM. Lleno del todo o vacío no pasa; la pérdida depende de lo ancho del tanque, y un mamparo longitudinal la reduce mucho.';
  return { svg: close(out), caption };
}

// ===========================================================================
// 2. Extintor (py-1-7): cómo se reconoce el de CO₂ y cómo se usa un extintor portátil.
// spec: { tipo:'extintor', vista?: 'ambas'|'co2'|'uso', resaltar?: parte o lista }

const PARTES_CO2 = ['manometro', 'boquilla', 'precinto', 'etiqueta'];
const PARTES_USO = ['viento', 'base', 'barrer', 'salida'];

function botella(x, y, h, w, { manometro = false, on = () => false } = {}) {
  const s = [];
  // Cuerpo rojo con etiqueta.
  s.push(`<rect x="${fx(x - w / 2)}" y="${fx(y)}" width="${w}" height="${h}" rx="${w / 2.6}" style="fill:var(--l-roja);stroke:currentColor" stroke-width="1.2"/>`);
  s.push(`<rect x="${fx(x - w / 2 + 3)}" y="${fx(y + h * 0.35)}" width="${w - 6}" height="${fx(h * 0.32)}" rx="2" style="fill:var(--l-nube);stroke:currentColor" stroke-width="${on('etiqueta') ? 2.2 : 0.8}"/>`);
  for (let i = 0; i < 3; i++) s.push(linea(x - w / 2 + 6, y + h * 0.42 + i * 6, x + w / 2 - 6, y + h * 0.42 + i * 6, 'g', 1.2));
  // Válvula y maneta.
  s.push(`<rect x="${fx(x - 5)}" y="${fx(y - 12)}" width="10" height="13" style="fill:var(--l-g);stroke:currentColor" stroke-width="1"/>`);
  s.push(`<path d="M${fx(x - 3)},${fx(y - 12)} L${fx(x + 16)},${fx(y - 20)}" style="stroke:currentColor" stroke-width="2.6" stroke-linecap="round"/>`);
  if (manometro) s.push(`<circle cx="${fx(x - 10)}" cy="${fx(y - 8)}" r="5.5" style="fill:var(--l-nube);stroke:currentColor" stroke-width="${on('manometro') ? 2.4 : 1.2}"/><line x1="${fx(x - 10)}" y1="${fx(y - 8)}" x2="${fx(x - 7)}" y2="${fx(y - 11)}" style="stroke:var(--l-m)" stroke-width="1.6"/>`);
  return s.join('');
}

function parteCO2(out, y0, m, id) {
  out.push(tx(12, y0 + 14, 'Cómo se reconoce un extintor de CO₂', { b: true, s: 11.5 }));
  // Extintor de CO₂: sin manómetro, manguera y trompa.
  const x = 40;
  const yb = y0 + 46;
  out.push(botella(x, yb, 92, 30, { on: m.on }));
  // Precinto y pasador (anilla) en la válvula.
  out.push(`<circle cx="${x + 9}" cy="${yb - 5}" r="3.6" fill="none" style="stroke:var(--l-a)" stroke-width="${m.on('precinto') ? 2.6 : 1.6}"/>`);
  // Manguera hasta la trompa (boquilla difusora ancha).
  out.push(`<path d="M${x + 5},${yb - 6} C${x + 30},${yb - 6} ${x + 30},${yb + 30} ${x + 26},${yb + 44}" fill="none" stroke="currentColor" stroke-width="2.4"/>`);
  out.push(`<path d="M${x + 22},${yb + 44} L${x + 30},${yb + 44} L${x + 38},${yb + 74} L${x + 14},${yb + 74}Z" style="fill:var(--l-tope);stroke:currentColor" stroke-width="${m.on('boquilla') ? 2.6 : 1}"/>`);
  out.push(tx(x, yb + 108, 'CO₂', { a: 'middle', b: true }));
  // Rótulos con línea guía.
  const lx = 104;
  const filas = [
    ['manometro', 'Sin manómetro:', 'su carga se controla pesándolo', yb - 14, [x + 1, yb - 12]],
    ['precinto', 'Precinto y pasador', 'de seguridad', yb + 14, [x + 12, yb - 4]],
    ['etiqueta', 'Etiqueta', 'con instrucciones', yb + 42, [x + 12, yb + 46]],
    ['boquilla', 'Boquilla ancha en trompa:', 'no la agarres, se enfría mucho', yb + 70, [x + 36, yb + 66]],
  ];
  for (const [k, a, b, y, [px, py]] of filas) {
    const on = m.on(k);
    out.push(`<g${m.op(k)}>`);
    out.push(linea(px, py, lx - 4, y - 4, 't', on ? 1.6 : 0.8, 'stroke-opacity=".6"'));
    out.push(tx(lx, y, a, { b: true, c: on ? 'r' : null }), tx(lx, y + 12, b, { b: on }));
    out.push('</g>');
  }
  // Extintor de polvo, con manómetro, para comparar.
  const xp = 290;
  out.push(`<g${m.op('manometro')}>`);
  out.push(botella(xp, yb + 4, 70, 26, { manometro: true, on: m.on }));
  out.push(tx(xp, yb + 92, 'Polvo, con', { a: 'middle', b: true }), tx(xp, yb + 105, 'manómetro', { a: 'middle', b: true }));
  out.push('</g>');
}

function llama(x, y, s = 1) {
  return `<path d="M${fx(x)},${fx(y)} C${fx(x - 12 * s)},${fx(y - 8 * s)} ${fx(x - 6 * s)},${fx(y - 22 * s)} ${fx(x - 2 * s)},${fx(y - 30 * s)} C${fx(x + 2 * s)},${fx(y - 20 * s)} ${fx(x + 10 * s)},${fx(y - 16 * s)} ${fx(x + 6 * s)},${fx(y - 40 * s)} C${fx(x + 18 * s)},${fx(y - 24 * s)} ${fx(x + 16 * s)},${fx(y - 8 * s)} ${fx(x + 12 * s)},${fx(y)}Z" style="fill:var(--l-a);stroke:var(--l-r)" stroke-width="1.4"/>`;
}

function parteUso(out, y0, m, id) {
  out.push(tx(12, y0 + 14, 'Cómo se usa', { b: true, s: 11.5 }));
  out.push(tx(12, y0 + 30, 'Antes: alarma, para el motor, corta combustible'), tx(12, y0 + 42, 'y electricidad; quita el pasador y prueba.'));
  const yd = y0 + 128; // cubierta
  out.push(`<rect x="8" y="${yd}" width="304" height="6" style="fill:var(--l-casco)"/>`);
  // Viento por la espalda.
  out.push(`<g${m.op('viento')}>`);
  for (const dy of [0, 14]) out.push(flecha(14, y0 + 60 + dy, 52, y0 + 60 + dy, 'v', id, m.on('viento') ? 3 : 2));
  out.push(tx(14, y0 + 98, 'viento', { b: true, c: 'v' }), tx(14, y0 + 110, 'a la espalda', { c: 'v', b: m.on('viento') }));
  out.push('</g>');
  // Persona (de pie, mirando al fuego) con el extintor.
  const px = 100;
  out.push(`<g style="stroke:currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><circle cx="${px}" cy="${yd - 62}" r="7" style="fill:var(--bg)"/><line x1="${px}" y1="${yd - 55}" x2="${px}" y2="${yd - 26}"/><line x1="${px}" y1="${yd - 26}" x2="${px - 8}" y2="${yd}"/><line x1="${px}" y1="${yd - 26}" x2="${px + 8}" y2="${yd}"/><line x1="${px}" y1="${yd - 48}" x2="${px + 16}" y2="${yd - 36}"/></g>`);
  out.push(`<rect x="${px + 12}" y="${yd - 40}" width="9" height="22" rx="3" style="fill:var(--l-roja);stroke:currentColor"/>`);
  // Chorro hacia la base de las llamas.
  out.push(`<g${m.op('base')}>`);
  out.push(`<path d="M${px + 20},${yd - 38} L${px + 106},${yd - 8} L${px + 104},${yd - 2} Z" style="fill:var(--l-niebla)" opacity=".9"/>`);
  out.push(flecha(px + 22, yd - 36, px + 104, yd - 6, 'm', id, m.on('base') ? 3 : 2));
  out.push(tx(px + 18, yd - 56, 'apunta a la base', { b: true, c: 'm' }), tx(px + 18, yd - 44, 'de las llamas', { c: 'm', b: m.on('base') }));
  out.push('</g>');
  // Llamas.
  out.push(llama(214, yd - 1, 0.9), llama(236, yd - 1, 1.15), llama(262, yd - 1, 1));
  // Barrido de cerca a lejos.
  out.push(`<g${m.op('barrer')}>`);
  out.push(flecha(206, yd + 16, 282, yd + 16, 'a', id, m.on('barrer') ? 3 : 2));
  out.push(tx(244, yd + 30, 'barre del borde', { a: 'middle', b: true, c: 'a' }), tx(244, yd + 42, 'cercano al fondo', { a: 'middle', b: true, c: 'a' }));
  out.push('</g>');
  // Salida libre detrás.
  out.push(`<g${m.op('salida')}>`);
  out.push(flecha(84, yd + 16, 28, yd + 16, 'g', id, m.on('salida') ? 3 : 2, 'stroke-dasharray="5 3"'));
  out.push(tx(14, yd + 30, 'salida libre detrás', { b: m.on('salida') }));
  out.push('</g>');
  out.push(tx(160, yd + 60, 'De barlovento a sotavento. Se vacía en segundos.', { a: 'middle' }));
}

export function extintorIllustration(spec) {
  const vista = spec.vista ?? 'ambas';
  const validas = vista === 'co2' ? PARTES_CO2 : vista === 'uso' ? PARTES_USO : vista === 'ambas' ? [...PARTES_CO2, ...PARTES_USO] : null;
  if (!validas) return null;
  const m = marcas(spec, validas);
  if (!m) return null;
  const id = 'pex';
  const W = 320;
  const hCO2 = 162;
  const hUso = 196;
  if (vista === 'co2') {
    const out = start(W, hCO2 + 6, 'Cómo se reconoce un extintor de CO₂', id);
    parteCO2(out, 4, m, id);
    return { svg: close(out), caption: 'El de CO₂ no lleva manómetro (su carga se controla pesándolo) y tiene una boquilla ancha en forma de trompa que no se agarra, porque se enfría muchísimo. El de polvo sí lleva manómetro. Todos llevan etiqueta con instrucciones y precinto.' };
  }
  if (vista === 'uso') {
    const out = start(W, hUso + 4, 'Cómo se usa un extintor', id);
    parteUso(out, 2, m, id);
    return { svg: close(out), caption: 'Con el viento a la espalda y una salida libre detrás, apunta a la base de las llamas y barre desde el borde más cercano hacia el fondo, avanzando a medida que el fuego retrocede.' };
  }
  const out = start(W, hCO2 + hUso + 8, 'El extintor: cómo se reconoce el de CO₂ y cómo se usa', id);
  parteCO2(out, 4, m, id);
  out.push(linea(8, hCO2 + 4, W - 8, hCO2 + 4, 't', 1, 'stroke-opacity=".3"'));
  parteUso(out, hCO2 + 6, m, id);
  return { svg: close(out), caption: 'El de CO₂ se reconoce porque no lleva manómetro (se pesa) y tiene una boquilla ancha en trompa que no se agarra. Para usar cualquier extintor: viento a la espalda, salida libre detrás, a la base de las llamas y barriendo del borde cercano al fondo.' };
}

// ===========================================================================
// 3. Modelos de viento (py-2-3): geostrófico, de gradiente y antitríptico, con sus fuerzas (hemisferio norte).
// spec: { tipo:'modelos-viento', modelo?: 'todos'|'geostrofico'|'gradiente'|'antitriptico' }

const ALTO = { geostrofico: 86, gradiente: 92, antitriptico: 92 };
const xT = 192; // columna de texto

function isobaraRecta(out, y, valor) {
  out.push(linea(10, y, 182, y, 't', 1.4, 'stroke-opacity=".55"'), tx(182, y - 3, valor, { a: 'end', s: 10, c: 'g' }));
}

function filaGeostrofico(out, r, id) {
  isobaraRecta(out, r + 20, '1004');
  isobaraRecta(out, r + 70, '1008');
  out.push(tx(16, r + 15, 'B', { b: true, s: 12, c: 'r' }), tx(16, r + 84, 'A', { b: true, s: 12, c: 'v' }));
  const [px, py] = [100, r + 45];
  out.push(flecha(30, py, 168, py, 'm', id, 3.2));
  out.push(tx(34, py + 13, 'viento', { b: true, c: 'm' }));
  out.push(flecha(px, py - 3, px, r + 25, 'r', id, 2.2), tx(px - 5, r + 34, 'gradiente', { a: 'end', c: 'r' }));
  out.push(flecha(px, py + 3, px, r + 65, 'v', id, 2.2), tx(px + 6, r + 62, 'Coriolis', { c: 'v' }));
  out.push(`<circle cx="${px}" cy="${py}" r="3.5" fill="currentColor"/>`);
  out.push(tx(xT, r + 18, 'Geostrófico', { b: true, s: 12 }), tx(xT, r + 32, 'gradiente = Coriolis'), tx(xT, r + 44, 'paralelo a isobaras'), tx(xT, r + 56, 'rectas'), tx(xT, r + 68, 'altas a su derecha'), tx(xT, r + 80, 'desde unos 1000 m', { c: 'g' }));
}

function filaGradiente(out, r, id) {
  const [cx, cy] = [96, r + 98];
  const R = 58;
  // Isobaras curvas alrededor de una borrasca (solo la parte de arriba).
  const arco = (rr) => {
    const a = (64 * Math.PI) / 180;
    const [x0, y0] = [cx - rr * Math.sin(a), cy - rr * Math.cos(a)];
    const [x1, y1] = [cx + rr * Math.sin(a), cy - rr * Math.cos(a)];
    return `<path d="M${fx(x0)},${fx(y0)} A${rr},${rr} 0 0 1 ${fx(x1)},${fx(y1)}" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="1.4"/>`;
  };
  out.push(arco(R), arco(R - 30));
  out.push(tx(cx, cy - 10, 'B', { a: 'middle', b: true, s: 12, c: 'r' }));
  const [px, py] = [cx, cy - R];
  // Viento tangente, girando en sentido contrario a las agujas del reloj (HN): arriba va hacia el oeste.
  const pa = (deg) => [cx + R * Math.sin((deg * Math.PI) / 180), cy - R * Math.cos((deg * Math.PI) / 180)];
  const [w0, w1] = [pa(52), pa(-62)];
  out.push(`<path d="M${fx(w0[0])},${fx(w0[1])} A${R},${R} 0 0 0 ${fx(w1[0])},${fx(w1[1])}" fill="none" style="stroke:${K.m}" stroke-width="3.2" marker-end="url(#${id}-km)"/>`);
  out.push(tx(w1[0] - 8, w1[1] - 8, 'viento', { b: true, c: 'm', a: 'end' }));
  out.push(flecha(px, py + 3, px, py + 26, 'r', id, 2.2), tx(px + 6, py + 24, 'gradiente', { c: 'r' }));
  out.push(flecha(px - 8, py - 3, px - 8, r + 8, 'v', id, 2.2), tx(px - 13, r + 16, 'Coriolis', { a: 'end', c: 'v' }));
  out.push(flecha(px + 8, py - 3, px + 8, r + 14, 'p', id, 2.2), tx(px + 13, r + 20, 'centrífuga', { c: 'p' }));
  out.push(`<circle cx="${px}" cy="${py}" r="3.5" fill="currentColor"/>`);
  out.push(tx(xT, r + 18, 'De gradiente', { b: true, s: 12 }), tx(xT, r + 33, 'gradiente = Coriolis'), tx(xT, r + 46, '+ centrífuga'), tx(xT, r + 59, 'paralelo a isobaras'), tx(xT, r + 71, 'curvas'), tx(xT, r + 84, 'teórico: sin rozamiento', { c: 'g' }));
}

function filaAntitriptico(out, r, id) {
  isobaraRecta(out, r + 14, '1004');
  isobaraRecta(out, r + 78, '1008');
  out.push(tx(16, r + 10, 'B', { b: true, s: 12, c: 'r' }), tx(16, r + 90, 'A', { b: true, s: 12, c: 'v' }));
  const [px, py] = [100, r + 47];
  const ang = (18 * Math.PI) / 180; // corta las isobaras hacia las bajas
  const [ux, uy] = [Math.cos(ang), -Math.sin(ang)];
  out.push(linea(px - 62, py, px + 62, py, 'g', 1.2, 'stroke-dasharray="3 3"'));
  out.push(flecha(px - 70 * ux, py - 70 * uy, px + 72 * ux, py + 72 * uy, 'm', id, 3.2));
  out.push(tx(124, py + 14, 'viento', { b: true, c: 'm' }));
  out.push(flecha(px, py - 3, px, r + 19, 'r', id, 2.2), tx(px - 6, r + 29, 'gradiente', { a: 'end', c: 'r' }));
  // Coriolis a la derecha del viento; rozamiento opuesto al viento (dibujado un poco por encima para que se vea).
  out.push(flecha(px + 3 * -uy, py + 3 * ux, px + 22 * -uy, py + 22 * ux, 'v', id, 2.2), tx(px - 4, py + 29, 'Coriolis', { c: 'v', a: 'end' }));
  const [ox, oy] = [7 * uy, -7 * ux];
  out.push(flecha(px - 4 * ux + ox, py - 4 * uy + oy, px - 30 * ux + ox, py - 30 * uy + oy, 'a', id, 2.6), tx(px - 34, py - 4, 'rozamiento', { a: 'end', c: 'a', b: true }));
  out.push(`<circle cx="${px}" cy="${py}" r="3.5" fill="currentColor"/>`);
  out.push(tx(xT, r + 16, 'Antitríptico', { b: true, s: 12 }), tx(xT, r + 31, 'con rozamiento:', { b: true, c: 'a' }), tx(xT, r + 44, 'corta las isobaras'), tx(xT, r + 56, 'hacia las bajas'), tx(xT, r + 69, 'mar: 10–20°'), tx(xT, r + 81, 'tierra: 30° o más'));
}

const FILAS = { geostrofico: filaGeostrofico, gradiente: filaGradiente, antitriptico: filaAntitriptico };
const CAP_VIENTO = {
  geostrofico: 'Geostrófico: la fuerza del gradiente (hacia las bajas) y la de Coriolis (a la derecha del viento en el hemisferio norte) se equilibran y el viento sopla paralelo a isobaras rectas, con las altas a su derecha.',
  gradiente: 'De gradiente: con isobaras curvas entra la fuerza centrífuga; el gradiente equilibra a Coriolis más la centrífuga y el viento sopla paralelo a las isobaras curvas. Es teórico, sin rozamiento.',
  antitriptico: 'Antitríptico: el rozamiento frena el viento, que deja de ser paralelo y corta las isobaras hacia las bajas presiones: unos 10–20° sobre el mar y 30° o más sobre tierra.',
};

export function modelosVientoIllustration(spec) {
  const modelo = spec.modelo ?? 'todos';
  const ids = modelo === 'todos' ? Object.keys(FILAS) : FILAS[modelo] ? [modelo] : null;
  if (!ids) return null;
  const id = 'pmv';
  const W = 320;
  const H = 30 + ids.reduce((s, k) => s + ALTO[k], 0) + (ids.length === 3 ? 0 : 4);
  const out = start(W, H, 'Modelos de viento y sus fuerzas', id);
  out.push(title(160, ids.length === 3 ? 'Modelos de viento (hemisferio norte)' : 'Hemisferio norte'));
  let r = 28;
  ids.forEach((k, i) => {
    if (i) out.push(linea(8, r, W - 8, r, 't', 1, 'stroke-opacity=".3"'));
    FILAS[k](out, r, id);
    r += ALTO[k];
  });
  const caption = ids.length === 1 ? CAP_VIENTO[ids[0]] : 'Geostrófico: gradiente y Coriolis se equilibran y el viento va paralelo a isobaras rectas, con las altas a su derecha (HN). De gradiente: se suma la centrífuga y va paralelo a isobaras curvas. Antitríptico: el rozamiento lo frena y corta las isobaras hacia las bajas.';
  return { svg: close(out), caption };
}

// ===========================================================================
// 4. Psicrómetro y punto de rocío (py-2-5).
// spec: { tipo:'psicrometro', caso?: 'ejemplo'|'humedo'|'seco' }
// Cifras de la lección: seco 18 °C y húmedo 15 °C → algo más del 70 % de HR y punto de rocío de unos 13 °C.
// En 'humedo' y 'seco' solo se dice la tendencia (la lección no da más cifras).

const CASOS_PSI = {
  ejemplo: { seco: 18, humedo: 15 },
  humedo: { seco: 18, humedo: 17.5 },
  seco: { seco: 18, humedo: 11 },
};

export function psicrometroIllustration(spec) {
  const caso = spec.caso ?? 'ejemplo';
  const c = CASOS_PSI[caso];
  if (!c) return null;
  const id = 'pps';
  const W = 320;
  const H = 290;
  const out = start(W, H, 'Psicrómetro y punto de rocío', id);
  out.push(title(160, 'El psicrómetro'));
  const yT = (t) => 210 - t * 5; // 0 °C en y 210, 30 °C en y 60
  const termo = (x, t, humedo) => {
    const s = [];
    s.push(`<rect x="${x - 6}" y="52" width="12" height="166" rx="6" style="fill:var(--l-nube);stroke:currentColor" stroke-width="1.2"/>`);
    s.push(`<rect x="${x - 2.5}" y="${fx(yT(t))}" width="5" height="${fx(222 - yT(t))}" style="fill:var(--l-roja)"/>`);
    s.push(`<circle cx="${x}" cy="226" r="10" style="fill:var(--l-roja);stroke:currentColor" stroke-width="1.2"/>`);
    if (humedo) {
      // Muselina mojada y mecha hasta el depósito de agua.
      s.push(`<ellipse cx="${x}" cy="226" rx="13" ry="14" style="fill:var(--l-v)" opacity=".35"/><ellipse cx="${x}" cy="226" rx="13" ry="14" fill="none" style="stroke:var(--l-v)" stroke-width="1.6" stroke-dasharray="3 2"/>`);
      s.push(`<path d="M${x},240 L${x},262" style="stroke:var(--l-v)" stroke-width="2.4"/>`);
      s.push(`<rect x="${x - 16}" y="252" width="32" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="${x - 15}" y="258" width="30" height="13" style="fill:var(--l-v)" opacity=".5"/>`);
      // Evaporación.
      for (const dx of [-18, 18]) s.push(`<path d="M${x + dx},216 q${dx > 0 ? 4 : -4},-5 0,-10 q${dx > 0 ? -4 : 4},-5 0,-10" fill="none" style="stroke:var(--l-v)" stroke-width="1.3"/>`);
    }
    return s.join('');
  };
  const xs = 82;
  const xh = 132;
  // Escala.
  for (let t = 0; t <= 30; t += 5) {
    out.push(linea(xs - 10, yT(t), xs - 6, yT(t), 't', 1));
    if (t % 10 === 0) out.push(tx(xs - 13, yT(t) + 3.5, `${t} °C`, { a: 'end', s: 10 }));
  }
  out.push(termo(xs, c.seco, false), termo(xh, c.humedo, true));
  out.push(tx(xs, 44, 'seco', { a: 'middle', b: true }), tx(xh, 44, 'húmedo', { a: 'middle', b: true, c: 'v' }));
  // Diferencia entre los dos.
  const y1 = yT(c.seco);
  const y2 = yT(c.humedo);
  out.push(linea(xs + 6, y1, xh + 18, y1, 't', 1, 'stroke-dasharray="3 3"'), linea(xh + 6, y2, xh + 18, y2, 't', 1, 'stroke-dasharray="3 3"'));
  if (y2 - y1 > 4) out.push(linea(xh + 18, y1, xh + 18, y2, 'a', 2.4));
  else out.push(`<circle cx="${xh + 18}" cy="${fx((y1 + y2) / 2)}" r="3" style="fill:var(--l-a)"/>`);
  const ex = 172;
  out.push(tx(ex - 6, (y1 + y2) / 2 + 4, caso === 'humedo' ? 'diferencia mínima' : 'diferencia', { b: true, c: 'a' }));
  // Explicación por caso.
  if (caso === 'ejemplo') {
    const td = 13;
    out.push(`<path d="M${xs - 6},${yT(td)} l-7,-4 l0,8z" style="fill:var(--l-m)"/>`, linea(xs - 13, yT(td), xs - 22, yT(td), 'm', 1.6));
    out.push(tx(xs - 26, yT(td) + 3.5, 'Td', { a: 'end', b: true, c: 'm' }));
    out.push(tx(ex, 52, 'Ejemplo de la lección', { b: true }));
    out.push(tx(ex, 68, 'seco 18 °C'), tx(ex, 80, 'húmedo 15 °C'));
    out.push(tx(ex, 150, 'seco + diferencia (3 °C)'), tx(ex, 162, '→ tablas psicrométricas:'));
    out.push(tx(ex, 178, 'HR: algo más del 70 %', { b: true }), tx(ex, 192, 'punto de rocío (Td):', { b: true, c: 'm' }), tx(ex, 204, 'unos 13 °C', { b: true, c: 'm' }));
  } else if (caso === 'humedo') {
    out.push(tx(ex, 52, 'Marcan casi lo mismo', { b: true }));
    out.push(tx(ex, 70, 'poca evaporación:'), tx(ex, 82, 'aire cerca de la'), tx(ex, 94, 'saturación'), tx(ex, 110, 'HR alta', { b: true, c: 'v' }));
  } else {
    out.push(tx(ex, 52, 'Mucha diferencia', { b: true }));
    out.push(tx(ex, 70, 'mucha evaporación:'), tx(ex, 82, 'el bulbo húmedo se'), tx(ex, 94, 'enfría mucho'), tx(ex, 110, 'aire seco, HR baja', { b: true, c: 'r' }));
  }
  out.push(tx(ex, 230, 'Diferencia pequeña', { b: true }), tx(ex, 242, '→ HR alta'));
  out.push(tx(ex, 262, 'A la sombra y con aire'), tx(ex, 274, 'junto al bulbo húmedo.'));
  const CAP = {
    ejemplo: 'El termómetro húmedo marca menos porque el agua de su muselina se evapora y le roba calor. Con el seco (18 °C) y la diferencia (3 °C) se entra en las tablas: algo más de un 70 % de HR y un punto de rocío de unos 13 °C.',
    humedo: 'Si el seco y el húmedo marcan casi lo mismo, apenas hay evaporación en la muselina: el aire está cerca de la saturación y la humedad relativa es alta.',
    seco: 'Cuanto más seco está el aire, más se evapora el agua de la muselina y más diferencia hay entre los dos termómetros: humedad relativa baja.',
  };
  return { svg: close(out), caption: CAP[caso] };
}

// ===========================================================================
// 5. Las nubes de cada piso y cómo se reconocen (py-2-6).
// spec: { tipo:'nubes-pisos', resaltar?: 'altas'|'medias'|'bajas'|'vertical' o lista }

const PISOS = [
  ['altas', 'ALTAS', 'más de unos 6000 m · «cirro-»', 'v', [
    ['Ci', 'cirros', 'filamentos, «colas de gato»'],
    ['Cc', 'cirrocúmulos', 'granitos pequeños y redondos'],
    ['Cs', 'cirrostratos', 'velo transparente con halo'],
  ]],
  ['medias', 'MEDIAS', '2000 a 6000 m · «alto-»', 'm', [
    ['Ac', 'altocúmulos', 'nubecillas globulares'],
    ['As', 'altostratos', 'velo gris, sol esmerilado'],
  ]],
  ['bajas', 'BAJAS', 'menos de 2000 m · sin prefijo', 'a', [
    ['St', 'estratos', 'como niebla sin tocar suelo'],
    ['Sc', 'estratocúmulos', 'gris con huecos más claros'],
    ['Ns', 'nimbostratos', 'lluvia o nieve continua'],
  ]],
  ['vertical', 'DESARROLLO VERTICAL', 'base baja, cima alta', 'r', [
    ['Cu', 'cúmulos', 'base plana, cima en coliflor'],
    ['Cb', 'cumulonimbos', 'yunque: tormenta, granizo'],
  ]],
];

export function nubesPisosIllustration(spec) {
  const m = marcas(spec, PISOS.map((p) => p[0]));
  if (!m) return null;
  const id = 'pnp';
  const W = 320;
  const H = 298;
  const out = start(W, H, 'Las nubes de cada piso', id);
  out.push(title(160, 'Cada piso, sus nubes'));
  let y = 32;
  for (const [k, nom, sub, c, generos] of PISOS) {
    const on = m.on(k);
    const hBloque = 20 + generos.length * 16;
    out.push(`<g${m.op(k)}>`);
    out.push(`<rect x="8" y="${y}" width="${W - 16}" height="${hBloque - 2}" rx="5" style="fill:var(--l-cielo)" opacity="${on ? 0.9 : 0.45}"/>`);
    out.push(`<rect x="8" y="${y}" width="${on ? 7 : 5}" height="${hBloque - 2}" rx="2" style="fill:${K[c]}"/>`);
    if (on) out.push(`<rect x="8" y="${y}" width="${W - 16}" height="${hBloque - 2}" rx="5" fill="none" style="stroke:${K[c]}" stroke-width="2.4"/>`);
    out.push(tx(20, y + 14, nom, { b: true, s: 11, c, halo: false }), tx(W - 14, y + 14, sub, { a: 'end', s: 10, b: on, halo: false }));
    generos.forEach(([ab, n, d], i) => {
      const yy = y + 30 + i * 16;
      out.push(tx(20, yy, ab, { b: true, c, halo: false }), tx(40, yy, n, { b: true, halo: false }), tx(132, yy, d, { halo: false }));
    });
    out.push('</g>');
    y += hBloque + 3;
  }
  out.push(tx(160, y + 12, '«Alto-» = media. Ns, baja. Cu y Cb, vertical.', { a: 'middle', b: true, s: 10 }));
  const CAP = {
    altas: 'Las altas, por encima de unos 6000 m y de cristales de hielo, empiezan por «cirro-»: cirros, cirrocúmulos y cirrostratos (el del halo).',
    medias: 'Las medias, entre unos 2000 y 6000 m, empiezan por «alto-» aunque suene a alta: altocúmulos y altostratos.',
    bajas: 'Las bajas, por debajo de unos 2000 m, no llevan prefijo: estratos, estratocúmulos y nimbostratos, los de lluvia o nieve continua.',
    vertical: 'Las de desarrollo vertical tienen la base baja y la cima muy alta: cúmulos, de base plana y cima en coliflor, y cumulonimbos, con yunque y tormenta.',
  };
  const hl = lista(spec.resaltar);
  const caption = hl.length === 1 ? CAP[hl[0]] : 'Altas (cirro-): Ci, Cc y Cs. Medias (alto-): Ac y As. Bajas (sin prefijo): St, Sc y Ns. De desarrollo vertical: Cu y Cb. Son las alturas aproximadas que usa el examen.';
  return { svg: close(out), caption };
}

// ===========================================================================

export const LAMINAS = {
  'superficies-libres': {
    fn: superficiesLibresIllustration,
    params: { resaltar: PARTES_SL },
    ejemplo: { tipo: 'superficies-libres' },
  },
  extintor: {
    fn: extintorIllustration,
    params: { vista: ['ambas', 'co2', 'uso'], resaltar: [...PARTES_CO2, ...PARTES_USO] },
    ejemplo: { tipo: 'extintor', vista: 'ambas' },
  },
  'modelos-viento': {
    fn: modelosVientoIllustration,
    params: { modelo: ['todos', 'geostrofico', 'gradiente', 'antitriptico'] },
    ejemplo: { tipo: 'modelos-viento' },
  },
  psicrometro: {
    fn: psicrometroIllustration,
    params: { caso: ['ejemplo', 'humedo', 'seco'] },
    ejemplo: { tipo: 'psicrometro' },
  },
  'nubes-pisos': {
    fn: nubesPisosIllustration,
    params: { resaltar: PISOS.map((p) => p[0]) },
    ejemplo: { tipo: 'nubes-pisos' },
  },
};
