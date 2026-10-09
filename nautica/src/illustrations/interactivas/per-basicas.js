// Láminas interactivas del PER para los temas que no tenían ninguna («predice, manipula, explica»):
//   barco + viento (Nomenclatura) · cardinales (Balizamiento) · playa sin balizar (Legislación) · tetraedro del fuego
//   (Emergencias). Las cifras y reglas son las de las clases (Reglamento General de Costas, art. 73; IALA región A;
//   UNE-EN 2 y los cuatro métodos de extinción).
import { pol, parte } from './kit.js';
import { marcaC } from '../buoys.js';
import { playaDistanciaC } from '../per-cola-normativa-c.js';
import { T, TXT, lienzo, rotulo, cartela, referencia, ondas, flecha as flechaC, pol as polC, barco as barcoC } from '../estilo-c.js';

// ---------------------------------------------------------------------------
// Barco y viento: babor/estribor no cambian; barlovento/sotavento dependen de por dónde entra el viento.

/** Dirección relativa (grados desde la proa, sentido horario) de cada zona del barco. */
export const ZONAS_VIENTO = { proa: 0, 'amura-er': 45, 'traves-er': 90, 'aleta-er': 135, popa: 180, 'aleta-br': 225, 'traves-br': 270, 'amura-br': 315 };
const NOMBRE_ZONA = { proa: 'la proa', 'amura-er': 'la amura de estribor', 'traves-er': 'el través de estribor', 'aleta-er': 'la aleta de estribor', popa: 'la popa', 'aleta-br': 'la aleta de babor', 'traves-br': 'el través de babor', 'amura-br': 'la amura de babor' };

/** Banda de barlovento y de sotavento con el viento entrando por `zona` (null si entra justo por proa o por popa). */
export function bandas(zona) {
  const a = ZONAS_VIENTO[zona] ?? 0;
  if (a === 0 || a === 180) return { barlovento: null, sotavento: null };
  return a < 180 ? { barlovento: 'estribor', sotavento: 'babor' } : { barlovento: 'babor', sotavento: 'estribor' };
}

