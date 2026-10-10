# Ramas remotas: cuáles conservar y cuáles borrar

Generado el 10 de octubre de 2026 a partir de `git branch -r` y de las PR cerradas. Total: 164 ramas.
Borrar una rama remota no borra su código de `main`; sí pierde el acceso fácil a sus commits sueltos.

## Conservar (10)

| Rama | Por qué |
| --- | --- |
| `main` | Rama principal |
| `feat/nautica-per` | Rama de despliegue de la web |
| `guitarra` | Otro proyecto |
| `claude/timon-abatible` | Trabajo aparte, sin fusionar |
| `feat/per-resueltos`, `feat/py-resueltos` | Ejercicios resueltos de referencia |
| `feat/podcast-audio` | Audio del podcast |
| `feat/per-cierre` | Cierre de PER, pendiente de publicar |
| `feat/sync-progreso`, `feat/pwa-tanda1` | Trabajo en curso |

## A. Ya dentro de `main` por historia (66): se pueden borrar

Seguras: todos sus commits ya están en `main`.

```
git push origin --delete feat/andalucia-2015-2019 feat/apendice-mates feat/ayudas-alumno feat/bancos-f0 feat/bancos-f2 feat/bancos-f2-fin feat/calculadora-mates feat/clases-cortas feat/conceptos feat/conceptos-balizamiento-ripa
git push origin --delete feat/conceptos-cambios-balizamiento-ripa feat/conceptos-cambios-meteorologia feat/conceptos-cambios-navegacion feat/conceptos-cambios-nomenclatura-maniobra feat/conceptos-cambios-seguridad-legislacion feat/conceptos-meteorologia feat/conceptos-metodo feat/conceptos-motor feat/conceptos-navegacion feat/conceptos-nomenclatura-maniobra
git push origin --delete feat/conceptos-seguridad-legislacion feat/cuarentena-reserva feat/discrepancias-oficiales feat/eje-baleares feat/eje-dgmm feat/ejercicios-laminas feat/evaluacion-py feat/f1-reserva feat/guia feat/hoy-maqueta
git push origin --delete feat/huecos-py feat/laminas-interactivas feat/laminas-lecciones feat/mapas-t1 feat/mapas-t2 feat/mapas-t3 feat/mapas-t4 feat/plan-estudio feat/podcast-py feat/revision-2
git push origin --delete feat/revision-clases feat/ruta-profe feat/ui-mejoras feat/ux-hoy feat/visual fix/avance-clases fix/calc-mesa fix/contenido-muestreo fix/descartar-examen fix/evaluacion-2
git push origin --delete fix/nueve-acabado fix/nueve-fiabilidad fix/nueve-pedagogia fix/nueve-secuencia fix/nueve-uso fix/precache-dgmm fix/py-interactivas-carta fix/recorrido fix/recorrido-2 fix/revision-per-2
git push origin --delete fix/revision-uso-per fix/sw-conflicto integra-baleares integra-dgmm integra-profe ruta-fase1
```

## B. Fusionadas con una PR por «squash» (25): se pueden borrar

Seguras en el sentido de que su PR consta como fusionada. Git no las reconoce como fusionadas porque el squash crea un
commit nuevo.

```
git push origin --delete docs/roadmap feat/animaciones feat/carta-pasos-final feat/catalogo-pendientes feat/diagnostico-ficha feat/efectos-final feat/entrada-unica feat/hoja-ver-pregunta feat/hoy-travesia-c-final feat/iconos-temario
git push origin --delete feat/informe-discrepancias feat/instalar-app feat/laminas-c feat/laminas-cierre-final feat/laminas-py feat/listo-olvido-margen feat/mapas-chuletas-c-final feat/per-laminas-c-final feat/proteccion-datos feat/pulido-2
git push origin --delete feat/py-laminas-cola-final feat/py-laminas-final-final feat/repaso-con-ficha feat/tarjetas-final feat/travesia
```

## C. Trabajo de agentes sin PR propia (65): borrar si no necesitas su historial

Ramas de trabajo (cartas y explicaciones por lotes de DGMM, Andalucía 2015–2019 y Baleares, y versiones previas de
tandas posteriores rehechas como `-final`). Su contenido llegó a `main` a través de ramas de integración, no de sus
propias PR. He comparado ficheros contra `main` y muchos son idénticos, pero en otros hay diferencias esperables
(ficheros que se modificaron después, carpetas de trabajo `.trabajo-carta` y `.trabajo-expl` ya retiradas), y no he
podido demostrar rama por rama que no contengan nada que falte. Si quieres red de seguridad, no las borres, o crea
antes una etiqueta por rama (`git tag archivo/<nombre> origin/<rama>`).

```
git push origin --delete feat/carta-pasos feat/efectos feat/eje-dgmm-carta-per-a feat/eje-dgmm-carta-per-b feat/eje-dgmm-carta-py-a feat/eje-dgmm-carta-py-b feat/eje-dgmm-expl-per-1 feat/eje-dgmm-expl-per-2 feat/eje-dgmm-expl-per-3 feat/eje-dgmm-expl-per-4
git push origin --delete feat/eje-dgmm-expl-per-5 feat/eje-dgmm-expl-per-6 feat/eje-dgmm-expl-py-1 feat/eje-dgmm-expl-py-2 feat/hoy-travesia-c feat/laminas-cierre feat/laminas-sanidad feat/mapas-chuletas-c feat/per-laminas-c feat/py-laminas-cola
git push origin --delete feat/py-laminas-final feat/tarjetas-c trabajo/and1519-carta-per-a trabajo/and1519-carta-per-b trabajo/and1519-carta-per-c trabajo/and1519-carta-py-2015 trabajo/and1519-carta-py-2016 trabajo/and1519-carta-py-2017 trabajo/and1519-carta-py-2018 trabajo/and1519-carta-py-2019
git push origin --delete trabajo/and1519-carta-resolver trabajo/and1519-expl-per-01 trabajo/and1519-expl-per-02 trabajo/and1519-expl-per-03 trabajo/and1519-expl-per-04 trabajo/and1519-expl-per-05 trabajo/and1519-expl-per-06 trabajo/and1519-expl-per-07 trabajo/and1519-expl-py-01 trabajo/and1519-expl-py-02
git push origin --delete trabajo/and1519-expl-py-03 trabajo/and1519-expl-py-04 trabajo/and1519-expl-py-05 trabajo/and1519-expl-pycarta-01 trabajo/and1519-expl-pycarta-02 trabajo/baleares-carta trabajo/baleares-carta-01 trabajo/baleares-carta-02 trabajo/baleares-carta-03 trabajo/baleares-carta-04
git push origin --delete trabajo/baleares-carta-05 trabajo/baleares-carta-06 trabajo/baleares-carta-07 trabajo/baleares-carta-08 trabajo/baleares-expl-01 trabajo/baleares-expl-02 trabajo/baleares-expl-03 trabajo/baleares-expl-04 trabajo/baleares-expl-05 trabajo/baleares-expl-06
git push origin --delete trabajo/baleares-expl-07 trabajo/baleares-expl-08 trabajo/baleares-expl-09 trabajo/baleares-expl-10 trabajo/baleares-explicaciones
```

## Cómo comprobar el resultado

```
git fetch --prune origin
git branch -r
```

Quedarían las ramas de «Conservar»; las de la sección C solo si decides no borrarlas.
