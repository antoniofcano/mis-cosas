// Ejercicios de «Las cuentas del patrón» (apéndice de matemáticas): cada uno se genera con números nuevos cada vez
// (con semilla, reproducible) y se resuelve con la calculadora. Funciones puras: la vista solo pinta el enunciado,
// lee la respuesta y enseña los pasos.
//
// Un generador devuelve:
//   { enunciado, tipo, respuesta, tolerancia, solucion, pasos: [texto], teclas }
//   tipo: 'numero' (con coma o punto) · 'gms' (grados, minutos y segundos, o grados con decimales) ·
//         'signo' (con signo o con E/W, N/S: Ct, dm, A, Δl) · 'rumbo' (circular 0–360°) · 'hora' (hh:mm) ·
//         'duracion' (1 h 35 min, 1:35 o 1,58 h)
//   tolerancia: en las unidades de la respuesta (grados, millas, minutos de hora para hora/duración…)
// La notación es la de las clases: Ct = dm + Δ, E +, W −; Δl = D · cos R; A = D · sen R; ΔL = A / cos lm.

import { norm360, norm180 } from '../math/angles.js';
import { parseAngle, parseClock, parseDuration } from '../math/format.js';
import { textoSexagesimal } from '../calculadora/motor.js';
import { cuenta } from '../texto.js';

const RAD = Math.PI / 180;
const sen = (g) => Math.sin(g * RAD);
const cos = (g) => Math.cos(g * RAD);
const pad = (n, w = 2) => String(n).padStart(w, '0');
/** Número con coma decimal y `dec` decimales. */
export const num = (x, dec = 1) => (Math.round(x * 10 ** dec) / 10 ** dec).toFixed(dec).replace('.', ',').replace('-', '−');
const red = (x, dec) => Math.round(x * 10 ** dec) / 10 ** dec;

