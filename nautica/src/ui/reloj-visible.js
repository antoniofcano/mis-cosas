// Reloj de una pregunta o un ejercicio de práctica (R-42): solo cuenta con la pestaña visible, como el reloj del examen
// (src/ui/views/theory.js, testView). La lógica, sin DOM, en src/course/velocidad.js (acumulador); aquí, los avisos del
// navegador (visibilitychange y pagehide) y quitarlos al terminar o si la vista ya no está.

import { acumulador } from '../course/velocidad.js';

/**
 * @param {{ vivo?: () => boolean }} [o]  vivo: la vista sigue en pantalla (si no, el reloj se para solo)
 * @returns {{ segundos: () => number, parar: () => number, pausar: () => void, reanudar: () => void, enPausa: () => boolean }}
 *   parar devuelve los segundos contados
 */
export function relojVisible({ vivo = () => true } = {}) {
  const hayDoc = typeof document !== 'undefined';
  let enPausa = false;
  const acc = acumulador({ visible: () => !enPausa && (!hayDoc || document.visibilityState === 'visible') });
  let parado = false;
  let final = 0;
  const onVis = () => { if (!vivo()) parar(); else acc.marca(); };
  if (hayDoc) {
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', onVis);
  }
  function parar() {
    if (parado) return final;
    parado = true;
    final = acc.ms() / 1000;
    if (hayDoc) {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', onVis);
    }
    return final;
  }
  // Pausa manual (R-64): no cuenta mientras dura, igual que con la pestaña oculta.
  const pausa = (v) => { if (parado || enPausa === v) return; acc.marca(); enPausa = v; acc.marca(); };
  return { segundos: () => (parado ? final : acc.ms() / 1000), parar, pausar: () => pausa(true), reanudar: () => pausa(false), enPausa: () => enPausa };
}
