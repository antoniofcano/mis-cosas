// Protección de los datos del alumno (src/store/persistencia.js): petición al navegador, estado en palabras y recordatorio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  pedirPersistencia, estadoProteccion, estaInstalada, esIOS, soportaPersistencia, diasParaAviso, REINTENTO_DIAS, AVISO_DIAS,
} from '../src/store/persistencia.js';

const DIA = 864e5;
const navConPersist = (resp = true, ya = false) => ({ storage: { persisted: async () => ya, persist: async () => resp } });
const ajustes = (inicial = {}) => { const a = { ...inicial }; return { a, leer: () => a, guardar: (k, v) => { a[k] = v; } }; };

test('pide persistencia y guarda el resultado y cuándo', async () => {
  const s = ajustes();
  assert.equal(await pedirPersistencia({ nav: navConPersist(true), ...s, ahora: 1000 }), true);
  assert.equal(s.a.persistente, true);
  assert.equal(s.a.persistenteIntento, 1000);
});

test('si el navegador ya lo protege, no vuelve a pedir y lo anota', async () => {
  const s = ajustes();
  let pidio = false;
  const nav = { storage: { persisted: async () => true, persist: async () => { pidio = true; return true; } } };
  assert.equal(await pedirPersistencia({ nav, ...s }), true);
  assert.equal(pidio, false);
  assert.equal(s.a.persistente, true);
});

test('si dijo que no, no insiste hasta pasados REINTENTO_DIAS', async () => {
  const s = ajustes({ persistente: false, persistenteIntento: 0 });
  let veces = 0;
  const nav = { storage: { persisted: async () => false, persist: async () => { veces += 1; return false; } } };
  assert.equal(await pedirPersistencia({ nav, ...s, ahora: 1 * DIA }), false);
  assert.equal(veces, 0);
  assert.equal(await pedirPersistencia({ nav, ...s, ahora: (REINTENTO_DIAS + 1) * DIA }), false);
  assert.equal(veces, 1);
});

test('sin soporte o con error no falla ni escribe', async () => {
  const s = ajustes();
  assert.equal(await pedirPersistencia({ nav: {}, ...s }), null);
  assert.equal(await pedirPersistencia({ nav: { storage: { persist: async () => { throw new Error('no'); } } }, ...s }), null);
  assert.deepEqual(s.a, {});
  assert.equal(soportaPersistencia({}), false);
});

test('estado en palabras: protegido, sin proteger y no disponible; consejo de iPhone', () => {
  const iphone = { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', storage: { persist: () => {} }, standalone: false };
  const instalado = { ...iphone, standalone: true };
  assert.equal(estadoProteccion({ persistente: true }, iphone).estado, 'protegido');
  const sin = estadoProteccion({ persistente: false }, iphone, {});
  assert.equal(sin.estado, 'sin-proteger');
  assert.match(sin.consejo, /pantalla de inicio/);
  assert.doesNotMatch(estadoProteccion({ persistente: false }, instalado, {}).consejo, /Compartir/);
  assert.equal(estadoProteccion({}, { userAgent: '' }, {}).estado, 'no-disponible');
  assert.equal(esIOS(iphone), true);
  assert.equal(estaInstalada(instalado, {}), true);
  assert.equal(estaInstalada({ standalone: false }, { matchMedia: () => ({ matches: true }) }), true);
});

test('el recordatorio de copia llega antes si los datos no están protegidos', () => {
  assert.equal(diasParaAviso({ persistente: true }), AVISO_DIAS.protegido);
  assert.equal(diasParaAviso({}), AVISO_DIAS.sinProteger);
  assert.ok(AVISO_DIAS.sinProteger < AVISO_DIAS.protegido);
});
