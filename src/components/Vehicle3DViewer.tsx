import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RotateCw } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export interface HotspotData {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  specs: string;
  position: [number, number, number];
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
}

const HOTSPOTS: HotspotData[] = [
  {
    id: 'lighting',
    number: '01',
    title: 'MATRIX LED OPTICS',
    category: 'OPTICAL ARCHITECTURE',
    description: 'Ultra-thin matrix LED optics with individual projector diodes and integrated daytime running light-pipes. Dynamic beam carving provides daylight tarmac clarity with zero oncoming glare.',
    specs: '600M PROJECTION RANGE • DYNAMIC CORNERING ILLUMINATION',
    position: [0.72, 0.46, -1.82],
    cameraTarget: [0.5, 0.42, -1.5],
    cameraPosition: [1.4, 0.65, -2.5]
  },
  {
    id: 'powertrain',
    number: '02',
    title: '3.9L TWIN-TURBOCHARGED V8',
    category: 'PROPULSION TELEMETRY',
    description: 'Dry-sump flat-plane 90° twin-turbocharged mid-rear V8. Featuring titanium connecting rods, anti-lag bypass valving, and Inconel exhaust manifolds engineered for razor throttle immediacy.',
    specs: '710 HP @ 8,000 RPM • 770 NM TORQUE • 2.85S 0-100 KM/H',
    position: [0, 0.68, 0.6],
    cameraTarget: [0, 0.52, 0.5],
    cameraPosition: [0, 1.85, 2.3]
  },
  {
    id: 'aero',
    number: '03',
    title: 'F1 S-DUCT & BLOWN SPOILER',
    category: 'ACTIVE AERODYNAMICS',
    description: 'Front hood aerodynamic S-Duct channel paired with an active carbon-fiber rear blown aerofoil. Generates 390 kg of pure ground downforce at high speed without aerodynamic drag penalty.',
    specs: '390 KG DOWNFORCE @ 200 KM/H • 0.32 CD DRAG PROFILE',
    position: [-0.75, 0.52, 1.95],
    cameraTarget: [0, 0.45, 1.5],
    cameraPosition: [-1.8, 0.9, 2.8]
  },
  {
    id: 'cockpit',
    number: '04',
    title: 'ALCANTARA RACING CELL',
    category: 'INTERIOR ERGONOMICS',
    description: 'Motorsport monocoque interior draped in weight-saving micro-suede Alcantara and structural carbon-fiber weave. Carbon bucket seats with F1 steering wheel telemetric manettino switchgear.',
    specs: 'FIA TRACK SPEC HARNESS READY • INTEGRATED RACE TELEMETRY',
    position: [0.35, 0.82, -0.1],
    cameraTarget: [0, 0.62, -0.1],
    cameraPosition: [1.1, 1.25, -0.6]
  },
  {
    id: 'brakes',
    number: '05',
    title: 'CARBON CERAMIC BRAKES',
    category: 'DECELERATION DYNAMICS',
    description: 'Cross-drilled carbon-ceramic rotors with monobloc 6-piston aluminium calipers. Fade-free retardation from 200 km/h to standstill in under 4.0 seconds with extreme thermal stability.',
    specs: '398MM FRONT / 360MM REAR • 1,000°C THERMAL CAPACITY',
    position: [0.94, 0.34, -1.15],
    cameraTarget: [0.85, 0.32, -1.15],
    cameraPosition: [1.7, 0.48, -1.6]
  }
];

export interface ColorFinish {
  id: string;
  name: string;
  hex: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
}

const COLOR_FINISHES: ColorFinish[] = [
  {
    id: 'obsidian',
    name: 'OBSIDIAN NOIR',
    hex: '#08080a',
    metalness: 0.94,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.035
  },
  {
    id: 'scarlet',
    name: 'ROSSO CORSA SCARLET',
    hex: '#af0d16',
    metalness: 0.90,
    roughness: 0.21,
    clearcoat: 1.0,
    clearcoatRoughness: 0.035
  },
  {
    id: 'titanium',
    name: 'GRIGIO TITANIO',
    hex: '#9ba2ad',
    metalness: 0.94,
    roughness: 0.24,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04
  },
  {
    id: 'deep-blue',
    name: 'BLU POZZI SAPPHIRE',
    hex: '#0b162c',
    metalness: 0.92,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.035
  },
  {
    id: 'lime',
    name: 'VELOCE LIME RACING',
    hex: '#bbf028',
    metalness: 0.86,
    roughness: 0.23,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04
  }
];

const PRESET_LABELS = [
  '01 THREE-QUARTER',
  '02 FRONT',
  '03 PROFILE',
  '04 REAR',
  '05 TOP DOWN'
];

/**
 * Procedural micro-texture generator for realistic automotive clearcoat "orange-peel"
 * and metallic flake micro-reflections.
 */
function createCarPaintMicroTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx1 = Math.sin(x * 0.08) * Math.cos(y * 0.08);
      const nx2 = Math.sin(x * 0.19 + 1.2) * Math.cos(y * 0.17 + 0.8);
      const flake = (Math.random() - 0.5) * 0.35;
      heights[y * size + x] = (nx1 * 0.55 + nx2 * 0.45) * 0.75 + flake * 0.25;
    }
  }

  const strength = 1.1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const x0 = (x - 1 + size) % size;
      const x1 = (x + 1) % size;
      const y0 = (y - 1 + size) % size;
      const y1 = (y + 1) % size;

      const dx = (heights[y * size + x1] - heights[y * size + x0]) * strength;
      const dy = (heights[y1 * size + x] - heights[y0 * size + x]) * strength;
      const dz = 1.0;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = -dx / len;
      const ny = -dy / len;
      const nz = dz / len;

      const idx = (y * size + x) * 4;
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(40, 40);
  return tex;
}

/**
 * Procedural brake rotor machining groove and ventilation texture.
 */
function createBrakeRotorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // Concentric machining ridges
  for (let r = 60; r < 245; r += 1.8) {
    const alpha = 0.07 + Math.sin(r * 0.7) * 0.05;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.9})`;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 0.9, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Cross-drilled cooling holes
  const numSpirals = 24;
  for (let s = 0; s < numSpirals; s++) {
    const baseAngle = (s / numSpirals) * Math.PI * 2;
    for (let step = 0; step < 7; step++) {
      const r = 85 + step * 21;
      const angle = baseAngle + step * 0.08;
      const hx = cx + Math.cos(angle) * r;
      const hy = cy + Math.sin(angle) * r;

      ctx.fillStyle = '#141416';
      ctx.beginPath();
      ctx.arc(hx, hy, 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#484850';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Procedural tire tread and sidewall micro-grain texture.
 */
function createTireTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#141416';
  ctx.fillRect(0, 0, size, size);

  // Longitudinal high-performance tread grooves
  ctx.strokeStyle = '#050506';
  ctx.lineWidth = 6;
  for (let x = 80; x < size - 80; x += 55) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  // Micro rubber stippling
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 12;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

/**
 * High-definition vehicle ground contact ambient occlusion shadow map.
 * Anchored directly to the car chassis with 4 tire footprints and undertray AO.
 */
function createGroundContactTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // 1. Broad chassis floorpan ambient occlusion
  const bellyGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, 390);
  bellyGrad.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
  bellyGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.48)');
  bellyGrad.addColorStop(0.72, 'rgba(0, 0, 0, 0.16)');
  bellyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 185, 360, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Engine block / transmission core darkness (rear biased)
  const engineGrad = ctx.createRadialGradient(cx, cy + 90, 20, cx, cy + 90, 180);
  engineGrad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
  engineGrad.addColorStop(0.48, 'rgba(0, 0, 0, 0.42)');
  engineGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = engineGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 90, 125, 155, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Front splitter and rear aerodynamic diffuser floor suction
  const frontSplitterGrad = ctx.createRadialGradient(cx, cy - 300, 10, cx, cy - 300, 110);
  frontSplitterGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  frontSplitterGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
  frontSplitterGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = frontSplitterGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 300, 120, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  const rearDiffuserGrad = ctx.createRadialGradient(cx, cy + 340, 10, cx, cy + 340, 130);
  rearDiffuserGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
  rearDiffuserGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.28)');
  rearDiffuserGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rearDiffuserGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 340, 130, 70, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Four dense tire contact footprints (positioned at exact wheel coordinates)
  // Vehicle front is negative Z (cy - 190), rear is positive Z (cy + 250)
  const tireFootprints = [
    { x: cx - 142, y: cy - 190, rx: 28, ry: 48 }, // Front Left
    { x: cx + 142, y: cy - 190, rx: 28, ry: 48 }, // Front Right
    { x: cx - 140, y: cy + 252, rx: 34, ry: 56 }, // Rear Left
    { x: cx + 140, y: cy + 252, rx: 34, ry: 56 }, // Rear Right
  ];

  tireFootprints.forEach((t) => {
    const tGrad = ctx.createRadialGradient(t.x, t.y, 6, t.x, t.y, t.ry * 1.55);
    tGrad.addColorStop(0, 'rgba(0, 0, 0, 0.98)'); // Dense black ground contact
    tGrad.addColorStop(0.32, 'rgba(0, 0, 0, 0.85)');
    tGrad.addColorStop(0.68, 'rgba(0, 0, 0, 0.35)');
    tGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.ellipse(t.x, t.y, t.rx * 1.55, t.ry * 1.55, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Builds a professional automotive photography studio environment map
 * with large virtual softboxes and continuous strip reflectors.
 */
function buildStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const studioScene = new THREE.Scene();
  studioScene.background = new THREE.Color(0x050507);

  // 1. TOP OVERHEAD SOFTBOX (Continuous highlight along roof and hood)
  const topGeo = new THREE.PlaneGeometry(16, 9);
  const topCanvas = document.createElement('canvas');
  topCanvas.width = 512;
  topCanvas.height = 512;
  const tCtx = topCanvas.getContext('2d')!;
  const tGrad = tCtx.createRadialGradient(256, 256, 30, 256, 256, 256);
  tGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  tGrad.addColorStop(0.45, 'rgba(242, 245, 252, 0.92)');
  tGrad.addColorStop(0.8, 'rgba(180, 195, 215, 0.25)');
  tGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  tCtx.fillStyle = tGrad;
  tCtx.fillRect(0, 0, 512, 512);

  const topMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(topCanvas),
    side: THREE.DoubleSide,
    transparent: true,
  });
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.position.set(0, 7.5, 0.2);
  topMesh.rotation.x = Math.PI / 2;
  studioScene.add(topMesh);

  // 2. MAIN LATERAL SIDE STRIP LIGHT (Continuous highlight along sculpted shoulder/doors)
  const sideGeo = new THREE.PlaneGeometry(18, 1.5);
  const sideCanvas = document.createElement('canvas');
  sideCanvas.width = 512;
  sideCanvas.height = 128;
  const sCtx = sideCanvas.getContext('2d')!;
  const sGrad = sCtx.createLinearGradient(0, 0, 0, 128);
  sGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  sGrad.addColorStop(0.2, 'rgba(235, 242, 255, 0.85)');
  sGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
  sGrad.addColorStop(0.8, 'rgba(235, 242, 255, 0.85)');
  sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 512, 128);

  const sideMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(sideCanvas),
    side: THREE.DoubleSide,
    transparent: true,
  });
  const sideMesh = new THREE.Mesh(sideGeo, sideMat);
  sideMesh.position.set(5.5, 2.4, 0);
  sideMesh.rotation.y = -Math.PI / 2;
  studioScene.add(sideMesh);

  // 3. OPPOSITE FILL STRIP (Passenger side softer fill)
  const fillMesh = new THREE.Mesh(sideGeo, sideMat);
  fillMesh.scale.set(0.9, 0.8, 1);
  fillMesh.position.set(-5.5, 2.0, 0);
  fillMesh.rotation.y = Math.PI / 2;
  studioScene.add(fillMesh);

  // 4. FRONT SOFTBOX (Soft sheen on front nose & hood)
  const frontGeo = new THREE.PlaneGeometry(8, 2.8);
  const frontMesh = new THREE.Mesh(frontGeo, sideMat);
  frontMesh.position.set(0, 3.2, -6.5);
  frontMesh.rotation.x = 0.35;
  studioScene.add(frontMesh);

  // 5. REAR RIM LIGHTBANK (Defines rear aerofoil and muscular haunches)
  const rearGeo = new THREE.PlaneGeometry(8, 1.8);
  const rearMesh = new THREE.Mesh(rearGeo, sideMat);
  rearMesh.position.set(0, 2.8, 6.0);
  rearMesh.rotation.x = -0.3;
  studioScene.add(rearMesh);

  const envMap = pmremGenerator.fromScene(studioScene, 0.04).texture;
  pmremGenerator.dispose();
  return envMap;
}

interface Vehicle3DViewerProps {
  onVehicleIgnited?: () => void;
  onExploreFleet?: () => void;
  onOpenReservation?: () => void;
}

export const Vehicle3DViewer: React.FC<Vehicle3DViewerProps> = ({
  onVehicleIgnited,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState<ColorFinish>(COLOR_FINISHES[0]);
  const [activePreset, setActivePreset] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<HotspotData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const introFinishedRef = useRef(false);
  const [screen2DHotspots, setScreen2DHotspots] = useState<{ id: string; x: number; y: number; visible: boolean }[]>([]);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const bodyMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const carCenterYRef = useRef<number>(0.52);

  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
    sideLight: THREE.DirectionalLight;
    ambient: THREE.AmbientLight;
  } | null>(null);

  // Interaction & Kinematics References
  const isPointerDownRef = useRef(false);
  const previousPointerPositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const targetCarRotationRef = useRef({ y: -0.42 });
  const cameraTargetPosRef = useRef(new THREE.Vector3(3.8, 1.25, 4.4));
  const cameraLookAtRef = useRef(new THREE.Vector3(0, 0.52, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0.52, 0));
  const mouseParallaxRef = useRef({ x: 0, y: 0 });
  const introStartTimeRef = useRef<number | null>(null);
  const scrollOffsetRef = useRef(0);

  // Responsive camera framing calculator
  const getResponsiveMultiplier = (aspect: number) => {
    if (aspect < 0.75) return 1.55; // Mobile portrait
    if (aspect < 1.0) return 1.35;  // Tablet portrait
    if (aspect < 1.35) return 1.15; // Tablet landscape
    return 1.0;                     // Desktop standard
  };

  const getPresetVectors = (idx: number, aspect: number, centerY: number) => {
    const mult = getResponsiveMultiplier(aspect);
    const presets = [
      // 01 THREE-QUARTER (Classic ~70mm studio hero view)
      { pos: new THREE.Vector3(3.8 * mult, centerY + 0.55, 4.4 * mult), target: new THREE.Vector3(0, centerY, 0) },
      // 02 FRONT
      { pos: new THREE.Vector3(0, centerY + 0.38, 5.8 * mult), target: new THREE.Vector3(0, centerY, 0) },
      // 03 PROFILE
      { pos: new THREE.Vector3(5.8 * mult, centerY + 0.42, 0), target: new THREE.Vector3(0, centerY, 0) },
      // 04 REAR
      { pos: new THREE.Vector3(0, centerY + 0.52, -5.8 * mult), target: new THREE.Vector3(0, centerY, 0) },
      // 05 TOP DOWN
      { pos: new THREE.Vector3(0.01, centerY + 6.2 * mult, 0.01), target: new THREE.Vector3(0, centerY, 0) }
    ];
    return presets[idx] || presets[0];
  };

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const aspect = width / height;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060608);
    scene.fog = new THREE.FogExp2(0x060608, 0.045);
    sceneRef.current = scene;

    // 2. Camera with 32° FOV for professional ~70mm compression
    const camera = new THREE.PerspectiveCamera(32, aspect, 0.1, 45);
    const initialPreset = getPresetVectors(0, aspect, 0.52);
    camera.position.copy(initialPreset.pos).multiplyScalar(1.2);
    camera.lookAt(initialPreset.target);
    cameraRef.current = camera;

    cameraTargetPosRef.current.copy(initialPreset.pos);
    cameraLookAtRef.current.copy(initialPreset.target);
    currentLookAtRef.current.copy(initialPreset.target);

    // 3. Renderer with ACES Filmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    // 4. Photographic Studio Environment Map
    const studioEnvTexture = buildStudioEnvironment(renderer);
    scene.environment = studioEnvTexture;

    // 5. Directional & Studio Lighting
    const ambient = new THREE.AmbientLight(0x08090d, 0.65);
    scene.add(ambient);

    // Key Light: High-angle directional light with soft PCF shadows
    const keyLight = new THREE.DirectionalLight(0xffffff, 0);
    keyLight.position.set(3.8, 7.5, 4.4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -4.5;
    keyLight.shadow.camera.right = 4.5;
    keyLight.shadow.camera.top = 4.5;
    keyLight.shadow.camera.bottom = -4.5;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.radius = 2.2;
    scene.add(keyLight);

    // Rim Light: Separates rear aerodynamic haunches against dark studio void
    const rimLight = new THREE.DirectionalLight(0xdbe4f8, 0);
    rimLight.position.set(-4.5, 3.8, -5.5);
    scene.add(rimLight);

    // Lateral fill: Soft continuous side fill
    const sideLight = new THREE.DirectionalLight(0xe4edfc, 0);
    sideLight.position.set(5.5, 2.5, 0.5);
    scene.add(sideLight);

    lightsRef.current = { keyLight, rimLight, sideLight, ambient };

    // 6. Ground Studio Floor (Dark semi-matte receiving directional shadow & soft reflection)
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x060608,
      roughness: 0.38,
      metalness: 0.25,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // 7. Vehicle Root Group
    const carGroup = new THREE.Group();
    carGroup.position.set(0, 0, 0);
    carGroup.rotation.y = targetCarRotationRef.current.y;
    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // Contact Ambient Occlusion Shadow Plane (Anchored inside carGroup so it rotates synchronously)
    const contactTex = createGroundContactTexture();
    const contactGeo = new THREE.PlaneGeometry(5.2, 5.2);
    const contactMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.95,
    });
    const contactMesh = new THREE.Mesh(contactGeo, contactMat);
    contactMesh.rotation.x = -Math.PI / 2;
    contactMesh.position.set(0, 0.002, 0);
    carGroup.add(contactMesh);

    // 8. Procedural Micro-Textures for Materials
    const paintMicroNormal = createCarPaintMicroTexture();
    const brakeRotorTexture = createBrakeRotorTexture();
    const tireTexture = createTireTexture();

    // 9. Load High-Poly Automotive Model with Exact Physical Calibration
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/models/ferrari.glb',
      (gltf) => {
        const car = gltf.scene;

        // Bounding Box Normalization
        const box = new THREE.Box3().setFromObject(car);
        const size = box.getSize(new THREE.Vector3());

        // Target length 4.60m (authentic Ferrari 488 Pista length)
        const targetLength = 4.60;
        const currentLength = Math.max(size.x, size.z);
        const scaleFactor = targetLength / currentLength;
        car.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Recalculate scaled bounds
        const scaledBox = new THREE.Box3().setFromObject(car);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        const scaledSize = scaledBox.getSize(new THREE.Vector3());

        // Grounding: Center horizontally and place tire contact patches exactly at y = 0
        car.position.x = -scaledCenter.x;
        car.position.y = -scaledBox.min.y;
        car.position.z = -scaledCenter.z;

        const carVisualCenterY = scaledSize.y * 0.44;
        carCenterYRef.current = carVisualCenterY;

        // Camera targets
        const currentAspect = containerRef.current ? containerRef.current.clientWidth / containerRef.current.clientHeight : 1.6;
        const correctPreset = getPresetVectors(0, currentAspect, carVisualCenterY);
        cameraTargetPosRef.current.copy(correctPreset.pos);
        cameraLookAtRef.current.copy(correctPreset.target);
        currentLookAtRef.current.copy(correctPreset.target);

        // PBR Material Calibration Pass
        const bodyMats: THREE.MeshPhysicalMaterial[] = [];

        car.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.geometry) {
              mesh.geometry.computeVertexNormals();
            }

            const rawMat = mesh.material as THREE.Material;
            const matName = (rawMat.name || '').toLowerCase();
            const nodeName = (mesh.name || '').toLowerCase();

            // 1. CAR BODY PAINT (Clearcoat with micro-texture)
            if (
              nodeName === 'body' ||
              matName === 'body_color' ||
              nodeName.includes('hood') ||
              nodeName.includes('door')
            ) {
              const bodyMat = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(COLOR_FINISHES[0].hex),
                metalness: COLOR_FINISHES[0].metalness,
                roughness: COLOR_FINISHES[0].roughness,
                clearcoat: COLOR_FINISHES[0].clearcoat,
                clearcoatRoughness: COLOR_FINISHES[0].clearcoatRoughness,
                clearcoatNormalMap: paintMicroNormal,
                clearcoatNormalScale: new THREE.Vector2(0.045, 0.045),
                ior: 1.52,
                reflectivity: 1.0,
                envMapIntensity: 1.6,
              });
              mesh.material = bodyMat;
              bodyMats.push(bodyMat);
            }
            // 2. CARBON FIBER (Aero splitters, diffuser, steering wheel weave)
            else if (
              nodeName.includes('carbon') ||
              matName.includes('carbon')
            ) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x101114),
                roughness: 0.22,
                metalness: 0.72,
                clearcoat: 0.85,
                clearcoatRoughness: 0.06,
                envMapIntensity: 1.3,
              });
            }
            // 3. PHYSICAL AUTOMOTIVE GLASS (Windshield & Windows with transmission)
            else if (
              nodeName === 'glass' ||
              matName === 'glass_gray'
            ) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x182028),
                metalness: 0.04,
                roughness: 0.03,
                transmission: 0.94,
                transparent: true,
                opacity: 1.0,
                ior: 1.52,
                thickness: 0.85,
                attenuationColor: new THREE.Color(0xdde8f4),
                attenuationDistance: 1.4,
                reflectivity: 0.95,
                envMapIntensity: 1.9,
              });
            }
            // 4. TIRES (Vulcanized natural rubber, high roughness, subtle tread)
            else if (
              nodeName.includes('tire') ||
              matName === 'tires'
            ) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x151516),
                roughness: 0.88,
                metalness: 0.03,
                bumpMap: tireTexture,
                bumpScale: 0.015,
                envMapIntensity: 0.35,
              });
            }
            // 5. ALLOY WHEELS (Forged metallic titanium rims)
            else if (
              nodeName.includes('rim') ||
              nodeName === 'wheel'
            ) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x2e3036),
                metalness: 0.94,
                roughness: 0.16,
                envMapIntensity: 1.85,
              });
            }
            // 6. BRAKE DISCS (Cross-drilled carbon ceramic / steel rotor)
            else if (
              nodeName === 'brake'
            ) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x6e7178),
                metalness: 0.92,
                roughness: 0.34,
                bumpMap: brakeRotorTexture,
                bumpScale: 0.025,
                envMapIntensity: 1.4,
              });
            }
            // 7. BRAKE CALIPERS & HIGHLIGHTS
            else if (
              nodeName.includes('caliper') ||
              nodeName === 'brakes'
            ) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xc7ff3d),
                metalness: 0.35,
                roughness: 0.24,
                clearcoat: 0.8,
                clearcoatRoughness: 0.05,
                envMapIntensity: 1.2,
              });
            }
            // 8. FERRARI YELLOW BADGES & CAVALLINO CENTER CAPS
            else if (
              nodeName === 'centre' ||
              nodeName === 'yellow_trim' ||
              nodeName === 'steering_centre' ||
              matName === 'ferrari_yellow'
            ) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xf5b800),
                metalness: 0.12,
                roughness: 0.22,
                clearcoat: 0.9,
                clearcoatRoughness: 0.04,
                envMapIntensity: 1.4,
              });
            }
            // 9. CHROME & METALLIC FASTENERS
            else if (
              nodeName === 'chrome' ||
              nodeName === 'nuts' ||
              nodeName === 'steering_metal' ||
              nodeName === 'metal' ||
              matName === 'metal_chrome' ||
              matName === 'metal_gray'
            ) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xdcdcdc),
                metalness: 0.98,
                roughness: 0.08,
                envMapIntensity: 2.0,
              });
            }
            // 10. HEADLIGHT OPTICS (High transparency projector lens)
            else if (
              nodeName === 'lights' ||
              matName === 'projector_glass'
            ) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xffffff),
                metalness: 0.02,
                roughness: 0.02,
                transmission: 0.98,
                ior: 1.58,
                transparent: true,
                opacity: 1.0,
                envMapIntensity: 2.2,
              });
            }
            // 11. DAYTIME RUNNING LEDS
            else if (
              nodeName === 'leds' ||
              matName === 'turn_signal_led'
            ) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xffffff),
                emissive: new THREE.Color(0xffffff),
                emissiveIntensity: 1.4,
                roughness: 0.12,
              });
            }
            // 12. TAILLIGHT LENSES (Polycarbonate ruby)
            else if (
              nodeName === 'lights_red' ||
              nodeName === 'steering_red_lights' ||
              matName === 'taillight_glass'
            ) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x920606),
                roughness: 0.08,
                transmission: 0.72,
                clearcoat: 1.0,
                ior: 1.54,
                envMapIntensity: 1.8,
              });
            }
            // 13. INTERIOR LEATHER UPHOLSTERY
            else if (
              nodeName.includes('leather') ||
              nodeName === 'trim' ||
              nodeName === 'steering_trim' ||
              matName === 'leather' ||
              matName === 'leather_red'
            ) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x151518),
                roughness: 0.68,
                metalness: 0.04,
                envMapIntensity: 0.5,
              });
            }
            // 14. INTERIOR ALCANTARA & CARPET
            else if (
              nodeName.includes('interior') ||
              nodeName === 'carpet' ||
              nodeName === 'steering_column' ||
              matName === 'carpet' ||
              matName.includes('interior')
            ) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x0f0f12),
                roughness: 0.94,
                metalness: 0.02,
                envMapIntensity: 0.25,
              });
            }
            // 15. EXTERIOR GRILLS & WIPERS
            else if (
              nodeName === 'grills' ||
              nodeName === 'wipers' ||
              nodeName === 'plastic_gray' ||
              matName === 'plastic_gray'
            ) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x131315),
                roughness: 0.72,
                metalness: 0.22,
                envMapIntensity: 0.6,
              });
            }
          }
        });

        bodyMaterialsRef.current = bodyMats;
        carGroup.add(car);
        setIsLoading(false);
        introStartTimeRef.current = performance.now();
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (err) => {
        console.warn('3D model load notice:', err);
        setIsLoading(false);
      }
    );

    // Scroll Handler
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / 800, 1);
      scrollOffsetRef.current = progress;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Render & Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();

      // 1. Cinematic Staged Lighting Reveal
      if (introStartTimeRef.current && lightsRef.current) {
        const elapsed = (now - introStartTimeRef.current) / 1000;
        const introDuration = 2.4;

        if (elapsed < introDuration) {
          const t = elapsed / introDuration;
          const easeOut = 1 - Math.pow(1 - t, 3);

          lightsRef.current.keyLight.intensity = THREE.MathUtils.lerp(0, 2.4, easeOut);
          lightsRef.current.rimLight.intensity = THREE.MathUtils.lerp(0, 1.8, easeOut);
          lightsRef.current.sideLight.intensity = THREE.MathUtils.lerp(0, 1.6, easeOut);

          camera.position.x = THREE.MathUtils.lerp(cameraTargetPosRef.current.x * 1.25, cameraTargetPosRef.current.x, easeOut);
          camera.position.y = THREE.MathUtils.lerp(cameraTargetPosRef.current.y * 1.2, cameraTargetPosRef.current.y, easeOut);
          camera.position.z = THREE.MathUtils.lerp(cameraTargetPosRef.current.z * 1.25, cameraTargetPosRef.current.z, easeOut);
        } else if (!introFinishedRef.current) {
          lightsRef.current.keyLight.intensity = 2.4;
          lightsRef.current.rimLight.intensity = 1.8;
          lightsRef.current.sideLight.intensity = 1.6;
          introFinishedRef.current = true;
        }
      }

      // 2. Inertial Car Rotation around its EXACT geometric center
      if (carGroupRef.current) {
        if (!isPointerDownRef.current) {
          rotationVelocityRef.current.y *= 0.93;
          targetCarRotationRef.current.y += rotationVelocityRef.current.y;
        }

        carGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          carGroupRef.current.rotation.y,
          targetCarRotationRef.current.y,
          0.14
        );
      }

      // 3. Smooth Camera Positioning & Centered Parallax
      if (introFinishedRef.current) {
        const parallaxX = mouseParallaxRef.current.x * 0.32;
        const parallaxY = mouseParallaxRef.current.y * 0.18;
        const scrollElevate = scrollOffsetRef.current * 0.32;

        const targetX = cameraTargetPosRef.current.x + parallaxX;
        const targetY = cameraTargetPosRef.current.y + parallaxY + scrollElevate;
        const targetZ = cameraTargetPosRef.current.z;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.09);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.09);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.09);

        currentLookAtRef.current.lerp(cameraLookAtRef.current, 0.12);
        camera.lookAt(currentLookAtRef.current);
      }

      // 4. Project 3D Hotspots to 2D Screen Space
      if (cameraRef.current && containerRef.current && carGroupRef.current) {
        const cWidth = containerRef.current.clientWidth;
        const cHeight = containerRef.current.clientHeight;

        const updated2DHotspots = HOTSPOTS.map((spot) => {
          const worldPos = new THREE.Vector3(...spot.position);
          worldPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), carGroupRef.current!.rotation.y);

          const clone = worldPos.clone();
          clone.project(cameraRef.current!);

          const x = (clone.x * 0.5 + 0.5) * cWidth;
          const y = (-(clone.y * 0.5) + 0.5) * cHeight;
          const visible = clone.z < 1.0 && x > 20 && x < cWidth - 20 && y > 20 && y < cHeight - 20;

          return { id: spot.id, x, y, visible };
        });

        setScreen2DHotspots(updated2DHotspots);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 5. Responsive Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const newAspect = w / h;

      cameraRef.current.aspect = newAspect;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);

      if (!activeHotspot) {
        const updatedPreset = getPresetVectors(activePreset, newAspect, carCenterYRef.current);
        cameraTargetPosRef.current.copy(updatedPreset.pos);
        cameraLookAtRef.current.copy(updatedPreset.target);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      renderer.dispose();
      studioEnvTexture.dispose();
    };
  }, [activePreset, activeHotspot]);

  // Update Paint Finish on all body meshes
  useEffect(() => {
    bodyMaterialsRef.current.forEach((mat) => {
      mat.color.set(selectedFinish.hex);
      mat.metalness = selectedFinish.metalness;
      mat.roughness = selectedFinish.roughness;
      mat.clearcoat = selectedFinish.clearcoat;
      mat.clearcoatRoughness = selectedFinish.clearcoatRoughness;
      mat.needsUpdate = true;
    });
  }, [selectedFinish]);

  // Pointer Interaction Handlers for Inertial Drag
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    previousPointerPositionRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    if (onVehicleIgnited) {
      onVehicleIgnited();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;
      mouseParallaxRef.current = { x: normX, y: -normY };
    }

    if (!isPointerDownRef.current) return;

    const deltaX = e.clientX - previousPointerPositionRef.current.x;
    previousPointerPositionRef.current = { x: e.clientX, y: e.clientY };

    const rotSpeed = 0.0065;
    rotationVelocityRef.current.y = deltaX * rotSpeed;
    targetCarRotationRef.current.y += deltaX * rotSpeed;
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    setIsDragging(false);
  };

  const selectPreset = (index: number) => {
    audioEngine.playClick();
    setActivePreset(index);
    setActiveHotspot(null);
    if (containerRef.current) {
      const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      const preset = getPresetVectors(index, aspect, carCenterYRef.current);
      cameraTargetPosRef.current.copy(preset.pos);
      cameraLookAtRef.current.copy(preset.target);
    }
  };

  const handleInspectHotspot = (spot: HotspotData) => {
    audioEngine.playClick();
    setActiveHotspot(spot);
    cameraTargetPosRef.current.set(...spot.cameraPosition);
    cameraLookAtRef.current.set(...spot.cameraTarget);
  };

  const handleResetView = () => {
    audioEngine.playClick();
    setActiveHotspot(null);
    selectPreset(0);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="relative w-full h-[520px] sm:h-[600px] lg:h-[680px] select-none cursor-grab active:cursor-grabbing overflow-hidden mx-auto"
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Loading Screen Indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#060608] flex flex-col items-center justify-center z-30 pointer-events-none">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C7FF3D] animate-ping" />
            <span className="font-display text-xl font-bold tracking-tight text-white uppercase">
              VÉLOCÉ ATELIER
            </span>
          </div>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[#C7FF3D] transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="font-mono text-xs text-[#8B8B8B] tracking-widest uppercase">
            CALIBRATING PHOTOMETRIC STUDIO {loadProgress}%
          </span>
        </div>
      )}

      {/* Refined Minimal 2D Hotspot Reticles */}
      {!isLoading &&
        !activeHotspot &&
        screen2DHotspots.map((spot) => {
          if (!spot.visible) return null;
          const data = HOTSPOTS.find((h) => h.id === spot.id);
          if (!data) return null;

          return (
            <div
              key={spot.id}
              style={{
                transform: `translate3d(${spot.x}px, ${spot.y}px, 0)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleInspectHotspot(data);
              }}
              className="absolute -top-2.5 -left-2.5 z-20 group cursor-pointer pointer-events-auto"
            >
              {/* Precision Reticle (subtle 5px point + hairline ring, non-distracting) */}
              <div className="relative w-5 h-5 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border border-white/25 group-hover:scale-125 group-hover:border-[#C7FF3D] transition-all duration-200" />
                <div className="absolute w-1.5 h-1.5 rounded-full bg-white/90 group-hover:bg-[#C7FF3D] transition-colors" />
              </div>

              {/* Hover Sleek Telemetry Tag */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 bg-black/90 backdrop-blur-md px-2.5 py-1 rounded border border-white/20 whitespace-nowrap shadow-xl">
                <span className="font-mono text-[0.6rem] text-[#C7FF3D] font-bold">{data.number}</span>
                <span className="font-mono text-[0.65rem] text-white font-medium tracking-wide">{data.title}</span>
              </div>
            </div>
          );
        })}

      {/* Active Hotspot Spatial Information Card */}
      {activeHotspot && (
        <div className="absolute bottom-20 left-6 sm:left-12 z-30 max-w-sm bg-black/85 backdrop-blur-xl border border-white/20 p-6 rounded-sm shadow-2xl animate-hero-text">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-[#C7FF3D] font-bold tracking-widest">
              HOTSPOT // {activeHotspot.number}
            </span>
            <span className="font-mono text-[0.65rem] text-[#8B8B8B] tracking-wider uppercase">
              {activeHotspot.category}
            </span>
          </div>

          <h4 className="font-display text-xl font-black uppercase text-white tracking-tight mb-2">
            {activeHotspot.title}
          </h4>

          <p className="font-sans text-xs text-[#8B8B8B] leading-relaxed mb-4">
            {activeHotspot.description}
          </p>

          <div className="pt-3 border-t border-white/10 font-mono text-[0.7rem] text-[#C7FF3D] mb-4">
            {activeHotspot.specs}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetView}
              className="btn-secondary text-xs py-2 px-4 w-full justify-center"
            >
              RESET PERSPECTIVE
            </button>
          </div>
        </div>
      )}

      {/* Camera Presets Bar */}
      <div className="absolute top-4 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        {/* Left: Drag Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-[#8B8B8B] pointer-events-auto">
          <RotateCw size={13} className={`text-[#C7FF3D] ${isDragging ? 'animate-spin' : ''}`} />
          <span>{isDragging ? 'ORBITING ATELIER' : 'DRAG TO ROTATE 360°'}</span>
        </div>

        {/* Right: Camera Angles Selector */}
        <div className="hidden sm:flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md border border-white/10 rounded pointer-events-auto">
          {PRESET_LABELS.map((label, idx) => (
            <button
              key={idx}
              onClick={() => selectPreset(idx)}
              className={`font-mono text-[0.65rem] tracking-wider px-2.5 py-1 rounded transition-all ${
                activePreset === idx && !activeHotspot
                  ? 'bg-[#C7FF3D] text-black font-bold'
                  : 'text-[#8B8B8B] hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bespoke Atelier Color Finishes Strip */}
      <div className="absolute bottom-4 right-6 sm:right-12 z-20 flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2.5 rounded-sm border border-white/15 pointer-events-auto shadow-2xl">
        <span className="font-mono text-[0.65rem] text-[#8B8B8B] tracking-widest uppercase hidden sm:inline">
          ATELIER SPEC:
        </span>
        <div className="flex items-center gap-2">
          {COLOR_FINISHES.map((finish) => (
            <button
              key={finish.id}
              onClick={() => {
                audioEngine.playClick();
                setSelectedFinish(finish);
              }}
              title={finish.name}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                selectedFinish.id === finish.id
                  ? 'border-white scale-125 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: finish.hex }}
            />
          ))}
        </div>
        <span className="font-mono text-xs font-bold text-[#F4F3EF] tracking-wider ml-1">
          {selectedFinish.name}
        </span>
      </div>

      {/* Bottom Left: Hotspot Quick Navigation */}
      <div className="absolute bottom-4 left-6 sm:left-12 z-20 hidden md:flex items-center gap-2 pointer-events-auto">
        <span className="font-mono text-[0.65rem] text-[#8B8B8B] tracking-widest uppercase">
          TELEMETRY INSPECT:
        </span>
        <div className="flex items-center gap-1.5">
          {HOTSPOTS.map((h) => (
            <button
              key={h.id}
              onClick={() => handleInspectHotspot(h)}
              className={`px-2 py-1 rounded text-[0.65rem] font-mono border transition-all ${
                activeHotspot?.id === h.id
                  ? 'bg-[#C7FF3D] text-black font-bold border-[#C7FF3D]'
                  : 'bg-black/60 border-white/10 text-[#8B8B8B] hover:text-white'
              }`}
            >
              {h.number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
