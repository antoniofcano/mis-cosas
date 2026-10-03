// «Avisar de un error»: abre una incidencia en GitHub con el sitio exacto ya escrito (la clase y la tarjeta, la
// pregunta…), para que quien lo arregle sepa dónde mirar. No envía nada por su cuenta: abre la página de GitHub.

import { h } from './dom.js';

export const REPO_ISSUES = 'https://github.com/antoniofcano/mis-cosas/issues/new';

/** URL de la incidencia con título y texto. `donde`: qué es (p. ej. «Clase per-1-1, tarjeta 3 de 12»). */
export function urlAviso(donde, extra = '') {
  const cuerpo = [
    `**Dónde:** ${donde}`,
    `**Enlace:** ${location.href}`,
    extra ? `**Detalle:** ${extra}` : null,
    '',
    '**¿Qué está mal?** (escríbelo aquí)',
    '',
  ].filter((x) => x != null).join('\n');
  return `${REPO_ISSUES}?${new URLSearchParams({ title: `Error en la app: ${donde}`, body: cuerpo })}`;
}

/** Enlace pequeño «⚠️ Avisar de un error». */
export function avisoError(donde, extra = '') {
  return h('a.aviso-error', { href: urlAviso(donde, extra), target: '_blank', rel: 'noopener' }, '⚠️ Avisar de un error');
}
