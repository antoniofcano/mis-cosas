// Soluciones programadas de las preguntas de carta del PER de la DGMM, convocatorias de 2023.
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
    // ---- Abril 2023
    'dgmm-per-2023-04-87': {
      ejercicio: 'rumbo-distancia',
      solve(k, q) {
        const s = k.pos('36 10,0 N', '6 10,0 W', 'Salida');
        const { rv } = k.rhumb(s, 'cabo-roche');
        k.note('Velocidad', 'Los 4 nudos no intervienen: solo se pide el rumbo.');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -2 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2023-04-43': {
      ejercicio: 'ct-enfilacion',
      solve(k) {
        // Ct = −2,8° → 3° (−). El lector de opciones aún lee igual «3° (−)» y «3° (+)» (ver pendientesLector).
        const dv = k.oposicion('punta-almina', 'punta-europa');
        return [{ kind: 'signed', value: k.ctFrom(dv, 349) }];
      },
    },
    'dgmm-per-2023-04-44': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const dvOp = k.oposicion('punta-gracia', 'cabo-trafalgar');
        const ct = k.ctFrom(dvOp, 290);
        const dvB = k.dv(353, ct, 'barbate-faro');
        return latlon(k.lineAndBearing('cabo-trafalgar', dvOp, 'barbate-faro', dvB));
      },
    },
    'dgmm-per-2023-04-89': {
      ejercicio: 'estima-directa',
      solve(k) {
        const ct = k.ct({ dm: -5, desvio: 4 });
        const rv = k.rv(140, ct);
        const d1 = k.dv(30, ct, 'cabo-trafalgar');
        const d2 = k.dvM(rv, -45, 'punta-gracia');
        const s = k.fix2('cabo-trafalgar', d1, 'punta-gracia', d2, 'Situación 10:22');
        const { rv: r2 } = k.rhumb(s, 'tanger-espigon');
        const d = k.distFor(12, hrb(11, 43) - hrb(10, 22));
        return latlon(k.run(s, r2, d, 'Situación 11:43'));
      },
    },
    'dgmm-per-2023-04-45': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k) {
        // En el examen los signos del desvío (2°) y de la dm (5°) son un guion (−); el rumbo SSW no interviene.
        const ct = k.ct({ dm: -5, desvio: -2 });
        const d1 = k.dv(334, ct, 'punta-europa');
        const d2 = k.dv(232, ct, 'punta-leona');
        const s = k.fix2('punta-europa', d1, 'punta-leona', d2, 'Situación 20:00');
        const p = k.fromMark('isla-tarifa', 180, 3, 'Punto a 3 millas al S de Isla de Tarifa');
        const { rv } = k.rhumb(s, p);
        const ra = k.ra(rv, k.ct({ dm: -5, desvio: 1 }));
        const t = traves(k, s, rv, 'punta-cires', 'babor', 'Través de Punta Cires');
        const d = k.distanceBetween(s, t);
        return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(20, 0), d, 10) }];
      },
    },

    // ---- Junio 2023
    'dgmm-per-2023-06-87': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k, q) {
        k.oposicion('punta-carnero', 'punta-europa');
        const s = medio(k, 'punta-carnero', 'punta-europa', 'Salida');
        // Hacia Ras El Aswad (Cabo Negro), al S, doblamos Punta Almina por fuera (por su E): la dejamos por estribor.
        const rv = k.tangent(s, 'punta-almina', 2.5, 'estribor');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -3 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2023-06-43': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k) {
        const s = k.fix2('cabo-espartel', 216, 'punta-malabata', 115);
        // Hacia el E, Punta Cires queda al S de la derrota: la dejamos por estribor.
        const rv = k.tangent(s, 'punta-cires', 3, 'estribor');
        return latlon(k.run(s, rv, 13, 'Situación tras 13 millas'));
      },
    },
    'dgmm-per-2023-06-88': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const ct = k.ct({ dm: -1, desvio: 1 });
        const d1 = k.dv(315, ct, 'cabo-trafalgar');
        const d2 = k.dv(70, ct, 'isla-tarifa');
        return latlon(k.fix2('cabo-trafalgar', d1, 'isla-tarifa', d2));
      },
    },
    'dgmm-per-2023-06-44': {
      ejercicio: 'distancia-faro',
      solve(k) {
        const ct = k.ct({ dm: -1, desvio: -1 });
        const d1 = k.dv(349, ct, 'punta-paloma');
        const d2 = k.dv(77, ct, 'isla-tarifa');
        const s = k.fix2('punta-paloma', d1, 'isla-tarifa', d2);
        const { rv } = k.rhumb(s, 'cabo-trafalgar');
        // Aquí se pide el través de la punta (el cabo), no una demora a su luz: usamos el cabo de Punta Camarinal de la
        // carta. Con la luz de Punta de Gracia saldrían 8,3 millas, lejos de todas las opciones.
        const t = traves(k, s, rv, 'punta-camarinal', 'estribor', 'Través de Punta Camarinal');
        return [{ kind: 'distance', value: k.distanceBetween(s, t) }];
      },
    },
    'dgmm-per-2023-06-45': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        return latlon(k.fixDist('punta-paloma', 20, 5));
      },
    },
    'dgmm-per-2023-06-90': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k) {
        // Los desvíos (2° y 4°) llevan en el examen un guion (−).
        const ct1 = k.ct({ dm: -3, desvio: -2 });
        const dvOp = k.oposicion('punta-almina', 'punta-europa');
        const dvC = k.dv(302, ct1, 'punta-carnero');
        const s = k.lineAndBearing('punta-almina', dvOp, 'punta-carnero', dvC, 'Situación 16:00');
        const p = k.fromMark('isla-tarifa', 180, 2, 'Punto a 2 millas al S de Isla de Tarifa');
        const { rv } = k.rhumb(s, p);
        const ct2 = k.ct({ dm: -3, desvio: -4 });
        const dvCires = k.dv(137, ct2, 'punta-cires');
        const a = k.corteRumbo(s, rv, 'punta-cires', dvCires, 'Cambio de rumbo');
        const { rv: rv2 } = k.rhumb(a, 'tanger-espigon');
        const b = traves(k, a, rv2, 'punta-alcazar', 'babor', 'Través de Punta Alcázar');
        const d = k.distanceBetween(s, a) + k.distanceBetween(a, b);
        return [{ kind: 'clock', value: k.eta(hrb(16, 0), d, 10) }];
      },
    },

    // ---- Noviembre 2023
    'dgmm-per-2023-11-43': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const ct = k.ct({ ct: -5 });
        const d1 = k.dv(230, ct, 'cabo-espartel');
        const d2 = k.dv(140, ct, 'punta-malabata');
        return latlon(k.fix2('cabo-espartel', d1, 'punta-malabata', d2, 'Situación 17:00'));
      },
    },
    'dgmm-per-2023-11-44': {
      ejercicio: 'estima-directa',
      solve(k) {
        const ct = k.ct({ dm: -1, desvio: 3 });
        const rv = k.rv(220, ct);
        const dv = k.dvM(rv, 100, 'punta-europa');
        const s = k.fixDist('punta-europa', dv, 3.4, 'Situación 09:00');
        const p = k.fromMark('isla-tarifa', 180, 3, 'Punto a 3 millas al S de Isla de Tarifa');
        const { rv: rv1 } = k.rhumb(s, p);
        const a = k.run(s, rv1, k.distFor(8, hrb(9, 42) - hrb(9, 0)), 'Situación 09:42');
        // Enmendar 10° a estribor es sumar 10° al rumbo; el nuevo desvío (2° +) solo cambiaría el Ra que hay que dar.
        const rv2 = rv1 + 10;
        k.note('Nuevo rumbo', `Caemos 10° a estribor: Rv = ${Math.round(rv1)}° + 10° = ${Math.round(rv2)}°.`);
        return latlon(traves(k, a, rv2, 'punta-cires', 'babor', 'Través de Punta Cires'));
      },
    },
    'dgmm-per-2023-11-45': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: -5, desvio: 2 });
        k.note('Rumbo', `El Ra 275° no interviene en la situación: la oposición y la demora de Punta de Gracia bastan.`);
        const dvOp = k.oposicion('punta-malabata', 'punta-paloma');
        const dvG = k.dv(337, ct, 'punta-gracia');
        const s = k.lineAndBearing('punta-malabata', dvOp, 'punta-gracia', dvG, 'Situación 12:00');
        const { rv } = k.rhumb(s, 'cabo-trafalgar');
        const ra = k.ra(rv, k.ct({ dm: -5, desvio: 4 }));
        const t = traves(k, s, rv, 'barbate-faro', 'estribor', 'Través de Barbate');
        return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(12, 0), k.distanceBetween(s, t), 8) }];
      },
    },
    'dgmm-per-2023-11-90': {
      ejercicio: 'estima-directa',
      solve(k) {
        // Al S verdadero del faro de Barbate (lo vemos en Dv 000°) y a 11 millas de Espartel: el corte del N.
        const s = k.fixBearingRange('barbate-faro', 0, 'cabo-espartel', 11, 0, 'Situación 12:00');
        const { rv } = k.rhumb(s, 'isla-tarifa');
        const a = traves(k, s, rv, 'punta-paloma', 'babor', 'Través de Punta Paloma');
        const d1 = k.distanceBetween(s, a);
        const rv2 = k.rv(91, k.ct({ dm: -2, desvio: 1 }));
        const d2 = k.distFor(10, hrb(13, 48) - hrb(12, 0)) - d1;
        return latlon(k.run(a, rv2, d2, 'Situación 13:48'));
      },
    },
  },
  documentadas: {
    'dgmm-per-2023-11-89': {
      tipo: 'sin-calculo',
      texto: 'La situación de las 14:00 es el corte de la demora de Cabo Espartel (Rv = 085° − 5° = 080°, marcación 63° Er → '
        + 'Dv = 143°) con el veril de 200 m, que se lee en la carta de papel: la carta de la app no trae sondas ni isobáticas. '
        + 'El resultado depende mucho de ese corte (cada milla sobre la demora cambia el rumbo unos 5°): la opción oficial, '
        + 'Ra = 064° (Rv = 066°, Ct = −2° + 4° = +2°) hacia el punto 5 millas al N de Punta Malabata, corresponde a estar a '
        + 'unas 2,8 millas de Espartel sobre esa demora (≈ 35° 49,8′ N, 5° 57,5′ W).',
    },
  },
};

// Resueltas, pero el lector de opciones (src/exams/options.js) aún no sabe leer su formato y el test no puede
// comprobarlas: «2º (-)» (el signo entre paréntesis se pierde: 2º (+) y 2º (−) leen igual) y «35º 49'8 N» (décimas
// de minuto tras el apóstrofo). Se pasarán a `soluciones` cuando el lector las entienda.
export const pendientesLector = {
    'dgmm-per-2023-04-88': {
      ejercicio: 'ct-enfilacion',
      solve(k) {
        const dv = k.oposicion('cabo-trafalgar', 'cabo-espartel');
        k.note('Declinación', 'La dm (1° W) no hace falta: la Ct sale directamente de Dv − Da.');
        return [{ kind: 'signed', value: k.ctFrom(dv, 169) }];
      },
    },
    'dgmm-per-2023-11-87': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        // Hay dos cortes: nos quedamos con el que está al W de Cabo Espartel, como dice el enunciado.
        return latlon(k.fixBearingRange('punta-malabata', 94, 'cabo-espartel', 5, 1, 'Situación 12:00'));
      },
    },
};
