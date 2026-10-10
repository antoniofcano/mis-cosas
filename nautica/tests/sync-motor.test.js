// Sincronización de punta a punta en Node: almacenes de progreso de verdad + motor (src/store/sync/motor.js) + el
// servidor de sync-worker/ (src/servidor.js) con un D1 en memoria, unidos por un fetch simulado. Dos aparatos que
// estudian sin conexión y luego sincronizan, en los dos órdenes, acaban con el mismo progreso, sin pérdidas ni
// duplicados; y sin red, con red intermitente, con el servidor caído o con respuestas troceadas o rotas, nada se pierde.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore } from '../src/store/progress.js';
import { crearMotor, estaSana, avisoCabecera } from '../src/store/sync/motor.js';
import { separar } from '../src/store/sync/fusion.js';
import { CLAVE_SYNC } from '../src/store/sync/registro.js';
import { validarCodigo, generarCodigo, formatearCodigo, normalizarCodigo, ALFABETO } from '../src/store/sync/codigo.js';
import { manejar, LIMITES } from '../../sync-worker/src/servidor.js';
import { d1Memoria } from '../../sync-worker/tests/d1-node.js';
import { createProgressStore as almacenAntiguo } from './fixtures/progress-antiguo.js';
import { conReloj, memoria, azar, escrituraAlAzar } from './sync-reloj.js';

const T0 = Date.UTC(2026, 4, 10, 8);
const URL0 = 'https://sync.prueba';
const LIM0 = { ...LIMITES };
const relojQuieto = { setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {} };

/** Un servidor de mentira con la lógica de verdad. `fallo(url, init)` puede devolver 'red', 'caido', 'cortada' o 'perdida'. */
function servidor() {
  const env = { DB: d1Memoria(), PEPPER: 'pepper-de-pruebas-0123456789' };
  const s = {
    env, peticiones: 0, fallo: null,
    async fetch(url, init) {
      s.peticiones += 1;
      const f = s.fallo?.(url, init);
      if (f === 'red') throw new TypeError('fetch failed');
      if (f === 'caido') return new Response('<h1>502</h1>', { status: 502 });
      const res = await manejar(new Request(url, { ...init, headers: { ...init.headers, origin: 'http://localhost:4800', 'cf-connecting-ip': '10.0.0.1' } }), env, { ahora: Date.now() });
      if (f === 'perdida') throw new TypeError('fetch failed'); // el servidor lo guardó, pero la respuesta no llegó
      if (f === 'cortada') { const t = await res.text(); return new Response(t.slice(0, Math.floor(t.length / 2)), { status: 200 }); }
      return res;
    },
  };
  return s;
}

function aparato(srv, mem = memoria(), { enLinea = () => true } = {}) {
  const progress = createProgressStore(mem);
  const motor = crearMotor({ registro: progress.registro, storage: mem, fetch: srv.fetch, url: URL0, reloj: relojQuieto, enLinea, azar: () => 0.5, locks: null });
  return { progress, motor, mem };
}
// Lo compartido del progreso de un aparato, tal como lo vería al volver a abrir la app (el pliegue completo, con lo que
// se completa al cargar, como `onboarded`).
const compartido = (x) => separar(createProgressStore(x.mem).get()).compartido;
const copia = (mem) => memoria(Object.fromEntries(mem.m));

test('código: 12 símbolos del alfabeto, control, normalización y mensajes claros', () => {
  assert.equal(ALFABETO.length, 31);
  assert.doesNotMatch(ALFABETO, /[01ILO]/);
  for (let i = 0; i < 200; i += 1) {
    const c = generarCodigo();
    assert.match(c, /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{12}$/);
    assert.equal(validarCodigo(c).ok, true);
    assert.equal(validarCodigo(` ${formatearCodigo(c).toLowerCase()} `).codigo, c);
    // Cualquier símbolo cambiado o dos vecinos cambiados de sitio se detectan.
    const k = i % 12;
    const otro = ALFABETO[(ALFABETO.indexOf(c[k]) + 1 + (i % 30)) % 31];
    assert.equal(validarCodigo(c.slice(0, k) + otro + c.slice(k + 1)).ok, false);
    if (c[k] !== c[(k + 1) % 12] && k < 11) assert.equal(validarCodigo(c.slice(0, k) + c[k + 1] + c[k] + c.slice(k + 2)).ok, false);
  }
  assert.match(formatearCodigo('k7qm4txd92hb'), /^K7QM-4TXD-92HB$/);
  assert.equal(normalizarCodigo('k7qm 4txd–92hb'), 'K7QM4TXD92HB');
  assert.equal(validarCodigo('').motivo, 'vacio');
  assert.equal(validarCodigo('K7QM-4TXD-92H').motivo, 'largo');
  assert.match(validarCodigo('K7QM-4TXD-920B').texto, /0, O, 1, I ni L/);
  assert.equal(validarCodigo('K7QM-4TXD-92H#').motivo, 'simbolo');
});

