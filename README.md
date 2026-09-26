# Liga de Poker

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
- Mesas: hasta 11 jugadores, una mesa; con 12 o más, dos mesas mitad y mitad. Se eligen los dos repartidores y "Sortear mesas" manda a cada uno a una mesa distinta y reparte al resto al azar (si son impares, también se sortea qué mesa tiene uno más).
- Resultado: se completa solo con las eliminaciones, pero se puede elegir 1º/2º/3º a mano en cualquier momento; desde ahí las eliminaciones no lo pisan (botón "Usar las eliminaciones" para volver).
- Estadísticas: puntos, partidas jugadas, % de asistencia, puestos, rebuys, comidas y plata ganada,
  en total o por tipo de partida.
  En "Todos" se suman los puntos y partidas ganadas (1º) de la liga anterior (campo `prev` de cada jugador).
  Vista "Por partido jugado": puntos, % de victorias, % de podios, rebuys y plata ganada divididos por las partidas que jugó cada uno (sin la liga anterior).

Datos en la base del artefacto: `players/<id>` y `games/<id>`. Si se abre fuera de claude.ai,
guarda en el navegador (localStorage).
