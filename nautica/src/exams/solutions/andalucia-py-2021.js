// Soluciones programadas PY Andalucía, convocatorias de 2021. Ver andalucia-py.js para el formato.
// Declinación de la carta L105: 2°50′ W 2005 (7′ E) → en 2021 ≈ 1° W (−1°).
import { hrb } from '../kit.js';
import { norm360, toDeg } from '../../math/angles.js';
import { fmtBearing, fmtMiles, fmtPos, fmtSignedNum } from '../../math/format.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const E = 90; const S = 180; const W = 270; const NE = 45;
const CARTA = [-(2 + 50 / 60), 2005, 7];
const rad = (d) => (d * Math.PI) / 180;

export default {
  // ---- 1ª Convocatoria 2021
  'and-py-2021-c1-n11': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: CARTA, anyo: 2021, desvio: -6 });
      const rv = k.rv(142, ct);
      const rs = k.abatimiento(rv, 6, NE);
      const dv1 = k.dvM(rv, -52, 'cabo-trafalgar');
      const dv2 = k.dvM(rv, -122, 'cabo-trafalgar');
      const d = k.distFor(12, hrb(2, 50) - hrb(2, 20));
      const p250 = k.traslado('cabo-trafalgar', dv1, 'cabo-trafalgar', dv2, rs, d, 'Situación 02:50');
      // Se pide la de las 02:20: desde la de las 02:50 volvemos lo navegado por el rumbo opuesto.
      k.note('Distancia navegada', `Nos piden la situación de las 02:20: desde la de las 02:50 volvemos atrás las ${fmtMiles(d)} navegadas, al rumbo opuesto ${fmtBearing(rs + 180)}.`);
      return latlon(k.run(p250, norm360(rs + 180), d, 'Situación 02:20'));
    },
  },
  'and-py-2021-c1-n12': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('isla-tarifa', 'punta-alcazar');
      return [{ kind: 'signed', value: k.ctFrom(dv, 173) }];
    },
  },
  'and-py-2021-c1-n13': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 11,0 N', '5 13,0 W', 'Salida 18:24');
      const { rv: rs, dist } = k.rhumb(s, 'ceuta-bocana', 'Rumbo de superficie y distancia');
      const rv = k.rvConAbatimiento(rs, 5, W);
      const ct = k.ct({ ct: -8 });
      const ra = k.ra(rv, ct);
      // Las opciones escriben la hora como «21-57».
      return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(18, 24), dist, 5) }];
    },
  },
  'and-py-2021-c1-n14': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('punta-alcazar', N, 5, 'Salida 08:00');
      const ref = k.tangent(s, 'cabo-espartel', 5, 'babor');
      k.note('Rumbo efectivo', `Esa tangente es el rumbo que queremos hacer sobre el fondo: Ref = ${fmtBearing(ref)}.`);
      const rs = k.rumboConCorriente(s, ref, 12, 30, 4).rs;
      const rv = k.rvConAbatimiento(rs, 7, S);
      const ct = k.ctPolar(6);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2021-c1-n15': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.cardinal2('tanger-espigon', N, 'punta-cires', W, 'Situación 06:00');
      const dest = k.fromMark('tanger-espigon', N, 2, 'Destino 06:30');
      const { rs, vb } = k.rumboYVelocidad(s, dest, 30, E, 3);
      const rv = k.rvConAbatimiento(rs, 4, W);
      const ct = k.ct({ dm: -1, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2021-c1-n16': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('punta-cires', N, 7, 'Salida');
      k.note('Rumbo cuadrantal', 'Ra = S65W: desde el sur, 65° hacia el oeste → 180° + 65° = 245°.');
      const ct = k.ct({ dm: -4, desvio: -8 });
      const rv = k.rv(245, ct);
      const d = k.distFor(12, 75);
      return latlon(k.run(s, rv, d, 'Situación a 1 h 15 min'));
    },
  },
  'and-py-2021-c1-n17': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -1, desvio: 3 });
      const rv = k.rv(53, ct);
      const dvE = k.dvM(rv, -112, 'punta-europa');
      const dvA = k.dvM(rv, 135, 'punta-almina');
      return latlon(k.fix2('punta-europa', dvE, 'punta-almina', dvA));
    },
  },
  'and-py-2021-c1-n18': {
    ejercicio: 'estima-analitica',
    solve(k) {
      // Las opciones van en cuadrantal («S46,6ºW»). La salida está en la carta; la llegada, al SW, fuera.
      const a = k.pos('35 46,8 N', '6 00,2 W', 'Salida');
      const b = k.pos('35 20,0 N', '6 35,0 W', 'Llegada');
      const { rumbo } = k.rumboDirecto(a, b);
      k.items.push({ t: 'vec', from: a, bearing: rumbo, length: 8, label: `R ${Math.round(rumbo)}°`, style: 'boat', step: k.steps.length });
      return [{ kind: 'bearing', value: rumbo }];
    },
  },
  'and-py-2021-c1-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // La hora (07:45) ya viene en UTC, como el Anuario: no hay adelanto que restar.
      // Sale 3,22 m, casi a medio camino entre a (3,24) y b (3,19); la a queda un poco más cerca.
      const t = hrb(7, 45);
      k.note('Hora oficial', 'La hora que nos dan ya está en UTC, igual que el Anuario: la usamos tal cual.');
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 3) }];
    },
  },
  // c1-n20: ver DISCREPANCIAS al final.

  // ---- 2ª Convocatoria 2021
  'and-py-2021-c2-n11': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.cardinal2('punta-europa', S, 'punta-carnero', E, 'Situación 03:45');
      const ct = k.ctPolar(358);
      const rv = k.rv(225, ct);
      const d = k.distFor(7, hrb(5, 20) - hrb(3, 45));
      return latlon(k.run(s, rv, d, 'Situación 05:20'));
    },
  },
  // c2-n12 (anulada): ver DISCREPANCIAS al final.
  'and-py-2021-c2-n13': {
    sinCarta: true,
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // Declinación de la carta 6º10′ W 2005 (5′ E), actualizada a 2021: 6º10′ W − 16 × 5′ = 4º50′ W.
      const base = -(6 + 10 / 60); const dm = base + (5 / 60) * (2021 - 2005);
      k.note('Declinación actualizada', `dm 2021 = 6° 10′ W − (16 años × 5′ E) = 6° 10′ W − 1° 20′ = 4° 50′ W, es decir ${fmtSignedNum(dm, 2)}.`);
      return [{ kind: 'signed', value: dm }];
    },
  },
  'and-py-2021-c2-n14': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 04,0 N', '5 56,0 W', 'Salida');
      const rs = k.tangent(s, 'punta-malabata', 6, 'estribor');
      const rv = k.rvConAbatimiento(rs, 4, W);
      // «Desvío de menos tres hacia el oeste» → Δ = −3°.
      const ct = k.ct({ carta: CARTA, anyo: 2021, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2021-c2-n15': {
    // Sale ≈ 36°00′ N 5°25′ W; la opción d (36°02′ N 5°25′ W) coincide en longitud y difiere 2′ en latitud,
    // y las demás quedan a decenas de millas: es la única posible (precisión del trazado en el examen).
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: CARTA, anyo: 2021, desvio: -4 });
      const rv = k.rv(230, ct);
      const dv1 = k.dv(320, ct, 'punta-carnero');
      const dv2 = k.dv(360, ct, 'punta-carnero');
      const d = k.distFor(12, hrb(11, 15) - hrb(11));
      return latlon(k.traslado('punta-carnero', dv1, 'punta-carnero', dv2, rv, d, 'Situación 11:15'));
    },
  },
  'and-py-2021-c2-n16': {
    // Sale ≈ 35°58′ N 5°51′ W, a 1′ de la opción b en cada coordenada; las demás quedan lejos.
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.P('tanger-espigon');
      k.note('Situación de salida', `Salimos del puerto de Tánger: tomamos como salida la farola del espigón, Fl(3) 12s 14M (${fmtPos(s)}).`);
      const ct = k.ct({ ct: -10 });
      const rv = k.rv(350, ct);
      const { ref, vef } = k.efectivo(rv, 8, N, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, 60, 'Situación 13:00'));
    },
  },
  // c2-n17 (anulada): ver DISCREPANCIAS al final.
  'and-py-2021-c2-n18': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      // Las opciones van en cuadrantal («N46W»).
      const a = k.pos('30 25,3 N', '10 05,0 E', 'Salida');
      const b = k.pos('39 15,0 N', '1 00,0 W', 'Llegada');
      return [{ kind: 'bearing', value: k.rumboDirecto(a, b).rumbo }];
    },
  },
  'and-py-2021-c2-n19': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('42 30,0 N', '20 20,0 E', 'Salida');
      return latlon(k.tramos(s, [{ rumbo: 22, millas: 520 }], 'Situación de llegada'));
    },
  },
  'and-py-2021-c2-n20': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // La hora viene en TU, como el Anuario: no hay adelanto que restar.
      const t = hrb(6, 16);
      k.note('Hora oficial', 'La hora que nos dan ya está en TU, igual que el Anuario: la usamos tal cual.');
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 3.28) }];
    },
  },
};

