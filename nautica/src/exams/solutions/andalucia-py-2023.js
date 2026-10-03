// Soluciones programadas PY Andalucía, convocatorias de 2023. Ver andalucia-py.js para el formato.
import { hrb } from '../kit.js';
import { rhumbTo, rhumbDestination, toPlane, fromPlane, unitsPerMile } from '../../math/mercator.js';
import { norm360 } from '../../math/angles.js';
import { fmtBearing, fmtPos, fmtMiles } from '../../math/format.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const E = 90; const S = 180; const SW = 225; const W = 270; const NW = 315;
const coma = (x, dec = 1) => x.toFixed(dec).replace('.', ',');
const nm = (p) => p.name.replace(/^Faro de /, 'faro de ');

// ---- Operaciones locales (candidatas al kit)

/** Cortes de la circunferencia (centro c, radio en millas) con la recta que pasa por p con dirección dv (copiada de 2022). */
function cortesRectaArco(p, dv, c, radio) {
  const u = unitsPerMile((p.lat + c.lat) / 2);
  const P0 = toPlane(p); const C = toPlane(c);
  const dx = Math.sin(dv * Math.PI / 180); const dy = Math.cos(dv * Math.PI / 180);
  const fx = P0.x - C.x; const fy = P0.y - C.y; const R = radio * u;
  const b = fx * dx + fy * dy; const disc = b * b - (fx * fx + fy * fy - R * R);
  if (disc < 0) return [];
  return [-b - Math.sqrt(disc), -b + Math.sqrt(disc)].map((t) => fromPlane({ x: P0.x + t * dx, y: P0.y + t * dy }));
}

/** Cortes de dos circunferencias (centros a y b como puntos, radios en millas) (copiada de 2022). */
function cortesDosArcos(a, ra, b, rb) {
  const u = unitsPerMile((a.lat + b.lat) / 2);
  const pa = toPlane(a); const pb = toPlane(b); const RA = ra * u; const RB = rb * u;
  const dx = pb.x - pa.x; const dy = pb.y - pa.y; const d = Math.hypot(dx, dy);
  const x = (RA * RA - RB * RB + d * d) / (2 * d); const h = Math.sqrt(Math.max(0, RA * RA - x * x));
  const m = { x: pa.x + (dx * x) / d, y: pa.y + (dy * x) / d };
  return [{ x: m.x - (dy * h) / d, y: m.y + (dx * h) / d }, { x: m.x + (dy * h) / d, y: m.y - (dx * h) / d }].map(fromPlane);
}

/** Distancias no simultáneas: el centro del 1er arco se traslada lo navegado y se corta con el 2º arco (copiada de 2022). */
function trasladoDosArcos(k, a, da, b, db, rumbo, millas, elegir, label) {
  const A = k.P(a); const B = k.P(b);
  const A2 = rhumbDestination(A, rumbo, millas);
  const cortes = cortesDosArcos(A2, da, B, db);
  const p = elegir(cortes);
  k.note('Traslado de la 1ª línea', `La 1ª línea de posición es el arco de ${fmtMiles(da)} con centro en ${nm(A)}. Trasladamos su centro lo navegado entre las dos observaciones, ${fmtBearing(rumbo)} y ${fmtMiles(millas)}: nuevo centro en ${fmtPos(A2)}, y desde él trazamos de nuevo el arco de ${fmtMiles(da)}.`);
  k.items.push({ t: 'vec', from: A, bearing: rumbo, length: millas, style: 'construction', step: k.steps.length },
    { t: 'arc', center: A2, radius: da, around: rhumbTo(A2, p).bearing, span: 40, label: 'trasladada', style: 'lop2', step: k.steps.length });
  k.note(label, `Con centro en ${nm(B)} trazamos el arco de ${fmtMiles(db)}: los dos arcos se cortan en ${cortes.map((c) => fmtPos(c)).join(' y en ')}. Nos quedamos con ${fmtPos(p)}, el corte en el mar.`);
  k.items.push({ t: 'arc', center: B, radius: db, around: rhumbTo(B, p).bearing, span: 40, style: 'lop', step: k.steps.length },
    { t: 'pos', at: p, label, style: 'fix', step: k.steps.length });
  k.focus.push(A, B, p);
  return p;
}

