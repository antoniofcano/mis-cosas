// Controlador de una lámina interactiva, sin DOM: estado, predicción y mandos. Lo usa src/ui/lamina.js para pintar
// y los tests para comprobar los tres modos.
//
//   clase       → predicción primero; los mandos no se mueven hasta responder.
//   explicacion → se abre en el estado de la spec (el de la pregunta), sin predicción y con los mandos libres.
//   galeria     → libre, sin predicción.
//
// La definición de cada lámina (src/illustrations/interactivas/) aporta:
//   mandos: [{ id, tipo: 'rango'|'opciones', etiqueta, min, max, paso, extremos, opciones: [[valor, texto]], texto(v) }]
//           (o una función del estado que devuelve esa lista; como máximo tres)
//   estado(spec) → estado inicial · calcular(estado) → resultado (funciones puras de src/nautical/)
//   dibujar(estado, resultado, { pendiente }) → { svg | vistas: [{ svg, pie }], lectura, casillas?: [[etiqueta, valor]] }
//   prediccion(estado, spec) → { enunciado, opciones: { a, b, … }, correcta, tras, estado? }
//   partes?: { id: texto } para el resaltado entre vistas

export const MODOS = ['clase', 'explicacion', 'galeria'];
export const MAX_MANDOS = 3;

export function controlador(def, spec, modo = 'galeria') {
  if (!MODOS.includes(modo)) modo = 'galeria';
  let estado = def.estado(spec);
  const pred = modo === 'clase' && def.prediccion ? def.prediccion(estado, spec) : null;
  if (pred?.estado) estado = { ...estado, ...pred.estado };
  let respuesta = null;
  let parte = null;

  const listaMandos = () => (typeof def.mandos === 'function' ? def.mandos(estado) : def.mandos);
  const bloqueado = () => !!pred && respuesta == null;

  function ajusta(m, v) {
    if (m.tipo === 'rango') {
      const n = Math.round(Number(v) / m.paso) * m.paso;
      return Number.isFinite(n) ? Math.min(m.max, Math.max(m.min, n)) : estado[m.id];
    }
    return m.opciones.some(([o]) => o === v) ? v : estado[m.id];
  }

  return {
    modo,
    estado: () => ({ ...estado }),
    get bloqueado() { return bloqueado(); },
    get respondida() { return !pred || respuesta != null; },
    vista() {
      const r = def.calcular(estado);
      // pendiente: en clase, antes de responder, la lámina no enseña la respuesta (cada definición decide qué oculta).
      const d = def.dibujar(estado, r, { pendiente: bloqueado() });
      const mandos = listaMandos().map((m) => ({ ...m, valor: estado[m.id], texto: m.texto ? m.texto(estado[m.id], estado) : null }));
      return {
        ...d,
        lectura: parte && def.partes?.[parte] ? def.partes[parte] : d.lectura,
        resultado: r,
        mandos,
        bloqueado: bloqueado(),
        parte,
        prediccion: pred && { ...pred, respuesta, acierto: respuesta == null ? null : respuesta === pred.correcta },
      };
    },
    /** Responde la predicción. Devuelve true si acierta. Solo vale una vez. */
    responder(k) {
      if (!pred || respuesta != null || !(k in pred.opciones)) return false;
      respuesta = k;
      return k === pred.correcta;
    },
    /** Mueve un mando. Devuelve false si está bloqueado o no existe. */
    mover(id, v) {
      if (bloqueado()) return false;
      const m = listaMandos().find((x) => x.id === id);
      if (!m) return false;
      estado = { ...estado, [id]: ajusta(m, v) };
      parte = null; // al mover un mando vuelve la lectura del estado
      return true;
    },
    /** Vuelve al estado inicial de la spec (el caso de la pregunta). */
    reiniciar() {
      if (bloqueado()) return false;
      estado = def.estado(spec);
      parte = null;
      return true;
    },
    /** ¿El estado es distinto del de la spec? */
    get cambiado() { return JSON.stringify(estado) !== JSON.stringify(def.estado(spec)); },
    /** Resalta una parte en todas las vistas (o la quita si ya estaba). */
    resaltar(p) {
      parte = parte === p || !def.partes?.[p] ? null : p;
      return parte;
    },
  };
}
