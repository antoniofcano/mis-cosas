// #/<tit>/laminas — láminas animadas organizadas por curso (PER, PY) y tema del temario oficial.
// Una lámina puede estar en varios temas o cursos (p. ej. la meteorología del PER y del PY).

import { h } from '../dom.js';
import { BUOYS } from '../../illustrations/buoys.js';
import { SHIPS } from '../../illustrations/ships.js';
import { SENALES } from '../../illustrations/situations.js';
import { CATALOGO } from '../../illustrations/index.js';
import { illustrationEls } from '../illustration.js';
import { TITULACIONES, tlink, crumbs } from '../titulacion.js';

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
      { tipo: 'hombre-al-agua', maniobra: 'boutakow' }, { tipo: 'hombre-al-agua', maniobra: 'anderson' }, { tipo: 'fuego', vista: 'tetraedro' }, { tipo: 'fuego', vista: 'clases' }, { tipo: 'socorro' }, ...pirotecnia],
    2: [...meteo('borrasca', 'anticiclon', 'buys-ballot', 'isobaras', 'frentes', 'frente-frio-corte', 'frente-calido-corte', 'niebla-adveccion', 'niebla-radiacion', 'brisa-mar', 'brisa-tierra'), ...vientos, { tipo: 'beaufort' }],
    3: [{ tipo: 'nortes', dm: -4, desvio: 2 }, { tipo: 'loxodromica' }, ...mareas],
    4: [{ tipo: 'corriente', caso: 'efectivo' }, { tipo: 'corriente', caso: 'rumbo-a-dar' }, { tipo: 'abatimiento', banda: 'babor' }, { tipo: 'abatimiento', banda: 'estribor' }, { tipo: 'enfilacion' }, { tipo: 'demoras' }, { tipo: 'marea', modo: 'sonda' }],
  },
};

export function galleryView({ tit }) {
  const T = TITULACIONES[tit] ?? TITULACIONES.per;
  const temas = T.estructura.bloques.map((b) => ({ b, specs: LAMINAS[T.id]?.[b.ut] ?? [] })).filter((x) => x.specs.length);
  const total = temas.reduce((n, x) => n + x.specs.length, 0);
  const otro = Object.values(TITULACIONES).find((x) => x.id !== T.id);
  const el = h('div.gallery',
    crumbs(T.id, 'Láminas'),
    h('h1', `🎞️ Láminas animadas · ${T.sigla}`),
    h('p.muted', `${total} láminas organizadas por los temas del examen. Son las mismas que usa el profe en las explicaciones: las luces parpadean con su ritmo real, los barcos maniobran y las señales acústicas suenan.`),
    h('nav.temas', temas.map(({ b, specs }) => h('a.chip', { href: `#ut${b.ut}`, onclick: (ev) => { ev.preventDefault(); document.getElementById(`ut${b.ut}`)?.scrollIntoView({ behavior: 'smooth' }); } }, `${b.icon} ${b.titulo} (${specs.length})`)),
      otro ? h('a.chip.secondary', { href: tlink(otro.id, ['laminas']) }, `Láminas del ${otro.sigla} →`) : null),
    temas.map(({ b, specs }) => h('section', { id: `ut${b.ut}` }, h('h2', `${b.icon} UT${b.ut} · ${b.titulo}`), h('div.il-grid', illustrationEls(specs)))),
  );
  return { el, summary: () => `VISTA láminas ${T.sigla}\n${temas.map(({ b, specs }) => `UT${b.ut} ${b.titulo}: ${specs.map((s) => { const v = s.clase ?? s.sistema ?? s.caso ?? s.situacion ?? s.modo ?? s.rumbo ?? s.marca ?? s.abrir ?? s.resaltar ?? (s.marcha && `${s.marcha}-${s.timon ?? ''}`); return s.tipo + (v ? `:${v}` : ''); }).join(', ')}`).join('\n')}` };
}
