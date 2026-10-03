// Soluciones programadas PY Andalucía, convocatorias de 2025. Ver andalucia-py.js para el formato.
import { hrb } from '../kit.js';
import { norm360 } from '../../math/angles.js';
import { fmtBearing } from '../../math/format.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const NE = 45; const E = 90; const SE = 135; const S = 180; const SW = 225; const W = 270;

export default {
  // ---- 1ª Convocatoria 2025
  'and-py-2025-c1-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // Vemos Roche con Trafalgar detrás: la demora a Roche es la de la recta Roche → Trafalgar. El Ra no interviene.
      const dv = k.enfilacion('cabo-roche', 'cabo-trafalgar', 136);
      return [{ kind: 'signed', value: k.ctFrom(dv, 136) }];
    },
  },
  'and-py-2025-c1-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 40,0 W', 'Salida');
      // Vamos hacia el W pasando por fuera de Trafalgar: lo dejamos por estribor.
      const rs = k.tangent(s, 'cabo-trafalgar', 5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 12, NE);
      const ct = k.ct({ dm: -4, desvio: -6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2025-c1-n13': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 58,0 N', '5 45,0 W', 'Salida 09:20');
      const { rs } = k.rumboConCorriente(s, 'tanger-espigon', 6, W, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ carta: [3 + 20 / 60, 2015, -2], anyo: 2025, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2025-c1-n14': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const dv = k.oposicion('punta-europa', 'punta-almina');
      const d = k.distFor(8, hrb(14, 45) - hrb(13, 15));
      // «Ya en aguas del Estrecho»: el corte del N. El del S (35° 49,8′ N 005° 30,7′ W, la opción a) cae en la costa de Marruecos.
      return latlon(k.trasladoArco('punta-almina', dv, 'punta-cires', 5, 250, d,
        (c) => c.slice().sort((u, v) => v.lat - u.lat)[0], 'Situación 14:45'));
    },
  },
  'and-py-2025-c1-n15': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('35 44,2 N', '6 04,7 W', 'Situación 08:00');
      const t = hrb(9, 30) - hrb(8);
      const e = k.run(s, 30, k.distFor(6, t), 'Situación de estima 09:30');
      const o = k.cardinal2('cabo-espartel', N, 'punta-malabata', W, 'Situación verdadera 09:30');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2025-c1-n16': {
    sinCarta: true,
    ejercicio: 'abatimiento',
    solve(k) {
      // La situación no interviene: solo piden el rumbo de superficie.
      const ct = k.ct({ dm: 5, desvio: 10 });
      const rv = k.rv(350, ct);
      return [{ kind: 'bearing', value: k.abatimiento(rv, 20, W) }];
    },
  },
  'and-py-2025-c1-n17': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 05,0 N', '6 10,0 W', 'Situación 18:15');
      const rs = k.abatimiento(160, 10, E);
      const { ref, vef } = k.efectivo(rs, 6, SW, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(20, 45) - hrb(18, 15), 'Situación 20:45'));
    },
  },
  'and-py-2025-c1-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (04:10 UT) → primera bajamar (10:08 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 0 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.95, 1.63, 1) }];
    },
  },
  'and-py-2025-c1-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(22), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 2.00) }];
    },
  },
  'and-py-2025-c1-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('26 40,0 S', '177 35,0 E', 'Salida');
      const b = k.pos('5 15,0 S', '179 28,0 W', 'Destino');
      return [{ kind: 'bearing', value: k.rumboDirecto(a, b).rumbo }];
    },
  },

  // ---- 2ª Convocatoria 2025
  'and-py-2025-c2-n11': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const s = k.fix2('punta-paloma', 340, 'punta-cires', 120, 'Situación 15:00');
      const { rv: rs } = k.rhumb(s, 'tanger-espigon', 'Rumbo de superficie y distancia');
      const rv = k.rvConAbatimiento(rs, 20, E);
      const ct = k.ct({ dm: 4, desvio: -4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2025-c2-n12': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Ra no interviene: la Ct sale de Dv − Da.
      const dv = k.oposicion('punta-malabata', 'isla-tarifa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 26) }];
    },
  },
  'and-py-2025-c2-n13': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.cardinal2('punta-europa', S, 'punta-carnero', E, 'Salida 12:12');
      const { rs, vef, dist } = k.rumboConCorriente(s, 'ceuta-bocana', 6, SW, 2);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 3, desvio: -9 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'clock', value: k.eta(hrb(12, 12), dist, vef) }];
    },
  },
  'and-py-2025-c2-n14': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 15,0 N', '5 15,0 W', 'Situación 11:00');
      const ct = k.ct({ dm: 3, desvio: 8 });
      const rv = k.rv(173, ct);
      const rs = k.abatimiento(rv, 15, W);
      k.note('Demora verdadera del través', `Punta Europa queda al W, a nuestra derecha: la tendremos por el través de estribor. El través se mide desde la proa, es decir, desde el Rv: Dv = Rv + 90° = ${fmtBearing(rv)} + 90° = ${fmtBearing(rv + 90)}.`);
      return latlon(k.corteRumbo(s, rs, 'punta-europa', norm360(rv + 90), 'Situación al través'));
    },
  },
  'and-py-2025-c2-n15': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -8 });
      const rv = k.rv(70, ct);
      const d = k.distFor(8, hrb(16, 15) - hrb(15));
      k.note('Demora verdadera de Cabo Espartel', 'Al W verdadero del faro de Cabo Espartel: desde el barco el faro demora 090°. La 2ª línea, Camarinal al N, es su meridiano.');
      // «Faro de Punta Camarinal» = faro de Punta de Gracia (Camarinal).
      return latlon(k.traslado('cabo-espartel', E, 'punta-gracia', N, rv, d, 'Situación 16:15'));
    },
  },
  'and-py-2025-c2-n16': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 05,0 N', '6 10,0 W', 'Situación 08:15');
      const ct = k.ct({ carta: [3, 2015, -6], anyo: 2025, desvio: 9 });
      const rv = k.rv(119, ct);
      const rs = k.abatimiento(rv, 10, NE);
      const { ref, vef } = k.efectivo(rs, 7, S, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(9, 27) - hrb(8, 15), 'Situación 09:27'));
    },
  },
  'and-py-2025-c2-n17': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 55,0 N', '5 50,0 W', 'Salida 10:20');
      const { rs, vb } = k.rumboYVelocidad(s, 'barbate-faro', hrb(13, 8) - hrb(10, 20), 110, 2);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 1.5, desvio: -11.5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2025-c2-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(20, 55), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.03) }];
    },
  },
  'and-py-2025-c2-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera bajamar (08:17 UT) → segunda pleamar (14:41 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 1 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.05, 0.86, 2) }];
    },
  },
  'and-py-2025-c2-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('15 10,0 N', '179 22,0 E', 'Situación 09:00');
      k.note('Distancia navegada', 'A 10 nudos: 135° durante 4 h (40 millas) y 090° durante 3 h (30 millas). La corriente SE de 3 nudos actúa las 7 h: 7 × 3 = 21 millas.');
      return latlon(k.tramos(s, [
        { rumbo: 135, millas: 40 }, { rumbo: 90, millas: 30 },
        { rumbo: SE, millas: 21, nombre: 'Corriente SE' },
      ], 'Situación 16:00'));
    },
  },

  // ---- 3ª Convocatoria 2025
  'and-py-2025-c3-n11': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.cardinal2('cabo-trafalgar', S, 'punta-paloma', W, 'Salida 11:42');
      // «Luz de la bocana de entrada» de Tánger: la farola del espigón.
      const { rs, vef, dist } = k.rumboConCorriente(s, 'tanger-espigon', 7, E, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 4, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'clock', value: k.eta(hrb(11, 42), dist, vef) }];
    },
  },
  'and-py-2025-c3-n12': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      // «Faro de Punta Camarinal» = faro de Punta de Gracia (Camarinal).
      const s = k.fix2('punta-gracia', 340, 'punta-paloma', 45, 'Situación 09:00');
      const { rv: rs } = k.rhumb(s, 'barbate-faro', 'Rumbo de superficie y distancia');
      const rv = k.rvConAbatimiento(rs, 15, E);
      const ct = k.ct({ carta: [-4.5, 2020, 6], anyo: 2025, desvio: -8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2025-c3-n13': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Ra no interviene: la Ct sale de Dv − Da.
      const dv = k.oposicion('punta-carnero', 'punta-cires');
      return [{ kind: 'signed', value: k.ctFrom(dv, 199) }];
    },
  },
  'and-py-2025-c3-n14': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.cardinal2('punta-carnero', S, 'isla-tarifa', E, 'Situación 16:00');
      const ct = k.ct({ dm: 1, desvio: 9 });
      const rv = k.rv(100, ct);
      const rs = k.abatimiento(rv, 20, SW);
      k.note('Demora verdadera del través', `Punta Almina queda al SE, a nuestra derecha: la tendremos por el través de estribor. El través se mide desde la proa, es decir, desde el Rv: Dv = Rv + 90° = ${fmtBearing(rv)} + 90° = ${fmtBearing(rv + 90)}.`);
      return latlon(k.corteRumbo(s, rs, 'punta-almina', norm360(rv + 90), 'Situación al través'));
    },
  },
  'and-py-2025-c3-n15': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: -4, desvio: -7 });
      const rv = k.rv(171, ct);
      const d = k.distFor(8, hrb(21, 15) - hrb(20));
      return latlon(k.traslado('cabo-roche', 120, 'cabo-roche', 50, rv, d, 'Situación 21:15'));
    },
  },
  'and-py-2025-c3-n16': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 17,0 N', '5 15,0 W', 'Situación 18:10');
      const t = hrb(20, 10) - hrb(18, 10);
      const e = k.run(s, 161, k.distFor(5.6, t), 'Situación de estima 20:10');
      const o = k.cardinal2('punta-almina', N, 'punta-europa', E, 'Situación verdadera 20:10');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2025-c3-n17': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 20,0 W', 'Salida 14:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'algeciras-espigon', hrb(16, 30) - hrb(14), NE, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: -4.5, desvio: 9.5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2025-c3-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(5, 24), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 0.98) }];
    },
  },
  'and-py-2025-c3-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Segunda pleamar (14:34 UT) → segunda bajamar (20:31 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 2 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 2.97, 1.08, 1) }];
    },
  },
};

