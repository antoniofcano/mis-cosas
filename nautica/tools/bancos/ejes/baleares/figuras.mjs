// Figuras de las preguntas de Baleares: pocas preguntas llevan una imagen (señales, luces, piezas, nubes…) dentro del
// propio PDF. Este script las saca con pdftohtml -xml (que da la imagen y su posición en la página), asigna cada imagen a
// la pregunta cuyo número la precede en el orden de lectura y deja:
//   data/ejes/baleares/img/bal-<pdf>-<nº>[-k].<ext>       la imagen tal cual venía en el PDF
//   tools/bancos/ejes/baleares/figuras.json               { "<pdf>|<nº>": ["img/…"] }  (lo lee el adaptador)
// Se ejecuta a mano tras descargar los PDF: node tools/bancos/ejes/baleares/figuras.mjs
// Las imágenes de 2017–2025 sin pregunta asignable (logos, firmas) se listan y no se copian.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RAIZ, cacheEje, dirEje, escribirJSON, leerJSON } from '../../lib/comun.mjs';

const EJE = 'baleares';
// PDF que el adaptador descarta por repetir otro de la misma página (mismo examen y modelo).
const REPETIDOS = new Set(['225538', '234244', '290008', '385649']);
const RE_NUM = /^(?:\(\*\)\s*)?(\d{1,2})\s*[.)-]\s+\S/;

/** Elementos de una página de pdftohtml -xml en orden de lectura: { tipo: 'texto'|'imagen', pagina, top, … }. */
function elementos(xml) {
  const out = [];
  let pagina = 0;
  for (const m of xml.matchAll(/<page number="(\d+)"|<image top="(-?\d+)" left="(-?\d+)" width="(\d+)" height="(\d+)" src="([^"]+)"\/>|<text top="(-?\d+)" left="(-?\d+)"[^>]*>(.*?)<\/text>/g)) {
    if (m[1]) pagina = Number(m[1]);
    else if (m[2]) out.push({ tipo: 'imagen', pagina, top: Number(m[2]), ancho: Number(m[4]), alto: Number(m[5]), src: m[6] });
    else out.push({ tipo: 'texto', pagina, top: Number(m[7]), texto: m[9].replace(/<[^>]+>/g, '').replace(/&#160;/g, ' ').trim() });
  }
  return out.sort((a, b) => a.pagina - b.pagina || a.top - b.top);
}

export function figurasDePDF(pdf, tmp) {
  const base = join(tmp, 'x');
  execFileSync('pdftohtml', ['-xml', '-q', '-nodrm', pdf, base]);
  const els = elementos(readFileSync(`${base}.xml`, 'utf8'));
  const res = [];
  let actual = 0;
  for (const e of els) {
    if (e.tipo === 'texto') {
      const m = RE_NUM.exec(e.texto);
      if (m && Number(m[1]) === actual + 1) actual = Number(m[1]);
      continue;
    }
    if (e.ancho < 40 || e.alto < 40) continue;
    res.push({ numero: actual || null, src: join(tmp, e.src.split('/').pop()), pagina: e.pagina, ancho: e.ancho, alto: e.alto });
  }
  return res;
}

if (process.argv[1]?.endsWith('figuras.mjs')) {
  const man = leerJSON(join(dirEje(EJE), 'manifiesto.json'));
  const mapa = {};
  const porHuella = new Map(); // la misma imagen en otro PDF (Menorca/Eivissa, convocatorias que repiten) → el mismo fichero
  for (const d of man.documentos.filter((x) => ['cuestionario', 'especifico'].includes(x.rol) && x.idioma === 'es' && !REPETIDOS.has(x.pdf))) {
    const pdf = join(cacheEje(EJE), 'pdf', d.archivo);
    const lista = execFileSync('pdfimages', ['-list', pdf], { encoding: 'utf8' });
    if (!/\bimage\b/.test(lista.split('\n').slice(2).join('\n'))) continue;
    const tmp = mkdtempSync(join(tmpdir(), 'balfig-'));
    try {
      const porNum = {};
      for (const f of figurasDePDF(pdf, tmp)) {
        if (!f.numero) { console.log(`${d.pdf}: imagen sin pregunta en la página ${f.pagina} (${f.ancho}×${f.alto})`); continue; }
        const k = `${d.pdf}|${f.numero}`;
        porNum[k] = (porNum[k] ?? 0) + 1;
        const ext = f.src.split('.').pop();
        const huella = createHash('sha256').update(readFileSync(f.src)).digest('hex');
        let nombre = porHuella.get(huella);
        if (!nombre) {
          nombre = `img/bal-${d.pdf}-${String(f.numero).padStart(2, '0')}${porNum[k] > 1 ? `-${porNum[k]}` : ''}.${ext}`;
          copyFileSync(f.src, join(RAIZ, 'data', 'ejes', EJE, nombre));
          porHuella.set(huella, nombre);
        }
        (mapa[k] ??= []).push(nombre);
        console.log(`${d.pdf} nº ${f.numero} (p. ${f.pagina}) → ${nombre}`);
      }
    } finally { rmSync(tmp, { recursive: true, force: true }); }
  }
  escribirJSON(join(dirEje(EJE), 'figuras.json'), mapa);
}
