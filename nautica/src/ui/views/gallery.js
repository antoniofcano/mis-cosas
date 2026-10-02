// #/ilustraciones — galería del catálogo de ilustraciones (para repasar y para revisar el motor).

import { h } from '../dom.js';
import { CATALOGO } from '../../illustrations/index.js';
import { BUOYS } from '../../illustrations/buoys.js';
import { SHIPS } from '../../illustrations/ships.js';
import { SENALES } from '../../illustrations/situations.js';
import { illustrationEls } from '../illustration.js';

export function galleryView() {
  const section = (title, specs) => h('section', h('h2', title), h('div.il-grid', illustrationEls(specs)));
  const el = h('div.gallery',
    h('nav.crumbs', h('a', { href: '#/' }, 'Inicio'), ' › ', h('a', { href: '#/teoria' }, 'Teoría'), ' › Ilustraciones'),
    h('h1', 'Láminas animadas'),
    h('p.muted', 'Las mismas ilustraciones que usa el profe en las explicaciones. Las luces parpadean con su ritmo real.'),
    section('🚩 Balizamiento (IALA región A)', [{ tipo: 'cardinales' }, ...Object.keys(BUOYS).filter((k) => !k.startsWith('cardinal')).map((clase) => ({ tipo: 'boya', clase }))]),
    section('🚢 Luces y marcas (RIPA)', Object.keys(SHIPS).map((clase) => ({ tipo: 'buque', clase, vista: 'todas', dia: true }))),
    section('↔️ Reglas de rumbo y gobierno', ['cruce', 'vuelta-encontrada', 'alcance', 'vela-amuras', 'vela-barlovento'].map((situacion) => ({ tipo: 'cruce', situacion }))),
    section('🔊 Señales acústicas', Object.keys(SENALES).map((senal) => ({ tipo: 'sonido', senal }))),
    section('🌦️ Meteorología', ['borrasca', 'anticiclon', 'buys-ballot', 'brisa-mar', 'brisa-tierra', 'frentes'].map((sistema) => ({ tipo: 'meteo', sistema }))),
    section('⚓ Barco, maniobra y navegación', [{ tipo: 'barco' }, { tipo: 'helice', sentido: 'dextrogira', marcha: 'atras' }, { tipo: 'helice', sentido: 'levogira', marcha: 'atras' }, CATALOGO.rosa.ejemplo]),
    section('🏳️ Banderas', CATALOGO.bandera.params.codigo.map((codigo) => ({ tipo: 'bandera', codigo }))),
  );
  return { el, summary: () => 'VISTA galería de ilustraciones' };
}