test('dos aparatos con progreso previo se unen, estudian sin conexión y sincronizan: el mismo progreso, sin pérdidas ni duplicados, idempotente', async () => {
  for (let s = 1; s <= 25; s += 1) {
    await conReloj(T0, async (reloj) => {
      const r = azar(s);
      // A y B traen cada uno su progreso de antes (migración) y siguen estudiando sin conexión.
      const memA0 = memoria();
      const memB0 = memoria();
      const viejoA = almacenAntiguo(memA0);
      const viejoB = almacenAntiguo(memB0);
      for (let i = 0; i < r.int(30); i += 1) escrituraAlAzar(viejoA, r, reloj);
      for (let i = 0; i < r.int(30); i += 1) escrituraAlAzar(viejoB, r, reloj);
      const srv0 = servidor();
      const A0 = aparato(srv0, memA0);
      const B0 = aparato(srv0, memB0);
      // A se da de alta (código creado en silencio) y B se une con ese código, antes de nada más.
      A0.motor.asegurarCodigo();
      await A0.motor.sincronizar();
      const codigo = A0.progress.registro.codigo;
      assert.equal(validarCodigo(codigo).ok, true);
      assert.equal((await B0.motor.vincular(formatearCodigo(codigo))).ok, true);
      await A0.motor.sincronizar();
      assert.deepEqual(compartido(A0), compartido(B0), `semilla ${s}: unidos`);
      // Ahora, sin conexión, cada uno por su lado.
      for (let i = 0; i < 5 + r.int(40); i += 1) escrituraAlAzar(r() < 0.5 ? A0.progress : B0.progress, r, reloj);
      await B0.motor.sincronizar();
      await A0.motor.sincronizar();
      await B0.motor.sincronizar();
      assert.equal(A0.progress.registro.pendientes(), 0);
      assert.equal(B0.progress.registro.pendientes(), 0);
      assert.deepEqual(compartido(A0), compartido(B0), `semilla ${s}: A y B iguales`);
      // Sin duplicados: cada operación una vez en el registro de cada aparato y en el servidor.
      for (const x of [A0, B0]) {
        const ids = JSON.parse(x.mem.m.get(CLAVE_SYNC)).ops.map((o) => o.i);
        assert.equal(new Set(ids).size, ids.length);
      }
      const filas = srv0.env.DB.sqlite.prepare('SELECT op_id FROM operaciones').all().map((f) => f.op_id);
      assert.equal(new Set(filas).size, filas.length);
      // Idempotencia: reenviarlo todo otra vez no cambia nada.
      const antes = compartido(A0);
      A0.progress.registro.vincular(A0.progress.registro.codigo);
      await A0.motor.sincronizar();
      await B0.motor.sincronizar();
      assert.deepEqual(compartido(A0), antes);
      assert.deepEqual(compartido(B0), antes);
      assert.equal(srv0.env.DB.sqlite.prepare('SELECT COUNT(*) n FROM operaciones').get().n, filas.length);
      // Y un aparato que vuelve a recibir todo desde el principio (cursor 0) queda igual.
      const C = aparato(srv0);
      assert.equal((await C.motor.vincular(codigo)).ok, true);
      assert.deepEqual(compartido(C), antes);
    });
  }
});

