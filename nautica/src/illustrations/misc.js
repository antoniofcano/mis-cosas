// Ilustraciones: meteorología y banderas (borrasca, anticiclón, partes del barco y hélice: laminas-c.js).
import { borrascaAnticiclon } from './laminas-c.js';
import { buysBallot, brisa, frenteCorte } from './meteo-c.js';

const arrowDefs = (id, color) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="${color}"/></marker></defs>`;

// ---------------------------------------------------------------------------
// Meteorología
// spec: { tipo:'meteo', sistema:'borrasca'|'anticiclon'|'buys-ballot'|'brisa-mar'|'brisa-tierra'|'frentes' }

export function meteoIllustration(spec) {
  const sys = spec.sistema;
  // borrasca y anticiclón: en estilo C, en src/illustrations/laminas-c.js
  if (sys === 'borrasca' || sys === 'anticiclon') return borrascaAnticiclon(sys === 'borrasca');
  // Buys-Ballot, brisas y frentes en corte: en estilo C, en src/illustrations/meteo-c.js
  if (sys === 'buys-ballot') return buysBallot();
  if (sys === 'brisa-mar' || sys === 'brisa-tierra') return brisa(sys === 'brisa-mar');
  if (sys === 'frente-frio-corte' || sys === 'frente-calido-corte') return frenteCorte(sys === 'frente-frio-corte');
  // frentes, isobaras y nieblas: interactivas (src/illustrations/interactivas/)
  return null;
}

// Partes del barco y efecto de la hélice: en estilo C, en src/illustrations/laminas-c.js.

// Rosa (rumbo, demora y marcación): ahora es interactiva, en src/illustrations/interactivas/rosa.js.

// ---------------------------------------------------------------------------
// Banderas
// spec: { tipo:'bandera', codigo:'A'|'buceo'|'O'|'N'|'C'|'B'|'H'|'U'|'V'|'W' }

export const FLAGS = {
  A: { nombre: 'Bandera «A» (Alfa)', nota: 'Tengo un buzo sumergido: manténgase alejado y a poca velocidad.' },
  buceo: { nombre: 'Bandera de buceo (roja con diagonal blanca)', nota: 'Señala buceadores en inmersión (uso deportivo y recreativo).' },
  O: { nombre: 'Bandera «O» (Oscar)', nota: '¡Hombre al agua!' },
  N: { nombre: 'Bandera «N» (November)', nota: 'No (negativo). Sobre la «C» (N encima, C debajo): señal de peligro NC.' },
  C: { nombre: 'Bandera «C» (Charlie)', nota: 'Sí (afirmativo). NC = socorro.' },
  B: { nombre: 'Bandera «B» (Bravo)', nota: 'Estoy cargando, descargando o transportando mercancías peligrosas.' },
  H: { nombre: 'Bandera «H» (Hotel)', nota: 'Tengo práctico a bordo.' },
  U: { nombre: 'Bandera «U» (Uniform)', nota: 'Se dirige usted hacia un peligro.' },
  V: { nombre: 'Bandera «V» (Victor)', nota: 'Necesito asistencia.' },
  W: { nombre: 'Bandera «W» (Whiskey)', nota: 'Necesito asistencia médica.' },
};

// La lámina `bandera` está en estilo C, en src/illustrations/senales-c.js (FLAGS da el nombre y el significado).
