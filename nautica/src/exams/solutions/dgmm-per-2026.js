// Soluciones programadas de las preguntas de carta del PER de la DGMM, convocatorias de 2026.
// Formato: el de andalucia-per-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).
//
// Notas: el «faro de Punta Camarinal» de los enunciados es el faro de Punta de Gracia (punta-gracia).
// Marcaciones: estribor +, babor −. Declinación y desvío: E (+), W (−).
import { hrb } from '../kit.js';
import { rhumbTo, rhumbDestination } from '../../math/mercator.js';
import { norm360 } from '../../math/angles.js';
import { fmtPos } from '../../math/format.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];
const anyo = (q) => Number(q.fecha.slice(0, 4));

/** Punto medio del segmento entre dos faros (p. ej. «el punto medio de la oposición»). */
function medio(k, a, b, label = 'Situación') {
  const r = rhumbTo(k.P(a), k.P(b));
  const p = rhumbDestination(k.P(a), r.bearing, r.distance / 2);
  k.note(label, `Punto medio entre ambos faros: desde el primero, ${r.distance.toFixed(1).replace('.', ',')} / 2 millas sobre la línea que los une: ${fmtPos(p)}.`);
  k.items.push({ t: 'pos', at: p, label, style: 'start', step: k.steps.length });
  k.focus.push(p);
  return p;
}

/** Situación cuando un faro queda por el través (babor: Dv = Rv − 90°; estribor: Dv = Rv + 90°). */
function traves(k, from, rv, id, banda, label) {
  const dv = norm360(rv + (banda === 'estribor' ? 90 : -90));
  k.note(`Través de ${k.P(id).name.replace(/^Faro de /, '')}`, `Por el través de ${banda}: Dv = Rv ${banda === 'estribor' ? '+' : '−'} 90° = ${String(Math.round(dv)).padStart(3, '0')}°.`);
  return k.corteRumbo(from, rv, id, dv, label);
}

