// Soluciones programadas PY Andalucía, convocatorias de 2022. Ver andalucia-py.js para el formato.
import { hrb } from '../kit.js';
import { fmtBearing } from '../../math/format.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const NE = 45; const E = 90; const SE = 135; const SW = 225; const W = 270; const NW = 315;

export default {
  // ---- 1ª Convocatoria 2022
  'and-py-2022-c1-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Rv 336º no interviene: la Ct sale de la Dv de la oposición y la Da.
      const dv = k.oposicion('punta-almina', 'punta-europa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 352) }];
    },
  },
  'and-py-2022-c1-n12': {
    ejercicio: 'abatimiento',
    solve(k) {
      const dvT = k.oposicion('punta-cires', 'isla-tarifa');
      const s = k.lineAndBearing('punta-alcazar', 0, 'isla-tarifa', dvT, 'Situación de salida');
      // Rumbo hacia el W saliendo del Estrecho: el faro de Camarinal queda por estribor.
      const rs = k.tangent(s, 'punta-gracia', 4, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, NE);
      const ct = k.ct({ dm: -5, desvio: -7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2022-c1-n13': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d1 = k.dvM(70, 140, 'punta-malabata');
      const d2 = k.dvM(70, 40, 'punta-cires');
      const d = k.distFor(8, hrb(23) - hrb(22));
      return latlon(k.traslado('punta-malabata', d1, 'punta-cires', d2, 70, d, 'Situación 23:00'));
    },
  },
  'and-py-2022-c1-n14': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 52,0 W', 'Salida 15:00');
      const { rs } = k.rumboYVelocidad(s, 'tanger-espigon', hrb(17) - hrb(15), SE, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: -4, desvio: -7 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2022-c1-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.cardinal2('cabo-roche', 180, 'cabo-trafalgar', NW, 'Situación 09:00');
      const rs = k.abatimiento(160, 10, E);
      const { ref, vef } = k.efectivo(rs, 8, SW, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(10, 30) - hrb(9), 'Situación 10:30'));
    },
  },
  'and-py-2022-c1-n16': {
    ejercicio: 'abatimiento',
    sinCarta: true,
    solve(k) {
      // 3,5º E 2017 con variación 6′ W anual.
      const ct = k.ct({ carta: [3.5, 2017, -6], anyo: 2022, desvio: -8 });
      const rv = k.rv(315, ct);
      return [{ kind: 'bearing', value: k.abatimiento(rv, 20, NE) }];
    },
  },
  'and-py-2022-c1-n17': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 10,0 N', '5 15,0 W', 'Situación 09:00');
      const d = k.distFor(7, hrb(10) - hrb(9));
      const est = k.run(s, 220, d, 'Situación de estima 10:00');
      const obs = k.cardinal2('punta-carnero', E, 'punta-almina', 0, 'Situación observada 10:00');
      const { rc, ic } = k.corrienteDesconocida(est, obs, 60);
      return [{ kind: 'bearing', value: rc }, { kind: 'distance', value: ic }];
    },
  },
  'and-py-2022-c1-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera bajamar (07:56) → segunda pleamar (14:07).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 1 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 4.15, 1.85, 1) }];
    },
  },
  'and-py-2022-c1-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(17, 30), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 2.10) }];
    },
  },
  'and-py-2022-c1-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('28 10,0 N', '179 25,0 W', 'Salida');
      const b = k.pos('25 55,0 N', '178 24,0 E', 'Llegada');
      return [{ kind: 'bearing', value: k.rumboDirecto(a, b).rumbo }];
    },
  },

  // ---- 2ª Convocatoria 2022
  'and-py-2022-c2-n12': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('35 45,0 N', '6 10,0 W', 'Salida');
      // El enunciado no dice la banda: rumbo de entrada al Estrecho por fuera de Espartel, dejándolo por estribor.
      const rs = k.tangent(s, 'cabo-espartel', 4, 'estribor');
      const rv = k.rvConAbatimiento(rs, 20, SE);
      const ct = k.ct({ dm: -4, desvio: -4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2022-c2-n13': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 10,0 N', '5 10,0 W', 'Salida 15:00');
      const { rv: rs } = k.rhumb(s, 'ceuta-bocana', 'Rumbo y distancia a Ceuta');
      k.note('Rumbo de superficie', `Para llegar a Ceuta el barco tiene que avanzar sobre el agua por esa recta: Rs = ${fmtBearing(rs)}.`);
      const rv = k.rvConAbatimiento(rs, 20, E);
      const ct = k.ct({ dm: -3, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2022-c2-n14': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 40,0 W', 'Salida 09:00');
      const { rs } = k.rumboYVelocidad(s, 'tanger-espigon', hrb(12, 30) - hrb(9), SE, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 3, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2022-c2-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 10,0 N', '6 10,0 W', 'Situación 12:00');
      const rs = k.abatimiento(160, 15, W);
      const { ref, vef } = k.efectivo(rs, 7, E, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(14, 30) - hrb(12), 'Situación 14:30'));
    },
  },
  'and-py-2022-c2-n16': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 05,0 N', '6 15,0 W', 'Situación 18:15');
      // 4º E 2012 con variación 6′ W anual.
      const ct = k.ct({ carta: [4, 2012, -6], anyo: 2022, desvio: 7 });
      const rv = k.rv(166, ct);
      const rs = k.abatimiento(rv, 15, W);
      const d = k.distFor(9, hrb(19, 45) - hrb(18, 15));
      const est = k.run(s, rs, d, 'Situación de estima 19:45');
      const dv = k.dv(120, ct, 'cabo-espartel');
      const obs = k.fixDist('cabo-espartel', dv, 12, 'Situación observada 19:45');
      const { rc, ic } = k.corrienteDesconocida(est, obs, 90);
      return [{ kind: 'bearing', value: rc }, { kind: 'distance', value: ic }];
    },
  },
  'and-py-2022-c2-n17': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(8, hrb(11) - hrb(10));
      // De los dos cortes, el del N cae en tierra (zona de Barbate–Zahara): nos quedamos con el del S.
      const p = k.trasladoArco('cabo-trafalgar', 30, 'punta-gracia', 9, 130, d,
        (c) => c.sort((u, v) => u.lat - v.lat)[0], 'Situación 11:00');
      return latlon(p);
    },
  },
  'and-py-2022-c2-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera bajamar (06:14) → segunda pleamar (12:29).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 1 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 4.35, 2.15, 2) }];
    },
  },
  'and-py-2022-c2-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(17, 15), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 3.00) }];
    },
  },
  'and-py-2022-c2-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('32 15,0 N', '179 40,0 E', 'Situación 11:00');
      const d = k.distFor(12, hrb(16, 30) - hrb(11));
      const e = k.tramos(s, [{ rumbo: SE, millas: d }], 'Situación 16:30');
      const b = k.pos('29 37,0 N', '176 21,0 W', 'Destino');
      return [{ kind: 'bearing', value: k.rumboDirecto(e, b).rumbo }];
    },
  },

  // ---- 3ª Convocatoria 2022
  'and-py-2022-c3-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('punta-cires', 'punta-alcazar', 238);
      return [{ kind: 'signed', value: k.ctFrom(dv, 238) }];
    },
  },
  'and-py-2022-c3-n12': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 10,0 N', '5 10,0 W', 'Salida');
      // Rumbo al SW hacia el Estrecho: Carnero queda por estribor.
      const rs = k.tangent(s, 'punta-carnero', 4, 'estribor');
      const rv = k.rvConAbatimiento(rs, 12, NW);
      const ct = k.ct({ dm: -1, desvio: -4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2022-c3-n13': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 05,0 N', '6 10,0 W', 'Salida 11:00');
      const { rs } = k.rumboYVelocidad(s, 'barbate-espigon', hrb(13, 30) - hrb(11), SE, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 3, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2022-c3-n14': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 40,0 W', 'Salida 20:00');
      const { rv: rs } = k.rhumb(s, 'tanger-espigon', 'Rumbo y distancia a Tánger');
      k.note('Rumbo de superficie', `Para llegar a Tánger el barco tiene que avanzar sobre el agua por esa recta: Rs = ${fmtBearing(rs)}.`);
      const rv = k.rvConAbatimiento(rs, 15, W);
      const ct = k.ct({ dm: 4, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2022-c3-n15': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 05,0 N', '6 00,0 W', 'Situación 11:00');
      const rs = k.abatimiento(110, 20, NE);
      k.note('Demora verdadera del través', 'El faro de Camarinal queda al N de nuestra derrota, por babor. El través se mide desde la proa, es decir, desde el Rv: Dv = Rv − 90° = 110° − 90° = 020°.');
      return latlon(k.corteRumbo(s, rs, 'punta-gracia', 20, 'Situación de estima'));
    },
  },
  'and-py-2022-c3-n16': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('35 45,0 N', '6 20,0 W', 'Situación 17:00');
      const d = k.distFor(8, hrb(19, 30) - hrb(17));
      const est = k.run(s, 70, d, 'Situación de estima 19:30');
      const obs = k.fix2('cabo-espartel', 147, 'punta-malabata', 117, 'Situación observada 19:30');
      const { rc, ic } = k.corrienteDesconocida(est, obs, 150);
      return [{ kind: 'bearing', value: rc }, { kind: 'distance', value: ic }];
    },
  },
  'and-py-2022-c3-n17': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(6, hrb(9) - hrb(8));
      // El otro corte cae en tierra, al S (costa de Tánger): nos quedamos con el del N.
      const p = k.trasladoDosArcos('cabo-espartel', 4, 'punta-malabata', 5, 70, d,
        (c) => c.sort((u, v) => v.lat - u.lat)[0], 'Situación 09:00');
      return latlon(p);
    },
  },
  'and-py-2022-c3-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Segunda bajamar (16:54) → segunda pleamar (23:05).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 2 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.85, 1.35, 1) }];
    },
  },
  'and-py-2022-c3-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(15, 45), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 2.75) }];
    },
  },
  'and-py-2022-c3-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('25 25,0 S', '179 45,0 E', 'Situación 22:00');
      k.note('Distancia navegada', 'A 8 nudos: 135° durante 4 h (32 millas, de 22:00 a 02:00), 180° durante 3 h (24 millas) y 270° durante 3 h (24 millas). La corriente SE de 4 nudos actúa de 02:00 a 08:00: 6 h × 4 = 24 millas.');
      const p = k.tramos(s, [
        { rumbo: SE, millas: 32 }, { rumbo: 180, millas: 24 }, { rumbo: 270, millas: 24 },
        { rumbo: SE, millas: 24, nombre: 'Corriente SE' },
      ], 'Situación 08:00');
      return latlon(p);
    },
  },
};

/* DISCREPANCIAS
  and-py-2022-c2-n11 (enfilación Espartel–Malabata, Da 078°, oficial b «+2º»): en la carta la enfilación mide
  078,6° (faros a 35°47,5′N 5°55,4′W y 35°49,2′N 5°45,0′W), así que Ct = +0,6°. La b es la más próxima pero
  queda fuera de la tolerancia: el tribunal debió medir 080°. No se publica como resuelta.
*/
