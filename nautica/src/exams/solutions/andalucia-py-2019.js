// Soluciones programadas PY Andalucía, convocatorias de 2019 (módulo de navegación, UT 4: carta, mareas y loxodrómica). Ver
// andalucia-py.js para el formato. `documentadas`: las de carta sin solución programada, con su motivo
// ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const E = 90; const SE = 135; const S = 180; const SW = 225;

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
};