export const barcoViento = {
  aplica: (spec) => spec.modo === 'viento',
  mandos: [{ id: 'viento', tipo: 'opciones', etiqueta: 'El viento entra por', opciones: [['proa', 'Proa'], ['amura-er', 'Amura Er'], ['traves-er', 'Través Er'], ['aleta-er', 'Aleta Er'], ['popa', 'Popa'], ['aleta-br', 'Aleta Br'], ['traves-br', 'Través Br'], ['amura-br', 'Amura Br']] }],
  estado: (spec) => ({ viento: ZONAS_VIENTO[spec.viento] != null ? spec.viento : 'traves-er' }),
  calcular: (e) => bandas(e.viento),
  pie: () => 'Babor y estribor no cambian nunca; barlovento es la banda por la que entra el viento y sotavento la contraria.',
  dibujar(e, r, { pendiente = false } = {}) {
    // Estilo C (docs/ESTILO-LAMINAS.md): barco en planta sobre el agua de la carta; barlovento rayado.
    const W = 358; const H = 340; const CX = 179; const CY = 176; const L = 176;
    const alt = `Barco visto desde arriba con el viento entrando por ${NOMBRE_ZONA[e.viento]}` + (pendiente || !r.barlovento ? '.' : `: barlovento a ${r.barlovento}, sotavento a ${r.sotavento}.`);
    const { out, ray, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
    out.push(ondas(10, W - 10, H - 28, { sep: 9 }));
    // las bandas: barlovento rayado
    if (!pendiente && r.barlovento) {
      const x = r.barlovento === 'estribor' ? CX : CX - 44;
      out.push(`<rect x="${x}" y="${CY - L / 2 + 8}" width="44" height="${L - 16}" fill="${T.papel}" opacity=".7"/><rect x="${x}" y="${CY - L / 2 + 8}" width="44" height="${L - 16}" fill="${ray}" opacity=".6"/>`);
    }
    out.push(barcoC(CX, CY, 0, L, { p: 'barco', crujia: false, relleno: 'none' }));
    out.push(`<line x1="${CX}" y1="${CY - L / 2}" x2="${CX}" y2="${CY + L / 2}" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="6 4"/>`);
    // zonas que se pueden tocar
    const z = (id, x, y, t, anchor) => rotulo(x, y, t, { size: TXT.nota, estilo: 'serif', italic: true, anchor, p: id });
    out.push(z('proa', CX, CY - L / 2 - 8, 'proa', 'middle'), z('popa', CX, CY + L / 2 + 18, 'popa', 'middle'));
    out.push(z('amura-er', CX + 36, CY - 52, 'amura', 'start'), z('traves-er', CX + 38, CY + 4, 'través', 'start'), z('aleta-er', CX + 36, CY + 58, 'aleta', 'start'));
    out.push(z('amura-br', CX - 36, CY - 52, 'amura', 'end'), z('traves-br', CX - 38, CY + 4, 'través', 'end'), z('aleta-br', CX - 36, CY + 58, 'aleta', 'end'));
    out.push(rotulo(CX - 112, CY + 30, 'BABOR', { size: TXT.rotulo, weight: 700, estilo: 'cap', color: T.rojoTxt, p: 'babor' }), rotulo(CX + 112, CY + 30, 'ESTRIBOR', { size: TXT.rotulo, weight: 700, estilo: 'cap', color: T.verdeTxt, p: 'estribor' }));
    // el viento: flecha que llega desde fuera hacia el barco
    const a = ZONAS_VIENTO[e.viento];
    const [x1, y1] = pol(CX, CY, a, 158);
    const [x2, y2] = pol(CX, CY, a, 104);
    out.push(flechaC(x1, y1, x2, y2, { color: T.magenta, w: 3, p: 'viento' }));
    const [tx, ty] = pol(CX, CY, a, 140);
    out.push(rotulo(tx + (Math.sin(a * Math.PI / 180) >= 0 ? -10 : 10), ty - 8, 'viento', { size: TXT.nota, estilo: 'serif', italic: true, weight: 700, color: T.magenta, anchor: Math.sin(a * Math.PI / 180) >= 0 ? 'end' : 'start' }));
    if (!pendiente && r.barlovento) {
      const xb = r.barlovento === 'estribor' ? CX + 112 : CX - 112;
      out.push(cartela(xb, 28, 'BARLOVENTO', null, { color: T.magenta, ancho: 118 }), rotulo(r.barlovento === 'estribor' ? CX - 112 : CX + 112, 32, 'sotavento', { size: TXT.nota, estilo: 'serif', italic: true, color: T.apagado }));
    }
    out.push(cierra());
    const svg = out.join('');
    const base = `El viento entra por ${NOMBRE_ZONA[e.viento]}.`;
    if (pendiente) return { svg, lectura: `${base} Responde y verás cuál es cada banda.` };
    return { svg, lectura: r.barlovento ? `${base} Barlovento: ${r.barlovento}. Sotavento: ${r.sotavento}. Babor y estribor siguen donde estaban.` : `${base} Entra de frente o por detrás: no hay una banda de barlovento.` };
  },
  prediccion: () => ({
    enunciado: 'El viento te entra por la amura de estribor. ¿Cuál es tu banda de barlovento?',
    opciones: { a: 'Babor', b: 'Estribor', c: 'Depende de hacia dónde vaya el barco' },
    correcta: 'b',
    tras: 'Barlovento es la banda por la que entra el viento: estribor. Babor queda a sotavento. Mueve el viento a la aleta de babor y mira cómo se cambian.',
    estado: { viento: 'amura-er' },
  }),
  partes: {
    proa: 'Proa: la parte delantera, la que va abriendo camino.',
    popa: 'Popa: la parte trasera, donde van el timón y la hélice.',
    'amura-er': 'Amura de estribor: la parte delantera del costado derecho, donde el casco se va cerrando hacia la proa.',
    'traves-er': 'Través de estribor: a la derecha, perpendicular a la crujía, a la altura de la mitad del barco.',
    'aleta-er': 'Aleta de estribor: la parte trasera del costado derecho, la que se curva para cerrar la popa.',
    'amura-br': 'Amura de babor: la parte delantera del costado izquierdo.',
    'traves-br': 'Través de babor: a la izquierda, perpendicular a la crujía, a mitad del barco.',
    'aleta-br': 'Aleta de babor: la parte trasera del costado izquierdo.',
    babor: 'Babor: mirando a proa, la banda de la izquierda (luz roja).',
    estribor: 'Estribor: mirando a proa, la banda de la derecha (luz verde).',
    viento: 'El viento: la banda por la que entra es barlovento; la otra, sotavento.',
  },
  botonesPartes: [['aleta-er', 'Aleta de estribor'], ['amura-br', 'Amura de babor'], ['traves-er', 'Través de estribor'], ['popa', 'Popa']],
};

// ---------------------------------------------------------------------------
// Cardinales: cada una en el cuadrante de su nombre, y se pasa por ese lado.

const CARD = {
  n: { clase: 'cardinal-n', nombre: 'Norte', lado: 'el norte', luz: 'centelleo continuo (Q o VQ)', a: 0 },
  e: { clase: 'cardinal-e', nombre: 'Este', lado: 'el este', luz: '3 centelleos (Q(3) 10 s o VQ(3) 5 s): las 3 del reloj', a: 90 },
  s: { clase: 'cardinal-s', nombre: 'Sur', lado: 'el sur', luz: '6 centelleos y un destello largo (Q(6)+LFl 15 s): las 6', a: 180 },
  w: { clase: 'cardinal-w', nombre: 'Oeste', lado: 'el oeste', luz: '9 centelleos (Q(9) 15 s o VQ(9) 10 s): las 9', a: 270 },
};
const ASPECTO = { n: 'negra arriba y amarilla abajo, con los conos hacia arriba', e: 'negra con una banda amarilla, con los conos unidos por las bases', s: 'amarilla arriba y negra abajo, con los conos hacia abajo', w: 'amarilla con una banda negra, con los conos unidos por los vértices' };

/** Por qué lado se pasa una cardinal: el de su nombre. */
export const ladoCardinal = (marca) => CARD[marca]?.lado ?? null;

export const cardinales = {
  aplica: (spec) => !!CARD[spec.marca],
  mandos: [{ id: 'marca', tipo: 'opciones', etiqueta: 'Marca', opciones: [['n', 'Norte'], ['e', 'Este'], ['s', 'Sur'], ['w', 'Oeste']] }],
  estado: (spec) => ({ marca: CARD[spec.marca] ? spec.marca : 'n' }),
  calcular: (e) => ({ ...CARD[e.marca], aspecto: ASPECTO[e.marca] }),
  pie: () => 'Cada cardinal está en el cuadrante de su nombre y se pasa por ese lado. La luz se lee como un reloj: E las 3, S las 6, W las 9; la N centellea sin parar.',
  dibujar(e, r, { pendiente = false } = {}) {
    // Estilo C (docs/ESTILO-LAMINAS.md): el peligro en el centro, los cuatro cuadrantes y la marca en el suyo.
    const W = 358; const H = 392; const CX = 179; const CY = 222; const R = 112;
    const alt = pendiente ? `Una marca ${r.aspecto}, junto a un peligro. ¿Por dónde la pasas?` : `Cardinal ${r.nombre} en el cuadrante ${r.nombre.toLowerCase()} del peligro: se pasa por ${r.lado}.`;
    const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua });
    out.push(ondas(10, W - 10, 52, { sep: 9 }));
    // cuadrantes: separados por las demoras NE, SE, SW y NW desde el peligro
    for (const d of [45, 135, 225, 315]) { const [x, y] = polC(CX, CY, d, 172); out.push(referencia(CX, CY, x, y)); }
    for (const [t, d] of [['N', 0], ['E', 90], ['S', 180], ['W', 270]]) { const [x, y] = polC(CX, CY, d, 150); out.push(rotulo(x + (d % 180 ? 0 : 30), y + 6 + (d % 180 ? 26 : 0), t, { size: 17, weight: 700, estilo: 'serif', color: T.apagado })); }
    out.push(`<g data-parte="peligro"><path d="M${CX - 20},${CY + 4} C${CX - 22},${CY - 12} ${CX - 4},${CY - 20} ${CX + 10},${CY - 15} C${CX + 24},${CY - 10} ${CX + 22},${CY + 10} ${CX + 8},${CY + 16} C${CX - 4},${CY + 20} ${CX - 18},${CY + 16} ${CX - 20},${CY + 4}Z" fill="${T.tierra}" stroke="${T.tinta}" stroke-width="1.4"/>` +
      `<path d="M${CX - 20},${CY + 4} C${CX - 22},${CY - 12} ${CX - 4},${CY - 20} ${CX + 10},${CY - 15} C${CX + 24},${CY - 10} ${CX + 22},${CY + 10} ${CX + 8},${CY + 16} C${CX - 4},${CY + 20} ${CX - 18},${CY + 16} ${CX - 20},${CY + 4}Z" fill="${pt}"/>` +
      `${rotulo(CX, CY + 36, 'peligro', { size: TXT.rotulo, estilo: 'serif', italic: true })}</g>`);
    for (const [k, c] of Object.entries(CARD)) {
      const [x, y] = polC(CX, CY, c.a, R);
      const sel = k === e.marca;
      out.push(`<g${parte(sel ? 'marca' : null)} opacity="${sel ? 1 : 0.4}">${marcaC(c.clase, x, y + 20, sel ? 0.7 : 0.55, { pt })}</g>`);
    }
    // el lado seguro: un barco que pasa por fuera de la marca, por su lado
    if (!pendiente) {
      const [mx, my] = polC(CX, CY, r.a, R + { 0: 66, 90: 50, 180: 40, 270: 50 }[r.a]);
      const [ax, ay] = polC(mx, my, r.a + 90, 52);
      const [bx, by] = polC(mx, my, r.a - 90, 52);
      out.push(flechaC(ax, ay, bx, by, { color: T.magenta, w: 2.4, p: 'paso' }));
      out.push(cartela(CX, 24, `CARDINAL ${r.nombre.toUpperCase()}`, null, { color: T.magenta }));
    } else {
      out.push(cartela(CX, 24, '¿POR DÓNDE LA PASAS?'));
    }
    out.push(cierra());
    const svg = out.join('');
    if (pendiente) return { svg, lectura: `Una marca ${r.aspecto}. Responde y verás por dónde se pasa.` };
    return { svg, lectura: `Cardinal ${r.nombre}: ${r.aspecto}. Está al ${r.nombre.toLowerCase()} del peligro y se pasa por ${r.lado}. Su luz, blanca: ${r.luz}.` };
  },
  prediccion: () => ({
    enunciado: 'Ves una marca amarilla con una banda negra y los conos unidos por los vértices. ¿Por dónde la pasas?',
    opciones: { a: 'Por el oeste', b: 'Por el este', c: 'Por cualquier lado, lejos' },
    correcta: 'a',
    tras: 'Es la cardinal Oeste: está en el cuadrante oeste del peligro y se pasa por el oeste. Prueba las otras tres y fíjate en sus conos y su luz.',
    estado: { marca: 'w' },
  }),
  partes: {
    marca: 'La cardinal: negra y amarilla, con dos conos negros de tope. Indica el lado seguro, el de su nombre.',
    peligro: 'El peligro: la cardinal no está encima, sino en el cuadrante del lado por el que hay que pasar.',
    paso: 'Por donde pasas: por el lado del nombre de la marca, dejándola entre tú y el peligro.',
  },
};

