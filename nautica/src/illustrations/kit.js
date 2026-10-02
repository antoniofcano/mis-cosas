// Utilidades comunes de dibujo para las láminas (mismo estilo que navigation.js y seamanship.js):
// fondo il-panel (se adapta a los temas claro y oscuro), colores de saturación media y flechas con marcador.

export const C = { v: '#2563eb', m: '#16a34a', a: '#d97706', r: '#dc2626', p: '#7c3aed', g: '#64748b', n: '#ea580c' };
export const LUZ = { W: '#fffbe6', R: '#ef4444', G: '#22c55e', Y: '#facc15' };

const f = (n) => (+n).toFixed(1);
export const defs = (id) => `<defs>${Object.entries(C).map(([k, c]) => `<marker id="${id}-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${c}"/></marker>`).join('')}</defs>`;
export const open = (W, H, label, id) => [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="${label}">`, `<rect width="${W}" height="${H}" rx="10" class="il-panel"/>`, defs(id)];
export const title = (x, t, y = 22) => `<text x="${x}" y="${y}" class="il-title">${t}</text>`;
export const rad = (d) => (d * Math.PI) / 180;
/** Punto a una distancia r desde (x, y) en un rumbo náutico (0 = arriba, sentido horario). */
export const pol = (x, y, deg, r) => [x + Math.sin(rad(deg)) * r, y - Math.cos(rad(deg)) * r];
/** Rumbo náutico (0–360) del vector que va de (x1, y1) a (x2, y2). */
export const bearing = (x1, y1, x2, y2) => ((Math.atan2(x2 - x1, -(y2 - y1)) * 180) / Math.PI + 360) % 360;
export const arrow = (x1, y1, x2, y2, c, id, w = 2.4, extra = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${C[c]}" stroke-width="${w}" marker-end="url(#${id}-${c})" ${extra}/>`;
export const lbl = (x, y, t, c = null, anchor = 'start', extra = '') => `<text x="${f(x)}" y="${f(y)}" class="il-lbl" text-anchor="${anchor}" ${c ? `style="fill:${C[c] ?? c}"` : ''} ${extra}>${t}</text>`;
export const deg3 = (d) => `${String(Math.round(((d % 360) + 360) % 360)).padStart(3, '0')}°`;
export const fx = f;

/** Casco visto en planta con la proa hacia arriba, centrado en (0, 0); L eslora y B manga en px. */
export const hullPlan = (L, B, extra = '') => `<path d="M0,${f(-L / 2)} C${f(B * 0.55)},${f(-L / 2 + L * 0.18)} ${f(B / 2)},${f(-L * 0.08)} ${f(B / 2)},${f(L * 0.12)} L${f(B * 0.42)},${f(L / 2)} L${f(-B * 0.42)},${f(L / 2)} L${f(-B / 2)},${f(L * 0.12)} C${f(-B / 2)},${f(-L * 0.08)} ${f(-B * 0.55)},${f(-L / 2 + L * 0.18)} 0,${f(-L / 2)}Z" class="il-hull-plan" ${extra}/>`;
/** Barco pequeño (flecha) apuntando hacia +x, para animateMotion con rotate="auto". */
export const boatGlyph = (c, s = 1) => `<path d="M${12 * s},0 L${-6 * s},${6 * s} L${-3 * s},0 L${-6 * s},${-6 * s}Z" fill="${c}" stroke="#fff" stroke-width="1"/>`;
