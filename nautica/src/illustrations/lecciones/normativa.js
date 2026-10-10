// Láminas de normativa y preparación de la salida: revisión antes de zarpar y previsión meteorológica (per-final-b-c.js);
// puerto comercial, seguro obligatorio, contaminación (responsables y aviso) y deber de auxilio
// (per-cola-normativa-b-c.js). Todas en estilo C. Funciones puras spec → { svg, caption }.

import { puertoComercialC, seguroRcC, contaminacionC, deberAuxilioC, PARTES_PUERTO, RESPONSABLES } from '../per-cola-normativa-b-c.js';
import { revisionSalidaC, previsionSalidaC, PARTES_REVISION, PARTES_PREVISION } from '../per-final-b-c.js';

export const LAMINAS = {
  'revision-salida': {
    fn: revisionSalidaC,
    params: { vista: ['resumen', 'motor'], resaltar: PARTES_REVISION },
    ejemplo: { tipo: 'revision-salida', vista: 'resumen' },
  },
  'puerto-comercial': { fn: puertoComercialC, params: { resaltar: PARTES_PUERTO }, ejemplo: { tipo: 'puerto-comercial' } },
  'seguro-rc': { fn: seguroRcC, params: {}, ejemplo: { tipo: 'seguro-rc' } },
  contaminacion: { fn: contaminacionC, params: { vista: ['responsables', 'aviso'], resaltar: RESPONSABLES }, ejemplo: { tipo: 'contaminacion', vista: 'responsables' } },
  'deber-auxilio': { fn: deberAuxilioC, params: { resaltar: ['acudir', 'no-acudir'] }, ejemplo: { tipo: 'deber-auxilio' } },
  'prevision-salida': { fn: previsionSalidaC, params: { vista: ['fuentes', 'decidir'], resaltar: PARTES_PREVISION }, ejemplo: { tipo: 'prevision-salida', vista: 'fuentes' } },
};
