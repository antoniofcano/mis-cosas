// Motor de conocimiento náutico: glosario de conceptos que usan los ejercicios (campo `concepts`).
// Texto breve y exacto, pensado para leerse en una tarjeta o para que una IA lo cite sin buscar más.

export const GLOSSARY = {
  Rv: { term: 'Rumbo verdadero (Rv)', text: 'Ángulo entre el norte verdadero (geográfico) y la línea proa-popa, de 0° a 360° en sentido horario. Es el único rumbo que se traza en la carta.' },
  Ra: { term: 'Rumbo de aguja (Ra)', text: 'Rumbo que marca la aguja (compás) del barco; referido al norte de aguja. Es el que gobierna el timonel.' },
  Rm: { term: 'Rumbo magnético (Rm)', text: 'Rumbo referido al norte magnético. Rm = Ra + Δ; Rv = Rm + dm.' },
  dm: { term: 'Declinación magnética (dm)', text: 'Ángulo entre el norte verdadero y el magnético. Depende del lugar y del año: la carta da su valor para un año y su variación anual. E = +, W = −.' },
  desvio: { term: 'Desvío (Δ)', text: 'Ángulo entre el norte magnético y el de aguja, causado por los hierros y campos del propio barco. Cambia con el rumbo (tablilla de desvíos). E = +, W = −.' },
  Ct: { term: 'Corrección total (Ct)', text: 'Ct = dm + Δ. Pasa de aguja a verdadero: Rv = Ra + Ct; Dv = Da + Ct. Al revés: Ra = Rv − Ct.' },
  demora: { term: 'Demora', text: 'Ángulo desde el norte hasta la visual a un objeto, medido desde el barco. Demora verdadera Dv = Da + Ct. En la carta se traza desde el objeto la demora opuesta (Dv ± 180°).' },
  marcacion: { term: 'Marcación (M)', text: 'Ángulo entre la proa y la visual a un objeto. Por estribor (+) o por babor (−). Dv = Rv + M.' },
  'linea-posicion': { term: 'Línea de posición', text: 'Lugar geométrico donde está el barco según una observación (una demora da una recta, una distancia da un círculo). Dos líneas que se cortan dan la situación.' },
  enfilacion: { term: 'Enfilación', text: 'Dos puntos vistos uno detrás del otro. Su demora verdadera se mide en la carta sin error, por eso sirve para calcular la Ct: Ct = Dv − Da.' },
  traslado: { term: 'Traslado de una línea de posición', text: 'Una línea de posición tomada antes se desplaza paralela a sí misma según el rumbo y la distancia navegados hasta la hora de la segunda observación.' },
  estima: { term: 'Navegación de estima', text: 'Calcular la situación a partir de la de salida, el rumbo y la distancia navegada (d = V · t), sin observaciones externas.' },
  distancia: { term: 'Distancia', text: 'En la carta Mercator se mide en la escala de latitudes (laterales), a la altura de la zona: 1 minuto de latitud = 1 milla náutica.' },
  ETA: { term: 'Hora estimada de llegada', text: 'Hora de salida + distancia / velocidad (efectiva, si hay corriente).' },
  corriente: { term: 'Corriente', text: 'Movimiento del agua. Su rumbo indica HACIA dónde va y su intensidad horaria, cuántas millas desplaza en 1 hora. Se suma vectorialmente a la velocidad del barco.' },
  Ref: { term: 'Rumbo efectivo (Ref)', text: 'Rumbo real sobre el fondo resultante de sumar el vector barco y el vector corriente.' },
  Vef: { term: 'Velocidad efectiva (Vef)', text: 'Velocidad real sobre el fondo con corriente: módulo de la suma vector barco + vector corriente.' },
  abatimiento: { term: 'Abatimiento (Ab)', text: 'Ángulo entre el rumbo verdadero y el de superficie debido al viento. El barco cae a sotavento: viento por babor → + ; viento por estribor → −.' },
  Rs: { term: 'Rumbo de superficie (Rs)', text: 'Rumbo que sigue el barco respecto al agua teniendo en cuenta el abatimiento. Rs = Rv + Ab.' },
  viento: { term: 'Viento', text: 'Se nombra por la dirección DE DONDE viene (viento del N sopla hacia el S), al contrario que la corriente.' },
};

export const concept = (key) => GLOSSARY[key];
