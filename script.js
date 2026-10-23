// ==========================================================
// TARJETA DE CUMPLEAÑOS · JAVASCRIPT
// ----------------------------------------------------------
// Todo ocurre en el navegador, sin servidor.
// Lee el código de arriba a abajo: primero los elementos,
// después las funciones y al final los eventos.
// ==========================================================

// ---------- 1. Elementos de la página ----------
const formulario = document.getElementById("form-cumple");
const campoEdad = document.getElementById("edad");
const errorEdad = document.getElementById("error-edad");
const campoContenedor = campoEdad.closest(".campo");

const vistaInicio = document.getElementById("vista-inicio");
const vistaCelebracion = document.getElementById("vista-celebracion");
const tituloCelebracion = document.getElementById("titulo-celebracion");
const edadNumero = document.getElementById("edad-numero");
const edadLector = document.getElementById("edad-lector");
const unidadLector = document.getElementById("unidad-lector");
const unidadEdad = document.getElementById("unidad-edad");
const fraseEdad = document.getElementById("frase-edad");

const botonPastel = document.getElementById("pastel-boton");
const pastelEdad = document.getElementById("pastel-edad");
const pastelUnidad = document.getElementById("pastel-unidad");
const pistaPastel = document.getElementById("pista-pastel");
const aviso = document.getElementById("aviso");

const jardin = document.getElementById("jardin");
const capaGlobos = document.getElementById("globos");
const botonGlobo = document.getElementById("boton-globo");
const botonSonido = document.getElementById("boton-sonido");

const lienzoConfeti = document.getElementById("confeti");
const contextoConfeti = lienzoConfeti.getContext("2d");

// El sistema puede pedir que se reduzcan las animaciones.
// En ese caso mostramos una versión más tranquila de la tarjeta.
const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- 2. Estado de la tarjeta ----------
let edadActual = 0;
let pastelSoplado = false;
let audioContexto = null;
let sonidoActivo = false;

// Guardamos los temporizadores para poder cancelarlos al volver a celebrar.
const temporizadores = new Set();
let intervaloGlobos = null;
let temporizadorAviso = null;

// Colores de los globos: claro, normal, oscuro y nombre para accesibilidad.
const PALETA_GLOBOS = [
  { claro: "#ffc2b8", base: "#ff6b5e", oscuro: "#bc3540", nombre: "coral" },
  { claro: "#a9f2dd", base: "#58d6c0", oscuro: "#16897f", nombre: "menta" },
  { claro: "#c4e6ff", base: "#79c6ff", oscuro: "#356ce0", nombre: "azul" },
  { claro: "#e3d2ff", base: "#c4a7ff", oscuro: "#7c5dda", nombre: "lila" },
  { claro: "#ffe9a8", base: "#ffd166", oscuro: "#d39124", nombre: "amarillo" },
  { claro: "#ffd0e0", base: "#ffa6c9", oscuro: "#d15089", nombre: "rosa" }
];

// ==========================================================
// 3. Utilidades pequeñas
// ==========================================================

// Número aleatorio decimal entre un mínimo y un máximo.
function aleatorio(minimo, maximo) {
  return Math.random() * (maximo - minimo) + minimo;
}

// Número aleatorio entero (sin decimales).
function entero(minimo, maximo) {
  return Math.round(aleatorio(minimo, maximo));
}

// Programa una función y guarda el temporizador para poder limpiarlo.
function programar(funcion, milisegundos) {
  const id = setTimeout(function () {
    temporizadores.delete(id);
    funcion();
  }, milisegundos);

  temporizadores.add(id);
  return id;
}

// Cancela todos los temporizadores pendientes.
function limpiarTemporizadores() {
  temporizadores.forEach(function (id) {
    clearTimeout(id);
  });
  temporizadores.clear();
}

// Elige una frase distinta según la edad.
function obtenerFrase(edad) {
  if (edad === 1) return "Tu primer viaje completo alrededor del sol. Que se repita muchas veces.";
  if (edad < 10) return "Cada año, una aventura nueva. Y esta apenas comienza.";
  if (edad < 18) return "Días grandes, sueños aún más grandes. Hoy se celebra todo lo que viene.";
  if (edad === 18) return "La mayoría de edad de una historia que promete muchísimo.";
  if (edad < 30) return "Todo lo que viene empieza a ponerse interesante.";
  if (edad < 40) return "La década dorada. Y esto solo es el comienzo.";
  if (edad < 50) return "La edad perfecta para hacer las cosas a tu manera.";
  if (edad < 60) return "La mitad del camino, con muchas rutas todavía por estrenar.";
  if (edad < 80) return "Cada vuelta al sol, una historia que merece contarse.";
  return "Un jardín entero se queda corto para tanto vivido.";
}

