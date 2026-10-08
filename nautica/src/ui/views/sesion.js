// #/<tit>/sesion — el ejecutor de la sesión de estudio. Mientras quedan pasos, app.js reenvía al paso actual (cada uno
// es la vista de siempre: clase, repaso de fallos, mezclado, simulacro) antes de llegar aquí; esta vista solo se ve al
// terminar: el resumen (lo trabajado, los aciertos y qué toca mañana) y la vuelta a Hoy.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, currentEje } from '../titulacion.js';
import { cargarBanco } from '../../bancos/index.js';
import { bloque } from '../../theory/blocks.js';
import { calcularPlan } from '../cierre.js';
import { deducirFase, componerSesion, lineaManana, resumenSesion } from '../../course/sesion.js';
import { itemsRepaso, diaLocal } from '../../course/repaso.js';
import { leerSesion } from '../sesion.js';
import { conceptosDelBanco, hrefFicha } from '../concepto.js';
import { cuenta } from '../../texto.js';
import { calcularTravesia } from '../travesia.js';
import { parteSesion, paraManana, progresoRango, catalogoInsignias } from '../../course/travesia.js';
import { parteTravesiaEl } from './travesia.js';

const MAX_GRUPOS = 10; // en un simulacro salen muchas ideas: las que fallan siempre; de las sabidas, hasta completar

/** Detalle de un grupo del resumen: por concepto, si lo sabe y cuándo vuelve (como en la maqueta); por tema, como siempre. */
export function detalleGrupo(g) {
  if (!g.concepto) return g.sabido ? `${g.bien} de ${g.total} bien` : `${g.bien} de ${g.total} bien · las falladas vuelven mañana con su repaso`;
  if (!g.sabido) return 'A repasar: vuelve mañana con otra pregunta';
  if (g.vuelve) return `Lo sabes: vuelve ${g.vuelve === 1 ? 'mañana' : `dentro de ${cuenta(g.vuelve, 'día')}`} con otra pregunta`;
  return g.total > 1 ? `Lo sabes: ${g.bien} de ${g.total} bien` : 'Lo sabes';
}

const DIA = 864e5;

/** Marca de «hecho» (círculo verde con el visto), como en los cierres. */
function marcaHecho() {
  const d = document.createElement('div');
  d.className = 'fin-tick';
  d.setAttribute('aria-hidden', 'true');
  d.innerHTML = '<svg width="52" height="52" viewBox="0 0 52 52"><path d="M13 27l9 9 17-19"/></svg>';
  return d;
}

/**
 * Pinta el parte de travesía en `parteHueco` y guarda lo ganado (rango máximo, insignias). Devuelve su texto para el
 * resumen del agente ('' si no hay parte: banco sin etiquetas o una sesión empezada antes de la travesía).
 */
function pintaParte({ s, ic, banco, progress, tit, prox, hoy, parteHueco }) {
  if (!ic || !s.foto) return '';
  const eje = banco.eje.id;
  const ahora = Date.now();
  const est = calcularTravesia(progress, eje, tit, ic, { ahora });
  if (!est) return '';
  // Las ideas que han salido en la sesión: solo de preguntas del estudio, respondidas desde que empezó.
  const estudio = new Set(banco.estudio.map((q) => q.id));
  const desde = new Date(s.inicio).toISOString();
  const hasta = s.fin ? new Date(s.fin + 1000).toISOString() : null;
  const tocadas = new Set();
  for (const [id, r] of Object.entries(progress.get().exams)) if (estudio.has(id) && r?.t && r.t >= desde && (!hasta || r.t <= hasta)) ic.conceptosDe(id).forEach((c) => tocadas.add(c));
  const guardado = progress.travesia(eje, tit);
  const parte = parteSesion({ foto: s.foto, est, guardado, tocadas, ahora });
  if (!parte) return '';
  if (parte.ganadas.length || parte.reg.rango !== guardado.rango) progress.guardarTravesia(eje, tit, parte.reg);
  const vuelve = new Map([...prox].map(([c, p]) => [c, Math.max(1, Math.round((Date.parse(`${p}T12:00`) - Date.parse(`${hoy}T12:00`)) / DIA))]));
  const manana = paraManana({ flojas: parte.flojas, trabajadas: est.ideas.filter((i) => tocadas.has(i.id)), vuelve });
  const sig = progresoRango(est, parte.reg.rango);
  setChildren(parteHueco, parteTravesiaEl({ tit, parte, manana, sig, catalogo: catalogoInsignias(est.faros) }));
  return ` · TRAVESÍA: ${parte.nuevas.length} ideas nuevas, ${parte.rescatadas.length} rescatadas, ${parte.flojas.length} siguen flojas${parte.faros.length ? `, faro encendido: ${parte.faros.map((f) => f.nombre).join(', ')}` : ''}${parte.insignias.length ? `, insignias nuevas: ${parte.insignias.join(', ')}` : ''}. ${sig.texto}`;
}

