// #/profe — Modo profesor (desde Ajustes, «Soy profesor»): preparar una configuración para los alumnos y compartirla
// como fichero. Se edita la ruta del curso (orden e intercalado, arrastrando o con los botones subir/bajar, sin
// romper lo que requiere cada clase), las reglas para recordar (añadir, cambiar, ocultar) y la chuleta de cada clase.
// Lo editado se guarda como borrador en este aparato (ajuste `borradorProfe`) y no cambia nada de lo que ve el
// profesor como alumno; solo lo usa quien importa el fichero (src/ui/config-profe.js).

import { h, setChildren, copyText } from '../dom.js';
import { link } from '../router.js';
import { TITULACIONES } from '../titulacion.js';
import { cursoPorDefecto, cargarMnemotecnias } from '../../bancos/index.js';
import { ordenRuta, tramosDe, violacionesRuta, requisitos } from '../../course/ruta.js';
import { crearConfig, aplicarConfigCurso, aplicarConfigReglas, resumenConfig, lineasChuleta, LIMITES } from '../../course/config-profe.js';
import { descargar } from '../copia.js';
import { cuenta, diaISO } from '../../texto.js';
import { conIcono } from '../iconos.js';

const vacio = () => ({ autor: '', nombre: '', tit: 'py', ruta: null, reglas: { añadir: [], cambiar: {}, quitar: [] }, chuletas: {} });

