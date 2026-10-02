// #/ilustraciones — galería del catálogo de ilustraciones (para repasar y para revisar el motor).

import { h } from '../dom.js';
import { CATALOGO } from '../../illustrations/index.js';
import { BUOYS } from '../../illustrations/buoys.js';
import { SHIPS } from '../../illustrations/ships.js';
import { SENALES } from '../../illustrations/situations.js';
import { illustrationEls } from '../illustration.js';
import { crumbs } from '../titulacion.js';

export function galleryView() {
  const section = (title, specs) => h('section', h('h2', title), h('div.il-grid', illustrationEls(specs)));
  const el = h('div.gallery',
    crumbs(null, 'Láminas animadas'),
    h('h1', 'Láminas animadas'),
    h('p.muted', 'Las mismas ilustraciones que usa el profe en las explicaciones. Las luces parpadean con su ritmo real.'),
    section('🚩 Balizamiento (IALA región A)', [{ tipo: 'cardinales' }, ...Object.keys(BUOYS).filter((k) => !k.startsWith('cardinal')).map((clase) => ({ tipo: 'boya', clase }))]),
    section('🚢 Luces y marcas (RIPA)', Object.keys(SHIPS).map((clase) => ({ tipo: 'buque', clase, vista: 'todas', dia: true }))),
    section('↔️ Reglas de rumbo y gobierno', [...['cruce', 'vuelta-encontrada', 'alcance', 'vela-amuras', 'vela-barlovento'].map((situacion) => ({ tipo: 'cruce', situacion })), { tipo: 'jerarquia' }, { tipo: 'sectores-luces' }, { tipo: 'dst' }, { tipo: 'canal', sentido: 'entrando' }, { tipo: 'canal', sentido: 'saliendo' }]),
    section('🔊 Señales acústicas', Object.keys(SENALES).map((senal) => ({ tipo: 'sonido', senal }))),
    section('🌦️ Meteorología', CATALOGO.meteo.params.sistema.map((sistema) => ({ tipo: 'meteo', sistema })).concat([{ tipo: 'viento-aparente' }])),
    section('⚓ Barco, maniobra y navegación', [{ tipo: 'barco' }, { tipo: 'helice', sentido: 'dextrogira', marcha: 'atras' }, { tipo: 'helice', sentido: 'levogira', marcha: 'atras' }, CATALOGO.rosa.ejemplo]),
    section('🏳️ Banderas', CATALOGO.bandera.params.codigo.map((codigo) => ({ tipo: 'bandera', codigo }))),
    section('🧭 Navegación y carta', [{ tipo: 'nortes', dm: -4, desvio: 2 }, { tipo: 'enfilacion' }, { tipo: 'corriente', caso: 'efectivo' }, { tipo: 'corriente', caso: 'rumbo-a-dar' }, { tipo: 'abatimiento', banda: 'babor' }, { tipo: 'loxodromica' }]),
    section('🌊 Mareas', ['curva', 'duodecimos', 'sonda'].map((modo) => ({ tipo: 'marea', modo }))),
    section('🦺 Seguridad y maniobra', [{ tipo: 'estabilidad', caso: 'estable' }, { tipo: 'estabilidad', caso: 'inestable' }, ...['balance', 'cabezada', 'guinada'].map((mov) => ({ tipo: 'movimiento', mov })), { tipo: 'amarras' }, { tipo: 'busqueda', patron: 'cuadrado' }, { tipo: 'busqueda', patron: 'sectores' }, { tipo: 'hombre-al-agua', maniobra: 'boutakow' }, { tipo: 'hombre-al-agua', maniobra: 'anderson' }, { tipo: 'fuego', vista: 'tetraedro' }, { tipo: 'fuego', vista: 'clases' }]),
  );
  return { el, summary: () => 'VISTA galería de ilustraciones' };
}
