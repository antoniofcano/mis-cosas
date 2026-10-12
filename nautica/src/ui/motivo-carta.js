// Aviso (estilo C) de por qué una pregunta de carta no trae resolución programada, o de que es anulada. Lo usan la
// vista de la pregunta (#/q/<id>) y la revisión de un examen. El texto sale de src/exams/motivo.js; el CSS, del bloque
// `.motivo-carta` de styles/laminas.css. No depende del color: la etiqueta y el titular lo dicen con palabras.
import { h } from './dom.js';
import { DOCUMENTADAS } from '../bancos/soluciones.js';
import { motivoSinSolucion } from '../exams/motivo.js';

/** El aviso ya calculado ({ tipo, etiqueta, titulo, texto }). */
export function avisoMotivo(m) {
  return h(`aside.motivo-carta.motivo-${m.tipo}`, { 'aria-label': m.titulo },
    h('p.motivo-eti', m.etiqueta),
    h('p.motivo-titulo', m.titulo),
    h('p.motivo-texto', m.texto));
}

/** El aviso de una pregunta (o null si tiene resolución programada, no es anulada y llega a la oficial con margen). */
export function avisoDePregunta(q, { programada = false, sinMargen = null } = {}) {
  const m = motivoSinSolucion(q, DOCUMENTADAS[q.id], { programada, sinMargen });
  return m ? avisoMotivo(m) : null;
}