test('mismo resultado en los dos órdenes (servidor rehecho desde cero para cada orden)', async () => {
  for (let s = 1; s <= 30; s += 1) {
    await conReloj(T0, async (reloj) => {
      const r = azar(100 + s);
      const memA = memoria();
      const memB = memoria();
      const viejoA = almacenAntiguo(memA);
      const viejoB = almacenAntiguo(memB);
      for (let i = 0; i < r.int(25); i += 1) escrituraAlAzar(viejoA, r, reloj);
      for (let i = 0; i < r.int(25); i += 1) escrituraAlAzar(viejoB, r, reloj);
      // Cada aparato migra y estudia sin conexión; el código lo crea A (aún sin subir nada).
      const pa = createProgressStore(memA);
      const pb = createProgressStore(memB);
      for (let i = 0; i < 5 + r.int(40); i += 1) escrituraAlAzar(r() < 0.5 ? pa : pb, r, reloj);
      const codigo = generarCodigo();
      const fotoA = copia(memA);
      const fotoB = copia(memB);
      const finales = [];
      for (const orden of [['a', 'b', 'a'], ['b', 'a', 'b']]) {
        const srv = servidor();
        const a = aparato(srv, copia(fotoA));
        const b = aparato(srv, copia(fotoB));
        a.progress.registro.ponerCodigoNuevo(codigo);
        // B se une al código de A; si va primero, el alumno aún no existe en el servidor: lo crea A en su primera subida.
        const ap = { a, b };
        for (const k of orden) {
          if (k === 'b' && b.progress.registro.codigo !== codigo) {
            const v = await b.motor.vincular(codigo);
            if (!v.ok) { assert.equal(v.motivo, 'codigo-desconocido'); continue; }
          } else await ap[k].motor.sincronizar();
        }
        // Al final, cada uno sincroniza una vez más (lo que el otro subió después de su última vez).
        await a.motor.sincronizar();
        await b.motor.sincronizar();
        assert.deepEqual(compartido(a), compartido(b), `semilla ${s}, orden ${orden}`);
        // Nada se pierde: todas las preguntas respondidas en A o en B están, con sus veces.
        const ex = a.progress.get().exams;
        for (const q of new Set([...Object.keys(viejoA.get().exams), ...Object.keys(viejoB.get().exams)])) assert.ok(ex[q], q);
        finales.push(compartido(a));
      }
      assert.deepEqual(finales[0], finales[1], `semilla ${s}: el orden de llegada no importa`);
    });
  }
});

test('las veces de una pregunta: suma exacta de lo respondido en cada aparato tras unirse', async () => {
  await conReloj(T0, async (reloj) => {
    const srv = servidor();
    const A = aparato(srv);
    const B = aparato(srv);
    A.progress.recordExam('q1', { choice: 'a', ok: false });
    await A.motor.sincronizar();
    assert.equal((await B.motor.vincular(A.progress.registro.codigo)).ok, true);
    reloj.avanza(864e5);
    A.progress.recordExam('q1', { choice: 'b', ok: true });
    reloj.avanza(1000);
    B.progress.recordExam('q1', { choice: 'b', ok: true });
    B.progress.logActividad(10, reloj.ahora());
    A.progress.logActividad(5, reloj.ahora());
    await B.motor.sincronizar();
    await A.motor.sincronizar();
    await B.motor.sincronizar();
    for (const x of [A, B]) {
      const r = x.progress.get().exams.q1;
      assert.equal(r.n, 3);
      assert.equal(r.ok1, false, 'la primera vez se falló');
      assert.equal(x.progress.minutosHoy(reloj.ahora()), 15, 'minutos de los dos aparatos');
    }
    assert.deepEqual(A.progress.get().exams.q1, B.progress.get().exams.q1);
  });
});

test('sin red: la app sigue igual en local, lo pendiente se queda y sube al volver la red', async () => {
  await conReloj(T0, async () => {
    const srv = servidor();
    let red = false;
    const A = aparato(srv, memoria(), { enLinea: () => red });
    A.progress.recordExam('q1', { choice: 'a', ok: true });
    const e = await A.motor.sincronizar();
    assert.equal(e.estado, 'sin-conexion');
    assert.equal(e.pendientes, 1);
    assert.equal(srv.peticiones, 0, 'ni lo intenta');
    assert.equal(A.progress.get().exams.q1.ok, true);
    red = true;
    const e2 = await A.motor.sincronizar();
    assert.equal(e2.estado, 'al-dia');
    assert.equal(e2.pendientes, 0);
    assert.ok(e2.ultimoExito);
  });
});

