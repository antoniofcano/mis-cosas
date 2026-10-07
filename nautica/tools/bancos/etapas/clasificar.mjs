// Etapa 5 · clasificar
// Entrada: correcciones-<tit>.json. Salida: clasificar-<tit>.json con ut, ut_titulo, modulo, orden, bloque y requiere.
// El tema sale de la POSICIÓN en el examen (estructura fija del RD 875/2014, anexo II):
//   PER: 4-2-4-2-5-10-2-3-4-5-4 → UT 1..11 (carta = preguntas 42–45).
//   PY (un cuadernillo de 40): 1–10 seguridad, 11–20 meteorología (módulo genérico), 21–30 teoría de navegación,
//   31–40 carta (módulo de navegación). PY de Andalucía: dos cuadernillos de 20 (genérico, navegación).
// Un clasificador por palabras clave lo valida: las preguntas cuyo texto apunta claramente a otro tema se listan en el
// informe (no se cambian). En Andalucía se compara además con el encabezado «UNIDAD TEÓRICA N» del propio cuadernillo.
// requiere: «carta» en los ejercicios sobre la carta; «anuario» en los de mareas que necesitan una tabla del anuario
// que la pregunta no trae.
import { escribirJSON, leerJSON, rutaEtapa } from '../lib/comun.mjs';
import { canonico } from '../lib/texto.mjs';

export const PER_REPARTO = [4, 2, 4, 2, 5, 10, 2, 3, 4, 5, 4];
export const UT_TITULOS = {
  per: ['Nomenclatura náutica', 'Elementos de amarre y fondeo', 'Seguridad en la mar', 'Legislación', 'Balizamiento', 'Reglamento de abordajes (RIPA)', 'Maniobra y navegación', 'Emergencias en la mar', 'Meteorología', 'Teoría de navegación', 'Carta de navegación'],
  py: ['Seguridad en la mar', 'Meteorología', 'Teoría de navegación', 'Navegación carta'],
};

export function utPER(orden) {
  let acc = 0;
  for (let i = 0; i < PER_REPARTO.length; i++) { acc += PER_REPARTO[i]; if (orden <= acc) return i + 1; }
  return null;
}
export const utPY = (orden) => (orden >= 1 && orden <= 40 ? Math.ceil(orden / 10) : null);

