// Soluciones programadas de las preguntas de carta del PER de la DGMM, convocatorias de 2022.
// Formato: el de andalucia-per-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];
const anyoDe = (q) => Number(q.fecha.slice(0, 4));

// Marca cardinal E de la granja acuícola al S de Barbate (no está entre los puntos de la carta de la app). Su posición
// es la de la respuesta oficial de dgmm-per-2021-02-42 («la marca cardinal Este situada al sur de Barbate»: d,
// 36°09′ N 5°55,3′ W).
const CARDINAL_E_BARBATE = { id: 'cardinal-e-barbate', name: 'Marca cardinal E de Barbate', lat: 36 + 9 / 60, lon: -(5 + 55.3 / 60) };

export default {
  soluciones: {
    // ---- Abril 2022
    'dgmm-per-2022-04-42': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const s = k.fromMark('cabo-trafalgar', 180, 3.5, 'Situación de salida');
        const destino = k.fromMark(CARDINAL_E_BARBATE, 180, 2, '2 millas al S de la cardinal E');
        const { rv } = k.rhumb(s, destino);
        // El enunciado fecha la navegación el 5 de abril de 2013: declinación de la carta para 2013.
        const ct = k.ct({ carta: L105, anyo: 2013, desvio: -2 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2022-04-87': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        // Fecha del enunciado: 3 de noviembre de 2021.
        const ct = k.ct({ carta: L105, anyo: 2021, desvio: -2 });
        const rv = k.rv(308, ct);
        const d1 = k.dvM(rv, 115, 'cabo-trafalgar');
        const d2 = k.dvM(rv, 55, 'cabo-roche');
        return latlon(k.fix2('cabo-trafalgar', d1, 'cabo-roche', d2, 'Situación 02:45'));
      },
    },
    'dgmm-per-2022-04-43': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k) {
        const ct = k.ct({ dm: -5, desvio: 0 });
        k.note('Rumbos cuadrantales', 'Ra = N 45° E = 045°; Da de Cabo Espartel = S 20° E = 180° − 20° = 160°.');
        const rv = k.rv(45, ct);
        const d1 = k.dv(160, ct, 'cabo-espartel');
        const d2 = k.dvM(rv, 70, 'punta-malabata');
        const s = k.fix2('cabo-espartel', d1, 'punta-malabata', d2, 'Situación 21:20');
        // Hacia el E por el lado marroquí: Punta Cires (al S de la derrota) queda por estribor.
        const r = k.tangent(s, 'punta-cires', 3, 'estribor');
        const p = k.corteRumbo(s, r, 'isla-tarifa', 0, 'Al S verdadero de Isla de Tarifa');
        return [{ kind: 'clock', value: k.eta(hrb(21, 20), k.distanceBetween(s, p), 12) }];
      },
    },
    'dgmm-per-2022-04-88': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k) {
        const ct = k.ct({ dm: -4, desvio: -1 });
        const d1 = k.dv(327, ct, 'cabo-trafalgar');
        const d2 = k.dv(33, ct, 'barbate-faro');
        const s = k.fix2('cabo-trafalgar', d1, 'barbate-faro', d2, 'Situación 10:00');
        // Hacia el SE a lo largo de la costa: Punta Paloma queda por babor.
        const r = k.tangent(s, 'punta-paloma', 3, 'babor');
        // Punta de Gracia (faro de Camarinal) por el través de babor: Dv = Rv − 90°.
        const p = k.corteRumbo(s, r, 'punta-gracia', r - 90, 'Punta de Gracia por el través');
        return [{ kind: 'clock', value: k.eta(hrb(10), k.distanceBetween(s, p), 10) }];
      },
    },
    // ---- Junio 2022
    'dgmm-per-2022-06-87': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: -4, desvio: -1 });
        const d1 = k.dv(359, ct, 'punta-europa');
        const d2 = k.dv(237, ct, 'punta-cires');
        const s = k.fix2('punta-europa', d1, 'punta-cires', d2, 'Situación 10:00');
        const destino = k.fromMark('isla-tarifa', 180, 2, '2 millas al S de Isla de Tarifa');
        const { rv, dist } = k.rhumb(s, destino);
        return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(10), dist, 10) }];
      },
    },
    'dgmm-per-2022-06-43': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k) {
        const e = k.enfilacion('punta-carnero', 'punta-europa', 63);
        const s = k.lineAndBearing('punta-carnero', e, 'punta-almina', 180, 'Situación de salida');
        // Hacia el WSW, Punta Carnero (al N de la derrota) queda por estribor.
        const rv = k.tangent(s, 'punta-carnero', 2, 'estribor');
        const ct = k.ct({ ct: 5 });
        // Sale 36°08,2′ N 5°16,8′ W y Ra ≈ 224°: la a. Las opciones escriben la longitud con un acento grave
        // («005º 16,8`W») que el lector de opciones no reconoce, así que comparamos la latitud y el Ra.
        return [{ kind: 'lat', value: s.lat }, { kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2022-06-88': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const ct = k.ct({ dm: -4, desvio: 1 });
        const rv = k.rv(281, ct);
        const d1 = k.dvM(rv, 65, 'punta-paloma');
        const d2 = k.dvM(rv, 157, 'isla-tarifa');
        return latlon(k.fix2('punta-paloma', d1, 'isla-tarifa', d2, 'Situación 10:45'));
      },
    },
    'dgmm-per-2022-06-44': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        // Fecha del enunciado: 1 de abril de 2022.
        const ct = k.ct({ carta: L105, anyo: 2022, desvio: -2 });
        const rv = k.rv(265, ct);
        const d1 = k.dv(140, ct, 'punta-malabata');
        const d2 = k.dvM(rv, -48, 'cabo-espartel');
        return latlon(k.fix2('punta-malabata', d1, 'cabo-espartel', d2, 'Situación 05:18'));
      },
    },
    'dgmm-per-2022-06-89': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k) {
        // Saliendo de Trafalgar hacia el SE, la cardinal E de Barbate (al NE) queda por babor.
        const rv = k.tangent('cabo-trafalgar', CARDINAL_E_BARBATE, 3, 'babor');
        // Fecha del enunciado: 24 de mayo de 2022.
        const ct = k.ct({ carta: L105, anyo: 2022, desvio: -3 });
        return [{ kind: 'bearing', value: rv }, { kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2022-06-45': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: -3, desvio: -1 });
        k.note('Rumbos cuadrantales', 'Ra = S 83° E = 180° − 83° = 097°; Da de Isla de Tarifa = N 60° E = 060°.');
        const rv = k.rv(97, ct);
        const d1 = k.dvM(rv, 88, 'punta-malabata');
        const d2 = k.dv(60, ct, 'isla-tarifa');
        const s = k.fix2('punta-malabata', d1, 'isla-tarifa', d2, 'Situación 22:45');
        const destino = k.fromMark('punta-cires', 0, 2, '2 millas al N de Punta Cires');
        const r = k.rhumb(s, destino);
        // Seguimos al mismo rumbo hasta tener Punta Europa al N verdadero (Dv = 000°).
        const p = k.corteRumbo(s, r.rv, 'punta-europa', 0, 'Al S verdadero de Punta Europa');
        return [{ kind: 'clock', value: k.eta(hrb(22, 45), k.distanceBetween(s, p), 8) }];
      },
    },
    // ---- Octubre 2022
    'dgmm-per-2022-10-87': {
      ejercicio: 'situacion-dos-distancias',
      solve(k) {
        // El otro corte de los arcos (36°04,5′ N 5°39,4′ W) cae en tierra, en la costa entre Punta Paloma y Tarifa.
        return latlon(k.fix2Ranges('isla-tarifa', 5, 'punta-paloma', 3, { lat: 35.9, lon: -5.7 }));
      },
    },
    'dgmm-per-2022-10-43': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const s = k.pos('36 05,0 N', '6 20,0 W', 'Situación de salida');
        const destino = k.fromMark('cabo-trafalgar', 180, 6, '6 millas al S de Cabo Trafalgar');
        const { rv } = k.rhumb(s, destino);
        const ct = k.ct({ ct: -1 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2022-10-44': {
      ejercicio: 'ct-enfilacion',
      solve(k) {
        const dv = k.oposicion('punta-malabata', 'punta-gracia');
        return [{ kind: 'signed', value: k.ctFrom(dv, 350) }];
      },
    },
    'dgmm-per-2022-10-45': {
      ejercicio: 'estima-directa',
      solve(k) {
        // «Demora de agua a Punta Carnero»: errata por demora de aguja.
        const ct = k.ct({ dm: -1, desvio: -3 });
        const d1 = k.dv(36, ct, 'punta-europa');
        const d2 = k.dv(304, ct, 'punta-carnero');
        const s = k.fix2('punta-europa', d1, 'punta-carnero', d2, 'Situación 21:00');
        const destino = k.fromMark('isla-tarifa', 180, 1.5, '1,5 millas al S de Isla de Tarifa');
        const { rv } = k.rhumb(s, destino);
        const d = k.distFor(6, hrb(22, 40) - hrb(21));
        return latlon(k.run(s, rv, d, 'Situación 22:40'));
      },
    },
    'dgmm-per-2022-10-90': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        // En el enunciado se han perdido los guiones: «oposición Cabo TrafalgarCabo Espartel», «desvío de 6º ()» y
        // «desvío de 8º ()». Son desvíos negativos, 6° (−) y 8° (−), como confirma la respuesta oficial.
        const ct1 = k.ct({ dm: -2, desvio: -6 });
        const op = k.oposicion('cabo-espartel', 'cabo-trafalgar');
        const s = k.lineAndBearing('cabo-trafalgar', op, 'punta-gracia', k.dv(45, ct1, 'punta-gracia'), 'Situación 10:00');
        const destino = k.fromMark('punta-cires', 0, 2, '2 millas al N de Punta Cires');
        const r1 = k.rhumb(s, destino);
        const ct2 = k.ct({ dm: -2, desvio: -8 });
        const dvC = k.dv(245, ct2, 'punta-cires');
        const s2 = k.corteRumbo(s, r1.rv, 'punta-cires', dvC, 'Punta Cires a la demora de aguja dada');
        const d1 = k.distanceBetween(s, s2);
        const p = k.pos('36 09,0 N', '5 23,4 W', 'Punto p');
        const r2 = k.rhumb(s2, p);
        const ct3 = k.ct({ dm: -2, desvio: 4 });
        const ra = k.ra(r2.rv, ct3);
        const op2 = k.oposicion('punta-carnero', 'punta-europa');
        const s3 = k.corteRumbo(s2, r2.rv, 'punta-europa', op2, 'Oposición Punta Carnero–Punta Europa');
        const d2 = k.distanceBetween(s2, s3);
        k.note('Distancia total', `De las 10:00 a la oposición navegamos ${(d1 + d2).toFixed(1).replace('.', ',')} millas a 5 nudos.`);
        return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(10), d1 + d2, 5) }];
      },
    },
    // ---- Diciembre 2022
    'dgmm-per-2022-12-88': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        // Fecha del enunciado: 7 de diciembre de 2022. El Ra 275° no interviene: las dos demoras son de aguja.
        const ct = k.ct({ carta: L105, anyo: 2022, desvio: -3 });
        const d1 = k.dv(334, ct, 'cabo-trafalgar');
        const d2 = k.dv(204, ct, 'cabo-espartel');
        return latlon(k.fix2('cabo-trafalgar', d1, 'cabo-espartel', d2, 'Situación 17:45 UTC'));
      },
    },
    'dgmm-per-2022-12-43': {
      ejercicio: 'ct-enfilacion',
      solve(k) {
        // Las opciones escriben el signo entre paréntesis: «5° (+)».
        const dv = k.oposicion('cabo-espartel', 'cabo-trafalgar');
        return [{ kind: 'signed', value: k.ctFrom(dv, 342) }];
      },
    },
    'dgmm-per-2022-12-44': {
      ejercicio: 'rumbo-distancia',
      solve(k, q) {
        const s = k.pos('36 04,0 N', '6 01,0 W', 'Posición A');
        const { rv } = k.rhumb(s, 'cabo-trafalgar');
        const ct = k.ct({ carta: L105, anyo: anyoDe(q), desvio: -3 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2022-12-89': {
      ejercicio: 'ct-enfilacion',
      solve(k) {
        // La distancia a la cardinal E y el desvío no intervienen: la Ct sale de la oposición y la Da.
        const dv = k.oposicion('punta-gracia', 'cabo-trafalgar');
        return [{ kind: 'signed', value: k.ctFrom(dv, 297) }];
      },
    },
    'dgmm-per-2022-12-45': {
      ejercicio: 'rumbo-distancia',
      solve(k) {
        const ct = k.ct({ dm: -1, desvio: 2 });
        const d1 = k.dv(45, ct, 'cabo-trafalgar');
        // Punta Camarinal: el faro de Punta de Gracia.
        const d2 = k.dv(90, ct, 'punta-gracia');
        const s = k.fix2('cabo-trafalgar', d1, 'punta-gracia', d2, 'Situación 15:00');
        const { rv } = k.rhumb(s, 'punta-malabata');
        k.note('Rumbo a Punta Malabata', 'El nuevo desvío (1° +) solo cambia el Ra; la derrota es la recta a Punta Malabata.');
        const p = k.corteRumbo(s, rv, 'cabo-espartel', 180, 'Al N verdadero de Cabo Espartel');
        return [...latlon(p), { kind: 'clock', value: k.eta(hrb(15), k.distanceBetween(s, p), 10) }];
      },
    },
    'dgmm-per-2022-12-90': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k) {
        const ct = k.ct({ ct: -5 });
        k.note('Rumbo cuadrantal', 'Ra = S 50° W = 180° + 50° = 230°.');
        const rv = k.rv(230, ct);
        const d1 = k.dvM(rv, 35, 'punta-leona');
        const d2 = k.dv(210, ct, 'punta-almina');
        const s = k.fix2('punta-leona', d1, 'punta-almina', d2, 'Situación 10:00');
        const destino = k.fromMark('punta-cires', 0, 5, '5 millas al N de Punta Cires');
        const r = k.rhumb(s, destino);
        return [{ kind: 'bearing', value: k.ra(r.rv, ct) }];
      },
    },
  },
  documentadas: {
    'dgmm-per-2022-04-44': {
      tipo: 'sin-calculo',
      texto: 'Se pide situar en la carta 36°07,3′ N 5°45,8′ W y decir qué hay: el pico más alto de la Sierra de la Plata, junto a la ensenada de Bolonia (oficial a). No hay cálculo: es una lectura de la carta.',
    },
    'dgmm-per-2022-06-42': {
      tipo: 'sin-calculo',
      texto: 'La salida sí se calcula (oposición Cabo Trafalgar–Punta de Gracia y faro de Barbate al NE verdadero: 36°09,3′ N 5°57,8′ W), pero el destino es el pecio al NE del faro de Punta Frailecillo, junto a Cabo Espartel, que no está entre los puntos de la carta de la app ni lo sitúa ningún enunciado: el rumbo se mide en la carta. La oficial es d, Rv = 172°.',
    },
    'dgmm-per-2022-10-89': {
      tipo: 'sin-calculo',
      texto: 'La oposición es entre el faro de Punta de Gracia y la marca cardinal N cercana a Punta Malabata, que no está entre los puntos de la carta de la app ni la sitúa ningún enunciado: la Dv de la recta se mide en la carta. Como referencia, la recta Punta de Gracia → faro de Punta Malabata sale 169,9°; con la marca, algo al N del faro, la Dv ronda los 172° y Ct = Dv − Da = 172° − 176° = −4°, la oficial (c).',
    },
  },
};

/* ANULADAS SIN SOLUCIÓN PROGRAMADA
- dgmm-per-2022-06-90: las opciones son situaciones dadas por demora y distancia a dos faros distintos (Punta Cires y Punta
  Almina), que no se comparan como una sola magnitud; anulada.
*/
