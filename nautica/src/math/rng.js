// Motor matemático: generador pseudoaleatorio con semilla (mulberry32).
// Una misma semilla reproduce exactamente el mismo ejercicio (útil para compartir URL o para que una IA lo reproduzca).

export function createRng(seed = Date.now()) {
  let a = (seed >>> 0) || 1;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng = {
    seed,
    next,
    /** Real en [min, max). */
    real: (min, max) => min + (max - min) * next(),
    /** Entero en [min, max]. */
    int: (min, max) => Math.floor(min + (max - min + 1) * next()),
    /** Múltiplo de `step` en [min, max]. */
    step: (min, max, step) => min + step * Math.floor(((max - min) / step + 1) * next()),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    sign: () => (next() < 0.5 ? -1 : 1),
    bool: (p = 0.5) => next() < p,
    shuffle: (arr) => {
      const a2 = [...arr];
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    },
  };
  return rng;
}

export const randomSeed = () => Math.floor(Math.random() * 1e9);
