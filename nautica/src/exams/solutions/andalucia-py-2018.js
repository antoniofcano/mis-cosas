// Soluciones programadas PY Andalucía, convocatorias de 2018 (módulo de navegación, UT 4: carta, mareas y loxodrómica). Ver
// andalucia-py.js para el formato. `documentadas`: las de carta sin solución programada, con su motivo
// ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const E = 90; const S = 180; const W = 270; const NE = 45; const SE = 135; const SW = 225; const NW = 315;
// En el cuadernillo de 2018 la «º» de algunas opciones de Ct se lee como un 0 («+100 (más)» = +10°, «-70 (menos)» = −7°):
// el valor calculado se compara con las opciones en esa misma escala.
const ctLeidaConCero = (ct) => [{ kind: 'signed', value: ct * 10 }];

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
};

export const documentadas = {
  'and-py-2018-c1-n14': { tipo: 'discrepancia', texto: 'El cálculo llega a la oficial (c): situación 08:00 a 3 millas de Punta Cires (Dv 120°), estima de 10 millas al 090° y situación observada 10:00 a 8 millas de Punta Europa (Dv 017°) dan Rc = 314° (NW) e Ihc = 2,1′. No queda en `default` porque las opciones dan el rumbo de la corriente como un cardinal («Rc = NW Ihc = 2,0´») y el lector de opciones no lo lee (ninguna opción legible). Código en `rcCardinal`.' },
};

export default {
  // ---- 1ª Convocatoria 2018 (modelo A)
  'and-py-2018-c1-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Ra 280º y la velocidad no intervienen. «Faro de Pta. Camarinal» = faro de Punta Gracia.
      const dv = k.oposicion('punta-gracia', 'cabo-trafalgar');
      const ct = k.ctFrom(dv, 287);
      k.note('Lectura de las opciones', 'En el cuadernillo la «º» se lee como un 0: «+100 (más)» es +10°.');
      return ctLeidaConCero(ct);
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
};
