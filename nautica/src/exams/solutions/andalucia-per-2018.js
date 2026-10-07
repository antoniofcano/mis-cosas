// Soluciones programadas PER Andalucía, convocatorias de 2018 (preguntas 42–45, carta L105). Ver andalucia-per-0.js para
// el formato. `documentadas`: las de carta sin solución programada, con su motivo ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];

export const documentadas = {
  'and-2018-c2-q43': { tipo: 'discrepancia', texto: 'En la carta, la enfilación Trafalgar–Roche mide 323,0°: con la Da 331° la Ct es −8,0°, la oficial (b, −8°). Pero las opciones del cuadernillo llegan con el «º» convertido en «0» («-50», «-80», «+50», «+130»): el lector las toma como −50°, −80°… y la más próxima a −8 es la a. Se resuelve igual que and-2017-c1-q44 y and-2017-c3-q43; queda documentada hasta que se corrija el texto de las opciones.' },
};

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

  // ---- 2ª Convocatoria 2018
  'and-2018-c2-q42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('35 55,0 N', '5 15,0 W', 'Situación 21:00');
      const { rv, dist } = k.rhumb(s, 'algeciras-espigon');
      const ct = k.ct({ dm: -5, desvio: 9 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(21, 0), dist, 6) }];
    },
  },
  'and-2018-c2-q44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 45,0 N', '6 10,0 W', 'Situación 09:00');
      // Hacia el ENE por el N de Malabata: el faro queda por estribor.
      const rv = k.tangent(s, 'punta-malabata', 5, 'estribor');
      const ct = k.ct({ carta: [7, 2008, -6], anyo: 2018, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2018-c2-q45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.cardinal2('punta-europa', 180, 'isla-tarifa', 90, 'Situación 13:00');
      const ct = k.ct({ dm: -3, desvio: -12 });
      const rv = k.rv(275, ct);
      const d = k.distFor(6, hrb(15, 30) - hrb(13, 0));
      return latlon(k.run(s, rv, d, 'Situación 15:30'));
    },
  },
};
