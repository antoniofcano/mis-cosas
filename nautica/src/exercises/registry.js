// Registro de tipos de ejercicio. Para añadir uno nuevo: crea ./types/mi-ejercicio.js y añádelo aquí.

import { CATEGORIES } from './define.js';
import conversionRumbos from './types/conversion-rumbos.js';
import ctEnfilacion from './types/ct-enfilacion.js';
import estimaDirecta from './types/estima-directa.js';
import rumboDistancia from './types/rumbo-distancia.js';
import situacionDosDemoras from './types/situacion-dos-demoras.js';
import situacionDemoraDistancia from './types/situacion-demora-distancia.js';
import demorasNoSimultaneas from './types/demoras-no-simultaneas.js';
import corrienteEfectiva from './types/corriente-efectiva.js';
import corrienteRumboADar from './types/corriente-rumbo-a-dar.js';
import corrienteDesconocida from './types/corriente-desconocida.js';
import abatimiento from './types/abatimiento.js';
import rumboPasarDistancia from './types/rumbo-pasar-distancia.js';
import distanciaFaro from './types/distancia-faro.js';
import estimaAnalitica from './types/estima-analitica.js';
import mareaSonda from './types/marea-sonda.js';
import hora from './types/hora.js';
import vientoAparente from './types/viento-aparente.js';

export const EXERCISES = [
  conversionRumbos,
  ctEnfilacion,
  estimaDirecta,
  rumboDistancia,
  rumboPasarDistancia,
  situacionDemoraDistancia,
  situacionDosDemoras,
  distanciaFaro,
  demorasNoSimultaneas,
  corrienteEfectiva,
  corrienteRumboADar,
  corrienteDesconocida,
  abatimiento,
  estimaAnalitica,
  mareaSonda,
  vientoAparente,
  hora,
];

const byId = new Map(EXERCISES.map((e) => [e.id, e]));

export const getExercise = (id) => byId.get(id);

export function exercisesByCategory(level) {
  return CATEGORIES.map((c) => ({
    ...c,
    exercises: EXERCISES.filter((e) => e.category === c.id && (!level || e.levels.includes(level))),
  })).filter((c) => c.exercises.length);
}

export { CATEGORIES };
