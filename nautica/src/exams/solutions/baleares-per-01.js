// Soluciones programadas de carta del PER de Baleares (lote 01). Ver andalucia-per-0.js para el formato.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];

const todas = {
  'bal-per-2017-03-a-42': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('punta-europa', 'punta-carnero', 253);
      const ct = k.ctFrom(dv, 253);
      return [{ kind: 'bearing', value: k.rv(180, ct) }];
    },
  },
  'bal-per-2017-03-b-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -4 });
      const rv = k.rv(272, ct);
      k.note('Demoras', 'Isla de Tarifa por la proa: Dv = Rv. Punta Carnero queda al norte del rumbo, por el través de estribor: Dv = Rv + 90°.');
      return latlon(k.fix2('isla-tarifa', rv, 'punta-carnero', rv + 90, 'Situación 08:00'));
    },
  },
  'bal-per-2017-03-fa-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const { dist } = k.rhumb('ceuta-bocana', 'algeciras-espigon');
      const v = dist / (70 / 60);
      k.note('Velocidad', `Para llegar en 70 minutos: V = ${dist.toFixed(2).replace('.', ',')} / (70/60) = ${v.toFixed(2).replace('.', ',')} nudos.`);
      const p = k.fromMark('punta-carnero', 135, 3.4, 'Cambio de rumbo');
      const d1 = k.distanceBetween('ceuta-bocana', p);
      const t1 = k.eta(hrb(8), d1, v);
      const d2 = k.rhumb(p, 'tarifa-espigon').dist;
      return [{ kind: 'clock', value: k.eta(t1, d2, v) }];
    },
  },
  'bal-per-2017-03-ge-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const r1 = k.rhumb('tanger-espigon', 'barbate-espigon');
      const v = r1.dist / (140 / 60);
      k.note('Velocidad', `Para llegar a las 12:20 (140 min): V = ${r1.dist.toFixed(2).replace('.', ',')} / (140/60) = ${v.toFixed(2).replace('.', ',')} nudos.`);
      k.note('Través', 'Rumbo hacia el NW: la isla de Tarifa queda por estribor, Dv = Rv + 90°.');
      const a = k.corteRumbo('tanger-espigon', r1.rv, 'isla-tarifa', r1.rv + 90, 'Tarifa por el través');
      const ta = k.eta(hrb(10), k.distanceBetween('tanger-espigon', a), v);
      const P = k.fromMark('ceuta-bocana', 0, 2.6, 'Punto P');
      const r2 = k.rhumb(a, P);
      const op = k.oposicion('isla-tarifa', 'punta-cires');
      const c = k.corteRumbo(a, r2.rv, 'isla-tarifa', op, 'Corte de la oposición');
      return [{ kind: 'clock', value: k.eta(ta, k.distanceBetween(a, c), v) }];
    },
  },
  'bal-per-2017-03-b-43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const enf = k.enfilacion('punta-cires', 'punta-alcazar');
      const op = k.oposicion('punta-carnero', 'punta-almina');
      const s = k.lineAndBearing('punta-cires', enf, 'punta-almina', op, 'Situación 20:00');
      const { dv, dist } = k.bearingTo(s, 'isla-tarifa');
      return [{ kind: 'bearing', value: dv }, { kind: 'distance', value: dist }];
    },
  },
  'bal-per-2017-03-ci-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -3 });
      const rv = k.rv(95, ct);
      const d1 = k.dvM(rv, 144, 'cabo-espartel');
      const d2 = k.dvM(rv, 30, 'punta-alcazar');
      return latlon(k.fix2('cabo-espartel', d1, 'punta-alcazar', d2, 'Situación 08:00'));
    },
  },
  'bal-per-2017-03-ge-43': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const s = k.fromMark('isla-tarifa', 180, 1, 'Salida');
      const ct = k.ct({ ct: -5 });
      const rv = k.rv(285, ct);
      const { dv } = k.bearingTo(s, 'cabo-trafalgar');
      const m = ((dv - rv + 540) % 360) - 180;
      k.note('Marcación', `M = Dv − Rv = ${dv.toFixed(0)}° − ${rv.toFixed(0)}° = ${m.toFixed(0)}°: ${m >= 0 ? 'por estribor' : 'por babor'}.`);
      return [{ kind: 'signed', value: m }];
    },
  },
  'bal-per-2017-03-a-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -2 });
      const rv = k.rv(135, ct);
      const dv = k.dvM(rv, -70, 'punta-gracia');
      const s = k.lineAndBearing('barbate-faro', 180, 'punta-gracia', dv, 'Situación 12:00');
      const { dist } = k.rhumb(s, 'tanger-espigon');
      const v = dist / (80 / 60);
      k.note('Velocidad', `Para llegar a las 13:20 (80 min): V = ${dist.toFixed(2).replace('.', ',')} / (80/60) = ${v.toFixed(2).replace('.', ',')} nudos.`);
      return [{ kind: 'speed', value: v }];
    },
  },
  'bal-per-2017-03-ci-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: 4 });
      const rv = k.rv(82, ct);
      const d1 = k.dv(221, ct, 'cabo-espartel');
      const d2 = k.dvM(rv, 45, 'punta-malabata');
      return latlon(k.fix2('cabo-espartel', d1, 'punta-malabata', d2, 'Situación 16:00'));
    },
  },
  'bal-per-2017-03-fa-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const enf = k.enfilacion('punta-carnero', 'punta-europa');
      const s = k.lineAndBearing('punta-carnero', enf, 'punta-carbonera', 315, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const v = dist / (80 / 60);
      k.note('Velocidad', `Para llegar a las 16:20 (80 min): V = ${dist.toFixed(2).replace('.', ',')} / (80/60) = ${v.toFixed(2).replace('.', ',')} nudos.`);
      const ct = k.ct({ dm: -2, desvio: -4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: v }];
    },
  },
  'bal-per-2017-03-ge-44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const enf = k.enfilacion('cabo-roche', 'cabo-trafalgar', 332);
      const ct = k.ctFrom(enf, 332);
      const dv = k.dv(60, ct, 'punta-gracia');
      return latlon(k.lineAndBearing('cabo-trafalgar', enf, 'punta-gracia', dv, 'Situación 21:12'));
    },
  },
  'bal-per-2017-03-a-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const op = k.oposicion('punta-carnero', 'punta-europa');
      const s = k.fixDist('punta-europa', op, 1.5, 'Situación 11:30');
      const { dist } = k.rhumb(s, 'ceuta-bocana');
      return [{ kind: 'clock', value: k.eta(hrb(11, 30), dist, 10) }];
    },
  },
  'bal-per-2017-03-b-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const op = k.oposicion('isla-tarifa', 'punta-alcazar');
      const s = k.lineAndBearing('isla-tarifa', op, 'punta-cires', 90, 'Situación 10:00');
      const ct = k.ct({ dm: -2, desvio: 4 });
      const rv = k.rv(75, ct);
      const p = k.corteRumbo(s, rv, 'punta-almina', 180, 'Almina al S verdadero');
      return [{ kind: 'clock', value: k.eta(hrb(10), k.distanceBetween(s, p), 9) }];
    },
  },
  'bal-per-2017-03-fa-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -5 });
      const rv = k.rv(260, ct);
      k.note('Demoras', 'Isla de Tarifa por la proa: Dv = Rv. Punta Europa por el través de estribor (queda al N del rumbo): Dv = Rv + 90°.');
      return latlon(k.fix2('isla-tarifa', rv, 'punta-europa', rv + 90, 'Situación 07:00'));
    },
  },
  'bal-per-2017-07-b-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.lineAndBearing('punta-paloma', 180, 'isla-tarifa', 70, 'Salida');
      k.note('Banda', 'Vamos hacia el SW a pasar por fuera de Cabo Espartel: lo dejamos por babor.');
      return [{ kind: 'bearing', value: k.tangent(s, 'cabo-espartel', 3, 'babor') }];
    },
  },
  'bal-per-2017-07-c-42': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -2 });
      const rv = k.rv(320, ct);
      const s = k.fix2('punta-europa', rv, 'punta-cires', rv - 90);
      return [{ kind: 'distance', value: k.distanceBetween(s, 'algeciras-espigon') }];
    },
  },
  'bal-per-2017-07-b-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      k.note('Declinación', 'El enunciado no da la declinación: usamos la de la carta llevada a 2017.');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: 6 });
      const rv = k.rv(250, ct);
      const d1 = k.dvM(rv, 13, 'isla-tarifa');
      const d2 = k.dvM(rv, -55, 'punta-cires');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-cires', d2));
    },
  },
  'bal-per-2017-07-c-43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const enf = k.enfilacion('isla-tarifa', 'punta-paloma', 311);
      const ct = k.ctFrom(enf, 311);
      const desvio = ct - -3;
      k.note('Desvío', `Δ = Ct − dm = (${ct.toFixed(1)}°) − (−3°) = ${desvio.toFixed(1)}°.`);
      return [{ kind: 'bearing', value: k.rv(250, ct) }, { kind: 'signed', value: desvio }];
    },
  },
  'bal-per-2017-07-eda-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-gracia', 180, 3, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'barbate-espigon');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(15), dist, 7.5) }];
    },
  },
  'bal-per-2017-07-fc-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', 315, 4, 'Situación 11:30');
      const ct = k.ct({ dm: -2, desvio: -3 });
      const rv = k.rv(80, ct);
      const op = k.oposicion('punta-gracia', 'punta-malabata');
      const c = k.corteRumbo(s, rv, 'punta-malabata', op, 'Corte de la oposición');
      const t = k.eta(hrb(11, 30), k.distanceBetween(s, c), 7);
      const o = k.fixDist('punta-malabata', op, 4.4, 'Situación observada');
      const { dist } = k.rhumb(o, 'tanger-espigon');
      return [{ kind: 'clock', value: k.eta(t, dist, 7) }];
    },
  },
  'bal-per-2017-07-c-44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const op = k.oposicion('punta-malabata', 'isla-tarifa');
      const ct = k.ctFrom(op, 37);
      const rv = k.rv(95, ct);
      const dv = k.dvM(rv, -120, 'punta-gracia');
      return latlon(k.lineAndBearing('isla-tarifa', op, 'punta-gracia', dv));
    },
  },
  'bal-per-2017-07-eda-44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', 315, 4, 'Situación 18:00');
      k.note('Banda', 'Entramos en el Estrecho hacia el E: Punta Cires, en la costa sur, queda por estribor.');
      const rv = k.tangent(s, 'punta-cires', 2.5, 'estribor');
      const D = k.distanceBetween(s, 'punta-cires');
      const d = Math.sqrt(D * D - 2.5 * 2.5);
      k.note('Distancia hasta el través', `Al través estamos en el punto de tangencia: d = √(${D.toFixed(2).replace('.', ',')}² − 2,5²) = ${d.toFixed(2).replace('.', ',')} millas.`);
      const ct = k.ct({ dm: -2, desvio: -2 });
      return [{ kind: 'clock', value: k.eta(hrb(18), d, 11) }, { kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2017-07-fc-44': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      k.note('Declinación', 'El enunciado no da la declinación: usamos la de la carta llevada a 2017.');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -2 });
      const rv = k.rv(258, ct);
      const dv = k.dvM(rv, 90, 'punta-carnero');
      return latlon(k.fixDist('punta-carnero', dv, 2.5, 'Situación 08:30'));
    },
  },
  'bal-per-2017-07-eda-45': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const op = k.oposicion('punta-almina', 'punta-europa');
      const ct = k.ctFrom(op, 357);
      const dv = k.dv(330, ct, 'punta-carnero');
      const s = k.lineAndBearing('punta-europa', op, 'punta-carnero', dv, 'Situación 14:00');
      const { rv } = k.rhumb(s, 'isla-tarifa');
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2017-07-fc-45': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 51,9 N', '5 50,0 W', 'Salida');
      k.note('Banda', 'Navegamos hacia el ENE: Punta Cires, en la costa sur, queda por estribor.');
      const rv = k.tangent(s, 'punta-cires', 4, 'estribor');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2017-09-a-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -3 });
      const rv = k.rv(250, ct);
      const d1 = k.dvM(rv, -15, 'punta-cires');
      const d2 = k.dv(320, ct, 'punta-carnero');
      return latlon(k.fix2('punta-cires', d1, 'punta-carnero', d2, 'Situación 07:00'));
    },
  },
  'bal-per-2017-09-c-42': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const enf = k.enfilacion('cabo-roche', 'cabo-trafalgar', 330);
      const ct = k.ctFrom(enf, 330);
      const dv = k.dv(87, ct, 'punta-paloma');
      return latlon(k.lineAndBearing('cabo-trafalgar', enf, 'punta-paloma', dv, 'Situación 09:00'));
    },
  },
  'bal-per-2017-09-e-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const a = k.fix2('punta-europa', 30, 'punta-almina', 140, 'Situación 20:00');
      const d1 = k.dvM(254, 156, 'isla-tarifa');
      const d2 = k.dvM(254, -111.5, 'punta-alcazar');
      const b = k.fix2('isla-tarifa', d1, 'punta-alcazar', d2, 'Situación 21:20');
      const d = k.distanceBetween(a, b);
      k.note('Velocidad', `V = ${d.toFixed(2).replace('.', ',')} millas / (80/60) h = ${(d * 0.75).toFixed(1).replace('.', ',')} nudos.`);
      // Las opciones se distinguen ya por las dos situaciones (el lector de opciones confundiría la velocidad con la hora).
      return [...latlon(a), ...latlon(b)];
    },
  },
  'bal-per-2017-09-a-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -2 });
      const s = k.fix2('punta-gracia', k.dv(10, ct, 'punta-gracia'), 'punta-paloma', k.dv(95, ct, 'punta-paloma'), 'Situación 13:30');
      const rv = k.rv(175, ct);
      return latlon(k.run(s, rv, k.distFor(5, 75), 'Situación 14:45'));
    },
  },
  'bal-per-2017-09-c-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const op = k.oposicion('isla-tarifa', 'punta-alcazar');
      const s = k.lineAndBearing('isla-tarifa', op, 'punta-cires', 90, 'Situación 10:00');
      const ct = k.ct({ dm: -2, desvio: 4 });
      const rv = k.rv(75, ct);
      const p = k.corteRumbo(s, rv, 'punta-almina', 180, 'Almina al S verdadero');
      return [{ kind: 'clock', value: k.eta(hrb(10), k.distanceBetween(s, p), 9) }];
    },
  },
  'bal-per-2017-09-e-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 57,8 N', '6 06,5 W', 'Salida');
      const ct = k.ct({ dm: -2, desvio: 5 });
      const rv = k.rv(86, ct);
      return latlon(k.corteRumbo(s, rv, 'punta-cires', rv + 90, 'Cires por el través'));
    },
  },
  'bal-per-2017-09-a-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const op = k.oposicion('cabo-trafalgar', 'punta-gracia');
      const s = k.lineAndBearing('cabo-trafalgar', op, 'barbate-faro', 180, 'Situación 14:36');
      const { rv, dist } = k.rhumb(s, 'tanger-espigon');
      const v = dist / (132 / 60);
      k.note('Velocidad', `Para llegar a las 16:48 (132 min): V = ${dist.toFixed(2).replace('.', ',')} / 2,2 = ${v.toFixed(2).replace('.', ',')} nudos.`);
      const p = k.corteRumbo(s, rv, 'isla-tarifa', 90, 'Tarifa al E verdadero');
      return [{ kind: 'clock', value: k.eta(hrb(14, 36), k.distanceBetween(s, p), v) }];
    },
  },
  'bal-per-2017-09-c-44': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const s = k.fromMark('cabo-trafalgar', 180, 3);
      const { dv } = k.bearingTo(s, 'barbate-faro');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -3.5 });
      const da = ((dv - ct) % 360 + 360) % 360;
      k.note('Demora de aguja', `Da = Dv − Ct = ${dv.toFixed(1)}° − (${ct.toFixed(1)}°) = ${da.toFixed(1)}°.`);
      return [{ kind: 'bearing', value: da }];
    },
  },
  'bal-per-2017-09-d-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      k.note('Declinación', 'El enunciado no da la declinación: usamos la de la carta llevada a 2017.');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -2 });
      const s = k.fix2('punta-paloma', k.dv(10, ct, 'punta-paloma'), 'punta-malabata', k.dv(170, ct, 'punta-malabata'), 'Situación 08:00');
      const r1 = k.rhumb(s, 'barbate-espigon');
      const v1 = r1.dist / 2.5;
      k.note('Velocidad hacia Barbate', `Para llegar a las 10:30 (2,5 h): V = ${r1.dist.toFixed(2).replace('.', ',')} / 2,5 = ${v1.toFixed(2).replace('.', ',')} nudos.`);
      const p = k.run(s, r1.rv, v1, 'Situación 09:00');
      const r2 = k.rhumb(p, 'tanger-espigon');
      const v2 = r2.dist / 2.5;
      k.note('Velocidad hacia Tánger', `De 09:00 a 11:30 hay 2,5 h: V = ${r2.dist.toFixed(2).replace('.', ',')} / 2,5 = ${v2.toFixed(2).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: r2.rv }, { kind: 'speed', value: v2 }];
    },
  },
  'bal-per-2017-12-a-42': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const s = k.fromMark('punta-almina', 0, 2, 'Salida');
      const { rv } = k.rhumb(s, 'punta-carnero');
      k.note('Demora verdadera de Almina', 'Recién puestos a rumbo seguimos al N verdadero de Punta Almina: Dv = 180°.');
      const ct = k.ctFrom(180, 170);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2017-12-b-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ ct: 7 });
      const rv = k.rv(263, ct);
      const dv = k.dvM(rv, 160, 'isla-tarifa');
      const s = k.lineAndBearing('punta-paloma', 180, 'isla-tarifa', dv, 'Situación');
      k.note('Banda', 'Vamos hacia el NW pasando por fuera de Cabo Trafalgar: lo dejamos por estribor.');
      return [{ kind: 'bearing', value: k.tangent(s, 'cabo-trafalgar', 3, 'estribor') }];
    },
  },
  'bal-per-2017-12-d-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -3 });
      const rv = k.rv(264, ct);
      k.note('Demoras', 'Isla de Tarifa por la proa: Dv = Rv. Punta Carnero, al N del rumbo, por el través de estribor: Dv = Rv + 90°.');
      return latlon(k.fix2('isla-tarifa', rv, 'punta-carnero', rv + 90, 'Situación 06:00'));
    },
  },
  'bal-per-2017-12-e-42': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -2 });
      const rv = k.rv(110, ct);
      const s = k.fix2('punta-cires', k.dvM(rv, 9, 'punta-cires'), 'punta-alcazar', k.dvM(rv, 78, 'punta-alcazar'));
      return [{ kind: 'distance', value: k.distanceBetween(s, 'punta-carnero') }];
    },
  },
  'bal-per-2017-12-a-43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const enf = k.enfilacion('isla-tarifa', 'punta-paloma', 311);
      const ct = k.ctFrom(enf, 311);
      const desvio = ct - -3;
      k.note('Desvío', `Δ = Ct − dm = (${ct.toFixed(1)}°) − (−3°) = ${desvio.toFixed(1)}°.`);
      return [{ kind: 'bearing', value: k.rv(250, ct) }, { kind: 'signed', value: desvio }];
    },
  },
  'bal-per-2017-12-c-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fix2('punta-paloma', 55, 'barbate-espigon', 338, 'Situación 13:30');
      k.note('Declinación', 'El enunciado no da la declinación: usamos la de la carta llevada a 2017.');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: 7 });
      const rv = k.rv(175, ct);
      return latlon(k.run(s, rv, k.distFor(6, 90), 'Situación 15:00'));
    },
  },
  'bal-per-2017-12-d-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      k.note('Declinación', 'El enunciado no da la declinación: usamos la de la carta llevada a 2017.');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: 5 });
      return latlon(k.fix2('punta-europa', k.dv(15, ct, 'punta-europa'), 'punta-carnero', k.dv(289, ct, 'punta-carnero'), 'Situación 10:30'));
    },
  },
  'bal-per-2017-12-a-44': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const s = k.fromMark('punta-carnero', 135, 4.3, 'Salida');
      k.note('Través', 'Rumbo al WSW: la isla de Tarifa queda al S del rumbo, por babor: Dv = Rv − 90° = 161°.');
      const p = k.corteRumbo(s, 251, 'isla-tarifa', 161, 'Tarifa por el través');
      return [{ kind: 'distance', value: k.distanceBetween(s, p) }];
    },
  },
  'bal-per-2017-12-c-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 12:00');
      const ct = k.ct({ ct: -15 });
      const rv = k.rv(345, ct);
      k.note('Través', 'Punta de Gracia queda al E del rumbo, por estribor: Dv = Rv + 90°.');
      const p = k.corteRumbo(s, rv, 'punta-gracia', rv + 90, 'Gracia por el través');
      return [{ kind: 'clock', value: k.eta(hrb(12), k.distanceBetween(s, p), 8) }];
    },
  },
  'bal-per-2017-12-d-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-gracia', 180, 3, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'barbate-espigon');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(15), dist, 7.5) }];
    },
  },
  'bal-per-2017-12-a-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-carnero', 180, 2, 'Situación 20:00');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(20), dist, 7) }];
    },
  },
  'bal-per-2017-12-c-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-almina', 90, 3, 'Situación 07:00');
      const { rv, dist } = k.rhumb(s, 'algeciras-espigon');
      const v = dist / (100 / 60);
      k.note('Velocidad', `Para llegar a las 08:40 (100 min): V = ${dist.toFixed(2).replace('.', ',')} / (100/60) = ${v.toFixed(2).replace('.', ',')} nudos.`);
      const ct = k.ct({ dm: -2, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: v }];
    },
  },
  'bal-per-2018-04-b-42': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const ct = k.ct({ dm: 3, desvio: -1.6 });
      const rv = k.rv(147, ct);
      const s = k.fix2('punta-gracia', k.dvM(rv, -42, 'punta-gracia'), 'punta-alcazar', k.dvM(rv, -22, 'punta-alcazar'));
      return [{ kind: 'distance', value: k.distanceBetween(s, 'isla-tarifa') }];
    },
  },
  'bal-per-2018-04-c-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const o1 = k.oposicion('cabo-trafalgar', 'punta-malabata');
      const o2 = k.oposicion('cabo-espartel', 'punta-gracia');
      const s = k.lineAndBearing('punta-malabata', o1, 'punta-gracia', o2, 'Situación 10:00');
      const o3 = k.oposicion('punta-paloma', 'punta-alcazar');
      const p = k.fixBearingRange('punta-alcazar', o3, 'punta-cires', 6, 0, 'Segunda situación');
      const { rv, dist } = k.rhumb(s, p);
      const ct = k.ct({ ct: 2.2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(10), dist, 3.5) }];
    },
  },
  'bal-per-2018-04-a-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -8 });
      const rv = k.rv(184, ct);
      return latlon(k.fix2('cabo-roche', k.dv(4, ct, 'cabo-roche'), 'cabo-trafalgar', rv - 90));
    },
  },
  'bal-per-2018-04-e-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 20,0 W', 'Salida');
      k.note('Velocidad verdadera', 'V = Vcorredera × K = 20 × 1,09 = 21,8 nudos.');
      return latlon(k.run(s, 45, k.distFor(21.8, 30), 'Situación a la media hora'));
    },
  },
  'bal-per-2018-04-a-44': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      return latlon(k.fixBearingRange('punta-paloma', 84, 'punta-gracia', 3.5, 1));
    },
  },
  'bal-per-2018-04-b-44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const enf = k.enfilacion('punta-alcazar', 'punta-cires', 215);
      const ct = k.ctFrom(enf, 215);
      const desvio = ct - 2.2;
      k.note('Desvío', `Δ = Ct − dm = (${ct.toFixed(1)}°) − (+2,2°) = ${desvio.toFixed(1)}°.`);
      return [{ kind: 'bearing', value: k.rv(270, ct) }, { kind: 'signed', value: desvio }];
    },
  },
  'bal-per-2018-04-d-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fix2('punta-carnero', 310, 'punta-almina', 220, 'Situación 22:00');
      k.note('Declinación', 'El enunciado no da la declinación: usamos la de la carta llevada a 2018.');
      const ct = k.ct({ carta: L105, anyo: 2018, desvio: -3.8 });
      const rv = k.rv(280, ct);
      return latlon(k.run(s, rv, k.distFor(4, 135), 'Situación 00:15'));
    },
  },
  'bal-per-2018-04-b-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 00,0 W', 'Salida');
      const ct = k.ct({ dm: -2, desvio: 6 });
      const rv = k.rv(75, ct);
      return latlon(k.run(s, rv, k.distFor(12, 45), 'Situación 45 min después'));
    },
  },
  'bal-per-2018-04-e-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('punta-carnero', 180, 5, 'Situación 17:30');
      k.note('Declinación', 'dm 2018 de la carta = 2°50′ W − 13 × 7′ = 1°19′ W; redondeada al grado, como pide el enunciado: 1° W.');
      const ct = k.ct({ dm: -1, desvio: 5 });
      const rv = k.rv(260, ct);
      return latlon(k.run(s, rv, k.distFor(8, 60), 'Situación 18:30'));
    },
  },
  'bal-per-2018-06-a-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('algeciras-espigon', 0, 1, 'Situación 07:00');
      const r = k.rhumb(s, 'gibraltar-muelle-sur');
      const m = k.run(s, r.rv, r.dist / 2, 'Mitad de la distancia');
      const t1 = k.eta(hrb(7), r.dist / 2, 1);
      k.note('Marcación de Carnero', 'Al rumbo S (180°), Carnero 100° por estribor: Dv = 180° + 100° = 280°.');
      const c = k.corteRumbo(m, 180, 'punta-carnero', 280, 'Carnero 100° Er');
      const t2 = k.eta(t1, k.distanceBetween(m, c), 3);
      const d = (c.lat - 36) * 60;
      k.note('Distancia al paralelo 36° N', `Navegando al S, la distancia es la diferencia de latitud: ${d.toFixed(2).replace('.', ',')} millas.`);
      const f = k.run(c, 180, d, 'Paralelo 36° N');
      return [{ kind: 'clock', value: k.eta(t2, d, 6) }, { kind: 'lon', value: f.lon }];
    },
  },
  'bal-per-2018-06-c-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -4 });
      const rv = k.rv(272, ct);
      k.note('Demoras', 'Isla de Tarifa por la proa: Dv = Rv. Punta Carnero queda al norte del rumbo, por el través de estribor: Dv = Rv + 90°.');
      return latlon(k.fix2('isla-tarifa', rv, 'punta-carnero', rv + 90, 'Situación 08:00'));
    },
  },
  'bal-per-2018-06-c-43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const enf = k.enfilacion('punta-cires', 'punta-alcazar');
      const op = k.oposicion('punta-carnero', 'punta-almina');
      const s = k.lineAndBearing('punta-cires', enf, 'punta-almina', op, 'Situación 20:00');
      const { dv, dist } = k.bearingTo(s, 'isla-tarifa');
      return [{ kind: 'bearing', value: dv }, { kind: 'distance', value: dist }];
    },
  },
  'bal-per-2018-06-c-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const op = k.oposicion('isla-tarifa', 'punta-alcazar');
      const s = k.lineAndBearing('isla-tarifa', op, 'punta-cires', 90, 'Situación 10:00');
      const ct = k.ct({ dm: -2, desvio: 4 });
      const rv = k.rv(75, ct);
      const p = k.corteRumbo(s, rv, 'punta-almina', 180, 'Almina al S verdadero');
      return [{ kind: 'clock', value: k.eta(hrb(10), k.distanceBetween(s, p), 9) }];
    },
  },
  'bal-per-2018-09-d-42': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const s = k.pos('36 08,7 N', '6 00,5 W');
      return [{ kind: 'bearing', value: k.bearingTo(s, 'cabo-trafalgar').dv }];
    },
  },
  'bal-per-2018-09-e-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -5 });
      const rv = k.rv(225, ct);
      const op = k.oposicion('punta-europa', 'punta-almina');
      k.note('Demora de Almina', 'La Da de Almina cae sobre la propia oposición (la Ct ya la dan desvío y declinación): la situación sale de la oposición y la marcación de Carnero.');
      const dv = k.dvM(rv, 80, 'punta-carnero');
      const s = k.lineAndBearing('punta-almina', op, 'punta-carnero', dv, 'Situación 10:00');
      const p = k.fromMark('isla-tarifa', 225, 3, 'Punto de paso');
      const r = k.rhumb(s, p);
      return [{ kind: 'bearing', value: k.ra(r.rv, ct) }];
    },
  },
  'bal-per-2018-09-a-43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const enf = k.enfilacion('punta-carnero', 'punta-europa', 233);
      return [{ kind: 'signed', value: k.ctFrom(enf, 233) }];
    },
  },
  'bal-per-2018-09-b-43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const ct1 = k.ct({ dm: 2, desvio: 2 });
      const rv1 = k.rv(296, ct1);
      const op = k.oposicion('punta-europa', 'punta-almina');
      const dv = k.dvM(rv1, -60, 'ceuta-bocana');
      const s = k.lineAndBearing('punta-almina', op, 'ceuta-bocana', dv, 'Situación 09:15');
      const p = k.run(s, 315, k.distFor(5, 90), 'Situación 10:45');
      const ct2 = k.ct({ dm: 1.5, desvio: 2.5 });
      const rv2 = k.rv(252, ct2);
      const op2 = k.oposicion('punta-alcazar', 'isla-tarifa');
      const c = k.corteRumbo(p, rv2, 'isla-tarifa', op2, 'Oposición Tarifa–Alcázar');
      return [{ kind: 'clock', value: k.eta(hrb(10, 45), k.distanceBetween(p, c), 3) }, { kind: 'distance', value: k.distanceBetween(c, 'isla-tarifa') }];
    },
  },
};

// Resueltas y comprobadas a mano, pero el lector de opciones (src/exams/options.js) no entiende el formato de la
// opción oficial («HRB=0924», «5º 25’2 W», «36º 10',8 N», «35ª», «05-11,5' W», «20 grados babor»): con el lector
// actual no se pueden comprobar, así que no se exportan. Ver DISCREPANCIAS.
const FORMATO = new Set([
  'bal-per-2017-03-b-42',
  'bal-per-2017-03-fa-42',
  'bal-per-2017-03-ge-42',
  'bal-per-2017-03-ge-43',
  'bal-per-2017-03-ci-44',
  'bal-per-2017-03-ge-44',
  'bal-per-2017-03-b-45',
  'bal-per-2017-03-fa-45',
  'bal-per-2017-07-fc-43',
  'bal-per-2017-09-a-42',
  'bal-per-2017-09-c-42',
  'bal-per-2017-09-a-43',
  'bal-per-2017-09-c-43',
  'bal-per-2017-09-a-44',
  'bal-per-2017-12-d-43',
  'bal-per-2018-04-c-42',
  'bal-per-2018-04-a-43',
  'bal-per-2018-04-e-43',
  'bal-per-2018-04-d-44',
  'bal-per-2018-06-a-42',
  'bal-per-2018-06-c-42',
  'bal-per-2018-09-b-43',
]);

export default Object.fromEntries(Object.entries(todas).filter(([id]) => !FORMATO.has(id)));
export const porFormato = Object.fromEntries(Object.entries(todas).filter(([id]) => FORMATO.has(id)));

/* DISCREPANCIAS
 * Elemento que no está en la carta de la app (isobáticas, sondas, veriles, naufragios, marcas, puntos sin coordenadas):
 * 'bal-per-2017-03-a-43': enfilación Trafalgar–Roche y sonda de 100 m; la carta de la app no tiene isobáticas.
 * 'bal-per-2017-07-b-45': situación sobre la isobática de 100 m con marcación de Trafalgar; sin isobáticas.
 * 'bal-per-2017-09-d-44': el destino es el corte con la isobática de 30 m; sin isobáticas.
 * 'bal-per-2017-09-e-44': hora y situación al pasar el veril de 200 m; sin isobáticas.
 * 'bal-per-2017-09-a-45': corte con la isobática de 100 m al S del DST; ni isobáticas ni DST.
 * 'bal-per-2018-04-e-42': luz verde del puerto de Torre de Guadiaro; no está en la carta de la app.
 * 'bal-per-2018-04-b-43': situación sobre la isobática de 100 m al NW del banco Majuán; sin isobáticas.
 * 'bal-per-2018-04-d-43': rumbo al buque parcialmente hundido al NE de Cabo Espartel; sin naufragios.
 * 'bal-per-2018-04-c-44': situación por la oposición Paloma–Malabata y la isobática de 100 m; sin isobáticas.
 * 'bal-per-2018-04-a-45': salida desde la marca especial al E de La Línea; sin marcas especiales.
 * 'bal-per-2018-04-d-45': corte con la isobática de 30 m del banco de Trafalgar; sin isobáticas.
 * 'bal-per-2018-06-b-42': oposición Isla de Tarifa–desembocadura del río El Liam; ese punto no está en la carta.
 * 'bal-per-2018-06-i-42': enfilación Magair–Cabo Espartel; Magair no está en la carta de la app.
 * 'bal-per-2018-06-a-43': destino en Punta de los Judíos; no está en la carta de la app.
 * 'bal-per-2018-06-b-43': sonda de 500 m, espigón de Piedra Redonda e isobática de 50 m; nada de eso está.
 * 'bal-per-2018-06-a-44': marca cardinal E de la piscifactoría de Barbate y naufragio entre Zahara y Cabo Plata.
 * 'bal-per-2018-06-b-44': naufragio próximo a Torre Castilobo y marca cardinal N frente a Malabata.
 * 'bal-per-2018-09-a-42': situación por oposición Carnero–Cires, DST y sonda de 500 m; ni DST ni sondas.
 * 'bal-per-2018-09-b-42': situación por enfilación Carnero–Europa y sonda de 200 m; sin sondas.
 * 'bal-per-2018-09-d-43': situación a 2,2 M de Tánger sobre la isobática de 50 m y en el sector blanco de El Xarf;
 *   ni isobáticas ni sectores.
 *
 * Respuesta que no se puede comparar con las opciones:
 * 'bal-per-2018-04-c-43': la oficial es «A ninguna hora». Desde 36°02,0′ N 6°10,0′ W al Rv 162,8° Malabata queda
 *   siempre al E del rumbo (por babor): nunca se marca 65° por estribor. La respuesta es correcta, pero no es un valor.
 *
 * Resultado entre dos opciones:
 * 'bal-per-2018-06-c-44': la enfilación Europa–Carnero mide Dv 243,5° en la carta; con Da 250° sale Ct −6,5° y
 *   Δ = −4,5°, justo entre la oficial (c, −3°) y la d (−6°). La oficial supone la enfilación a 245°.
 *
 * Formato de la opción oficial que el lector de opciones no entiende (resueltas en `porFormato`, no exportadas;
 * entre paréntesis lo calculado, que coincide con la oficial):
 * 'bal-per-2017-03-b-42' (36°00,8′ N 5°25,1′ W), 'bal-per-2017-03-fa-42' (09:28), 'bal-per-2017-03-ge-42' (12:25),
 * 'bal-per-2017-03-ge-43' (M = 20° Er: «20 grados estribor/babor» se leen igual), 'bal-per-2017-03-ci-44'
 * (35°52,4′ N 5°49,8′ W), 'bal-per-2017-03-ge-44' (36°02,1′ N 5°53,7′ W), 'bal-per-2017-03-b-45' (11:40),
 * 'bal-per-2017-03-fa-45' (36°04,3′ N 5°19,7′ W), 'bal-per-2017-07-fc-43' (13:57), 'bal-per-2017-09-a-42'
 * (36°00,5′ N 5°20,2′ W), 'bal-per-2017-09-c-42' (36°02,4′ N 5°53,9′ W), 'bal-per-2017-09-a-43' (35°57,8′ N 5°47,3′ W),
 * 'bal-per-2017-09-c-43' (11:40), 'bal-per-2017-09-a-44' (15:28), 'bal-per-2017-12-d-43' (36°03,5′ N 5°22,0′ W),
 * 'bal-per-2018-04-c-42' (Ra 101,5°, 13:37), 'bal-per-2018-04-a-43' (36°10,6′ N 6°07,4′ W), 'bal-per-2018-04-e-43'
 * (36°07,7′ N 5°10,4′ W), 'bal-per-2018-04-d-44' (35°57,6′ N 5°25,0′ W; la opción escribe «35ª»), 'bal-per-2018-06-a-42'
 * (11:02, 5°23,7′ W), 'bal-per-2018-06-c-42' (36°00,8′ N 5°25,1′ W), 'bal-per-2018-09-b-43' (14:08, 2,7 M).
 */
