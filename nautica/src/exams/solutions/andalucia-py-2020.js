// Soluciones programadas PY Andalucía, convocatorias de 2020. Ver andalucia-py.js para el formato.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const E = 90; const SE = 135; const SW = 225; const W = 270; const NW = 315; const NE = 45; const S = 180;

// ---- Operaciones locales (candidatas al kit)

export default {
  // ---- 1ª Convocatoria 2020
  'and-py-2020-c1-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Rv 332º y la velocidad no intervienen.
      const dv = k.oposicion('punta-almina', 'punta-europa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 338) }];
    },
  },
  'and-py-2020-c1-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 17,0 N', '6 20,0 W', 'Salida');
      // Pasamos por fuera (al SW) de Trafalgar: el faro queda por babor.
      const rs = k.tangent(s, 'cabo-trafalgar', 5, 'babor');
      const rv = k.rvConAbatimiento(rs, 20, NE);
      const ct = k.ct({ dm: -3, desvio: -6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2020-c1-n13': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.cardinal2('punta-paloma', S, 'isla-tarifa', SW, 'Salida');
      // Pasamos al N de Punta Cires: el faro queda por estribor.
      const rs = k.tangent(s, 'punta-cires', 3, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, NW);
      const ct = k.ct({ carta: [5.5, 2015, -6], anyo: 2020, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2020-c1-n14': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 20,0 W', 'Situación 20:00');
      const t = hrb(22, 30) - hrb(20);
      const est = k.run(s, 80, k.distFor(7.2, t), 'Situación de estima 22:30');
      const obs = k.fix2('cabo-espartel', 191, 'punta-malabata', 100, 'Situación observada 22:30');
      const { rc, ic } = k.corrienteDesconocida(est, obs, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2020-c1-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 04,0 N', '6 00,0 W', 'Situación 16:00');
      const ct = k.ct({ dm: -3, desvio: 8 });
      const rv = k.rv(240, ct);
      const rs = k.abatimiento(rv, 10, SE);
      const { ref, vef } = k.efectivo(rs, 6, NW, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(18) - hrb(16), 'Situación 18:00'));
    },
  },
  'and-py-2020-c1-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 15,0 W', 'Salida');
      const { rs } = k.rumboConCorriente(s, 'algeciras-espigon', 6, E, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: -2, desvio: -6 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2020-c1-n17': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      // «Faro de Pta. Camarinal» = faro de Punta Gracia.
      const s = k.cardinal2('punta-gracia', S, 'punta-paloma', W, 'Salida 15:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'tanger-espigon', hrb(18) - hrb(15), W, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 3, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2020-c1-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (05:02 UT) → primera bajamar (11:01 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 0 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.45, 1.85, 1) }];
    },
  },
  'and-py-2020-c1-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(22, 50), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.70) }];
    },
  },
  'and-py-2020-c1-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('15 00,0 N', '179 15,0 E', 'Salida');
      k.note('Distancia navegada', 'A 10 nudos: 120° durante 3 h (30 millas), 090° durante 4 h (40 millas) y 150° durante 6 h (60 millas).');
      const p = k.tramos(s, [{ rumbo: 120, millas: 30 }, { rumbo: 90, millas: 40 }, { rumbo: 150, millas: 60 }], 'Situación de llegada');
      return latlon(p);
    },
  },

  // ---- 3ª Convocatoria 2020
  'and-py-2020-c3-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Rv 220º y la velocidad no intervienen.
      const dv = k.oposicion('isla-tarifa', 'punta-malabata');
      return [{ kind: 'signed', value: k.ctFrom(dv, 218) }];
    },
  },
  'and-py-2020-c3-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const dvOp = k.oposicion('isla-tarifa', 'punta-alcazar');
      k.note('Demora verdadera de Punta Cires', 'Al W verdadero de Punta Cires, el faro nos demora al E: Dv = 090°.');
      const s = k.lineAndBearing('isla-tarifa', dvOp, 'punta-cires', E, 'Salida');
      // Pasamos al N de Punta Almina: el faro queda por estribor.
      const rs = k.tangent(s, 'punta-almina', 5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, SE);
      const ct = k.ct({ dm: -5, desvio: 10 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2020-c3-n13': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(5, hrb(11) - hrb(9));
      return latlon(k.traslado('cabo-roche', 70, 'cabo-trafalgar', 45, 150, d, 'Situación 11:00'));
    },
  },
  'and-py-2020-c3-n14': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('punta-almina', E, 3, 'Salida 16:00');
      const { rs } = k.rumboYVelocidad(s, 'algeciras-espigon', hrb(20) - hrb(16), SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: -3, desvio: -5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2020-c3-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 20,0 W', 'Situación 13:00');
      const ct = k.ct({ dm: -3, desvio: -6 });
      const rv = k.rv(89, ct);
      const rs = k.abatimiento(rv, 10, NW);
      const { ref, vef } = k.efectivo(rs, 6, SE, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(14, 30) - hrb(13), 'Situación 14:30'));
    },
  },
  'and-py-2020-c3-n16': {
    sinCarta: true,
    ejercicio: 'abatimiento',
    solve(k) {
      const ct = k.ct({ carta: [2.5, 2015, -6], anyo: 2020, desvio: 11 });
      const rv = k.rv(197, ct);
      return [{ kind: 'bearing', value: k.abatimiento(rv, 15, SE) }];
    },
  },
  'and-py-2020-c3-n17': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      // «Faro de Pta. Camarinal» = faro de Punta Gracia; al S verdadero → la línea N–S que pasa por él.
      const s = k.lineAndBearing('punta-gracia', S, 'isla-tarifa', 70, 'Salida');
      const { rs } = k.rumboConCorriente(s, 'barbate-faro', 7, SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 4, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2020-c3-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (12:01 UT) → segunda bajamar (18:19 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 1 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.30, 2.15, 1) }];
    },
  },
  'and-py-2020-c3-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(8, 25), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.90) }];
    },
  },
  'and-py-2020-c3-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('38 20,0 N', '179 05,0 E', 'Salida');
      const b = k.pos('35 42,0 N', '178 38,0 W', 'Llegada');
      return [{ kind: 'bearing', value: k.rumboDirecto(a, b).rumbo }];
    },
  },
};
