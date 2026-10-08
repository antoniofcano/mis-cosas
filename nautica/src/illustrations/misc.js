// Ilustraciones: meteorología y banderas (borrasca, anticiclón, partes del barco y hélice: laminas-c.js).
import { borrascaAnticiclon } from './laminas-c.js';

const arrowDefs = (id, color) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="${color}"/></marker></defs>`;

// ---------------------------------------------------------------------------
// Meteorología
// spec: { tipo:'meteo', sistema:'borrasca'|'anticiclon'|'buys-ballot'|'brisa-mar'|'brisa-tierra'|'frentes' }

export function meteoIllustration(spec) {
  const W = 320;
  const H = 260;
  const cx = 160;
  const cy = 140;
  const out = [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="Meteorología">`, `<rect width="${W}" height="${H}" rx="10" class="il-panel"/>`, arrowDefs('mt-a', '#2563eb')];
  const sys = spec.sistema;
  // borrasca y anticiclón: en estilo C, en src/illustrations/laminas-c.js
  if (sys === 'borrasca' || sys === 'anticiclon') return borrascaAnticiclon(sys === 'borrasca');
  if (sys === 'buys-ballot') {
    out.push(`<text x="${cx}" y="22" class="il-title">Ley de Buys-Ballot (hemisferio norte)</text>`);
    out.push(`<circle cx="${cx}" cy="${cy}" r="14" fill="#334155"/><text x="${cx}" y="${cy + 4}" font-size="10" fill="#fff" text-anchor="middle">tú</text>`);
    out.push(`<line x1="${cx}" y1="${cy + 90}" x2="${cx}" y2="${cy + 22}" stroke="#2563eb" stroke-width="4" marker-end="url(#mt-a)"/><text x="${cx + 8}" y="${cy + 80}" font-size="11" fill="#2563eb">viento por la espalda</text>`);
    out.push(`<text x="${cx - 110}" y="${cy - 46}" font-size="30" font-weight="700" fill="#dc2626">B</text><text x="${cx - 122}" y="${cy - 26}" font-size="10" fill="#dc2626">a tu izquierda,</text><text x="${cx - 122}" y="${cy - 14}" font-size="10" fill="#dc2626">algo adelantada</text>`);
    out.push(`<text x="${cx + 92}" y="${cy - 6}" font-size="30" font-weight="700" fill="#2563eb">A</text><text x="${cx + 80}" y="${cy + 14}" font-size="10" fill="#2563eb">a tu derecha</text>`);
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Con el viento de espaldas, en el hemisferio norte la baja presión queda a tu izquierda (algo adelantada) y la alta a tu derecha.' };
  }
  if (sys === 'brisa-mar' || sys === 'brisa-tierra') {
    const mar = sys === 'brisa-mar';
    out.push(`<text x="${cx}" y="22" class="il-title">${mar ? 'Brisa marina (de día)' : 'Terral (de noche)'}</text>`);
    out.push(`<rect x="0" y="180" width="160" height="80" fill="#38bdf8"/><rect x="160" y="170" width="160" height="90" fill="#a16207"/>`);
    out.push(`<circle cx="${mar ? 280 : 40}" cy="54" r="16" fill="${mar ? '#facc15' : '#e5e7eb'}"/>`);
    const p = mar ? 'M60,160 L250,160 L250,80 L60,80 Z' : 'M250,150 L60,150 L60,80 L250,80 Z';
    out.push(`<path d="${p}" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="8 6"><animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.2s" repeatCount="indefinite"/></path>`);
    // flechas fijas: en superficie el viento va del mar a tierra (virazón) o de tierra al mar (terral)
    out.push(mar ? `<line x1="90" y1="160" x2="200" y2="160" stroke="#2563eb" stroke-width="3" marker-end="url(#mt-a)"/><line x1="250" y1="130" x2="250" y2="100" stroke="#dc2626" stroke-width="3" marker-end="url(#mt-a)"/><line x1="60" y1="100" x2="60" y2="130" stroke="#2563eb" stroke-width="3" marker-end="url(#mt-a)"/>`
      : `<line x1="220" y1="150" x2="110" y2="150" stroke="#2563eb" stroke-width="3" marker-end="url(#mt-a)"/><line x1="60" y1="110" x2="60" y2="80" stroke="#dc2626" stroke-width="3" marker-end="url(#mt-a)"/><line x1="250" y1="90" x2="250" y2="120" stroke="#2563eb" stroke-width="3" marker-end="url(#mt-a)"/>`);
    out.push(`<text x="${mar ? 262 : 72}" y="112" class="il-lbl" style="fill:#dc2626">asciende</text><text x="${mar ? 72 : 262}" y="112" class="il-lbl">desciende</text>`);
    out.push(`<text x="160" y="40" class="il-lbl" text-anchor="middle">${mar ? 'La tierra se calienta más: el aire sube y entra el del mar' : 'La tierra se enfría más: el aire baja y sale hacia el mar'}</text>`);
    out.push('</svg>');
    return { svg: out.join(''), caption: mar ? 'De día, en superficie, el viento sopla del mar hacia tierra.' : 'De noche, en superficie, el viento sopla de tierra hacia el mar.' };
  }
  // frentes: ahora es interactiva y en perspectiva (src/illustrations/interactivas/frentes.js)
  // isobaras: ahora es interactiva (src/illustrations/interactivas/isobaras.js)
  if (sys === 'frente-frio-corte' || sys === 'frente-calido-corte') {
    const frio = sys === 'frente-frio-corte';
    out.push(`<text x="${cx}" y="22" class="il-title">${frio ? 'Frente frío (en corte)' : 'Frente cálido (en corte)'}</text>`);
    out.push(`<rect x="0" y="230" width="${W}" height="30" fill="#38bdf8" opacity=".5"/>`);
    if (frio) {
      out.push(`<path d="M10,230 L10,90 Q120,100 190,230Z" fill="#2563eb" opacity=".3"/><text x="40" y="200" class="il-lbl" style="fill:#2563eb" font-weight="700">aire frío</text>`);
      out.push(`<text x="230" y="200" class="il-lbl" style="fill:#dc2626" font-weight="700">aire cálido</text>`);
      out.push(`<path d="M150,140 q-16,-6 -10,-24 q-6,-24 20,-28 q8,-28 40,-16 q30,-6 32,22 q20,8 6,30Z" fill="#94a3b8" stroke="#475569"/><text x="190" y="128" class="il-lbl" text-anchor="middle">Cb</text>`);
      for (let i = 0; i < 5; i++) out.push(`<line x1="${160 + i * 10}" y1="146" x2="${154 + i * 10}" y2="170" stroke="#2563eb"/>`);
      out.push(`<line x1="190" y1="240" x2="260" y2="240" stroke="#475569" stroke-width="2" marker-end="url(#mt-a)"/><text x="186" y="244" class="il-lbl" text-anchor="end">avanza</text>`);
    } else {
      out.push(`<path d="M10,230 L310,230 L310,200 Q160,170 10,60Z" fill="#dc2626" opacity=".18"/><text x="30" y="110" class="il-lbl" style="fill:#dc2626" font-weight="700">aire cálido (sube despacio)</text>`);
      out.push(`<path d="M120,230 Q220,200 310,200 L310,230Z" fill="#2563eb" opacity=".3"/><text x="230" y="222" class="il-lbl" style="fill:#2563eb" font-weight="700">aire frío</text>`);
      out.push(`<text x="130" y="196" class="il-lbl">Ns: lluvia continua</text><text x="200" y="150" class="il-lbl">As</text><text x="226" y="120" class="il-lbl">Ci · Cs (halo)</text>`);
      out.push(`<line x1="60" y1="244" x2="130" y2="244" stroke="#475569" stroke-width="2" marker-end="url(#mt-a)"/><text x="136" y="248" class="il-lbl">avanza</text>`);
    }
    out.push('</svg>');
    return {
      svg: out.join(''),
      caption: frio
        ? 'El aire frío entra como una cuña bajo el cálido y lo levanta bruscamente: cumulonimbos, chubascos, rachas y tormenta; tras el paso, rola el viento, baja la temperatura, sube la presión y el cielo se limpia.'
        : 'El aire cálido sube despacio por encima del frío: las nubes se anuncian de lejos (cirros, cirrostratos con halo, altostratos) y llega lluvia continua y débil con nimbostratos; baja la presión antes de su paso.',
    };
  }
  // nieblas: ahora son interactivas (src/illustrations/interactivas/nieblas.js)
  return null;
}

