import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

const sceneContainer = document.querySelector('#scene');
const sectorSelect = document.querySelector('#sectorSelect');
const sortButtons = [...document.querySelectorAll('.sort-button')];

const selectedName = document.querySelector('#selectedName');
const selectedRisk = document.querySelector('#selectedRisk');
const selectedCenters = document.querySelector('#selectedCenters');
const selectedHeight = document.querySelector('#selectedHeight');
const selectedWidth = document.querySelector('#selectedWidth');
const selectedReading = document.querySelector('#selectedReading');

const VISUAL_RANGES = {
  height: { min: 1, max: 8 },
  width: { min: 0.8, max: 3 }
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0f);
scene.fog = new THREE.Fog(0x0b0b0f, 34, 58);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(16, 15, 23);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneContainer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 2.5, 0);
controls.minDistance = 11;
controls.maxDistance = 48;
controls.maxPolarAngle = Math.PI * 0.48;

scene.add(new THREE.HemisphereLight(0xffffff, 0x1c1c27, 1.8));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(9, 18, 12);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
scene.add(keyLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(38, 31),
  new THREE.MeshStandardMaterial({ color: 0x141419, roughness: 0.95 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(38, 19, 0x44444f, 0x26262e);
grid.position.y = 0.012;
scene.add(grid);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDown = null;

let dataset = [];
let dataRanges = null;
let towerMeshes = [];
let selectedMesh = null;
let currentOrder = 'source';

function normalize(value, min, max) {
  if (max === min) return 0.5;
  return THREE.MathUtils.clamp((value - min) / (max - min), 0, 1);
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  const normalized = normalize(value, inMin, inMax);
  return THREE.MathUtils.lerp(outMin, outMax, normalized);
}

function riskColor(risk) {
  const n = normalize(risk, dataRanges.risk.min, dataRanges.risk.max);
  const hueDegrees = THREE.MathUtils.lerp(50, 0, n);
  return new THREE.Color().setHSL(hueDegrees / 360, 0.8, 0.55);
}

function computeDataRanges(data) {
  const risks = data.map(d => d.riesgoNoOptimo);
  const centers = data.map(d => d.centros);
  return {
    risk: { min: Math.min(...risks), max: Math.max(...risks) },
    centers: { min: Math.min(...centers), max: Math.max(...centers) }
  };
}

function visualValues(item) {
  return {
    height: mapRange(
      item.riesgoNoOptimo,
      dataRanges.risk.min,
      dataRanges.risk.max,
      VISUAL_RANGES.height.min,
      VISUAL_RANGES.height.max
    ),
    width: mapRange(
      item.centros,
      dataRanges.centers.min,
      dataRanges.centers.max,
      VISUAL_RANGES.width.min,
      VISUAL_RANGES.width.max
    )
  };
}

function layoutPosition(index, total) {
  const columns = 5;
  const rows = Math.ceil(total / columns);
  const col = index % columns;
  const row = Math.floor(index / columns);
  const spacingX = 5.3;
  const spacingZ = 5.0;

  return new THREE.Vector3(
    (col - (columns - 1) / 2) * spacingX,
    0,
    (row - (rows - 1) / 2) * spacingZ
  );
}

function createTower(item, index) {
  const visual = visualValues(item);
  const geometry = new THREE.BoxGeometry(visual.width, visual.height, 1.35);
  const material = new THREE.MeshStandardMaterial({
    color: riskColor(item.riesgoNoOptimo),
    roughness: 0.58,
    metalness: 0.05,
    emissive: 0x000000
  });

  const mesh = new THREE.Mesh(geometry, material);
  const start = layoutPosition(index, dataset.length);
  mesh.position.set(start.x, visual.height / 2, start.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = {
    item,
    sourceIndex: index,
    visual,
    targetX: start.x,
    targetZ: start.z
  };

  scene.add(mesh);
  towerMeshes.push(mesh);
}

function populateSectorSelect() {
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Selecciona una actividad económica';
  sectorSelect.appendChild(placeholder);

  dataset.forEach(item => {
    const option = document.createElement('option');
    option.value = item.actividad;
    option.textContent = item.actividad;
    sectorSelect.appendChild(option);
  });
}

function rankOf(item, key) {
  const sorted = [...dataset].sort((a, b) => b[key] - a[key]);
  return sorted.findIndex(d => d.actividad === item.actividad) + 1;
}

function selectTower(mesh) {
  if (selectedMesh) {
    selectedMesh.material.emissive.setHex(0x000000);
    selectedMesh.material.emissiveIntensity = 0;
  }

  selectedMesh = mesh;
  selectedMesh.material.emissive.setHex(0xffffff);
  selectedMesh.material.emissiveIntensity = 0.22;

  const { item, visual } = mesh.userData;
  sectorSelect.value = item.actividad;

  selectedName.textContent = item.actividad;
  selectedRisk.textContent = `${item.riesgoNoOptimo.toFixed(1).replace('.', ',')}%`;
  selectedCenters.textContent = new Intl.NumberFormat('es-CL').format(item.centros);
  selectedHeight.textContent = `${visual.height.toFixed(2).replace('.', ',')} de ${VISUAL_RANGES.height.max}`;
  selectedWidth.textContent = `${visual.width.toFixed(2).replace('.', ',')} de ${VISUAL_RANGES.width.max}`;

  const riskRank = rankOf(item, 'riesgoNoOptimo');
  const centersRank = rankOf(item, 'centros');
  selectedReading.textContent = `Este sector está en el lugar ${riskRank} de ${dataset.length} por nivel de riesgo y en el lugar ${centersRank} de ${dataset.length} por cantidad de centros evaluados.`;
}

function selectByActivity(activity) {
  const mesh = towerMeshes.find(tower => tower.userData.item.actividad === activity);
  if (mesh) selectTower(mesh);
}

function orderedData(mode) {
  if (mode === 'risk') {
    return [...dataset].sort((a, b) => b.riesgoNoOptimo - a.riesgoNoOptimo);
  }
  if (mode === 'centers') {
    return [...dataset].sort((a, b) => b.centros - a.centros);
  }
  return [...dataset];
}

function applyOrder(mode) {
  currentOrder = mode;
  const ordered = orderedData(mode);

  ordered.forEach((item, index) => {
    const mesh = towerMeshes.find(tower => tower.userData.item.actividad === item.actividad);
    const target = layoutPosition(index, ordered.length);
    mesh.userData.targetX = target.x;
    mesh.userData.targetZ = target.z;
  });

  sortButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.order === mode);
  });
}

function raycastFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(towerMeshes, false);
}

