// Soluciones programadas PY Andalucía, convocatorias de 2016 (módulo de navegación, UT 4: carta, mareas y loxodrómica). Ver
// andalucia-py.js para el formato. `documentadas`: las de carta sin solución programada, con su motivo
// ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
// `pendientes`: resoluciones que llegan a la oficial pero que el lector de opciones (src/exams/options.js) no puede comparar
// todavía: dan el rumbo de la corriente como «Rc = SE» / «NW», sin grados. Están en `documentadas` hasta que lo lea.
import { hrb } from '../kit.js';
import { rhumbDestination } from '../../math/mercator.js';
import { fmtBearing, fmtPos } from '../../math/format.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const NE = 45; const E = 90; const S = 180; const SE = 135; const SW = 225; const W = 270; const NW = 315;

const lectorRc = (calc) => `El cálculo llega a la oficial (${calc}), pero el lector de opciones no entiende el rumbo de la corriente escrito con letras («Rc = SE» / «NW», sin grados): la comparación automática no lee ninguna opción. La resolución está en \`pendientes\` de este fichero.`;

export const documentadas = {
  'and-py-2016-c1-n14': { tipo: 'discrepancia', texto: lectorRc('Rc = 136° (SE), Ihc = 1,4′; oficial c, «Rc = SE, Ihc = 1,5′»') },
  'and-py-2016-c2-n11': { tipo: 'discrepancia', texto: 'En la carta, la enfilación Espartel–Malabata mide 078,6° (como en and-py-2022-c2-n11): con la Da 093° la Ct es −14,4°. La oficial (−13°) es la más próxima, pero queda a 1,4° del cálculo, fuera de la tolerancia: el tribunal debió medir 080°. (El enunciado dice «Punta Malabata Carnero»: es Malabata.)' },
  'and-py-2016-c2-n15': { tipo: 'discrepancia', texto: lectorRc('Rc = 138° (SE), Ihc = 1,5′; oficial d, «Rc = SE; Ihc = 1,5′»') },
  'and-py-2016-c3-n12': { tipo: 'discrepancia', texto: 'En la carta, la recta Espartel → Malabata mide 078,6°: en la oposición, con la Da 071° la Ct es +7,6°, más cerca de c (+7°) que de la oficial d (+9°). El tribunal debió medir 080° (la misma medida que en and-py-2016-c2-n11 y and-py-2022-c2-n11).' },
  'and-py-2016-c3-n15': { tipo: 'discrepancia', texto: lectorRc('Rc = 135° (SE), Ihc = 2,0′; oficial b, «Rc = SE, Ihc = 2,0′»') },
};

export const pendientes = {
  'and-py-2016-c1-n14': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fixDist('cabo-espartel', 123, 4, 'Situación 11:00');
      const d = k.distFor(8, hrb(12, 30) - hrb(11));
      const est = k.run(s, 60, d, 'Situación de estima 12:30');
      const obs = k.fromMark('punta-malabata', 0, 5, 'Situación observada 12:30');
      const { rc, ic } = k.corrienteDesconocida(est, obs, 90);
      return [{ kind: 'bearing', value: rc }, { kind: 'distance', value: ic }];
    },
  },
  'and-py-2016-c2-n15': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = enfilacionADistancia(k, 'punta-carnero', 'punta-europa', 6, 'Situación 14:00');
      const d = k.distFor(5.1, hrb(16) - hrb(14));
      const est = k.run(s, 227, d, 'Situación de estima 16:00');
      const obs = k.cardinal2('punta-europa', 180, 'isla-tarifa', E, 'Situación observada 16:00');
      const { rc, ic } = k.corrienteDesconocida(est, obs, 120);
      return [{ kind: 'bearing', value: rc }, { kind: 'distance', value: ic }];
    },
  },
  'and-py-2016-c3-n15': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 17:00');
      const ct = k.ct({ dm: 3, desvio: 7 });
      const rv = k.rv(60, ct);
      const d = k.distFor(5, hrb(19) - hrb(17));
      const est = k.run(s, rv, d, 'Situación de estima 19:00');
      const obs = k.fix2('cabo-espartel', 187, 'punta-malabata', 100, 'Situación observada 19:00');
      const { rc, ic } = k.corrienteDesconocida(est, obs, 120);
      return [{ kind: 'bearing', value: rc }, { kind: 'distance', value: ic }];
    },
  },
};

// ---- Operaciones locales