export function sesionView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const s = leerSesion(progress, tit);
  const el = h('div.resumen-sesion');
  let summaryText = `VISTA resumen de la sesión ${T.sigla}`;
  if (!s) {
    setChildren(el, h('h1', 'No hay ninguna sesión hoy'), h('a.btn.grande', { href: tlink(tit) }, 'Ir a Hoy'));
    return { el, summary: () => `${summaryText}: no hay sesión` };
  }
  const linea = h('p.resumen-linea', '…');
  const trabajado = h('ul.trabajado');
  const parteHueco = h('div.parte-hueco'); // el parte de travesía (solo con etiquetas de conceptos y la foto del principio)
  const manana = h('p.manana-texto', 'Calculando…');
  setChildren(el,
    marcaHecho(),
    h('h1', 'Sesión hecha'),
    linea,
    parteHueco,
    h('section.caja-trabajado', h('h2.eti', 'Lo que has trabajado'), trabajado),
    h('section.caja-manana', h('h2.eti', 'Mañana'), manana),
    h('a.btn.grande', { href: tlink(tit) }, 'Volver a Hoy'));

  const pasos = s.pasos.map((p) => h('li', { class: p.estado === 'hecho' ? 'ok' : 'neutro' },
    h('span.punto', { 'aria-hidden': 'true' }),
    h('span.tx', h('strong', p.titulo), h('span.muted.small', p.estado === 'hecho' ? p.sub : `Saltado · ${p.sub}`))));
  setChildren(trabajado, pasos);

  const eje = currentEje(progress);
  Promise.all([cargarBanco(eje, tit), conceptosDelBanco(eje, tit)]).then(([banco, ic]) => {
    // Con conceptos, lo trabajado va por idea (y cuándo vuelve cada una al repaso); sin ellos, por tema.
    const hoy = diaLocal();
    const prox = new Map(ic ? itemsRepaso(banco.estudio, progress.get().exams, hoy, { principalDe: ic.principalDe, estado: progress.repasoConceptos(banco.eje.id, tit) })
      .filter((x) => x.concepto).map((x) => [x.concepto, x.rep.prox]) : []);
    const r = resumenSesion(s, { respuestas: progress.get().exams, porId: banco.porId, temaDe: (ut) => bloque(T.estructura, ut)?.titulo ?? `Tema ${ut}`, minutosHoy: progress.minutosHoy(),
      ...(ic ? { conceptoDe: ic.principalDe, etiquetaDe: (c) => ic.concepto(c)?.etiqueta ?? c, proxDe: (c) => prox.get(c) ?? null, hoy } : {}) });
    const tiempo = r.minutos ? `, en ${cuenta(r.minutos, 'minuto')}` : '';
    linea.textContent = r.total ? `${r.aciertos} de ${cuenta(r.total, 'pregunta')} bien${tiempo}.` : `${r.hechos} de ${cuenta(r.pasos, 'paso')} hechos${tiempo}.`;
    if (r.grupos.length) {
      const flojos = r.grupos.filter((g) => !g.sabido);
      const vistos = [...flojos, ...r.grupos.filter((g) => g.sabido).slice(0, Math.max(0, MAX_GRUPOS - flojos.length))];
      const resto = r.grupos.filter((g) => !vistos.includes(g));
      setChildren(trabajado, vistos.map((g) => h('li', { class: g.sabido ? 'ok' : 'mal' }, h('span.punto', { 'aria-hidden': 'true' }),
        h('span.tx', h('strong', g.nombre), h('span.muted.small', detalleGrupo(g)),
          // Una idea en rojo: su ficha (la sesión ya ha terminado; nunca dentro de un examen).
          g.concepto && !g.sabido ? h('a.enlace-ficha.small', { href: hrefFicha(tit, g.concepto, 'sesion') }, 'Ver la ficha de la idea') : null))),
      resto.length ? h('li.mas-ideas', h('span.muted.small', `Y ${cuenta(resto.length, ic ? 'idea más, también bien' : 'tema más, también bien', ic ? 'ideas más, todas bien' : 'temas más, todos bien')}.`)) : null,
      h('li.pasos-hechos', h('span.muted.small', `Pasos: ${r.hechos} de ${r.pasos} hechos${r.saltados ? ` (${r.saltados} saltado${r.saltados > 1 ? 's' : ''})` : ''}.`)));
    }
    // Parte de travesía: lo que cambió entre la foto del principio y ahora (ideas nuevas, rescatadas, faros, insignias).
    const textoParte = pintaParte({ s, ic, banco, progress, tit, prox, hoy, parteHueco });
    summaryText = `VISTA resumen de la sesión ${T.sigla}: ${linea.textContent}${textoParte} · ${r.grupos.map((g) => `${g.nombre} ${g.bien}/${g.total}${g.concepto ? ` (${detalleGrupo(g)})` : ''}`).join(', ')}`;
  }).catch(() => { linea.textContent = `${s.pasos.filter((p) => p.estado === 'hecho').length} de ${cuenta(s.pasos.length, 'paso')} hechos.`; });

  // Mañana: la sesión que tocaría mañana con lo hecho hasta ahora (sin guardar nada del plan).
  const hoy = calcularPlan(progress, tit);
  const man = calcularPlan(progress, tit, Date.now() + DIA, { guardar: false });
  Promise.all([hoy, man]).then(([dh, dm]) => {
    const st = dm.st;
    manana.textContent = lineaManana(componerSesion(st, deducirFase(st).id), { fallosManana: dh.st.repaso.manana });
    summaryText += `\nMAÑANA: ${manana.textContent}`;
  }).catch(() => { manana.textContent = 'Lo que proponga tu plan.'; });

  return { el, summary: () => summaryText };
}