// Palabras clave por tema (texto canónico: sin tildes y en minúsculas). Solo sirven para señalar posibles errores.
const CLAVES = {
  per: {
    1: ['eslora', 'manga', 'puntal', 'calado', 'obra viva', 'obra muerta', 'quilla', 'roda', 'codaste', 'cuaderna', 'bao', 'francobordo', 'asiento', 'escora', 'regala', 'imbornal', 'bita', 'cornamusa', 'candelero', 'guardamancebo', 'sentina', 'mamparo', 'aleta', 'amura', 'helice', 'pala del timon', 'casco', 'desplazamiento', 'arboladura', 'jarcia'],
    2: ['ancla', 'fondear', 'fondeo', 'cadena', 'nudo', 'amarr', 'garre', 'borneo', 'tenedero', 'grillete', 'orinque', 'estacha', 'chicote', 'molinete', 'bolina', 'ballestrinque', 'as de guia', 'codera', 'spring', 'largo de proa'],
    3: ['estabilidad', 'chaleco', 'balsa', 'bengala', 'cohete', 'extintor', 'incendio', 'achique', 'botiquin', 'capear', 'correr el temporal', 'zona de navegacion', 'aro salvavidas', 'radiobaliza', 'inundacion', 'metacentro', 'centro de gravedad'],
    4: ['titulo', 'licencia', 'despacho', 'matricula', 'lista sexta', 'marpol', 'residuo', 'basura', 'aguas sucias', 'contaminacion', 'bañistas', 'banistas', 'capitania', 'zona protegida', 'zepim', 'reserva marina', 'posidonia', 'alquiler', 'seguro obligatorio', 'abanderamiento', 'atribuciones', 'real decreto', 'infraccion', 'vertido'],
    5: ['boya', 'baliza', 'cardinal', 'lateral', 'iala', 'peligro aislado', 'aguas navegables', 'marca especial', 'nuevo peligro', 'marca de tope', 'castillete', 'region a'],
    6: ['abordaje', 'alcanza', 'alcanzado', 'cruce', 'vuelta encontrada', 'luces de costado', 'luz de tope', 'luz de alcance', 'remolc', 'pesca', 'arrastr', 'sin gobierno', 'maniobrabilidad restringida', 'restringido por su calado', 'pitada', 'señal acustica', 'senal acustica', 'visibilidad reducida', 'vigilancia', 'velocidad de seguridad', 'dispositivo de separacion', 'regla', 'buque de vela', 'buque de propulsion mecanica', 'marca cilindrica', 'bola negra', 'cono'],
    7: ['maniobra', 'atracar', 'desatracar', 'atraque', 'ciaboga', 'efecto evolutivo', 'presion lateral', 'arrancada', 'evolucion', 'varada', 'barra'],
    8: ['hombre al agua', 'naufrago', 'abandono', 'via de agua', 'primeros auxilios', 'hipotermia', 'quemadura', 'herida', 'fractura', 'hemorragia', 'reanimacion', 'socorro', 'mayday', 'pan pan', 'salvamento', 'helicoptero', 'rescate', 'busqueda', 'insolacion', 'mareo', 'intoxicacion'],
    9: ['viento', 'presion atmosferica', 'isobara', 'borrasca', 'anticiclon', 'frente', 'nube', 'niebla', 'beaufort', 'douglas', 'mar de fondo', 'mar de viento', 'brisa', 'temperatura', 'humedad', 'barometro', 'termometro', 'galerna', 'tramontana', 'levante', 'poniente', 'meteorolog', 'tiempo'],
    10: ['latitud', 'longitud', 'meridiano', 'paralelo', 'ecuador', 'milla', 'rumbo', 'demora', 'marcacion', 'declinacion', 'desvio', 'correccion total', 'aguja', 'compas', 'mercator', 'escala', 'proyeccion', 'faro', 'alcance', 'derrotero', 'avisos a los navegantes', 'gps', 'radar', 'corredera', 'sonda', 'marea', 'pleamar', 'bajamar', 'carta nautica', 'libro de faros'],
    11: ['situacion', 'hrb', 'hora reloj', 'faro de', 'punta ', 'cabo ', 'rumbo de aguja', 'rumbo verdadero', 'demora de aguja', 'demora verdadera', 'enfilacion', 'distancia', 'velocidad', 'corriente', 'abatimiento', 'calcular', 'tarifa', 'trafalgar', 'espartel', 'carnero', 'europa', 'malabata', 'ceuta', 'almina', 'cires'],
  },
  py: {
    1: ['estabilidad', 'chaleco', 'balsa', 'bengala', 'extintor', 'incendio', 'achique', 'botiquin', 'radiobaliza', 'vhf', 'lsd', 'navtex', 'socorro', 'mayday', 'hombre al agua', 'helicoptero', 'herida', 'hipotermia', 'metacentro', 'centro de gravedad', 'carena', 'adrizado', 'escora', 'via de agua', 'abandono', 'salvamento'],
    2: ['viento', 'presion', 'isobara', 'borrasca', 'anticiclon', 'frente', 'nube', 'niebla', 'beaufort', 'douglas', 'mar de fondo', 'brisa', 'temperatura', 'humedad', 'barometro', 'meteorolog', 'masa de aire', 'ola', 'tormenta', 'ciclon', 'vaguada', 'dorsal'],
    3: ['latitud', 'longitud', 'meridiano', 'paralelo', 'ecuador', 'polo', 'hora', 'astro', 'sol', 'compas', 'aguja', 'desvio', 'declinacion', 'radar', 'gps', 'gnss', 'ais', 'ecdis', 'carta', 'proyeccion', 'mercator', 'derrota', 'loxodromica', 'ortodromica', 'marea', 'avisos a los navegantes', 'publicaciones'],
    4: ['situacion', 'hrb', 'faro de', 'punta ', 'cabo ', 'rumbo de aguja', 'rumbo verdadero', 'demora', 'marcacion', 'enfilacion', 'corriente', 'abatimiento', 'calcular', 'tarifa', 'trafalgar', 'espartel', 'carnero', 'europa', 'malabata', 'ceuta', 'almina', 'cires', 'pleamar', 'bajamar', 'sonda', 'navegamos'],
  },
};

export function puntosTema(texto, tit) {
  const t = canonico(texto);
  const out = {};
  for (const [ut, ks] of Object.entries(CLAVES[tit])) out[ut] = ks.filter((k) => t.includes(k)).length;
  return out;
}

const esMareas = (t) => /(pleamar|bajamar|\bmarea|sonda (en|que)|calcular la sonda|altura de la marea|anuario)/.test(t);
// «Calcular el rumbo directo para navegar desde el punto 29º 15' S, 179º 35' W, hasta…» (PY 1/2016): estima analítica.
const esLoxodromica = (t) => /loxodrom|a los siguientes rumbos|(navegamos|navega) .{0,40}durante .{0,20}horas.*situacion|rumbo directo|desea navegar hasta/.test(t);

