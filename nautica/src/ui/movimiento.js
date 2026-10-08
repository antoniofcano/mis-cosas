// Movimiento que confirma lo que ha pasado (no adorna): transiciones cortas entre tarjetas y pantallas, números que
// suben hasta su valor y pasar tarjeta deslizando el dedo. Sin dependencias: API de View Transitions y Pointer Events.
// Todo respeta «reducir movimiento» del sistema. La vibración y los sonidos (opcionales) están en efectos.js; las
// duraciones y curvas de las animaciones CSS, en las variables --dur-* y --ease-* de styles/app.css.

/** ¿El sistema pide reducir el movimiento? */
export const quieto = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Cambia el contenido con una transición corta. `sentido`: 'adelante' | 'atras' (tarjetas) o 'pantalla' (fundido).
 * Sin soporte o con movimiento reducido, cambia sin más.
 */
export function transicion(cambiar, sentido = 'pantalla') {
  if (typeof document === 'undefined' || !document.startViewTransition || quieto()) { cambiar(); return; }
  const raiz = document.documentElement;
  raiz.dataset.vt = sentido;
  const t = document.startViewTransition(cambiar);
  t.finished.finally(() => { if (raiz.dataset.vt === sentido) delete raiz.dataset.vt; });
}

/** Hace subir el número de `el` desde 0 hasta `hasta` (texto con `formato`). */
export function contar(el, hasta, { ms = 600, formato = (n) => String(n) } = {}) {
  if (quieto() || typeof requestAnimationFrame !== 'function' || !hasta) { el.textContent = formato(hasta); return; }
  const t0 = performance.now();
  const paso = (t) => {
    const f = Math.min(1, (t - t0) / ms);
    el.textContent = formato(Math.round(hasta * (1 - (1 - f) ** 3)));
    if (f < 1) requestAnimationFrame(paso);
  };
  el.textContent = formato(0);
  requestAnimationFrame(paso);
}

/** Deslizar el dedo en horizontal sobre `el`: a la izquierda → `izquierda()`, a la derecha → `derecha()`. */
export function deslizar(el, { izquierda, derecha, umbral = 60 }) {
  let x0 = null;
  let y0 = null;
  el.addEventListener('pointerdown', (ev) => { if (ev.pointerType === 'mouse') return; x0 = ev.clientX; y0 = ev.clientY; });
  el.addEventListener('pointerup', (ev) => {
    if (x0 == null) return;
    const dx = ev.clientX - x0;
    const dy = ev.clientY - y0;
    x0 = null;
    // Solo un gesto claramente horizontal (para no confundirlo con desplazar la página ni con tocar una opción).
    if (Math.abs(dx) < umbral || Math.abs(dy) > Math.abs(dx) * 0.6) return;
    if (ev.target.closest?.('input, label.option, button, a, svg, .lamina-interactiva, details')) return;
    if (dx < 0) izquierda?.(); else derecha?.();
  });
  el.addEventListener('pointercancel', () => { x0 = null; });
}
