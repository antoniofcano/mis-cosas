// #/ajustes — Ajustes (tras el engranaje de la cabecera): fecha del examen y minutos al día, titulación, dónde te
// examinas (si hay más de un banco publicado), instalar,
// voz del profe, sonidos y vibración (docs/EFECTOS.md), la configuración del profesor (usarla o quitarla; enlace al modo profesor) y copia de seguridad. Es la única pantalla con el pie de página. Los recursos de estudio están en
// Biblioteca (#/<tit>/biblioteca).

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, currentEje } from '../titulacion.js';
import { voice, spanishVoices } from '../voice.js';
import { botonesMinutos } from './bienvenida.js';
import { guardarCopia, botonRecuperar, lineaProteccion } from '../copia.js';
import { puedeInstalar, alCambiarInstalable, instalar } from '../pwa.js';
import { calcularPlan } from '../cierre.js';
import { planConSeguimiento, botonSubirMinutos, marcaEstado, avisoEsencial } from '../plan-estudio.js';
import { DIAS_ESTUDIO } from '../../course/calendario.js';
import { fechaLarga } from '../../texto.js';
import { ejesElegibles, selectorEje, citaFuente } from '../eje.js';
import { seccionConfigAlumno } from '../config-profe.js';
import { conIcono } from '../iconos.js';
import { soportaSonido, soportaVibracion, desbloquearSonido, efecto } from '../efectos.js';

