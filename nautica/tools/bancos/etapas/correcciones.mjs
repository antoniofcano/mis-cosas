// Etapa 4 · correcciones
// Entrada: repetidas-<tit>.json y tools/bancos/ejes/<eje>/correcciones.json (a mano, cada entrada con su fuente).
// Salida: correcciones-<tit>.json → preguntas con correcta / aceptadas / anulada y notas, más conflictos y avisos.
// 1. Respuesta según la fuente de cada aparición (plantilla, hoja óptica, respuesta en línea, subrayado):
//    - una letra → esa; varias letras → se aceptan todas; las cuatro → anulada;
//    - hoja óptica sin marca → anulada (el tribunal deja en blanco las anuladas), con aviso si ninguna corrección
//      publicada lo confirma.
// 2. Correcciones publicadas (correcciones.json), por convocatoria + modelo + número tal como se imprimió:
//    anular | respuesta (sustituye) | aceptar (varias válidas) | errata (texto). Se propagan a todas las apariciones
//    de la misma pregunta (la letra se traduce por el texto de la opción si el modelo baraja las opciones).
// 3. Si dos apariciones de la misma pregunta dan respuestas distintas y ninguna corrección lo resuelve: conflicto
//    (al informe); se toma la de la primera aparición.
import { join } from 'node:path';
import { dirEje, escribirJSON, leerJSON, rutaEtapa } from '../lib/comun.mjs';

const igualModelo = (a, b) => String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();

/** Respuesta oficial de una aparición según su fuente → { anulada, aceptadas, dudosa?, motivo? } */
export function respuestaFuente(r) {
  const letras = [...new Set((r.letras ?? []).filter((l) => /^[a-d]$/.test(l)))].sort();
  if (r.estado === 'anulada') return { anulada: true, aceptadas: [], motivo: 'anulada en la fuente' };
  if (letras.length === 4) return { anulada: true, aceptadas: [], motivo: 'todas las respuestas válidas' };
  if (!letras.length) {
    if (r.estado === 'vacia') return { anulada: true, aceptadas: [], motivo: 'plantilla sin marca', dudosa: true };
    return { anulada: false, aceptadas: [], motivo: 'sin respuesta', dudosa: true };
  }
  return { anulada: false, aceptadas: letras, dudosa: r.estado === 'dudosa' || (r.letras ?? []).some((l) => l.startsWith('?')) };
}

const igualResp = (x, y) => x.anulada === y.anulada && x.aceptadas.join() === y.aceptadas.join();
const textoResp = (x) => (x.anulada ? 'anulada' : x.aceptadas.join('+') || '—');

