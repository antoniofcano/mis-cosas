// Soluciones programadas de las preguntas de carta del PER de la DGMM, convocatorias de 2019.
// Formato: el de andalucia-per-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).

// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];
const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];

export default {
  soluciones: {
    // ---- Junio 2019
    'dgmm-per-2019-06-45': {
      ejercicio: 'distancia-faro',
      solve(k) {
        // El enunciado dice 35°01,7′ N, fuera de la carta y a más de 60 millas de Punta Carnero, lejos de todas las
        // opciones (7,4′ a 8,1′): es una errata por 36°01,7′ N. El tribunal dio por válidas a y d (7,4′ y 7,6′).
        k.note('Situación', 'La latitud del enunciado (35°01,7′ N) cae fuera de la carta: es una errata por 36°01,7′ N, la única que da distancias como las de las opciones.');
        const s = k.pos('36 01,7 N', '5 17,0 W', 'Situación');
        return [{ kind: 'distance', value: k.distanceBetween(s, 'punta-carnero') }];
      },
    },
    'dgmm-per-2019-06-44': {
      // Anulada (todas las respuestas válidas). Se resuelve para practicar: las cuatro opciones están a 0,2′ unas de otras
      // y a más de 2′ de la cuenta.
      ejercicio: 'estima-directa',
      solve(k) {
        const dv = k.oposicion('cabo-trafalgar', 'punta-alcazar');
        const s = k.fixDist('punta-alcazar', dv, 26.6, 'Situación 10:05');
        const { rv } = k.rhumb(s, 'punta-malabata');
        const p = k.run(s, rv, k.distFor(5, 135), 'Situación de estima 12:20');
        k.note('Las opciones', 'Las cuatro opciones están a 0,2′ unas de otras y a más de 2′ de la cuenta: no se pueden distinguir, y por eso el tribunal dio todas por válidas.');
        return latlon(p);
      },
    },
    'dgmm-per-2019-06-90': {
      // Anulada (todas las respuestas válidas). Con los datos del enunciado sale Ra ≈ 095°: la más próxima es a (094,8°).
      ejercicio: 'rumbo-pasar-distancia',
      solve(k, q) {
        const s0 = k.pos('36 02,2 N', '6 10,0 W', 'Situación de salida');
        const s = k.run(s0, 97, 15.6, 'Situación tras 15,6 millas');
        const destino = k.fromMark('isla-tarifa', 180, 1, '1 milla al S de Isla de Tarifa');
        const { rv } = k.rhumb(s, destino);
        // El enunciado no da la declinación: tomamos la de la carta para el año de la convocatoria.
        const ct = k.ct({ carta: L105, anyo: Number(q.fecha.slice(0, 4)), desvio: 2 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
  },
  documentadas: {
    'dgmm-per-2019-06-42': {
      tipo: 'anulada',
      texto: 'No la resolvemos: faltan datos. El enunciado da un rumbo de aguja (154,8°) sin desvío ni declinación, y no dice si estamos entre los dos faros o en la prolongación de la alineación. Con la declinación de la carta para 2019 y sin desvío, entre los faros sale 35° 56,2′ N 005° 17,5′ W; en la prolongación al SW de Carnero, 35° 54,4′ N 005° 21,9′ W. Ninguna opción coincide del todo.',
    },
    'dgmm-per-2019-06-87': {
      tipo: 'anulada',
      texto: 'No la resolvemos: la oposición de Isla de Tarifa y Punta de los Judíos necesita la situación de Punta de los Judíos, que no está entre los puntos de la carta de la app. En tu carta: une Tarifa con Punta de los Judíos y Punta de Gracia con Punta Malabata; la situación es el corte de las dos rectas. Las cuatro opciones están a 0,2′ unas de otras.',
    },
    'dgmm-per-2019-06-89': {
      tipo: 'sin-calculo',
      texto: 'Se mide en la carta con el compás la distancia de Punta Altares al faro de Isla de Tarifa (oficial b, 11,5 millas). Punta Altares no figura entre los puntos de la carta de la app ni el enunciado da su posición, así que no hay cálculo que programar: es una lectura directa de la carta.',
    },
  },
};

/* ANULADAS SIN SOLUCIÓN PROGRAMADA
- dgmm-per-2019-06-42: situados a 2 millas de Punta Carnero en la alineación Punta Carnero–Punta Europa, Rv = 154,8° − 5,2° =
  149,6° y 10,5 millas: sale 35°56,6′ N 5°16,7′ W (entre los dos faros) o 35°54,8′ N 5°21,1′ W (en la prolongación al SW de
  Carnero). Ninguna coincide con las opciones; el tribunal la anuló.
- dgmm-per-2019-06-87: la oposición Isla de Tarifa–Punta de los Judíos necesita la posición de Punta de los Judíos, que no está
  en la carta de la app; anulada.
*/
