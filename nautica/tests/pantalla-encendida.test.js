// Pantalla encendida mientras se estudia (src/ui/pantalla-encendida.js): con el navegador simulado (wakeLock, documento
// y reloj de mentira). Pide, renueva al volver a la app, suelta al salir, no revienta sin la API, calla si la niegan y
// se suelta tras un rato sin tocar nada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearPantallaEncendida, quierePantallaEncendida, INACTIVIDAD_MS, EVENTOS_ACTIVIDAD } from '../src/ui/pantalla-encendida.js';

const espera = () => new Promise((r) => setTimeout(r, 0));

/** Documento de mentira: visibilidad y oyentes. */
function docFalso() {
  const oy = new Map();
  return {
    visibilityState: 'visible',
    addEventListener: (t, f) => { if (!oy.has(t)) oy.set(t, new Set()); oy.get(t).add(f); },
    removeEventListener: (t, f) => oy.get(t)?.delete(f),
    emitir(t) { for (const f of oy.get(t) ?? []) f({ type: t }); },
    oyentes: (t) => oy.get(t)?.size ?? 0,
  };
}

/** wakeLock de mentira: cuenta peticiones y sueltas; `negar` hace que la petición falle. */
function wakeLockFalso({ negar = false } = {}) {
  const w = { pedidas: 0, sueltas: 0, vivos: new Set(), negar };
  w.request = async (tipo) => {
    assert.equal(tipo, 'screen');
    w.pedidas += 1;
    if (w.negar) { const e = new Error('Batería baja'); e.name = 'NotAllowedError'; throw e; }
    const oy = new Set();
    const c = { released: false, addEventListener: (t, f) => { if (t === 'release') oy.add(f); },
      async release() { if (c.released) return; c.released = true; w.vivos.delete(c); w.sueltas += 1; oy.forEach((f) => f()); } };
    w.vivos.add(c);
    return c;
  };
  // El navegador suelta sola la pantalla al ocultarse.
  w.soltarTodo = () => { for (const c of [...w.vivos]) c.release(); };
  return w;
}

/** Reloj de mentira: setTimeout que solo avanza con avanzar(ms). */
function relojFalso() {
  let ahora = 0; let id = 0;
  const pend = new Map();
  return {
    setTimeout: (f, ms) => { id += 1; pend.set(id, { f, en: ahora + ms }); return id; },
    clearTimeout: (t) => pend.delete(t),
    avanzar(ms) { ahora += ms; for (const [k, p] of [...pend]) if (p.en <= ahora) { pend.delete(k); p.f(); } },
    pendientes: () => pend.size,
  };
}

function montar({ negar = false, sinApi = false } = {}) {
  const doc = docFalso();
  const wl = wakeLockFalso({ negar });
  const reloj = relojFalso();
  const estado = { quiere: false };
  const nav = sinApi ? {} : { wakeLock: wl };
  const p = crearPantallaEncendida({ nav, doc, reloj, quiere: () => estado.quiere });
  return { doc, wl, reloj, estado, p };
}

test('qué pantallas la piden: paso de la sesión, clase abierta y examen a medias', () => {
  assert.equal(quierePantallaEncendida(['per', 'teoria', 'repaso'], { enSesion: true }), true);
  assert.equal(quierePantallaEncendida(['per', 'curso', 'per-1-1']), true);
  assert.equal(quierePantallaEncendida(['per', 'curso']), false, 'sin clase no hay clase abierta');
  assert.equal(quierePantallaEncendida(['per', 'test', 'simulacro'], { examenAMedias: true }), true);
  assert.equal(quierePantallaEncendida(['per', 'test', 'simulacro'], { examenAMedias: false }), false, 'la portada del examen aún no');
  assert.equal(quierePantallaEncendida(['per', 'sesion']), false, 'el resumen final ya no');
  assert.equal(quierePantallaEncendida(['per']), false, 'Hoy no');
  assert.equal(quierePantallaEncendida(['per', 'travesia']), false);
  assert.equal(quierePantallaEncendida([]), false);
  assert.equal(INACTIVIDAD_MS, 10 * 60 * 1000);
});

test('pide al entrar en la pantalla y suelta al salir', async () => {
  const { wl, estado, p } = montar();
  assert.equal(p.disponible, true);
  p.revisar(); await espera();
  assert.equal(wl.pedidas, 0, 'fuera de la sesión no pide nada');
  estado.quiere = true; p.revisar(); await espera();
  assert.equal(wl.pedidas, 1); assert.equal(p.activa(), true);
  p.revisar(); await espera();
  assert.equal(wl.pedidas, 1, 'no pide dos veces');
  estado.quiere = false; p.revisar(); await espera();
  assert.equal(p.activa(), false); assert.equal(wl.sueltas, 1);
});

