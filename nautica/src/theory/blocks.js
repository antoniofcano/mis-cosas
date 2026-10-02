// Motor de tests: estructura oficial del examen teórico del PER (RD 875/2014, anexo) y sus reglas.
// Para añadir otra titulación (PY, PNB…), define su estructura con el mismo formato.

export const PER = {
  id: 'PER',
  titulo: 'Patrón de Embarcaciones de Recreo',
  duracionMin: 90,
  minAciertos: 32,
  // ut: unidad teórica · n: preguntas en el examen · maxErrores: límite propio del bloque (si lo tiene)
  bloques: [
    { ut: 1, titulo: 'Nomenclatura náutica', n: 4, icon: '⚓' },
    { ut: 2, titulo: 'Amarre y fondeo', n: 2, icon: '🪝' },
    { ut: 3, titulo: 'Seguridad', n: 4, icon: '🦺' },
    { ut: 4, titulo: 'Legislación', n: 2, icon: '📜' },
    { ut: 5, titulo: 'Balizamiento', n: 5, maxErrores: 2, icon: '🚩' },
    { ut: 6, titulo: 'Reglamento (RIPA)', n: 10, maxErrores: 5, icon: '🚢' },
    { ut: 7, titulo: 'Maniobra y navegación', n: 2, icon: '⛵' },
    { ut: 8, titulo: 'Emergencias en la mar', n: 3, icon: '🆘' },
    { ut: 9, titulo: 'Meteorología', n: 4, icon: '🌦️' },
    { ut: 10, titulo: 'Teoría de navegación', n: 5, icon: '🧭' },
    { ut: 11, titulo: 'Carta de navegación', n: 4, maxErrores: 2, icon: '🗺️' },
  ],
};

export const totalPreguntas = (estructura) => estructura.bloques.reduce((s, b) => s + b.n, 0);
export const bloque = (estructura, ut) => estructura.bloques.find((b) => b.ut === ut);
