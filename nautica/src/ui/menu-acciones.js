// Menú «⋯» (H-73): un botón con `aria-expanded` que abre una lista de acciones, navegable con el teclado.
//
//   menuAcciones({ etiqueta, items }) → { el, cerrar, abierto }
//
// Cada item es { texto, icono?, onclick? | href? } o { nodo } (un botón o enlace ya hecho, como «¿No es de este tema?»).
// Teclado: Intro, Espacio o ↓ abren y llevan al primer elemento (↑, al último); dentro, ↓ ↑ Inicio Fin se mueven,
// Esc cierra y devuelve el foco al botón, Tab cierra. Tocar fuera también cierra. Un elemento con `hidden` se salta.

import { h } from './dom.js';
import { icono, conIcono } from './iconos.js';

let contador = 0;

export function menuAcciones({ etiqueta = 'Más opciones', items = [] } = {}) {
  const id = `menu-acc-${++contador}`;
  const lista = h('div.menu-lista', { id, role: 'menu', 'aria-label': etiqueta, hidden: true });
  const boton = h('button.secondary.small.menu-boton', { type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': id, 'aria-label': etiqueta, title: etiqueta },
    icono('mas'), h('span.menu-boton-texto', 'Más'));
  const el = h('div.menu-acciones', boton, lista);

  for (const it of items.filter(Boolean)) {
    let nodo = it.nodo;
    if (!nodo) {
      const contenido = it.icono ? conIcono(it.icono, it.texto) : it.texto;
      nodo = it.href
        ? h('a', { href: it.href, ...(it.externo ? { target: '_blank', rel: 'noopener' } : {}) }, contenido)
        : h('button', { type: 'button', onclick: it.onclick }, contenido);
    }
    nodo.setAttribute('role', 'menuitem');
    nodo.setAttribute('tabindex', '-1');
    nodo.classList.add('menu-item');
    // Elegir una opción cierra el menú (si abre un diálogo o un enlace, el foco ya no vuelve al botón).
    nodo.addEventListener('click', () => cerrar(false));
    lista.append(nodo);
  }

  const visibles = () => [...lista.querySelectorAll('[role=menuitem]')].filter((x) => !x.hidden);
  const abierto = () => !lista.hidden;

  function abrir(cual = 'primero') {
    if (!visibles().length) return;
    lista.hidden = false;
    boton.setAttribute('aria-expanded', 'true');
    const v = visibles();
    (cual === 'ultimo' ? v[v.length - 1] : v[0]).focus();
    document.addEventListener('pointerdown', fuera, true);
  }
  function cerrar(devolverFoco = true) {
    if (lista.hidden) return;
    lista.hidden = true;
    boton.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', fuera, true);
    if (devolverFoco) boton.focus();
  }
  function fuera(ev) { if (!el.contains(ev.target)) cerrar(false); }

  boton.addEventListener('click', () => (abierto() ? cerrar() : abrir()));
  boton.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); if (!abierto()) abrir('primero'); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); if (!abierto()) abrir('ultimo'); }
  });
  lista.addEventListener('keydown', (ev) => {
    const v = visibles();
    const i = v.indexOf(document.activeElement);
    const ir = (n) => { ev.preventDefault(); v[(n + v.length) % v.length]?.focus(); };
    if (ev.key === 'ArrowDown') ir(i + 1);
    else if (ev.key === 'ArrowUp') ir(i - 1);
    else if (ev.key === 'Home') ir(0);
    else if (ev.key === 'End') ir(v.length - 1);
    else if (ev.key === 'Escape') { ev.preventDefault(); cerrar(); }
    else if (ev.key === 'Tab') cerrar(false);
  });
  return { el, cerrar, abierto };
}
