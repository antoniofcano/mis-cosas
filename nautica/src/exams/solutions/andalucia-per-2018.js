// Soluciones programadas PER Andalucía, convocatorias de 2018 (preguntas 42–45, carta L105). Ver andalucia-per-0.js para
// el formato. `documentadas`: las de carta sin solución programada, con su motivo ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];

export const documentadas = {};

export default {
  // ---- 1ª Convocatoria 2018
  'and-2018-c1-q42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Salida');
      // Subimos hacia el NW pasando al S de Trafalgar: el faro queda por estribor.
      const rv = k.tangent(s, 'cabo-trafalgar', 5, 'estribor');
      const ct = k.ct({ dm: 4, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2018-c1-q43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      k.note('Rumbo', 'El Rv = 328° y la velocidad no intervienen: la Ct sale de la oposición.');
      const dv = k.oposicion('punta-almina', 'punta-europa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 338) }];
    },
  },
  'and-2018-c1-q44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 09:00');
      const ct = k.ct({ carta: [-5, 2008, -6], anyo: 2018, desvio: -4 });
      const rv = k.rv(60, ct);
      const d = k.distFor(5, hrb(10, 30) - hrb(9, 0));
      return latlon(k.run(s, rv, d, 'Situación 10:30'));
    },
  },
  'and-2018-c1-q45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 11:00');
      const { rv, dist } = k.rhumb(s, 'tanger-espigon');
      const ct = k.ct({ dm: -3, desvio: 3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(11, 0), dist, 4) }];
    },
  },
};
