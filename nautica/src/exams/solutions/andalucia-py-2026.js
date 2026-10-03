// Soluciones programadas PY Andalucía, convocatorias de 2026. Ver andalucia-py.js para el formato.
import { hrb } from '../kit.js';
import { rhumbTo, rhumbDestination, toPlane, fromPlane, unitsPerMile } from '../../math/mercator.js';
import { norm360 } from '../../math/angles.js';
import { fmtBearing, fmtPos, fmtMiles } from '../../math/format.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const NE = 45; const E = 90; const SE = 135; const S = 180; const SW = 225; const W = 270; const NW = 315;
const nm = (p) => p.name.replace(/^Faro de /, 'faro de ');

// ---- Operaciones locales (copiadas de 2022/2023, candidatas al kit)

/** Cortes de la circunferencia (centro c, radio en millas) con la recta que pasa por p con dirección dv. */
function cortesRectaArco(p, dv, c, radio) {
  const u = unitsPerMile((p.lat + c.lat) / 2);
  const P0 = toPlane(p); const C = toPlane(c);
  const dx = Math.sin(dv * Math.PI / 180); const dy = Math.cos(dv * Math.PI / 180);
  const fx = P0.x - C.x; const fy = P0.y - C.y; const R = radio * u;
  const b = fx * dx + fy * dy; const disc = b * b - (fx * fx + fy * fy - R * R);
  if (disc < 0) return [];
  return [-b - Math.sqrt(disc), -b + Math.sqrt(disc)].map((t) => fromPlane({ x: P0.x + t * dx, y: P0.y + t * dy }));
}

/** Demora y distancia no simultáneas: la 1ª demora se traslada lo navegado y se corta con el arco de distancia. */
function trasladoDemoraArco(k, a, dvA, b, dist, rumbo, millas, elegir, label) {
  const A = k.P(a); const B = k.P(b);
  const A2 = rhumbDestination(A, rumbo, millas);
  const cortes = cortesRectaArco(A2, dvA, B, dist);
  const p = elegir(cortes);
  k.note('Traslado de la 1ª línea', `Desde ${nm(A)} llevamos el rumbo ${fmtBearing(rumbo)} y ${fmtMiles(millas)} navegadas: por ese punto trazamos una paralela a la 1ª demora (${fmtBearing(dvA + 180)} desde el faro).`);
  k.items.push({ t: 'ray', from: A, bearing: norm360(dvA + 180), length: rhumbTo(A, p).distance + 2, style: 'lop', step: k.steps.length },
    { t: 'vec', from: A, bearing: rumbo, length: millas, style: 'construction', step: k.steps.length },
    { t: 'line', through: p, bearing: dvA, length: 8, label: 'trasladada', style: 'lop2', step: k.steps.length });
  k.note(label, `Con centro en ${nm(B)} trazamos el arco de ${fmtMiles(dist)}: corta a la línea trasladada en ${cortes.map((c) => fmtPos(c)).join(' y en ')}. Nos quedamos con ${fmtPos(p)}, el corte en el mar y coherente con la derrota.`);
  k.items.push({ t: 'arc', center: B, radius: dist, around: rhumbTo(B, p).bearing, span: 40, style: 'lop', step: k.steps.length },
    { t: 'pos', at: p, label, style: 'fix', step: k.steps.length });
  k.focus.push(A, B, p);
  return p;
}

