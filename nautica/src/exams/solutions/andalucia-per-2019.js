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
};