// ==========================================================
// 4. Validar el formulario
// ==========================================================

function mostrarError(mensaje) {
  errorEdad.textContent = mensaje;
  campoEdad.setAttribute("aria-invalid", "true");
  campoContenedor.classList.add("con-error");
  campoEdad.focus();
  campoEdad.select();
}

function limpiarError() {
  errorEdad.textContent = "";
  campoEdad.setAttribute("aria-invalid", "false");
  campoContenedor.classList.remove("con-error");
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault(); // No recargamos la página.

  const texto = campoEdad.value.trim();

  if (texto === "") {
    mostrarError("Escribe una edad para poder celebrar.");
    return;
  }

  const edad = Number(texto);

  if (!Number.isInteger(edad)) {
    mostrarError("La edad debe ser un número entero, sin decimales.");
    return;
  }

  if (edad <= 0) {
    mostrarError("La edad tiene que ser mayor que 0.");
    return;
  }

  // Evita números gigantes que romperían la maquetación de la tarjeta.
  if (!Number.isSafeInteger(edad)) {
    mostrarError("Esa edad es demasiado grande para la tarjeta.");
    return;
  }

  limpiarError();
  celebrar(edad);
});

// Si el usuario empieza a corregir, quitamos el error.
campoEdad.addEventListener("input", function () {
  if (errorEdad.textContent !== "") {
    limpiarError();
  }
});

// ==========================================================
// 5. La celebración
// ==========================================================

function celebrar(edad) {
  edadActual = edad;

  // Textos y edad del pastel
  const unidad = edad === 1 ? "año" : "años";

  edadNumero.textContent = edad;
  edadLector.textContent = edad;
  unidadLector.textContent = unidad;
  unidadEdad.textContent = unidad;
  pastelEdad.textContent = edad;
  pastelUnidad.textContent = unidad.toUpperCase();
  fraseEdad.textContent = obtenerFrase(edad);
  document.title = edad + " " + unidad + " · ¡Feliz cumpleaños!";

  // Si la edad tiene muchas cifras, el número del pastel se hace más pequeño.
  const cifras = String(edad).length;
  const tamanoEdadPastel = cifras > 3 ? "14" : (cifras > 2 ? "20" : "27");
  pastelEdad.setAttribute("font-size", tamanoEdadPastel);

  // Cambiamos de vista
  vistaInicio.hidden = true;
  vistaCelebracion.hidden = false;
  document.body.classList.add("celebrando");

  // Volvemos a lanzar la animación de entrada de la celebración.
  vistaCelebracion.classList.remove("entra");
  void vistaCelebracion.offsetWidth; // Fuerza al navegador a reiniciar la animación.
  vistaCelebracion.classList.add("entra");

  // Pastel encendido y mensaje limpio
  reiniciarPastel();
  aviso.textContent = "";
  aviso.classList.remove("visible");
  clearTimeout(temporizadorAviso);

  // El botón de globos solo tiene sentido durante la celebración.
  botonGlobo.hidden = false;

  // Nuevo jardín y nuevos globos
  limpiarJardinYGlobos();
  vaciarConfeti();
  crearJardin();
  crearGlobos();
  iniciarLluviaDeGlobos();
  lanzarConfetiDeCelebracion();

  // Un pequeño acorde si el sonido está activado
  sonidoCelebracion();

  // Llevamos el foco al título para que los lectores de pantalla
  // anuncien la felicitación y la página se desplace hasta ella.
  tituloCelebracion.focus();
}

// Deja el pastel con las velas encendidas.
function reiniciarPastel() {
  pastelSoplado = false;
  botonPastel.classList.remove("soplado");
  botonPastel.setAttribute("aria-label", "Soplar las velas del pastel de " + edadActual + " " + (edadActual === 1 ? "año" : "años"));
  pistaPastel.textContent = "Toca el pastel y pide un deseo";
}

// Muestra un mensaje breve debajo del pastel.
function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.classList.add("visible");

  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(function () {
    aviso.classList.remove("visible");
  }, 5200);
}

