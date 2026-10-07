// Soluciones programadas de carta del PER de Baleares (lote 04). Ver baleares-per.js para el formato.
// Resumen del lote: 109 preguntas, todas del PER. Resueltas: 78. En DISCREPANCIAS: 31, por motivo:
//   - 17 usan un elemento que no está en la carta de la app (isobáticas y sondas, torres, cerros, naufragios,
//     marcas cardinales, áreas de refugio, el espigón de Piedra Redonda, el río El Liam);
//   - 9 resueltas a la oficial pero con opciones que el comprobador no lee (hora sin separador «1428», minutos
//     «52',1», signo «(-)»);
//   - 1 con respuesta no numérica (nombres de faros), resuelta a la oficial;
//   - 4 que no llegan a la oficial por la plantilla o el enunciado.
// Las 31 están también en `documentadas` (export con nombre al final), con tipo y motivo.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];

export default {
  'bal-per-2023-12-a-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const op = k.oposicion('punta-gracia', 'cabo-trafalgar');
      const s = k.lineAndBearing('cabo-trafalgar', op, 'barbate-faro', 340, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'cabo-espartel');
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: 1.2 });
      const v = dist / 2;
      k.note('Velocidad', `Para llegar a las 17:00 tenemos 2 h: V = d / t = ${dist.toFixed(1).replace('.', ',')} / 2 = ${v.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: v }];
    },
  },
  'bal-per-2023-12-b-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fixDist('punta-almina', 204, 5.5, 'Situación 12:06');
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: 3.5 });
      const rv = k.rv(10, ct);
      return latlon(k.run(s, rv, k.distFor(12, hrb(13, 12) - hrb(12, 6)), 'Situación 13:12'));
    },
  },
  'bal-per-2023-12-c-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -4 });
      const rv = k.rv(297, ct);
      const d1 = k.dvM(rv, -85, 'cabo-espartel');
      const d2 = k.dvM(rv, -135, 'punta-malabata');
      return latlon(k.fix2('cabo-espartel', d1, 'punta-malabata', d2, 'Situación 12:00'));
    },
  },
  'bal-per-2023-12-a-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -5, desvio: -3 });
      const rv = k.rv(66, ct);
      const d1 = k.dv(138, ct, 'punta-almina');
      const d2 = k.dvM(rv, 168, 'punta-cires');
      return latlon(k.fix2('punta-almina', d1, 'punta-cires', d2));
    },
  },
  'bal-per-2023-12-c-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const op = k.oposicion('punta-alcazar', 'isla-tarifa');
      const ct = k.ct({ ct: 3 });
      const dv = k.dv(97, ct, 'punta-cires');
      return latlon(k.lineAndBearing('isla-tarifa', op, 'punta-cires', dv));
    },
  },
  'bal-per-2024-04-a-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('punta-carnero', 180, 5, 'Situación 17:30');
      k.note('Declinación', 'dm 2024 = −2°50′ + 19 × 7′ = −0°37′, que redondeada al grado, como pide el enunciado, da 1° NW.');
      const ct = k.ct({ dm: -1, desvio: 5 });
      const rv = k.rv(260, ct);
      return latlon(k.run(s, rv, k.distFor(8, 60), 'Situación 18:30'));
    },
  },
  'bal-per-2024-04-b-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-malabata', 0, 4.8, 'Situación 20:40');
      const { rv, dist } = k.rhumb(s, 'barbate-espigon');
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: 6 });
      const t = hrb(23, 22) - hrb(20, 40);
      const v = dist / (t / 60);
      k.note('Velocidad', `De 20:40 a 23:22 hay ${t} min: Vb = d / t = ${dist.toFixed(1).replace('.', ',')} / ${(t / 60).toFixed(2).replace('.', ',')} = ${v.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: v }];
    },
  },
  'bal-per-2024-04-ce-42': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('cabo-trafalgar', 'cabo-roche', 331);
      return [{ kind: 'signed', value: k.ctFrom(dv, 331) }];
    },
  },
  'bal-per-2024-04-df-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: -1 });
      const rv = k.rv(0, ct);
      return latlon(k.run(k.P('ceuta-bocana'), rv, k.distFor(10, 45), 'Situación 13:15'));
    },
  },
  'bal-per-2024-04-a-43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      k.note('Isla del Perejil', 'La carta de la app solo tiene el centro de la Isla del Perejil: tomamos la distancia a ese punto.');
      const s = k.fix2Ranges('punta-almina', 5.3, 'isla-perejil', 4.2, k.P('punta-europa'));
      const rv = k.tangent(s, 'punta-europa', 2.5, 'babor');
      const ct = k.ct({ dm: -4, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2024-04-b-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const d1 = k.dvM(105, -43, 'punta-gracia');
      const d2 = k.dvM(105, 35, 'punta-malabata');
      const s = k.fix2('punta-gracia', d1, 'punta-malabata', d2, 'Situación 02:43');
      const dest = k.fromMark('cabo-espartel', 255, 5, 'Destino');
      const { dist } = k.rhumb(s, dest);
      return [{ kind: 'clock', value: k.eta(hrb(2, 43), dist, 12) }];
    },
  },
  'bal-per-2024-04-ce-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct1 = k.ct({ dm: 6, desvio: -1 });
      const dv = k.dv(245, ct1, 'punta-europa');
      k.note('Línea de posición', 'Al Norte verdadero del faro de Punta Almina: estamos sobre el meridiano del faro, al N de él.');
      const s = k.lineAndBearing('punta-almina', 0, 'punta-europa', dv, 'Situación 02:41');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const ct2 = k.ct({ dm: 6, desvio: 4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct2) }, { kind: 'clock', value: k.eta(hrb(2, 41), dist, 6) }];
    },
  },
  'bal-per-2024-04-a-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-gracia', 180, 3, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'barbate-espigon');
      const ct = k.ct({ dm: -2, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(15, 0), dist, 7.5) }];
    },
  },
  'bal-per-2024-04-ce-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      k.note('Corrección total', 'El enunciado no da dm ni desvío: tomamos la declinación de la carta llevada a 2024 y desvío nulo. La enfilación con Magair no hace falta: la marcación y la distancia a Espartel ya nos sitúan.');
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: 0 });
      const rv = k.rv(81, ct);
      const dv = k.dvM(rv, 60.5, 'cabo-espartel');
      const s = k.fixDist('cabo-espartel', dv, 3.2, 'Situación 02:15');
      return latlon(k.run(s, rv, k.distFor(14, 30), 'Situación 02:45'));
    },
  },
  'bal-per-2024-04-df-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 00,0 W', 'Situación 10:00');
      const ct = k.ct({ dm: 3, desvio: 5 });
      const rv = k.rv(70, ct);
      return latlon(k.run(s, rv, k.distFor(6, 90), 'Situación 11:30'));
    },
  },
  'bal-per-2024-04-ce-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      k.note('Corte de los arcos', 'Los arcos se cortan en dos puntos; la plantilla toma el del S (a unas 5 millas al S de Tarifa), y desde él la estima cae dentro de la vía con sentido E.');
      const s = k.fix2Ranges('punta-cires', 6, 'isla-tarifa', 5, k.P('punta-alcazar'), 'Situación 23:20');
      const ct = k.ct({ dm: 3, desvio: 2 });
      const rv = k.rv(65, ct);
      return latlon(k.run(s, rv, k.distFor(8, 90), 'Situación 00:50'));
    },
  },
  'bal-per-2024-04-df-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const d1 = k.dvM(70, -50, 'isla-tarifa');
      const d2 = k.dvM(70, 50, 'punta-alcazar');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-alcazar', d2));
    },
  },
  'bal-per-2024-07-a-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 54,6 N', '5 50,0 W', 'Situación 10:00');
      const rv = k.tangent(s, 'isla-tarifa', 3, 'babor');
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: 5.1 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2024-07-be-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', 315, 4, 'Situación 11:30');
      const op = k.oposicion('punta-gracia', 'punta-malabata');
      const p = k.fixBearingRange('punta-malabata', op, 'punta-malabata', 4.2, 0, 'Oposición Gracia–Malabata');
      const d1 = k.distanceBetween(s, p);
      const { dist: d2 } = k.rhumb(p, 'tanger-espigon');
      k.note('Distancia total', `${d1.toFixed(1).replace('.', ',')} + ${d2.toFixed(1).replace('.', ',')} millas a 7 nudos.`);
      return [{ kind: 'clock', value: k.eta(hrb(11, 30), d1 + d2, 7) }];
    },
  },
  'bal-per-2024-07-c-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -2 });
      const rv = k.rv(254, ct);
      const d1 = k.dvM(rv, 142, 'punta-europa');
      const d2 = k.dvM(rv, 85, 'punta-carnero');
      return latlon(k.fix2('punta-europa', d1, 'punta-carnero', d2, 'Situación 05:00'));
    },
  },
  'bal-per-2024-07-a-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -5 });
      const rv = k.rv(260, ct);
      k.note('Marcaciones', 'Tarifa por la proa: marcación 0°. Punta Europa por el través, que con rumbo al WSW queda por estribor (a nuestro N): marcación +90°.');
      const d1 = k.dvM(rv, 0, 'isla-tarifa');
      const d2 = k.dvM(rv, 90, 'punta-europa');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-europa', d2, 'Situación 07:00'));
    },
  },
  'bal-per-2024-07-be-43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const ct = k.ct({ dm: 3, desvio: -1.6 });
      const rv = k.rv(147, ct);
      const d1 = k.dvM(rv, -42, 'punta-gracia');
      const d2 = k.dvM(rv, -12, 'punta-alcazar');
      const s = k.fix2('punta-gracia', d1, 'punta-alcazar', d2);
      return [{ kind: 'distance', value: k.distanceBetween(s, 'cabo-trafalgar') }];
    },
  },
  'bal-per-2024-07-c-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-carnero', 90, 2, 'Situación 19:50');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(19, 50), dist, 5) }];
    },
  },
  'bal-per-2024-07-be-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -2 });
      const rv = k.rv(135, ct);
      const dv = k.dvM(rv, -70, 'punta-gracia');
      k.note('Línea de posición', 'Al S verdadero del faro de Barbate: estamos sobre el meridiano del faro.');
      const s = k.lineAndBearing('barbate-faro', 180, 'punta-gracia', dv, 'Situación 12:00');
      const { dist } = k.rhumb(s, 'tanger-espigon');
      const v = dist / (80 / 60);
      k.note('Velocidad', `De 12:00 a 13:20 hay 80 min: V = ${dist.toFixed(1).replace('.', ',')} / 1,33 = ${v.toFixed(2).replace('.', ',')} nudos.`);
      return [{ kind: 'speed', value: v }];
    },
  },
  'bal-per-2024-07-c-44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-gracia', 'cabo-trafalgar');
      return [{ kind: 'signed', value: k.ctFrom(dv, 306) }];
    },
  },
  'bal-per-2024-07-df-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('35 59,3 N', '5 28,8 W', 'Situación 13:23');
      const p = k.run(s, 260, k.distFor(10, 90), 'Situación 14:53');
      const { rv, dist } = k.rhumb(p, 'tanger-espigon');
      const ct = k.ct({ carta: L105, anyo: 2005, desvio: 5 + 20 / 60 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(14, 53), dist, 10) }];
    },
  },
  'bal-per-2024-09-e-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 53,0 N', '5 46,0 W', 'Situación 17:35');
      const ct = k.ct({ dm: -3, desvio: -3 });
      const rv = k.rv(84, ct);
      return latlon(k.run(s, rv, k.distFor(7, hrb(19, 55) - hrb(17, 35)), 'Situación 19:55'));
    },
  },
  'bal-per-2024-09-e-43': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: -2 });
      const rv = k.rv(258, ct);
      const dv = k.dvM(rv, 90, 'punta-carnero');
      return latlon(k.fixDist('punta-carnero', dv, 2.5, 'Situación 08:30'));
    },
  },
  'bal-per-2024-09-f-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const e1 = k.enfilacion('punta-carnero', 'punta-europa');
      const e2 = k.enfilacion('punta-almina', 'cabo-negro');
      const s = k.lineAndBearing('punta-carnero', e1, 'punta-almina', e2, 'Situación 12:00');
      const { dist } = k.rhumb(s, 'ceuta-bocana');
      return [{ kind: 'clock', value: k.eta(hrb(12, 0), dist, 20) }];
    },
  },
  'bal-per-2024-09-a-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('punta-carnero', 180, 5, 'Situación 17:30');
      k.note('Declinación', 'dm 2024 = −2°50′ + 19 × 7′ = −0°37′, que redondeada al grado, como pide el enunciado, da 1° NW.');
      const ct = k.ct({ dm: -1, desvio: 5 });
      const rv = k.rv(260, ct);
      return latlon(k.run(s, rv, k.distFor(8, 60), 'Situación 18:30'));
    },
  },
  'bal-per-2024-09-d-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -3 });
      const rv = k.rv(45, ct);
      k.note('Marcaciones', 'Tarifa por la proa: marcación 0°. Punta Paloma por el través, que con rumbo al NE queda por babor (a nuestro NW): marcación −90°.');
      const d1 = k.dvM(rv, 0, 'isla-tarifa');
      const d2 = k.dvM(rv, -90, 'punta-paloma');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-paloma', d2, 'Situación 08:00'));
    },
  },
  'bal-per-2024-09-e-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const op = k.oposicion('punta-leona', 'punta-carnero');
      k.note('Demora de Tarifa', 'Al E verdadero del faro de Isla de Tarifa: desde el barco el faro demora 270°.');
      const s = k.lineAndBearing('punta-carnero', op, 'isla-tarifa', 270, 'Situación 13:45');
      const ct = k.ct({ ct: 7 });
      const rv = k.rv(251, ct);
      return latlon(k.run(s, rv, k.distFor(9, 75), 'Situación 15:00'));
    },
  },
  'bal-per-2024-09-a-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 12:00');
      const ct = k.ct({ ct: -15 });
      const rv = k.rv(345, ct);
      const dv = k.dvM(rv, 90, 'punta-gracia');
      const p = k.corteRumbo(s, rv, 'punta-gracia', dv, 'Gracia por el través');
      return [{ kind: 'clock', value: k.eta(hrb(12, 0), k.distanceBetween(s, p), 8) }];
    },
  },
  'bal-per-2024-09-d-45': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ ct: 7 });
      const rv = k.rv(263, ct);
      const dv = k.dvM(rv, 160, 'isla-tarifa');
      k.note('Línea de posición', 'Al S verdadero del faro de Punta Paloma: estamos sobre el meridiano del faro.');
      const s = k.lineAndBearing('punta-paloma', 180, 'isla-tarifa', dv);
      // Hacia el WNW costeando: Trafalgar (tierra) queda por estribor.
      return [{ kind: 'bearing', value: k.tangent(s, 'cabo-trafalgar', 3, 'estribor') }];
    },
  },
  'bal-per-2024-12-a-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const e = k.enfilacion('punta-alcazar', 'punta-cires');
      const ct1 = k.ct({ dm: 0.3, desvio: -1.6 });
      const dv = k.dv(265, ct1, 'punta-carnero');
      const s = k.lineAndBearing('punta-alcazar', e, 'punta-carnero', dv, 'Situación 09:45');
      const rv = k.rv(222, k.ct({ ct: -2 }));
      const p = k.run(s, rv, k.distFor(4, 45), 'Situación 10:30');
      // Sale 2,4′ más al S que la oficial (c), que sigue siendo la opción más próxima.
      const { rv: r2 } = k.rhumb(p, 'cabo-negro');
      return latlon(k.run(p, r2, k.distFor(3, hrb(15, 55) - hrb(10, 30)), 'Situación 15:55'));
    },
  },
  'bal-per-2024-12-ce-42': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const op = k.oposicion('punta-almina', 'punta-carnero');
      const s = k.fixBearingRange('punta-carnero', op, 'punta-europa', 6, 0, 'Situación 17:00');
      const dv = k.bearingTo(s, 'isla-tarifa').dv;
      const rv = (dv - 13 + 360) % 360;
      k.note('Rumbo verdadero', `La marcación es Dv − Rv: Rv = Dv − M = ${dv.toFixed(1).replace('.', ',')}° − 13° = ${rv.toFixed(1).replace('.', ',')}°.`);
      return [{ kind: 'bearing', value: rv }];
    },
  },
  'bal-per-2024-12-b-43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const s = k.pos('36 02,4 N', '5 58,4 W');
      return [{ kind: 'bearing', value: k.bearingTo(s, 'cabo-trafalgar').dv }];
    },
  },
  'bal-per-2024-12-df-43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('cabo-trafalgar', 'cabo-roche', 310);
      return [{ kind: 'signed', value: k.ctFrom(dv, 310) }];
    },
  },
  'bal-per-2024-12-a-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const op = k.oposicion('punta-almina', 'punta-europa');
      const ct = k.ctFrom(op, 357);
      const dv = k.dv(330, ct, 'punta-carnero');
      const s = k.lineAndBearing('punta-almina', op, 'punta-carnero', dv, 'Situación 14:00');
      const { rv } = k.rhumb(s, 'isla-tarifa');
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2024-12-df-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const ct = k.ct({ dm: -4, desvio: 1 });
      const d1 = k.dv(45, ct, 'punta-gracia');
      const d2 = k.dv(119, ct, 'punta-malabata');
      const s = k.fix2('punta-gracia', d1, 'punta-malabata', d2, 'Situación 12:20');
      const rv = k.rv(202, ct);
      return latlon(k.run(s, rv, k.distFor(4.5, hrb(14, 30) - hrb(12, 20)), 'Situación 14:30'));
    },
  },
  'bal-per-2024-12-a-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      k.note('Línea de posición', 'Al S verdadero de Punta Europa: estamos sobre el meridiano del faro.');
      const s = k.lineAndBearing('punta-europa', 180, 'punta-almina', 150, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'punta-carnero');
      const v1 = dist / 1.5;
      k.note('Velocidad hacia Carnero', `Para llegar a las 16:30: V = ${dist.toFixed(1).replace('.', ',')} / 1,5 = ${v1.toFixed(1).replace('.', ',')} nudos.`);
      const p = k.run(s, rv, v1, 'Situación 16:00');
      const r2 = k.rhumb(p, 'ceuta-bocana');
      const v2 = r2.dist / 1.5;
      k.note('Velocidad hacia Ceuta', `De 16:00 a 17:30 hay 1,5 h: Vm = ${r2.dist.toFixed(1).replace('.', ',')} / 1,5 = ${v2.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: r2.rv }, { kind: 'speed', value: v2 }];
    },
  },
  'bal-per-2024-12-df-45': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: -2 });
      k.note('Situación', 'La marcación y la distancia a Punta Carnero sitúan el barco, pero el rumbo de aguja solo depende del Rv y de la Ct.');
      const dv = k.dvM(258, 90, 'punta-carnero');
      k.fixDist('punta-carnero', dv, 2.5, 'Situación 08:30');
      return [{ kind: 'bearing', value: k.ra(258, ct) }];
    },
  },
  'bal-per-2025-04-bf-42': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -2 });
      const rv = k.rv(320, ct);
      const d1 = k.dvM(rv, 0, 'punta-europa');
      const d2 = k.dvM(rv, -90, 'punta-cires');
      const s = k.fix2('punta-europa', d1, 'punta-cires', d2);
      return [{ kind: 'distance', value: k.distanceBetween(s, 'algeciras-espigon') }];
    },
  },
  'bal-per-2025-04-c-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-almina', 90, 2, 'Situación 10:00');
      const { rv, dist } = k.rhumb(s, 'algeciras-espigon');
      const ct = k.ct({ carta: L105, anyo: 2025, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(10, 0), dist, 10) }];
    },
  },
  'bal-per-2025-04-d-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fix2('punta-paloma', 55, 'barbate-espigon', 338, 'Situación 16:30');
      const rv = k.rv(175, k.ct({ ct: 7 }));
      return latlon(k.run(s, rv, k.distFor(6, 90), 'Situación 18:00'));
    },
  },
  'bal-per-2025-04-bf-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const op1 = k.oposicion('punta-cires', 'punta-europa');
      const op2 = k.oposicion('punta-almina', 'punta-carnero');
      const s = k.lineAndBearing('punta-europa', op1, 'punta-carnero', op2, 'Situación inicial');
      const ct = k.ct({ dm: -1.3, desvio: 1.8 });
      const rv = k.rv(243, ct);
      return latlon(k.run(s, rv, k.distFor(2.5, 240), 'Situación 4 h después'));
    },
  },
  'bal-per-2025-04-d-44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      k.note('Línea de posición', 'Al S verdadero de Punta Paloma: estamos sobre el meridiano del faro.');
      const s = k.lineAndBearing('punta-paloma', 180, 'isla-tarifa', 70);
      // Hacia el SW, con la costa de Marruecos al S: Espartel queda por babor.
      const rv = k.tangent(s, 'cabo-espartel', 3, 'babor');
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ ct: -8 })) }];
    },
  },
  'bal-per-2025-04-ae-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -3 });
      const rv = k.rv(80, ct);
      const d1 = k.dvM(rv, 26, 'punta-cires');
      const d2 = k.dvM(rv, -90, 'isla-tarifa');
      return latlon(k.fix2('punta-cires', d1, 'isla-tarifa', d2, 'Situación 09:30'));
    },
  },
  'bal-per-2025-04-bf-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const d1 = k.dvM(247, 35, 'punta-carnero');
      const d2 = k.dvM(247, -90, 'punta-almina');
      const s = k.fix2('punta-carnero', d1, 'punta-almina', d2, 'Situación 07:24');
      const dest = k.fromMark('isla-tarifa', 135, 3, '3 M al SE de Tarifa');
      const { dist } = k.rhumb(s, dest);
      return [{ kind: 'clock', value: k.eta(hrb(7, 24), dist, 7) }];
    },
  },
  'bal-per-2025-07-c-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct1 = k.ct({ dm: 6, desvio: -1 });
      const dv = k.dv(245, ct1, 'punta-europa');
      k.note('Línea de posición', 'Al Norte verdadero del faro de Punta Almina: estamos sobre el meridiano del faro, al N de él.');
      const s = k.lineAndBearing('punta-almina', 0, 'punta-europa', dv, 'Situación 10:23');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const ct2 = k.ct({ dm: 6, desvio: 4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct2) }, { kind: 'clock', value: k.eta(hrb(10, 23), dist, 6) }];
    },
  },
  'bal-per-2025-07-b-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const e1 = k.enfilacion('punta-carnero', 'punta-europa');
      const e2 = k.enfilacion('punta-almina', 'cabo-negro');
      const s = k.lineAndBearing('punta-carnero', e1, 'punta-almina', e2, 'Situación 12:00');
      const { dist } = k.rhumb(s, 'ceuta-bocana');
      return [{ kind: 'clock', value: k.eta(hrb(12, 0), dist, 20) }];
    },
  },
  'bal-per-2025-07-a-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.P('ceuta-bocana');
      k.note('Rumbo', 'Sin viento ni corriente, el rumbo de superficie es el verdadero: 347°.');
      k.note('Línea de posición', 'Al SW verdadero de Punta Europa: desde el barco el faro demora 045°.');
      const p = k.corteRumbo(s, 347, 'punta-europa', 45, 'Al SW de Punta Europa');
      return [{ kind: 'clock', value: k.eta(hrb(12, 0), k.distanceBetween(s, p), 9) }];
    },
  },
  'bal-per-2025-07-b-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2012, desvio: 5 });
      const d1 = k.dv(15, ct, 'punta-europa');
      const d2 = k.dv(289, ct, 'punta-carnero');
      return latlon(k.fix2('punta-europa', d1, 'punta-carnero', d2, 'Situación 11:15'));
    },
  },
  'bal-per-2025-07-c-45': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('punta-cires', 'punta-alcazar', 234);
      return [{ kind: 'signed', value: k.ctFrom(dv, 234) }];
    },
  },
  'bal-per-2025-07-d-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fix2('punta-carnero', 310, 'punta-almina', 220, 'Situación 22:00');
      const ct = k.ct({ carta: L105, anyo: 2011, desvio: -3.8 });
      const rv = k.rv(280, ct);
      return latlon(k.run(s, rv, k.distFor(4, hrb(24, 15) - hrb(22, 0)), 'Situación 00:15'));
    },
  },
  'bal-per-2025-09-b-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const op = k.oposicion('punta-cires', 'isla-tarifa');
      const dv = k.dvM(286, -85, 'punta-alcazar');
      return latlon(k.lineAndBearing('isla-tarifa', op, 'punta-alcazar', dv, 'Situación 11:10'));
    },
  },
  'bal-per-2025-09-c-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      k.note('Enfilación', 'En la parte S de la enfilación Roche–Trafalgar vemos Trafalgar con Roche detrás, hacia el NNW.');
      const dvT = k.enfilacion('cabo-trafalgar', 'cabo-roche', 330);
      const ct = k.ctFrom(dvT, 330);
      const dvP = k.dv(75, ct, 'punta-paloma');
      return latlon(k.lineAndBearing('cabo-trafalgar', dvT, 'punta-paloma', dvP));
    },
  },
  'bal-per-2025-09-b-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const op = k.oposicion('punta-paloma', 'punta-malabata');
      const ct = k.ctFrom(op, 193.5);
      const dv = k.dv(346, ct, 'punta-gracia');
      const s = k.lineAndBearing('punta-malabata', op, 'punta-gracia', dv, 'Situación 17:20');
      const { rv } = k.rhumb(s, 'cabo-trafalgar');
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2025-09-c-43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fix2('punta-paloma', 50, 'punta-malabata', 150, 'Situación 11:00');
      // Hacia el NW costeando: Trafalgar (tierra) queda por estribor.
      const rv = k.tangent(s, 'cabo-trafalgar', 4, 'estribor');
      const p = k.run(s, rv, k.distFor(10, 90), 'Situación 12:30');
      return [{ kind: 'bearing', value: k.bearingTo(p, 'cabo-trafalgar').dv }];
    },
  },
  'bal-per-2025-09-a-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2012, desvio: -8 });
      const rv = k.rv(184, ct);
      const d1 = k.dv(4, ct, 'cabo-roche');
      const d2 = k.dvM(rv, -90, 'cabo-trafalgar');
      return latlon(k.fix2('cabo-roche', d1, 'cabo-trafalgar', d2));
    },
  },
  'bal-per-2025-09-b-44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: 6 });
      const rv = k.rv(40, ct);
      k.note('Marcaciones', 'Espartel por el través de estribor (+90°) y Malabata 55° por estribor.');
      const d1 = k.dvM(rv, 90, 'cabo-espartel');
      const d2 = k.dvM(rv, 55, 'punta-malabata');
      const s = k.fix2('cabo-espartel', d1, 'punta-malabata', d2, 'Situación 14:00');
      const r = k.tangent(s, 'punta-cires', 3, 'estribor');
      const p = k.corteRumbo(s, r, 'punta-cires', 180, 'Al N de Punta Cires');
      return [{ kind: 'clock', value: k.eta(hrb(14, 0), k.distanceBetween(s, p), 11) }];
    },
  },
  'bal-per-2025-09-a-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.P('ceuta-bocana');
      const { rv, dist } = k.rhumb(s, 'algeciras-espigon');
      const v = dist / (140 / 60);
      k.note('Velocidad', `Para llegar en 140 min: V = ${dist.toFixed(1).replace('.', ',')} / 2,33 = ${v.toFixed(2).replace('.', ',')} nudos.`);
      k.note('Línea de posición', 'Al NE verdadero de Punta Cires: desde el barco el faro demora 225°.');
      const p = k.corteRumbo(s, rv, 'punta-cires', 225, 'Al NE de Punta Cires');
      const d1 = k.distanceBetween(s, p);
      const { dist: d2 } = k.rhumb(p, 'tarifa-espigon');
      return [{ kind: 'clock', value: k.eta(hrb(12, 30), d1 + d2, v) }];
    },
  },
  'bal-per-2025-12-a-42': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const s = k.fromMark('punta-carnero', 135, 4.3);
      k.note('Través', 'Con Rv 251° Isla de Tarifa queda al N, por estribor: lo tendremos al través cuando demore 251° + 90° = 341°.');
      const p = k.corteRumbo(s, 251, 'isla-tarifa', 341, 'Tarifa por el través');
      return [{ kind: 'distance', value: k.distanceBetween(s, p) }];
    },
  },
  'bal-per-2025-12-b-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 04,0 N', '5 53,0 W');
      const { rv } = k.rhumb(s, 'barbate-espigon');
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ dm: -2, desvio: -6 })) }];
    },
  },
  'bal-per-2025-12-c-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      k.note('Paralelo', 'El enunciado no da la latitud: tomamos el paralelo 36° N, en el centro del Estrecho.');
      const a = k.pos('36 00,0 N', '5 44,0 W', 'Meridiano 005° 44′ W');
      const b = k.pos('36 00,0 N', '5 31,0 W', 'Meridiano 005° 31′ W');
      return [{ kind: 'distance', value: k.rhumb(a, b).dist }];
    },
  },
  'bal-per-2025-12-d-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 01,0 N', '5 20,5 W', 'Situación 19:00');
      // Hacia el W, Isla de Tarifa (tierra al N) queda por estribor.
      const rv = k.tangent(s, 'isla-tarifa', 2.5, 'estribor');
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ dm: -3, desvio: 7 })) }];
    },
  },
  'bal-per-2025-12-a-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fix2('punta-paloma', 55, 'barbate-espigon', 338, 'Situación 13:30');
      const rv = k.rv(175, k.ct({ ct: 7 }));
      return latlon(k.run(s, rv, k.distFor(6, 90), 'Situación 15:00'));
    },
  },
  'bal-per-2025-12-b-43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -2 });
      const rv = k.rv(320, ct);
      const d1 = k.dvM(rv, 0, 'punta-europa');
      const d2 = k.dvM(rv, -90, 'punta-cires');
      const s = k.fix2('punta-europa', d1, 'punta-cires', d2);
      return [{ kind: 'distance', value: k.distanceBetween(s, 'algeciras-espigon') }];
    },
  },
  'bal-per-2025-12-c-43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', 315, 4, 'Situación 18:00');
      // Hacia el E por el Estrecho, Cires (costa de Marruecos) queda por estribor.
      const rv = k.tangent(s, 'punta-cires', 2.5, 'estribor');
      const ct = k.ct({ dm: -2, desvio: -2 });
      const p = k.corteRumbo(s, rv, 'punta-cires', (rv + 90) % 360, 'Cires por el través');
      return [{ kind: 'clock', value: k.eta(hrb(18, 0), k.distanceBetween(s, p), 11) }, { kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2025-12-b-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -4, desvio: 1 });
      const rv = k.rv(120, ct);
      const d1 = k.dv(333, ct, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -97, 'barbate-faro');
      return latlon(k.fix2('cabo-trafalgar', d1, 'barbate-faro', d2, 'Situación 05:30'));
    },
  },
  'bal-per-2025-12-c-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const op = k.oposicion('punta-gracia', 'cabo-trafalgar');
      const s = k.lineAndBearing('cabo-trafalgar', op, 'barbate-faro', 340, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'cabo-espartel');
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: 7.7 });
      const v = dist / (220 / 60);
      k.note('Velocidad', `De 15:00 a 18:40 hay 3 h 40 min: V = ${dist.toFixed(1).replace('.', ',')} / 3,67 = ${v.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: v }];
    },
  },
  'bal-per-2025-12-d-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct = k.ct({ dm: 0, desvio: 6 });
      const rv = k.rv(250, ct);
      const d1 = k.dvM(rv, 13, 'isla-tarifa');
      const d2 = k.dvM(rv, -55, 'punta-cires');
      const s = k.fix2('isla-tarifa', d1, 'punta-cires', d2);
      const { dist } = k.rhumb(s, 'punta-alcazar');
      const v = dist / 3.5;
      k.note('Velocidad', `Vb = ${dist.toFixed(1).replace('.', ',')} / 3,5 = ${v.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'speed', value: v }];
    },
  },
  'bal-per-2025-12-a-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const s = k.pos('36 02,2 N', '6 11,7 W', 'Salida');
      const ct = k.ct({ dm: -1.9, desvio: -2.7 });
      const rv = k.rv(111, ct);
      const dv = k.dvM(rv, 33, 'punta-malabata');
      return latlon(k.corteRumbo(s, rv, 'punta-malabata', dv));
    },
  },
  'bal-per-2025-12-c-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const s = k.pos('36 01,2 N', '6 14,7 W', 'Salida');
      const ct = k.ct({ dm: -2, desvio: 8 });
      const rv = k.rv(92, ct);
      k.note('Marcación', 'El enunciado no dice la banda: navegando al E, Isla de Tarifa queda a nuestro N, por babor (−23°).');
      const dv = k.dvM(rv, -23, 'isla-tarifa');
      return latlon(k.corteRumbo(s, rv, 'isla-tarifa', dv));
    },
  },
  'bal-per-2025-12-d-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 19,8 W', 'Salida');
      const ct = k.ct({ dm: -2.2, desvio: -1.9 });
      const rv = k.rv(281, ct);
      const dv = k.dvM(rv, -83, 'punta-alcazar');
      return latlon(k.corteRumbo(s, rv, 'punta-alcazar', dv));
    },
  },
  'bal-per-2026-03-a-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 01,4 N', '5 19,2 W', 'Salida');
      const dest = k.fromMark('punta-europa', 90, 1.8, '1,8 M al E de Punta Europa');
      const { rv } = k.rhumb(s, dest);
      const ct = k.ct({ carta: L105, anyo: 2026, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2026-03-c-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: 10 });
      const rv = k.rv(84, ct);
      const d1 = k.dvM(rv, 133, 'punta-cires');
      const d2 = k.dv(132, ct, 'punta-almina');
      return latlon(k.fix2('punta-cires', d1, 'punta-almina', d2, 'Situación 15:00'));
    },
  },
  'bal-per-2026-03-d-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const d1 = k.dvM(105, -43, 'punta-gracia');
      const d2 = k.dvM(105, 35, 'punta-malabata');
      const s = k.fix2('punta-gracia', d1, 'punta-malabata', d2, 'Situación 02:43');
      const dest = k.fromMark('cabo-espartel', 255, 5, 'Destino');
      const { dist } = k.rhumb(s, dest);
      return [{ kind: 'clock', value: k.eta(hrb(2, 43), dist, 12) }];
    },
  },
};

/* DISCREPANCIAS
 *
 * — Elementos que no están en la carta de la app —
 * 'bal-per-2023-09-bf-45' (elemento): la HRB es la del corte del rumbo con la isobática de 200 m, que la carta de la
 *   app no tiene. El Ra sí sale (de 6 M al S del espigón de Barbate a Punta Malabata, Ct = −4°), pero solo con él no se
 *   distingue entre las opciones.
 * 'bal-per-2023-09-c-45' (elemento): enfilación Cabo Trafalgar–Torre de Meca; la Torre de Meca no está en la carta.
 * 'bal-per-2023-12-e-44' (elemento): la situación sale de la isobática de 100 m al NW del banco de Majuán (ni la
 *   isobática ni el banco están en la carta).
 * 'bal-per-2023-12-a-45' (elemento): área de refugio de peces, banco de Lajas de Conil y marca cardinal E de Barbate:
 *   nada de eso está en la carta.
 * 'bal-per-2023-12-e-45' (elemento): enfilación de los cerros Gitano y Vacas y sonda de 200 m: no están en la carta.
 * 'bal-per-2024-07-a-44' (elemento): igual que 'bal-per-2023-09-bf-45' (isobática de 200 m). Además, las opciones
 *   escriben la hora sin separador («HRB= 1428»).
 * 'bal-per-2024-07-c-45' (elemento): la situación de partida es el corte de la oposición Paloma–Malabata con la
 *   isobática de 100 m al N de los bancos del Fénix, que no están en la carta.
 * 'bal-per-2024-09-a-42' (elemento): se pide el paso por el veril de 200 m, que la carta no tiene.
 * 'bal-per-2024-09-d-42' (elemento): oposición del faro de Isla de Tarifa con la desembocadura del río El Liam, que no
 *   está en la carta.
 * 'bal-per-2024-12-df-42' (elemento): la situación de partida es la oposición Trafalgar–Espartel donde la sonda marca
 *   100 m: la carta no tiene isobáticas.
 * 'bal-per-2024-12-b-44' (elemento): faro del espigón de Piedra Redonda y sonda de 500 m: no están en la carta.
 * 'bal-per-2025-07-c-42' (elemento): igual que 'bal-per-2023-12-a-45' (área de refugio de peces, Lajas de Conil,
 *   marca cardinal E de Barbate y dique exterior de Cabo Roche): no están en la carta.
 * 'bal-per-2025-07-a-43' (elemento): naufragio próximo a Torre Castilobo y marca cardinal N frente a Malabata: no están
 *   en la carta.
 * 'bal-per-2025-07-b-43' (elemento): sonda de 500 m en la enfilación Carnero–Europa, espigón de Piedra Redonda e
 *   isobática de 50 m de la Ensenada de Ceuta: no están en la carta.
 * 'bal-per-2025-07-d-43' (elemento): isobática de 30 m del banco de Trafalgar: no está en la carta.
 * 'bal-per-2025-07-d-44' (elemento): la Ct solo sale de la enfilación Isla de Tarifa–monte Gitano, y el monte Gitano no
 *   está en la carta (el enunciado no da dm ni desvío).
 * 'bal-per-2025-09-d-42' (elemento): igual que 'bal-per-2023-12-e-45' (cerros Gitano y Vacas, sonda de 200 m).
 *
 * — Respuesta que el comprobador no puede leer —
 * 'bal-per-2024-09-a-43' (respuesta no numérica): las opciones son nombres de faros. Dos faros en demoras opuestas
 *   (326° y 146°) y a 6,4 M cada uno están a 12,8 M uno de otro en la línea 146°/326°: Punta Carnero → Punta Almina
 *   mide en la carta 146,6° y 12,8 M, que es la oficial (d). No hay tipo de valor para devolverlo.
 * 'bal-per-2023-12-e-42' (formato): sale HRB 12:42 (oficial b, 12:43), pero las opciones escriben la hora sin
 *   separador («HRB=1243») y el comprobador no las lee. Código:
 *     const s = k.pos('36 06,8 N', '5 57,9 W', 'Situación 11:30');
 *     const rv = k.tangent(s, 'punta-gracia', 2, 'babor');
 *     const op = k.oposicion('punta-alcazar', 'punta-paloma');
 *     const p = k.corteRumbo(s, rv, 'punta-paloma', op, 'Oposición Paloma–Alcázar');
 *     return [{ kind: 'clock', value: k.eta(hrb(11, 30), k.distanceBetween(s, p), 13) }];
 * 'bal-per-2023-12-c-44' (formato): sale Ra 147° y HRB 22:18, la oficial (a), pero las opciones escriben la hora sin
 *   separador («HRB= 2218»). Código:
 *     const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 20:00');
 *     const { rv, dist } = k.rhumb(s, 'tanger-espigon');
 *     const ct = k.ct({ ct: -6 });
 *     return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(20, 0), dist, 7) }];
 * 'bal-per-2024-07-df-44' (formato): sale 35° 52,1′ N 005° 57,6′ W, la oficial (a), pero las opciones escriben los
 *   minutos como «52',1» y el comprobador no las lee. Código:
 *     const s = k.pos('36 00,0 N', '5 50,0 W', 'Salida');
 *     const ct = k.ct({ carta: L105, anyo: 2012, desvio: 10 });
 *     return latlon(k.run(s, k.rv(210, ct), k.distFor(6, 100), 'Situación 1 h 40 min después'));
 * 'bal-per-2024-12-ce-43' (formato): sale 35° 53,8′ N 006° 12,7′ W, la oficial (a), con el mismo formato «53',9». Código:
 *     const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 16:00');
 *     const ct = k.ct({ dm: -2, desvio: 9 });
 *     return latlon(k.run(s, k.rv(232, ct), k.distFor(8, 90), 'Situación 17:30'));
 * 'bal-per-2025-04-ae-43' (formato): sale HRB 09:28 (oficial b, 09:27), pero las opciones escriben la hora sin
 *   separador («HRB=0927»). Código:
 *     const s = k.P('ceuta-bocana');
 *     const { rv, dist } = k.rhumb(s, 'algeciras-espigon');
 *     const v = dist / (70 / 60);
 *     const p = k.corteRumbo(s, rv, 'punta-carnero', 315, 'Al SE de Punta Carnero');
 *     const { dist: d2 } = k.rhumb(p, 'tarifa-espigon');
 *     return [{ kind: 'clock', value: k.eta(hrb(8, 0), k.distanceBetween(s, p) + d2, v) }];
 * 'bal-per-2025-04-c-45' (formato): la enfilación Espartel → Malabata mide 078,6° en la carta: Ct = 078,6° − 090° =
 *   −11,4°, la más próxima es la oficial (c, 10° (−)); pero el comprobador no lee el signo «(-)» y toma las cuatro
 *   opciones como positivas. Código:
 *     const dv = k.enfilacion('cabo-espartel', 'punta-malabata', 90);
 *     return [{ kind: 'signed', value: k.ctFrom(dv, 90) }];
 * 'bal-per-2025-04-d-43' (formato): es 'bal-per-2023-12-c-44' a las 12:45: sale Ra 147° y HRB 15:03, la oficial (a),
 *   pero las opciones escriben la hora como «15.03h» y el comprobador no las lee (y el Ra solo empata a con c).
 * 'bal-per-2025-09-d-45' (formato): sale Ra 174° (175° en las opciones a y d) y HRB 21:34 (oficial a, 21:33), pero las
 *   opciones escriben la hora sin separador («HRB= 2133»). Código:
 *     const s = k.fromMark('punta-europa', 180, 2, 'Situación 20:00');
 *     const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
 *     const ct = k.ct({ carta: L105, anyo: 2025, desvio: -2 });
 *     return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(20, 0), dist, 7) }];
 * 'bal-per-2025-12-a-44' (formato): sale 35° 52,4′ N 005° 52,2′ W, exactamente la oficial (c), pero las opciones
 *   escriben los minutos como «52',4». Código:
 *     const ct = k.ct({ dm: -2, desvio: -5 });
 *     const d1 = k.dv(126, ct, 'punta-malabata');
 *     const d2 = k.dv(215, ct, 'cabo-espartel');
 *     return latlon(k.fix2('punta-malabata', d1, 'cabo-espartel', d2, 'Situación 09:12'));
 *
 * — Plantilla o enunciado —
 * 'bal-per-2024-12-ce-45' (plantilla): tomando la salida en 005° 58,4′ W (el «E» del enunciado es errata), Rv = 315,8°
 *   y 23,4 M → HRB 01:25 del día siguiente, como la oficial (c); pero con Ct = −9° − 3,5° = −12,5° el Ra sale
 *   328°. La oficial (Ra 303°) solo sale sumando la Ct con el signo cambiado (315,8° − 12,5°).
 * 'bal-per-2025-04-ae-44' (plantilla): es el mismo enunciado que 'bal-per-2024-07-be-43' (Pangea): Rv = 148,4°,
 *   Gracia en Dv 106,4° y Alcázar en Dv 136,4° → 9,7 M a Cabo Trafalgar, que aquí cae en la opción c (9,8 M); la
 *   oficial es la d (10,3 M), y en 2024-07 la oficial era 10,5 M: la plantilla no es coherente entre convocatorias.
 * 'bal-per-2025-12-d-43' (plantilla): Ct = 6,5° − 2,5° = +4° → Rv 151°, Gracia en Dv 109° y Malabata en Dv 166°:
 *   10,9 M a Cabo Trafalgar (opción a, 10,8 M); la oficial es la c (9,2 M). Probando otras bandas y signos de la Ct
 *   salen 8,4, 8,3, 12,6… nunca 9,2: no hay una lectura del enunciado que lleve a la oficial.
 * 'bal-per-2025-12-b-45' (plantilla): los arcos de 5 M de Almina y 11 M de Carnero se cortan en 35° 53,9′ N
 *   005° 23,0′ W (en el mar, al W de Ceuta) y en 35° 58,6′ N 005° 14,2′ W. Con Rv = 264° − 4° = 260° y Alcázar por el
 *   través de babor (Dv 170°) salen 9,0 M → 1 h 48 min desde el primero o 3 h 22 min desde el segundo; la oficial es
 *   2 h 24 min (b), que no sale con ninguno.
 */

// Preguntas del lote que no quedan en export default (el detalle y el código, en DISCREPANCIAS).
export const documentadas = {
  'bal-per-2023-09-bf-45': { tipo: 'discrepancia', texto: "la HRB es la del corte del rumbo con la isobática de 200 m, que la carta de la app no tiene. El Ra sí sale (de 6 M al S del espigón de Barbate a Punta Malabata, Ct = −4°), pero solo con él no se distingue entre las opciones." },
  'bal-per-2023-09-c-45': { tipo: 'discrepancia', texto: "enfilación Cabo Trafalgar–Torre de Meca; la Torre de Meca no está en la carta." },
  'bal-per-2023-12-e-44': { tipo: 'discrepancia', texto: "la situación sale de la isobática de 100 m al NW del banco de Majuán (ni la isobática ni el banco están en la carta)." },
  'bal-per-2023-12-a-45': { tipo: 'discrepancia', texto: "área de refugio de peces, banco de Lajas de Conil y marca cardinal E de Barbate: nada de eso está en la carta." },
  'bal-per-2023-12-e-45': { tipo: 'discrepancia', texto: "enfilación de los cerros Gitano y Vacas y sonda de 200 m: no están en la carta." },
  'bal-per-2024-07-a-44': { tipo: 'discrepancia', texto: "igual que 'bal-per-2023-09-bf-45' (isobática de 200 m). Además, las opciones escriben la hora sin separador («HRB= 1428»)." },
  'bal-per-2024-07-c-45': { tipo: 'discrepancia', texto: "la situación de partida es el corte de la oposición Paloma–Malabata con la isobática de 100 m al N de los bancos del Fénix, que no están en la carta." },
  'bal-per-2024-09-a-42': { tipo: 'discrepancia', texto: "se pide el paso por el veril de 200 m, que la carta no tiene." },
  'bal-per-2024-09-d-42': { tipo: 'discrepancia', texto: "oposición del faro de Isla de Tarifa con la desembocadura del río El Liam, que no está en la carta." },
  'bal-per-2024-12-df-42': { tipo: 'discrepancia', texto: "la situación de partida es la oposición Trafalgar–Espartel donde la sonda marca 100 m: la carta no tiene isobáticas." },
  'bal-per-2024-12-b-44': { tipo: 'discrepancia', texto: "faro del espigón de Piedra Redonda y sonda de 500 m: no están en la carta." },
  'bal-per-2025-07-c-42': { tipo: 'discrepancia', texto: "igual que 'bal-per-2023-12-a-45' (área de refugio de peces, Lajas de Conil, marca cardinal E de Barbate y dique exterior de Cabo Roche): no están en la carta." },
  'bal-per-2025-07-a-43': { tipo: 'discrepancia', texto: "naufragio próximo a Torre Castilobo y marca cardinal N frente a Malabata: no están en la carta." },
  'bal-per-2025-07-b-43': { tipo: 'discrepancia', texto: "sonda de 500 m en la enfilación Carnero–Europa, espigón de Piedra Redonda e isobática de 50 m de la Ensenada de Ceuta: no están en la carta." },
  'bal-per-2025-07-d-43': { tipo: 'discrepancia', texto: "isobática de 30 m del banco de Trafalgar: no está en la carta." },
  'bal-per-2025-07-d-44': { tipo: 'discrepancia', texto: "la Ct solo sale de la enfilación Isla de Tarifa–monte Gitano, y el monte Gitano no está en la carta (el enunciado no da dm ni desvío)." },
  'bal-per-2025-09-d-42': { tipo: 'discrepancia', texto: "igual que 'bal-per-2023-12-e-45' (cerros Gitano y Vacas, sonda de 200 m)." },
  'bal-per-2024-09-a-43': { tipo: 'sin-calculo', texto: "las opciones son nombres de faros. Dos faros en demoras opuestas (326° y 146°) y a 6,4 M cada uno están a 12,8 M uno de otro en la línea 146°/326°: Punta Carnero → Punta Almina mide en la carta 146,6° y 12,8 M, que es la oficial (d). No hay tipo de valor para devolverlo." },
  'bal-per-2023-12-e-42': { tipo: 'discrepancia', texto: "sale HRB 12:42 (oficial b, 12:43), pero las opciones escriben la hora sin separador («HRB=1243») y el comprobador no las lee." },
  'bal-per-2023-12-c-44': { tipo: 'discrepancia', texto: "sale Ra 147° y HRB 22:18, la oficial (a), pero las opciones escriben la hora sin separador («HRB= 2218»)." },
  'bal-per-2024-07-df-44': { tipo: 'discrepancia', texto: "sale 35° 52,1′ N 005° 57,6′ W, la oficial (a), pero las opciones escriben los minutos como «52',1» y el comprobador no las lee." },
  'bal-per-2024-12-ce-43': { tipo: 'discrepancia', texto: "sale 35° 53,8′ N 006° 12,7′ W, la oficial (a), con el mismo formato «53',9»." },
  'bal-per-2025-04-ae-43': { tipo: 'discrepancia', texto: "sale HRB 09:28 (oficial b, 09:27), pero las opciones escriben la hora sin separador («HRB=0927»)." },
  'bal-per-2025-04-c-45': { tipo: 'discrepancia', texto: "la enfilación Espartel → Malabata mide 078,6° en la carta: Ct = 078,6° − 090° = −11,4°, la más próxima es la oficial (c, 10° (−)); pero el comprobador no lee el signo «(-)» y toma las cuatro opciones como positivas." },
  'bal-per-2025-04-d-43': { tipo: 'discrepancia', texto: "es 'bal-per-2023-12-c-44' a las 12:45: sale Ra 147° y HRB 15:03, la oficial (a), pero las opciones escriben la hora como «15.03h» y el comprobador no las lee (y el Ra solo empata a con c)." },
  'bal-per-2025-09-d-45': { tipo: 'discrepancia', texto: "sale Ra 174° (175° en las opciones a y d) y HRB 21:34 (oficial a, 21:33), pero las opciones escriben la hora sin separador («HRB= 2133»)." },
  'bal-per-2025-12-a-44': { tipo: 'discrepancia', texto: "sale 35° 52,4′ N 005° 52,2′ W, exactamente la oficial (c), pero las opciones escriben los minutos como «52',4»." },
  'bal-per-2024-12-ce-45': { tipo: 'discrepancia', texto: "tomando la salida en 005° 58,4′ W (el «E» del enunciado es errata), Rv = 315,8° y 23,4 M → HRB 01:25 del día siguiente, como la oficial (c); pero con Ct = −9° − 3,5° = −12,5° el Ra sale 328°. La oficial (Ra 303°) solo sale sumando la Ct con el signo cambiado (315,8° − 12,5°)." },
  'bal-per-2025-04-ae-44': { tipo: 'discrepancia', texto: "es el mismo enunciado que 'bal-per-2024-07-be-43' (Pangea): Rv = 148,4°, Gracia en Dv 106,4° y Alcázar en Dv 136,4° → 9,7 M a Cabo Trafalgar, que aquí cae en la opción c (9,8 M); la oficial es la d (10,3 M), y en 2024-07 la oficial era 10,5 M: la plantilla no es coherente entre convocatorias." },
  'bal-per-2025-12-d-43': { tipo: 'discrepancia', texto: "Ct = 6,5° − 2,5° = +4° → Rv 151°, Gracia en Dv 109° y Malabata en Dv 166°: 10,9 M a Cabo Trafalgar (opción a, 10,8 M); la oficial es la c (9,2 M). Probando otras bandas y signos de la Ct salen 8,4, 8,3, 12,6… nunca 9,2: no hay una lectura del enunciado que lleve a la oficial." },
  'bal-per-2025-12-b-45': { tipo: 'discrepancia', texto: "los arcos de 5 M de Almina y 11 M de Carnero se cortan en 35° 53,9′ N 005° 23,0′ W (en el mar, al W de Ceuta) y en 35° 58,6′ N 005° 14,2′ W. Con Rv = 264° − 4° = 260° y Alcázar por el través de babor (Dv 170°) salen 9,0 M → 1 h 48 min desde el primero o 3 h 22 min desde el segundo; la oficial es 2 h 24 min (b), que no sale con ninguno." },
};
