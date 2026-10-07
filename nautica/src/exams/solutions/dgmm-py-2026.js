// Soluciones programadas de las preguntas de carta del PY de la DGMM, convocatorias de 2026.
// Formato: el de andalucia-py-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).
import { hrb } from '../kit.js';

const L105 = [-(2 + 50 / 60), 2005, 7];
const anyo = (q) => Number(q.fecha.slice(0, 4));
const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const E = 90; const S = 180; const SE = 135; const SW = 225; const W = 270;

export default {
  soluciones: {
    // ---- Abril 2026
    'dgmm-py-2026-04-31': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k, q) {
        // De Tarifa hacia el E pasamos por el N de Almina: el faro queda por estribor.
        const rs = k.tangent('isla-tarifa', 'punta-almina', 3, 'estribor');
        const rv = k.rvConAbatimiento(rs, 4.5, S);
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -1.6 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-py-2026-04-33': {
      ejercicio: 'corriente-desconocida',
      solve(k, q) {
        const s = k.fromMark('punta-gracia', SW, 6, 'Situación 10:00');
        // Hacia el NW, por fuera de Trafalgar: el faro queda por estribor.
        const rv = k.tangent(s, 'cabo-trafalgar', 5, 'estribor');
        k.note('Rumbo de superficie', 'Viento en calma: Rs = Rv.');
        const t = hrb(11) - hrb(10);
        const e = k.run(s, rv, k.distFor(10, t), 'Situación de estima 11:00');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 0.4 });
        const o = k.fixDist('cabo-trafalgar', k.dv(35, ct, 'cabo-trafalgar'), 3, 'Situación verdadera 11:00');
        const { rc, ic } = k.corrienteDesconocida(e, o, t);
        return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
      },
    },
    'dgmm-py-2026-04-34': {
      ejercicio: 'estima-analitica',
      solve(k) {
        const s = k.pos('36 00,0 N', '5 30,0 W', 'Salida');
        return latlon(k.tramos(s, [{ rumbo: 90, millas: 100 }], 'Situación de llegada'));
      },
    },
    'dgmm-py-2026-04-35': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k) {
        // «Faro de Torre de Gracia»: el faro de Punta de Gracia (Camarinal).
        const s = k.fromMark('punta-gracia', W, 5, 'Situación 15:00');
        const rv1 = k.rv(220, k.ct({ dm: -2, desvio: -3 }));
        const rs1 = k.abatimiento(rv1, 10, N);
        const p1 = k.run(s, rs1, 10, 'Situación 16:00');
        // Rumbo a Malabata con corriente y viento: el Ref es el de la recta a Malabata.
        const { rs, vef, ref } = k.rumboConCorriente(p1, 'punta-malabata', 10, E, 2);
        const rv2 = k.rvConAbatimiento(rs, 10, W);
        const ra = k.ra(rv2, k.ct({ dm: -2, desvio: -1 }));
        const p2 = k.estimaEfectiva(p1, ref, vef, hrb(16, 30) - hrb(16), 'Situación 16:30');
        const rv3 = k.rv(175, k.ct({ dm: -2, desvio: 7 }));
        k.note('Rumbo de superficie', 'Cesan el viento y la corriente: Rs = Rv.');
        const p3 = k.run(p2, rv3, k.distFor(10, hrb(16, 42) - hrb(16, 30)), 'Situación 16:42');
        return [{ kind: 'bearing', value: ra }, ...latlon(p3)];
      },
    },
    'dgmm-py-2026-04-36': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const dv = k.oposicion('cabo-trafalgar', 'cabo-espartel');
        return latlon(k.lineAndBearing('cabo-espartel', dv, 'barbate-espigon', 40));
      },
    },
    'dgmm-py-2026-04-37': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k) {
        const ct = k.ct({ dm: -1, desvio: 2 });
        const rv = k.rv(251, ct);
        const dv = k.dv(159, ct, 'punta-cires');
        const d = k.distFor(12, hrb(11, 20) - hrb(11));
        // De los dos cortes del arco con la demora trasladada, el del S de Tarifa, en el mar.
        return latlon(k.trasladoArco('punta-cires', dv, 'isla-tarifa', 3, rv, d, (c) => c.sort((a, b) => a.lat - b.lat)[0], 'Situación 11:20'));
      },
    },
    'dgmm-py-2026-04-38': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k) {
        const s = k.fromMark('punta-europa', SE, 5, 'Situación 15:00');
        // Hacia el WSW pasamos por el N de Cires: el faro queda por babor. Ese es el rumbo efectivo que queremos.
        const ref = k.tangent(s, 'punta-cires', 4, 'babor');
        const { rs, vef } = k.rumboConCorriente(s, ref, 8, 39, 2);
        k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
        const ct = k.ct({ dm: -3, desvio: 2 });
        return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2026-04-39': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        // En la enfilación Carnero–Europa por fuera de Europa, hacia el ENE: vemos Europa con Carnero detrás.
        const dv = k.enfilacion('punta-carnero', 'punta-europa', SW);
        return latlon(k.lineAndBearing('punta-europa', dv, 'punta-almina', 194));
      },
    },
  },
  documentadas: {},
};
