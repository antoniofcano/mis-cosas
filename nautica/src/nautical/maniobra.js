// Motor de maniobra de un yate de motor de una hélice, en planta: curva de evolución, maniobras de hombre al agua
// (Boutakow o Williamson, Anderson y Scharnow) y el andar de la hélice. Funciones puras: lo mismo da las animaciones de
// las láminas (src/illustrations/animaciones/), sus imágenes fijas y los tests.
//
// Hipótesis del modelo (docs/ESTILO-LAMINAS.md, apéndice):
//  · Barco de ejemplo: 12 m de eslora a 6 nudos (3,09 m/s). Unidades: metros y segundos; rumbos náuticos (0 = la proa
//    inicial, sentido horario); x hacia la derecha (estribor del rumbo inicial) e y hacia delante.
//  · Rumbo: modelo de Nomoto de primer orden, T·ṙ + r = δ·U/R, con R = 1,5 esloras de radio de régimen con todo el timón
//    (diámetro final ≈ 3 esloras, propio de un yate; un mercante anda por 3–5) y T = 3,5 s de retardo.
//  · Deriva: el barco gira «derrapando», con la proa por dentro de la trayectoria: ángulo de deriva de hasta 15° que se
//    desarrolla con T = 6 s. Pierde un 30 % de velocidad en el giro.
//  · Al meter el timón, la fuerza de la pala empuja la popa hacia fuera y el barco se desplaza un poco hacia la banda
//    contraria antes de caer (desplazamiento lateral inicial, «kick»), que se apaga en unos 3 s.
//  · El timón va de la vía a la banda en 1,7 s (0,6 de recorrido por segundo).
//  · Con estos números, la curva de Boutakow con el cambio a 60° y la de Scharnow con el cambio a 240° vuelven sobre la
//    derrota inicial (a menos de 0,25 esloras) al rumbo opuesto, como dice el IAMSAR para un barco típico.

export const YATE = {
  eslora: 12, manga: 4, v0: 3.09, radio: 1.5, T: 3.5, Tb: 6, deriva: 15, perdida: 0.3, tasaTimon: 0.6, kick: 0.2, Tkick: 3, Tv: 6,
};

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const lim = (v, a = -1, b = 1) => Math.min(b, Math.max(a, v));
/** Ángulo náutico de un vector (dx, dy) con y hacia delante. */
export const demora = (dx, dy) => ((deg(Math.atan2(dx, dy)) % 360) + 360) % 360;
/** Diferencia angular b − a en (−180, 180]. */
export const difAng = (a, b) => { const d = (((b - a) % 360) + 540) % 360 - 180; return d === -180 ? 180 : d; };

/**
 * Integra el movimiento. `plan(st, e)` devuelve { timon: −1…1 (+ a estribor), v: velocidad pedida en m/s } o null para
 * terminar; `st` guarda la fase de la maniobra y `e` es el estado del barco ({ t, x, y, rumbo, r, v }).
 * @returns {{ t: number, x: number, y: number, rumbo: number, r: number, v: number, timon: number, fase: number }[]}
 */
export function simula(plan, { barco = YATE, dt = 0.02, tMax = 240, x = 0, y = 0, rumbo = 0 } = {}) {
  const B = barco;
  const R = B.radio * B.eslora;
  let psi = rad(rumbo);
  let r = 0;
  let beta = 0;
  let d = 0;
  let df = 0;
  let vb = B.v0;
  let t = 0;
  const st = { fase: 0 };
  const out = [];
  const muestra = (v) => out.push({ t, x, y, rumbo: deg(psi), r: deg(r), v, timon: d, fase: st.fase });
  while (t <= tMax) {
    const U = vb * (1 - B.perdida * Math.min(1, (Math.abs(r) * R) / Math.max(vb, 0.05)));
    const p = plan(st, { t, x, y, rumbo: deg(psi), r: deg(r), v: U });
    if (!p) break;
    muestra(U);
    d += lim(p.timon - d, -B.tasaTimon * dt, B.tasaTimon * dt);
    vb += ((p.v ?? B.v0) - vb) * (dt / B.Tv);
    r += ((d * U) / R - r) * (dt / B.T);
    beta += ((rad(B.deriva) * (r * R)) / Math.max(B.v0 * (1 - B.perdida), 0.05) - beta) * (dt / B.Tb);
    df += (d - df) * (dt / B.Tkick);
    const chi = psi - beta - B.kick * (d - df);
    x += U * Math.sin(chi) * dt;
    y += U * Math.cos(chi) * dt;
    psi += r * dt;
    t += dt;
  }
  return out;
}

/** Posición de un punto del casco: f = +0,5 la proa, −0,5 la popa, 0 el centro (el que sigue la trayectoria). */
export function puntoCasco(m, f, barco = YATE) {
  return [m.x + Math.sin(rad(m.rumbo)) * f * barco.eslora, m.y + Math.cos(rad(m.rumbo)) * f * barco.eslora];
}

