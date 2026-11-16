// #/<tit>/oficial[/<convocatoria>] — Tu examen oficial (R-60). Pasas a la app lo que marcaste en la hoja del examen de
// verdad, cuando la convocatoria ya está en el banco, y la app lo corrige con la plantilla oficial: tus fallos, por
// tipo de problema, entran en tu repaso y en «Tus fallos por materia», y el resultado queda apuntado para el examen de
// esa fecha (con el módulo que te queda, si apruebas uno). La lógica, sin DOM, en src/course/examen-oficial.js.
//
// La convocatoria, si estaba reservada para tu examen final, sale de él y entra en tu estudio: ya la has visto. Antes de
// apuntarla solo se enseñan su nombre y su fecha; las preguntas, después, en la corrección (como un examen cualquiera).

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, currentEje, volver } from '../titulacion.js';
import { cargarBanco, esDeCarta, SOLUCIONES } from '../../bancos/index.js';
import { buildReal, convDeClave } from '../../theory/engine.js';
import { corregirHoja } from '../../theory/ensayo.js';
import { hojaRespuestasEl } from '../ensayo.js';
import { claveSemana, leerAjuste, apuntarResultado, responderComoFue } from '../../course/semana.js';
import {
  convocatoriasApuntables, marcarHecha, claveHechas, partesApuntables, estructuraParte, preguntasParte, hojasDe, resultadoDe,
  fallosAgrupados, oficialApuntado, hojaDeEnlace,
} from '../../course/examen-oficial.js';
import { tipoDePregunta, nombreTipo } from '../../course/velocidad.js';
import { modoExamen } from '../modo-examen.js';
import { conIcono } from '../iconos.js';
import { cuenta, diaISO, fechaLarga } from '../../texto.js';
import { anotarFallosDeExamen, seccionCuadernoExamen, textoCuadernoExamen } from '../cuaderno.js';

const deTitEje = (x, tit, eje) => (x?.tit ?? 'per') === tit && x?.eje === eje;

