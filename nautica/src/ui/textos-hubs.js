// Los textos fijos de la interfaz de las pantallas que el tope de densidad vigila (H-74): Estrategia, Pódcast, Hoy,
// bienvenida, Ajustes y Tema. Sin DOM ni dependencias de navegador, para que `tests/densidad.test.js` los mida en Node:
// cada texto tiene su límite de palabras (LIMITES) y el test falla si uno crece. Las vistas importan de aquí; ninguna
// frase explicativa de estas pantallas se escribe suelta en la vista.

import { num } from '../course/estrategia.js';
import { duracion } from '../course/velocidad.js';
import { cuenta } from '../texto.js';

/** Palabras de un texto (como las cuenta la auditoría: tramos con alguna letra o cifra). */
export const palabras = (t) => String(t).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

// --- Estrategia --------------------------------------------------------------------------------------------------
export const ESTRATEGIA = {
  /** Entrada bajo el título. */
  entrada: (sigla, eje) => `Cómo aprobar el examen del ${sigla} en ${eje}: cifras, límites y tiempo. Las normas llevan su fuente al final.`,
  /** «Tu estrategia» sin datos. */
  sinDatos: 'Haz un simulacro y aquí verás tu tiempo y tu límite más justo.',
  boton: 'Hacer un simulacro',
  limites: 'Los límites que suspenden',
  tiempo: 'Tu tiempo',
  contestar: 'Cómo contestar',
  modulos: (sigla) => `El ${sigla} por módulos`,
  dia: 'El día antes y el del examen',
  fuentes: 'Fuentes y normas',
  resumenContestar: 'orden, leer y descartar, si no la sabes, repaso',
  resumenDia: 'víspera, lista del día y ensayo en papel',
  resumenFuentes: 'de dónde sale cada norma y lo pendiente',
  /** «Carta: máx. 3 fallos · Navegación: máx. 5 · colchón 4». */
  resumenLimites: (c) => `${c.limites.map((l) => `${l.corto}: máx. ${l.maxErrores}`).join(' · ')} · colchón ${c.colchon}`,
  /** «3 min por pregunta; carta, 5 min 30 s». */
  resumenTiempo: (c, cartaS) => `${num(c.minPorPregunta)} min por pregunta${cartaS ? `; carta, ${duracion(cartaS)}` : ''}`,
  resumenModulos: (c) => (c.modulos ?? []).map((m) => `${m.titulo?.replace(/^Módulo (de |del )?/i, '') ?? m.id} ${m.duracionMin} min`).join(' · '),
};

// --- Pódcast -----------------------------------------------------------------------------------------------------
export const PODCAST = {
  entrada: 'Episodios de 10–15 minutos con Elena y Andrés, para escuchar donde quieras.',
  ahora: 'Escucha ahora',
  /** «En preparación: temas 2, 3, 4, 7, 8 y 9.» */
  enPreparacion: (uts) => `En preparación: ${uts.length === 1 ? 'tema' : 'temas'} ${uts.length > 1 ? `${uts.slice(0, -1).join(', ')} y ${uts.at(-1)}` : uts[0]}.`,
  pie: 'Panorama: el tema entero. Profundiza: un epígrafe con sus trampas. Próximamente: aún en grabación.',
};

// --- Hoy y bienvenida --------------------------------------------------------------------------------------------
export const HOY = {
  /** El test de nivel, un enlace discreto bajo «Empezar». */
  nivel: '¿Ya sabes algo? Haz el test de nivel (8 min).',
  nivelMedias: 'Sigue el test de nivel donde lo dejaste.',
};
export const BIENVENIDA = {
  foco: '¿De qué te examinas?',
  focoAyuda: 'Ajustamos tu ruta y tus simulacros a lo que eliges. Lo cambias cuando quieras, en Ajustes o en el Temario.',
  guia: 'Ver primero cómo funciona el curso (3 min)',
};

// --- Ajustes ------------------------------------------------------------------------------------------------------
export const AJUSTES = {
  estudio: 'Estudio',
  aspecto: 'Aspecto y avisos',
  datos: 'Tus datos y copias',
  acerca: 'Acerca de',
  resumenAcerca: 'cómo funciona el curso, modo profesor',
  convocatoria: 'Opcional: hora, sede y enlace de tu examen. Salen en Hoy la semana del examen.',
  efectos: 'Un tic al acertar y una campanilla al subir de rango. Nunca al fallar.',
  voz: 'Usa las voces de tu móvil. Si no oyes nada, instala una voz en español.',
  tribunal: 'Estudias con los exámenes reales de tu tribunal. Si cambias, no pierdes nada.',
  /** «20 de noviembre · 20 min al día». */
  resumenEstudio: (fecha, min) => `${fecha ?? 'sin fecha'} · ${min} min al día`,
  /** «Automático · letra normal». */
  resumenAspecto: (aspecto, letra) => `${aspecto} · letra ${letra.toLowerCase()}`,
  resumenDatos: (sincronizado, ultimaCopia) => (sincronizado ? 'sincronizado entre aparatos' : ultimaCopia ? `última copia: ${ultimaCopia}` : 'sin copia'),
};

// --- Tema ----------------------------------------------------------------------------------------------------------
export const TEMA = {
  leerMas: 'Leer más',
  /** «Escúchalo: 4 episodios · 57 min →» */
  escucha: (n, min) => `Escúchalo: ${cuenta(n, 'episodio')} · ${min} min →`,
  antes: (titulo) => `Antes: ${titulo}`,
  hoyToca: 'Hoy toca',
  masDelTema: 'Más para este tema',
  /** Entradas cortas (una línea) de los temas que se redactan aparte de su introducción de clase. */
  resumen: { py: { 1: 'Por qué flota y se adriza un barco, y qué equipo de seguridad llevar y cómo usarlo.' } },
};

/** Primera frase de un texto, para dejar el resto tras «Leer más». */
export function primeraFrase(t, max = 30) {
  const s = String(t ?? '').trim();
  const m = /^.*?[.!?](?=\s|$)/s.exec(s);
  const f = m ? m[0] : s;
  const p = f.split(/\s+/);
  return p.length > max ? `${p.slice(0, max).join(' ')}…` : f;
}

/** Máximo de palabras de cada texto fijo (tests/densidad.test.js). Lo que se pasa, falla. */
export const LIMITES = {
  'estrategia.sinDatos': 14, 'estrategia.boton': 4, 'estrategia.resumenContestar': 10,
  'estrategia.resumenDia': 10, 'estrategia.resumenFuentes': 10,
  'podcast.entrada': 16, 'podcast.pie': 20,
  'hoy.nivel': 12, 'hoy.nivelMedias': 10,
  'bienvenida.foco': 5, 'bienvenida.focoAyuda': 25, 'bienvenida.guia': 10,
  'ajustes.convocatoria': 16, 'ajustes.efectos': 16, 'ajustes.voz': 16, 'ajustes.tribunal': 16, 'ajustes.resumenAcerca': 8,
  'tema.resumen.py.1': 20,
};