// El pastel se puede tocar para soplar o volver a encender las velas.
botonPastel.addEventListener("click", function () {
  if (!pastelSoplado) {
    pastelSoplado = true;
    botonPastel.classList.add("soplado");
    botonPastel.setAttribute("aria-label", "Volver a encender las velas del pastel de " + edadActual + " " + (edadActual === 1 ? "año" : "años"));
    pistaPastel.textContent = "Deseo pedido · toca para reencender las velas";
    mostrarAviso("Deseo pedido. Que todo lo bueno te encuentre.");
    sonidoSoplar();

    const caja = botonPastel.getBoundingClientRect();
    estallidoConfeti(caja.left + caja.width / 2, caja.top + caja.height * 0.28, 28, true);
  } else {
    pastelSoplado = false;
    botonPastel.classList.remove("soplado");
    botonPastel.setAttribute("aria-label", "Soplar las velas del pastel de " + edadActual + " " + (edadActual === 1 ? "año" : "años"));
    pistaPastel.textContent = "Toca el pastel y pide un deseo";
    mostrarAviso("Velas encendidas otra vez. Pide otro deseo.");
  }
});

// ==========================================================
// 6. Tulipanes por toda la pantalla
// ==========================================================

// Cuatro formas de entrada para que el jardín se sienta vivo.
const PATRON_ENTRADAS = [
  "brotar", "brotar", "flotar", "pop", "deslizar",
  "brotar", "pop", "flotar", "deslizar", "pop"
];

function crearJardin() {
  const ancho = window.innerWidth;
  const alto = window.innerHeight;
  const esMovil = ancho < 620;

  // Más pantalla, más flores. En móvil bajamos la cantidad para no saturar.
  let cantidad = Math.round((ancho * alto) / 52000);
  cantidad = Math.min(Math.max(cantidad, esMovil ? 12 : 16), 34);

  if (prefiereMenosMovimiento) {
    cantidad = Math.min(cantidad, 18);
  }

  for (let i = 0; i < cantidad; i += 1) {
    const tipo = PATRON_ENTRADAS[i % PATRON_ENTRADAS.length];
    const tulipan = crearTulipan(tipo, esMovil);
    jardin.appendChild(tulipan);
  }
}

function crearTulipan(tipo, esMovil) {
  const tulipan = document.createElement("div");
  tulipan.className = "tulipan";

  // Tamaño: las flores del móvil son algo más pequeñas.
  const tamano = entero(esMovil ? 42 : 54, esMovil ? 78 : 112);
  const opacidad = aleatorio(0.62, 1);

  tulipan.style.setProperty("--tamano", tamano + "px");
  tulipan.style.setProperty("--opacidad", opacidad.toFixed(2));
  tulipan.style.setProperty("--delay", aleatorio(0, 1.5).toFixed(2) + "s");
  tulipan.style.setProperty("--giro", aleatorio(-3.5, 3.5).toFixed(1) + "deg");
  tulipan.style.setProperty("--mecer", aleatorio(4.5, 7.5).toFixed(1) + "s");

  // Movimiento interior: un balanceo suave después de entrar.
  const movimiento = document.createElement("div");
  movimiento.className = "tulipan-movimiento";

  const dibujo = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  dibujo.setAttribute("viewBox", "0 0 120 240");
  dibujo.setAttribute("aria-hidden", "true");
  dibujo.setAttribute("focusable", "false");

  const uso = document.createElementNS("http://www.w3.org/2000/svg", "use");
  uso.setAttribute("href", "#tulipan-a");
  dibujo.appendChild(uso);

  // La mitad de los tulipanes se reflejan para que no parezcan copias.
  if (Math.random() < 0.5) {
    dibujo.classList.add("espejo");
  }

  movimiento.appendChild(dibujo);
  tulipan.appendChild(movimiento);

  // Versión tranquila: sin entradas largas, repartida por la pantalla.
  if (prefiereMenosMovimiento) {
    tulipan.classList.add("tulipan--quieto");
    tulipan.style.left = aleatorio(0, 92).toFixed(1) + "%";
    tulipan.style.top = aleatorio(4, 72).toFixed(1) + "%";
    return tulipan;
  }

  tulipan.classList.add("tulipan--" + tipo);

  // --- 1. Brotar desde abajo ---
  if (tipo === "brotar") {
    tulipan.style.left = aleatorio(2, 92).toFixed(1) + "%";
    tulipan.style.setProperty("--entrada", aleatorio(1.2, 1.9).toFixed(2) + "s");

    // Algunas flores quedan más al fondo.
    if (Math.random() < 0.3) tulipan.classList.add("tulipan--profundo");
  }

  // --- 2. Subir flotando ---
  if (tipo === "flotar") {
    tulipan.style.left = aleatorio(3, 90).toFixed(1) + "%";
    tulipan.style.setProperty("--entrada", aleatorio(3.4, 5.2).toFixed(2) + "s");
    tulipan.style.setProperty("--subida", entero(22, 70) + "vh");
    tulipan.style.setProperty("--deriva", entero(-18, 18) + "px");
  }

  // --- 3. Deslizarse desde un lado ---
  if (tipo === "deslizar") {
    const desdeIzquierda = Math.random() < 0.5;
    tulipan.style.top = aleatorio(8, 74).toFixed(1) + "%";
    tulipan.style.left = desdeIzquierda
      ? aleatorio(0, 8).toFixed(1) + "%"
      : aleatorio(78, 90).toFixed(1) + "%";
    tulipan.style.setProperty("--desde", (desdeIzquierda ? "-125vw" : "125vw"));
    tulipan.style.setProperty("--entrada", aleatorio(1.4, 2.2).toFixed(2) + "s");
  }

  // --- 4. Aparecer con un "pop" ---
  if (tipo === "pop") {
    tulipan.style.top = aleatorio(7, 76).toFixed(1) + "%";
    tulipan.style.left = aleatorio(2, 90).toFixed(1) + "%";
    tulipan.style.setProperty("--entrada", aleatorio(0.8, 1.2).toFixed(2) + "s");

    if (Math.random() < 0.3) tulipan.classList.add("tulipan--profundo");
  }

  return tulipan;
}