renderer.domElement.addEventListener('pointerdown', event => {
  pointerDown = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener('pointerup', event => {
  if (!pointerDown) return;
  const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
  pointerDown = null;
  if (distance > 6) return;

  const intersections = raycastFromEvent(event);
  if (intersections.length) selectTower(intersections[0].object);
});

renderer.domElement.addEventListener('pointermove', event => {
  const intersections = raycastFromEvent(event);
  renderer.domElement.style.cursor = intersections.length ? 'pointer' : 'grab';
});

sectorSelect.addEventListener('change', event => {
  if (event.target.value) selectByActivity(event.target.value);
});

sortButtons.forEach(button => {
  button.addEventListener('click', () => applyOrder(button.dataset.order));
});

function resize() {
  const width = sceneContainer.clientWidth;
  const height = sceneContainer.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(sceneContainer);

function animate() {
  requestAnimationFrame(animate);

  for (const mesh of towerMeshes) {
    mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, mesh.userData.targetX, 0.09);
    mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, mesh.userData.targetZ, 0.09);
  }

  controls.update();
  renderer.render(scene, camera);
}

async function init() {
  try {
    const response = await fetch('./assets/data/ceal-2025.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    dataset = payload.datos;
    dataRanges = computeDataRanges(dataset);

    dataset.forEach(createTower);
    populateSectorSelect();
    applyOrder(currentOrder);
    resize();
    animate();

    selectByActivity('Administración pública');
  } catch (error) {
    console.error('No fue posible cargar los datos CEAL-SM/SUSESO:', error);
    selectedName.textContent = 'Error al cargar datos';
    selectedReading.textContent = 'Revisa la consola del navegador y confirma que el archivo assets/data/ceal-2025.json esté disponible.';
  }
}

init();
