// Catálogo de láminas de la galería: cada lámina se define una vez (por su tipo y su variante) y se enlaza desde
// cada tema en que aparece. Junta las listas de la galería con las láminas que usan las clases. Sin DOM.

import { BUOYS } from './buoys.js';
import { SHIPS } from './ships.js';
import { SENALES } from './situations.js';
import { CATALOGO, renderIllustration } from './index.js';
import { marcoDe } from './marcos.js';
import { bloquesEnOrden } from '../theory/blocks.js';

const boyas = [{ tipo: 'cardinales' }, ...Object.keys(BUOYS).filter((k) => !k.startsWith('cardinal')).map((clase) => ({ tipo: 'boya', clase }))];
const ritmos = ['Fl(2) 5s', 'Q', 'Iso 4s', 'Oc 6s', 'LFl 10s', 'Mo(A) 6s'].map((ritmo) => ({ tipo: 'ritmo', ritmo }));
const buques = Object.keys(SHIPS).map((clase) => ({ tipo: 'buque', clase, vista: 'todas', dia: true }));
const cruces = ['cruce', 'vuelta-encontrada', 'alcance', 'vela-amuras', 'vela-barlovento'].map((situacion) => ({ tipo: 'cruce', situacion }));
const sonidos = Object.keys(SENALES).map((senal) => ({ tipo: 'sonido', senal }));
const meteo = (...s) => s.map((sistema) => ({ tipo: 'meteo', sistema }));
const movimientos = ['balance', 'cabezada', 'guinada'].map((mov) => ({ tipo: 'movimiento', mov }));
const banderas = CATALOGO.bandera.params.codigo.map((codigo) => ({ tipo: 'bandera', codigo }));
const mareas = ['curva', 'duodecimos', 'sonda', 'fases'].map((modo) => ({ tipo: 'marea', modo }));
const vientos = [{ tipo: 'viento-aparente' }, ...['cenida', 'traves', 'aleta', 'popa'].map((rumbo) => ({ tipo: 'viento-aparente', rumbo }))];
const heliceTimon = ['avante', 'atras'].flatMap((marcha) => ['er', 'br'].map((timon) => ({ tipo: 'helice-timon', marcha, timon, sentido: 'dextrogira' })));
const bifurcaciones = [
  { tipo: 'bifurcacion', marca: 'canal-principal-estribor', ruta: 'principal' },
  { tipo: 'bifurcacion', marca: 'canal-principal-estribor', ruta: 'secundario' },
  { tipo: 'bifurcacion', marca: 'canal-principal-babor', ruta: 'principal' },
];
const pirotecnia = ['bengala', 'cohete-paracaidas', 'humo'].map((resaltar) => ({ tipo: 'socorro', resaltar, solo: true }));

