// Mapas de conceptos: cada nodo es un concepto con su lámina y su clase; las aristas dicen cómo se relacionan
// («se calcula con», «+ Ct»…) y las de tipo «confunde» avisan de las trampas del examen. Funciones puras.
// Los mapas están en data/mapas/<id>.json; MAPAS dice cuáles hay.

export const MAPAS = [
  // PER
  'rumbos', 'lineas-posicion', 'mareas', 'balizamiento', 'ripa-maniobras', 'ripa-luces', 'fuego',
  // PY
  'estabilidad', 'meteo', 'nieblas', 'mareas-py', 'electronica', 'corriente-abatimiento',
];

const porId = (mapa) => new Map(mapa.nodos.map((n) => [n.id, n]));
const relaciones = (mapa) => mapa.aristas.filter((a) => a.tipo !== 'confunde');

/** Lo que rodea a un nodo: de dónde viene, adónde lleva y con qué se confunde. */
export function vecinos(mapa, id) {
  const n = porId(mapa);
  const salen = []; const entran = []; const confunde = [];
  for (const a of mapa.aristas) {
    if (a.tipo === 'confunde') {
      if (a.de === id) confunde.push({ arista: a, nodo: n.get(a.a) });
      else if (a.a === id) confunde.push({ arista: a, nodo: n.get(a.de) });
    } else if (a.de === id) salen.push({ arista: a, nodo: n.get(a.a) });
    else if (a.a === id) entran.push({ arista: a, nodo: n.get(a.de) });
  }
  return { salen, entran, confunde };
}

/**
 * Preguntas para repasar un mapa (sin repetir arista), mezclando dos tipos:
 *   - 'relacion': «Rv → ? → Rs»: qué relación une dos conceptos (4 opciones: la buena y otras del mapa).
 *   - 'falta':    «Rv → + Ab (el viento) → ?»: qué concepto falta (4 opciones: nodos del mapa).
 * @returns {{ tipo, de, a, rel, enunciado, opciones: string[], correcta: number }[]}
 */
export function preguntasMapa(mapa, rng, n = 8) {
  const nodos = porId(mapa);
  const rels = relaciones(mapa);
  const etiquetas = [...new Set(rels.map((a) => a.rel))];
  return rng.shuffle([...rels]).slice(0, n).map((a, i) => {
    const de = nodos.get(a.de); const hacia = nodos.get(a.a);
    if (i % 2 === 0 && etiquetas.length >= 4) {
      const otras = rng.shuffle(etiquetas.filter((e) => e !== a.rel)).slice(0, 3);
      const opciones = rng.shuffle([a.rel, ...otras]);
      return { tipo: 'relacion', de: a.de, a: a.a, rel: a.rel, enunciado: `¿Qué une «${de.nombre}» con «${hacia.nombre}»?`, opciones, correcta: opciones.indexOf(a.rel) };
    }
    // Distractores: nodos que no son el bueno ni el de partida (y que no salen ya de él con otra relación).
    const otros = rng.shuffle(mapa.nodos.filter((x) => x.id !== a.a && x.id !== a.de)).slice(0, 3).map((x) => x.nombre);
    const opciones = rng.shuffle([hacia.nombre, ...otros]);
    return { tipo: 'falta', de: a.de, a: a.a, rel: a.rel, enunciado: `«${de.nombre}» → ${a.rel} → ¿?`, opciones, correcta: opciones.indexOf(hacia.nombre) };
  });
}

/** Errores de un mapa (para el test): nodos repetidos, aristas a nodos que no existen, nodos sueltos, sin lámina… */
export function erroresMapa(mapa, { renderIllustration, clases = null } = {}) {
  const out = [];
  const ids = new Set();
  for (const n of mapa.nodos) {
    if (ids.has(n.id)) out.push(`nodo repetido ${n.id}`);
    ids.add(n.id);
    if (!n.nombre || !n.corto) out.push(`${n.id}: sin nombre o sin texto`);
    if (renderIllustration && !renderIllustration(n.spec)) out.push(`${n.id}: lámina que no se dibuja ${JSON.stringify(n.spec)}`);
    if (clases && !clases.has(n.clase)) out.push(`${n.id}: clase inexistente ${n.clase}`);
    if (typeof n.x !== 'number' || typeof n.y !== 'number') out.push(`${n.id}: sin posición en el mapa entero`);
  }
  for (const a of mapa.aristas) {
    if (!ids.has(a.de) || !ids.has(a.a)) out.push(`arista ${a.de}→${a.a}: nodo inexistente`);
    if (!a.rel) out.push(`arista ${a.de}→${a.a}: sin relación`);
  }
  for (const n of mapa.nodos) if (!mapa.aristas.some((a) => a.tipo !== 'confunde' && (a.de === n.id || a.a === n.id))) out.push(`${n.id}: nodo suelto`);
  return out;
}

/** Los nodos de una clase en los mapas de una titulación: [{ mapa, nodo }]. Solo cuentan los nodos cuya clase es de esa titulación. */
export function nodosDeClase(mapas, claseId, tit) {
  return mapas.filter((m) => m.tits.includes(tit))
    .flatMap((m) => m.nodos.filter((n) => n.clase === claseId && (n.tit ?? tit) === tit).map((nodo) => ({ mapa: m, nodo })));
}

/** Los mapas de una titulación con algún nodo en esas clases (p. ej. las de un tema), con cuántos nodos tiene cada uno. */
export function mapasDeClases(mapas, claseIds, tit) {
  const ids = new Set(claseIds);
  return mapas.filter((m) => m.tits.includes(tit))
    .map((mapa) => ({ mapa, nodos: mapa.nodos.filter((n) => ids.has(n.clase) && (n.tit ?? tit) === tit) }))
    .filter((x) => x.nodos.length);
}
