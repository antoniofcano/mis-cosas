// Todas las soluciones programadas (PER y PY) y el banco donde se ve cada una resuelta.
import per from './andalucia-per.js';
import py from './andalucia-py.js';

export const SOLUCIONES = { ...per, ...py };

/** Banco de exámenes donde abrir la resolución de una pregunta (o null si no tiene). */
export function bancoResolucion(q) {
  if (per[q.id] || (q.ut === 11 && !py[q.id] && /^and-\d/.test(q.id))) return 'andalucia-per.json';
  if (py[q.id]) return 'andalucia-py-teoria.json';
  return null;
}
