// Motor de conocimiento náutico: estima analítica (Patrón de Yate).
// Navegación loxodrómica por latitud media: para cada tramo
//     Δl = d · cos R      (diferencia de latitud, minutos = millas, + N)
//     A  = d · sen R      (apartamiento, millas, + E)
// Suma de tramos, latitud media lm = l0 + Δl/2 y diferencia de longitud Δλ = A / cos lm.
// Rumbo y distancia directos: R = atan(A / Δl), D = √(Δl² + A²).

const DEG = Math.PI / 180;

export function legComponents(rv, dist) {
  return { dLat: dist * Math.cos(rv * DEG), dep: dist * Math.sin(rv * DEG) };
}

/**
 * @param {{lat, lon}} start  grados decimales
 * @param {{ rv: number, dist: number }[]} legs
 */
export function deadReckoning(start, legs) {
  const comps = legs.map((l) => ({ ...l, ...legComponents(l.rv, l.dist) }));
  const dLat = comps.reduce((s, c) => s + c.dLat, 0);
  const dep = comps.reduce((s, c) => s + c.dep, 0);
  const lm = start.lat + dLat / 120;
  const dLon = dep / Math.cos(lm * DEG);
  const end = { lat: start.lat + dLat / 60, lon: start.lon + dLon / 60 };
  const course = ((Math.atan2(dep, dLat) / DEG) + 360) % 360;
  const distance = Math.hypot(dLat, dep);
  return { comps, dLat, dep, lm, dLon, end, course, distance };
}
