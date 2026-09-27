# Torneo Poker Rotativo

App de una sola página (`index.html`) publicada como artefacto con base compartida:
https://claude.ai/artifact/R3GvawhrQCrd4wXij4CxAd

- **Programar partidas** para cualquier fecha y hora, eligiendo el tipo (Rápido = tipo miércoles,
  Con rebuy = tipo viernes), con opción de repetir cada semana.
- **Proyectar**: pantalla para TV con reloj, ciegas actuales y próximas, pozo, premios y la lista de
  jugadores con su recompra (rápido) o su cantidad de rebuys (con rebuy). Abrir el link con `#pantalla`
  entra directo. Teclas: espacio = pausa/seguir, ← → = nivel, Esc = salir.
- **Rápido (miércoles)**: niveles de 7 min, 1 recompra incluida en la entrada (se marca quién la pidió),
  puntos 5/2, premio 70/30.
- **Con rebuy (viernes)**: niveles de 12 min, rebuys por jugador hasta terminar el nivel 10-20,
  puntos 7/3/1, premio 60/30/10.
- **Timer por etapas**: los niveles no avanzan solos. Al llegar a 0:00 suena la alarma y el reloj queda
  esperando "Arrancar siguiente". Después del 10-20 hay un break (20 min por defecto, 0 = sin break).
  La alarma necesita un primer toque en la pantalla del dispositivo (regla de los navegadores).
- Ciegas (chica): 1-2-3-4-5-6-8-10-12-15-20-25-30-40-50-60-80-100…; la grande es el doble.
- Asistencia: No va / Juega / Juega + come. La comida se carga como total (se divide entre los que
  comen) o directamente como monto por persona.
- **Avatares**: cada jugador elige ficha de color (con sus iniciales), carta, emoji o foto propia
  (se recorta y achica a 160 px y se guarda en su documento). "¿Quién sos?" arriba a la derecha
  recuerda en ese dispositivo quién es y pone su fila primero.
- **Eliminaciones**: se va marcando quién queda afuera (dos toques) y eso da el puesto final de cada
  uno; con uno solo en pie se completa el podio. En rápido se habilita al arrancar el reloj, en con
  rebuy cuando se cierra el rebuy. "Volver" deshace una eliminación.
