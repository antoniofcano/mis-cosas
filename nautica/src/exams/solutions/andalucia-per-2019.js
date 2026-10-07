// Soluciones programadas PER Andalucía, convocatorias de 2019 (preguntas 42–45, carta L105). Ver andalucia-per-0.js para
// el formato. `documentadas`: las de carta sin solución programada, con su motivo ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];

export const documentadas = {};

export default {
  'and-2019-c1-q42': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // Con Ra 232° y la enfilación marcada a 259°, estamos al E de Punta Europa viendo ambos faros hacia el WSW.
      const dv = k.enfilacion('punta-europa', 'punta-carnero', 259);
      k.note('Rumbo', 'El Ra = 232° no interviene: la Ct sale de la enfilación.');
      return [{ kind: 'signed', value: k.ctFrom(dv, 259) }];
    },
  },
  'and-2019-c1-q43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const enf = k.enfilacion('punta-europa', 'punta-carnero', 243);
      // Al Norte verdadero de Punta Almina: la demora desde el barco a Almina es 180°.
      const s = k.lineAndBearing('punta-europa', enf, 'punta-almina', 180, 'Situación');
      const rv = k.tangent(s, 'punta-carnero', 4, 'estribor');
      const ct = k.ct({ carta: [-7.5, 2014, 6], anyo: 2019, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2019-c1-q44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const d1 = k.dvM(70, -50, 'isla-tarifa');
      const d2 = k.dvM(70, 50, 'punta-alcazar');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-alcazar', d2));
    },
  },
  'and-2019-c1-q45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 00,0 W', 'Situación 10:00');
      const ct = k.ct({ dm: 3, desvio: 5 });
      const rv = k.rv(70, ct);
      const d = k.distFor(6, hrb(11, 30) - hrb(10, 0));
      return latlon(k.run(s, rv, d, 'Situación 11:30'));
    },
  },
  'and-2019-c2-q42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 09:00');
      const { rv, dist } = k.rhumb(s, 'barbate-faro');
      const ct = k.ct({ dm: 5, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(9, 0), dist, 5) }];
    },
  },
  'and-2019-c2-q43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('punta-cires', 'punta-alcazar', 218);
      k.note('Rumbo', 'El Ra = 232° no interviene: la Ct sale de la enfilación.');
      return [{ kind: 'signed', value: k.ctFrom(dv, 218) }];
    },
  },
  'and-2019-c2-q44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 10,0 N', '6 10,0 W', 'Situación 08:00');
      const ct = k.ct({ dm: -4, desvio: 4 });
      const rv = k.rv(135, ct);
      const d = k.distFor(5, hrb(10, 42) - hrb(8, 0));
      return latlon(k.run(s, rv, d, 'Situación 10:42'));
    },
  },
  'and-2019-c2-q45': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const enf = k.enfilacion('punta-europa', 'punta-carnero', 243);
      // Al Norte verdadero de Punta Almina: la demora desde el barco a Almina es 180°.
      const s = k.lineAndBearing('punta-europa', enf, 'punta-almina', 180, 'Situación');
      const rv = k.tangent(s, 'punta-carnero', 3, 'estribor');
      const ct = k.ct({ carta: [7, 2014, -6], anyo: 2019, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2019-c3-q42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      // Al Norte verdadero de Punta Almina: estamos sobre la línea 000° que sale del faro.
      const s = k.lineAndBearing('punta-almina', 0, 'punta-europa', 250, 'Situación');
      const { rv } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ dm: 6, desvio: 4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2019-c3-q43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('isla-tarifa', 'punta-malabata');
      k.note('Rumbo', 'El Ra = 242° no interviene: la Ct sale de la oposición.');
      return [{ kind: 'signed', value: k.ctFrom(dv, 224) }];
    },
  },
  'and-2019-c3-q44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -9 });
      const d1 = k.dv(92, ct, 'isla-tarifa');
      const d2 = k.dv(342, ct, 'punta-gracia');
      const s = k.fix2('isla-tarifa', d1, 'punta-gracia', d2);
      // Hacia el W, Cabo Trafalgar queda al N del rumbo: lo dejamos por estribor.
      const rv = k.tangent(s, 'cabo-trafalgar', 6, 'estribor');
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2019-c3-q45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '5 50,0 W', 'Situación 12:00');
      const ct = k.ct({ carta: [-5.5, 2014, 6], anyo: 2019, desvio: -8 });
      const rv = k.rv(323, ct);
      const d = k.distFor(6.5, hrb(13, 42) - hrb(12, 0));
      return latlon(k.run(s, rv, d, 'Situación 13:42'));
    },
  },
};
