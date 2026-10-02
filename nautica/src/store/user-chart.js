// Carta escaneada del propio usuario: se carga una vez (PDF o imagen) y se guarda SOLO en su navegador
// (IndexedDB). Nunca se sube al repositorio ni a ningún servidor: la carta tiene derechos del IHM.

const DB = 'nautica';
const STORE = 'files';
const KEY = 'carta-escaneada';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(r?.result);
    t.onerror = () => reject(t.error);
  });
}

/**
 * Extrae la imagen JPEG más grande incrustada en un PDF (los escaneos suelen ser un JPEG por página).
 * Sin librerías: busca flujos que empiezan por la firma JPEG (FF D8 FF) y terminan en "endstream".
 */
export function extractJpegFromPdf(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const find = (pat, from) => {
    outer: for (let i = from; i <= u8.length - pat.length; i++) {
      for (let j = 0; j < pat.length; j++) if (u8[i + j] !== pat[j]) continue outer;
      return i;
    }
    return -1;
  };
  const enc = (s) => [...s].map((c) => c.charCodeAt(0));
  const STREAM = enc('stream');
  const END = enc('endstream');
  let best = null;
  let i = 0;
  while ((i = find(STREAM, i)) !== -1) {
    let s = i + STREAM.length;
    if (u8[s] === 0x0d) s++;
    if (u8[s] === 0x0a) s++;
    const e = find(END, s);
    if (e === -1) break;
    if (u8[s] === 0xff && u8[s + 1] === 0xd8 && u8[s + 2] === 0xff) {
      let end = e;
      while (end > s && (u8[end - 1] === 0x0a || u8[end - 1] === 0x0d)) end--;
      if (!best || end - s > best.length) best = { start: s, length: end - s };
    }
    i = e + END.length;
  }
  if (!best) return null;
  return new Blob([u8.subarray(best.start, best.start + best.length)], { type: 'image/jpeg' });
}

/** Convierte el fichero elegido (PDF o imagen) en un Blob de imagen y lo guarda. */
export async function saveUserChart(file) {
  let blob = file;
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    blob = extractJpegFromPdf(await file.arrayBuffer());
    if (!blob) throw new Error('El PDF no contiene una imagen JPEG reconocible. Prueba a exportarlo como imagen (JPG/PNG).');
  }
  const { width, height } = await imageSize(blob);
  await tx('readwrite', (s) => s.put({ blob, width, height, name: file.name, saved: new Date().toISOString() }, KEY));
  return { width, height };
}

export async function loadUserChart() {
  try {
    return (await tx('readonly', (s) => s.get(KEY))) ?? null;
  } catch {
    return null;
  }
}

export const deleteUserChart = () => tx('readwrite', (s) => s.delete(KEY));

function imageSize(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(img.src); };
    img.onerror = () => reject(new Error('No se pudo leer la imagen'));
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Adapta la calibración publicada al tamaño de la imagen cargada (misma carta escaneada a otra resolución).
 * Devuelve null si la proporción no coincide (sería otro escaneo: no está calibrado).
 */
export function adaptCalibration(cal, width, height) {
  const sx = width / cal.image.width;
  const sy = height / cal.image.height;
  if (Math.abs(sx - sy) / sx > 0.01) return null;
  return cal.controlPoints.map((c) => ({ ...c, px: c.px * sx, py: c.py * sy }));
}
