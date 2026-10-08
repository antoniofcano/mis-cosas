// Configuración del profesor, lado del alumno: la marca discreta «Ruta de: …» y la sección de Ajustes para usarla
// (importar un fichero o pegar el texto, ver qué cambia, confirmar y quitarla cuando se quiera). Se guarda en los
// ajustes del progreso (`configProfe`), así que entra en las copias de seguridad. La aplicación sobre los datos está en
// src/course/config-profe.js (la llama src/bancos al cargar curso y reglas); aquí solo se pinta, siempre como texto.

import { h, setChildren } from './dom.js';
import { link } from './router.js';
import { configActiva, cursoPorDefecto, cargarMnemotecnias } from '../bancos/index.js';
import { leerConfigTexto, resumenConfig, nombreConfig } from '../course/config-profe.js';
import { fechaLarga } from '../texto.js';
import { conIcono } from './iconos.js';

/** Los datos por defecto con los que se compara una configuración (cursos con su ruta y reglas de la app). */
export async function contextoConfig() {
  const [per, py, mnemo] = await Promise.all([cursoPorDefecto('per'), cursoPorDefecto('py'), cargarMnemotecnias()]);
  return { cursos: { per, py }, reglas: mnemo.porDefecto ?? mnemo.reglas };
}

/** «Ruta de: Marta Ruiz» (con el icono del profe) (enlace a Ajustes), o null sin configuración. */
export function marcaConfig() {
  const c = configActiva();
  return c ? h('p.marca-config', h('a', { href: link(['ajustes'], { campo: 'profe' }), title: `Configuración «${c.nombre}»` }, conIcono('profe', nombreConfig(c)))) : null;
}

/** Sección de Ajustes: «Usar la configuración de mi profesor» y el enlace al modo profesor. */
export function seccionConfigAlumno(progress) {
  const sec = h('section.config-alumno#ajuste-profe');
  const estado = h('div', { 'aria-live': 'polite' });

  const pinta = () => {
    const c = configActiva();
    if (c) {
      setChildren(sec, h('h2', conIcono('profe', 'La configuración de tu profesor')),
        h('p', 'Usas «', h('strong', c.nombre), '», de ', h('strong', c.autor), ` (${fechaLarga(c.fecha)}).`),
        estado,
        h('div.actions', h('button.secondary.grande', { type: 'button', onclick: quitar }, 'Quitarla y volver a la ruta por defecto')),
        enlaceProfe());
      contextoConfig().then((ctx) => setChildren(estado, h('ul.resumen-config', resumenConfig(c, ctx.cursos).map((x) => h('li', x))))).catch(() => {});
      return;
    }
    setChildren(sec, h('h2', conIcono('profe', 'Tu profesor')),
      h('p', 'Si tu profesor te ha pasado un fichero con su ruta del curso, sus reglas para recordar o sus chuletas, úsalo aquí. Solo cambia lo que ves tú; puedes quitarlo cuando quieras.'),
      h('div.actions', h('button.grande', { type: 'button', onclick: abrir }, 'Usar la configuración de mi profesor')),
      estado,
      enlaceProfe());
  };

  const enlaceProfe = () => h('p', h('a', { href: link(['profe']) }, 'Soy profesor: preparar una configuración para mis alumnos →'));

  function quitar() {
    if (!confirm('¿Quitar la configuración de tu profesor? Vuelves a la ruta, las reglas y las chuletas de la app. Lo que has estudiado no se pierde.')) return;
    progress.setSetting('configProfe', null);
    pinta();
  }

  function abrir() {
    const fichero = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: async () => {
      const f = fichero.files[0];
      if (f) revisar(await f.text());
    } });
    const pegado = h('textarea.config-pegar', { rows: 6, placeholder: '{ "version": 1, "autor": … }', 'aria-label': 'Texto de la configuración' });
    setChildren(estado,
      h('div.actions', h('button.grande', { type: 'button', onclick: () => fichero.click() }, 'Elegir el fichero'), fichero),
      h('details.config-pegar-det', h('summary', 'O pega aquí el texto que te ha pasado'),
        pegado, h('div.actions', h('button.secondary', { type: 'button', onclick: () => revisar(pegado.value) }, 'Revisarlo'))),
      h('div.actions', h('button.secondary', { type: 'button', onclick: () => setChildren(estado) }, 'Cancelar')));
  }

  async function revisar(texto) {
    const ctx = await contextoConfig();
    const r = leerConfigTexto(texto, ctx);
    if (!r.ok) {
      setChildren(estado, h('div.warn.config-errores', h('p', h('strong', 'No se puede usar este fichero:')), h('ul', r.errores.slice(0, 8).map((e) => h('li', e)))),
        h('div.actions', h('button.secondary', { type: 'button', onclick: abrir }, 'Probar con otro')));
      return;
    }
    const c = r.config;
    setChildren(estado,
      h('div.config-revision',
        h('h3', `«${c.nombre}», de ${c.autor}`),
        h('p.muted.small', `Preparada el ${fechaLarga(c.fecha)}${c.tit ? ` para el ${c.tit.toUpperCase()}` : ''}.`),
        h('p', h('strong', 'Qué cambia:')),
        h('ul.resumen-config', resumenConfig(c, ctx.cursos).map((x) => h('li', x))),
        r.avisos.length ? h('div.config-avisos', h('p', h('strong', 'Ojo:')), h('ul', r.avisos.map((a) => h('li', a)))) : null,
        h('p.muted.small', 'Lo que ya has estudiado no cambia. Puedes quitarla cuando quieras desde aquí.')),
      h('div.actions',
        h('button.grande', { type: 'button', onclick: () => { progress.setSetting('configProfe', c); pinta(); } }, 'Usar esta configuración'),
        h('button.secondary.grande', { type: 'button', onclick: () => setChildren(estado) }, 'Cancelar')));
  }

  pinta();
  return sec;
}
