// #/<tit>/laminas — rejilla de miniaturas por tema, con filtro por texto. Cada miniatura abre su ficha
// (#/<tit>/laminas/<id>), donde la lámina se ve entera y funciona (animaciones, láminas interactivas).
// Las láminas salen de src/illustrations/catalogo-laminas.js: las de la galería y las que usan las clases.

import { h, setChildren } from '../dom.js';
import { renderIllustration } from '../../illustrations/index.js';
import { catalogoLaminas } from '../../illustrations/catalogo-laminas.js';
import { loadCourse } from '../../store/datasets.js';
import { illustrationEls } from '../illustration.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { cuenta } from '../../texto.js';
import { conIcono } from '../iconos.js';

export { LAMINAS } from '../../illustrations/catalogo-laminas.js';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const cache = new Map();
async function catalogo(T) {
  if (!cache.has(T.id)) cache.set(T.id, loadCourse(T.id).then((curso) => catalogoLaminas(T.id, T.estructura, curso)));
  return cache.get(T.id);
}

/** Miniatura: se dibuja al acercarse a la pantalla, sin animaciones (se ven al abrirla). */
function miniatura(l, href) {
  const dibujo = h('div.miniatura-dibujo', { 'aria-hidden': 'true' });
  dibujo.pintar = () => {
    if (dibujo.dataset.hecho) return;
    dibujo.dataset.hecho = '1';
    dibujo.innerHTML = renderIllustration(l.spec)?.svg ?? '';
    dibujo.querySelector('svg')?.pauseAnimations?.();
  };
  return h('a.miniatura', { href, 'data-texto': norm(`${l.titulo} ${l.buscar}`) }, dibujo, h('span.miniatura-titulo', l.titulo));
}

export function galleryView(o) {
  if (o.params.parts[1]) return laminaView(o);
  const T = TITULACIONES[o.tit] ?? TITULACIONES.per;
  const otro = Object.values(TITULACIONES).find((x) => x.id !== T.id);
  const cuerpo = h('div', h('p.muted', 'Cargando…'));
  const contador = h('p.muted.contador-laminas');
  const filtro = h('input.filtro-laminas', { type: 'search', placeholder: 'Buscar: boya, marea, niebla…', 'aria-label': 'Buscar lámina' });
  let summaryText = `VISTA láminas ${T.sigla}`;
  const el = h('div.gallery',
    volver('Biblioteca', tlink(T.id, ['biblioteca'])),
    h('h1', conIcono('lamina', `Láminas · ${T.sigla}`)),
    filtro, contador, cuerpo,
    otro ? h('p', h('a', { href: tlink(otro.id, ['laminas']) }, `Láminas del ${otro.sigla} →`)) : null);

  catalogo(T).then(({ temas, porId }) => {
    const bloque = new Map(T.estructura.bloques.map((b) => [b.ut, b]));
    const secciones = temas.map(({ ut, ids }) => {
      const b = bloque.get(ut);
      return h('section.tema-laminas', { id: `ut${ut}` }, h('h2', conIcono(b.ico, b.titulo)),
        h('div.rejilla-laminas', ids.map((id) => miniatura(porId.get(id), tlink(T.id, ['laminas', id])))));
    });
    setChildren(cuerpo,
      h('nav.temas', temas.map(({ ut, ids }) => { const b = bloque.get(ut); return h('a.chip', { href: `#ut${ut}`, onclick: (ev) => { ev.preventDefault(); document.getElementById(`ut${ut}`)?.scrollIntoView({ behavior: 'smooth' }); } }, conIcono(b.ico, `${b.titulo} (${ids.length})`)); })),
      secciones,
      h('p.vacio', { hidden: true }, 'Ninguna lámina con ese título.'));
    // Dibujo perezoso: solo las miniaturas que se ven (con 200 láminas, dibujarlas todas de golpe pesa).
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.pintar(); io.unobserve(e.target); } }, { rootMargin: '300px' }) : null;
    for (const d of cuerpo.querySelectorAll('.miniatura-dibujo')) (io ? io.observe(d) : d.pintar());
    const aplicar = () => {
      const q = norm(filtro.value.trim());
      const vistas = new Set(); // una lámina en dos temas contador una vez
      for (const s of cuerpo.querySelectorAll('section.tema-laminas')) {
        let n = 0;
        for (const a of s.querySelectorAll('a.miniatura')) { const ok = !q || a.dataset.texto.includes(q); a.hidden = !ok; if (ok) { n += 1; vistas.add(a.getAttribute('href')); } }
        s.hidden = n === 0;
      }
      cuerpo.querySelector('nav.temas').hidden = !!q;
      cuerpo.querySelector('p.vacio').hidden = vistas.size > 0;
      contador.textContent = q ? `${cuenta(vistas.size, 'lámina')} con «${filtro.value.trim()}».` : `${cuenta(porId.size, 'lámina')}, por temas del examen. Toca una para verla entera.`;
    };
    filtro.addEventListener('input', aplicar);
    aplicar();
    summaryText = `VISTA láminas ${T.sigla} · ${cuenta(porId.size, 'lámina')}\n${temas.map(({ ut, ids }) => `UT${ut} ${bloque.get(ut).titulo}: ${ids.map((id) => `${porId.get(id).titulo} → ${tlink(T.id, ['laminas', id])}`).join(' · ')}`).join('\n')}`;
  });
  return { el, summary: () => summaryText };
}

/** Ficha de una lámina: entera, con su pie, los temas y las clases donde aparece. */
function laminaView({ tit, params }) {
  const T = TITULACIONES[tit] ?? TITULACIONES.per;
  const id = params.parts[1];
  const cuerpo = h('div', h('p.muted', 'Cargando…'));
  let summaryText = `VISTA lámina ${id}`;
  const el = h('div.gallery.ficha-lamina', volver('Láminas', tlink(T.id, ['laminas'])), cuerpo);
  catalogo(T).then(({ porId }) => {
    const l = porId.get(id);
    if (!l) { setChildren(cuerpo, h('h1', 'Lámina no encontrada'), h('p', h('a', { href: tlink(T.id, ['laminas']) }, 'Ver todas las láminas'))); return; }
    const bloque = new Map(T.estructura.bloques.map((b) => [b.ut, b]));
    setChildren(cuerpo,
      h('h1', l.titulo),
      h('div.il-grid.una', illustrationEls(l.spec)),
      h('section', h('h2', 'Dónde aparece'),
        h('div.temas-lamina', l.temas.map((ut) => h('a.chip', { href: tlink(T.id, ['temario', String(ut)]) }, conIcono(bloque.get(ut).ico, bloque.get(ut).titulo)))),
        l.clases.length ? h('ul.clases-lamina', l.clases.map((c) => h('li', h('a', { href: tlink(T.id, ['curso', c.id]) }, conIcono('clase', c.titulo))))) : null));
    summaryText = `VISTA lámina «${l.titulo}» (${claveTexto(l.spec)}) · temas ${l.temas.join(', ')} · clases ${l.clases.map((c) => c.id).join(', ') || '—'}\n${l.resumen}`;
  });
  return { el, summary: () => summaryText };
}

const claveTexto = (s) => Object.entries(s).map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' ');
