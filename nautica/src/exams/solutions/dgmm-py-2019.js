// Soluciones programadas de las preguntas de carta del PY de la DGMM, convocatorias de 2019.
// Formato: el de andalucia-py-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).
import { hrb } from '../kit.js';
import { rhumbDestination } from '../../math/mercator.js';
import { fmtBearing, fmtPos } from '../../math/format.js';

const L105 = [-(2 + 50 / 60), 2005, 7];
const anyo = (q) => Number(q.fecha.slice(0, 4));
const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0;

export default {
  soluciones: {
    // ---- Junio 2019
    'dgmm-py-2019-06-32': {
      ejercicio: 'corriente-efectiva',
      solve(k) {
        const dv = k.dv(23, 0, 'punta-carnero');
        const s = k.fixDist('punta-carnero', dv, 4.1, 'Situación 15:00');
        const rv = k.rv(245, 0);
        const rs = k.abatimiento(rv, 4, N);
        const { ref, vef } = k.efectivo(rs, 5, 230, 2, s);
        return latlon(k.estimaEfectiva(s, ref, vef, hrb(17) - hrb(15), 'Situación 17:00'));
      },
    },
    'dgmm-py-2019-06-33': {
      ejercicio: 'rumbo-distancia',
      solve(k, q) {
        // De los dos cortes de los arcos, el del mar (al W de la costa).
        const s = k.fix2Ranges('cabo-trafalgar', 3.5, 'cabo-roche', 8.6, { lat: 36.2, lon: -6.2 }, 'Salida');
        const b = k.fromMark('cabo-espartel', 270, 8.4, 'Punto de paso');
        const { rv } = k.rhumb(s, b, 'Rumbo al punto de paso');
        k.note('Rumbo verdadero', 'El viento del S no nos abate (0°): el Rv es el mismo rumbo a seguir.');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 1 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-py-2019-06-34': {
      ejercicio: 'corriente-desconocida',
      solve(k) {
        const s = k.pos('36 10,0 N', '6 10,0 W', 'Situación 11:00');
        const t = hrb(12, 32) - hrb(11);
        const e = k.run(s, 152, k.distFor(8, t), 'Situación de estima 12:32');
        // De los dos cortes de la demora con el arco, el más cercano a Espartel (el otro cae lejos, al NW de la estima).
        const o = k.fixBearingRange('cabo-espartel', 127, 'punta-malabata', 19.4, 0, 'Situación verdadera 12:32');
        const { rc, ic } = k.corrienteDesconocida(e, o, t);
        return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
      },
    },
    'dgmm-py-2019-06-35': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const dvE = k.dvM(283, 29, 'punta-europa');
        k.note('Demora verdadera del través', 'El través se mide desde la proa, es decir, desde el Rv: por babor, Dv = Rv − 90° = 283° − 90° = 193°.');
        return latlon(k.fix2('punta-europa', dvE, 'punta-almina', 193));
      },
    },
    'dgmm-py-2019-06-36': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k) {
        const { rs, vef } = k.rumboConCorriente('barbate-espigon', 'punta-malabata', 6, 70, 3);
        k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
        return [{ kind: 'bearing', value: k.ra(rs, 3) }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2019-06-37': {
      ejercicio: 'corriente-efectiva',
      solve(k) {
        const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación');
        const rv = k.rv(42, 2);
        const { ref, vef } = k.efectivo(rv, 9, 85, 3, s);
        // Las opciones b y c son idénticas («054º, 11,45 nudos») y el tribunal dio por buenas las dos.
        return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2019-06-38': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k) {
        const d = k.distFor(4, hrb(16, 30) - hrb(14, 30));
        // La 1ª línea de posición es el arco de 9 millas de Paloma: se traslada su centro lo navegado.
        const c = { name: 'Paloma trasladado', ...rhumbDestination(k.P('punta-paloma'), 320, d) };
        k.note('Traslado de la 1ª línea', `La 1ª línea de posición es el arco de 9 millas con centro en Paloma. Trasladamos su centro lo navegado entre las dos observaciones, ${fmtBearing(320)} y 8 millas: nuevo centro en ${fmtPos(c)}.`);
        // Corte de la demora de Gracia con el arco trasladado: el del S (el otro cae en tierra, al N de la costa).
        return latlon(k.fixBearingRange('punta-gracia', 21, c, 9, 0, 'Situación 16:30'));
      },
    },
    // 06-39: ver documentadas (la enfilación mide 243,5°: Ct +1,5°, la opción d).
  },
  documentadas: {
    'dgmm-py-2019-06-39': { tipo: 'discrepancia', texto: 'En la carta, la enfilación Europa–Carnero (vemos Europa con Carnero detrás, al SW) mide 243,5°: con la Da 242° la Ct es +1,5°, exactamente la opción d. La oficial (c, +2°) queda a 0,5°, en el límite de la tolerancia, y la opción d la iguala: el tribunal debió medir la enfilación en 244°.' },
  },
};
