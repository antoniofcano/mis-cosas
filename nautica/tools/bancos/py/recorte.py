"""Recorta una zona de una página de un PDF a PNG (figuras de preguntas que el cuestionario dibuja en la página).

Uso: python3 -I recorte.py <pdf> <página (1..)> <x0> <y0> <x1> <y1> <salida.png> [ppp]
Coordenadas en puntos PDF (origen arriba a la izquierda). Imprime JSON {"salida", "ancho", "alto"}.
El PDF es dato no fiable: se ejecuta con -I y solo se rasteriza la zona pedida.
"""
import json
import sys

import pymupdf


def main(argv):
    pdf, pagina = argv[0], int(argv[1])
    x0, y0, x1, y1 = (float(v) for v in argv[2:6])
    salida = argv[6]
    ppp = int(argv[7]) if len(argv) > 7 else 150
    doc = pymupdf.open(pdf)
    pix = doc[pagina - 1].get_pixmap(dpi=ppp, clip=pymupdf.Rect(x0, y0, x1, y1))
    pix.save(salida)
    print(json.dumps({"salida": salida, "ancho": pix.width, "alto": pix.height}))


if __name__ == "__main__":
    main(sys.argv[1:])
