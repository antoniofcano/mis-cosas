// Soluciones programadas de las preguntas de carta del PER de la DGMM, convocatorias de 2020.
// Formato: el de andalucia-per-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];

export default {
  soluciones: {
    // ---- Diciembre 2020
    'dgmm-per-2020-12-132': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        // «Faro de Punta Tarifa»: el faro de Isla de Tarifa.
        const { rv } = k.rhumb('isla-tarifa', 'punta-cires');
        const ct = k.ct({ dm: -4, desvio: -3 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2020-12-42': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const ct = k.ct({ ct: -4 });
        const rv = k.rv(81, ct);
        const d1 = k.dvM(rv, 4, 'punta-cires');
        // Navegando hacia el ENE, Isla de Tarifa (al N) queda por el través de babor.
        const d2 = k.dvM(rv, -90, 'isla-tarifa');
        return latlon(k.fix2('punta-cires', d1, 'isla-tarifa', d2, 'Situación 13:00'));
      },
    },
    'dgmm-per-2020-12-87': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k) {
        // Saliendo de Ceuta hacia el N, dejar Punta Europa «a poniente» (al W) es dejarla por babor.
        const rv = k.tangent('ceuta-roja', 'punta-europa', 5.2, 'babor');
        const ct = k.ct({ carta: L105, anyo: 2008, desvio: 1.5 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2020-12-133': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const ct = k.ct({ ct: -6 });
        const d1 = k.dv(276, ct, 'isla-tarifa');
        const d2 = k.dv(22, ct, 'punta-carnero');
        return latlon(k.fix2('isla-tarifa', d1, 'punta-carnero', d2, 'Situación 11:00'));
      },
    },
    'dgmm-per-2020-12-43': {
      ejercicio: 'estima-directa',
      solve(k) {
        const dv = k.oposicion('cabo-espartel', 'punta-gracia');
        const s = k.fixDist('punta-gracia', dv, 6, 'Situación 06:06');
        const ct = k.ct({ ct: -6 });
        const rv = k.rv(252.5, ct);
        const d = k.distFor(7, hrb(8, 30) - hrb(6, 6));
        return latlon(k.run(s, rv, d, 'Situación 08:30'));
      },
    },
    'dgmm-per-2020-12-179': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const s = k.fix2('punta-alcazar', 205, 'punta-cires', 154, 'Situación 04:12');
        const { rv, dist } = k.rhumb(s, 'tarifa-espigon');
        const ct = k.ct({ ct: -2.5 });
        const ra = k.ra(rv, ct);
        // La HRB sale 04:53 (la de c), pero las opciones la escriben sin separador («HRB=0453») y el lector de opciones
        // no la reconoce como hora: comparamos solo el Ra, que ya distingue la c (309°) de las demás.
        k.eta(hrb(4, 12), dist, 8.6);
        return [{ kind: 'bearing', value: ra }];
      },
    },
    'dgmm-per-2020-12-44': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        const dv = k.oposicion('punta-almina', 'cabo-negro');
        return latlon(k.fixDist('cabo-negro', dv, 4.8));
      },
    },
    'dgmm-per-2020-12-135': {
      ejercicio: 'estima-directa',
      solve(k) {
        const dv = k.oposicion('cabo-espartel', 'cabo-roche');
        const s = k.fixDist('cabo-roche', dv, 22.6, 'Situación 22:05');
        const { rv } = k.rhumb(s, 'punta-alcazar');
        k.note('Rumbo verdadero', 'Sin datos de aguja: navegamos al Rv que sale de la carta.');
        const d = k.distFor(4, hrb(23, 35) - hrb(22, 5));
        return latlon(k.run(s, rv, d, 'Situación 23:35'));
      },
    },
    'dgmm-per-2020-12-180': {
      ejercicio: 'ct-enfilacion',
      solve(k) {
        const dv = k.oposicion('punta-alcazar', 'punta-paloma');
        return [{ kind: 'signed', value: k.ctFrom(dv, 329) }];
      },
    },
    'dgmm-per-2020-12-45': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const s = k.fixDist('punta-carnero', 283, 3.2, 'Situación de salida');
        const { rv } = k.rhumb(s, 'algeciras-espigon');
        const ct = k.ct({ ct: -2 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2020-12-90': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        k.note('Rumbo verdadero', 'Rv = S 32° E = 180° − 32° = 148°.');
        const d1 = k.dvM(148, -30, 'punta-alcazar');
        const d2 = k.dvM(148, 65, 'punta-malabata');
        return latlon(k.fix2('punta-alcazar', d1, 'punta-malabata', d2));
      },
    },
  },
  documentadas: {
    'dgmm-per-2020-12-177': {
      tipo: 'discrepancia',
      texto: 'En la oposición Punta Europa–Punta Carnero la demora verdadera a Carnero es la de la recta Europa → Carnero, que en la carta sale 243,5°. Ct = Dv − Da = 243,5° − 250° = −6,5°. La oficial es a, «5º» sin signo, frente a b «5º+»: el tribunal toma la Ct negativa (como 5° (−)) y mide la recta como 245°. El sentido (negativa) coincide; el valor difiere 1,5° y la opción, escrita sin signo, se lee como +5°, así que la comparación automática no puede llegar a ella. Lo mismo pasa en dgmm-per-2021-02-44 con Da = 255° (sale −11,5°, oficial «10º»).',
    },
    'dgmm-per-2020-12-88': {
      tipo: 'sin-calculo',
      texto: 'La situación sale de cortar el arco de 2,2 millas del faro del dique de Tánger con la línea isobática de 50 m, comprobando que se ve el sector blanco de El Xarf. Ni la isóbata ni los sectores de la luz de El Xarf están en los datos de la carta de la app: se resuelve leyendo la carta. La oficial (b, 35°49,6′ N 5°46,5′ W) queda a 2,25 millas del dique de Tánger, al 010° del faro de El Xarf.',
    },
  },
};