// ==========================================================
// 7. Globos que suben y explotan
// ==========================================================

function crearGlobos() {
  const esMovil = window.innerWidth < 620;
  const cantidad = prefiereMenosMovimiento ? 7 : (esMovil ? 5 : 8);

  for (let i = 0; i < cantidad; i += 1) {
    // Los primeros globos salen casi de inmediato; el resto se escalona.
    const espera = prefiereMenosMovimiento
      ? 0
      : (i < 2 ? i * 0.18 : aleatorio(0, 1.1) + i * 0.24);

    crearGlobo(espera);
  }
}

function crearGlobo(espera) {
  // Los globos son decorativos para los lectores de pantalla.
  // Para el teclado existe el botón "Globo" de la barra superior.
  const globo = document.createElement("div");
  globo.className = "globo";

  const color = PALETA_GLOBOS[entero(0, PALETA_GLOBOS.length - 1)];
  const ancho = entero(50, 84);
  const duracion = aleatorio(7.5, 15);

  globo.dataset.nombre = color.nombre;
  globo.dataset.color = color.base;
  globo.style.left = aleatorio(2, 90).toFixed(1) + "%";
  globo.style.setProperty("--w", ancho + "px");
  globo.style.setProperty("--claro", color.claro);
  globo.style.setProperty("--base", color.base);
  globo.style.setProperty("--oscuro", color.oscuro);
  globo.style.setProperty("--dur", duracion.toFixed(1) + "s");
  globo.style.setProperty("--delay", espera.toFixed(1) + "s");
  globo.style.setProperty("--vaiven", aleatorio(2.6, 4.2).toFixed(1) + "s");

  // El globo, su brillo, su nudo y su cuerda.
  globo.innerHTML =
    '<span class="globo-flotante">' +
      '<span class="globo-cuerpo"></span>' +
      '<svg class="globo-hilo" viewBox="0 0 30 82" aria-hidden="true" focusable="false">' +
        '<path d="M15 0c-7 15 8 27 1 41-5 10 4 20-1 30-4 8 2 10 1 11"/>' +
      "</svg>" +
    "</span>";

  // Si se prefiere menos movimiento, los globos se quedan quietos
  // repartidos por la pantalla en lugar de subir sin parar.
  if (prefiereMenosMovimiento) {
    globo.classList.add("globo--quieto");
    globo.style.setProperty("--top", aleatorio(8, 78).toFixed(1) + "%");
  } else {
    // Se retira cuando termina de subir (por si no lo explota nadie).
    programar(function () {
      globo.remove();
    }, (espera + duracion + 0.6) * 1000);
  }

  capaGlobos.appendChild(globo);
}

