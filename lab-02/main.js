import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ======================================================
// 01 — PARÁMETROS
// ======================================================

const valoresIniciales = {
  columnas: 15,
  filas: 15,
  separacion: 1.2,
  amplitud: 3.0,
  frecuencia: 0.4,
  rotacion: 0.3,
  aleatoriedad: 0.0,
  semilla: 42,
};

const parametros = { ...valoresIniciales };

// ======================================================
// 02 — ESCENA
// ======================================================

const viewport = document.querySelector("#viewport");

const escena = new THREE.Scene();
escena.background = new THREE.Color(0x0b0b0c);

const camara = new THREE.PerspectiveCamera(
  42,
  viewport.clientWidth / viewport.clientHeight,
  0.1,
  200
);

camara.position.set(18, 16, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewport.clientWidth, viewport.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

viewport.appendChild(renderer.domElement);

const controlesOrbita = new OrbitControls(camara, renderer.domElement);
controlesOrbita.enableDamping = true;
controlesOrbita.target.set(0, 1.2, 0);

// Iluminación general.
const luzHemisferica = new THREE.HemisphereLight(0xf3efe5, 0x202229, 1.7);
escena.add(luzHemisferica);

// Luz principal.
const luzPrincipal = new THREE.DirectionalLight(0xffffff, 3.1);
luzPrincipal.position.set(8, 14, 9);
luzPrincipal.castShadow = true;
escena.add(luzPrincipal);

// Luz secundaria para suavizar el contraste.
const luzRelleno = new THREE.DirectionalLight(0xc8d8ff, 0.8);
luzRelleno.position.set(-8, 6, -6);
escena.add(luzRelleno);

// Plano base.
const suelo = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({
    color: 0x101114,
    roughness: 1,
    metalness: 0,
  })
);

suelo.rotation.x = -Math.PI / 2;
suelo.position.y = -0.03;
suelo.receiveShadow = true;
escena.add(suelo);

// Grilla de referencia para leer mejor escala y posición.
const grilla = new THREE.GridHelper(50, 50, 0x35383d, 0x202227);
grilla.position.y = 0.001;
escena.add(grilla);

// ======================================================
// 03 — OBJETO GENERATIVO
// ======================================================

const grupoCampo = new THREE.Group();
escena.add(grupoCampo);

// Cambio 1: usamos esferas en vez de cubos.
const radioModulo = 0.38;
const geometriaModulo = new THREE.SphereGeometry(radioModulo, 24, 16);

const materialModulo = new THREE.MeshStandardMaterial({
  color: 0xd7d2c8,
  roughness: 0.58,
  metalness: 0.03,
});

// Herramientas para saber dónde está el cursor sobre el plano del campo.
const raycaster = new THREE.Raycaster();
const puntero = new THREE.Vector2();
const planoInteraccion = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const puntoCursor = new THREE.Vector3();
let cursorActivo = false;

// Distancia y altura del efecto de "huida" del cursor.
const radioHuida = 3.2;
const elevacionHuida = 3.2;

// ======================================================
// 04 — REGLAS GENERATIVAS
// ======================================================
// Estas funciones representan decisiones de diseño.
// Si cambian estas reglas, cambia la familia de resultados.

// Regla A:
// posición → distancia al centro → onda → altura
function calcularAlturaModulo(x, z) {
  const distancia = Math.sqrt(x * x + z * z);

  const onda =
    Math.sin(distancia * parametros.frecuencia) *
    parametros.amplitud;

  const ruido =
    aleatoriedadConSemilla(x, z, parametros.semilla) *
    parametros.aleatoriedad;

  return Math.max(0.25, 1.2 + onda + ruido);
}

// Regla B:
// la orientación depende de la dirección radial respecto al centro.
function calcularRotacionModulo(x, z) {
  const direccion = Math.atan2(z, x);
  return direccion * parametros.rotacion;
}

// ======================================================
// 05 — GENERAR CAMPO
// ======================================================

function generarCampo() {
  limpiarCampo();

  const ancho = (parametros.columnas - 1) * parametros.separacion;
  const profundidad = (parametros.filas - 1) * parametros.separacion;
  const ahora = performance.now();

  for (let columna = 0; columna < parametros.columnas; columna++) {
    for (let fila = 0; fila < parametros.filas; fila++) {
      const x = columna * parametros.separacion - ancho / 2;
      const z = fila * parametros.separacion - profundidad / 2;

      const altura = calcularAlturaModulo(x, z);
      const rotacion = calcularRotacionModulo(x, z);

      const modulo = new THREE.Mesh(geometriaModulo, materialModulo);

      // La esfera conserva su forma. La regla de altura decide su posición vertical.
      const alturaBase = altura + radioModulo;
      modulo.position.set(x, alturaBase, z);

      // La rotación se conserva para mantener la estructura del ejercicio.
      // En una esfera no cambia visualmente su apariencia.
      modulo.rotation.y = rotacion;
      modulo.castShadow = true;
      modulo.receiveShadow = true;

      // Cambio 2: guardamos datos para producir un pequeño rebote al regenerar.
      modulo.userData.alturaBase = alturaBase;
      modulo.userData.inicioRebote = ahora;
      modulo.userData.desplazamientoCursor = 0;

      grupoCampo.add(modulo);
    }
  }
}