// ---------------------------------------------------------------------------
// Playa o costa sin balizar: franja de 200 m (playas) o 50 m (resto); dentro, 3 nudos como máximo.

export const FRANJA = { playa: 200, resto: 50 };
/** ¿Estás dentro de la zona de baño presunta? Y la velocidad máxima que te toca. */
export function zonaBano(costa, dist) {
  const limite = FRANJA[costa] ?? 200;
  const dentro = dist <= limite;
  return { limite, dentro, maxNudos: dentro ? 3 : null };
}

export const playaDistancia = {
  aplica: (spec) => spec.modo === 'distancia',
  mandos: [
    { id: 'costa', tipo: 'opciones', etiqueta: 'Costa sin balizar', opciones: [['playa', 'Playa'], ['resto', 'Resto de costa']] },
    { id: 'dist', tipo: 'rango', etiqueta: 'Distancia a la orilla', min: 10, max: 300, paso: 10, texto: (v) => `${v} m`, extremos: ['10 m', '300 m'] },
  ],
  estado: (spec) => ({ costa: spec.costa === 'resto' ? 'resto' : 'playa', dist: Number.isFinite(spec.dist) ? spec.dist : 120 }),
  calcular: (e) => zonaBano(e.costa, e.dist),
  pie: () => 'Sin boyas, la zona de baño son 200 m en las playas y 50 m en el resto de la costa: dentro se navega, a 3 nudos como máximo.',
  dibujar(e, r, { pendiente = false } = {}) {
    const svg = playaDistanciaC(e, r, { pendiente });
    const donde = `${e.costa === 'playa' ? 'Playa' : 'Costa'} sin balizar, a ${e.dist} m de la orilla.`;
    if (pendiente) return { svg, lectura: `${donde} Responde y verás si estás en la zona de baño.` };
    return { svg, lectura: r.dentro ? `${donde} Estás dentro de la franja de ${r.limite} m: puedes navegar, pero a 3 nudos como máximo y sin vertidos.` : `${donde} Estás fuera de la franja de ${r.limite} m: no se aplica el límite de 3 nudos.` };
  },
  prediccion: () => ({
    enunciado: 'Playa sin balizar y vas a 120 m de la orilla. ¿Puedes navegar ahí?',
    opciones: { a: 'No: está prohibido', b: 'Sí, a 3 nudos como máximo', c: 'Sí, sin ningún límite' },
    correcta: 'b',
    tras: 'En una playa sin boyas la zona de baño son 200 m: dentro se navega, pero a 3 nudos como máximo. Cambia a «Resto de costa» y verás que la franja es de 50 m.',
    estado: { costa: 'playa', dist: 120 },
  }),
  partes: {
    franja: 'La zona de baño presunta: 200 m en playas, 50 m en el resto de la costa. Dentro, 3 nudos como máximo.',
    orilla: 'La orilla: desde aquí se mide la franja.',
    barco: 'Tu barco: lo que cuenta es su distancia a la orilla.',
  },
};

