// Soluciones programadas PY Andalucía, convocatorias de 2018 (módulo de navegación, UT 4: carta, mareas y loxodrómica). Ver
// andalucia-py.js para el formato. `documentadas`: las de carta sin solución programada, con su motivo
// ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const E = 90; const S = 180; const W = 270; const NE = 45; const SE = 135; const SW = 225; const NW = 315;

// Corriente desconocida con el rumbo de la corriente en las opciones como un cardinal («Rc = NW Ihc = 2,0´»): el lector
// de opciones (src/exams/options.js) no lee un rumbo sin número, así que no se pueden comparar en el test y quedan en
// `documentadas`. El cálculo está aquí, listo para pasar a `default` cuando el lector lea «NW», «SE»…
export const rcCardinal = {
  'and-py-2018-c1-n14': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fixDist('punta-cires', 120, 3, 'Situación 08:00');
      const t = hrb(10) - hrb(8);
      const est = k.run(s, 90, k.distFor(5, t), 'Situación de estima 10:00');
      const obs = k.fixDist('punta-europa', 17, 8, 'Situación observada 10:00');
      const { rc, ic } = k.corrienteDesconocida(est, obs, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2018-c1b-n14': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 13:00');
      const t = hrb(14) - hrb(13);
      const est = k.run(s, 300, k.distFor(4.8, t), 'Situación de estima 14:00');
      // Al S verdadero del faro de Barbate y al W verdadero del de Punta Paloma.
      const obs = k.cardinal2('barbate-faro', S, 'punta-paloma', W, 'Situación observada 14:00');
      const { rc, ic } = k.corrienteDesconocida(est, obs, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2018-c2-n14': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fromMark('cabo-espartel', W, 6.4, 'Situación 10:00');
      const t = hrb(12) - hrb(10);
      const ct = k.ct({ dm: -3, desvio: 3 });
      const rv = k.rv(73, ct);
      const est = k.run(s, rv, k.distFor(6, t), 'Situación de estima 12:00');
      // Al W verdadero de Punta Cires y al N verdadero del faro de Punta Malabata.
      const obs = k.cardinal2('punta-cires', W, 'punta-malabata', N, 'Situación observada 12:00');
      const { rc, ic } = k.corrienteDesconocida(est, obs, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2018-c4-n14': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 01,0 N', '5 49,4 W', 'Situación 11:00');
      const t = hrb(12, 30) - hrb(11);
      const est = k.run(s, 265, k.distFor(8.5, t), 'Situación de estima 12:30');
      // «Faro de Punta Camarinal» = faro de Punta Gracia.
      const obs = k.fix2('punta-gracia', 74.5, 'cabo-trafalgar', 0, 'Situación observada 12:30');
      const { rc, ic } = k.corrienteDesconocida(est, obs, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
};

export const documentadas = {
  'and-py-2018-c1-n14': { tipo: 'discrepancia', texto: 'El cálculo llega a la oficial (c): situación 08:00 a 3 millas de Punta Cires (Dv 120°), estima de 10 millas al 090° y situación observada 10:00 a 8 millas de Punta Europa (Dv 017°) dan Rc = 314° (NW) e Ihc = 2,1′. No queda en `default` porque las opciones dan el rumbo de la corriente como un cardinal («Rc = NW Ihc = 2,0´») y el lector de opciones no lo lee (ninguna opción legible). Código en `rcCardinal`.' },
  'and-py-2018-c1b-n14': { tipo: 'discrepancia', texto: 'El cálculo llega a la oficial (d): estima de 4,8 millas al 300° desde 36° 00′ N, 5° 50′ W y situación observada 14:00 al S verdadero del faro de Barbate y al W verdadero del de Punta Paloma dan Rc = 355° (N) e Ihc = 1,5′. No queda en `default` porque las opciones dan el rumbo de la corriente como un cardinal («Rc = N Ihc = 1,6´») y el lector de opciones no lo lee. Código en `rcCardinal`.' },
  'and-py-2018-c2-n14': { tipo: 'discrepancia', texto: 'El cálculo llega a la oficial (c): salida 10:00 a 6,4 millas al W verdadero de Cabo Espartel, Rv = 073° + (−3° + 3°) = 073°, estima de 12 millas, y situación observada 12:00 al W verdadero de Punta Cires y al N verdadero del faro de Punta Malabata dan Rc = 043° (NE) e Ihc = 2,5′. No queda en `default` porque las opciones dan el rumbo de la corriente como un cardinal («Rc = NE Ihc = 2,5´») y el lector de opciones no lo lee. Código en `rcCardinal`.' },
  'and-py-2018-c4-n13': { tipo: 'discrepancia', texto: 'La enfilación Cabo Espartel–Punta Malabata medida en la carta de la app da Dv = 078,6°: Ct = 078,6° − 087° = −8,4°. La más próxima es la oficial (b, −7°), pero a 1,4° y fuera de la tolerancia: la oficial supone la enfilación en 080°. Con los faros de la carta (Espartel 35° 47,5′ N, 5° 55,4′ W; Malabata 35° 49,2′ N, 5° 45,0′ W) no sale 080°.' },
  'and-py-2018-c4-n14': { tipo: 'discrepancia', texto: 'El cálculo llega a la oficial (c): estima de 12,75 millas al 265° desde 36° 01′ N, 5° 49,4′ W y situación observada 12:30 por las demoras de Punta Camarinal (074,5°) y Cabo Trafalgar (000°) dan Rc = 044° (NE) e Ihc = 2,4′. No queda en `default` porque las opciones dan el rumbo de la corriente como un cardinal («Rc = NE, Ihc = 2,5\'») y el lector de opciones no lo lee. Código en `rcCardinal`.' },
};

export default {
  // ---- 1ª Convocatoria 2018 (modelo A)
  'and-py-2018-c1-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Ra 280º y la velocidad no intervienen. «Faro de Pta. Camarinal» = faro de Punta Gracia.
      const dv = k.oposicion('punta-gracia', 'cabo-trafalgar');
      const ct = k.ctFrom(dv, 287);
      return [{ kind: 'signed', value: ct }];
    },
  },
  'and-py-2018-c1-n12': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 10,0 N', '5 15,0 W', 'Salida 11:00');
      const { rs } = k.rumboConCorriente(s, 'ceuta-bocana', 8, SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 5, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2018-c1-n13': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 09:00');
      const ct = k.ct({ dm: 3, desvio: 7 });
      const rv = k.rv(305, ct);
      const rs = k.abatimiento(rv, 15, NE);
      return latlon(k.run(s, rs, k.distFor(6, hrb(11, 30) - hrb(9)), 'Situación 11:30'));
    },
  },
  'and-py-2018-c1-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 13:00');
      const ct = k.ct({ dm: 4, desvio: 6 });
      const rv = k.rv(50, ct);
      const rs = k.abatimiento(rv, 10, N);
      const { ref, vef } = k.efectivo(rs, 5, SE, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(14, 30) - hrb(13), 'Situación 14:30'));
    },
  },
  'and-py-2018-c1-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Salida 12:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'tanger-espigon', hrb(14, 30) - hrb(12), W, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ carta: [-4, 2008, 6], anyo: 2018, desvio: 3 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2018-c1-n17': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(8, hrb(19) - hrb(18));
      // De los dos cortes, el del centro del Estrecho: el otro (36° 03,4′ N, 5° 39,4′ W) cae en la costa, junto a la
      // Torre de la Peña.
      const enElMar = (c) => c.sort((a, b) => a.lat - b.lat)[0];
      return latlon(k.trasladoDosArcos('punta-carnero', 4, 'isla-tarifa', 4, 250, d, enElMar, 'Situación 19:00'));
    },
  },
  'and-py-2018-c1-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (00:36 UT) → primera bajamar (06:52 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 0 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.30, 2.32, 1) }];
    },
  },
  'and-py-2018-c1-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(17, 45), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 2.32) }];
    },
  },
  'and-py-2018-c1-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('32 00,0 N', '178 50,0 W', 'Salida');
      const b = k.pos('25 00,0 N', '179 35,0 E', 'Llegada');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
    },
  },
  // ---- 1ª Convocatoria 2018 (modelo B)
  'and-py-2018-c1b-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Rv 315º y la velocidad no intervienen. «Faro de Pta. Camarinal» = faro de Punta Gracia. En la enfilación los
      // vemos uno tras otro hacia el NW (Trafalgar detrás de Camarinal), así que la demora de Trafalgar es la de la línea.
      const dv = k.enfilacion('punta-gracia', 'cabo-trafalgar', 307);
      const ct = k.ctFrom(dv, 307);
      return [{ kind: 'signed', value: ct }];
    },
  },
  'and-py-2018-c1b-n12': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 05,0 N', '5 23,0 W', 'Salida 11:00');
      const { rs } = k.rumboConCorriente(s, 'ceuta-bocana', 8, SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 6, desvio: 3 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2018-c1b-n13': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 09:00');
      const ct = k.ct({ dm: 5, desvio: 4 });
      const rv = k.rv(60, ct);
      const rs = k.abatimiento(rv, 10, NW);
      return latlon(k.run(s, rs, k.distFor(6, hrb(10, 30) - hrb(9)), 'Situación 10:30'));
    },
  },
  'and-py-2018-c1b-n15': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('punta-malabata', N, 5, 'Salida 14:00');
      // Pasamos al N de Punta Cires: el faro queda por estribor.
      const rs = k.tangent(s, 'punta-cires', 2, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, N);
      const ct = k.ct({ dm: -4, desvio: 12 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2018-c1b-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 10,0 W', 'Salida 18:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'barbate-espigon', hrb(21) - hrb(18), SE, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ carta: [5, 2008, -6], anyo: 2018, desvio: 3 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2018-c1b-n17': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      // Al N verdadero de Cabo Espartel: el faro nos demora al S (Dv 180°).
      const d = k.distFor(7, hrb(16) - hrb(15));
      return latlon(k.traslado('cabo-espartel', S, 'punta-malabata', 160, 75, d, 'Situación 16:00'));
    },
  },
  'and-py-2018-c1b-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Segunda pleamar (13:34 UT) → segunda bajamar (19:36 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 2 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.80, 2.40, 1) }];
    },
  },
  'and-py-2018-c1b-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(5, 30), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 2.40) }];
    },
  },
  'and-py-2018-c1b-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('13 00,0 N', '176 30,0 E', 'Salida');
      const b = k.pos('11 00,0 S', '174 50,0 E', 'Llegada');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
    },
  },
  // ---- 2ª Convocatoria 2018
  'and-py-2018-c2-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Ra 335º y la velocidad no intervienen. En la enfilación vemos Cabo Roche detrás de Trafalgar, hacia el NW: la
      // demora de Trafalgar es la de la línea.
      const dv = k.enfilacion('cabo-trafalgar', 'cabo-roche', 314);
      const ct = k.ctFrom(dv, 314);
      return [{ kind: 'signed', value: ct }];
    },
  },
  'and-py-2018-c2-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('punta-alcazar', N, 5, 'Salida 20:00');
      // Pasamos al N de Punta Almina: el faro queda por estribor.
      const rs = k.tangent(s, 'punta-almina', 3, 'estribor');
      const rv = k.rvConAbatimiento(rs, 20, N);
      const ct = k.ct({ dm: 5, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2018-c2-n13': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('35 55,0 N', '5 50,0 W', 'Situación 11:00');
      const ct = k.ct({ dm: -3, desvio: -7 });
      const rv = k.rv(300, ct);
      const rs = k.abatimiento(rv, 15, NE);
      return latlon(k.run(s, rs, k.distFor(6, hrb(13, 30) - hrb(11)), 'Situación 13:30'));
    },
  },
  'and-py-2018-c2-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      // «Faro de Punta Camarinal» = faro de Punta Gracia.
      const s = k.fix2('punta-gracia', 330, 'isla-tarifa', 60, 'Situación 18:00');
      const { ref, vef } = k.efectivo(290, 6, N, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(19, 30) - hrb(18), 'Situación 19:30'));
    },
  },
  'and-py-2018-c2-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 15,0 W', 'Salida 09:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'algeciras-espigon', hrb(10, 30) - hrb(9), SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ carta: [6, 2008, -6], anyo: 2018, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2018-c2-n17': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-carnero', E, 2, 'Salida 17:30');
      const { rv: rs, dist } = k.rhumb(s, 'ceuta-bocana');
      const rv = k.rvConAbatimiento(rs, 15, E);
      const ct = k.ct({ dm: -6, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(17, 30), dist, 6) }];
    },
  },
  'and-py-2018-c2-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Segunda bajamar (13:42 UT) → segunda pleamar (20:01 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 2 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.90, 1.85, 2) }];
    },
  },
  'and-py-2018-c2-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(13, 15), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.85) }];
    },
  },
  'and-py-2018-c2-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('23 00,0 N', '179 50,0 E', 'Salida');
      const b = k.pos('28 00,0 N', '178 35,0 W', 'Llegada');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
    },
  },
  // ---- 4ª Convocatoria 2018
  'and-py-2018-c4-n11': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.fromMark('cabo-roche', W, 5, 'Situación 15:00');
      const ct = k.ct({ dm: -5, desvio: 9 });
      const rv = k.rv(144, ct);
      k.note('Rumbo de superficie', 'Sin viento no hay abatimiento: el rumbo de superficie es el mismo Rv.');
      const { ref } = k.efectivo(rv, 8, SW, 3, s);
      return [{ kind: 'bearing', value: ref }];
    },
  },
  'and-py-2018-c4-n12': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 09:00');
      const ct = k.ct({ dm: -3, desvio: -11 });
      const rv = k.rv(234, ct);
      const rs = k.abatimiento(rv, 10, SE);
      const { ref, vef } = k.efectivo(rs, 8, SE, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(10, 30) - hrb(9), 'Situación 10:30'));
    },
  },
  'and-py-2018-c4-n15': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(6, hrb(10, 30) - hrb(8));
      return latlon(k.traslado('punta-malabata', 200, 'isla-tarifa', 290, 70, d, 'Situación 10:30'));
    },
  },
  'and-py-2018-c4-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      // En la enfilación Punta Europa–Punta Carnero y a 4 millas de Europa: al E de Europa, sobre la prolongación de la
      // línea (entre los dos faros, a 4,3 millas uno de otro, sería una oposición; al W de Carnero, a más de 4 millas).
      const dir = k.enfilacion('punta-carnero', 'punta-europa');
      const s = k.fromMark('punta-europa', dir, 4, 'Salida 21:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'ceuta-bocana', hrb(23, 30) - hrb(21), SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ carta: [7, 2008, -6], anyo: 2018, desvio: 9 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2018-c4-n17': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 40,0 W', 'Salida 19:30');
      const { rv: rs } = k.rhumb(s, 'tanger-espigon');
      const rv = k.rvConAbatimiento(rs, 15, E);
      const ct = k.ct({ dm: 6, desvio: 3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2018-c4-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Segunda pleamar (14:23 UT) → segunda bajamar (20:28 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 2 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.90, 2.40, 1) }];
    },
  },
  'and-py-2018-c4-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(13, 42), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 2.40) }];
    },
  },
  'and-py-2018-c4-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('15 00,0 S', '178 50,0 W', 'Salida');
      const b = k.pos('11 00,0 S', '179 45,0 E', 'Llegada');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
    },
  },
};