export function profeView({ progress, tit: titActual }) {
  const el = h('div.profe-modo', h('h1', conIcono('profe', 'Modo profesor')), h('p.muted', 'Cargando el curso…'));
  let summaryText = 'VISTA modo profesor (cargando)';
  // Borrador: lo que el profesor va preparando (se guarda solo, en este aparato).
  const leido = progress.settings().borradorProfe;
  const b = { ...vacio(), ...(leido && typeof leido === 'object' ? leido : {}) };
  if (!leido && TITULACIONES[titActual]) b.tit = titActual;
  b.reglas = { añadir: [], cambiar: {}, quitar: [], ...(b.reglas ?? {}) };
  const guarda = () => progress.setSetting('borradorProfe', b);

  Promise.all([cursoPorDefecto('per'), cursoPorDefecto('py'), cargarMnemotecnias()]).then(([per, py, mnemo]) => {
    const cursos = { per, py };
    const reglasApp = mnemo.porDefecto ?? mnemo.reglas;
    const curso = () => cursos[b.tit];
    const E = () => TITULACIONES[b.tit].estructura;
    const tema = (ut) => E().bloques.find((x) => x.ut === ut);
    const porDefecto = () => ordenRuta(curso(), E()).map((l) => l.id);
    const orden = () => (b.ruta?.length ? ordenRuta({ ...curso(), ruta: b.ruta }, E()).map((l) => l.id) : porDefecto());
    const clases = () => new Map(ordenRuta(curso(), E()).map((l) => [l.id, l]));
    const config = () => crearConfig({ ...b, fecha: diaISO(), ruta: b.ruta?.length ? orden() : null });

    // ---- Datos de la configuración
    const datos = h('section.profe-datos',
      h('h2', '1. Quién la prepara'),
      h('label.field', h('span.lbl', 'Tu nombre (lo verán tus alumnos: «Ruta de: …»)'),
        h('input', { value: b.autor, maxlength: LIMITES.corto, autocomplete: 'name', oninput: (ev) => { b.autor = ev.target.value; guarda(); pintaExportar(); } })),
      h('label.field', h('span.lbl', 'Nombre de la configuración'),
        h('input', { value: b.nombre, maxlength: LIMITES.corto, placeholder: 'Por ejemplo: Grupo de tarde, PY 2027', oninput: (ev) => { b.nombre = ev.target.value; guarda(); pintaExportar(); } })),
      h('h3.ajuste', 'Titulación'),
      h('div.opciones-grandes', Object.values(TITULACIONES).map((X) => h('button.grande', {
        type: 'button', class: X.id === b.tit ? '' : 'secondary', 'aria-pressed': String(X.id === b.tit),
        onclick: () => {
          if (X.id === b.tit) return;
          if (b.ruta?.length && !confirm(`La ruta que has preparado es del ${TITULACIONES[b.tit].sigla}. ¿Cambiar al ${X.sigla}? Esa ruta se pierde (las reglas y las chuletas se quedan).`)) return;
          b.tit = X.id; b.ruta = null; guarda(); pintaTodo();
        },
      }, X.sigla))));

    // ---- Ruta
    const rutaSec = h('section.profe-ruta');
    const avisoRuta = h('p.aviso-ruta', { role: 'status', 'aria-live': 'polite' });
    let arrastrando = null;
    /** Mueve la clase de la posición i a la j si no rompe lo que requiere cada clase; si no, dice por qué. */
    function mover(i, j) {
      const ids = orden();
      if (j < 0 || j >= ids.length || i === j) return;
      const nuevo = [...ids];
      const [x] = nuevo.splice(i, 1);
      nuevo.splice(j, 0, x);
      const mal = violacionesRuta(nuevo, curso());
      if (mal.length) {
        const cl = clases();
        const v = mal[0];
        avisoRuta.className = 'aviso-ruta warn';
        avisoRuta.textContent = `No se puede: «${cl.get(v.id).titulo}» se apoya en «${cl.get(v.faltan[0]).titulo}», que tiene que ir antes.`;
        return;
      }
      b.ruta = nuevo;
      guarda();
      avisoRuta.className = 'aviso-ruta';
      avisoRuta.textContent = `«${clases().get(x).titulo}» ahora va en el puesto ${j + 1}.`;
      pintaRuta(x);
      pintaVista();
      pintaExportar();
    }
    function pintaRuta(enfocar = null) {
      const ids = orden();
      const cl = clases();
      const filas = ids.map((id, i) => {
        const l = cl.get(id);
        const t = tema(l.ut);
        const nuevoTramo = i === 0 || cl.get(ids[i - 1]).ut !== l.ut;
        const apoyo = requisitos(l, curso());
        const fila = h('li.ruta-fila', { draggable: 'true', 'data-id': id, class: nuevoTramo ? 'nuevo-tramo' : '',
          ondragstart: (ev) => { arrastrando = i; ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', id); fila.classList.add('arrastrando'); },
          ondragend: () => fila.classList.remove('arrastrando'),
          ondragover: (ev) => { ev.preventDefault(); fila.classList.add('destino'); },
          ondragleave: () => fila.classList.remove('destino'),
          ondrop: (ev) => { ev.preventDefault(); fila.classList.remove('destino'); if (arrastrando != null) mover(arrastrando, i); arrastrando = null; } },
          h('span.ruta-asa', { 'aria-hidden': 'true', title: 'Arrastra para mover' }, '⠿'),
          h('span.ruta-texto',
            h('span.ruta-tema', conIcono(t.ico, t.titulo)),
            h('span.ruta-titulo', l.titulo),
            apoyo.length ? h('span.ruta-apoyo', `Se apoya en: ${apoyo.map((r) => r.titulo).join(' · ')}`) : null),
          h('span.ruta-botones',
            h('button.secondary', { type: 'button', 'aria-label': `Subir «${l.titulo}»`, title: 'Subir', disabled: i === 0, onclick: () => mover(i, i - 1) }, '↑'),
            h('button.secondary', { type: 'button', 'aria-label': `Bajar «${l.titulo}»`, title: 'Bajar', disabled: i === ids.length - 1, onclick: () => mover(i, i + 1) }, '↓')));
        return fila;
      });
      const tramos = tramosDe(ids.map((id) => cl.get(id))).length;
      setChildren(rutaSec,
        h('h2', '2. La ruta del curso'),
        h('p', 'El orden en que tus alumnos darán las clases. Arrastra una clase o usa ↑ ↓. Las clases seguidas del mismo tema forman un tramo: alterna temas para que no se haga pesado y deja pronto los que tienen límite de fallos.'),
        h('p.muted.small', `${cuenta(ids.length, 'clase')} en ${cuenta(tramos, 'tramo')}${b.ruta?.length ? ' · ruta tuya' : ' · ruta por defecto de la app'}. Una clase nunca puede ir antes de las que la sostienen.`),
        avisoRuta,
        h('ol.ruta-editor', filas),
        b.ruta?.length ? h('div.actions', h('button.secondary', { type: 'button', onclick: () => { if (confirm('¿Volver a la ruta por defecto de la app?')) { b.ruta = null; guarda(); pintaRuta(); pintaVista(); pintaExportar(); } } }, 'Volver a la ruta por defecto')) : null);
      if (enfocar) {
        const f = rutaSec.querySelector(`li[data-id="${enfocar}"]`);
        f?.classList.add('movida');
        f?.scrollIntoView({ block: 'nearest' });
      }
    }

    // ---- Reglas para recordar
    const reglasSec = h('section.profe-reglas');
    let filtro = '';
    function pintaReglas() {
      const lista = h('div.profe-reglas-lista');
      const pintaLista = () => {
        const q = filtro.toLowerCase();
        const visibles = reglasApp.filter((r) => !q || `${r.regla} ${r.significado} ${r.tema}`.toLowerCase().includes(q));
        setChildren(lista,
          b.reglas.añadir.map((r, i) => h('div.profe-regla.nueva',
            h('p', h('strong', conIcono('nudo', r.regla))), r.significado ? h('p.small', r.significado) : null, h('p.muted.small', 'Regla tuya'),
            h('div.actions', h('button.secondary', { type: 'button', onclick: () => { b.reglas.añadir.splice(i, 1); guarda(); pintaReglas(); pintaVista(); pintaExportar(); } }, 'Quitar')))),
          visibles.map((r) => filaRegla(r)));
      };
      const filaRegla = (r) => {
        const cambio = b.reglas.cambiar[r.id];
        const oculta = b.reglas.quitar.includes(r.id);
        const actual = { ...r, ...(cambio ?? {}) };
        const caja = h('div.profe-regla', { class: oculta ? 'oculta' : cambio ? 'cambiada' : '' });
        const ver = () => setChildren(caja,
          h('p', h('strong', conIcono('nudo', actual.regla))), h('p.small', actual.significado),
          h('p.muted.small', `${r.tema}${oculta ? ' · oculta para tus alumnos' : cambio ? ' · cambiada por ti' : ''}`),
          h('div.actions',
            oculta ? null : h('button.secondary', { type: 'button', onclick: editar }, 'Editar'),
            h('button.secondary', { type: 'button', onclick: () => {
              b.reglas.quitar = oculta ? b.reglas.quitar.filter((x) => x !== r.id) : [...b.reglas.quitar, r.id];
              guarda(); pintaReglas(); pintaVista(); pintaExportar();
            } }, oculta ? 'Mostrarla' : 'Ocultarla'),
            cambio ? h('button.secondary', { type: 'button', onclick: () => { delete b.reglas.cambiar[r.id]; guarda(); pintaReglas(); pintaVista(); pintaExportar(); } }, 'Volver a la original') : null));
        const editar = () => {
          const tRegla = h('textarea', { rows: 2, maxlength: LIMITES.regla, 'aria-label': 'Regla' }, actual.regla);
          const tSig = h('textarea', { rows: 4, maxlength: LIMITES.significado, 'aria-label': 'Explicación' }, actual.significado);
          setChildren(caja, h('label.field', h('span.lbl', 'Regla'), tRegla), h('label.field', h('span.lbl', 'Explicación'), tSig),
            h('div.actions',
              h('button', { type: 'button', onclick: () => {
                if (!tRegla.value.trim()) { alert('La regla no puede quedar vacía.'); return; }
                const c = {};
                if (tRegla.value.trim() !== r.regla) c.regla = tRegla.value.trim();
                if (tSig.value.trim() !== r.significado) c.significado = tSig.value.trim();
                if (Object.keys(c).length) b.reglas.cambiar[r.id] = c; else delete b.reglas.cambiar[r.id];
                guarda(); pintaReglas(); pintaVista(); pintaExportar();
              } }, 'Guardar'),
              h('button.secondary', { type: 'button', onclick: ver }, 'Cancelar')));
          tRegla.focus();
        };
        ver();
        return caja;
      };
      const nRegla = h('textarea', { rows: 2, maxlength: LIMITES.regla, 'aria-label': 'Regla nueva' });
      const nSig = h('textarea', { rows: 3, maxlength: LIMITES.significado, 'aria-label': 'Explicación de la regla nueva' });
      setChildren(reglasSec,
        h('h2', '3. Reglas para recordar'),
        h('p', 'Las que ven tus alumnos en «Reglas para recordar», en las clases y cuando el profe explica una pregunta. Puedes añadir las tuyas, cambiar el texto de una u ocultarla.'),
        h('details.profe-nueva-regla', h('summary', conIcono('anadir', 'Añadir una regla')),
          h('label.field', h('span.lbl', 'Regla'), nRegla), h('label.field', h('span.lbl', 'Explicación'), nSig),
          h('div.actions', h('button', { type: 'button', onclick: () => {
            if (!nRegla.value.trim()) { alert('Escribe la regla.'); return; }
            b.reglas.añadir.push({ regla: nRegla.value.trim(), significado: nSig.value.trim() });
            guarda(); pintaReglas(); pintaVista(); pintaExportar();
          } }, 'Añadir'))),
        h('label.field', h('span.lbl', 'Buscar una regla'), h('input', { type: 'search', value: filtro, oninput: (ev) => { filtro = ev.target.value; pintaLista(); } })),
        lista);
      pintaLista();
    }

    // ---- Chuletas de las clases
    const chuSec = h('section.profe-chuletas');
    let elegida = null;
    function pintaChuletas() {
      const cl = clases();
      if (!elegida || !cl.has(elegida)) elegida = cl.keys().next().value;
      const sel = h('select', { 'aria-label': 'Clase', onchange: (ev) => { elegida = ev.target.value; pintaChuletas(); } },
        E().bloques.map((t) => h('optgroup', { label: t.titulo },
          [...cl.values()].filter((l) => l.ut === t.ut).map((l) => h('option', { value: l.id, selected: l.id === elegida }, `${l.titulo}${b.chuletas[l.id] ? ' (editada)' : ''}`)))));
      const l = cl.get(elegida);
      const area = h('textarea.profe-chuleta', { rows: 8, 'aria-label': `Chuleta de ${l.titulo}` }, b.chuletas[l.id] ?? (l.chuleta ?? []).join('\n'));
      setChildren(chuSec,
        h('h2', '4. Chuletas de las clases'),
        h('p', 'Lo que el alumno ve al terminar la clase y en las chuletas para practicar. Una línea por punto; **así** sale en negrita.'),
        h('label.field', h('span.lbl', 'Clase'), sel),
        area,
        h('p.muted.small', b.chuletas[l.id] ? 'Chuleta tuya.' : 'Es la de la app: si la cambias y guardas, tus alumnos verán la tuya.'),
        h('div.actions',
          h('button', { type: 'button', onclick: () => {
            const ls = lineasChuleta(area.value);
            if (!ls.length) { alert('La chuleta no puede quedar vacía. Si quieres la de la app, pulsa «Volver a la de la app».'); return; }
            if (ls.join('\n') === (l.chuleta ?? []).join('\n')) delete b.chuletas[l.id]; else b.chuletas[l.id] = ls.join('\n');
            guarda(); pintaChuletas(); pintaVista(); pintaExportar();
          } }, 'Guardar la chuleta'),
          b.chuletas[l.id] ? h('button.secondary', { type: 'button', onclick: () => { delete b.chuletas[l.id]; guarda(); pintaChuletas(); pintaVista(); pintaExportar(); } }, 'Volver a la de la app') : null));
    }

    // ---- Vista previa: lo que verán los alumnos
    const vistaSec = h('section.profe-vista');
    function pintaVista() {
      const r = config();
      if (!r.ok) {
        setChildren(vistaSec, h('h2', '5. Vista previa'), h('p.muted', 'Pon tu nombre y el de la configuración para verla.'));
        return;
      }
      const c = r.config;
      const cursoAlumno = aplicarConfigCurso(curso(), c, b.tit);
      const ls = ordenRuta(cursoAlumno, E());
      const reglas = aplicarConfigReglas(reglasApp, c).filter((x) => x.deProfe);
      const chuletas = Object.keys(c.chuletas ?? {}).map((id) => clases().get(id)).filter(Boolean);
      setChildren(vistaSec,
        h('h2', '5. Vista previa'),
        h('p.marca-config', conIcono('profe', `Ruta de: ${c.autor}`)),
        h('ul.resumen-config', resumenConfig(c, cursos).map((x) => h('li', x))),
        h('details', h('summary', `La ruta, por tramos (${TITULACIONES[b.tit].sigla})`),
          h('ol.vista-tramos', tramosDe(ls).map((t) => h('li', h('strong', conIcono(tema(t.ut).ico, `${tema(t.ut).titulo}: `)), t.lecciones.map((l) => l.titulo).join(' · '))))),
        reglas.length ? h('details', h('summary', 'Reglas nuevas o cambiadas'), reglas.map((x) => h('div.profe-regla', h('p', h('strong', conIcono('nudo', x.regla))), h('p.small', x.significado)))) : null,
        chuletas.length ? h('details', h('summary', 'Chuletas cambiadas'), chuletas.map((l) => h('section.chuleta', h('h3', conIcono('chincheta', l.titulo)),
          h('ul', c.chuletas[l.id].split('\n').map((x) => h('li', x.replace(/\*\*/g, ''))))))) : null);
    }

    // ---- Exportar
    const expSec = h('section.profe-exportar');
    const estadoExp = h('p', { role: 'status', 'aria-live': 'polite' });
    function pintaExportar() {
      const r = config();
      const texto = r.ok ? JSON.stringify(r.config, null, 1) : '';
      const fichero = r.ok ? `configuracion-${(r.config.nombre || 'profesor').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'profesor'}.json` : '';
      setChildren(expSec,
        h('h2', '6. Compartirla'),
        h('p', 'Descarga el fichero y pásaselo a tus alumnos (por correo, mensajería o el aula virtual). Ellos lo usan en Ajustes → «Usar la configuración de mi profesor». Solo les cambia a ellos.'),
        r.ok ? null : h('div.warn', h('ul', r.errores.map((e) => h('li', e)))),
        h('div.actions',
          h('button.grande', { type: 'button', disabled: !r.ok, onclick: () => { descargar(fichero, texto); estadoExp.textContent = `Descargado: ${fichero}`; } }, 'Exportar configuración (.json)'),
          h('button.secondary.grande', { type: 'button', disabled: !r.ok, onclick: () => copyText(texto).then(() => { estadoExp.textContent = 'Copiada: pégala en un mensaje a tus alumnos.'; }).catch(() => { estadoExp.textContent = 'No se pudo copiar.'; }) }, 'Copiar el texto')),
        estadoExp,
        h('details.empezar-de-cero', h('summary', 'Empezar otra desde cero'),
          h('p', 'Se borra lo que has preparado aquí (no lo que ya hayas compartido).'),
          h('button.peligro', { type: 'button', onclick: () => { if (confirm('¿Borrar lo que has preparado?')) { Object.assign(b, vacio(), { tit: b.tit }); guarda(); pintaTodo(); } } }, 'Borrar el borrador')));
      summaryText = `VISTA modo profesor · ${TITULACIONES[b.tit].sigla} · autor «${b.autor}» · ${r.ok ? `lista para exportar: ${resumenConfig(r.config, cursos).join(' ')}` : `faltan datos: ${r.errores.join(' ')}`}`;
    }

    function pintaTodo() {
      pintaRuta(); pintaReglas(); pintaChuletas(); pintaVista(); pintaExportar();
      datos.querySelectorAll('.opciones-grandes button').forEach((x) => {
        const on = x.textContent === TITULACIONES[b.tit].sigla;
        x.className = `grande${on ? '' : ' secondary'}`;
        x.setAttribute('aria-pressed', String(on));
      });
    }
    setChildren(el,
      h('p', h('a.volver', { href: link(['ajustes']) }, '← Ajustes')),
      h('h1', conIcono('profe', 'Modo profesor')),
      h('p', 'Prepara la ruta del curso, las reglas para recordar y las chuletas a tu manera y compártelas con tus alumnos en un fichero. A ti no te cambia nada: lo que preparas se guarda aquí como borrador.'),
      datos, rutaSec, reglasSec, chuSec, vistaSec, expSec);
    pintaTodo();
  }).catch((e) => setChildren(el, h('p.warn', `No se pudo cargar el curso: ${e.message}`)));
  return { el, summary: () => summaryText };
}