export function aplicar(preguntas, correcciones, { convsPresentes } = {}) {
  const usadas = new Set();
  const conflictos = [];
  const dudas = [];
  for (const p of preguntas) {
    const porAparicion = p.apareceEn.map((a) => ({ a, r: respuestaFuente(a.respuesta) }));
    let final = porAparicion[0].r;
    const distintas = porAparicion.filter((x) => !igualResp(x.r, final));
    const notas = [];
    // Correcciones de cualquiera de sus apariciones, en orden de fecha.
    const propias = [];
    correcciones.forEach((c, i) => {
      const a = p.apareceEn.find((x) => x.conv === c.conv && igualModelo(x.modelo, c.modelo) && x.numero === c.numero);
      if (a) { propias.push({ c, a }); usadas.add(i); }
    });
    propias.sort((x, y) => String(x.c.fecha ?? '').localeCompare(String(y.c.fecha ?? '')));
    for (const { c, a } of propias) {
      const traducir = (ls) => ls.map((l) => a.mapa?.[l] ?? l).sort();
      if (c.accion === 'anular') final = { anulada: true, aceptadas: [], motivo: 'corrección' };
      else if (c.accion === 'respuesta') final = { anulada: false, aceptadas: traducir(c.letras) };
      else if (c.accion === 'aceptar') final = { anulada: false, aceptadas: [...new Set([...traducir(c.letras)])].sort() };
      else if (c.accion === 'errata') {
        const campo = c.campo === 'enunciado' ? 'enunciado' : null;
        if (campo) p.enunciado = p.enunciado.replace(c.buscar, c.reemplazar);
        else if (c.campo?.startsWith('opcion-')) {
          const l = a.mapa?.[c.campo.slice(7)] ?? c.campo.slice(7);
          p.opciones[l] = p.opciones[l].replace(c.buscar, c.reemplazar);
        }
      }
      notas.push(`${c.texto} [${c.fuente}]`);
      p.fuentes = { ...p.fuentes, correccion: p.fuentes?.correccion ?? c.fuente };
    }
    if (!propias.some(({ c }) => c.accion !== 'errata')) {
      if (distintas.length) {
        conflictos.push({
          id: p.id, enunciado: p.enunciado.slice(0, 140),
          respuestas: porAparicion.map((x) => `${x.a.conv}/${x.a.modelo ?? '-'}/${x.a.numero}: ${textoResp(x.r)}`),
        });
        notas.push(`Respuestas distintas según la aparición (${porAparicion.map((x) => `${x.a.conv} ${x.a.modelo ?? ''} ${x.a.numero}: ${textoResp(x.r)}`.replace(/\s+/g, ' ')).join('; ')}); se toma la de la primera.`);
      }
      if (final.dudosa) dudas.push({ id: p.id, motivo: final.motivo ?? 'lectura dudosa', detalle: porAparicion.map((x) => `${x.a.conv}/${x.a.modelo ?? '-'}/${x.a.numero}: ${x.a.respuesta.estado} ${JSON.stringify(x.a.respuesta.puntos ?? x.a.respuesta.letrasOriginales ?? [])}`) });
    }
    for (const x of porAparicion) if (x.a.notaTribunal) notas.push(`Nota del tribunal (${x.a.conv} ${x.a.modelo ?? ''} ${x.a.numero}): ${x.a.notaTribunal}`.replace(/\s+/g, ' '));
    p.anulada = final.anulada;
    p.aceptadas = final.anulada ? [] : final.aceptadas;
    p.correcta = final.anulada ? null : (final.aceptadas[0] ?? null);
    p.notasCorreccion = notas;
  }
  const sinAplicar = correcciones
    .map((c, i) => ({ c, i }))
    .filter(({ c, i }) => !usadas.has(i) && (!convsPresentes || convsPresentes.has(c.conv)))
    .map(({ c }) => c);
  return { conflictos, dudas, sinAplicar };
}

export async function correcciones(ctx) {
  const out = {};
  const corr = leerJSON(join(dirEje(ctx.eje), 'correcciones.json'), { correcciones: [] }).correcciones;
  for (const tit of ctx.tits) {
    const d = leerJSON(rutaEtapa(ctx.eje, 'repetidas', tit));
    const convsPresentes = new Set(d.preguntas.flatMap((p) => p.apareceEn.map((a) => a.conv)));
    const r = aplicar(d.preguntas, corr.filter((c) => !c.tit || c.tit === tit), { convsPresentes });
    for (const c of r.sinAplicar) ctx.avisos.add('correcciones', `corrección sin pregunta: ${c.conv} ${c.modelo ?? ''} ${c.numero} (${c.accion})`);
    escribirJSON(rutaEtapa(ctx.eje, 'correcciones', tit), { ...d, conflictos: r.conflictos, dudas: r.dudas, sinAplicar: r.sinAplicar });
    out[tit] = { anuladas: d.preguntas.filter((p) => p.anulada).length, multiples: d.preguntas.filter((p) => p.aceptadas.length > 1).length, conflictos: r.conflictos.length, dudas: r.dudas.length, sinAplicar: r.sinAplicar.length };
  }
  return out;
}
