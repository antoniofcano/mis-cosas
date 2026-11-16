// ¿De qué te examinas? (titulaciones con módulos: el PY). El alumno elige preparar los dos módulos, solo el genérico o
// solo el de navegación (ajuste compartido `modulos_<tit>`). Sin elección, si apuntó un examen con un módulo aprobado
// (src/course/tras-examen.js, moduloPendiente), se prepara el que queda. Con un módulo elegido, el motor
// (src/course/motor.js) trabaja solo con sus temas: la ruta del curso, lo que toca hoy, el plan hasta el examen, el
// avance del camino y «¿Estás listo?». Lo estudiado del otro módulo no se pierde: vuelve al elegir los dos.
//
// Funciones puras.

import { estructuraModulo } from '../theory/blocks.js';
import { moduloPendiente } from './tras-examen.js';
import { leerAjuste, claveSemana } from './semana.js';

export const claveFoco = (tit) => `modulos_${tit}`;
export const AMBOS = 'ambos';

/** Opciones que se ofrecen (vacío si la titulación no tiene módulos). */
export function opcionesFoco(estructura) {
  const ms = estructura?.modulos ?? [];
  return ms.length ? [{ id: AMBOS, titulo: 'Los dos módulos' }, ...ms.map((m) => ({ id: m.id, titulo: `Solo el ${m.titulo.replace(/^Módulo/, 'módulo')}` }))] : [];
}

/**
 * El módulo en el que se centra el alumno, o null (todo el examen).
 * @returns {{ id: string, titulo: string, origen: 'eleccion'|'resultado' } | null}
 */
export function focoModulo(settings = {}, tit, estructura) {
  const ms = estructura?.modulos ?? [];
  if (!ms.length) return null;
  const v = settings[claveFoco(tit)];
  if (v === AMBOS) return null;
  const m = ms.find((x) => x.id === v);
  if (m) return { id: m.id, titulo: m.titulo, origen: 'eleccion' };
  const p = moduloPendiente(leerAjuste(settings[claveSemana(tit)]), estructura);
  return p ? { id: p.id, titulo: p.titulo, origen: 'resultado' } : null;
}

/** ¿Ha elegido ya el alumno (o lo dice un resultado)? Si no, Hoy le pregunta. */
export const focoDecidido = (settings = {}, tit, estructura) => !(estructura?.modulos?.length) || settings[claveFoco(tit)] != null
  || focoModulo(settings, tit, estructura) != null;

/**
 * Los datos del motor recortados a un módulo: su estructura, el curso con solo sus temas (y su ruta) y sus preguntas.
 */
export function datosDelModulo({ estructura, curso, preguntas }, id) {
  const E = estructuraModulo(estructura, id);
  if (!E) return { estructura, curso, preguntas };
  const uts = new Set(E.bloques.map((b) => b.ut));
  const c = curso ? {
    ...curso,
    modulos: (curso.modulos ?? []).filter((m) => uts.has(m.ut)),
    ...(curso.ruta ? { ruta: curso.ruta.filter((t) => uts.has(t.ut)) } : {}),
  } : curso;
  return { estructura: E, curso: c, preguntas: (preguntas ?? []).filter((q) => uts.has(q.ut)) };
}