/** Posiciones «36º 05,0' N» / «005º 55,0' W» del texto → [{ lat }] y [{ lon }] en grados (W negativo). */
export function coordenadas(texto) {
  const t = String(texto).replace(/\s+/g, ' ');
  const num = (g, m) => Number(g) + Number(String(m ?? 0).replace(',', '.')) / 60;
  const lats = [...t.matchAll(/(\d{1,2})\s*[º°]\s*(\d{1,2}(?:[,.]\d+)?)?\s*['’´′]*\s*([NS])\b/g)].map((m) => num(m[1], m[2]) * (m[3] === 'S' ? -1 : 1));
  const lons = [...t.matchAll(/(\d{1,3})\s*[º°]\s*(\d{1,2}(?:[,.]\d+)?)?\s*['’´′]*\s*([EW])\b/g)].map((m) => num(m[1], m[2]) * (m[3] === 'W' ? -1 : 1));
  return { lats, lons };
}

/**
 * ¿Se resuelve sobre la carta del eje? Con config.carta (toponimos y limites de la carta): sí si el texto nombra un lugar
 * de la carta o da una situación dentro de sus límites (los ejercicios de estima analítica fuera de la carta, no).
 * Sin config.carta: todas las de la unidad de carta.
 */
export function usaCarta(texto, config) {
  const c = config.carta;
  if (!c?.toponimos && !c?.limites) return true;
  const t = canonico(texto);
  if ((c.toponimos ?? []).some((x) => t.includes(x))) return true;
  const { lats, lons } = coordenadas(texto);
  const L = c.limites;
  return !!L && lats.some((la) => la >= L.latMin && la <= L.latMax) && lons.some((lo) => lo >= L.lonMin && lo <= L.lonMax);
}

export function clasificarPregunta(p, config, tit) {
  const disp = config.titulaciones[tit].disposicion;
  let ut;
  let modulo = p.modulo ?? null;
  let orden = p.orden;
  if (disp === 'per-rd875') ut = utPER(orden);
  else if (disp === 'py-modulos') {
    ut = (modulo === 'navegacion' ? 2 : 0) + (p.numero <= 10 ? 1 : 2);
  } else if (disp === 'py-40') {
    ut = utPY(orden);
    modulo = orden <= 20 ? 'generico' : 'navegacion';
  }
  const texto = `${p.enunciado} ${Object.values(p.opciones).join(' ')}`;
  const t = canonico(`${p.contexto ?? ''} ${texto}`);
  const esCarta = (tit === 'per' && ut === 11) || (tit === 'py' && ut === 4);
  let bloque = null;
  const requiere = [];
  if (esCarta) {
    const mareas = esMareas(t);
    const conTabla = !!(p.tabla_mareas || (p.contexto && /pleamar|bajamar|\d{1,2}[:.]\d{2}/i.test(p.contexto)));
    const enCarta = !mareas && usaCarta(`${p.contexto ?? ''} ${texto}`, config);
    if (tit === 'py') bloque = mareas ? 'mareas' : esLoxodromica(t) || /loxodr/i.test(p.contexto ?? '') || !enCarta ? 'loxodromica' : 'carta';
    if (mareas) { if (!conTabla) requiere.push('anuario'); } else if (!(tit === 'py' && bloque === 'loxodromica') && enCarta) requiere.push('carta');
  }
  return { ut, ut_titulo: ut ? UT_TITULOS[tit][ut - 1] : null, modulo, orden, bloque, requiere };
}

export async function clasificar(ctx) {
  const out = {};
  for (const tit of ctx.tits) {
    const d = leerJSON(rutaEtapa(ctx.eje, 'correcciones', tit));
    const atipicas = [];
    for (const p of d.preguntas) {
      Object.assign(p, clasificarPregunta(p, ctx.config, tit));
      const pt = puntosTema(`${p.enunciado} ${Object.values(p.opciones).join(' ')}`, tit);
      const max = Math.max(...Object.values(pt));
      const mejor = Object.keys(pt).filter((k) => pt[k] === max).map(Number);
      // Atípica: el texto suma ≥ 3 palabras de otro tema y ninguna del asignado.
      if (max >= 3 && !pt[p.ut] && !mejor.includes(p.ut)) atipicas.push({ id: p.id, ut: p.ut, sugerido: mejor, puntos: max, enunciado: p.enunciado.slice(0, 120) });
      if (tit === 'py' && p.utPdf && p.utPdf !== p.ut) atipicas.push({ id: p.id, ut: p.ut, sugerido: [p.utPdf], puntos: 'encabezado del cuadernillo', enunciado: p.enunciado.slice(0, 120) });
    }
    escribirJSON(rutaEtapa(ctx.eje, 'clasificar', tit), { ...d, atipicas });
    out[tit] = { atipicas: atipicas.length, carta: d.preguntas.filter((p) => p.requiere.includes('carta')).length, anuario: d.preguntas.filter((p) => p.requiere.includes('anuario')).length };
  }
  return out;
}
