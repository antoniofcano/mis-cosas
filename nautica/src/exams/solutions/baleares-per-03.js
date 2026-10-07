// Soluciones programadas de carta del PER de Baleares (lote 03). Ver baleares-per.js para el formato.
// Lote 03: 109 preguntas (PER, 2021-03 a 2023-09).
//   - 85 resueltas y comprobadas (en `export default`).
//   - 24 sin cálculo con la carta de la app (en `documentadas`, tipo 'sin-calculo'): usan elementos que no están en
//     ella (isobáticas y sondas, naufragios, marcas cardinales o especiales, montes, el DST, puertos sin coordenadas).
//   Ninguna en 'discrepancia' ni en 'anuario'.
import { hrb, cortesRectaArco } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];
const N = 0; const NE = 45; const E = 90; const SE = 135; const S = 180; const SW = 225; const W = 270; const NW = 315;
/** Punto medio de dos puntos de la carta, situado con k.pos. */
const medio = (k, a, b, label) => {
  const A = k.P(a); const B = k.P(b);
  return k.pos(`${(A.lat + B.lat) / 2} N`, `${-(A.lon + B.lon) / 2} W`, label);
};

export default {
  'bal-per-2021-03-c-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ ct: -3 });
      const rv = k.rv(120, ct);
      const d1 = k.dv(333, ct, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -97, 'barbate-faro');
      return latlon(k.fix2('cabo-trafalgar', d1, 'barbate-faro', d2));
    },
  },
  'bal-per-2021-03-d-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-carnero', E, 2, 'Situación 19:50');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ carta: L105, anyo: 2021, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(19, 50), dist, 5) }];
    },
  },
  'bal-per-2021-03-eg-44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = medio(k, 'isla-tarifa', 'punta-alcazar', 'Situación 16:34');
      // Navegamos hacia el E pasando por el N de Punta Almina: el faro queda por estribor.
      const rv = k.tangent(s, 'punta-almina', 5, 'estribor');
      const d = k.distFor(9, hrb(18, 12) - hrb(16, 34));
      return latlon(k.run(s, rv, d, 'Situación 18:12'));
    },
  },
  'bal-per-2021-03-a-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -2 });
      const rv = k.rv(320, ct);
      const d1 = k.dvM(rv, 0, 'punta-europa');
      const d2 = k.dvM(rv, -90, 'punta-cires');
      const p = k.fix2('punta-europa', d1, 'punta-cires', d2);
      return [{ kind: 'distance', value: k.distanceBetween(p, 'algeciras-espigon') }];
    },
  },
  'bal-per-2021-03-b-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 00,0 W', 'Salida');
      const ct = k.ct({ dm: -2, desvio: 6 });
      const rv = k.rv(75, ct);
      return latlon(k.run(s, rv, k.distFor(12, 45), 'Situación 45 min después'));
    },
  },
  'bal-per-2021-03-d-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const p = k.fromMark('punta-almina', 335, 2.4, 'Punto de paso');
      const { rv } = k.rhumb('tarifa-espigon', p);
      const ct = k.ct({ dm: 3, desvio: 3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2021-03-h-45': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ ct: 5 });
      const rv = k.rv(90, ct);
      const d1 = k.dvM(rv, 2, 'punta-cires');
      const d2 = k.dv(139, ct, 'punta-alcazar');
      const p = k.fix2('punta-cires', d1, 'punta-alcazar', d2);
      // Seguimos hacia el E pasando por el N de Punta Cires: el faro queda por estribor.
      const r = k.tangent(p, 'punta-cires', 2.5, 'estribor');
      return [{ kind: 'bearing', value: r }, ...latlon(p)];
    },
  },
  'bal-per-2021-06-d-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fix2('punta-paloma', 55, 'barbate-espigon', 338, 'Situación 13:30');
      const ct = k.ct({ ct: 7 });
      const rv = k.rv(175, ct);
      return latlon(k.run(s, rv, k.distFor(6, 90), 'Situación 15:00'));
    },
  },
  'bal-per-2021-06-f-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -4, desvio: -8 });
      const rv = k.rv(123, ct);
      const d1 = k.dvM(rv, -30, 'punta-gracia');
      const d2 = k.dvM(rv, -154, 'cabo-trafalgar');
      return latlon(k.fix2('punta-gracia', d1, 'cabo-trafalgar', d2));
    },
  },
  'bal-per-2021-06-g-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -4, desvio: 4 });
      const rv = k.rv(90, ct);
      const d1 = k.dvM(rv, 0, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -90, 'cabo-roche');
      return latlon(k.fix2('cabo-trafalgar', d1, 'cabo-roche', d2));
    },
  },
  'bal-per-2021-06-ci-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const rv = 105;
      k.note('Rumbo verdadero', 'El Rv = 105° es dato: las marcaciones se pasan a demoras verdaderas sin Ct.');
      const d1 = k.dvM(rv, -43, 'punta-gracia');
      const d2 = k.dvM(rv, 35, 'punta-malabata');
      const s = k.fix2('punta-gracia', d1, 'punta-malabata', d2, 'Situación 02:43');
      k.note('Punto de destino', 'El punto «demora al 255° verdadero de Cabo Espartel»: desde el faro, a 5 millas en dirección 255°.');
      const p = k.fromMark('cabo-espartel', 255, 5, 'Destino');
      const { dist } = k.rhumb(s, p);
      return [{ kind: 'clock', value: k.eta(hrb(2, 43), dist, 12) }];
    },
  },
  'bal-per-2021-06-d-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct = k.ct({ dm: 2, desvio: -2 });
      const d1 = k.dv(10, ct, 'punta-paloma');
      const d2 = k.dv(170, ct, 'punta-malabata');
      const s = k.fix2('punta-paloma', d1, 'punta-malabata', d2, 'Situación 08:00');
      const a = k.rhumb(s, 'barbate-espigon', 'Rumbo y distancia a Barbate');
      const v1 = a.dist / 2.5;
      k.note('Distancia y velocidad hasta Barbate', `Para llegar a las 10:30 (2,5 h): V = ${a.dist.toFixed(1).replace('.', ',')} / 2,5 = ${v1.toFixed(1).replace('.', ',')} nudos.`);
      const p = k.run(s, a.rv, v1, 'Situación 09:00');
      const b = k.rhumb(p, 'tanger-espigon', 'Rumbo y distancia a Tánger');
      const v2 = b.dist / 2.5;
      k.note('Distancia y velocidad hasta Tánger', `De 09:00 a 11:30 hay 2,5 h: Vb = ${b.dist.toFixed(1).replace('.', ',')} / 2,5 = ${v2.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: b.rv }, { kind: 'speed', value: v2 }];
    },
  },
  'bal-per-2021-06-f-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('cabo-trafalgar', S, 5, 'Situación 14:00');
      const rv1 = k.rv(135, k.ct({ dm: -3, desvio: -2 }));
      const p = k.run(s, rv1, k.distFor(12, 30), 'Situación 14:30');
      const rv2 = k.rv(96, k.ct({ dm: -3, desvio: -3 }));
      return latlon(k.run(p, rv2, k.distFor(12, 45), 'Situación 15:15'));
    },
  },
  'bal-per-2021-06-ci-45': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const s = k.fromMark('punta-carnero', SE, 4.3, 'Salida');
      k.note('Línea de posición: Través', 'Con Rv 251° el faro de Isla de Tarifa queda al N de la derrota: lo tendremos por el través de estribor, en Dv = 251° + 90° = 341°.');
      const p = k.corteRumbo(s, 251, 'isla-tarifa', 341, 'Tarifa por el través');
      return [{ kind: 'distance', value: k.distanceBetween(s, p) }];
    },
  },
  'bal-per-2021-06-e-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', NW, 4, 'Situación 11:30');
      const rv = k.rv(80, k.ct({ dm: -2, desvio: -3 }));
      const op = k.oposicion('punta-gracia', 'punta-malabata');
      const p = k.corteRumbo(s, rv, 'punta-malabata', op, 'Oposición Gracia–Malabata');
      k.note('Distancia a Malabata', 'La distancia de 4,4 millas a Punta Malabata confirma la situación sobre la oposición.');
      const d1 = k.distanceBetween(s, p);
      const { dist } = k.rhumb(p, 'tanger-espigon');
      return [{ kind: 'clock', value: k.eta(hrb(11, 30), d1 + dist, 7) }];
    },
  },
  'bal-per-2021-09-e-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const op = k.oposicion('punta-leona', 'punta-carnero');
      return latlon(k.lineAndBearing('punta-carnero', op, 'isla-tarifa', W));
    },
  },
  'bal-per-2021-09-f-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ ct: -6 });
      const d1 = k.dv(276, ct, 'isla-tarifa');
      const d2 = k.dv(22, ct, 'punta-carnero');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-carnero', d2));
    },
  },
  'bal-per-2021-09-d-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('cabo-trafalgar', S, 5, 'Situación 11:00');
      const { rv, dist } = k.rhumb(s, 'tanger-espigon');
      k.note('Declinación actualizada', 'El enunciado no la da: tomamos la de la carta llevada al año de la convocatoria (2021).');
      const ct = k.ct({ carta: L105, anyo: 2021, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(11), dist, 8) }];
    },
  },
  'bal-per-2021-09-e-43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fix2('punta-paloma', 50, 'punta-malabata', 150, 'Situación 11:00');
      // Subimos hacia el NW por fuera de Trafalgar: el cabo queda por estribor.
      const rv = k.tangent(s, 'cabo-trafalgar', 4, 'estribor');
      const p = k.run(s, rv, k.distFor(10, 90), 'Situación 12:30');
      return [{ kind: 'bearing', value: k.bearingTo(p, 'cabo-trafalgar').dv }];
    },
  },
  'bal-per-2021-09-f-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const enf = k.enfilacion('punta-cires', 'punta-alcazar');
      const op = k.oposicion('punta-carnero', 'punta-almina');
      const p = k.lineAndBearing('punta-cires', enf, 'punta-almina', op);
      k.note('Demora desde Tarifa', 'Las opciones dan la demora del barco medida desde el faro de Isla de Tarifa (el barco queda al E del faro).');
      const r = k.bearingTo('isla-tarifa', p);
      return [{ kind: 'bearing', value: r.dv }, { kind: 'distance', value: r.dist }];
    },
  },
  'bal-per-2021-09-b-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const enf = k.enfilacion('punta-carnero', 'punta-europa', 249);
      const ct = k.ctFrom(enf, 249);
      const rv = k.rv(241, ct);
      const dc = k.dvM(rv, 79, 'punta-carbonera');
      return latlon(k.lineAndBearing('punta-europa', enf, 'punta-carbonera', dc));
    },
  },
  'bal-per-2021-09-f-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const { rv } = k.rhumb('isla-tarifa', 'punta-cires');
      const ct = k.ct({ dm: -4, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2021-09-b-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-carnero', S, 2, 'Situación 20:00');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ carta: L105, anyo: 2021, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(20), dist, 7) }];
    },
  },
  'bal-per-2021-09-e-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const op = k.oposicion('cabo-espartel', 'cabo-roche');
      const s = k.fixDist('cabo-roche', op, 22.6, 'Situación 22:05');
      const { rv } = k.rhumb(s, 'punta-alcazar');
      return latlon(k.run(s, rv, k.distFor(4, 90), 'Situación 23:35'));
    },
  },
  'bal-per-2021-12-d-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(230, k.ct({ dm: -3, desvio: -1 }));
      const d1 = k.dvM(rv, -60, 'cabo-espartel');
      const d2 = k.dvM(rv, -125, 'punta-malabata');
      return latlon(k.fix2('cabo-espartel', d1, 'punta-malabata', d2));
    },
  },
  'bal-per-2021-12-f-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(123, k.ct({ dm: -4, desvio: -8 }));
      const d1 = k.dvM(rv, -30, 'punta-gracia');
      const d2 = k.dvM(rv, -154, 'cabo-trafalgar');
      return latlon(k.fix2('punta-gracia', d1, 'cabo-trafalgar', d2));
    },
  },
  'bal-per-2021-12-f-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const p = k.fromMark('punta-europa', S, 3, 'Llegada');
      const { rv } = k.rhumb('ceuta-bocana', p);
      k.note('Declinación actualizada', 'El enunciado solo da el desvío: la declinación es la de la carta llevada al año de la convocatoria (2021).');
      const ct = k.ct({ carta: L105, anyo: 2021, desvio: -1 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2021-12-i-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const rv = 105;
      k.note('Rumbo verdadero', 'El Rv = 105° es dato: las marcaciones se pasan a demoras verdaderas sin Ct.');
      const d1 = k.dvM(rv, -43, 'punta-gracia');
      const d2 = k.dvM(rv, 35, 'punta-malabata');
      const s = k.fix2('punta-gracia', d1, 'punta-malabata', d2, 'Situación 02:43');
      k.note('Punto de destino', 'El punto «demora al 255° verdadero de Cabo Espartel»: desde el faro, a 5 millas en dirección 255°.');
      const p = k.fromMark('cabo-espartel', 255, 5, 'Destino');
      const { dist } = k.rhumb(s, p);
      return [{ kind: 'clock', value: k.eta(hrb(2, 43), dist, 12) }];
    },
  },
  'bal-per-2021-12-d-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -1 });
      const rv = k.rv(61, ct);
      const d1 = k.dv(171, ct, 'cabo-espartel');
      const d2 = k.dv(126, ct, 'punta-malabata');
      const s = k.fix2('cabo-espartel', d1, 'punta-malabata', d2);
      const p = k.run(s, rv, 10, 'Tras 10 millas');
      return [{ kind: 'bearing', value: k.bearingTo(p, 'punta-alcazar').dv }];
    },
  },
  'bal-per-2021-12-c-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const p = k.fromMark('punta-europa', S, 3, 'Llegada');
      const { rv } = k.rhumb('ceuta-bocana', p);
      k.note('Declinación actualizada', 'El enunciado solo da el desvío: la declinación es la de la carta llevada al año de la convocatoria (2021).');
      const ct = k.ct({ carta: L105, anyo: 2021, desvio: -1 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2021-12-d-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('punta-carnero', S, 6, 'Situación 14:30');
      k.note('Declinación actualizada', 'La de la carta llevada a 2021: −2°50′ + 16 × 7′ = −0°58′, que redondeada al grado da 1° W.');
      const rv = k.rv(260, k.ct({ dm: -1, desvio: 5 }));
      return latlon(k.run(s, rv, k.distFor(8, 90), 'Situación 16:00'));
    },
  },
  'bal-per-2022-03-c-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(NE, k.ct({ dm: -2, desvio: -3 }));
      const d1 = k.dvM(rv, 0, 'isla-tarifa');
      k.note('Línea de posición: Través', 'Con rumbo al NE y Tarifa por la proa, Punta Paloma queda al NW: la tenemos por el través de babor.');
      const d2 = k.dvM(rv, -90, 'punta-paloma');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-paloma', d2));
    },
  },
  'bal-per-2022-03-c-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-europa', S, 2, 'Situación 20:00');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      k.note('Declinación actualizada', 'El enunciado no la da: tomamos la de la carta llevada al año de la convocatoria (2022).');
      const ct = k.ct({ carta: L105, anyo: 2022, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(20), dist, 7) }];
    },
  },
  'bal-per-2022-03-e-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const p = k.fromMark('punta-europa', S, 3, 'Llegada');
      const { rv } = k.rhumb('ceuta-bocana', p);
      const ct = k.ct({ carta: L105, anyo: 2022, desvio: -1 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2022-03-a-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.lineAndBearing('punta-europa', S, 'punta-almina', 150, 'Situación 15:00');
      const a = k.rhumb(s, 'punta-carnero', 'Rumbo y distancia a Punta Carnero');
      const v1 = a.dist / 1.5;
      k.note('Distancia y velocidad hasta Carnero', `Para llegar a las 16:30 (1,5 h): V = ${a.dist.toFixed(1).replace('.', ',')} / 1,5 = ${v1.toFixed(1).replace('.', ',')} nudos.`);
      const p = k.run(s, a.rv, v1, 'Situación 16:00');
      const b = k.rhumb(p, 'ceuta-bocana', 'Rumbo y distancia a Ceuta');
      k.note('Distancia y velocidad hasta Ceuta', `De 16:00 a 17:30 hay 1,5 h: Vm = ${b.dist.toFixed(1).replace('.', ',')} / 1,5 = ${(b.dist / 1.5).toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: b.rv }, { kind: 'speed', value: b.dist / 1.5 }];
    },
  },
  'bal-per-2022-03-di-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const e1 = k.enfilacion('punta-carnero', 'punta-europa');
      const e2 = k.enfilacion('cabo-negro', 'punta-almina');
      const s = k.lineAndBearing('punta-europa', e1, 'punta-almina', e2, 'Situación 12:00');
      const { dist } = k.rhumb(s, 'ceuta-bocana');
      return [{ kind: 'clock', value: k.eta(hrb(12), dist, 20) }];
    },
  },
  'bal-per-2022-03-e-44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      k.note('Desvío por la tablilla', 'Ra = 140° está entre 120° (+0,4°) y 150° (+0,1°): interpolando, Δ = 0,4 − 0,3 × 20/30 = +0,2°.');
      return [{ kind: 'signed', value: k.ct({ carta: [-1.75, 1990, 9], anyo: 2022, desvio: 0.2 }) }];
    },
  },
  'bal-per-2022-03-e-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const enf = k.enfilacion('punta-carnero', 'punta-europa', 251);
      const ct = k.ctFrom(enf, 251);
      const dc = k.dv(342, ct, 'punta-carbonera');
      return latlon(k.lineAndBearing('punta-europa', enf, 'punta-carbonera', dc));
    },
  },
  'bal-per-2022-06-e-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(123, k.ct({ dm: -4, desvio: -8 }));
      const d1 = k.dvM(rv, -30, 'punta-gracia');
      const d2 = k.dvM(rv, -154, 'cabo-trafalgar');
      return latlon(k.fix2('punta-gracia', d1, 'cabo-trafalgar', d2));
    },
  },
  'bal-per-2022-06-e-44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-almina', 'punta-carnero');
      return [{ kind: 'signed', value: k.ctFrom(dv, 332) }];
    },
  },
  'bal-per-2022-06-e-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const op = k.oposicion('punta-alcazar', 'isla-tarifa');
      const s = k.lineAndBearing('isla-tarifa', op, 'punta-cires', E, 'Situación 10:00');
      const rv = k.rv(75, k.ct({ dm: -2, desvio: 4 }));
      const p = k.corteRumbo(s, rv, 'punta-almina', S, 'Situación al S verdadero de Punta Almina');
      return [{ kind: 'clock', value: k.eta(hrb(10), k.distanceBetween(s, p), 9) }];
    },
  },
  'bal-per-2022-09-c-42': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      return [{ kind: 'signed', value: k.ct({ carta: [-(4 + 50 / 60), 2002, 7], anyo: 2022, desvio: 2.5 }) }];
    },
  },
  'bal-per-2022-09-m-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      k.note('Latitud', 'El enunciado no da la latitud: con Rv 090° navegamos sobre un paralelo y tomamos el 36° N, en el centro de la carta. Distancia = ΔL · cos l.');
      const a = k.pos('36 00,0 N', '5 44,0 W', 'Punto de paso en el meridiano 5 44 W');
      const b = k.pos('36 00,0 N', '5 31,0 W', 'Punto de paso en el meridiano 5 31 W');
      return [{ kind: 'distance', value: k.rhumb(a, b).dist }];
    },
  },
  'bal-per-2022-09-b-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      // En la parte S de la enfilación, el faro de Trafalgar queda al N del barco (y Roche detrás).
      const enf = k.enfilacion('cabo-trafalgar', 'cabo-roche', 330);
      const ct = k.ctFrom(enf, 330);
      const dg = k.dv(52, ct, 'punta-gracia');
      return latlon(k.lineAndBearing('cabo-trafalgar', enf, 'punta-gracia', dg));
    },
  },
  'bal-per-2022-09-c-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(250, k.ct({ dm: -3, desvio: 3 }));
      const d1 = k.dvM(rv, -48, 'punta-alcazar');
      const d2 = k.dvM(rv, 40, 'isla-tarifa');
      return latlon(k.fix2('punta-alcazar', d1, 'isla-tarifa', d2));
    },
  },
  'bal-per-2022-09-m-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const op = k.oposicion('punta-malabata', 'isla-tarifa');
      const ct = k.ct({ carta: L105, anyo: 2022, desvio: 0 });
      const dv = k.dv(132, ct, 'punta-alcazar');
      return latlon(k.lineAndBearing('isla-tarifa', op, 'punta-alcazar', dv));
    },
  },
  'bal-per-2022-09-a-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const d2 = k.dvM(66.6, 66.6, 'punta-malabata');
      const s = k.fix2('punta-paloma', 66.6, 'punta-malabata', d2, 'Situación 06:16');
      const rv = k.rv(66.6, k.ct({ carta: L105, anyo: 2022, desvio: -6.66 }));
      const p = k.run(s, rv, 6.66, 'Situación 07:16');
      return [...latlon(p), { kind: 'bearing', value: rv }];
    },
  },
  'bal-per-2022-09-c-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 40,0 W', 'Situación 07:30');
      const b = k.pos('35 50,0 N', '6 10,0 W', 'Destino');
      const { rv, dist } = k.rhumb(s, b);
      const ct = k.ct({ dm: -3, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(7, 30), dist, 12) }];
    },
  },
  'bal-per-2022-12-c-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(123, k.ct({ dm: -4, desvio: -8 }));
      const d1 = k.dvM(rv, -30, 'punta-gracia');
      const d2 = k.dvM(rv, -154, 'cabo-trafalgar');
      return latlon(k.fix2('punta-gracia', d1, 'cabo-trafalgar', d2));
    },
  },
  'bal-per-2022-12-fd-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const a = k.fix2Ranges('punta-alcazar', 5, 'punta-cires', 4, k.P('isla-tarifa'), 'Punto A');
      // Salimos hacia el WNW y pasamos por el S de Trafalgar: el cabo queda por estribor.
      const rv = k.tangent(a, 'cabo-trafalgar', 8, 'estribor');
      const ct = k.ct({ dm: 1, desvio: -1 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2022-12-c-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fixDist('punta-almina', 204, 5.5, 'Situación 12:06');
      const rv = k.rv(10, k.ct({ carta: L105, anyo: 2022, desvio: 3.5 }));
      return latlon(k.run(s, rv, k.distFor(12, 66), 'Situación 13:12'));
    },
  },
  'bal-per-2022-12-fd-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const enf = k.enfilacion('punta-cires', 'punta-alcazar');
      const op = k.oposicion('punta-carnero', 'punta-almina');
      const p = k.lineAndBearing('punta-cires', enf, 'punta-almina', op);
      k.note('Demora desde Tarifa', 'Las opciones dan la demora del barco medida desde el faro de Isla de Tarifa (el barco queda al E del faro).');
      const r = k.bearingTo('isla-tarifa', p);
      return [{ kind: 'bearing', value: r.dv }, { kind: 'distance', value: r.dist }];
    },
  },
  'bal-per-2022-12-a-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.lineAndBearing('punta-almina', N, 'punta-europa', 250, 'Situación');
      const { rv } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ dm: 6, desvio: 4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2022-12-fd-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', W, 3, 'Situación 10:25');
      const b = k.pos('36 10,0 N', '6 10,0 W', 'Pesquero');
      const { rv, dist } = k.rhumb(s, b);
      return [{ kind: 'bearing', value: rv }, { kind: 'distance', value: dist }];
    },
  },
  'bal-per-2022-12-a-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('algeciras-espigon', E, 0.2, 'Situación 11:12');
      const rv = k.rv(143, k.ct({ carta: L105, anyo: 2022, desvio: -1.5 }));
      return latlon(k.run(s, rv, k.distFor(5.2, hrb(14, 24) - hrb(11, 12)), 'Situación 14:24'));
    },
  },
  'bal-per-2022-12-be-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 40,0 W', 'Situación 07:30');
      const b = k.pos('35 50,0 N', '6 10,0 W', 'Destino');
      const { rv, dist } = k.rhumb(s, b);
      const ct = k.ct({ dm: -3, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(7, 30), dist, 12) }];
    },
  },
  'bal-per-2022-12-c-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const op = k.oposicion('punta-gracia', 'cabo-trafalgar');
      const ct = k.ct({ carta: L105, anyo: 2022, desvio: 1 });
      const dv = k.dv(341, ct, 'barbate-espigon');
      return latlon(k.lineAndBearing('cabo-trafalgar', op, 'barbate-espigon', dv));
    },
  },
  'bal-per-2022-12-fd-45': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const A = k.P('punta-alcazar');
      const cortes = cortesRectaArco({ lat: A.lat, lon: -(5 + 40 / 60) }, N, A, 6);
      const p = cortes.sort((u, v) => v.lat - u.lat)[0];
      k.note('Situación de salida', 'Meridiano 005° 40′ W y arco de 6 millas con centro en Punta Alcázar: de los dos cortes, el del N (el otro cae en tierra).');
      const s = k.pos(`${p.lat} N`, `${-p.lon} W`, 'Salida');
      // Vamos hacia el E pasando por el N de Punta Cires: el faro queda por estribor.
      const rv = k.tangent(s, 'punta-cires', 2, 'estribor');
      const op = k.oposicion('isla-tarifa', 'punta-cires');
      return latlon(k.corteRumbo(s, rv, 'punta-cires', op, 'Oposición Cires–Tarifa'));
    },
  },
  'bal-per-2023-03-a-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 54,6 N', '5 50,0 W', 'Situación 10:00');
      // Vamos hacia el E pasando por el S de Isla de Tarifa: el faro queda por babor.
      const rv = k.tangent(s, 'isla-tarifa', 3, 'babor');
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: 5.1 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2023-03-cg-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      k.note('Declinación actualizada', 'El enunciado solo da el desvío: la declinación es la de la carta llevada a 2023.');
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: 5 });
      const d1 = k.dv(15, ct, 'punta-europa');
      const d2 = k.dv(289, ct, 'punta-carnero');
      return latlon(k.fix2('punta-europa', d1, 'punta-carnero', d2));
    },
  },
  'bal-per-2023-03-e-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', NW, 4, 'Situación 11:30');
      const rv = k.rv(80, k.ct({ dm: -2, desvio: -3 }));
      const op = k.oposicion('punta-gracia', 'punta-malabata');
      const p = k.corteRumbo(s, rv, 'punta-malabata', op, 'Oposición Gracia–Malabata');
      k.note('Distancia a Malabata', 'La distancia a Punta Malabata (4,2 millas) solo confirma la situación sobre la oposición.');
      const d1 = k.distanceBetween(s, p);
      const { dist } = k.rhumb(p, 'tanger-espigon');
      return [{ kind: 'clock', value: k.eta(hrb(11, 30), d1 + dist, 7) }];
    },
  },
  'bal-per-2023-03-cg-44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const enf = k.enfilacion('cabo-roche', 'cabo-trafalgar');
      const dv = k.dv(80, k.ct({ dm: 2, desvio: -1.7 }), 'punta-gracia');
      const s = k.lineAndBearing('cabo-trafalgar', enf, 'punta-gracia', dv, 'Situación 13:10');
      // Bajamos hacia el SE pasando por fuera (al S) de Punta Paloma: el faro queda por babor.
      const rv = k.tangent(s, 'punta-paloma', 3, 'babor');
      const p = k.corteRumbo(s, rv, 'punta-paloma', rv - 90, 'Paloma por el través');
      const d = k.distanceBetween(s, p);
      const v = d / 1.5;
      k.note('Distancia y velocidad', `De 13:10 a 14:40 hay 1,5 h: V = ${d.toFixed(1).replace('.', ',')} / 1,5 = ${v.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'speed', value: v }];
    },
  },
  'bal-per-2023-03-e-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', W, 3, 'Situación 10:25');
      const b = k.pos('36 10,0 N', '6 10,0 W', 'Pesquero');
      const { rv, dist } = k.rhumb(s, b);
      return [{ kind: 'bearing', value: rv }, { kind: 'distance', value: dist }];
    },
  },
  'bal-per-2023-03-cg-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const enf = k.enfilacion('punta-alcazar', 'punta-cires');
      const op = k.oposicion('punta-carnero', 'punta-almina');
      const s = k.lineAndBearing('punta-cires', enf, 'punta-almina', op, 'Situación 18:30');
      const p = k.fromMark('punta-europa', E, 3, 'Punto de paso');
      const { rv } = k.rhumb(s, p);
      return latlon(k.run(s, rv, k.distFor(8, hrb(20, 40) - hrb(18, 30)), 'Situación 20:40'));
    },
  },
  'bal-per-2023-06-bg-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct = k.ct({ ct: -5 });
      const rv = k.rv(230, ct);
      const d1 = k.dvM(rv, 35, 'punta-leona');
      const d2 = k.dv(210, ct, 'punta-almina');
      const s = k.fix2('punta-leona', d1, 'punta-almina', d2, 'Situación 10:00');
      const p = k.fromMark('punta-cires', N, 5, 'Punto de paso');
      const { rv: r } = k.rhumb(s, p);
      return [{ kind: 'bearing', value: k.ra(r, ct) }];
    },
  },
  'bal-per-2023-06-c-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-almina', E, 2, 'Situación 10:00');
      const { rv, dist } = k.rhumb(s, 'algeciras-espigon');
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(10), dist, 10) }];
    },
  },
  'bal-per-2023-09-a-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 10,0 N', '6 15,0 W', 'Salida 17:00');
      const rv = k.rv(117, k.ct({ ct: 3 }));
      return latlon(k.run(s, rv, k.distFor(5, 240), 'Situación 21:00'));
    },
  },
  'bal-per-2023-09-a-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const ct = k.ct({ dm: -5, desvio: 4 });
      const rv = k.rv(140, ct);
      const d1 = k.dv(30, ct, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -45, 'punta-gracia');
      const s = k.fix2('cabo-trafalgar', d1, 'punta-gracia', d2, 'Situación 10:22');
      const { rv: r } = k.rhumb(s, 'tanger-espigon');
      return latlon(k.run(s, r, k.distFor(12, hrb(11, 43) - hrb(10, 22)), 'Situación 11:43'));
    },
  },
  'bal-per-2023-09-a-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const op = k.oposicion('punta-malabata', 'isla-tarifa');
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: 0 });
      const dv = k.dv(132, ct, 'punta-alcazar');
      return latlon(k.lineAndBearing('isla-tarifa', op, 'punta-alcazar', dv));
    },
  },
  'bal-per-2023-09-bf-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      k.note('Corrección total', 'La «variación magnética de +1°» es el desvío; la declinación, 4° W.');
      const ct = k.ct({ dm: -4, desvio: 1 });
      const d1 = k.dv(45, ct, 'punta-gracia');
      const d2 = k.dv(119, ct, 'punta-malabata');
      const s = k.fix2('punta-gracia', d1, 'punta-malabata', d2, 'Situación 12:20');
      const rv = k.rv(202, ct);
      return latlon(k.run(s, rv, k.distFor(4.5, hrb(14, 30) - hrb(12, 20)), 'Situación 14:30'));
    },
  },
  'bal-per-2021-06-bh-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const op = k.oposicion('punta-almina', 'punta-europa');
      const ct = k.ct({ dm: 2, desvio: 2 });
      const rv = k.rv(296, ct);
      const dc = k.dvM(rv, -60, 'ceuta-bocana');
      const s = k.lineAndBearing('punta-europa', op, 'ceuta-bocana', dc, 'Situación 09:15');
      const p1 = k.run(s, NW, k.distFor(5, 90), 'Situación 10:45');
      const ct2 = k.ct({ dm: 1.5, desvio: 2.5 });
      const rv2 = k.rv(252, ct2);
      const op2 = k.oposicion('punta-alcazar', 'isla-tarifa');
      const p2 = k.corteRumbo(p1, rv2, 'isla-tarifa', op2, 'Oposición Tarifa–Alcázar');
      const d = k.distanceBetween(p1, p2);
      return [{ kind: 'clock', value: k.eta(hrb(10, 45), d, 3) }, { kind: 'distance', value: k.distanceBetween(p2, 'isla-tarifa') }];
    },
  },
  'bal-per-2021-06-ci-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -2 });
      const d1 = k.dv(10, ct, 'punta-gracia');
      const d2 = k.dv(95, ct, 'punta-paloma');
      const s = k.fix2('punta-gracia', d1, 'punta-paloma', d2, 'Situación 13:30');
      const rv = k.rv(175, ct);
      return latlon(k.run(s, rv, k.distFor(5, 75), 'Situación 14:45'));
    },
  },
  'bal-per-2021-09-b-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const rv = k.rv(201, k.ct({ dm: -2, desvio: -3 }));
      const d1 = k.dvM(rv, 100, 'punta-carbonera');
      const d2 = k.dvM(rv, 20, 'punta-europa');
      const s = k.fix2('punta-carbonera', d1, 'punta-europa', d2, 'Situación 07:00');
      const { rv: r, dist } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ dm: -2, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(r, ct) }, { kind: 'clock', value: k.eta(hrb(7), dist, 11) }];
    },
  },
  'bal-per-2021-09-c-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('punta-carnero', S, 6, 'Situación 14:30');
      k.note('Declinación actualizada', 'La de la carta llevada a 2021: −2°50′ + 16 × 7′ = −0°58′, que redondeada al grado da 1° W.');
      const rv = k.rv(260, k.ct({ dm: -1, desvio: 5 }));
      return latlon(k.run(s, rv, k.distFor(8, 90), 'Situación 16:00'));
    },
  },
  'bal-per-2021-09-d-42': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const rv = k.rv(72, k.ct({ dm: -3, desvio: 8 }));
      const dv = k.dvM(rv, 70, 'cabo-espartel');
      return latlon(k.fixDist('cabo-espartel', dv, 5));
    },
  },
  'bal-per-2021-09-b-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(252, k.ct({ dm: -3, desvio: 1 }));
      const d1 = k.dvM(rv, 20, 'isla-tarifa');
      const d2 = k.dvM(rv, 110, 'punta-europa');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-europa', d2));
    },
  },
  'bal-per-2021-12-d-43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('cabo-espartel', 'punta-malabata', 90);
      return [{ kind: 'signed', value: k.ctFrom(dv, 90) }];
    },
  },
  'bal-per-2022-06-d-43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('punta-europa', 'punta-carnero', 250);
      return [{ kind: 'signed', value: k.ctFrom(dv, 250) }];
    },
  },
  'bal-per-2022-06-b-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const dv = k.dv(250, k.ct({ ct: -10 }), 'cabo-espartel');
      return latlon(k.lineAndBearing('isla-tarifa', S, 'cabo-espartel', dv));
    },
  },
  'bal-per-2022-09-b-44': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const op1 = k.oposicion('punta-cires', 'isla-tarifa');
      const op2 = k.oposicion('punta-alcazar', 'punta-carnero');
      const s = k.lineAndBearing('isla-tarifa', op1, 'punta-carnero', op2, 'Situación 19:43');
      k.note('Parada', 'Sin arrancada 1 h 56 min: a las 21:39 seguimos en el mismo punto.');
      const rv = k.rv(281, k.ct({ carta: L105, anyo: 2022, desvio: 3.7 }));
      const p = k.run(s, rv, k.distFor(33, 8), 'Embarcación detenida 21:47');
      k.note('Inspección', '52 minutos sin arrancada: salimos hacia Malabata a las 22:39.');
      const { rv: r } = k.rhumb(p, 'punta-malabata');
      // El arco de 3,5 millas de Tánger se corta antes de llegar a Malabata (el faro está a menos de 3,5 millas de Tánger).
      const q = k.fixBearingRange('punta-malabata', r, 'tanger-espigon', 3.5, 1, 'A 3,5 millas de Tánger');
      return [{ kind: 'clock', value: k.eta(hrb(22, 39), k.distanceBetween(p, q), 4.1) }];
    },
  },
  'bal-per-2022-12-a-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('algeciras-espigon', N, 1, 'Situación 07:00');
      const a = k.rhumb(s, 'gibraltar-muelle-sur', 'Rumbo y distancia a Gibraltar');
      const p1 = k.run(s, a.rv, a.dist / 2, 'Mitad del camino');
      const t1 = hrb(7) + (a.dist / 2) * 60;
      const p2 = k.corteRumbo(p1, S, 'punta-carnero', S + 100, 'Situación con Carnero a 100 grados por estribor');
      const d2 = k.distanceBetween(p1, p2);
      const d3 = (p2.lat - 36) * 60;
      k.note('Punto de paso: Paralelo 36° N', `Desde ahí al S hasta 36° 00′ N quedan ${d3.toFixed(1).replace('.', ',')} millas, sin cambiar de longitud.`);
      const t = k.eta(k.eta(t1, d2, 3), d3, 6);
      return [{ kind: 'clock', value: t }, { kind: 'lon', value: p2.lon }];
    },
  },
  'bal-per-2022-12-be-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -2 });
      const d1 = k.dv(10, ct, 'punta-gracia');
      const d2 = k.dv(95, ct, 'punta-paloma');
      const s = k.fix2('punta-gracia', d1, 'punta-paloma', d2, 'Situación 13:30');
      const rv = k.rv(175, ct);
      return latlon(k.run(s, rv, k.distFor(5, 75), 'Situación 14:45'));
    },
  },
  'bal-per-2023-03-a-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const op1 = k.oposicion('punta-malabata', 'cabo-trafalgar');
      const op2 = k.oposicion('punta-gracia', 'cabo-espartel');
      const s = k.lineAndBearing('cabo-trafalgar', op1, 'cabo-espartel', op2, 'Situación 10:00');
      const op3 = k.oposicion('punta-paloma', 'punta-alcazar');
      const p = k.fixBearingRange('punta-alcazar', op3, 'punta-cires', 6, 0, 'Destino');
      const { rv, dist } = k.rhumb(s, p);
      const ct = k.ct({ ct: 2.2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(10), dist, 3.5) }];
    },
  },
  'bal-per-2023-06-d-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fixBearingRange('punta-europa', 328, 'punta-almina', 5, 0);
      // Hacia el W pasando por el N de Punta Leona: queda por babor.
      const rv = k.tangent(s, 'punta-leona', 2.5, 'babor');
      return [...latlon(s), { kind: 'bearing', value: rv }];
    },
  },
  'bal-per-2023-09-c-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fixBearingRange('cabo-espartel', SW, 'isla-tarifa', 8, 0, 'Situación 13:45');
      const { rv, dist } = k.rhumb(s, 'barbate-espigon');
      k.note('Declinación actualizada', 'El enunciado fecha el ejercicio el 13 de septiembre de 2012: la declinación es la de la carta llevada a 2012.');
      const ct = k.ct({ carta: L105, anyo: 2012, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(13, 45), dist, 8) }];
    },
  },
};

/* DISCREPANCIAS

 Ninguna pregunta del lote llega con la carta a una opción distinta de la oficial.

 Sin cálculo con la carta de la app (24): usan elementos que no están en ella. No se inventan: sin ellos no hay
 situación de partida o de llegada.
 * 'bal-per-2021-03-c-45': se sitúa sobre la isobática de 100 m al NW del banco Majuán con una sola marcación.
 * 'bal-per-2021-06-ci-42': situación por la enfilación Trafalgar–Roche y la sonda de 100 m (isobática).
 * 'bal-per-2021-06-espa-42': oposición con la boya cardinal E de la piscifactoría de Barbate y sectores de El Xarf.
 * 'bal-per-2021-06-bh-43': oposición Carnero–Cires con la sonda de 500 m (isobática) y el DST.
 * 'bal-per-2021-06-e-43': isobática al W de la marca cardinal N próxima a Malabata y sectores de El Xarf.
 * 'bal-per-2021-06-espa-43': sonda de 50 m (isobática) y naufragio en el meridiano 005° 40′ W.
 * 'bal-per-2021-06-bh-44': veril de 100 m al N de los bancos del Fénix.
 * 'bal-per-2021-06-espa-44': naufragio próximo a Torre Castilobo y marca cardinal N frente a Malabata.
 * 'bal-per-2021-06-g-44': enfilación con el monte Beni Meyimel.
 * 'bal-per-2021-09-a-43': cruce de la isobática de 30 m.
 * 'bal-per-2021-12-c-42': enfilación con el monte Magair.
 * 'bal-per-2022-03-b-42': luz verde del puerto de Torre de Guadiaro (sin coordenadas en el enunciado).
 * 'bal-per-2022-09-a-42': naufragio próximo a Torre Castilobo y marca cardinal N frente a Malabata.
 * 'bal-per-2022-09-b-42': marca cardinal E de la piscifactoría de Barbate y naufragio entre Zahara y Cabo Plata.
 * 'bal-per-2022-09-a-43': cruce de la isobática de 100 m al S del DST.
 * 'bal-per-2022-09-a-45': naufragio más próximo al faro de Cabo Espartel.
 * 'bal-per-2022-09-b-45': oposición con la boya cardinal E de la piscifactoría de Barbate y sectores de El Xarf.
 * 'bal-per-2022-12-a-42': veril de 100 m al N de los bancos del Fénix.
 * 'bal-per-2022-12-be-43': sonda de 500 m, isobática de 50 m en la Ensenada de Ceuta y espigón de Piedra Redonda.
 * 'bal-per-2023-03-cg-42': demora al monte Chajchuja.
 * 'bal-per-2023-03-e-42': veril de 100 m al N de los bancos del Fénix.
 * 'bal-per-2023-03-a-45': marca especial de La Línea de la Concepción.
 * 'bal-per-2023-03-bf-45': naufragio no peligroso al S de la salida.
 * 'bal-per-2023-03-e-45': la respuesta pide si se está dentro o fuera del DST y en qué vía; sus límites no están en la carta.
*/

// Todas las preguntas del lote que no quedan en `export default`, con el motivo (detalle en DISCREPANCIAS).
export const documentadas = {
  'bal-per-2021-03-c-45': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Se sitúa sobre la isobática de 100 m al NW del banco Majuán con una sola marcación. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2021-06-ci-42': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Situación por la enfilación Trafalgar–Roche y la sonda de 100 m (isobática). No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2021-06-espa-42': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Oposición con la boya cardinal E de la piscifactoría de Barbate y sectores de El Xarf. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2021-06-bh-43': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Oposición Carnero–Cires con la sonda de 500 m (isobática) y el DST. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2021-06-e-43': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Isobática al W de la marca cardinal N próxima a Malabata y sectores de El Xarf. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2021-06-espa-43': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Sonda de 50 m (isobática) y naufragio en el meridiano 005° 40′ W. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2021-06-bh-44': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Veril de 100 m al N de los bancos del Fénix. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2021-06-espa-44': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Naufragio próximo a Torre Castilobo y marca cardinal N frente a Malabata. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2021-06-g-44': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Enfilación con el monte Beni Meyimel. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2021-09-a-43': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Cruce de la isobática de 30 m. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2021-12-c-42': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Enfilación con el monte Magair. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2022-03-b-42': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Luz verde del puerto de Torre de Guadiaro (sin coordenadas en el enunciado). No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2022-09-a-42': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Naufragio próximo a Torre Castilobo y marca cardinal N frente a Malabata. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2022-09-b-42': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Marca cardinal E de la piscifactoría de Barbate y naufragio entre Zahara y Cabo Plata. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2022-09-a-43': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Cruce de la isobática de 100 m al S del DST. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2022-09-a-45': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Naufragio más próximo al faro de Cabo Espartel. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2022-09-b-45': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Oposición con la boya cardinal E de la piscifactoría de Barbate y sectores de El Xarf. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2022-12-a-42': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Veril de 100 m al N de los bancos del Fénix. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2022-12-be-43': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Sonda de 500 m, isobática de 50 m en la Ensenada de Ceuta y espigón de Piedra Redonda. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2023-03-cg-42': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Demora al monte Chajchuja. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2023-03-e-42': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Veril de 100 m al N de los bancos del Fénix. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2023-03-a-45': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Marca especial de La Línea de la Concepción. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2023-03-bf-45': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: Naufragio no peligroso al S de la salida. No se inventa: sin él no hay situación de partida o de llegada.' },
  'bal-per-2023-03-e-45': { tipo: 'sin-calculo', texto: 'Elemento que no está en la carta de la app: La respuesta pide si se está dentro o fuera del DST y en qué vía; sus límites no están en la carta. No se inventa: sin él no hay situación de partida o de llegada.' },
};
