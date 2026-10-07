// Soluciones programadas de las preguntas de carta del PER de la DGMM, convocatorias de 2021.
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
    // ---- Febrero 2021
    'dgmm-per-2021-02-87': {
      ejercicio: 'ct-enfilacion',
      solve(k) {
        const dv = k.enfilacion('cabo-roche', 'cabo-trafalgar', 323);
        return [{ kind: 'signed', value: k.ctFrom(dv, 323) }];
      },
    },
    'dgmm-per-2021-02-43': {
      ejercicio: 'distancia-faro',
      solve(k) {
        return [{ kind: 'distance', value: k.distanceBetween('punta-paloma', 'punta-malabata') }];
      },
    },
    'dgmm-per-2021-02-89': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        // La demora de Punta Paloma corta el arco de 3,5 millas de Punta de Gracia en dos puntos: uno en la ensenada de
        // Bolonia (36°03,8′ N 5°44,7′ W) y otro al W de Punta de Gracia, frente a Zahara, en la zona de almadrabas que la
        // carta marca como prohibida a la pesca. El enunciado pide este último.
        return latlon(k.fixBearingRange('punta-paloma', 84, 'punta-gracia', 3.5, 1));
      },
    },
    'dgmm-per-2021-02-90': {
      ejercicio: 'estima-directa',
      solve(k) {
        const s = k.fromMark('punta-malabata', 350, 5, 'Situación 16:18');
        k.note('Rumbo verdadero', 'El Rv = 307° es dato: la Ct no hace falta.');
        const d = k.distFor(12, hrb(17, 8) - hrb(16, 18));
        return latlon(k.run(s, 307, d, 'Situación 17:08'));
      },
    },
    // ---- Abril 2021
    'dgmm-per-2021-04-42': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const ct = k.ct({ ct: -6 });
        const d1 = k.dv(318, ct, 'isla-tarifa');
        const d2 = k.dv(22, ct, 'punta-carnero');
        return latlon(k.fix2('isla-tarifa', d1, 'punta-carnero', d2, 'Situación 11:00'));
      },
    },
    'dgmm-per-2021-04-88': {
      // Válidas c y d (31,5 y 31,8 millas).
      ejercicio: 'distancia-faro',
      solve(k) {
        return [{ kind: 'distance', value: k.distanceBetween('cabo-trafalgar', 'punta-cires') }];
      },
    },
    'dgmm-per-2021-04-44': {
      ejercicio: 'estima-directa',
      solve(k) {
        const s = k.pos('35 58,0 N', '5 59,0 W', 'Situación de salida');
        const d = k.distFor(7.2, 120);
        return latlon(k.run(s, 106, d, 'Situación final'));
      },
    },
    'dgmm-per-2021-04-45': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k, q) {
        const s = k.fromMark('punta-europa', 180, 4.7, 'Situación de salida');
        // Navegando hacia el W, Isla de Tarifa (al N de la derrota) queda por estribor.
        const rv = k.tangent(s, 'isla-tarifa', 1, 'estribor');
        const ct = k.ct({ carta: L105, anyo: anyoDe(q), desvio: -1 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2021-04-90': {
      ejercicio: 'situacion-dos-distancias',
      solve(k) {
        // Los arcos se cortan en 36°00,0′ N 5°23,4′ W (al SW de Punta Carnero, a la entrada de la bahía de Algeciras) y
        // en 36°01,8′ N 5°14,4′ W (al E de Punta Europa, fuera del dispositivo). El enunciado nos pone en la zona de
        // precaución del dispositivo: el corte del W.
        return latlon(k.fix2Ranges('punta-almina', 8, 'punta-europa', 7, { lat: 36.05, lon: -5.4 }));
      },
    },
    // ---- Julio 2021
    'dgmm-per-2021-07-87': {
      ejercicio: 'situacion-dos-distancias',
      solve(k) {
        // El otro corte de los arcos (35°44,7′ N 5°48,9′ W) cae en tierra, al S de Tánger.
        return latlon(k.fix2Ranges('cabo-espartel', 6, 'punta-malabata', 5.5, { lat: 36, lon: -5.85 }));
      },
    },
    'dgmm-per-2021-07-44': {
      ejercicio: 'rumbo-distancia',
      solve(k, q) {
        const llegada = k.fromMark('punta-europa', 180, 3, 'Punto de llegada');
        const { rv } = k.rhumb('ceuta-bocana', llegada);
        // El enunciado solo da el desvío: la declinación es la de la carta para el año de la convocatoria.
        const ct = k.ct({ carta: L105, anyo: anyoDe(q), desvio: -1 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2021-07-90': {
      ejercicio: 'distancia-faro',
      solve(k) {
        const a = k.pos('36 20,0 N', '6 19,0 W', 'Posición A');
        const b = k.pos('36 20,0 N', '6 10,0 W', 'Posición B');
        k.note('Mismo paralelo', 'A y B están en el mismo paralelo: la distancia es el apartamiento, A = ΔL · cos l = 9′ × cos 36°20′ ≈ 7,3 millas. En la carta se mide con el compás en la escala de latitudes, a la altura del paralelo.');
        return [{ kind: 'distance', value: k.distanceBetween(a, b) }];
      },
    },
    // ---- Octubre 2021
    'dgmm-per-2021-10-43': {
      ejercicio: 'situacion-dos-demoras',
      solve(k, q) {
        const ct = k.ct({ carta: L105, anyo: anyoDe(q), desvio: 1 });
        const dv = k.dv(341, ct, 'barbate-espigon');
        const op = k.oposicion('cabo-trafalgar', 'punta-gracia');
        return latlon(k.lineAndBearing('punta-gracia', op, 'barbate-espigon', dv));
      },
    },
    'dgmm-per-2021-10-88': {
      ejercicio: 'estima-directa',
      solve(k) {
        // El enunciado fecha la navegación el 16 de octubre de 2010: declinación de la carta para 2010.
        const s = k.pos('35 59,0 N', '5 14,0 W', 'Situación 11:06');
        const ct = k.ct({ carta: L105, anyo: 2010, desvio: 3.5 });
        const rv = k.rv(10, ct);
        const d = k.distFor(12, hrb(12, 12) - hrb(11, 6));
        return latlon(k.run(s, rv, d, 'Situación 12:12'));
      },
    },
    'dgmm-per-2021-10-44': {
      ejercicio: 'estima-directa',
      solve(k, q) {
        const s = k.fixDist('punta-almina', 204, 5.5, 'Situación 12:06');
        const ct = k.ct({ carta: L105, anyo: anyoDe(q), desvio: 3.5 });
        const rv = k.rv(10, ct);
        const d = k.distFor(12, hrb(13, 12) - hrb(12, 6));
        return latlon(k.run(s, rv, d, 'Situación 13:12'));
      },
    },
    'dgmm-per-2021-10-89': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        const dv = k.dvM(312, 25, 'punta-paloma');
        const ct = k.ctFrom(dv, 344);
        const ra = k.ra(312, ct);
        const op = k.oposicion('punta-malabata', 'isla-tarifa');
        const s = k.lineAndBearing('isla-tarifa', op, 'punta-paloma', dv);
        return [{ kind: 'bearing', value: ra }, ...latlon(s)];
      },
    },
    'dgmm-per-2021-10-45': {
      ejercicio: 'rumbo-distancia',
      solve(k, q) {
        const s = k.fromMark('cabo-trafalgar', 225, 3, 'Situación de salida');
        const a = k.pos('36 00,0 N', '6 01,0 W', 'Punto A');
        const { rv } = k.rhumb(s, a);
        const ct = k.ct({ carta: L105, anyo: anyoDe(q), desvio: -3 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    'dgmm-per-2021-10-90': {
      ejercicio: 'rumbo-distancia',
      solve(k, q) {
        const llegada = k.fromMark('isla-tarifa', 270, 3.4, 'Punto de llegada');
        const { rv } = k.rhumb('tanger-espigon', llegada);
        const ct = k.ct({ carta: L105, anyo: anyoDe(q), desvio: -2 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    // ---- Diciembre 2021
    'dgmm-per-2021-12-87': {
      ejercicio: 'situacion-dos-demoras',
      solve(k) {
        // Punta Camarinal: el faro de Punta de Gracia.
        const dv = k.dvM(295, 25, 'punta-gracia');
        const ct = k.ctFrom(dv, 320);
        const ra = k.ra(295, ct);
        const op = k.oposicion('punta-malabata', 'isla-tarifa');
        const s = k.lineAndBearing('isla-tarifa', op, 'punta-gracia', dv, 'Situación 13:12');
        return [{ kind: 'bearing', value: ra }, ...latlon(s)];
      },
    },
    'dgmm-per-2021-12-43': {
      ejercicio: 'estima-directa',
      solve(k) {
        // El enunciado fecha la navegación el 18 de diciembre de 2010: declinación de la carta para 2010. Sale
        // 36°06,8′ N 5°59,1′ W: la d (36°06,5′ N 5°57,5′ W) es la más próxima, con 1,6′ de diferencia en longitud.
        const s = k.pos('36 01,0 N', '6 01,0 W', 'Situación 11:42');
        const ct = k.ct({ carta: L105, anyo: 2010, desvio: -3 });
        const rv = k.rv(20, ct);
        const d = k.distFor(4, hrb(13, 12) - hrb(11, 42));
        return latlon(k.run(s, rv, d, 'Situación 13:12'));
      },
    },
    'dgmm-per-2021-12-88': {
      ejercicio: 'estima-directa',
      solve(k) {
        const s = k.pos('35 45,0 N', '5 14,0 W', 'Situación de salida');
        const d = k.distFor(5, 60);
        return latlon(k.run(s, 0, d, 'Situación final'));
      },
    },
    'dgmm-per-2021-12-89': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k, q) {
        const s = k.fromMark(CARDINAL_E_BARBATE, 45, 1.5, 'Situación de salida');
        // Navegando hacia el W, Cabo Trafalgar (al N de la derrota) queda por estribor.
        const rv = k.tangent(s, 'cabo-trafalgar', 2, 'estribor');
        const ct = k.ct({ carta: L105, anyo: anyoDe(q), desvio: -2 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
  },
  documentadas: {
    'dgmm-per-2021-02-42': {
      tipo: 'sin-calculo',
      texto: 'Se pide reconocer en la carta la marca cardinal E de la granja acuícola al S de Barbate y leer su posición: no hay cálculo. La oficial (d, 36°09′ N 5°55,3′ W) es la posición que usamos para esa marca en dgmm-per-2021-12-89. Las opciones b y c, con longitud E, quedan fuera de la carta.',
    },
    'dgmm-per-2021-02-88': {
      tipo: 'sin-calculo',
      texto: 'La salida es la marca especial al E de La Línea de la Concepción, que no está entre los puntos de la carta de la app y cuya posición no da ningún enunciado ni respuesta oficial: hay que leerla en la carta. Con la declinación de la carta para 2021 (0°58′ W) y desvío 3,5° E, Ct = +2,5°; la oficial (b, Ra = 155°) supone un Rv ≈ 157,5° para pasar a 4,2 millas de Punta Almina.',
    },
    'dgmm-per-2021-02-44': {
      tipo: 'discrepancia',
      texto: 'En la oposición Punta Europa–Punta Carnero la demora verdadera a Carnero es la de la recta Europa → Carnero, que en la carta sale 243,5°. Ct = Dv − Da = 243,5° − 255° = −11,5°. La oficial es c, «10º» sin signo, frente a b «10º +»: el tribunal toma la Ct negativa y mide la recta como 245°. El sentido coincide; el valor difiere 1,5° y la opción, escrita sin signo, se lee como +10°, así que la comparación automática no puede llegar a ella. Es la misma pregunta que dgmm-per-2020-12-177 con otra Da.',
    },
    'dgmm-per-2021-02-45': {
      tipo: 'sin-calculo',
      texto: 'El rumbo verdadero es el del dispositivo de separación de tráfico del Estrecho en sentido NE, que se lee en la carta; el trazado del dispositivo no está en los datos de la carta de la app. Con la declinación de la carta para 2021 (2°50′ W − 16 × 7′ = 0°58′ W) y desvío 1° W, Ct = −2°; la oficial (c, Ra = 074,5°) corresponde a un Rv del dispositivo de 072,5°.',
    },
    'dgmm-per-2021-04-87': {
      tipo: 'sin-calculo',
      texto: 'Misma pregunta que dgmm-per-2021-02-45: el Rv es el del dispositivo de separación de tráfico en sentido NE, que se lee en la carta y no está en sus datos. Con Ct = −2° (declinación 2021 0°58′ W y desvío 1° W), la oficial (a, Ra = 074,5°) corresponde a un Rv de 072,5°.',
    },
    'dgmm-per-2021-07-42': {
      tipo: 'sin-calculo',
      texto: 'Se pide reconocer qué marca hay en la carta en 36°08,2′ N 5°55′ W: la marca cardinal S de la granja acuícola al S de Barbate (oficial d). No hay cálculo: se sitúa la posición en la carta y se mira el símbolo.',
    },
    'dgmm-per-2021-07-45': {
      tipo: 'sin-calculo',
      texto: 'Se mide en la carta con el compás la distancia de Punta Leona a Punta Kalúli o Sainar (oficial c, 5,5 millas). Punta Kalúli no figura entre los puntos de la carta de la app ni el enunciado da su posición: es una lectura directa de la carta.',
    },
  },
};
