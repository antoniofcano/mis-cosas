// Motor de carta: datos geográficos de una carta náutica (puntos notables, faros, costa) y consultas
// sobre ellos (¿es agua?, ¿se ve el faro?, punto aleatorio navegable...).
// Es independiente de la interfaz: lo usan los generadores de ejercicios y el renderizador gráfico.

import { rhumbTo, rhumbDestination } from '../math/mercator.js';

/** Punto dentro de polígono (ray casting) en coordenadas [lon, lat]. */
function inPolygon(lon, lat, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function createChart(data) {
  const points = new Map(data.points.map((p) => [p.id, p]));
  const land = data.land ?? [];
  const { south, north, west, east } = data.bounds;

  const chart = {
    id: data.id,
    name: data.name,
    bounds: data.bounds,
    declination: data.declination,
    land,
    coastlines: data.coastlines ?? [],
    source: data.source,

    point(id) {
      const p = points.get(id);
      if (!p) throw new Error(`Punto desconocido en la carta: ${id}`);
      return p;
    },
    points: () => [...points.values()],
    lights: () => [...points.values()].filter((p) => p.light),
    /** Puntos que se usan como marcas para demoras (faros y puntas con nombre). */
    marks: () => [...points.values()].filter((p) => p.mark !== false),

    inBounds: ({ lat, lon }, margin = 0) =>
      lat > south + margin && lat < north - margin && lon > west + margin && lon < east - margin,

    isLand: ({ lat, lon }) => land.some((poly) => inPolygon(lon, lat, poly)),

    /** Agua navegable: dentro de la carta, no en tierra y a más de `clearance` millas de la costa. */
    isNavigable(p, clearance = 0.5) {
      if (!chart.inBounds(p, 0.02) || chart.isLand(p)) return false;
      if (clearance > 0) {
        for (let b = 0; b < 360; b += 45) {
          if (chart.isLand(rhumbDestination(p, b, clearance))) return false;
        }
      }
      return true;
    },

    /** ¿El segmento A-B va siempre por agua? (muestreo cada ~0,25 millas) */
    isClearPath(a, b, clearance = 0.2) {
      const { bearing, distance } = rhumbTo(a, b);
      const n = Math.max(2, Math.ceil(distance / 0.25));
      for (let i = 0; i <= n; i++) {
        const p = rhumbDestination(a, bearing, (distance * i) / n);
        if (chart.isLand(p)) return false;
        if (clearance && i > 0 && i < n && !chart.isNavigable(p, clearance)) return false;
      }
      return true;
    },

    /** ¿Se puede tomar demora a la marca desde p? (dentro de alcance y sin tierra en medio). */
    isVisible(p, mark, maxRange = 18) {
      const { bearing, distance } = rhumbTo(p, mark);
      if (distance > (mark.range_nm ? Math.min(mark.range_nm, maxRange) : maxRange)) return false;
      // Se ignora el último tramo (la marca está en tierra).
      const n = Math.max(2, Math.ceil(distance / 0.25));
      for (let i = 1; i < n - 2; i++) {
        if (chart.isLand(rhumbDestination(p, bearing, (distance * i) / n))) return false;
      }
      return true;
    },

    /** Punto navegable aleatorio (opcionalmente dentro de una caja {south,north,west,east}). */
    randomSeaPoint(rng, box = data.bounds, clearance = 1) {
      for (let i = 0; i < 500; i++) {
        const p = { lat: rng.real(box.south, box.north), lon: rng.real(box.west, box.east) };
        if (chart.isNavigable(p, clearance)) return p;
      }
      throw new Error('No se encontró un punto navegable');
    },

    /** Marcas visibles desde p, con su demora verdadera y distancia. */
    visibleMarks(p, maxRange = 18) {
      return chart.marks()
        .filter((m) => chart.isVisible(p, m, maxRange))
        .map((m) => ({ mark: m, ...rhumbTo(p, m) }));
    },
  };
  return chart;
}
