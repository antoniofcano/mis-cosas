"""Respuesta subrayada de los cuestionarios «con respuestas» de Murcia (CARM), con PyMuPDF.

Uso: python3 -I subrayado.py <pdf> [<pdf> ...]   → JSON [{ archivo, preguntas: [...] } | { archivo, error }]

La opción correcta va subrayada, y el subrayado es una línea vectorial (un segmento horizontal o un rectángulo de
menos de 2,5 puntos de alto), no un atributo del texto: pdftotext no lo ve. Lógica de
research_notes/…/murcia_herramientas/underline.py, ampliada:
- las líneas de texto de la misma altura se unen en una fila (Word separa a veces «c)» del texto de la opción);
- una opción son todas sus filas, hasta la opción, pregunta o sección siguiente: el subrayado de cualquiera de ellas
  cuenta (opciones de dos líneas justificadas, P17 del PY de marzo de 2015);
- una fila sigue siendo de la opción solo si está en la misma página y a menos de 20 puntos de la anterior (el
  rótulo subrayado «ESPACIO PARA OPERACIONES» que sigue a la última opción no cuenta);
- un segmento subraya una fila si está entre 3 puntos por encima y 4 por debajo de su base y se solapa con ella
  horizontalmente en al menos el 30 % de la fila (o 20 puntos);
- las preguntas se numeran «1.», «1.-», «17.-»; se sigue la secuencia (n = anterior + 1) para no confundir con
  números sueltos (páginas «1/10», tablas «18 - 27» de la portada).
Cada pregunta: { n, pagina, subrayadas: ['c'], opciones: 4, cobertura: {c: 0.93}, inicio: '…', textos: {a: '…', …} }
(textos: el de cada opción según PyMuPDF, para las opciones en columnas que pdftotext desordena).
"""
import json
import re
import sys

import pymupdf

RE_NUM = re.compile(r'^(\d{1,2})\s*(?:\.\s*-?|-)\s*(.*)$')
RE_OPC = re.compile(r'^([a-dA-D])\s*\)\s*(.*)$')
RE_SECCION = re.compile(r'^(unidad\s+te[óo]rica|m[óo]dulo\s+(gen[ée]rico|de\s+navegaci[óo]n))', re.I)
RE_INICIO = re.compile(r'^unidad\s+te[óo]rica\s*1\b', re.I)
RE_PAGINA = re.compile(r'^\d+\s*/\s*\d+$')
SALTO_MAX = 20  # puntos entre la base de una fila de la opción y la siguiente (interlineado normal: 12–15)


def segmentos(pagina):
    segs = []
    for dr in pagina.get_drawings():
        for it in dr['items']:
            if it[0] == 'l':
                a, b = it[1], it[2]
                if abs(a.y - b.y) < 1 and abs(b.x - a.x) > 3:
                    segs.append((min(a.x, b.x), max(a.x, b.x), (a.y + b.y) / 2))
            elif it[0] == 're':
                r = it[1]
                if r.height < 2.5 and r.width > 3:
                    segs.append((r.x0, r.x1, r.y1))
    return segs


def filas(pagina):
    """Líneas de texto de la página unidas por altura (base a ±2 puntos), en orden de lectura."""
    lineas = []
    for b in pagina.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            t = ''.join(s['text'] for s in l['spans'])
            if t.strip():
                lineas.append((l['bbox'], t))
    lineas.sort(key=lambda x: (round(x[0][3]), x[0][0]))
    out = []
    for (x0, y0, x1, y1), t in lineas:
        if out and abs(out[-1]['y1'] - y1) <= 2:
            f = out[-1]
            f['x0'], f['x1'] = min(f['x0'], x0), max(f['x1'], x1)
            f['partes'].append((x0, t))
        else:
            out.append({'x0': x0, 'x1': x1, 'y1': y1, 'partes': [(x0, t)]})
    for f in out:
        f['texto'] = ' '.join(t.strip() for _, t in sorted(f['partes'])).strip()
    return out


def cobertura(fila, segs):
    """Fracción de la fila cubierta por subrayados (0–1)."""
    ancho = max(fila['x1'] - fila['x0'], 1)
    cubierto = 0.0
    for sx0, sx1, sy in segs:
        if fila['y1'] - 3 <= sy <= fila['y1'] + 4:
            solape = min(sx1, fila['x1']) - max(sx0, fila['x0'])
            if solape > 0:
                cubierto += solape
    return min(cubierto / ancho, 1.0), cubierto


def leer(pdf):
    doc = pymupdf.open(pdf)
    preguntas = []
    q = None
    letra = None
    ultima = (0, 0.0)
    todas = []
    for n_pag, pagina in enumerate(doc, start=1):
        segs = segmentos(pagina)
        todas.extend((n_pag, segs, f) for f in filas(pagina))
    # La portada trae una tabla con «1 - 4», «18 - 27»…: las preguntas empiezan en «Unidad teórica 1» (si lo hay).
    inicio = next((i for i, (_, _, f) in enumerate(todas) if RE_INICIO.match(f['texto'])), 0)
    for n_pag, segs, f in todas[inicio:]:
        if True:
            t = f['texto']
            if RE_PAGINA.match(t):
                continue
            m = RE_NUM.match(t)
            esperado = (preguntas[-1]['n'] + 1) if preguntas else 1
            if m and int(m.group(1)) == esperado and (not q or len(q['cob']) >= 2):
                q = {'n': esperado, 'pagina': n_pag, 'cob': {}, 'inicio': m.group(2)[:60]}
                preguntas.append(q)
                letra = None
                continue
            if RE_SECCION.match(t):
                letra = None
                continue
            mo = RE_OPC.match(t)
            if mo and q is not None:
                l = mo.group(1).lower()
                if l == 'abcd'[len(q['cob'])] if len(q['cob']) < 4 else False:
                    letra = l
                    q['cob'][letra] = 0.0
                    q.setdefault('_px', {})[letra] = 0.0
                    q.setdefault('_txt', {})[letra] = mo.group(2).strip()
            if q is not None and letra and not mo and (n_pag != ultima[0] or f['y1'] - ultima[1] > SALTO_MAX):
                letra = None  # lejos de la fila anterior: ya no es la opción («ESPACIO PARA OPERACIONES», pie, tabla)
            if q is not None and letra:
                if not mo:
                    q['_txt'][letra] = (q['_txt'][letra] + ' ' + t).strip()
                ultima = (n_pag, f['y1'])
                frac, px = cobertura(f, segs)
                q['_px'][letra] += px
                q['cob'][letra] = max(q['cob'][letra], frac)
            elif q is not None and not q['inicio']:
                q['inicio'] = t[:60]
    out = []
    for q in preguntas:
        sub = sorted(l for l, c in q['cob'].items() if c >= 0.3 or q['_px'].get(l, 0) >= 20) if q['cob'] else []
        out.append({'n': q['n'], 'pagina': q['pagina'], 'opciones': len(q['cob']), 'subrayadas': sub,
                    'cobertura': {l: round(c, 2) for l, c in q['cob'].items()}, 'inicio': q['inicio'],
                    'textos': q.get('_txt', {})})
    return out


def main():
    salida = []
    for pdf in sys.argv[1:]:
        try:
            salida.append({'archivo': pdf, 'preguntas': leer(pdf)})
        except Exception as e:  # el informe recoge el fallo; no se detiene el lote
            salida.append({'archivo': pdf, 'error': repr(e)})
    json.dump(salida, sys.stdout, ensure_ascii=False)


if __name__ == '__main__':
    main()
