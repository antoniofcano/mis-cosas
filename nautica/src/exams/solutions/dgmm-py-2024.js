// Soluciones programadas de las preguntas de carta del PY de la DGMM, convocatorias de 2024.
// Formato: el de andalucia-py-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).
import { hrb } from '../kit.js';

const L105 = [-(2 + 50 / 60), 2005, 7];
const anyo = (q) => Number(q.fecha.slice(0, 4));
const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const E = 90; const S = 180; const W = 270; const NW = 315;

export default {
  soluciones: {
    // ---- Abril 2024
    'dgmm-py-2024-04-31': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k) {
        const d = k.distFor(7, hrb(11, 40) - hrb(11));
        return latlon(k.traslado('punta-europa', 35, 'isla-tarifa', 315, 262, d, 'Situación 11:40'));
      },
    },
    'dgmm-py-2024-04-32': {
      ejercicio: 'corriente-efectiva',
      solve(k) {
        const s = k.pos('35 50,0 N', '6 01,0 W', 'Situación 07:45');
        const rv = k.rv(80, k.ct({ ct: 5 }));
        const rs = k.abatimiento(rv, 5, NW);
        const { ref, vef } = k.efectivo(rs, 5, 250, 2.5, s);
        return latlon(k.estimaEfectiva(s, ref, vef, hrb(9, 15) - hrb(7, 45), 'Situación 09:15'));
      },
    },
    'dgmm-py-2024-04-35': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k, q) {
        // De Tánger hacia el NE pasamos al E de la Isla de Tarifa, por el Estrecho: el faro queda por babor.
        const rs = k.tangent('tanger-espigon', 'isla-tarifa', 3.5, 'babor');
        const rv = k.rvConAbatimiento(rs, 5, S);
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -3.5 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-py-2024-04-36': {
      ejercicio: 'corriente-desconocida',
      solve(k) {
        const ct = k.ct({ dm: 3, desvio: 2 });
        const s = k.fix2('punta-europa', k.dv(315, ct, 'punta-europa'), 'punta-almina', k.dv(216, ct, 'punta-almina'), 'Situación 09:00');
        const rv = k.rv(254, ct);
        const t = hrb(9, 30) - hrb(9);
        const e = k.run(s, rv, k.distFor(7, t), 'Situación de estima 09:30');
        const o = k.fix2('punta-carnero', 315, 'punta-cires', 245, 'Situación verdadera 09:30');
        const { rc, ic } = k.corrienteDesconocida(e, o, t);
        return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
      },
    },
    'dgmm-py-2024-04-37': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k, q) {
        const s = k.pos('36 05,0 N', '6 01,0 W', 'Situación 12:30');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 1.6 });
        const rv = k.rv(94, ct);
        const rs = k.abatimiento(rv, 3, N);
        const { vb } = k.rumboYVelocidad(s, 'isla-tarifa', hrb(16, 30) - hrb(12, 30), 112.5, 1.8);
        k.note('Comprobación', `El Rs que sale del triángulo es prácticamente el que llevamos (${Math.round(rs)}°): con esa proa basta ajustar la velocidad de máquinas.`);
        return [{ kind: 'speed', value: vb }];
      },
    },
    'dgmm-py-2024-04-38': {
      ejercicio: 'corriente-efectiva',
      solve(k, q) {
        const s = k.pos('35 51,0 N', '6 14,0 W', 'Situación 08:15');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 1.6 });
        const rv = k.rv(99, ct);
        k.note('Rumbo de superficie', 'Sin viento no hay abatimiento: Rs = Rv.');
        const { ref, vef } = k.efectivo(rv, 4, 22.5, 2.6, s);
        return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2024-04-40': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const dv = k.oposicion('punta-gracia', 'cabo-espartel');
        return latlon(k.lineAndBearing('cabo-espartel', dv, 'punta-malabata', 96));
      },
    },

    // ---- Noviembre 2024
    'dgmm-py-2024-11-31': {
      sinCarta: true,
      ejercicio: 'estima-analitica',
      solve(k) {
        const a = k.pos('35 40,0 N', '6 25,0 W', 'Punto A');
        const b = k.pos('34 40,0 N', '5 25,0 W', 'Punto B');
        const { rumbo, dist } = k.rumboDirecto(a, b);
        return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
      },
    },
    'dgmm-py-2024-11-32': {
      ejercicio: 'corriente-efectiva',
      solve(k) {
        const ct = k.ct({ ct: -3 });
        const s = k.fix2('cabo-espartel', k.dv(204, ct, 'cabo-espartel'), 'punta-malabata', k.dv(133, ct, 'punta-malabata'), 'Situación 18:00');
        const rv = k.rv(284, ct);
        const rs = k.abatimiento(rv, 3, NW);
        const { ref, vef } = k.efectivo(rs, 5, S, 3, s);
        return latlon(k.estimaEfectiva(s, ref, vef, hrb(20, 15) - hrb(18), 'Situación 20:15'));
      },
    },
    'dgmm-py-2024-11-33': {
      ejercicio: 'corriente-desconocida',
      solve(k, q) {
        const s = k.pos('35 55,0 N', '5 46,0 W', 'Situación 08:15');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -1.5 });
        const rv = k.rv(95, ct);
        const t = hrb(9, 45) - hrb(8, 15);
        const e = k.run(s, rv, k.distFor(4, t), 'Situación de estima 09:45');
        const o = k.fix2('isla-tarifa', k.dv(35, ct, 'isla-tarifa'), 'punta-alcazar', k.dv(140, ct, 'punta-alcazar'), 'Situación verdadera 09:45');
        const { rc, ic } = k.corrienteDesconocida(e, o, t);
        return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
      },
    },
    'dgmm-py-2024-11-34': {
      ejercicio: 'corriente-efectiva',
      solve(k, q) {
        const s = k.pos('35 51,0 N', '6 08,0 W', 'Situación 12:40');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 3 });
        const rv = k.rv(85, ct);
        k.note('Rumbo de superficie', 'Sin viento no hay abatimiento: Rs = Rv.');
        const { ref, vef } = k.efectivo(rv, 9, 30, 3, s);
        return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2024-11-37': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const dv = k.oposicion('punta-carnero', 'punta-europa');
        return latlon(k.lineAndBearing('punta-europa', dv, 'punta-almina', 160));
      },
    },
    'dgmm-py-2024-11-38': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        return latlon(k.fixBearingRange('cabo-espartel', 170, 'cabo-trafalgar', 2, 0));
      },
    },
    'dgmm-py-2024-11-39': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k, q) {
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -2 });
        const rv = k.rv(185, ct);
        const d1 = k.dv(310, ct, 'punta-carnero');
        const d2 = k.dv(195, ct, 'punta-almina');
        const d = k.distFor(6, hrb(8, 15) - hrb(7, 45));
        return latlon(k.traslado('punta-carnero', d1, 'punta-almina', d2, rv, d, 'Situación 08:15'));
      },
    },
  },
  documentadas: {
    'dgmm-py-2024-11-40': {
      tipo: 'discrepancia',
      texto: 'Falta un dato: la situación de la «marca cardinal norte próxima a Punta Malabata». No está entre los puntos de '
        + 'la carta de la app ni la da ningún enunciado o solución oficial de la DGMM (en dgmm-per-2022-10-89 solo se sabe '
        + 'que está en la oposición con Punta de Gracia, Dv ≈ 172° desde ella). Cualquier punto de esa línea frente a '
        + 'Malabata da un Ra de 334°–337° (Ct = −0,62° + 0,6° ≈ 0°, viento del W por babor que hay que compensar 4°), '
        + 'entre las opciones b (333°) y d (335°, la oficial); en ≈ 35° 49,6′ N 5° 45,5′ W sale la d. Sin la posición de '
        + 'la marca en la carta L105 no se puede distinguir con honradez entre b y d: no se programa.',
    },
  },
};