// ---------------------------------------------------------------------------
// Tetraedro del fuego: se apaga quitando uno de sus cuatro elementos.

export const METODOS = {
  combustible: { elemento: 'el combustible', metodo: 'desalimentación', ej: 'cerrar la llave del gas o del combustible, retirar lo que pueda arder' },
  comburente: { elemento: 'el comburente (oxígeno)', metodo: 'sofocación', ej: 'una tapa, una manta ignífuga, la espuma o el CO₂' },
  calor: { elemento: 'el calor', metodo: 'enfriamiento', ej: 'sobre todo el agua' },
  reaccion: { elemento: 'la reacción en cadena', metodo: 'inhibición', ej: 'sobre todo el polvo químico' },
};
/** ¿Sigue ardiendo? Y con qué método se ha apagado. */
export const apagado = (quita) => (METODOS[quita] ? { arde: false, ...METODOS[quita] } : { arde: true });

export const fuegoApagar = {
  aplica: (spec) => spec.modo === 'apagar',
  mandos: [{ id: 'quita', tipo: 'opciones', etiqueta: 'Quitas', opciones: [['nada', 'Nada'], ['combustible', 'Combustible'], ['comburente', 'Oxígeno'], ['calor', 'Calor'], ['reaccion', 'Reacción']] }],
  estado: (spec) => ({ quita: METODOS[spec.quita] ? spec.quita : 'nada' }),
  calcular: (e) => apagado(e.quita),
  pie: () => 'Enfriar quita el calor; sofocar, el oxígeno; desalimentar, el combustible; inhibir, la reacción en cadena.',
  dibujar(e, r) {
    // Estilo C (docs/ESTILO-LAMINAS.md): el tetraedro en perspectiva, como la lámina fija (seguridad-c.js); el elemento que
    // se quita, atenuado y con sus aristas a trazos; la llama en el centro o, apagado, el humo.
    const W = 358; const H = 330;
    const NOM = { combustible: 'COMBUSTIBLE', comburente: 'OXÍGENO', calor: 'CALOR', reaccion: 'REACCIÓN' };
    const SUB = { combustible: 'se retira', comburente: 'se sofoca', calor: 'se enfría', reaccion: 'se inhibe' };
    const alt = r.arde ? 'Tetraedro del fuego con sus cuatro vértices, combustible, oxígeno, calor y reacción en cadena, y una llama en el centro: con los cuatro, arde.'
      : `Tetraedro del fuego al que le falta ${r.elemento}: ese vértice y sus aristas, atenuados y a trazos, y en el centro solo humo. Se apaga por ${r.metodo}.`;
    const { out, cierra } = lienzo(W, H, alt);
    const V = { calor: [179, 74], combustible: [84, 236], comburente: [274, 236], reaccion: [196, 180] };
    const on = (k) => e.quita !== k;
    const lado = (a, b) => `<line x1="${V[a][0]}" y1="${V[a][1]}" x2="${V[b][0]}" y2="${V[b][1]}" stroke="${T.tinta}" stroke-width="${on(a) && on(b) ? 1.6 : 1}"${on(a) && on(b) ? '' : ' stroke-dasharray="4 5" opacity=".4"'}/>`;
    if (on('calor') && on('combustible') && on('comburente')) out.push(`<path d="M${V.calor} L${V.combustible} L${V.comburente}Z" fill="${T.amarillo}" fill-opacity=".22"/>`);
    out.push(lado('combustible', 'comburente'), lado('comburente', 'calor'), lado('calor', 'combustible'), lado('reaccion', 'combustible'), lado('reaccion', 'comburente'), lado('reaccion', 'calor'));
    out.push(r.arde
      ? `<path d="M179,196 C157,172 168,152 179,132 C181,152 203,160 192,184 C199,176 201,166 199,160 C214,178 208,202 179,206 C155,204 149,184 160,168 C160,182 168,190 179,196Z" fill="${T.rojo}" stroke="${T.tinta}" stroke-width="1"/><path d="M179,198 C170,188 174,178 179,170 C182,180 190,186 184,196Z" fill="${T.amarillo}"/>`
      : `<path d="M168,204 C156,182 184,172 170,150 M190,204 C178,182 206,170 192,146" stroke="${T.apagado}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
    const POS = { calor: [179, 44], combustible: [76, 280], comburente: [282, 280], reaccion: [296, 150] };
    for (const [k, [x, y]] of Object.entries(V)) {
      out.push(`<g${parte(k)} opacity="${on(k) ? 1 : 0.4}"><circle cx="${x}" cy="${y}" r="8" fill="${on(k) ? T.naranja : T.papel}" stroke="${T.tinta}" stroke-width="1.2"/>${cartela(POS[k][0], POS[k][1], NOM[k], SUB[k], { color: on(k) ? T.tinta : T.magenta })}</g>`);
    }
    out.push(referencia(V.reaccion[0] + 8, V.reaccion[1] - 4, POS.reaccion[0] - 40, POS.reaccion[1] + 10));
    out.push(rotulo(W / 2, 316, r.arde ? 'Con los cuatro, arde' : `Sin ${r.elemento}: se apaga (${r.metodo})`, { size: TXT.nota, estilo: 'serif', italic: true, weight: 700, color: r.arde ? T.tinta : T.magenta }));
    out.push(cierra());
    return { svg: out.join(''), lectura: r.arde ? 'Combustible, oxígeno, calor y reacción en cadena: con los cuatro, el fuego se mantiene solo. Quita uno.' : `Has quitado ${r.elemento}: es la ${r.metodo} (${r.ej}). El fuego se apaga.` };
  },
  prediccion: () => ({
    enunciado: 'Arde el aceite de la sartén y la tapas con su tapa. ¿Qué elemento del tetraedro quitas?',
    opciones: { a: 'El combustible', b: 'El comburente (oxígeno)', c: 'El calor' },
    correcta: 'b',
    tras: 'Tapar es sofocar: le quitas el oxígeno. Prueba los otros: cerrar el gas desalimenta, el agua enfría y el polvo químico inhibe la reacción en cadena.',
    estado: { quita: 'nada' },
  }),
  partes: {
    combustible: 'Combustible: lo que arde. Quitarlo es desalimentar (cerrar el gas o el combustible).',
    comburente: 'Comburente: el oxígeno del aire. Quitarlo es sofocar (tapa, manta, espuma, CO₂).',
    calor: 'Calor: la energía que lo inicia y lo mantiene. Quitarlo es enfriar (agua).',
    reaccion: 'Reacción en cadena: hace que el fuego se mantenga solo. Cortarla es inhibir (polvo químico).',
  },
  botonesPartes: [['combustible', 'Combustible'], ['comburente', 'Oxígeno'], ['calor', 'Calor'], ['reaccion', 'Reacción en cadena']],
};

