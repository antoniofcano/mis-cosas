// Soluciones programadas de las preguntas de carta del PY de la DGMM, convocatorias de 2023.
// Formato: el de andalucia-py-*.js (cada `solve(k, q)` resuelve con el kit de src/exams/kit.js y devuelve los valores que
// se comparan con las opciones; tests/exams.test.js comprueba que llegan a la opción oficial). Carta L105: declinación
// 2°50′ W 2005 (7′ E); «la del año en curso» es la del año de la convocatoria (q.fecha).
// `documentadas`: preguntas de carta sin solución programada y por qué (tipo «discrepancia» o «sin-calculo»).
import { hrb } from '../kit.js';

const L105 = [-(2 + 50 / 60), 2005, 7];
const anyo = (q) => Number(q.fecha.slice(0, 4));
const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const NE = 45; const E = 90; const SE = 135; const S = 180; const SW = 225; const W = 270; const NW = 315;

export default {
  soluciones: {
    // ---- Abril 2023
    'dgmm-py-2023-04-31': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k) {
        const s = k.pos('36 13,0 N', '5 13,0 W', 'Situación 14:15');
        const ct = k.ct({ dm: -1, desvio: 1 });
        const rv = k.rv(215, ct);
        const rs = k.abatimiento(rv, 2, S);
        const { vb } = k.rumboYVelocidad(s, 'punta-europa', hrb(14, 45) - hrb(14, 15), 340, 2.4);
        k.note('Comprobación', `El Rs que sale del triángulo es prácticamente el que llevamos (${Math.round(rs)}°): con esa proa basta ajustar la velocidad de máquinas.`);
        return [{ kind: 'speed', value: vb }];
      },
    },
    'dgmm-py-2023-04-32': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k) {
        const d = k.distFor(10, hrb(16, 36) - hrb(16, 6));
        return latlon(k.traslado('cabo-trafalgar', 5, 'punta-gracia', 32, 115, d, 'Situación 16:36'));
      },
    },
    'dgmm-py-2023-04-33': {
      ejercicio: 'corriente-efectiva',
      solve(k, q) {
        const s = k.pos('36 05,6 N', '6 09,0 W', 'Situación 10:15');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -3 });
        const rv = k.rv(115, ct);
        k.note('Rumbo de superficie', 'Sin viento no hay abatimiento: Rs = Rv.');
        const { ref, vef } = k.efectivo(rv, 6, SE, 4, s);
        return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2023-04-34': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        // En la enfilación Paloma–Tarifa por fuera de Tarifa (hacia el SE): vemos Tarifa por delante de Paloma.
        const dv = k.enfilacion('punta-paloma', 'isla-tarifa', NW);
        return latlon(k.fixBearingRange('isla-tarifa', dv, 'punta-cires', 3, 0));
      },
    },
    'dgmm-py-2023-04-35': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k, q) {
        // Desde Europa hacia el SW pasamos por fuera (al N) de Cires: el faro queda por babor.
        const rv = k.tangent('punta-europa', 'punta-cires', 1.6, 'babor');
        const ref = rv + 2;
        k.note('Rumbo efectivo', `La corriente nos deriva 2° hacia el NNW, a estribor de la proa: Ref = Rv + 2° = ${Math.round(rv)}° + 2° = ${Math.round(ref)}°.`);
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -4 });
        return [{ kind: 'bearing', value: ref }, { kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    // 04-36: ver documentadas (discrepancia).
    'dgmm-py-2023-04-38': {
      ejercicio: 'estima-analitica',
      solve(k) {
        const a = k.pos('35 40,0 N', '7 15,0 W', 'Punto A');
        const b = k.pos('35 41,0 N', '6 15,0 W', 'Punto B');
        const { rumbo, dist } = k.rumboDirecto(a, b);
        return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
      },
    },
    'dgmm-py-2023-04-39': {
      ejercicio: 'rumbo-pasar-distancia',
      solve(k, q) {
        const s = k.pos('35 50,0 N', '6 07,0 W', 'Salida');
        // Navegamos hacia el E por fuera de Malabata: el faro queda por estribor.
        const rs = k.tangent(s, 'punta-malabata', 6.5, 'estribor');
        const rv = k.rvConAbatimiento(rs, 4, SE);
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: 2 });
        return [{ kind: 'bearing', value: k.ra(rv, ct) }];
      },
    },
    // 04-79: ver documentadas (discrepancia).
    'dgmm-py-2023-04-40': {
      ejercicio: 'corriente-efectiva',
      solve(k) {
        // El signo del desvío se perdió en el enunciado («3º()»). Con + no sale ninguna opción; con − sale la oficial,
        // y la misma pregunta de noviembre de 2024 (dgmm-py-2024-11-32) da la Ct negativa. Tomamos Δ = −3°.
        k.note('Desvío', 'El enunciado no trae el signo del desvío; lo tomamos negativo: Δ = −3°.');
        const ct = k.ct({ carta: L105, anyo: 2023, desvio: -3 });
        const s = k.fix2('cabo-trafalgar', k.dv(334, ct, 'cabo-trafalgar'), 'cabo-espartel', k.dv(204, ct, 'cabo-espartel'), 'Situación 18:15');
        const rv = k.rv(284, ct);
        const rs = k.abatimiento(rv, 3, NW);
        const { ref, vef } = k.efectivo(rs, 4.5, S, 2, s);
        return latlon(k.estimaEfectiva(s, ref, vef, hrb(20, 15) - hrb(18, 15), 'Situación 20:15'));
      },
    },

    // ---- Noviembre 2023
    'dgmm-py-2023-11-31': {
      ejercicio: 'corriente-efectiva',
      solve(k) {
        const dv = k.oposicion('cabo-trafalgar', 'punta-gracia');
        const s = k.fixDist('punta-gracia', dv, 4, 'Situación 10:15');
        const rv = k.rv(190, k.ct({ ct: 5 }));
        const rs = k.abatimiento(rv, 8, SE);
        const { ref, vef } = k.efectivo(rs, 4, 280, 2.5, s);
        return latlon(k.estimaEfectiva(s, ref, vef, hrb(12, 46) - hrb(10, 15), 'Situación 12:46'));
      },
    },
    'dgmm-py-2023-11-32': {
      ejercicio: 'situacion-demora-distancia',
      solve(k) {
        // En la enfilación Europa–Almina por el S de Almina (hacia Cabo Negro): vemos Almina al N con Europa detrás.
        const dv = k.enfilacion('punta-europa', 'punta-almina', N);
        return latlon(k.fixBearingRange('punta-almina', dv, 'cabo-negro', 7.6, 0));
      },
    },
    'dgmm-py-2023-11-34': {
      ejercicio: 'demoras-no-simultaneas',
      solve(k) {
        const d = k.distFor(9, hrb(12) - hrb(11, 6));
        // De los dos cortes del arco con la línea trasladada, el del SW: el otro (36° 12′ N) cae en tierra, al E de Barbate.
        return latlon(k.trasladoArco('cabo-trafalgar', 45, 'punta-gracia', 7, 110, d, (c) => c.sort((a, b) => a.lat - b.lat)[0], 'Situación 12:00'));
      },
    },
    'dgmm-py-2023-11-35': {
      ejercicio: 'estima-analitica',
      solve(k) {
        // El signo de la declinación se perdió en el enunciado («2º()»): la tomamos W (−2°), la habitual en la zona;
        // con E la latitud de llegada sale 6′ más al S y no encaja con ninguna opción.
        const s = k.pos('35 50,0 N', '6 10,0 W', 'Salida');
        k.note('Rumbos verdaderos', 'Rv = Ra + dm + Δ con dm = −2° (W): 080° + 3° − 2° = 081°; 090° + 2° − 2° = 090°; 075° + 0° − 2° = 073°; 085° − 2° − 2° = 081°.');
        k.note('Distancias', 'A 12 nudos: 1 h → 12 millas; 3 h → 36 millas; 1,5 h → 18 millas; 2 h → 24 millas.');
        return latlon(k.tramos(s, [
          { rumbo: 81, millas: 12 }, { rumbo: 90, millas: 36 }, { rumbo: 73, millas: 18 }, { rumbo: 81, millas: 24 },
        ], 'Situación final'));
      },
    },
    'dgmm-py-2023-11-36': {
      ejercicio: 'corriente-efectiva',
      solve(k, q) {
        const s = k.pos('35 50,0 N', '5 59,0 W', 'Situación 18:15');
        const ct = k.ct({ carta: L105, anyo: anyo(q), desvio: -1 });
        const rv = k.rv(330, ct);
        k.note('Rumbo de superficie', 'Sin viento no hay abatimiento: Rs = Rv.');
        const { ref, vef } = k.efectivo(rv, 8, 22.5, 4.5, s);
        return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
      },
    },
    'dgmm-py-2023-11-37': {
      ejercicio: 'corriente-rumbo-a-dar',
      solve(k) {
        const s = k.pos('35 56,6 N', '5 28,0 W', 'Situación 09:15');
        const ct = k.ct({ dm: -2, desvio: 2 });
        const rv = k.rv(28, ct);
        const rs = k.abatimiento(rv, 5, E);
        const { vb } = k.rumboYVelocidad(s, 'punta-europa', hrb(11, 15) - hrb(9, 15), NE, 2);
        k.note('Comprobación', `El Rs que sale del triángulo coincide con el que llevamos (${Math.round(rs)}°): con esa proa basta ajustar la velocidad de máquinas.`);
        return [{ kind: 'speed', value: vb }];
      },
    },
    'dgmm-py-2023-11-38': {
      ejercicio: 'corriente-desconocida',
      solve(k) {
        const s = k.pos('35 55,0 N', '5 36,0 W', 'Situación 15:15');
        const ct = k.ct({ dm: 1, desvio: 4 });
        const rv = k.rv(75, ct);
        const t = hrb(17, 5) - hrb(15, 15);
        const e = k.run(s, rv, k.distFor(6, t), 'Situación de estima 17:05');
        const o = k.fix2('punta-almina', k.dv(135, ct, 'punta-almina'), 'punta-cires', k.dv(240, ct, 'punta-cires'), 'Situación verdadera 17:05');
        const { rc, ic } = k.corrienteDesconocida(e, o, t);
        return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
      },
    },
  },
  documentadas: {
    'dgmm-py-2023-04-36': {
      tipo: 'discrepancia',
      texto: 'Corriente desconocida. Ct = −1° + 2° = +1°, Rv 084°, 4,5 nudos durante 2h 20m (10,5 millas): estima 07:05 en '
        + '35° 52,1′ N 5° 58,1′ W. Con las Dv 036° (Punta de Gracia) y 151° (Cabo Espartel) la verdadera es 35° 53,4′ N '
        + '5° 59,4′ W. Corriente: Rc 320°, Ihc 0,71 nudos. La oficial (c) da Rc 330° e Ihc 0,70: la intensidad coincide, '
        + 'pero el rumbo difiere 10°, fuera de la tolerancia. El abatimiento total es de solo 1,65 millas, así que 0,3 '
        + 'millas de error de trazado en la carta bastan para girar el rumbo 10°: lo más probable es que la plantilla salga '
        + 'de un trazado a mano. La c es la única opción próxima.',
    },
    'dgmm-py-2023-04-79': {
      tipo: 'discrepancia',
      texto: 'Estima con viento y corriente. Rv = 190° − 2,5° = 187,5°; viento del SE por babor → Rs 192,5°. En 54 min: '
        + '6,75 millas al 192,5° (Δl −6,6′, A −1,5′) y la corriente de rumbo 090° 2,25 millas al E. Llegada: 36° 08,4′ N '
        + '5° 11,0′ W. La oficial (b) es 36° 08,5′ N 5° 16,6′ W: la latitud coincide, pero la longitud solo sale si la '
        + 'corriente va hacia el 270° (A = −1,5 − 2,25 = −3,7′ → ΔL −4,6′ → 5° 16,6′ W). La plantilla toma la corriente '
        + 'al revés («de rumbo 090°» es hacia donde va el agua, el E). Ninguna opción encaja con el dato tal como viene.',
    },
    'dgmm-py-2023-11-39': {
      tipo: 'discrepancia',
      texto: 'Falta un dato: la situación de la «marca cardinal norte cercana a Punta Malabata». No está entre los puntos de '
        + 'la carta de la app ni la da ningún enunciado o solución oficial de la DGMM (en dgmm-per-2022-10-89 solo se sabe '
        + 'que está en la oposición con Punta de Gracia, Dv ≈ 172° desde ella). El rumbo pedido depende mucho de ella: '
        + 'cada media milla a lo largo de esa línea mueve el Ra unos 3,5°. Una marca en ≈ 35° 49,6′ N 5° 45,5′ W daría la '
        + 'oficial (Ra 269°), pero esa posición sale de ajustarla a la respuesta, no de la carta: no se programa hasta '
        + 'tener la situación de la marca en la carta L105.',
    },
  },
};
