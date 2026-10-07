// Soluciones programadas PY Andalucía, convocatorias de 2015 (módulo de navegación, UT 4: carta, mareas y loxodrómica). Ver
// andalucia-py.js para el formato. `documentadas`: las de carta sin solución programada, con su motivo
// ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
import { hrb } from '../kit.js';
import { parseAngle, fmtPos, fmtBearing, fmtSignedNum } from '../../math/format.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const E = 90; const S = 180; const W = 270; const NW = 315;

/** Situación que no se dibuja (la derrota se sale de la carta L105): solo se anota. */
const punto = (k, lat, lon, label) => {
  const p = { lat: parseAngle(lat), lon: -Math.abs(parseAngle(lon)) * (/E/i.test(lon) ? -1 : 1) };
  k.note(label, `${fmtPos(p)}. La derrota se sale de la carta: lo resolvemos con números.`);
  return p;
};

export const documentadas = {
  'and-py-2015-c2-n13': {
    tipo: 'discrepancia',
    texto: 'Corriente desconocida. Estima 17:40 → 19:20 (Rv 074°, Ct 0°, 8 nudos, 13,33 millas): 35° 55,7′ N 005° 32,2′ W. '
      + 'Observada por Dv 227° a Punta Cires y 124° a Punta Almina: 35° 58,1′ N 005° 24,2′ W. Corriente: Rc 069°, 6,88 millas '
      + 'en 1h 40m → Ihc 4,1 nudos. La oficial (d: 071°, 4,0 nudos) es la más próxima, pero no con claridad: por el rumbo '
      + 'está más cerca la b (068°, 3,1 nudos) y solo la intensidad las separa. Diferencia de trazado del tribunal (2°).',
  },
  'and-py-2015-c2-n14': {
    tipo: 'discrepancia',
    texto: 'Rumbo hacia el punto a 3 millas al E del faro de Punta Europa desde 35° 57,0′ N 005° 17,0′ W: Rs = 000,4° = N, '
      + 'la oficial (b: «Rs = N.»). Sin corriente, el rumbo que se hace es el de superficie; el viento del W solo cambia el Rv a dar '
      + '(355°, la opción a). El cálculo llega a la oficial, pero el lector de opciones no lee un rumbo escrito solo como «N» (sin grados) '
      + 'y no puede comprobarse: se deja documentada.',
  },
  'and-py-2015-c3-n11': {
    tipo: 'discrepancia',
    texto: 'Demoras no simultáneas con corriente. Ct = −3° + 4° = +1°: Rv 136°, Dv 056° y 006° a Trafalgar. Triángulo de '
      + 'velocidades (136°, 6 nudos + 210°, 3 nudos): Ref 159°, Vef 7,4 nudos; en 45 min, 5,56 millas. Trasladando la 1ª demora '
      + 'por el Ref y cortándola con la 2ª: 36° 04,0′ N 006° 02,9′ W. La oficial (a: 36° 03,6′ N) es la más próxima, pero '
      + 'sin claridad frente a la c (36° 05,0′ N): todas las opciones tienen la misma longitud y la latitud del cálculo cae '
      + 'entre las dos. Diferencia de trazado del tribunal (0,4′).',
  },
};

