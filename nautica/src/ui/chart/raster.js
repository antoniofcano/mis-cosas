// Capa raster: la carta escaneada del usuario (IndexedDB) + calibración publicada → <image> georreferenciado.

import { loadUserChart, adaptCalibration } from '../../store/user-chart.js';
import { fitAffine, rasterMatrix } from '../../graphics/georef.js';
import { S } from '../../graphics/chart-renderer.js';

let cache = null;

async function loadCalibration() {
  const r = await fetch(new URL('../../../data/carta-l105-calibracion.json', import.meta.url));
  return r.json();
}

/** @returns {Promise<null | { url, matrix, width, height, name, calibrated: boolean }>} */
export function getRaster() {
  if (!cache) {
    cache = (async () => {
      const rec = await loadUserChart();
      if (!rec) return null;
      const cal = await loadCalibration();
      const cps = adaptCalibration(cal, rec.width, rec.height);
      const url = URL.createObjectURL(rec.blob);
      if (!cps) return { url, width: rec.width, height: rec.height, name: rec.name, calibrated: false };
      return { url, matrix: rasterMatrix(fitAffine(cps), S), width: rec.width, height: rec.height, name: rec.name, calibrated: true };
    })().catch(() => null);
  }
  return cache;
}

/** Olvida la carta cargada (tras subir otra o borrarla). */
export function resetRaster() {
  cache?.then((r) => r && URL.revokeObjectURL(r.url));
  cache = null;
}