/**
 * Distancia navegada hasta avistar una luz: corte de nuestra derrota (desde `from`, rumbo `rumbo`)
 * con la circunferencia de su alcance luminoso. Devuelve las millas hasta el primer corte.
 */
function distanciaAvistar(k, from, rumbo, id, alcance) {
  const F = k.P(id);
  const cortes = cortesRectaArco(from, rumbo, F, alcance);
  const delante = cortes.map((c) => ({ c, r: rhumbTo(from, c) })).filter((x) => Math.abs(norm360(x.r.bearing - rumbo + 180) - 180) < 90)
    .sort((u, v) => u.r.distance - v.r.distance);
  if (!delante.length) throw new Error('La derrota no entra en el alcance de la luz');
  const { c: p, r } = delante[0];
  k.note('Situación al avistar la luz', `Con centro en ${nm(F)} trazamos la circunferencia de su alcance luminoso, ${fmtMiles(alcance)}. Nuestra derrota ${fmtBearing(rumbo)} entra en ella en ${fmtPos(p)}: ahí empezaremos a ver la luz.`);
  k.items.push({ t: 'vec', from, bearing: rumbo, length: r.distance, style: 'boat', step: k.steps.length },
    { t: 'arc', center: F, radius: alcance, around: rhumbTo(F, p).bearing, span: 60, style: 'construction', step: k.steps.length },
    { t: 'pos', at: p, label: 'Avistamos la luz', style: 'fix', step: k.steps.length });
  k.focus.push(F, p);
  k.note('Distancia navegada', `Desde la salida hasta ese punto medimos ${fmtMiles(r.distance, 2)}.`);
  return r.distance;
}

