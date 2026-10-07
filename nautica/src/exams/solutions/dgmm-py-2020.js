// Soluciones programadas de las preguntas de carta del PY de la DGMM, convocatorias de 2020.
// Formato: el de andalucia-py-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).
import { hrb } from '../kit.js';
import { norm360 } from '../../math/angles.js';
import { fmtBearing, fmtSignedNum } from '../../math/format.js';

const L105 = [-(2 + 50 / 60), 2005, 7];
const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const E = 90; const W = 270;

export default {
  soluciones: {
    // ---- Diciembre 2020
    'dgmm-py-2020-12-31': {
      ejercicio: 'abatimiento',
      solve(k) {
        const { rv: rs } = k.rhumb('algeciras-espigon', 'punta-almina', 'Rumbo y distancia a Punta Almina');
        k.note('Rumbo de superficie', `Para llegar a Punta Almina el barco tiene que avanzar sobre el agua por esa recta: Rs = ${fmtBearing(rs)}.`);
        const rv = k.rvConAbatimiento(rs, 4, E);
        // «La declinación de la carta para el año 2020».
        const ct = k.ct({ carta: L105, anyo: 2020, desvio: -5 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-py-2020-12-34': {
      ejercicio: 'estima-analitica',
      solve(k) {
        // La llegada cae fuera de la carta L105: rumbo y distancia por latitud media.
        const a = k.pos('36 05,0 N', '6 15,0 W', 'Salida');
        const b = k.pos('34 32,0 N', '9 46,0 W', 'Llegada');
        const { rumbo, dist } = k.rumboDirecto(a, b);
        return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
      },
    },
    // 12-35: anulada.
    'dgmm-py-2020-12-36': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k) {
        // Las opciones escriben los minutos con el decimal tras el apóstrofo: «59'5» = 59,5′.
        const d = k.distFor(10, hrb(3) - hrb(2, 30));
        return latlon(k.traslado('punta-carnero', 321, 'punta-carnero', 20, 258, d, 'Situación 03:00'));
      },
    },
    'dgmm-py-2020-12-37': {
      ejercicio: 'corriente-desconocida',
      solve(k) {
        const s = k.fromMark('cabo-espartel', W, 7, 'Situación 17:42');
        const rv = k.rv(30, -5);
        const t = hrb(19, 2) - hrb(17, 42);
        const e = k.run(s, rv, k.distFor(12, t), 'Situación de estima 19:02');
        const dv = k.oposicion('punta-gracia', 'cabo-espartel');
        // El arco de Paloma corta la recta dos veces: nos quedamos con el corte entre los dos faros (el otro cae en tierra, al N).
        const o = k.fixBearingRange('cabo-espartel', dv, 'punta-paloma', 9.4, 0, 'Situación verdadera 19:02');
        const { rc, ic } = k.corrienteDesconocida(e, o, t);
        return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
      },
    },
    'dgmm-py-2020-12-39': {
      ejercicio: 'ct-enfilacion',
      solve(k) {
        const dv = k.oposicion('punta-carnero', 'punta-cires');
        // Cires queda al S y vamos hacia el W: la marcación es por babor (por estribor daría un Rv de 146°, absurdo con Ra 250°).
        const rv = norm360(dv + 49);
        k.note('Rumbo verdadero', `Cires queda por babor: Dv = Rv − M, luego Rv = Dv + M = ${fmtBearing(dv, 1)} + 049° = ${fmtBearing(rv, 1)}.`);
        const ct = rv - 250;
        k.note('Corrección total', `Ct = Rv − Ra = ${fmtBearing(rv, 1)} − 250° = ${fmtSignedNum(ct, 1)}.`);
        return [{ kind: 'signed', value: ct }];
      },
    },
    'dgmm-py-2020-12-40': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k) {
        const dv = k.oposicion('punta-malabata', 'punta-paloma');
        const s = k.fixDist('punta-paloma', dv, 6.4, 'Salida');
        // Hacia el W, saliendo del Estrecho: Espartel queda a nuestra izquierda, por babor.
        const ref = k.tangent(s, 'cabo-espartel', 7.1, 'babor');
        const { rs, vef } = k.rumboConCorriente(s, ref, 11.2, 200, 3.5);
        k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
        return [{ kind: 'bearing', value: k.ra(rs, 3.5) }, { kind: 'speed', value: vef }];
      },
    },
  },
  documentadas: {
  },
};
