// #/<tit>/guia — guía de bienvenida: cómo funciona el curso, en cinco pantallas (como una clase corta).
// #/<tit>/guia?todo=1 — las cinco en una página, para leer de corrido o imprimir.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { barraActividad } from '../actividad.js';
import { icono } from '../iconos.js';
import { transicion } from '../movimiento.js';
import { paginasGuia } from '../../course/guia.js';

/** Una pantalla de la guía. */
function pagina(p) {
  return h('section.guia-pagina',
    h('h2.guia-titulo', icono(p.icono, 'guia-ico'), p.titulo),
    (p.texto ?? []).map((t) => h('p', t)),
    p.puntos?.length ? h('ul.guia-puntos', p.puntos.map((t) => h('li', t))) : null);
}

export function guiaView({ progress, tit, params }) {
  const T = TITULACIONES[tit];
  const s = progress.settings();
  const paginas = paginasGuia(T, { minutosDia: s.minutosDia ?? 20, fechaExamen: s[`examen_${tit}`] || null });
  progress.setSetting(`guiaVista_${tit}`, true); // ya no se ofrece en Hoy
  const resumen = () => `VISTA guía ${T.sigla}\n${paginas.map((p, i) => `${i + 1}. ${p.titulo}`).join('\n')}`;

  // Todo en una página (y para imprimir).
  if (params.query.todo === '1') {
    const el = h('div.guia.guia-todo',
      h('p.no-imprimir', h('a', { href: tlink(tit) }, '← Hoy')),
      h('h1', `Cómo funciona el curso del ${T.sigla}`),
      paginas.map(pagina),
      h('div.botones-columna.no-imprimir',
        h('button.grande', { type: 'button', onclick: () => window.print() }, 'Imprimir la guía'),
        h('a.btn.grande.secondary', { href: tlink(tit) }, 'Empezar a estudiar')));
    return { el, summary: resumen };
  }

  let i = 0;
  const barra = barraActividad({ texto: '', onSalir: () => { location.hash = tlink(tit); } });
  const cuerpo = h('div.guia-cuerpo');
  const anterior = h('button.secondary.boton-anterior', { type: 'button', 'aria-label': 'Anterior', onclick: () => ir(i - 1, 'atras') }, '←');
  const siguiente = h('button.grande', { type: 'button', onclick: () => ir(i + 1, 'adelante') });
  const fila = h('div.fila-inferior', anterior, siguiente);
  const el = h('div.guia', barra, cuerpo, fila);

  function pinta() {
    barra.set(`Cómo funciona · ${i + 1} de ${paginas.length}`, (i + 1) / paginas.length);
    const ultima = i === paginas.length - 1;
    setChildren(cuerpo, pagina(paginas[i]),
      ultima ? h('div.guia-final',
        h('p.muted', 'Esta guía está siempre en la Biblioteca y en Ajustes.'),
        h('a.btn.secondary', { href: tlink(tit, ['guia'], { todo: '1' }) }, 'Ver la guía entera o imprimirla')) : null);
    anterior.disabled = i === 0;
    siguiente.textContent = ultima ? 'Empezar a estudiar' : 'Siguiente →';
    window.scrollTo(0, 0);
  }
  function ir(k, sentido) {
    if (k >= paginas.length) { location.hash = tlink(tit); return; }
    if (k < 0) return;
    i = k;
    transicion(pinta, sentido);
  }
  pinta();
  return { el, summary: resumen };
}
