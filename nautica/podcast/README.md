# Patrón en voz alta

Guiones de podcast para preparar la teoría del PER y del Patrón de Yate (Andalucía), escritos para una IA de síntesis de voz.

Hablan dos voces:

- **Elena**: Divulgadora. Patrona de yate y profesora. Mujer de unos 45 años, voz cálida y segura, ritmo pausado, con humor.
- **Andrés**: Alumno. Hombre de unos 60 años, jubilado, con un velero de nueve metros en el puerto. Curioso, algo despistado, se ríe de sí mismo.

Cada tema se cuenta en dos niveles:

- **🧭 Panorama**: un episodio que recorre el tema entero, para situarse antes de estudiarlo y para repasarlo la semana del examen.
- **🔎 Profundiza**: un episodio por epígrafe, o por grupo de epígrafes cortos, con los detalles y las trampas del examen.

Cada episodio dura entre diez y quince minutos, unas 1.600–2.300 palabras habladas, y todo sale de las clases de la app.
El formato de los guiones está en [`guia.md`](guia.md); este índice se genera con `node podcast/indice.mjs` a partir de [`episodios.json`](episodios.json).

## Patrón de Yate (PY)

34 episodios · 26 escritos.

#### 0 · Cómo es el examen del Patrón de Yate y cómo usar estos podcasts

👋 Bienvenida · ✅ [guion](py/0-bienvenida.md)

Episodio de bienvenida: cómo es el examen teórico del Patrón de Yate en Andalucía (módulos, temas, número de preguntas, aprobado y límites de fallos) y cómo sacar partido a esta serie. Sirve para que el oyente sepa desde el principio dónde están los puntos que más pesan y qué temas pueden suspenderle por sí solos.

**Gancho:** Andrés, con el PER ya en el bolsillo, está en la bañera de su velero de nueve metros con la convocatoria del Patrón de Yate en la mano y no sabe ni cuántas preguntas tiene el examen ni si hay algún tema que te suspenda aunque aciertes el resto.

**Para llevarse:**

- El examen tiene 40 preguntas tipo test, con cuatro opciones, repartidas en dos módulos: el genérico (45 minutos) y el de navegación (75 minutos); en total, 120 minutos.
- Módulo genérico: 10 preguntas de Seguridad en la mar y 10 de Meteorología; en Andalucía es un cuadernillo de 20, con Seguridad de la 1 a la 10 y Meteorología de la 11 a la 20.
- Módulo de navegación: 10 preguntas de Teoría de navegación y 10 de Carta de navegación.
- La carta son 7 ejercicios sobre la carta del Estrecho, 2 de mareas (con anuario y tabla) y 1 de navegación loxodrómica.
- Se aprueba con al menos 28 aciertos de 40, es decir, con un máximo de 12 fallos.
- Hay dos límites que suspenden por sí solos: como máximo 5 errores en Teoría de navegación y como máximo 3 en Carta; Seguridad y Meteorología no tienen límite propio.
- El orden de estudio recomendado es empezar por el módulo de navegación (Teoría y Carta, que tienen límite de fallos y piden más práctica) y dejar para después Seguridad y Meteorología.

### Tema 1 · Seguridad en la mar

#### 1.0 · Seguridad en la mar: estabilidad, equipo y emergencias

🧭 Panorama · ✅ [guion](py/1-0-seguridad-en-la-mar.md) · clases py-1-1, py-1-2, py-1-3, py-1-4, py-1-5, py-1-6, py-1-7, py-1-8, py-1-9, py-1-10

Panorama del tema de Seguridad en la mar: por qué flota y se adriza un barco, cómo le afecta mover o consumir pesos, los requisitos técnicos del material de salvamento (chalecos, aros, balsa, pirotecnia, extintores, radiobaliza, respondedor y VHF) y cómo actuar en un abandono y en un rescate con helicóptero. Son diez preguntas del módulo genérico que se repiten mucho: dominando cifras y trampas, son puntos seguros.

**Gancho:** Andrés hace inventario en el pantalán de todo el material de seguridad de su velero —chalecos, aro, balsa, bengalas, extintor y radiobaliza— y se da cuenta de que sabe dónde está cada cosa, pero no las cifras ni las reglas que le van a preguntar de cada una.

**En el examen:** Seguridad en la mar son las preguntas 1 a 10 del cuadernillo del módulo genérico: 10 de las 40 del examen. No tiene límite propio de fallos (no es eliminatorio), pero cuenta para los 28 aciertos del aprobado.

**Recorre:** Por qué flota un barco: desplazamiento, gravedad y carena · Metacentro, altura metacéntrica y tipos de equilibrio · Mover pesos: traslados, consumos, superficies libres y buque duro o blando · Chalecos, arneses y aros salvavidas · La balsa salvavidas y la zafa hidrostática · Hacerse ver: pirotecnia, espejo, bocina y reflector de radar · Extintores y lucha contra incendios a bordo · Abandono del barco y vida en la balsa · Radiobaliza, respondedor de radar y VHF de socorro · Rescate con helicóptero y Salvamento Marítimo.

**Para llevarse:**

- Flotación: el barco flota en equilibrio cuando empuje y peso son iguales y están en la misma vertical; G (peso) solo se mueve si se mueven pesos, y C (empuje, centro del volumen sumergido) se mueve con los balances y las cabezadas.
- Estabilidad: la altura metacéntrica es la distancia de G a M (GM = KM − KG); estable si M está por encima de G, indiferente si coinciden (se queda escorado) e inestable si M queda por debajo de G (escora más).
- Pesos: bajar pesos aumenta GM y subirlos o consumir de un tanque bajo G lo reduce; una escora se corrige llevando peso a la banda contraria; GM grande da un buque duro y GM pequeño, uno blando; los tanques, llenos o vacíos, nunca a medias.
- Chalecos y aros: un chaleco por persona (uno más en zona 1) de 275, 150 o 100 N según la zona, con luz blanca y puesto en un minuto; aro con flotabilidad propia, guirnalda de al menos cuatro diámetros y luz de 50 a 70 destellos por minuto.
- Balsa y zafa: la balsa aguanta 30 días a flote en cualquier mar y lleva dos anclas flotantes; la zafa hidrostática la suelta por presión antes de 4 m y se cambia cada 2 años.
- Pirotecnia y señales: bengala de mano de 15.000 candelas durante un minuto, cohete con paracaídas de 30.000 candelas durante 40 segundos y fumígena de humo naranja durante 3 minutos; siempre por sotavento y de espaldas al viento.
- Extintores: con tensión eléctrica, el de CO₂ (no conduce ni deja residuos); el de polvo solo si su propia etiqueta lo permite; nunca agua ni espuma; se ataca la base de las llamas con el viento a la espalda.
- Abandono y balsa: antes, MAYDAY y radiobaliza; la boza se suelta cuando todos están dentro; en la balsa, ancla flotante, guardias, quedarse en la zona, nada de agua el primer día y nunca agua de mar.
- Radiobaliza, SART y VHF: la radiobaliza emite en 406 MHz a los satélites y dura al menos 48 horas; el SART se ve en el radar como una línea de 12 puntos; socorro por voz en el canal 16 y alerta digital en el 70.
- Helicóptero: contacto por el canal 16, chalecos puestos, en velero velas arriadas y motor en marcha, el cable debe tocar el agua antes de cogerlo y nunca se hace firme, y nada de cohetes con el helicóptero cerca.

**Minijuego** (180 preguntas reales de examen en estas clases):

- ¿Cómo será el equilibrio de nuestra embarcación si el metacentro se encuentra por encima del centro de gravedad?: *(and-py-2022-c2-g01)*
- El extintor portátil recomendado para apagar un fuego en el cuadro eléctrico de una embarcación será de: *(and-py-2024-c1-g05)*
- ¿Qué autonomía tiene una EPIRB? *(and-py-2021-c2-g07)*

#### 1.1 · Por qué flota un barco y por qué vuelca

🔎 Profundiza · ✅ [guion](py/1-1-por-que-flota-y-por-que-vuelca.md) · clases py-1-1, py-1-2

Por qué flota un barco y cuándo vuelve a su sitio tras una escora: desplazamiento, centro de gravedad, centro de carena, metacentro, altura metacéntrica y los tres tipos de equilibrio. Es la base de todo el tema de estabilidad y cae en casi todas las convocatorias, con definiciones casi literales y trampas muy repetidas.

**Gancho:** Andrés subió el motor fueraborda de la auxiliar a cubierta, lo dejó junto al palo y su velero se quedó tumbado a una banda, ni mucho ni poco. El episodio acaba explicando qué les pasó a G y a la altura metacéntrica.

**Para llevarse:**

- Un barco flota en equilibrio cuando el empuje es igual al peso y las dos fuerzas están en la misma vertical; si no lo están, forman un par que escora o adriza el barco.
- El desplazamiento es el peso total del barco, igual al peso del agua que desaloja; cambia con los consumos (combustible, agua dulce, víveres) y con las cargas, pero no al mover un peso que ya está a bordo.
- El agua de mar pesa unas 1,025 t/m³ y la dulce 1,000: en agua dulce el barco cala más y, al salir a la mar, sube un poco.
- G, el centro de gravedad, es donde se aplica el peso, hacia abajo, y solo se mueve si se cargan, descargan, consumen o trasladan pesos; C (o B), el centro de carena, es el centro del volumen sumergido y el punto de aplicación del empuje, y se mueve con los balances y las cabezadas.
- El metacentro M es el punto donde la vertical del empuje con el barco escorado un ángulo pequeño (hasta unos 10–15°, la estabilidad inicial) corta al plano de crujía.
- La altura metacéntrica GM es la distancia entre G y M: GM = KM − KG; la distancia de C a M es el radio metacéntrico, y cuanto mayor es GM, mayor es el brazo adrizante.
- Estable: M por encima de G (KM > KG) y el barco se adriza; indiferente: M coincide con G (GM = 0) y se queda con la escora que le den; inestable: M por debajo de G (KG > KM) y la escora aumenta.

**Trampas del examen:**

- «El desplazamiento es invariable» o «solo cambia al mover un peso arriba o abajo» es falso: cambia con los consumos y las cargas; mover un peso a bordo solo mueve G. Y si se navega gastando combustible, cambian D, G y C: ninguno queda inalterable.
- El centro de carena no es el punto de aplicación del peso (ese es G), ni el centro del volumen total o de la obra muerta, ni la línea que separa obra viva y obra muerta (eso es la flotación): es el centro de gravedad del volumen sumergido.
- Con balance y cabezada varía solo la posición del centro de carena; el centro de gravedad no se mueve porque nadie ha cambiado los pesos de sitio.
- GM es la distancia de G a M; son falsas «del centro de carena al metacentro» (radio metacéntrico), «de la quilla al metacentro» (KM), «de la quilla al centro de gravedad» (KG) o «desde la flotación». Y el metacentro se define con la vertical del centro de carena, nunca con la del centro de gravedad.
- En el equilibrio indiferente coinciden M y G, no G y C ni M y C; si las opciones dan «M coincide con G» y «GM es cero» por separado, la buena suele ser «a y b son correctas».
- Los tipos de equilibrio son estable, indiferente e inestable; «transversal y longitudinal» o «estático y dinámico» son formas de clasificar la estabilidad. Un barco en puerto pasando pesos de banda a banda es estabilidad estática transversal (aguas en reposo).

**Minijuego** (39 preguntas reales de examen en estas clases):

- El centro de carena es: *(and-py-2022-c3-g01)*
- Cuando un buque, que está adrizado, se escora a una banda por una acción externa y no recobra la posición de adrizado, sino que mantiene la escora adquirida, se dice que tiene: *(and-py-2022-c3-g03)*
- El metacentro es el punto de intersección del plano de crujía del buque con: *(and-py-2022-c2-g04)*

**Relacionados:** 1.0, 1.2.

#### 1.2 · Mover pesos sin volcar: traslados, consumos, superficies libres, duro y blando

🔎 Profundiza · ✅ [guion](py/1-2-mover-pesos-sin-volcar.md) · clase py-1-3

Qué le pasa a la estabilidad cuando se cargan, consumen o trasladan pesos: hacia dónde va G, cómo cambia GM, cómo se corrige una escora, qué es un buque duro o blando y por qué un tanque a medias resta estabilidad. En el examen salen sobre todo preguntas de «adónde llevo el peso» y de consumos bajo G, con opciones que se diferencian en una sola palabra.

**Gancho:** Andrés quiere quitar la escora que le dejó el fueraborda en cubierta y, de paso, ganar estabilidad: ¿lo baja a la cabina por la otra banda? Además, después de un fin de semana gastando agua, nota que con el tanque a medias el barco balancea con más pereza.

**Para llevarse:**

- G sigue a los pesos: al cargar se acerca al peso, al descargar o consumir se aleja de donde estaba y al trasladar se mueve paralelo al traslado y en el mismo sentido (GG′ = p × d / D).
- Como GM = KM − KG y KM apenas cambia, bajar pesos (de cubiertas superiores a inferiores) baja G y aumenta GM; subirlos lo disminuye.
- Consumir agua o combustible de un tanque situado por debajo de G quita peso de abajo, sube G y disminuye GM; que el tanque esté a proa o a popa solo cambia además el asiento.
- Una escora se corrige llevando el peso a la banda contraria; si además se quiere más GM, el peso va abajo, y si se quiere menos, arriba. Un traslado solo horizontal no cambia GM, y uno de proa a popa cambia el asiento.
- GM muy grande da un buque duro, con balances rápidos y bruscos; GM pequeño pero positivo da un buque blando, con balances lentos y suaves y poca reserva de estabilidad. Se busca un GM adecuado, y un buque demasiado blando se corrige bajando pesos.
- Un tanque a medio llenar tiene superficie libre: al escorar el líquido corre a la banda baja y el efecto equivale a subir G. Lleno o vacío no pasa; la pérdida depende de la anchura del tanque y la reducen los mamparos longitudinales.

**Trampas del examen:**

- «El consumo de un tanque bajo G no influye por ser un líquido» o «hasta que no se vacía no cambia nada» es falso: desde que se consume, G sube y GM disminuye.
- Para corregir una escora, las opciones que llevan el peso a la misma banda de la escora («a estribor» con escora a estribor) siempre son falsas.
- «Solamente a babor (o a estribor), porque la altura metacéntrica no se puede corregir» es falso: según se suba o se baje el peso, GM disminuye o aumenta.
- Hay que leer si piden aumentar o disminuir GM: para corregir una escora a estribor y disminuir GM, el peso va a babor y por encima de G.
- Para mejorar la estabilidad no se suben pesos ni se llevan de proa a popa: se pasan de cubiertas superiores a inferiores.
- En un barco con equilibrio indiferente, subir un peso por encima de G no lo hace estable ni aumenta GM: deja GM negativa y el barco puede escorar, no recuperarse y dar la vuelta.

**Minijuego** (12 preguntas reales de examen en estas clases):

- El consumo de agua dulce de un tanque situado en la zona de proa y por debajo del centro de gravedad supondrá: *(and-py-2025-c1-g02)*
- Si se quiere corregir una escora a estribor y disminuir la altura metacéntrica ¿en qué dirección se debe trasladar un peso? *(and-py-2025-c3-g05)*
- Un buque da balances lentos y suaves si: *(and-py-2025-c1-g08)*

**Relacionados:** 1.1.

#### 1.3 · Chalecos, aros y la balsa salvavidas

🔎 Profundiza · ✅ [guion](py/1-3-chalecos-aros-y-balsa.md) · clases py-1-4, py-1-5

Los requisitos técnicos y de estiba del material de flotación: chalecos, arnés y línea de vida, aro salvavidas, balsa, su contenedor y la zafa hidrostática. Es material que el oyente ya conoce del PER, pero en el Patrón de Yate le preguntan cifras exactas (newtons, minutos, metros, destellos, días, nudos) que se cruzan en las opciones.

**Gancho:** Andrés prepara una salida con sus dos nietos y, al abrir el tambucho, ve que solo tiene chalecos de adulto y que la zafa de la balsa lleva una fecha de hace tres años. El episodio explica qué le falta y por qué.

**Para llevarse:**

- Chalecos (RD 339/2021): uno por persona y uno más en zona 1, uno por cada niño adecuado a su peso y talla, con flotabilidad mínima de 275 N en zona 1, 150 N en zonas 2 a 4 y 100 N en zonas 5 a 7.
- Un chaleco homologado se pone sin ayuda en un minuto como máximo, da la vuelta a una persona inconsciente, lleva bandas retrorreflectantes, silbato y luz blanca, y va por encima de la ropa; los hinchables se revisan según el fabricante y se rearman tras dispararse.
- El arnés sirve para no caer al agua: se ajusta a la talla, se engancha por el pecho y su línea de amarre es mejor de cinta que de cabo, de 2 m como máximo; se guarda seco, a la sombra y lejos de combustibles, pinturas y productos de limpieza.
- El aro (zonas 1 a 4, con luz y rabiza) tiene flotabilidad intrínseca, diámetro exterior de 800 mm como máximo y guirnalda de al menos cuatro veces ese diámetro; su luz automática da de 50 a 70 destellos por minuto y va en cubierta con suelta rápida. Si se pierde, se avisa a Salvamento Marítimo.
- La balsa (zonas 1 a 3, para todos a bordo) aguanta 30 días a flote sea cual sea el estado de la mar, se remolca a 3 nudos, se infla en un minuto como máximo y lleva dos anclas flotantes, una sujeta y otra de respeto; su toldo permite ir sentados, recoge la lluvia y sostiene el SART a 1 m como mínimo.
- El contenedor de la balsa tiene flotabilidad intrínseca y desagües (no es del todo estanco) y lleva marcados el fabricante, el número de personas, la longitud de la boza y las instrucciones de puesta a flote.
- La zafa hidrostática suelta la balsa por la presión del agua antes de 4 m, no al mojarse ni con las olas, y se cambia cada 2 años; después, la boza tensa dispara el inflado y la unión débil la rompe. La balsa se trinca solo con la trinca que pasa por la zafa.

**Trampas del examen:**

- La luz del chaleco no es roja «como la pirotecnia» ni «del color del chaleco»: es blanca.
- Para niños no vale «un 10–25 % del total» ni «van con el de sus padres»: uno por cada niño. Y el hinchable no lleva radiobaliza por normativa, no está limitado a 100 N ni es de un solo uso.
- En la pregunta del arnés, la afirmación falsa que puntúa es preferir la sujeción de cabo en lugar de cinta; en la del aro, la guirnalda de «tres veces» el diámetro (son cuatro).
- El aro no se guarda en la cabina para protegerlo del sol ni se trinca con bridas o cadenas con mal tiempo: va siempre listo para soltarlo rápido.
- La zafa suelta a 4 m como máximo; son falsas «al mojarse», «con un golpe», «a 6 m», «entre 5 y 7 m» o «solo se dispara a mano». En una convocatoria sin opción de 4 m se dio por buena «entre 1,5 y 4,5 m».
- Son falsas: el toldo «para ir de pie», el contenedor «completamente estanco, sin desagües», «el peso máximo» marcado en la envoltura (es el número de personas), el ancla flotante «estibada en el paquete SOLAS» y añadir trincas extra «por si acaso».

**Minijuego** (40 preguntas reales de examen en estas clases):

- ¿De qué color han de ser las luces de los chalecos salvavidas?: *(and-py-2025-c2-g03)*
- En caso de no poder disparar la zafa hidrostática manualmente, ésta se disparará automáticamente al sumergirse en el agua a una profundidad de: *(and-py-2024-c2-g04)*
- Una vez puesta a flote ¿cuánto tiempo puede resistir una balsa salvavidas a la intemperie? *(and-py-2025-c3-g07)*

**Relacionados:** 1.5, 1.6.

#### 1.4 · Hacerse ver y apagar fuegos: pirotecnia, señales y extintores

🔎 Profundiza · ✅ [guion](py/1-4-hacerse-ver-y-apagar-fuegos.md) · clases py-1-6, py-1-7

Las señales para hacerse ver (bengala de mano, cohete con paracaídas, fumígena, espejo, bocina y reflector de radar) y la lucha contra incendios a bordo (cuántos extintores, dónde van, cuál usar con tensión eléctrica y cómo atacar el fuego). Las preguntas juegan a cruzar las cifras de cada señal y a colar «barlovento» donde va «sotavento».

**Gancho:** Andrés abre el cofre de seguridad de su velero y encuentra una bengala de mano, un cohete con paracaídas y un bote de humo, y junto al cuadro eléctrico un extintor sin manómetro; no sabe cuál usaría en cada caso ni si a ese extintor le falta algo.

**Para llevarse:**

- Bengala de mano: arde en rojo brillante con 15.000 candelas como mínimo durante al menos un minuto, y sigue ardiendo tras sumergirla 10 segundos a 100 mm; marca la posición, sobre todo de noche, a quien ya te busca cerca.
- Cohete con paracaídas: sube a 300 m como mínimo y su bengala roja da 30.000 candelas durante al menos 40 segundos; sirve para llamar la atención a distancia.
- Señal fumígena flotante: humo naranja durante 3 minutos como mínimo en aguas tranquilas, sin llama y sin anegarse con mar encrespada; es de día y marca un punto en el agua, como un hombre al agua. Es la única que no tiene que ser roja.
- Todas van en estuche hidrorresistente, con instrucciones impresas e ignición incorporada que se acciona a mano; se usan por sotavento, de espaldas al viento, con guantes y el brazo por fuera de la borda, y nunca un cohete con un helicóptero cerca.
- El espejo de señales o heliógrafo refleja la luz del sol; la bocina de niebla puede ser manual o de gas; el reflector de radar es pasivo, obligatorio en cascos no metálicos, da más eco cuanto más grande y mejor diseñado y va en el punto más alto posible.
- Extintores (RD 339/2021): de eficacia 34B y al menos 2 kg, según eslora y potencia, uno alcanzable desde el puesto de gobierno, siempre a mano, visibles y cerca de motor, cocina y cuadro; tú los revisas cada 3 meses y una empresa cada año.
- Con tensión eléctrica, el más recomendado es el de CO₂ (no conduce ni deja residuos; no lleva manómetro y tiene la boquilla ancha); el de polvo solo si su propia etiqueta lo permite; nunca agua ni espuma. Se ataca con el viento a la espalda, a la base de las llamas y en barrido.

**Trampas del examen:**

- Las cifras se cruzan: bengala 15.000 candelas y un minuto, cohete 30.000 candelas y 40 segundos, fumígena 3 minutos de humo, y siempre «como mínimo», no «como máximo».
- Cualquier opción con «barlovento» o «cara al viento» para usar la pirotecnia es falsa: sotavento y de espaldas al viento.
- El estuche es hidrorresistente, no «pirorresistente»; ninguna señal se enciende sola al tocar el agua ni lleva cerillas de fricción.
- El reflector de radar no lleva batería, no se pone en la bañera ni dentro de la cabina y no es solo para cascos metálicos.
- ¿Un ABC con electricidad? Ni «siempre» ni «nunca»: lo dice el propio extintor (voltaje y distancia), no un manual o una ficha técnica. Y el de CO₂ no lleva manómetro.
- El ataque no empieza por el centro del fuego ni va de sotavento a barlovento; y el balde sí sirve para achicar, pero nunca para trasvasar combustible.

**Minijuego** (36 preguntas reales de examen en estas clases):

- La bengala de mano tendrá un periodo de combustión mínimo de: *(and-py-2023-c2-g05)*
- ¿Cuál de estas acciones NO es adecuada para el uso de cohetes con paracaídas?: *(and-py-2025-c2-g08)*
- Señale la respuesta FALSA con respecto a un extintor de CO2: *(and-py-2025-c3-g01)*

**Relacionados:** 1.5, 1.6.

#### 1.5 · Abandonar el barco y vivir en la balsa

🔎 Profundiza · ✅ [guion](py/1-5-abandonar-el-barco.md) · clase py-1-8

Cuándo y cómo se abandona el barco, cómo se lanza la balsa, se embarca y se adriza si sale volcada, y las reglas para sobrevivir en ella: ancla flotante, guardias, no alejarse y cómo administrar el agua. En el examen son preguntas de sentido común con opciones muy parecidas, en las que una sola palabra («barlovento», «al agua», «remar») hace falsa la respuesta.

**Gancho:** Andrés lleva la balsa de su velero a revisar a la estación de servicio y, al verla inflada, se pregunta cómo subiría a ella sin caer al agua, qué haría si se inflase boca abajo y si, una vez dentro, debería remar hacia la costa.

**Para llevarse:**

- Mientras flote, el barco es la mejor balsa: se abandona solo cuando protege menos que la balsa y lo ordena el patrón. Antes, llamada de socorro y radiobaliza activada, chaleco con ropa de abrigo, y llevarse sobre todo la radiobaliza.
- Para lanzar la balsa: se amarra la boza a un punto fuerte antes de lanzarla, se lanza por sotavento, se tira de la boza para inflarla y solo se suelta o se corta cuando todos están dentro.
- Se embarca sin mojarse y sin saltar encima de la balsa; conviene que entre primero alguien fuerte o de más peso, que la estabiliza y ayuda a subir a los demás.
- Si se infla volcada, se adriza colocándose a sotavento, subiéndose sobre la botella y tirando de las cinchas que cruzan la parte inferior de la balsa.
- Ya dentro: contar a la gente y atender a los heridos, repartir el peso, largar el ancla flotante (frena la deriva), achicar, tomar pastillas contra el mareo cuanto antes, leer las instrucciones de la pirotecnia y organizar turnos de guardia.
- Hay que quedarse en la zona del hundimiento, que es donde buscarán; remar hacia la costa agota y gasta agua, y la pirotecnia se usa solo cuando hay alguien a la vista.
- Agua: nada de agua ni comida las primeras 24 horas salvo a los heridos, después pequeñas raciones de agua dulce y nunca agua de mar; se consigue con lluvia, destilador o prensando pescado, y se ahorra estando a la sombra y sin sudar.

**Trampas del examen:**

- Dejar el motor en marcha y el timón fijo, ir en bañador o tirarse al agua al primer susto son siempre opciones falsas.
- La boza no se suelta cuando todos han saltado al agua ni en cuanto la balsa se infla: se suelta cuando todos están dentro de la balsa.
- Para adrizar la balsa, «barlovento» o «cinchas de la parte superior» son falsas: sotavento, sobre la botella y cinchas de la parte inferior.
- Alejarse de la zona del hundimiento o remar hacia la costa más cercana es incorrecto, igual que encender una bengala nada más subir a la balsa.
- Las pastillas contra el mareo se toman cuanto antes, no a las 24 horas: el vómito deshidrata.
- Nunca agua de mar, ni en pequeñas cantidades; y comer alimentos grasos o muy dulces «que den energía» no es recomendable sin agua suficiente.

**Minijuego** (20 preguntas reales de examen en estas clases):

- Antes de abandonar la embarcación y embarcar en la balsa salvavidas es importante llevar con nosotros: *(and-py-2024-c1-g08)*
- ¿Qué acción NO es recomendable para evitar la deshidratación dentro de una balsa salvavidas?: *(and-py-2026-c1-g07)*
- ¿Cuál de estas acciones NO ES CORRECTA al permanecer en una balsa salvavidas a la espera de ser rescatado? *(and-py-2025-c3-g09)*

**Relacionados:** 1.3, 1.6.

#### 1.6 · Pedir ayuda: radiobaliza, respondedor, VHF de socorro y helicóptero

🔎 Profundiza · ✅ [guion](py/1-6-pedir-ayuda.md) · clases py-1-9, py-1-10

Cómo se pide y se recibe ayuda: la radiobaliza y el camino de su alerta, el respondedor de radar, la llamada de socorro por VHF, Salvamento Marítimo y cómo preparar el barco o la balsa para un rescate con helicóptero. Es una de las partes más preguntadas del tema, con combinaciones falsas de canal y palabra, de frecuencia y equipo, y de «qué NO hacer» con el helicóptero.

**Gancho:** Limpiando el velero en el puerto, Andrés le da un golpe a la radiobaliza y se le dispara: el piloto parpadea y no sabe si apagarla y callarse, llamar al fabricante o a quién. Y de paso se pregunta cómo le encontrarían de verdad si un día tuviera que pedir socorro.

**Para llevarse:**

- La radiobaliza emite en 406 MHz hacia los satélites Cospas-Sarsat con la identidad del barco (su MMSI) y, si tiene GPS, su posición, más una señal de recalada en 121,5 MHz; funciona al menos 48 horas y se activa a mano o sola con su zafa al hundirse el barco. Los barcos cercanos no reciben su señal.
- Toda radiobaliza a bordo debe estar registrada, aunque no sea obligatoria; no se presta a otro barco, se comprueba con su autoprueba y nunca activándola, y si se dispara por error hay que avisar enseguida a Salvamento Marítimo.
- El SART responde al radar de 9 GHz y aparece en su pantalla como una línea de 12 puntos, en los 360°; se enciende a mano en la balsa, a 1 m como mínimo sobre el agua, y con batería limitada (unas 96 horas en espera y 8 respondiendo) se enciende cuando hay posibilidad real de que lo detecte un radar.
- Canal 16 para socorro, urgencia, seguridad y llamada por voz; canal 70 solo para la LSD, sin voz. La alerta LSD se lanza con el botón rojo «DISTRESS», y el VHF fijo con LSD también hace llamadas por fonía.
- Mensaje de socorro por el 16: MAYDAY tres veces, nombre del barco, posición, naturaleza del peligro, ayuda que se necesita y número de personas. PAN PAN es urgencia, no socorro.
- Salvamento Marítimo funciona 24 horas: canal 16 de VHF (LSD por el 70), 2182 kHz, teléfono 900 202 202 o 112.
- Ante el helicóptero: contacto por el 16, todos con chaleco, cubierta despejada y solo la documentación imprescindible; en velero, velas arriadas y motor en marcha, con rumbo y velocidad constantes. El cable toca el agua antes de cogerlo y nunca se hace firme, no se lanzan cohetes, se le guía con las horas del reloj desde su punto de vista y no se desconecta el SART.

**Trampas del examen:**

- «Canal 70 y MAYDAY» (el 70 no admite voz), «canal 16 y PAN PAN» (es urgencia) o «SOS por radio» son combinaciones falsas: canal 16 y MAYDAY.
- «La radiobaliza la reciben los barcos cercanos» es falso: solo los satélites. Y «se puede encender en cualquier momento para comprobar que funciona» también: se usa la autoprueba.
- El SART no se activa solo al tocar el agua, no emite a 12 GHz con la señal distintiva del barco y no se ve en el GPS ni en el VHF: se ve en el radar.
- Con el helicóptero son falsas: ponerse el aro (es el chaleco), el canal 9 o el 12, el teléfono 900 200 200, el rumbo a 90° con el viento por estribor, hacer firme el cable o cogerlo sin que toque el agua, y desactivar el SART.
- Las horas del reloj se dan desde el punto de vista del helicóptero, no desde nuestra embarcación: su proa son las 12.
- En velero, la respuesta que puntúa es arriar las velas y arrancar el motor; solo en una pregunta de 2020 la plantilla dio por buena «apagar».

**Minijuego** (33 preguntas reales de examen en estas clases):

- Si tenemos que abandonar la embarcación, utilizaremos el VHF de la siguiente manera: *(and-py-2022-c1-g10)*
- ¿En qué equipo de a bordo se puede visualizar la señal del RESAR / SART para facilitar la localización en un siniestro marítimo?: *(and-py-2025-c2-g01)*
- Ante una emergencia en un velero donde intervenga un helicóptero, debemos: *(and-py-2026-c1-g03)*

**Relacionados:** 1.4, 1.5.

### Tema 2 · Meteorología

#### 2.0 · El tiempo que hace en la mar

🧭 Panorama · ✅ [guion](py/2-0-el-tiempo-en-la-mar.md) · clases py-2-1, py-2-2, py-2-3, py-2-4, py-2-5, py-2-6, py-2-7, py-2-8, py-2-9

Recorrido por todo el tema de Meteorología del Patrón de Yate: presión e isobaras, frentes, modelos de viento, vientos regionales, humedad y nubes, nieblas, olas y corrientes. Es la mitad del módulo genérico y casi todas sus preguntas se repiten convocatoria tras convocatoria con las mismas trampas, así que es un tema muy agradecido para sumar aciertos.

**Gancho:** Andrés está en el puerto con el café, mirando el mapa de isobaras del parte antes de una travesía de fin de semana: ve unas líneas muy apretadas al oeste, una línea morada con triángulos y semicírculos, y el aviso de posible niebla al amanecer. Se pregunta si salir o no, y el episodio le da las piezas para leer todo eso.

**En el examen:** Meteorología es el bloque 2 del Patrón de Yate: 10 de las 40 preguntas, las del 11 al 20 del cuadernillo del módulo genérico. No tiene límite propio de fallos (no es eliminatorio); cuenta para el aprobado general de 28 aciertos.

**Recorre:** Isobaras, gradiente de presión, borrascas y anticiclones · Masas de aire y frentes · Los modelos de viento: Euler, geostrófico, de gradiente, ciclostrófico y antitríptico · Vientos regionales del Mediterráneo y del Atlántico · Humedad, punto de rocío y psicrómetro · Las nubes: cómo se forman y cómo se clasifican · Nieblas: tipos, previsión y disipación · Las olas: partes, formación, mar de viento y mar de fondo · Corrientes marinas: tipos y corrientes de nuestras costas.

**Para llevarse:**

- Isobaras y presión: las isobaras unen puntos de igual presión reducida al nivel del mar (normal 1013 hPa, trazadas cada 4 hPa); más gradiente = isobaras más juntas = viento más fuerte; borrasca, giro antihorario y mal tiempo; anticiclón, giro horario y tiempo estable (hemisferio norte).
- Masas de aire y frentes: en el frente frío el aire frío empuja y obliga al cálido a subir (cumulonimbos y chubascos); en el cálido el aire cálido asciende espontáneamente sobre la cuña fría (estratos y lluvia continua); en la oclusión el frío alcanza al cálido.
- Modelos de viento: Euler, solo gradiente y perpendicular de altas a bajas; geostrófico, gradiente más Coriolis y paralelo a isobaras rectas (altas a la derecha en el HN); de gradiente, con centrífuga y paralelo a isobaras curvas; ciclostrófico, sin Coriolis (tornados); antitríptico, el que incluye el rozamiento.
- Vientos regionales: mistral (NW, golfo de León) y tramontana (N), fríos y secos; siroco (SE), cálido; galerna, súbita y del Cantábrico; levante (E) en el Estrecho; vendaval (SW) en el golfo de Cádiz; alisios (NE) en Canarias.
- Humedad: la absoluta va en gramos por metro cúbico; la relativa es el porcentaje respecto a la saturación a esa temperatura; el punto de rocío es la temperatura a la que hay que enfriar el aire, con presión y vapor constantes, para saturarlo; el psicrómetro da la humedad relativa y el punto de rocío.
- Nubes: se forman por convección, por relieve o por frentes; «cirro-» son altas (más de unos 6000 m), «alto-» son medias, estratos, estratocúmulos y nimbostratos son bajas, y cúmulos y cumulonimbos son de desarrollo vertical.
- Nieblas: de enfriamiento (radiación, advección, orográfica), de evaporación (vapor, frontal) y de mezcla; la de advección, aire cálido y húmedo sobre agua fría, es la más frecuente en el mar; hay riesgo cuando el punto de rocío se acerca a la temperatura del mar.
- Olas: son energía del viento transmitida al mar; longitud y periodo van de cresta a cresta (distancia y tiempo), y la altura es el doble de la amplitud; crecen con intensidad, persistencia y fetch; la mar de viento tiene crestas agudas y la mar de fondo, redondeadas y largas.
- Corrientes: se nombran por hacia dónde van; son de densidad (temperatura y salinidad), de arrastre (viento), de gradiente (desnivel por presión) o de marea (Luna y Sol); en el Estrecho el agua atlántica entra en superficie hacia el E y la mediterránea sale en profundidad hacia el W.

**Minijuego** (180 preguntas reales de examen en estas clases):

- ¿Qué indica un conjunto de isobaras muy próximas entre sí en una carta meteorológica? *(and-py-2025-c3-g15)*
- En el Golfo de Cádiz, a un viento fuerte del SW ligado a la actividad borrascosa invernal, y que va acompañado de lluvia, temporales y mala visibilidad, se le suele conocer con la denominación general de: *(and-py-2025-c1-g13)*
- Las nieblas de advección son debidas a procesos de: *(and-py-2024-c3-g18)*

#### 2.1 · Isobaras, borrascas y anticiclones

🔎 Profundiza · ✅ [guion](py/2-1-isobaras-borrascas-anticiclones.md) · clase py-2-1

Qué es una isobara, qué es el gradiente horizontal de presión y cómo se relaciona con la separación de las isobaras y la fuerza del viento, y cómo son borrascas, anticiclones, dorsales y vaguadas. La relación entre inclinación de las superficies isobáricas, gradiente, separación de isobaras y viento es la pregunta más repetida del tema, redactada de mil maneras.

**Gancho:** En el parte que Andrés mira en el puerto, al oeste las isobaras salen apretadísimas y sobre su zona muy separadas; el patrón de al lado le dice que mañana «va a soplar» allí donde están juntas. Andrés no entiende cómo unas líneas de presión pueden decir cuánto viento hará.

**Para llevarse:**

- Una isobara une los puntos con la misma presión atmosférica en un momento determinado; las lecturas se reducen al nivel del mar porque la presión baja alrededor de 1 hPa por cada 8 m cerca del suelo.
- Presión normal: 1013 hPa (igual a 1013 mb y a 760 mmHg); en los mapas las isobaras suelen ir cada 4 hPa y nunca se cortan.
- El gradiente horizontal de presión es la diferencia de presión dividida por la distancia, medida perpendicular a las isobaras, y se suele dar en hPa por grado de meridiano (60 millas): 4 hPa en 120 millas son 2 hPa por grado.
- Más inclinación de las superficies isobáricas = más gradiente = isobaras más juntas = viento más fuerte; y todo al revés con menos inclinación.
- Borrasca: la presión baja hacia el centro, el aire converge y asciende, da nubes, lluvia y viento, y se desplaza en general de oeste a este; en el hemisferio norte gira al revés del reloj.
- Anticiclón: la presión sube hacia el centro, el aire diverge y desciende (subsidencia), da cielos despejados y viento flojo y variable, es extenso y casi estacionario; gira con el reloj en el hemisferio norte y en invierno puede traer nieblas e inversiones térmicas.
- Dorsal es una lengua de altas presiones entre dos bajas (tiempo estable) y vaguada, una lengua de bajas entre dos altas (inestabilidad, chubascos y posibles tormentas).

**Trampas del examen:**

- Falso: «a mayor inclinación de las superficies isobáricas, menor gradiente e isobaras más separadas». Cierto: las tres piezas van en el mismo sentido; más inclinación, más gradiente, isobaras más juntas y viento más fuerte.
- Falso: el gradiente se mide paralelo a las isobaras. Cierto: se mide perpendicular a ellas.
- Falso: mayor gradiente significa isobaras más separadas o viento menos intenso. Cierto: mayor gradiente, isobaras más próximas y viento más intenso.
- Falso: las isobaras unen puntos de igual temperatura o de igual tendencia barométrica. Cierto: eso son las isotermas y las isalobaras; las isobaras unen puntos de igual presión (y las isobatas, de igual profundidad).
- Falso: el anticiclón trae viento fuerte girando en sentido horario y lluvias. Cierto: gira en sentido horario en el HN, pero con viento flojo y variable, cielo despejado y estabilidad.
- Falso: en una borrasca del hemisferio norte el viento gira en sentido horario. Cierto: gira en sentido antihorario.

**Minijuego** (19 preguntas reales de examen en estas clases):

- Con respecto a las isobaras marque la opción correcta. *(and-py-2025-c2-g18)*
- Cuanto mayor sea el gradiente horizontal de presión: *(and-py-2025-c1-g14)*
- En un sistema de bajas presiones en el hemisferio norte los vientos giran respecto a las isobaras *(and-py-2021-c2-g17)*

**Relacionados:** 2.0, 2.2, 2.3.

#### 2.2 · Masas de aire y frentes

🔎 Profundiza · ✅ [guion](py/2-2-masas-de-aire-y-frentes.md) · clase py-2-2

Masas de aire y frentes: cómo se clasifican las masas, cómo se dibuja cada frente, qué aire se mueve en el frío y en el cálido, qué nubes y tiempo traen, y cómo distinguir una oclusión de tipo frío de una de tipo cálido. El examen repite casi literal la pregunta de la oclusión cambiando solo «vanguardia» y «retaguardia», y la de quién empuja a quién en cada frente.

**Gancho:** Fondeado en una cala, Andrés ve cómo una tarde el cielo se llena de chubascos fuertes con rachas y, al pasar, el viento rola, refresca y el cielo queda limpísimo; semanas antes, en cambio, vio llegar primero unos cirros, luego un velo con halo en el sol y al final una lluvia floja que no paraba en todo el día. Quiere saber por qué dos frentes se comportan tan distinto.

**Para llevarse:**

- Masas de aire: ártica (A) y polar (P) son frías, tropical (T) cálida; marítima (m) húmeda y continental (c) seca. mP es frío y húmedo, cT cálido y seco (calima).
- Símbolos: frente frío, línea azul con triángulos; cálido, roja con semicírculos; ocluido, morada con triángulos y semicírculos alternos del mismo lado; estacionario, rojo y azul alternos a lados opuestos. Los símbolos apuntan hacia donde avanza.
- Frente frío: el aire frío avanza como una cuña y obliga al cálido a subir de golpe; cumulonimbos, chubascos fuertes, rachas, tormenta y a veces granizo. Al pasar, el viento rola a la derecha (de SW a NW), sube la presión, baja la temperatura y queda muy buena visibilidad.
- Frente cálido: el aire cálido asciende espontáneamente y despacio sobre la cuña fría; nubes estratiformes que bajan por escalones (cirros, cirrostratos con halo, altostratos, nimbostratos) y lluvia débil o moderada pero persistente; antes de su paso la presión baja.
- El frente frío suele moverse más deprisa que el cálido; cuando lo alcanza se forma la oclusión y el aire cálido queda levantado del suelo.
- Oclusión de tipo frío: la masa de retaguardia es más fría que la de vanguardia. Oclusión de tipo cálido: la de vanguardia es más fría que la de retaguardia.
- Un frente siempre separa masas de temperatura y humedad distintas; el aire frío, más denso, queda siempre debajo.

**Trampas del examen:**

- Falso: en el frente frío el aire frío obliga al cálido a bajar o descender. Cierto: lo obliga a subir.
- Falso: en el frente cálido el aire cálido baja o desciende sobre la cuña fría. Cierto: asciende espontáneamente sobre ella.
- Falso: «subida del aire casi horizontal con condensación en estratos» describe el frente frío. Cierto: eso es el frente cálido; el frío da cumulonimbos y chubascos.
- Falso: el frente ocluido se forma cuando el frente cálido alcanza al frío. Cierto: es el frío, más rápido, el que alcanza al cálido.
- Falso: un frente ocluido solo puede ser de tipo frío (o solo de tipo cálido). Cierto: puede ser de los dos tipos.
- Falso: con la vanguardia más fría que la retaguardia la oclusión es de tipo frío. Cierto: es de tipo cálido; leer despacio «vanguardia», «retaguardia» y si dice «más frío» o «más cálido».

**Minijuego** (19 preguntas reales de examen en estas clases):

- Cuando dos masas de aire entran en contacto, si el aire cálido de una depresión no toca el suelo y el aire polar de retaguardia es más frío que el de vanguardia se trataría de: *(and-py-2023-c2-g12)*
- ¿Qué tipo de frente suele tener asociados cumulonimbos y una alta precipitación? *(and-py-2021-c2-g16)*
- Señale la opción correcta. *(and-py-2025-c1-g11)*

**Relacionados:** 2.1, 2.5, 2.6.

#### 2.3 · Los modelos de viento: Euler, geostrófico, de gradiente, ciclostrófico y antitríptico

🔎 Profundiza · ✅ [guion](py/2-3-modelos-de-viento.md) · clase py-2-3

Los cinco modelos de viento del temario, construidos añadiendo fuerzas: Euler, geostrófico, de gradiente, ciclostrófico y antitríptico, y la ley de Buys-Ballot que sale del geostrófico. Cada convocatoria trae al menos una pregunta que mezcla qué fuerzas tiene cada modelo y si va paralelo o corta las isobaras.

**Gancho:** Navegando con el viento justo por la popa, Andrés oye a un compañero de pantalán decir que «la borrasca la tienes a tu izquierda» sin mirar ningún mapa. Andrés quiere saber de dónde sale esa regla y por qué el viento no va derecho de la alta a la baja.

**Para llevarse:**

- Fuerzas en juego: gradiente de presión (de altas a bajas, perpendicular a las isobaras, es el motor), Coriolis (desvía a la derecha en el HN, nula en el ecuador, máxima en los polos y crece con la velocidad), centrífuga (con isobaras curvas) y rozamiento (en los primeros 1000 m).
- Viento de Euler: ideal, su única fuerza es el gradiente horizontal de presión, su aceleración es proporcional a ese gradiente y va de las altas a las bajas perpendicular a las isobaras.
- Viento geostrófico: equilibrio entre gradiente y Coriolis; teórico, paralelo a isobaras rectilíneas, deja las altas a la derecha en el HN y se aproxima en torno al 90 % al viento real por encima de unos 1000 m. No considera rozamiento ni centrífuga.
- Ley de Buys-Ballot (HN): con el viento por la espalda, las bajas a la izquierda y las altas a la derecha.
- Viento de gradiente: gradiente, Coriolis y centrífuga; teórico y paralelo a isobaras curvas. Viento ciclostrófico: gradiente equilibrado por la centrífuga, con Coriolis despreciable; tornados, trombas y latitudes muy bajas.
- Viento antitríptico: el modelo que lleva en su ecuación la fuerza de rozamiento; deja de ser paralelo y corta las isobaras hacia las bajas presiones.
- El viento real de superficie corta las isobaras unos 10–20° sobre el mar y 30° o más sobre tierra: entra en espiral en las borrascas y sale en espiral de los anticiclones.

**Trampas del examen:**

- Falso: en el viento de Euler el aire va de las bajas a las altas presiones, o su única fuerza es Coriolis, la centrífuga o el gradiente vertical. Cierto: va de altas a bajas y su única fuerza es el gradiente horizontal de presión.
- Falso: el geostrófico es perpendicular a las isobaras. Cierto: es paralelo a isobaras rectilíneas.
- Falso: el geostrófico deja las altas presiones a la izquierda en el hemisferio norte. Cierto: las deja a la derecha (a la izquierda en el sur).
- Falso: el geostrófico no considera Coriolis o sí considera el rozamiento. Cierto: es gradiente más Coriolis, sin rozamiento.
- Falso: el viento de gradiente es un viento real afectado por la fricción o perpendicular a las isobaras. Cierto: es teórico, sin rozamiento, y paralelo a isobaras curvas.
- Falso: el antitríptico es paralelo a las isobaras, va de bajas a altas o su única fuerza es el gradiente. Cierto: es el que considera el rozamiento; en el examen marca siempre la opción del rozamiento, aunque en teoría estricta desprecie Coriolis.

**Minijuego** (18 preguntas reales de examen en estas clases):

- Un viento ideal en el que la única fuerza que actúa sobre él es el gradiente horizontal de presión se denomina: *(and-py-2026-c2-g17)*
- Un viento que discurre paralelo a las isobaras rectilíneas y que se aproxima al 90% del viento real se denomina: *(and-py-2020-c1-g17)*
- De las siguientes afirmaciones acerca del viento antitríptico marque la opción correcta. *(and-py-2025-c3-g13)*

**Relacionados:** 2.1, 2.4.

#### 2.4 · Vientos regionales del Mediterráneo y del Atlántico

🔎 Profundiza · ✅ [guion](py/2-4-vientos-regionales.md) · clase py-2-4

Los vientos con nombre propio de nuestras costas: la rosa mediterránea, los fríos del norte (mistral y tramontana), los del Estrecho (levante y poniente), los cálidos del sur (siroco y lebeche), la galerna del Cantábrico, el vendaval y los alisios. El examen los pregunta casi siempre por su descripción, con opciones cortas de nombres.

**Gancho:** Andrés planea bajar su velero desde Cádiz hasta Tarifa en verano y en el pantalán le advierten de que, si entra el levante, el Estrecho se pone imposible; otro le cuenta que en el Cantábrico, una tarde de calor, le cayó encima de golpe un viento brutal del noroeste. Andrés quiere poner nombre y carácter a cada viento.

**Para llevarse:**

- El viento se nombra por de dónde viene. Rosa mediterránea: N tramontana, NE gregal, E levante, SE siroco, S mediodía, SW lebeche, W poniente, NW mistral.
- Mistral: del NW, baja por el valle del Ródano y sopla sobre todo en el golfo de León; frío y seco, con cielos muy limpios y rachas intensas.
- Tramontana: del N, fría y seca (Ampurdán, cabo de Creus, norte de Baleares); además, en todo el Mediterráneo se llama así a los vientos fríos y secos de la parte posterior (retaguardia) de las borrascas.
- Levante: del E, se encañona en el Estrecho, más frecuente de mayo a octubre, y llega seco y cálido a la cara atlántica (Tarifa, Cádiz). Poniente: del W, de origen atlántico.
- Siroco: del SE, de origen sahariano, extremadamente cálido en verano y de temperatura moderada en invierno.
- Galerna: viento súbito, muy fuerte y racheado, del W o NW, propio del mar Cantábrico, que corta de golpe un tiempo apacible y caluroso, acompañado o no de precipitación; típica de los meses cálidos.
- Vendaval: viento fuerte del SW en el golfo de Cádiz, ligado a las borrascas atlánticas de invierno, con lluvia, temporal y mala visibilidad. Alisios: del NE, reinan en Canarias.

**Trampas del examen:**

- Falso: la galerna es propia del golfo de León o de las costas mediterráneas. Cierto: es del mar Cantábrico.
- Falso: la galerna va siempre acompañada de precipitaciones o es un viento persistente. Cierto: es súbita y puede ir acompañada o no de precipitación.
- Falso: el mistral se caracteriza por altas temperaturas. Cierto: bajas temperaturas, aire seco, cielos muy claros y rachas intensas.
- Falso: la tramontana es fría y húmeda, o cálida y de la vanguardia de las borrascas. Cierto: es fría y seca y sopla en la retaguardia.
- Falso: el siroco es un viento característico de la costa cantábrica. Cierto: es mediterráneo, del SE.
- Falso: los vendavales son de componente NE y los alisios de SW. Cierto: vendaval del SW y alisios del NE.

**Minijuego** (18 preguntas reales de examen en estas clases):

- Un viento súbito muy fuerte y racheado, acompañado o no de precipitaciones, propio del mar Cantábrico, y que corta de manera brusca y súbita un tiempo apacible y generalmente caluroso, se denomina: *(and-py-2023-c2-g13)*
- En general, en todo el Mediterráneo, los vientos fríos y secos que soplan en las regiones posteriores a las borrascas reciben el nombre de: *(and-py-2026-c1-g13)*
- ¿Qué viento provoca tiempo seco en una de las caras de Gibraltar, y tiene mayor frecuencia en los meses de mayo a octubre? *(and-py-2021-c1-g14)*

**Relacionados:** 2.3, 2.1, 2.8.

#### 2.5 · Humedad y nubes

🔎 Profundiza · ✅ [guion](py/2-5-humedad-y-nubes.md) · clases py-2-5, py-2-6

Humedad absoluta, humedad relativa, punto de rocío y psicrómetro, y después las nubes: cómo se forman (convectivas, orográficas y frontales) y en qué piso va cada uno de los diez géneros. Las preguntas cambian unidades y magnitudes en las definiciones de humedad, y alturas y nombres en las de nubes.

**Gancho:** Una mañana de otoño Andrés baja al camarote, frío y con los cristales empañados, enciende la calefacción y al rato el ambiente «se seca» aunque nadie ha sacado agua; luego sube a cubierta y ve el cielo con un velo gris tras el que el sol parece un cristal esmerilado. Quiere entender ambas cosas.

**Para llevarse:**

- Cuanto más caliente está el aire, más vapor admite; se satura añadiendo vapor o enfriándolo, y entonces el vapor sobrante se condensa (rocío, nubes o niebla).
- Humedad absoluta: la densidad del vapor, en gramos por metro cúbico. Humedad relativa: porcentaje entre el vapor que tiene el aire y el que tendría saturado a la misma temperatura (tensión de vapor entre tensión saturante).
- Si calientas el aire sin añadir vapor la humedad relativa baja; si lo enfrías, sube.
- Punto de rocío: la temperatura a la que hay que enfriar el aire, sin cambiar su presión ni su vapor, para que se sature; si la temperatura llega a él, la humedad relativa es del 100 %.
- Psicrómetro: termómetro seco y termómetro húmedo; con las tablas psicrométricas da la humedad relativa y el punto de rocío. Poca diferencia entre ambos = humedad relativa alta (seco 18 °C y húmedo 15 °C dan algo más del 70 % y un punto de rocío de unos 13 °C).
- Nubes por su formación: convectivas (corriente ascendente por inestabilidad: cúmulos y cumulonimbos), orográficas (aire forzado a subir por una ladera) y frontales (la masa cálida asciende sobre la fría y se enfría adiabáticamente).
- Pisos del examen: altas, por encima de unos 6000 m (cirros, cirrocúmulos, cirrostratos); medias, entre 2000 y 6000 m (altocúmulos, altostratos); bajas, por debajo de 2000 m (estratos, estratocúmulos, nimbostratos); de desarrollo vertical (cúmulos y cumulonimbos). «Cirro-» es alta, «alto-» es media.

**Trampas del examen:**

- Falso: la humedad absoluta se expresa en gramos por kilogramo, en g/m² o en litros. Cierto: en gramos por metro cúbico (los g/kg son humedad específica o relación de mezcla).
- Falso: la humedad relativa es la densidad del vapor en g/m³ o la presión que ejerce el vapor. Cierto: es el porcentaje respecto a la saturación a esa temperatura.
- Falso: el punto de rocío es el valor que debe tomar la presión o la humedad absoluta para saturar el aire. Cierto: es una temperatura.
- Falso: los altocúmulos o los altostratos son nubes altas. Cierto: el prefijo «alto-» indica nubes medias.
- Falso: los cúmulos son nubes de desarrollo horizontal. Cierto: son de desarrollo vertical (aunque en verano se asocien a buen tiempo).
- Falso: los estratos o los estratocúmulos son nubes medias, y el nimbostrato es alto. Cierto: para el examen los tres son nubes bajas; las altas rara vez pasan de 10 000 m, nunca de 25 000.

**Minijuego** (38 preguntas reales de examen en estas clases):

- ¿Cómo se denomina a la cantidad del vapor de agua expresada en gramos por metro cúbico en una masa de aire? *(and-py-2021-c1-g15)*
- El valor que debe tomar la temperatura para que con la misma cantidad de vapor de agua se alcance el punto de saturación se denomina: *(and-py-2020-c3-g19)*
- Acerca de las nubes marque la opción correcta. *(and-py-2026-c1-g14)*

**Relacionados:** 2.2, 2.6.

#### 2.6 · Nieblas

🔎 Profundiza · ✅ [guion](py/2-6-nieblas.md) · clase py-2-7

Qué es la niebla, cómo se clasifica por su formación (enfriamiento, evaporación y mezcla), cómo se forman la de radiación, la de advección y la de vapor, cómo se prevé a bordo con el psicrómetro y qué la disipa. El examen pregunta sobre todo en qué grupo va cada niebla y cambia frío por cálido y húmedo por seco.

**Gancho:** Andrés sale de madrugada con buen tiempo y, a pocas millas, con aire templado y húmedo pasando sobre un agua fría, se mete en una niebla que no le deja ver la proa; en cambio, la niebla que días antes cubría la ría al amanecer se levantó en cuanto salió el sol. Se pregunta por qué una se fue sola y la otra no.

**Para llevarse:**

- La niebla es una nube en contacto con la superficie; se llama niebla cuando la visibilidad baja de 1 km. En los partes de AEMET: niebla, menos de 1 km; mala, 1–4 km; regular, 4–10 km; buena, más de 10 km. Si la causa son partículas secas es calima.
- De enfriamiento: radiación, advección y orográfica. De evaporación: vapor y frontal. De mezcla: dos corrientes de aire de naturaleza distinta.
- Radiación: sobre tierra, en noches despejadas, con poco viento y aire húmedo; típica de tierras bajas, valles y rías de otoño a invierno, y se levanta cuando el sol calienta el suelo.
- Advección: aire cálido y húmedo sobre una superficie más fría que su punto de rocío; es la más frecuente en el mar, la más persistente, se mantiene con vientos de unos 5 a 15 nudos y puede durar días.
- Vapor: aire muy frío sobre agua mucho más templada; típica de lagos y ríos en otoño o principios de invierno. Frontal: lluvia templada que se evapora al caer en aire frío.
- Previsión a bordo: el psicrómetro da el punto de rocío; si está próximo a la temperatura del agua del mar, la niebla es muy probable.
- Disipación: cuando la temperatura del aire vuelve a superar el punto de rocío: sol, viento más cálido y seco, paso a aguas más templadas o viento de fuerza 4 o más.

**Trampas del examen:**

- Falso: la niebla de radiación se debe al calentamiento del terreno y se da en primavera y verano. Cierto: se debe al enfriamiento del terreno y es de otoño a invierno.
- Falso: la niebla de advección es de evaporación o de mezcla, o la produce aire seco. Cierto: es de enfriamiento, con aire cálido y húmedo.
- Falso: la niebla de advección raramente se produce en el mar. Cierto: es la más frecuente sobre el mar.
- Falso: la niebla de vapor se forma con aire cálido sobre agua fría, o con aire frío sobre agua fría. Cierto: aire frío sobre agua mucho más templada.
- Falso: la niebla de mezcla se produce entre masas de aire de la misma naturaleza. Cierto: entre corrientes de naturaleza distinta.
- Falso: la niebla de mar se aclara sobre aguas más frías, o un viento frío y húmedo o más intenso la hace persistir. Cierto: se aclara sobre aguas más templadas y se dispersa con viento de fuerza 4 o más.

**Minijuego** (19 preguntas reales de examen en estas clases):

- ¿Cuáles de estas nieblas pertenecen al grupo de “nieblas por enfriamiento”? *(and-py-2021-c1-g20)*
- Utilizando un psicrómetro entenderemos que tenemos mayor posibilidad de nieblas cuando: *(and-py-2021-c2-g20)*
- De las siguientes afirmaciones marque la opción correcta. *(and-py-2025-c1-g17)*

**Relacionados:** 2.5, 2.2.

#### 2.7 · Las olas

🔎 Profundiza · ✅ [guion](py/2-7-las-olas.md) · clase py-2-8

Qué es una ola, sus partes (cresta, seno, longitud de onda, altura, amplitud y periodo), de qué depende su altura y cómo distinguir la mar de viento de la mar de fondo. Son preguntas de definición en las que el examen intercambia distancia y tiempo, cresta y seno, doble y mitad, y las características de los dos tipos de mar.

**Gancho:** Una tarde casi sin viento, Andrés sale del puerto y se encuentra un oleaje largo, de crestas redondeadas, que no viene de donde sopla la brisa; además, cuenta con el reloj ocho segundos entre cresta y cresta mientras pasan junto a una boya. Quiere saber qué es ese oleaje y qué ha medido.

**Para llevarse:**

- Las olas son el resultado visible de la transferencia de energía del viento al mar; el oleaje es un movimiento periódico en el que avanza la energía y el agua apenas sube y baja en el sitio, como un corcho.
- Longitud de onda: distancia horizontal entre dos crestas (o dos senos) consecutivos, en metros.
- Periodo: tiempo, en segundos, entre el paso de dos crestas (o dos senos) consecutivos por un punto fijo.
- Altura: distancia vertical entre el seno y la cresta; la amplitud va del nivel del mar en calma a la cresta, así que la altura es el doble de la amplitud.
- La mar crece con la intensidad del viento, su persistencia y el fetch (extensión de mar sobre la que sopla); influyen la profundidad y las corrientes, pero no la salinidad.
- Mar de viento: la levanta el viento que sopla encima; crestas agudas y a menudo rotas, longitud corta, altura irregular y misma dirección que el viento reinante.
- Mar de fondo (de leva, mar tendida): viene de un temporal lejano; crestas suaves y redondeadas que no rompen en alta mar, longitud muy superior a la altura, olas regulares y dirección que no tiene por qué coincidir con el viento local.

**Trampas del examen:**

- Falso: la longitud de onda va de una cresta a un seno. Cierto: va de cresta a cresta o de seno a seno consecutivos.
- Falso: la altura de la ola es la mitad (o el triple) de la amplitud. Cierto: es el doble de la amplitud.
- Falso: la altura se mide entre dos crestas, entre dos senos, hasta el fondo marino o hasta el nivel medio. Cierto: es la distancia vertical del seno a la cresta.
- Falso: el periodo es una distancia, o el tiempo entre una cresta y un seno. Cierto: es el tiempo entre dos crestas o dos senos consecutivos; y la frecuencia no es ninguna distancia.
- Falso: las olas son la transferencia de calor o de materia de la atmósfera al mar. Cierto: son transferencia de energía del viento.
- Falso: la mar de viento tiene altura regular y la mar de fondo crestas agudas o longitud y altura similares. Cierto: al revés; la de viento es irregular y aguda, la de fondo redondeada y con longitud muy superior a la altura.

**Minijuego** (22 preguntas reales de examen en estas clases):

- El tiempo, contado en segundos, entre el paso de dos crestas sucesivas por un mismo punto, se denomina: *(and-py-2023-c3-g19)*
- El “mar de fondo” forma olas con: *(and-py-2022-c2-g20)*
- En relación a las olas marque la opción correcta. *(and-py-2024-c3-g17)*

**Relacionados:** 2.4, 2.8.

#### 2.8 · Corrientes marinas

🔎 Profundiza · ✅ [guion](py/2-8-corrientes-marinas.md) · clase py-2-9

Qué es una corriente marina y cómo se nombra, sus cuatro tipos por su causa (densidad, arrastre, gradiente y marea) y las corrientes de nuestras costas: Vizcaya, Portugal, Canarias, el Estrecho en dos capas y el Mediterráneo occidental. El examen cruza las causas de cada tipo y da la vuelta a las direcciones de las corrientes regionales.

**Gancho:** Navegando por el Estrecho rumbo al Mediterráneo, Andrés nota que su velero avanza más de lo que marca la corredera, y un amigo le cuenta que por debajo, en profundidad, el agua va justo al revés, hacia el Atlántico. A Andrés le parece imposible que el agua del mismo estrecho vaya en dos sentidos a la vez.

**Para llevarse:**

- Una corriente se define por su rumbo y su intensidad (en nudos) y, al revés que el viento, se nombra por hacia dónde va: una corriente sur lleva el agua hacia el sur. Se mide con el correntómetro.
- Tipos: de densidad o termohalinas (diferencias de temperatura y salinidad, explican la mayor parte de las corrientes profundas); de arrastre o deriva (acción directa y persistente del viento); de gradiente (desnivel de la superficie por diferencias de presión); de marea (atracción de la Luna y el Sol). Todas se desvían a la derecha en el HN.
- Golfo de Vizcaya: corriente débil, rara vez de más de un nudo, e irregular en intensidad y dirección.
- Corriente de Portugal: hacia el sur, muy débil; una rama entra en el Mediterráneo por el Estrecho y el resto sigue hacia el sur como corriente de Canarias, que es fría y va hacia el S-SW.
- Estrecho de Gibraltar: en superficie entra el agua atlántica, menos densa, hacia el E; en profundidad sale la mediterránea, más salada y densa, hacia el W. Por el centro, hacia Tarifa, puede rondar los 2 nudos.
- Mediterráneo occidental: frente a Ceuta, entre Málaga y el cabo de Gata y en el canal entre Túnez y Sicilia, hacia el E; entre el cabo de Palos y el cabo de San Antonio se divide en dos ramas, al ESE y al NE; en el golfo de León, con NW fuerte, hacia el S y SE.
- Para travesías oceánicas, las pilot charts y routeing charts dan estadísticas por océano y mes (vientos, corrientes, olas, temporales); no son una previsión.

**Trampas del examen:**

- Falso: las corrientes de densidad se llaman de marea o de arrastre, y las de marea se deben a temperatura o salinidad. Cierto: las de densidad son las termohalinas y las de marea las causan la Luna y el Sol.
- Falso: las corrientes de arrastre las originan la Luna y el Sol o el campo magnético. Cierto: las origina la acción directa y persistente del viento.
- Falso: la mayor parte de las corrientes profundas son de arrastre. Cierto: son sobre todo de densidad.
- Falso: las de gradiente se deben a la temperatura o «exclusivamente» a la presión en superficie. Cierto: se deben a un gradiente de presión que desnivela el mar, y cuidado con los absolutos.
- Falso: en el Estrecho la corriente superficial va de E a W y el retorno mediterráneo es superficial. Cierto: en superficie entra el Atlántico hacia el E y el Mediterráneo sale en profundidad hacia el W.
- Falso: la corriente de Portugal va hacia el norte, continúa como corriente de los alisios, o la de Canarias va al norte. Cierto: Portugal va al sur y sigue como corriente de Canarias, fría y hacia el S-SW; y entre Palos y San Antonio son dos ramas, no tres.

**Minijuego** (27 preguntas reales de examen en estas clases):

- Las corrientes debidas a variaciones de temperatura y salinidad entre aguas de diferentes lugares o a distintas profundidades reciben el nombre de: *(and-py-2026-c1-g15)*
- ¿Cuál es el sentido más habitual de las corrientes en el litoral mediterráneo desde el meridiano de Málaga al cabo de Gata? *(and-py-2021-c1-g19)*
- De las siguientes afirmaciones marque la opción correcta. *(and-py-2024-c2-g20)*

**Relacionados:** 2.7, 3.3, 4.5.

### Tema 3 · Teoría de navegación (eliminatorio)

#### 3.0 · La teoría de navegación de un vistazo

🧭 Panorama · ✅ [guion](py/3-0-teoria-de-navegacion.md) · clases py-3-1, py-3-2, py-3-3, py-3-4, py-3-5, py-3-6, py-3-7, py-3-8, py-3-9, py-3-10

Recorrido por todo el tema de teoría de navegación: coordenadas, corrección total, viento y corriente, la hora, la estima analítica y las mareas, y los equipos del puente (radar, GNSS, cartas electrónicas y AIS). Es la teoría que sostiene los ejercicios de carta y además es un bloque eliminatorio: no basta con aprobar el examen, hay que sacar este bloque.

**Gancho:** Andrés sale del puerto con el plotter encendido y se da cuenta de que no sabe leer la mitad de las siglas de la pantalla (COG, SOG, XTE), que no sabe por qué la aguja no marca lo mismo que la carta y que no tiene claro qué hora apuntar en el diario. Elena le dice que todo eso es un solo tema del examen, y de los que más pesan.

**En el examen:** Son 10 de las 40 preguntas del Patrón de Yate y es eliminatorio: como máximo se pueden fallar 5 en este bloque, aunque el resto del examen salga bien. Va en el módulo de navegación, junto con la carta.

**Recorre:** La esfera terrestre: círculos, latitud y longitud · Corrección total: de dónde sale y cómo se calcula · Viento y corriente: abatimiento, deriva y rumbo efectivo · Loxodrómica y estima analítica: los conceptos · La hora en la mar: TU, hora civil, legal, oficial y HRB · Mareas: el Anuario y la curva de la marea · Publicaciones náuticas: derroteros, Avisos a los Navegantes y radioavisos · El radar: ajustes, presentaciones, demoras y distancias · GNSS: las siglas de la pantalla y el datum · Cartas electrónicas y AIS.

**Para llevarse:**

- La esfera terrestre: el ecuador y los paralelos son perpendiculares al eje, los meridianos pasan por los polos; la latitud es arco de meridiano desde el ecuador y la longitud, arco de ecuador desde Greenwich hasta el meridiano del lugar.
- Corrección total: Ct = dm + Δ, con la declinación según el lugar y el año y el desvío según el barco y el rumbo de aguja; Rv = Ra + Ct.
- Viento y corriente: el viento abate y da el rumbo de superficie; la corriente da deriva y el rumbo efectivo, y afecta por igual a todos los barcos.
- Loxodrómica y estima analítica: la loxodrómica es navegar a rumbo constante y en la carta Mercator es una recta; el apartamiento son millas sobre un paralelo y A = ΔL · cos lm.
- La hora: todas las horas civiles se cuentan con el Sol medio desde el meridiano inferior; la legal es la del huso, la oficial la fija el Gobierno y la hora reloj de bitácora, el patrón.
- Mareas: el Anuario del Instituto Hidrográfico de la Marina da las horas en TU y las alturas sobre el cero hidrográfico; la altura en un instante sale de C = A · sen² (90° · I / D).
- Publicaciones náuticas: el derrotero describe la costa y sus peligros; los Avisos a los Navegantes, semanales y gratuitos, mantienen al día cartas y publicaciones; lo urgente va por radioaviso.
- El radar: con lluvia, ganancia y anti-clutter de lluvia; con mar, ganancia y anti-clutter de mar; EBL da la demora o marcación y VRM la distancia; Dv = Rv + M.
- El GNSS: COG es el rumbo efectivo, SOG la velocidad efectiva, XTE el error transversal, ETA la hora estimada de llegada y MOB el hombre al agua; antes de pasar la posición a la carta, mismo datum.
- Cartas electrónicas y AIS: solo hay dos tipos de carta, raster (RNC) y vectorial (ENC); el AIS trabaja en VHF, ayuda a prevenir abordajes pero no sustituye al radar ni a la vigilancia visual.

**Minijuego** (180 preguntas reales de examen en estas clases):

- ¿El Angulo que separa el Norte Verdadero del Norte de Aguja se conoce cómo? *(and-py-2021-c2-n10)*
- ¿El rumbo que describe una embarcación cuando ha sido abatido por el viento se denomina? *(and-py-2021-c2-n04)*
- La velocidad efectiva en un equipo GNSS está representada por las siglas: *(and-py-2024-c1-n07)*

#### 3.1 · La esfera terrestre: círculos, latitud y longitud

🔎 Profundiza · ✅ [guion](py/3-1-la-esfera-terrestre.md) · clase py-3-1

Las definiciones finas de la esfera terrestre: eje, polos, círculos máximos y menores, meridiano del lugar, latitud, longitud, trópicos y círculos polares, y cómo se calculan las diferencias de latitud y de longitud. Son preguntas de puro vocabulario que caen una o dos por examen y, con las definiciones claras, son puntos seguros en un bloque que solo deja 5 fallos.

**Gancho:** En el pantalán, un vecino de amarre le dice a Andrés que los meridianos son perpendiculares al eje de la Tierra, «como el ecuador». Andrés asiente, pero algo no le cuadra; el episodio explica quién es perpendicular a qué.

**Para llevarse:**

- Los círculos máximos (el plano pasa por el centro) son el ecuador y los meridianos; los paralelos son círculos menores.
- El ecuador y los paralelos son perpendiculares al eje; los meridianos pasan por los polos, contienen al eje y son perpendiculares al ecuador.
- Cada observador tiene su meridiano del lugar: el superior pasa por él y el inferior está a 180° de longitud.
- Latitud: arco de meridiano desde el ecuador hasta el paralelo del lugar, de 0° a 90° N o S; longitud: arco de ecuador desde Greenwich hasta el meridiano del lugar, de 0° a 180° E o W (en el PY también se ha dado por buena «arco de paralelo» para la longitud).
- Trópico de Cáncer a 23° 27′ N, Trópico de Capricornio a 23° 27′ S y círculos polares a 66° 33′, uno en cada hemisferio.
- Misma latitud solo significa mismo paralelo; misma longitud significa mismo meridiano, con la misma hora civil del lugar.
- Δl y ΔL: con el mismo nombre se restan y con distinto nombre se suman; si la ΔL pasa de 180° se toma 360° − ΔL y se cambia el sentido.

**Trampas del examen:**

- Falso: «el ecuador es paralelo al eje» o «los meridianos son perpendiculares al eje». Cierto: ecuador y paralelos son perpendiculares al eje; los meridianos son perpendiculares al ecuador.
- Falso: «todos los círculos máximos pasan por los polos». Cierto: solo los meridianos; el ecuador también es círculo máximo y no pasa por ellos.
- Falso: «el meridiano de Greenwich divide la Tierra en hemisferios norte y sur». Cierto: con el de 180° la divide en este y oeste; la que separa norte y sur es el ecuador.
- Falso: medir la longitud «hasta el paralelo del buque» o «desde el meridiano del lugar hasta Greenwich». Cierto: la longitud va desde Greenwich y siempre termina en el meridiano del lugar.
- Falso: que la latitud sea un arco de paralelo o se mida desde Greenwich. Cierto: la latitud es arco de meridiano contado desde el ecuador.
- Falso: que los círculos polares estén solo en el hemisferio norte. Cierto: hay uno en cada hemisferio, a 66° 33′ N y S.

**Minijuego** (22 preguntas reales de examen en estas clases):

- ¿Qué círculos máximos de la superficie terrestre pasan por los polos?: *(and-py-2023-c3-n04)*
- Todos los observadores que se encuentren en el mismo paralelo: *(and-py-2022-c2-n04)*
- La Longitud se mide: *(and-py-2025-c1-n01)*

**Relacionados:** 3.4, 4.7.

#### 3.2 · La corrección total: de dónde sale y cómo se calcula

🔎 Profundiza · ✅ [guion](py/3-2-la-correccion-total.md) · clase py-3-2

De qué depende la declinación magnética, el desvío y la corrección total, cómo se actualiza la declinación de la carta y cómo se obtiene la Ct con la Polar, una enfilación o una oposición. Es una de las preguntas fijas del examen y la base de todos los ejercicios de carta.

**Gancho:** Andrés navega de noche al rumbo de aguja que trazó en la carta y, al cruzar la enfilación de dos luces de la costa, ve que la aguja le da tres grados más de lo que mide en la carta. Al final del episodio sabrá qué corrección total tiene y para qué rumbo vale ese desvío.

**Para llevarse:**

- Declinación (dm): de Nv a Nm; depende de la zona geográfica y del paso del tiempo, no del barco. Desvío (Δ): de Nm a Na; depende del propio barco y del rumbo de aguja.
- Ct = dm + Δ, cada una con su signo (E +, W −); Rv = Ra + Ct y Ra = Rv − Ct.
- La dm de la carta se actualiza sumando, con su signo, la variación anual multiplicada por los años: dm 1° 40′ W de 2016 con variación 7′ E da 0° 30′ W en 2026.
- La Polar está prácticamente en el norte verdadero: Ct = 0° − Da, así que una Da de 357° da Ct +3°.
- En una enfilación o una oposición (demoras que difieren 180°), Ct = Dv medida en la carta menos Da, y el desvío es Δ = Ct − dm.
- Si el desvío es 0, el rumbo de aguja es igual al magnético y Rv = Rm + dm.
- Navegando al Ra 000°, si la Ct es positiva el norte verdadero queda por babor; si es negativa, por estribor.

**Trampas del examen:**

- Falso: que la declinación dependa de los materiales ferromagnéticos, de la ubicación de la aguja o de los equipos de a bordo. Cierto: eso describe el desvío; la declinación depende de la zona y del tiempo.
- Falso: «la Ct siempre es positiva». Cierto: la Ct lleva el signo que resulte de sumar dm y Δ con los suyos.
- Falso: «si la Ct es 0, el desvío es 0». Cierto: basta con que dm y Δ sean iguales y de signo contrario.
- Falso: que el desvío sacado de una enfilación valga para todos los rumbos. Cierto: vale solo para el rumbo de aguja al que se navegaba al tomarla.
- Falso: restar a la demora de aguja la de la carta, o restar además la declinación. Cierto: Ct = Dv (carta) − Da, sin tocar la declinación.
- Falso: que la Ct se pueda calcular «con cualquier demora». Cierto: hace falta conocer la demora verdadera, con una enfilación, una oposición, la Polar o desde una situación segura.

**Minijuego** (25 preguntas reales de examen en estas clases):

- La declinación magnética depende: *(and-py-2024-c1-n02)*
- En relación a la corrección total, ¿qué respuesta es la correcta? *(and-py-2022-c2-n02)*
- Si obtenemos la corrección total mediante una enfilación, el desvío calculado será válido para: *(and-py-2025-c1-n02)*

**Relacionados:** 3.3, 4.1.

#### 3.3 · Viento y corriente: abatimiento, deriva y rumbo efectivo

🔎 Profundiza · ✅ [guion](py/3-3-viento-y-corriente.md) · clase py-3-3

Qué hacen el viento y la corriente con el rumbo del barco: abatimiento y rumbo de superficie, deriva y rumbo efectivo, y por qué al viento cada barco responde distinto y a la corriente todos igual. Las definiciones de abatimiento y deriva caen casi en cada convocatoria, con opciones que cambian una sola palabra.

**Gancho:** Navegando a motor con levante, Andrés mantiene el rumbo de aguja clavado, pero ve que la estela sale torcida respecto a la crujía y que la proa, proyectada sobre la costa, se le va corriendo. El episodio explica qué le está pasando y qué rumbo tendría que dar.

**Para llevarse:**

- Rumbo verdadero: hacia donde apunta la proa; rumbo de superficie: el que sigues sobre el agua por el viento; rumbo efectivo: el que sigues sobre el fondo por la corriente, sola o junto con el viento.
- Abatimiento: el ángulo entre la estela y el plano de crujía, o entre el rumbo verdadero y el de superficie; viento por babor, Ab positivo; por estribor, negativo.
- Rs = Rv + Ab y, para saber qué rumbo dar, Rv = Rs − Ab; el rumbo de superficie siempre queda a sotavento del verdadero.
- Deriva: el ángulo entre el rumbo verdadero (o el de superficie, si hay viento) y el rumbo efectivo, es decir, entre el movimiento respecto a la superficie y respecto al fondo.
- Para un mismo viento, cada barco abate distinto; la corriente, en la teoría de examen, afecta por igual a todos los buques, sea cual sea su calado.
- Por convenio el viento solo cambia la dirección; la corriente cambia rumbo y velocidad, y aparece la velocidad efectiva, que es la SOG del GNSS.
- El orden para llegar al timón: rumbo de superficie, quitar el abatimiento para el verdadero, quitar la Ct para el de aguja.

**Trampas del examen:**

- Falso: «para un mismo viento, todos los buques tienen el mismo abatimiento». Cierto: cada barco abate distinto según su obra muerta, su forma y su velocidad.
- Falso: «el rumbo que hace el buque afectado por el viento se llama efectivo». Cierto: es el rumbo de superficie; el efectivo es el de la corriente.
- Falso: tomar por falsa «a todos los buques, independientemente de su calado, les afecta la corriente por igual». Cierto: en el examen esa frase es verdadera.
- Falso: «el abatimiento cambia la velocidad del barco». Cierto: por convenio el viento solo cambia la dirección; la velocidad la cambia la corriente.
- Falso: que con viento y corriente a la vez el rumbo resultante sea el de superficie o un «rumbo de superficie efectivo». Cierto: es el rumbo efectivo.
- Falso: confundir abatimiento y deriva. Cierto: la estela torcida respecto a la crujía sin corriente es abatimiento; el ángulo entre la crujía y la derrota sobre el fondo con corriente y sin viento es deriva.

**Minijuego** (19 preguntas reales de examen en estas clases):

- El ángulo entre la estela del buque y el plano de crujía del buque es: *(and-py-2023-c1-n05)*
- ¿Qué afirmación es CORRECTA?: *(and-py-2022-c1-n06)*
- El rumbo real que hace el barco, cuando está afectado por la acción conjunta del viento y de la corriente, se denomina: *(and-py-2022-c3-n05)*

**Relacionados:** 3.2, 3.7, 4.4, 4.5.

#### 3.4 · La hora en la mar: universal, civil, legal, oficial y la del reloj de bitácora

🔎 Profundiza · ✅ [guion](py/3-4-la-hora-en-la-mar.md) · clase py-3-5

Las horas de la mar: Sol verdadero y Sol medio, tiempo universal, hora civil del lugar, husos y hora legal, hora oficial y hora reloj de bitácora, y cómo se pasa de una a otra. Caen varias preguntas por examen con opciones que se diferencian en una palabra, y además el Anuario de Mareas trabaja en TU.

**Gancho:** Andrés quiere apuntar en el diario de a bordo la hora de salida y no sabe cuál poner: la de su reloj, la del GNSS o la que marcan las tablas. Elena le explica que en la mar hay cinco horas distintas y quién decide cada una.

**Para llevarse:**

- Todas las horas civiles se cuentan con el Sol medio, que recorre el ecuador a velocidad uniforme, y desde su paso por el meridiano inferior, es decir, desde la medianoche.
- Tiempo universal: desde el paso del Sol medio por el meridiano inferior de Greenwich; hora civil del lugar: por el meridiano inferior del lugar, así que cada meridiano tiene la suya.
- 15° de longitud son 1 hora y 1° son 4 minutos; HcL = TU más la longitud en tiempo, sumando al E y restando al W.
- Hay 24 husos de 15°, limitados por dos meridianos que difieren 15°; la hora legal es la hora civil del meridiano central del huso, Hz = TU ± huso, y coincide con la HcL si la longitud es múltiplo de 15°.
- La hora oficial la fija el Gobierno: en la península y Baleares, TU + 1 en invierno y TU + 2 en verano; en Canarias, TU y TU + 1.
- La hora reloj de bitácora la fija el patrón y rige la vida a bordo; puede coincidir con la legal o la oficial si él lo decide, pero no tiene por qué.
- Al cruzar el meridiano de 180° hacia el W se suma un día; hacia el E, se resta.

**Trampas del examen:**

- Falso: cambiar «Sol medio» por «Sol verdadero» o «meridiano inferior» por «superior» en la definición de TU o de HcL. Cierto: siempre Sol medio y meridiano inferior; de Greenwich es el TU y del lugar, la HcL.
- Falso: «la HRB es igual a la hora oficial» o «coincide siempre con la legal». Cierto: la fija el patrón y puede coincidir si él así lo decide.
- Falso: llamar legal a la que fija el Gobierno. Cierto: la del Gobierno es la oficial; la legal es la del huso.
- Falso: «la hora legal es la hora de tiempo universal del meridiano central del huso». Cierto: es la hora civil de ese meridiano central.
- Falso: que la HcL coincida siempre con la legal. Cierto: solo si estás en el meridiano central del huso, con longitud múltiplo de 15°.
- Falso: que dos lugares con la misma longitud en distintos países tengan siempre la misma hora oficial. Cierto: tienen siempre la misma hora legal.

**Minijuego** (16 preguntas reales de examen en estas clases):

- La hora civil del lugar (HcL) es: *(and-py-2024-c2-n05)*
- Dos lugares con la misma longitud, pero en distintos países tendrán siempre la misma hora: *(and-py-2021-c1-n04)*
- ¿La Hora Reloj Bitácora (HRB) y la Hora legal coinciden?: *(and-py-2022-c1-n01)*

**Relacionados:** 3.1, 4.6.

#### 3.5 · Publicaciones náuticas y avisos

🔎 Profundiza · ✅ [guion](py/3-5-publicaciones-y-avisos.md) · clase py-3-7

Qué publica el Instituto Hidrográfico de la Marina, qué es un derrotero, para qué sirven los Avisos a los Navegantes, cómo se lleva un aviso a la carta y en qué se diferencian de los radioavisos. Cae una pregunta casi fija por examen y tiene trampas de «solo» y de objetivo.

**Gancho:** Andrés prepara su primera recalada en un puerto que no conoce y se pregunta dónde mirar cómo es la costa y si su carta, comprada hace años, sigue al día. Además ha oído que hay una luz apagada en la bocana y no sabe si apuntarlo ni cómo.

**Para llevarse:**

- El Instituto Hidrográfico de la Marina, en Cádiz, edita las cartas náuticas, los derroteros, el Libro de Faros y Señales de Niebla, el Anuario de Mareas y los Avisos a los Navegantes.
- El derrotero describe con detalle la costa y sus peligros: puertos, fondeaderos, bajos, corrientes y enfilaciones útiles.
- Los Avisos a los Navegantes los publica el Instituto Hidrográfico cada semana, se descargan gratis y su objetivo principal es mantener actualizadas las cartas y las publicaciones, derroteros incluidos.
- Los avisos permanentes se pasan a la carta con tinta indeleble; los temporales y los preliminares, a lápiz; los generales no corrigen nada.
- Cada corrección se registra con su número y año en el margen inferior de la carta.
- Lo urgente va por radioaviso: NAVAREA (España coordina la III), NAVTEX para los costeros y VHF para los locales; por radiotelefonía se anuncian con SÉCURITÉ.

**Trampas del examen:**

- Falso: que los Avisos corrijan «solo las cartas», «solo los derroteros» o los AVURNAVES. Cierto: corrigen cartas y derroteros.
- Falso: que los derroteros no se corrijan o que se corrijan con el Almanaque Náutico o el Libro de Faros. Cierto: se corrigen con los Avisos a los Navegantes.
- Falso: que el objetivo principal sea avisar de peligros inminentes a nivel internacional. Cierto: en las plantillas recientes es mantener al día cartas y publicaciones (en 2021 se puntuó la de los peligros).
- Falso: que los avisos temporales y preliminares no se anoten. Cierto: se anotan a lápiz; los que no corrigen son los generales.
- Falso: que haya que pagar una suscripción para acceder a los Avisos. Cierto: son gratuitos en la web del Instituto Hidrográfico.
- Falso: que la publicación que describe la costa sea la carta o el Libro de Faros. Cierto: es el derrotero; el Libro de Faros da las luces y el Anuario, las mareas.

**Minijuego** (14 preguntas reales de examen en estas clases):

- ¿Qué publicación náutica describe, entre otros aspectos, las características detalladas de la costa y de sus peligros?: *(and-py-2026-c1-n04)*
- Con los avisos a los navegantes podemos corregir y actualizar: *(and-py-2020-c3-n08)*
- ¿Cuál es el propósito principal de la publicación Avisos a los Navegantes editada por el Instituto Hidrográfico de la Marina? *(and-py-2025-c1-n04)*

**Relacionados:** 3.8, 4.6.

#### 3.6 · El radar

🔎 Profundiza · ✅ [guion](py/3-6-el-radar.md) · clase py-3-8

Cómo funciona el radar, qué mandos se tocan con lluvia, con mar o para una imagen óptima, las presentaciones proa arriba y norte arriba, EBL y VRM, y cómo se pasa una marcación radar a demora. Caen una o dos preguntas por examen, casi siempre sobre los ajustes.

**Gancho:** Andrés navega con un chubasco encima y la pantalla del radar se le llena de manchas; sube la ganancia a tope para ver mejor y todavía es peor. El episodio explica qué tenía que haber tocado.

**Para llevarse:**

- El radar emite pulsos de ondas electromagnéticas que se reflejan en los objetos y vuelven: la distancia sale del tiempo de ida y vuelta y la demora, de la dirección de la antena.
- Con lluvia o granizo se ajustan la ganancia y el anti-clutter de lluvia; con mar, la ganancia y el anti-clutter de mar.
- Para una visualización óptima, sintonía y ganancia; si la opción completa está, sintonía, ganancia y perturbaciones de mar y lluvia. Si hay barrido sin ecos con los filtros apagados, la plantilla da la sintonía.
- La ganancia al máximo solo llena la pantalla de ruido; el anti-clutter de mar, si te pasas, borra barcos pequeños cercanos.
- Proa arriba: la línea de proa coincide con la crujía, se leen marcaciones y la imagen gira al cambiar de rumbo; norte arriba: se leen demoras.
- EBL, la línea electrónica de demora, da la demora o marcación; VRM, el anillo variable de distancia, da la distancia.
- Dv = Rv + M, estribor más y babor menos: para convertir una marcación radar en demora solo hace falta conocer el rumbo.

**Trampas del examen:**

- Falso: que con lluvia se ajuste la sintonía con el anti-clutter de lluvia. Cierto: la ganancia acompaña siempre al filtro: ganancia y anti-lluvia.
- Falso: que subir la ganancia al máximo aumente el horizonte radar o discrimine mejor los ecos débiles. Cierto: no aporta nada bueno, solo ruido que satura la pantalla.
- Falso: que el anti-clutter de mar reduzca todos los ecos o borre la costa. Cierto: el riesgo es que desaparezcan barcos pequeños cercanos.
- Falso: que convertir una marcación en demora exija ir con arrancada, conocer la distancia o tener presentación norte arriba. Cierto: solo hace falta el rumbo.
- Falso: que la marcación radar se cuente desde un «meridiano radar». Cierto: se cuenta desde la línea de proa, la línea de fe.
- Falso: que la falta de visibilidad o los AIS de las boyas estropeen la imagen. Cierto: la estropean las perturbaciones de mar y lluvia; el radar ve igual con niebla o de noche.

**Minijuego** (22 preguntas reales de examen en estas clases):

- En condiciones de fuertes precipitaciones de lluvia o granizo, ¿qué control del equipo RADAR debemos ajustar para filtrar las interferencias meteorológicas y visualizar mejor los ecos reales?: *(and-py-2026-c1-n06)*
- Al utilizar el control de perturbación de mar (anti-clutter sea): *(and-py-2023-c2-n05)*
- De las siguientes afirmaciones indique cuál es la correcta: *(and-py-2025-c1-n05)*

**Relacionados:** 3.7, 3.8, 1.6, 4.3.

#### 3.7 · El GPS y las siglas de la pantalla

🔎 Profundiza · ✅ [guion](py/3-7-el-gps.md) · clase py-3-9

Qué es un GNSS, qué te da y qué no, las siglas de la pantalla (WPT, COG, SOG, HDG, XTE, ETA, MOB…) y qué es el datum. Es de lo que más cae en teoría de navegación, a veces dos preguntas por examen, y las opciones inventan siglas parecidas.

**Gancho:** Con la ruta cargada en el plotter, Andrés ve en la pantalla «XTE 0,05 R», «SOG 5,2» cuando la corredera marca 6, y una ETA que no entiende. Además quiere pasar su posición a una carta de papel antigua y le han dicho que puede caer en otro sitio.

**Para llevarse:**

- GNSS es el nombre genérico de GPS, Galileo, GLONASS y BeiDou; con distancias a al menos cuatro satélites da la posición y la hora.
- El GNSS te da tus propios datos: posición, rumbo y velocidad sobre el fondo y, con una ruta, demora y distancia al siguiente punto y hora estimada de llegada; no da datos de otros barcos, ni mareas, ni profundidad.
- COG es el rumbo sobre el fondo, es decir, el rumbo efectivo; SOG es la velocidad sobre el fondo, la velocidad efectiva; HDG es el rumbo de proa.
- XTE es el error transversal: la distancia del barco a la línea recta que une el WPT de salida y el de llegada, con la banda hacia la que te has ido.
- WPT es un punto de ruta; ETA, la hora estimada de llegada; ETD, la de salida; MOB guarda la posición de una persona caída al agua. TTG = DTG entre SOG.
- El datum es el sistema de referencia geodésico de las coordenadas; el GNSS trabaja en WGS-84 y la posición solo se pasa directamente a la carta de papel si el datum es el mismo.
- Si la corredera y la SOG no coinciden, la diferencia la produce la corriente.

**Trampas del examen:**

- Falso: siglas inventadas como MOG, MOF, MOD o MOP, o ETS, ETLL y ETX. Cierto: hombre al agua es MOB y la hora estimada de llegada es ETA.
- Falso: confundir ETA con ETD. Cierto: ETA es la llegada y ETD la salida (en una plantilla se dio por buena una opción con ETD mal puesta porque las demás eran falsas).
- Falso: que el XTE sea la distancia que falta al WPT o un error de la señal. Cierto: es la distancia a la línea entre los WPT de salida y llegada; la que falta es el DTG.
- Falso: que el datum sea el cero hidrográfico, «la referencia al GPS» o sirva para la hora o el XTE. Cierto: es el sistema de referencia horizontal de las coordenadas geográficas.
- Falso: que con otro datum el GNSS pierda la señal o la SOG sea incorrecta. Cierto: lo único que falla es dónde cae la posición en la carta.
- Falso: que el COG sea el rumbo verdadero o el de aguja. Cierto: COG y SOG incluyen viento y corriente, son los efectivos.

**Minijuego** (26 preguntas reales de examen en estas clases):

- En un equipo GNSS la posición de una persona que ha caído se representa por las siglas: *(and-py-2025-c3-n07)*
- En un equipo GNSS, las siglas XTE indican: *(and-py-2023-c3-n08)*
- ¿Qué consecuencia tiene trasladar una posición obtenida de un GNSS (WGS84) a una carta de papel antigua basada en un Datum diferente sin aplicar correcciones?: *(and-py-2026-c1-n08)*

**Relacionados:** 3.3, 3.6, 3.8.

#### 3.8 · Cartas electrónicas y AIS

🔎 Profundiza · ✅ [guion](py/3-8-cartas-electronicas-y-ais.md) · clase py-3-10

Los dos tipos de carta electrónica, raster y vectorial, y la diferencia entre las cartas y los sistemas que las muestran; después, qué es el AIS, en qué banda trabaja, qué datos transmite y por qué no sustituye al radar. Entre las dos cosas suelen caer dos preguntas por examen.

**Gancho:** Andrés navega con niebla y ve en el plotter el triángulo de un mercante que va a cruzarle, pero el velero que le adelantó a la salida del puerto no aparece por ningún lado. El episodio explica qué ve y qué no ve en esa pantalla.

**Para llevarse:**

- Solo hay dos tipos de carta electrónica: raster (RNC), una imagen escaneada de la carta de papel, y vectorial (ENC), una base de datos construida objeto a objeto.
- La ENC no se deforma con el zoom, permite capas y genera alarmas, como la del veril de seguridad; la raster es solo un dibujo y al ampliar se pixela. Las dos se actualizan.
- ECDIS, ECS y plotter son sistemas que muestran las cartas, no tipos de carta; en España las ENC oficiales las produce el Instituto Hidrográfico de la Marina.
- El AIS, sistema de identificación automática, emite y recibe de forma continua la identidad y los datos de navegación entre barcos, con estaciones costeras y con ayudas a la navegación.
- Trabaja en la banda de VHF marina (canales 87B y 88B), con un alcance de unas 20 o 30 millas, y toma la posición del GNSS.
- Transmite MMSI, nombre, posición, COG, SOG, rumbo de proa, destino y ETA; las estaciones y ayudas pueden enviar también datos meteorológicos e hidrográficos.
- Ayuda a prevenir abordajes incluso con visibilidad reducida, pero solo muestra a quien lo lleva encendido: no sustituye al radar ni a la vigilancia visual. El patrón puede apagarlo si compromete la seguridad o protección del buque.

**Trampas del examen:**

- Falso: ENC raster y RNC vectorial. Cierto: ENC es la vectorial y RNC la raster; el examen los cruza.
- Falso: «los tipos de carta son raster y ECDIS». Cierto: ECDIS, ECS, plotter o SENC son sistemas, no tipos de carta.
- Falso: que la RNC sea más fiable porque no necesita actualización o que la ENC no pueda actualizarse. Cierto: las dos se actualizan; si todas las opciones dicen cosas así, la buena es «ninguna».
- Falso: «el AIS sustituye al radar» o «no ayuda a prevenir abordajes». Cierto: ayuda a prevenirlos, pero solo ves a quien lo lleva encendido, así que complementa al radar y a la vista.
- Falso: que el AIS intercambie datos solo entre barcos o use UHF, radar, telefonía móvil o satélites GPS. Cierto: barcos, estaciones costeras y ayudas a la navegación, por VHF.
- Falso: que el patrón nunca pueda apagar el AIS. Cierto: puede apagarlo si cree que tenerlo encendido compromete la seguridad o protección del buque.

**Minijuego** (35 preguntas reales de examen en estas clases):

- Los tipos de Cartas Electrónicas son: *(and-py-2022-c3-n06)*
- De las siguientes afirmaciones, marque la opción CORRECTA con relación al Sistema de Identificación Automática de buques (AIS): *(and-py-2025-c3-n10)*
- En relación con el AIS ¿qué respuesta es correcta?: *(and-py-2023-c1-n09)*

**Relacionados:** 3.7, 3.6, 3.5.

### Tema 4 · Carta de navegación (eliminatorio)

#### 4.0 · El examen de carta, paso a paso

🧭 Panorama · ⏳ pendiente · clases py-4-1, py-4-2, py-4-3, py-4-4, py-4-5, py-4-6, py-4-7, py-4-8, py-4-9, py-4-10

Recorrido por las diez preguntas de carta del Patrón de Yate: corrección total, viento, pasar a distancia de un faro, líneas de posición, estima con viento y corriente, través, corriente conocida y desconocida, mareas y estima analítica. Es un bloque eliminatorio en el que cada paso arrastra el error del anterior, así que importa tanto el orden de las operaciones como las fórmulas.

**Gancho:** Andrés prepara en la mesa de cartas una travesía por el Estrecho con su velero: tiene que sacar la corrección total, meter el abatimiento del levante, compensar la corriente y calcular a qué hora llega. Se equivoca en el primer paso y todo lo demás le sale mal, que es justo lo que pasa en el examen de carta.

**En el examen:** Carta de navegación son 10 preguntas, de la 11 a la 20 del módulo de navegación: 7 ejercicios sobre la carta del Estrecho, 2 de mareas con Anuario y tabla y 1 de loxodrómica. Es eliminatorio: con más de 3 errores en carta se suspende aunque se llegue a los 28 aciertos del total.

**Recorre:** Corrección total: declinación, enfilaciones, oposiciones y la Polar · Viento y abatimiento: rumbo de superficie y rumbo a dar · Rumbo para pasar a una distancia de un faro, con viento · Situación por líneas de posición simultáneas y no simultáneas · Estima con viento y corriente: situación y rumbo efectivo · Faro por el través y otros cortes con la derrota · Corriente conocida: rumbo a dar, velocidad y hora de llegada · Corriente desconocida: rumbo e intensidad · Mareas: sonda en un momento y hora para tener una sonda · Estima analítica: derrota loxodrómica.

**Para llevarse:**

- Corrección total: Ct = dm + Δ (E o NE positivo, W o NW negativo); en una enfilación u oposición, Ct = Dv − Da; con la Polar, Ct = 000° − Za. La declinación de la rosa se actualiza sumando o restando la variación anual multiplicada por los años, y la Ct es el primer paso de casi todos los problemas.
- Viento: Rs = Rv + Ab, con viento por babor Ab positivo y por estribor negativo. Del timón a la carta se aplica primero la Ct y luego el Ab; de la carta al timón, primero el Ab (Rv = Rs − Ab) y luego la Ct (Ra = Rv − Ct).
- Pasar a una distancia de un faro: circunferencia de ese radio con centro en el faro y tangente desde tu situación, con sen α = d / D. Con viento, la tangente es el rumbo de superficie, no el verdadero.
- Líneas de posición: todo a verdadero antes de trazar (Dv = Da + Ct, Dv = Rv + M) y las demoras se trazan desde el faro. Si no son simultáneas, la primera línea se traslada el rumbo y la distancia navegados y se corta con la segunda.
- Estima: Ra → Rv → Rs, Vb × t millas al Rs y después Ihc × t millas al rumbo de la corriente. Primero el viento y luego la corriente: la corriente va, el viento viene.
- Faro por el través: Dv = Rv + 90° por estribor y Rv − 90° por babor, siempre con el rumbo verdadero. La derrota que se corta con esa línea es el Rs con viento o el rumbo efectivo con corriente.
- Corriente conocida: triángulo de una hora (corriente desde la salida y arco de radio Vb que corta el rumbo efectivo). La hora de llegada se calcula con la velocidad efectiva, nunca con la del barco.
- Corriente desconocida: el rumbo de la corriente va de la situación estimada a la observada, y la intensidad horaria es esa distancia dividida por las horas transcurridas desde la última situación fiable.
- Mareas: el Anuario da las horas en UT (UT = hora oficial − adelanto). C = A · sen²(90° · I / D), con el intervalo contado desde la bajamar, y la sonda es la de la carta más la altura de la bajamar más C.
- Estima analítica, casi siempre la pregunta 20: Δl = D · cos R, A = D · sen R y ΔL = A / cos lm. Para el rumbo directo, tan R = A / Δl, con el cuadrante decidido por los signos y atención al paso por el meridiano 180°.

**Minijuego** (180 preguntas reales de examen en estas clases):

- El 12 de noviembre de 2020 navegamos a 7 nudos al Rumbo de aguja 197º, con viento del SE que nos produce un abatimiento de 15º. La declinación magnética de la carta es 2,5º E 2015 (6' W) y el Desvío de la aguja = +11º (más). Calcular el rumbo de superficie que hará el barco. *(and-py-2020-c3-n16)*
- Al ser HRB = 09:00 nos encontramos en situación 36º 10,0′ N, 005º 15,0′ W, navegando al Rumbo verdadero 220º y velocidad 7 nudos. Al ser HRB = 10:00 nos encontramos al Este verdadero del faro de Punta Carnero y al Norte verdadero del faro de Punta Almina. Calcular el rumbo de la corriente e Intensidad horaria de la misma. *(and-py-2022-c1-n17)*
- En situación de salida l=30º25.3´N y L=010º05´E y sabiendo la situación de llegada l=39º15´N y L=001º00´W. Calcule el rumbo directo de manera analítica (loxodrómica) *(and-py-2021-c2-n18)*

#### 4.1 · La corrección total en la carta: enfilaciones, oposiciones y la Polar

🔎 Profundiza · ⏳ pendiente · clase py-4-1

La corrección total con las tres vías del programa: desvío y declinación actualizada al año, una enfilación u oposición de dos faros de la carta del Estrecho y el azimut de aguja de la Polar. Suele ser la primera pregunta de carta y el primer paso de todas las demás, así que un error aquí se arrastra a todo el problema.

**Gancho:** Saliendo de Algeciras, Andrés cruza la oposición de Punta Carnero y Punta Almina y marca el faro de Almina con la aguja en 152°, mientras la rosa de su carta dice «3°20′ W 2016 (5′ E)». Quiere saber cuánto le engaña su compás y por dónde empieza la cuenta. En la carta la oposición da unos 146,5°, así que la Ct es −5,5°, la declinación de 2026 es 2°30′ W y el desvío sale de −3°.

**Para llevarse:**

- Ct = dm + Δ, con E o NE positivo y W o NW negativo. Del timón a la carta, Rv = Ra + Ct y Dv = Da + Ct; de la carta al timón, Ra = Rv − Ct.
- Para actualizar la declinación se multiplica la variación anual por los años transcurridos: si la variación va en el mismo sentido que la declinación, la aumenta, y si va en sentido contrario, la disminuye. Se redondea al grado, o al medio grado si lo pide el enunciado. Ejemplo: «3°20′ W 2016 (5′ E)» en 2026 da 2°30′ W.
- Si el enunciado no da la declinación ni la rosa, se usa la de la carta del Estrecho, 2°50′ W 2005 (7′ E). Si la da ya calculada, como «dm = 4° NW», se usa tal cual.
- En una enfilación u oposición, Ct = Dv − Da: la Dv sale de la recta que une los dos faros en la carta y la Da de la aguja.
- Oposición (un faro a cada lado): la Dv del faro marcado es la de la recta que va del otro faro hacia el marcado. Enfilación (un faro detrás del otro): la Dv es la que va del faro más cercano al más lejano.
- La Polar está a menos de 1° del polo norte celeste y su azimut verdadero se toma como 000°, así que Ct = 000° − Za. Con Za 356° sale +4° y con Za 006°, −6°.
- Desvío: Δ = Ct − dm. Comprobación rápida: la Ct del examen rara vez pasa de 15°.

**Trampas del examen:**

- Falso que el rumbo y la velocidad del enunciado intervengan en la Ct: la de una enfilación u oposición sale solo de la Dv de la carta y la Da, y si solo piden la Ct, también sobra la declinación.
- Falso que dé igual el sentido en que se mide la recta de la oposición: si se mide hacia el faro que no has marcado, la Ct sale cerca de 180°. Se mide del otro faro hacia el marcado.
- Falso que la variación anual siempre se sume: si va en sentido contrario a la declinación (variación E sobre declinación W), la disminuye.
- Falso que la Polar no sirva por no estar exactamente en el polo: el error es menor de 1° (como mucho, unos 0,8° en el Estrecho) y el examen toma Zv = 000°.
- Restar al revés (Da − Dv) cambia el signo de la Ct, y las opciones del examen traen siempre el mismo valor con los dos signos. Lo cierto es Ct = Dv − Da.
- Los nombres de la carta confunden: el «faro de Punta Camarinal» de los enunciados es el faro de Punta de Gracia (Camarinal). La «farola del espigón», la «luz del espigón» y la «luz de la bocana» de Tánger son la misma luz, y en Ceuta la verde es la del dique de poniente y la roja, la del dique de levante.

**Minijuego** (19 preguntas reales de examen en estas clases):

- En una carta de navegación leemos los siguientes datos: 6º10´W 2005 (5´E). Calcule la declinación magnética para el año 2021. *(and-py-2021-c2-n13)*
- Navegamos al rumbo de aguja 060º. Al cruzar la oposición de los faros de Punta Malabata y Punta Cires, marcamos al faro de Punta Cires en demora de aguja 078º. Dec. magnética = 3º W. Calcular la corrección total. *(and-py-2024-c1-n11)*
- Navegamos al rumbo de aguja 155º. Al cruzar la enfilación de los faros de Cabo Roche y Cabo Trafalgar, marcamos el faro de Cabo Roche en demora de aguja 136º. Calcular la corrección total. *(and-py-2025-c1-n11)*

**Relacionados:** 3.2, 4.0, 4.2, 4.3.

#### 4.2 · El viento en la carta y pasar a distancia de un faro

🔎 Profundiza · ⏳ pendiente · clases py-4-2, py-4-3

Cómo entra el viento en los problemas de carta: el abatimiento, la banda por la que entra el viento, el rumbo de superficie que hace el barco y el rumbo de aguja que hay que dar para llegar a un puerto o pasar a una distancia de un faro. Sale en casi todos los exámenes, y las opciones trampa son las de quien aplica el abatimiento con el signo cambiado o en el orden equivocado.

**Gancho:** Andrés sale de 36°02′ N 005°15′ W hacia la luz verde de Ceuta y apunta la proa justo a la bocana, pero el poniente le abate 8° y acaba cayendo al este del puerto. ¿Hacia dónde tenía que orzar, y qué va antes, el abatimiento o la corrección total? El rumbo de superficie es unos 200°, así que el verdadero queda en 208° y el de aguja en 214°.

**Para llevarse:**

- Rs = Rv + Ab. Con viento por babor caes a estribor y el Ab es positivo; con viento por estribor, negativo. En la carta, la línea que trazas o sigues es el Rs.
- Para saber por qué banda entra el viento, calcula dirección del viento − Rv y llévalo a 0°–360°: de 0° a 180° entra por estribor y de 180° a 360°, por babor. Si buscas el rumbo a dar, decide la banda con el Rs.
- Del timón a la carta: Rv = Ra + Ct y después Rs = Rv + Ab. De la carta al timón: Rv = Rs − Ab y después Ra = Rv − Ct. Al dar rumbo orzas, metiendo la proa hacia el viento tantos grados como abates.
- El viento se nombra por de dónde viene: el levante viene del E y el poniente del W. Con solo viento, el tiempo es distancia entre velocidad del barco (8,7 millas a 6 nudos son 1 h 27 min).
- Pasar a d millas de un faro: circunferencia de radio d con centro en el faro y tangente desde tu situación, con sen α = d / D. Faro por estribor, Rs = Dv − α; por babor, Rs = Dv + α. Si el enunciado no dice la banda, se toma la tangente que pasa por fuera, por el lado del mar.
- Con viento la tangente es el Rs, y el orden es fijo: tangente → Rv = Rs − Ab → Ra = Rv − Ct.
- Comprobación: el Rs queda siempre a sotavento del Rv.

**Trampas del examen:**

- Falso que la banda se deduzca del nombre del viento: depende del rumbo, y se calcula con viento − Rv.
- Falso que el abatimiento se sume siempre: de la carta al timón se resta, Rv = Rs − Ab.
- Falso que dé igual el orden: del timón a la carta va primero la Ct y luego el Ab, y de la carta al timón, primero el Ab y luego la Ct. Olvidar la Ct al final es otro error típico.
- Falso que la tangente sea el rumbo verdadero: es el Rs. Si se le aplica la Ct directamente, sale una opción trampa a más o menos el abatimiento del resultado.
- Muchos enunciados obligan antes a situarse o a actualizar la declinación con el año de la rosa. Si se salta ese paso, todo lo que viene después sale mal.
- Con corriente, la tangente ya no es el Rs sino el rumbo efectivo.

**Minijuego** (28 preguntas reales de examen en estas clases):

- El 17 de Marzo de 2022 navegamos a 6 nudos al Rumbo de aguja 315º, con viento del NE que nos produce un abatimiento de 20º. La declinación magnética de la carta es 3,5º E 2017 (6' W) y el Desvío de la aguja = –8º (menos). Calcular el rumbo de superficie que hará el barco *(and-py-2022-c1-n16)*
- Al ser HRB = 06:00 nos encontramos en situación 35º 50,0′ N, 005º 50,0′ W, navegando al rumbo de aguja = 350º. Sopla viento del oeste (W) que nos produce un abatimiento de 20º. Calcular el rumbo que realiza el barco afectado por el viento, sabiendo que la declinación magnética = 5º NE y el desvío de la aguja = +10º (más). *(and-py-2025-c1-n16)*
- Nos encontramos en situación 36º 00,0′ N, 006º 00,0′ W, navegando al Ra = 138º. Sopla viento del este (E) que nos produce un abatimiento de 12º. Calcular el rumbo que realiza el barco afectado por el viento, sabiendo que la declinación magnética = 3º NW y el desvío de la aguja = –9º (menos). *(and-py-2024-c3-n16)*

**Relacionados:** 3.3, 4.1, 4.4, 4.5.

#### 4.3 · Situarse: líneas de posición y faro por el través

🔎 Profundiza · ⏳ pendiente · clases py-4-4, py-4-6

Cómo situarse en la carta con líneas de posición, simultáneas o tomadas a horas distintas, y cómo calcular la situación al tener un faro por el través. Son preguntas de casi todas las convocatorias, y en ellas el orden de los pasos decide: primero todo a verdadero, después trasladar la línea que toca y por último cortar.

**Gancho:** Andrés navega al rumbo de aguja 080° a 10 nudos y marca Punta Paloma a 45° por babor; tres cuartos de hora después marca Punta Cires a 43° por estribor. Traza las dos demoras y no se cortan donde está, porque se ha olvidado de que entre una y otra navegó 7,5 millas. El episodio explica qué línea se traslada, hacia dónde y con qué rumbo.

**Para llevarse:**

- Cada observación es una línea. Una demora es una recta que pasa por el faro y se traza desde él con Dv + 180°. Una enfilación u oposición es la recta que une los dos faros, y una distancia, una circunferencia con centro en el faro. «Al N o S verdadero de un faro» es su meridiano y «al E o W verdadero», su paralelo.
- Antes de trazar, todo a verdadero: Dv = Da + Ct y Dv = Rv + M, con la marcación de estribor positiva y la de babor negativa. Es la regla de «Don RaMón».
- Si las líneas no son simultáneas, se traslada la primera, paralela a sí misma, el rumbo y la distancia navegados (d = V × t), y se corta con la segunda. Una circunferencia se traslada moviendo su centro.
- El rumbo del traslado es el que de verdad has seguido: el Rv sin viento, el Rs con viento y el rumbo efectivo con corriente.
- Para la situación de la primera observación, sitúate en la segunda y retrocede el rumbo y la distancia navegados.
- Un faro por el través está a 90° de la proa: por estribor, Dv = Rv + 90°, y por babor, Dv = Rv − 90°. Siempre se calcula con el Rv, aunque abatas o te lleve la corriente.
- El método del través: desde la salida se traza la derrota real (Rs o rumbo efectivo) y se corta con la línea del través trazada desde el faro. La hora es la distancia sobre la derrota entre Vb, o entre la Vef si hay corriente. Para avistar un faro, se corta la derrota con la circunferencia de su alcance.

**Trampas del examen:**

- Falso que la demora se trace desde el barco o con la recíproca: se traza desde el faro con Dv + 180°.
- Falso que las marcaciones se conviertan con el Ra: primero va la Ct, y después Dv = Rv + M.
- Falso que se traslade la segunda línea, o que se traslade hacia atrás: se traslada la primera, en el sentido navegado.
- Con viento, falso que se traslade por el Rv: se traslada por el Rs.
- Falso que el través se calcule con el Rs. En el ejemplo de la clase (Rv 170°, Rs 160°, Cabo Espartel por babor) daría Dv 070° en vez de 080°, y una situación tan cercana a la buena que el examen suele poner las dos.
- Una distancia y otra línea suelen cortarse en dos puntos: la pista del enunciado («ya en aguas del Estrecho», «al norte de…») dice cuál vale. Si la plantilla difiere en uno o dos minutos, se elige la opción más próxima.

**Minijuego** (29 preguntas reales de examen en estas clases):

- A HRB = 15h 00m nos encontramos al OESTE (W) verdadero del faro de Cabo Espartel. Navegamos al Rumbo de aguja = 070º con velocidad del buque = 8 nudos. A HRB = 16h 15m obtenemos demora verdadera al faro de Punta Camarinal = NORTE. Calcular situación a HRB = 16h 15m. Declinación magnética = 2º NW y desvío de la aguja = –8º (menos). *(and-py-2025-c2-n15)*
- Navegamos al rumbo verdadero 340º a 10 nudos de velocidad. Sopla viento de poniente (del oeste), que nos produce un abatimiento de 20º. Al tener el faro de Cabo Espartel por el través de estribor, tomamos distancia radar a dicho faro = 6,8 millas. Calcular la situación. *(and-py-2023-c3-n14)*
- Navegamos a 8 nudos al rumbo verdadero 070º. A HRB = 22:00, tomamos marcación al faro Punta Malabata = 140º Estribor. A HRB = 23:00 tomamos marcación al faro de Punta Cires = 040º Estribor. Calcular situación a HRB 23:00. *(and-py-2022-c1-n13)*

**Relacionados:** 4.1, 4.2, 4.4, 4.5.

#### 4.4 · Estima con viento y corriente

🔎 Profundiza · ⏳ pendiente · clase py-4-5

La estima gráfica con viento y corriente: dónde estarás a una hora, qué rumbo y velocidad efectivos haces sobre el fondo y, a partir de ahí, la demora o la distancia a un faro. Sale casi en cada convocatoria, y el examen pone a prueba sobre todo el orden (primero el viento, luego la corriente) y el sentido en que se traza cada uno.

**Gancho:** Andrés navega hora y media al rumbo de aguja 140° a 7 nudos, con nordeste y una corriente del Estrecho que tira hacia el este. Cuando busca el faro de Cabo Espartel, no lo tiene donde esperaba. ¿Qué le faltó meter en la cuenta, y en qué orden? Lleva el abatimiento al rumbo, después suma la corriente como vector y al final mide desde la estima.

**Para llevarse:**

- La estima, paso a paso: Rv = Ra + Ct, después Rs = Rv + Ab y, desde la salida, Vb × t millas al Rs. Desde ese punto, Ihc × t millas al rumbo de la corriente, y el extremo es la situación de estima.
- La Ihc son las millas que te arrastra la corriente cada hora: «Ihc = 3′» y «3 nudos» es lo mismo. El tiempo va en horas con decimales: 1 h 12 min son 1,2 h y 1 h 30 min, 1,5 h.
- El rumbo efectivo es la recta de la salida a la estima, el que haces sobre el fondo, y la velocidad efectiva es su longitud dividida por el tiempo.
- Si solo piden el rumbo efectivo, basta el triángulo de una hora desde cualquier punto: Vb millas al Rs y a continuación Ihc millas al rumbo de la corriente.
- Primero el viento y luego la corriente: el abatimiento es un ángulo que se aplica al rumbo, y la corriente es un vector, con rumbo y distancia.
- La corriente va y el viento viene: una corriente SW te lleva hacia el 225°, mientras que un viento SW viene del 225°.
- Con la estima hecha se contesta lo que pidan. En el modelo de la clase, la estima de las 10:30 queda en 35°55,7′ N 005°55,2′ W, con rumbo efectivo de unos 139,5° y 8,1 nudos, y Cabo Espartel en Dv 181° a 8,2 millas.

**Trampas del examen:**

- «Rumbo que hace el barco como consecuencia de la corriente» es el rumbo efectivo, aunque algún enunciado lo llame incluso «Rc». «Rumbo que hace por el viento» es el Rs.
- Falso que la corriente se trace hacia de donde viene: se traza hacia donde va su rumbo.
- Falso que los grados de la corriente se sumen al rumbo o que la Ihc se convierta en un ángulo: la corriente se suma como vector, con rumbo y distancia.
- Falso que el orden dé igual: primero se aplica el viento al rumbo y después se añade la corriente.
- Si la corriente empieza a mitad de la navegación, solo cuenta el tiempo que estás dentro de ella.
- Falso que 2 h 15 min sean 2,15 horas: son 2,25 horas, así que con Ihc 2 millas la corriente te desplaza 4,5 millas y no 4,3.

**Minijuego** (17 preguntas reales de examen en estas clases):

- El día 25 de marzo de 2023, a HRB = 20:00, estamos en situación 36º 00,0’ N, 006º 10,0′ W. Navegamos a 8 nudos al rumbo verdadero 080º, teniendo en cuenta que existe una corriente de Rc = S e intensidad horaria = 3 millas. Calcular el rumbo que hará el barco como consecuencia de la corriente. *(and-py-2023-c1-n16)*
- Navegamos a 11 nudos al rumbo de aguja 270º, con viento del SW que nos produce un abatimiento de 15º y una corriente de Rc = 050º e Ih = 4′. Declinación magnética = 6º NE, desvío = +8º. Calcular el rumbo efectivo. *(and-py-2023-c2-n17)*
- Al ser HRB = 19:00 nos encontramos al noroeste (NW) verdadero del faro de Punta Alcázar y a una distancia de 5 millas. Navegamos al rumbo de aguja = 045º con velocidad del buque 8 nudos, con una corriente de Rc = Sur (S) e intensidad horaria = 3 millas. Declinación magnética = 4º NW, desvío de la aguja = +8º (más). Calcular el rumbo efectivo que hace el barco como consecuencia de la corriente. *(and-py-2026-c1-n15)*

**Relacionados:** 3.3, 4.2, 4.3, 4.5.

#### 4.5 · Corriente conocida y corriente desconocida

🔎 Profundiza · ⏳ pendiente · clases py-4-7, py-4-8

Los dos problemas de corriente que faltan. Con la corriente conocida, qué rumbo dar para llegar a un punto y a qué hora se llega, o qué velocidad hace falta para llegar a una hora fijada. Con la corriente desconocida, cuál es su rumbo y su intensidad a partir de la diferencia entre la estima y la situación observada. Las opciones del examen están hechas con los errores típicos de sentido, de velocidad y de tiempo.

**Gancho:** Andrés da proa directamente a la farola de Tánger y, a mitad de camino, al situarse con dos faros, se ve varias millas al este de donde decía su estima. ¿Cuánta corriente había, y qué rumbo tendría que haber dado desde el principio para llegar sin desviarse? El episodio lo resuelve en dos partes: primero se mide la corriente comparando la estima con la situación observada, y después se construye el triángulo para dar el rumbo bueno.

**Para llevarse:**

- La línea de la salida al destino es el rumbo efectivo que necesitas. Si das la proa directamente al destino, la corriente te saca de esa línea, así que hay que aproar hacia el lado del que viene la corriente.
- Con la velocidad del barco, se trabaja a escala de una hora: desde la salida se traza la corriente (Ihc millas al Rc) y, desde su extremo, un arco de radio Vb que corta el rumbo efectivo. Del extremo de la corriente al corte sale el rumbo a dar, y de la salida al corte, la Vef. En el modelo de la clase, el rumbo efectivo es 151° con 17,7 millas, el Rv 169,5°, la Vef 7,85 nudos y la travesía dura 2 h 15 min.
- Si fijan la hora de llegada, la Vef necesaria es la distancia entre el tiempo, y vector barco = vector efectivo − vector corriente: del extremo de la corriente al extremo del efectivo salen el rumbo a dar y la Vb necesaria.
- La hora de llegada se calcula con la Vef. Después se aplica Rv = Rs − Ab si hay viento y, por último, Ra = Rv − Ct.
- Para pasar a X millas de un faro con corriente, la tangente es el rumbo efectivo, y después se construye el triángulo.
- Corriente desconocida: se hace la estima sin corriente (con el viento, si lo hay) hasta la hora de la observación y se sitúa el barco a esa misma hora. El rumbo de la corriente es la dirección que va de la estimada a la observada.
- La intensidad horaria es la distancia entre la estimada y la observada dividida por las horas desde la última situación fiable: con 30 minutos se multiplica por dos, y con 2 h 30 min se divide entre 2,5.

**Trampas del examen:**

- Falso que baste restar la Ihc a la velocidad «a ojo»: hay que construir el triángulo.
- Falso que el rumbo a dar se mida desde la salida hasta el corte del arco: esa línea es el rumbo efectivo, y el rumbo a dar sale del extremo de la corriente.
- Falso que la hora de llegada con corriente se calcule con la Vb: se calcula con la Vef.
- Aproar hacia el lado equivocado es otro error típico: el rumbo a dar queda del lado contrario al que empuja la corriente.
- En la corriente desconocida, las opciones traen el rumbo opuesto, a 180°: el vector va de la estimada a la observada, nunca al revés.
- Las opciones también traen la intensidad doble o mitad: se divide por las horas desde la última situación fiable, no por una hora. Y en la estima no se mete la corriente, porque es justo lo que se busca.

**Minijuego** (33 preguntas reales de examen en estas clases):

- Desde la situación 36º 12,0′ N, 005º 12,0′ W, damos rumbo a Ceuta (luz verde de la bocana del puerto), teniendo en cuenta que nos afecta una corriente de Rc = E e intensidad horaria = 4 millas. Navegamos a 10 nudos de velocidad. Calcular la velocidad efectiva del buque. *(and-py-2023-c2-n14)*
- A HRB = 13:00, desde la situación 35º 59,0′ N, 005º 45,0′ W, damos rumbo a Barbate (faro de Tierra), teniendo en cuenta que nos afecta una corriente de Rc = W e intensidad horaria 3 millas. Declinación magnética = 2º NE y Desvío de la aguja = – 8º (menos). Calcular el rumbo de aguja y la velocidad del buque para llegar a Barbate a HRB = 15:00. *(and-py-2023-c1-n13)*
- A HRB = 18h 10m nos encontramos en situación 36o 17,0´ N, 005º 15,0´ W. Navegamos a 5,6 nudos al rumbo verdadero 161º en zona de corriente desconocida. A HRB = 20h 10m nos encontramos al Norte verdadero del faro de Punta Almina y al Este verdadero del faro de Punta Europa. Calcular el Rumbo de la corriente y la Intensidad horaria de la misma. *(and-py-2025-c3-n16)*

**Relacionados:** 3.3, 4.2, 4.3, 4.4.

#### 4.6 · Mareas de cabo a rabo: el Anuario, la curva, la sonda y la hora

🔎 Profundiza · ⏳ pendiente · clases py-3-6, py-4-9

Las mareas completas: qué trae el Anuario de Mareas y cómo sube la marea, y después los dos problemas del examen, la sonda que habrá a una hora y la hora a la que habrá una sonda, con la corrección por presión. Son las preguntas 18 y 19 del examen y no dependen de la carta. Se pierden sobre todo por el paso entre hora oficial y UT y por elegir mal el tramo.

**Gancho:** Andrés quiere pasar con el velero sobre un bajo que la carta marca con 1,50 metros y necesita al menos 4 metros de sonda. El Anuario le da una bajamar a las 06:10 con 0,80 metros y una pleamar a las 12:25 con 3,10, pero su reloj va en hora oficial con dos horas de adelanto. ¿A partir de qué hora puede pasar? El episodio sigue el orden de la cuenta: pasar a UT, elegir el tramo, sacar duración, amplitud e intervalo, aplicar la fórmula y volver a la hora oficial. Puede pasar desde las 12:17.

**Para llevarse:**

- El Anuario de Mareas lo publica cada año el Instituto Hidrográfico de la Marina. Trae los puertos patrón, con las horas y alturas de pleamares y bajamares, los puertos secundarios, con sus diferencias respecto a un patrón, y tablas auxiliares. Las horas vienen en UT y las alturas se miden desde el cero hidrográfico, el mismo de las sondas de la carta.
- «El Anuario habla en UT»: UT = hora oficial − adelanto. Se entra en el Anuario en UT y al final se vuelve a la hora oficial, salvo que pidan la respuesta en UT.
- Se toman la bajamar y la pleamar consecutivas que encierran tu hora: la duración D es el tiempo entre ellas, la amplitud A es la altura de la pleamar menos la de la bajamar, y el intervalo I va de tu hora a la bajamar del tramo.
- C = A · sen²(90° · I / D) es lo que ha subido la marea sobre la bajamar. La altura de la marea es la de la bajamar más C, y la sonda es la de la carta más esa altura: «la carta es pesimista».
- Problema inverso: C = altura necesaria − altura de la bajamar e I = D · arcsen(√(C / A)) / 90°. La hora es la de la bajamar más I si la marea sube, y la de la bajamar menos I si baja.
- La marea sube despacio cerca de la bajamar y de la pleamar y deprisa a media marea. Según la regla de los duodécimos, en cada sexto de la duración sube 1, 2, 3, 3, 2 y 1 doceavos de la amplitud, y a mitad del tramo ha subido justo la mitad. Sirve para comprobar de cabeza.
- El Anuario supone unos 1013 hPa, y la corrección es de 1 cm por hPa aproximadamente: con presión alta hay menos agua y con presión baja, más. El viento de la mar hacia tierra da más agua, y el de tierra hacia la mar, menos.

**Trampas del examen:**

- Falso que se entre en el Anuario con la hora oficial: primero se pasa a UT y al final se vuelve a la hora oficial.
- Falso que el intervalo se cuente desde la pleamar: siempre se cuenta hasta la bajamar del tramo. Con la marea bajando, la hora es la de la bajamar menos I.
- Elegir mal el tramo es un fallo típico: «entre la primera pleamar y la primera bajamar» dice exactamente cuál es.
- Falso que C sea ya la altura de la marea: hay que sumarle la altura de la bajamar, y después la sonda de la carta.
- Falso que la presión alta dé más agua: da menos, unos 7 cm menos con 1020 hPa. Si el enunciado dice que no se tenga en cuenta, no se aplica.
- Con la calculadora en radianes, la cuenta sale mal: hay que ponerla en grados. Y si el resultado difiere de las opciones en 1 o 2 cm o en unos minutos, se elige la más próxima, porque las tablas del Anuario redondean.

*35 preguntas reales de examen en estas clases.*

**Nota para el guion:** Todas las preguntas reales de mareas traen la tabla del Anuario. Para el minijuego, Elena lee en voz alta los datos que hacen falta (las horas y alturas de la pleamar y la bajamar del día) y Andrés hace la cuenta. También valen los «check» de las clases: la mitad de la amplitud a mitad del tramo, pasar de hora oficial a tiempo universal o la regla de los duodécimos.

**Relacionados:** 3.4, 4.0.

#### 4.7 · Estima analítica: loxodrómica y derrota

🔎 Profundiza · ⏳ pendiente · clases py-3-4, py-4-10

La loxodrómica y la estima analítica: qué son la derrota de rumbo constante, el apartamiento y la latitud media, y cómo se calculan con la calculadora la situación de llegada tras varios rumbos con corriente y el rumbo directo y la distancia entre dos puntos. Es casi siempre la pregunta 20, y los enunciados cruzan a propósito el meridiano 180° y obligan a decidir el cuadrante del rumbo.

**Gancho:** Andrés calcula con la calculadora el rumbo directo de una travesía de casi quinientas millas, de 38°40′ N 009°20′ W a 33°35′ N 016°55′ W. La arcotangente le da 50,3° y no sabe si es hacia el sudoeste o hacia el noroeste. El episodio sigue el orden de la cuenta: diferencia de latitud, diferencia de longitud, latitud media, apartamiento, el ángulo y el cuadrante por los signos. Sale un rumbo de 230,3° y una distancia de 477,6 millas.

**Para llevarse:**

- La loxodrómica corta todos los meridianos con el mismo ángulo: es navegar a rumbo constante, y en la carta Mercator es una recta. La ortodrómica es el arco de círculo máximo, la distancia más corta, pero con un rumbo que cambia continuamente. En el examen se usa la loxodrómica.
- El apartamiento son las millas medidas sobre un paralelo entre los meridianos de salida y llegada, la «distancia navegada en un paralelo». La diferencia de longitud va en minutos de arco, y A = ΔL · cos lm, porque un minuto de longitud mide una milla en el ecuador y media milla a 60°.
- En cada tramo, Δl = D · cos R (positivo al N, negativo al S) y A = D · sen R (positivo al E, negativo al W). La corriente es un tramo más, con rumbo Rc y distancia Ihc × horas.
- Se suman todos los Δl y todos los A con su signo. Después, lm = latitud de salida + Δl / 2 y ΔL = A / cos lm. La ΔL nunca es menor que el apartamiento.
- Inversa: A = ΔL · cos lm, tan R = A / Δl y D = √(Δl² + A²). La arcotangente da un ángulo cuadrantal, y el cuadrante se decide por los signos: S x E es 180° − x, S x W es 180° + x y N x W es 360° − x.
- Si la longitud de llegada pasa de 180°, se resta de 360° y se cambia E por W: 181°10′ E se escribe 178°50′ W. Si la ΔL pasa de 180°, se resta de 360° y cambia el sentido: de 178°50′ E a 177°40′ W hay 210′ hacia el E.
- Se resuelve con calculadora y sin carta, con la calculadora en grados.

**Trampas del examen:**

- Falso que el apartamiento sea la distancia sobre el ecuador o la diferencia de longitud: son millas sobre el paralelo, y la ΔL va en minutos de arco.
- Falso que se divida por el coseno de la latitud de salida: se divide por el de la latitud media.
- Falso que, al cruzar el antimeridiano, baste restar las longitudes: de 178°50′ E a 177°40′ W no se resta 178 − 177, porque el camino corto pasa por el 180°.
- Falso que el ángulo de la arcotangente sea ya el rumbo: hay que colocarlo en su cuadrante según los signos de Δl y A.
- En el hemisferio sur, ir hacia el sur hace crecer la latitud.
- Si piden aproximar al medio grado, se redondea solo al final. Y con la calculadora en radianes, la cuenta sale mal.

**Minijuego** (20 preguntas reales de examen en estas clases):

- Que es el apartamiento *(and-py-2021-c1-n09)*
- ¿A qué rumbo directo (Rd) deberemos navegar si queremos ir desde un punto A de l = 35º 46,8´N y L = 006º 00,2´W, hasta llegar a otro punto B de l = 35º 20,0´N y L = 006º 35,0´W? *(and-py-2021-c1-n18)*
- Desde la situación 28º 10′ N, 179º 25′ W, damos rumbo a la situación 25º 55′ N, 178º 24′ E. Calcular Rumbo directo. *(and-py-2022-c1-n20)*

**Relacionados:** 3.1, 4.4, 4.0.

## Patrón de Embarcaciones de Recreo (PER)

55 episodios · 0 escritos.

#### 0 · Cómo es el examen del PER y cómo usar estos podcasts

👋 Bienvenida · ⏳ pendiente

Episodio de bienvenida a «PER en voz alta»: cómo es el examen teórico del Patrón de Embarcaciones de Recreo en Andalucía, qué temas entran, cuántas preguntas tiene cada uno y qué temas son eliminatorios. Y cómo sacarle partido a la serie para estudiar por tu cuenta.

**Gancho:** Andrés está en la bañera de su velero, en el puerto, con la hoja de la convocatoria en la mano: ha leído «cuarenta y cinco preguntas» y «máximo de errores por bloque» y no sabe si eso quiere decir que puede fallar trece o que con dos fallos en balizamiento ya está suspendido.

**Para llevarse:**

- El examen tiene 45 preguntas tipo test, de 4 opciones, y se hace en 90 minutos.
- Se aprueba con al menos 32 aciertos, es decir, con 13 fallos como máximo.
- Hay tres bloques con límite propio de fallos (eliminatorios): Reglamento de abordajes (RIPA), 10 preguntas y máximo 5 errores; Balizamiento, 5 preguntas y máximo 2 errores; Carta de navegación, 4 preguntas y máximo 2 errores.
- Son 11 temas: Nomenclatura náutica (4 preguntas), Amarre y fondeo (2), Seguridad (4), Legislación (2), Balizamiento (5), RIPA (10), Maniobra y navegación (2), Emergencias en la mar (3), Meteorología (4), Teoría de navegación (5) y Carta de navegación (4).
- Orden de estudio recomendado: primero el vocabulario (tema 1) y después lo que más pesa y más práctica pide: balizamiento, RIPA, teoría de navegación y carta; luego amarre y fondeo, seguridad, legislación, maniobra, emergencias y meteorología.
- Las preguntas de la serie son de exámenes reales de Andalucía de 2020 a 2026.

### Tema 1 · Nomenclatura náutica

#### 1.0 · Las partes del barco

🧭 Panorama · ⏳ pendiente · clases per-1-1, per-1-2, per-1-3, per-1-4, per-1-5, per-1-6, per-1-7

Panorama del tema de nomenclatura náutica: el casco y sus referencias, la cubierta, la estructura, el timón, la hélice, el equipo de fondeo y las dimensiones del barco. Son preguntas de vocabulario: si sabes qué es cada cosa y para qué sirve, son puntos seguros.

**Gancho:** Un vecino de pantalán le pide a Andrés que le «pase la defensa por la aleta de babor y mire si el imbornal está libre», y Andrés se queda quieto en cubierta sin saber hacia dónde ir.

**En el examen:** Nomenclatura náutica aporta 4 de las 45 preguntas del examen y no tiene límite propio de fallos, pero es el vocabulario que se usa en todos los demás temas, por eso se estudia el primero.

**Recorre:** El casco y las referencias del barco · En cubierta: aberturas, desagües y barandillas · La estructura del casco · El timón · La hélice · El equipo de fondeo · Flotación, dimensiones y asiento.

**Para llevarse:**

- El casco es el cuerpo estanco que flota; la crujía lo divide en babor y estribor, que no cambian nunca, mientras que barlovento (por donde entra el viento) y sotavento (por donde sale) cambian con el viento y el rumbo.
- En cubierta: la escotilla es para pasar, la lumbrera da luz y ventilación, el manguerote solo ventila y los imbornales desaguan la cubierta a la altura del trancanil.
- Estructura: la quilla va de proa a popa por abajo, la roda la continúa a proa y el codaste a popa; los baos son transversales y sostienen la cubierta, y los grifos de fondo son válvulas bajo la flotación.
- Timón: pala o azafrán, mecha (el eje), limera (el orificio del casco) y guardines; con caña la proa cae al lado contrario y con rueda, al mismo lado.
- Hélice: eje, bocina, núcleo, palas y capacete; la dextrógira gira en sentido horario vista desde popa y avante, y en las gemelas de giro al exterior la de estribor es dextrógira y la de babor levógira.
- Fondeo: el molinete tiene barbotén, cabirón, embrague y freno; la línea de fondeo mide al menos 5 esloras con al menos 1 eslora de cadena; a la pendura, a pique, zarpar, clara y levar son las voces de la maniobra.
- Dimensiones: obra viva sumergida y obra muerta emergida; calado de la flotación a la quilla, francobordo de la flotación a la cubierta estanca, y asiento igual a calado de popa menos calado de proa.

**Minijuego** (72 preguntas reales de examen en estas clases):

- El lado o costado contrario a aquel por el que viene o entra el viento se denomina: *(and-2023-c1-t02)*
- El eje alrededor del cual gira la pala del timón se denomina: *(and-2026-c1-t03)*
- ¿Qué entendemos por asiento de una embarcación? *(and-2021-c1-t01)*

#### 1.1 · El casco, la cubierta y la estructura

🔎 Profundiza · ⏳ pendiente · clases per-1-1, per-1-2, per-1-3

El casco y sus referencias (proa, popa, crujía, bandas, amuras, través, aletas, barlovento y sotavento), las aberturas, desagües y barandillas de la cubierta, y las piezas de la estructura del casco. Mucho vocabulario que cae en casi todas las convocatorias y que se confunde por parejas.

**Gancho:** Con lluvia fuerte en el puerto, Andrés ve que la cubierta de su velero desagua por unos agujeritos del costado, y además quiere airear la cámara sin que entre el agua: ¿abre la lumbrera, el portillo o se fía del manguerote?

**Para llevarse:**

- El casco es el «vaso» estanco que flota; no incluye arboladura, jarcia, superestructuras, motor ni pertrechos.
- Mirando a proa, estribor es la banda de la derecha y babor la de la izquierda; la crujía va de proa a popa por el centro y separa las dos bandas.
- Cada costado tiene amura (delante), través (en medio) y aleta (detrás); barlovento es por donde entra el viento y sotavento por donde sale.
- La lumbrera, en cubierta, da luz y ventilación; el portillo practicable, en el costado, también; el manguerote solo ventila y la escotilla es para pasar.
- Los imbornales son orificios del costado a la altura del trancanil que dan salida al agua de cubierta; los candeleros sostienen los guardamancebos y el pasamanos es para apoyar la mano.
- La quilla recorre el fondo de proa a popa; la roda la prolonga a proa y el codaste a popa; los baos son transversales, van afirmados a las cuadernas y sostienen la cubierta.
- Los grifos de fondo son válvulas bajo la flotación que toman agua de mar (por ejemplo, la refrigeración del motor) y se cierran al dejar el barco.

**Trampas del examen:**

- Falso: sotavento es «la banda por donde entra el viento». Cierto: eso es barlovento; sotavento es la banda contraria a barlovento, la de salida del viento, y por eso suele ser correcta «las respuestas b) y c)».
- Falso: barlovento o sotavento son una banda fija (babor o estribor) en los veleros. Cierto: dependen del viento y del rumbo en cualquier barco.
- Falso: el manguerote sirve para ventilar y dar luz. Cierto: solo ventila; para luz y aire, lumbreras y portillos practicables.
- Falso: el agua de cubierta sale por «aliviaderos» o «desagües». Cierto: el nombre náutico es imbornales, y nada tienen que ver con los grifos de fondo, que están bajo la flotación.
- Falso: el codaste es de proa. Cierto: el codaste prolonga la quilla hacia popa; la roda y la amura son de proa.
- Falso: la regala es un refuerzo transversal. Cierto: es longitudinal y remata la borda por arriba; los baos son los transversales.

**Minijuego** (25 preguntas reales de examen en estas clases):

- Banda de Sotavento es: *(and-2020-c1-t04)*
- Si quisiéramos ventilar y al mismo tiempo dar luz a un espacio del buque utilizaríamos: *(and-2022-c1-t02)*
- ¿Cuál de las siguientes partes NO pertenece a la proa de una embarcación?: *(and-2024-c3-t04)*

**Relacionados:** 1.0, 1.3, 3.3.

#### 1.2 · El timón y la hélice

🔎 Profundiza · ⏳ pendiente · clases per-1-4, per-1-5

Las partes del timón y de la hélice, hacia dónde cae la proa con caña y con rueda, el paso, la cavitación y el sentido de giro de las hélices (dextrógira, levógira y gemelas). Las preguntas mezclan a propósito las piezas de uno y de otra.

**Gancho:** En la varada de invierno, con el barco en seco, Andrés mira la popa y ve dos piezas que salen del casco, una con la pala del timón y otra con la hélice, y no sabe cuál de los dos agujeros es la limera y cuál la bocina.

**Para llevarse:**

- El timón tiene pala o azafrán, mecha (el eje sobre el que gira la pala), limera (el orificio por el que la mecha atraviesa el casco), caña o rueda y guardines (los cables o cadenas que unen la rueda con la mecha).
- Con caña, la proa cae a la banda contraria a la que llevas la caña; con rueda, al mismo lado, como el volante de un coche.
- Tipos de timón: ordinario (toda la pala a popa de la mecha), compensado, semicompensado y suspendido.
- Partes de la hélice: eje, bocina (el tubo por donde sale el eje), núcleo, palas y capacete (la pieza que cierra el extremo exterior del eje).
- Paso es lo que avanzaría la hélice en una vuelta en un medio sólido; retroceso, lo que se pierde en el agua; cavitación, las burbujas que aparecen con demasiadas revoluciones.
- Dextrógira es la que, vista desde popa y en marcha avante, gira en el sentido de las agujas del reloj; levógira, al contrario; dando atrás el giro se invierte, pero el nombre no cambia.
- En hélices gemelas de giro al exterior, la de estribor es dextrógira y la de babor levógira; al interior, al revés.

**Trampas del examen:**

- Falso: la bocina es el orificio del timón. Cierto: la del timón es la limera; la bocina es la de la hélice, por donde sale el eje.
- Falso: la cruz es una parte del timón. Cierto: la cruz es del ancla; la bocina tampoco es del timón.
- Falso: la mecha es el orificio. Cierto: la mecha es el eje de la pala y la limera, el orificio.
- Falso: el nombre de dextrógira o levógira «depende del sentido de marcha». Cierto: se define siempre mirando de popa a proa y con máquina avante; una levógira dando atrás gira en sentido horario.
- Falso: en gemelas de giro al exterior las dos son dextrógiras (o las dos levógiras). Cierto: nunca giran igual; al exterior, estribor dextrógira y babor levógira.
- Falso: «bocina, núcleo y capacete» es una trampa porque la bocina no es de la hélice. Cierto: el programa la incluye entre las partes de la hélice y esa respuesta es la correcta.

**Minijuego** (21 preguntas reales de examen en estas clases):

- Indique cuál de las siguientes NO es una parte del timón: *(and-2026-c2-t02)*
- Si miramos de popa hacia proa, una hélice de giro levógira es: *(and-2020-c1-t02)*
- En una embarcación con dos hélices gemelas de giro al exterior, la hélice de estribor es: *(and-2025-c2-t03)*

**Relacionados:** 1.0, 1.1, 7.2.

#### 1.3 · El equipo de fondeo y las dimensiones del barco

🔎 Profundiza · ⏳ pendiente · clases per-1-6, per-1-7

El equipo de fondeo (molinete, ancla, línea de fondeo y las voces de la maniobra) y las medidas del barco: obra viva y obra muerta, eslora, manga, puntal, calado, francobordo, asiento, escora, desplazamiento y arqueo. Preguntas de definición donde las opciones intercambian partes por distancias.

**Gancho:** Antes de salir a fondear en una cala, Andrés tiene que comprobar si su cadena cumple lo que pide la norma para su barco de nueve metros, y en el pantalán alguien le grita «¡déjala a la pendura!» mientras él la tenía a pique en su cabeza.

**Para llevarse:**

- El molinete tiene barbotén (la rueda con muescas donde encajan los eslabones), cabirón (tambor para cabos), embrague y freno; desembragado, el barbotén gira loco.
- Ancla sin cepo: arganeo, caña, cruz, brazos y uñas; el cepo solo lo lleva la de almirantazgo; de arado tiene una reja, Danforth dos uñas planas y anchas, y el rezón varios brazos.
- La línea de fondeo debe medir al menos 5 veces la eslora, con un tramo de cadena de al menos 1 eslora (si la eslora es de 6 metros o menos puede ser toda de estacha).
- Filar es largar cadena y virar, recogerla; a la pendura, el ancla cuelga sin tocar fondo, lista para fondear; a pique, la cadena queda vertical estando fondeado; zarpar es que el ancla se despega del fondo.
- Obra viva o carena es la parte sumergida y obra muerta la emergida; calado va de la flotación a lo más bajo de la quilla, francobordo de la flotación a la cubierta estanca más alta y puntal de la quilla a la cubierta.
- Asiento es calado de popa menos calado de proa: positivo, apopado; negativo, aproado; cero, en aguas iguales. Con 1,2 metros a proa y 1,6 a popa, asiento de más 0,4 (apopado) y calado medio de 1,4.
- Escorar es inclinarse a una banda y adrizar es corregir la escora; desplazamiento es el peso del barco y arqueo, su volumen interior.

**Trampas del examen:**

- Falso: a la pendura y a pique son lo mismo. Cierto: a la pendura el ancla cuelga sin tocar fondo antes de fondear; a pique la cadena está vertical estando fondeado.
- Falso: el barbotén gira loco cuando está embragado. Cierto: gira loco desembragado; y arganeo y cepo son del ancla, no del molinete.
- Falso: el tramo de cadena debe medir 5 esloras. Cierto: la cadena, como mínimo 1 eslora; las 5 esloras son de la línea de fondeo completa.
- Falso: el francobordo es «la parte del casco que emerge». Cierto: eso es la obra muerta; el francobordo es una distancia, de la flotación a la cubierta estanca.
- Falso: el asiento es el ángulo de inclinación transversal. Cierto: eso es la escora; el asiento es la diferencia de calados de popa y de proa.
- Falso: adrizar es «eliminar el asiento». Cierto: adrizar es quitar la escora y poner el barco derecho; y «obra semiviva» u «obra semimuerta» no existen.

**Minijuego** (26 preguntas reales de examen en estas clases):

- Cuando tenemos el ancla rozando el agua y lista para fondear, el ancla se encuentra: *(and-2022-c1-t01)*
- En las embarcaciones de más de 6 metros de eslora, la longitud del tramo de cadena de la línea de fondeo será como mínimo igual a: *(and-2023-c1-t01)*
- La distancia vertical comprendida entre la superficie de flotación y la cubierta completa más alta con medios permanentes de cierre, medida en el centro del costado del buque, se denomina: *(and-2026-c2-t04)*

**Relacionados:** 1.0, 2.2, 3.1.

### Tema 2 · Amarre y fondeo

#### 2.0 · Amarrar y fondear

🧭 Panorama · ⏳ pendiente · clases per-2-1, per-2-2, per-2-3, per-2-4, per-2-5, per-2-6

Panorama del tema de amarre y fondeo: herrajes y partes de un cabo, los cuatro nudos del examen, elegir fondeadero y tenedero, la maniobra de fondeo, el borneo y el garreo, y el orinque y la maniobra de levar. Es un tema corto y de vocabulario: si separas bien cada palabra, te lo llevas entero.

**Gancho:** Andrés pasa su primera noche fondeado en una cala y, al despertar, el barco apunta hacia otro lado y la playa parece más cerca: ¿ha girado sin más o el ancla se ha ido arrastrando?

**En el examen:** Amarre y fondeo aporta 2 de las 45 preguntas del examen y no tiene límite propio de fallos: pocas preguntas, pero de vocabulario muy repetido entre convocatorias.

**Recorre:** Elementos de amarre y partes de un cabo · Los cuatro nudos del PER · Elegir el fondeadero y el tenedero · Fondeo a la gira: la maniobra · Borneo, garreo y vigilancia del fondeo · El orinque y la maniobra de levar.

**Para llevarse:**

- Elementos de amarre: el noray está en el muelle; la bita y la cornamusa, a bordo; el chicote es el extremo libre del cabo, el seno su curva, el firme la parte que trabaja y la gaza un ojo cerrado.
- Los cuatro nudos: llano para unir dos cabos de igual mena; vuelta de rezón para una argolla; ballestrinque para un palo o candelero, rápido; as de guía para una gaza fija.
- Fondeadero es el lugar y tenedero la calidad del fondo: buenos la arena y el fango duro; malos el fango blando, las algas y la piedra; y mejor un fondo sin gran pendiente.
- Para fondear, freno puesto y desembragar, y se dosifica la salida con el freno; para levar, embragar y dejar libre el freno; se filan unas 3 veces la profundidad con buen tiempo y 5 o más con malo.
- Bornear es girar alrededor del ancla; garrear es que el ancla se arrastra por el fondo; el radio de borneo es aproximadamente la cadena filada más la eslora.
- El orinque es un cabo afirmado a la cruz del ancla con un boyarín que señala su posición; si al levar la cadena tira por largo con mucha fuerza, se dan unas paladas avante.

**Minijuego** (36 preguntas reales de examen en estas clases):

- ¿Qué nudo se usa para unir dos cabos del mismo material y mena (grosor)? *(and-2023-c2-t05)*
- De los tenederos siguientes, ¿cuál sería el menos apropiado para fondear?: *(and-2020-c1-t06)*
- ¿Qué nombre recibe la acción por la que un barco gira alrededor de su ancla?: *(and-2024-c1-t05)*

#### 2.1 · Cabos, amarres y los cuatro nudos

🔎 Profundiza · ⏳ pendiente · clases per-2-1, per-2-2

Los herrajes del muelle y de a bordo, las defensas, el bichero, el guiacabos y la roldana, las partes de un cabo y los cuatro nudos que pide el examen. El examen pregunta para qué sirve cada nudo y dónde está cada pieza.

**Gancho:** Andrés se abarloa un rato a otro velero en el puerto y tiene que colgar las defensas deprisa en los candeleros; al día siguiente se pregunta si ese mismo nudo le vale para dejar las defensas puestas toda la temporada en una argolla.

**Para llevarse:**

- El noray (y el bolardo, más grande) está en el muelle; la bita y la cornamusa están a bordo, y todos sirven para hacer firme un cabo.
- El muerto es un peso en el fondo del que sube una cadena hasta la boya de amarre.
- Las defensas se ponen entre el casco y el muelle u otro barco; el bichero es una pértiga con gancho; el guiacabos conduce la amarra y evita roces; la roldana es la rueda giratoria por la que laborea el cabo.
- Chicote es el extremo libre del cabo; firme, la parte que trabaja; seno, la curva; gaza, un ojo cerrado en el extremo.
- El nudo llano (o de rizo) une dos cabos de la misma mena y del mismo material por sus chicotes.
- La vuelta de rezón afirma un cabo a una argolla y es la indicada para defensas que van a estar mucho tiempo; el ballestrinque se hace rápido en un palo o candelero, para defensas por poco tiempo, porque con tirones se puede correr.
- El as de guía forma una gaza fija sin costuras, la que se usa para encapillar una amarra en un noray.

**Trampas del examen:**

- Falso: el noray es un herraje de a bordo. Cierto: está en el muelle; a bordo son la bita y la cornamusa (por eso «a) y c) son correctas»).
- Falso: el guiacabos es donde se hace firme el cabo, o es la rueda por donde laborea. Cierto: el guiacabos evita el roce; la rueda es la roldana; se hace firme en bitas y cornamusas.
- Falso: las defensas protegen la hélice o van en el mástil. Cierto: protegen el casco, entre el barco y el muelle u otra embarcación.
- Falso: para una defensa siempre vale el mismo nudo. Cierto: por poco tiempo o rápido, ballestrinque; mucho tiempo, vuelta de rezón.
- Falso: el envergue sirve para colgar defensas o hacer gazas. Cierto: «de rizo» o «de envergue» son nombres del nudo llano, que es para unir cabos.
- Falso: el seno es el extremo libre. Cierto: el extremo libre es el chicote; el seno es la curva.

**Minijuego** (14 preguntas reales de examen en estas clases):

- ¿Qué elemento de a bordo sirve para hacer firme un cabo?: *(and-2020-c1-t05)*
- El extremo libre de un cabo o cable se denomina: *(and-2025-c2-t05)*
- ¿Qué nudo sería el más indicado para hacer firme rápidamente una defensa a los costados, si la defensa no ha de estar tendida mucho tiempo?: *(and-2023-c3-t06)*

**Relacionados:** 2.0, 2.2, 7.1.

#### 2.2 · Fondear bien: tenedero, maniobra, garreo y levar

🔎 Profundiza · ⏳ pendiente · clases per-2-3, per-2-4, per-2-5, per-2-6

Elegir fondeadero y tenedero, la maniobra de fondeo a la gira con el molinete, cuánta cadena filar, la señal de fondeado, el borneo y el garreo, cómo vigilar el fondeo, el orinque y la maniobra de levar. El examen se juega en matices: fango duro frente a blando, embragar frente a frenar, bornear frente a garrear.

**Gancho:** Andrés fondea en cinco metros de agua en una cala de arena con algo de posidonia; de madrugada salta la alarma de fondeo del GPS y por la mañana, al levar, la cadena tira hacia proa tan fuerte que el molinete casi no puede con ella.

**Para llevarse:**

- Al elegir fondeadero se valoran a la vez abrigo, profundidad (también en bajamar), tipo de fondo, corrientes, espacio para bornear y la carta y el derrotero; mejor un fondo sin gran pendiente, porque en pendiente el ancla resbala hacia lo profundo.
- Buenos tenederos: arena y fango duro; regulares: arcilla y cascajo; malos: fango blando, algas y piedra. Está prohibido, con carácter general, fondear sobre posidonia.
- Para fondear: freno puesto y desembragar, voz de «¡fondo!» y se controla la salida con el freno; para levar: embragar y dejar libre el freno.
- Se filan unas 3 veces la profundidad con buen tiempo y 5 o más con mal tiempo (regla práctica, no norma); con 5 metros de agua y buen tiempo, unos 15 metros.
- Fondeado se muestra de día una bola negra a proa y de noche luz blanca todo horizonte; las embarcaciones de menos de 7 metros están exentas solo lejos de canales, pasos, fondeaderos y zonas de navegación.
- Bornear es girar alrededor del ancla y garrear es que el ancla se arrastre; radio de borneo, aproximadamente cadena filada más eslora; se reduce filando menos cadena o con una segunda ancla.
- El orinque va a la cruz del ancla con un boyarín y es algo más largo que la profundidad en pleamar; al levar: virar, a pique, zarpa, clara y levada; si tira por largo con fuerza, unas paladas avante.

**Trampas del examen:**

- Falso: el fango es un buen tenedero, sin más. Cierto: el fango duro es de los mejores y el fango blando de los peores; aparecen juntos en las opciones a propósito.
- Falso: basta con un factor («solo la profundidad», «únicamente la proximidad a otros barcos»). Cierto: se combinan viento, profundidad, fondo, corrientes y espacio para bornear.
- Falso: para levar hay que desembragar y soltar el freno. Cierto: para levar, embragar y freno libre; freno puesto y desembragar es la posición antes de fondear.
- Falso: garrear es girar alrededor del ancla. Cierto: eso es bornear; garrear es que el ancla no agarra y se arrastra; rolar lo hace el viento y escorar es inclinarse.
- Falso: si al levar la cadena tira por largo con fuerza, se dan paladas atrás o se fuerza el molinete. Cierto: unas paladas avante para acercarse al ancla.
- Falso: un barco de recreo de 8 a 12 metros fondeado no necesita la bola. Cierto: la exención solo es para menores de 7 metros y fuera de zonas de paso o fondeo.

**Minijuego** (22 preguntas reales de examen en estas clases):

- Indique cuál de los siguientes tenederos es el más adecuado para fondear: *(and-2022-c2-t05)*
- Para poder levar el ancla debemos: *(and-2022-c1-t05)*
- Si intentamos levar el ancla y comprobamos que tira con mucha fuerza por largo, ¿qué acción debemos tomar?: *(and-2024-c1-t06)*

**Relacionados:** 2.0, 1.3, 6.7.

### Tema 3 · Seguridad en la mar

#### 3.0 · Seguridad en la mar

🧭 Panorama · ⏳ pendiente · clases per-3-1, per-3-2, per-3-3, per-3-4, per-3-5, per-3-6, per-3-7, per-3-8

Panorama del tema de seguridad en la mar: estabilidad y movimientos del barco, revisiones antes de salir, mal tiempo, tormentas, niebla y aguas someras, el equipo de seguridad obligatorio según la zona, el hombre al agua y el rescate, la hipotermia, el remolque y Salvamento Marítimo. Mucho sentido común marinero, pero con cifras que hay que llevar bien atadas.

**Gancho:** Andrés quiere hacer su primera travesía de doce millas hasta otro puerto y se da cuenta de que no sabe qué chalecos tiene que llevar, qué hacer si le entra mala mar ni cómo volver a por alguien que se cae al agua.

**En el examen:** Seguridad aporta 4 de las 45 preguntas del examen y no tiene límite propio de fallos; son preguntas de sentido común, pero con cifras (chalecos, pirotecnia, grados de las maniobras) que conviene saberse exactas.

**Recorre:** Estabilidad y movimientos del barco · Antes de hacerse a la mar · Mal tiempo: a son de mar, capear y correr · Tormentas, niebla y aguas someras · Equipo de seguridad (I): zonas, chalecos, aros y balsas · Equipo de seguridad (II): pirotecnia, extintores y otros · Hombre al agua: prevención, maniobras y búsqueda · Rescate, primeros auxilios, remolque y Salvamento Marítimo.

**Para llevarse:**

- Estabilidad: el barco es estable si el metacentro queda por encima del centro de gravedad; el balance es de babor a estribor y la cabezada de proa a popa; el sincronismo se rompe cambiando rumbo o velocidad.
- Antes de salir se revisan el tiempo previsto, el motor (aceite, refrigeración, correa del alternador, filtro decantador, fugas), el combustible con reserva, el gobierno y el equipo de seguridad, y se deja dicho en tierra el plan de navegación.
- Con mal tiempo, todo estibado y trincado «a son de mar»; capear es recibir la mar por la amura con poca máquina avante y correr el temporal, por la popa o la aleta; nunca atravesado, y la costa a barlovento.
- Tras una tormenta eléctrica se comprueba la aguja por posibles desvíos anómalos; con niebla, velocidad de seguridad, vigilancia visual y auditiva, luces y señales fónicas; en aguas someras, sonda y poca velocidad.
- Equipo según la zona (RD 339/2021): un chaleco por persona, de 275 newtons en zona 1, 150 en zonas 2 a 4 y 100 en zonas 5 a 7; aro con luz y rabiza en zonas 1 a 4; balsa en zonas 1 a 3.
- Pirotecnia: bengala de mano, luz roja al menos 1 minuto; cohete con paracaídas, al menos 40 segundos; fumígena flotante, humo naranja al menos 3 minutos; solo cuando haya alguien que pueda verlas.
- Hombre al agua: timón a la banda de la caída, aro al agua, alguien señalando y tecla MOB; Anderson cae hasta 250 grados; Boutakow cae 70 grados y luego a la contraria hasta el rumbo opuesto; si no se le ve, espiral cuadrada o sectores.
- Hipotermia: abrigar sin frotar ni dar alcohol; RCP en el ahogado: 5 insuflaciones iniciales y luego 30 compresiones por 2 insuflaciones; Salvamento Marítimo: canal 16, 900 202 202 o 112.

**Minijuego** (72 preguntas reales de examen en estas clases):

- El movimiento longitudinal de la embarcación en sentido proa-popa se denomina: *(and-2022-c3-t07)*
- Para capear un temporal navegaremos recibiendo la mar por: *(and-2025-c1-t10)*
- Hombre al agua. En la maniobra de aproximación de Anderson, ¿cuántos grados debemos caer antes de poner timón a la vía y parar la máquina? *(and-2023-c1-t10)*

#### 3.1 · Estabilidad y antes de salir

🔎 Profundiza · ⏳ pendiente · clases per-3-1, per-3-2

Qué es la estabilidad y sus apellidos (estática o dinámica, transversal o longitudinal), los puntos G, C y M, los tipos de equilibrio, el balance, la cabezada y el sincronismo, y las comprobaciones antes de hacerse a la mar. El examen cruza las palabras transversal y longitudinal y mete opciones absurdas en las comprobaciones.

**Gancho:** Saliendo del puerto con mar de través, el velero de Andrés empieza a dar balances cada vez más grandes, como si cada ola le diera el empujón en el momento justo; y esa misma mañana, con las prisas, ni había mirado la correa del alternador.

**Para llevarse:**

- Estabilidad es la propiedad del barco de recuperar la posición de adrizado; recuperarla tras una escora flotando en aguas en reposo es estabilidad estática transversal.
- G, centro de gravedad, es donde se aplica el peso, hacia abajo; C, centro de carena, el centro del volumen sumergido, donde se aplica el empuje, hacia arriba; M, metacentro, es donde la vertical del nuevo C corta el plano de crujía al escorar.
- Con M por encima de G el equilibrio es estable; con M en G, indiferente (se queda escorado); con M por debajo de G, inestable. Los pesos, abajo y bien trincados.
- Balance es la oscilación transversal, de babor a estribor; cabezada, la longitudinal, de proa a popa; la escora es una inclinación mantenida, no un vaivén.
- Sincronismo es que las olas llegan al mismo ritmo que el balance o la cabezada del barco; se rompe cambiando el rumbo, la velocidad o ambas cosas.
- Antes de salir: tiempo previsto, motor (aceite, refrigeración con agua por el escape, correa del alternador, filtro decantador sin agua, fugas), combustible con reserva, gobierno, achique, luces, VHF y equipo de seguridad.
- Se deja dicho en tierra adónde se va, por dónde y cuándo se vuelve, y se explica a la tripulación dónde están chalecos, aro, extintores y pirotecnia y cómo usar el VHF.

**Trampas del examen:**

- Falso: transversal es proa-popa o longitudinal es babor-estribor. Cierto: transversal es babor-estribor (balance) y longitudinal es proa-popa (cabezada).
- Falso: recuperar la posición tras una escora en aguas en reposo es estabilidad dinámica o longitudinal. Cierto: es estática transversal; la letra de la opción cambia de una convocatoria a otra.
- Falso: el balance es una oscilación longitudinal. Cierto: es transversal; la cabezada es la longitudinal.
- Falso: antes de salir hay que comprobar «un aro salvavidas por cada tripulante». Cierto: lo que va por persona es el chaleco.
- Falso: hay que llevar suficiente agua salada en los tanques. Cierto: se lleva agua dulce; si las demás opciones son comprobaciones correctas del motor, la buena suele ser «todas las anteriores».

**Minijuego** (14 preguntas reales de examen en estas clases):

- La propiedad que tiene el buque, una vez escorado, de recuperar su posición de equilibrio, cuando se encuentra flotando en aguas en reposo, se llama: *(and-2023-c3-t10)*
- El movimiento oscilante transversal de una embarcación en el sentido estribor-babor, se denomina: *(and-2024-c2-t07)*
- ¿Qué sistemas de nuestra embarcación debe comprobar el patrón antes de hacerse a la mar?: *(and-2025-c3-t07)*

**Relacionados:** 3.0, 3.2, 1.3.

#### 3.2 · Mal tiempo, tormentas y niebla

🔎 Profundiza · ⏳ pendiente · clases per-3-3, per-3-4

Preparar el barco «a son de mar», capear y correr el temporal, por qué no hay que atravesarse a la mar, dónde dejar la costa, qué hacer en una tormenta eléctrica, con niebla, de noche y en aguas someras, y para qué sirve el reflector radar. Las preguntas suelen pedir la opción imprudente.

**Gancho:** Volviendo a puerto, a Andrés le entra un temporal de proa con nubes de tormenta; un rayo cae cerca, entra después un banco de niebla junto a la costa y, ya en puerto, ve que la aguja no marca lo mismo que antes en la enfilación de la bocana.

**Para llevarse:**

- «A son de mar» es tener todo estibado y trincado; con mal tiempo se cierran aberturas y los grifos de fondo que no hagan falta, pero el de refrigeración del motor queda abierto.
- Recibir mar fuerte por el través es lo más peligroso; se ajustan rumbo y velocidad: capear es recibir la mar por la amura con poca máquina avante, y correr el temporal, por la popa o la aleta.
- A vela se capea con poco trapo para mantener una ligera arrancada, y si no se puede llevar vela ni máquina, con un ancla de capa; para evitar cabezadas fuertes, moderar la velocidad y recibir la mar por la amura.
- Con mal tiempo se deja la costa a barlovento y hay que alejarse de la costa que se tiene a sotavento.
- Un rayo cercano puede producir desvíos anómalos de la aguja, temporales o permanentes, y errores en el rumbo de aguja; la declinación magnética no cambia.
- Con niebla: velocidad de seguridad, vigilancia visual y auditiva, luces de navegación, señales fónicas, radar si lo hay, reflector radar izado y evitar zonas de tráfico.
- El reflector radar es pasivo y devuelve las ondas de los radares de otros barcos para que te vean; aguas someras son aguas de poca profundidad: derrota según el calado, sonda y poca velocidad.

**Trampas del examen:**

- Falso: «a son de mar» es que el periodo de la ola coincide con el cabeceo. Cierto: eso es sincronismo; a son de mar es estiba y trinca.
- Falso: con mal tiempo hay que cerrar todos los grifos de fondo. Cierto: solo los que no sean necesarios; la refrigeración del motor, abierta.
- Falso: capear es recibir la mar por la aleta o por la proa con la máquina parada. Cierto: por la amura y con poca máquina avante; por la popa o la aleta es correr el temporal.
- Falso: «alejarse de la costa a sotavento» es un error. Cierto: es correcto; lo no recomendable es destrincar pesos o prepararse para un abandono inminente.
- Falso: el rayo cambia la declinación magnética o mejora la aguja. Cierto: puede provocar un desvío anómalo de la aguja en cualquier tipo de casco.
- Falso: con niebla o en aguas someras, aumentar la velocidad para salir antes, buscar el tráfico o quitar el reflector radar. Cierto: reducir la velocidad, extremar la vigilancia y evitar el tráfico.

**Minijuego** (34 preguntas reales de examen en estas clases):

- La expresión utilizada para indicar que se ha estibado y trincado a bordo con criterio y a conciencia antes de salir a la mar es: *(and-2020-c3-t09)*
- Cuando las circunstancias lo permitan, durante una navegación con mal tiempo, es recomendable: *(and-2026-c1-t09)*
- La caída de un rayo en las proximidades de una embarcación puede afectar a la aguja magnética. ¿De qué manera?: *(and-2026-c2-t09)*

**Relacionados:** 3.0, 3.1, 6.5, 10.3.

#### 3.3 · El equipo de seguridad

🔎 Profundiza · ⏳ pendiente · clases per-3-5, per-3-6

El equipo de seguridad obligatorio según el RD 339/2021: a qué barcos se aplica, las siete zonas de navegación y las categorías de diseño, chalecos, aros, balsas, pirotecnia, extintores y otro equipo. Es el epígrafe de las cifras: newtons, millas, minutos y cantidades por zona.

**Gancho:** Andrés quiere sacar su velero a doce millas de la costa y, revisando el pañol, encuentra chalecos de distintos newtons, un aro sin luz y una caja de bengalas: no sabe si le basta o si tiene que comprar algo antes de ir.

**Para llevarse:**

- El RD 339/2021 se aplica a embarcaciones de recreo de 2,5 a 24 metros con no más de 12 pasajeros; no a motos náuticas, kayaks, piraguas, tablas ni barcos de regatas.
- Zonas: 1 ilimitada; 2 hasta 60 millas de la costa; 3 hasta 25; 4 hasta 12; 5 a no más de 5 millas de un abrigo; 6 a no más de 2; 7 aguas protegidas. Categorías de diseño: A zonas 1 a 7, B 2 a 7, C 4 a 7, D solo 7.
- Chalecos: uno por persona con luz (uno más en zona 1); flotabilidad mínima 275 newtons en zona 1, 150 en zonas 2, 3 y 4, y 100 en zonas 5, 6 y 7.
- Aro con luz y rabiza en zonas 1 a 4 (otro más en zona 1), en las bandas hacia las aletas o en la popa, con suelta rápida; balsa en zonas 1, 2 y 3, para todas las personas a bordo.
- Bengala de mano: luz roja al menos 1 minuto, con el brazo extendido a sotavento; cohete con paracaídas: sube a 300 metros o más y luce al menos 40 segundos; fumígena flotante: humo naranja al menos 3 minutos, de día.
- Pirotecnia por zona: zona 1, 6 bengalas, 6 cohetes y 2 fumígenas; zonas 2 y 3, 6, 6 y 1; zona 4, 3 bengalas y 3 cohetes; zonas 5 y 6, 3 bengalas; zona 7, ninguna. Solo se usan cuando alguien pueda verlas.
- Extintores: con marcado CE, los que diga el fabricante; comprobación cada 3 meses por el propietario, revisión anual y retimbrado cada 5 años; el arnés y el espejo de señales son recomendables, pero no obligatorios.

**Trampas del examen:**

- Falso: en zona 4 los chalecos son de 100 newtons. Cierto: de 150; 100 es para zonas 5, 6 y 7 y 275 para zona 1 (la unidad es el newton, aunque alguna opción ponga «NW»).
- Falso: el aro se coloca a proa o en las amuras. Cierto: en las bandas hacia las aletas o en popa, con luz y suelta rápida, porque el náufrago se queda atrás.
- Falso: la bengala dura 3 minutos y la fumígena 1. Cierto: bengala al menos 1 minuto, fumígena al menos 3 minutos y cohete al menos 40 segundos.
- Falso: el humo de socorro es verde. Cierto: es naranja.
- Falso: las señales pirotécnicas se lanzan nada más abandonar el barco, aunque no haya nadie a la vista. Cierto: solo cuando haya seguridad de que alguien puede verlas.
- Falso: el arnés y el espejo de señales son obligatorios en zona 4. Cierto: el RD 339/2021 no los exige (la pregunta que lo preguntaba se anuló).

**Minijuego** (8 preguntas reales de examen en estas clases):

- Los chalecos salvavidas reglamentarios para la zona de navegación 4, deberán tener una flotación mínima de: *(and-2024-c2-t09)*
- El color y duración mínima del humo de las señales fumígenas flotantes son; *(and-2024-c1-t08)*
- La bengala de mano tendrá un periodo de combustión de: *(and-2022-c3-t10)*

**Relacionados:** 3.0, 3.4, 8.4.

#### 3.4 · Hombre al agua, rescate y remolque

🔎 Profundiza · ⏳ pendiente · clases per-3-7, per-3-8

Hombre al agua de principio a fin: prevenir la caída, los primeros segundos, la tecla MOB, las maniobras de Anderson y Boutakow, la búsqueda en espiral cuadrada y por sectores, subir al náufrago, la hipotermia, la reanimación en un ahogado, el remolque y cómo contactar con Salvamento Marítimo. El examen pregunta grados, orden de actuación y números de teléfono.

**Gancho:** Navegando a motor, a un amigo de Andrés se le escapa el pie en la bañera y cae al agua por estribor; Andrés tiene la mano en la palanca del motor y lo primero que le pide el cuerpo es acelerar para dar la vuelta cuanto antes.

**Para llevarse:**

- Prevenir: moverse por cubierta agarrado y con cuidado, con chaleco y arnés a una línea de vida; los candeleros y guardamancebos no son fiables, y en el velero hay que vigilar la botavara.
- Primeros pasos: gritar «¡hombre al agua!», timón a la banda de la caída para apartar la hélice, lanzar el aro, alguien que no le pierda de vista, pulsar MOB y avisar por VHF.
- La tecla MOB del GPS memoriza la posición y la hora de la caída y da rumbo y distancia para volver; ese punto es el datum de la búsqueda.
- Anderson: todo el timón a la banda de la caída hasta variar el rumbo unos 250 grados, timón a la vía y parar la máquina. Boutakow: todo a la banda de la caída y, a los 70 grados, todo a la contraria hasta el rumbo opuesto, para volver por la propia estela.
- Si no se le ve: espiral cuadrada, que empieza en el datum y se abre, con un solo barco y para áreas pequeñas; o búsqueda por sectores, con giros de 120 grados a estribor.
- Hipotermia por debajo de 35 grados: temblores, torpeza, confusión; abrigar con la cabeza incluida, quitar la ropa mojada, bebidas calientes si está consciente, y nunca frotar, sacudir ni dar alcohol. RCP en el ahogado: 5 insuflaciones y luego 30 por 2, a 100 a 120 compresiones por minuto.
- Remolque: acordarlo por VHF, arrancar a mínima velocidad y cabo largo con mar. Salvamento Marítimo: VHF canal 16, 900 202 202 o 112.

**Trampas del examen:**

- Falso: lo primero es meter el timón a la banda contraria a la caída, o parar máquinas. Cierto: timón a la banda por la que ha caído y lanzarle el aro.
- Falso: hay que aumentar máquina para hacer la maniobra cuanto antes. Cierto: acelerar sin control te aleja, lo pierdes de vista o lo arrollas.
- Falso: el primer giro de Boutakow es a la banda contraria, o Anderson se hace hasta 70 grados. Cierto: Boutakow cae 70 grados a la banda de la caída (en el examen de Andalucía; el manual internacional dibuja 60) y Anderson, 250 grados.
- Falso: sin ver al náufrago se hace la «exploración de Anderson» o de Boutakow. Cierto: esas son maniobras de aproximación; para buscar, espiral cuadrada o por sectores.
- Falso: la espiral cuadrada termina en el datum, necesita dos unidades o los sectores giran 100 grados a babor. Cierto: la espiral sale del datum y se abre, la hace un solo barco, y los sectores giran 120 grados.
- Falso: el teléfono de Salvamento Marítimo es 902 202 202 o 900 200 200. Cierto: 900 202 202 (o el 112); el 091 es la Policía Nacional.

**Minijuego** (16 preguntas reales de examen en estas clases):

- En caso de caída de un hombre al agua, ¿qué maniobra de búsqueda debemos realizar cuando no tengamos el náufrago a la vista?: *(and-2024-c3-t08)*
- Navegando a motor vemos a un tripulante caer al agua. Para volver rápidamente a la situación de caída, realizaremos la maniobra denominada: *(and-2022-c1-t08)*
- El teléfono para contactar con Salvamento Marítimo es: *(and-2023-c2-t10)*

**Relacionados:** 3.0, 3.3, 8.4.

### Tema 4 · Legislación

#### 4.0 · Las normas que hay que conocer

🧭 Panorama · ⏳ pendiente · clases per-4-1, per-4-2, per-4-3, per-4-4, per-4-5, per-4-6, per-4-7, per-4-8

Recorrido por la legislación que pide el PER: estar en regla, el puerto comercial, playas y buzos, aguas sucias, basuras, responsabilidad y auxilio, banderas y espacios protegidos. Es un tema de poco peso pero de cifras muy concretas (3 nudos, 50 m, 3 y 12 millas, un tercio) que el examen cambia de sitio para pillarte.

**Gancho:** Andrés va a salir del puerto un sábado de verano: quiere izar la bandera de Andalucía, vaciar el tanque del inodoro «en cuanto salga» y fondear frente a la playa para darse un baño. Elena le dice que en esa mañana hay al menos tres normas que le afectan.

**En el examen:** Legislación es el tema 4 del examen y da 2 de las 45 preguntas. No es eliminatorio, pero son dos puntos de pura memoria que conviene no regalar.

**Recorre:** En regla y dentro del puerto · Playas, zonas de baño y reservas marinas · Buzos y bañistas: banderas y resguardos · Aguas sucias: qué llevar y dónde descargar · Basuras: MARPOL anexo V y entrega en puerto · Responsabilidad, aviso de contaminación y deber de auxilio · Pabellón nacional y bandera autonómica · Espacios protegidos: ZEPIM y posidonia.

**Para llevarse:**

- En regla y en puerto: registro y certificado en vigor, seguro, equipo, zona, personas y título; en un puerto comercial la embarcación de recreo de menos de 20 m no estorba a los buques, vaya a vela o a motor, y por regla general el que sale pasa antes que el que entra.
- Playas: en la zona de baño balizada no se navega (solo por los canales de acceso); en costa no balizada la zona de baño son 200 m en playas y 50 m en el resto de la costa, y dentro se va a 3 nudos como máximo.
- Buzos: la bandera «A» (blanca y azul) o la roja con franja diagonal blanca indican buceadores; hay que mantenerse al menos a 50 m de la zona de buceo y despacio.
- Aguas sucias: desmenuzadas y desinfectadas, a más de 3 millas; sin tratar, a más de 12; el tanque se vacía a régimen moderado, en ruta y a 4 nudos o más.
- Basuras (MARPOL V): plásticos y aceite de cocina, nunca; en el Mediterráneo, zona especial hasta 5° 36' W, la comida solo triturada y a más de 12 millas; todo lo demás se entrega en el puerto.
- Contaminación y auxilio: responden solidariamente naviero, propietario, asegurador y patrón; ante personas en peligro se acude sea cual sea su nacionalidad, y si no se acude se anota el motivo en el diario y se avisa a salvamento.
- Banderas: popa y pico del palo mayor son de la bandera de España; la autonómica solo con la nacional izada y con un tercio de su área como máximo.
- Espacios protegidos: ZEPIM es Zona Especialmente Protegida de Importancia para el Mediterráneo (en Andalucía, Alborán, Cabo de Gata-Níjar, Levante almeriense y Maro-Cerro Gordo); sobre posidonia no se fondea, ni con el ancla ni con la cadena.

**Minijuego** (36 preguntas reales de examen en estas clases):

- Al aproximarse a una playa no balizada, la velocidad máxima a la que se puede navegar es: *(and-2020-c3-t11)*
- La descarga de aguas sucias que no han sido previamente desinfectadas ni desmenuzadas debe realizarse: *(and-2023-c2-t11)*
- ¿En Andalucía se considera Zona ZEPIM el Paraje Natural acantilados Maro-cerro Gordo perteneciente a la provincia de Málaga? *(and-2021-c1-t12)*

#### 4.1 · En regla: puerto, playas, buzos y bañistas

🔎 Profundiza · ⏳ pendiente · clases per-4-1, per-4-2, per-4-3

Qué necesita el barco para navegar en regla, quién manda dentro de un puerto comercial, qué se puede hacer cerca de una playa y cómo comportarse si hay buzos o bañistas. El examen confunde a propósito la zona balizada con la no balizada y los 200 m con los 50 m.

**Gancho:** Andrés entra a vela por la dársena del puerto comercial y un remolcador le pita; al día siguiente quiere arrimarse a la playa por dentro de la línea de boyas amarillas, «despacito, a dos nudos». Elena le explica por qué las dos cosas están mal.

**Para llevarse:**

- Para navegar en regla: embarcación registrada con certificado de navegabilidad en vigor, seguro obligatorio, equipo de seguridad de su zona, sin pasar de la zona ni del número de personas, y patrón con el título adecuado.
- En un puerto comercial, la embarcación de recreo de menos de 20 m no estorba a los buques (RD 186/2023): los comerciales de todo tipo tienen preferencia y la vela no da ningún privilegio.
- En puerto, por regla general el que sale tiene preferencia sobre el que entra, y está prohibido fondear en canales de acceso, bocanas y zonas de maniobra, también al recreo.
- El seguro obligatorio (motor, motos y sin motor de más de 6 m) solo cubre a terceros: no paga los daños del propio barco ni los del patrón.
- En una zona de baño balizada (boyas amarillas) está prohibido navegar, motos incluidas; se entra y sale por los canales de acceso, de 25 a 50 m de ancho.
- En costa no balizada la zona de baño existe igual: 200 m en playas y 50 m en el resto de la costa, y dentro se va a 3 nudos como máximo y sin ningún vertido.
- Bandera «A» (blanca y azul) o roja con franja diagonal blanca: buceadores; todos, salvo la embarcación de apoyo, se mantienen al menos a 50 m de la zona de buceo.

**Trampas del examen:**

- Falso: «los que entran en puerto tienen preferencia sobre los que salen». Cierto: por regla general, el que sale pasa primero.
- Falso: «a vela tengo preferencia sobre el remolcador dentro del puerto». Cierto: el recreo de menos de 20 m no estorba a los buques, vaya a vela o a motor.
- Falso: «en la zona de baño balizada se puede entrar a menos de 3 nudos» o «las motos sí pueden». Cierto: no navega nadie; los 3 nudos son de la franja no balizada.
- Falso: «200 m en toda la costa» o «si no está balizado, no hay zona de baño». Cierto: 200 m en playas, 50 m en el resto, y la zona existe aunque no se vea.
- Falso: «con la bandera A basta con reducir la velocidad». Cierto: hay que dejar como mínimo 50 m a la zona de buceo, además de ir despacio.
- Falso: la roja con cola de golondrina («B», Bravo) indica buceo. Cierto: la «B» es mercancías peligrosas; el buceo es la «A» o la roja con franja diagonal blanca.

**Minijuego** (12 preguntas reales de examen en estas clases):

- En cuanto al tráfico marítimo dentro de los puertos ¿qué buques tienen preferencia de paso, si no se indica lo contrario por la Autoridad competente?: *(and-2025-c3-t12)*
- Dentro de una zona de baño balizada, una moto náutica de uso particular debe dar a los bañistas un resguardo de: *(and-2023-c3-t12)*
- ¿Qué resguardo, como mínimo, hay que darle a una embarcación que tenga izada la señal “A” (ALFA) del Código Internacional de Señales?: *(and-2025-c3-t11)*

**Relacionados:** 4.0, 4.3, 6.7.

#### 4.2 · Contaminación: aguas sucias, basuras y responsabilidad

🔎 Profundiza · ⏳ pendiente · clases per-4-4, per-4-5, per-4-6

Qué se puede echar al mar, dónde y cómo: aguas sucias, basuras según MARPOL V y el Mediterráneo como zona especial. Además, quién paga si se contamina y qué obliga el deber de auxilio. Son preguntas llenas de cifras (3, 12, 4 nudos, 25 mm, 5° 36' W) y de opciones con «únicamente» o «solo».

**Gancho:** Andrés navega entre Málaga y Almería a unas seis millas de la costa, con el tanque del inodoro lleno y un bocadillo de tortilla que huele raro. Le pregunta a Elena si puede soltarlo todo «ya que está lejos de la playa».

**Para llevarse:**

- Con inodoro hay que llevar uno de tres equipos: tanque de retención, instalación de tratamiento o sistema de desmenuzar y desinfectar con almacenamiento; el tanque fijo, con conexión universal a tierra y válvulas precintables.
- Aguas sucias desmenuzadas y desinfectadas: a más de 3 millas; sin tratar: a más de 12 millas, contadas desde la línea de base. En puertos y aguas protegidas, ninguna descarga.
- El tanque se vacía a régimen moderado, con el barco en ruta y a 4 nudos como mínimo; nunca parado ni fondeado.
- MARPOL V prohíbe echar basuras al mar, también al recreo: plásticos y aceite de cocina, nunca; si hay mezcla, se aplica la norma más rigurosa.
- Comida fuera de zona especial: triturada (criba de 25 mm) a más de 3 millas, sin triturar a más de 12. En el Mediterráneo, que acaba en 5° 36' W, solo triturada y a más de 12 millas, siempre en ruta.
- De la contaminación desde una embarcación responden solidariamente el naviero, el propietario, el asegurador de responsabilidad civil y el patrón.
- Deber de auxilio (SOLAS V/33.1): acudir a toda velocidad a personas en peligro sea cual sea su nacionalidad, sin esperar a que lo pida un centro de salvamento; si no se acude, se anota el motivo en el diario y se informa a salvamento.

**Trampas del examen:**

- Falso: «aguas sin tratar entre 3 y 12 millas» o «a más de 6 millas». Cierto: sin tratar, a más de 12; la cifra de 6 millas no existe.
- Falso: «el tanque se puede vaciar aunque el buque esté parado» o «de forma instantánea». Cierto: poco a poco, en ruta y a 4 nudos o más.
- Falso: «la descarga de aguas sucias está prohibida en todo el Mediterráneo». Cierto: rigen las mismas distancias; lo especial del Mediterráneo es para la comida (MARPOL V).
- Falso: frente a Trafalgar rigen las normas del Mediterráneo. Cierto: Trafalgar y Cádiz están fuera (al oeste de 5° 36' W); allí la comida sin triturar se puede echar a más de 12 millas.
- Falso: «responde únicamente el patrón», «solo el propietario» o «solo el asegurador». Cierto: responden los cuatro a la vez, de forma solidaria.
- Falso: «solo se acude si lo pide un centro de salvamento», «solo si es de mi bandera» o «si no voy, no tengo que explicar nada». Cierto: se acude siempre que se pueda sin grave peligro, y si no, diario y aviso a salvamento.

**Minijuego** (16 preguntas reales de examen en estas clases):

- La descarga de aguas sucias que hayan estado almacenadas en los tanques de retención se realizará: *(and-2020-c1-t11)*
- Navegando a la altura del cabo Trafalgar, ¿podemos descargar al mar alimentos sin triturar ni desmenuzar?: *(and-2024-c1-t11)*
- ¿Quién será el responsable de las infracciones por contaminación del medio marino producidas desde una embarcación?: *(and-2025-c2-t12)*

**Relacionados:** 4.0, 4.1, 4.3.

#### 4.3 · Banderas y espacios protegidos

🔎 Profundiza · ⏳ pendiente · clases per-4-7, per-4-8

Dónde va la bandera de España y en qué condiciones se puede izar la autonómica, y qué son las ZEPIM y por qué no se fondea sobre posidonia. Preguntas de memoria pura en las que fallan los detalles: el tamaño, el sitio, el significado exacto de las siglas y qué zonas son ZEPIM y cuáles no.

**Gancho:** Andrés acaba de comprar una bandera de Andalucía tan grande como la de España y quiere ponerla en el asta de popa para ir a fondear a Cabo de Gata, «en esa mancha oscura que hay junto a la cala, que se ve el fondo».

**Para llevarse:**

- Todo buque español enarbola como único pabellón la bandera de España, y el asta de popa y el pico del palo mayor están reservados para ella.
- Cualquier otra bandera, incluida la autonómica, solo puede ir izada si lo está la de España y nunca puede superar un tercio de su área; la autonómica, en puertos nacionales y aguas interiores, en otro lugar (por ejemplo, una driza de las crucetas).
- El pabellón nacional se iza a la vista de un buque de guerra, al entrar y salir de puerto, en puerto de sol a sol los días festivos y cuando lo disponga la autoridad.
- ZEPIM significa Zona Especialmente Protegida de Importancia para el Mediterráneo, figura del Convenio de Barcelona; en ellas se puede regular el paso, la parada y el fondeo de buques.
- Las ZEPIM andaluzas son Isla de Alborán, Cabo de Gata-Níjar, Fondos marinos del Levante almeriense y Acantilados de Maro-Cerro Gordo; en Valencia, las Columbretes.
- La posidonia es una planta con flores, no un alga, endémica del Mediterráneo y de crecimiento muy lento.
- En el Mediterráneo español está prohibido, con carácter general, fondear sobre posidonia y que la cadena la toque al bornear, salvo fuerza mayor o peligro; sobre la pradera, solo boya autorizada.

**Trampas del examen:**

- Falso: la autonómica puede ser «del mismo tamaño» que la de España. Cierto: un tercio de su área como máximo.
- Falso: la autonómica puede ir en el asta de popa o en el pico «si la de España va en otro sitio», o izarse sola si la comunidad tiene competencias. Cierto: popa y pico son de la de España, y la autonómica nunca va sin ella.
- Falso: ZEPIM es zona «exclusiva» protegida o de importancia para el «medio marino». Cierto: «especialmente» protegida y para el «Mediterráneo».
- Falso: Tabarca, Ibiza y Formentera o la costa de Cádiz son ZEPIM. Cierto: Tabarca es reserva marina, pero no ZEPIM; Ibiza y Formentera no figuran, y Cádiz está fuera del Mediterráneo.
- Falso: «en las ZEPIM el paso y el fondeo no están reglamentados». Cierto: se pueden regular el paso, la parada y el fondeo.
- Falso: en un campo de boyas se puede fondear directamente sobre la posidonia. Cierto: se amarra a la boya precisamente para no fondear sobre la pradera.

**Minijuego** (8 preguntas reales de examen en estas clases):

- ¿Podemos llevar la bandera de la comunidad autónoma izada en nuestra embarcación? *(and-2021-c1-t11)*
- Las siglas ZEPIM significan: *(and-2021-c2-t11)*
- ¿Cuál de las siguientes es una Zona Especialmente Protegida de Importancia para el Mediterráneo (ZEPIM)?: *(and-2023-c1-t11)*

**Relacionados:** 4.0, 4.2, 2.2.

### Tema 5 · Balizamiento (eliminatorio)

#### 5.0 · El balizamiento sin líos

🧭 Panorama · ⏳ pendiente · clases per-5-1, per-5-2, per-5-3, per-5-4, per-5-5

El mapa del balizamiento IALA: laterales y bifurcaciones, cardinales, peligro aislado, aguas navegables, especiales y pecios, y cómo leer sus luces. Es un tema eliminatorio y muy agradecido: con pocas reglas se responde casi todo.

**Gancho:** Andrés vuelve a puerto al anochecer y ve delante una luz blanca que hace «tic-tic-tic» muy rápido, otra amarilla y, más lejos, una roja. Le pregunta a Elena por cuál de ellas tiene que preocuparse primero.

**En el examen:** Balizamiento da 5 de las 45 preguntas y es eliminatorio: con más de 2 fallos en este tema se suspende el examen aunque el resto esté perfecto.

**Recorre:** El sistema IALA: cómo se reconoce una marca · Marcas laterales y bifurcaciones · Marcas cardinales · Peligro aislado, aguas navegables, especiales y nuevos peligros · Leer la luz: ritmos y de la luz a la marca.

**Para llevarse:**

- Sistema IALA: España está en la región A (entrando, rojo a babor y verde a estribor) y solo las laterales cambian entre regiones; de noche, el color de la luz da la familia de la marca.
- Laterales: roja con cilindro y verde con cono; saliendo de puerto se invierten, y la banda del otro color con luz 2+1 marca una bifurcación (roja con banda verde, canal principal a estribor; verde con banda roja, a babor).
- Cardinales: negras y amarillas con dos conos; se pasan por el lado de su nombre, los conos apuntan al negro y la luz blanca centellea como un reloj (Norte continua, Este 3, Sur 6 más un largo, Oeste 9).
- Peligro aislado (dos esferas negras, luz blanca de dos destellos), aguas navegables (franjas verticales rojas y blancas, una esfera roja), especiales (todo amarillo, aspa en X) y pecio (azul y amarillo, cruz +).
- Leer la luz: destellos, luz menor que oscuridad; ocultaciones, mayor; isofase, igual; las luces «tranquilas» blancas son de aguas navegables y las «nerviosas» de cardinales.

**Minijuego** (90 preguntas reales de examen en estas clases):

- Al entrar en puerto ¿qué color tienen las marcas laterales de babor y estribor, respectivamente?: *(and-2025-c3-t13)*
- Una marca cuya marca de tope consiste en dos conos negros superpuestos con los vértices hacia arriba indica que se debe pasar al … de ella (completar con la opción que proceda). *(and-2024-c1-t16)*
- Una marca que emite una luz blanca cuyo ritmo consiste en un destello largo cada 10 segundos es una marca: *(and-2025-c1-t14)*

#### 5.1 · El sistema IALA, laterales y bifurcaciones

🔎 Profundiza · ⏳ pendiente · clases per-5-1, per-5-2

Cómo funciona el sistema IALA, qué cambia entre la región A y la B, y todo sobre las marcas laterales: color, forma, tope, luz, numeración y bifurcaciones. Es la parte del balizamiento con más preguntas, y casi todas giran sobre entrar o salir y sobre el color de fondo.

**Gancho:** Andrés sale de puerto por el canal y se pega a las boyas verdes por su estribor, «como siempre». Un pescador le hace gestos desde el muelle. Elena le explica qué ha hecho mal y por qué en un barco alquilado en Florida le habría pasado lo contrario.

**Para llevarse:**

- Las familias IALA son laterales, cardinales, peligro aislado, aguas navegables, especiales y nuevo peligro; los faros, luces de sector y enfilaciones son «otras marcas».
- España está en la región A: entrando, rojo a babor y verde a estribor; en la región B (América, Japón, Corea y Filipinas) es al revés, y solo cambian las laterales.
- El sentido convencional es el del barco que llega desde la mar: saliendo de puerto, las rojas se dejan por estribor y las verdes por babor.
- Lateral de babor: roja, tope un cilindro rojo, luz roja con cualquier ritmo menos el 2+1. Lateral de estribor: verde, tope un cono verde con el vértice arriba, luz verde con cualquier ritmo menos el 2+1.
- La numeración crece de la mar hacia tierra: rojas con números pares y verdes con impares.
- Bifurcación: roja con banda verde, cilindro rojo y luz roja Fl(2+1), canal principal a estribor; verde con banda roja, cono verde y luz verde Fl(2+1), canal principal a babor. Se dejan según su color de fondo.
- De noche, la luz roja o verde es lateral; blanca, cardinal, peligro aislado o aguas navegables; amarilla, especial; azul y amarilla alternadas, pecio.

**Trampas del examen:**

- Falso: «las verdes se dejan siempre por estribor» o «las rojas siempre por babor». Cierto: depende de si entras o sales; saliendo, todo se invierte.
- Falso: una opción con «verde a babor entrando». Cierto: eso es la región B; en España rige la A.
- Falso: una luz roja Fl(2+1) es una lateral de babor normal, o indica «canal principal a babor». Cierto: es bifurcación con el canal principal a estribor; la tratas como roja.
- Falso: el tope de la bifurcación es un cilindro sobre un cono, un cono rojo o un cilindro verde. Cierto: lleva el tope de su color de fondo; cono rojo, cilindro verde y topes combinados no existen en la región A.
- Falso: si de noche solo ves una luz amarilla, necesitas ver la forma para saber qué es. Cierto: una luz amarilla ya dice que es una marca especial.
- Falso: numeración de tierra hacia la mar o verdes pares. Cierto: de la mar hacia tierra, rojas pares y verdes impares.

**Minijuego** (32 preguntas reales de examen en estas clases):

- Si de noche divisamos una boya de la cual no distinguimos la forma, pero sí divisamos una luz de color amarillo se trata de: *(and-2021-c2-t13)*
- Saliendo de puerto debemos dejar por estribor las marcas laterales de color: *(and-2024-c3-t13)*
- En una bifurcación de canal, si vemos una marca lateral modificada con luz verde en grupos de dos más un destello GpD (2+1) ¿dónde se encuentra el canal principal?: *(and-2025-c3-t15)*

**Relacionados:** 5.0, 5.4, 5.3.

#### 5.2 · Las cardinales

🔎 Profundiza · ⏳ pendiente · clase per-5-3

Las cuatro cardinales: qué dicen, por dónde se pasan, cómo son sus colores y topes y qué ritmo tiene su luz. Son preguntas casi seguras si se entienden tres trucos: el lado del nombre, los conos apuntando al negro y el reloj.

**Gancho:** Navegando hacia una cala, Andrés ve una boya negra y amarilla con dos conos negros encima, apuntando hacia arriba, y pregunta si la roca está «por donde apuntan los conos». Elena le dice que es justo al contrario.

**Para llevarse:**

- Alrededor del peligro hay cuatro cuadrantes separados por las demoras NW, NE, SE y SW; la cardinal toma el nombre del cuadrante donde está.
- La cardinal se pasa por el lado de su nombre: allí están las aguas más profundas y seguras. Una Norte se pasa por su norte y el peligro queda al sur.
- También sirven para señalar un recodo, una confluencia, una bifurcación o el extremo de un bajo en un canal.
- Topes: Norte, dos conos con los vértices hacia arriba; Sur, hacia abajo; Este, unidos por las bases (rombo); Oeste, unidos por los vértices (reloj de arena).
- Colores: los conos apuntan al negro. Norte, negro arriba y amarillo abajo; Sur, amarillo arriba y negro abajo; Este, negra con banda amarilla; Oeste, amarilla con banda negra.
- Luz blanca centelleante: Norte continua; Este grupos de 3 (VQ cada 5 s o Q cada 10 s); Sur 6 más un destello largo (VQ cada 10 s o Q cada 15 s); Oeste 9 (VQ cada 10 s o Q cada 15 s).

**Trampas del examen:**

- Falso: los conos apuntan al peligro. Cierto: en la Norte y la Sur apuntan al lado seguro, y en las cuatro apuntan a la parte negra.
- Falso: una cardinal Sur indica que hay un peligro al sur, o aguas menos profundas al sur. Cierto: las aguas más profundas están al sur de ella.
- Falso: sin distinguir el color no se puede saber qué marca es. Cierto: dos conos superpuestos solo los llevan las cardinales; dos conos hacia arriba es la Norte seguro, y un solo cono sería una lateral de estribor.
- Falso: la Este es amarilla con banda negra. Cierto: esa es la Oeste; la Este es negra con banda amarilla (conos por las bases, negro arriba y abajo).
- Falso: la cardinal Este da grupos de 3 destellos u ocultaciones. Cierto: son centelleos, y el destello largo solo lo lleva la Sur, detrás de sus seis centelleos.

**Minijuego** (19 preguntas reales de examen en estas clases):

- Una marca cardinal Sur indica: *(and-2022-c3-t17)*
- Para indicar que hay que pasar al oeste de un peligro, se utilizará una marca de color: *(and-2023-c2-t16)*
- ¿Qué características de luz tiene una marca cardinal ESTE?: *(and-2025-c3-t14)*

**Relacionados:** 5.0, 5.4, 5.1.

#### 5.3 · Peligro aislado, aguas navegables, especiales y nuevos peligros

🔎 Profundiza · ⏳ pendiente · clase per-5-4

Las marcas que no son laterales ni cardinales: peligro aislado, aguas navegables, especiales y la boya de pecio o nuevo peligro. El examen las mezcla por parejas que se parecen: una esfera roja frente a dos negras, el aspa frente a la cruz.

**Gancho:** Entrando en una ría, Andrés ve una boya esférica a rayas verticales rojas y blancas justo en medio del canal y la quiere esquivar «por si hay una piedra». Más adelante aparece otra negra con bandas rojas y dos bolas encima.

**Para llevarse:**

- Peligro aislado: sobre un peligro pequeño rodeado de aguas navegables; negra con bandas anchas horizontales rojas, tope dos esferas negras y luz blanca de grupos de dos destellos. Se pasa por cualquier lado, dándole resguardo.
- Aguas navegables: agua navegable alrededor; marca el eje o la entrada de un canal, la aproximación a puerto, la recalada y el mejor paso bajo un puente.
- Aguas navegables es a franjas verticales rojas y blancas, esférica o con tope una esfera roja, y luz blanca isofase, de ocultaciones, un destello largo cada 10 s o Morse «A».
- Especiales: zonas que explica la carta (baño, cables o tuberías, ejercicios militares, vertederos); todo amarillo, tope un aspa en X y luz amarilla.
- Nuevo peligro: obstáculo que aún no figura en las cartas; se baliza con laterales, cardinales, peligro aislado o la boya de emergencia, y se duplica una marca si el riesgo es grave.
- Boya de pecio: franjas verticales azules y amarillas, tope una cruz amarilla vertical (+) y luz que alterna destellos azules y amarillos.

**Trampas del examen:**

- Falso: dos esferas negras señalan «un peligro que no figura en las cartas». Cierto: señalan un peligro de dimensiones reducidas con agua navegable alrededor; lo de las cartas es el nuevo peligro.
- Falso: el tope de aguas navegables son dos esferas rojas o una esfera a franjas. Cierto: una sola esfera roja; dos esferas negras son de peligro aislado.
- Falso: el tope de las especiales es una cruz vertical. Cierto: es un aspa en X; la cruz + es de la boya de pecio.
- Falso: el centro del canal se marca con laterales o con peligro aislado. Cierto: con la marca de aguas navegables.
- Falso: aguas navegables lleva franjas horizontales. Cierto: verticales rojas y blancas; las bandas horizontales rojas son del peligro aislado, sobre fondo negro.

**Minijuego** (26 preguntas reales de examen en estas clases):

- Una marca que tiene como marca de tope dos esferas negras superpuestas: *(and-2023-c2-t14)*
- ¿Cuál de las siguientes marcas se utiliza para indicar el centro de un canal?: *(and-2022-c2-t13)*
- Las marcas que indican zonas o configuraciones especiales, cuya naturaleza se visualiza al consultar la carta u otra publicación náutica, si tienen marca de tope será: *(and-2023-c1-t15)*

**Relacionados:** 5.0, 5.2, 5.4.

#### 5.4 · Leer la luz: ritmos y de la luz a la marca

🔎 Profundiza · ⏳ pendiente · clase per-5-5

Cómo se lee la característica de una luz (ritmo, color y periodo) y cómo pasar de la luz a la marca de noche. Son preguntas que se resuelven contando segundos y destellos, y en las que el periodo casi nunca importa.

**Gancho:** Fondeado de noche, Andrés cronometra una luz blanca en la bocana: tres segundos encendida y uno apagada, una y otra vez. Está convencido de que es una de «destellos». Elena le hace contar otra vez.

**Para llevarse:**

- La característica de una luz es ritmo, color y periodo; si no se indica color, la luz es blanca, y el periodo es lo que tarda la secuencia completa en repetirse.
- Destellos (Fl): la luz dura menos que la oscuridad. Ocultaciones (Oc): dura más. Isofase (Iso): igual. Destello largo (LFl): 2 s o más.
- Centelleante (Q): 60 o 50 por minuto; centelleante rápida (VQ): 120 o 100 por minuto. Los centelleos blancos son de las cardinales.
- Blanca con grupos de 2 destellos: peligro aislado. Blanca isofase, de ocultaciones, un destello largo cada 10 s o Morse «A»: aguas navegables.
- Blanca centelleo continuo: cardinal Norte; grupos de 3, 6 más largo y 9: Este, Sur y Oeste.
- Roja o verde Fl(2+1): bifurcación; roja o verde con otro ritmo: lateral; amarilla: especial; azul y amarilla alternadas: pecio.

**Trampas del examen:**

- Falso: tres segundos de luz y uno de oscuridad son destellos. Cierto: más luz que oscuridad son ocultaciones, y en blanco es aguas navegables.
- Falso: el periodo cambia la marca. Cierto: dos destellos blancos son peligro aislado tengan el periodo que tengan.
- Falso: un destello largo cada 10 s es la cardinal Sur. Cierto: el destello largo aislado es de aguas navegables; en la Sur va detrás de seis centelleos.
- Falso: «ninguna marca IALA da luz de ocultaciones, solo los faros» o «no existe marca con Morse A». Cierto: las dos son luces de aguas navegables.
- Falso: la «luz centelleante» del RIPA es la misma que la del balizamiento. Cierto: en el RIPA es de 120 o más destellos por minuto; en balizamiento se distingue centelleante (60 o 50) de centelleante rápida (120 o 100).

**Minijuego** (13 preguntas reales de examen en estas clases):

- Una boya emite una luz blanca con un período de cuatro segundos, de forma que está tres segundos encendida y un segundo apagada. Se trata de una marca: *(and-2022-c1-t16)*
- Una marca cuya luz es un grupo de dos destellos blancos cada quince segundos es una: *(and-2020-c1-t13)*
- Avistamos una luz blanca centelleante rápida de grupos de 6 centelleos más un destello largo cada 10 segundos. ¿A qué marca cardinal corresponde? *(and-2024-c3-t16)*

**Relacionados:** 5.0, 5.2, 5.3, 6.6.

### Tema 6 · Reglamento de abordajes (eliminatorio)

#### 6.0 · El RIPA de un vistazo

🧭 Panorama · ⏳ pendiente · clases per-6-1, per-6-2, per-6-3, per-6-4, per-6-5, per-6-6, per-6-7, per-6-8, per-6-9, per-6-10

El Reglamento Internacional para Prevenir los Abordajes de un vistazo: definiciones, conducta con cualquier visibilidad, buques a la vista, niebla, luces y marcas y señales. Es el tema que más preguntas da y es eliminatorio.

**Gancho:** Andrés dice que con saber «que la vela tiene preferencia» ya tiene medio RIPA. Elena le pone tres casos: un velero que alcanza a una lancha, un velero en la niebla y un velero dentro de un canal angosto. En los tres, la frase le falla.

**En el examen:** El Reglamento (RIPA) da 10 de las 45 preguntas, el bloque más grande del examen, y es eliminatorio: con más de 5 fallos en este tema se suspende.

**Recorre:** El reglamento y sus definiciones · Vigilancia, velocidad de seguridad, riesgo de abordaje y maniobra · Canales angostos y dispositivos de separación del tráfico · Alcance, vuelta encontrada y cruce · Veleros y jerarquía entre buques · Visibilidad reducida · Luces y marcas (I): sectores, buques de motor, vela y remolque · Luces y marcas (II): pesca, buques especiales, práctico, fondeados y varados · Señales acústicas y luminosas · Llamar la atención y señales de peligro.

**Para llevarse:**

- Definiciones: un velero con el motor en marcha es buque de propulsión mecánica; pesca es con un arte que restringe la maniobra; sin gobierno es por avería y maniobra restringida, por su trabajo; la noche no es visibilidad reducida.
- Vigilancia y riesgo: vigilancia visual, auditiva y con todos los medios; si la demora no varía de forma apreciable hay riesgo, y ante la duda se considera que existe. La maniobra, pronta, amplia y clara.
- Canales y DST: en el canal angosto, pegado al límite de estribor; en un DST, se cruza en perpendicular y se entra por un lateral con el menor ángulo; ir por la vía no da preferencia.
- Alcance, vuelta encontrada y cruce: alcanza quien llega desde más de 112,5° (22,5° a popa del través) y se aparta siempre; de vuelta encontrada, los dos de motor caen a estribor; en cruce, cede el que tiene al otro por estribor.
- Veleros y jerarquía: entre veleros manda el viento (cede el amurado a babor o el de barlovento); el de motor se aparta de vela, pesca, maniobra restringida y sin gobierno.
- Visibilidad reducida: sin verse no hay «sigue a rumbo»; con eco por la proa no se cae a babor y, si se oye una señal de niebla a proa del través, se reduce a la mínima de gobierno.
- Luces de motor, vela y remolque: tope 225°, costados 112,5°, alcance 135°; el velero nunca lleva luz de tope y la de remolque es amarilla.
- Luces de pesca, especiales y fondeados: arrastre verde sobre blanca, otra pesca roja sobre blanca; sin gobierno dos rojas o dos bolas; maniobra restringida roja-blanca-roja; fondeado una bola.
- Señales acústicas: corta de 1 s y larga de 4 a 6 s; a la vista, 1 corta estribor, 2 babor, 3 atrás y 5 o más duda; en niebla, 1 larga el de motor con arrancada y 2 largas el parado.
- Señales de peligro (anexo IV): solo significan peligro y necesidad de ayuda; entre ellas, sonido continuo, estrellas rojas, MAYDAY, humo naranja y subir y bajar los brazos.

**Minijuego** (180 preguntas reales de examen en estas clases):

- Una embarcación de recreo está pescando con caña, manteniéndose a la deriva con la máquina desembragada. Se trata de: *(and-2025-c1-t22)*
- En una situación de alcance en mar abierto con buques que están a la vista el uno del otro, ¿cuándo el buque que alcanza deberá mantenerse apartado de la derrota del buque alcanzado?: *(and-2025-c1-t18)*
- Un buque en nuestras proximidades hace sonar su pito de forma continua. Está indicando que: *(and-2025-c1-t27)*

#### 6.1 · Definiciones, vigilancia y riesgo de abordaje

🔎 Profundiza · ⏳ pendiente · clases per-6-1, per-6-2

Dónde se aplica el RIPA, la regla de la responsabilidad y las definiciones que deciden quién es quién (vela, motor, pesca, sin gobierno, maniobra restringida, calado), y después la vigilancia, la velocidad de seguridad, el riesgo de abordaje y cómo maniobrar. Casi todo lo demás del reglamento se apoya en estas palabras.

**Gancho:** Andrés está a la deriva pescando con caña, con el motor parado, y por la proa le viene un mercante cuya demora no cambia. Está tranquilo: «yo estoy pescando, se aparta él». Elena le explica que para el RIPA no está pescando.

**Para llevarse:**

- El RIPA se aplica a todos los buques en alta mar y en las aguas comunicadas con ella; ningún buque, tampoco los de guerra, está exento de las reglas de rumbo y gobierno.
- Regla 2: cumplir el reglamento no exime de la práctica marinera, y hay que apartarse de él si hace falta para evitar un peligro inmediato.
- Buque de vela es el que navega a vela sin usar el motor; con el motor en marcha es de propulsión mecánica y de día lo indica con un cono con el vértice hacia abajo.
- Dedicado a la pesca es el que usa artes que restringen su maniobra; sin gobierno, el que no maniobra por una circunstancia excepcional; maniobra restringida, el que no puede apartarse por la naturaleza de su trabajo (hidrografía, dragado, aeronaves, cables).
- En navegación es no estar fondeado, ni amarrado, ni varado; a la vista es solo con los ojos; visibilidad reducida es niebla, bruma, nieve, aguaceros o tormentas de arena, no la noche.
- La velocidad de seguridad permite maniobrar con eficacia y parar a tiempo; entre sus factores están la visibilidad, el tráfico, el resplandor de tierra de noche y el calado frente a la profundidad.
- Si la demora no varía de forma apreciable hay riesgo; con un buque grande, un remolque o muy cerca puede haberlo aunque varíe. La maniobra, clara, con antelación y amplia, sin pequeños cambios sucesivos.

**Trampas del examen:**

- Falso: «un velero con velas y motor sigue siendo buque de vela», o «es un motovelero». Cierto: para el RIPA es buque de propulsión mecánica, sea cual sea su eslora.
- Falso: pescar con caña o al curricán te hace «buque dedicado a la pesca», o el pesquero que vuelve a puerto lo es. Cierto: solo si el arte restringe la maniobra; si no, eres un buque en navegación (o de propulsión mecánica).
- Falso: el buque con capacidad de maniobra restringida es el que tiene una avería. Cierto: ese es el sin gobierno; el restringido lo es por su trabajo, y el arrastrero es otra categoría.
- Falso: la eslora, la obra muerta o el tipo de propulsión son factores de la velocidad de seguridad. Cierto: lo es, por ejemplo, el calado en relación con la profundidad disponible.
- Falso: «si la demora no varía, no hay riesgo» o «con un buque grande no hay riesgo». Cierto: demora constante es riesgo, y con un buque grande o un remolque puede haberlo aunque cambie.
- Falso: es aconsejable una sucesión de pequeños cambios de rumbo. Cierto: un cambio amplio que el otro aprecie a simple vista o en el radar.

**Minijuego** (27 preguntas reales de examen en estas clases):

- Un yate de 20 metros de eslora está navegando a vela, propulsándose al mismo tiempo con la máquina. En el contexto del Reglamento de Abordajes, tiene la condición de: *(and-2022-c2-t25)*
- Para determinar la velocidad de seguridad, en todos los buques, se tendrá en cuenta entre otros factores: *(and-2021-c1-t18)*
- Si la demora de un buque que se aproxima no varía en forma apreciable: *(and-2022-c2-t18)*

**Relacionados:** 6.0, 6.3, 6.5.

#### 6.2 · Canales angostos y dispositivos de separación del tráfico

🔎 Profundiza · ⏳ pendiente · clase per-6-3

Cómo se navega por un canal angosto y por un dispositivo de separación del tráfico: por dónde ir, a quién no estorbar, cómo cruzar, cómo incorporarse y qué señales se dan para adelantar y en los recodos. Las preguntas cambian «perpendicular» por «menor ángulo» y dan preferencias que no existen.

**Gancho:** Andrés cruza el dispositivo del Estrecho camino de Tánger y quiere hacerlo «en diagonal, para ir ganando camino». Luego, ya en la vía, un mercante que cruza le aparece por estribor y Andrés cree que la preferencia es suya.

**Para llevarse:**

- En un canal angosto se navega lo más cerca posible del límite exterior que quede por estribor, si no es peligroso.
- Los buques de menos de 20 m y los de vela no estorban al que solo puede navegar con seguridad dentro del canal; los pesqueros no estorban a ningún buque que navegue por el canal.
- Se puede cruzar el canal si no se estorba al que solo cabe en él; se evita fondear en el canal; en un recodo ciego se da una pitada larga y quien la oye contesta con otra larga.
- Para adelantar en un canal: 2 largas y 1 corta, por su estribor; 2 largas y 2 cortas, por su babor; el alcanzado conforme contesta larga-corta-larga-corta.
- En un DST se va por la vía en el sentido del tráfico; se entra o sale por un límite lateral con el menor ángulo posible, y si hay que cruzar, lo más perpendicular posible.
- En la zona de separación solo se entra para cruzar, en emergencia o para pescar; la zona costera la pueden usar los menores de 20 m, los veleros, los pesqueros, quien va o viene de un lugar dentro de ella o para evitar un peligro inmediato.
- Ir por la vía no da preferencia: con riesgo de abordaje rigen las reglas de siempre, y entre buques de motor que se cruzan cede el que tiene al otro por estribor.

**Trampas del examen:**

- Falso: en un canal se navega por el centro o por la parte más profunda. Cierto: pegado al límite de estribor.
- Falso: el velero no debe estorbar al pesquero en el canal. Cierto: es el pesquero el que no estorba a nadie.
- Falso: en un canal angosto está prohibido adelantar, fondear o cruzar, hay que ir a menos de 3 nudos o con luces de día. Cierto: adelantar y cruzar están permitidos sin estorbar, fondear se evita, y el RIPA no fija velocidad ni luces de día.
- Falso: el DST se cruza con el menor ángulo posible o a la máxima velocidad. Cierto: se cruza en perpendicular; el menor ángulo es para incorporarse por un lateral.
- Falso: «voy por la vía, soy el que sigue a rumbo». Cierto: no hay preferencia por ir en la vía; si el otro buque de motor está por tu estribor, cedes tú.
- Falso: los menores de 20 m no pueden ir por la vía y deben ir por la zona costera. Cierto: pueden usar tanto la vía como la zona costera.

**Minijuego** (24 preguntas reales de examen en estas clases):

- Navegando en un canal angosto nos aproximamos a un recodo que tiene la visión obstaculizada y no permite ver otros buques. ¿Qué señal fónica debemos hacer sonar? *(and-2025-c1-t21)*
- ¿Cómo se debe cruzar un dispositivo de separación del tráfico?: *(and-2025-c1-t20)*
- Un buque se dirige a puerto por un canal angosto. Debido a sus dimensiones, solo puede navegar con seguridad dentro de dicho canal. ¿Qué buques no estorbarán su tránsito? *(and-2020-c3-t23)*

**Relacionados:** 6.1, 6.3, 6.8.

#### 6.3 · Alcance, vuelta encontrada y cruce

🔎 Profundiza · ⏳ pendiente · clase per-6-4

Las tres situaciones entre buques que se ven: alcance, vuelta encontrada y cruce, y qué hacen el que cede el paso y el que sigue a rumbo. Son preguntas de marcaciones y de luces que se resuelven con una cifra, 112,5°, y una regla: el que tiene al otro por estribor, cede.

**Gancho:** De noche, a motor, Andrés ve por su amura de estribor una luz blanca y una roja que no se mueven de sitio. Como el otro barco es un mercante enorme, da por hecho que el que sigue a rumbo es el grande.

**Para llevarse:**

- Las Reglas 11 a 18 solo se aplican a buques que se ven a simple vista; cualquier situación que no sea alcance ni vuelta encontrada es cruce.
- Alcanza el que llega desde más de 22,5° a popa del través del otro (más de 112,5° de su proa); de noche solo le vería la luz de alcance. El que alcanza se aparta siempre y, si duda, se considera que alcanza.
- Quien alcanza sigue obligado hasta quedar pasado y en franquía, aunque luego cambie la marcación.
- Vuelta encontrada, solo entre buques de motor a rumbos opuestos o casi: los dos caen a estribor y se pasan babor con babor; de noche se ven las dos luces de costado. En caso de duda, se supone que lo es.
- Cruce entre buques de motor: cede el que tiene al otro por estribor, que de noche le ve la luz roja; no importa el tamaño.
- El que cede el paso maniobra pronto y decidido; el que sigue a rumbo mantiene rumbo y velocidad, puede maniobrar cuando es evidente que el otro no actúa y debe hacerlo si el abordaje ya no se evita solo con la maniobra del otro.

**Trampas del examen:**

- Falso: alcanza el que va más rápido. Cierto: lo decide la marcación, más de 112,5°; a 110° o 107° es cruce, a 115° o 130° es alcance.
- Falso: el que sigue a rumbo es el de mayor tonelaje o menor maniobrabilidad. Cierto: lo decide la situación; un mercante y una lancha a motor siguen la regla del estribor.
- Falso: el que sigue a rumbo no puede maniobrar nunca, o es aconsejable que lo haga en cualquier momento. Cierto: puede cuando el otro no actúa como debe, y debe cuando el abordaje ya no se evita solo con la maniobra del otro.
- Falso: de vuelta encontrada caen los dos a babor, o maniobra el primero que lo vea, o se coordina por VHF. Cierto: los dos caen a estribor.
- Falso: si veo su luz roja por mi estribor, soy el que sigue a rumbo. Cierto: lo tengo por estribor, así que cedo yo.

**Minijuego** (26 preguntas reales de examen en estas clases):

- Avistamos un buque en marcación 110º Br, que se aproxima al nuestro sin que la marcación varíe de forma apreciable. Nos encontramos en una situación de: *(and-2023-c2-t21)*
- Un buque mercante y una embarcación de recreo, ambos de propulsión mecánica y a la vista, se cruzan en mar abierto con riesgo de abordaje. ¿Cuál debe mantenerse apartado de la derrota del otro? *(and-2023-c2-t24)*
- Dos buques de propulsión mecánica a la vista se aproximan con riesgo de abordaje navegando a rumbos opuestos, de forma tal que cada uno ve al otro justo por su proa. En este caso: *(and-2023-c3-t24)*

**Relacionados:** 6.1, 6.4, 6.6.

#### 6.4 · Veleros y la jerarquía entre buques

🔎 Profundiza · ⏳ pendiente · clase per-6-5

Cómo se resuelven los encuentros entre dos veleros, la escalera de quién se aparta de quién (Regla 18) y cómo reconocer un velero de noche. Es la parte del RIPA que más afecta a Andrés y la que más trampas tiene con el alcance y el viento.

**Gancho:** Andrés, a vela con viento por estribor, va alcanzando a una lancha de pesca deportiva que navega a motor más despacio que él. Se le echa encima convencido de que «la vela manda». Elena lo para en seco.

**Para llevarse:**

- Entre dos veleros manda el viento, no la banda por la que se ven: con viento por bandas contrarias se aparta el que lo recibe por babor; con viento por la misma banda, el de barlovento.
- Si vas amurado a babor y ves un velero a barlovento sin saber por qué banda recibe el viento, te apartas tú; los veleros no aplican la vuelta encontrada.
- Regla 18, salvo alcances, canales y DST: el de motor se aparta de sin gobierno, maniobra restringida, pesca y vela; el velero, de sin gobierno, maniobra restringida y pesca; el pesquero, en lo posible, de sin gobierno y maniobra restringida.
- Todos, salvo el sin gobierno y el de maniobra restringida, evitan estorbar al restringido por su calado que muestre sus señales.
- Motor frente a velero o pesquero faenando: se aparta el de motor también de vuelta encontrada, porque las Reglas 14 y 15 son solo entre buques de motor.
- El que alcanza se aparta siempre: si un velero alcanza a un buque de motor, se aparta el velero.
- Un velero navegando a vela nunca lleva luz de tope: costados sin luz blanca a proa, o roja sobre verde en el tope, es un velero; yendo a motor, te apartas.

**Trampas del examen:**

- Falso: entre veleros se aparta el que ve al otro por estribor. Cierto: decide el viento (amura de babor o barlovento).
- Falso: con la misma amura se aparta el de sotavento, o si los dos reciben el viento por babor decide el babor. Cierto: se aparta el de barlovento.
- Falso: «un velero que alcanza sigue mirando el viento» o «la vela siempre tiene preferencia sobre el motor». Cierto: el que alcanza se aparta siempre, sea velero o no.
- Falso: motor y velero de vuelta encontrada caen los dos a estribor. Cierto: se aparta el de motor.
- Falso: una sola luz verde por mi babor sin luz de tope es un buque de motor y yo sigo a rumbo. Cierto: sin luz de tope es un velero (o un remolcado), y a motor me aparto.
- Falso: el velero se aparta del buque de propulsión mecánica. Cierto: es al revés, salvo cuando el velero alcanza.

**Minijuego** (33 preguntas reales de examen en estas clases):

- Dos buques de vela se encuentran en una situación de cruce con riesgo de abordaje. Si ambos buques están a la vista y reciben el viento por la misma banda, ¿cuál debe mantenerse apartado de la derrota del otro? *(and-2020-c3-t19)*
- En mar abierto un buque de propulsión mecánica ve a un buque de vela que se le aproxima desde una marcación 25º a popa de su través de estribor. En esta situación: *(and-2026-c2-t22)*
- Navegando a motor de noche observamos por nuestra amura de babor una luz verde; no vemos ninguna otra luz y la luz verde se aproxima, manteniendo constante su demora. En este caso: *(and-2020-c1-t26)*

**Relacionados:** 6.3, 6.6, 6.7.

#### 6.5 · Visibilidad reducida

🔎 Profundiza · ⏳ pendiente · clase per-6-6

Qué cambia cuando los buques no se ven: qué reglas siguen valiendo, hacia dónde no caer si solo detectas al otro por radar y qué hacer al oír una señal de niebla por la proa. Las trampas resucitan reglas que solo valen a la vista, como el «sigue a rumbo» o la preferencia del velero.

**Gancho:** Andrés cruza una mancha de niebla a vela, con el radar nuevo encendido, y ve un eco que se acerca por su través de estribor con la demora fija. Se queda tranquilo: «soy velero, se aparta él».

**Para llevarse:**

- La Regla 19 se aplica a buques que no se ven en visibilidad reducida o cerca de ella; rigen las Reglas 4 a 10 y la 19, pero no la sección II: no hay alcance, vuelta encontrada, cruce, «sigue a rumbo» ni jerarquía.
- Cada buque evalúa el riesgo y maniobra con antelación, a velocidad de seguridad, con las máquinas listas para maniobrar si es de motor, las luces encendidas también de día y las señales acústicas de la Regla 35.
- Con el eco a proa del través, por cualquier banda, se evita caer a babor (salvo que lo estés alcanzando).
- Con el eco por el través o a popa del través, se evita caer hacia él: por estribor, no caer a estribor; por babor, no caer a babor.
- Si se oye, al parecer a proa del través, la señal de niebla de otro buque, se reduce a la mínima de gobierno y, si es necesario, se suprime toda la arrancada, navegando con extrema precaución.

**Trampas del examen:**

- Falso: «somos el buque que sigue a rumbo», «al ser velero sigo a rumbo» o «me está alcanzando y debe apartarse él». Cierto: sin verse esas reglas no existen; cada uno maniobra.
- Falso: con un eco a proa por babor hay que evitar caer a estribor. Cierto: a proa del través, por cualquier banda, se evita caer a babor.
- Falso: con un eco a popa del través por estribor, evitar caer a babor. Cierto: se evita caer hacia él, es decir, a estribor.
- Falso: al oír una señal de niebla por la amura, caer a estribor con decisión o dar cinco cortas. Cierto: mínima de gobierno y, si hace falta, parar; las cinco cortas son de duda entre buques que se ven.
- Falso: de día en niebla no hace falta encender luces, o la señal de niebla solo se da al oír a otro. Cierto: luces siempre y señales de la Regla 35 siempre.
- Falso: en visibilidad reducida todos reducen a la mínima de gobierno o el velero debe arrancar el motor. Cierto: velocidad de seguridad y, los de motor, máquinas listas.

**Minijuego** (15 preguntas reales de examen en estas clases):

- Navegando en condiciones de visibilidad reducida detectamos en el radar un buque que no está a la vista, que se mantiene en marcación 50º Babor, aproximándose con riesgo de abordaje. En estas circunstancias: *(and-2022-c3-t25)*
- Visibilidad reducida. Salvo en los casos en que hayamos comprobado que no existe riesgo de abordaje, ¿qué debemos hacer si oímos, más o menos por la amura de babor, la señal de niebla de otro buque? *(and-2025-c2-t27)*
- En condiciones de visibilidad reducida, un buque de vela detecta únicamente por medio del radar la presencia de otro buque, que se aproxima por su través de estribor sin que la demora varíe de forma apreciable. En este caso: *(and-2022-c1-t24)*

**Relacionados:** 6.1, 6.3, 6.8.

#### 6.6 · Luces y marcas (I): motor, vela y remolque

🔎 Profundiza · ⏳ pendiente · clase per-6-7

Cuándo se encienden las luces y cuándo se llevan las marcas, los sectores de cada luz y qué lleva un buque de motor según su eslora y velocidad, un velero, uno que va a vela y motor, una embarcación de remo y un remolque. Es un tema de cifras exactas (225°, 112,5°, 135°, 7 m, 12 m, 50 m, 200 m).

**Gancho:** Andrés vuelve al atardecer con las velas izadas y el motor en marcha porque se le ha echado la noche encima, y enciende el farol tricolor del tope «porque es lo que lleva un velero». Elena le dice que acaba de anunciarse como lo que no es.

**Para llevarse:**

- Las luces se llevan de la puesta a la salida del sol y también de día con visibilidad reducida; las marcas, de día. En niebla, luces siempre.
- Sectores: tope blanca 225° hacia proa; costados verde a estribor y roja a babor, 112,5° cada una hasta 22,5° a popa del través; alcance blanca 135° hacia popa; remolque amarilla, 135° y encima de la de alcance.
- Buque de motor: tope, costados y alcance; la segunda luz de tope, a popa y más alta, es obligatoria desde 50 m.
- Motor de menos de 12 m: puede llevar una blanca todo horizonte y costados; de menos de 7 m y que no pase de 7 nudos, basta una blanca todo horizonte.
- Velero a vela: costados y alcance, nunca tope; con menos de 20 m puede ir todo en un tricolor; opcional roja sobre verde en el tope, pero no junto al tricolor. Menos de 7 m o remo: si no, una linterna blanca a mano.
- Vela y motor a la vez es buque de motor: de día un cono con el vértice abajo a proa y de noche las luces de motor, nunca el tricolor.
- Remolcador: dos luces de tope en vertical (tres si el remolque pasa de 200 m) y la amarilla de remolque sobre la de alcance; con más de 200 m, marca bicónica de día.

**Trampas del examen:**

- Falso: la luz de alcance es amarilla, va a proa o se llama «de popa». Cierto: es blanca, va a popa, se ve en 135° y se llama de alcance; la amarilla es la de remolque.
- Falso: los costados se ven de la proa al través. Cierto: 112,5° cada uno, hasta 22,5° a popa del través.
- Falso: una lancha de 6,5 m a 10 nudos puede llevar solo la blanca todo horizonte. Cierto: hacen falta las dos condiciones (menos de 7 m y no pasar de 7 nudos); si no, blanca todo horizonte y costados.
- Falso: un velero de 10 o 15 m a vela y motor lleva costados y alcance, o el tricolor. Cierto: es buque de motor y lleva tope, costados y alcance (o, con menos de 12 m, blanca todo horizonte y costados).
- Falso: todos los buques de más de 50 m llevan dos luces de tope. Cierto: es para los de propulsión mecánica.
- Falso: en niebla, de día no hace falta encender luces. Cierto: se encienden siempre.

**Minijuego** (20 preguntas reales de examen en estas clases):

- ¿Qué sector de visibilidad tiene la luz de alcance? *(and-2023-c2-t27)*
- ¿Cuál de las siguientes configuraciones de luces puede exhibir de noche un buque de propulsión mecánica de 6,5 metros de eslora que navega a una velocidad de 10 nudos?: *(and-2025-c2-t25)*
- Un buque de 15 metros de eslora está navegando a vela y también se está propulsando con el motor. ¿Cuál de las luces siguientes debe exhibir?: *(and-2023-c3-t21)*

**Relacionados:** 6.4, 6.7, 6.1.

#### 6.7 · Luces y marcas (II): pesca, buques especiales, fondeados y varados

🔎 Profundiza · ⏳ pendiente · clase per-6-8

Las luces y marcas de pesqueros, buques sin gobierno, con maniobra restringida (buceo incluido), restringidos por su calado, prácticos, fondeados y varados. Se aprende con parejas de colores y con bolas, conos y cilindros que el examen cambia de dueño.

**Gancho:** De noche, saliendo de puerto, Andrés ve dos luces en vertical, roja arriba y blanca abajo, y piensa que es el práctico. A la mañana siguiente, fondeado en la cala, se pregunta si de verdad tiene que izar esa bola negra que lleva en el pañol.

**Para llevarse:**

- Pesqueros faenando, de día: dos conos unidos por los vértices. De noche, arrastre: verde sobre blanca; otra pesca: roja sobre blanca, y con aparejo de más de 150 m una blanca (o de día un cono con el vértice arriba) hacia el aparejo. Con arrancada, además costados y alcance.
- Sin gobierno: dos rojas todo horizonte en vertical o dos bolas; con arrancada, costados y alcance, nunca tope.
- Maniobra restringida: roja-blanca-roja o bola-bicónica-bola; el buceo pequeño lleva roja-blanca-roja y una réplica rígida de la bandera «A» de al menos 1 m, aunque mida menos de 12 m.
- Restringido por su calado: puede llevar tres rojas en vertical o un cilindro. Práctico en servicio: blanca sobre roja.
- Fondeado: blanca a proa y otra más baja a popa, y de día una bola; con menos de 50 m basta una blanca; con 100 m o más, cubiertas iluminadas; con menos de 7 m y fuera de canales y fondeaderos, no está obligado.
- Varado: luces de fondeado más dos rojas en vertical; de día, tres bolas.

**Trampas del examen:**

- Falso: roja sobre blanca es el práctico. Cierto: blanco sobre rojo es práctico; rojo sobre blanco, pesca que no es de arrastre.
- Falso: la marca bicónica es de pesca. Cierto: la pesca lleva dos conos unidos por los vértices; la bicónica (por las bases) es del remolque largo y del centro del de maniobra restringida.
- Falso: dos bolas son un buque fondeado o restringido por su calado. Cierto: una bola es fondeado, dos sin gobierno, tres varado; el calado lleva un cilindro.
- Falso: una embarcación de recreo fondeada no tiene que llevar bola, o solo si es de motor. Cierto: con 7 m o más, la bola es obligatoria también para un velero o un yate.
- Falso: la embarcación de buceo de menos de 7 m va solo con una linterna. Cierto: los menores de 12 m están exentos de la Regla 27 salvo los de buceo, que llevan roja-blanca-roja.
- Falso: un fondeado de 150 m lleva una sola blanca, o la de popa más alta. Cierto: blanca a proa, otra más baja a popa y luces de trabajo en cubierta.

**Minijuego** (18 preguntas reales de examen en estas clases):

- Si de noche divisamos una embarcación con dos luces en el mismo vertical roja la superior y blanca la inferior se trata de: *(and-2021-c2-t25)*
- Si de día divisamos una embarcación con 2 esferas negras superpuestas. *(and-2021-c2-t23)*
- ¿Cuál de las marcas siguientes identifica a un buque dedicado a la pesca que no sea de arrastre? *(and-2024-c3-t22)*

**Relacionados:** 6.6, 6.1, 4.1.

#### 6.8 · Señales acústicas, luminosas y de peligro

🔎 Profundiza · ⏳ pendiente · clases per-6-9, per-6-10

Las pitadas y el equipo acústico según la eslora, las señales de maniobra y de duda entre buques que se ven, las señales de niebla, cómo llamar la atención y las señales de peligro del anexo IV. Son preguntas de contar pitadas en las que se confunden las de maniobra, las de niebla y las de socorro.

**Gancho:** Andrés oye en la niebla dos pitadas largas cada poco y cree que alguien quiere adelantarle. Ya en puerto, otro barco le da tres cortas mientras maniobra y, al rato, un bote lanza un humo naranja que él toma por una fiesta.

**Para llevarse:**

- Una pitada corta dura alrededor de 1 segundo y una larga, de 4 a 6 segundos.
- Equipo: con 12 m o más, pito; con 20 m o más, además campana; con 100 m o más, además gong; con menos de 12 m, cualquier otro medio de hacer señales acústicas eficaces.
- Buque de motor a la vista: 1 corta, caigo a estribor; 2 cortas, a babor; 3 cortas, doy atrás; 5 o más cortas y rápidas, duda sobre la maniobra del otro.
- En niebla, cada 2 minutos como máximo: motor con arrancada, 1 larga; motor parado sin arrancada, 2 largas; vela, pesca, sin gobierno, restringidos y remolcador, larga y 2 cortas; remolcado, larga y 3 cortas.
- Fondeado: repique de campana de unos 5 s cada minuto como máximo (con 100 m, también gong) y puede añadir corta-larga-corta; varado: 3 golpes antes y después del repique.
- Para llamar la atención, señales que no se confundan o un proyector hacia el peligro, evitando luces estroboscópicas.
- Las señales del anexo IV solo significan peligro y necesidad de ayuda: sonido continuo, cañonazo cada minuto, estrellas rojas, SOS, MAYDAY, N sobre C, bandera y bola, bengala o cohete rojo, humo naranja, subir y bajar los brazos, LSD, radiobaliza y SART.

**Trampas del examen:**

- Falso: un barco de 12 m necesita pito y campana. Cierto: con 12 m basta el pito; la campana empieza en 20 m, y con 11 m vale cualquier medio acústico eficaz.
- Falso: 2 cortas es «doy atrás» o 3 cortas es «caigo a babor». Cierto: 1 estribor, 2 babor, 3 atrás.
- Falso: cinco cortas son una señal de peligro o de buzos. Cierto: es la señal de duda entre buques que se ven.
- Falso: dos largas en la niebla son un buque que quiere adelantar. Cierto: es un buque de motor parado y sin arrancada.
- Falso: corta-larga-corta es del buque con maniobra restringida. Cierto: es del fondeado; el de maniobra restringida da larga y 2 cortas.
- Falso: el humo naranja avisa de buzos o de repostaje, o un pito continuo es dar atrás. Cierto: los dos son señales de peligro y petición de ayuda.

**Minijuego** (17 preguntas reales de examen en estas clases):

- Un buque de propulsión mecánica emite tres pitadas cortas. Con ello indica que: *(and-2023-c1-t26)*
- Si en condiciones de visibilidad reducida escuchamos por nuestro costado de babor grupos de dos pitadas largas separadas por un intervalo de unos dos segundos y que se repiten cada dos minutos como máximo, debemos entender que se trata de: *(and-2025-c3-t23)*
- Un buque lanza una señal fumígena que produce una densa humareda de color naranja. ¿Qué quiere indicar?: *(and-2024-c1-t20)*

**Relacionados:** 6.2, 6.5, 6.3.

### Tema 7 · Maniobra

#### 7.0 · Maniobrar el barco

🧭 Panorama · ⏳ pendiente · clases per-7-1, per-7-2, per-7-3, per-7-4, per-7-5, per-7-6, per-7-7, per-7-8

Recorrido por todo el tema de maniobra: el vocabulario de los cabos, las amarras, el gobierno con caña o rueda, los efectos de la hélice, la ciaboga y cómo atracar y desatracar según el viento y la corriente. Es un tema de poco peso pero muy de sentido común, y sus preguntas se repiten casi idénticas convocatoria tras convocatoria.

**Gancho:** Andrés vuelve al puerto con viento de tierra, da atrás para parar junto al pantalán y la popa se le va sola hacia un lado; el vecino le grita «¡el largo de proa, primero el largo de proa!» y él no sabe cuál es.

**En el examen:** El tema 7 aporta 2 de las 45 preguntas del examen y no tiene límite propio de fallos, así que no es eliminatorio; son dos aciertos fáciles si se tienen claras las reglas de la hélice y de las amarras.

**Recorre:** Cabos: partes, gazas y el vocabulario de la maniobra · Las amarras: largos, esprines, traveses y codera · Gobierno, arrancada y curva de evolución · La hélice y el timón · La ciaboga, con una y con dos hélices · Viento, corriente y olas: los agentes de la maniobra · Atracar: de costado, de punta, abarloado y a una boya · Desatracar: qué cabos largar y cómo salir.

**Para llevarse:**

- Cabos: chicote es cada extremo, firme la parte que trabaja y seno la intermedia; amarrar por seno es dejar los dos extremos a bordo, y para «dar tensión a un cabo» el examen dice templar.
- Amarras: el largo va hacia su mismo extremo, el esprín cruza en diagonal hacia el contrario y el través va perpendicular; al cobrar una amarra se acerca el extremo del que sale y el barco va hacia su noray.
- Gobierno: con rueda la proa cae al lado del giro y con caña al contrario; la curva de evolución tiene tres fases, de maniobra, variable y uniforme, y la popa rabea hacia la banda contraria al giro.
- Hélice: dando atrás desde parado, con el timón a la vía, la dextrógira lleva la popa a babor y la levógira a estribor, porque presión lateral y corriente de expulsión empujan a la misma banda.
- Ciaboga: girar en poco espacio alternando avante y atrás; con una dextrógira se ciaboga a estribor, con una levógira a babor, y con dos hélices la proa cae hacia la banda del motor que va atrás.
- Agentes: el viento actúa sobre la obra muerta y la corriente sobre la obra viva, y en toda maniobra cuentan también las olas; lo más fácil es maniobrar con el viento o la corriente por la proa.
- Atracar: con dextrógira se atraca por babor y con levógira por estribor; con viento de tierra o corriente de proa el primer cabo es el largo de proa.
- Desatracar: primero se largan los cabos que no trabajan; para abrir la popa te quedas con el esprín de proa y das avante con el timón al muelle, y para abrir la proa, con el esprín de popa y das atrás.

**Minijuego** (36 preguntas reales de examen en estas clases):

- ¿Qué nombre recibe la acción de dar tensión a los cabos?: *(and-2023-c2-t28)*
- Una embarcación con hélice dextrógira, en marcha atrás, hacia donde tendera a caer la popa. *(and-2021-c1-t29)*
- ¿Qué cabo será el primero que demos si procedemos a atracar de costado al muelle recibiendo el viento desde tierra?: *(and-2024-c1-t28)*

#### 7.1 · Cabos y amarras

🔎 Profundiza · ⏳ pendiente · clases per-7-1, per-7-2

El vocabulario de los cabos y las amarras: partes de un cabo, encapillar, amarrar por seno, hacer firme, y las palabras de cobrar, virar, templar, lascar, amollar, arriar, largar y adujar; después, cada amarra por hacia dónde trabaja y qué hace el barco al cobrarla. En el examen casi todo son preguntas de definición con opciones cruzadas.

**Gancho:** Andrés quiere salir solo del pantalán, sin nadie en el muelle que le suelte la última amarra, y además el vecino ha dejado su gaza en el mismo noray que la suya.

**Para llevarse:**

- Chicote es cada uno de los dos extremos del cabo, firme la parte que trabaja y soporta la tensión, y seno la parte intermedia que forma una curva.
- Encapillar es meter la gaza en un noray, bolardo o bita; si ya hay otra gaza, la tuya se pasa por dentro de la otra, de abajo arriba, para que cada barco pueda sacar la suya.
- Amarrar por seno es dejar el firme y el chicote los dos a bordo: así se larga desde el barco, sin nadie en el muelle.
- A mano se cobra y con máquina se vira; templar es dar tensión a un cabo; se lasca un poco, se amolla poco a poco, se arría dejando correr, se larga del todo y se aduja para recogerlo claro y listo.
- El largo va hacia su mismo extremo, el esprín sale de un extremo y va en diagonal hacia el contrario, el través va perpendicular a la crujía y la codera se da por la banda contraria al muelle para separar el barco.
- Al cobrar el esprín de proa la proa se acerca al muelle y el barco va atrás; al cobrar el esprín de popa, la popa se acerca y el barco va avante.
- Con viento o corriente fuertes por la popa se refuerzan el largo de popa y el esprín de proa; por la proa, el largo de proa y el esprín de popa.

**Trampas del examen:**

- Falso: amarrar por seno es tener el firme a bordo y el chicote en tierra, o al revés. Cierto: por seno, los dos extremos quedan a bordo; si alguno queda en tierra, ya no es por seno.
- Falso: «dar tensión a un cabo» es virar. Cierto: virar es recoger con máquina; dar tensión, en el examen, es templar.
- Falso: pasar un cabo por el noray es abozar. Cierto: eso es encapillar; abozar es sujetar un cabo de forma provisional con una boza.
- Falso: el esprín de proa tira hacia proa porque se llama «de proa». Cierto: sale de la proa pero tira hacia popa; si lo viras lascando los demás, el barco va atrás, la proa se junta al muelle y la popa se separa.
- Falso: con solo los traveses, cobrando el de proa y lascando el de popa, el barco se desplaza a lo largo del muelle. Cierto: los traveses no mueven el barco avante ni atrás; con viento de tierra, la popa se abre a sotavento.

**Minijuego** (13 preguntas reales de examen en estas clases):

- Por «amarrar por seno» se entiende: *(and-2020-c1-t28)*
- Durante una maniobra de atraque, ¿qué término se utiliza para describir la acción de hacer pasar un cabo por un noray? *(and-2024-c3-t29)*
- Descripción de los efectos producidos al cobrar el esprín de proa estando el barco atracado de costado al muelle *(and-2021-c1-t28)*

**Relacionados:** 2.1, 7.3.

#### 7.2 · Gobierno, hélice, timón y ciaboga

🔎 Profundiza · ⏳ pendiente · clases per-7-3, per-7-4, per-7-5

Cómo responde el barco al timón y a la hélice: caña o rueda, velocidad de gobierno y arrancada, la curva de evolución y el rabeo, el efecto de la hélice dextrógira y levógira al dar atrás, y la ciaboga con una y con dos hélices. Es la parte del tema que más preguntas da, y casi siempre con la hélice dando atrás desde parado.

**Gancho:** Andrés tiene que dar la vuelta en una dársena estrecha; prueba a girar a babor y no hay manera, mientras que el vecino, con un barco igual, gira hacia estribor casi sobre sí mismo.

**Para llevarse:**

- Con rueda la proa cae al lado del giro; con caña, al contrario: caña a estribor, proa a babor.
- Velocidad de gobierno es la velocidad mínima a la que el barco obedece al timón; arrancada es la velocidad que conserva por inercia cuando la máquina deja de empujar.
- La curva de evolución tiene tres fases: de maniobra, variable y uniforme; avance, traslado, diámetro táctico y diámetro final son medidas, no fases.
- Avante, el barco gira sobre un punto a un tercio de la eslora desde proa, y la popa rabea hacia la banda contraria al giro: hace falta espacio libre por ese lado.
- El sentido de giro se mira de popa a proa con máquina avante (dextrógira, como las agujas del reloj); parado, sin arrancada, timón a la vía y máquina atrás, la dextrógira lleva la popa a babor y la levógira a estribor, y en esos primeros momentos el timón no hace nada.
- Con arrancada, avante la proa va hacia el lado del timón y atrás es la popa la que va hacia el lado del timón.
- Ciaboga: con dextrógira, proa a estribor (avante con timón a estribor, atrás con timón a babor); con levógira, proa a babor; con dos hélices, una avante y otra atrás, y la proa cae hacia la que va atrás.

**Trampas del examen:**

- Falso: el periodo de avance, el rabeo de la popa, el traslado o el diámetro táctico son fases de la curva de evolución. Cierto: las únicas fases son de maniobra, variable y uniforme.
- Falso: dando atrás desde parado, la popa cae al principio a una banda y luego a la otra. Cierto: con el timón a la vía va a una sola banda, la de la hélice.
- Falso: la corriente de expulsión lleva la popa a una banda y la presión lateral a la otra, y se anulan. Cierto: dando atrás los dos efectos se suman y empujan la popa a la misma banda.
- Falso: en la ciaboga la primera acción es dar atrás. Cierto: se empieza dando avante con el timón a la banda del giro, a babor con levógira y a estribor con dextrógira.
- Falso: en una ciaboga lo mejor es fondear primero, o es indiferente hacia qué banda girar. Cierto: sin viento conviene ciabogar hacia la banda que da la hélice al dar atrás.
- Falso: atrás el timón nunca actúa. Cierto: lo que no funciona es el timón sin arrancada; con arrancada atrás, la popa va hacia el lado del timón.

**Minijuego** (15 preguntas reales de examen en estas clases):

- Las fases de la curva de evolución son: *(and-2023-c3-t29)*
- El efecto de la corriente de expulsión en una hélice de giro dextrógiro, en un buque con timón a la vía, parado y sin arrancada y que dé máquinas atrás, es: *(and-2023-c2-t29)*
- En ausencia de viento, al realizar la ciaboga con una embarcación de una única hélice levógira la primera acción, más conveniente y más rápida será: *(and-2026-c2-t29)*

**Relacionados:** 1.2, 7.1, 7.3.

#### 7.3 · Atracar y desatracar con viento y corriente

🔎 Profundiza · ⏳ pendiente · clases per-7-6, per-7-7, per-7-8

Los agentes que no controlas, viento, corriente y olas, y cómo usarlos para atracar de costado, de punta, abarloado o a una boya, y para desatracar largando los cabos en el orden correcto. El examen pregunta sobre todo qué cabo se da primero, cuáles se largan primero y qué esprín abre la popa o la proa.

**Gancho:** Andrés tiene que salir de un muelle donde la corriente le entra por la proa y no sabe qué amarras soltar primero sin que el barco se le vaya hacia atrás contra el de detrás.

**Para llevarse:**

- El viento actúa sobre la obra muerta y la superestructura; la corriente, sobre la obra viva; y las olas también cuentan en cualquier atraque o desatraque.
- Con poca arrancada el barco se controla mejor con el viento o la corriente por la proa; de costado es lo más difícil.
- Abatimiento es el desplazamiento a sotavento por el viento, con rumbo de superficie igual a rumbo verdadero más abatimiento: positivo con viento por babor y negativo por estribor; la deriva la produce la corriente.
- De costado se entra con unos 20 a 30 grados y se da atrás para parar: con dextrógira se atraca por babor y con levógira por estribor.
- Con viento de tierra o con corriente paralela por la proa, el primer cabo a tierra es el largo de proa; se atraca siempre proa a la corriente.
- De punta se dan dos largos al muelle y el otro extremo se sujeta con el muerto, una codera o el ancla; con viento de costado, los dos largos van al noray de barlovento.
- Al desatracar se largan primero los cabos que no trabajan (con corriente de proa, el esprín de proa y el largo de popa); para abrir la popa, esprín de proa, avante y timón al muelle; para abrir la proa, esprín de popa y atrás.

**Trampas del examen:**

- Falso: la corriente es el agente que actúa sobre la obra muerta. Cierto: sobre la obra muerta actúa el viento; la corriente actúa sobre la obra viva.
- Falso: con corriente de proa el primer cabo es el esprín de proa. Cierto: el esprín de proa llama hacia popa y no aguanta; el primero es el largo de proa.
- Falso: para separar la popa del muelle se mantiene firme el largo de popa. Cierto: el pivote es el esprín de proa, dando avante con el timón al muelle.
- Falso: con corriente de proa se largan primero el largo de proa y el esprín de popa. Cierto: esos son los que trabajan y van al final; primero se largan el esprín de proa y el largo de popa.
- Falso: atracando de punta con viento de costado conviene encapillar los largos en el noray de sotavento, o uno en cada noray. Cierto: los dos al noray de barlovento, para que tiren contra el viento.
- Falso: la escora o el tipo de fondo son agentes de la maniobra. Cierto: los agentes son viento, corriente y olas; el fondo importa para fondear.

**Minijuego** (8 preguntas reales de examen en estas clases):

- El agente externo que influye en la maniobra, al incidir en la obra muerta del barco, es: *(and-2022-c3-t28)*
- Si queremos atracar de costado con corriente de proa paralela al muelle, el primer cabo que daremos a tierra será: *(and-2026-c2-t28)*
- Estamos amarrados por el costado de estribor y damos máquina avante con timón metido hacia el muelle. ¿Qué cabo debemos mantener firme para separar la popa del muelle?: *(and-2026-c1-t29)*

**Relacionados:** 7.1, 7.2, 9.2, 10.5.

### Tema 8 · Emergencias en la mar

#### 8.0 · Emergencias a bordo

🧭 Panorama · ⏳ pendiente · clases per-8-1, per-8-2, per-8-3, per-8-4, per-8-5, per-8-6, per-8-7, per-8-8, per-8-9

Panorama de las emergencias a bordo: primeros auxilios, ayuda médica a distancia, varada y abordaje, vías de agua, el fuego y cómo apagarlo, el abandono del barco y la hipotermia. Son preguntas de sentido común, pero llenas de opciones que suenan prudentes y son falsas.

**Gancho:** Andrés repasa con su nieta lo que haría si un día, en la misma salida, alguien se corta en la cocina, aparece agua en la sentina y huele a quemado; ella le pregunta qué haría primero y él se queda en blanco.

**En el examen:** El tema 8 aporta 3 de las 45 preguntas del examen y no tiene límite propio de fallos, así que no es eliminatorio.

**Recorre:** Primeros auxilios I: heridas, contusiones y hemorragias · Primeros auxilios II: quemaduras, calor y mareo · Ayuda médica a distancia: Radio-Médico, Guía Sanitaria y botiquín · Varada y abordaje · Vías de agua e inundación · El fuego: tetraedro, clases y prevención · Apagar un incendio a bordo · Abandono de la embarcación y señales pirotécnicas · Supervivencia en el agua: hipotermia.

**Para llevarse:**

- Heridas y hemorragias: contusión con frío, elevación y pomada de heparina, sin pinchar el hematoma; ante una hemorragia externa, primero presión directa y elevar el miembro, y el torniquete solo como último recurso.
- Quemaduras, calor y mareo: la quemadura térmica se enfría con agua fresca, no helada, y la química se lava con agua abundante un mínimo de 15 minutos; la insolación cursa con temperatura alta y se enfría al paciente hasta bajar de unos 39 grados.
- Ayuda médica a distancia: el Centro Radio-Médico Español atiende gratis las 24 horas, por radio a través de una costera o por teléfono al 91 310 34 75, y la Guía Sanitaria a Bordo se descarga gratis de la web del Instituto Social de la Marina.
- Varada y abordaje: tras embarrancar, primero evaluar daños, sondar y mirar la marea, nunca dar atrás toda de entrada; tras un abordaje, lo prioritario es evaluar las vías de agua bajo la flotación antes de separar los barcos.
- Vías de agua: el agua entra por donde algo atraviesa el casco (bocina, limera, grifos de fondo, escape); se achica con todo, con el motor encendido, se tapona y se vigila el nivel.
- El fuego: el tetraedro es combustible, comburente, calor y reacción en cadena, y la norma UNE clasifica los fuegos por el combustible: A sólidos, B líquidos, C gases, D metales y F aceites de cocina.
- Apagar un incendio: enfriar quita el calor, sofocar el oxígeno, desalimentar el combustible e inhibir la reacción en cadena; el agua en niebla es lo más eficaz para enfriar, y navegando hay que socairear el fuego.
- Abandono: solo cuando el barco protege menos que la balsa y por orden del patrón, tras el socorro y con la radiobaliza; las bengalas, por sotavento y cuando alguien pueda verlas.
- Hipotermia: por debajo de 35 grados de temperatura interna; en el agua, quieto, en postura fetal si llevas chaleco, agrupados y subidos a lo que flote, y nunca nadar para entrar en calor.

**Minijuego** (54 preguntas reales de examen en estas clases):

- ¿Cuál de las siguientes opciones NO es un síntoma característico de la insolación?: *(and-2025-c3-t31)*
- ¿Cuál de las siguientes opciones NO es un punto de posible inundación de la embarcación?: *(and-2026-c1-t32)*
- El mecanismo de extinción de un fuego que trata de eliminar el comburente se llama: *(and-2022-c3-t31)*

#### 8.1 · Primeros auxilios y ayuda médica a distancia

🔎 Profundiza · ⏳ pendiente · clases per-8-1, per-8-2, per-8-3

Primeros auxilios a bordo: contusiones, heridas, hemorragias externas e internas, quemaduras, insolación y mareo, y cómo pedir ayuda al Centro Radio-Médico Español. El examen repite cada año las mismas trampas: calor en vez de frío, bajar el brazo, el torniquete siempre y el agua oxigenada.

**Gancho:** Andrés se corta el antebrazo con el cuchillo de la cocina mientras navega y sangra bastante; su cuñado ya está sacando un cinturón para hacerle un torniquete.

**Para llevarse:**

- Contusión leve: inmovilizar y elevar la zona, frío envuelto en un paño y, si hay hematoma, pomada de heparina; nunca pinchar el hematoma ni dar calor.
- Hemorragia arterial: rojo vivo y a borbotones; venosa: rojo oscuro, continua y con poca presión.
- Hemorragia externa: presión directa con gasas o un paño limpio y elevar el miembro; torniquete solo si la presión no controla una hemorragia que amenaza la vida, cinco a siete centímetros por encima, anotando la hora y sin aflojarlo.
- Sospecha de hemorragia interna: consejo Radio-Médico cuanto antes, abrigo, posición lateral de seguridad si pierde el conocimiento, y nada de comer ni beber aunque lo pida.
- Quemadura térmica: agua fresca, no helada, al menos 10 minutos y mejor 20, sin reventar ampollas; si es extensa, se enfría solo la zona quemada. Química: agua abundante un mínimo de 15 minutos, también en el ojo.
- Insolación: dolor de cabeza intenso, vértigo, vómitos y temperatura alta; a la sombra, quitar ropa, enfriar con agua a unos 20 grados y parar al bajar de unos 39 grados, sin llegar a 37.
- Radio-Médico: del Instituto Social de la Marina, gratis las 24 horas, por radio a través de una costera indicando «consulta médica» o por teléfono al 91 310 34 75; la Guía Sanitaria a Bordo se descarga gratis de la web del Instituto.

**Trampas del examen:**

- Falso: ante una contusión se aplica calor, o pomada antiséptica, o se pincha el hematoma. Cierto: frío, elevación y pomada de heparina, sin pinchar.
- Falso: para detener una hemorragia en el brazo se baja por debajo del corazón. Cierto: se eleva mientras se hace presión directa.
- Falso: ante una hemorragia en una extremidad siempre se aplica un torniquete. Cierto: primero presión directa; el torniquete es el último recurso.
- Falso: una quemadura química en el ojo se lava 5 minutos con agua oxigenada, o se cubre primero con una gasa. Cierto: se lava con agua abundante un mínimo de 15 minutos, y nunca agua oxigenada.
- Falso: el descenso de la temperatura corporal es un síntoma de insolación, y se enfría al paciente hasta 37 grados. Cierto: la insolación sube la temperatura y se para de enfriar al bajar de unos 39 grados.
- Falso: la consulta radio-médica solo se puede hacer por teléfono móvil. Cierto: también por radio a través de las estaciones costeras.

**Minijuego** (14 preguntas reales de examen en estas clases):

- Las medidas generales que habrán de adoptarse ante una contusión, especialmente cuando ésta es leve, incluyen: *(and-2022-c1-t30)*
- Para detener una hemorragia en un brazo, inicialmente: *(and-2023-c1-t30)*
- ¿Cuál de los siguientes es un método apropiado para obtener la Guía Sanitaria a Bordo, que publica el Instituto Social de la Marina?: *(and-2022-c3-t30)*

**Relacionados:** 3.4, 8.4.

#### 8.2 · Varada, abordaje y vías de agua

🔎 Profundiza · ⏳ pendiente · clases per-8-4, per-8-5

Qué hacer cuando el barco toca fondo, choca con otro o le entra agua: evaluar daños, reflotar en fondo blando, cuándo separar dos barcos tras un abordaje, los puntos por donde entra el agua y cómo achicar y taponar. El examen castiga los reflejos: dar atrás toda, separar los barcos de inmediato y apagar el motor.

**Gancho:** Entrando en una cala con la marea bajando, Andrés nota un roce y el barco se queda clavado en la arena; su primer impulso es meter atrás toda.

**Para llevarse:**

- Tras embarrancar, sin nada brusco: comprobar heridos, evaluar daños y vías de agua, sondar alrededor y mirar si la marea sube o baja.
- Para reflotar en fondo blando: aprovechar la pleamar y trasladar pesos y trasvasar líquidos para cambiar el asiento y romper el efecto ventosa; también llevar un ancla hacia aguas profundas, y pedir remolque si no se sale.
- Tras un abordaje, lo prioritario es evaluar vías de agua y daños estructurales bajo la flotación; antes de separar los barcos, medidas de estanqueidad, apuntalamiento y achique, y acuerdo con el otro patrón.
- Todo accidente de navegación se comunica de inmediato a la Capitanía Marítima, y hay que declarar dentro de las 24 horas hábiles siguientes a la llegada a puerto.
- El agua entra por donde algo atraviesa el casco: la bocina del eje de la hélice, la limera del timón, los grifos de fondo y pasacascos, y el escape; los grifos de fondo que no se usan, cerrados.
- Agua en la sentina: todos los medios de achique en marcha, el motor encendido, taponar, vigilar que el nivel se mantiene o baja y rumbo a puerto.
- El espiche es un tapón cónico de madera blanda para taponar vías de agua e imbornales; un agujero grande se tapa con colchonetas o velas apuntaladas por dentro o con un pallete de colisión por fuera.

**Trampas del examen:**

- Falso: tras una embarrancada hay que dar marcha atrás en el primer momento, o abrir portillos y escotillas. Cierto: primero se evalúan los daños; dar atrás puede abrir el casco o aspirar fango, y abrir escotillas deja entrar más agua.
- Falso: para reflotar se espera a la bajamar, se da atrás toda o se escora el barco por barlovento o sotavento. Cierto: en el examen puntúa trasladar pesos y trasvasar líquidos para anular el efecto ventosa, sondando antes alrededor.
- Falso: tras un abordaje se separan los barcos inmediatamente, o se avisa a Salvamento solo si hay daños por encima de la cubierta. Cierto: la proa de uno puede estar taponando la brecha del otro; primero se evalúan los daños bajo la flotación.
- Falso: con agua en la sentina se apaga el motor para que las bombas rindan más. Cierto: el motor se mantiene encendido, porque carga las baterías de las bombas y te lleva a puerto.
- Falso: la hélice es un punto de inundación. Cierto: la hélice no atraviesa el casco; lo que lo atraviesa es su eje, por la bocina.
- Falso: se abren los grifos de fondo o las escotillas, o se espera a que el motor achique solo. Cierto: se achica con bomba manual o eléctrica y se tapona la vía de agua.

**Minijuego** (14 preguntas reales de examen en estas clases):

- Para reflotar un barco que nos ha quedado varado en fondo de fango o arena, ¿cuál de las siguientes acciones es adecuada?: *(and-2023-c1-t31)*
- Tras sufrir un abordaje, ¿cuál de las siguientes actuaciones es prioritaria?: *(and-2025-c2-t31)*
- Si descubrimos una vía de agua en la sentina: *(and-2024-c2-t32)*

**Relacionados:** 3.3, 4.2, 8.4.

#### 8.3 · El fuego a bordo

🔎 Profundiza · ⏳ pendiente · clases per-8-6, per-8-7

El fuego a bordo: el tetraedro, las clases de fuego de la norma UNE-EN 2, los lugares de riesgo y cómo prevenirlos, y después cómo apagarlo: mecanismos de extinción, agentes, uso del extintor y la maniobra de socairear el fuego. Es de los apartados con más preguntas del tema, casi todas de definición.

**Gancho:** Andrés tiene una sartén al fuego en la cocina del velero, fondeado, y el aceite se prende; lo primero que le viene a la cabeza es echarle agua.

**Para llevarse:**

- Tetraedro del fuego: combustible, comburente (el oxígeno), calor y reacción en cadena, que explica que el fuego se mantenga solo hasta que se anula alguno de sus factores.
- La norma UNE-EN 2 clasifica los fuegos por el estado físico y la naturaleza del combustible: A sólidos con brasas, B líquidos, C gases, D metales y F aceites y grasas de cocina; no hay clase E.
- Lugares de riesgo: cocina, cámara de motores, toma de combustible, baterías, instalación eléctrica y pañol de pinturas; la cámara de motores, las baterías y el pañol, siempre ventilados.
- Enfriamiento quita el calor, sofocación el comburente, desalimentación el combustible e inhibición la reacción en cadena.
- El agua en niebla es el agente más eficaz para enfriar; la espuma sirve en A y B; el CO2 en B y con electricidad; el polvo ABC es el habitual a bordo; el halón está prohibido.
- Extintores según el RD 339/2021: eficacia mínima 34B, al menos 2 kilos de agente, de fácil acceso y uno alcanzable desde el puesto de gobierno; se usan de espaldas al viento, a la base de la llama y en barrido.
- Socairear el fuego es maniobrar para reducir al mínimo el viento aparente sobre él y dejarlo a sotavento del barco: fuego a proa, viento por popa; fuego a popa, viento por proa.

**Trampas del examen:**

- Falso: el aceite de cocina es clase B porque es líquido. Cierto: los aceites y grasas de cocina son clase F.
- Falso: el tetraedro sirve para clasificar los fuegos o para asignar un extintor a cada lado. Cierto: explica por qué el fuego, una vez iniciado, se automantiene.
- Falso: las baterías van en espacios cerrados y sin ventilación, y el pañol de pinturas herméticamente cerrado. Cierto: se ventilan para que no se acumulen gases explosivos.
- Falso: las tomas de combustible han de estar siempre abiertas. Cierto: cerradas salvo al repostar.
- Falso: sofocar es eliminar el combustible, o el CO2 es el mejor agente para enfriar. Cierto: sofocar elimina el comburente, y para enfriar lo más eficaz es el agua en niebla.
- Falso: parar el motor hace cero el viento aparente. Cierto: solo quita el viento de la marcha; el real sigue soplando, y lo correcto es socairear el fuego.

**Minijuego** (17 preguntas reales de examen en estas clases):

- Los fuegos derivados de aceites y grasas vegetales o animales en materiales y aparatos de cocina se denominan de la: *(and-2025-c3-t30)*
- Para extinguir un incendio por enfriamiento, ¿cuál de los siguientes agentes extintores será el más eficaz?: *(and-2024-c1-t31)*
- En caso de fuego a bordo en navegación, ¿cómo deberemos proceder si tenemos viento?: *(and-2025-c1-t31)*

**Relacionados:** 3.3, 9.2.

#### 8.4 · Abandono e hipotermia

🔎 Profundiza · ⏳ pendiente · clases per-8-8, per-8-9

Cuándo y cómo se abandona el barco, qué se prepara antes, cómo se usan bengalas, cohetes y señales de humo, cómo se salta al agua y cómo se sobrevive en agua fría. Las preguntas buscan la opción que suena valiente y es un error: nadar para entrar en calor, quitarse la ropa o trincar lo que flota.

**Gancho:** Andrés ve en las noticias que una tripulación abandonó su velero en una balsa y al día siguiente el barco apareció todavía a flote; no entiende cómo pudo pasar.

**Para llevarse:**

- Se abandona solo cuando el barco protege menos que la balsa; la orden la da el patrón y, si es posible, después de la alerta de socorro.
- Antes de abandonar: parar el barco, mensaje de socorro y radiobaliza activada a mano y llevada contigo, chaleco con ropa de abrigo debajo, balsa y material listos, y lanzar al agua todo lo que flote.
- La pirotecnia es solo para emergencias reales, se dispara por sotavento cuando alguien pueda verla, según las instrucciones del fabricante y sin caducar, y la puede usar cualquier tripulante.
- Bengala de mano: luz roja al menos un minuto, para guiar al que viene; cohete con paracaídas: sube al menos 300 metros y arde al menos 40 segundos, para llamar la atención de lejos; humo naranja: al menos 3 minutos, solo de día.
- Para saltar: mirar que no haya nadie debajo, desde poca altura, tapando nariz y boca, sujetando el chaleco y con las piernas juntas y estiradas.
- Hay hipotermia cuando la temperatura interna baja de 35 grados, y el agua enfría unas 25 veces más deprisa que el aire.
- En el agua: moverse lo mínimo, con chaleco en postura fetal, sin chaleco vertical con movimientos lentos, agrupados y subidos a cualquier objeto flotante; al rescatado, horizontal, ropa mojada fuera, abrigo y bebidas calientes si está consciente, nunca alcohol.

**Trampas del examen:**

- Falso: antes de abandonar se trinca en cubierta todo lo que pueda flotar. Cierto: se lanza al agua, porque servirá de apoyo.
- Falso: hay que mantener rumbo y velocidad, o aumentar la velocidad para abandonar. Cierto: lo primero es parar el barco.
- Falso: hay que quitarse la ropa, el calzado o el chaleco para nadar mejor, o colocarse el aro salvavidas. Cierto: chaleco puesto y ajustado con ropa de abrigo debajo.
- Falso: las bengalas se usan en cuanto hay peligro, solo las dispara el patrón o conviene probarlas en ejercicios. Cierto: emergencia real, a la vista de alguien, por sotavento, y cualquier tripulante puede usarlas.
- Falso: se salta al agua con las piernas plegadas sobre el estómago. Cierto: se salta con las piernas juntas y estiradas; la postura fetal es para flotar quieto.
- Falso: sin chaleco hay que nadar para entrar en calor. Cierto: nadar acelera la hipotermia; vertical, movimientos lentos y agrupados.

**Minijuego** (9 preguntas reales de examen en estas clases):

- ¿Cuál de las siguientes medidas a tomar antes de abandonar la embarcación es correcta?: *(and-2023-c2-t31)*
- Indique la opción INCORRECTA respecto al uso de las bengalas de mano: *(and-2025-c3-t32)*
- Si tuviese que abandonar la embarcación y no dispone de balsa salvavidas, ¿cuáles de las siguientes acciones son correctas?: *(and-2022-c3-t32)*

**Relacionados:** 3.3, 3.4, 6.8, 8.1.

### Tema 9 · Meteorología

#### 9.0 · El tiempo para salir a navegar

🧭 Panorama · ⏳ pendiente · clases per-9-1, per-9-2, per-9-3, per-9-4, per-9-5, per-9-6, per-9-7

Panorama de la meteorología del PER: presión y barómetros, borrascas y anticiclones, el vocabulario del viento, viento real y aparente, las brisas, las escalas Beaufort y Douglas y cómo decidir si se sale. Con cuatro preguntas, está entre los temas no eliminatorios que más pesan, y sus preguntas se repiten mucho.

**Gancho:** Andrés mira el barómetro del salón del barco antes de salir: marca algo más de 1010 y no sabe si eso es bueno o malo; el parte habla de «poniente fuerza 5 rolando a noroeste y marejada».

**En el examen:** El tema 9 aporta 4 de las 45 preguntas del examen y no tiene límite propio de fallos, así que no es eliminatorio; pero sus preguntas son muy repetitivas y son aciertos casi seguros.

**Recorre:** La presión atmosférica: barómetros e isobaras · Borrascas y anticiclones · El viento: vocabulario e instrumentos · Viento real, de avance y aparente · Brisas costeras: virazón y terral · Beaufort, la mar y la escala Douglas · Antes de zarpar: la previsión y la decisión.

**Para llevarse:**

- Presión: es el peso por unidad de superficie de la columna de aire; la normal es una atmósfera, 1013,25 hectopascales o 760 milímetros de mercurio; se mide con el barómetro, y el aneroide es elástico y de lectura directa.
- Borrascas y anticiclones: en el hemisferio norte, la borrasca tiene la presión más baja en el centro, gira en sentido antihorario y trae mal tiempo; el anticiclón, presión alta en el centro, giro horario y tiempo estable.
- Vocabulario del viento: se nombra por de dónde viene; rolar es cambiar de dirección; refrescar, aumentar; caer, disminuir; y racheado, subir y bajar continuamente.
- Viento aparente: es la suma del real y el de avance, el que se nota a bordo; entra más a proa que el real, y con viento real por popa a tu misma velocidad es nulo.
- Brisas: la virazón sopla de día, del mar a tierra; el terral, de noche, de tierra al mar; nacen porque la tierra se calienta y se enfría más deprisa que el mar.
- Escalas: Beaufort mide el viento en 13 grados, de 0 a 12; Douglas mide el estado de la mar por la altura de las olas en 10 grados, de 0 a 9; la mar crece con intensidad, persistencia y fetch.
- Decidir: la previsión oficial es la de AEMET, que difunden también Salvamento Marítimo por radio y el NAVTEX; se sale con plan B, puerto de refugio y hora límite.

**Minijuego** (72 preguntas reales de examen en estas clases):

- ¿Cómo se llaman las líneas que unen puntos de igual presión? *(and-2021-c1-t33)*
- Si el viento cambia de dirección y se mantiene en ella se dice que: *(and-2024-c3-t36)*
- La escala que clasifica los diferentes estados de la mar en 10 grados tomando como referencia la altura de las olas se denomina: *(and-2023-c2-t34)*

#### 9.1 · Presión, borrascas y anticiclones

🔎 Profundiza · ⏳ pendiente · clases per-9-1, per-9-2

La presión atmosférica, su valor normal y sus unidades, el barómetro de mercurio y el aneroide, las isobaras y la tendencia barométrica; después, borrascas y anticiclones: presión en el centro, giro del viento, tiempo que traen y hacia dónde viajan. El examen mezcla en una misma pregunta aneroides, isobaras y giros, y hay que comprobar cada dato.

**Gancho:** Durante una tarde fondeado, Andrés ve que la aguja del barómetro aneroide ha bajado bastante desde la mañana, aunque el cielo sigue despejado.

**Para llevarse:**

- La presión atmosférica es el peso por unidad de superficie de la columna de aire que gravita sobre un lugar; se mide con el barómetro, no con el manómetro.
- Presión normal a nivel del mar: una atmósfera, que son 1013,25 hectopascales, 1013,25 milibares o 760 milímetros de mercurio.
- El aneroide tiene una cápsula metálica estanca con vacío que un muelle equilibra con fuerzas elásticas; es de lectura directa y menos exacto que el de mercurio.
- Las isobaras unen puntos de igual presión: son la intersección de las superficies isobáricas con el nivel del mar; cuanto más juntas, más viento.
- Importa más la tendencia que la lectura: una bajada rápida anuncia una borrasca o un frente con viento fuerte.
- En el hemisferio norte, la borrasca tiene la presión más baja en el centro y gira en sentido antihorario; el anticiclón, la presión más alta en el centro y gira en sentido horario; el viento corta las isobaras con un ángulo pequeño, nunca perpendicular.
- Las borrascas se desplazan en general de oeste a este, con cambios de latitud; de espaldas al viento, en el hemisferio norte, la baja queda a la izquierda.

**Trampas del examen:**

- Falso: la presión normal es 760 hectopascales, o 1000 milibares equivalen a 760 milímetros. Cierto: 760 son milímetros de mercurio y equivalen a 1013,25 milibares.
- Falso: el aneroide equilibra la presión con fuerzas magnéticas o eléctricas, lleva mercurio, es de lectura indirecta o es más exacto que el de mercurio. Cierto: fuerzas elásticas, cápsula con vacío, lectura directa y menos exacto.
- Falso: el aneroide lleva un estrechamiento capilar. Cierto: eso es del barómetro de mercurio marino.
- Falso: las isobaras unen puntos de igual tendencia barométrica o de igual temperatura. Cierto: igual presión; las de igual tendencia son isalobaras, y las de igual temperatura, isotermas.
- Falso: la presión es el peso por unidad de volumen. Cierto: por unidad de superficie.
- Falso: en una borrasca la presión aumenta del exterior hacia el interior, o el viento es perpendicular a las isobaras. Cierto: en la borrasca el centro es lo más bajo, y el viento va casi paralelo a las isobaras.

**Minijuego** (30 preguntas reales de examen en estas clases):

- En relación al barómetro aneroide, marque la opción FALSA: *(and-2023-c3-t36)*
- En el hemisferio norte la circulación de los vientos en una borrasca: *(and-2023-c2-t33)*
- En general, las borrascas en el hemisferio norte: *(and-2022-c3-t34)*

**Relacionados:** 9.2, 9.3.

#### 9.2 · El viento: real, aparente y las brisas

🔎 Profundiza · ⏳ pendiente · clases per-9-3, per-9-4, per-9-5

Las palabras del viento (rolar, refrescar, caer, calmar, racha y racheado) y sus instrumentos; la diferencia entre viento real, de avance y aparente; y las brisas costeras, virazón y terral. Son preguntas cortas de vocabulario donde el examen cruza una palabra con la definición de otra.

**Gancho:** Navegando en popa con el motor, Andrés no nota ni un soplo de viento en la bañera, pero en el puerto, al salir, las banderas ondeaban con fuerza.

**Para llevarse:**

- El viento se nombra por de dónde viene; rolar es cambiar de dirección y quedarse en la nueva, mientras que refrescar, caer, calmar, racha y racheado hablan de intensidad.
- Refrescar es aumentar y mantenerse; caer, disminuir y mantenerse; racha, una subida brusca y breve; racheado, una intensidad que sube y baja continuamente.
- El anemómetro mide la velocidad del viento; la veleta y el catavientos indican su dirección.
- El viento de avance siempre viene de proa con la misma intensidad que tu velocidad, y el aparente es la suma del real y el de avance: es el que notas a bordo y el que mueve las velas.
- El aparente entra más a proa que el real; es más fuerte ciñendo o de través y más flojo en aleta o popa; con el real por popa a tu misma velocidad, es nulo.
- Las brisas nacen porque la tierra se calienta y se enfría más deprisa que el mar: la virazón sopla de día, del mar a tierra; el terral, de noche y al amanecer, de tierra al mar.

**Trampas del examen:**

- Falso: el viento refresca cuando disminuye su intensidad o su temperatura. Cierto: refresca cuando aumenta su intensidad; caer es disminuir.
- Falso: el viento rola cuando cambia de intensidad. Cierto: rolar es cambiar de dirección; si todas las opciones hablan de intensidad, la buena es «ninguna».
- Falso: la racha es un cambio suave y estable. Cierto: es un aumento brusco y breve.
- Falso: la veleta da la intensidad del viento o el anemómetro su dirección. Cierto: la veleta da la dirección y el anemómetro la velocidad.
- Falso: si no sientes viento navegando, el real sopla en dirección opuesta a tu rumbo, o el aparente no depende de la velocidad del barco. Cierto: el real te viene por popa a tu velocidad, y el aparente sí depende de la velocidad.
- Falso: el terral sopla de día, o la virazón de tierra al mar, o las brisas se deben a que tierra y mar se calientan por igual. Cierto: terral de noche y de tierra; virazón de día y del mar; y tierra y mar no se calientan igual.

**Minijuego** (24 preguntas reales de examen en estas clases):

- Si la intensidad del viento varia continuamente, tanto a más como a menos, se dice que: *(and-2022-c3-t36)*
- Si navegamos avante recibiendo el viento verdadero por Popa y la velocidad del buque es igual a la intensidad de dicho viento verdadero: *(and-2022-c2-t35)*
- De las siguientes afirmaciones, marque la correcta: *(and-2023-c2-t35)*

**Relacionados:** 9.1, 7.3, 10.5.

#### 9.3 · Beaufort, Douglas y la decisión de salir

🔎 Profundiza · ⏳ pendiente · clases per-9-6, per-9-7

La escala Beaufort para el viento y la Douglas para la mar, los tres factores que hacen crecer las olas (intensidad, persistencia y fetch), la mar de viento y la de fondo, y cómo usar la previsión oficial para decidir si se sale. El examen se limita casi siempre a definir el fetch y a no confundir las dos escalas.

**Gancho:** Andrés quiere salir el sábado con unos amigos y el parte de AEMET dice «poniente fuerza 6, marejada a fuerte marejada y mar de fondo del oeste»; no sabe si eso es mucho para su velero.

**Para llevarse:**

- La escala Beaufort estima la intensidad del viento en 13 grados, de 0, calma, a 12, temporal huracanado; a partir de fuerza 6 la navegación es exigente para un barco pequeño y fuerza 8 es temporal.
- La mar crece con tres factores: intensidad (la fuerza del viento), persistencia (el tiempo que lleva soplando igual) y fetch (la extensión de mar sobre la que sopla con la misma dirección e intensidad).
- Mar de viento es la que levanta el viento del momento y del lugar, corta e irregular; mar de fondo es la que llega de lejos, larga y regular, aunque haya calma.
- La escala Douglas clasifica el estado de la mar por la altura de las olas en 10 grados, de 0 a 9: marejadilla hasta medio metro, marejada hasta 1,25 metros y fuerte marejada hasta 2,5.
- La fuente oficial es AEMET, con predicción para aguas costeras hasta 20 millas y avisos; la difunden también Salvamento Marítimo por VHF, anunciada en el canal 16, y el NAVTEX en 518 y 490 kilohercios.
- Antes de salir: viento y mar dentro de lo que barco y tripulación llevan con comodidad, avisos en vigor y plan B con puerto de refugio y hora límite; si el barómetro cae deprisa, se vuelve antes.

**Trampas del examen:**

- Falso: el fetch es el tiempo que lleva soplando el viento, la altura de la ola o la profundidad a la que rompe. Cierto: el fetch es la extensión de mar; el tiempo es la persistencia.
- Falso: «permanencia» o «potencia» son factores de la mar. Cierto: son palabras de relleno; los factores son intensidad, persistencia y fetch.
- Falso: la escala Douglas mide el viento, la velocidad de las olas o la salinidad. Cierto: mide el estado de la mar por la altura de las olas.
- Falso: la escala Beaufort clasifica el oleaje o la salinidad. Cierto: mide la intensidad del viento.
- Falso: existen las escalas de Coriolis o de persistencia. Cierto: las escalas del examen son Beaufort para el viento y Douglas para la mar.
- Falso, en la pregunta que mezcla previsión y lecciones anteriores: el terral se produce en horas diurnas. Cierto: el terral es nocturno; lo de AEMET y Salvamento, el aneroide y Douglas es correcto.

**Minijuego** (18 preguntas reales de examen en estas clases):

- El tiempo durante el que está soplando un viento con dirección y fuerza uniformes se denomina: *(and-2023-c1-t35)*
- La escala de Douglas clasifica según: *(and-2021-c2-t35)*
- La escala que designa los diferentes estados del viento se llama: *(and-2022-c2-t33)*

**Relacionados:** 9.1, 9.2, 3.2.

### Tema 10 · Teoría de navegación

#### 10.0 · Navegar con la carta: la teoría

🧭 Panorama · ⏳ pendiente · clases per-10-1, per-10-2, per-10-3, per-10-4, per-10-5, per-10-6, per-10-7, per-10-8, per-10-9

Recorrido por todo lo que hay que saber antes de poner el lápiz en la carta: coordenadas, milla y corredera, la carta y sus símbolos, los faros, los tres nortes, rumbos, demoras y marcaciones, mareas, viento y corriente. Es la teoría que se pregunta sin carta y, a la vez, la base de las cuatro preguntas de carta, que sí son eliminatorias.

**Gancho:** Andrés ha comprado la carta del Estrecho y la extiende en la mesa del salón del barco: números pequeños por todo el mar, letras como «S G» o «Oc(2) 5s 13M» junto a los faros y una rosa que dice «2° 50′ W 2005 (7′ E)». No entiende nada, y al final del episodio sabrá qué significa cada cosa.

**En el examen:** El tema 10 da 5 preguntas de las 45 del examen y no tiene límite propio de fallos: cuentan para los 32 aciertos del apto. Pero es la base del tema 11 (4 preguntas de carta con un máximo de 2 fallos), que sí es eliminatorio.

**Recorre:** La Tierra y las coordenadas · Distancia, velocidad y tiempo a bordo · La carta náutica y las publicaciones · Faros y luces en la carta · Los tres nortes: declinación, desvío y corrección total · Rumbos: verdadero, magnético y de aguja · Demora, marcación y líneas de posición · Mareas · Viento y corriente: abatimiento y deriva.

**Para llevarse:**

- Coordenadas: la latitud es arco de meridiano desde el ecuador (0° a 90° N o S) y la longitud, arco de ecuador desde Greenwich (0° a 180° E o W); mismo paralelo, misma latitud; mismo meridiano, misma longitud.
- La milla náutica mide 1852 m y es un minuto de latitud; las distancias se miden siempre en la escala de latitudes (márgenes laterales), el nudo es una milla por hora y la velocidad verdadera es el coeficiente de corredera multiplicado por la de corredera.
- La carta es Mercator (el rumbo constante es una recta); el portulano da el máximo detalle, la de recalada sirve para aproximarse a puertos y el cartucho es un recuadro a mayor escala dentro de la carta; los veriles unen puntos de igual sonda.
- Un faro se identifica de noche por el color y el ritmo: en «Fl(3) 10s 18M», Fl son destellos, (3) el grupo, 10s el periodo y 18M el alcance en millas; Oc es una luz encendida que se apaga y F es fija.
- Declinación es el ángulo entre norte verdadero y magnético (depende del lugar y del año); desvío, entre magnético y de aguja (depende del rumbo del barco); corrección total = declinación + desvío, con E positivo y W negativo.
- El rumbo se cuenta desde el norte hasta la línea proa-popa: Rv = Ra + Ct; y un cuadrantal se pasa a circular (S45W = 225°, N64W = 296°).
- Demora es del norte a la visual de un objeto, marcación es de la proa a esa visual, y se unen con Demora = Rumbo + Marcación (estribor suma, babor resta); el rumbo no es una línea de posición.
- Amplitud es diferencia de alturas entre pleamar y bajamar, duración es diferencia de horas; las sondas de la carta se miden desde el cero hidrográfico (la Mayor Bajamar Astronómica), y con baja presión hay más agua de la prevista.
- El viento produce abatimiento (ángulo de la estela con la crujía) y la corriente produce deriva, que arrastra igual a cualquier barco sea cual sea su tamaño.

**Minijuego** (90 preguntas reales de examen en estas clases):

- Los barcos que se encuentran en la misma longitud se encuentran a su vez en el mismo: *(and-2023-c3-t41)*
- ¿Cuál es el valor del rumbo cuadrantal S45W? *(and-2022-c1-t38)*
- La diferencia entre la hora de la bajamar y la hora de la pleamar siguiente se conoce como: *(and-2021-c2-t39)*

#### 10.1 · La Tierra, las coordenadas y la milla

🔎 Profundiza · ⏳ pendiente · clases per-10-1, per-10-2

Cómo se dice dónde está un barco (latitud y longitud) y cómo se miden la distancia, la velocidad y el tiempo a bordo: milla, cable, nudo, corredera con su coeficiente, sonda y hora de a bordo. Caen cada año preguntas de definición casi idénticas, con las palabras cruzadas a propósito.

**Gancho:** Andrés navega de un punto a otro que conoce bien: la corredera marca 12 millas, pero al medir en la carta le salen menos, y además el primer día midió en el margen de arriba y le salía otra cosa. ¿Quién miente, la corredera o la carta?

**Para llevarse:**

- Ecuador y meridianos son círculos máximos; los paralelos son círculos menores; el meridiano del lugar es el que pasa por tu barco y el meridiano cero es el de Greenwich.
- Latitud: arco de meridiano desde el ecuador hasta el paralelo del lugar, de 0° a 90° N o S. Longitud: arco de ecuador desde Greenwich hasta el meridiano del lugar, de 0° a 180° E o W.
- Dos barcos en el mismo paralelo tienen la misma latitud; dos barcos en el mismo meridiano tienen la misma longitud, aunque uno esté al norte y otro al sur del ecuador.
- La situación se escribe en grados, minutos y décimas, primero la latitud: 36° 07,3′ N, 005° 58,6′ W; la longitud lleva tres cifras en los grados.
- La milla náutica es un minuto de arco de círculo máximo y mide 1852 m por convenio; el cable es la décima parte (185,2 m) y el nudo es una milla por hora.
- Las distancias se miden en la escala de latitudes, la de los márgenes laterales: cada minuto es una milla; la escala de longitudes no sirve.
- Coeficiente de corredera = distancia verdadera ÷ distancia de corredera, y siempre se multiplica: con k = 0,95 y 12 millas de corredera, has navegado 11,4 millas. La HRB es la hora de a bordo que fija el patrón.

**Trampas del examen:**

- Falso: la latitud es un «arco de paralelo» o se cuenta «desde Greenwich». Cierto: la latitud se mide sobre el meridiano, desde el ecuador; la longitud, sobre el ecuador, desde Greenwich.
- Falso: si un barco está en el ecuador, su longitud es cero. Cierto: en el ecuador lo que vale cero es la latitud; la longitud puede ser cualquiera.
- Falso: la milla es el minuto del paralelo de 45°, o la diezmillonésima parte del cuadrante del meridiano. Cierto: en el examen se da por buena «el arco de ecuador de un minuto, 1852 m»; el paralelo de 45° es círculo menor y la diezmillonésima parte es la definición del metro.
- Falso: las distancias se miden indistintamente en la escala de latitudes o de longitudes. Cierto: solo en la de latitudes; un minuto de longitud es más corto que una milla salvo en el ecuador.
- Falso: el coeficiente se suma, se resta o se divide. Cierto: multiplica a lo que marca la corredera; con k mayor que 1 el resultado sale mayor, con k menor que 1, menor.
- Falso: la HRB es la hora legal o la que fija el Gobierno. Cierto: es la hora que se lleva a bordo, fijada por el patrón. Y la sonda mide la profundidad, no el calado ni el francobordo.

**Minijuego** (24 preguntas reales de examen en estas clases):

- Dos buques que tengan la misma latitud y no estén en el ecuador: *(and-2025-c2-t40)*
- Si el coeficiente de corredera es 1,1 y la distancia de corredera es 8 millas, ¿cuál será la distancia verdadera navegada?: *(and-2023-c2-t40)*
- La Hora Reloj Bitácora es: *(and-2024-c2-t40)*

**Relacionados:** 10.2, 11.1.

#### 10.2 · La carta náutica, los faros y las publicaciones

🔎 Profundiza · ⏳ pendiente · clases per-10-3, per-10-4

Qué cuenta la carta náutica: tipos de carta según su escala, sondas y veriles, las letras del tipo de fondo, los faros y su característica, y las publicaciones del Instituto Hidrográfico de la Marina. Son preguntas de memoria con letras y nombres que el examen cruza a propósito.

**Gancho:** Andrés quiere fondear en una cala y bajo la sonda lee «S Sh»; esa misma noche, volviendo a puerto, ve una luz blanca que está encendida y se apaga tres veces seguidas cada diez segundos, y no sabe qué faro es.

**Para llevarse:**

- La carta Mercator tiene los meridianos verticales y paralelos entre sí, y un rumbo constante se dibuja como una recta.
- Cuanta más escala, más detalle: la carta de recalada sirve para aproximarse a puertos o zonas peligrosas, el portulano da el detalle máximo de una pequeña zona y el cartucho es un recuadro a mayor escala dentro de otra carta.
- Las sondas van en metros desde el cero hidrográfico, y los veriles o isobatas unen puntos de igual profundidad; las isobaras son otra cosa, de los mapas del tiempo.
- El fondo se escribe con letras del inglés, primero la que predomina: S arena, M fango, R roca, St piedras, G cascajo, Sh conchuela, Si limo; «S G» es arena con cascajo.
- En «Fl(3) 10s 18M»: Fl son destellos, (3) el grupo, 10s el periodo y 18M el alcance nominal en millas; si no se indica color, la luz es blanca.
- Destellos: la luz dura menos que la oscuridad; ocultaciones (Oc): dura más y se apaga a ratos; isofase: lo mismo; F es luz fija; LFl es un destello de 2 segundos o más.
- De noche un faro se identifica por el color y el ritmo de su luz; el Libro de Faros y Señales de Niebla da su detalle, los Derroteros describen la costa y los Avisos a los Navegantes salen cada semana.

**Trampas del examen:**

- Falso: el cartucho es la zona de leyendas o la zona de tierra. Cierto: es un recuadro, con su propio marco, que muestra una parte de la carta a mayor escala.
- Falso: la carta de recalada es la de máximo detalle. Cierto: la de recalada es para aproximarse a puertos; el detalle máximo es del portulano.
- Falso: G es guijarro y St es roca. Cierto: G es cascajo (gravel), St es piedras (stones) y la roca es R; las letras no hablan de la antigüedad de la sonda ni de aguas sucias.
- Falso: 15M es la altura del faro o 15 minutos. Cierto: M mayúscula es el alcance en millas; la altura iría con m minúscula.
- Falso: «Fl 5s» son cinco destellos, y «F W» es un destello blanco. Cierto: Fl 5s es un destello cada 5 segundos (cinco serían Fl(5)), y F W es una luz blanca fija.
- Falso: un faro de ocultaciones está apagado y se enciende en caso de emergencia. Cierto: está encendido y se apaga cada cierto periodo; lo de «emergencia» no existe.

**Minijuego** (19 preguntas reales de examen en estas clases):

- Carta náutica. Debajo de la cifra que indica la sonda en un lugar determinado figura la abreviatura «St». Con ello se indica que el fondo es: *(and-2024-c3-t40)*
- Las cartas que dan al navegante el detalle más completo de una pequeña extensión de costa, ensenadas, puertos, radas, fondeaderos, etc., se llaman: *(and-2025-c3-t39)*
- En una carta figura la siguiente inscripción al lado de un faro: Fl (2) 10s 15M. ¿Qué significa 15M?: *(and-2023-c3-t39)*

**Relacionados:** 10.1, 5.4, 11.1.

#### 10.3 · Los tres nortes y los rumbos

🔎 Profundiza · ⏳ pendiente · clases per-10-5, per-10-6

Los tres nortes (verdadero, magnético y de aguja), los dos ángulos que los separan (declinación y desvío), la corrección total y los rumbos verdadero, magnético y de aguja, incluido el paso de cuadrantal a circular. Es la llave de todos los ejercicios de carta y un clásico de las preguntas de teoría.

**Gancho:** Andrés ha instalado un altavoz nuevo junto a la bitácora y, al día siguiente, el compás le marca unos grados distintos según hacia dónde pone la proa. Al final del episodio sabrá qué ha pasado y cómo se corrige.

**Para llevarse:**

- Norte verdadero es el de la carta, norte magnético el de una brújula sin perturbaciones y norte de aguja el de la aguja de tu barco.
- Declinación magnética: de norte verdadero a magnético; depende del lugar y del año, y la carta la da en la rosa con su año y su variación anual.
- Para actualizar la declinación: años transcurridos por variación anual, y se suma con su signo; con 2° 30′ W en 2016 y 9′ E al año, en 2026 queda 1° W.
- Desvío: de norte magnético a norte de aguja; lo causan los hierros, motores, cables y aparatos del propio barco, cambia con el rumbo y se saca de la tablilla de desvíos.
- Corrección total = declinación + desvío, con E positivo y W negativo: con 3° W y +5° de desvío, la corrección total es +2°.
- Rv = Ra + Ct y Ra = Rv − Ct: «de la carta al timón, al revés la corrección; del timón a la carta, con sumar basta».
- De cuadrantal a circular: N x E = x; S x E = 180 − x; S x W = 180 + x; N x W = 360 − x. S45W es 225° y N64W es 296°.

**Trampas del examen:**

- Falso: el ángulo entre norte magnético y norte de aguja es la declinación. Cierto: ese es el desvío; norte verdadero–magnético es declinación y norte verdadero–aguja, corrección total.
- Falso: el desvío solo depende de la situación del barco, o una vez calculado no cambia, o es nulo en los veleros. Cierto: depende del rumbo, y los veleros también tienen desvío.
- Falso: una enfilación o una demora dan directamente el desvío. Cierto: dan la corrección total; el desvío sale restándole la declinación.
- Falso: si la aguja coincide con el rumbo verdadero, el desvío es cero y la declinación no cuenta. Cierto: declinación y desvío valen lo mismo con signos contrarios, y es casualidad de ese rumbo.
- Falso: la aguja se instala junto a planchas de acero o cables con mucha corriente, y la línea de fe da igual dónde esté. Cierto: lejos de hierros, altavoces y cables, con la línea de fe en la crujía o paralela a ella.
- Falso: S45W es 135°. Cierto: S…W cae siempre entre 180° y 270°, así que es 225°; 135° sería S45E.

**Minijuego** (18 preguntas reales de examen en estas clases):

- El ángulo que forma la dirección Norte-Sur de la aguja con el norte magnético se llama: *(and-2023-c1-t39)*
- El desvío de la aguja: *(and-2024-c1-t41)*
- ¿Cuál es el valor del rumbo cuadrantal N64W? *(and-2023-c1-t38)*

**Relacionados:** 10.4, 11.1.

#### 10.4 · Demora, marcación y líneas de posición

🔎 Profundiza · ⏳ pendiente · clase per-10-7

La diferencia entre rumbo, demora y marcación, la fórmula que las une y qué es una línea de posición: demora, enfilación, oposición, distancia o veril. Sale casi en cada convocatoria y es justo lo que luego se usa para situarse en la carta.

**Gancho:** Navegando hacia el puerto, Andrés ve un faro justo por el través de estribor y su cuñado le pregunta: «¿Y en qué demora está?». Él contesta «a noventa grados», y no es eso.

**Para llevarse:**

- Demora: ángulo del norte a la visual a un objeto, de 0° a 360°; puede ser verdadera, magnética o de aguja, y Dv = Da + Ct.
- Marcación: ángulo de la proa (la línea proa-popa) a la visual; de 0° a 180° por estribor o por babor, o circular de 0° a 360° desde la proa hacia estribor.
- Demora = Rumbo + Marcación, estribor suma y babor resta («Don RaMón»): con rumbo 300° y el faro por el través de estribor, la demora es 030°; y la marcación es demora menos rumbo.
- En la carta solo se trazan demoras verdaderas: con dos demoras de aguja no te sitúas directamente, porque te falta el desvío.
- Línea de posición es una línea de la carta sobre la que sabes que estás: demora, enfilación, oposición, distancia (circunferencia) o veril; con dos que se corten, a ser posible cerca de 90°, tienes la situación.
- En la enfilación ves dos objetos alineados y estás fuera de ellos; en la oposición estás entre los dos; ambas dan la corrección total: Ct = Dv − Da.
- Una enfilación es fiable si los objetos están lejos del barco y separados entre sí, y el posterior es igual o más alto que el anterior.

**Trampas del examen:**

- Falso: la demora es el ángulo de la proa a un objeto. Cierto: eso es la marcación; la demora se cuenta desde el norte (el meridiano).
- Falso: la marcación va de 0° a 90° por cada banda. Cierto: va de proa a popa por cada banda, de 0° a 180°.
- Falso: el rumbo es una línea de posición. Cierto: el rumbo dice hacia dónde vas, no dónde estás; demora, enfilación y oposición sí lo son.
- Falso: con dos demoras de aguja te sitúas directamente en la carta. Cierto: necesitas además el desvío para pasarlas a verdaderas («el rumbo de aguja nunca se dibuja»).
- Falso: una enfilación es fiable si los objetos están cerca del barco, o si el posterior es más bajo. Cierto: lejos, bien separados y el posterior igual o más alto.
- Falso: el ángulo entre la línea proa-popa y la visual a un faro se llama enfilación. Cierto: es la marcación; la enfilación es ver dos objetos alineados, uno detrás de otro.

**Minijuego** (13 preguntas reales de examen en estas clases):

- El ángulo horizontal que forma la línea proa-popa del barco con la visual a un objeto se denomina: *(and-2020-c3-t38)*
- Navegando obtenemos una demora de aguja de cabo Espartel y otra demora de aguja de Punta Gracia, ¿podemos posicionarnos directamente en la carta de navegación? *(and-2021-c1-t38)*
- Cual de las siguientes no es una línea de posición. *(and-2021-c2-t37)*

**Relacionados:** 10.3, 11.2, 11.3.

#### 10.5 · Mareas, viento y corriente

🔎 Profundiza · ⏳ pendiente · clases per-10-8, per-10-9

Por qué sube y baja el mar, qué son amplitud y duración, mareas vivas y muertas, el cero hidrográfico y qué le hacen a la marea la presión y el viento; y después, qué te saca del rumbo: el viento (abatimiento) y la corriente (deriva). Preguntas de definiciones muy cruzadas entre sí.

**Gancho:** Andrés fondea en una cala donde la carta marca dos metros, un día de borrasca, y la sonda le da bastante más; al salir, mira atrás y ve que la estela no sale recta por la popa. Las dos cosas tienen explicación.

**Para llevarse:**

- La marea la produce la atracción de la Luna y del Sol; la Luna influye más, y en nuestras costas suele ser semidiurna: dos pleamares y dos bajamares en algo menos de 25 horas.
- Amplitud es la diferencia de alturas entre pleamar y bajamar; duración es la diferencia de horas entre una bajamar y la pleamar siguiente (o al revés), ronda las seis horas y cuarto y no es siempre igual.
- Mareas vivas con luna nueva y llena (Sol, Luna y Tierra alineados, más amplitud); mareas muertas en cuarto creciente y menguante (menos amplitud).
- El cero hidrográfico es el plano de referencia desde el que se miden las sondas de la carta; en España es la Mayor Bajamar Astronómica (LAT), la bajamar más baja esperable; sonda del momento = sonda de la carta + altura de la marea.
- Baja presión: la marea queda más alta de lo previsto, alrededor de 1 cm por cada hectopascal por debajo de la normal; alta presión, menos agua; viento fuerte de la mar a tierra, mareas más altas.
- Abatimiento: el viento empuja la obra muerta hacia sotavento; es el ángulo entre la estela y la crujía, positivo con viento por babor y negativo con viento por estribor.
- Deriva: la produce solo la corriente, que arrastra por igual a todos los barcos sea cual sea su tamaño; el viento se nombra por de dónde viene y la corriente por hacia dónde va.

**Trampas del examen:**

- Falso: la amplitud es la diferencia de horas entre pleamar y bajamar, o entre dos pleamares. Cierto: amplitud son alturas entre pleamar y bajamar; la duración son horas.
- Falso: la duración de la marea es siempre 6 horas. Cierto: ronda las 6 h y cuarto y cambia de un día a otro y de un lugar a otro.
- Falso: la sonda de la carta es la altura de la bajamar del día, o se mide desde el nivel medio. Cierto: es la distancia del fondo al cero hidrográfico.
- Falso: el cero hidrográfico es «la mayor marea astronómica», o la LAT es una referencia horizontal. Cierto: es la mayor bajamar, la más baja, y es una referencia vertical.
- Falso: la baja presión hace bajar la marea, o solo influye por debajo de cierto valor. Cierto: la sube, y el efecto existe siempre.
- Falso: el ángulo entre la estela y la crujía es la deriva, y la deriva crece con el viento. Cierto: ese ángulo es el abatimiento; la deriva se debe solo a la corriente.

**Minijuego** (16 preguntas reales de examen en estas clases):

- La diferencia entre la hora de la bajamar y la hora de la pleamar siguiente se conoce como: *(and-2021-c2-t39)*
- ¿Cuál es la influencia de una baja presión en las mareas?: *(and-2024-c2-t39)*
- La deriva que sufre una embarcación: *(and-2024-c3-t39)*

**Relacionados:** 10.2, 9.1, 11.1.

### Tema 11 · Carta de navegación (eliminatorio)

#### 11.0 · El examen de carta del PER, paso a paso

🧭 Panorama · ⏳ pendiente · clases per-11-1, per-11-2, per-11-3, per-11-4, per-11-5, per-11-6, per-11-7, per-11-8, per-11-9

El mapa del examen de carta: las cuatro últimas preguntas (de la 42 a la 45) se resuelven sobre la carta del Estrecho, siempre sin viento ni corriente, y casi todas siguen el mismo orden: corrección total, pasar a verdadero, trazar, medir y volver a aguja. Como el audio no puede dibujar, el episodio enseña a razonar el orden de los pasos y a reconocer el tipo de problema por el enunciado.

**Gancho:** Andrés quiere cruzar hasta Ceuta y tiene sobre la mesa la carta del Estrecho, el compás de puntas y el transportador, pero no sabe por dónde empezar. Elena le enseña que siempre empieza igual: preguntándose qué dato es de aguja y qué dato es verdadero.

**En el examen:** El tema 11 son 4 preguntas (de la 42 a la 45) con un máximo de 2 fallos: es eliminatorio, y fallar 3 suspende el examen aunque el resto salga bien. Se resuelven sobre la carta con la teoría del tema 10.

**Recorre:** La carta del Estrecho: coordenadas, distancias y rumbos · Corrección total y conversión de rumbos · Rumbo directo, distancia y hora de llegada · Situación de estima · Líneas de posición: demora, marcación y distancia · Situación por dos demoras o marcaciones simultáneas · Oposición o enfilación y demora: situación y distancia a un faro · Demoras no simultáneas (y cuándo no hace falta trasladar) · Rumbo para pasar a una distancia de un faro.

**Para llevarse:**

- La carta del Estrecho es Mercator: la latitud se lee en los márgenes laterales (siempre N), la longitud arriba o abajo (siempre W), y las distancias se miden en la escala de latitudes, porque allí un minuto de longitud vale solo unas 0,8 millas.
- Primer paso de casi todo: corrección total = declinación + desvío, actualizando la declinación de la carta al año y redondeando al grado; con una enfilación u oposición, Ct = Dv − Da, sin usar el rumbo que dé el enunciado.
- Rumbo directo: situar salida y llegada (la luz exacta que pide el enunciado), medir el Rv y la distancia, y dar al timón Ra = Rv − Ct; tiempo = distancia ÷ velocidad, sumado a la HRB de salida.
- Estima: Rv = Ra + Ct, distancia = velocidad × tiempo, y desde la salida se traza el Rv y se mide la distancia; si el rumbo ya es verdadero, la corrección total sobra.
- Demora y distancia: se pasa la observación a verdadera y desde el faro se traza la opuesta (Dv ± 180°), cortándola con el arco de la distancia.
- Dos marcaciones a la vez: Dv = Rv + M (estribor suma, babor resta), sin volver a aplicar la corrección total, y desde cada faro la opuesta; el corte es la situación.
- Enfilación u oposición con una demora: la recta de los dos faros ya es línea de posición sin correcciones; y la distancia que piden suele ser a otro faro distinto.
- Demoras no simultáneas: la primera línea viaja con el barco; pero en el PER las observaciones del examen son simultáneas y se cruzan sin trasladar nada.
- Pasar a X millas de un faro: circunferencia de ese radio y tangente por el lado correcto (por fuera, por el mar, si no dicen la banda); «a X millas al Sur del faro» es un punto, no una tangente.

**Minijuego** (72 preguntas reales de examen en estas clases):

- Al encontrarnos en la enfilación de los faros de Punta Paloma y Punta Camarinal marcamos este último en demora de aguja 112º. Calcular la corrección total. *(and-2026-c2-q42)*
- Al cruzar la oposición de los faros de Isla de Tarifa y Punta Cires, marcamos Punta Alcázar en demora verdadera 205º. Calcular a qué distancia nos encontramos del faro de Punta Europa. *(and-2025-c3-q42)*
- A las 10h 00m del 25 de marzo de 2023, navegando al Rumbo verdadero 340º, nos encontramos al Sur verdadero del faro de Cabo Trafalgar y obtenemos marcación al faro de Punta Camarinal 110º ER. Situados, damos rumbo para pasar a 5 millas del faro de Cabo Roche. Calcular el rumbo de aguja, sabiendo que la declinación magnética es 4º NW y que el desvío de la aguja es +4º (más) *(and-2023-c1-q45)*

#### 11.1 · La carta del Estrecho, la corrección total y el rumbo directo

🔎 Profundiza · ⏳ pendiente · clases per-11-1, per-11-2, per-11-3

Lo primero del examen de carta: leer y situar coordenadas, medir distancias, rumbos y demoras, calcular la corrección total (con la rosa de la carta o con una enfilación u oposición) y el problema estrella, el rumbo directo con su hora de llegada. Un error de signo en la corrección total arrastra todos los ejercicios.

**Gancho:** Andrés quiere ir hacia un punto casi al este del suyo: mide la distancia llevando el compás al margen de arriba, le salen unas 26 millas y calcula la llegada; el día de la prueba llega bastante antes y además el rumbo de aguja no le cuadra. Al final del episodio sabrá en qué dos pasos se equivocó.

**Para llevarse:**

- Todo lo que se traza en la carta es verdadero; el timón solo entiende de aguja: «el rumbo de aguja nunca se dibuja».
- Las distancias, en la escala de latitudes: a unos 36° N un minuto de longitud vale unas 0,8 millas, así que 10′ de longitud son unas 8 millas, no 10.
- Corrección total = declinación + desvío, con E o NE positivo y W o NW negativo; si la declinación sale de la rosa, se actualiza al año (variación anual por años) y se redondea al grado: «2° 50′ W 2005 (7′ E)» da 1° W en 2024 y 0° en 2026.
- Con una enfilación u oposición, Ct = Dv − Da: la Dv se mide en la carta con la recta entre los dos faros, en el sentido del faro marcado; y el desvío, si lo piden, es Ct − dm.
- El orden del rumbo directo: situar salida, situar la llegada en la luz exacta, medir el Rv desde la salida, medir la distancia, calcular la corrección total y dar Ra = Rv − Ct.
- Hora de llegada: tiempo = distancia ÷ velocidad, y los decimales por 60: 12,7 millas a 8 nudos son 1,59 h, una hora y 35 minutos; de 20:00 a 21:35 (un minuto arriba o abajo es normal).
- Para situarte respecto a un faro: «a 4 millas al Sur verdadero del faro» se traza desde el faro hacia el 180°; si estás al sur del faro, lo ves en demora 000°.

**Trampas del examen:**

- Falso: en una enfilación u oposición, la corrección total sale restando el rumbo que da el enunciado. Cierto: el rumbo no se usa; Ct = Dv − Da.
- Falso: en una oposición da igual hacia qué faro mides la Dv. Cierto: los dos faros quedan a 180° el uno del otro; si mides hacia el que no marcaste, la corrección total sale disparatada.
- Falso: Ra = Rv + Ct. Cierto: de la carta al timón se cambia el signo, Ra = Rv − Ct; con Ct negativa, el rumbo de aguja sale mayor que el verdadero.
- Falso: la declinación W con variación anual E crece con los años. Cierto: si tienen sentidos contrarios, disminuye; y si el enunciado ya da la declinación, se usa tal cual.
- Falso: cualquier luz del puerto vale como llegada. Cierto: en Barbate hay faro de tierra y luz roja del espigón, en Ceuta se pide la luz verde de la bocana y en Tánger la farola del espigón; equivocarse de luz te lleva a la opción de al lado.
- Falso: «demora 310° desde el faro» y «demora 310° al faro» son lo mismo. Cierto: la primera se traza hacia el 310° desde el faro; en la segunda el barco está hacia el 130° del faro.

**Minijuego** (34 preguntas reales de examen en estas clases):

- Navegamos al rumbo de aguja = 340º. Al encontrarnos en la oposición de los faros de Punta Almina y Punta Carnero, marcamos el faro de Punta Carnero en demora de aguja 332º. Calcular la corrección total. *(and-2025-c3-q45)*
- Nos encontramos en la situación 35º 53,0′ N, 006º 02,5′ W y queremos navegar hasta la situación 35º 52,0′ N, 005º 36,7′ W. ¿Qué rumbo de aguja tendremos que poner y qué distancia recorremos, teniendo en cuenta que el desvío es +2º y la declinación magnética = 4º NW? *(and-2025-c2-q43)*
- A las 13h 00m del 25 de marzo de 2023, nos encontramos en situación verdadera 35º 55,0' N, 005º 15,0' W. Situados y en ausencia de viento y corriente, damos rumbo al puerto de Algeciras (luz roja del espigón) con velocidad del barco 8 nudos. Calcular el rumbo de aguja, sabiendo que la declinación magnética indicada en la carta es 3° 40′ E 2018 (8′ W) y que el desvío es +6° (más). *(and-2023-c1-q42)*

**Relacionados:** 10.1, 10.3, 11.2.

#### 11.2 · Estima y líneas de posición

🔎 Profundiza · ⏳ pendiente · clases per-11-4, per-11-5

Dos maneras de saber dónde estás: por estima (de dónde saliste, a qué rumbo, a qué velocidad y cuánto tiempo) y por líneas de posición (una demora o marcación y una distancia). En el examen el truco está en el orden: primero construir la salida, luego pasar a verdadero, y solo después trazar.

**Gancho:** Andrés navega una tarde a 6 nudos y se le apaga el plotter. Sabe dónde estaba a las doce, qué rumbo lleva el timón y qué hora es; luego ve un faro por babor y mide su distancia con el radar. Con eso, ¿dónde está?

**Para llevarse:**

- Orden de la estima: situar la salida, corrección total = declinación + desvío, Rv = Ra + Ct, tiempo navegado, distancia = velocidad × tiempo, y desde la salida trazar el Rv y medir la distancia.
- Los minutos se pasan a horas dividiendo entre 60: 1 h 30 min son 1,5 h; 1 h 45 min, 1,75 h; 1 h 42 min, 1,7 h; de 18:20 a 20:35 a 6 nudos salen 13,5 millas.
- Si el enunciado ya da el rumbo verdadero, la corrección total sobra: «Rv 110°, Ct +10°» se traza al 110°.
- La salida muchas veces se construye: «al Sur verdadero de un faro y al Oeste verdadero de otro» es el cruce del meridiano del primero con el paralelo del segundo.
- Marcación a demora: Dv = Rv + M, estribor suma y babor resta; con Rv 070° y el faro 100° por babor, Dv = −30°, que es 330°.
- La demora se traza desde el faro con la opuesta, Dv ± 180°: si ves el faro en Dv 154°, desde el faro trazas el 334°, y con el compás abierto a la distancia cortas esa línea.
- Después de la estima pueden pedir la distancia o la demora a un faro: la demora «desde el faro» es la opuesta de la que medirías desde el barco (si ves el faro al 073°, desde el faro es el 253°).

**Trampas del examen:**

- Falso: al rumbo verdadero que da el enunciado se le aplica también la corrección total. Cierto: solo se corrige lo que es de aguja.
- Falso: 1 h 30 min son 1,3 h. Cierto: son 1,5 h; los minutos se dividen entre 60.
- Falso: la demora se traza desde el barco con su valor tal cual. Cierto: como no sabes dónde está el barco, se traza desde el faro con la opuesta.
- Falso: la marcación por babor se suma. Cierto: se resta; si sale negativa se suma 360° y si pasa de 360° se resta 360°.
- Falso: el faro de «Punta Gracia» y el de «Punta Camarinal» son dos faros distintos. Cierto: es el mismo faro, en la Torre de Gracia, Oc(2) 5s 13M.
- Falso: un arco de distancia a otro faro corta la demora en un único punto. Cierto: puede cortarla en dos; te quedas con el que cuadre con el enunciado.

**Minijuego** (19 preguntas reales de examen en estas clases):

- Situados en posición l=35º 50´ N y L= 006º 10´W Navegamos a Rv= 032º y a una Velocidad= 6 Nudos, transcurridas 2,5 horas, ¿A qué distancia de Punta Gracia nos encontraremos? *(and-2021-c2-q44)*
- El 13 de junio de 2026, al ser HRB = 12h 00m, navegamos a 6 nudos al rumbo de aguja 154° y nos encontramos a 5 millas al W verdadero (oeste) del faro de Cabo Roche. Calcular la demora verdadera y distancia que nos encontramos desde el faro de Cabo Trafalgar al ser HRB = 13h 42m. La declinación magnética de la carta = 5º 20′ W 2010 (5′ E) y desvío de la aguja = -10º (menos). *(and-2026-c2-q44)*
- El 5 de julio de 2025 se observa el faro de Punta Almina en demora verdadera 154º y a una distancia de 6 millas. ¿Cuál es nuestra situación?: *(and-2025-c2-q42)*

**Relacionados:** 11.1, 10.4, 11.3.

#### 11.3 · Situarse: dos demoras, enfilaciones y demoras no simultáneas

🔎 Profundiza · ⏳ pendiente · clases per-11-6, per-11-7, per-11-8

Situarse cruzando dos líneas de posición: dos marcaciones o demoras tomadas a la vez, una enfilación u oposición con la demora de un tercer faro, y la diferencia entre observaciones simultáneas y no simultáneas. En el PER todas se cruzan sin trasladar; el error típico es aplicar la corrección total dos veces o equivocar el signo de babor.

**Gancho:** Andrés marca dos faros, uno por cada banda, hace las cuentas y el punto le cae en tierra. Repasando, descubre que sumó la marcación de babor y le volvió a aplicar la corrección total a las demoras.

**Para llevarse:**

- Orden: corrección total, Rv = Ra + Ct, cada observación a demora verdadera (Dv = Da + Ct para una demora de aguja, Dv = Rv + M para una marcación), desde cada faro la opuesta, y el corte es la situación.
- La marcación se suma al Rv, que ya lleva la corrección total: no se vuelve a corregir la demora que sale. Si el rumbo ya es verdadero, la corrección total no hace falta para nada.
- Con dos marcaciones, la de estribor suma y la de babor resta: con Rv 300°, un faro 40° por babor está en 260° y otro 70° por estribor en 370°, es decir, 010°.
- Si el rumbo viene en cuadrantal (S 76° W), se pasa antes a circular (256°); una marcación de más de 90° cae hacia la aleta y sigue siendo Dv = Rv + M.
- La enfilación o la oposición ya es una línea de posición sin correcciones; cruzada con la demora de un tercer faro da la situación: en la oposición el corte está entre los dos faros, en la enfilación en la prolongación.
- «Al Sur verdadero de un faro» es ver ese faro al 000°: su meridiano hacia el sur; «al Oeste verdadero» es verlo al 090°: su paralelo hacia el oeste.
- Si las dos observaciones son de horas distintas, la primera línea viaja con el barco (se traslada con el rumbo y la distancia navegados); si son a la vez, se cruzan directamente y la situación anterior solo da el rumbo y la distancia navegada.

**Trampas del examen:**

- Falso: a la demora que sale de Rv + M hay que aplicarle la corrección total. Cierto: el Rv ya la lleva; se estaría aplicando dos veces.
- Falso: «más tarde obtenemos marcación a dos faros» obliga a trasladar líneas desde la situación anterior. Cierto: las dos marcaciones son simultáneas y se cruzan sin trasladar; el traslado es materia del Patrón de Yate.
- Falso: la distancia que piden es a uno de los faros que has usado para situarte. Cierto: suele ser a otro faro, a menudo lejano; lee la pregunta hasta el final.
- Falso: dos líneas casi paralelas dan una buena situación. Cierto: la mejor es con un corte cercano a 90°; si salen casi paralelas, un error pequeño mueve mucho el punto.

**Minijuego** (14 preguntas reales de examen en estas clases):

- Navegamos a 8 nudos al rumbo verdadero 090º y obtenemos marcación al faro de Cabo Espartel 120º ER y simultáneamente marcación al faro de Punta Malabata 30º ER. Calcular la situación. *(and-2023-c2-q43)*
- Al cruzar la oposición de los faros de Punta Alcázar y la Isla de Tarifa, marcamos Punta Cires en demora verdadera 080º. Calcular a qué distancia nos encontramos del faro de Punta Alcázar. *(and-2024-c1-q42)*
- A HRB = 12h 00m del 25 de julio de 2020, nos encontramos a 4 millas al Sur verdadero del faro de Punta Carnero, navegando al Rumbo de aguja 244º. Más tarde, obtenemos Marcación al Faro de Punta Cires 110º Babor (BR) y Marcación al Faro de Punta Malabata 30º babor (BR). Calcular la situación al obtener las marcaciones, sabiendo que la declinación magnética es 2º NE y el Desvío = +4º (más). *(and-2020-c1-q42)*

**Relacionados:** 10.4, 11.2, 11.4.

#### 11.4 · Pasar a una distancia de un faro

🔎 Profundiza · ⏳ pendiente · clase per-11-9

El rumbo para pasar a una distancia de seguridad de un faro o un cabo: la tangente a una circunferencia con centro en el faro. Lo difícil no es trazarla, sino elegir cuál de las dos tangentes y no confundir «pasar a X millas del faro» con «ir a un punto a X millas al Sur del faro».

**Gancho:** Andrés quiere doblar Cabo Trafalgar sin arrimarse, «a cuatro millas por lo menos», y no sabe qué rumbo dar: si apunta al faro se acerca demasiado y si se abre mucho pierde camino.

**Para llevarse:**

- Las millas de paso son la distancia mínima a la que pasarás del faro: el rumbo buscado es la recta tangente a la circunferencia de ese radio con centro en el faro.
- Orden: situarse, trazar con centro en el faro la circunferencia del radio pedido (medido en la escala de latitudes), trazar desde la situación la tangente correcta, medir su Rv y dar Ra = Rv − Ct.
- Dejar el faro por estribor es pasar con el faro a la derecha: se toma la tangente que queda a la izquierda de la visual al faro, Rv = Dv − α. Por babor, la de la derecha, Rv = Dv + α.
- El ángulo de la tangente cumple seno de alfa = distancia de paso ÷ distancia al faro: a 10 millas de un faro en Dv 004°, pasar a 2,5 millas por babor da alfa ≈ 14,5° y Rv ≈ 019°.
- Si no dicen la banda, la tangente buena es la que pasa por fuera, por el lado del mar: para pasar a 4 millas de Cabo Trafalgar hacia el WNW desde Tarifa, o a 5 de Cabo Roche hacia el NW, se deja el faro por estribor.
- Situarse por dos distancias da dos puntos de corte: el enunciado siempre trae una pista para elegir («al este de la bahía de Algeciras», «más al este que Punta Paloma»).

**Trampas del examen:**

- Falso: «pasar a 1 milla al Sur verdadero del faro» es un problema de tangente. Cierto: es un punto concreto a 1 milla hacia el 180° del faro, y se va directo a él.
- Falso: da igual qué tangente tomes. Cierto: la otra te deja el faro por la banda contraria y, en el examen, suele meterte en tierra.
- Falso: dejar el faro por estribor es tomar la tangente de la derecha. Cierto: el faro queda a tu derecha, así que la derrota pasa por la izquierda de la visual (Dv − α).
- Falso: con dos distancias el corte es único. Cierto: hay dos puntos; busca en el enunciado la pista para quedarte con uno antes de seguir.
- Falso: una vez medida la tangente, ese ya es el rumbo que se da al timón. Cierto: es un rumbo verdadero; al timón va Ra = Rv − Ct.

**Minijuego** (5 preguntas reales de examen en estas clases):

- A HRB = 12h 00m nos encontramos a 5 millas del faro de Punta Paloma y al Oeste verdadero del faro de Isla Tarifa, en una longitud más al este que la de Punta Paloma. Calcular el rumbo de aguja para pasar a 4 millas del faro de Cabo Trafalgar, sabiendo que la declinación magnética = 5° NE y desvío de la aguja = –5° (menos). *(and-2024-c3-q44)*
- Nos encontramos a 4,2 millas de la Isla del Perejil y a 5,3 millas del faro de punta Almina. Calcular el rumbo de aguja para pasar a 2,5 millas de punta Europa, dejándola por la banda de babor. Declinación magnética = 4° NW, desvío de la aguja = –3° (menos). La Isla del Perejil (35° 54,8′ N, 005° 25,1′ W) se encuentra junto a la costa africana del Estrecho, prácticamente al sur de punta Carnero. *(and-2022-c3-q44)*
- El 21 de marzo de 2026 nos encontramos al este de la Bahía de Algeciras, a 5,4 millas del faro de Punta Europa y a 12,0 millas del faro de Punta Almina. Calcular el rumbo de aguja para pasar a 1 milla al sur verdadero del faro de la Isla de Tarifa. Desvío de aguja = –6º (menos). Declinación magnética de la carta, redondeando el resultado al grado más próximo. *(and-2026-c1-q44)*

**Relacionados:** 11.1, 11.2, 11.3.
