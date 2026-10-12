// Soluciones programadas de las preguntas de carta del PY de la DGMM, convocatorias de 2021.
// Formato: el de andalucia-py-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).
import { hrb } from '../kit.js';
import { norm360 } from '../../math/angles.js';
import { rhumbDestination } from '../../math/mercator.js';
import { fmtBearing, fmtPos, fmtMiles } from '../../math/format.js';

const L105 = [-(2 + 50 / 60), 2005, 7];
const anyo = (q) => Number(q.fecha.slice(0, 4));
const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const NNE = 22.5; const NE = 45; const SE = 135; const S = 180; const SSW = 202.5; const SW = 225; const W = 270;

export default {
  soluciones: {
    // ---- Febrero 2021
    'dgmm-py-2021-02-31': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        return latlon(k.fix2('cabo-espartel', 208, 'punta-malabata', 136));
      },
    },
    'dgmm-py-2021-02-32': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k) {
        const rv = k.rv(284.5, 4);
        const d1 = k.dv(350, 4, 'punta-gracia');
        const d2 = k.dv(60, 4, 'punta-gracia');
        const d = k.distFor(7, hrb(12, 36) - hrb(11, 12));
        return latlon(k.traslado('punta-gracia', d1, 'punta-gracia', d2, rv, d, 'Situación 12:36'));
      },
    },
    'dgmm-py-2021-02-33': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k) {
        const d = k.distFor(8, hrb(16, 36) - hrb(16, 6));
        return latlon(k.traslado('punta-europa', 20, 'punta-almina', 175, 72, d, 'Situación 16:36'));
      },
    },
    'dgmm-py-2021-02-34': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k) {
        const s = k.fixDist('cabo-trafalgar', 340, 3, 'Salida');
        // Hacia el SE: el faro de Gracia queda a nuestra izquierda, por babor.
        const rs = k.tangent(s, 'punta-gracia', 6.1, 'babor');
        const rv = k.rvConAbatimiento(rs, 4, NE);
        // «La declinación de la carta para 2021».
        const ct = k.ct({ carta: L105, anyo: 2021, desvio: -2 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-py-2021-02-36': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const a = k.pos('36 05,0 N', '6 15,0 W', 'Salida');
        const b = k.pos('35 53,4 N', '5 52,0 W', 'Llegada');
        const { rv, dist } = k.rhumb(a, b);
        return [{ kind: 'bearing', value: rv }, { kind: 'distance', value: dist }];
      },
    },
    'dgmm-py-2021-02-37': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k) {
        // De los dos cortes de los arcos, el del mar (al S de la costa).
        const s = k.fix2Ranges('cabo-trafalgar', 5, 'punta-gracia', 9.2, { lat: 36.05, lon: -6.0 }, 'Salida');
        const { rs, vef } = k.rumboConCorriente(s, 'cabo-espartel', 8, 130, 3);
        k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
        return [{ kind: 'bearing', value: k.ra(rs, -4) }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2021-02-38': {
      ejercicio: 'corriente-efectiva',
      solve(k) {
        const s = k.pos('35 45,2 N', '6 00,5 W', 'Situación 11:06');
        const rv = k.rv(300, -3);
        const rs = k.abatimiento(rv, 4, W);
        const { ref, vef } = k.efectivo(rs, 6, 45, 2.5, s);
        return latlon(k.estimaEfectiva(s, ref, vef, hrb(13, 6) - hrb(11, 6), 'Situación 13:06'));
      },
    },
    'dgmm-py-2021-02-40': {
      ejercicio: 'corriente-desconocida',
      solve(k) {
        const t = hrb(17, 30) - hrb(16);
        const e = k.run(k.P('tanger-espigon'), 350, k.distFor(7, t), 'Situación de estima 17:30');
        // De los dos cortes de los arcos, el del mar (al S de los faros).
        const o = k.fix2Ranges('punta-gracia', 6.1, 'punta-paloma', 4.2, { lat: 36.0, lon: -5.75 }, 'Situación verdadera 17:30');
        const { rc, ic } = k.corrienteDesconocida(e, o, t);
        return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
      },
    },

    // ---- Julio 2021
    'dgmm-py-2021-07-31': {
      ejercicio: 'ct-enfilacion',
      solve(k) {
        // La declinación y la distancia a Gracia no intervienen: la Ct sale de la Dv de la oposición y la Da.
        const dv = k.oposicion('punta-gracia', 'cabo-trafalgar');
        k.note('Demora de aguja', 'Da = N63W = 360° − 63° = 297°.');
        return [{ kind: 'signed', value: k.ctFrom(dv, 297) }];
      },
    },
    // 07-32: ver documentadas (sale Ra 318°; la oficial es 322°).
    'dgmm-py-2021-07-33': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const rv = k.rv(64, 0);
        const dvA = k.dvM(rv, 74, 'punta-almina');
        k.note('Demora verdadera del través', 'Carnero queda al N, a nuestra izquierda: lo tenemos por el través de babor. El través se mide desde la proa, es decir, desde el Rv: Dv = Rv − 90° = 064° − 90° = 334°.');
        return latlon(k.fix2('punta-almina', dvA, 'punta-carnero', 334, 'Situación 06:00'));
      },
    },
    'dgmm-py-2021-07-34': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k) {
        k.note('Datos', 'Las demoras y el rumbo ya son verdaderos: la demora de aguja de la Polar (que daría la Ct) no hace falta.');
        const d = k.distFor(6, hrb(0, 54) - hrb(0, 12));
        // La 1ª línea de posición es el arco de 4,4 millas de Malabata: se traslada su centro lo navegado.
        const c = { name: 'Malabata trasladado', ...rhumbDestination(k.P('punta-malabata'), 90, d) };
        k.note('Traslado de la 1ª línea', `La 1ª línea de posición es el arco de 4,4 millas con centro en Malabata. Trasladamos su centro lo navegado entre las dos observaciones, 090° y ${fmtMiles(d)}: nuevo centro en ${fmtPos(c)}.`);
        // La demora 231° de Malabata corta el arco trasladado en dos puntos: el más cercano a Malabata.
        return latlon(k.fixBearingRange('punta-malabata', 231, c, 4.4, 0, 'Situación 00:54'));
      },
    },
    'dgmm-py-2021-07-37': {
      ejercicio: 'corriente-desconocida',
      solve(k, q) {
        const s = k.pos('36 00,0 N', '6 10,0 W', 'Situación 10:00');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -3 });
        const rv = k.rv(86, ct);
        const t = hrb(11) - hrb(10);
        const e = k.run(s, rv, k.distFor(10, t), 'Situación de estima 11:00');
        // El faro de Camarinal es el de Punta de Gracia.
        const dG = k.dv(55, ct, 'punta-gracia');
        const dT = k.dv(327, ct, 'cabo-trafalgar');
        const o = k.fix2('punta-gracia', dG, 'cabo-trafalgar', dT, 'Situación verdadera 11:00');
        const { rc, ic } = k.corrienteDesconocida(e, o, t);
        return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
      },
    },
    'dgmm-py-2021-07-38': {
      ejercicio: 'corriente-efectiva',
      solve(k) {
        const s = k.pos('36 11,0 N', '5 11,0 W', 'Situación 11:15');
        const rv = k.rv(190, -2.5);
        const rs = k.abatimiento(rv, 3, SE);
        const { ref, vef } = k.efectivo(rs, 10, SW, 3, s);
        return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2021-07-39': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k) {
        const dv = k.oposicion('isla-tarifa', 'punta-cires');
        const s = k.fixDist('punta-cires', dv, 3, 'Salida');
        const { rs, vef } = k.rumboConCorriente(s, 'cabo-trafalgar', 9, SSW, 3.5);
        const rv = k.rvConAbatimiento(rs, 3, S);
        return [{ kind: 'bearing', value: k.ra(rv, 1) }, { kind: 'speed', value: vef }];
      },
    },

    // ---- Diciembre 2021
    'dgmm-py-2021-12-31': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k, q) {
        const g = k.P('punta-gracia');
        const s = k.fromMark('punta-gracia', S, (g.lat - 36) * 60, 'Salida');
        // Hacia el NW pasando por fuera de Trafalgar: lo dejamos por estribor.
        const rs = k.tangent(s, 'cabo-trafalgar', 3, 'estribor');
        const rv = k.rvConAbatimiento(rs, 5, NNE);
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 1 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'bearing', value: rv }];
      },
    },
    'dgmm-py-2021-12-32': {
      ejercicio: 'corriente-efectiva',
      solve(k) {
        const s = k.pos('36 08,5 N', '6 12,0 W', 'Situación 07:45');
        // El enunciado da la declinación (2,5° W): no se toma la de la carta.
        const ct = k.ct({ dm: -2.5, desvio: 1.5 });
        const rv = k.rv(100, ct);
        const rs = k.abatimiento(rv, 10, N);
        const { ref, vef } = k.efectivo(rs, 8, S, 3, s);
        return latlon(k.estimaEfectiva(s, ref, vef, hrb(9) - hrb(7, 45), 'Situación 09:00'));
      },
    },
    'dgmm-py-2021-12-33': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        // El Ra no interviene: la Ct es 0°, así que la Da al espigón ya es verdadera.
        const dv = k.oposicion('punta-carnero', 'punta-europa');
        return latlon(k.lineAndBearing('punta-carnero', dv, 'algeciras-espigon', k.dv(334, 0, 'algeciras-espigon')));
      },
    },
    'dgmm-py-2021-12-34': {
      ejercicio: 'situacion-dos-demoras',
      solve(k, q) {
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -1 });
        const dvC = k.dv(202, ct, 'punta-cires');
        // Vemos Tarifa con Paloma detrás (al NW): estamos al SE de la isla.
        const dv = k.enfilacion('isla-tarifa', 'punta-paloma', 300);
        return latlon(k.lineAndBearing('isla-tarifa', dv, 'punta-cires', dvC, 'Situación 09:00'));
      },
    },
    'dgmm-py-2021-12-36': {
      ejercicio: 'ct-enfilacion',
      solve(k) {
        // El Rv 300° no interviene. Vemos Trafalgar con Roche detrás (al NW): estamos al SE de Trafalgar.
        const dv = k.enfilacion('cabo-trafalgar', 'cabo-roche', 320);
        const ct = k.ctFrom(dv, 320);
        k.note('Signo', 'Sale +3°: la opción c, «3º+». La b, «3º», da el mismo número sin signo; frente a una «+», el tribunal escribe así la negativa (en dgmm-per-2020-12-177 su oficial «5º» es una Ct de −5°). Nuestra Ct es positiva: la c.');
        return [{ kind: 'signed', value: ct }];
      },
    },
    'dgmm-py-2021-12-37': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k, q) {
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 4 });
        const rv = k.rv(267, ct);
        const d1 = k.dv(41, ct, 'isla-tarifa');
        const d2 = norm360(rv + 90);
        k.note('Demora verdadera del través', `Paloma por el costado de estribor: lo tenemos por el través. El través se mide desde la proa, es decir, desde el Rv: Dv = Rv + 90° = ${fmtBearing(rv)} + 90° = ${fmtBearing(d2)}.`);
        const d = k.distFor(7.3, hrb(19, 17) - hrb(18, 54));
        return latlon(k.traslado('isla-tarifa', d1, 'punta-paloma', d2, rv, d, 'Situación 19:17'));
      },
    },
    'dgmm-py-2021-12-38': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k) {
        // El enunciado da la declinación (2,5° W).
        const ct = k.ct({ dm: -2.5, desvio: -4.5 });
        const rv = k.rv(232, ct);
        // Las marcaciones se miden desde la proa (el Rv); lo navegado va sobre el rumbo de superficie.
        const d1 = k.dvM(rv, 52, 'isla-tarifa');
        const d2 = k.dvM(rv, 133, 'isla-tarifa');
        const rs = k.abatimiento(rv, 8, N);
        const d = k.distFor(8, hrb(4, 24) - hrb(3, 54));
        return latlon(k.traslado('isla-tarifa', d1, 'isla-tarifa', d2, rs, d, 'Situación 04:24'));
      },
    },
    'dgmm-py-2021-12-40': {
      ejercicio: 'corriente-desconocida',
      sinMargen: 'Sale Rc 098° e Ihc 2,3 nudos: la intensidad es la de la oficial (a: 095°, 2,3 nudos) y el rumbo queda a 3°. '
        + 'La c (095°, 2,9 nudos) queda casi igual de cerca. Con un vector de corriente tan corto (2,8 millas), 3° de rumbo '
        + 'son 0,15 millas de trazado en la carta.',
      solve(k) {
        const s = k.pos('36 03,0 N', '6 05,7 W', 'Situación 02:20');
        const ct = k.ct({ dm: -3.5, desvio: -7.5 });
        const rv = k.rv(134, ct);
        const t = hrb(3, 35) - hrb(2, 20);
        const est = k.run(s, rv, k.distFor(10, t), 'Situación de estima 03:35');
        const obs = k.fix2('cabo-espartel', k.dv(222, ct, 'cabo-espartel'), 'punta-malabata', k.dv(163, ct, 'punta-malabata'), 'Situación verdadera 03:35');
        const { rc, ic } = k.corrienteDesconocida(est, obs, t);
        return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
      },
    },
  },
  documentadas: {
    'dgmm-py-2021-07-32': { tipo: 'discrepancia', texto: 'Del punto A (35° 50′ N 005° 10′ W) a Punta Almina: Rs = 307° (6,8 millas). El viento del N entra por estribor y nos abate a babor 7°: para hacer 307° hay que dar Rv = 307° + 7° = 314°. Ct = dm de la carta para 2021 (2° 50′ W − 16 × 7′ = 0° 58′ W, unos −1°) + desvío (−3°) = −4°: Ra = 314° + 4° = 318°. La opción más próxima es la oficial (d, 322°), pero a 4°: para llegar a 322° hace falta una Ct de −8°, como si se tomara una declinación de unos 5° W, que no es la de la carta para 2021. Tu cuenta debería dar unos 318°: marca la d, la más próxima.' },
  },
};