// Añade globos nuevos cada poco tiempo mientras dura la celebración.
function iniciarLluviaDeGlobos() {
  if (prefiereMenosMovimiento) return;

  intervaloGlobos = setInterval(function () {
    const activos = capaGlobos.querySelectorAll(".globo:not(.explotado)").length;
    const maximo = window.innerWidth < 620 ? 9 : 16;

    if (activos < maximo) {
      crearGlobo(0);
    }
  }, 1900);
}

function explotarGlobo(globo, nombreColor, anunciar) {
  if (globo.dataset.explotado === "si") return;
  globo.dataset.explotado = "si";

  const cuerpo = globo.querySelector(".globo-cuerpo");
  const caja = cuerpo.getBoundingClientRect();

  globo.classList.add("explotado");
  sonidoGlobo();

  if (anunciar) {
    mostrarAviso("¡Pum! Globo " + nombreColor + " explotado.");
  }

  // Pequeña explosión de confeti en el lugar del globo.
  estallidoConfeti(
    caja.left + caja.width / 2,
    caja.top + caja.height * 0.42,
    16,
    false,
    globo.dataset.color
  );

  setTimeout(function () {
    globo.remove();
  }, 340);
}

// Busca un globo que esté justo debajo del puntero del ratón o del dedo.
function globoEnPunto(x, y) {
  const globosVivos = capaGlobos.querySelectorAll(".globo:not(.explotado)");

  // Recorremos de atrás hacia adelante por si hay varios superpuestos.
  for (let i = globosVivos.length - 1; i >= 0; i -= 1) {
    const cuerpo = globosVivos[i].querySelector(".globo-cuerpo");
    if (!cuerpo) continue;

    const caja = cuerpo.getBoundingClientRect();

    if (x >= caja.left - 8 && x <= caja.right + 8 && y >= caja.top - 8 && y <= caja.bottom + 8) {
      return globosVivos[i];
    }
  }

  return null;
}

// Los globos están detrás del contenido, así que escuchamos el clic
// en toda la página y comprobamos si cayó sobre uno de ellos.
document.addEventListener("click", function (evento) {
  if (edadActual === 0) return;
  if (evento.detail === 0) return; // Los clics de teclado van a los botones.

  const objetivo = evento.target instanceof Element ? evento.target : null;
  if (!objetivo) return;

  // No explotamos globos al usar el formulario, el pastel o la barra.
  if (objetivo.closest("button, a, input, label, .barra, .accion, .pie")) return;

  const globo = globoEnPunto(evento.clientX, evento.clientY);
  if (globo) {
    explotarGlobo(globo, globo.dataset.nombre, false);
  }
});

// Alternativa accesible: un solo botón explota un globo al azar.
botonGlobo.addEventListener("click", function () {
  if (edadActual === 0) return;

  const globosVivos = Array.from(capaGlobos.querySelectorAll(".globo:not(.explotado)"));
  const visibles = globosVivos.filter(function (globo) {
    const cuerpo = globo.querySelector(".globo-cuerpo");
    if (!cuerpo) return false;
    const caja = cuerpo.getBoundingClientRect();
    return caja.bottom > 0 && caja.top < window.innerHeight && caja.right > 0 && caja.left < window.innerWidth;
  });

  if (visibles.length === 0) {
    mostrarAviso("Los globos están subiendo. Prueba otra vez en un momento.");
    return;
  }

  const elegido = visibles[entero(0, visibles.length - 1)];
  explotarGlobo(elegido, elegido.dataset.nombre, true);
});

// ==========================================================
// 8. Limpieza entre celebraciones
// ==========================================================

function limpiarJardinYGlobos() {
  jardin.innerHTML = "";
  capaGlobos.innerHTML = "";

  limpiarTemporizadores();

  if (intervaloGlobos !== null) {
    clearInterval(intervaloGlobos);
    intervaloGlobos = null;
  }
}

// ==========================================================
// 9. Confeti en canvas
// ==========================================================

const COLORES_CONFETI = ["#FFE27A", "#F5C842", "#FF7E6B", "#79D6B0", "#7FC8FF", "#C4A7FF", "#FFF6E6"];
let particulas = [];
let animacionConfeti = null;

