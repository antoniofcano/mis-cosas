// Soluciones programadas de las preguntas de carta del PY Andalucía (módulo de navegación, UT 4).
// Mismo formato que andalucia-per-*.js: cada `solve(k)` resuelve con el kit y devuelve los valores a comparar
// con las opciones. Las de mareas leen la tabla del Anuario que trae la propia pregunta (q.tabla_mareas).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const W = 270; const S = 180; const SW = 225;

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
      k.note('Demora del través', 'El través se mide desde la proa, es decir, desde el Rv: por estribor, Dv = Rv + 90° = 210° + 90° = 300°.');
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
};
