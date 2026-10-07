"""Genera los PDF sintéticos de tests/fixtures/bancos/ (no son documentos oficiales: el texto es inventado).

Uso (desde nautica/): python3 -I tests/fixtures/bancos/generar.py

- subrayado-sintetico.pdf: cuestionario «con respuestas» al estilo de Murcia (respuesta subrayada con una línea
  vectorial), con los casos difíciles de las muestras reales: tabla de portada con «1 - 10», «c)» separado del texto,
  opción de dos líneas subrayada, las cuatro opciones subrayadas, rótulo subrayado «ESPACIO PARA OPERACIONES» tras la
  última opción, una pregunta sin subrayar, pies «1/2» y «P.Y. - Tipo 1».
  Clave esperada: 1 b · 2 c · 3 abcd · 4 d · 5 (ninguna) · 6 a.
- hoja-optica-sintetica.pdf: hoja de lectura óptica escaneada al estilo de Andalucía (marcas de sincronismo, 4 bloques
  de 25 filas con número y burbujas a–d), con los números impresos más intensos que las burbujas (el caso que corría el
  peine una columna) y 20 respuestas: «abcdabcdab» + «dcba» + fila 15 en blanco + «abcda».
"""
import os

import numpy as np
import pymupdf

AQUI = os.path.dirname(os.path.abspath(__file__))


def subrayado():
    doc = pymupdf.open()
    p = doc.new_page(width=595, height=842)
    y = 60

    def texto(x, t, tam=10):
        nonlocal y
        p.insert_text((x, y), t, fontsize=tam, fontname='helv')

    def linea(x0, x1, yy):
        p.draw_line((x0, yy + 2), (x1, yy + 2), color=(0, 0, 0), width=0.6)

    def fila(t, x=85, sub=False, ancho=None):
        nonlocal y
        texto(x, t)
        if sub:
            linea(x + 14, x + (ancho or 6 * len(t)), y)
        y += 14

    for t in ['PRUEBA SINTÉTICA', 'Nº preguntas', '1 - 10', '18 - 27']:
        fila(t)
    y += 10
    fila('Unidad teórica 1: Materia de prueba')
    fila('1.- Primera pregunta de prueba:')
    fila('a) Opción uno.')
    fila('b) Opción dos.', sub=True)
    fila('c) Opción tres.')
    fila('d) Opción cuatro.')
    fila('2. Segunda pregunta, con una opción de dos líneas:')
    fila('a) Opción uno.')
    fila('b) Opción dos.')
    # «c)» y su texto como objetos separados en la misma altura; subrayado solo bajo el texto, en las dos líneas.
    texto(85, 'c)')
    texto(106, 'Una opción larga que ocupa dos líneas justificadas y')
    linea(106, 400, y)
    y += 14
    fila('continúa en la segunda línea.', sub=True, ancho=170)
    fila('d) Opción cuatro.')
    fila('3.-')
    fila('Tercera pregunta, con las cuatro opciones subrayadas:')
    for t in ['a) Uno.', 'b) Dos.', 'c) Tres.', 'd) Cuatro.']:
        fila(t, sub=True)
    texto(500, '1/2')
    y += 14
    texto(85, 'P.Y. - Tipo 1')
    p = doc.new_page(width=595, height=842)
    y = 60
    fila('4.- Cuarta pregunta de carta:')
    fila('a) 1242')
    fila('b) 1226')
    fila('c) 1302')
    fila('d) 1310', sub=True)
    y += 30
    fila('ESPACIO PARA OPERACIONES', sub=True, ancho=180)
    y += 30
    fila('5.- Quinta pregunta, sin ninguna opción subrayada:')
    for t in ['a) Uno.', 'b) Dos.', 'c) Tres.', 'd) Cuatro.']:
        fila(t)
    fila('6.- Sexta pregunta:')
    fila('a) Uno.', sub=True)
    for t in ['b) Dos.', 'c) Tres.', 'd) Cuatro.']:
        fila(t)
    texto(500, '2/2')
    doc.save(os.path.join(AQUI, 'subrayado-sintetico.pdf'), garbage=4, deflate=True)


def hoja_optica():
    w, h = 827, 1169  # A4 a 100 ppp
    img = np.full((h, w, 3), 255, dtype=np.uint8)
    paso_y, y0 = 16.7, 690.0
    x0, paso_b, paso_bl = 149.0, 20.7, 159.5
    naranja_claro = (250, 200, 160)  # burbujas impresas, pálidas
    naranja = (235, 120, 40)         # números impresos, intensos
    yy, xx = np.mgrid[0:h, 0:w]

    def disco(cx, cy, r, color, anillo=False):
        d2 = (xx - cx) ** 2 + (yy - cy) ** 2
        m = (d2 <= r * r) & ((d2 >= (r - 1.5) ** 2) if anillo else True)
        img[m] = color

    # Marcas de sincronismo: 5 de cabecera con otro paso y las 25 de la cuadrícula.
    for y in [100 + 30 * i for i in range(5)] + [y0 + paso_y * i for i in range(25)]:
        img[int(y) - 3:int(y) + 3, 790:805] = 0
    respuestas = 'abcdabcdab' + 'dcba' + ' ' + 'abcda'
    for b in range(4):
        for f in range(25):
            y = y0 + paso_y * f
            xn = x0 + b * paso_bl - 26
            img[int(y) - 5:int(y) + 5, int(xn) - 5:int(xn) + 5] = naranja
            for j in range(4):
                disco(x0 + b * paso_bl + j * paso_b, y, 6, naranja_claro, anillo=True)
    for q, l in enumerate(respuestas, start=1):
        if l == ' ':
            continue
        b, f = divmod(q - 1, 25)
        disco(x0 + b * paso_bl + 'abcd'.index(l) * paso_b, y0 + paso_y * f, 5, (70, 70, 70))
    doc = pymupdf.open()
    pagina = doc.new_page(width=595, height=842)
    pix = pymupdf.Pixmap(pymupdf.csRGB, w, h, img.tobytes(), False)
    pagina.insert_image(pagina.rect, pixmap=pix)
    doc.save(os.path.join(AQUI, 'hoja-optica-sintetica.pdf'), garbage=4, deflate=True)


if __name__ == '__main__':
    subrayado()
    hoja_optica()