export function masView({ progress, tit, params }) {
  const T = TITULACIONES[tit];
  const s = progress.settings();

  const minutos = h('div');
  // Al elegir fecha o minutos se dice enseguida si da tiempo (y, si no, se ofrece subir los minutos de un toque).
  const avisoPlan = h('div.ritmo', { hidden: true, 'aria-live': 'polite' });
  const pintaAviso = () => calcularPlan(progress, tit).then((d) => {
    const ps = planConSeguimiento(progress, tit, d);
    avisoPlan.hidden = !ps;
    if (!ps) return;
    const [icono] = marcaEstado(d.st.mensaje.tipo === 'toca' ? ps.seg.estado : 'al-dia');
    avisoPlan.className = `ritmo ${d.st.mensaje.aviso ? 'warn' : ''}`;
    setChildren(avisoPlan, h('p', icono, d.st.mensaje.texto), d.st.mensaje.detalle ? h('p.muted.small', d.st.mensaje.detalle) : null,
      d.st.mensaje.aviso ? botonSubirMinutos(progress, ps, () => { pintaMinutos(); }, tit) : null,
      avisoEsencial(progress, tit, T.estructura, () => { pintaMinutos(); }));
  }).catch(() => { avisoPlan.hidden = true; });
  // Tamaño de letra: se aplica al momento a toda la app.
  const letraEl = h('div');
  const LETRAS = [['normal', 'Normal'], ['grande', 'Grande'], ['muy-grande', 'Muy grande']];
  const pintaLetra = () => {
    const actual = progress.settings().letra ?? 'normal';
    setChildren(letraEl, h('div.opciones-grandes', LETRAS.map(([k, txt]) => h('button.grande', {
      type: 'button', class: actual === k ? '' : 'secondary', 'aria-pressed': actual === k ? 'true' : 'false',
      onclick: () => { progress.setSetting('letra', k); window.dispatchEvent(new Event('ajustes-letra')); pintaLetra(); },
    }, txt))));
  };
  pintaLetra();
  const diasEl = h('div');
  const pintaDias = () => {
    const actual = progress.settings().diasEstudio ?? 'todos';
    setChildren(diasEl, h('div.opciones-grandes', Object.entries(DIAS_ESTUDIO).map(([k, txt]) => h('button.grande', {
      type: 'button', class: actual === k ? '' : 'secondary', 'aria-pressed': actual === k ? 'true' : 'false',
      onclick: () => { progress.setSetting('diasEstudio', k); pintaDias(); pintaAviso(); },
    }, txt[0].toUpperCase() + txt.slice(1)))));
  };
  const pintaMinutos = () => { setChildren(minutos, botonesMinutos(progress.settings().minutosDia ?? 20, (m) => { progress.setSetting('minutosDia', m); pintaMinutos(); })); pintaAviso(); };
  pintaMinutos();
  pintaDias();
  const fecha = h('input', { type: 'date', id: 'fecha-examen', value: s[`examen_${tit}`] ?? '', onchange: (ev) => { progress.setSetting(`examen_${tit}`, ev.target.value); progress.setSetting(`examenOrientativo_${tit}`, false); pintaAviso(); } });

  const copiaHecha = h('p.muted', s.ultimaCopia ? `Última copia: ${fechaLarga(s.ultimaCopia)}.` : '');

  // Dónde te examinas: solo si hay más de un banco publicado (con uno solo, la sección no existe).
  const ejeEl = h('section.ajuste-eje', { hidden: true });
  const pintaEje = (ejes) => {
    const ficha = ejes.find((e) => e.id === currentEje(progress))?.ficha;
    setChildren(ejeEl, h('h2', conIcono('lugar', 'Dónde te examinas')),
      h('p.muted', 'Estudias con los exámenes reales de tu tribunal. Si cambias, lo que ya has estudiado se queda guardado, y la fecha del examen no cambia.'),
      selectorEje(progress, ejes, () => { pintaEje(ejes); pintaAviso(); }),
      citaFuente(ficha));
    ejeEl.hidden = false;
  };
  ejesElegibles().then((ejes) => { if (ejes.length) pintaEje(ejes); }).catch(() => {});

  // Instalar la app (Android/Chrome): solo aparece si el navegador lo ofrece y no está ya instalada.
  const instalarEl = h('section.instalar', { hidden: !puedeInstalar() }, h('h2', conIcono('instalar', 'Instalar la app')),
    h('p', 'Ponla en la pantalla de inicio: abre como una app y funciona sin conexión.'),
    h('button.grande', { type: 'button', onclick: () => instalar() }, 'Instalar la app'));
  alCambiarInstalable((si) => { instalarEl.hidden = !si; });

  // Sonidos y vibración (src/ui/efectos.js): opcionales, apagados por defecto. Encender los sonidos es un gesto del
  // usuario: ahí se crea el AudioContext y suena un tic de muestra. Sin vibración en el aparato, se dice en una línea.
  const probar = h('button.secondary', { type: 'button', hidden: s.sonidos !== true, onclick: () => { desbloquearSonido(); efecto('guardia'); } }, conIcono('campana', 'Escuchar la campana'));
  const efectosEl = h('section.ajuste-efectos', h('h2', conIcono('campana', 'Sonidos y vibración')),
    h('p.muted', 'Opcionales. Acompañan, no avisan: un tic suave al acertar, una campanilla cuando se enciende un faro o subes de rango y dos campanadas al terminar la sesión. Al fallar, nada que suene a castigo. Nunca al navegar, y callan mientras habla el profe.'),
    soportaSonido()
      ? h('label.check', h('input', { type: 'checkbox', id: 'ajuste-sonidos', checked: s.sonidos === true, onchange: (ev) => {
        progress.setSetting('sonidos', ev.target.checked);
        probar.hidden = !ev.target.checked;
        if (ev.target.checked && desbloquearSonido()) efecto('acierto');
      } }), 'Sonidos')
      : h('p.small', 'Este navegador no puede reproducir los sonidos de la app.'),
    soportaVibracion()
      ? h('label.check', h('input', { type: 'checkbox', id: 'ajuste-vibracion', checked: s.vibracion === true, onchange: (ev) => {
        progress.setSetting('vibracion', ev.target.checked);
        if (ev.target.checked) efecto('acierto');
      } }), 'Vibración')
      : h('p.small', 'Vibración: este aparato no deja vibrar desde el navegador (en iPhone no se puede).'),
    h('div.actions', probar));

  const el = h('div.mas',
    h('h1', 'Ajustes'),
    h('section', h('h2', 'Tu estudio'),
      h('h3.ajuste', h('label', { for: 'fecha-examen' }, conIcono('calendario', `Fecha del examen de ${T.sigla}`))),
      fecha,
      h('h3.ajuste', conIcono('reloj', 'Minutos al día')),
      minutos,
      h('h3.ajuste', conIcono('calendario', 'Días que estudias')),
      diasEl,
      avisoPlan,
      h('p', h('a', { href: tlink(tit, ['plan']) }, conIcono('calendario', 'Ver mi plan día a día hasta el examen →'))),
      h('p', h('a', { href: tlink(tit, ['guia']) }, conIcono('brujula', 'Cómo funciona el curso y cómo aprobar →')))),
    h('section', h('h2', 'Tamaño de letra'),
      letraEl),
    h('section', h('h2', 'Titulación'),
      h('div.titulaciones', Object.values(TITULACIONES).map((X) => h('a.btn.grande', { href: tlink(X.id), class: X.id === tit ? '' : 'secondary', 'aria-current': X.id === tit ? 'true' : null },
        `${X.id === tit ? '✓ ' : ''}${X.id === 'per' ? 'PER' : X.nombre}`)))),
    ejeEl,
    voice.supported ? h('section', h('h2', conIcono('profe', 'Voz del profe')),
      h('p.muted', 'Usa las voces de tu navegador o sistema (gratis). En Chrome y en Android suelen estar las de Google; en iPhone/Mac, las de Apple. Si no oyes nada, revisa que haya una voz en español instalada.'),
      h('label.check', h('input', { type: 'checkbox', checked: voice.enabled, onchange: (ev) => voice.setEnabled(ev.target.checked) }), 'Voz activada'),
      h('label.check', h('input', { type: 'checkbox', checked: s.vozAuto === true, onchange: (ev) => progress.setSetting('vozAuto', ev.target.checked) }), 'Leer las tarjetas en voz alta automáticamente'),
      (() => {
        const sel = h('select', { onchange: (ev) => voice.setVoiceName(ev.target.value) }, h('option', 'Cargando voces…'));
        spanishVoices().then((list) => {
          sel.replaceChildren(...(list.length ? list.map((v) => h('option', { value: v.name, selected: v.name === s.vozNombre }, `${v.name} (${v.lang})`)) : [h('option', 'No hay voces en español en este dispositivo')]));
        });
        return h('label.field', h('span.lbl', 'Voz'), sel);
      })(),
      h('label.field', h('span.lbl', 'Velocidad'), h('select', { onchange: (ev) => voice.setRate(Number(ev.target.value)) },
        [[0.85, 'Lenta'], [1, 'Normal'], [1.15, 'Rápida']].map(([v, t]) => h('option', { value: v, selected: voice.rate === v }, t)))),
      h('div.actions', h('button.secondary', { type: 'button', onclick: () => voice.speak('Hola, soy tu profe de navegación. Recuerda: corrección total igual a declinación más desvío. Este suma, oeste resta.') }, conIcono('play', 'Probar la voz'))),
    ) : null,
    efectosEl,
    instalarEl,
    // Configuración del profesor (usarla o quitarla) y el modo profesor.
    seccionConfigAlumno(progress),
    h('section', h('h2', conIcono('descargar', 'Copia de seguridad')),
      h('p', 'Lo que has estudiado se guarda solo en este aparato. Si cambias de móvil o borras los datos del navegador, se pierde. Guarda una copia de vez en cuando.'),
      copiaHecha,
      lineaProteccion(progress),
      h('div.actions',
        h('button', { type: 'button', onclick: () => { guardarCopia(progress); copiaHecha.textContent = `Última copia: ${fechaLarga(Date.now())}.`; } }, 'Guardar una copia'),
        botonRecuperar(progress)),
      h('details.empezar-de-cero', h('summary', 'Empezar de cero'),
        h('p', 'Se borrará todo lo que has estudiado. No se puede deshacer.'),
        h('button.peligro', { type: 'button', onclick: () => { if (confirm('¿Borrar todo lo que has estudiado? No se puede deshacer.')) { progress.reset(); location.hash = '#/'; location.reload(); } } }, 'Borrar todo'))),
  );
  // Desde Hoy, «Poner fecha de examen» o «Cambiar minutos al día» llevan directo a su campo.
  const campo = params?.query?.campo;
  // Se espera a que la pantalla esté puesta (la transición la monta un poco después).
  let intentos = 0;
  const lleva = () => {
    const destino = campo === 'fecha' ? fecha : campo === 'profe' ? el.querySelector('#ajuste-profe') : minutos;
    if (!destino.isConnected) { if (intentos++ < 60) setTimeout(lleva, 30); return; }
    destino.scrollIntoView({ block: 'center' });
    if (campo === 'fecha') { fecha.focus(); try { fecha.showPicker?.(); } catch { /* sin gesto del usuario */ } }
  };
  if (campo) setTimeout(lleva, 30);
  return {
    el,
    summary: () => `VISTA ajustes · titulación activa ${T.sigla} · eje ${currentEje(progress)} · examen ${progress.settings()[`examen_${tit}`] || 'sin fecha'} · ${progress.settings().minutosDia ?? 20} min al día\nRUTAS: #/${tit}/biblioteca · #/progreso`,
  };
}