test('red intermitente y respuestas perdidas: se reintenta, no se duplica y converge', async () => {
  await conReloj(T0, async (reloj) => {
    const srv = servidor();
    const r = azar(9);
    const A = aparato(srv);
    const B = aparato(srv);
    A.progress.recordExam('q0', { choice: 'a', ok: true });
    await A.motor.sincronizar();
    await B.motor.vincular(A.progress.registro.codigo);
    srv.fallo = () => r.de([null, null, 'red', 'perdida', 'cortada', 'caido']);
    for (let i = 0; i < 60; i += 1) {
      escrituraAlAzar(r() < 0.5 ? A.progress : B.progress, r, reloj);
      if (i % 3 === 0) await (r() < 0.5 ? A : B).motor.sincronizar();
    }
    srv.fallo = null;
    await A.motor.sincronizar();
    await B.motor.sincronizar();
    await A.motor.sincronizar();
    assert.deepEqual(compartido(A), compartido(B));
    const filas = srv.env.DB.sqlite.prepare('SELECT op_id FROM operaciones').all().map((f) => f.op_id);
    assert.equal(new Set(filas).size, filas.length, 'ninguna operación dos veces en el servidor');
    const todas = new Set([...JSON.parse(A.mem.m.get(CLAVE_SYNC)).ops, ...JSON.parse(B.mem.m.get(CLAVE_SYNC)).ops].map((o) => o.i));
    assert.equal(filas.length, todas.size, 'y todas están');
  });
});

test('servidor caído o respuesta rota: estado de error con código y motivo, sin perder nada; espera creciente', async () => {
  await conReloj(T0, async () => {
    const srv = servidor();
    const programados = [];
    const reloj = { ...relojQuieto, setTimeout: (f, ms) => { programados.push(ms); return programados.length; } };
    const mem = memoria();
    const progress = createProgressStore(mem);
    const motor = crearMotor({ registro: progress.registro, storage: mem, fetch: srv.fetch, url: URL0, reloj, enLinea: () => true, azar: () => 0.5, locks: null });
    progress.recordExam('q1', { choice: 'a', ok: true });
    srv.fallo = () => 'caido';
    for (let i = 0; i < 4; i += 1) await motor.sincronizar();
    const e = motor.estado();
    assert.equal(e.estado, 'error');
    assert.equal(e.ultimoError.codigo, 'servidor');
    assert.equal(e.pendientes, 1);
    const esperas = programados.filter((ms) => ms !== 20e3); // las de reintento (no el tope de tiempo de cada petición)
    assert.ok(esperas.length >= 3);
    assert.ok(esperas[1] > esperas[0] && esperas[2] > esperas[1], `crece: ${esperas.join(', ')}`);
    srv.fallo = () => 'cortada';
    await motor.sincronizar();
    assert.equal(motor.estado().ultimoError.codigo, 'respuesta');
    srv.fallo = null;
    const ok = await motor.sincronizar();
    assert.equal(ok.estado, 'al-dia');
    assert.equal(ok.fallos, 0);
    // El diagnóstico no lleva datos del alumno (ni el código, ni preguntas).
    const diag = mem.m.get('nautica.sync.diag.v1');
    assert.ok(!diag.includes(progress.registro.codigo));
    assert.ok(!diag.includes('q1'));
  });
});

test('respuestas troceadas (mas: true) y lotes grandes: todo llega en una sincronización', async () => {
  await conReloj(T0, async (reloj) => {
    Object.assign(LIMITES, { respuestaOps: 7, opsPorLote: 40, porAlumnoMinuto: 1000 });
    try {
      const srv = servidor();
      const A = aparato(srv);
      const B = aparato(srv);
      for (let i = 0; i < 230; i += 1) { reloj.avanza(1000); A.progress.recordExam(`q${i % 50}`, { choice: 'a', ok: i % 2 === 0 }); }
      const e = await A.motor.sincronizar(); // 500 → 413 → lotes cada vez más pequeños, hasta que caben
      assert.equal(e.estado, 'al-dia', JSON.stringify(e.errores));
      assert.equal(e.pendientes, 0);
      assert.equal((await B.motor.vincular(A.progress.registro.codigo)).ok, true);
      assert.deepEqual(compartido(B), compartido(A));
      // Con el límite de peticiones por minuto a medias de traerlo todo: el vínculo vale y sigue solo después.
      LIMITES.porAlumnoMinuto = 3;
      reloj.avanza(61e3);
      const C = aparato(srv);
      const v = await C.motor.vincular(A.progress.registro.codigo);
      assert.deepEqual(v, { ok: true, parcial: true });
      assert.equal(C.progress.registro.codigo, A.progress.registro.codigo);
      assert.equal(C.motor.estado().ultimoError.codigo, 'limite');
    } finally { Object.assign(LIMITES, LIM0); }
  });
});