/** Interpola las muestras en el instante t (en segundos de la maniobra). */
export function enInstante(muestras, t) {
  if (t <= muestras[0].t) return muestras[0];
  const n = muestras.length - 1;
  if (t >= muestras[n].t) return muestras[n];
  const dt = muestras[1].t - muestras[0].t;
  const i = Math.min(n - 1, Math.floor((t - muestras[0].t) / dt));
  const a = muestras[i];
  const b = muestras[i + 1];
  const k = (t - a.t) / (b.t - a.t);
  const m = {};
  for (const key of Object.keys(a)) m[key] = key === 'fase' ? a.fase : a[key] + (b[key] - a[key]) * k;
  return m;
}

const memo = new Map();
const memoiza = (clave, fn) => { if (!memo.has(clave)) memo.set(clave, fn()); return memo.get(clave); };

// ---------------------------------------------------------------------------
// Curva de evolución: rumbo inicial unos segundos y todo el timón a una banda, hasta dar la vuelta completa.

/**
 * @param {{ banda?: 'estribor'|'babor', previo?: number }} o  previo: segundos a rumbo antes de meter el timón
 * @returns {{ muestras, t0: number, avance: number, traslado: number, diametroTactico: number, diametroFinal: number,
 *   kick: number, t90: number, t180: number, t360: number, p90, p180 }}  distancias en metros, medidas desde donde se mete el timón
 */