function limpiarCampo() {
  while (grupoCampo.children.length > 0) {
    grupoCampo.remove(grupoCampo.children[0]);
  }
}

// Pequeña caída con rebote que se va apagando suavemente.
function calcularRebote(modulo, ahora) {
  const tiempo = (ahora - modulo.userData.inicioRebote) / 1000;

  if (tiempo < 0 || tiempo > 1.6) {
    return 0;
  }

  return 1.5 * Math.exp(-3.2 * tiempo) * Math.cos(10.5 * tiempo);
}

// ======================================================
// 06 — ALEATORIEDAD CONTROLADA
// ======================================================
// Devuelve un valor repetible entre -1 y 1.
// Una misma semilla produce siempre el mismo patrón.

function aleatoriedadConSemilla(x, z, semilla) {
  const valor =
    Math.sin(
      x * 12.9898 +
      z * 78.233 +
      semilla * 37.719
    ) * 43758.5453;

  const normalizado = valor - Math.floor(valor);

  return normalizado * 2 - 1;
}

// ======================================================
// 07 — INTERFAZ
// ======================================================

const controles = {
  columnas: document.querySelector("#columnas"),
  filas: document.querySelector("#filas"),
  separacion: document.querySelector("#separacion"),
  amplitud: document.querySelector("#amplitud"),
  frecuencia: document.querySelector("#frecuencia"),
  rotacion: document.querySelector("#rotacion"),
  aleatoriedad: document.querySelector("#aleatoriedad"),
  semilla: document.querySelector("#semilla"),
};

const valoresVisibles = {
  columnas: document.querySelector("#columnas-valor"),
  filas: document.querySelector("#filas-valor"),
  separacion: document.querySelector("#separacion-valor"),
  amplitud: document.querySelector("#amplitud-valor"),
  frecuencia: document.querySelector("#frecuencia-valor"),
  rotacion: document.querySelector("#rotacion-valor"),
  aleatoriedad: document.querySelector("#aleatoriedad-valor"),
  semilla: document.querySelector("#semilla-valor"),
};

function actualizarParametro(nombre, valor) {
  const parametrosEnteros = ["columnas", "filas", "semilla"];

  parametros[nombre] = parametrosEnteros.includes(nombre)
    ? Number.parseInt(valor, 10)
    : Number.parseFloat(valor);

  valoresVisibles[nombre].value = parametrosEnteros.includes(nombre)
    ? parametros[nombre]
    : parametros[nombre].toFixed(2);

  generarCampo();
}

Object.entries(controles).forEach(([nombre, control]) => {
  control.addEventListener("input", (event) => {
    actualizarParametro(nombre, event.target.value);
  });
});

document.querySelector("#regenerar").addEventListener("click", () => {
  parametros.semilla = Math.floor(Math.random() * 100) + 1;

  controles.semilla.value = parametros.semilla;
  valoresVisibles.semilla.value = parametros.semilla;

  generarCampo();
});

document.querySelector("#restablecer").addEventListener("click", () => {
  Object.assign(parametros, valoresIniciales);

  const parametrosEnteros = ["columnas", "filas", "semilla"];

  Object.entries(controles).forEach(([nombre, control]) => {
    control.value = parametros[nombre];

    valoresVisibles[nombre].value = parametrosEnteros.includes(nombre)
      ? parametros[nombre]
      : parametros[nombre].toFixed(2);
  });

  generarCampo();
});

// Cambio 3: calculamos el punto del campo que está bajo el cursor.
renderer.domElement.addEventListener("pointermove", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();

  puntero.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  puntero.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(puntero, camara);
  cursorActivo = raycaster.ray.intersectPlane(planoInteraccion, puntoCursor) !== null;
});

renderer.domElement.addEventListener("pointerleave", () => {
  cursorActivo = false;
});

// ======================================================
// 08 — BUCLE DE ANIMACIÓN
// ======================================================

function animar() {
  requestAnimationFrame(animar);

  const ahora = performance.now();

  grupoCampo.children.forEach((modulo) => {
    const rebote = calcularRebote(modulo, ahora);
    let objetivoCursor = 0;

    if (cursorActivo) {
      const dx = modulo.position.x - puntoCursor.x;
      const dz = modulo.position.z - puntoCursor.z;
      const distanciaCursor = Math.sqrt(dx * dx + dz * dz);

      if (distanciaCursor < radioHuida) {
        const cercania = 1 - distanciaCursor / radioHuida;
        objetivoCursor = cercania * elevacionHuida;
      }
    }

    // La esfera sube al acercarse el cursor y vuelve suavemente al alejarlo.
    modulo.userData.desplazamientoCursor = THREE.MathUtils.lerp(
      modulo.userData.desplazamientoCursor,
      objetivoCursor,
      0.12
    );

    modulo.position.y =
      modulo.userData.alturaBase +
      rebote +
      modulo.userData.desplazamientoCursor;
  });

  controlesOrbita.update();
  renderer.render(escena, camara);
}

function ajustarVentana() {
  const ancho = viewport.clientWidth;
  const altura = viewport.clientHeight;

  camara.aspect = ancho / altura;
  camara.updateProjectionMatrix();

  renderer.setSize(ancho, altura);
}

window.addEventListener("resize", ajustarVentana);

generarCampo();
animar();
