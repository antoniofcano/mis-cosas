// Genera podcast/README.md a partir de podcast/episodios.json y de las clases (objetivos de cada lección).
// Uso: node podcast/indice.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const raiz = new URL('..', import.meta.url);
const leer = (p) => JSON.parse(readFileSync(new URL(p, raiz)));
const E = leer('podcast/episodios.json');
const banco = new Map(['andalucia-per-teoria', 'andalucia-py-teoria', 'andalucia-per'].flatMap((f) => leer(`data/exams/${f}.json`).preguntas).map((q) => [q.id, q]));
const lecciones = new Map(['per', 'py'].flatMap((t) => leer(`data/curso/${t}.json`).modulos.flatMap((m) => m.lecciones)).map((l) => [l.id, l]));

const TIT = { py: 'Patrón de Yate (PY)', per: 'Patrón de Embarcaciones de Recreo (PER)' };
const TIPO = { bienvenida: '👋 Bienvenida', panorama: '🧭 Panorama', profundiza: '🔎 Profundiza' };
const out = [];
out.push(`# ${E.serie}`, '',
  'Guiones de podcast para preparar la teoría del PER y del Patrón de Yate (Andalucía), escritos para una IA de síntesis de voz.', '',
  'Hablan dos voces:', '',
  ...Object.entries(E.voces).map(([k, v]) => `- **${k[0] + k.slice(1).toLowerCase()}**: ${v}`), '',
  'Cada tema se cuenta en dos niveles:', '',
  '- **🧭 Panorama**: un episodio que recorre el tema entero, para situarse antes de estudiarlo y para repasarlo la semana del examen.',
  '- **🔎 Profundiza**: un episodio por epígrafe, o por grupo de epígrafes cortos, con los detalles y las trampas del examen.', '',
  'Cada episodio dura entre diez y quince minutos, unas 1.600–2.300 palabras habladas, y todo sale de las clases de la app.',
  'El formato de los guiones está en [`guia.md`](guia.md); este índice se genera con `node podcast/indice.mjs` a partir de [`episodios.json`](episodios.json).', '');

for (const tit of ['py', 'per']) {
  const eps = E[tit].filter((x) => x.n);
  const hechos = eps.filter((x) => x.archivo && existsSync(new URL(`podcast/${x.archivo}`, raiz))).length;
  out.push(`## ${TIT[tit]}`, '', `${eps.length} episodios · ${hechos} ${hechos === 1 ? "escrito" : "escritos"}.`, '');
  for (const x of E[tit]) {
    if (x.tema) { out.push(`### Tema ${x.tema} · ${x.titulo}`, ''); continue; }
    const hecho = x.archivo && existsSync(new URL(`podcast/${x.archivo}`, raiz));
    out.push(`#### ${x.n} · ${x.titulo}`, '',
      `${TIPO[x.tipo]} · ${hecho ? `✅ [guion](${x.archivo})` : '⏳ pendiente'}${x.lecciones.length ? ` · ${x.lecciones.length === 1 ? 'clase' : 'clases'} ${x.lecciones.join(', ')}` : ''}`, '');
    const reales = new Set(x.lecciones.flatMap((id) => lecciones.get(id)?.practica ?? [])).size;
    if (x.sinopsis) out.push(x.sinopsis, '');
    if (x.gancho) out.push(`**Gancho:** ${x.gancho}`, '');
    if (x.peso) out.push(`**En el examen:** ${x.peso}`, '');
    if (x.tipo === 'panorama') out.push(`**Recorre:** ${x.lecciones.map((id) => lecciones.get(id)?.titulo).join(' · ')}.`, '');
    const claves = x.claves ?? (x.tipo === 'profundiza' ? x.lecciones.flatMap((id) => lecciones.get(id)?.objetivos ?? []) : []);
    if (claves.length) out.push(x.claves ? '**Para llevarse:**' : '**Qué se aprende:**', '', ...claves.map((o) => `- ${o}`), '');
    if (x.trampas?.length) out.push('**Trampas del examen:**', '', ...x.trampas.map((o) => `- ${o}`), '');
    if (x.preguntas?.length) out.push(`**Minijuego** (${reales} preguntas reales de examen en estas clases):`, '', ...x.preguntas.map((id) => `- ${banco.get(id)?.enunciado ?? id} *(${id})*`), '');
    else if (x.tipo === 'profundiza' && reales) out.push(`*${reales} preguntas reales de examen en estas clases.*`, '');
    if (x.relacionados?.length) out.push(`**Relacionados:** ${x.relacionados.join(', ')}.`, '');
  }
}
writeFileSync(new URL('podcast/README.md', raiz), out.join('\n'));
console.log('podcast/README.md escrito');
