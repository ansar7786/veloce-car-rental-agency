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
  position: [number, number, number]; // 3D world coords
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
    position: [0.75, 0.45, 1.9],
    cameraTarget: [0.6, 0.4, 1.6],
    cameraPosition: [1.6, 0.8, 2.8]
  },
  {
    id: 'powertrain',
    number: '02',
    title: 'TWIN-TURBOCHARGED HEART',
    category: 'MECHANICAL TELEMETRY',
    description: 'Dry-sump twin-turbo mid-rear configuration with anti-lag bypass valves. Forged titanium connecting rods and ceramic-coated exhaust manifolds tuned for instantaneous boost delivery.',
    specs: '8,200 RPM REDLINE • 720 NM PEAK TORQUE • ZERO LAG',
    position: [0, 0.65, -0.8],
    cameraTarget: [0, 0.5, -0.6],
    cameraPosition: [0, 2.2, -2.6]
  },
  {
    id: 'aero',
    number: '03',
    title: 'VENTURI GROUND EFFECT',
    category: 'ACTIVE AERODYNAMICS',
    description: 'Carbon-fiber rear diffuser and active variable-geometry rear aerofoil. Creates mathematical low-pressure suction under high-speed sweepers, generating 400 kg of genuine downforce.',
    specs: '400 KG DOWNFORCE @ 250 KM/H • 0.31 CD DRAG INDEX',
    position: [-0.85, 0.55, -1.85],
    cameraTarget: [0, 0.4, -1.6],
    cameraPosition: [-2.2, 1.1, -3.2]
  },
  {
    id: 'cockpit',
    number: '04',
    title: 'ALCANTARA MONOCOQUE',
    category: 'INTERIOR ARCHITECTURE',
    description: 'Carbon-fiber monocoque passenger cell draped in weight-saving micro-suede Alcantara. Integrated telemetry HUD directly projected on the anti-reflective windshield.',
    specs: 'FIA TRACK SPEC SEATING • 12.3" DIGITAL COCKPIT',
    position: [0.35, 0.8, 0.1],
    cameraTarget: [0, 0.7, 0.1],
    cameraPosition: [1.2, 1.4, 0.8]
  },
  {
    id: 'brakes',
    number: '05',
    title: 'CARBON CERAMIC BRAKES',
    category: 'CHASSIS DYNAMICS',
    description: 'Cross-drilled carbon-ceramic brake rotors with bespoke Electric Lime 6-piston monobloc aluminium calipers. Fade-free retardation from 200 km/h to standstill in under 4.1 seconds.',
    specs: '390MM FRONT / 360MM REAR • 1,000°C THERMAL CAPACITY',
    position: [0.95, 0.32, 1.25],
    cameraTarget: [0.85, 0.3, 1.2],
    cameraPosition: [1.8, 0.5, 1.8]
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

const CAMERA_PRESETS = [
  { label: '01 THREE-QUARTER', pos: [3.4, 1.25, 3.8], target: [0, 0.2, 0] },
  { label: '02 FRONT', pos: [0, 0.9, 4.4], target: [0, 0.2, 0] },
  { label: '03 PROFILE', pos: [4.4, 0.95, 0], target: [0, 0.2, 0] },
  { label: '04 REAR', pos: [0, 1.1, -4.2], target: [0, 0.2, 0] },
  { label: '05 TOP DOWN', pos: [0.1, 4.8, 0.1], target: [0, 0, 0] }
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

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const bodyMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
    sideLight: THREE.DirectionalLight;
    topSoftbox: THREE.SpotLight;
    ambient: THREE.AmbientLight;
  } | null>(null);

  // Interaction & Camera Kinematics
  const isPointerDownRef = useRef(false);
  const previousPointerPositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const targetCarRotationRef = useRef({ y: -0.45 });
  const cameraTargetPosRef = useRef(new THREE.Vector3(3.4, 1.25, 3.8));
  const cameraLookAtRef = useRef(new THREE.Vector3(0, 0.2, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0.2, 0));
  const mouseParallaxRef = useRef({ x: 0, y: 0 });
  const introStartTimeRef = useRef<number | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);
    scene.fog = new THREE.FogExp2(0x080808, 0.08);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 40);
    camera.position.set(4.5, 1.8, 5.0); // start slightly further for intro reveal
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Environment Generator (Dark Studio Softbox Reflection)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Create Studio Reflection Cube (Simulated high-end dark automotive cyclorama)
    const studioScene = new THREE.Scene();
    studioScene.background = new THREE.Color(0x040404);

    // Overhead giant softbox reflector
    const softboxGeo = new THREE.PlaneGeometry(12, 12);
    const softboxMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const softboxMesh = new THREE.Mesh(softboxGeo, softboxMat);
    softboxMesh.position.set(0, 7, 0);
    softboxMesh.rotation.x = Math.PI / 2;
    studioScene.add(softboxMesh);

    // Side linear light strip
    const sideStripGeo = new THREE.PlaneGeometry(16, 1.5);
    const sideStripMat = new THREE.MeshBasicMaterial({ color: 0xe0e5ff });
    const sideStripMesh = new THREE.Mesh(sideStripGeo, sideStripMat);
    sideStripMesh.position.set(5, 2.5, 0);
    sideStripMesh.rotation.y = -Math.PI / 2;
    studioScene.add(sideStripMesh);

    // Subtle opposite neon lime laser rim reflection
    const limeStripMat = new THREE.MeshBasicMaterial({ color: 0xc7ff3d });
    const limeStripMesh = new THREE.Mesh(sideStripGeo, limeStripMat);
    limeStripMesh.position.set(-5, 2.2, 0);
    limeStripMesh.rotation.y = Math.PI / 2;
    studioScene.add(limeStripMesh);

    const studioEnvTexture = pmremGenerator.fromScene(studioScene, 0.04).texture;
    scene.environment = studioEnvTexture;

    // Studio Lighting Setup
    const ambient = new THREE.AmbientLight(0x080808, 0.6);
    scene.add(ambient);

    // Key Light: Overhead angled soft illumination
    const keyLight = new THREE.DirectionalLight(0xffffff, 0); // starts at 0 for cinematic reveal
    keyLight.position.set(3, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Rim Light: Behind vehicle defining aerodynamic roofline & haunches
    const rimLight = new THREE.DirectionalLight(0xffffff, 0);
    rimLight.position.set(-4, 3.5, -4);
    scene.add(rimLight);

    // Side Light: Sculptural door contour reflection
    const sideLight = new THREE.DirectionalLight(0xdfe6f0, 0);
    sideLight.position.set(5, 2.5, 1);
    scene.add(sideLight);

    // Top Down Overhead Softbox Spot
    const topSoftbox = new THREE.SpotLight(0xffffff, 0, 14, Math.PI / 4, 0.4, 1.5);
    topSoftbox.position.set(0, 6, 0);
    topSoftbox.target.position.set(0, 0, 0);
    scene.add(topSoftbox);
    scene.add(topSoftbox.target);

    lightsRef.current = { keyLight, rimLight, sideLight, topSoftbox, ambient };

    // Ground Studio Floor with circular reflection & shadow receiver
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070707,
      roughness: 0.35,
      metalness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ground Radial Shadow Vignette Mesh
    const shadowDiscGeo = new THREE.CircleGeometry(3.6, 64);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(256, 256, 40, 256, 256, 256);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
    sGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.65)');
    sGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.2)');
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
    shadowMesh.position.y = 0.005;
    scene.add(shadowMesh);

    // Car Group container
    const carGroup = new THREE.Group();
    carGroup.rotation.y = targetCarRotationRef.current.y;
    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // Load High-Detail GLB Car Model
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/models/ferrari.glb',
      (gltf) => {
        const car = gltf.scene;
        car.scale.set(1.15, 1.15, 1.15);
        car.position.set(0, 0, 0);

        // Traverse and enhance with ultra-realistic automotive PBR shaders
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
                envMapIntensity: 1.4,
              });
              mesh.material = bodyMat;
              bodyMats.push(bodyMat);
            }
            // Glass / Windows
            else if (matName.includes('glass') || nodeName.includes('glass') || matName.includes('window')) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x10151c),
                metalness: 0.1,
                roughness: 0.05,
                transmission: 0.9,
                transparent: true,
                opacity: 0.88,
                ior: 1.52,
                reflectivity: 0.9,
                envMapIntensity: 1.8,
              });
            }
            // Carbon Fiber / Trim
            else if (matName.includes('carbon') || matName.includes('black') || nodeName.includes('carbon') || nodeName.includes('diffuser')) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x111113),
                roughness: 0.45,
                metalness: 0.7,
                envMapIntensity: 1.0,
              });
            }
            // Rims / Alloy
            else if (matName.includes('rim') || nodeName.includes('rim') || matName.includes('wheel')) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x353538),
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
                roughness: 0.25,
                emissive: new THREE.Color(0x304207),
                emissiveIntensity: 0.3,
              });
            }
            // Tires / Rubber
            else if (matName.includes('tire') || matName.includes('rubber') || nodeName.includes('tire')) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x151515),
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

    // Render & Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();

      // 1. Cinematic Intro Lighting Transition
      if (introStartTimeRef.current && lightsRef.current) {
        const elapsed = (now - introStartTimeRef.current) / 1000;
        const introDuration = 2.4; // 2.4s reveal

        if (elapsed < introDuration) {
          const t = elapsed / introDuration;
          const easeOut = 1 - Math.pow(1 - t, 3);

          lightsRef.current.keyLight.intensity = THREE.MathUtils.lerp(0, 3.2, easeOut);
          lightsRef.current.rimLight.intensity = THREE.MathUtils.lerp(0, 4.5, easeOut);
          lightsRef.current.sideLight.intensity = THREE.MathUtils.lerp(0, 2.8, easeOut);
          lightsRef.current.topSoftbox.intensity = THREE.MathUtils.lerp(0, 2.4, easeOut);

          // Camera moves subtly forward during intro
          camera.position.x = THREE.MathUtils.lerp(4.2, cameraTargetPosRef.current.x, easeOut);
          camera.position.y = THREE.MathUtils.lerp(1.7, cameraTargetPosRef.current.y, easeOut);
          camera.position.z = THREE.MathUtils.lerp(4.8, cameraTargetPosRef.current.z, easeOut);
        } else if (!introFinished) {
          lightsRef.current.keyLight.intensity = 3.2;
          lightsRef.current.rimLight.intensity = 4.5;
          lightsRef.current.sideLight.intensity = 2.8;
          lightsRef.current.topSoftbox.intensity = 2.4;
          setIntroFinished(true);
        }
      }

      // 2. Inertial Car Rotation
      if (carGroupRef.current) {
        if (!isPointerDownRef.current) {
          // Inertial deceleration damping
          rotationVelocityRef.current.y *= 0.94;
          targetCarRotationRef.current.y += rotationVelocityRef.current.y;
        }

        // Smoothly interpolate rotation
        carGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          carGroupRef.current.rotation.y,
          targetCarRotationRef.current.y,
          0.12
        );
      }

      // 3. Smooth Camera Transitions & Parallax
      if (introFinished) {
        const targetX = cameraTargetPosRef.current.x + mouseParallaxRef.current.x * 0.45;
        const targetY = cameraTargetPosRef.current.y + mouseParallaxRef.current.y * 0.25;
        const targetZ = cameraTargetPosRef.current.z;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);

        currentLookAtRef.current.lerp(cameraLookAtRef.current, 0.1);
        camera.lookAt(currentLookAtRef.current);
      }

      // 4. Project 3D Hotspots to 2D Screen Space
      if (cameraRef.current && containerRef.current && carGroupRef.current) {
        const cWidth = containerRef.current.clientWidth;
        const cHeight = containerRef.current.clientHeight;

        const updated2DHotspots = HOTSPOTS.map((spot) => {
          const worldPos = new THREE.Vector3(...spot.position);
          worldPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), carGroupRef.current!.rotation.y);

          // Check if behind camera
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

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      pmremGenerator.dispose();
    };
  }, []);

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
    const preset = CAMERA_PRESETS[index];
    cameraTargetPosRef.current.set(preset.pos[0], preset.pos[1], preset.pos[2]);
    cameraLookAtRef.current.set(preset.target[0], preset.target[1], preset.target[2]);
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
      className="relative w-full h-[540px] sm:h-[620px] lg:h-[720px] select-none cursor-grab active:cursor-grabbing overflow-hidden"
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
            CALIBRATING 3D MACHINE TELEMETRY {loadProgress}%
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
          {CAMERA_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => selectPreset(idx)}
              className={`font-mono text-[0.65rem] tracking-wider px-2.5 py-1 rounded transition-all ${
                activePreset === idx && !activeHotspot
                  ? 'bg-[#C7FF3D] text-black font-bold'
                  : 'text-[#8B8B8B] hover:text-white'
              }`}
            >
              {p.label}
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