export default {
  // ---- 1ª Convocatoria 2015
  'and-py-2015-c1-n11': {
    sinCarta: true,
    ejercicio: 'ct-enfilacion',
    solve(k) {
      return [{ kind: 'signed', value: k.ctPolar(7) }];
    },
  },
  'and-py-2015-c1-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 46,0 N', '6 19,0 W', 'Salida');
      // Pasamos al N de Cabo Espartel (al S está la costa): el faro queda por estribor.
      const rs = k.tangent(s, 'cabo-espartel', 3, 'estribor');
      return [{ kind: 'bearing', value: k.rvConAbatimiento(rs, 6, NW) }];
    },
  },
  'and-py-2015-c1-n13': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      // Malabata nos demora al S: estamos en su meridiano, al N del faro. De los dos cortes con el arco, el más
      // próximo a Malabata (el del N); el otro cae en tierra.
      return latlon(k.fixBearingRange('punta-malabata', 180, 'cabo-espartel', 11, 0, 'Situación 11:00'));
    },
  },
  'and-py-2015-c1-n14': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -3 });
      const rv = k.rv(86, ct);
      const d1 = k.dv(136, ct, 'punta-alcazar');
      const d2 = k.dv(176, ct, 'punta-alcazar');
      const d = k.distFor(6, hrb(12) - hrb(11, 30));
      return latlon(k.traslado('punta-alcazar', d1, 'punta-alcazar', d2, rv, d, 'Situación 12:00'));
    },
  },
  'and-py-2015-c1-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 59,0 N', '6 15,0 W', 'Situación');
      const ct = k.ct({ dm: -3, desvio: 5 });
      const rv = k.rv(70, ct);
      k.note('Rumbo de superficie', 'Sin viento no hay abatimiento: el rumbo de superficie es el mismo Rv.');
      const { ref, vef } = k.efectivo(rv, 6, E, 3, s);
      return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
    },
  },
  'and-py-2015-c1-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 56,6 N', '5 30,0 W', 'Salida');
      // Pasamos al N de Punta Almina: el faro queda por estribor.
      const ref = k.tangent(s, 'punta-almina', 3, 'estribor');
      k.note('Rumbo efectivo', `Esa tangente es el rumbo que queremos hacer sobre el fondo: Ref = ${fmtBearing(ref)}.`);
      const { rs } = k.rumboConCorriente(s, ref, 6, 58, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      return [{ kind: 'bearing', value: rs }];
    },
  },
  'and-py-2015-c1-n17': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 02,0 N', '5 22,0 W', 'Situación 14:00');
      const dest = k.fromMark('isla-tarifa', S, 3, 'Punto de destino');
      const { rv } = k.rhumb(s, dest);
      const t = hrb(17) - hrb(14);
      const est = k.run(s, rv, k.distFor(6, t), 'Situación de estima 17:00');
      const ct = k.ct({ dm: -3, desvio: -3 });
      const obs = k.fix2('isla-tarifa', k.dv(347, ct, 'isla-tarifa'), 'punta-cires', k.dv(127, ct, 'punta-cires'), 'Situación observada 17:00');
      const { rc, ic } = k.corrienteDesconocida(est, obs, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2015-c1-n18': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = punto(k, '36 00,0 N', '6 20,0 W', 'Situación 19:00');
      k.note('Distancia navegada', 'A 6 nudos: 290° de 19:00 a 23:00 (4 h, 24 millas) y 260° de 23:00 a 04:00 (5 h, 30 millas). La corriente actúa las 9 h: 080° y 4 × 9 = 36 millas.');
      const p = k.tramos(s, [
        { rumbo: 290, millas: 24 }, { rumbo: 260, millas: 30 }, { rumbo: 80, millas: 36, nombre: 'Corriente 080°' },
      ], 'Situación 04:00');
      return latlon(p);
    },
  },
  'and-py-2015-c1-n19': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = punto(k, '36 00,0 N', '6 20,0 W', 'Salida');
      const b = punto(k, '36 15,0 N', '8 00,0 W', 'Llegada');
      return [{ kind: 'bearing', value: k.rumboDirecto(a, b).rumbo }];
    },
  },
  'and-py-2015-c1-n20': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-almina', 'punta-europa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 338) }];
    },
  },

  // ---- 2ª Convocatoria 2015
  'and-py-2015-c2-n11': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 54,6 N', '6 18,8 W', 'Situación 12:45');
      const { vb } = k.rumboYVelocidad(s, 'barbate-espigon', hrb(16, 19) - hrb(12, 45), 72, 4);
      return [{ kind: 'speed', value: vb }];
    },
  },
  'and-py-2015-c2-n12': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: 1 });
      const rv = k.rv(75, ct);
      const d = k.distFor(7, hrb(17, 25) - hrb(17));
      // De los dos cortes, el que queda en el mar (al NE del cabo, en la derrota hacia el Estrecho).
      const p = k.trasladoDosArcos('cabo-espartel', 3, 'cabo-espartel', 5, rv, d, (c) => c.sort((a, b) => b.lat - a.lat)[0], 'Situación 17:25');
      return latlon(p);
    },
  },
  // c2-n13 y c2-n14: ver `documentadas`.
  'and-py-2015-c2-n15': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const gitano = k.pos('36 05,9 N', '5 32,5 W', 'Monte Gitano');
      gitano.name = 'Monte Gitano';
      const dv = k.enfilacion('punta-carnero', gitano, 288);
      return [{ kind: 'signed', value: k.ctFrom(dv, 288) }];
    },
  },
  'and-py-2015-c2-n16': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = punto(k, '35 45,0 N', '8 35,0 W', 'Situación 01:30');
      const rs1 = k.abatimiento(210, 4, N);
      const rs2 = k.abatimiento(310, 5, N);
      k.note('Distancia navegada', 'A 8 nudos: 01:30–04:30 (3 h, 24 millas) y 04:30–07:30 (3 h, 24 millas). De 07:30 a 09:45 el barco está parado y sin viento: solo nos lleva la corriente. La corriente actúa de 01:30 a 09:45 (8h 15m): 050° y 4 × 8,25 = 33 millas.');
      const p = k.tramos(s, [
        { rumbo: rs1, millas: 24 }, { rumbo: rs2, millas: 24 }, { rumbo: 50, millas: 33, nombre: 'Corriente 050°' },
      ], 'Situación 09:45');
      return latlon(p);
    },
  },
  'and-py-2015-c2-n17': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      // «36º-40º,0’»: errata del enunciado por 36º-40,0′.
      const a = punto(k, '36 40,0 N', '7 32,0 W', 'Salida');
      const b = punto(k, '37 38,4 N', '8 44,0 W', 'Llegada');
      return [{ kind: 'distance', value: k.rumboDirecto(a, b).dist }];
    },
  },
  'and-py-2015-c2-n18': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación');
      const { rs } = k.rumboConCorriente(s, 40, 8, E, 4);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      return [{ kind: 'bearing', value: rs }];
    },
  },
  'and-py-2015-c2-n19': {
    sinCarta: true,
    ejercicio: 'abatimiento',
    solve(k) {
      const rv = k.rvConAbatimiento(277, 5, NW);
      return [{ kind: 'bearing', value: k.dvM(rv, 94, 'isla-tarifa') }];
    },
  },
  'and-py-2015-c2-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      // «38º-49º,0’» y «28º-38º,0’»: erratas por 38º-49,0′ y 28º-38,0′.
      const a = punto(k, '38 49,0 N', '8 43,0 W', 'Salida');
      const b = punto(k, '28 38,0 N', '21 45,0 W', 'Llegada');
      const { rumbo } = k.rumboDirecto(a, b);
      k.note('Rumbo efectivo', `Para llegar al punto, el rumbo efectivo es el directo entre ambos: Ref = ${fmtBearing(rumbo)}. La corriente y la velocidad solo intervienen para hallar el rumbo a dar, que no se pide.`);
      return [{ kind: 'bearing', value: rumbo }];
    },
  },

  // ---- 3ª Convocatoria 2015
  // c3-n11: ver `documentadas`.
  'and-py-2015-c3-n12': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const s = k.pos('36 02,6 N', '6 00,8 W', 'Situación 15:40');
      const ct = k.ct({ dm: -3, desvio: 1 });
      const rv = k.rv(192, ct);
      const rs = k.abatimiento(rv, 5, W);
      // Espartel queda a babor (al E de nuestra derrota hacia el S): por el través, marcación 90° a babor de la proa.
      const dv = k.dvM(rv, -90, 'cabo-espartel');
      const p = k.corteRumbo(s, rs, 'cabo-espartel', dv, 'Situación al través');
      return [{ kind: 'distance', value: k.distanceBetween(p, 'cabo-espartel') }];
    },
  },
  'and-py-2015-c3-n13': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 07,0 N', '5 57,4 W', 'Situación 17:00');
      const { rv } = k.rhumb(s, 'cabo-espartel');
      const t = hrb(19) - hrb(17);
      const est = k.run(s, rv, k.distFor(7, t), 'Situación de estima 19:00');
      const obs = k.fix2('punta-malabata', 138, 'cabo-espartel', 210, 'Situación observada 19:00');
      const { rc, ic } = k.corrienteDesconocida(est, obs, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2015-c3-n14': {
    sinCarta: true,
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const ct = k.ctPolar(355);
      return [{ kind: 'bearing', value: k.dv(190, ct, 'punta-malabata') }];
    },
  },
  'and-py-2015-c3-n15': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('isla-tarifa', 'punta-alcazar');
      const ct = k.ctFrom(dv, 173);
      const desvio = ct + 3;
      k.note('Desvío', `Δ = Ct − dm = (${fmtSignedNum(ct, 1)}) − (−3°) = ${fmtSignedNum(desvio, 1)}.`);
      return [{ kind: 'signed', value: desvio }];
    },
  },
  'and-py-2015-c3-n16': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const dvOp = k.oposicion('isla-tarifa', 'punta-alcazar');
      k.note('Situación de salida', `En la oposición, a 5 millas de Punta Alcázar: desde el faro trazamos la recta hacia la Isla de Tarifa (${fmtBearing(dvOp + 180)}) y medimos 5 millas.`);
      const s = k.fromMark('punta-alcazar', (dvOp + 180) % 360, 5, 'Situación 21:45');
      k.note('Rumbo de superficie', 'Sin viento no hay abatimiento: el rumbo de superficie es el mismo Rv.');
      const { ref } = k.efectivo(70, 6, 95, 3, s);
      const dv = k.oposicion('punta-almina', 'punta-europa');
      const p = k.corteRumbo(s, ref, 'punta-europa', dv, 'Corte con la oposición');
      return [{ kind: 'distance', value: k.distanceBetween(p, 'punta-europa') }];
    },
  },
  'and-py-2015-c3-n17': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = punto(k, '35 55,0 N', '5 15,0 W', 'Situación 01:30');
      const rs1 = k.abatimiento(90, 5, N);
      const rs2 = k.abatimiento(75, 4, N);
      k.note('Caída a babor', 'A las 09:30 caemos 20° a babor del Rv 075°: Rv = 055°.');
      const rs3 = k.abatimiento(55, 3, N);
      k.note('Distancia navegada', 'A 8 nudos: 01:30–07:30 (6 h, 48 millas), 07:30–09:30 (2 h, 16 millas) y 09:30–11:00 (1h 30m, 12 millas). La corriente actúa las 9h 30m: 070° y 4 × 9,5 = 38 millas.');
      const p = k.tramos(s, [
        { rumbo: rs1, millas: 48 }, { rumbo: rs2, millas: 16 }, { rumbo: rs3, millas: 12 }, { rumbo: 70, millas: 38, nombre: 'Corriente 070°' },
      ], 'Situación 11:00');
      return latlon(p);
    },
  },
  'and-py-2015-c3-n18': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = punto(k, '35 40,0 N', '5 32,0 W', 'Salida');
      const b = punto(k, '36 05,0 N', '4 44,0 W', 'Llegada');
      return [{ kind: 'distance', value: k.rumboDirecto(a, b).dist }];
    },
  },
  'and-py-2015-c3-n19': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = punto(k, '35 50,0 N', '6 10,0 W', 'Salida');
      const b = punto(k, '34 33,0 N', '9 23,0 W', 'Llegada');
      const { rumbo } = k.rumboDirecto(a, b);
      k.note('Rumbo efectivo', `Para llegar al punto, el rumbo efectivo es el directo entre ambos: Ref = ${fmtBearing(rumbo)}. La corriente y la velocidad solo intervienen para hallar el rumbo a dar, que no se pide.`);
      return [{ kind: 'bearing', value: rumbo }];
    },
  },
  'and-py-2015-c3-n20': {
    sinCarta: true,
    ejercicio: 'abatimiento',
    solve(k) {
      const rv = k.rvConAbatimiento(70, 6, 225);
      k.note('Marcación', 'El enunciado no dice la banda: el radar da la marcación desde la proa en sentido horario (estribor, +45°).');
      return [{ kind: 'bearing', value: k.dvM(rv, 45, 'cabo-espartel') }];
    },
  },
};
