// Código del alumno (docs/SYNC.md): 12 símbolos de un alfabeto sin ambigüedades, en tres grupos de cuatro
// («K7QM-4TXD-92HB»). Los 11 primeros son al azar (crypto.getRandomValues) y el último es de control: detecta cualquier
// símbolo cambiado y dos símbolos vecinos cambiados de sitio antes de preguntar al servidor (así un error al teclear se
// dice al momento y no gasta intentos). Sin DOM ni red: lo usan el cliente y el Worker.
//
// Alfabeto: dígitos del 2 al 9 y letras sin I, L ni O (31 símbolos). Ningún código lleva 0, O, 1, I ni L, así que un
// código escrito con ellos se rechaza con un motivo claro en vez de adivinar qué se quiso poner.

export const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const LARGO = 12;
const N = ALFABETO.length; // 31, primo: el control detecta cambios y trasposiciones

const valor = (c) => ALFABETO.indexOf(c);

/** Símbolo de control de los 11 primeros: suma ponderada (1…11) módulo 31. */
export function control(cuerpo) {
  let s = 0;
  for (let i = 0; i < cuerpo.length; i += 1) s += (i + 1) * valor(cuerpo[i]);
  return ALFABETO[s % N];
}

/** Código nuevo al azar (normalizado, sin guiones). `rnd(n)` devuelve n bytes aleatorios (inyectable en pruebas). */
export function generarCodigo(rnd = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n))) {
  let cuerpo = '';
  while (cuerpo.length < LARGO - 1) {
    for (const b of rnd(16)) {
      if (b >= N * 8) continue; // rechazo: así cada símbolo sale con la misma probabilidad
      cuerpo += ALFABETO[b % N];
      if (cuerpo.length === LARGO - 1) break;
    }
  }
  return cuerpo + control(cuerpo);
}

/** Mayúsculas y sin separadores (espacios, guiones, puntos). No valida. */
export const normalizarCodigo = (s) => String(s ?? '').toUpperCase().replace(/[\s\-‐-―._·/]+/g, '');

/**
 * ¿Es un código válido?
 * @returns {{ ok: true, codigo: string } | { ok: false, motivo: 'vacio'|'largo'|'simbolo'|'control', texto: string }}
 */
export function validarCodigo(s) {
  const c = normalizarCodigo(s);
  if (!c) return { ok: false, motivo: 'vacio', texto: 'Escribe el código.' };
  const raro = [...c].find((x) => valor(x) < 0);
  if (raro) {
    const confuso = /[01ILO]/.test(raro);
    return { ok: false, motivo: 'simbolo', texto: confuso ? 'Los códigos no llevan 0, O, 1, I ni L. Revisa ese símbolo.' : `El código no lleva «${raro}». Revisa lo que has escrito.` };
  }
  if (c.length !== LARGO) return { ok: false, motivo: 'largo', texto: `El código tiene ${LARGO} letras y números; has escrito ${c.length}.` };
  if (control(c.slice(0, -1)) !== c.at(-1)) return { ok: false, motivo: 'control', texto: 'Ese código no es correcto: revisa letra a letra.' };
  return { ok: true, codigo: c };
}

/** «K7QM4TXD92HB» → «K7QM-4TXD-92HB». */
export const formatearCodigo = (c) => normalizarCodigo(c).replace(/(.{4})(?=.)/g, '$1-');