/** Tabla del Anuario que pasa de un día al siguiente: las horas del día siguiente se cuentan a partir de las 24:00. */
function horasSeguidas(k, tabla) {
  const d0 = tabla[0].dia;
  const sig = tabla.filter((x) => x.dia !== d0);
  if (sig.length) k.note('Horas del día siguiente', `La tabla sigue en el día ${sig[0].dia}: para medir los intervalos contamos sus horas a partir de las 24:00 (${sig.map((x) => `${x.hora} → ${String(24 + Number(x.hora.slice(0, 2))).padStart(2, '0')}${x.hora.slice(2)}`).join(', ')}).`);
  return tabla.map((x) => (x.dia === d0 ? x : { ...x, hora: `${24 * (x.dia - d0) + Number(x.hora.slice(0, 2))}${x.hora.slice(2)}` }));
}

/**
 * «En la enfilación de A y B y a `dist` millas de B»: estamos en la prolongación de la recta A → B, más allá de B
 * (los dos faros se ven uno detrás del otro; entre ellos no habría enfilación).
 */
function enfilacionADistancia(k, a, b, dist, label) {
  const dv = k.enfilacion(b, a);
  const p = rhumbDestination(k.P(b), dv + 180, dist);
  k.note(label, `Estamos en la enfilación, por fuera de ${k.P(b).name.replace(/^Faro de /, 'faro de ')}: desde él trazamos ${fmtBearing(dv + 180)} y medimos ${String(dist).replace('.', ',')} millas: ${fmtPos(p)}.`);
  k.items.push({ t: 'pos', at: p, label, style: 'start', step: k.steps.length });
  k.focus.push(p);
  return p;
}