// Partes del barco y efecto de la hélice: en estilo C, en src/illustrations/laminas-c.js.

// Rosa (rumbo, demora y marcación): ahora es interactiva, en src/illustrations/interactivas/rosa.js.

// ---------------------------------------------------------------------------
// Banderas
// spec: { tipo:'bandera', codigo:'A'|'buceo'|'O'|'N'|'C'|'B'|'H'|'U'|'V'|'W' }

export const FLAGS = {
  A: { nombre: 'Bandera «A» (Alfa)', nota: 'Tengo un buzo sumergido: manténgase alejado y a poca velocidad.', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w / 2}" height="${h}" fill="#fff" stroke="#999"/><path d="M${x + w / 2},${y} L${x + w},${y} L${x + w * 0.75},${y + h / 2} L${x + w},${y + h} L${x + w / 2},${y + h}Z" fill="#1d4ed8"/>` },
  buceo: { nombre: 'Bandera de buceo (roja con diagonal blanca)', nota: 'Señala buceadores en inmersión (uso deportivo y recreativo).', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#dc2626"/><path d="M${x},${y} L${x + w * 0.18},${y} L${x + w},${y + h * 0.82} L${x + w},${y + h} L${x + w * 0.82},${y + h} L${x},${y + h * 0.18}Z" fill="#fff"/>` },
  O: { nombre: 'Bandera «O» (Oscar)', nota: '¡Hombre al agua!', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#facc15"/><path d="M${x},${y} L${x + w},${y} L${x + w},${y + h}Z" fill="#dc2626"/>` },
  N: { nombre: 'Bandera «N» (November)', nota: 'No (negativo). Con la «C» encima: señal de socorro (NC).', svg: (x, y, w, h) => [...Array(16)].map((_, i) => `<rect x="${x + (i % 4) * w / 4}" y="${y + Math.floor(i / 4) * h / 4}" width="${w / 4}" height="${h / 4}" fill="${(i + Math.floor(i / 4)) % 2 ? '#fff' : '#1d4ed8'}"/>`).join('') },
  C: { nombre: 'Bandera «C» (Charlie)', nota: 'Sí (afirmativo). NC = socorro.', svg: (x, y, w, h) => ['#1d4ed8', '#fff', '#dc2626', '#fff', '#1d4ed8'].map((c, i) => `<rect x="${x}" y="${y + (i * h) / 5}" width="${w}" height="${h / 5}" fill="${c}"/>`).join('') },
  B: { nombre: 'Bandera «B» (Bravo)', nota: 'Estoy cargando, descargando o transportando mercancías peligrosas.', svg: (x, y, w, h) => `<path d="M${x},${y} L${x + w},${y} L${x + w * 0.75},${y + h / 2} L${x + w},${y + h} L${x},${y + h}Z" fill="#dc2626"/>` },
  H: { nombre: 'Bandera «H» (Hotel)', nota: 'Tengo práctico a bordo.', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w / 2}" height="${h}" fill="#fff" stroke="#999"/><rect x="${x + w / 2}" y="${y}" width="${w / 2}" height="${h}" fill="#dc2626"/>` },
  U: { nombre: 'Bandera «U» (Uniform)', nota: 'Se dirige usted hacia un peligro.', svg: (x, y, w, h) => [0, 1, 2, 3].map((i) => `<rect x="${x + (i % 2) * w / 2}" y="${y + Math.floor(i / 2) * h / 2}" width="${w / 2}" height="${h / 2}" fill="${i === 0 || i === 3 ? '#dc2626' : '#fff'}"/>`).join('') },
  V: { nombre: 'Bandera «V» (Victor)', nota: 'Necesito asistencia.', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#999"/><path d="M${x},${y} L${x + w},${y + h} M${x + w},${y} L${x},${y + h}" stroke="#dc2626" stroke-width="${h / 5}"/>` },
  W: { nombre: 'Bandera «W» (Whiskey)', nota: 'Necesito asistencia médica.', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1d4ed8"/><rect x="${x + w / 6}" y="${y + h / 6}" width="${(w * 2) / 3}" height="${(h * 2) / 3}" fill="#fff"/><rect x="${x + w / 3}" y="${y + h / 3}" width="${w / 3}" height="${h / 3}" fill="#dc2626"/>` },
};

export function flagIllustration(spec) {
  const f = FLAGS[spec.codigo];
  if (!f) return null;
  const W = 300;
  const H = 170;
  const svg = `<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="${f.nombre}"><rect width="${W}" height="${H}" rx="10" class="il-panel"/>` +
    `<line x1="40" y1="20" x2="40" y2="150" stroke="#6b7280" stroke-width="3"/>` +
    `<g><g>${f.svg(42, 30, 120, 80)}</g><animateTransform attributeName="transform" type="skewY" values="0;2;0;-2;0" dur="2.4s" repeatCount="indefinite"/></g>` +
    `<text x="180" y="52" class="il-title left">${f.nombre.replace(/ \(.*/, '')}</text>` +
    `<foreignObject x="176" y="60" width="116" height="90"><div xmlns="http://www.w3.org/1999/xhtml" class="il-fo">${f.nota}</div></foreignObject></svg>`;
  return { svg, caption: f.nota };
}
