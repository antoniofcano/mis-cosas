// Soluciones programadas PER Andalucía, convocatorias de 2017 (preguntas 42–45, carta L105). Ver andalucia-per-0.js para
// el formato. `documentadas`: las de carta sin solución programada, con su motivo ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];

export const documentadas = {};

export default {
  // ---- 1ª Convocatoria 2017
  'and-2017-c1-q42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 15,0 N', '5 15,0 W', 'Situación 10:30');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      // La declinación de la carta del enunciado (7°00′ E 2002, 4′ W), actualizada a 2017.
      const ct = k.ct({ carta: [7, 2002, -4], anyo: 2017, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(10, 30), dist, 6) }];
    },
  },
  'and-2017-c1-q43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const d1 = k.dvM(75, 40, 'punta-alcazar');
      const d2 = k.dvM(75, -80, 'punta-paloma');
      return latlon(k.fix2('punta-alcazar', d1, 'punta-paloma', d2));
    },
  },
  'and-2017-c1-q44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('cabo-trafalgar', 'cabo-roche', 330);
      return [{ kind: 'signed', value: k.ctFrom(dv, 330) }];
    },
  },
  'and-2017-c1-q45': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fix2('punta-gracia', 40, 'punta-malabata', 160, 'Situación 11:00');
      // Vamos hacia el NW pasando al S de Trafalgar: el faro queda por estribor.
      const rv = k.tangent(s, 'cabo-trafalgar', 5, 'estribor');
      const ct = k.ct({ dm: 3, desvio: -12 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },

};