/* DISCREPANCIAS
 * 'and-py-2021-c2-n12' (ANULADA, dato incoherente): en la oposición de Isla de Tarifa y Punta Alcázar, Punta Alcázar
 *   queda al S, y una Da de 351° a ella daría una Ct de casi 180°. Solo encaja si la Da es de la Isla de Tarifa (al N);
 *   resolverla así sería cambiar el enunciado, de modo que no se cuenta como resuelta.
 * 'and-py-2021-c2-n17' (ANULADA, corriente desconocida): con la estima (Rv 085°, 7,5 nudos, 11:15–13:30) y la
 *   observada por las demoras a Malabata (099°) y Espartel (242°) sale una corriente de ≈ 200° y < 1 nudo, que no se
 *   parece a ninguna opción. Coherente con que el tribunal la anulara.
 * 'and-py-2021-c1-n20' (marea, hora entre la 2ª pleamar y la 2ª bajamar, Algeciras 23-06-2021, oficial c = 16:56):
 *   Tramo PM 13:03 UT (1,00 m) – BM 18:35 UT (0,19 m): D = 5h 32m, A = 0,81 m. Altura necesaria = 2,35 − 1,95 = 0,40 m;
 *   C = 0,40 − 0,19 = 0,21 m → sen²(90°·I/D) = 0,259 → I = 1h 53m antes de la BM → 16:42 UTC (se pide en UTC).
 *   16:42 no está entre las opciones; la más próxima es 16:56 (a 14 min, muy fuera de la tolerancia de 3 min).
 *   El 16:56 sale entrando en la tabla con la columna A = 1,00 m en vez de la amplitud real 0,81 m: error de la plantilla.
 *   Código (con él el comprobador elige c, pero por proximidad, no por llegar a ella):
 *     sinCarta: true, ejercicio: 'marea-sonda',
 *     solve(k, q) { const tr = k.tramoMarea(q.tabla_mareas, { desde: 2 }); return [{ kind: 'clock', value: k.horaParaSonda(tr, 2.35, 1.95, 0) }]; }
 */

