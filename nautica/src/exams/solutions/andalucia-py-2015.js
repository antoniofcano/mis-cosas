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

export const documentadas = {};

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
};
