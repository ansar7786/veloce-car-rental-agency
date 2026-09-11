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
  position: [number, number, number]; // Normalized relative to vehicle center
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
}

const HOTSPOTS: HotspotData[] = [
  {
    id: 'lighting',
    number: '01',
    title: 'MATRIX LED SIGNATURE',
    category: 'OPTICAL ENGINEERING',
    description: 'Ultra-thin matrix LED optics featuring 84 individually controlled diodes. Adaptive high-beam shadow masking ensures maximum tarmac illumination without dazzling oncoming traffic.',
    specs: '600M HIGH-BEAM RANGE • 0.05S ADAPTIVE LATENCY',
    position: [0.72, 0.48, 1.85],
    cameraTarget: [0.5, 0.45, 1.5],
    cameraPosition: [1.4, 0.75, 2.5]
  },
  {
    id: 'powertrain',
    number: '02',
    title: 'TWIN-TURBOCHARGED HEART',
    category: 'MECHANICAL TELEMETRY',
    description: 'Dry-sump twin-turbo mid-rear configuration with anti-lag bypass valves. Forged titanium connecting rods and ceramic-coated exhaust manifolds tuned for instantaneous boost delivery.',
    specs: '8,200 RPM REDLINE • 720 NM PEAK TORQUE • ZERO LAG',
    position: [0, 0.7, -0.65],
    cameraTarget: [0, 0.55, -0.5],
    cameraPosition: [0, 2.0, -2.3]
  },
  {
    id: 'aero',
    number: '03',
    title: 'VENTURI GROUND EFFECT',
    category: 'ACTIVE AERODYNAMICS',
    description: 'Carbon-fiber rear diffuser and active variable-geometry rear aerofoil. Creates mathematical low-pressure suction under high-speed sweepers, generating 400 kg of genuine downforce.',
    specs: '400 KG DOWNFORCE @ 250 KM/H • 0.31 CD DRAG INDEX',
    position: [-0.75, 0.45, -1.95],
    cameraTarget: [0, 0.4, -1.5],
    cameraPosition: [-1.9, 0.95, -2.8]
  },
  {
    id: 'cockpit',
    number: '04',
    title: 'ALCANTARA MONOCOQUE',
    category: 'INTERIOR ARCHITECTURE',
    description: 'Carbon-fiber monocoque passenger cell draped in weight-saving micro-suede Alcantara. Integrated telemetry HUD directly projected on the anti-reflective windshield.',
    specs: 'FIA TRACK SPEC SEATING • 12.3" DIGITAL COCKPIT',
    position: [0.35, 0.85, 0.05],
    cameraTarget: [0, 0.65, 0.05],
    cameraPosition: [1.1, 1.3, 0.7]
  },
  {
    id: 'brakes',
    number: '05',
    title: 'CARBON CERAMIC BRAKES',
    category: 'CHASSIS DYNAMICS',
    description: 'Cross-drilled carbon-ceramic brake rotors with bespoke Electric Lime 6-piston monobloc aluminium calipers. Fade-free retardation from 200 km/h to standstill in under 4.1 seconds.',
    specs: '390MM FRONT / 360MM REAR • 1,000°C THERMAL CAPACITY',
    position: [0.95, 0.32, 1.25],
    cameraTarget: [0.85, 0.32, 1.2],
    cameraPosition: [1.7, 0.48, 1.7]
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
    hex: '#0a0a0c',
    metalness: 0.95,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03
  },
  {
    id: 'lime',
    name: 'VELOCE LIME RACING',
    hex: '#C7FF3D',
    metalness: 0.82,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04
  },
  {
    id: 'titanium',
    name: 'FROZEN TITANIUM',
    hex: '#b0b5be',
    metalness: 0.92,
    roughness: 0.28,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08
  },
  {
    id: 'scarlet',
    name: 'MONZA SCARLET',
    hex: '#9e141a',
    metalness: 0.88,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03
  },
  {
    id: 'deep-blue',
    name: 'MIDNIGHT SAPPHIRE',
    hex: '#0b162c',
    metalness: 0.92,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03
  }
];

