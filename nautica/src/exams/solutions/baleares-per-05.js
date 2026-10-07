// Soluciones programadas de carta del PER de Baleares (lote 05). Ver baleares-per.js para el formato.
// Resumen: 27 preguntas; 23 resueltas; 4 documentadas como «sin-calculo» por elementos que no están en la carta de la
// app (monte de San Bartolomé, veriles de 200 y 50 m, naufragio). Detalle en DISCREPANCIAS y en `documentadas`.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];
const N = 0; const E = 90; const S = 180; const W = 270; const SE = 135;
/** Punto medio entre dos puntos (bocana «entre puntas»). */
const medio = (a, b) => ({ lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 });

export default {
  'bal-per-2026-03-c-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 00,0 W', 'Situación 10:00');
      const ct = k.ct({ dm: 3, desvio: 5 });
      const rv = k.rv(70, ct);
      const d = k.distFor(6, hrb(11, 30) - hrb(10, 0));
      return latlon(k.run(s, rv, d, 'Situación 11:30'));
    },
  },
  'bal-per-2026-03-d-43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-europa', 'punta-almina');
      return [{ kind: 'signed', value: k.ctFrom(dv, 170) }];
    },
  },
  'bal-per-2026-03-a-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const dvEnf = k.enfilacion('punta-carnero', 'punta-europa');
      k.note('Al SE verdadero de Punta Carbonera', 'Si estamos al SE/v del faro, desde el barco el faro demora 315° (NW).');
      const s = k.lineAndBearing('punta-carnero', dvEnf, 'punta-carbonera', 315, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const t = hrb(16, 20) - hrb(15, 0);
      const vm = dist / (t / 60);
      k.note('Distancia y velocidad necesaria', `V = d / t = ${dist.toFixed(1).replace('.', ',')} M / ${(t / 60).toFixed(2).replace('.', ',')} h = ${vm.toFixed(1).replace('.', ',')} nudos.`);
      const ct = k.ct({ dm: -2, desvio: -4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vm }];
    },
  },
  'bal-per-2026-03-b-44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const dvEnf = k.enfilacion('punta-cires', 'punta-alcazar');
      const dvOp = k.oposicion('punta-carnero', 'punta-almina');
      const s = k.lineAndBearing('punta-cires', dvEnf, 'punta-almina', dvOp, 'Situación 20:00');
      // Salimos hacia el W por el centro del Estrecho: la Isla de Tarifa queda a estribor (al N).
      const rv = k.tangent(s, 'isla-tarifa', 3, 'estribor');
      k.note('Línea de posición: Punta Malabata por el través', `Navegando al ${Math.round(rv)}°, Malabata (al S) queda por babor: Dv = Rv − 90°.`);
      const p = k.corteRumbo(s, rv, 'punta-malabata', rv - 90, 'Malabata por el través');
      return [{ kind: 'distance', value: k.distanceBetween(p, 'tanger-espigon') }];
    },
  },
  'bal-per-2026-03-c-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      k.note('Punto de paso: Al S verdadero de Punta Europa', 'Si estamos al S/v del faro, desde el barco el faro demora 000°: la línea es el meridiano del faro hacia el sur.');
      const s = k.lineAndBearing('punta-europa', S, 'punta-almina', 150, 'Situación 15:00');
      const r1 = k.rhumb(s, 'punta-carnero');
      const v1 = r1.dist / 1.5;
      k.note('Distancia y velocidad hacia Punta Carnero', `Para llegar a las 16:30: V = ${r1.dist.toFixed(1).replace('.', ',')} M / 1,5 h = ${v1.toFixed(1).replace('.', ',')} nudos.`);
      const p = k.run(s, r1.rv, k.distFor(v1, 60), 'Situación 16:00');
      const r2 = k.rhumb(p, 'ceuta-bocana');
      k.note('Distancia y velocidad hacia Ceuta', `De 16:00 a 17:30 hay 1,5 h: V = ${r2.dist.toFixed(1).replace('.', ',')} M / 1,5 h = ${(r2.dist / 1.5).toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: r2.rv }, { kind: 'speed', value: r2.dist / 1.5 }];
    },
  },
  'bal-per-2026-03-a-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const dvT = k.enfilacion('cabo-roche', 'cabo-trafalgar', 330);
      const ct = k.ctFrom(dvT, 330);
      const dvP = k.dv(87, ct, 'punta-paloma');
      return latlon(k.lineAndBearing('cabo-trafalgar', dvT, 'punta-paloma', dvP));
    },
  },
  'bal-per-2026-03-d-45': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      k.note('Datos', '«Vm = 2° NW» es la declinación magnética (dm = 2° NW).');
      const ct = k.ct({ dm: -2, desvio: 6 });
      const rv = k.rv(40, ct);
      k.note('Línea de posición: Cabo Espartel por el través', 'Navegando al NE, Espartel (al W) queda por babor: marcación −90°.');
      const d1 = k.dvM(rv, -90, 'cabo-espartel');
      const d2 = k.dvM(rv, 55, 'punta-malabata');
      const s = k.fix2('cabo-espartel', d1, 'punta-malabata', d2, 'Situación 14:00');
      // Hacia el E por el sur del Estrecho: Punta Cires queda a estribor.
      const r2 = k.tangent(s, 'punta-cires', 3, 'estribor');
      const p = k.corteRumbo(s, r2, 'punta-cires', S, 'Al N/v de Punta Cires');
      const d = k.distanceBetween(s, p);
      return [{ kind: 'clock', value: k.eta(hrb(14, 0), d, 11) }];
    },
  },
  'bal-per-2026-06-c-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 40,0 W', 'Situación 11:05');
      const b = k.pos('35 50,0 N', '5 50,0 W', 'Destino');
      const { rv, dist } = k.rhumb(s, b);
      const ct = k.ct({ dm: 3, desvio: -7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(11, 5), dist, 9) }];
    },
  },
  'bal-per-2026-06-d-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2026, desvio: 23 / 60 });
      const rv = k.rv(230, ct);
      const dC = k.dvM(rv, 60, 'punta-carnero');
      const dE = k.dv(30, ct, 'punta-europa');
      const s = k.fix2('punta-carnero', dC, 'punta-europa', dE, 'Situación 08:00');
      const b = k.fromMark('isla-tarifa', S, 1, 'A 1 M al S/v de Tarifa');
      const r = k.rhumb(s, b);
      return [{ kind: 'bearing', value: k.ra(r.rv, ct) }];
    },
  },
  'bal-per-2026-06-d-43': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', W, 3, 'Salida');
      const ct = k.ct({ ct: -2 });
      const rv = k.rv(5, ct);
      const { dv } = k.bearingTo(s, 'punta-gracia');
      const m = ((dv - rv + 540) % 360) - 180;
      k.note('Línea de posición: Marcación', `M = Dv − Rv = ${dv.toFixed(0)}° − ${rv.toFixed(0)}° = ${Math.abs(m).toFixed(0)}° por ${m >= 0 ? 'estribor' : 'babor'}.`);
      return [{ kind: 'signed', value: m }];
    },
  },
  'bal-per-2026-06-a-44': {
    // Sale Rv 172° y 4,9 nudos; la oficial (a) da 170° y 5,7 nudos. Es la opción más próxima, pero la velocidad
    // oficial pide unas 14 M hasta Tánger y en la carta salen 12,3 M.
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct = k.ct({ dm: 2, desvio: -2 });
      const d1 = k.dv(10, ct, 'punta-paloma');
      const d2 = k.dv(170, ct, 'punta-malabata');
      const s = k.fix2('punta-paloma', d1, 'punta-malabata', d2, 'Situación 08:00');
      const r1 = k.rhumb(s, 'barbate-espigon');
      const v1 = r1.dist / 2.5;
      k.note('Distancia y velocidad hacia Barbate', `Para llegar a las 10:30: V = ${r1.dist.toFixed(1).replace('.', ',')} M / 2,5 h = ${v1.toFixed(1).replace('.', ',')} nudos.`);
      const p = k.run(s, r1.rv, k.distFor(v1, 60), 'Situación 09:00');
      const r2 = k.rhumb(p, 'tanger-espigon');
      k.note('Distancia y velocidad hacia Tánger', `De 09:00 a 11:30 hay 2,5 h: V = ${r2.dist.toFixed(1).replace('.', ',')} M / 2,5 h = ${(r2.dist / 2.5).toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: r2.rv }, { kind: 'speed', value: r2.dist / 2.5 }];
    },
  },
  'bal-per-2026-06-c-44': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const d1 = k.enfilacion('punta-carnero', 'punta-europa');
      const d2 = k.enfilacion('cabo-negro', 'punta-almina');
      const s = k.fix2('punta-europa', d1, 'punta-almina', d2, 'Situación');
      const ct = k.ct({ dm: -1.3, desvio: 3.2 });
      const rv = k.rv(179, ct);
      k.note('Alcance de la luz', 'La luz roja del dique de levante de Ceuta (Fl.R 5s 5M) se empieza a ver al entrar en el círculo de 5 millas con centro en ella.');
      const p = k.trasladoArco(s, rv, 'ceuta-roja', 5, rv, 0, (c) => c.sort((u, v) => k.distanceBetween(s, u) - k.distanceBetween(s, v))[0], 'Se ve la luz roja');
      return latlon(p);
    },
  },
  'bal-per-2026-06-a-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = medio(k.P('ceuta-bocana'), k.P('ceuta-roja'));
      k.note('Salida', 'Salimos de la bocana de Ceuta, entre las luces verde y roja de los diques.');
      const dvEnf = k.enfilacion('gibraltar-muelle-sur', 'punta-europa');
      const p = k.corteRumbo(s, N, 'punta-europa', dvEnf, 'En la enfilación');
      const d = k.distanceBetween(s, p);
      const t = k.eta(hrb(9, 0), d, 3.4);
      k.note('Avería', 'Sin máquina, sin arrancada y sin viento ni corriente, nos quedamos en el mismo punto 2 h 30 m: a la hora de llegada a la enfilación se le suman 2 h 30 m.');
      // Sale 14:33; la oficial da 14:26 (dentro de la tolerancia del examen).
      return [...latlon(p), { kind: 'clock', value: t + 150 }];
    },
  },
  'bal-per-2026-06-c-45': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const ct = k.ct({ carta: [6 + 20 / 60, 2012, -10], anyo: 2026, desvio: -3.5 });
      return [{ kind: 'signed', value: ct }];
    },
  },
  'bal-per-2026-06-d-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ ct: -6 });
      const d1 = k.dv(276, ct, 'isla-tarifa');
      const d2 = k.dv(22, ct, 'punta-carnero');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-carnero', d2, 'Situación 11:00'));
    },
  },
  'bal-per-2026-09-a-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const dvT = k.oposicion('punta-malabata', 'isla-tarifa');
      const ct = k.ctFrom(dvT, 37);
      const rv = k.rv(265, ct);
      const dA = k.dvM(rv, -110, 'punta-alcazar');
      return latlon(k.fix2('isla-tarifa', dvT, 'punta-alcazar', dA));
    },
  },

  'bal-per-2026-09-a-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -2 });
      const rv = k.rv(135, ct);
      const dG = k.dvM(rv, -70, 'punta-gracia');
      k.note('Punto de paso: Al S verdadero del faro de Barbate', 'Desde el barco el faro demora 000°: la línea es el meridiano del faro hacia el sur.');
      const s = k.lineAndBearing('barbate-faro', S, 'punta-gracia', dG, 'Situación 12:00');
      const { dist } = k.rhumb(s, 'tanger-espigon');
      const t = (hrb(13, 20) - hrb(12, 0)) / 60;
      const v = dist / t;
      k.note('Distancia y velocidad necesaria', `V = d / t = ${dist.toFixed(2).replace('.', ',')} M / ${t.toFixed(2).replace('.', ',')} h = ${v.toFixed(2).replace('.', ',')} nudos.`);
      return [{ kind: 'speed', value: v }];
    },
  },
  'bal-per-2026-09-a-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -1 });
      const d1 = k.dv(178, ct, 'punta-almina');
      const d2 = k.dv(288, ct, 'punta-carnero');
      return latlon(k.fix2('punta-almina', d1, 'punta-carnero', d2, 'Situación 04:40'));
    },
  },
  'bal-per-2026-09-b-44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ ct: 5 });
      const rv = k.rv(90, ct);
      const d1 = k.dvM(rv, 2, 'punta-cires');
      const d2 = k.dv(139, ct, 'punta-alcazar');
      const s = k.fix2('punta-cires', d1, 'punta-alcazar', d2);
      // Seguimos hacia el E por fuera de la costa: Punta Cires queda a estribor.
      k.tangent(s, 'punta-cires', 2.5, 'estribor');
      k.note('Rumbo verdadero', 'Las opciones solo ofrecen 085° y 095°, es decir, Ra ∓ Ct: el Rv que se pide es el que llevamos al situarnos (Rv = 095°), no el nuevo rumbo para pasar a 2,5 M de Cires (076,6°).');
      return [{ kind: 'bearing', value: rv }, ...latlon(s)];
    },
  },
  'bal-per-2026-09-c-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2012, desvio: 5 });
      const d1 = k.dv(15, ct, 'punta-europa');
      const d2 = k.dv(289, ct, 'punta-carnero');
      return latlon(k.fix2('punta-europa', d1, 'punta-carnero', d2, 'Situación 11:15'));
    },
  },

  'bal-per-2026-09-c-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: 3 });
      const rv = k.rv(250, ct);
      const d1 = k.dvM(rv, -48, 'punta-alcazar');
      const d2 = k.dvM(rv, 40, 'isla-tarifa');
      return latlon(k.fix2('punta-alcazar', d1, 'isla-tarifa', d2, 'Situación 11:30'));
    },
  },
  'bal-per-2026-09-b-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 16:00');
      const ct = k.ct({ dm: -2, desvio: 9 });
      const rv = k.rv(232, ct);
      const d = k.distFor(8, hrb(17, 30) - hrb(16, 0));
      return latlon(k.run(s, rv, d, 'Situación 17:30'));
    },
  },
  'bal-per-2026-09-b-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -5 });
      const d1 = k.dv(126, ct, 'punta-malabata');
      const d2 = k.dv(215, ct, 'cabo-espartel');
      return latlon(k.fix2('punta-malabata', d1, 'cabo-espartel', d2, 'Situación 09:12'));
    },
  },
};

