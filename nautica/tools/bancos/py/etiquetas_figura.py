"""Rótulos de las figuras de un cuestionario en PDF de texto (PyMuPDF).

Uso: python3 -I etiquetas_figura.py <pdf> [<pdf> ...]   → JSON { <pdf>: [[página, texto], ...] }

Las figuras vectoriales (banderas, marcas, luces) llevan rótulos de texto («Blanco», «Azul», «Rojo»…) que pdftotext
mezcla con el texto de las opciones. Se consideran rótulos las líneas de texto cuyo centro cae dentro del rectángulo
de una imagen o de un dibujo relleno de al menos 30×30 puntos (con 3 puntos de margen) y que son cortas (≤ 4 palabras):
así no se toca el texto normal que pasa por encima de un recuadro de fondo.
"""
import json
import sys

import pymupdf

MIN_LADO = 30
MARGEN = 3
MAX_PALABRAS = 4


def rectangulos(pagina):
    rs = []
    for img in pagina.get_images():
        try:
            rs.extend(pagina.get_image_rects(img[0]))
        except Exception:  # imagen sin referencia en la página
            pass
    for d in pagina.get_drawings():
        r = d.get('rect')
        if r is not None and d.get('fill') is not None and r.width >= MIN_LADO and r.height >= MIN_LADO:
            rs.append(r)
    # Un recuadro que ocupa casi toda la anchura es un fondo o un marco, no una figura.
    ancho = pagina.rect.width
    return [r for r in rs if r.width < 0.6 * ancho]


def rotulos(pdf):
    out = []
    doc = pymupdf.open(pdf)
    for n, pagina in enumerate(doc, start=1):
        rs = rectangulos(pagina)
        if not rs:
            continue
        for b in pagina.get_text('dict')['blocks']:
            if b.get('type') != 0:
                continue
            for linea in b['lines']:
                texto = ''.join(s['text'] for s in linea['spans']).strip()
                if not texto or len(texto.split()) > MAX_PALABRAS:
                    continue
                x0, y0, x1, y1 = linea['bbox']
                cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
                for r in rs:
                    if r.x0 - MARGEN <= cx <= r.x1 + MARGEN and r.y0 - MARGEN <= cy <= r.y1 + MARGEN:
                        out.append([n, texto])
                        break
    return out


def main():
    salida = {}
    for pdf in sys.argv[1:]:
        try:
            salida[pdf] = rotulos(pdf)
        except Exception as e:  # un PDF raro no detiene el lote
            salida[pdf] = {'error': repr(e)}
    json.dump(salida, sys.stdout, ensure_ascii=False)


if __name__ == '__main__':
    main()
