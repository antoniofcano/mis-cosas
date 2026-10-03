// Soluciones programadas PY Andalucía, convocatorias de 2024. Ver andalucia-py.js para el formato.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const NE = 45; const E = 90; const SE = 135; const S = 180; const SW = 225; const W = 270; const NW = 315;

export default {
  // ---- 1ª Convocatoria 2024
  'and-py-2024-c1-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // La dm (3° W) y el Ra no hacen falta para la Ct: sale directamente de Dv − Da.
      const dv = k.oposicion('punta-malabata', 'punta-cires');
      return [{ kind: 'signed', value: k.ctFrom(dv, 78) }];
    },
  },
  'and-py-2024-c1-n12': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('punta-almina', E, 3, 'Salida');
      const { rs } = k.rumboConCorriente(s, 'algeciras-espigon', 8, W, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 7, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2024-c1-n13': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 15,0 N', '6 15,0 W', 'Salida');
      const rs = k.abatimiento(130, 15, NE);
      k.note('Demora verdadera del través', 'El través se mide desde la proa, es decir, desde el Rv: por babor, Dv = Rv − 90° = 130° − 90° = 040°.');
      return latlon(k.corteRumbo(s, rs, 'cabo-trafalgar', 40, 'Situación al través'));
    },
  },
  'and-py-2024-c1-n14': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      // Salimos de Tánger hacia el NW: Espartel queda a babor (pasamos por fuera del cabo).
      const rs = k.tangent('tanger-espigon', 'cabo-espartel', 4, 'babor');
      const rv = k.rvConAbatimiento(rs, 20, SW);
      const ct = k.ct({ dm: -6, desvio: 10 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2024-c1-n15': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Salida');
      // Entramos en el Estrecho por el norte de Espartel: lo dejamos por estribor.
      const ref = k.tangent(s, 'cabo-espartel', 4, 'estribor');
      const { rs } = k.rumboConCorriente(s, ref, 8, SE, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ carta: [-4, 2014, 6], anyo: 2024, desvio: -8 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2024-c1-n16': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.cardinal2('punta-paloma', S, 'isla-tarifa', W, 'Situación 08:15');
      const { ref, vef } = k.efectivo(290, 8, SW, 3, s);
      const p = k.estimaEfectiva(s, ref, vef, hrb(9, 45) - hrb(8, 15), 'Situación 09:45');
      return [{ kind: 'bearing', value: k.bearingTo(p, 'cabo-trafalgar').dv }];
    },
  },
  'and-py-2024-c1-n17': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const dvOp = k.oposicion('isla-tarifa', 'punta-cires');
      k.note('Demora verdadera de Punta Alcázar', 'Al Norte verdadero del faro de Punta Alcázar: desde el barco el faro demora 180°.');
      const s = k.lineAndBearing('isla-tarifa', dvOp, 'punta-alcazar', 180, 'Situación 09:00');
      const t = hrb(10, 31) - hrb(9);
      const e = k.run(s, 270, k.distFor(8, t), 'Situación de estima 10:31');
      // «Faro de Punta Camarinal» es el faro de Camarinal (punta-gracia).
      const o = k.fix2('punta-gracia', 343, 'punta-cires', 91, 'Situación verdadera 10:31');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2024-c1-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera bajamar (08:11) → segunda pleamar (14:33).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 1 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 4.25, 2.18, 2) }];
    },
  },
  'and-py-2024-c1-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(17, 58), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.82) }];
    },
  },
  'and-py-2024-c1-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('40 00,0 S', '178 55,0 E', 'Salida');
      const b = k.pos('28 40,0 S', '177 00,0 W', 'Destino');
      return [{ kind: 'bearing', value: k.rumboDirecto(a, b).rumbo }];
    },
  },

  // ---- 2ª Convocatoria 2024
  'and-py-2024-c2-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Rv (310°) no interviene: la Ct sale de Dv − Da.
      const dv = k.oposicion('punta-alcazar', 'punta-paloma');
      return [{ kind: 'signed', value: k.ctFrom(dv, 321) }];
    },
  },
  'and-py-2024-c2-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      // Desde Barbate hacia el SE, Punta Paloma queda a babor (por fuera, mar adentro).
      const rs = k.tangent('barbate-espigon', 'punta-paloma', 5, 'babor');
      const rv = k.rvConAbatimiento(rs, 15, E);
      const ct = k.ct({ carta: [-4, 2012, 5], anyo: 2024, desvio: 9 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2024-c2-n13': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Salida 09:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'tanger-espigon', hrb(11, 15) - hrb(9), SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 3, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2024-c2-n14': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 17,0 N', '6 10,0 W', 'Salida');
      const rs = k.abatimiento(210, 20, W);
      const { ref } = k.efectivo(rs, 7, SE, 3, s);
      k.note('Demora verdadera del través', 'El través se mide desde la proa, es decir, desde el Rv: por babor, Dv = Rv − 90° = 210° − 90° = 120°.');
      return latlon(k.corteRumbo(s, ref, 'cabo-trafalgar', 120, 'Situación al través'));
    },
  },
  // c2-n15 (anulada): ver DISCREPANCIAS al final.
  'and-py-2024-c2-n16': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('35 50,0 N', '5 10,0 W', 'Salida 08:15');
      const { rv: rs } = k.rhumb(s, 'algeciras-espigon', 'Rumbo y distancia a Algeciras');
      const rv = k.rvConAbatimiento(rs, 12, E);
      const ct = k.ct({ dm: -2, desvio: -8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2024-c2-n17': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 16:00');
      const t = hrb(18, 30) - hrb(16);
      const e = k.run(s, 325, k.distFor(4.3, t), 'Situación de estima 18:30');
      // «Al W verdadero de Punta Camarinal»: el faro de Camarinal (punta-gracia).
      const o = k.cardinal2('cabo-trafalgar', S, 'punta-gracia', W, 'Situación verdadera 18:30');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2024-c2-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera bajamar (10:48) → segunda pleamar (17:15).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 1 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.72, 1.70, 2) }];
    },
  },
  'and-py-2024-c2-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(22, 15), 2);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 2.05) }];
    },
  },
  'and-py-2024-c2-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('37 30,0 N', '2 05,0 E', 'Salida');
      const b = k.pos('35 39,0 N', '2 40,0 W', 'Destino');
      return [{ kind: 'bearing', value: k.rumboDirecto(a, b).rumbo }];
    },
  },

  // ---- 3ª Convocatoria 2024
  'and-py-2024-c3-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // Vemos Cires al 233° de aguja con Alcázar detrás: la Dv es la de la recta Cires → Alcázar.
      const dv = k.enfilacion('punta-cires', 'punta-alcazar', 233);
      return [{ kind: 'signed', value: k.ctFrom(dv, 233) }];
    },
  },
  'and-py-2024-c3-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Salida');
      const rs = k.tangent(s, 'cabo-espartel', 7, 'estribor');
      const rv = k.rvConAbatimiento(rs, 20, NW);
      const ct = k.ct({ dm: -3, desvio: -8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2024-c3-n13': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 57,0 N', '5 50,0 W', 'Salida 13:15');
      const { rs, vb } = k.rumboYVelocidad(s, 'barbate-faro', hrb(16, 15) - hrb(13, 15), SE, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ carta: [-(4 + 40 / 60), 2014, 4], anyo: 2024, desvio: -5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2024-c3-n14': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 10,0 N', '5 15,0 W', 'Salida');
      const rs = k.abatimiento(185, 10, W);
      const { ref } = k.efectivo(rs, 8, W, 3, s);
      k.note('Demora verdadera del través', 'El través se mide desde la proa, es decir, desde el Rv: por estribor, Dv = Rv + 90° = 185° + 90° = 275°.');
      return latlon(k.corteRumbo(s, ref, 'punta-carnero', 275, 'Situación al través'));
    },
  },
  'and-py-2024-c3-n15': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(6, hrb(7, 30) - hrb(5));
      return latlon(k.traslado('cabo-roche', 79, 'cabo-trafalgar', 40, 170, d, 'Situación 07:30'));
    },
  },
  'and-py-2024-c3-n16': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W');
      const ct = k.ct({ dm: -3, desvio: -9 });
      const rv = k.rv(138, ct);
      const rs = k.abatimiento(rv, 12, E);
      k.items.push({ t: 'vec', from: s, bearing: rv, length: 5, label: `Rv ${Math.round(rv)}°`, style: 'construction', step: k.steps.length },
        { t: 'vec', from: s, bearing: rs, length: 5, label: `Rs ${Math.round(rs)}°`, style: 'boat', step: k.steps.length });
      return [{ kind: 'bearing', value: rs }];
    },
  },
  'and-py-2024-c3-n17': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.fromMark('punta-alcazar', N, 5, 'Situación 15:00');
      const rs = k.abatimiento(80, 10, S);
      const { ref, vef } = k.efectivo(rs, 8, SE, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(16, 40) - hrb(15), 'Situación 16:40'));
    },
  },
  'and-py-2024-c3-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Segunda pleamar (16:34) → segunda bajamar (22:30).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 2 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.48, 1.92, 1) }];
    },
  },
  'and-py-2024-c3-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(15, 32), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.34) }];
    },
  },
  'and-py-2024-c3-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('34 22,0 N', '179 45,0 E', 'Salida');
      k.note('Distancia navegada', 'A 8 nudos: 090° durante 3 h (24 millas) y 155° durante 2 h (16 millas). La corriente S de 3 nudos actúa las 5 h: 15 millas.');
      return latlon(k.tramos(s, [
        { rumbo: 90, millas: 24 }, { rumbo: 155, millas: 16 },
        { rumbo: S, millas: 15, nombre: 'Corriente S' },
      ], 'Situación de llegada'));
    },
  },
};

/* DISCREPANCIAS
  and-py-2024-c2-n15 (ANULADA, demoras no simultáneas): Rv 240°, 8 nudos, 11:00 Dv Punta Europa 310°, 12:15 Dv Punta
  Carnero 200°. Trasladando la línea de Europa 10 M al 240° y cortándola con la de Carnero sale 35°59,4′ N 5°27,9′ W
  (la opción b), pero desde ese punto Carnero demora 020°, no 200°: solo encaja tomando la demora recíproca, y eso es
  cambiar el dato. Con la demora tal como viene (Carnero al SSW del barco) las líneas no se cortan por delante. La
  opción c además tiene una longitud (006° 32′ W) fuera de la zona. Coherente con la anulación; no se publica.
*/