/** Qué láminas van en cada tema. Las claves son las UT de la estructura oficial de cada titulación. */
export const LAMINAS = {
  per: {
    1: [{ tipo: 'barco' }, ...movimientos],
    2: [{ tipo: 'amarras' }],
    3: [{ tipo: 'estabilidad', caso: 'estable' }, { tipo: 'hombre-al-agua', maniobra: 'boutakow' }, { tipo: 'hombre-al-agua', maniobra: 'anderson' }],
    4: banderas,
    5: [...boyas, { tipo: 'canal', sentido: 'entrando' }, { tipo: 'canal', sentido: 'saliendo' }, ...bifurcaciones, { tipo: 'regiones' }, ...ritmos],
    6: [...cruces, { tipo: 'riesgo', caso: 'comparar' }, { tipo: 'jerarquia' }, { tipo: 'sectores-luces' }, { tipo: 'dst' }, ...buques, ...sonidos, { tipo: 'socorro' }],
    7: [{ tipo: 'helice', sentido: 'dextrogira', marcha: 'atras' }, { tipo: 'helice', sentido: 'levogira', marcha: 'atras' }, ...heliceTimon, { tipo: 'evolucion' }, { tipo: 'ciaboga' },
      { tipo: 'desatraque', abrir: 'popa' }, { tipo: 'desatraque', abrir: 'proa' }],
    8: [{ tipo: 'socorro' }, ...pirotecnia, { tipo: 'fuego', vista: 'tetraedro' }, { tipo: 'fuego', vista: 'clases' }],
    9: [...meteo('borrasca', 'anticiclon', 'buys-ballot', 'isobaras', 'brisa-mar', 'brisa-tierra', 'frentes'), ...vientos, { tipo: 'beaufort' }],
    10: [CATALOGO.rosa.ejemplo, { tipo: 'nortes', dm: -4, desvio: 2 }, { tipo: 'marea', modo: 'fases' }],
    11: [{ tipo: 'enfilacion' }, { tipo: 'nortes', dm: 3, desvio: -5 }, { tipo: 'demoras' }],
  },
  py: {
    1: [{ tipo: 'estabilidad', caso: 'estable' }, { tipo: 'estabilidad', caso: 'inestable' }, ...movimientos, { tipo: 'busqueda', patron: 'cuadrado' }, { tipo: 'busqueda', patron: 'sectores' },
      { tipo: 'hombre-al-agua', maniobra: 'boutakow' }, { tipo: 'hombre-al-agua', maniobra: 'anderson' }, { tipo: 'hombre-al-agua', maniobra: 'scharnow' }, { tipo: 'fuego', vista: 'tetraedro' }, { tipo: 'fuego', vista: 'clases' }, { tipo: 'socorro' }, ...pirotecnia],
    2: [...meteo('borrasca', 'anticiclon', 'buys-ballot', 'isobaras', 'frentes', 'frente-frio-corte', 'frente-calido-corte', 'niebla-adveccion', 'niebla-radiacion', 'niebla-vapor', 'brisa-mar', 'brisa-tierra'), ...vientos, { tipo: 'beaufort' }],
    3: [{ tipo: 'nortes', dm: -4, desvio: 2 }, { tipo: 'loxodromica' }, ...mareas],
    4: [{ tipo: 'corriente', caso: 'efectivo' }, { tipo: 'corriente', caso: 'rumbo-a-dar' }, { tipo: 'abatimiento', banda: 'babor' }, { tipo: 'abatimiento', banda: 'estribor' }, { tipo: 'enfilacion' }, { tipo: 'demoras' }, { tipo: 'marea', modo: 'sonda' }],
  },
};


// Lo que no cambia la lámina, solo cómo se presenta en una clase: lo resaltado, el texto, cifras concretas, la vista
// de un buque o si es de día. Dos specs que solo difieren en eso son la misma lámina. («luz: todas» de los sectores de
// luces no cambia nada del dibujo: es la misma lámina que la de la galería.)
const SOLO_PRESENTACION = new Set(['resaltar', 'texto', 'solo', 'dia', 'luz']);

/** Clave de una lámina: su tipo y sus parámetros de texto que la definen. */
export function claveLamina(spec) {
  const props = Object.entries(spec)
    .filter(([k, v]) => k !== 'tipo' && !SOLO_PRESENTACION.has(k) && typeof v === 'string' && !(spec.tipo === 'buque' && k === 'vista'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);
  return [spec.tipo, ...props].join('|');
}

/** Identificador corto y estable para la dirección #/<tit>/laminas/<id>. */
export function idLamina(spec) {
  const c = claveLamina(spec);
  let h = 5381;
  for (let i = 0; i < c.length; i++) h = ((h * 33) ^ c.charCodeAt(i)) >>> 0;
  return `${spec.tipo}-${h.toString(36)}`;
}

const sinEtiquetas = (s) => s.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();

/** Título (el rótulo de la lámina o su nombre accesible) y la primera frase del pie. */
export function fichaLamina(spec) {
  const r = renderIllustration(spec);
  if (!r) return null;
  // Láminas en estilo C: su título y su frase clave están escritos a mano en su marco.
  const m = marcoDe(spec);
  if (m) return { titulo: m.titulo, resumen: m.clave, buscar: [m.titulo, m.clave, m.tema, spec.tipo.replace(/-/g, ' '), m.nota ?? '', r.caption ?? ''].join(' ') };
  const rotulo = r.svg.match(/class="il-title[^"]*"[^>]*>([\s\S]*?)<\/text>/)?.[1];
  // Un rótulo muy corto (el «Q» de un ritmo) dice poco: entonces vale más el nombre accesible («Ritmo Q»).
  const nombre = r.svg.match(/aria-label="([^"]*)"/)?.[1];
  const titulo = sinEtiquetas((rotulo && sinEtiquetas(rotulo).length > 3 ? rotulo : nombre) || rotulo || spec.tipo);
  const frase = (r.caption ?? '').split(/(?<=\.)\s/)[0] ?? '';
  // Palabras para el buscador: título, nombre accesible, tipo («boya», «marea»…) y el pie entero.
  const buscar = [titulo, nombre ?? '', spec.tipo.replace(/-/g, ' '), r.caption ?? ''].join(' ');
  return { titulo, resumen: frase.length > 140 ? `${frase.slice(0, 137)}…` : frase, buscar };
}

