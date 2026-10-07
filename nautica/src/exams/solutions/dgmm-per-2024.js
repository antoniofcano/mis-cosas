// Soluciones programadas de las preguntas de carta del PER de la DGMM, convocatorias de 2024.
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
  k.note(`Través de ${k.P(id).name.replace(/^Faro de /, '').replace(/\s*\(.*\)/, '')}`, `Por el través de ${banda}: Dv = Rv ${banda === 'estribor' ? '+' : '−'} 90° = ${String(Math.round(dv)).padStart(3, '0')}°.`);
  return k.corteRumbo(from, rv, id, dv, label);
}

export default {
  soluciones: {
    // ---- Abril 2024
    'dgmm-per-2024-04-42': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: 5, desvio: -3 });
        k.note('Rumbo', 'El Ra 355° no interviene en la situación: se sitúa con las dos demoras de aguja.');
        const d1 = k.dv(299, ct, 'punta-almina');
        const d2 = k.dv(198, ct, 'cabo-negro');
        const s = k.fix2('punta-almina', d1, 'cabo-negro', d2, 'Situación 08:00');
        const { rv } = k.rhumb(s, 'punta-carnero');
        const ra = k.ra(rv, k.ct({ dm: 5, desvio: -4 }));
        const t = traves(k, s, rv, 'punta-europa', 'estribor', 'Través de Punta Europa');
        return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(8, 0), k.distanceBetween(s, t), 4) }];
      },
    },
    'dgmm-per-2024-04-87': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        // Dos arcos (10 millas de Almina y 5 de Europa); el «al suroeste» de Europa elige el corte.
        const sw = k.P('punta-europa');
        return latlon(k.fix2Ranges('punta-almina', 10, 'punta-europa', 5, { lat: sw.lat - 0.1, lon: sw.lon - 0.1 }));
      },
    },
    'dgmm-per-2024-04-43': {
      ejercicio: 'estima-directa',
      solve(k) {
        const s = k.pos('35 47,0 N', '6 12,0 W', 'Situación 09:30');
        const p = k.pos('35 58,0 N', '5 55,0 W', 'Punto «p»');
        const { rv } = k.rhumb(s, p);
        const ct = k.ct({ dm: -3, desvio: -3 });
        const dv = k.dv(116, ct, 'cabo-espartel');
        const a = k.corteRumbo(s, rv, 'cabo-espartel', dv, 'Cambio de rumbo');
        const d1 = k.distanceBetween(s, a);
        const b = k.fromMark('punta-malabata', 0, 3, 'Punto a 3 millas al N de Punta Malabata');
        const { rv: rv2 } = k.rhumb(a, b);
        const d2 = k.distFor(6, hrb(12, 30) - hrb(9, 30)) - d1;
        return latlon(k.run(a, rv2, d2, 'Situación 12:30'));
      },
    },
    'dgmm-per-2024-04-89': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: -2, desvio: -3 });
        const rv = k.rv(288, ct);
        const d1 = k.dvM(rv, 52, 'punta-paloma');
        const d2 = k.dv(72, ct, 'isla-tarifa');
        const s = k.fix2('punta-paloma', d1, 'isla-tarifa', d2, 'Situación 11:00');
        const p = k.fromMark('punta-gracia', 180, 3, 'Punto a 3 millas al S de Punta de Gracia');
        const { rv: rv2 } = k.rhumb(s, p);
        return [{ kind: 'bearing', value: k.ra(rv2, k.ct({ dm: -2, desvio: 4 })) }];
      },
    },
    'dgmm-per-2024-04-45': {
      ejercicio: 'estima-directa',
      solve(k) {
        const s = k.pos('35 45,0 N', '5 14,0 W', 'Situación 15:00');
        const rv = k.rv(355, k.ct({ ct: 5 }));
        return latlon(k.run(s, rv, k.distFor(5, hrb(16, 30) - hrb(15, 0)), 'Situación 16:30'));
      },
    },

    // ---- Junio 2024
    'dgmm-per-2024-06-42': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: -2, desvio: -3 });
        const rv = k.rv(265, ct);
        const dvOp = k.oposicion('punta-almina', 'punta-europa');
        const dvC = k.dvM(rv, -30, 'punta-cires');
        const s = k.lineAndBearing('punta-almina', dvOp, 'punta-cires', dvC, 'Situación 08:00');
        const p = k.fromMark('isla-tarifa', 180, 3, 'Punto a 3 millas al S de Isla de Tarifa');
        const { rv: rv2 } = k.rhumb(s, p);
        return [{ kind: 'bearing', value: k.ra(rv2, k.ct({ dm: -2, desvio: -4 })) }];
      },
    },
    'dgmm-per-2024-06-87': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const ct = k.ct({ dm: -4, desvio: -2 });
        const rv = k.rv(297, ct);
        // Marcaciones de 0° a 360° contadas desde la proa hacia estribor.
        const d1 = k.dvM(rv, 275, 'cabo-espartel');
        const d2 = k.dvM(rv, 189, 'punta-malabata');
        return latlon(k.fix2('cabo-espartel', d1, 'punta-malabata', d2));
      },
    },
    'dgmm-per-2024-06-43': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        // Anulada por el tribunal; con los datos del enunciado sale la a (36° 06,1′ N, 5° 57,4′ W).
        const dvE = k.enfilacion('cabo-roche', 'cabo-trafalgar', 180);
        const ct = k.ct({ dm: -2, desvio: 4 });
        const dvG = k.dv(273, ct, 'punta-gracia');
        return latlon(k.lineAndBearing('cabo-trafalgar', dvE, 'punta-gracia', dvG));
      },
    },
    'dgmm-per-2024-06-88': {
      ejercicio: 'rumbo-distancia',
      solve(k, q) {
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -1.9 });
        const d1 = k.dv(11.5, ct, 'cabo-roche');
        const d2 = k.dv(85.5, ct, 'cabo-trafalgar');
        const s = k.fix2('cabo-roche', d1, 'cabo-trafalgar', d2, 'Situación 10:35');
        const p = k.fromMark('barbate-espigon', 180, 3, 'Punto a 3 millas al S del espigón de Barbate');
        const { rv, dist } = k.rhumb(s, p);
        return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(10, 35), dist, 6) }];
      },
    },
    'dgmm-per-2024-06-89': {
      ejercicio: 'estima-directa',
      solve(k) {
        const rv = k.rv(208, k.ct({ ct: 2 }));
        const dvOp = k.oposicion('punta-almina', 'punta-europa');
        const dvC = k.dvM(rv, 88, 'punta-carnero');
        const s = k.lineAndBearing('punta-almina', dvOp, 'punta-carnero', dvC, 'Situación 11:30');
        const rv2 = k.rv(253, k.ct({ ct: 1 }));
        return latlon(k.run(s, rv2, k.distFor(8, hrb(13, 0) - hrb(11, 30)), 'Situación 13:00'));
      },
    },
    'dgmm-per-2024-06-45': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const s = k.fromMark('cabo-espartel', 270, 5, 'Situación 08:00');
        const rv = k.rv(51, k.ct({ dm: -3, desvio: -3 }));
        const a = k.run(s, rv, k.distFor(6, 60), 'Situación 09:00');
        const p = k.pos('36 08,0 N', '5 53,0 W', 'Punto «p»');
        const { rv: rv2 } = k.rhumb(a, p);
        const ra = k.ra(rv2, k.ct({ dm: -3, desvio: 1 }));
        const t = traves(k, a, rv2, 'punta-gracia', 'estribor', 'Través de Punta de Gracia');
        return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(9, 0), k.distanceBetween(a, t), 6) }];
      },
    },

    // ---- Noviembre 2024
    'dgmm-per-2024-11-42': {
      ejercicio: 'estima-directa',
      solve(k) {
        const ct = k.ct({ dm: 2, desvio: -3 });
        const d1 = k.dv(74, ct, 'isla-tarifa');
        const d2 = k.dv(176, ct, 'cabo-espartel');
        const s = k.fix2('isla-tarifa', d1, 'cabo-espartel', d2, 'Situación 10:00');
        const p = k.fromMark('punta-cires', 0, 2, 'Punto a 2 millas al N de Punta Cires');
        const { rv } = k.rhumb(s, p);
        const a = k.run(s, rv, k.distFor(5, hrb(15, 0) - hrb(10, 0)), 'Situación 15:00');
        const { rv: rv2 } = k.rhumb(a, 'boya-getares');
        return latlon(k.run(a, rv2, k.distFor(5, hrb(16, 24) - hrb(15, 0)), 'Situación 16:24'));
      },
    },
    'dgmm-per-2024-11-43': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const dvE = k.enfilacion('punta-europa', 'punta-carnero', 240);
        const ct = k.ctFrom(dvE, 240);
        const dvC = k.dv(322, ct, 'punta-carbonera');
        return latlon(k.lineAndBearing('punta-europa', dvE, 'punta-carbonera', dvC));
      },
    },
    'dgmm-per-2024-11-88': {
      ejercicio: 'estima-directa',
      solve(k) {
        const s = k.fromMark('cabo-espartel', 0, 3, 'Situación 10:00');
        const rv = k.rv(71, k.ct({ ct: -3 }));
        const a = traves(k, s, rv, 'punta-malabata', 'estribor', 'Través de Punta Malabata');
        const d1 = k.distanceBetween(s, a);
        const rv2 = k.rv(82, k.ct({ ct: -2 }));
        return latlon(k.run(a, rv2, k.distFor(6, hrb(12, 0) - hrb(10, 0)) - d1, 'Situación 12:00'));
      },
    },
    'dgmm-per-2024-11-89': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ ct: 2 });
        const d1 = k.dv(95, ct, 'isla-tarifa');
        const d2 = k.dv(178, ct, 'punta-malabata');
        const s = k.fix2('isla-tarifa', d1, 'punta-malabata', d2, 'Situación 09:30');
        // «En demora verdadera 207° del Cabo Trafalgar»: desde el faro, el punto está en la dirección 207°.
        const p = k.fromMark('cabo-trafalgar', 207, 2.8, 'Punto de llegada');
        const { rv, dist } = k.rhumb(s, p);
        return [{ kind: 'bearing', value: k.ra(rv, k.ct({ ct: -4 })) }, { kind: 'clock', value: k.eta(hrb(9, 30), dist, 6) }];
      },
    },
    'dgmm-per-2024-11-45': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: 5, desvio: -3 });
        k.note('Rumbo', 'El Ra 055° solo sirve para el desvío: las demoras son de aguja.');
        const d1 = k.dv(293, ct, 'isla-tarifa');
        const d2 = k.dv(162, ct, 'punta-cires');
        const s = k.fix2('isla-tarifa', d1, 'punta-cires', d2, 'Situación 12:30');
        const { rv } = k.rhumb(s, 'punta-europa');
        const ra = k.ra(rv, k.ct({ dm: 5, desvio: -4 }));
        const t = traves(k, s, rv, 'punta-carnero', 'babor', 'Través de Punta Carnero');
        return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(12, 30), k.distanceBetween(s, t), 7) }];
      },
    },
  },
  documentadas: {
    'dgmm-per-2024-04-90': {
      tipo: 'sin-calculo',
      texto: 'Se calcula la línea de posición: Ct = −3° + 1° = −2°, Dv de Ras El Aswad (Cabo Negro) = 200° − 2° = 198°. '
        + 'La situación es el corte de esa demora con la isobática de 200 m, que se lee en la carta de papel: la carta de la '
        + 'app no trae sondas ni isobáticas. La opción oficial (35° 45,4′ N, 5° 14,8′ W) está sobre esa demora (desde ella '
        + 'el faro demora 197°, a 4,4 millas); las demás opciones solo cambian los grados de latitud o de longitud y caen '
        + 'fuera de la carta.',
    },
    'dgmm-per-2024-11-87': {
      tipo: 'sin-calculo',
      texto: 'Se calcula la línea de posición: Ct = −3° + 3° = 0°, Dv de Cabo Trafalgar = 330°. La situación es el corte de '
        + 'esa demora con la isobática de 100 m, que se lee en la carta de papel: la carta de la app no trae sondas ni '
        + 'isobáticas. La opción oficial (36° 03,5′ N, 5° 56,9′ W) está sobre esa demora (desde ella el faro demora 331°, '
        + 'a 8,6 millas).',
    },
  },
};
