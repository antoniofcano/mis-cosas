// Láminas de sanidad a bordo: hemorragias (tipos, cómo pararlas y el torniquete), quemaduras (grados, cómo enfriarlas
// y su gravedad), golpe de calor, contacto con el Centro Radio-Médico Español y botiquín según zona. Todas en estilo C,
// en src/illustrations/sanidad-c.js (fuente: Guía Sanitaria a Bordo del ISM y RD 339/2021). Cada función es pura:
// spec → { svg, caption }.

import { hemorragiaC, quemaduraC, golpeCalorC, radioMedicoC, botiquinC, PARTES_HEMO_TIPOS, PARTES_HEMO_PARAR, PARTES_TORNIQUETE, PARTES_GRADOS, PARTES_ENFRIAR, PARTES_GRAVEDAD, PARTES_CALOR, PARTES_RADIO, PARTES_BOTIQUIN } from '../sanidad-c.js';

export const LAMINAS = {
  hemorragia: {
    fn: hemorragiaC,
    params: { vista: ['tipos', 'parar', 'torniquete'], resaltar: `tipos: ${PARTES_HEMO_TIPOS.join(' | ')}; parar: ${PARTES_HEMO_PARAR.join(' | ')}; torniquete: ${PARTES_TORNIQUETE.join(' | ')} (una o lista)` },
    ejemplo: { tipo: 'hemorragia', vista: 'tipos' },
  },
  quemadura: {
    fn: quemaduraC,
    params: { vista: ['grados', 'enfriar', 'gravedad'], resaltar: `grados: ${PARTES_GRADOS.join(' | ')}; enfriar: ${PARTES_ENFRIAR.join(' | ')}; gravedad: ${PARTES_GRAVEDAD.join(' | ')} (una o lista)` },
    ejemplo: { tipo: 'quemadura', vista: 'grados' },
  },
  'golpe-calor': {
    fn: golpeCalorC,
    params: { resaltar: PARTES_CALOR },
    ejemplo: { tipo: 'golpe-calor' },
  },
  'radio-medico': {
    fn: radioMedicoC,
    params: { resaltar: PARTES_RADIO },
    ejemplo: { tipo: 'radio-medico' },
  },
  botiquin: {
    fn: botiquinC,
    params: { resaltar: PARTES_BOTIQUIN },
    ejemplo: { tipo: 'botiquin' },
  },
};
