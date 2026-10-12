// Iconos de línea propios (SVG en línea). Son el ÚNICO sistema de iconos de la interfaz: nada de emojis (se ven distinto
// en cada móvil, no siguen la paleta ni el modo oscuro). Reglas de dibujo y cómo añadir uno: docs/ICONOS.md.
//   · viewBox 24 × 24, contenido dentro de 2…22 (margen de 2 px), alineado a la rejilla de medio píxel.
//   · Trazo 1,75 px, extremos y uniones redondeados, sin relleno, color = currentColor (heredan la paleta y el modo
//     oscuro). Sin colores fijos: los estados los pone el CSS (p. ej. la lámpara del faro, clase .lampara).
//   · Deben leerse a 16–24 px: pocas piezas, nada de detalles menores de 2 px.

const T = 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';

const P = {
  // --- navegación y estructura -----------------------------------------------------------------------------------------
  hoy: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v11.5H10v-6h4v6h4.5V9"/>',
  temario: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H11v17H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 4.5A1.5 1.5 0 0 0 18.5 3H13v17h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
  examen: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  biblioteca: '<path d="M4 20V4M8 20V4M12 20l4-16 4 16"/><path d="M3 20h18"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  mas: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  progreso: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  calendario: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  reloj: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>',
  candado: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5v-3a4 4 0 0 1 8 0v3M12 14.5v2.5"/>',
  diana: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.25"/>',
  instalar: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M12 6.5v7M9 10.5l3 3 3-3M10.5 18h3"/>',
  descargar: '<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5"/><path d="M4 15.5v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  carpeta: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  imprimir: '<path d="M6.5 9V3.5h11V9"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6.5 14h11v6.5h-11z"/>',
  compartir: '<path d="M12 14.5v-11M7.5 8 12 3.5 16.5 8"/><path d="M8 11H6a2 2 0 0 0-2 2v5.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V13a2 2 0 0 0-2-2h-2"/>',
  enlace: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  lupa: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  anadir: '<path d="M12 5v14M5 12h14"/>',
  salir: '<path d="M6 6l12 12M18 6 6 18"/>',
  // --- estudio ---------------------------------------------------------------------------------------------------------
  clase: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v5"/>',
  libro: '<path d="M5 19V5a2 2 0 0 1 2-2h12v14.5H7A2 2 0 0 0 5 19.5 2 2 0 0 0 7 21.5h12"/><path d="M9 7.5h6"/>',
  documento: '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5M8.5 12.5h7M8.5 16.5h5"/>',
  portapapeles: '<rect x="5" y="4.5" width="14" height="17" rx="2"/><rect x="9" y="2.5" width="6" height="4" rx="1"/><path d="M8.5 11.5h7M8.5 15.5h5"/>',
  lista: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5"/>',
  tabla: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M3.5 15h17M10 4v16"/>',
  tarjetas: '<rect x="8" y="3" width="12" height="15" rx="2"/><path d="M4.5 7v11.5a2.5 2.5 0 0 0 2.5 2.5h9"/>',
  lamina: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.75"/><path d="m21 15.5-5-5L6.5 20"/>',
  red: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="10" cy="18" r="2.5"/><path d="M8.5 6.4l7 1.2M16.4 10 11.6 16M6.8 8.4l2.4 7.2"/>',
  nudo: '<path d="M3 20.5c4-1 7-4 10.5-8.5 2.5-3.2 2.8-9-1.5-9S7.6 9 10 12.4"/><path d="M12.9 15.6c2.2 2.6 4.6 4.1 8.1 4.9"/>',
  bombilla: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  lapiz: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
  chincheta: '<path d="M9 3h6l-1 6 3 3v2.5H7V12l3-3z"/><path d="M12 14.5V21"/>',
  repaso: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
  mezclar: '<path d="M3 7h3c4.5 0 6.5 10 11 10h4"/><path d="M3 17h3c1.7 0 2.9-1.4 3.9-3.3M14.1 10.3C15 8.4 16 7 18 7h3"/><path d="m18.5 4.5 2.5 2.5-2.5 2.5M18.5 14.5l2.5 2.5-2.5 2.5"/>',
  pregunta: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 .2c0 1.8-2.5 2.2-2.5 4"/><path d="M12 17h.01"/>',
  toque: '<path d="M6 3.5 18.5 9.5l-5.6 2-2.4 5.8z"/><path d="m13 11.5 5.5 5.5"/>',
  calculadora: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><rect x="8" y="5.5" width="8" height="4" rx=".75"/><path d="M8.5 13.25h.01M12 13.25h.01M15.5 13.25h.01M8.5 17h.01M12 17h.01M15.5 17h.01"/>',
  cuentas: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 8.5h4M9 6.5v4M13.5 8.5h4M7.5 14.5l3 3M10.5 14.5l-3 3M13.5 14.75h4M13.5 17.25h4"/>',
  profe: '<circle cx="8" cy="7.5" r="3"/><path d="M2.5 20.5v-1A4.5 4.5 0 0 1 7 15h2a4.5 4.5 0 0 1 4.5 4.5v1"/><path d="M12.5 3.5h9v9H16"/><path d="m10.5 11.5 4-3"/>',
  // --- estados y avisos ------------------------------------------------------------------------------------------------
  ok: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
  no: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  casi: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  aviso: '<path d="M10.3 4.3 2.7 17.6A2 2 0 0 0 4.4 20.6h15.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4.5M12 17.25h.01"/>',
  racha: '<path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z"/>',
  // --- sonido y reproducción -------------------------------------------------------------------------------------------
  escuchar: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  silencio: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
  podcast: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/>',
  play: '<path d="M7.5 4.8v14.4a.8.8 0 0 0 1.2.7l11.3-7.2a.8.8 0 0 0 0-1.4L8.7 4.1a.8.8 0 0 0-1.2.7z"/>',
  pausa: '<rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/>',
  parar: '<rect x="5.5" y="5.5" width="13" height="13" rx="1.5"/>',
  inicio: '<path d="M5.5 5v14"/><path d="M18.5 5.8v12.4a.8.8 0 0 1-1.2.7L8.4 12.7a.8.8 0 0 1 0-1.4l8.9-6.2a.8.8 0 0 1 1.2.7z"/>',
  fin: '<path d="M18.5 5v14"/><path d="M5.5 5.8v12.4a.8.8 0 0 0 1.2.7l8.9-6.2a.8.8 0 0 0 0-1.4L6.7 5.1a.8.8 0 0 0-1.2.7z"/>',
  atras: '<path d="m15 5-7 7 7 7"/>',
  adelante: '<path d="m9 5 7 7-7 7"/>',
  retroceder: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 3.5v5h5"/>',
  avanzar: '<path d="M20 12a8 8 0 1 1-2.4-5.7L20 8.5"/><path d="M20 3.5v5h-5"/>',
  deshacer: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  // --- mesa de cartas --------------------------------------------------------------------------------------------------
  mapa: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  brujula: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  compas: '<circle cx="12" cy="4.5" r="1.75"/><path d="M11.3 6.2 6 21M12.7 6.2 18 21M8.2 15h7.6"/>',
  regla: '<rect x="2.5" y="8" width="19" height="8" rx="1.5"/><path d="M6.5 8v3M10 8v2M13.5 8v3M17 8v2"/>',
  transportador: '<path d="M2.5 18.5a9.5 9.5 0 0 1 19 0z"/><path d="M12 18.5 16.5 12M12 9v2M5.3 12l1.4 1.2M18.7 12l-1.4 1.2"/>',
  lugar: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.5"/>',
  texto: '<path d="M5 7V4.5h14V7M12 4.5v15M9 19.5h6"/>',
  goma: '<path d="m4.7 13.8 8.6-8.6a2 2 0 0 1 2.8 0l2.7 2.7a2 2 0 0 1 0 2.8l-7.5 7.5H8.4l-3.7-3.6a.6.6 0 0 1 0-.8z"/><path d="m9.2 9.3 5.5 5.5M11.3 18.2H20"/>',
  mover: '<path d="M12 3v18M3 12h18"/><path d="m9 6 3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
  etiqueta: '<path d="M3.5 12.5V5A1.5 1.5 0 0 1 5 3.5h7.5l8 8a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8" cy="8" r="1.5"/>',
  mira: '<circle cx="12" cy="12" r="7"/><path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5"/>',
  papelera: '<path d="M4 6.5h16M9.5 6.5v-2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/><path d="m6 6.5 1 13.5a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 20l1-13.5"/><path d="M10 10.5v7M14 10.5v7"/>',
  'arriba-abajo': '<path d="M8 20V4M4.5 7.5 8 4l3.5 3.5M16 4v16M12.5 16.5 16 20l3.5-3.5"/>',
  acercar: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M8 10.5h5M10.5 8v5"/>',
  alejar: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M8 10.5h5"/>',
  encuadrar: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>',
  minimizar: '<path d="M5 18h14"/>',
  ventana: '<rect x="4.5" y="4.5" width="15" height="15" rx="2"/>',
  // --- náutica (temas, mazos, ejercicios) ------------------------------------------------------------------------------
  // faro: la lámpara se enciende con CSS (.lampara); ancla (rango), bandera (examen), insignias: la Travesía
  faro: '<path d="M9 21l1.5-11h3L15 21z"/><rect class="lampara" x="10" y="6" width="4" height="4"/><path d="M9.5 6 12 3.5 14.5 6M7 21h10M4.5 8H8M16 8h3.5"/>',
  ancla: '<circle cx="12" cy="5" r="2.25"/><path d="M12 7.25V21M7 11h10"/><path d="M4.5 15c0 3.2 3.4 6 7.5 6s7.5-2.8 7.5-6"/>',
  bandera: '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4 2.5 4H5"/>',
  velero: '<path d="M12 3v14"/><path d="M12 4.5 18.5 15H12M10 7.5 5.5 15H10"/><path d="M3 17.5h18l-2.5 3.5h-13z"/>',
  barco: '<path d="M3 15.5h18l-2.5 5h-13z"/><path d="M6 15.5V11h11v4.5M9 11V7.5h5V11M11.5 7.5V4"/>',
  // barco-marca: «estás aquí» en la carta de la derrota (Hoy y la Travesía): una marca de posición con un velero dentro
  'barco-marca': '<path d="M12 21.5s-7-5.9-7-11.5a7 7 0 0 1 14 0c0 5.6-7 11.5-7 11.5z"/><path d="M11 5.5v6h4z"/><path d="M8.5 13.5h7"/>',
  timon: '<circle cx="12" cy="12" r="6.25"/><circle cx="12" cy="12" r="1.75"/><path d="M12 2.5v7.75M12 13.75v7.75M3.8 7.25l6.7 3.9M13.5 12.9l6.7 3.85M20.2 7.25l-6.7 3.9M10.5 12.9 3.8 16.75"/>',
  boya: '<path d="m9.75 7 2.25-4 2.25 4z"/><path d="M12 7v3.5"/><path d="M6.5 16a5.5 5.5 0 0 1 11 0z"/><path d="M2.5 19.5c1.6 0 1.6-1 3.2-1s1.6 1 3.2 1 1.6-1 3.1-1 1.6 1 3.2 1 1.6-1 3.2-1 1.6 1 3.1 1"/>',
  salvavidas: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>',
  chaleco: '<path d="M9 3.5 5.5 5v14.5A1.5 1.5 0 0 0 7 21h4V10.5z"/><path d="M15 3.5 18.5 5v14.5A1.5 1.5 0 0 1 17 21h-4V10.5z"/><path d="M9 3.5a3 3 0 0 0 6 0M5.5 15H11M13 15h5.5"/>',
  ley: '<path d="M12 3.5v17M7.5 20.5h9M5 6.5h14"/><path d="M5 6.5 2.5 13a2.5 2.5 0 0 0 5 0z"/><path d="m19 6.5-2.5 6.5a2.5 2.5 0 0 0 5 0z"/>',
  nube: '<path d="M7 18.5h10a4 4 0 0 0 .6-8 5.5 5.5 0 0 0-10.7-1.3A4.6 4.6 0 0 0 7 18.5z"/>',
  viento: '<path d="M3 8.5h10.5a2.5 2.5 0 1 0-2.5-2.5"/><path d="M3 12.5h15a2.5 2.5 0 1 1-2.5 2.5"/><path d="M3 16.5h6"/>',
  ola: '<path d="M2.5 18c2 0 2.6-1.5 4.8-1.5S10 18 12 18s2.6-1.5 4.8-1.5S19.5 18 21.5 18"/><path d="M3 13c2.5 0 3.8-6.5 9-6.5 2.8 0 4.2 1.8 3.3 3.4-.7 1.3-3 1-3.1-.7"/>',
  luna: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  campana: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0M12 3v2"/>',
  satelite: '<g transform="rotate(-45 12 12)"><rect x="9.5" y="9" width="5" height="6" rx="1"/><rect x="2.5" y="9.5" width="5" height="5" rx=".5"/><rect x="16.5" y="9.5" width="5" height="5" rx=".5"/><path d="M7.5 12h2M14.5 12h2M12 15v2.5"/></g>',
  // --- insignias de la Travesía ----------------------------------------------------------------------------------------
  'ins-guardia': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'ins-semana': '<path d="M4 20h16M7 20V10M12 20V4M17 20v-7"/>',
  'ins-rescate': '<circle cx="12" cy="12" r="9"/><path d="m7.5 12.5 3 3 6-7"/>',
  'ins-bloque': '<path d="M12 3v18M8 7h8M9 21h6"/>',
  'ins-simulacro': '<path d="M9 12l2 2 4-4"/><path d="M5 4h14v16H5z"/>',
  'ins-inedito': '<path d="M12 3l2.5 5.5 6 .8-4.4 4.1 1.1 6L12 16.6 6.8 19.4l1.1-6L3.5 9.3l6-.8z"/>',
};

/** El marcado SVG de un icono (para HTML en cadena, p. ej. la cabecera de index.html). */
export const svgIcono = (nombre) => `<svg viewBox="0 0 24 24" width="24" height="24" ${T} focusable="false">${P[nombre] ?? ''}</svg>`;

/**
 * Elemento <span> con el icono `nombre`. Decorativo (aria-hidden) salvo que se le dé `etiqueta`: entonces es una imagen
 * con nombre accesible (cuando el icono es lo único que dice algo).
 */
export function icono(nombre, clase = '', etiqueta = null) {
  const s = document.createElement('span');
  s.className = `ico ${clase}`.trim();
  if (etiqueta) { s.setAttribute('role', 'img'); s.setAttribute('aria-label', etiqueta); } else s.setAttribute('aria-hidden', 'true');
  s.dataset.ico = nombre;
  s.innerHTML = svgIcono(nombre);
  return s;
}

/** Icono decorativo delante de un texto (títulos, botones, rótulos): [icono, …texto]. Tamaño y alineación: .ico-t. */
export const conIcono = (nombre, ...texto) => [icono(nombre, 'ico-t'), ...texto];

export const ICONOS = Object.keys(P);
export const existeIcono = (nombre) => Object.hasOwn(P, nombre);