- Cada jugador puede tener mano favorita (ej. 44, K9) y frase típica; se muestran en chiquito entre paréntesis al lado del nombre. Se cargan con "Editar" en Jugadores.
- Cada jugador indica si juega miércoles y viernes o solo viernes (en Editar). En las partidas Rápido (miércoles) no aparecen en la asistencia los de solo viernes. Cuando un jugador de solo viernes se elige en "¿Quién sos?", la app le oculta todo lo de los miércoles y la Tabla (los administradores ven todo).
- El reloj no se puede empezar (ni adelantar de nivel) antes de la fecha y hora programadas: el botón muestra "Empieza a las …" y se habilita solo. Para empezar antes, se cambia la hora del partido.
- Terminar en cualquier momento: botón "Terminar partida ↓" arriba; se eligen los ganadores (también entre quienes no se anotaron, que quedan como que jugaron) y se cierra aunque falten puestos, con confirmación.
- Cada partida puede tener un nombre (ej. "Cumple de Coco") y una dirección con link de Google Maps ("Cómo llegar"); por defecto, Eduardo Acevedo 29. Se editan en Partida → "Nombre y lugar".
- Cumpleaños: cada jugador tiene su fecha (Jugadores → Editar; año opcional). En cada partido se avisa si alguno de los anotados cumplió desde el partido anterior (o cumple ese día). Firu y Coco tienen la solapa 🎂 con los próximos cumples y el regalo de cada uno: gasto, quiénes ponen, cuánto cada uno (dividir en partes iguales) y quién pagó. En Firebase, esos datos solo los pueden leer ellos.
- Mesas: hasta 11 jugadores, una mesa; con 12 o más, dos mesas mitad y mitad. Se eligen los dos repartidores y "Sortear mesas" manda a cada uno a una mesa distinta y reparte al resto al azar (si son impares, la mesa 1 lleva uno más). En cada mesa el asiento 1 es el que reparte y del 2 en adelante se sortea. Con las eliminaciones avisa cuando hay que equilibrar (2 o más de diferencia: sortea quién pasa, nunca el que reparte, y a qué asiento libre) y, con 9 o menos en juego, juntar todo en la mesa 1.
- Resultado: se completa solo con las eliminaciones, pero se puede elegir 1º/2º/3º a mano en cualquier momento; desde ahí las eliminaciones no lo pisan (botón "Usar las eliminaciones" para volver).
- Premios: el del 1º se redondea para arriba a los $10.000; el resto se reparte en la misma proporción, redondeando para arriba el 2º, y el último se lleva lo que queda (el pozo cierra exacto).
- Cebolla 🧅: el primero que queda sin puntos (3º en Rápido, 4º en Con rebuy). Sale de las eliminaciones o se elige a mano en Resultado; la Tabla cuenta cuántas veces fue cebolla cada uno y muestra "el más cebolla".
- Estadísticas: puntos, partidas jugadas, % de asistencia, puestos, rebuys, comidas y plata ganada,
  en total o por tipo de partida.
  En "Todos" se suman los puntos y partidas ganadas (1º) de la liga anterior (campo `prev` de cada jugador).
  En "Todos" > Total, columnas Mié y Vie con los puntos de cada tipo de partida como referencia.
  Vista "Por partido jugado": puntos, % de victorias, % de podios, rebuys y plata ganada divididos por las partidas que jugó cada uno (sin la liga anterior).

Datos en la base del artefacto: `players/<id>` y `games/<id>`. Si se abre fuera de claude.ai,
guarda en el navegador (localStorage).

## Video explicativo

`video/liga-poker-tutorial.mp4` (2:33, vertical para celular, con voz en castellano rioplatense) recorre la app paso a paso con datos de ejemplo. El texto de la narración está en `video/narracion.json`; `video/voz.py` genera la voz (Piper es_AR "daniela" con sherpa-onnx) `video/grabar.mjs` graba la app sincronizada con cada frase y `video/mezclar.py` agrega de marco la canción "Miércoles de Poker" (intro, pausa a mitad del video y cierre; bajita mientras habla la voz).

## Versión pública (GitHub Pages + Firebase)

En https://claudiabits21.github.io/Poker-rotativo/ la app guarda los datos en Firebase (proyecto `poker-rotativo`); en claude.ai sigue usando la base del artefacto.

- Nadie necesita cuenta: todos entran con una sesión anónima y pueden ver la liga y manejar la partida (reloj, rebuys, eliminaciones, mesas, cuentas, resultado) y los jugadores.
- Cada jugador elige su nombre en "¿Quién sos?" y crea un PIN de 4 números (🔒 en la lista cuando ya lo tiene). Con el PIN solo puede cambiar **su** asistencia; el celular lo recuerda.
- Administradores: Firu, Coco y Mosca con su PIN, y claudia@rodo.es con Google ("Entrar como administradora" al pie). Pueden cambiar la asistencia de cualquiera, resetear PINs, borrar partidas y jugadores y sumar administradores (mails de Google).
- El PIN nunca se guarda en claro: Firestore guarda un hash que nadie puede leer y las reglas (`firestore.rules`) validan todo del lado del servidor.
- `data/liga.json` es la exportación de la base de claude.ai; el botón "Importar datos" (Jugadores → Administración, con la liga vacía) la carga en Firebase.

Configuración en la consola de Firebase: Authentication con Anónimo y Google activados y `claudiabits21.github.io` en dominios autorizados; Firestore en modo producción con las reglas de `firestore.rules`.
