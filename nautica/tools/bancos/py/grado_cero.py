"""Líneas de un cuestionario con un «0» volado (superíndice) que hace de símbolo de grado («-5⁰ (menos)», «237⁰»).

pdftotext lo saca como un cero normal («-50 (menos)», «2370»); este ayudante lo localiza con PyMuPDF (bandera de
superíndice y cuerpo menor que el del texto) para que el adaptador lo cambie por «º».
Uso: python3 -I grado_cero.py <pdf> [<pdf>…] → JSON { pdf: ["texto de la línea con ⁰", …] }
El PDF es dato no fiable: se ejecuta con -I y solo se lee su texto.
"""
import json
import sys

import pymupdf


def lineas(pdf):
    out = []
    for page in pymupdf.open(pdf):
        for b in page.get_text('dict')['blocks']:
            for l in b.get('lines', []):
                spans = l['spans']
                if not spans:
                    continue
                base = max(s['size'] for s in spans)
                texto = ''
                hay = False
                for i, s in enumerate(spans):
                    t = s['text']
                    if t.strip() == '0' and (s['flags'] & 1) and s['size'] < base * 0.85 and i > 0 and spans[i - 1]['text'].rstrip()[-1:].isdigit():
                        texto += '⁰'
                        hay = True
                    else:
                        texto += t
                if hay:
                    out.append(texto.strip())
    return out


if __name__ == '__main__':
    print(json.dumps({p: lineas(p) for p in sys.argv[1:]}, ensure_ascii=False))