/**
 * Catálogo de una titulación: temas (en el orden de estudio) con los ids de sus láminas, y cada lámina una
 * sola vez con su spec, título, resumen, temas y clases en que sale.
 * @param {{ bloques: { ut: number }[] }} estructura
 * @param {object|null} curso  data/curso/<tit>.json
 */
export function catalogoLaminas(tit, estructura, curso) {
  const porId = new Map();
  // En el orden de estudio, el mismo de Temario, Examen y Progreso.
  const temas = new Map(bloquesEnOrden(estructura).map((b) => [b.ut, []]));
  const anota = (spec, ut, clase) => {
    if (!temas.has(ut)) return;
    const id = idLamina(spec);
    let l = porId.get(id);
    if (!l) {
      const ficha = fichaLamina(spec);
      if (!ficha) return;
      l = { id, spec, ...ficha, temas: [], clases: [] };
      porId.set(id, l);
    }
    if (!l.temas.includes(ut)) { l.temas.push(ut); temas.get(ut).push(id); }
    if (clase && !l.clases.some((c) => c.id === clase.id)) l.clases.push({ id: clase.id, titulo: clase.titulo });
  };
  for (const [ut, specs] of Object.entries(LAMINAS[tit] ?? {})) for (const s of specs) anota(s, Number(ut));
  for (const m of curso?.modulos ?? []) for (const l of m.lecciones) for (const p of l.pasos) if (p.tipo === 'ilustracion' && p.spec) anota(p.spec, l.ut ?? m.ut, l);
  distinguirTitulos([...porId.values()]);
  return { temas: [...temas].map(([ut, ids]) => ({ ut, ids })).filter((t) => t.ids.length), porId };
}

const ACENTOS = { duodecimos: 'duodécimos', dextrogira: 'dextrógira', levogira: 'levógira', atras: 'atrás', anticiclon: 'anticiclón', adveccion: 'advección', radiacion: 'radiación', cenida: 'ceñida', traves: 'través', estribor: 'estribor', guinada: 'guiñada', mediodia: 'mediodía', oposicion: 'oposición', enfilacion: 'enfilación', definicion: 'definición', simultaneas: 'simultáneas', calculo: 'cálculo' };
// Las señales acústicas se escriben con puntos y rayas: • corta, ▬ larga.
const humano = (v) => (/^[.-]+$/.test(v) ? v.replace(/\./g, '•').replace(/-/g, '▬') : v.split('-').map((w) => ACENTOS[w] ?? w).join(' '));

/** Si varias láminas comparten título (las variantes de la marea, las señales acústicas…), se les añade su variante. */
function distinguirTitulos(laminas) {
  const porTitulo = new Map();
  for (const l of laminas) porTitulo.set(l.titulo, [...(porTitulo.get(l.titulo) ?? []), l]);
  for (const grupo of porTitulo.values()) {
    if (grupo.length < 2) continue;
    const props = (l) => ({ tipo: l.spec.tipo, ...Object.fromEntries(claveLamina(l.spec).split('|').slice(1).map((x) => [x.slice(0, x.indexOf('=')), x.slice(x.indexOf('=') + 1)])) });
    const claves = [...new Set(grupo.flatMap((l) => Object.keys(props(l))))];
    const distintas = claves.filter((k) => new Set(grupo.map((l) => props(l)[k])).size > 1);
    for (const l of grupo) {
      const p = props(l);
      const extra = distintas.map((k) => p[k]).filter(Boolean).map(humano).join(', ');
      if (extra) l.titulo = `${l.titulo} · ${extra}`;
    }
  }
}
