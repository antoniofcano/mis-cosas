"""Lectura óptica (OMR) de las hojas de respuestas escaneadas de Andalucía, sin OpenCV (solo numpy y PyMuPDF).

Uso: python3 -I hoja_optica.py <pdf>:<n> [<pdf>:<n> ...]   → JSON en la salida estándar.

La hoja oficial del IAD (2015–2026) tiene:
- marcas de sincronismo negras en el borde derecho, una por fila; las 25 filas de respuestas son el último tramo de
  marcas con paso regular;
- 4 bloques de 25 preguntas (1–25, 26–50, 51–75, 76–100), cada uno con el número y 4 burbujas a–d;
- la plantilla impresa en color (magenta en 2020, naranja después) y las marcas a lápiz en gris o negro.

Por eso se trabaja con dos canales: «tinta» = 255 − max(R,G,B) (solo lo gris o negro: lápiz y marcas de sincronismo)
y «color» = max − min (la plantilla impresa). Las filas salen de las marcas de sincronismo; las columnas, de ajustar
un peine de 4×4 burbujas (paso de burbuja y de bloque) al perfil horizontal de la plantilla en la banda de respuestas.
La puntuación de cada burbuja es la tinta media en un círculo centrado en ella (con un pequeño margen de búsqueda).
"""
import json
import sys

import numpy as np
import pymupdf

DPI = 100
# Geometría nominal a 100 ppp, medida sobre la hoja oficial; el ajuste busca alrededor de estos valores.
PASO_BURBUJA = 20.7
PASO_BLOQUE = 159.5
X0_NOMINAL = 149
UMBRAL_MINIMO = 25      # tinta neta mínima (sobre la de una burbuja vacía) para considerar marcada una burbuja (0–255)
UMBRAL_RELATIVO = 0.35  # … y al menos esta fracción de la tinta neta típica de una burbuja marcada en esa hoja
RELACION_MULTIPLE = 0.6 # si la 2.ª marca supera esta fracción de la 1.ª (y el umbral), la fila es «múltiple»
RELACION_DUDA = 0.35    # si la 2.ª supera esta fracción de la 1.ª (sin llegar a múltiple), la lectura es «dudosa»


def cargar(pdf):
    doc = pymupdf.open(pdf)
    pix = doc[0].get_pixmap(dpi=DPI)
    a = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)[:, :, :3].astype(np.int16)
    mx = a.max(2)
    mn = a.min(2)
    return (255 - mx), (mx - mn)


def marcas_sincronismo(tinta):
    h, w = tinta.shape
    zona = tinta[:, int(w * 0.93):]
    cuenta = (zona > 100).sum(1)
    grupos = []
    for y in np.where(cuenta >= 5)[0]:
        if grupos and y - grupos[-1][-1] <= 1:
            grupos[-1].append(y)
        else:
            grupos.append([y])
    return [float(np.mean(g)) for g in grupos if 3 <= len(g) <= 20]


def filas_respuestas(marcas, n=25):
    """Último tramo de ≥ n marcas con paso regular (las 25 filas de la cuadrícula)."""
    if len(marcas) < n:
        return None
    pasos = np.diff(marcas)
    paso = float(np.median(pasos))
    tramos = []
    ini = 0
    for i, p in enumerate(pasos):
        if abs(p - paso) > 0.25 * paso:
            tramos.append((ini, i))
            ini = i + 1
    tramos.append((ini, len(marcas) - 1))
    validos = [(a, b) for a, b in tramos if b - a + 1 >= n]
    if not validos:
        return None
    a, b = validos[-1]
    return marcas[b - n + 1:b + 1], paso


def ajustar_columnas(color, tinta, y0, y1, escala):
    # Perfil de la plantilla impresa (burbujas y números) + perfil de las marcas a lápiz: las marcas solo caen en
    # burbujas, así que impiden que el peine se desplace una columna hacia los números.
    impreso = np.convolve(((color[y0:y1] > 40) | (tinta[y0:y1] > 90)).sum(0).astype(float), np.ones(9) / 9, 'same')
    lapiz = np.convolve((tinta[y0:y1] > 90).sum(0).astype(float), np.ones(9) / 9, 'same')
    perfil = impreso / max(impreso.max(), 1) + 2 * lapiz / max(lapiz.max(), 1)
    mejor = None
    for p in np.arange(PASO_BURBUJA * escala * 0.94, PASO_BURBUJA * escala * 1.06, 0.1):
        for bp in np.arange(PASO_BLOQUE * escala * 0.96, PASO_BLOQUE * escala * 1.04, 0.25):
            xs_rel = np.array([b * bp + j * p for b in range(4) for j in range(4)])
            # Hueco a la derecha de la burbuja d de cada bloque (antes de los números del bloque siguiente): debe estar
            # vacío. Penalizarlo evita que el peine se corra una columna hacia los números cuando estos salen en el
            # escaneo más intensos que las burbujas (PY genérico 1/2025 y 1/2026).
            hueco_rel = np.array([b * bp + 4 * p for b in range(4)])
            for x0 in range(int(X0_NOMINAL * escala - 45), int(X0_NOMINAL * escala + 45)):
                xs = (x0 + xs_rel).astype(int)
                if xs[-1] >= len(perfil):
                    break
                s = perfil[xs].sum() - perfil[np.minimum((x0 + hueco_rel).astype(int), len(perfil) - 1)].sum()
                if mejor is None or s > mejor[0]:
                    mejor = (s, x0, p, bp)
    _, x0, p, bp = mejor
    return [[x0 + b * bp + j * p for j in range(4)] for b in range(4)], p, perfil