/* DISCREPANCIAS

'and-py-2025-c3-n20' (anulada): estima analítica desde 19° 22,0′ S 179° 43,0′ E; 225° 50 M, 180° 40 M y
corriente NW 9 h × 2 = 18 M → Δl = −62,6′, A = −48,1′, lm 19,9°, ΔL = −51,1′ → 20° 24,6′ S, 178° 51,9′ E.
La longitud coincide con la opción a (178° 52,0′ E), pero todas las opciones dan la latitud en el hemisferio N
(20° 24,6′ N), así que ninguna opción encaja (puntuación de a ≈ 2449). Errata del enunciado: por eso se anuló.
Solución lista para cuando se corrija la opción:

  'and-py-2025-c3-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('19 22,0 S', '179 43,0 E', 'Situación 12:00');
      k.note('Distancia navegada', 'A 10 nudos: 225° durante 5 h (50 millas) y 180° durante 4 h (40 millas). La corriente NW de 2 nudos actúa las 9 h: 9 × 2 = 18 millas.');
      return latlon(k.tramos(s, [
        { rumbo: 225, millas: 50 }, { rumbo: 180, millas: 40 },
        { rumbo: NW, millas: 18, nombre: 'Corriente NW' },
      ], 'Situación 21:00'));
    },
  },
*/
