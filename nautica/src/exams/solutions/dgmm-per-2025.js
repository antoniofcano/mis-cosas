// Soluciones programadas de las preguntas de carta del PER de la DGMM, convocatorias de 2025.
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
// Morro del dique de abrigo del puerto de Sotogrande [Fl(3)G 11s] (no está en los puntos de la carta): 36° 17′ 09″ N,
// 5° 16′ 11″ W, la posición de la baliza verde del morro en la ficha del puerto deportivo (andalucia.org, carta D-453).
const SOTOGRANDE = { id: 'sotogrande-espigon', name: 'Sotogrande, extremo S del espigón', lat: 36 + 17.154 / 60, lon: -(5 + 16.189 / 60) };

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
  k.note(`Través de ${k.P(id).name.replace(/^Faro de /, '').replace(/\s*\(.*\)/, '')}`, `Por el través de ${banda}: Dv = Rv ${banda === 'estribor' ? '+' : '−'} 90° = ${String(Math.round(dv)).padStart(3, '0')}°.`);
  return k.corteRumbo(from, rv, id, dv, label);
}

export default {
  soluciones: {
    // ---- Abril 2025
    'dgmm-per-2025-04-42': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        // Anulada por el tribunal; con los datos del enunciado sale 36° 00,1′ N, 5° 27,1′ W, entre la a y la d.
        const dvOp = k.oposicion('punta-cires', 'punta-carnero');
        return latlon(k.lineAndBearing('punta-carnero', dvOp, 'isla-tarifa', 270));
      },
    },
    'dgmm-per-2025-04-43': {
      ejercicio: 'estima-directa',
      solve(k) {
        const s = k.fromMark('cabo-trafalgar', 270, 5, 'Situación 15:00');
        const rv1 = k.rv(124, k.ct({ dm: -2, desvio: -2 }));
        const a = k.corteRumbo(s, rv1, 'punta-paloma', 0, 'Al S de Punta Paloma');
        const d1 = k.distanceBetween(s, a);
        const rv2 = k.rv(93, k.ct({ dm: -2, desvio: -1 }));
        const b = k.run(a, rv2, 5.4, 'Cambio de rumbo');
        // Alterar 20° a babor es restar 20° al rumbo.
        const rv3 = rv2 - 20;
        k.note('Nuevo rumbo', `Caemos 20° a babor: Rv = ${Math.round(rv2)}° − 20° = ${Math.round(rv3)}°.`);
        const d3 = k.distFor(10, hrb(18, 0) - hrb(15, 0)) - d1 - 5.4;
        return latlon(k.run(b, rv3, d3, 'Situación 18:00'));
      },
    },
    'dgmm-per-2025-04-88': {
      ejercicio: 'estima-directa',
      solve(k) {
        const dvE = k.enfilacion('punta-paloma', 'isla-tarifa', 120);
        const ct = k.ct({ dm: -2.5, desvio: -1.5 });
        const dvA = k.dv(184, ct, 'punta-alcazar');
        const s = k.lineAndBearing('isla-tarifa', dvE, 'punta-alcazar', dvA, 'Situación 10:30');
        const rv = k.rv(267, ct);
        return latlon(k.run(s, rv, k.distFor(7, hrb(12, 0) - hrb(10, 30)), 'Situación 12:00'));
      },
    },
    'dgmm-per-2025-04-89': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const ct = k.ct({ dm: -2, desvio: -3 });
        const d1 = k.dv(25, ct, 'cabo-trafalgar');
        const d2 = k.dv(345, ct, 'cabo-roche');
        return latlon(k.fix2('cabo-trafalgar', d1, 'cabo-roche', d2));
      },
    },
    'dgmm-per-2025-04-45': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: -2, desvio: -3 });
        const rv = k.rv(95, ct);
        const dvOp = k.oposicion('punta-malabata', 'punta-paloma');
        const dvA = k.dvM(rv, 30, 'punta-alcazar');
        const s = k.lineAndBearing('punta-malabata', dvOp, 'punta-alcazar', dvA, 'Situación 12:00');
        const p = k.fromMark('cabo-espartel', 0, 4, 'Punto a 4 millas al N de Cabo Espartel');
        const { rv: rv2 } = k.rhumb(s, p);
        return [{ kind: 'bearing', value: k.ra(rv2, k.ct({ dm: -2, desvio: -3.5 })) }];
      },
    },
    'dgmm-per-2025-04-90': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: -0.5, desvio: 2 });
        const d1 = k.dv(26.5, ct, 'isla-tarifa');
        const d2 = k.dv(304.5, ct, 'punta-gracia');
        const s = k.fix2('isla-tarifa', d1, 'punta-gracia', d2, 'Situación 12:30');
        const p = k.fromMark('punta-europa', 90, 8, 'Punto a 8 millas al E de Punta Europa');
        const { rv, dist } = k.rhumb(s, p);
        const ra = k.ra(rv, k.ct({ dm: -0.5, desvio: -1 }));
        return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(12, 30), dist, 7) }];
      },
    },

    // ---- Junio 2025
    'dgmm-per-2025-06-42': {
      ejercicio: 'estima-directa',
      solve(k) {
        const ct1 = k.ct({ dm: -2, desvio: 3 });
        const dvA = k.dv(109, ct1, 'punta-alcazar');
        // Al S verdadero de Isla de Tarifa: el faro nos demora 000°.
        const s = k.lineAndBearing('isla-tarifa', 0, 'punta-alcazar', dvA, 'Situación 09:00');
        const p = k.fromMark('punta-cires', 0, 2, 'Punto a 2 millas al N de Punta Cires');
        k.rhumb(s, p);
        const ct2 = k.ct({ dm: -2, desvio: 2 });
        const d1 = k.dv(270, ct2, 'punta-carnero');
        const d2 = k.dv(295, ct2, 'punta-europa');
        const a = k.fix2('punta-carnero', d1, 'punta-europa', d2, 'Cambio de rumbo');
        const dA = k.distanceBetween(s, a);
        const { rv } = k.rhumb(a, SOTOGRANDE);
        return latlon(k.run(a, rv, k.distFor(6, hrb(13, 0) - hrb(9, 0)) - dA, 'Situación 13:00'));
      },
    },
    'dgmm-per-2025-06-43': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const dvOp = k.oposicion('punta-alcazar', 'isla-tarifa');
        const ct = k.ctFrom(dvOp, 344);
        const dvC = k.dv(117.5, ct, 'punta-cires');
        return latlon(k.lineAndBearing('isla-tarifa', dvOp, 'punta-cires', dvC));
      },
    },
    'dgmm-per-2025-06-44': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: 5, desvio: -3 });
        const d1 = k.dv(280, ct, 'punta-europa');
        const d2 = k.dv(201, ct, 'punta-almina');
        const s = k.fix2('punta-europa', d1, 'punta-almina', d2, 'Situación 11:30');
        const { rv } = k.rhumb(s, 'isla-tarifa');
        const ra = k.ra(rv, k.ct({ dm: 5, desvio: -4 }));
        // Al N verdadero de Punta Cires: el faro nos demora 180°.
        const t = k.corteRumbo(s, rv, 'punta-cires', 180, 'Al N de Punta Cires');
        return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(11, 30), k.distanceBetween(s, t), 7.5) }];
      },
    },

    // ---- Noviembre 2025
    'dgmm-per-2025-11-87': {
      ejercicio: 'estima-directa',
      solve(k) {
        const s = k.fromMark('punta-gracia', 270, 3, 'Situación 10:00');
        const rv = k.rv(178, k.ct({ ct: 2 }));
        const a = k.run(s, rv, k.distFor(7, 90), 'Situación 11:30');
        const { rv: rv2 } = k.rhumb(a, 'tanger-espigon');
        return latlon(k.run(a, rv2, k.distFor(7, 30), 'Situación 12:00'));
      },
    },
    'dgmm-per-2025-11-89': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const rv = k.rv(238, k.ct({ ct: -3 }));
        const dvC = k.dvM(rv, -126, 'punta-cires');
        const s = k.lineAndBearing('punta-paloma', 0, 'punta-cires', dvC, 'Situación 09:30');
        k.oposicion('cabo-espartel', 'cabo-trafalgar');
        const m = medio(k, 'cabo-espartel', 'cabo-trafalgar', 'Punto medio Espartel–Trafalgar');
        const { rv: rv1 } = k.rhumb(s, m);
        const a = k.run(s, rv1, k.distFor(5, hrb(12, 0) - hrb(9, 30)), 'Situación 12:00');
        const p = k.fromMark('cabo-trafalgar', 202.5, 3, 'Punto a 3 millas al SSW de Cabo Trafalgar');
        const { rv: rv2, dist } = k.rhumb(a, p);
        return [{ kind: 'bearing', value: k.ra(rv2, k.ct({ ct: 2 })) }, { kind: 'clock', value: k.eta(hrb(12, 0), dist, 5) }];
      },
    },
    'dgmm-per-2025-11-45': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: -1, desvio: -3 });
        const d1 = k.dv(161, ct, 'punta-malabata');
        const d2 = k.dv(89, ct, 'punta-cires');
        const s = k.fix2('punta-malabata', d1, 'punta-cires', d2, 'Situación 09:15');
        const p = k.fromMark('cabo-espartel', 315, 3, 'Punto a 3 millas al NW de Cabo Espartel');
        const { rv } = k.rhumb(s, p);
        return [{ kind: 'bearing', value: k.ra(rv, k.ct({ dm: -1, desvio: -2 })) }];
      },
    },
    'dgmm-per-2025-11-90': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const dvOp = k.oposicion('punta-gracia', 'cabo-trafalgar');
        const ct = k.ctFrom(dvOp, 290);
        const dvB = k.dv(350, ct, 'barbate-faro');
        return latlon(k.lineAndBearing('cabo-trafalgar', dvOp, 'barbate-faro', dvB));
      },
    },
  },
  documentadas: {
    'dgmm-per-2025-11-42': {
      tipo: 'sin-calculo',
      texto: 'Se calcula la línea de posición: Ct = 5° NW = −5°, Dv de Cabo Trafalgar = 005° − 5° = 000° (estamos al S '
        + 'verdadero del faro). La situación es el corte de esa demora con la sonda de 50 m, que se lee en la carta de papel: '
        + 'la carta de la app no trae sondas ni isobáticas. La opción oficial (36° 06,8′ N, 6° 02′ W) está sobre esa demora '
        + '(desde ella el faro demora 000°, a 4,2 millas).',
    },
    'dgmm-per-2025-11-43': {
      tipo: 'sin-calculo',
      texto: 'La situación de las 09:00 es el corte del meridiano de Cabo Trafalgar (al S del faro) con la sonda de 20 m, '
        + 'que se lee en la carta de papel: la carta de la app no trae sondas ni isobáticas. El resto es una estima: dm 2025 '
        + '= −2° 50′ + 20 × 7′ = −0° 30′, Ct = −0,5° − 0,5° = −1°, Rv = 124° − 1° = 123°, 15 millas en hora y media a '
        + '10 nudos. Navegando hacia atrás desde la opción oficial (36° 01,4′ N, 5° 46,6′ W) la salida queda en 36° 09,6′ N, '
        + '6° 02,2′ W: a 1,5 millas al S del faro y sobre su meridiano, coherente con el enunciado.',
    },
  },
};
