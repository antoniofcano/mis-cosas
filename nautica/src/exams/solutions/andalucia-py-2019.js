// Soluciones programadas PY Andalucía, convocatorias de 2019 (módulo de navegación, UT 4: carta, mareas y loxodrómica). Ver
// andalucia-py.js para el formato. `documentadas`: las de carta sin solución programada, con su motivo
// ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';
import { rhumbTo, rhumbDestination } from '../../math/mercator.js';
import { fmtBearing, fmtMiles } from '../../math/format.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const NE = 45; const E = 90; const SE = 135; const S = 180; const SW = 225;

export const documentadas = {};

export default {
  // ---- 1ª Convocatoria 2019
  'and-py-2019-c1-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Ra 333º y la velocidad no intervienen.
      const dv = k.enfilacion('cabo-trafalgar', 'cabo-roche', 315);
      return [{ kind: 'signed', value: k.ctFrom(dv, 315) }];
    },
  },
  'and-py-2019-c1-n12': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.cardinal2('punta-europa', E, 'punta-almina', N, 'Salida');
      const { rs } = k.rumboConCorriente(s, 'ceuta-bocana', 8, SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 4, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2019-c1-n13': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 10,0 N', '6 10,0 W', 'Situación 08:00');
      const ct = k.ct({ carta: [-6, 2009, 6], anyo: 2019, desvio: 15 });
      const rv = k.rv(120, ct);
      k.note('Rumbo de superficie', 'Sin viento no hay abatimiento: Rs = Rv.');
      const { ref } = k.efectivo(rv, 8, SW, 3, s);
      return [{ kind: 'bearing', value: ref }];
    },
  },
  'and-py-2019-c1-n14': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fromMark('isla-tarifa', S, 5, 'Situación 08:30');
      const t = hrb(9, 30) - hrb(8, 30);
      const est = k.run(s, 71.5, k.distFor(8, t), 'Situación de estima 09:30');
      const obs = k.fromMark('punta-carnero', S, 8.5, 'Situación observada 09:30');
      const { rc, ic } = k.corrienteDesconocida(est, obs, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2019-c1-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 13:00');
      const ct = k.ct({ dm: 4, desvio: 6 });
      const rv = k.rv(75, ct);
      const rs = k.abatimiento(rv, 5, SE);
      const { ref, vef } = k.efectivo(rs, 8, SE, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(14) - hrb(13), 'Situación 14:00'));
    },
  },
  'and-py-2019-c1-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 45,0 W', 'Salida 10:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'tanger-espigon', hrb(12) - hrb(10), E, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: -3, desvio: -4 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2019-c1-n17': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      // Distancias no simultáneas. «Faro de Punta Camarinal» = faro de Punta Gracia.
      const d = k.distFor(6, hrb(12) - hrb(11));
      // De los dos cortes, el que queda en el mar (al SW de la costa).
      const elegir = (c) => c.sort((u, v) => u.lat - v.lat)[0];
      const p = k.trasladoDosArcos('punta-gracia', 4, 'cabo-trafalgar', 5, 300, d, elegir, 'Situación 12:00');
      // Sale 36° 06,5′ N, 5° 59,3′ W, la b. Su longitud está impresa sin «º» («005 59,4´W», igual que la d) y el lector
      // no la lee: se compara solo la latitud, que ya separa las cuatro opciones.
      return [{ kind: 'lat', value: p.lat }];
    },
  },
  'and-py-2019-c1-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Segunda pleamar (15:12 UT) → segunda bajamar (21:16 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 2 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 2.45, 1.50, 2) }];
    },
  },
  'and-py-2019-c1-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(13, 52), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 2.13) }];
    },
  },
  'and-py-2019-c1-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('15 00,0 S', '178 20,0 W', 'Salida');
      const b = k.pos('10 00,0 N', '179 15,0 E', 'Llegada');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
    },
  },
  // ---- 2ª Convocatoria 2019
  'and-py-2019-c2-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Ra 133º y la velocidad no intervienen. «Faro de Punta Camarinal» = faro de Punta Gracia.
      const dv = k.oposicion('punta-gracia', 'isla-tarifa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 128) }];
    },
  },
  'and-py-2019-c2-n12': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 59,0 N', '5 51,0 W', 'Salida');
      const { rs } = k.rumboConCorriente(s, 'barbate-faro', 6, E, 2);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 6, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2019-c2-n13': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('punta-malabata', N, 3, 'Salida');
      // Pasamos al N de Punta Cires: el faro queda por estribor.
      const rs = k.tangent(s, 'punta-cires', 3, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, N);
      const ct = k.ct({ carta: [7, 2009, -6], anyo: 2019, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2019-c2-n14': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('35 48,0 N', '6 02,8 W', 'Situación 07:00');
      const t = hrb(9) - hrb(7);
      const est = k.run(s, 60, k.distFor(6, t), 'Situación de estima 09:00');
      const obs = k.fix2('cabo-espartel', 184, 'punta-malabata', 120, 'Situación observada 09:00');
      const { rc, ic } = k.corrienteDesconocida(est, obs, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2019-c2-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      // El enunciado dice «6 de abril de 2019» (examen de junio): el año, que es lo que cuenta, es 2019.
      const s = k.pos('36 10,0 N', '6 00,0 W', 'Situación 12:30');
      const ct = k.ct({ carta: [-2.5, 2005, 7], anyo: 2019, desvio: -7 });
      const rv = k.rv(218, ct);
      const rs = k.abatimiento(rv, 5, S);
      const { ref, vef } = k.efectivo(rs, 6, SE, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(14) - hrb(12, 30), 'Situación 14:00'));
    },
  },
  'and-py-2019-c2-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const dv = k.enfilacion('punta-carnero', 'punta-europa');
      k.note('Demora verdadera de Punta Almina', 'Al N verdadero de Punta Almina, el faro nos demora al S: Dv = 180°.');
      const s = k.lineAndBearing('punta-europa', dv, 'punta-almina', S, 'Situación 09:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'ceuta-bocana', hrb(11) - hrb(9), E, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: -5, desvio: -4 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2019-c2-n17': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      // Entre las dos demoras hay dos rumbos (252° de 10:00 a 11:00 y 270° de 11:00 a 12:00): la 1ª línea se traslada
      // lo navegado en total, que es la resultante de los dos tramos. «Faro de Punta Camarinal» = faro de Punta Gracia.
      const d = k.distFor(6, hrb(11) - hrb(10));
      const o = { lat: 36, lon: -5.5 };
      const { bearing: rumbo, distance: millas } = rhumbTo(o, rhumbDestination(rhumbDestination(o, 252, d), 270, d));
      k.note('Lo navegado entre las dos demoras', `${fmtMiles(d)} al 252° y ${fmtMiles(d)} al 270°: uniendo el principio del 1er tramo con el final del 2º, ${fmtBearing(rumbo, 1)} y ${fmtMiles(millas, 2)}.`);
      return latlon(k.traslado('punta-carnero', 45, 'punta-gracia', 330, rumbo, millas, 'Situación 12:00'));
    },
  },
  'and-py-2019-c2-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Segunda pleamar (17:06 UT) → segunda bajamar (23:18 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 2 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.15, 1.95, 2) }];
    },
  },
  'and-py-2019-c2-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(14, 18), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.75) }];
    },
  },
  'and-py-2019-c2-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('35 15,0 N', '179 40,0 W', 'Salida 23:00');
      k.note('Distancia navegada', 'A 8 nudos: 235° durante 3 h (24 millas, hasta las 02:00), 325° durante 2 h (16 millas, hasta las 04:00), 180° durante 3 h (24 millas, hasta las 07:00) y 270° durante 2 h (16 millas, hasta las 09:00). La corriente NE de 3 nudos actúa desde las 03:00 hasta las 09:00: 6 h, 18 millas.');
      const p = k.tramos(s, [{ rumbo: 235, millas: 24 }, { rumbo: 325, millas: 16 }, { rumbo: 180, millas: 24 }, { rumbo: 270, millas: 16 }, { rumbo: NE, millas: 18, nombre: 'Corriente 045°' }], 'Situación de llegada');
      return latlon(p);
    },
  },
};
