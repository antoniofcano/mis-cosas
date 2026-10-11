// Ajustes → «Mis dispositivos» (docs/SYNC.md): el código del alumno (grande, para apuntarlo), el QR con el enlace para
// abrirlo en otro móvil, un campo para escribir el código de otro aparato y una línea de estado discreta con
// «Copiar diagnóstico». Nada de esto hace falta para que la sincronización funcione: va sola.

import { h, setChildren, copyText } from './dom.js';
import { conIcono } from './iconos.js';
import { motorSync, estadoSync, codigoAlumno, lineaEstado, textoDiagnostico, versionApp, alCambiarSync } from './sync.js';
import { svgQR, enlaceVincular } from './qr.js';

export function seccionDispositivos() {
  const motor = motorSync();
  if (!motor) {
    return h('section.dispositivos', { id: 'dispositivos' }, h('h2', conIcono('enlace', 'Mis dispositivos')),
      h('p', 'En este navegador no se puede guardar tu progreso fuera del aparato (por ejemplo, en una ventana privada).'));
  }
  const codigo = codigoAlumno(); // el primer uso lo crea en silencio
  const enlace = enlaceVincular(codigo);
  const qr = h('div.qr-vincular');
  qr.innerHTML = svgQR(enlace, { etiqueta: `Código QR para abrir tu progreso en otro móvil (código ${codigo})` });

  // Unir este aparato con el código de otro.
  const campo = h('input#sync-codigo-otro', { type: 'text', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', inputmode: 'text', maxlength: 20, placeholder: 'XXXX-XXXX-XXXX', 'aria-describedby': 'sync-otro-ayuda sync-otro-resultado' });
  const resultado = h('p#sync-otro-resultado.small', { 'aria-live': 'polite' });
  const unir = h('button', { type: 'button', onclick: async () => {
    unir.disabled = true;
    resultado.className = 'small';
    resultado.textContent = 'Uniendo…';
    const r = await motor.vincular(campo.value);
    unir.disabled = false;
    if (r.ok) {
      resultado.className = 'small ok';
      resultado.textContent = r.ya ? 'Este aparato ya usa ese código.' : 'Listo: este aparato ya comparte tu progreso. Lo que habías estudiado aquí se ha sumado.';
      setTimeout(() => location.reload(), 1500);
    } else {
      resultado.className = 'small aviso';
      resultado.textContent = r.texto;
      campo.focus();
    }
  } }, 'Unir este aparato');

  // Estado (para diagnóstico) y «Copiar diagnóstico».
  const estado = h('p.small.sync-estado', { 'aria-live': 'polite' });
  let ver = '?';
  const pinta = () => { const l = lineaEstado(estadoSync(), ver); estado.className = `small sync-estado ${l.tipo}`; estado.textContent = l.texto; };
  versionApp().then((v) => { ver = v; pinta(); });
  pinta();
  let montado = false; // la pantalla se monta un poco después (transición): hasta entonces no se da de baja
  const quita = alCambiarSync(() => {
    if (estado.isConnected) montado = true;
    else if (montado) { quita(); return; }
    pinta();
  });
  const copiado = h('span.small.muted', { 'aria-live': 'polite' });
  const copiar = h('button.secondary.small', { type: 'button', onclick: () => {
    copyText(textoDiagnostico(estadoSync(), ver)).then(() => { copiado.textContent = ' Copiado.'; }, () => { copiado.textContent = ' No se ha podido copiar.'; });
  } }, conIcono('portapapeles', 'Copiar diagnóstico'));
  motor.sincronizar();

  return h('section.dispositivos', { id: 'dispositivos' },
    h('h2', conIcono('enlace', 'Mis dispositivos')),
    h('p', 'Lo que estudias se guarda solo y se copia entre tus aparatos (móvil, tableta, ordenador) sin que tengas que hacer nada.'),
    h('h3.ajuste', 'Tu código'),
    h('p.sync-codigo', codigo),
    h('p', 'Apúntalo en un papel y guárdalo. Con él puedes seguir en otro aparato o recuperar tu progreso si cambias de móvil.'),
    h('h3.ajuste', 'Abrirlo en otro móvil'),
    h('figure.qr-figura', qr, h('figcaption.small', 'En el otro móvil, abre la cámara y apunta a este dibujo. Se abrirá la app y te preguntará si quieres unirlo.')),
    h('h3.ajuste', h('label', { for: 'sync-codigo-otro' }, 'Usar el código de otro aparato')),
    h('p#sync-otro-ayuda.small.muted', 'Escribe el código que ves en tu otro aparato. Lo que hayas estudiado aquí se sumará.'),
    h('div.sync-otro', campo, unir),
    resultado,
    h('div.sync-diagnostico', estado, h('div.actions', copiar, copiado)),
  );
}
