// Soluciones programadas PER Andalucía, convocatorias de 2016 (preguntas 42–45, carta L105). Ver andalucia-per-0.js para
// el formato. `documentadas`: las de carta sin solución programada, con su motivo ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];

export const documentadas = {};

export default {
  'and-2016-c1-q42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 50,0 N', '5 50,0 W', 'Situación de salida');
      k.note('Banda', 'Punta Cires está en la costa de Marruecos, al S del rumbo: pasamos al N del faro, dejándolo por estribor.');
      const rv = k.tangent(s, 'punta-cires', 2, 'estribor');
      // Declinación del enunciado: 5°00′ W 2006 (6′ E).
      const ct = k.ct({ carta: [-5, 2006, 6], anyo: 2016, desvio: -6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2016-c1-q43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const d1 = k.dvM(105, -43, 'punta-gracia');
      const d2 = k.dvM(105, 35, 'punta-malabata');
      return latlon(k.fix2('punta-gracia', d1, 'punta-malabata', d2));
    },
  },
  'and-2016-c1-q44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-europa', 'punta-almina');
      k.note('Rumbo', 'El Rv = 070° y la velocidad no intervienen: la Ct sale de la oposición.');
      return [{ kind: 'signed', value: k.ctFrom(dv, 156) }];
    },
  },
  'and-2016-c1-q45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fixDist('cabo-espartel', 140, 5, 'Situación 13:00');
      const ct = k.ct({ dm: -5, desvio: 15 });
      const rv = k.rv(240, ct);
      const d = k.distFor(6, hrb(14, 30) - hrb(13, 0));
      return latlon(k.run(s, rv, d, 'Situación 14:30'));
    },
  },
  'and-2016-c2-q42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 03,0 N', '6 10,0 W', 'Situación 09:30');
      const { rv, dist } = k.rhumb(s, 'barbate-espigon');
      // Declinación del enunciado: 6°00′ W 2006 (6′ E).
      const ct = k.ct({ carta: [-6, 2006, 6], anyo: 2016, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(9, 30), dist, 6) }];
    },
  },
  'and-2016-c2-q43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const d1 = k.dvM(240, 60, 'punta-carnero');
      const d2 = k.dvM(240, -80, 'punta-almina');
      return latlon(k.fix2('punta-carnero', d1, 'punta-almina', d2));
    },
  },
  'and-2016-c2-q44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('cabo-espartel', 'punta-malabata', 90);
      return [{ kind: 'signed', value: k.ctFrom(dv, 90) }];
    },
  },
  'and-2016-c2-q45': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const dv = k.enfilacion('cabo-espartel', 'punta-malabata', 90);
      k.note('Situación', 'En la enfilación vemos los dos faros uno detrás del otro: estamos al W de Cabo Espartel, en la prolongación de la línea Malabata → Espartel, a 4 millas del faro.');
      const s = k.fromMark('cabo-espartel', (dv + 180) % 360, 4, 'Situación');
      k.note('Banda', 'Punta Malabata está en la costa de Marruecos, al S del rumbo: pasamos al N del faro, dejándolo por estribor.');
      const rv = k.tangent(s, 'punta-malabata', 4, 'estribor');
      // Declinación del enunciado: 4° E 2006 (6′ W).
      const ct = k.ct({ carta: [4, 2006, -6], anyo: 2016, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
};
