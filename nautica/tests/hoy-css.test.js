// Hoy en el móvil: nada se sale por la derecha (la píldora del examen envuelve en vez de desbordar, los nombres de las
// fases caben en su botón) y los colores de la sesión existen en claro y en oscuro. Lo comprueba también, en el
// navegador, la revisión con Playwright (desborde horizontal y contraste de la barra inferior).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8');
const regla = (sel) => {
  const i = css.indexOf(`\n${sel} {`);
  assert.ok(i >= 0, `falta la regla ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('la cabecera de Hoy envuelve y la píldora del examen no desborda', () => {
  assert.match(regla('.hoy .hoy-cab'), /flex-wrap:\s*wrap/);
  const p = regla('.pildora-examen');
  assert.match(p, /max-width:\s*100%/);
  assert.doesNotMatch(p, /white-space:\s*nowrap/);
});

test('los nombres de las fases se encogen con la pantalla', () => {
  assert.match(regla('button.fase .fase-nombre'), /font-size:\s*min\(/);
  assert.match(regla('.fases'), /minmax\(0, 1fr\)/);
});

test('los colores de la sesión están en el tema claro y en el oscuro', () => {
  const oscuro = css.slice(css.indexOf('@media (prefers-color-scheme: dark)'));
  for (const t of ['--sesion-bg', '--sesion-fg', '--sesion-boton', '--sesion-boton-fg', '--on-accent']) {
    assert.match(css.slice(0, css.indexOf('@media (prefers-color-scheme: dark)')), new RegExp(`${t}:`), `${t} en claro`);
    assert.match(oscuro.slice(0, oscuro.indexOf('\n}\n')), new RegExp(`${t}:`), `${t} en oscuro`);
  }
});

test('un aviso breve no tapa los botones', () => {
  assert.match(regla('.aviso-breve'), /pointer-events:\s*none/);
});
