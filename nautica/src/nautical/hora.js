// La hora en la mar: huso, hora legal (del huso), hora civil del lugar y hora oficial. Minutos desde las 00:00;
// longitudes en grados, E positivas y W negativas. Lo usan la lámina de husos y el ejercicio de la hora.

/** Huso horario de una longitud: 15° por huso, centrado en los meridianos múltiplos de 15° (E +, W −). */
export const husoDe = (lon) => Math.sign(lon) * Math.round(Math.abs(lon) / 15);
/** Hora legal o del huso: Hz = TU + huso (E suma, W resta). */
export const horaLegal = (tuMin, lon) => tuMin + husoDe(lon) * 60;
/** Hora civil del lugar: HcL = TU + longitud en tiempo (1° = 4 min). */
export const horaCivilLugar = (tuMin, lon) => tuMin + lon * 4;
/** Hora oficial = TU + adelanto que fija el Gobierno (en la península, +1 h en invierno y +2 h en verano). */
export const horaOficial = (tuMin, adelanto) => tuMin + adelanto * 60;
export const tuDesdeOficial = (hoMin, adelanto) => hoMin - adelanto * 60;
