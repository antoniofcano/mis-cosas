// Soluciones programadas PY Andalucía, convocatorias de 2016 (módulo de navegación, UT 4: carta, mareas y loxodrómica). Ver
// andalucia-py.js para el formato. `documentadas`: las de carta sin solución programada, con su motivo
// ({ tipo: 'discrepancia' | 'sin-calculo', texto }).
// `pendientes`: resoluciones que llegan a la oficial pero que el lector de opciones (src/exams/options.js) no puede comparar
// todavía: dan el rumbo de la corriente como «Rc = SE» / «NW», sin grados. Están en `documentadas` hasta que lo lea.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const SW = 225;

const lectorRc = (calc) => `El cálculo llega a la oficial (${calc}), pero el lector de opciones no entiende el rumbo de la corriente escrito con letras («Rc = SE» / «NW», sin grados): la comparación automática no lee ninguna opción. La resolución está en \`pendientes\` de este fichero.`;

export const documentadas = {
  'and-py-2016-c1-n14': { tipo: 'discrepancia', texto: lectorRc('Rc = 136° (SE), Ihc = 1,4′; oficial c, «Rc = SE, Ihc = 1,5′»') },
};

export const pendientes = {
  'and-py-2016-c1-n14': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fixDist('cabo-espartel', 123, 4, 'Situación 11:00');
      const d = k.distFor(8, hrb(12, 30) - hrb(11));
      const est = k.run(s, 60, d, 'Situación de estima 12:30');
      const obs = k.fromMark('punta-malabata', 0, 5, 'Situación observada 12:30');
      const { rc, ic } = k.corrienteDesconocida(est, obs, 90);
      return [{ kind: 'bearing', value: rc }, { kind: 'distance', value: ic }];
    },
  },
};

export default {
  // ---- 1ª Convocatoria 2016
  'and-py-2016-c1-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('punta-carnero', 'punta-europa', 258);
      return [{ kind: 'signed', value: k.ctFrom(dv, 258) }];
    },
  },
  'and-py-2016-c1-n12': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(8, hrb(13, 30) - hrb(13));
      return latlon(k.traslado('punta-cires', 160, 'punta-cires', 225, 70, d, 'Situación 13:30'));
    },
  },
  'and-py-2016-c1-n13': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 45,0 W', 'Salida');
      // Salimos del Estrecho hacia el NW: Trafalgar queda a la derecha, lo dejamos por estribor.
      const rs = k.tangent(s, 'cabo-trafalgar', 5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, SW);
      const ct = k.ct({ dm: -5, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2016-c1-n15': {
    ejercicio: 'abatimiento',
    sinCarta: true,
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -5 });
      const rv = k.rv(298, ct);
      const rs = k.abatimiento(rv, 10, SW);
      k.note('Rumbo sobre el fondo', 'Sin corriente, el rumbo sobre el fondo es el de superficie.');
      return [{ kind: 'bearing', value: rs }];
    },
  },
  'and-py-2016-c1-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const dvE = k.enfilacion('punta-alcazar', 'punta-cires');
      // «Al Este verdadero del faro de Punta Carnero»: vemos el faro en Dv 270°.
      const s = k.lineAndBearing('punta-alcazar', dvE, 'punta-carnero', 270, 'Situación de salida');
      // Vamos hacia el W, saliendo del Estrecho: la isla de Tarifa queda a la derecha, la dejamos por estribor.
      const ref = k.tangent(s, 'isla-tarifa', 3, 'estribor');
      const { rs } = k.rumboConCorriente(s, ref, 8, 135, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      // 5º W 2006 con variación 6′ E anual.
      const ct = k.ct({ carta: [-5, 2006, 6], anyo: 2016, desvio: -8 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2016-c1-n17': {
    ejercicio: 'estima-analitica',
    sinCarta: true,
    solve(k) {
      const a = k.pos('29 15,0 S', '179 35,0 W', 'Salida');
      const b = k.pos('25 20,0 N', '178 15,0 E', 'Llegada');
      return [{ kind: 'bearing', value: k.rumboDirecto(a, b).rumbo }];
    },
  },
  'and-py-2016-c1-n18': {
    ejercicio: 'ct-enfilacion',
    sinCarta: true,
    solve(k) {
      return [{ kind: 'signed', value: k.ctPolar(5) }];
    },
  },
};
