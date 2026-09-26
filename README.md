# Liga de Poker

App de una sola página (`index.html`) publicada como artefacto con base compartida:
https://claude.ai/artifact/R3GvawhrQCrd4wXij4CxAd

- **Programar partidas** para cualquier fecha y hora, eligiendo el tipo (Rápido = tipo miércoles,
  Con rebuy = tipo viernes), con opción de repetir cada semana.
- **Proyectar**: pantalla para TV con reloj, ciegas actuales y próximas, pozo, premios y la lista de
  jugadores con su recompra (rápido) o sus rebuys en palitos (con rebuy). Abrir el link con `#pantalla`
  entra directo. Teclas: espacio = pausa/seguir, ← → = nivel, Esc = salir.
- **Rápido (miércoles)**: niveles de 7 min, 1 recompra incluida en la entrada (se marca quién la pidió),
  puntos 5/2, premio 70/30.
- **Con rebuy (viernes)**: niveles de 12 min, rebuys por jugador (palitos de truco) hasta terminar el nivel 10-20,
  puntos 7/3/1, premio 60/30/10.
- Ciegas (chica): 1-2-3-4-5-6-8-10-12-15-20-25-30-40-50-60-80-100…; la grande es el doble.
- Asistencia: No va / Juega / Juega + come. La comida se divide entre los que comen.
- **Avatares**: cada jugador elige ficha de color (con sus iniciales), carta, emoji o foto propia
  (se recorta y achica a 160 px y se guarda en su documento). "¿Quién sos?" arriba a la derecha
  recuerda en ese dispositivo quién es y pone su fila primero.
- Estadísticas: puntos, partidas jugadas, % de asistencia, puestos, rebuys, comidas y plata ganada,
  en total o por tipo de partida.

Datos en la base del artefacto: `players/<id>` y `games/<id>`. Si se abre fuera de claude.ai,
guarda en el navegador (localStorage).
