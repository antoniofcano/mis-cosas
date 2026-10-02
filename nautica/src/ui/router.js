// Enrutado por hash: #/ruta/segmento?clave=valor. Todo el estado relevante va en la URL para que
// un ejercicio se pueda compartir, recargar o abrir directamente (también por un agente de IA).

export function parseHash(hash = location.hash) {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), query: Object.fromEntries(new URLSearchParams(query)) };
}

export function link(parts, query) {
  const q = query && Object.keys(query).length ? `?${new URLSearchParams(query)}` : '';
  return `#/${parts.map(encodeURIComponent).join('/')}${q}`;
}

export function navigate(parts, query, { replace = false } = {}) {
  const url = link(parts, query);
  if (replace) history.replaceState(null, '', url);
  else location.hash = url;
}
