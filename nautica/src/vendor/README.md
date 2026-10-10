# Código de terceros

## qrcode-generator.js

Copia sin cambios de `dist/qrcode.mjs` del paquete npm `qrcode-generator` 2.0.4
(<https://github.com/kazuhikoarase/qrcode-generator>), de Kazuhiko Arase. Se usa para dibujar el QR del enlace de
«Mis dispositivos» en Ajustes (`src/ui/qr.js`), sin red en ejecución. Para actualizarlo: `npm pack qrcode-generator@<versión>`,
copiar `dist/qrcode.mjs` aquí y pasar `tests/sync-qr.test.js` (decodifica el QR generado con jsQR).

«QR Code» es una marca registrada de DENSO WAVE INCORPORATED.

Licencia MIT:

```
Copyright (c) 2009 Kazuhiko Arase

URL: http://www.d-project.com/

Licensed under the MIT license:
  http://www.opensource.org/licenses/mit-license.php

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