/* DISCREPANCIAS
 * 'bal-per-2026-03-a-43' (elemento que no está en la carta de la app): la segunda enfilación es faro de Punta de
 *   Gracia – cima del monte de San Bartolomé (436 m), y el monte no está en la carta de la app ni el enunciado da sus
 *   coordenadas. Sin esa situación de partida no se puede trazar el Rv (Ra 118°, Ct = −2,1° + 3,6° = +1,5°) hasta el
 *   arco de 8 M de Punta Alcázar. Oficial: c (35° 57,8′ N 5° 39,2′ W).
 * 'bal-per-2026-09-d-43' (elemento que no está en la carta de la app): la situación de partida es el corte de la
 *   enfilación El Xarf – espigón de Tánger con el veril de 200 m, y las isobáticas no están en la carta de la app; la
 *   última etapa usa además la marca cardinal de Punta de San García. Oficial: a (HRB 07:56; Ra 348°).
 * 'bal-per-2026-09-d-44' (elemento que no está en la carta de la app): una de las etapas va al «naufragio más próximo
 *   a la luz de Cabo Espartel», y los naufragios no están en la carta de la app; la situación final depende de ese
 *   tramo. Oficial: c (35° 46,7′ N 6° 01,4′ W).
 * 'bal-per-2026-09-d-45' (elemento que no está en la carta de la app): la derrota sigue el veril de 50 m desde el S
 *   de Barbate hasta 6° 00′ W, y las isobáticas no están en la carta de la app; el punto de la latitud 36° 10′ N
 *   depende de ese tramo. Oficial: c (Ra 013°).
 */

