// Ayudas de las pruebas de sincronización: reloj de mentira (Date y Date.now), almacenamiento en memoria, azar con
// semilla y un generador de escrituras al almacén como las que hace la app. No es un test (no acaba en .test.js).

const DateReal = Date;
let ahora = Date.UTC(2026, 4, 10, 8);

/** Pone un reloj de mentira (new Date() y Date.now()) mientras dura `fn`. */
export async function conReloj(inicio, fn) {
  ahora = inicio;
  class DateFalsa extends DateReal {
    constructor(...a) { super(...(a.length ? a : [ahora])); }
    static now() { return ahora; }
  }
  globalThis.Date = DateFalsa;
  try { return await fn({ avanza: (ms) => { ahora += ms; }, ahora: () => ahora }); } finally { globalThis.Date = DateReal; }
}

export function memoria(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
}

/** Azar con semilla (mulberry32). */
export function azar(semilla) {
  let a = semilla >>> 0;
  const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.int = (n) => Math.floor(r() * n);
  r.de = (xs) => xs[r.int(xs.length)];
  r.bytes = (n) => Uint8Array.from({ length: n }, () => r.int(256));
  return r;
}

const PREGUNTAS = ['and-2024-c1-t01', 'and-2024-c1-t02', 'and-2024-c2-t05', 'dgmm-2023-c1-t10', 'bal-2025-c1-t03', 'and-2023-c2-t44'];
const RANGOS = ['grumete', 'marinero', 'timonel', 'contramaestre', 'patron'];

/**
 * Una escritura al azar, como las de la app, sobre el almacén `p`. `reloj.avanza` mueve el tiempo entre escrituras
 * (a veces días: así entran el repaso espaciado y los días de actividad).
 */
export function escrituraAlAzar(p, r, reloj) {
  reloj.avanza(r() < 0.15 ? (1 + r.int(3)) * 864e5 : 1000 + r.int(600e3));
  const tipo = r.int(16);
  const eT = r.de(['andalucia/per', 'andalucia/py', 'dgmm/per']);
  const [eje, tit] = eT.split('/');
  switch (tipo) {
    case 0: case 1: case 2: case 3:
      p.recordExam(r.de(PREGUNTAS), { choice: r() < 0.1 ? null : r.de(['a', 'b', 'c', 'd']), ok: r() < 0.6, nivel: r() < 0.1 });
      break;
    case 4: p.recordAttempt(r.de(['rumbo', 'marea', 'distancia']), { ok: r() < 0.5, seed: r.int(1e6), mistakes: r() < 0.3 ? [r.de(['signo', 'unidades'])] : [] }); break;
    case 5: p.setSetting(r.de(['minutosDia', 'diasEstudio', `examen_${tit}`, 'segTarjeta', `chuletasLeidas_${tit}`]), r.de([10, 20, 30, 'todos', '2026-12-01', [1, 2]])); break;
    case 6: p.setSetting(r.de(['letra', 'sonidos', 'vozAuto', 'ultimaCopia', `sesion_${tit}`]), r.de(['grande', true, false, 12345])); break;
    case 7: p.recordNivel(eje, tit, { aciertos: r.int(20), total: 20, t: reloj.ahora() }); break;
    case 8: p.recordFichaVista(eje, tit, r.de(['luces', 'boyas', 'rumbo']), new Date().toISOString()); break;
    case 9: p.recordRepasoConcepto(eje, tit, r.de(['luces', 'boyas']), r() < 0.3 ? { fuera: true, t: new Date().toISOString() } : { racha: r.int(3), prox: '2026-06-01', t: new Date().toISOString() }); break;
    case 10: {
      const antes = p.travesia(eje, tit);
      const i = Math.max(RANGOS.indexOf(antes.rango), r.int(RANGOS.length));
      p.guardarTravesia(eje, tit, { rango: RANGOS[i], insignias: r() < 0.5 ? { [r.de(['semana', 'rescate'])]: new Date().toISOString(), ...antes.insignias } : antes.insignias }); // una insignia ganada no se vuelve a ganar
      break;
    }
    case 11: p.ganarInsignia(eje, tit, 'guardia'); break;
    case 12: p.recordTest({ tit, eje, tipo: r.de(['simulacro', 'real']), conv: null, aciertos: r.int(45), total: 45 }); break;
    case 13: p.saveLeccion(r.de(['per-1-1', 'per-1-2', 'py-3-1']), { visto: true, caja: r.int(4), proximo: reloj.ahora() + 864e5, ultimo: reloj.ahora() }); break;
    case 14: p.logActividad(1 + r.int(40), reloj.ahora()); break;
    case 15: if (r() < 0.5) p.saveTestEnCurso({ tit, eje, tipo: 'simulacro', seed: r.int(100), respuestas: {}, i: 0, consumidoMs: 0 }); else p.setPlanEstudio(tit, { inicio: '2026-06-01', fin: '2026-09-01' }); break;
    default: break;
  }
}