export function oficialView({ ctx, progress, params: route, tit }) {
  const T = TITULACIONES[tit];
  const E = T.estructura;
  let summaryText = `VISTA tu examen oficial ${T.sigla} (cargando)`;
  if (modoExamen()) return { el: h('div', h('h1', 'Tu examen oficial'), h('p', 'No está disponible durante un examen.')), summary: () => 'VISTA tu examen oficial: no disponible durante un examen' };
  const el = h('div.oficial.inicio-examen', h('p.muted', 'Cargando…'));
  const key = route.parts[1] ?? null;

  cargarBanco(currentEje(progress), tit).then((banco) => {
    const eje = banco.eje.id;
    const tests = progress.tests().filter((t) => deTitEje(t, tit, eje));
    const hoy = diaISO();
    const convs = convocatoriasApuntables(banco.convocatoriasTodas(), hoy);
    if (!key) return lista(banco, convs, tests);
    const c = banco.convocatoriasTodas().find((x) => x.key === key);
    if (!c) { setChildren(el, h('h1', 'Tu examen oficial'), h('p.warn', 'Esa convocatoria no está en el banco.'), volver('Volver', tlink(tit, ['oficial']))); summaryText = 'VISTA tu examen oficial: convocatoria desconocida'; return; }
    const conv = convDeClave(c.key);
    const hecho = oficialApuntado(tests, conv);
    if (hecho) return yaApuntado(c, hecho);
    return apuntar(banco, c, conv);
  });

  // --- 1. Las convocatorias que se pueden apuntar
  function lista(banco, convs, tests) {
    summaryText = `VISTA tu examen oficial ${T.sigla}: ${convs.length ? convs.map((c) => `${c.titulo} (${c.fecha})`).join(', ') : 'ninguna convocatoria reciente en el banco'}`;
    setChildren(el,
      volver('Examen', tlink(tit, ['examenes'])),
      h('h1', 'Tu examen oficial'),
      h('p', 'Si ya te has examinado y la plantilla está publicada, pasa aquí lo que marcaste en tu hoja. Patrón lo corrige con la plantilla oficial y tus fallos de ese día pasan a dirigir tu entrenamiento.'),
      convs.length
        ? h('ul.oficial-lista', convs.map((c) => {
          const ap = oficialApuntado(tests, convDeClave(c.key));
          return h('li', h('a.card', { href: tlink(tit, ['oficial', c.key]) },
            h('strong', c.titulo), h('span.muted', ` · ${fechaLarga(c.fecha, { diaSemana: false })}`),
            ap ? h('span.small', ` · apuntado: ${ap.aciertos} de ${ap.total}`) : null));
        }))
        : h('p.muted', `No hay en el banco ninguna convocatoria de los últimos meses. Cuando se publique la plantilla de tu examen y entre en la app, aparecerá aquí.`));
  }

  // --- 2. Ya apuntado: el resumen y adónde ir
  function yaApuntado(c, t) {
    summaryText = `VISTA tu examen oficial ${T.sigla} · ${c.titulo}: ya apuntado (${t.aciertos}/${t.total})`;
    setChildren(el,
      volver('Tu examen oficial', tlink(tit, ['oficial'])),
      h('h1', c.titulo),
      h('p', `Ya lo apuntaste: ${t.aciertos} de ${cuenta(t.total, 'acierto')}.`),
      h('ul.datos-examen', (t.porTema ?? []).map((p) => h('li', `${E.bloques.find((b) => b.ut === p.ut)?.titulo ?? p.ut}: ${cuenta(p.total - p.aciertos, 'fallo')}`))),
      h('div.botones-columna',
        h('a.btn.grande', { href: tlink(tit, ['teoria', 'repaso']) }, 'Repasar mis fallos'),
        h('a.btn.secondary', { href: tlink(tit, ['semana']) }, 'La semana del examen')));
  }

  // --- 3. Apuntar: qué parte, el aviso de la reserva y la hoja
  function apuntar(banco, c, conv) {
    const reservada = !(banco.reserva.hechas ?? []).includes(conv) && (banco.reserva.datos ?? []).concat(banco.reserva.convs ?? []).includes(conv);
    const partes = partesApuntables(E);
    // Con un enlace que trae la hoja (?r=…&p=…), la parte viene dada y la hoja se abre rellena (se revisa antes de corregir).
    let parte = partes.some((p) => p.id === route.query?.p) ? route.query.p : 'completo';
    const traeHoja = !!route.query?.r;
    const elegir = partes.length > 1 ? h('fieldset.res-modulos',
      h('legend', '¿De qué te examinaste?'),
      partes.map((p) => h('label.res-radio', h('input', { type: 'radio', name: 'oficial-parte', value: p.id, checked: p.id === parte, onchange: () => { parte = p.id; } }), ` ${p.titulo}`))) : null;
    const empezar = () => {
      if (reservada) {
        const clave = claveHechas(banco.eje.id, tit);
        progress.setSetting(clave, marcarHecha(progress.settings()[clave], conv));
      }
      // Con la convocatoria fuera de la reserva del alumno, el banco ya la trae entre sus exámenes.
      cargarBanco(banco.eje.id, tit).then((b) => hoja(b, c, conv, parte));
    };
    summaryText = `VISTA tu examen oficial ${T.sigla} · ${c.titulo}: elegir qué apuntar${reservada ? ' (estaba reservada para el examen final)' : ''}`;
    setChildren(el,
      volver('Tu examen oficial', tlink(tit, ['oficial'])),
      h('h1', c.titulo),
      h('p.muted', `Examen del ${fechaLarga(c.fecha, { diaSemana: false })}.`),
      elegir,
      reservada ? h('p.aviso-final', 'Esta convocatoria estaba guardada para tu examen final. Como ya la has hecho, sale de él y entra en tu estudio; tu examen final será otra que no hayas visto.') : null,
      traeHoja ? h('p.small', 'Tu hoja viene ya rellena en el enlace: revísala en la pantalla siguiente antes de corregir.')
        : h('p.small', 'Necesitas lo que marcaste en tu hoja. Si lo apuntaste en el cuadernillo, mejor: ten a mano los dos.'),
      h('div.botones-columna', h('button.grande', { type: 'button', onclick: empezar }, 'Pasar mi hoja')));
  }

  function hoja(banco, c, conv, parte) {
    const Ep = estructuraParte(E, parte);
    const todas = buildReal(banco.examenes, c.key).preguntas;
    const preguntas = preguntasParte(todas, E, parte);
    if (!preguntas.length) { setChildren(el, h('p.warn', 'No se han encontrado las preguntas de esta convocatoria.')); return; }
    const test = { tipo: 'real', titulo: c.titulo, preguntas, faltan: [] };
    // Una hoja por módulo, numerada desde 1, como las del examen; se juntan en una con la posición de cada pregunta.
    const marcas = { ...(hojaDeEnlace(route.query?.r, preguntas.length) ?? {}) };
    const hojas = hojasDe(preguntas, E).map((x) => {
      const inicial = Object.fromEntries(x.preguntas.map((_, k) => [k + 1, marcas[x.desde + k + 1] ?? null]).filter(([, l]) => l));
      const hr = hojaRespuestasEl({ preguntas: x.preguntas, hoja: inicial, onCambio: (st) => { for (let i = 1; i <= x.preguntas.length; i++) marcas[x.desde + i] = st[i] ?? null; } });
      return h('section.oficial-hoja', x.titulo ? h('h2', x.titulo) : null, hr.el);
    });
    summaryText = `VISTA tu examen oficial ${T.sigla} · ${c.titulo}: pasando la hoja (${cuenta(preguntas.length, 'pregunta')}; sin corregir todavía)`;
    setChildren(el,
      h('h1', `Tu hoja · ${c.titulo}`),
      h('p.muted.small', 'Toca la letra que marcaste en cada pregunta; tócala otra vez para borrarla. Las que dejaste en blanco, déjalas sin marcar.'),
      hojas,
      h('div.botones-columna', h('button.grande', { type: 'button', onclick: () => {
        const n = Object.values(marcas).filter(Boolean).length;
        if (n < preguntas.length && !confirm(`Has marcado ${n} de ${preguntas.length}. Las demás contarán como en blanco. ¿Corregir así?`)) return;
        corregir(test, Ep, conv, c, parte, marcas);
      } }, conIcono('ok', 'Corregir con la plantilla'))));
    window.scrollTo(0, 0);
  }

  // --- 4. Corregir y guardar
  function corregir(test, Ep, conv, c, parte, marcas) {
    const g = corregirHoja(Ep, test, marcas);
    const eje = currentEje(progress);
    for (const d of g.detalle) if (d.respuesta && !d.retirada) progress.recordExam(d.id, { choice: d.respuesta, ok: d.ok });
    const modulo = parte !== 'completo' ? parte : null;
    progress.recordTest({ tit, eje, conv, tipo: 'real', oficial: true, titulo: `${test.titulo} (examen oficial)`, aciertos: g.aciertos, total: g.total,
      ...(modulo ? { modulo, apto: null, aptoModulo: g.apto } : { apto: g.apto }),
      porTema: g.bloques.map((b) => ({ ut: b.ut, aciertos: b.aciertos, total: b.total })) });
    // El resultado por materia, apuntado para el examen de esa fecha (y «¿Cómo te fue?», si no lo habías contestado).
    const clave = claveSemana(tit);
    let a = leerAjuste(progress.settings()[clave]);
    const r = resultadoDe(E, g);
    const previo = a.resultados[c.fecha]?.fallos ?? {};
    a = apuntarResultado(a, c.fecha, { fallos: { ...previo, ...r.fallos }, modulo: r.modulo ?? a.resultados[c.fecha]?.modulo ?? null });
    if (!a.fue[c.fecha] && g.apto != null && !modulo) a = responderComoFue(a, c.fecha, g.apto ? 'aprobado' : 'suspenso');
    progress.setSetting(clave, a);
    // Cuaderno de fallos (R-55): los fallos con nombre de tu examen de verdad (opción falsa con un error reconocido).
    const anotados = anotarFallosDeExamen({ preguntas: test.preguntas, detalle: g.detalle, chart: ctx?.chart ?? null, origen: 'oficial' });
    resultado(test, g, Ep, c, r, anotados);
  }

  function resultado(test, g, Ep, c, r, anotados = []) {
    const hojas = hojasDe(test.preguntas, E);
    const numeroDe = (i) => {
      const x = hojas.findLast((y) => i >= y.desde) ?? hojas[0];
      const m = x.titulo ? x.titulo.replace(/^Módulo (de )?/, '') : '';
      return `${m ? `${m[0].toUpperCase()}${m.slice(1)}, pregunta` : 'Pregunta'} ${i - x.desde + 1}`;
    };
    const grupos = fallosAgrupados(test.preguntas, g.detalle, {
      tipoDe: (q) => tipoDePregunta(q, SOLUCIONES[q.id], { cartaUt: T.cartaUt, deCarta: esDeCarta(q) }),
      nombreTipo, materiaDe: (q) => Ep.bloques.find((b) => b.ut === q.ut)?.titulo ?? '', numeroDe,
    });
    const nf = g.total - g.aciertos;
    const moduloTx = r.modulo && r.modulo !== 'ninguno' ? E.modulos?.find((m) => m.id === r.modulo)?.titulo : null;
    summaryText = `RESULTADO examen oficial ${c.titulo}: ${g.aciertos}/${g.total} ${g.apto == null ? '' : g.apto ? 'APTO' : 'NO APTO'}\n` +
      g.bloques.map((b) => `${b.titulo}: ${b.aciertos}/${b.total}${b.maxErrores != null ? ` (máx. errores ${b.maxErrores})` : ''}`).join('\n') +
      `\nFALLOS POR TIPO: ${grupos.map((x) => `${x.titulo} ${x.fallos.length}`).join(', ')}` + textoCuadernoExamen(anotados);
    setChildren(el,
      h('h1', 'Tu examen, corregido con la plantilla oficial'),
      h('p', `${c.titulo}: ${g.aciertos} de ${cuenta(g.total, 'acierto')}${g.apto == null ? '' : g.apto ? '. Apto.' : '. No apto.'}${moduloTx ? ` Apruebas el ${moduloTx.replace(/^Módulo/, 'módulo')}.` : ''}`),
      h('div.fxm-tabla-caja', h('table.fxm-tabla',
        h('thead', h('tr', h('th', { scope: 'col' }, 'Materia'), h('th', { scope: 'col' }, 'Fallos'), h('th', { scope: 'col' }, h('abbr', { title: 'Límite de fallos' }, 'Máx.')))),
        h('tbody', g.bloques.map((b) => h('tr', h('th', { scope: 'row' }, b.titulo), h('td.fxm-num', String(b.total - b.aciertos)), h('td.fxm-num', b.maxErrores != null ? String(b.maxErrores) : '—')))))),
      nf ? [
        h('h2', 'Tus fallos, por tipo de problema'),
        h('ul.oficial-fallos', grupos.map((x) => h('li',
          h('strong', `${x.titulo}: ${cuenta(x.fallos.length, 'fallo')}`),
          h('ul', x.fallos.map((f) => h('li', h('a', { href: `#/q/${f.id}${x.carta ? '?guiado=1' : ''}` }, f.numero),
            ` · marcaste ${f.marcada ?? 'en blanco'}, era la ${f.correcta ?? '—'}${x.carta ? ' · resolverla paso a paso' : ''}`)))))),
        h('h2', 'Qué hace ahora Patrón con esto'),
        h('ul',
          h('li', `Tus ${cuenta(nf, 'fallo')} entran en tu repaso de fallos, espaciado en los próximos días.`),
          h('li', 'Este examen cuenta en «Tus fallos por materia» y el resultado queda apuntado en «La semana del examen».'),
          anotados.length ? h('li', `Los fallos con nombre van a tu cuaderno de fallos: ${anotados.map((x) => `«${x.nombre.titulo}»`).join(', ')}.`) : null,
          moduloTx ? h('li', `«¿Estás listo?» y la semana del examen miran ahora solo el módulo que te queda.`) : null),
        seccionCuadernoExamen(tit, anotados),
      ] : h('p', 'Sin fallos. Enhorabuena.'),
      h('div.botones-columna',
        nf ? h('a.btn.grande', { href: tlink(tit, ['teoria', 'repaso']) }, 'Repasar mis fallos ahora') : null,
        h('a.btn.secondary', { href: tlink(tit) }, 'Ir a Hoy')));
    window.scrollTo(0, 0);
  }

  return { el, summary: () => summaryText };
}