test('al volver a la app la pide otra vez (el navegador la suelta al ocultarse)', async () => {
  const { doc, wl, estado, p } = montar();
  estado.quiere = true; p.revisar(); await espera();
  doc.visibilityState = 'hidden'; wl.soltarTodo(); doc.emitir('visibilitychange'); await espera();
  assert.equal(p.activa(), false);
  doc.visibilityState = 'visible'; doc.emitir('visibilitychange'); await espera();
  assert.equal(wl.pedidas, 2); assert.equal(p.activa(), true);
});

test('al volver a la app fuera de la sesión no pide nada', async () => {
  const { doc, wl, p } = montar();
  doc.visibilityState = 'hidden'; doc.emitir('visibilitychange');
  doc.visibilityState = 'visible'; doc.emitir('visibilitychange'); await espera();
  assert.equal(wl.pedidas, 0);
});

test('sin la API no pasa nada (ni error)', async () => {
  const { doc, estado, p } = montar({ sinApi: true });
  assert.equal(p.disponible, false);
  estado.quiere = true;
  assert.doesNotThrow(() => { p.revisar(); p.actividad(); doc.emitir('visibilitychange'); doc.emitir('pointerdown'); p.parar(); });
  assert.equal(p.activa(), false);
  assert.equal(doc.oyentes('visibilitychange') + doc.oyentes('pointerdown'), 0, 'ni siquiera escucha');
  // Ni navegador ni documento: tampoco.
  const q = crearPantallaEncendida({ nav: undefined, doc: undefined, quiere: () => true });
  assert.doesNotThrow(() => { q.revisar(); q.actividad(); q.parar(); });
});

test('si el navegador la niega (ahorro de batería), en silencio; lo intenta otra vez al tocar', async () => {
  const { wl, estado, p } = montar({ negar: true });
  estado.quiere = true;
  p.revisar(); await espera();
  assert.equal(wl.pedidas, 1); assert.equal(p.activa(), false);
  wl.negar = false; p.actividad(); await espera();
  assert.equal(p.activa(), true);
  // Una petición que lanza de forma síncrona tampoco revienta.
  const q = crearPantallaEncendida({ nav: { wakeLock: { request() { throw new TypeError('no'); } } }, doc: docFalso(), quiere: () => true, reloj: relojFalso() });
  assert.doesNotThrow(() => q.revisar());
});

test('tras 10 minutos sin tocar nada se suelta; el siguiente toque la vuelve a pedir', async () => {
  const { doc, wl, reloj, estado, p } = montar();
  estado.quiere = true; p.revisar(); await espera();
  reloj.avanzar(INACTIVIDAD_MS - 1000); await espera();
  assert.equal(p.activa(), true, 'aún no');
  doc.emitir('pointerdown'); await espera(); // tocar reinicia el plazo
  reloj.avanzar(INACTIVIDAD_MS - 1000); await espera();
  assert.equal(p.activa(), true, 'el toque reinició el plazo');
  reloj.avanzar(2000); await espera();
  assert.equal(p.activa(), false, 'diez minutos sin tocar: suelta');
  p.revisar(); await espera();
  assert.equal(p.activa(), false, 'pintar otra pantalla de estudio sin tocar no la despierta');
  doc.emitir('keydown'); await espera();
  assert.equal(p.activa(), true, 'un toque la vuelve a pedir');
  assert.equal(wl.pedidas, 2);
});

test('fuera de la sesión no hay temporizador; al salir se cancela', async () => {
  const { doc, reloj, estado, p } = montar();
  doc.emitir('pointerdown');
  assert.equal(reloj.pendientes(), 0);
  estado.quiere = true; p.revisar(); await espera();
  assert.equal(reloj.pendientes(), 1);
  estado.quiere = false; p.revisar();
  assert.equal(reloj.pendientes(), 0);
});

test('si se sale mientras la petición está en vuelo, se suelta al llegar', async () => {
  const { wl, estado, p } = montar();
  estado.quiere = true; p.revisar();
  estado.quiere = false; p.revisar();
  await espera(); await espera();
  assert.equal(p.activa(), false); assert.equal(wl.sueltas, 1);
});

test('parar() suelta y deja de escuchar', async () => {
  const { doc, estado, p } = montar();
  estado.quiere = true; p.revisar(); await espera();
  assert.ok(EVENTOS_ACTIVIDAD.every((t) => doc.oyentes(t) === 1));
  p.parar(); await espera();
  assert.equal(p.activa(), false);
  assert.equal(doc.oyentes('visibilitychange'), 0);
  assert.ok(EVENTOS_ACTIVIDAD.every((t) => doc.oyentes(t) === 0));
});
