// «Compartir mi parte»: el alumno manda a quien quiera (un familiar, su grupo) cómo va su travesía. Con el menú de
// compartir del móvil (`navigator.share`) o, si no lo hay, copiando el texto (`navigator.clipboard`) con un aviso
// breve «Copiado». Sin ninguna de las dos, el botón no aparece.
// El texto es breve, en español sencillo y sin nada personal: ni nombre, ni código de alumno, ni el enlace de
// vinculación de la copia; solo rango, faros, racha, minutos de hoy y la dirección pública de la app. Sin emojis.
// Funciones puras (texto, vía, envío) con el navegador inyectado + el botón. Tests: tests/compartir.test.js.
// Documentado en docs/ENTRADA.md («Pantalla encendida y compartir el parte»).

import { h } from './dom.js';
import { conIcono } from './iconos.js';
import { avisoBreve } from './actividad.js';
import { cuenta } from '../texto.js';

/** La dirección pública de la app (la misma para todos: no identifica a nadie). */
export const URL_APP = 'https://antoniofcano.github.io/mis-cosas/nautica/';

/**
 * El texto que se comparte.
 * @param {{ titulacion?: string, rango?: string, faros?: { encendidos: number, total: number } | null, racha?: number,
 *   minutosHoy?: number }} o  titulacion = el nombre de la titulación («Patrón de Embarcaciones de Recreo»)
 * @returns {{ titulo: string, texto: string, url: string, completo: string }}  `texto` sin la dirección (el menú de
 *   compartir la lleva aparte, en `url`); `completo` = texto y dirección, para copiar.
 */
export function textoParte({ titulacion = '', rango = '', faros = null, racha = 0, minutosHoy = 0 } = {}) {
  const frases = [];
  const de = titulacion ? ` de ${titulacion}` : '';
  frases.push(`Preparo el teórico${de}.`);
  const partes = [];
  if (rango) partes.push(`soy ${rango}`);
  if (faros && faros.total > 0) {
    const n = Math.max(0, Math.min(faros.total, Math.round(faros.encendidos) || 0));
    partes.push(n === 0 ? `tengo ${cuenta(faros.total, 'faro')} por encender` : `tengo ${n} de ${cuenta(faros.total, 'faro')} ${n === 1 ? 'encendido' : 'encendidos'}`);
  }
  if (partes.length) frases.push(`En mi travesía ${partes.join(' y ')}.`);
  const r = Math.max(0, Math.round(racha) || 0);
  const m = Math.max(0, Math.round(minutosHoy) || 0);
  if (r >= 2 && m > 0) frases.push(`Llevo ${cuenta(r, 'día seguido', 'días seguidos')} estudiando y hoy he estudiado ${cuenta(m, 'minuto')}.`);
  else if (r >= 2) frases.push(`Llevo ${cuenta(r, 'día seguido', 'días seguidos')} estudiando.`);
  else if (m > 0) frases.push(`Hoy he estudiado ${cuenta(m, 'minuto')}.`);
  frases.push('Estudio con esta app:');
  const texto = frases.join(' ');
  return { titulo: 'Mi parte de travesía', texto, url: URL_APP, completo: `${texto} ${URL_APP}` };
}

/** ¿Cómo se puede compartir aquí? 'share' (menú del sistema), 'copiar' (portapapeles) o null (no se puede). */
export function viaCompartir(nav = globalThis.navigator) {
  if (typeof nav?.share === 'function') return 'share';
  if (typeof nav?.clipboard?.writeText === 'function') return 'copiar';
  return null;
}

const esCancelacion = (e) => e?.name === 'AbortError';

async function copiar(nav, completo) {
  try { await nav.clipboard.writeText(completo); return 'copiado'; } catch { return 'error'; }
}

/**
 * Comparte el parte. Devuelve 'compartido', 'copiado', 'cancelado' (el alumno cerró el menú: no es un error) o
 * 'error' (no se pudo; nunca lanza).
 * @param {{ titulo: string, texto: string, url: string, completo: string }} datos  lo que da textoParte()
 */
export async function compartirParte(datos, nav = globalThis.navigator) {
  const via = viaCompartir(nav);
  if (via === 'share') {
    try {
      await nav.share({ title: datos.titulo, text: datos.texto, url: datos.url });
      return 'compartido';
    } catch (e) {
      if (esCancelacion(e)) return 'cancelado';
      // Otro fallo (p. ej. el navegador no deja compartir ahora): si se puede, se copia.
      return typeof nav?.clipboard?.writeText === 'function' ? copiar(nav, datos.completo) : 'error';
    }
  }
  if (via === 'copiar') return copiar(nav, datos.completo);
  return 'error';
}

/**
 * El botón «Compartir mi parte», o null si el aparato no puede compartir ni copiar.
 * @param {() => Parameters<typeof textoParte>[0]} datos  se lee al pulsar (lo de ese momento)
 * @param {{ nav?: object, avisar?: (texto: string) => void, clase?: string }} o
 */
export function botonCompartir(datos, { nav = globalThis.navigator, avisar = avisoBreve, clase = '' } = {}) {
  if (!viaCompartir(nav)) return null;
  const b = h('button.boton-compartir', { type: 'button', class: clase }, conIcono('compartir', 'Compartir mi parte'));
  b.addEventListener('click', async () => {
    if (b.dataset.ocupado) return;
    b.dataset.ocupado = '1';
    try {
      const r = await compartirParte(textoParte(datos()), nav);
      if (r === 'copiado') avisar('Copiado');
    } finally { delete b.dataset.ocupado; }
  });
  return b;
}
