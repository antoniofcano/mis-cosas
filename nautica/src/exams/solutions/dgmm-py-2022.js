// Soluciones programadas de las preguntas de carta del PY de la DGMM, convocatorias de 2022.
// Formato: el de andalucia-py-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).
import { hrb } from '../kit.js';
import { norm360 } from '../../math/angles.js';
import { fmtBearing, fmtKnots } from '../../math/format.js';

const L105 = [-(2 + 50 / 60), 2005, 7];
const anyo = (q) => Number(q.fecha.slice(0, 4));
const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const SW = 225; const NW = 315;

// Marca cardinal E de la granja acuícola de Barbate (al S de Barbate): 36° 09′ N 005° 55,3′ W, la opción oficial (d) de
// la pregunta dgmm-per-2021-02-42 («¿cuál es la que más se aproxima a la marca cardinal Este situada al sur de Barbate?»).
const CARDINAL_E_BARBATE = { id: 'cardinal-e-barbate', name: 'Marca cardinal E de Barbate', lat: 36 + 9 / 60, lon: -(5 + 55.3 / 60) };

export default {
  soluciones: {
    // ---- Junio 2022
    'dgmm-py-2022-06-31': {
      ejercicio: 'situacion-dos-demoras',
      solve(k, q) {
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -1 });
        const dM = k.dv(93, ct, 'punta-malabata');
        // La luz Fl(3) 12s 14M del puerto de Tánger es la farola del espigón.
        const dT = k.dv(190, ct, 'tanger-espigon');
        return latlon(k.fix2('punta-malabata', dM, 'tanger-espigon', dT));
      },
    },
    // 06-34, 06-36: anuladas.
    'dgmm-py-2022-06-37': {
      ejercicio: 'corriente-desconocida',
      solve(k, q) {
        const s = k.pos('36 00,6 N', '5 24,0 W', 'Situación 05:20');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -3 });
        const rv = k.rv(254, ct);
        const t = hrb(6, 35) - hrb(5, 20);
        const e = k.run(s, rv, k.distFor(8, t), 'Situación de estima 06:35');
        const dM = k.dv(230.5, ct, 'punta-malabata');
        const dT = k.dv(314, ct, 'isla-tarifa');
        const o = k.fix2('punta-malabata', dM, 'isla-tarifa', dT, 'Situación verdadera 06:35');
        return [{ kind: 'bearing', value: k.corrienteDesconocida(e, o, t).rc }];
      },
    },
    'dgmm-py-2022-06-38': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k, q) {
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -2 });
        const rv = k.rv(265, ct);
        const d1 = k.dv(140, ct, 'punta-malabata');
        const d2 = k.dvM(rv, -157, 'punta-malabata');
        const d = k.distFor(12, hrb(6, 8) - hrb(5, 18));
        return latlon(k.traslado('punta-malabata', d1, 'punta-malabata', d2, rv, d, 'Situación 06:08'));
      },
    },
    // 06-39: anulada.
    'dgmm-py-2022-06-40': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k, q) {
        // Hacia el SE: la marca queda a nuestra izquierda, por babor.
        const rv = k.tangent('cabo-trafalgar', CARDINAL_E_BARBATE, 3, 'babor');
        k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo a seguir.');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -3 });
        const ra = k.ra(rv, ct);
        // La corriente nos desvía 4° al SW: rumbo al SE, nos lleva a estribor y el Ref gira hacia el S.
        const ref = norm360(rv + 4);
        k.note('Rumbo efectivo', `Mantenemos el Ra; la corriente nos desvía 4° hacia el SW, a estribor: Ref = Rv + 4° = ${fmtBearing(rv)} + 4° = ${fmtBearing(ref)}.`);
        return [{ kind: 'bearing', value: ref }, { kind: 'bearing', value: ra }];
      },
    },

    // ---- Diciembre 2022
    'dgmm-py-2022-12-32': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k) {
        const d = k.distFor(8, hrb(16, 36) - hrb(16, 6));
        return latlon(k.traslado('punta-europa', 20, 'punta-almina', 175, 72, d, 'Situación 16:36'));
      },
    },
    'dgmm-py-2022-12-33': {
      ejercicio: 'corriente-efectiva',
      solve(k, q) {
        // Lo que se pide es el rumbo y la velocidad efectivos que llevamos hasta las 09:30, antes de cambiar de rumbo.
        const s = k.pos('35 57,0 N', '5 20,0 W', 'Situación 08:45');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -2 });
        const rv = k.rv(275, ct);
        k.note('Rumbo de superficie', 'Sin viento no hay abatimiento: Rs = Rv.');
        const { ref, vef } = k.efectivo(rv, 8, NW, 2, s);
        return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2022-12-34': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        // La punta del espigón del puerto de Tánger es la farola del espigón.
        const dv = k.oposicion('tanger-espigon', 'punta-gracia');
        return latlon(k.lineAndBearing('punta-gracia', dv, 'punta-paloma', 70));
      },
    },
    'dgmm-py-2022-12-35': {
      ejercicio: 'estima-analitica',
      sinCarta: true,
      solve(k) {
        // A (005° 05′ W) y B (006° 25′ W) caen fuera de la carta L105: rumbo y distancia por latitud media.
        const a = k.pos('35 55,0 N', '5 05,0 W', 'Posición A');
        const b = k.pos('36 10,0 N', '6 25,0 W', 'Posición B');
        const { rumbo, dist } = k.rumboDirecto(a, b);
        return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
      },
    },
    'dgmm-py-2022-12-36': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k, q) {
        // La punta del espigón de Barbate es la luz roja del dique de poniente.
        // Hacia el WSW pasando por fuera de Trafalgar: lo dejamos por estribor.
        const rs = k.tangent('barbate-espigon', 'cabo-trafalgar', 3, 'estribor');
        const rv = k.rvConAbatimiento(rs, 4, NW);
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -3 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    // 12-37: anulada.
    'dgmm-py-2022-12-38': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k, q) {
        const s = k.pos('35 53,8 N', '5 52,0 W', 'Situación 11:45');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 1 });
        const rv = k.rv(52, ct);
        const rs = k.abatimiento(rv, 4, N);
        // Para estar en Tarifa a las 13:45: vector barco = vector efectivo − vector corriente.
        const { rs: rsNec, vb } = k.rumboYVelocidad(s, 'isla-tarifa', hrb(13, 45) - hrb(11, 45), 215, 3);
        k.note('Comprobación', `El rumbo de superficie que sale del triángulo (${fmtBearing(rsNec)}) es el que ya llevamos con el Ra 052° (${fmtBearing(rs)}): basta con andar a ${fmtKnots(vb)}.`);
        return [{ kind: 'speed', value: vb }];
      },
    },
    'dgmm-py-2022-12-39': {
      ejercicio: 'corriente-desconocida',
      solve(k, q) {
        const s = k.pos('36 05,6 N', '6 10,0 W', 'Situación 06:45');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 2 });
        const rv = k.rv(109, ct);
        const t = hrb(7, 15) - hrb(6, 45);
        const e = k.run(s, rv, k.distFor(11, t), 'Situación de estima 07:15');
        const dT = k.dv(2, ct, 'cabo-trafalgar');
        const dE = k.dv(156, ct, 'cabo-espartel');
        const o = k.fix2('cabo-trafalgar', dT, 'cabo-espartel', dE, 'Situación verdadera 07:15');
        const { rc, ic } = k.corrienteDesconocida(e, o, t);
        return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
      },
    },
    'dgmm-py-2022-12-40': {
      ejercicio: 'estima-analitica',
      solve(k) {
        // Los signos de los desvíos y de la declinación faltan en el texto extraído («4º ()»): en el PDF del examen son
        // un guion (U+00AD), es decir, todos negativos (W).
        const s = k.pos('36 05,0 N', '5 15,0 W', 'Salida');
        k.note('Rumbos verdaderos', 'Ct = dm + Δ con dm = −1°: Ra 235° (Δ −4°, Ct −5°) → Rv 230°; Ra 254° (Δ −3°, Ct −4°) → Rv 250°; Ra 263° (Δ −3°, Ct −4°) → Rv 259°; Ra 227° (Δ −4°, Ct −5°) → Rv 222°.');
        k.note('Distancias', 'A 8 nudos: 2 h = 16 millas; 1 h = 8 millas; 2 h 24 min = 19,2 millas; 3 h = 24 millas.');
        return latlon(k.tramos(s, [
          { rumbo: 230, millas: 16 }, { rumbo: 250, millas: 8 },
          { rumbo: 259, millas: 19.2 }, { rumbo: 222, millas: 24 },
        ], 'Situación final'));
      },
    },
  },
  documentadas: {},
};
