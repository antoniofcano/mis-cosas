// #/vincular/<código> — Unir este aparato al progreso de un código (el enlace del QR de Ajustes → «Mis dispositivos»).
// Una frase y dos botones: «Sí, unir» o «Ahora no». Lo que hubiera estudiado en este aparato se suma, sin preguntar más.

import { h, setChildren } from '../dom.js';
import { conIcono } from '../iconos.js';
import { validarCodigo, formatearCodigo } from '../../store/sync/codigo.js';
import { motorSync } from '../sync.js';

export function vincularView({ params }) {
  const texto = params.parts.slice(1).join('');
  const v = validarCodigo(texto);
  const motor = motorSync();
  const titulo = h('h1', { tabindex: '-1' }, 'Unir este aparato');
  const cuerpo = h('div.vincular-cuerpo', { 'aria-live': 'polite' });
  const el = h('div.vincular', titulo, cuerpo);
  const foco = (x) => setTimeout(() => x?.focus?.(), 60);
  let resumen = '';

  if (!v.ok || !motor) {
    resumen = !motor ? 'sin sincronización en este navegador' : `código no válido (${v.motivo})`;
    setChildren(cuerpo,
      h('p', !motor ? 'En este navegador no se puede unir el aparato (por ejemplo, en una ventana privada).' : 'Este enlace no trae un código válido. Escribe el código a mano en Ajustes, «Mis dispositivos».'),
      h('div.actions', h('a.btn.grande', { href: '#/ajustes' }, 'Ir a Ajustes'), h('a.btn.grande.secondary', { href: '#/' }, 'Ir a Hoy')));
  } else if (motor.estado().codigo === v.codigo) {
    resumen = 'ya unido';
    setChildren(cuerpo, h('p', 'Este aparato ya comparte ese progreso. No hay que hacer nada más.'), h('div.actions', h('a.btn.grande', { href: '#/' }, 'Ir a Hoy')));
  } else {
    resumen = 'pregunta';
    const si = h('button.grande', { type: 'button', onclick: async () => {
      si.disabled = true;
      si.textContent = 'Uniendo…';
      const r = await motor.vincular(v.codigo);
      if (r.ok) {
        resumen = 'unido';
        const ir = h('a.btn.grande', { href: '#/' }, 'Ir a Hoy');
        setChildren(cuerpo, h('h2', { tabindex: '-1' }, conIcono('ok', 'Listo')), h('p', 'Este aparato ya comparte tu progreso. Lo que habías estudiado aquí se ha sumado.'), h('div.actions', ir));
        foco(ir);
      } else {
        resumen = `error ${r.motivo}`;
        si.disabled = false;
        si.textContent = 'Probar otra vez';
        setChildren(aviso, r.texto);
        aviso.hidden = false;
        foco(si);
      }
    } }, 'Sí, unir');
    const aviso = h('p.aviso', { hidden: true, role: 'alert' });
    setChildren(cuerpo,
      h('p', `¿Usar en este aparato el progreso del código ${formatearCodigo(v.codigo)}? Lo que hayas estudiado aquí se sumará.`),
      aviso,
      h('div.actions', si, h('a.btn.grande.secondary', { href: '#/' }, 'Ahora no')));
  }
  foco(titulo);
  return { el, summary: () => `VISTA vincular · ${resumen}` };
}