test('vincular: un código que no existe se dice claro y deja el aparato como estaba', async () => {
  await conReloj(T0, async () => {
    const srv = servidor();
    const A = aparato(srv);
    A.progress.recordExam('q1', { choice: 'a', ok: true });
    await A.motor.sincronizar();
    const antes = A.progress.registro.codigo;
    const v = await A.motor.vincular(generarCodigo());
    assert.equal(v.ok, false);
    assert.equal(v.motivo, 'codigo-desconocido');
    assert.match(v.texto, /no existe/);
    assert.equal(A.progress.registro.codigo, antes);
    assert.equal((await A.motor.vincular('ABC')).motivo, 'largo');
    assert.equal((await A.motor.vincular(antes)).ya, true);
  });
});

test('un aparato nuevo sin nada que subir no crea alumno; al pedir el código (Ajustes) se crea en silencio', async () => {
  await conReloj(T0, async () => {
    const srv = servidor();
    const A = aparato(srv);
    const e = await A.motor.sincronizar();
    assert.equal(e.estado, 'sin-vincular');
    assert.equal(srv.peticiones, 0);
    const c = A.motor.asegurarCodigo();
    assert.equal(validarCodigo(c).ok, true);
    assert.equal((await A.motor.sincronizar()).estado, 'al-dia');
    assert.equal(srv.env.DB.sqlite.prepare('SELECT COUNT(*) n FROM alumnos').get().n, 1);
  });
});

test('dos pestañas del mismo aparato: no se pisan ni duplican operaciones', async () => {
  await conReloj(T0, async () => {
    const mem = new Map();
    const oyentes = [];
    const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => { mem.set(k, v); oyentes.forEach((f) => f({ key: k, newValue: v })); }, removeItem: (k) => mem.delete(k) };
    const prev = globalThis.addEventListener;
    globalThis.addEventListener = (tipo, f) => { if (tipo === 'storage') oyentes.push(f); };
    try {
      const a = createProgressStore(storage);
      const b = createProgressStore(storage);
      for (let i = 0; i < 10; i += 1) { a.recordExam(`q${i}`, { choice: 'a', ok: true }); b.recordExam(`p${i}`, { choice: 'b', ok: false }); }
      const st = JSON.parse(mem.get(CLAVE_SYNC));
      assert.equal(st.ops.length, 20);
      assert.equal(new Set(st.ops.map((o) => o.i)).size, 20);
      assert.equal(st.pend.length, 20);
      assert.equal(Object.keys(a.get().exams).length, 20);
      assert.deepEqual(a.get(), b.get());
    } finally { globalThis.addEventListener = prev; }
  });
});

test('salud: sana con código y sincronización reciente; punto en la cabecera tras 24 h sin lograrlo', () => {
  const ahora = T0;
  assert.equal(estaSana({ codigo: 'X', ultimoExito: ahora - 3600e3 }, ahora), true);
  assert.equal(estaSana({ codigo: 'X', ultimoExito: ahora - 4 * 864e5 }, ahora), false);
  assert.equal(estaSana({ codigo: null, ultimoExito: ahora }, ahora), false);
  assert.equal(avisoCabecera({ codigo: 'X', ultimoExito: ahora - 25 * 3600e3 }, ahora), true);
  assert.equal(avisoCabecera({ codigo: 'X', ultimoExito: ahora - 3600e3 }, ahora), false);
  assert.equal(avisoCabecera({ codigo: null }, ahora), false);
});