export default {
  // ---- 1ª Convocatoria 2026
  'and-py-2026-c1-n11': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 10,0 W', 'Salida 10:00');
      // Marina Smir no es un punto de la carta: el enunciado da sus coordenadas.
      const smir = k.pos('35 45,2 N', '5 20,2 W', 'Destino: Marina Smir');
      const { rs, vef, dist } = k.rumboConCorriente(s, smir, 6, W, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ carta: [-(3 + 36 / 60), 2020, 6], anyo: 2026, desvio: -9 });
      const ra = k.ra(rs, ct);
      // Al tiempo de llegada se va a la velocidad efectiva, no a la del barco.
      return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(10), dist, vef) }];
    },
  },
  'and-py-2026-c1-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('punta-paloma', SW, 5, 'Situación 11:00');
      // Vamos hacia el NW, por fuera de Trafalgar (mar adentro): el cabo queda por estribor.
      const rs = k.tangent(s, 'cabo-trafalgar', 5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, NE);
      const ct = k.ct({ dm: -3, desvio: 3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2026-c1-n13': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El rumbo de aguja no interviene.
      const dv = k.enfilacion('cabo-trafalgar', 'cabo-roche', 316);
      return [{ kind: 'signed', value: k.ctFrom(dv, 316) }];
    },
  },
  'and-py-2026-c1-n14': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.fromMark('punta-alcazar', NW, 5, 'Situación 14:00');
      const ct = k.ct({ dm: -2, desvio: -8 });
      const rv = k.rv(268, ct);
      const rs = k.abatimiento(rv, 18, SE);
      const dv = norm360(rv - 90);
      k.note('Demora verdadera del través', `Malabata queda a nuestra izquierda: lo tendremos por el través de babor. El través se mide desde la proa, es decir, desde el Rv: Dv = Rv − 90° = ${fmtBearing(rv)} − 90° = ${fmtBearing(dv)}.`);
      return latlon(k.corteRumbo(s, rs, 'punta-malabata', dv, 'Situación al través'));
    },
  },
  'and-py-2026-c1-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.fromMark('punta-alcazar', NW, 5, 'Situación 19:00');
      const ct = k.ct({ dm: -4, desvio: 8 });
      const rv = k.rv(45, ct);
      return [{ kind: 'bearing', value: k.efectivo(rv, 8, S, 3, s).ref }];
    },
  },
  'and-py-2026-c1-n16': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const dvE = k.dvM(225, 45, 'punta-europa');
      const dvA = k.dvM(225, -72, 'punta-almina');
      const d = k.distFor(6, hrb(17, 30) - hrb(16));
      return latlon(k.traslado('punta-europa', dvE, 'punta-almina', dvA, 225, d, 'Situación 17:30'));
    },
  },
  'and-py-2026-c1-n17': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 05,0 W', 'Salida 07:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'tanger-espigon', hrb(9, 30) - hrb(7), W, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 3, desvio: 4 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2026-c1-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(11, 38), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.02) }];
    },
  },
  'and-py-2026-c1-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (02:45 UT) → primera bajamar (08:50 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 0 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 4.02, 0.87, 1) }];
    },
  },
  'and-py-2026-c1-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('37 34,0 N', '0 52,0 E', 'Situación 08:00');
      k.note('Distancia navegada', 'A 11 nudos: 240° durante 6 h (66 millas) y 180° durante 3 h (33 millas). La corriente SW de 3 nudos actúa las 9 h: 9 × 3 = 27 millas.');
      return latlon(k.tramos(s, [
        { rumbo: 240, millas: 66 }, { rumbo: 180, millas: 33 },
        { rumbo: SW, millas: 27, nombre: 'Corriente SW' },
      ], 'Situación 17:00'));
    },
  },

  // ---- 2ª Convocatoria 2026
  'and-py-2026-c2-n11': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(7, hrb(14, 55) - hrb(13, 30));
      // De los dos cortes nos quedamos con el del N, en el mar (el otro cae junto a la costa de Marruecos).
      return latlon(trasladoDemoraArco(k, 'punta-malabata', 160, 'cabo-espartel', 9.8, 300, d,
        (c) => c.slice().sort((u, v) => v.lat - u.lat)[0], 'Situación 14:55'));
    },
  },
  'and-py-2026-c2-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 05,0 N', '5 20,0 W', 'Situación 12:30');
      // Bajamos hacia el S por fuera de Almina (al E de Ceuta): la punta queda por estribor.
      const rs = k.tangent(s, 'punta-almina', 3, 'estribor');
      const rv = k.rvConAbatimiento(rs, 20, SW);
      const ct = k.ct({ dm: -3, desvio: -7.5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2026-c2-n13': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // «Faro de Punta Camarinal» = faro de Punta de Gracia (Camarinal). El rumbo no interviene.
      const dv = k.oposicion('punta-gracia', 'cabo-trafalgar');
      return [{ kind: 'signed', value: k.ctFrom(dv, 303) }];
    },
  },
  'and-py-2026-c2-n14': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      k.note('Demora verdadera de Cabo Roche', 'Al W verdadero del faro de Cabo Roche: desde el barco el faro demora 090°, así que estamos sobre su paralelo.');
      const s = k.lineAndBearing('cabo-roche', W, 'cabo-trafalgar', 119, 'Situación 17:00');
      const rs = k.abatimiento(140, 15, NE);
      const { ref } = k.efectivo(rs, 8, S, 3, s);
      k.note('Demora verdadera del través', 'Trafalgar queda a nuestra izquierda: lo tendremos por el través de babor. El través se mide desde la proa, es decir, desde el Rv: Dv = Rv − 90° = 140° − 90° = 050°.');
      return latlon(k.corteRumbo(s, ref, 'cabo-trafalgar', 50, 'Situación de estima'));
    },
  },
  'and-py-2026-c2-n15': {
    ejercicio: 'abatimiento',
    solve(k) {
      // La situación y la velocidad no intervienen: solo se pide el rumbo de superficie.
      k.fromMark('cabo-espartel', NW, 4, 'Situación 14:00');
      const ct = k.ct({ carta: [4, 2016, -6], anyo: 2026, desvio: 9 });
      const rv = k.rv(228, ct);
      return [{ kind: 'bearing', value: k.abatimiento(rv, 15, SE) }];
    },
  },
  'and-py-2026-c2-n16': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const dvC = k.dvM(70, -90, 'punta-carnero');
      const s = k.fixDist('punta-carnero', dvC, 6, 'Situación 09:00');
      const t = hrb(10, 30) - hrb(9);
      const e = k.run(s, 70, k.distFor(6, t), 'Situación de estima 10:30');
      const o = k.fixDist('punta-almina', 183, 5.2, 'Situación verdadera 10:30');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2026-c2-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(18, 48), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 0.81) }];
    },
  },
  'and-py-2026-c2-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera bajamar (06:22 UT) → segunda pleamar (12:42 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 1 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.85, 1.15, 2) }];
    },
  },
  'and-py-2026-c2-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('28 44,0 N', '178 52,0 E', 'Situación 13:00');
      k.note('Distancia navegada', 'A 10 nudos: 280° durante 7 h (70 millas) y 360° durante 3 h (30 millas). La corriente NW de 3 nudos actúa las 10 h: 10 × 3 = 30 millas.');
      return latlon(k.tramos(s, [
        { rumbo: 280, millas: 70 }, { rumbo: 0, millas: 30 },
        { rumbo: NW, millas: 30, nombre: 'Corriente NW' },
      ], 'Situación 23:00'));
    },
  },
};

/* DISCREPANCIAS

- and-py-2026-c2-n17 (ANULADA): de 36° 00,0′ N 005° 46,8′ W al faro de tierra de Barbate: Ref ≈ 329°, ≈ 13,2 M en
  2 h 16 m → Vef ≈ 5,8 nudos. Restando la corriente SW 3 nudos: Rs ≈ 352,7°, Vb = 7,15 nudos; Ct = −2 + 7 = +5° →
  Ra ≈ 347,7°. Queda justo entre b (345°, 7,2) y d (350°, 7,2): puntuaciones b 2,86 y d 2,45, sin opción clara.
  Por eso la anuló el tribunal. Solución que se usó:

  'and-py-2026-c2-n17': {
    // Anulada por el tribunal: se resuelve y se mete solo si una opción encaja.
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 46,8 W', 'Salida 15:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'barbate-faro', hrb(17, 16) - hrb(15), SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: -2, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
*/
