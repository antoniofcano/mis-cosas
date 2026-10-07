// Soluciones programadas de las preguntas de carta del PY de la DGMM, convocatorias de 2025.
// Formato: el de andalucia-py-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).
import { hrb } from '../kit.js';

const L105 = [-(2 + 50 / 60), 2005, 7];
const anyo = (q) => Number(q.fecha.slice(0, 4));
const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const NE = 45; const E = 90; const S = 180; const SW = 225; const W = 270; const NW = 315;

export default {
  soluciones: {
    // ---- Abril 2025
    'dgmm-py-2025-04-31': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k) {
        const s = k.fromMark('cabo-trafalgar', W, 3, 'Situación 14:00');
        const rv1 = k.rv(240, k.ct({ dm: -2, desvio: -2 }));
        const rs1 = k.abatimiento(rv1, 10, N);
        const p1 = k.run(s, rs1, 10, 'Situación 15:00');
        // Rumbo a Espartel con corriente y viento: el Ref es el de la recta a Espartel.
        const { rs, vef, ref } = k.rumboConCorriente(p1, 'cabo-espartel', 10, E, 3);
        k.rvConAbatimiento(rs, 15, W);
        const p2 = k.estimaEfectiva(p1, ref, vef, 30, 'Situación 15:30');
        const rv3 = k.rv(60, k.ct({ dm: -2, desvio: 10 }));
        k.note('Rumbo de superficie', 'Cesan el viento y la corriente: Rs = Rv.');
        return latlon(k.run(p2, rv3, k.distFor(10, hrb(17) - hrb(15, 30)), 'Situación 17:00'));
      },
    },
    'dgmm-py-2025-04-32': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        // En la enfilación Roche–Trafalgar por fuera de Trafalgar, hacia el SE: vemos Trafalgar con Roche detrás.
        const dv = k.enfilacion('cabo-roche', 'cabo-trafalgar', NW);
        return latlon(k.lineAndBearing('cabo-trafalgar', dv, 'punta-gracia', 26));
      },
    },
    'dgmm-py-2025-04-33': {
      ejercicio: 'estima-analitica',
      solve(k) {
        const s = k.pos('36 00,0 N', '6 10,0 W', 'Salida');
        return latlon(k.tramos(s, [{ rumbo: 278, millas: 40 }], 'Situación de llegada'));
      },
    },
    'dgmm-py-2025-04-35': {
      ejercicio: 'corriente-efectiva',
      solve(k) {
        const s = k.fromMark('punta-almina', N, 4, 'Situación 08:30');
        const rv = k.rv(275, k.ct({ dm: -1, desvio: 3 }));
        k.note('Rumbo de superficie', 'Sin viento no hay abatimiento: Rs = Rv.');
        const { ref, vef } = k.efectivo(rv, 6, NE, 2, s);
        return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2025-04-37': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k, q) {
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 1.5 });
        const rv = k.rv(279, ct);
        const d1 = k.dv(115, ct, 'punta-malabata');
        const d2 = k.dv(220, ct, 'cabo-espartel');
        const d = k.distFor(9, hrb(12, 50) - hrb(12, 30));
        return latlon(k.traslado('punta-malabata', d1, 'cabo-espartel', d2, rv, d, 'Situación 12:50'));
      },
    },
    'dgmm-py-2025-04-38': {
      ejercicio: 'rumbo-distancia',
      solve(k, q) {
        const { rv: rs } = k.rhumb('tanger-espigon', 'isla-tarifa', 'Rumbo a la Isla de Tarifa');
        const rv = k.rvConAbatimiento(rs, 5, E);
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 2 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    // 04-39: ver documentadas (discrepancia).
    'dgmm-py-2025-04-40': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        const dv = k.oposicion('cabo-trafalgar', 'punta-gracia');
        return latlon(k.fixDist('punta-gracia', dv, 4));
      },
    },

    // ---- Noviembre 2025
    'dgmm-py-2025-11-32': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        return latlon(k.fix2('punta-paloma', 22, 'cabo-trafalgar', 335));
      },
    },
    'dgmm-py-2025-11-35': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k, q) {
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 1.5 });
        const rv = k.rv(151, ct);
        const dv = k.dv(34, ct, 'cabo-roche');
        const d = k.distFor(8, hrb(10, 50) - hrb(10, 30));
        // De los dos cortes del arco con la demora trasladada, el del NW, en el mar.
        return latlon(k.trasladoArco('cabo-roche', dv, 'cabo-trafalgar', 7, rv, d, (c) => c.sort((a, b) => a.lon - b.lon)[0], 'Situación 10:50'));
      },
    },
    'dgmm-py-2025-11-36': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k) {
        const s = k.fromMark('cabo-roche', W, 2, 'Situación 12:00');
        const rv1 = k.rv(230, k.ct({ dm: -2, desvio: -3 }));
        const rs1 = k.abatimiento(rv1, 8, N);
        const p1 = k.run(s, rs1, 10, 'Situación 13:00');
        // Rumbo a Espartel con corriente y viento: el Ref es el de la recta a Espartel.
        const { rs, vef, ref } = k.rumboConCorriente(p1, 'cabo-espartel', 10, E, 2);
        const rv2 = k.rvConAbatimiento(rs, 10, W);
        const ra = k.ra(rv2, k.ct({ dm: -2, desvio: -1 }));
        const p2 = k.estimaEfectiva(p1, ref, vef, hrb(15) - hrb(13), 'Situación 15:00');
        const rv3 = k.rv(82, k.ct({ dm: -2, desvio: 10 }));
        k.note('Rumbo de superficie', 'Cesan el viento y la corriente: Rs = Rv.');
        const p3 = k.run(p2, rv3, k.distFor(10, hrb(16) - hrb(15)), 'Situación 16:00');
        return [{ kind: 'bearing', value: ra }, ...latlon(p3)];
      },
    },
    'dgmm-py-2025-11-37': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        const dv = k.oposicion('punta-paloma', 'punta-malabata');
        return latlon(k.fixBearingRange('punta-malabata', dv, 'tanger-espigon', 5.5, 0));
      },
    },
    'dgmm-py-2025-11-38': {
      ejercicio: 'corriente-efectiva',
      solve(k) {
        const s = k.fromMark('cabo-espartel', NW, 5, 'Situación 11:00');
        const rv = k.rv(60, k.ct({ dm: -2, desvio: 2 }));
        k.note('Rumbo de superficie', 'Sin viento no hay abatimiento: Rs = Rv.');
        const { ref, vef } = k.efectivo(rv, 12, NE, 3, s);
        return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2025-11-39': {
      ejercicio: 'corriente-desconocida',
      solve(k) {
        const s = k.fromMark('isla-tarifa', S, 5, 'Situación 15:00');
        const rv = k.rv(71, k.ct({ dm: -2, desvio: 1 }));
        k.note('Rumbo de superficie', 'Viento en calma: Rs = Rv.');
        const t = hrb(16) - hrb(15);
        const e = k.run(s, rv, k.distFor(6, t), 'Situación de estima 16:00');
        const dv = k.oposicion('punta-cires', 'punta-carnero');
        const o = k.fixDist('punta-carnero', dv, 6.6, 'Situación verdadera 16:00');
        const { rc, ic } = k.corrienteDesconocida(e, o, t);
        return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
      },
    },
    'dgmm-py-2025-11-40': {
      ejercicio: 'rumbo-distancia',
      solve(k, q) {
        const { rv: rs } = k.rhumb('barbate-espigon', 'cabo-espartel', 'Rumbo a Cabo Espartel');
        const rv = k.rvConAbatimiento(rs, 2, W);
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 2.5 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
  },
  documentadas: {
    'dgmm-py-2025-04-39': {
      tipo: 'discrepancia',
      texto: 'Corriente desconocida. Salida 3 millas al SW de Tarifa (35° 58,0′ N 5° 39,1′ W); Ct = −0,50° − 1,5° = −2°, '
        + 'Rv 103°, 8 nudos durante 45 min: estima 12:15 en 35° 56,6′ N 5° 31,9′ W. Con las Dv 169° (Cires) y 025° '
        + '(Carnero) la verdadera es 35° 57,6′ N 5° 29,6′ W: Rc 064°, 2,07 millas en 0,75 h → Ihc 2,76 nudos. Lo más '
        + 'próximo es la oficial (d: 065°, 2,9 nudos), pero la a (065°, 2,2 nudos) queda casi tan cerca: el cálculo no '
        + 'separa con claridad la d de la a (la intensidad cae entre las dos, más cerca de la oficial). El tribunal debió '
        + 'medir algo más de deriva en la carta.',
    },
  },
};