// Preguntas del lote que no quedan en `export default` (detalle en el bloque DISCREPANCIAS).
export const documentadas = {
  'bal-per-2026-03-a-43': {
    tipo: 'sin-calculo',
    texto: '(elemento que no está en la carta de la app): la segunda enfilación es faro de Punta de Gracia – cima del monte de San Bartolomé (436 m), y el monte no está en la carta de la app ni el enunciado da sus coordenadas. Sin esa situación de partida no se puede trazar el Rv (Ra 118°, Ct = −2,1° + 3,6° = +1,5°) hasta el arco de 8 M de Punta Alcázar. Oficial: c (35° 57,8′ N 5° 39,2′ W).',
  },
  'bal-per-2026-09-d-43': {
    tipo: 'sin-calculo',
    texto: '(elemento que no está en la carta de la app): la situación de partida es el corte de la enfilación El Xarf – espigón de Tánger con el veril de 200 m, y las isobáticas no están en la carta de la app; la última etapa usa además la marca cardinal de Punta de San García. Oficial: a (HRB 07:56; Ra 348°).',
  },
  'bal-per-2026-09-d-44': {
    tipo: 'sin-calculo',
    texto: '(elemento que no está en la carta de la app): una de las etapas va al «naufragio más próximo a la luz de Cabo Espartel», y los naufragios no están en la carta de la app; la situación final depende de ese tramo. Oficial: c (35° 46,7′ N 6° 01,4′ W).',
  },
  'bal-per-2026-09-d-45': {
    tipo: 'sin-calculo',
    texto: '(elemento que no está en la carta de la app): la derrota sigue el veril de 50 m desde el S de Barbate hasta 6° 00′ W, y las isobáticas no están en la carta de la app; el punto de la latitud 36° 10′ N depende de ese tramo. Oficial: c (Ra 013°).',
  },
};
