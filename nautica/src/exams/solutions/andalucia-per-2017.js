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

  // ---- 2ª Convocatoria 2017
  'and-2017-c2-q42': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const dv = k.dvM(251, 44, 'punta-europa');
      return latlon(k.fixDist('punta-europa', dv, 4, 'Situación 12:00'));
    },
  },
  'and-2017-c2-q43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 42,2 N', '6 06,8 W', 'Salida');
      // Subimos hacia el NE pasando al W de Espartel: el faro queda por estribor.
      const rv = k.tangent(s, 'cabo-espartel', 5, 'estribor');
      const ct = k.ct({ carta: [-6, 2007, -6], anyo: 2017, desvio: 1 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2017-c2-q44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // La Da 127° es la de Punta Cires: la oposición se marca hacia el SE.
      const dv = k.oposicion('isla-tarifa', 'punta-cires');
      return [{ kind: 'signed', value: k.ctFrom(dv, 127) }];
    },
  },
  'and-2017-c2-q45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.cardinal2('cabo-trafalgar', 180, 'punta-gracia', 270, 'Situación 08:00');
      const ct = k.ct({ dm: -4, desvio: -6 });
      const rv = k.rv(123, ct);
      const d = k.distFor(6, hrb(9, 30) - hrb(8, 0));
      return latlon(k.run(s, rv, d, 'Situación 09:30'));
    },
  },

  // ---- 3ª Convocatoria 2017
  'and-2017-c3-q42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 10,0 N', '5 10,0 W', 'Salida');
      // Bajamos hacia el SW pasando al S de Punta Carnero: el faro queda por estribor.
      const rv = k.tangent(s, 'punta-carnero', 4, 'estribor');
      const ct = k.ct({ carta: [7, 2007, -6], anyo: 2017, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2017-c3-q43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      k.note('Rumbo', 'El Rv = 330° y la velocidad no intervienen: la Ct sale de la enfilación.');
      const dv = k.enfilacion('cabo-trafalgar', 'cabo-roche', 315);
      return [{ kind: 'signed', value: k.ctFrom(dv, 315) }];
    },
  },
  'and-2017-c3-q44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 00,0 W', 'Situación 13:00');
      const ct = k.ct({ dm: -5, desvio: -3 });
      const rv = k.rv(38, ct);
      const d = k.distFor(8, hrb(14, 30) - hrb(13, 0));
      return latlon(k.run(s, rv, d, 'Situación 14:30'));
    },
  },
  'and-2017-c3-q45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: 4, desvio: 5 });
      const rv = k.rv(71, ct);
      const dv = k.dvM(rv, 30, 'punta-malabata');
      // Al N verdadero de Espartel: estamos sobre el meridiano del faro (línea 000° que pasa por él).
      return latlon(k.lineAndBearing('cabo-espartel', 0, 'punta-malabata', dv, 'Situación 12:00'));
    },
  },
};