const PRESET_LABELS = [
  '01 THREE-QUARTER',
  '02 FRONT',
  '03 PROFILE',
  '04 REAR',
  '05 TOP DOWN'
];

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
  const [introFinished, setIntroFinished] = useState(false);
  const [screen2DHotspots, setScreen2DHotspots] = useState<{ id: string; x: number; y: number; visible: boolean }[]>([]);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const shadowMeshRef = useRef<THREE.Mesh | null>(null);
  const bodyMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const carCenterYRef = useRef<number>(0.52);

  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
    sideLight: THREE.DirectionalLight;
    topSoftbox: THREE.SpotLight;
    ambient: THREE.AmbientLight;
  } | null>(null);

  // Interaction & Kinematics References
  const isPointerDownRef = useRef(false);
  const previousPointerPositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const targetCarRotationRef = useRef({ y: -0.45 });
  const cameraTargetPosRef = useRef(new THREE.Vector3(3.6, 1.4, 4.3));
  const cameraLookAtRef = useRef(new THREE.Vector3(0, 0.52, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0.52, 0));
  const mouseParallaxRef = useRef({ x: 0, y: 0 });
  const introStartTimeRef = useRef<number | null>(null);
  const scrollOffsetRef = useRef(0);

  // Responsive camera framing calculator
  const getResponsiveMultiplier = (aspect: number) => {
    if (aspect < 0.75) return 1.55; // Mobile portrait (e.g. 390x844)
    if (aspect < 1.0) return 1.35;  // Tablet portrait (e.g. 768x1024)
    if (aspect < 1.35) return 1.15; // Tablet landscape (e.g. 1024x768)
    return 1.0;                     // Desktop 1440x900 (aspect ~1.6)
  };

  const getPresetVectors = (idx: number, aspect: number, centerY: number) => {
    const mult = getResponsiveMultiplier(aspect);
    const presets = [
      // 01 THREE-QUARTER (Hero view - vehicle occupies 55-65% centered)
      { pos: new THREE.Vector3(3.6 * mult, centerY + 0.85, 4.3 * mult), target: new THREE.Vector3(0, centerY, 0) },
      // 02 FRONT
      { pos: new THREE.Vector3(0, centerY + 0.55, 5.6 * mult), target: new THREE.Vector3(0, centerY, 0) },
      // 03 PROFILE
      { pos: new THREE.Vector3(5.5 * mult, centerY + 0.65, 0), target: new THREE.Vector3(0, centerY, 0) },
      // 04 REAR
      { pos: new THREE.Vector3(0, centerY + 0.75, -5.5 * mult), target: new THREE.Vector3(0, centerY, 0) },
      // 05 TOP DOWN
      { pos: new THREE.Vector3(0.01, centerY + 5.8 * mult, 0.01), target: new THREE.Vector3(0, centerY, 0) }
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
    scene.background = new THREE.Color(0x080808);
    scene.fog = new THREE.FogExp2(0x080808, 0.06);
    sceneRef.current = scene;

    // 2. Camera with FOV tailored to prevent wide-angle distortion
    const camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 40);
    const initialPreset = getPresetVectors(0, aspect, 0.52);
    camera.position.copy(initialPreset.pos).multiplyScalar(1.2); // Start slightly further for intro reveal
    camera.lookAt(initialPreset.target);
    cameraRef.current = camera;

    cameraTargetPosRef.current.copy(initialPreset.pos);
    cameraLookAtRef.current.copy(initialPreset.target);
    currentLookAtRef.current.copy(initialPreset.target);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Studio Environment Generator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const studioScene = new THREE.Scene();
    studioScene.background = new THREE.Color(0x040404);

    // Overhead giant softbox reflector
    const softboxGeo = new THREE.PlaneGeometry(14, 14);
    const softboxMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const softboxMesh = new THREE.Mesh(softboxGeo, softboxMat);
    softboxMesh.position.set(0, 8, 0);
    softboxMesh.rotation.x = Math.PI / 2;
    studioScene.add(softboxMesh);

    // Side linear light strip
    const sideStripGeo = new THREE.PlaneGeometry(18, 1.8);
    const sideStripMat = new THREE.MeshBasicMaterial({ color: 0xe8ecfa });
    const sideStripMesh = new THREE.Mesh(sideStripGeo, sideStripMat);
    sideStripMesh.position.set(6, 2.8, 0);
    sideStripMesh.rotation.y = -Math.PI / 2;
    studioScene.add(sideStripMesh);

    // Opposite laser line
    const limeStripMat = new THREE.MeshBasicMaterial({ color: 0xc7ff3d });
    const limeStripMesh = new THREE.Mesh(sideStripGeo, limeStripMat);
    limeStripMesh.position.set(-6, 2.5, 0);
    limeStripMesh.rotation.y = Math.PI / 2;
    studioScene.add(limeStripMesh);

    const studioEnvTexture = pmremGenerator.fromScene(studioScene, 0.04).texture;
    scene.environment = studioEnvTexture;

    // 5. Studio Lighting Setup
    const ambient = new THREE.AmbientLight(0x080808, 0.7);
    scene.add(ambient);

    // Key Light: Overhead angled soft illumination
    const keyLight = new THREE.DirectionalLight(0xffffff, 0);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Rim Light: Behind vehicle defining aerodynamic roofline & haunches
    const rimLight = new THREE.DirectionalLight(0xffffff, 0);
    rimLight.position.set(-5, 4, -5);
    scene.add(rimLight);

    // Side Light: Sculptural door contour reflection
    const sideLight = new THREE.DirectionalLight(0xdfe6f0, 0);
    sideLight.position.set(6, 2.8, 1);
    scene.add(sideLight);

    // Top Down Overhead Softbox Spot
    const topSoftbox = new THREE.SpotLight(0xffffff, 0, 16, Math.PI / 3.5, 0.4, 1.5);
    topSoftbox.position.set(0, 7, 0);
    topSoftbox.target.position.set(0, 0, 0);
    scene.add(topSoftbox);
    scene.add(topSoftbox.target);

    lightsRef.current = { keyLight, rimLight, sideLight, topSoftbox, ambient };

    // 6. Ground Studio Floor
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070707,
      roughness: 0.3,
      metalness: 0.65,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ground Radial Shadow Vignette Mesh (centered at 0, 0)
    const shadowDiscGeo = new THREE.CircleGeometry(1, 64);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(256, 256, 30, 256, 256, 256);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.96)');
    sGrad.addColorStop(0.45, 'rgba(0, 0, 0, 0.65)');
    sGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.18)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 512, 512);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowDiscGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.005, 0);
    shadowMesh.scale.set(3.4, 3.4, 1);
    scene.add(shadowMesh);
    shadowMeshRef.current = shadowMesh;

    // 7. Vehicle Parent Group (Rooted strictly at World 0, 0, 0)
    const carGroup = new THREE.Group();
    carGroup.position.set(0, 0, 0);
    carGroup.rotation.y = targetCarRotationRef.current.y;
    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // 8. Load High-Detail GLB Model with Exact Geometric Normalization
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/models/ferrari.glb',
      (gltf) => {
        const car = gltf.scene;

        // CRITICAL FIX: Calculate original bounding box of the car
        const box = new THREE.Box3().setFromObject(car);
        const size = box.getSize(new THREE.Vector3());

        // Standardize vehicle scale so it prominently occupies 55–65% of the hero
        const targetLength = 4.6; // 4.6 meters standard sports car length
        const currentLength = Math.max(size.x, size.z);
        const scaleFactor = targetLength / currentLength;
        car.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Recalculate scaled bounds
        const scaledBox = new THREE.Box3().setFromObject(car);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        const scaledSize = scaledBox.getSize(new THREE.Vector3());

        // EXACT NORMALIZATION: Offset the vehicle so its geometric center is at (0, y, 0)
        // and its wheels touch the ground at y = 0
        car.position.x = -scaledCenter.x;
        car.position.y = -scaledBox.min.y;
        car.position.z = -scaledCenter.z;

        // Vehicle Visual Center (approx mid-height above ground)
        const carVisualCenterY = scaledSize.y * 0.44;
        carCenterYRef.current = carVisualCenterY;

        // Update camera targets to look at the exact center of the vehicle
        const currentAspect = containerRef.current ? containerRef.current.clientWidth / containerRef.current.clientHeight : 1.6;
        const correctPreset = getPresetVectors(0, currentAspect, carVisualCenterY);
        cameraTargetPosRef.current.copy(correctPreset.pos);
        cameraLookAtRef.current.copy(correctPreset.target);
        currentLookAtRef.current.copy(correctPreset.target);

        // Scale ground shadow to match exact footprint
        const shadowRadius = Math.max(scaledSize.x, scaledSize.z) * 0.65;
        if (shadowMeshRef.current) {
          shadowMeshRef.current.scale.set(shadowRadius, shadowRadius, 1);
        }

        // PBR Shader Calibration
        const bodyMats: THREE.MeshPhysicalMaterial[] = [];

        car.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const matName = (mesh.material as THREE.Material).name.toLowerCase();
            const nodeName = mesh.name.toLowerCase();

            // Body Paint Detection
            if (
              matName.includes('body') ||
              matName.includes('paint') ||
              matName.includes('car_paint') ||
              nodeName.includes('body') ||
              nodeName.includes('hood') ||
              nodeName.includes('door')
            ) {
              const bodyMat = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(COLOR_FINISHES[0].hex),
                metalness: COLOR_FINISHES[0].metalness,
                roughness: COLOR_FINISHES[0].roughness,
                clearcoat: COLOR_FINISHES[0].clearcoat,
                clearcoatRoughness: COLOR_FINISHES[0].clearcoatRoughness,
                reflectivity: 1.0,
                envMapIntensity: 1.5,
              });
              mesh.material = bodyMat;
              bodyMats.push(bodyMat);
            }
            // Glass / Windows
            else if (matName.includes('glass') || nodeName.includes('glass') || matName.includes('window')) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x0e141c),
                metalness: 0.1,
                roughness: 0.04,
                transmission: 0.92,
                transparent: true,
                opacity: 0.88,
                ior: 1.52,
                reflectivity: 0.9,
                envMapIntensity: 1.8,
              });
            }
            // Carbon Fiber / Splitters / Diffuser
            else if (matName.includes('carbon') || matName.includes('black') || nodeName.includes('carbon') || nodeName.includes('diffuser')) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x101012),
                roughness: 0.42,
                metalness: 0.72,
                envMapIntensity: 1.0,
              });
            }
            // Wheels / Rims
            else if (matName.includes('rim') || nodeName.includes('rim') || matName.includes('wheel')) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x323236),
                metalness: 0.95,
                roughness: 0.18,
                envMapIntensity: 1.8,
              });
            }
            // Brake Calipers (Electric Lime signature)
            else if (matName.includes('caliper') || nodeName.includes('caliper') || matName.includes('brake')) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xc7ff3d),
                metalness: 0.85,
                roughness: 0.22,
                emissive: new THREE.Color(0x283806),
                emissiveIntensity: 0.35,
              });
            }
            // Tires / Rubber
            else if (matName.includes('tire') || matName.includes('rubber') || nodeName.includes('tire')) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x141414),
                roughness: 0.92,
                metalness: 0.05,
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

    // Scroll Handler for continuous elevation without horizontal drift
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

      // 1. Cinematic Staged Intro Sequence
      if (introStartTimeRef.current && lightsRef.current) {
        const elapsed = (now - introStartTimeRef.current) / 1000;
        const introDuration = 2.4;

        if (elapsed < introDuration) {
          const t = elapsed / introDuration;
          const easeOut = 1 - Math.pow(1 - t, 3);

          lightsRef.current.keyLight.intensity = THREE.MathUtils.lerp(0, 3.4, easeOut);
          lightsRef.current.rimLight.intensity = THREE.MathUtils.lerp(0, 4.8, easeOut);
          lightsRef.current.sideLight.intensity = THREE.MathUtils.lerp(0, 2.9, easeOut);
          lightsRef.current.topSoftbox.intensity = THREE.MathUtils.lerp(0, 2.5, easeOut);

          // Camera tracks smoothly forward into hero framing
          camera.position.x = THREE.MathUtils.lerp(cameraTargetPosRef.current.x * 1.25, cameraTargetPosRef.current.x, easeOut);
          camera.position.y = THREE.MathUtils.lerp(cameraTargetPosRef.current.y * 1.2, cameraTargetPosRef.current.y, easeOut);
          camera.position.z = THREE.MathUtils.lerp(cameraTargetPosRef.current.z * 1.25, cameraTargetPosRef.current.z, easeOut);
        } else if (!introFinished) {
          lightsRef.current.keyLight.intensity = 3.4;
          lightsRef.current.rimLight.intensity = 4.8;
          lightsRef.current.sideLight.intensity = 2.9;
          lightsRef.current.topSoftbox.intensity = 2.5;
          setIntroFinished(true);
        }
      }

      // 2. Inertial Car Rotation around its EXACT geometric center
      if (carGroupRef.current) {
        if (!isPointerDownRef.current) {
          // Damped deceleration
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
      if (introFinished) {
        // Parallax is symmetrical and centered
        const parallaxX = mouseParallaxRef.current.x * 0.35;
        const parallaxY = mouseParallaxRef.current.y * 0.2;
        const scrollElevate = scrollOffsetRef.current * 0.35;

        const targetX = cameraTargetPosRef.current.x + parallaxX;
        const targetY = cameraTargetPosRef.current.y + parallaxY + scrollElevate;
        const targetZ = cameraTargetPosRef.current.z;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.09);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.09);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.09);

        // Keep camera looking directly at the vehicle's visual center (zero horizontal skew)
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

      // Re-adjust framing to ensure vehicle remains centered and uncropped
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
      pmremGenerator.dispose();
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
    // Parallax on desktop
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;
      mouseParallaxRef.current = { x: normX, y: -normY };
    }

    if (!isPointerDownRef.current) return;

    const deltaX = e.clientX - previousPointerPositionRef.current.x;
    previousPointerPositionRef.current = { x: e.clientX, y: e.clientY };

    // Set rotation and store velocity for inertia
    const rotSpeed = 0.007;
    rotationVelocityRef.current.y = deltaX * rotSpeed;
    targetCarRotationRef.current.y += deltaX * rotSpeed;
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    setIsDragging(false);
  };

  // Switch Camera Presets
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

  // Inspect Hotspot
  const handleInspectHotspot = (spot: HotspotData) => {
    audioEngine.playClick();
    setActiveHotspot(spot);
    cameraTargetPosRef.current.set(...spot.cameraPosition);
    cameraLookAtRef.current.set(...spot.cameraTarget);
  };

  // Reset View to Hero Preset
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
        <div className="absolute inset-0 bg-[#080808] flex flex-col items-center justify-center z-30 pointer-events-none">
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
            CENTERING 3D MACHINE CHASSIS {loadProgress}%
          </span>
        </div>
      )}

      {/* 2D Interactive Screen Hotspot Indicators */}
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
              className="absolute -top-3.5 -left-3.5 z-20 group cursor-pointer pointer-events-auto"
            >
              {/* Pulse Ring */}
              <div className="relative w-7 h-7 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#C7FF3D]/20 animate-ping" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#C7FF3D] border-2 border-black flex items-center justify-center group-hover:scale-125 transition-transform" />
              </div>

              {/* Hover Tag */}
              <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 bg-black/90 backdrop-blur-md px-3 py-1 rounded border border-white/20 whitespace-nowrap shadow-xl">
                <span className="font-mono text-[0.65rem] text-[#C7FF3D] font-bold">{data.number}</span>
                <span className="font-mono text-[0.7rem] text-white font-medium">{data.title}</span>
              </div>
            </div>
          );
        })}

      {/* Active Hotspot Detailed Spatial Card */}
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
          <span>{isDragging ? 'ROTATING MACHINE' : 'DRAG TO ROTATE 360°'}</span>
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