export default {
  // ---- 1ª Convocatoria 2023
  'and-py-2023-c1-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('cabo-trafalgar', 'cabo-espartel');
      return [{ kind: 'signed', value: k.ctFrom(dv, 175) }];
    },
  },
  'and-py-2023-c1-n12': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 10,0 N', '6 10,0 W', 'Salida');
      const rs = k.tangent(s, 'punta-gracia', 3, 'babor');
      const rv = k.rvConAbatimiento(rs, 15, N);
      const ct = k.ct({ carta: [-8, 2013, 6], anyo: 2023, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2023-c1-n13': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 59,0 N', '5 45,0 W', 'Salida 13:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'barbate-faro', hrb(15) - hrb(13), W, 3);
      k.note('Rumbo verdadero', `Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.`);
      const ct = k.ct({ dm: 2, desvio: -8 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2023-c1-n14': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Salida 09:00');
      const rs = k.abatimiento(70, 15, N);
      const { ref, vef } = k.efectivo(rs, 6, SW, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(10, 30) - hrb(9), 'Situación 10:30'));
    },
  },
  'and-py-2023-c1-n15': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 15,0 N', '5 10,0 W', 'Situación 12:00');
      const rs = k.abatimiento(210, 20, W);
      k.note('Demora verdadera del través', 'El través se mide desde la proa, es decir, desde el Rv: por estribor, Dv = Rv + 90° = 210° + 90° = 300°.');
      return latlon(k.corteRumbo(s, rs, 'punta-europa', 300, 'Situación de estima'));
    },
  },
  'and-py-2023-c1-n16': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 10,0 W', 'Situación 20:00');
      const { ref } = k.efectivo(80, 8, S, 3, s);
      return [{ kind: 'bearing', value: ref }];
    },
  },
  'and-py-2023-c1-n17': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: 8, desvio: -3 });
      const rv = k.rv(80, ct);
      const d = k.distFor(7, hrb(12) - hrb(11));
      return latlon(k.traslado('punta-cires', 180, 'punta-almina', 150, rv, d, 'Situación 12:00'));
    },
  },
  'and-py-2023-c1-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Segunda pleamar (13:36) → segunda bajamar (19:35).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 2 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 4.15, 1.24, 1) }];
    },
  },
  'and-py-2023-c1-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(5, 40), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.05) }];
    },
  },
  'and-py-2023-c1-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('39 33,0 N', '0 12,0 W', 'Situación 19:00');
      k.note('Distancia navegada', 'A 7 nudos: 135° de 19:00 a 21:00 (14 millas), 090° de 21:00 a 01:00 (28 millas) y 075° de 01:00 a 04:00 (21 millas). La corriente SW de 3 nudos actúa de 22:00 a 04:00: 6 h × 3 = 18 millas.');
      return latlon(k.tramos(s, [
        { rumbo: 135, millas: 14 }, { rumbo: 90, millas: 28 }, { rumbo: 75, millas: 21 },
        { rumbo: SW, millas: 18, nombre: 'Corriente SW' },
      ], 'Situación 04:00'));
    },
  },

  // ---- 2ª Convocatoria 2023
  'and-py-2023-c2-n11': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('35 45,0 N', '6 15,0 W', 'Salida');
      // Pasamos al N de Espartel (dejándolo por estribor): la otra tangente cruza la costa de Marruecos.
      const rs = k.tangent(s, 'cabo-espartel', 5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 10, N);
      const ct = k.ct({ dm: -8, desvio: -7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2023-c2-n12': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 15,0 N', '6 15,0 W', 'Salida');
      const rs = k.abatimiento(125, 15, E);
      k.note('Demora verdadera del través', 'Trafalgar queda a nuestra izquierda: lo tendremos por el través de babor. El través se mide desde la proa, es decir, desde el Rv: Dv = Rv − 90° = 125° − 90° = 035°.');
      return latlon(k.corteRumbo(s, rs, 'cabo-trafalgar', 35, 'Situación al través'));
    },
  },
  'and-py-2023-c2-n13': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // La declinación no interviene: solo serviría para sacar el desvío.
      const dv = k.enfilacion('cabo-trafalgar', 'cabo-roche', 316);
      return [{ kind: 'signed', value: k.ctFrom(dv, 316) }];
    },
  },
  'and-py-2023-c2-n14': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 12,0 N', '5 12,0 W', 'Salida');
      const { vef } = k.rumboConCorriente(s, 'ceuta-bocana', 10, E, 4);
      return [{ kind: 'speed', value: vef }];
    },
  },
  'and-py-2023-c2-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 55,0 N', '5 55,0 W', 'Situación 19:30');
      const rs = k.abatimiento(260, 15, N);
      const { ref, vef } = k.efectivo(rs, 8, NW, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(21) - hrb(19, 30), 'Situación 21:00'));
    },
  },
  'and-py-2023-c2-n16': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(6, hrb(4) - hrb(2, 30));
      // De los dos cortes, el del N cae sobre la costa de Tarifa: nos quedamos con el del S.
      return latlon(trasladoDosArcos(k, 'isla-tarifa', 4, 'isla-tarifa', 7, 80, d,
        (c) => c.slice().sort((u, v) => u.lat - v.lat)[0], 'Situación 04:00'));
    },
  },
  'and-py-2023-c2-n17': {
    sinCarta: true,
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const ct = k.ct({ dm: 6, desvio: 8 });
      const rv = k.rv(270, ct);
      const rs = k.abatimiento(rv, 15, SW);
      return [{ kind: 'bearing', value: k.efectivo(rs, 11, 50, 4).ref }];
    },
  },
  'and-py-2023-c2-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (02:49 UT) → primera bajamar (08:40 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 0 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.5, 2.03, 2) }];
    },
  },
  'and-py-2023-c2-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(19, 45), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.96) }];
    },
  },
  'and-py-2023-c2-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('26 00,0 S', '55 00,0 W', 'Situación 12:30');
      const d = k.distFor(10, hrb(22) - hrb(12, 30));
      const p = k.tramos(s, [{ rumbo: 135, millas: d }], 'Situación 22:00');
      const b = k.pos('26 00,0 S', '53 00,0 W', 'Destino');
      return [{ kind: 'bearing', value: k.rumboDirecto(p, b).rumbo }];
    },
  },

  // ---- 3ª Convocatoria 2023
  'and-py-2023-c3-n11': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('35 58,0 N', '6 04,0 W', 'Salida');
      const { rv } = k.rhumb(s, 'tanger-espigon');
      const ct = k.ct({ carta: [1 + 55 / 60, 2007, 7], anyo: 2023, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2023-c3-n12': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // La declinación no interviene: solo serviría para sacar el desvío.
      const dv = k.oposicion('punta-almina', 'cabo-negro');
      return [{ kind: 'signed', value: k.ctFrom(dv, 185) }];
    },
  },
  'and-py-2023-c3-n13': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.P('ceuta-roja');
      k.note('Salida', `Salimos de la luz roja de la bocana de Ceuta: ${fmtPos(s)}.`);
      // Vamos a Málaga (al NE): dejamos Punta Europa por babor, pasando por fuera, al E del Peñón.
      const rs = k.tangent(s, 'punta-europa', 5, 'babor');
      const rv = k.rvConAbatimiento(rs, 15, E);
      const ct = k.ct({ dm: 5, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2023-c3-n14': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      k.note('Demora verdadera del través', 'El través se mide desde la proa, es decir, desde el Rv (no desde el rumbo de superficie): por estribor, Dv = Rv + 90° = 340° + 90° = 070°. El viento y la velocidad no intervienen.');
      return latlon(k.fixDist('cabo-espartel', 70, 6.8));
    },
  },
  'and-py-2023-c3-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      // «Faro de Punta Camarinal» = faro de Punta de Gracia (Camarinal).
      const s = k.cardinal2('punta-gracia', S, 'punta-paloma', W, 'Situación 11:30');
      const { ref, vef } = k.efectivo(140, 10, SW, 4, s);
      const p = k.estimaEfectiva(s, ref, vef, hrb(12, 30) - hrb(11, 30), 'Situación 12:30');
      return [{ kind: 'distance', value: k.distanceBetween(p, 'punta-malabata') }];
    },
  },
  'and-py-2023-c3-n16': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const s = k.fromMark('cabo-roche', SW, 6, 'Situación 03:00');
      const rs = k.abatimiento(125, 10, S);
      // «Faro de Punta Camarinal» = faro de Punta de Gracia (Camarinal).
      const d = distanciaAvistar(k, s, rs, 'punta-gracia', 9);
      return [{ kind: 'clock', value: k.eta(hrb(3), d, 8) }];
    },
  },
  'and-py-2023-c3-n17': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(8, 45);
      return latlon(k.traslado('punta-cires', 131, 'punta-cires', 198, 80, d, 'Situación 11:45'));
    },
  },
  'and-py-2023-c3-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(12, 51), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      const s = k.sondaA(tr, t, 0.9);
      // Tabla: 1018 hPa → −0,05 m y 1023 hPa → −0,10 m; interpolamos para 1020 hPa.
      const corr = -0.05 + ((1020 - 1018) / 5) * (-0.10 + 0.05);
      k.note('Sonda corregida por la presión', `Con presión alta el mar está más bajo de lo previsto. En la tabla, 1018 hPa dan −0,05 m y 1023 hPa −0,10 m; para 1020 hPa interpolamos: ${corr < 0 ? "−" : "+"}${coma(Math.abs(corr), 2)} m. Sonda = ${coma(s, 2)} ${corr < 0 ? '−' : '+'} ${coma(Math.abs(corr), 2)} = ${coma(s + corr, 2)} m.`);
      return [{ kind: 'meters', value: s + corr }];
    },
  },
  'and-py-2023-c3-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (10:51 UT) → segunda bajamar (17:19 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 1 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 4.75, 2.9, 2) }];
    },
  },
  'and-py-2023-c3-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('32 30,0 N', '155 40,0 W', 'Situación 05:00');
      const b = k.pos('34 15,0 N', '153 25,0 W', 'Destino');
      const { rumbo } = k.rumboDirecto(s, b);
      const d = k.distFor(10, hrb(7, 30) - hrb(5));
      return latlon(k.tramos(s, [{ rumbo, millas: d }], 'Situación 07:30'));
    },
  },
};