/** Grados → «36° 27′ 36″» (segundos enteros, con acarreo). */
export function gms(x) {
  const sg = x < 0 ? '−' : '';
  const t = Math.round(Math.abs(x) * 3600);
  return `${sg}${Math.floor(t / 3600)}° ${pad(Math.floor((t % 3600) / 60))}′ ${pad(t % 60)}″`;
}
/** Grados → «36° 05,2′» (minutos con una decimal, con acarreo). */
export function gm(x, dec = 1) {
  const sg = x < 0 ? '−' : '';
  const t = Math.round(Math.abs(x) * 60 * 10 ** dec) / 10 ** dec;
  const g = Math.floor(t / 60 + 1e-9);
  return `${sg}${g}° ${num(t - g * 60, dec).padStart(dec ? 3 + dec : 2, '0')}′`;
}
/** Minutos desde las 00:00 → «hh:mm» (da la vuelta al día). */
export const reloj = (min) => { const m = ((Math.round(min) % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
/** Horas → «1 h 35 min». */
export function hm(horas) {
  const t = Math.round(horas * 60);
  return `${Math.floor(t / 60)} h ${pad(t % 60)} min`;
}
/** Ángulo con signo → «4° E (+4°)» o «3° 30′ W (−3,5°)». */
export function conSigno(x, { e = 'E', w = 'W' } = {}) {
  if (Math.abs(x) < 1e-9) return '0°';
  const a = Math.abs(x);
  const g = Math.floor(a + 1e-9);
  const m = Math.round((a - g) * 60);
  return `${g}°${m ? ` ${pad(m)}′` : ''} ${x > 0 ? e : w} (${x > 0 ? '+' : '−'}${num(a, Number.isInteger(red(a, 6)) ? 0 : 2).replace(/(,\d*?)0+$/, '$1').replace(/,$/, '')}°)`;
}
const rumbo = (x, dec = 0) => { const v = red(norm360(x), dec); return `${num(v >= 360 ? 0 : v, dec).padStart(dec ? 4 + dec : 3, '0')}°`; };

// ---------------------------------------------------------------------------
// Generadores, por clase del apéndice

const GENERADORES = {
  // 1. Grados, minutos y segundos
  'gms-a-decimal': (rng) => {
    const g = rng.int(1, 89); const m = rng.int(0, 59); const s = rng.int(1, 59);
    const x = g + m / 60 + s / 3600;
    return {
      enunciado: `Pasa ${g}° ${pad(m)}′ ${pad(s)}″ a grados con decimales (cuatro decimales).`,
      tipo: 'numero', respuesta: x, tolerancia: 0.0001, solucion: `${num(x, 4)}°`,
      pasos: [`Los minutos entre 60 y los segundos entre 3600: ${g} + ${m} / 60 + ${s} / 3600.`, `${g} + ${num(m / 60, 4)} + ${num(s / 3600, 4)} = **${num(x, 4)}°**.`],
      teclas: `${g} °′″ ${m} °′″ ${s} °′″ =  y después °′″ (pasa a decimal): ${red(x, 6)}`,
    };
  },
  'decimal-a-gms': (rng) => {
    const x = rng.int(1, 89) + rng.int(1, 9999) / 10000;
    const g = Math.floor(x); const mm = (x - g) * 60; const m = Math.floor(mm + 1e-9); const s = (mm - m) * 60;
    return {
      enunciado: `Pasa ${num(x, 4)}° a grados, minutos y segundos (segundos enteros).`,
      tipo: 'gms', respuesta: x, tolerancia: 1 / 3600, solucion: gms(x),
      pasos: [`Los grados enteros: **${g}°**.`, `Lo que queda, por 60, son minutos: ${num(x - g, 4)} × 60 = ${num(mm, 3)} → **${m}′**.`,
        `Lo que queda, por 60, son segundos: ${num(mm - m, 3)} × 60 = ${num(s, 1)} → **${Math.round(s)}″**. Resultado: **${gms(x)}**.`],
      teclas: `${num(x, 4).replace(',', '.')} = y después °′″: ${textoSexagesimal(x)}`,
    };
  },
  'sumar-gm': (rng) => {
    const ka = rng.int(300, 599); // décimas de minuto: entre los dos pasan de 60′ (hay que llevarse 1°)
    const a = rng.int(5, 40) + ka / 600;
    const b = rng.int(1, 20) + rng.int(Math.max(601 - ka, 100), 599) / 600;
    const x = a + b;
    return {
      enunciado: `Suma ${gm(a)} + ${gm(b)}.`,
      tipo: 'gms', respuesta: x, tolerancia: 0.06 / 60, solucion: gm(x),
      pasos: [`Suma por separado grados y minutos: ${Math.floor(a) + Math.floor(b)}° y ${num((a % 1) * 60 + (b % 1) * 60)}′.`,
        `Como los minutos pasan de 60, quita 60′ y suma 1°: **${gm(x)}**.`],
      teclas: `${Math.floor(a)} °′″ ${red((a % 1) * 60, 1)} °′″ + ${Math.floor(b)} °′″ ${red((b % 1) * 60, 1)} °′″ =`,
    };
  },
  'restar-gm': (rng) => {
    const kb = rng.int(300, 599);
    const b = rng.int(1, 30) + kb / 600;
    const a = b + rng.int(1, 20) + rng.int(601 - kb, 599) / 600; // los minutos de a quedan por debajo: hay que pedir prestado
    const x = a - b;
    return {
      enunciado: `Resta ${gm(a)} − ${gm(b)}.`,
      tipo: 'gms', respuesta: x, tolerancia: 0.06 / 60, solucion: gm(x),
      pasos: [`Los minutos de arriba (${num((a % 1) * 60)}′) son menos que los de abajo: pide 1° prestado, que son 60′: ${Math.floor(a) - 1}° ${num((a % 1) * 60 + 60)}′.`,
        `Ahora resta: ${Math.floor(a) - 1 - Math.floor(b)}° y ${num((a % 1) * 60 + 60 - (b % 1) * 60)}′ = **${gm(x)}**.`],
      teclas: `${Math.floor(a)} °′″ ${red((a % 1) * 60, 1)} °′″ − ${Math.floor(b)} °′″ ${red((b % 1) * 60, 1)} °′″ =`,
    };
  },
  'diferencia-latitud': (rng) => {
    const l1 = 35 + rng.int(300, 1199) / 600; // 35°30′ – 36°59,8′
    const d = rng.int(25, 400) / 10; // minutos
    const sur = rng.bool();
    const l2 = sur ? l1 - d / 60 : l1 + d / 60;
    return {
      enunciado: `Sales de la latitud ${gm(l1)} N y llegas a ${gm(l2)} N. ¿Cuántos minutos de latitud (Δl) has navegado? (1′ de latitud = 1 milla)`,
      tipo: 'numero', respuesta: d, tolerancia: 0.06, solucion: `${num(d)}′ (${num(d)} millas) al ${sur ? 'S' : 'N'}`,
      pasos: [`Resta la menor de la mayor: ${gm(Math.max(l1, l2))} − ${gm(Math.min(l1, l2))} = ${gm(d / 60)}.`, `Pásalo todo a minutos: **${num(d)}′**, que son ${num(d)} millas hacia el ${sur ? 'S' : 'N'}.`],
      teclas: `(${gm(Math.max(l1, l2)).replace(/ /g, '')} − ${gm(Math.min(l1, l2)).replace(/ /g, '')}) × 60 =`,
    };
  },

  // 2. Horas
  'hm-a-decimal': (rng) => {
    const h = rng.int(1, 5); const m = rng.int(1, 59);
    const x = h + m / 60;
    return {
      enunciado: `Pasa ${h} h ${pad(m)} min a horas con decimales (dos decimales).`,
      tipo: 'numero', respuesta: x, tolerancia: 0.006, solucion: `${num(x, 2)} h`,
      pasos: [`Los minutos entre 60: ${m} / 60 = ${num(m / 60, 2)}.`, `${h} + ${num(m / 60, 2)} = **${num(x, 2)} h**.`],
      teclas: `${h} °′″ ${m} °′″ =  y después °′″: ${red(x, 4)}`,
    };
  },
  'decimal-a-hm': (rng) => {
    const x = rng.int(1, 4) + rng.int(3, 97) / 100;
    return {
      enunciado: `Te sale un tiempo de ${num(x, 2)} h. ¿Cuántas horas y minutos son?`,
      tipo: 'duracion', respuesta: x, tolerancia: 1, solucion: hm(x),
      pasos: [`La parte entera son las horas: **${Math.floor(x)} h**.`, `La parte decimal, por 60, son los minutos: ${num(x % 1, 2)} × 60 = ${num((x % 1) * 60)} → **${Math.round((x % 1) * 60)} min**.`],
      teclas: `${num(x, 2).replace(',', '.')} = y después °′″: ${textoSexagesimal(x)} (horas, minutos y segundos)`,
    };
  },
  'hora-llegada': (rng) => {
    const d = rng.int(40, 300) / 10; const v = rng.pick([4, 5, 6, 7, 8, 9, 10, 12]);
    const sal = rng.int(6, 18) * 60 + rng.step(0, 55, 5);
    const t = d / v; const lle = sal + t * 60;
    return {
      enunciado: `Te quedan ${num(d)} millas hasta el puerto y navegas a ${v} nudos. Si son las ${reloj(sal)} (HRB), ¿a qué hora llegas?`,
      tipo: 'hora', respuesta: lle, tolerancia: 1, solucion: reloj(lle),
      pasos: [`Tiempo = distancia / velocidad = ${num(d)} / ${v} = ${num(t, 3)} h.`, `${num(t, 3)} h son ${hm(t)} (la parte decimal, por 60).`, `Llegada: ${reloj(sal)} + ${hm(t)} = **${reloj(lle)}**.`],
      teclas: `${d} ÷ ${v} = °′″ (${textoSexagesimal(t)}) y luego + ${Math.floor(sal / 60)} °′″ ${sal % 60} °′″ =`,
    };
  },
  medianoche: (rng) => {
    const sal = rng.int(20, 23) * 60 + rng.step(0, 55, 5);
    const dur = 1440 - sal + rng.int(5, 300); // siempre pasa de medianoche
    const lle = sal + dur;
    return {
      enunciado: `Sales a las ${reloj(sal)} y la travesía dura ${hm(dur / 60)}. ¿A qué hora llegas?`,
      tipo: 'hora', respuesta: lle, tolerancia: 0, solucion: `${reloj(lle)} del día siguiente`,
      pasos: [`Suma horas con horas y minutos con minutos: ${reloj(sal)} + ${hm(dur / 60)} = ${Math.floor(lle / 60)} h ${pad(lle % 60)} min.`,
        `Pasa de 24 h: resta 24. Son las **${reloj(lle)}** del día siguiente.`],
      teclas: `${Math.floor(sal / 60)} °′″ ${sal % 60} °′″ + ${Math.floor(dur / 60)} °′″ ${dur % 60} °′″ = (${Math.floor(lle / 60)}°${lle % 60}′0″) y resta 24`,
    };
  },
  'hora-ut': (rng) => {
    if (rng.bool()) {
      const adel = rng.pick([1, 2]);
      const of = rng.bool(0.3) ? rng.int(0, 1) * 60 + rng.step(0, 55, 5) : rng.int(2, 23) * 60 + rng.step(0, 55, 5);
      const ut = of - adel * 60;
      return {
        enunciado: `Son las ${reloj(of)} de hora oficial y el adelanto es de ${adel} h (TU + ${adel}). ¿Qué hora es en UT (TU), la del Anuario de Mareas?`,
        tipo: 'hora', respuesta: ut, tolerancia: 0, solucion: `${reloj(ut)} UT${ut < 0 ? ' del día anterior' : ''}`,
        pasos: [`UT = hora oficial − adelanto = ${reloj(of)} − ${adel} h.`, ut < 0 ? `Sale negativa: suma 24 h. Son las **${reloj(ut)} UT del día anterior**.` : `**${reloj(ut)} UT**.`],
        teclas: `${Math.floor(of / 60)} °′″ ${of % 60} °′″ − ${adel} =`,
      };
    }
    const huso = rng.int(1, 6) * (rng.bool() ? 1 : -1);
    const tu = rng.int(0, 23) * 60 + rng.step(0, 55, 5);
    const hz = tu + huso * 60;
    return {
      enunciado: `Son las ${reloj(tu)} TU y estás en el huso ${Math.abs(huso)} ${huso > 0 ? 'E' : 'W'}. ¿Qué hora legal (Hz) tienes?`,
      tipo: 'hora', respuesta: hz, tolerancia: 0, solucion: `${reloj(hz)}${hz >= 1440 ? ' del día siguiente' : hz < 0 ? ' del día anterior' : ''}`,
      pasos: [`Hz = TU ± huso: al E se suma y al W se resta.`, `${reloj(tu)} ${huso > 0 ? '+' : '−'} ${Math.abs(huso)} h = **${reloj(hz)}**${hz >= 1440 || hz < 0 ? ' (cambia el día)' : ''}.`],
      teclas: `${Math.floor(tu / 60)} °′″ ${tu % 60} °′″ ${huso > 0 ? '+' : '−'} ${Math.abs(huso)} =`,
    };
  },
  velocidad: (rng) => {
    const v = rng.int(40, 120) / 10; const t = rng.int(61, 170); const d = red(v * t / 60, 1);
    const vv = d / (t / 60);
    return {
      enunciado: `Has navegado ${num(d)} millas en ${hm(t / 60)}. ¿A qué velocidad vas? (nudos, una decimal)`,
      tipo: 'numero', respuesta: vv, tolerancia: 0.06, solucion: `${num(vv)} nudos`,
      pasos: [`El tiempo, en horas: ${hm(t / 60)} = ${num(t / 60, 3)} h.`, `Velocidad = distancia / tiempo = ${num(d)} / ${num(t / 60, 3)} = **${num(vv)} nudos**.`],
      teclas: `${d} ÷ ${Math.floor(t / 60)} °′″ ${t % 60} °′″ =`,
    };
  },

  // 3. Signos y rumbos
  'ct-suma': (rng) => {
    const dm = rng.int(1, 6) * (rng.bool() ? -1 : 1); const de = rng.int(1, 8) * (rng.bool() ? -1 : 1);
    const ct = dm + de;
    const dmTxt = `${Math.abs(dm)}° ${dm < 0 ? rng.pick(['W', 'NW']) : rng.pick(['E', 'NE'])}`;
    const deTxt = rng.bool() ? `${de > 0 ? '+' : '−'}${Math.abs(de)}°` : `${Math.abs(de)}° ${de > 0 ? 'NE' : 'NW'}`;
    return {
      enunciado: `La declinación es ${dmTxt} y el desvío ${deTxt}. ¿Cuánto vale la corrección total? (con signo, o con E/W)`,
      tipo: 'signo', respuesta: ct, tolerancia: 0.05, solucion: conSigno(ct),
      pasos: [`Pasa cada uno a número: E o NE es +, W o NW es −. dm = ${dm > 0 ? '+' : '−'}${Math.abs(dm)}°, Δ = ${de > 0 ? '+' : '−'}${Math.abs(de)}°.`,
        `Ct = dm + Δ = (${dm > 0 ? '+' : '−'}${Math.abs(dm)}) + (${de > 0 ? '+' : '−'}${Math.abs(de)}) = **${ct > 0 ? '+' : ct < 0 ? '−' : ''}${Math.abs(ct)}°**${ct ? ` (${Math.abs(ct)}° ${ct > 0 ? 'NE' : 'NW'})` : ''}.`],
      teclas: `${dm < 0 ? '(−) ' : ''}${Math.abs(dm)} + ${de < 0 ? '(−) ' : ''}${Math.abs(de)} =`,
    };
  },
  'rv-ra': (rng) => {
    const ct = rng.int(1, 9) * (rng.bool() ? -1 : 1);
    const aRv = rng.bool();
    // Cerca del norte la mitad de las veces: así hay que sumar o restar 360°
    const suma = aRv ? ct : -ct;
    const r = rng.bool() ? norm360(rng.int(-8, 8) + (suma > 0 ? 355 : 4)) : rng.int(10, 350);
    const res = norm360(aRv ? r + ct : r - ct);
    const cruza = Math.abs((aRv ? r + ct : r - ct) - res) > 1e-9;
    const ctTxt = `${ct > 0 ? '+' : '−'}${Math.abs(ct)}°`;
    return {
      enunciado: aRv ? `Navegas al Ra ${rumbo(r)} con una Ct de ${ctTxt}. ¿Qué rumbo verdadero (Rv) trazas en la carta?`
        : `En la carta mides un Rv de ${rumbo(r)} y la Ct es ${ctTxt}. ¿Qué rumbo de aguja (Ra) das al timonel?`,
      tipo: 'rumbo', respuesta: res, tolerancia: 0.05, solucion: rumbo(res),
      pasos: [aRv ? `Rv = Ra + Ct = ${rumbo(r)} + (${ctTxt}) = ${num(r + ct, 0)}°.` : `Ra = Rv − Ct = ${rumbo(r)} − (${ctTxt}) = ${num(r - ct, 0)}°.`,
        cruza ? `${(aRv ? r + ct : r - ct) < 0 ? 'Sale negativo: suma 360°' : 'Pasa de 360°: resta 360°'}. Queda **${rumbo(res)}**.` : `Queda **${rumbo(res)}**.`],
      teclas: `${r} ${aRv ? '+' : '−'} ${ct < 0 ? '(−) ' : ''}${Math.abs(ct)} =${cruza ? ((aRv ? r + ct : r - ct) < 0 ? ' + 360 =' : ' − 360 =') : ''}`,
    };
  },
  'cuadrantal-circular': (rng) => {
    const ns = rng.pick(['N', 'S']); const ew = rng.pick(['E', 'W']); const x = rng.int(1, 89);
    const c = ns === 'N' ? (ew === 'E' ? x : 360 - x) : (ew === 'E' ? 180 - x : 180 + x);
    const regla = { NE: 'N x E = x', SE: 'S x E = 180° − x', SW: 'S x W = 180° + x', NW: 'N x W = 360° − x' }[ns + ew];
    return {
      enunciado: `Pasa el rumbo cuadrantal ${ns} ${x}° ${ew} a circular.`,
      tipo: 'rumbo', respuesta: c, tolerancia: 0.05, solucion: rumbo(c),
      pasos: [`Cuadrante ${ns}${ew}: ${regla}.`, `Con x = ${x}°: **${rumbo(c)}**.`],
      teclas: ns === 'N' && ew === 'E' ? 'Sin cuenta: es el mismo número.' : ns === 'N' ? `360 − ${x} =` : `180 ${ew === 'E' ? '−' : '+'} ${x} =`,
    };
  },
  'ct-enfilacion': (rng) => {
    const ct = rng.int(1, 9) * (rng.bool() ? -1 : 1);
    const dv = rng.bool() ? norm360(rng.int(-6, 6) + (ct > 0 ? 3 : 357)) : rng.int(15, 345);
    const da = norm360(dv - ct);
    const bruto = dv - da;
    return {
      enunciado: `Navegas en la enfilación de dos faros: en la carta su demora verdadera es Dv = ${rumbo(dv)}. La aguja da Da = ${rumbo(da)}. ¿Cuánto vale la Ct?`,
      tipo: 'signo', respuesta: ct, tolerancia: 0.05, solucion: conSigno(ct),
      pasos: [`Ct = Dv − Da = ${rumbo(dv)} − ${rumbo(da)} = ${num(bruto, 0)}°.`,
        Math.abs(bruto) > 180 ? `Pasa de 180° en valor absoluto: ${bruto > 0 ? 'resta' : 'suma'} 360°. Ct = **${ct > 0 ? '+' : '−'}${Math.abs(ct)}°**.` : `Ct = **${ct > 0 ? '+' : '−'}${Math.abs(ct)}°** (${Math.abs(ct)}° ${ct > 0 ? 'NE' : 'NW'}).`],
      teclas: `${dv} − ${da} =${Math.abs(bruto) > 180 ? (bruto > 0 ? ' − 360 =' : ' + 360 =') : ''}`,
    };
  },
  'dm-del-ano': (rng) => {
    const dm0 = -(rng.int(1, 4) + rng.int(0, 5) * 10 / 60); // W, en grados
    const año0 = rng.pick([2005, 2010, 2015, 2016]);
    const vari = rng.int(5, 9); // minutos E por año
    const año = rng.int(2024, 2027);
    const dm = dm0 + ((año - año0) * vari) / 60;
    return {
      enunciado: `La rosa de la carta dice «${gm(-dm0, 0).replace(' ', '')} W ${año0} (${vari}′ E)». ¿Cuánto vale la declinación en ${año}? (en grados y minutos, con su signo o con E/W)`,
      tipo: 'signo', respuesta: dm, tolerancia: 0.6 / 60, solucion: `${gm(Math.abs(dm), 0).replace(' ', '')} ${dm < 0 ? 'W' : 'E'} (${dm < 0 ? '−' : '+'}${gm(Math.abs(dm), 0).replace(' ', '')})`,
      pasos: [`Años: ${año} − ${año0} = ${año - año0}. Variación: ${año - año0} × ${vari}′ = ${(año - año0) * vari}′ = ${gm(((año - año0) * vari) / 60, 0).replace(' ', '')} hacia el E (+).`,
        `dm = −${gm(-dm0, 0).replace(' ', '')} + ${gm(((año - año0) * vari) / 60, 0).replace(' ', '')} = **${dm < 0 ? '−' : '+'}${gm(Math.abs(dm), 0).replace(' ', '')}** (${dm < 0 ? 'W' : 'E'}). En el examen se redondea al grado: ${Math.round(Math.abs(dm)) === 0 ? '0°' : `${Math.round(Math.abs(dm))}° ${dm < 0 ? 'W' : 'E'}`}.`],
      teclas: `(−) ${Math.floor(-dm0)} °′″ ${Math.round((-dm0 % 1) * 60)} °′″ + ${año - año0} × 0 °′″ ${vari} °′″ =`,
    };
  },

  // 4. Trigonometría del triángulo de rumbo (PY)
  apartamiento: (rng) => {
    const D = rng.int(50, 600) / 10; const R = rng.pick([rng.int(5, 85), rng.int(95, 175), rng.int(185, 265), rng.int(275, 355)]);
    const A = D * sen(R);
    return {
      enunciado: `Navegas ${num(D)} millas al rumbo ${rumbo(R)}. ¿Cuánto vale el apartamiento A = D · sen R? (millas, + E y − W, una decimal)`,
      tipo: 'signo', respuesta: A, tolerancia: 0.06, solucion: `${num(Math.abs(A))} millas al ${A > 0 ? 'E' : 'W'} (${A > 0 ? '+' : '−'}${num(Math.abs(A))})`,
      pasos: [`A = D · sen R = ${num(D)} · sen ${rumbo(R)} = ${num(D)} · ${sen(R) < 0 ? `(${num(sen(R), 4)})` : num(sen(R), 4)}.`, `A = **${num(A)} millas**: ${A > 0 ? 'positivo, hacia el E' : 'negativo, hacia el W'}. Con el rumbo circular la calculadora pone el signo sola.`],
      teclas: `${D} × sin ${R} ) =`,
    };
  },
  'dif-latitud': (rng) => {
    const D = rng.int(50, 600) / 10; const R = rng.pick([rng.int(5, 85), rng.int(95, 175), rng.int(185, 265), rng.int(275, 355)]);
    const dl = D * cos(R);
    return {
      enunciado: `Navegas ${num(D)} millas al rumbo ${rumbo(R)}. ¿Cuánto vale la diferencia de latitud Δl = D · cos R? (minutos, + N y − S, una decimal)`,
      tipo: 'signo', respuesta: dl, tolerancia: 0.06, solucion: `${num(Math.abs(dl))}′ al ${dl > 0 ? 'N' : 'S'} (${dl > 0 ? '+' : '−'}${num(Math.abs(dl))})`,
      pasos: [`Δl = D · cos R = ${num(D)} · cos ${rumbo(R)} = ${num(D)} · ${cos(R) < 0 ? `(${num(cos(R), 4)})` : num(cos(R), 4)}.`, `Δl = **${num(dl)}′**: ${dl > 0 ? 'positivo, hacia el N' : 'negativo, hacia el S'}.`],
      teclas: `${D} × cos ${R} ) =`,
    };
  },
  'rumbo-inverso': (rng) => {
    const dl = rng.int(30, 600) / 10 * (rng.bool() ? 1 : -1); const A = rng.int(30, 600) / 10 * (rng.bool() ? 1 : -1);
    const x = Math.atan(Math.abs(A) / Math.abs(dl)) / RAD;
    const R = norm360(Math.atan2(A, dl) / RAD);
    const ns = dl > 0 ? 'N' : 'S'; const ew = A > 0 ? 'E' : 'W';
    const regla = { NE: 'N x E = x', SE: 'S x E = 180° − x', SW: 'S x W = 180° + x', NW: 'N x W = 360° − x' }[ns + ew];
    return {
      enunciado: `Entre la salida y la llegada hay Δl = ${num(Math.abs(dl))}′ ${ns} y A = ${num(Math.abs(A))} millas ${ew}. ¿Cuál es el rumbo directo (circular, una decimal)?`,
      tipo: 'rumbo', respuesta: R, tolerancia: 0.15, solucion: rumbo(R, 1),
      pasos: [`tan R = A / Δl → x = tan⁻¹(${num(Math.abs(A))} / ${num(Math.abs(dl))}) = ${num(x, 1)}°: un ángulo cuadrantal.`,
        `El cuadrante lo dan los signos: Δl ${ns} y A ${ew} → ${ns} ${num(x, 1)}° ${ew}. ${regla} → **${rumbo(R, 1)}**.`],
      teclas: `SHIFT tan ${Math.abs(A)} ÷ ${Math.abs(dl)} ) =  y después el cuadrante`,
    };
  },
  'distancia-inversa': (rng) => {
    const dl = rng.int(30, 600) / 10; const A = rng.int(30, 600) / 10;
    const D = Math.hypot(dl, A);
    return {
      enunciado: `Entre dos situaciones hay Δl = ${num(dl)}′ y A = ${num(A)} millas. ¿Qué distancia hay? (millas, una decimal)`,
      tipo: 'numero', respuesta: D, tolerancia: 0.06, solucion: `${num(D)} millas`,
      pasos: [`D = √(Δl² + A²) = √(${num(dl)}² + ${num(A)}²) = √(${num(dl * dl, 2)} + ${num(A * A, 2)}).`, `D = **${num(D)} millas**.`],
      teclas: `√ ${dl} x² + ${A} x² ) =`,
    };
  },
  'dif-longitud': (rng) => {
    const A = rng.int(50, 900) / 10; const lm = rng.int(20, 60) + rng.pick([0, 0.5]);
    const dL = A / cos(lm);
    return {
      enunciado: `Te sale un apartamiento A = ${num(A)} millas con una latitud media lm = ${num(lm, 1)}°. ¿Cuántos minutos de longitud (ΔL) son? (una decimal)`,
      tipo: 'numero', respuesta: dL, tolerancia: 0.06, solucion: `${num(dL)}′`,
      pasos: [`ΔL = A / cos lm = ${num(A)} / cos ${num(lm, 1)}° = ${num(A)} / ${num(cos(lm), 4)}.`, `ΔL = **${num(dL)}′**. Comprobación: ΔL nunca es menor que A.`],
      teclas: `${A} ÷ cos ${lm} ) =`,
    };
  },
  'angulo-paso': (rng) => {
    const D = rng.int(40, 120) / 10; const d = rng.int(10, Math.floor(D * 10) - 10) / 10;
    const a = Math.asin(d / D) / RAD;
    return {
      enunciado: `Estás a ${num(D)} millas de un faro y quieres pasar a ${num(d)} millas de él. ¿Qué ángulo α forma la visual al faro con el rumbo? (sen α = d / D, una decimal)`,
      tipo: 'numero', respuesta: a, tolerancia: 0.15, solucion: `${num(a, 1)}°`,
      pasos: [`sen α = d / D = ${num(d)} / ${num(D)} = ${num(d / D, 4)}.`, `α = sen⁻¹ ${num(d / D, 4)} = **${num(a, 1)}°**. Con el faro por estribor, Rv = Dv − α; por babor, Rv = Dv + α.`],
      teclas: `SHIFT sin ${d} ÷ ${D} ) =`,
    };
  },

  // 5. Regla de tres y proporciones
  'distancia-tiempo': (rng) => {
    const v = rng.int(40, 120) / 10; const t = rng.int(10, 170);
    const d = (v * t) / 60;
    return {
      enunciado: `Navegas a ${num(v)} nudos. ¿Cuántas millas recorres en ${cuenta(t, 'minuto')}? (una decimal)`,
      tipo: 'numero', respuesta: d, tolerancia: 0.06, solucion: `${num(d)} millas`,
      pasos: [`Regla de tres: en 60 min, ${num(v)} millas; en ${t} min, x.`, `x = ${num(v)} × ${t} / 60 = **${num(d)} millas**.`],
      teclas: `${v} × ${t} ÷ 60 =`,
    };
  },
  'escala-latitudes': (rng) => {
    const cm = rng.int(150, 220) / 100; const millas = rng.int(15, 120) / 10; const abre = red(cm * millas, 1);
    const x = abre / cm;
    return {
      enunciado: `En la escala de latitudes de tu carta, 1′ (1 milla) mide ${num(cm, 2)} cm. El compás abre ${num(abre)} cm entre dos puntos. ¿Cuántas millas hay? (una decimal)`,
      tipo: 'numero', respuesta: x, tolerancia: 0.06, solucion: `${num(x)} millas`,
      pasos: [`Regla de tres: ${num(cm, 2)} cm son 1 milla; ${num(abre)} cm son x.`, `x = ${num(abre)} / ${num(cm, 2)} = **${num(x)} millas**. En el examen no hace falta: el compás se lleva a la escala de latitudes de la misma altura.`],
      teclas: `${abre} ÷ ${cm} =`,
    };
  },
  duodecimos: (rng) => {
    const A = rng.int(80, 480) / 100; const k = rng.int(1, 6); const acum = rng.bool();
    const fr = [1, 2, 3, 3, 2, 1];
    const doce = acum ? fr.slice(0, k).reduce((s, x) => s + x, 0) : fr[k - 1];
    const x = (A * doce) / 12;
    return {
      enunciado: acum ? `Marea de ${num(A, 2)} m de amplitud y 6 horas de duración. Con la regla de los duodécimos, ¿cuánto ha subido desde la bajamar al cabo de ${cuenta(k, 'hora')}? (metros, dos decimales)`
        : `Marea de ${num(A, 2)} m de amplitud y 6 horas de duración. Con la regla de los duodécimos, ¿cuánto sube durante la ${k}.ª hora? (metros, dos decimales)`,
      tipo: 'numero', respuesta: x, tolerancia: 0.006, solucion: `${num(x, 2)} m`,
      pasos: [`En cada sexto de la duración sube 1, 2, 3, 3, 2 y 1 doceavos de la amplitud.`,
        acum ? `En ${cuenta(k, 'hora')}: ${k > 1 ? `${fr.slice(0, k).join(' + ')} = ` : ''}${cuenta(doce, 'doceavo')}.` : `En la ${k}.ª hora: ${cuenta(doce, 'doceavo')}.`,
        `${doce} / 12 × ${num(A, 2)} = **${num(x, 2)} m**.`],
      teclas: `${doce} ÷ 12 × ${A} =`,
    };
  },
  interpolar: (rng) => {
    const t1 = rng.int(60, 300); const paso = rng.pick([10, 12, 15]); const t2 = t1 + paso;
    const h1 = rng.int(50, 250) / 100; const h2 = h1 + rng.int(8, 20) / 100;
    const h = red(h1 + (h2 - h1) * rng.int(2, 8) / 10, 2);
    const t = t1 + (paso * (h - h1)) / (h2 - h1);
    return {
      enunciado: `En la tabla de mareas, la fila de ${hm(t1 / 60)} da ${num(h1, 2)} m y la de ${hm(t2 / 60)} da ${num(h2, 2)} m. ¿Qué intervalo corresponde a ${num(h, 2)} m? (interpola, al minuto)`,
      tipo: 'duracion', respuesta: t / 60, tolerancia: 1, solucion: hm(t / 60),
      pasos: [`Entre las dos filas hay ${paso} min y ${num(h2 - h1, 2)} m. Te faltan ${num(h - h1, 2)} m desde la primera.`,
        `Regla de tres: ${paso} × ${num(h - h1, 2)} / ${num(h2 - h1, 2)} = ${num((paso * (h - h1)) / (h2 - h1), 1)} min.`,
        `${hm(t1 / 60)} + ${num((paso * (h - h1)) / (h2 - h1), 0)} min = **${hm(t / 60)}**.`],
      teclas: `${paso} × (${h} − ${h1}) ÷ (${red(h2, 2)} − ${h1}) =`,
    };
  },
};

/** Ids de los generadores (los que pueden ir en una tarjeta { tipo: 'cuenta', generador }). */
export const GENERADORES_CUENTAS = Object.keys(GENERADORES);

/** Un ejercicio nuevo del generador `id` con el generador de azar `rng` (src/math/rng.js). */
export function generaCuenta(id, rng) {
  const g = GENERADORES[id];
  if (!g) throw new Error(`Cuenta desconocida: ${id}`);
  return { id, ...g(rng) };
}

// ---------------------------------------------------------------------------
// Corrección

const limpia = (s) => String(s ?? '').trim().replace(/[′’´]/g, "'").replace(/[″”]/g, '"').replace(/−/g, '-').replace(/\s+/g, ' ');

/** Lee lo que ha escrito el alumno según el tipo de respuesta; NaN si no se entiende. */
export function leeRespuesta(tipo, texto) {
  const t = limpia(texto);
  if (!t) return NaN;
  switch (tipo) {
    case 'numero': return /^[+-]?\d+([.,]\d+)?$/.test(t.replace(/\s/g, '')) ? Number(t.replace(/\s/g, '').replace(',', '.')) : NaN;
    case 'gms': case 'rumbo': case 'signo': return parseAngle(t.replace(/(\d),(\d)/g, '$1.$2'));
    case 'hora': return parseClock(t.replace(/\s/g, ''));
    case 'duracion': { const h = parseDuration(t.replace(/(\d),(\d)/g, '$1.$2')); return Number.isFinite(h) ? h : NaN; }
    default: return NaN;
  }
}

/**
 * Corrige una respuesta: { estado: 'ok' | 'mal' | 'formato' | 'vacia', valor }.
 * Rumbos: la diferencia mínima entre direcciones. Horas: módulo 24 h (las 01:13 son las 25:13). Duraciones: en minutos.
 */
export function corrigeCuenta(ej, texto) {
  if (!String(texto ?? '').trim()) return { estado: 'vacia', valor: NaN };
  const v = leeRespuesta(ej.tipo, texto);
  if (!Number.isFinite(v)) return { estado: 'formato', valor: v };
  let err;
  if (ej.tipo === 'rumbo') err = Math.abs(norm180(v - ej.respuesta));
  else if (ej.tipo === 'hora') err = Math.abs(norm180(((v - ej.respuesta) / 4)) * 4); // minutos, con la vuelta al día
  else if (ej.tipo === 'duracion') err = Math.abs(v - ej.respuesta) * 60;
  else err = Math.abs(v - ej.respuesta);
  return { estado: err <= ej.tolerancia + 1e-9 ? 'ok' : 'mal', valor: v };
}

/** Ejemplo de cómo escribir la respuesta, para la casilla. */
export const EJEMPLO_RESPUESTA = {
  numero: 'Ej.: 12,5', gms: 'Ej.: 36 27 36 o 36,46', signo: 'Ej.: +4, −3,5 o 4 E', rumbo: 'Ej.: 045', hora: 'Ej.: 13:10', duracion: 'Ej.: 1 h 35 min o 1:35',
};
