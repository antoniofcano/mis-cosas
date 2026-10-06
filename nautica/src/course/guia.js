// Guía de bienvenida: el método del curso en cinco pantallas. Los números salen de la estructura real del examen y
// de las reglas de la app (repaso, «¿Estás listo?», tramos), así que la guía no puede quedarse desfasada.

import { totalPreguntas } from '../theory/blocks.js';
import { INTERVALOS, ACIERTOS_PARA_SALIR } from './repaso.js';
import { MIN_RESPUESTAS, LISTO } from './listo.js';
import { cuenta } from '../texto.js';

const lista = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}` : xs[0] ?? '');

/**
 * Las pantallas de la guía de una titulación.
 * @param {{ sigla: string, nombre: string, estructura: object, podcast?: boolean }} T
 * @param {{ minutosDia?: number, fechaExamen?: string|null }} o
 * @returns {{ icono: string, titulo: string, texto: string[], puntos?: string[] }[]}
 */
export function paginasGuia(T, { minutosDia = 20, fechaExamen = null } = {}) {
  const E = T.estructura;
  const total = totalPreguntas(E);
  const maxFallos = total - E.minAciertos;
  const limites = E.bloques.filter((b) => b.maxErrores != null);
  const dias = INTERVALOS.map((d) => (d === 1 ? 'al día siguiente' : `a los ${cuenta(d, 'día')}`));

  const examen = {
    icono: 'examen',
    titulo: `Así es el examen del ${T.sigla}`,
    texto: [
      `${cuenta(total, 'pregunta')} tipo test, con cuatro opciones y una sola buena, en ${cuenta(E.duracionMin, 'minuto')}${E.modulos ? ` (${E.modulos.map((m) => `${m.titulo.toLowerCase()}, ${cuenta(m.duracionMin, 'minuto')}`).join('; ')})` : ''}.`,
      `Apruebas con ${cuenta(E.minAciertos, 'acierto')}: puedes fallar ${maxFallos} en total. Pero hay temas con su propio límite, y si lo pasas suspendes aunque vayas sobrado de aciertos:`,
    ],
    puntos: limites.map((b) => `${b.titulo}: como mucho ${cuenta(b.maxErrores, 'fallo')} de ${b.n}.`),
  };

  const metodo = {
    icono: 'clase',
    titulo: 'El método: poco, a menudo y repasando',
    texto: [
      'Cada clase va en tramos de unos cinco minutos, con una idea por pantalla. Puedes dejarla al acabar cualquier tramo y seguir otro día.',
      'Cada pocas pantallas te sale una pregunta real de examen, de lo que acabas de ver, y al responder el profe te explica el porqué, el truco y el error típico.',
      `Lo que fallas vuelve: ${lista(dias)}. Cuando la aciertas ${ACIERTOS_PARA_SALIR} veces seguidas en su día, sale del repaso.`,
    ],
  };

  const dia = {
    icono: 'hoy',
    titulo: 'Tu día: abre la app y pulsa lo que toca',
    texto: [
      `En «Hoy» tienes siempre una sola cosa: la clase, las preguntas o el repaso que toca. Tu meta son ${cuenta(minutosDia, 'minuto')} al día (se cambia en Ajustes); el anillo te dice cuánto llevas.`,
      fechaExamen
        ? 'Con tu fecha de examen, la app reparte el temario día a día hasta entonces y te dice si vas al día. Si no te da tiempo, te propone subir los minutos o el plan esencial.'
        : 'Si pones la fecha de tu examen (en Ajustes), la app reparte el temario día a día hasta entonces y te dice si llegas a tiempo.',
      'Estudiar un poco cada día rinde más que una tarde larga a la semana: la memoria se asienta durmiendo.',
    ],
  };

  const listo = {
    icono: 'progreso',
    titulo: '¿Cuándo estás listo?',
    texto: [
      `Cuando has respondido al menos ${cuenta(MIN_RESPUESTAS, 'pregunta')} de cada tema, la app calcula tu probabilidad de aprobar con las reglas de verdad del examen, tema a tema y con sus límites de fallos.`,
      `Con un ${Math.round(LISTO * 100)} % o más, estás listo. Los simulacros completos (cronometrados, como el de verdad) también cuentan: haz varios en las últimas semanas.`,
      'Lo ves en «Hoy», dentro de «Ver mi progreso», junto con los temas donde más fallas.',
    ],
  };

  const consejos = {
    icono: 'bombilla',
    titulo: 'Cinco consejos',
    puntos: [
      '«No la sé» es mejor que adivinar: la pregunta vuelve y la aprendes.',
      'Lee al profe también cuando aciertas: en «Ver por qué» está el razonamiento.',
      'Los ejercicios de carta, mejor en una tableta o un ordenador.',
      T.podcast === false ? 'Repasa las tarjetas de memoria en ratos muertos: luces, boyas, banderas…' : 'La radio de a bordo (en Biblioteca) se escucha en el coche o paseando: es repaso sin pantalla.',
      'Tu progreso se guarda en este aparato: de vez en cuando, guarda una copia en Ajustes.',
    ],
  };

  return [examen, metodo, dia, listo, consejos];
}
