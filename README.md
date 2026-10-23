# Tarjeta de Cumpleaños · Jardín nocturno

Tarjeta interactiva hecha con HTML, CSS y JavaScript puro. No necesita instalación, dependencias ni compilación: se abre directamente en el navegador.

## Cómo abrirla

1. Abre `tarjeta-cumpleanos/index.html` con doble clic.
2. También puedes servir la carpeta localmente:

   ```bash
   cd tarjeta-cumpleanos
   python3 -m http.server 4173
   ```

   Y visitar `http://127.0.0.1:4173`.

## Qué incluye

- Validación de la edad: solo enteros mayores que 0.
- Mensaje grande de felicitación con la edad escrita.
- Pastel de dos pisos con tres velas.
- Cuatro formas de aparición de los tulipanes: brotar, flotar, deslizarse y aparecer.
- Globos que suben con vaivén, se pueden explotar con un toque y sueltan confeti.
- Confeti de celebración y sonidos sintetizados opcionales, desactivados por defecto.
- El pastel se puede tocar para pedir un deseo, apagar las velas y volver a encenderlas.
- Al volver a pulsar «Celebrar», se renuevan el mensaje, el pastel, las flores y los globos.

## Controles

- **Celebrar**: muestra la celebración.
- **Explotar un globo** (barra superior): alternativa de teclado para reventar un globo.
- **Sonido**: activa o desactiva los sonidos.
- **Pastel**: toca para soplar o reencender las velas.
- **Globos**: toca cualquier globo visible para explotarlo.

## Personalización

- Los colores principales están en las variables de `:root` al comienzo de `style.css`.
- Las frases según la edad están en `obtenerFrase()` dentro de `script.js`.
- La cantidad de flores y globos se ajusta en `crearTulipanes()` y `crearGlobos()`.
- Las animaciones y los estilos de entrada de los tulipanes están en `style.css`.

## Accesibilidad

- Formulario con etiqueta, ayuda y mensajes de error anunciados.
- Foco visible y movimiento del foco al mensaje de celebración.
- Enlace para saltar al contenido.
- Alternativa de teclado para explotar globos.
- Respeto por `prefers-reduced-motion`: se detienen animaciones y confeti.

## Archivos

- `index.html`: estructura, textos y dibujos SVG.
- `style.css`: diseño, animaciones y adaptación a móvil.
- `script.js`: validación, celebración, flores, globos, confeti y sonido.