export function curvaEvolucion({ banda = 'estribor', previo = 3 } = {}) {
  return memoiza(`ev|${banda}|${previo}`, () => {
    const s = banda === 'babor' ? -1 : 1;
    const t0 = previo;
    const muestras = simula((st, e) => {
      if (e.t < t0) return { timon: 0 };
      if (Math.abs(e.rumbo) > 362) return null;
      return { timon: s };
    }, { tMax: 150 });
    const m0 = enInstante(muestras, t0);
    const cruza = (a) => muestras.find((m) => Math.abs(m.rumbo) >= a);
    const p90 = cruza(90);
    const p180 = cruza(180);
    const p360 = cruza(360);
    // diámetro final: el del círculo ya estabilizado (otra vuelta más, de 360° a 720°)
    const regimen = simula((st, e) => (Math.abs(e.rumbo) > 720 ? null : { timon: s }), { tMax: 200 }).filter((m) => Math.abs(m.rumbo) >= 400);
    const xs = regimen.map((m) => m.x);
    const ys = regimen.map((m) => m.y);
    return {
      muestras, t0, banda,
      avance: p90.y - m0.y,
      traslado: Math.abs(p90.x - m0.x),
      diametroTactico: Math.abs(p180.x - m0.x),
      diametroFinal: Math.max(...xs) - Math.min(...xs),
      centroFinal: [(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2],
      kick: Math.max(0, -s * Math.min(...muestras.map((m) => s * (m.x - m0.x)))),
      t90: p90.t, t180: p180.t, t360: p360.t, p90, p180, m0,
    };
  });
}

// ---------------------------------------------------------------------------
// Hombre al agua (IAMSAR, vol. III, sección 2): Boutakow (Williamson), Anderson (una vuelta) y Scharnow.

export const MANIOBRAS_HAA = ['boutakow', 'anderson', 'scharnow'];
/** Ángulos de la regla (los del IAMSAR para un barco típico). */
export const REGLA_HAA = { boutakow: 60, anderson: 250, scharnow: 240, antes: 20 };

/** Gobierno a un rumbo con el timón (proporcional y amortiguado). */
const gobierna = (e, rumbo) => lim(0.08 * difAng(e.rumbo, rumbo) - 0.25 * e.r);

/**
 * Derrota de una maniobra de hombre al agua, con el timón a estribor (la persona cae por estribor).
 * @returns {{ maniobra, muestras, mob: [number, number], previa: [number, number][], momentos: { [k: string]: number } }}
 *   mob: dónde está la persona (en el agua, que es la referencia: la corriente arrastra igual al barco y a ella);
 *   previa: la derrota antes de la alarma; momentos: segundos en que empieza cada fase.
 */
export function hombreAlAgua(maniobra = 'boutakow') {
  if (!MANIOBRAS_HAA.includes(maniobra)) maniobra = 'boutakow';
  return memoiza(`haa|${maniobra}`, () => {
    const L = YATE.eslora;
    const v0 = YATE.v0;
    // Boutakow y Anderson: acción inmediata, la persona cae junto a la aleta de estribor. Scharnow: acción retrasada,
    // la persona cayó hace un rato y está en la estela, por la popa.
    const mob = maniobra === 'scharnow' ? [0, -6 * L] : [0.32 * L, -0.42 * L];
    const momentos = { alarma: 0 };
    const marca = (st, k, e) => { if (momentos[k] == null) momentos[k] = e.t; st.fase += 1; };
    // aproximación final: despacio, y para al llegar con la persona por el costado (a menos de un tercio de eslora)
    const aproxima = (e, rumbo) => {
      const dist = Math.hypot(mob[0] - e.x, mob[1] - e.y);
      return { timon: gobierna(e, rumbo), v: v0 * lim(dist / (6 * L), 0.22, 1) };
    };
    const llegada = (e) => {
      // la persona, por el través o algo a proa: distancia a lo largo del rumbo menor que media eslora
      const a = rad(e.rumbo);
      const delante = (mob[0] - e.x) * Math.sin(a) + (mob[1] - e.y) * Math.cos(a);
      return delante < 0.15 * L && Math.hypot(mob[0] - e.x, mob[1] - e.y) < 2 * L;
    };
    let plan;
    if (maniobra === 'boutakow') {
      plan = (st, e) => {
        if (st.fase === 0) { if (e.rumbo >= REGLA_HAA.boutakow) marca(st, 'cambio', e); return { timon: 1 }; }
        if (st.fase === 1) { if (e.rumbo <= -180 + REGLA_HAA.antes) marca(st, 'via', e); return { timon: -1 }; }
        if (st.fase === 2) { if (Math.abs(difAng(e.rumbo, 180)) < 2 && Math.abs(e.r) < 1) marca(st, 'opuesto', e); return { timon: gobierna(e, 180) }; }
        if (llegada(e)) { momentos.recogida = e.t; return null; }
        return aproxima(e, 180);
      };
    } else if (maniobra === 'anderson') {
      plan = (st, e) => {
        if (st.fase === 0) { if (e.rumbo >= REGLA_HAA.anderson) marca(st, 'via', e); return { timon: 1 }; }
        // a la vía y moderar: el barco termina de caer y va perdiendo arrancada; luego se gobierna, con poco timón,
        // hacia la persona
        const dist = Math.hypot(mob[0] - e.x, mob[1] - e.y);
        const v = v0 * lim(dist / (5 * L), 0.22, 0.75);
        if (st.fase === 1) { if (e.t - momentos.via > 5) marca(st, 'aproxima', e); return { timon: 0, v }; }
        if (llegada(e)) { momentos.recogida = e.t; return null; }
        const rumbo = demora(mob[0] - e.x, mob[1] - e.y);
        return { timon: lim(0.05 * difAng(e.rumbo, rumbo) - 0.2 * e.r, -0.35, 0.35), v };
      };
    } else {
      plan = (st, e) => {
        if (st.fase === 0) { if (e.rumbo >= REGLA_HAA.scharnow) marca(st, 'cambio', e); return { timon: 1 }; }
        if (st.fase === 1) { if (e.rumbo <= 180 + REGLA_HAA.antes) marca(st, 'via', e); return { timon: -1 }; }
        if (st.fase === 2) { if (Math.abs(difAng(e.rumbo, 180)) < 2 && Math.abs(e.r) < 1) marca(st, 'opuesto', e); return { timon: gobierna(e, 180) }; }
        if (llegada(e)) { momentos.recogida = e.t; return null; }
        return aproxima(e, 180);
      };
    }
    const muestras = simula(plan, { tMax: 260 });
    const previa = maniobra === 'scharnow' ? [mob, [0, 0]] : [[0, -3 * L], [0, 0]];
    return { maniobra, muestras, mob, previa, momentos };
  });
}

// ---------------------------------------------------------------------------
// Andar de la hélice: el barco parado, se da avante o atrás con el timón a la vía y la presión lateral de las palas
// hace caer la popa (src/nautical/helice.js dice a qué banda). El barco gira alrededor de su punto de giro: a un tercio
// de la eslora desde la proa yendo avante y desde la popa yendo atrás.
//  · Hipótesis: avante coge 1,5 m/s (3 nudos) y la popa cae a 1,2°/s, menos a medida que coge arrancada (el timón y la
//    quilla lo aguantan); atrás coge 1 m/s y la popa cae a 4,5°/s: en 12 s, unos 45°.

/**
 * @param {{ marcha: 'avante'|'atras', popa: 'estribor'|'babor', duracion?: number }} o
 * @returns {{ t, x, y, rumbo, v }[]}  x, y del centro del casco
 */
export function andarHelice({ marcha = 'atras', popa = 'babor', duracion = 14 } = {}) {
  return memoiza(`hel|${marcha}|${popa}|${duracion}`, () => {
    const atras = marcha === 'atras';
    const L = YATE.eslora;
    const vObj = atras ? -1 : 1.5;
    // popa a babor → la proa cae a estribor → el rumbo aumenta
    const s = popa === 'babor' ? 1 : -1;
    const dPivote = (atras ? -1 : 1) * (L / 6); // del centro al punto de giro, hacia proa
    const dt = 0.02;
    let [px, py] = [0, dPivote]; // el punto de giro
    let psi = 0;
    let r = 0;
    let v = 0;
    const out = [];
    for (let t = 0; t <= duracion + 1e-9; t += dt) {
      const cx = px - Math.sin(psi) * dPivote;
      const cy = py - Math.cos(psi) * dPivote;
      out.push({ t, x: cx, y: cy, rumbo: deg(psi), v });
      const rObj = atras ? 4.5 : 1.2 * (1 - 0.6 * Math.min(1, v / 1.5));
      r += (rad(s * rObj) - r) * (dt / 3);
      v += (vObj - v) * (dt / 5);
      px += Math.sin(psi) * v * dt;
      py += Math.cos(psi) * v * dt;
      psi += r * dt;
    }
    return out;
  });
}
