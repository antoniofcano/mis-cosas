// Soluciones programadas PER Andalucía, convocatorias de 2018 (preguntas 42–45, carta L105). Ver andalucia-per-0.js para
// el formato. `documentadas`: las de carta sin solución programada, con su motivo ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];

export const documentadas = {
  'and-2018-c2-q43': { tipo: 'discrepancia', texto: 'En la carta, la enfilación Trafalgar–Roche mide 323,0°: con la Da 331° la Ct es −8,0°, la oficial (b, −8°). Pero las opciones del cuadernillo llegan con el «º» convertido en «0» («-50», «-80», «+50», «+130»): el lector las toma como −50°, −80°… y la más próxima a −8 es la a. Se resuelve igual que and-2017-c1-q44 y and-2017-c3-q43; queda documentada hasta que se corrija el texto de las opciones.' },
  'and-2018-c3-q45': { tipo: 'discrepancia', texto: 'Rv 250° con Punta Carnero a 55° Er (Dv 305°) y Punta Almina a 88° Br (Dv 162°): situación 36° 01,5′ N, 005° 19,7′ W. La oficial (d) dice «36º 01,4\' N; 006º 19,6\' W»: los minutos coinciden, pero el grado de longitud es una errata (006° por 005°; a 006° 19,6′ W estaríamos en el borde W de la carta, a más de 50 millas de Punta Almina). El cálculo cae en la a (36° 01,4′ N, 005° 18,0′ W) por la errata, así que no se compara.' },
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

  // ---- 3ª Convocatoria 2018
  'and-2018-c3-q42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.cardinal2('isla-tarifa', 270, 'punta-gracia', 180, 'Situación 09:00');
      const { rv } = k.rhumb(s, 'tanger-espigon');
      const ct = k.ct({ carta: [8, 2008, -6], anyo: 2018, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2018-c3-q43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('punta-alcazar', 0, 5, 'Situación 14:00');
      // Hacia el E por el N de Punta Almina: el faro queda por estribor.
      const rv = k.tangent(s, 'punta-almina', 5, 'estribor');
      const ct = k.ct({ dm: -7, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2018-c3-q44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '5 50,0 W', 'Situación 12:00');
      const ct = k.ct({ dm: 8, desvio: 6 });
      const rv = k.rv(300, ct);
      const d = k.distFor(6, hrb(14, 30) - hrb(12, 0));
      return latlon(k.run(s, rv, d, 'Situación 14:30'));
    },
  },

  // ---- 4ª Convocatoria 2018
  'and-2018-c4-q42': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      k.note('Rumbo', 'El Ra = 240° y la velocidad no intervienen: la Ct sale de la enfilación.');
      const dv = k.enfilacion('punta-cires', 'punta-alcazar', 236);
      return [{ kind: 'signed', value: k.ctFrom(dv, 236) }];
    },
  },
  'and-2018-c4-q43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.cardinal2('punta-carnero', 90, 'punta-europa', 180, 'Salida');
      const { rv } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ dm: 3, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2018-c4-q44': {
    ejercicio: 'estima-directa',
    solve(k) {
      // De los dos cortes de los arcos, el del N (en el mar); el otro cae en tierra, en la costa de Marruecos.
      const s = k.fix2Ranges('cabo-espartel', 4, 'punta-malabata', 6, { lat: 36, lon: -5.8 }, 'Situación 19:00');
      const d = k.distFor(6, hrb(20, 30) - hrb(19, 0));
      return latlon(k.run(s, 70, d, 'Situación 20:30'));
    },
  },
  'and-2018-c4-q45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.cardinal2('punta-gracia', 180, 'punta-paloma', 225, 'Situación 12:00');
      const { rv, dist } = k.rhumb(s, 'barbate-faro');
      const ct = k.ct({ carta: [8, 2008, -6], anyo: 2018, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(12, 0), dist, 6) }];
    },
  },
};
