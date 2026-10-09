// Renderizadores de las láminas del PER rehechas en estilo C (docs/ESTILO-LAMINAS.md). index.js los pone por encima de
// los antiguos: mismas specs y mismos tipos, solo cambia el dibujo.
import { ritmoIllustration, regionesIllustration, amarrasIllustration, riesgoIllustration, jerarquiaIllustration, dstIllustration } from './per-c.js';
import { buqueIllustration } from './buques-c.js';
import { dibujoAnimado } from './animaciones/index.js';

export const RENDERERS_PER = {
  ritmo: ritmoIllustration,
  buque: buqueIllustration,
  regiones: regionesIllustration,
  amarras: amarrasIllustration,
  riesgo: riesgoIllustration,
  jerarquia: jerarquiaIllustration,
  dst: dstIllustration,
  ciaboga: dibujoAnimado,
};
