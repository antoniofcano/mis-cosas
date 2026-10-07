// Soluciones programadas PER Andalucía, convocatorias de 2015 (preguntas 42–45, carta L105). Ver andalucia-per-0.js para
// el formato. `documentadas`: las de carta sin solución programada, con su motivo ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];

export const documentadas = {};

export default {
  'and-2015-c1-q42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: 4 });
      const d1 = k.dv(10, ct, 'punta-europa');
      const d2 = k.dv(320, ct, 'punta-carnero');
      return latlon(k.fix2('punta-europa', d1, 'punta-carnero', d2, 'Situación 11:00'));
    },
  },
  'and-2015-c1-q43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 00,0 W', 'Situación de salida');
      const llegada = k.pos('35 57,0 N', '5 28,0 W', 'Punto de llegada');
      const { rv } = k.rhumb(s, llegada);
      const ct = k.ct({ dm: -3, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2015-c1-q44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 14:00');
      k.note('Rumbo verdadero', 'El Rv = 060° es dato: la Ct no hace falta.');
      const d = k.distFor(6, hrb(17, 0) - hrb(14, 0));
      return latlon(k.run(s, 60, d, 'Situación 17:00'));
    },
  },
  'and-2015-c1-q45': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-almina', 'punta-europa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 338) }];
    },
  },
};
