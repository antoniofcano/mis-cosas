// Soluciones programadas PER Andalucía (parte 3). Ver andalucia-per-0.js para el formato.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50' W 2005 (7' E).
const CARTA = [-(2 + 50 / 60), 2005, 7];

export default {
  'and-2024-c3-q45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const dv = k.oposicion('punta-europa', 'punta-carnero');
      const s = k.fixDist('punta-carnero', dv, 2.4, 'Situación 11:00');
      const { rv } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ carta: [3, 2014, -6], anyo: 2024, desvio: 9 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2025-c1-q42': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-carnero', 'punta-cires');
      return [{ kind: 'signed', value: k.ctFrom(dv, 189) }];
    },
  },
  'and-2025-c1-q43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.cardinal2('isla-tarifa', 270, 'punta-paloma', 225, 'Situación 09:20');
      const { rv, dist } = k.rhumb(s, 'barbate-faro');
      const ct = k.ct({ carta: [4 + 6 / 60, 2014, -6], anyo: 2025, desvio: 10 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(9, 20), dist, 4.5) }];
    },
  },
  'and-2025-c1-q44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 16:15');
      const ct = k.ct({ dm: -2, desvio: -6 });
      const rv = k.rv(323, ct);
      const d = k.distFor(4, hrb(18, 30) - hrb(16, 15));
      return latlon(k.run(s, rv, d, 'Situación 18:30'));
    },
  },
  'and-2025-c1-q45': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const ct = k.ct({ dm: 3, desvio: -3 });
      const rv = k.rv(70, ct);
      const dv = k.dvM(rv, -100, 'isla-tarifa');
      return latlon(k.fixBearingRange('isla-tarifa', dv, 'punta-cires', 4, 0, 'Situación 07:00'));
    },
  },
  'and-2025-c2-q42': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      return latlon(k.fixDist('punta-almina', 154, 6));
    },
  },
  'and-2025-c2-q43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const a = k.pos('35 53,0 N', '6 02,5 W', 'Salida');
      const b = k.pos('35 52,0 N', '5 36,7 W', 'Llegada');
      const { rv, dist } = k.rhumb(a, b);
      const ct = k.ct({ dm: -4, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'distance', value: dist }];
    },
  },
  'and-2025-c2-q44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 06,6 N', '6 02,2 W');
      const { rv } = k.rhumb(s, 'punta-malabata');
      const ct = k.ct({ ct: -6.5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2025-c3-q42': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const dv = k.oposicion('isla-tarifa', 'punta-cires');
      const s = k.lineAndBearing('punta-cires', dv, 'punta-alcazar', 205);
      return [{ kind: 'distance', value: k.distanceBetween(s, 'punta-europa') }];
    },
  },
  'and-2025-c3-q43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 18:20');
      const ct = k.ct({ dm: -5, desvio: -6 });
      const rv = k.rv(311, ct);
      const d = k.distFor(6, hrb(20, 35) - hrb(18, 20));
      return latlon(k.run(s, rv, d, 'Situación 20:35'));
    },
  },
  'and-2025-c3-q44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', 0, 8, 'Situación 17:00');
      const { rv, dist } = k.rhumb(s, 'tanger-espigon');
      const ct = k.ct({ dm: -3, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(17, 0), dist, 6) }];
    },
  },
  'and-2025-c3-q45': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-almina', 'punta-carnero');
      return [{ kind: 'signed', value: k.ctFrom(dv, 332) }];
    },
  },
  'and-2026-c1-q42': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('isla-tarifa', 'punta-malabata');
      return [{ kind: 'signed', value: k.ctFrom(dv, 220) }];
    },
  },
  'and-2026-c1-q43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      // "demora 310º desde el faro": dirección medida desde el faro hacia el barco.
      const s = k.fromMark('cabo-espartel', 310, 12, 'Situación 05:30');
      const dest = k.fromMark('tanger-espigon', 0, 3.8, 'Destino');
      const { rv, dist } = k.rhumb(s, dest);
      const ct = k.ct({ dm: -9, desvio: -5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(5, 30), dist, 9.5) }];
    },
  },
  'and-2026-c1-q44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      // Dos cortes posibles de los arcos: tomamos el del este de la bahía de Algeciras.
      const s = k.fix2Ranges('punta-europa', 5.4, 'punta-almina', 12, { lat: 36.1, lon: -5.25 });
      const dest = k.fromMark('isla-tarifa', 180, 1, 'Punto de paso');
      const { rv } = k.rhumb(s, dest);
      const ct = k.ct({ carta: CARTA, anyo: 2026, desvio: -6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2026-c1-q45': {
    ejercicio: 'estima-directa',
    solve(k) {
      // Al sur del faro: demora al faro = 000º; corte con el arco de 5 millas de Punta Paloma.
      const s = k.fixBearingRange('punta-gracia', 0, 'punta-paloma', 5, 0, 'Situación 08:00');
      const ct = k.ct({ carta: CARTA, anyo: 2026, desvio: -3 });
      const rv = k.rv(297, ct);
      const d = k.distFor(6, hrb(10, 20) - hrb(8, 0));
      return latlon(k.run(s, rv, d, 'Situación 10:20'));
    },
  },
  'and-2026-c2-q42': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('punta-paloma', 'punta-gracia', 112);
      return [{ kind: 'signed', value: k.ctFrom(dv, 112) }];
    },
  },
  'and-2026-c2-q43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 05,0 N', '5 11,0 W', 'Situación 11:45');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ dm: 4, desvio: -9 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(11, 45), dist, 6) }];
    },
  },
  'and-2026-c2-q44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('cabo-roche', 270, 5, 'Situación 12:00');
      const ct = k.ct({ carta: [-(5 + 20 / 60), 2010, 5], anyo: 2026, desvio: -10 });
      const rv = k.rv(154, ct);
      const d = k.distFor(6, hrb(13, 42) - hrb(12, 0));
      const p = k.run(s, rv, d, 'Situación 13:42');
      const { dv, dist } = k.bearingTo(p, 'cabo-trafalgar');
      // "Demora desde el faro": dirección faro → barco, la opuesta a la medida desde el barco.
      const desde = (dv + 180) % 360;
      k.note('Demora desde el faro', `La demora pedida se mide desde el faro hacia el barco: ${Math.round(dv)}° + 180° = ${String(Math.round(desde)).padStart(3, '0')}°.`);
      return [{ kind: 'bearing', value: desde }, { kind: 'distance', value: dist }];
    },
  },
  'and-2026-c2-q45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('cabo-negro', 0, 3, 'Salida');
      const dest = k.fromMark('punta-almina', 45, 5, 'Destino');
      const { rv } = k.rhumb(s, dest);
      const ct = k.ct({ dm: 3, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
};
