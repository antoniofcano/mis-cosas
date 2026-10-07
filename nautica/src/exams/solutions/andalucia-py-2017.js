// Soluciones programadas PY Andalucía, convocatorias de 2017 (módulo de navegación, UT 4: carta, mareas y loxodrómica). Ver
// andalucia-py.js para el formato. `documentadas`: las de carta sin solución programada, con su motivo
// ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const NE = 45; const E = 90; const SE = 135; const S = 180; const SW = 225; const W = 270; const NW = 315;

export const documentadas = {
  'and-py-2017-c1-n15': { tipo: 'discrepancia', texto: 'El cálculo llega a la oficial (c): Ct = −10°, Rv 150°, estima a las 20:00 tras 15 millas; situación observada al S de Trafalgar y al W de Camarinal; Rc = 044,8° (NE) e Ihc = 2,5′. Pero las opciones dan el rumbo de la corriente por su nombre («Rc = NE») y el lector de opciones no lo lee (solo lee grados, cuadrantales con número o «Nv/Ev…»): sin él, b y c (2,4′) empatan, así que no se puede validar como resuelta.' },
  'and-py-2017-c2-n14': { tipo: 'discrepancia', texto: 'El cálculo llega a la oficial (b): estima a las 23:00 tras 9,2 millas al 225° desde 36°10′N 5°10′W; situación observada con Dv 319° a Punta Europa y 196° a Punta Almina («Punta Amina» en el enunciado) en 36°00,9′N 5°14,4′W; Rc = 131,4° (SE) e Ihc = 2,0′. Pero las opciones dan el rumbo de la corriente por su nombre («Rc = SE») y el lector de opciones no lo lee: sin él, a y b (2′) empatan, así que no se puede validar como resuelta.' },
};

export default {
  // ---- 1ª Convocatoria 2017
  'and-py-2017-c1-n11': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 10,0 N', '5 15,0 W', 'Situación 18:30');
      const { ref } = k.efectivo(210, 8, E, 3, s);
      k.note('Demora verdadera del través', 'Punta Carnero queda al W, a nuestra derecha: la tendremos por el través de estribor. El través se mide desde la proa, es decir, desde el Rv: Dv = Rv + 90° = 210° + 90° = 300°.');
      return latlon(k.corteRumbo(s, ref, 'punta-carnero', 300, 'Situación al través'));
    },
  },
  'and-py-2017-c1-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 45,0 N', '6 15,0 W', 'Salida');
      // Entramos hacia el Estrecho por fuera (al N) de Espartel: el faro queda por estribor.
      const rs = k.tangent(s, 'cabo-espartel', 5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, E);
      const ct = k.ct({ dm: -3, desvio: -6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2017-c1-n13': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const dvT = k.oposicion('punta-alcazar', 'isla-tarifa');
      const s = k.lineAndBearing('isla-tarifa', dvT, 'punta-cires', 100, 'Situación 16:00');
      const rs = k.abatimiento(75, 10, N);
      const { ref, vef } = k.efectivo(rs, 8, NW, 2, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(18) - hrb(16), 'Situación 18:00'));
    },
  },
  'and-py-2017-c1-n14': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(6, hrb(12, 30) - hrb(11));
      return latlon(k.traslado('cabo-espartel', 160, 'punta-alcazar', 110, 65, d, 'Situación 12:30'));
    },
  },
  'and-py-2017-c1-n16': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 09:00');
      // 7º E 2002 con variación 4′ W anual.
      const ct = k.ct({ carta: [7, 2002, -4], anyo: 2017, desvio: 9 });
      const rv = k.rv(250, ct);
      const rs = k.abatimiento(rv, 15, SW);
      return latlon(k.run(s, rs, k.distFor(6, hrb(11) - hrb(9)), 'Situación de estima 11:00'));
    },
  },
  'and-py-2017-c1-n17': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Salida 13:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'barbate-faro', hrb(15) - hrb(13), SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 3, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2017-c1-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (05:16) → primera bajamar (11:16): la marea baja y la sonda mínima se tiene hasta esa hora.
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 0 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 4.1, 2.4, 2) }];
    },
  },
  'and-py-2017-c1-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(22, 40), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 2.7) }];
    },
  },
  'and-py-2017-c1-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('25 00,0 S', '178 50,0 W', 'Salida');
      const b = k.pos('20 00,0 S', '179 25,0 E', 'Llegada');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
    },
  },

  // ---- 2ª Convocatoria 2017
  'and-py-2017-c2-n11': {
    ejercicio: 'abatimiento',
    solve(k) {
      const dvT = k.oposicion('punta-cires', 'isla-tarifa');
      const s = k.lineAndBearing('isla-tarifa', dvT, 'punta-carnero', 32, 'Situación 15:00');
      const rs = k.abatimiento(70, 15, N);
      k.note('Demora verdadera del través', 'Punta Almina queda al SE, a nuestra derecha: la tendremos por el través de estribor. El través se mide desde la proa, es decir, desde el Rv: Dv = Rv + 90° = 070° + 90° = 160°.');
      return latlon(k.corteRumbo(s, rs, 'punta-almina', 160, 'Situación al través'));
    },
  },
  'and-py-2017-c2-n12': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 20,0 W', 'Salida 19:00');
      const { vb } = k.rumboYVelocidad(s, 'algeciras-espigon', hrb(21) - hrb(19), E, 3);
      return [{ kind: 'speed', value: vb }];
    },
  },
  'and-py-2017-c2-n13': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-malabata', 'isla-tarifa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 41) }];
    },
  },
  'and-py-2017-c2-n15': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const dvE = k.enfilacion('cabo-trafalgar', 'cabo-roche', 0);
      const s = k.lineAndBearing('cabo-trafalgar', dvE, 'punta-gracia', E, 'Situación 12:00');
      // Subimos hacia el N por fuera de la costa: Roche queda por estribor.
      const rs = k.tangent(s, 'cabo-roche', 5, 'estribor');
      return [{ kind: 'bearing', value: k.rvConAbatimiento(rs, 20, SW) }];
    },
  },
  'and-py-2017-c2-n16': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 45,0 N', '6 10,0 W', 'Situación 13:00');
      // 6º E 2007 con variación 6′ W anual.
      const ct = k.ct({ carta: [6, 2007, -6], anyo: 2017, desvio: 4 });
      const rv = k.rv(40, ct);
      const rs = k.abatimiento(rv, 15, NE);
      const { ref, vef } = k.efectivo(rs, 8, W, 2, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(14, 30) - hrb(13), 'Situación 14:30'));
    },
  },
  'and-py-2017-c2-n17': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Salida 12:00');
      const { rs } = k.rumboConCorriente(s, 'tanger-espigon', 8, E, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 4, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2017-c2-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (07:51) → segunda bajamar (13:54): la marea baja.
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 1 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.7, 1.8, 2) }];
    },
  },
  'and-py-2017-c2-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(8), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.8) }];
    },
  },
  'and-py-2017-c2-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('42 00,0 N', '179 20,0 E', 'Salida');
      const b = k.pos('36 00,0 N', '178 35,0 W', 'Llegada');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
    },
  },
};
