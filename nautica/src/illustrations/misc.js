// Ilustraciones: meteorología, partes del barco, efecto de la hélice, rosa (rumbo/demora/marcación) y banderas.

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
  if (sys === 'borrasca' || sys === 'anticiclon') {
    const B = sys === 'borrasca';
    out.push(`<text x="${cx}" y="22" class="il-title">${B ? 'Borrasca (B) · hemisferio norte' : 'Anticiclón (A) · hemisferio norte'}</text>`);
    [36, 64, 92].forEach((r, i) => out.push(`<ellipse cx="${cx}" cy="${cy}" rx="${r * 1.35}" ry="${r}" fill="none" stroke="#64748b" stroke-width="1"/><text x="${cx + r * 1.35 + 2}" y="${cy - 2}" font-size="8" fill="#64748b">${B ? 996 + i * 4 : 1032 - i * 4}</text>`));
    out.push(`<text x="${cx}" y="${cy + 9}" font-size="26" font-weight="700" text-anchor="middle" fill="${B ? '#dc2626' : '#2563eb'}">${B ? 'B' : 'A'}</text>`);
    // flechas de viento: en la borrasca giran en sentido antihorario y convergen; en el anticiclón, horario y divergen
    const arrows = [];
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const r = 78;
      const x = cx + Math.cos(a) * r * 1.35;
      const y = cy + Math.sin(a) * r;
      const tang = B ? a - Math.PI / 2 : a + Math.PI / 2; // dirección del giro (y hacia abajo)
      const radial = B ? -0.35 : 0.35;
      const dx = Math.cos(tang) + Math.cos(a) * radial;
      const dy = Math.sin(tang) + Math.sin(a) * radial;
      const n = Math.hypot(dx, dy);
      arrows.push(`<line x1="${x - (dx / n) * 12}" y1="${y - (dy / n) * 12}" x2="${x + (dx / n) * 12}" y2="${y + (dy / n) * 12}" stroke="#2563eb" stroke-width="2.4" marker-end="url(#mt-a)"/>`);
    }
    out.push(`<g>${arrows.join('')}<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="${B ? -360 : 360} ${cx} ${cy}" dur="24s" repeatCount="indefinite"/></g>`);
    out.push(`<text x="${cx}" y="${H - 10}" class="il-lbl" text-anchor="middle">${B ? 'Giro antihorario y hacia el centro · baja presión · mal tiempo' : 'Giro horario y hacia fuera · alta presión · buen tiempo'}</text>`);
    out.push('</svg>');
    return { svg: out.join(''), caption: B ? 'En el hemisferio norte el viento gira alrededor de la borrasca en sentido contrario a las agujas del reloj, entrando hacia el centro.' : 'En el hemisferio norte el viento gira alrededor del anticiclón en el sentido de las agujas del reloj, saliendo hacia fuera.' };
  }
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
  if (sys === 'frentes') {
    out.push(`<text x="${cx}" y="22" class="il-title">Símbolos de los frentes</text>`);
    const row = (y, color, kind, txt) => {
      out.push(`<line x1="30" y1="${y}" x2="290" y2="${y}" stroke="${color}" stroke-width="3"/>`);
      for (let x = 40; x < 290; x += 34) {
        if (kind === 'frio') out.push(`<path d="M${x},${y} L${x + 10},${y - 14} L${x + 20},${y}Z" fill="${color}"/>`);
        if (kind === 'calido') out.push(`<path d="M${x},${y} A10,10 0 0 1 ${x + 20},${y}Z" fill="${color}"/>`);
        if (kind === 'ocluido') out.push(x % 68 < 34 ? `<path d="M${x},${y} L${x + 10},${y - 14} L${x + 20},${y}Z" fill="${color}"/>` : `<path d="M${x},${y} A10,10 0 0 1 ${x + 20},${y}Z" fill="${color}"/>`);
      }
      out.push(`<text x="30" y="${y + 18}" class="il-lbl">${txt}</text>`);
    };
    row(70, '#2563eb', 'frio', 'Frente frío: triángulos azules');
    row(140, '#dc2626', 'calido', 'Frente cálido: semicírculos rojos');
    row(210, '#7c3aed', 'ocluido', 'Frente ocluido: triángulos y semicírculos (morado)');
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Los símbolos apuntan hacia donde avanza el frente.' };
  }
  if (sys === 'isobaras') {
    out.push(`<text x="${cx}" y="22" class="il-title">Isobaras juntas = viento fuerte</text>`);
    for (let i = 0; i < 6; i++) out.push(`<path d="M20,${60 + i * 12} C110,${50 + i * 12} 140,${70 + i * 12} 300,${60 + i * 12}" fill="none" stroke="#64748b"/>`);
    for (let i = 0; i < 3; i++) out.push(`<path d="M20,${150 + i * 34} C110,${140 + i * 34} 140,${160 + i * 34} 300,${150 + i * 34}" fill="none" stroke="#64748b"/>`);
    out.push(`<line x1="90" y1="96" x2="170" y2="84" stroke="#dc2626" stroke-width="4" marker-end="url(#mt-a)"/><text x="182" y="88" class="il-lbl" style="fill:#dc2626">fuerte</text>`);
    out.push(`<line x1="90" y1="186" x2="120" y2="182" stroke="#2563eb" stroke-width="2" marker-end="url(#mt-a)"/><text x="132" y="186" class="il-lbl" style="fill:#2563eb">flojo</text>`);
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Las isobaras unen puntos de igual presión. Cuanto más juntas están (más gradiente de presión), más fuerte sopla el viento.' };
  }
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
  if (sys === 'niebla-adveccion' || sys === 'niebla-radiacion') {
    const adv = sys === 'niebla-adveccion';
    out.push(`<text x="${cx}" y="22" class="il-title">${adv ? 'Niebla de advección' : 'Niebla de radiación'}</text>`);
    out.push(`<rect x="0" y="190" width="${adv ? W : 140}" height="70" fill="#38bdf8" opacity=".5"/>`);
    if (!adv) out.push(`<rect x="140" y="180" width="180" height="80" fill="#a16207" opacity=".8"/><circle cx="60" cy="56" r="14" fill="#e5e7eb"/><text x="60" y="84" class="il-lbl" text-anchor="middle">noche despejada</text>`);
    const fog = adv ? 'M0,150 Q80,135 160,150 T320,150 L320,190 L0,190Z' : 'M140,150 Q200,140 260,152 T320,150 L320,180 L140,180Z';
    out.push(`<path d="${fog}" fill="#cbd5e1" opacity=".85"><animate attributeName="opacity" values=".55;.95;.55" dur="5s" repeatCount="indefinite"/></path>`);
    if (adv) out.push(`<line x1="20" y1="110" x2="120" y2="110" stroke="#dc2626" stroke-width="3" marker-end="url(#mt-a)"/><text x="20" y="100" class="il-lbl" style="fill:#dc2626">aire templado y húmedo</text><text x="180" y="230" class="il-lbl" style="fill:#1e3a8a" font-weight="700">mar más fría</text>`);
    else out.push(`<text x="230" y="230" class="il-lbl" text-anchor="middle" style="fill:#fff" font-weight="700">la tierra se enfría</text>`);
    out.push('</svg>');
    return {
      svg: out.join(''),
      caption: adv
        ? 'Aire templado y húmedo que se desplaza sobre una superficie más fría (agua fría) y se enfría hasta saturarse. Es la niebla típica de la mar y puede durar días aunque sople el viento.'
        : 'Se forma en tierra en noches despejadas y con poco viento, cuando el suelo pierde calor por radiación. Suele disiparse por la mañana al calentar el sol y afecta poco a la mar abierta.',
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Partes del barco
// spec: { tipo:'barco', resaltar:[...] }  partes: proa, popa, babor, estribor, crujia, eslora, manga, puntal, calado,
//        obra-viva, obra-muerta, francobordo, amura, aleta, traves, linea-flotacion

export function boatIllustration(spec) {
  const hl = new Set(spec.resaltar ?? []);
  const W = 360;
  const H = 300;
  const on = (k) => (hl.size === 0 || hl.has(k) ? 'il-part on' : 'il-part');
  const out = [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="Partes del barco">`, `<rect width="${W}" height="${H}" rx="10" class="il-panel"/>`, arrowDefs('bt-a', '#475569')];
  // Planta
  out.push(`<text x="12" y="20" class="il-lbl strong">Planta</text>`);
  out.push(`<path d="M40,80 L250,80 Q320,95 320,105 Q320,115 250,130 L40,130 Z" class="il-hull-plan"/>`);
  out.push(`<line x1="30" y1="105" x2="335" y2="105" class="${on('crujia')}" stroke-dasharray="6 4"/><text x="150" y="101" class="${on('crujia')} t">crujía</text>`);
  out.push(`<text x="322" y="78" class="${on('proa')} t">proa</text><text x="10" y="110" class="${on('popa')} t">popa</text>`);
  out.push(`<text x="140" y="70" class="${on('babor')} t">babor (rojo)</text><text x="140" y="148" class="${on('estribor')} t">estribor (verde)</text>`);
  out.push(`<text x="262" y="70" class="${on('amura')} t">amura</text><text x="44" y="70" class="${on('aleta')} t">aleta</text><text x="196" y="160" class="${on('traves')} t">través ↓</text>`);
  out.push(`<line x1="40" y1="168" x2="320" y2="168" class="${on('eslora')}" marker-start="url(#bt-a)" marker-end="url(#bt-a)"/><text x="180" y="182" class="${on('eslora')} t">eslora</text>`);
  out.push(`<line x1="225" y1="80" x2="225" y2="130" class="${on('manga')}" marker-start="url(#bt-a)" marker-end="url(#bt-a)"/><text x="230" y="120" class="${on('manga')} t">manga</text>`);
  // Perfil
  out.push(`<text x="12" y="205" class="il-lbl strong">Sección</text>`);
  out.push(`<rect x="120" y="230" width="120" height="16" class="il-water-cut"/>`);
  out.push(`<path d="M110,210 L250,210 L240,262 L120,262 Z" class="il-hull-plan"/>`);
  out.push(`<line x1="100" y1="232" x2="262" y2="232" class="${on('linea-flotacion')}" stroke="#0ea5e9"/><text x="200" y="246" class="${on('linea-flotacion')} t">flotación</text>`);
  out.push(`<text x="150" y="226" class="${on('obra-muerta')} t">obra muerta</text><text x="152" y="256" class="${on('obra-viva')} t">obra viva</text>`);
  out.push(`<line x1="96" y1="210" x2="96" y2="262" class="${on('puntal')}" marker-start="url(#bt-a)" marker-end="url(#bt-a)"/><text x="40" y="240" class="${on('puntal')} t">puntal</text>`);
  out.push(`<line x1="300" y1="232" x2="300" y2="262" class="${on('calado')}" marker-start="url(#bt-a)" marker-end="url(#bt-a)"/><text x="306" y="252" class="${on('calado')} t">calado</text>`);
  out.push(`<line x1="282" y1="210" x2="282" y2="232" class="${on('francobordo')}" marker-start="url(#bt-a)" marker-end="url(#bt-a)"/><text x="288" y="222" class="${on('francobordo')} t">francobordo</text>`);
  out.push('</svg>');
  return { svg: out.join(''), caption: hl.size ? `Fíjate en: ${[...hl].join(', ').replace(/-/g, ' ')}.` : 'Partes principales del barco.' };
}

// ---------------------------------------------------------------------------
// Efecto de la hélice
// spec: { tipo:'helice', sentido:'dextrogira'|'levogira', marcha:'avante'|'atras' }

export function propellerIllustration(spec) {
  const dex = spec.sentido !== 'levogira';
  const atras = spec.marcha === 'atras';
  // giro visto desde popa: dextrógira avante = horario. Dando atrás invierte.
  const cw = dex !== atras;
  // Dando atrás: dextrógira → la popa cae a babor; levógira → a estribor. Avante (efecto menor): al revés.
  const caida = atras ? (dex ? 'babor' : 'estribor') : (dex ? 'estribor' : 'babor');
  const W = 320;
  const H = 230;
  const out = [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="Efecto de la hélice">`, `<rect width="${W}" height="${H}" rx="10" class="il-panel"/>`, arrowDefs('pr-a', '#e11d48')];
  out.push(`<text x="${W / 2}" y="22" class="il-title">Hélice ${dex ? 'dextrógira' : 'levógira'} dando ${atras ? 'atrás' : 'avante'}</text>`);
  out.push(`<text x="80" y="44" class="il-lbl" text-anchor="middle">vista desde popa</text>`);
  out.push(`<circle cx="80" cy="120" r="50" fill="none" stroke="#94a3b8"/>`);
  out.push(`<g><path d="M80,120 C70,90 76,74 80,70 C84,74 90,90 80,120 M80,120 C110,130 122,126 126,122 C120,116 104,112 80,120 M80,120 C64,140 56,154 54,160 C62,158 74,148 80,120" fill="#94a3b8" stroke="#475569"/>` +
    `<animateTransform attributeName="transform" type="rotate" from="0 80 120" to="${cw ? 360 : -360} 80 120" dur="1.6s" repeatCount="indefinite"/></g>`);
  out.push(`<text x="80" y="190" class="il-lbl" text-anchor="middle">gira ${cw ? 'a la derecha (horario)' : 'a la izquierda (antihorario)'}</text>`);
  // planta con la caída de popa
  const dir = caida === 'babor' ? -1 : 1; // en planta con proa hacia arriba: babor = izquierda
  out.push(`<g transform="translate(230 120)"><g><path d="M0,-60 Q16,-40 16,0 L16,50 L-16,50 L-16,0 Q-16,-40 0,-60Z" class="il-hull-plan"/>` +
    `<animateTransform attributeName="transform" type="rotate" values="0 0 0; ${-dir * 14} 0 0; 0 0 0" dur="3s" repeatCount="indefinite"/></g>` +
    `<path d="M${dir * 22},40 L${dir * 46},40" stroke="#e11d48" stroke-width="3" marker-end="url(#pr-a)"/>` +
    `<text x="0" y="78" class="il-lbl" text-anchor="middle">la popa cae a ${caida}</text><text x="0" y="-68" class="il-lbl" text-anchor="middle">proa</text></g>`);
  out.push('</svg>');
  return { svg: out.join(''), caption: `Con hélice ${dex ? 'dextrógira' : 'levógira'}, dando ${atras ? 'atrás' : 'avante'} la popa tiende a caer a ${caida}${atras ? ' (efecto muy marcado al dar atrás)' : ''}.` };
}

// ---------------------------------------------------------------------------
// Rosa: rumbo, demora y marcación
// spec: { tipo:'rosa', rumbo, demora?, marcacion?: bool, etiqueta? }

export function roseIllustration(spec) {
  const W = 300;
  const H = 300;
  const c = 150;
  const R = 110;
  const pol = (deg, r) => [c + Math.sin((deg * Math.PI) / 180) * r, c - Math.cos((deg * Math.PI) / 180) * r];
  const out = [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="Rumbo y demora">`, `<rect width="${W}" height="${H}" rx="10" class="il-panel"/>`, arrowDefs('rs-a', '#2563eb'), arrowDefs('rs-b', '#7c3aed')];
  out.push(`<circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="#94a3b8"/>`);
  for (let d = 0; d < 360; d += 10) {
    const [x1, y1] = pol(d, R);
    const [x2, y2] = pol(d, d % 90 ? R - 6 : R - 12);
    out.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#94a3b8"/>`);
  }
  [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([t, d]) => { const [x, y] = pol(d, R + 14); out.push(`<text x="${x}" y="${y + 4}" font-size="12" font-weight="700" text-anchor="middle" fill="currentColor">${t}</text>`); });
  if (spec.rumbo != null) {
    const [x, y] = pol(spec.rumbo, R - 16);
    out.push(`<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="#2563eb" stroke-width="3" marker-end="url(#rs-a)"/><text x="${x}" y="${y - 6}" font-size="11" fill="#2563eb" text-anchor="middle">rumbo ${String(spec.rumbo).padStart(3, '0')}°</text>`);
  }
  if (spec.demora != null) {
    const [x, y] = pol(spec.demora, R - 10);
    out.push(`<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="#7c3aed" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#rs-b)"/><circle cx="${x}" cy="${y}" r="6" fill="#facc15" stroke="#a16207"/><text x="${x}" y="${y + 18}" font-size="11" fill="#7c3aed" text-anchor="middle">${spec.etiqueta ?? 'objeto'}: demora ${String(spec.demora).padStart(3, '0')}°</text>`);
    if (spec.marcacion && spec.rumbo != null) {
      const m = (((spec.demora - spec.rumbo) % 360) + 360) % 360;
      const sb = m <= 180;
      const a0 = spec.rumbo;
      const a1 = spec.demora;
      const [sx, sy] = pol(a0, 40);
      const [ex, ey] = pol(a1, 40);
      out.push(`<path d="M${sx},${sy} A40,40 0 0 ${sb ? 1 : 0} ${ex},${ey}" fill="none" stroke="#e11d48" stroke-width="2"/>`);
      out.push(`<text x="${c}" y="${H - 12}" font-size="11" fill="#e11d48" text-anchor="middle">marcación ${sb ? m : 360 - m}° por ${sb ? 'estribor' : 'babor'} (desde la proa)</text>`);
    }
  }
  out.push(`<circle cx="${c}" cy="${c}" r="4" fill="currentColor"/>`);
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Rumbo y demora se miden desde el norte, en el sentido de las agujas del reloj; la marcación se mide desde la proa.' };
}

// ---------------------------------------------------------------------------
// Banderas
// spec: { tipo:'bandera', codigo:'A'|'buceo'|'O'|'N'|'C'|'B'|'H'|'U'|'V'|'W' }

const FLAGS = {
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
