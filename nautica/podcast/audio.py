#!/usr/bin/env python3
"""Convierte un guion de podcast (formato de podcast/guia.md) en un MP3 con ElevenLabs.

Uso:  ELEVENLABS_API_KEY=... python3 podcast/audio.py podcast/py/1-1-....md salida.mp3

- Cada bloque «**NOMBRE:** texto» se pide a la voz de ese personaje (VOCES).
- [pausa] dentro de una intervención se lee como una pausa breve («…»); [pausa larga] en su propia línea
  es un silencio de 3 s; [ríe] y cualquier otra acotación no se leen.
- Entre intervenciones hay SILENCIO segundos.
- Las piezas se guardan en una caché (por voz y texto) para no volver a pagar lo que no ha cambiado.
"""
import hashlib, json, os, re, subprocess, sys, tempfile, urllib.request, urllib.error

VOCES = {
    'ELENA': 'eZxqQzb5CuYo3Kl6EXfZ',   # Sofia - Natural Conversations (español de España)
    'ANDRÉS': 'syjZiIvIUSwKREBfMpKZ',  # Jacobo Montoro - Full and Gentle (andaluz)
}
MODELO = 'eleven_multilingual_v2'
AJUSTES = {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.25, 'use_speaker_boost': True}
SILENCIO = 0.5
PAUSA_LARGA = 3.0

def piezas(md):
    """[(voz, texto) | ('SILENCIO', segundos)] en orden."""
    cuerpo = md.split('\n---\n', 2)[-1] if md.startswith('---') else md
    out = []
    for bloque in re.split(r'\n\s*\n', cuerpo):
        b = bloque.strip()
        m = re.match(r'^\*\*([A-ZÁÉÍÓÚÑ]+):\*\*\s*(.+)$', b, re.S)
        if m:
            quien, texto = m.group(1), m.group(2)
            texto = re.sub(r'\[pausa\]', '…', texto)
            texto = re.sub(r'\[[^\]]*\]', '', texto)
            texto = re.sub(r'\s+', ' ', texto).strip()
            if texto: out.append((quien, texto))
        elif re.fullmatch(r'\[pausa larga\]', b):
            out.append(('SILENCIO', PAUSA_LARGA))
    return out

def tts(clave, voz, texto, destino):
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{voz}?output_format=mp3_44100_128',
        data=json.dumps({'text': texto, 'model_id': MODELO, 'language_code': 'es', 'voice_settings': AJUSTES}).encode(),
        headers={'xi-api-key': clave, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            open(destino, 'wb').write(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f'ElevenLabs {e.code}: {e.read()[:300]!r}')

def silencio(seg, destino):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
                    '-t', str(seg), '-c:a', 'libmp3lame', '-b:a', '128k', destino], check=True)

def main():
    guion, salida = sys.argv[1], sys.argv[2]
    clave = os.environ.get('ELEVENLABS_API_KEY') or sys.exit('Falta ELEVENLABS_API_KEY')
    cache = os.environ.get('PODCAST_CACHE', os.path.join(tempfile.gettempdir(), 'podcast-cache'))
    os.makedirs(cache, exist_ok=True)
    lista, caracteres, nuevos = [], 0, 0
    for p in piezas(open(guion, encoding='utf-8').read()):
        if p[0] == 'SILENCIO':
            f = os.path.join(cache, f'sil-{p[1]}.mp3')
            if not os.path.exists(f): silencio(p[1], f)
            lista.append(f); continue
        quien, texto = p
        voz = VOCES[quien]
        h = hashlib.sha1(f'{voz}|{MODELO}|{json.dumps(AJUSTES)}|{texto}'.encode()).hexdigest()[:16]
        f = os.path.join(cache, f'{h}.mp3')
        caracteres += len(texto)
        if not os.path.exists(f):
            tts(clave, voz, texto, f); nuevos += len(texto)
        lista.append(f)
        sf = os.path.join(cache, f'sil-{SILENCIO}.mp3')
        if not os.path.exists(sf): silencio(SILENCIO, sf)
        lista.append(sf)
    with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as t:
        t.write(''.join(f"file '{f}'\n" for f in lista))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', t.name,
                    '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k', salida], check=True)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', salida],
                               capture_output=True, text=True).stdout)
    print(f'{salida}: {dur / 60:.1f} min · {caracteres} caracteres ({nuevos} generados ahora)')

if __name__ == '__main__':
    main()