function ajustarLienzoConfeti() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  lienzoConfeti.width = window.innerWidth * dpr;
  lienzoConfeti.height = window.innerHeight * dpr;
  lienzoConfeti.style.width = window.innerWidth + "px";
  lienzoConfeti.style.height = window.innerHeight + "px";
  contextoConfeti.setTransform(dpr, 0, 0, dpr, 0, 0);
}

ajustarLienzoConfeti();
window.addEventListener("resize", ajustarLienzoConfeti);

// Lanza una cantidad de papelitos desde un punto de la pantalla.
function estallidoConfeti(x, y, cantidad, suave, colorEspecial) {
  if (prefiereMenosMovimiento) return;

  for (let i = 0; i < cantidad; i += 1) {
    const color = colorEspecial
      ? (Math.random() < 0.5 ? colorEspecial : COLORES_CONFETI[entero(0, COLORES_CONFETI.length - 1)])
      : COLORES_CONFETI[entero(0, COLORES_CONFETI.length - 1)];

    particulas.push({
      x: x,
      y: y,
      vx: aleatorio(suave ? -3.5 : -6.5, suave ? 3.5 : 6.5),
      vy: aleatorio(suave ? -5 : -11, -2),
      ancho: aleatorio(4, 9),
      alto: aleatorio(6, 13),
      rotacion: aleatorio(0, Math.PI * 2),
      velocidadGiro: aleatorio(-0.22, 0.22),
      color: color,
      forma: Math.random() < 0.35 ? "circulo" : "rectangulo",
      vida: entero(80, 150)
    });
  }

  if (animacionConfeti === null) {
    animacionConfeti = requestAnimationFrame(dibujarConfeti);
  }
}

function lanzarConfetiDeCelebracion() {
  programar(function () {
    estallidoConfeti(window.innerWidth * 0.16, window.innerHeight * 0.76, 70, false);
  }, 120);

  programar(function () {
    estallidoConfeti(window.innerWidth * 0.84, window.innerHeight * 0.76, 70, false);
  }, 220);

  programar(function () {
    estallidoConfeti(window.innerWidth * 0.5, window.innerHeight * 0.3, 90, true);
  }, 420);
}

function dibujarConfeti() {
  contextoConfeti.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = particulas.length - 1; i >= 0; i -= 1) {
    const p = particulas[i];

    p.vy += 0.18;      // gravedad
    p.vx *= 0.995;     // el aire frena un poco el movimiento horizontal
    p.x += p.vx;
    p.y += p.vy;
    p.rotacion += p.velocidadGiro;
    p.vida -= 1;

    if (p.vida <= 0 || p.y > window.innerHeight + 40) {
      particulas.splice(i, 1);
      continue;
    }

    contextoConfeti.save();
    contextoConfeti.translate(p.x, p.y);
    contextoConfeti.rotate(p.rotacion);
    contextoConfeti.globalAlpha = Math.min(1, p.vida / 35);
    contextoConfeti.fillStyle = p.color;

    if (p.forma === "circulo") {
      contextoConfeti.beginPath();
      contextoConfeti.arc(0, 0, p.ancho / 2, 0, Math.PI * 2);
      contextoConfeti.fill();
    } else {
      contextoConfeti.fillRect(-p.ancho / 2, -p.alto / 2, p.ancho, p.alto);
    }

    contextoConfeti.restore();
  }

  if (particulas.length > 0) {
    animacionConfeti = requestAnimationFrame(dibujarConfeti);
  } else {
    animacionConfeti = null;
    contextoConfeti.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function vaciarConfeti() {
  particulas = [];

  if (animacionConfeti !== null) {
    cancelAnimationFrame(animacionConfeti);
    animacionConfeti = null;
  }

  contextoConfeti.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

// ==========================================================
// 10. Sonido (creado con el navegador, sin archivos externos)
// ==========================================================

function prepararAudio() {
  if (!window.AudioContext && !window.webkitAudioContext) return false;

  if (audioContexto === null) {
    const Constructor = window.AudioContext || window.webkitAudioContext;
    audioContexto = new Constructor();
  }

  if (audioContexto.state === "suspended") {
    audioContexto.resume();
  }

  return true;
}

// Toca una nota sencilla con un pequeño desvanecimiento.
function tocarNota(frecuencia, retraso, duracion, tipo, volumen) {
  if (!audioContexto) return;

  const ahora = audioContexto.currentTime + retraso;
  const oscilador = audioContexto.createOscillator();
  const ganancia = audioContexto.createGain();

  oscilador.type = tipo || "sine";
  oscilador.frequency.setValueAtTime(frecuencia, ahora);

  ganancia.gain.setValueAtTime(0.0001, ahora);
  ganancia.gain.linearRampToValueAtTime(volumen || 0.07, ahora + 0.02);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + duracion);

  oscilador.connect(ganancia);
  ganancia.connect(audioContexto.destination);

  oscilador.start(ahora);
  oscilador.stop(ahora + duracion + 0.03);
}

function sonidoBienvenida() {
  if (!sonidoActivo || !prepararAudio()) return;
  tocarNota(523.25, 0, 0.35, "sine", 0.05);
  tocarNota(783.99, 0.1, 0.45, "sine", 0.045);
}

function sonidoCelebracion() {
  if (!sonidoActivo || !prepararAudio()) return;

  const melodia = [523.25, 659.25, 783.99, 1046.5];

  melodia.forEach(function (nota, indice) {
    tocarNota(nota, indice * 0.09, 0.6, "sine", 0.06);
  });

  tocarNota(261.63, 0, 0.9, "triangle", 0.035);
  tocarNota(392, 0.18, 0.8, "triangle", 0.03);
}

function sonidoGlobo() {
  if (!sonidoActivo || !prepararAudio()) return;

  const ahora = audioContexto.currentTime;
  const oscilador = audioContexto.createOscillator();
  const ganancia = audioContexto.createGain();

  oscilador.type = "triangle";
  oscilador.frequency.setValueAtTime(420, ahora);
  oscilador.frequency.exponentialRampToValueAtTime(110, ahora + 0.12);

  ganancia.gain.setValueAtTime(0.0001, ahora);
  ganancia.gain.linearRampToValueAtTime(0.06, ahora + 0.008);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.14);

  oscilador.connect(ganancia);
  ganancia.connect(audioContexto.destination);
  oscilador.start(ahora);
  oscilador.stop(ahora + 0.16);
}

