// Los bancos por eje leídos desde el disco (herramientas y tests de Node). Mismo motor que la app (src/bancos),
// con lectura de ficheros en vez de fetch; y lecturas síncronas para las herramientas que no son asíncronas.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearBancos, cursoConPractica } from '../../src/bancos/index.js';
import { EJE_POR_DEFECTO } from '../../src/bancos/registro.js';

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export { EJE_POR_DEFECTO };

/** JSON de una ruta relativa a la raíz de la app. */
export const leerJSON = (ruta) => JSON.parse(readFileSync(join(RAIZ, ruta), 'utf8'));

/** El motor de bancos sobre el disco: cargarBanco(eje, tit), cargarCurso(tit, eje), pregunta(id)… */
export const bancosNode = () => crearBancos(async (ruta) => leerJSON(ruta));

/** Ejes registrados (data/ejes/index.json). */
export const ejes = () => leerJSON('data/ejes/index.json').ejes;
/** Titulaciones de un eje (las de su ficha). */
export const titsDeEje = (eje) => Object.keys(leerJSON(`data/ejes/${eje}/eje.json`).examen ?? {});

/** Todas las preguntas de todos los ejes y titulaciones (síncrono). */
export function todasLasPreguntas() {
  return ejes().flatMap((e) => titsDeEje(e.id).flatMap((tit) => leerJSON(`data/ejes/${e.id}/${tit}/preguntas.json`).preguntas));
}

/** Práctica de cada clase de una titulación en un eje: { leccionId: [ids] } (síncrono). */
export const practicaDe = (tit, eje = EJE_POR_DEFECTO) => {
  try { return leerJSON(`data/ejes/${eje}/${tit}/practica.json`); } catch { return {}; }
};

/** Preguntas de una titulación en un eje (síncrono). */
export const preguntasDe = (tit, eje = EJE_POR_DEFECTO) => leerJSON(`data/ejes/${eje}/${tit}/preguntas.json`).preguntas;

/** Curso de una titulación con la práctica del eje en cada clase, como lo ve el motor (síncrono). */
export function cursoDe(tit, eje = EJE_POR_DEFECTO) {
  const practica = practicaDe(tit, eje);
  return cursoConPractica(leerJSON(`data/curso/${tit}.json`), { practicaDe: (id) => practica[id] ?? [] });
}