def puntuacion(tinta, x, y, r):
    """Tinta media en un círculo de radio r, buscando el centro en ±2 px."""
    h, w = tinta.shape
    mejor = 0.0
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
    disco = (xx ** 2 + yy ** 2) <= r * r
    for dy in (-2, -1, 0, 1, 2):
        for dx in (-2, -1, 0, 1, 2):
            cx, cy = int(round(x)) + dx, int(round(y)) + dy
            if cy - r < 0 or cx - r < 0 or cy + r >= h or cx + r >= w:
                continue
            v = float(tinta[cy - r:cy + r + 1, cx - r:cx + r + 1][disco].clip(0).mean())
            mejor = max(mejor, v)
    return mejor


def leer(pdf, n):
    tinta, color = cargar(pdf)
    res = {'archivo': pdf, 'n': n}
    marcas = marcas_sincronismo(tinta)
    fr = filas_respuestas(marcas)
    if not fr:
        res['error'] = 'no se encuentran las 25 marcas de sincronismo de la cuadrícula (%d marcas)' % len(marcas)
        return res
    ys, paso_y = fr
    escala = paso_y / 16.7
    cols, paso_x, _ = ajustar_columnas(color, tinta, int(ys[0] - 8 * escala), int(ys[-1] + 8 * escala), escala)
    r = max(3, int(round(4.5 * escala)))
    puntos = []
    for q in range(1, n + 1):
        b, f = divmod(q - 1, 25)
        puntos.append([round(puntuacion(tinta, x, ys[f], r), 1) for x in cols[b]])
    # Umbrales adaptados a cada hoja (hay escaneos con el lápiz muy claro): «base» = tinta de una burbuja vacía
    # (mediana de todas), «llena» = tinta típica de una burbuja marcada (percentil 90 de los máximos por fila).
    todas = np.array(puntos)
    base = float(np.median(todas))
    llena = float(np.percentile(todas.max(1), 90))
    umbral = max(UMBRAL_MINIMO, UMBRAL_RELATIVO * (llena - base))
    filas = []
    for q, pts in enumerate(puntos, start=1):
        neto = [v - base for v in pts]
        orden = sorted(range(4), key=lambda i: -neto[i])
        primero, segundo = neto[orden[0]], neto[orden[1]]
        if primero < umbral:
            estado, marca = 'vacia', ''
        elif segundo >= umbral and segundo >= RELACION_MULTIPLE * primero:
            estado = 'multiple'
            marca = ''.join('abcd'[i] for i in range(4) if neto[i] >= umbral and neto[i] >= RELACION_MULTIPLE * primero)
        else:
            estado, marca = 'ok', 'abcd'[orden[0]]
            if segundo >= RELACION_DUDA * primero:
                estado = 'dudosa'
        filas.append({'n': q, 'puntos': [round(v, 1) for v in neto], 'marca': marca, 'estado': estado})
    res.update({
        'geometria': {'pasoFila': round(paso_y, 2), 'pasoBurbuja': round(paso_x, 2), 'x0': round(cols[0][0], 1), 'y0': round(ys[0], 1)},
        'umbral': {'base': round(base, 1), 'llena': round(llena, 1), 'marca': round(umbral, 1)},
        'respuestas': filas,
    })
    return res


def main():
    salida = []
    for arg in sys.argv[1:]:
        pdf, n = arg.rsplit(':', 1)
        try:
            salida.append(leer(pdf, int(n)))
        except Exception as e:  # el informe recoge el fallo; no se detiene el lote
            salida.append({'archivo': pdf, 'n': int(n), 'error': repr(e)})
    json.dump(salida, sys.stdout, ensure_ascii=False)


if __name__ == '__main__':
    main()