export default {
  // ---- 1ª Convocatoria 2016
  'and-py-2016-c1-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('punta-carnero', 'punta-europa', 258);
      return [{ kind: 'signed', value: k.ctFrom(dv, 258) }];
    },
  },
  'and-py-2016-c1-n12': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(8, hrb(13, 30) - hrb(13));
      return latlon(k.traslado('punta-cires', 160, 'punta-cires', 225, 70, d, 'Situación 13:30'));
    },
  },
  'and-py-2016-c1-n13': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 45,0 W', 'Salida');
      // Salimos del Estrecho hacia el NW: Trafalgar queda a la derecha, lo dejamos por estribor.
      const rs = k.tangent(s, 'cabo-trafalgar', 5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, SW);
      const ct = k.ct({ dm: -5, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2016-c1-n15': {
    ejercicio: 'abatimiento',
    sinCarta: true,
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -5 });
      const rv = k.rv(298, ct);
      const rs = k.abatimiento(rv, 10, SW);
      k.note('Rumbo sobre el fondo', 'Sin corriente, el rumbo sobre el fondo es el de superficie.');
      return [{ kind: 'bearing', value: rs }];
    },
  },
  'and-py-2016-c1-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const dvE = k.enfilacion('punta-alcazar', 'punta-cires');
      // «Al Este verdadero del faro de Punta Carnero»: vemos el faro en Dv 270°.
      const s = k.lineAndBearing('punta-alcazar', dvE, 'punta-carnero', 270, 'Situación de salida');
      // Vamos hacia el W, saliendo del Estrecho: la isla de Tarifa queda a la derecha, la dejamos por estribor.
      const ref = k.tangent(s, 'isla-tarifa', 3, 'estribor');
      const { rs } = k.rumboConCorriente(s, ref, 8, 135, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      // 5º W 2006 con variación 6′ E anual.
      const ct = k.ct({ carta: [-5, 2006, 6], anyo: 2016, desvio: -8 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2016-c1-n17': {
    ejercicio: 'estima-analitica',
    sinCarta: true,
    solve(k) {
      const a = k.pos('29 15,0 S', '179 35,0 W', 'Salida');
      const b = k.pos('25 20,0 N', '178 15,0 E', 'Llegada');
      return [{ kind: 'bearing', value: k.rumboDirecto(a, b).rumbo }];
    },
  },
  'and-py-2016-c1-n18': {
    ejercicio: 'ct-enfilacion',
    sinCarta: true,
    solve(k) {
      return [{ kind: 'signed', value: k.ctPolar(5) }];
    },
  },

  // ---- 2ª Convocatoria 2016
  'and-py-2016-c2-n12': {
    ejercicio: 'abatimiento',
    solve(k) {
      // Al W de Espartel, con los dos faros enfilados por la proa.
      const s = enfilacionADistancia(k, 'punta-malabata', 'cabo-espartel', 5.4, 'Situación de salida');
      // Entramos en el Estrecho hacia el E: Malabata queda a la derecha, lo dejamos por estribor.
      const rs = k.tangent(s, 'punta-malabata', 5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 8, SE);
      // 6º W 2006 con variación 6′ E anual.
      const ct = k.ct({ carta: [-6, 2006, 6], anyo: 2016, desvio: -5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2016-c2-n13': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 16:00');
      const ct1 = k.ct({ dm: -5, desvio: 5 });
      const rv1 = k.rv(60, ct1);
      const p = k.run(s, rv1, k.distFor(8, hrb(17) - hrb(16)), 'Situación 17:00');
      const ct2 = k.ct({ dm: -5, desvio: 0 });
      const rv2 = k.rv(335, ct2);
      const rs = k.abatimiento(rv2, 10, W);
      const { ref, vef } = k.efectivo(rs, 8, E, 3, p);
      return latlon(k.estimaEfectiva(p, ref, vef, hrb(18, 30) - hrb(17), 'Situación 18:30'));
    },
  },
  'and-py-2016-c2-n14': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fix2('punta-paloma', 45, 'isla-tarifa', 100, 'Situación de salida');
      const { rs } = k.rumboConCorriente(s, 'barbate-faro', 8, W, 2);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 7, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2016-c2-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('punta-europa', E, 6, 'Situación 19:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'ceuta-bocana', hrb(21) - hrb(19), E, 2);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      return [{ kind: 'bearing', value: rs }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2016-c2-n17': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(8, hrb(11) - hrb(10));
      return latlon(k.traslado('punta-cires', 200, 'punta-almina', 170, 70, d, 'Situación 11:00'));
    },
  },
  'and-py-2016-c2-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera bajamar (09:44 UT) → segunda pleamar (16:08 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 1 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 2.8, 1.7, 2) }];
    },
  },
  'and-py-2016-c2-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(22), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.7) }];
    },
  },
  'and-py-2016-c2-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('15 00,0 S', '178 00,0 E', 'Salida');
      const b = k.pos('10 00,0 S', '176 00,0 W', 'Llegada');
      return [{ kind: 'bearing', value: k.rumboDirecto(a, b).rumbo }];
    },
  },

  // ---- 3ª Convocatoria 2016
  'and-py-2016-c3-n11': {
    ejercicio: 'abatimiento',
    solve(k) {
      // Al E de Punta Europa: por el otro lado, a 5 millas de Europa estaríamos a 0,6 millas de Carnero, dentro del arco de 3.
      const s = enfilacionADistancia(k, 'punta-carnero', 'punta-europa', 5, 'Situación 11:00');
      // Vamos hacia el SW a doblar Carnero por fuera: lo dejamos por estribor (al N de nuestra derrota).
      const rs = k.tangent(s, 'punta-carnero', 3, 'estribor');
      const rv = k.rvConAbatimiento(rs, 10, NW);
      // 7º W 2006 con variación 6′ E anual.
      const ct = k.ct({ carta: [-7, 2006, 6], anyo: 2016, desvio: -4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2016-c3-n13': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fix2('isla-tarifa', 110, 'punta-alcazar', 145, 'Situación 12:00');
      const { rs } = k.rumboConCorriente(s, 'tanger-espigon', 8, W, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 8, desvio: 4 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2016-c3-n14': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(6, hrb(16, 30) - hrb(15));
      // «Faro de Punta Camarinal» = faro de Punta de Gracia (Camarinal).
      return latlon(k.traslado('cabo-roche', 30, 'punta-gracia', 100, 150, d, 'Situación 16:30'));
    },
  },
  'and-py-2016-c3-n16': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.cardinal2('punta-alcazar', N, 'punta-cires', W, 'Situación 08:00');
      const rs = k.abatimiento(71, 8, S);
      const d = k.distFor(6, hrb(10) - hrb(8));
      return latlon(k.run(s, rs, d, 'Situación de estima 10:00'));
    },
  },
  'and-py-2016-c3-n17': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Salida 20:00');
      const { ref, vb } = k.rumboYVelocidad(s, 'barbate-faro', hrb(22) - hrb(20), NE, 3);
      return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2016-c3-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (05:40 UT) → primera bajamar (11:53 UT): la marea baja y la sonda de 3,2 m dura hasta esa hora.
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 0 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.2, 1.4, 1) }];
    },
  },
  'and-py-2016-c3-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(22, 15), 1);
      const tr = k.tramoMarea(horasSeguidas(k, q.tabla_mareas), { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.7) }];
    },
  },
  'and-py-2016-c3-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('12 20,0 S', '177 20,0 W', 'Salida');
      const b = k.pos('9 10,0 S', '178 15,0 E', 'Llegada');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
    },
  },
};