// Ruido suave que imita el aire al soplar las velas.
function sonidoSoplar() {
  if (!sonidoActivo || !prepararAudio()) return;

  const duracion = 1.1;
  const muestras = Math.floor(audioContexto.sampleRate * duracion);
  const buffer = audioContexto.createBuffer(1, muestras, audioContexto.sampleRate);
  const datos = buffer.getChannelData(0);

  for (let i = 0; i < muestras; i += 1) {
    datos[i] = Math.random() * 2 - 1;
  }

  const fuente = audioContexto.createBufferSource();
  const filtro = audioContexto.createBiquadFilter();
  const ganancia = audioContexto.createGain();
  const ahora = audioContexto.currentTime;

  fuente.buffer = buffer;
  filtro.type = "lowpass";
  filtro.frequency.setValueAtTime(1100, ahora);
  filtro.frequency.exponentialRampToValueAtTime(280, ahora + duracion);

  ganancia.gain.setValueAtTime(0.0001, ahora);
  ganancia.gain.linearRampToValueAtTime(0.09, ahora + 0.12);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + duracion);

  fuente.connect(filtro);
  filtro.connect(ganancia);
  ganancia.connect(audioContexto.destination);
  fuente.start(ahora);
}

// Botón para activar o desactivar el sonido.
botonSonido.addEventListener("click", function () {
  sonidoActivo = !sonidoActivo;
  botonSonido.setAttribute("aria-pressed", String(sonidoActivo));
  botonSonido.setAttribute("aria-label", sonidoActivo ? "Desactivar sonido" : "Activar sonido");

  if (sonidoActivo) {
    sonidoBienvenida();
  }
});

// ==========================================================
// 11. Detalles finales
// ==========================================================

// Al cambiar el tamaño de la ventana solo hay que reajustar el canvas.
// Los tulipanes y globos usan porcentajes, así que se adaptan solos.
window.addEventListener("resize", function () {
  vaciarConfeti();
});

// Si el navegador no puede crear audio, ocultamos el botón de sonido
// para no prometer algo que no va a funcionar.
if (!window.AudioContext && !window.webkitAudioContext) {
  botonSonido.hidden = true;
}

// Si se pulsa la marca, se vuelve al formulario sin recargar la página.
document.querySelector(".marca").addEventListener("click", function (evento) {
  evento.preventDefault();
  campoEdad.focus();
});