export default {
  soluciones: {
    // ---- Abril 2026
    'dgmm-per-2026-04-42': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: 2, desvio: -2 });
        const rv = k.rv(225, ct);
        const dvOp = k.oposicion('punta-cires', 'isla-tarifa');
        const dvA = k.dvM(rv, -20, 'punta-alcazar');
        const s = k.lineAndBearing('isla-tarifa', dvOp, 'punta-alcazar', dvA, 'Situación 16:00');
        const p = k.fromMark('punta-almina', 0, 6, 'Punto a 6 millas al N de Punta Almina');
        const { rv: rv2 } = k.rhumb(s, p);
        return [{ kind: 'bearing', value: k.ra(rv2, k.ct({ dm: 2, desvio: -1 })) }];
      },
    },
    'dgmm-per-2026-04-87': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        // Dos arcos; nos quedamos con el corte al E del meridiano de Isla de Tarifa.
        const t = k.P('isla-tarifa');
        return latlon(k.fix2Ranges('isla-tarifa', 5, 'punta-cires', 6.8, { lat: t.lat, lon: t.lon + 0.2 }));
      },
    },
    'dgmm-per-2026-04-43': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        const dv = k.oposicion('punta-europa', 'punta-almina');
        // La línea de la oposición corta dos veces el arco de 5 millas de Punta Carnero: el corte entre los dos faros.
        return latlon(k.fixBearingRange('punta-almina', dv, 'punta-carnero', 5, 0, 'Situación 12:30'));
      },
    },
    'dgmm-per-2026-04-88': {
      ejercicio: 'estima-directa',
      solve(k) {
        // En la enfilación, al NE de Punta Malabata (por fuera del puerto), a 5 millas del faro.
        const dvE = k.enfilacion('tanger-espigon', 'punta-malabata', 45);
        const s = k.fromMark('punta-malabata', dvE, 5, 'Situación 10:30');
        const rv = k.rv(68, k.ct({ ct: 2 }));
        const a = k.run(s, rv, k.distFor(10, 90), 'Situación 12:00');
        const { rv: rv2 } = k.rhumb(a, 'ceuta-roja');
        return latlon(k.run(a, rv2, k.distFor(10, 15), 'Situación 12:15'));
      },
    },
    'dgmm-per-2026-04-45': {
      ejercicio: 'estima-directa',
      solve(k) {
        const s = k.fromMark('cabo-espartel', 315, 3, 'Situación 13:00');
        const { rv } = k.rhumb(s, 'punta-gracia');
        const a = k.run(s, rv, 5, 'Cambio de rumbo');
        const rv2 = k.rv(86, k.ct({ dm: 3, desvio: 1 }));
        return latlon(k.run(a, rv2, k.distFor(5, hrb(17, 0) - hrb(13, 0)) - 5, 'Situación 17:00'));
      },
    },
    'dgmm-per-2026-04-90': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const s = k.P('barbate-espigon');
        const rv1 = k.rv(219, k.ct({ ct: -3 }));
        const dvOp = k.oposicion('punta-gracia', 'cabo-trafalgar');
        const a = k.corteRumbo(s, rv1, 'cabo-trafalgar', dvOp, 'Oposición Trafalgar–Camarinal');
        const p = k.fromMark('punta-malabata', 337.5, 11.2, 'Punto a 11,2 millas al NNW de Punta Malabata');
        const { rv: rv2 } = k.rhumb(a, p);
        // Al W verdadero de Isla de Tarifa: el faro nos demora 090°.
        const b = k.corteRumbo(a, rv2, 'isla-tarifa', 90, 'Al W de Isla de Tarifa');
        const { rv: rv3, dist } = k.rhumb(b, 'tanger-espigon');
        const ra = k.ra(rv3, k.ct({ ct: 2 }));
        const d = k.distanceBetween(s, a) + k.distanceBetween(a, b) + dist;
        return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(9, 30), d, 6) }];
      },
    },

    // ---- Junio 2026
    'dgmm-per-2026-06-44': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: 5, desvio: -3 });
        const d1 = k.dv(173, ct, 'punta-malabata');
        const d2 = k.dv(48, ct, 'isla-tarifa');
        const s = k.fix2('punta-malabata', d1, 'isla-tarifa', d2, 'Situación 14:00');
        const { rv } = k.rhumb(s, 'punta-cires');
        const ra = k.ra(rv, k.ct({ dm: 5, desvio: -3.5 }));
        const t = traves(k, s, rv, 'punta-alcazar', 'estribor', 'Través de Punta Alcázar');
        return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(14, 0), k.distanceBetween(s, t), 5) }];
      },
    },
  },
  documentadas: {
    'dgmm-per-2026-06-42': {
      tipo: 'sin-calculo',
      texto: 'Falta un punto: el Cerro del Puerco no está entre los puntos de la carta de la app ni hemos encontrado una fuente '
        + 'fiable de su posición, así que no se puede trazar la enfilación con Cabo Trafalgar. La demora sí se calcula: '
        + 'Ct = −1° + 2° = +1°, Dv de Punta de Gracia = 089° + 1° = 090°, de modo que estamos en el paralelo del faro, '
        + '36° 05,5′ N. Eso descarta la a y la d; entre la b (oficial, 6° 04,4′ W) y la c (6° 06,4′ W) decide la '
        + 'enfilación, que se traza en la carta de papel. Con la b, la enfilación desde Trafalgar tendría Dv ≈ 020°.',
    },
    'dgmm-per-2026-06-45': {
      tipo: 'sin-calculo',
      texto: 'Falta un punto: la luz del pantalán de la refinería de CEPSA (San Roque) no está entre los puntos de la carta de '
        + 'la app ni hemos encontrado una fuente fiable de su posición. El resto se calcula: rumbo a la luz verde del dique '
        + 'de Ceuta hasta la oposición Punta Carnero–Punta Europa, y desde allí Rv = 205° + (3° + 2°) = 210° hasta '
        + 'completar 9 millas (hora y media a 6 nudos). Probando el pantalán en cualquier punto entre 36° 10′ y 36° 11′ N '
        + 'y entre 5° 22,5′ y 5° 24,5′ W, la llegada cae entre 35° 59,1′ y 36° 00,0′ N y entre 5° 26,8′ y 5° 28,3′ W: '
        + 'entre la opción oficial b (35° 59,9′ N, 5° 27,2′ W) y la a (35° 59,4′ N, 5° 29,0′ W). Cuál de las dos sale '
        + 'depende de dónde esté el pantalán, así que sin su posición no se puede decidir con el cálculo.',
    },
  },
};
