// Instalar la app (src/ui/instalar.js): qué se ofrece según el aparato, cuándo toca la tarjeta de Hoy y el manifiesto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { modoInstalacion, tocaOfrecer, DIAS_ANTES_DE_OFRECER, SILENCIO_DIAS } from '../src/ui/instalar.js';

const IPHONE = { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', standalone: false };
const ANDROID = { userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/120' };
const ESCRITORIO = { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120' };

test('modo de instalación según el aparato', () => {
  assert.equal(modoInstalacion({ nav: { ...IPHONE, standalone: true }, win: {}, hayEvento: false }), 'instalada');
  assert.equal(modoInstalacion({ nav: IPHONE, win: {}, hayEvento: false }), 'ios');
  assert.equal(modoInstalacion({ nav: ANDROID, win: {}, hayEvento: true }), 'boton');
  assert.equal(modoInstalacion({ nav: ANDROID, win: {}, hayEvento: false }), 'menu');
  assert.equal(modoInstalacion({ nav: ESCRITORIO, win: {}, hayEvento: false }), 'no');
  assert.equal(modoInstalacion({ nav: ESCRITORIO, win: { matchMedia: () => ({ matches: true }) }, hayEvento: false }), 'instalada');
});

test('la tarjeta de Hoy espera unos días de uso, respeta «Ahora no» y no sale si ya está instalada', () => {
  const base = { modo: 'ios', diasConActividad: DIAS_ANTES_DE_OFRECER, silenciadaHasta: 0, ahora: 1000 };
  assert.equal(tocaOfrecer(base), true);
  assert.equal(tocaOfrecer({ ...base, diasConActividad: DIAS_ANTES_DE_OFRECER - 1 }), false);
  assert.equal(tocaOfrecer({ ...base, silenciadaHasta: 5000 }), false);
  assert.equal(tocaOfrecer({ ...base, modo: 'instalada' }), false);
  assert.equal(tocaOfrecer({ ...base, modo: 'no' }), false);
  assert.ok(SILENCIO_DIAS >= 7);
});

test('el manifiesto es válido: instalable, con accesos directos que apuntan a rutas y sin «Andalucía» como único ámbito', () => {
  const m = JSON.parse(readFileSync(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(m.display, 'standalone');
  assert.ok(m.icons.some((i) => i.purpose === 'maskable'));
  assert.ok(m.shortcuts.length >= 3 && m.shortcuts.length <= 4);
  for (const s of m.shortcuts) assert.match(s.url, /^\.\/#\/(per|py)/);
  assert.doesNotMatch(m.description, /\(Andaluc/);
});
