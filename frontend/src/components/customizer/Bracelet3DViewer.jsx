import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Sparkles, Smartphone, CircleDot } from 'lucide-react';

/**
 * Tạo mô hình 3D cho charm điêu khắc thủ công (Figurines & Luxury Charms)
 * Mô phỏng chân thực các mẫu cườm, gốm men và pha lê như trong ảnh mẫu:
 * - Cây Thông Noel Pha Lê 3D (Faceted Crystal Christmas Tree)
 * - Người Tuyết Men Sứ 3D (Glazed Porcelain Snowman)
 * - Nấm Men Đỏ Chân Trắng (Glazed Red Mushroom)
 * - Trái Tim Men Gốm Xanh Bơ Puffy (Puffy Glazed Avocado Heart)
 * - Quả Táo Đỏ Thủy Tinh (Ruby Glass Apple)
 * - Vòng Nguyệt Quế Noel (Crystal Wreath)
 * - Hoa Men Sứ 5 Cánh (Porcelain Flower)
 * - Huy Chương Kim Loại Bạc / Vàng 925 (Embossed Medallion)
 */
function create3DCharmFigurine(charm, isGold = false, textureLoader = null) {
  const charmGroup = new THREE.Group();
  const id = (charm?.id || '').toLowerCase();
  const name = (charm?.name || '').toLowerCase();

  // Metal materials for bails and accents
  const metalMat = new THREE.MeshStandardMaterial({
    color: isGold ? 0xF5CA47 : 0xE8ECF0,
    metalness: 0.96,
    roughness: 0.12
  });

  // Top Bail / Connecting Jump Ring (Khuyên nối kim loại vào dây)
  const bailGeo = new THREE.TorusGeometry(0.12, 0.03, 14, 28);
  const bailMesh = new THREE.Mesh(bailGeo, metalMat);
  bailMesh.rotation.x = Math.PI / 2;
  charmGroup.add(bailMesh);

  // 1. CÂY THÔNG NOEL PHA LÊ 3D (Faceted Crystal Christmas Tree)
  if (id.includes('tree') || name.includes('thông')) {
    const treeGroup = new THREE.Group();
    treeGroup.position.y = -0.32;

    // Golden / Amber Crystal Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.11, 0.14, 0.22, 8);
    const trunkMat = new THREE.MeshPhysicalMaterial({
      color: 0xC88A36,
      roughness: 0.08,
      transmission: 0.7,
      thickness: 0.5,
      ior: 1.55,
      flatShading: true
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = -0.32;
    treeGroup.add(trunk);

    // Green Emerald Faceted Crystal Tiers (Các tầng lá pha lê giác cạnh)
    const crystalTreeMat = new THREE.MeshPhysicalMaterial({
      color: 0x18924B,
      emissive: 0x052B14,
      roughness: 0.04,
      transmission: 0.82,
      thickness: 0.7,
      ior: 1.58,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      flatShading: true
    });

    // Tier 1 (Tầng dưới cùng)
    const t1Geo = new THREE.ConeGeometry(0.50, 0.36, 7);
    const t1 = new THREE.Mesh(t1Geo, crystalTreeMat);
    t1.position.y = -0.12;
    treeGroup.add(t1);

    // Tier 2 (Tầng giữa)
    const t2Geo = new THREE.ConeGeometry(0.38, 0.32, 7);
    const t2 = new THREE.Mesh(t2Geo, crystalTreeMat);
    t2.position.y = 0.12;
    treeGroup.add(t2);

    // Tier 3 (Tầng ngọn)
    const t3Geo = new THREE.ConeGeometry(0.26, 0.28, 7);
    const t3 = new THREE.Mesh(t3Geo, crystalTreeMat);
    t3.position.y = 0.34;
    treeGroup.add(t3);

    // Top Golden Star / Crystal Gem
    const starGeo = new THREE.OctahedronGeometry(0.08, 0);
    const starMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.9, roughness: 0.1 });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.y = 0.52;
    treeGroup.add(star);

    // Tiny festive colored crystal orbs on tips (Hạt cườm đèn màu)
    const colors = [0xFF2A2A, 0xFFD700, 0x00E5FF, 0xFF69B4, 0x76FF03];
    const lightGeo = new THREE.SphereGeometry(0.042, 8, 8);
    for (let i = 0; i < 7; i++) {
      const ang = (i / 7) * Math.PI * 2;
      const lMat = new THREE.MeshPhysicalMaterial({
        color: colors[i % colors.length],
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.3,
        roughness: 0.05,
        transmission: 0.8
      });
      const orb = new THREE.Mesh(lightGeo, lMat);
      orb.position.set(0.46 * Math.cos(ang), -0.22, 0.46 * Math.sin(ang));
      treeGroup.add(orb);
    }

    charmGroup.add(treeGroup);
    return charmGroup;
  }

  // 2. NGƯỜI TUYẾT MEN SỨ 3D (Glazed Porcelain Snowman)
  if (id.includes('snowman') || name.includes('tuyết')) {
    const snowmanGroup = new THREE.Group();
    snowmanGroup.position.y = -0.36;

    const porcelainMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFDF9,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.9
    });

    // Lower Body
    const bodyGeo = new THREE.SphereGeometry(0.28, 24, 24);
    const body = new THREE.Mesh(bodyGeo, porcelainMat);
    snowmanGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.19, 24, 24);
    const head = new THREE.Mesh(headGeo, porcelainMat);
    head.position.y = 0.36;
    snowmanGroup.add(head);

    // Red Glazed Scarf (Khăn len quàng cổ đỏ)
    const scarfMat = new THREE.MeshPhysicalMaterial({ color: 0xD92525, roughness: 0.2, clearcoat: 0.8 });
    const scarfGeo = new THREE.TorusGeometry(0.17, 0.045, 12, 24);
    const scarf = new THREE.Mesh(scarfGeo, scarfMat);
    scarf.position.y = 0.24;
    scarf.rotation.x = Math.PI / 2;
    snowmanGroup.add(scarf);

    // Scarf tail hanging down
    const tailGeo = new THREE.BoxGeometry(0.07, 0.18, 0.035);
    const tail = new THREE.Mesh(tailGeo, scarfMat);
    tail.position.set(0.10, 0.14, 0.16);
    tail.rotation.z = -0.2;
    snowmanGroup.add(tail);

    // Black Top Hat (Nón xi-lanh đen)
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.25 });
    const brimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 24);
    const brim = new THREE.Mesh(brimGeo, hatMat);
    brim.position.y = 0.51;
    snowmanGroup.add(brim);

    const crownGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.22, 24);
    const crown = new THREE.Mesh(crownGeo, hatMat);
    crown.position.y = 0.63;
    snowmanGroup.add(crown);

    // Orange Carrot Nose
    const carrotMat = new THREE.MeshStandardMaterial({ color: 0xFF6B1A, roughness: 0.4 });
    const carrotGeo = new THREE.ConeGeometry(0.035, 0.14, 12);
    const carrot = new THREE.Mesh(carrotGeo, carrotMat);
    carrot.position.set(0, 0.36, 0.24);
    carrot.rotation.x = Math.PI / 2;
    snowmanGroup.add(carrot);

    // Coal Eyes & Buttons
    const coalMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
    const eyeGeo = new THREE.SphereGeometry(0.024, 8, 8);
    const eyeL = new THREE.Mesh(eyeGeo, coalMat);
    eyeL.position.set(-0.06, 0.41, 0.17);
    const eyeR = new THREE.Mesh(eyeGeo, coalMat);
    eyeR.position.set(0.06, 0.41, 0.17);
    snowmanGroup.add(eyeL, eyeR);

    // Buttons
    const btn1 = new THREE.Mesh(eyeGeo, coalMat);
    btn1.position.set(0, 0.08, 0.27);
    const btn2 = new THREE.Mesh(eyeGeo, coalMat);
    btn2.position.set(0, -0.06, 0.27);
    snowmanGroup.add(btn1, btn2);

    charmGroup.add(snowmanGroup);
    return charmGroup;
  }

  // 3. NẤM MEN ĐỎ CHÂN TRẮNG (Glazed Red Mushroom)
  if (id.includes('mushroom') || name.includes('nấm')) {
    const mushroomGroup = new THREE.Group();
    mushroomGroup.position.y = -0.34;

    // Porcelain white stem (Chân nấm sứ trắng)
    const stemMat = new THREE.MeshPhysicalMaterial({ color: 0xFFFDF7, roughness: 0.15, clearcoat: 0.9 });
    const stemGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.36, 20);
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = -0.12;
    mushroomGroup.add(stem);

    // Red Glazed Cap (Mũ nấm men đỏ bóng)
    const capMat = new THREE.MeshPhysicalMaterial({
      color: 0xE62626,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03
    });
    const capGeo = new THREE.SphereGeometry(0.32, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.06;
    mushroomGroup.add(cap);

    // White Porcelain Dots (Chấm bi trắng men sứ trên mũ nấm)
    const dotGeo = new THREE.SphereGeometry(0.045, 10, 10);
    const dotMat = new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, roughness: 0.1, clearcoat: 1.0 });
    const dotPositions = [
      [0, 0.35, 0.12],
      [-0.18, 0.24, 0.16],
      [0.18, 0.24, 0.16],
      [-0.22, 0.16, -0.12],
      [0.22, 0.16, -0.12],
      [0, 0.34, -0.16]
    ];
    dotPositions.forEach(([dx, dy, dz]) => {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(dx, dy, dz);
      mushroomGroup.add(dot);
    });

    charmGroup.add(mushroomGroup);
    return charmGroup;
  }

  // 4. TRÁI TIM MEN GỐM XANH BƠ / HỒNG PUFFY (Glazed Puffy Ceramic Heart)
  if (id.includes('heart') || name.includes('tim')) {
    const heartGroup = new THREE.Group();
    heartGroup.position.y = -0.32;

    const isGreen = id.includes('green') || name.includes('bơ') || name.includes('xanh');
    const heartColor = isGreen ? 0x93BF40 : 0xE84B68;

    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.15);
    heartShape.bezierCurveTo(0, 0.30, -0.28, 0.40, -0.28, 0.18);
    heartShape.bezierCurveTo(-0.28, -0.05, 0, -0.25, 0, -0.38);
    heartShape.bezierCurveTo(0, -0.25, 0.28, -0.05, 0.28, 0.18);
    heartShape.bezierCurveTo(0.28, 0.40, 0, 0.30, 0, 0.15);

    const extrudeSettings = {
      depth: 0.14,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08
    };
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.center();

    const heartMat = new THREE.MeshPhysicalMaterial({
      color: heartColor,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.95
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartGroup.add(heartMesh);

    charmGroup.add(heartGroup);
    return charmGroup;
  }

  // 5. QUẢ TÁO ĐỎ THỦY TINH RUBY (Ruby Red Glass Apple)
  if (id.includes('apple') || name.includes('táo')) {
    const appleGroup = new THREE.Group();
    appleGroup.position.y = -0.32;

    const appleMat = new THREE.MeshPhysicalMaterial({
      color: 0xC8102E,
      emissive: 0x330005,
      roughness: 0.05,
      transmission: 0.78,
      thickness: 0.65,
      ior: 1.52,
      clearcoat: 1.0
    });
    const appleGeo = new THREE.SphereGeometry(0.26, 24, 24);
    appleGeo.scale(1, 0.88, 1);
    const appleMesh = new THREE.Mesh(appleGeo, appleMat);
    appleGroup.add(appleMesh);

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.12, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4A2E18, roughness: 0.5 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.26;
    stem.rotation.z = -0.2;
    appleGroup.add(stem);

    // Green Leaf
    const leafGeo = new THREE.SphereGeometry(0.07, 8, 8);
    leafGeo.scale(1.8, 0.4, 0.8);
    const leafMat = new THREE.MeshPhysicalMaterial({ color: 0x2E8B57, roughness: 0.2, clearcoat: 0.8 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(0.08, 0.26, 0);
    leaf.rotation.z = 0.3;
    appleGroup.add(leaf);

    charmGroup.add(appleGroup);
    return charmGroup;
  }

  // 6. VÒNG NGUYỆT QUẾ NOEL (Holiday Crystal Wreath)
  if (id.includes('wreath') || name.includes('nguyệt quế')) {
    const wreathGroup = new THREE.Group();
    wreathGroup.position.y = -0.32;

    const wreathMat = new THREE.MeshPhysicalMaterial({
      color: 0x1E7B3A,
      roughness: 0.08,
      transmission: 0.75,
      thickness: 0.5,
      ior: 1.55,
      clearcoat: 1.0
    });
    const wreathGeo = new THREE.TorusGeometry(0.24, 0.07, 16, 32);
    const wreath = new THREE.Mesh(wreathGeo, wreathMat);
    wreathGroup.add(wreath);

    // Red Bow on top
    const bowMat = new THREE.MeshPhysicalMaterial({ color: 0xE62626, roughness: 0.15, clearcoat: 0.9 });
    const bowGeo = new THREE.SphereGeometry(0.06, 12, 12);
    bowGeo.scale(1.5, 0.8, 0.8);
    const bow = new THREE.Mesh(bowGeo, bowMat);
    bow.position.set(0, 0.24, 0.05);
    wreathGroup.add(bow);

    charmGroup.add(wreathGroup);
    return charmGroup;
  }

  // 7. HOA MEN SỨ / HOA PHA LÊ 5 CÁNH (5-Petal Blossom)
  if (id.includes('flower') || id.includes('lotus') || name.includes('hoa') || name.includes('sen')) {
    const flowerGroup = new THREE.Group();
    flowerGroup.position.y = -0.32;

    const petalMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFF0F5,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03
    });
    const petalGeo = new THREE.SphereGeometry(0.13, 16, 16);
    petalGeo.scale(1.0, 1.4, 0.4);

    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(0.18 * Math.cos(ang), 0.18 * Math.sin(ang), 0);
      petal.rotation.z = ang - Math.PI / 2;
      flowerGroup.add(petal);
    }

    // Golden Center Bead
    const centerGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const centerMat = new THREE.MeshStandardMaterial({ color: 0xF5CA47, metalness: 0.95, roughness: 0.15 });
    const center = new THREE.Mesh(centerGeo, centerMat);
    center.position.z = 0.03;
    flowerGroup.add(center);

    charmGroup.add(flowerGroup);
    return charmGroup;
  }

  // 8. HUY CHƯƠNG KIM LOẠI BẠC/VÀNG 925 HOẶC ĐĨA GỐM NUNG (Mặc định cao cấp)
  const discGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.055, 36);
  discGeo.rotateX(Math.PI / 2);

  let discMat;
  if (charm?.image && textureLoader && !charm.image.includes('bracelet-strawberry-quartz')) {
    const charmTex = textureLoader.load(charm.image, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    });
    discMat = new THREE.MeshPhysicalMaterial({
      map: charmTex,
      roughness: 0.18,
      metalness: 0.25,
      clearcoat: 0.95,
      clearcoatRoughness: 0.05
    });
  } else {
    discMat = new THREE.MeshPhysicalMaterial({
      color: isGold ? 0xF2C94C : 0xE8ECF0,
      metalness: 0.94,
      roughness: 0.14,
      clearcoat: 0.9
    });
  }

  const discMesh = new THREE.Mesh(discGeo, discMat);
  discMesh.position.y = -0.32;
  discMesh.castShadow = true;
  charmGroup.add(discMesh);

  // Outer Bezel Ring (Viền kim loại bảo vệ charm)
  const bezelGeo = new THREE.TorusGeometry(0.32, 0.026, 14, 36);
  const bezelMesh = new THREE.Mesh(bezelGeo, metalMat);
  bezelMesh.position.y = -0.32;
  charmGroup.add(bezelMesh);

  // Engraved 925 Hallmark Emblem on back
  const emblemGeo = new THREE.SphereGeometry(0.09, 14, 14);
  const emblemMat = new THREE.MeshStandardMaterial({
    color: isGold ? 0xC69214 : 0x8C96A0,
    roughness: 0.25,
    metalness: 0.85
  });
  const emblem = new THREE.Mesh(emblemGeo, emblemMat);
  emblem.position.set(0, -0.32, 0.032);
  charmGroup.add(emblem);

  return charmGroup;
}

export default function Bracelet3DViewer({
  beadPositions = [],
  selectedSlotIndex = null,
  onSelectSlot,
  selectedCord,
  selectedCharm
}) {
  const mountRef = useRef(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  // Layout mode: 'strap' (Dáng Dây Treo Điện Thoại như ảnh mẫu) | 'bracelet' (Dáng Vòng Tay Tròn)
  const [viewLayout, setViewLayout] = useState('strap');

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const beadMeshesRef = useRef([]);
  const braceletGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Pointer drag state for 360 rotation & zoom
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const zoomLevelRef = useRef(6.0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 360;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, zoomLevelRef.current);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Boutique Studio Lighting (Bắt sáng lấp lánh cho pha lê & ngọc trai)
    const ambientLight = new THREE.AmbientLight(0xFFFBF5, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 2.2);
    keyLight.position.set(5, 9, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xE0F2FE, 1.3);
    rimLight.position.set(-6, -4, -3);
    scene.add(rimLight);

    // Sparkling Point Light (Tạo ánh ngũ sắc rực rỡ khi xoay qua các mặt giác cạnh)
    const sparkleLight = new THREE.PointLight(0xFFFAF0, 2.5, 14);
    sparkleLight.position.set(1.5, 2.0, 4.2);
    scene.add(sparkleLight);

    // 5. Main Bracelet Group
    const braceletGroup = new THREE.Group();
    braceletGroup.position.y = viewLayout === 'strap' ? 0.35 : 0.20;
    braceletGroup.rotation.x = viewLayout === 'strap' ? 0.18 : 0.35;
    scene.add(braceletGroup);
    braceletGroupRef.current = braceletGroup;

    const textureLoader = new THREE.TextureLoader();
    const beadMeshes = [];
    const count = beadPositions.length || 21;

    // 6. DỰNG TỌA ĐỘ THEO 2 DÁNG (PHONE STRAP HOẶC VÒNG TRÒN)
    const cordPoints = [];
    const beadCoords = [];

    if (viewLayout === 'strap') {
      // ── DÁNG DÂY TREO ĐIỆN THOẠI / PHONE STRAP NHƯ ẢNH MẪU ──
      // U-shape elongated loop with gravity drape
      const uHeight = 3.2;
      const uWidth = 1.15;
      const uTopY = 1.0;

      for (let i = 0; i < count; i++) {
        // Param t from 0 (top-left) around bottom to 1 (top-right)
        const t = i / (count - 1);
        const theta = t * Math.PI; // 0 to PI
        const x = -Math.cos(theta) * uWidth;
        const y = uTopY - Math.sin(theta) * uHeight;
        const z = Math.sin(theta) * 0.12; // Slight natural 3D curve
        beadCoords.push({ x, y, z, angle: theta });
      }

      // Strand path for the inner string
      const strandSpline = new THREE.CatmullRomCurve3(beadCoords.map(c => new THREE.Vector3(c.x, c.y, c.z)));
      const strandGeo = new THREE.TubeGeometry(strandSpline, 64, 0.035, 8, false);
      const strandMat = new THREE.MeshStandardMaterial({ color: 0xF5F0EB, roughness: 0.9 });
      braceletGroup.add(new THREE.Mesh(strandGeo, strandMat));

      // White Braided Lanyard Loop at the top (Vòng dây dù trắng phía trên như ảnh)
      const topLoopCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-uWidth * 0.35, uTopY, 0),
        new THREE.Vector3(-0.25, uTopY + 0.55, 0.05),
        new THREE.Vector3(0, uTopY + 1.25, 0.02),
        new THREE.Vector3(0.25, uTopY + 0.55, -0.05),
        new THREE.Vector3(uWidth * 0.35, uTopY, 0)
      ]);
      const topLoopGeo = new THREE.TubeGeometry(topLoopCurve, 36, 0.04, 8, false);
      const topLoopMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.7 });
      braceletGroup.add(new THREE.Mesh(topLoopGeo, topLoopMat));

      // Silver Crimp Clamp Collar (Cổ kim loại siết dây)
      const clampGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.20, 16);
      const clampMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.95, roughness: 0.12 });
      const clampMesh = new THREE.Mesh(clampGeo, clampMat);
      clampMesh.position.set(0, uTopY + 0.08, 0);
      braceletGroup.add(clampMesh);

      // Stamped Silver Logo Coin Tag ("Dooro" / "Zy" tag in photo)
      const tagGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.03, 24);
      tagGeo.rotateX(Math.PI / 2);
      const tagMesh = new THREE.Mesh(tagGeo, clampMat);
      tagMesh.position.set(-0.22, uTopY + 0.02, 0.08);
      tagMesh.rotation.z = -0.35;
      braceletGroup.add(tagMesh);

    } else {
      // ── DÁNG VÒNG TRÒN ĐEO CỔ TAY (CLASSIC BRACELET LOOP) ──
      const cordRadius = 2.0;
      const cordCurve = new THREE.EllipseCurve(0, 0, cordRadius, cordRadius, 0, 2 * Math.PI, false, 0);
      const points = cordCurve.getPoints(64).map(p => new THREE.Vector3(p.x, p.y, 0));
      const cordPath = new THREE.CatmullRomCurve3(points, true);
      const cordGeo = new THREE.TubeGeometry(cordPath, 64, 0.045, 8, true);

      const cordColorHex = selectedCord?.color || '#6A4E36';
      const cordMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(cordColorHex), roughness: 0.8 });
      braceletGroup.add(new THREE.Mesh(cordGeo, cordMat));

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const x = cordRadius * Math.cos(angle);
        const y = cordRadius * Math.sin(angle);
        beadCoords.push({ x, y, z: 0, angle });
      }
    }

    // 7. RENDER CÁC HẠT ĐÁ, PHA LÊ BICONE & CHARM TỪNG VỊ TRÍ
    beadPositions.forEach((pos, idx) => {
      const coord = beadCoords[idx] || beadCoords[0];
      const isSlotCharm = Boolean(pos.bead?.isCharm || pos.bead?.type === 'charm');
      const isSelected = selectedSlotIndex === pos.index;
      const beadId = (pos.bead?.id || '').toLowerCase();
      const beadName = (pos.bead?.name || '').toLowerCase();
      const colorHex = pos.bead?.color || '#EAA9A9';

      if (isSlotCharm) {
        // VỊ TRÍ NÀY ĐƯỢC THAY THẾ BẰNG 1 CHARM ĐIÊU KHẮC 3D
        const slotCharm = create3DCharmFigurine(pos.bead, pos.bead?.id?.includes('gold'), textureLoader);
        slotCharm.position.set(coord.x, coord.y, coord.z);
        slotCharm.scale.set(0.72, 0.72, 0.72);

        // Highlight ring if active
        if (isSelected) {
          const ringGeo = new THREE.RingGeometry(0.32, 0.38, 32);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0xB86244, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.set(0, -0.22, 0.08);
          slotCharm.add(ringMesh);
        }

        slotCharm.traverse((child) => {
          if (child.isMesh) {
            child.userData = { slotIndex: pos.index };
            beadMeshes.push(child);
          }
        });
        braceletGroup.add(slotCharm);

      } else {
        // VỊ TRÍ NÀY LÀ HẠT (Pha Lê Bicone / Ngọc Trai / Khối Lập Phương / Đá Phong Thủy)
        let beadMesh;

        const isCrystal = beadId.includes('crystal') || beadName.includes('pha lê') || beadName.includes('bicone');
        const isPearl = beadId.includes('pearl') || beadName.includes('ngọc trai');
        const isCube = beadId.includes('cube') || beadName.includes('vuông');
        const isGoldSpacer = beadId.includes('spacer') || beadId.includes('gold');

        if (isCrystal) {
          // HẠT PHA LÊ BICONE GIÁC CẠNH (Swarovski Bicone) - Phản chiếu tán sắc sắc nét
          const biconeGeo = new THREE.OctahedronGeometry(0.20, 0);
          biconeGeo.scale(1.0, 1.25, 1.0);

          const crystalMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(colorHex),
            emissive: new THREE.Color(colorHex).multiplyScalar(0.06),
            roughness: 0.03,
            metalness: 0.05,
            transmission: 0.82,
            thickness: 0.65,
            ior: 1.58,
            clearcoat: 1.0,
            clearcoatRoughness: 0.02,
            flatShading: true // Giác cạnh bắt sáng sắc nét như ảnh
          });
          beadMesh = new THREE.Mesh(biconeGeo, crystalMat);

        } else if (isPearl) {
          // HẠT NGỌC TRAI NƯỚC NGỌT XÀ CỪ - Mịn màng ánh xà cừ quý phái
          const pearlGeo = new THREE.SphereGeometry(0.22, 32, 32);
          const pearlMat = new THREE.MeshPhysicalMaterial({
            color: 0xFFFAF2,
            roughness: 0.16,
            metalness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08,
            sheen: 1.0,
            sheenRoughness: 0.25,
            sheenColor: new THREE.Color(0xFFE6E6)
          });
          beadMesh = new THREE.Mesh(pearlGeo, pearlMat);

        } else if (isCube) {
          // HẠT KHỐI PHA LÊ VUÔNG TRONG SUỐT
          const cubeGeo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
          const cubeMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(colorHex),
            roughness: 0.05,
            transmission: 0.85,
            thickness: 0.7,
            ior: 1.52,
            clearcoat: 1.0
          });
          beadMesh = new THREE.Mesh(cubeGeo, cubeMat);

        } else if (isGoldSpacer) {
          // HẠT BI VÀNG / BẠC NGĂN CÁCH
          const spacerGeo = new THREE.SphereGeometry(0.12, 16, 16);
          const spacerMat = new THREE.MeshStandardMaterial({
            color: 0xF5CA47,
            metalness: 0.96,
            roughness: 0.12
          });
          beadMesh = new THREE.Mesh(spacerGeo, spacerMat);

        } else {
          // HẠT ĐÁ TỰ NHIÊN / GỐM MEN BÓNG
          const sphereGeo = new THREE.SphereGeometry(0.21, 32, 32);
          const stoneMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(colorHex),
            roughness: 0.12,
            metalness: 0.04,
            clearcoat: 0.95,
            clearcoatRoughness: 0.05,
            reflectivity: 0.9
          });
          beadMesh = new THREE.Mesh(sphereGeo, stoneMat);
        }

        beadMesh.position.set(coord.x, coord.y, coord.z);
        beadMesh.userData = { slotIndex: pos.index };
        beadMesh.castShadow = true;

        // Add tiny gold spacer bead between crystals to replicate the photo's delicate details
        if (idx < count - 1 && !isGoldSpacer) {
          const nextCoord = beadCoords[idx + 1] || coord;
          const mx = (coord.x + nextCoord.x) / 2;
          const my = (coord.y + nextCoord.y) / 2;
          const mz = (coord.z + nextCoord.z) / 2;
          const tinySpacerGeo = new THREE.SphereGeometry(0.065, 12, 12);
          const tinySpacerMat = new THREE.MeshStandardMaterial({ color: 0xF5CA47, metalness: 0.95, roughness: 0.15 });
          const tinySpacer = new THREE.Mesh(tinySpacerGeo, tinySpacerMat);
          tinySpacer.position.set(mx, my, mz);
          braceletGroup.add(tinySpacer);
        }

        // Selection ring
        if (isSelected) {
          const ringGeo = new THREE.RingGeometry(0.28, 0.34, 32);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0xB86244, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.z = 0.02;
          beadMesh.add(ringMesh);
        }

        braceletGroup.add(beadMesh);
        beadMeshes.push(beadMesh);
      }
    });
    beadMeshesRef.current = beadMeshes;

    // 8. CHARM CHÍNH THẢ RƠI Ở ĐÁY VÒNG (Main Dangling Charm)
    if (selectedCharm) {
      const mainCharmFigurine = create3DCharmFigurine(
        selectedCharm,
        selectedCharm?.id?.includes('gold'),
        textureLoader
      );

      if (viewLayout === 'strap') {
        // Ở đáy hình chữ U của phone strap
        const bottomY = 1.0 - 3.2 - 0.12;
        mainCharmFigurine.position.set(0, bottomY, 0.15);
        mainCharmFigurine.scale.set(0.95, 0.95, 0.95);
      } else {
        // Ở đáy vòng tròn 2.0
        mainCharmFigurine.position.set(0, -2.05, 0);
        mainCharmFigurine.scale.set(0.90, 0.90, 0.90);
      }

      braceletGroup.add(mainCharmFigurine);
    }

    // 9. Raycasting for bead click selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e) => {
      isDraggingRef.current = true;
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

      const deltaX = clientX - previousMousePositionRef.current.x;
      const deltaY = clientY - previousMousePositionRef.current.y;

      if (braceletGroupRef.current) {
        braceletGroupRef.current.rotation.y += deltaX * 0.008;
        braceletGroupRef.current.rotation.x += deltaY * 0.008;
      }
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = (e) => {
      isDraggingRef.current = false;

      // Click to select bead slot
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = e.clientX || (e.changedTouches && e.changedTouches[0]?.clientX) || 0;
      const clientY = e.clientY || (e.changedTouches && e.changedTouches[0]?.clientY) || 0;

      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(beadMeshesRef.current, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (hit.userData && typeof hit.userData.slotIndex === 'number') {
            if (onSelectSlot) onSelectSlot(hit.userData.slotIndex);
          }
        }
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.25 : -0.25;
      zoomLevelRef.current = Math.min(8.5, Math.max(3.8, zoomLevelRef.current + delta));
      camera.position.z = zoomLevelRef.current;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    dom.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp, { passive: true });
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // 10. Animation Loop (Smooth 360 rotation & sparkling light glints)
    let angleSparkle = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (isAutoRotate && !isDraggingRef.current && braceletGroupRef.current) {
        braceletGroupRef.current.rotation.y += 0.005;
      }

      // Sparkle light glints rotation
      angleSparkle += 0.015;
      sparkleLight.position.x = 2.5 * Math.cos(angleSparkle);
      sparkleLight.position.z = 3.5 + 1.2 * Math.sin(angleSparkle);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 340;
      const newH = container.clientHeight || 360;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      dom.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      dom.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);

      renderer.dispose();
      beadMeshes.forEach(m => {
        if (m.geometry) m.geometry.dispose();
        if (m.material) m.material.dispose();
      });
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [beadPositions, selectedSlotIndex, selectedCord, selectedCharm, isAutoRotate, viewLayout]);

  const handleResetView = () => {
    if (braceletGroupRef.current) {
      braceletGroupRef.current.rotation.set(viewLayout === 'strap' ? 0.18 : 0.35, 0, 0);
    }
    if (cameraRef.current) {
      zoomLevelRef.current = 6.0;
      cameraRef.current.position.z = 6.0;
    }
  };

  const handleZoom = (direction) => {
    const delta = direction === 'in' ? -0.5 : 0.5;
    zoomLevelRef.current = Math.min(8.5, Math.max(3.8, zoomLevelRef.current + delta));
    if (cameraRef.current) {
      cameraRef.current.position.z = zoomLevelRef.current;
    }
  };

  return (
    <div className="relative w-full h-[340px] sm:h-[390px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#FAF7F2] via-white to-[#F2E8DC] border border-[#E8DFD3] shadow-md">
      {/* Three.js Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* Top floating layout switcher (Phone Strap vs Vòng Tròn) */}
      <div className="absolute top-2.5 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#E8DFD3] shadow-sm">
        <button
          type="button"
          onClick={() => setViewLayout('strap')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            viewLayout === 'strap'
              ? 'bg-[#B86244] text-white shadow-xs'
              : 'text-[#6B6258] hover:bg-[#FAF7F2]'
          }`}
          title="Xem dáng dây treo điện thoại thủ công như hình mẫu"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Dây Treo Phone Strap</span>
        </button>

        <button
          type="button"
          onClick={() => setViewLayout('bracelet')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            viewLayout === 'bracelet'
              ? 'bg-[#B86244] text-white shadow-xs'
              : 'text-[#6B6258] hover:bg-[#FAF7F2]'
          }`}
          title="Xem dáng vòng tròn đeo cổ tay"
        >
          <CircleDot className="w-3.5 h-3.5" />
          <span>Vòng Tay Tròn</span>
        </button>
      </div>

      {/* Top Right Sparkle Badge */}
      <div className="absolute top-2.5 right-3 flex items-center gap-2 pointer-events-none">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#B86244] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#E8DFD3] shadow-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
          <span>Pha Lê & Men Sứ 3D</span>
        </span>
      </div>

      {/* Floating control buttons */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-[#E8DFD3] shadow-md">
        <button
          type="button"
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            isAutoRotate 
              ? 'bg-[#B86244] text-white' 
              : 'text-[#6B6258] hover:bg-[#FAF7F2]'
          }`}
          title={isAutoRotate ? 'Dừng xoay tự động' : 'Bật xoay tự động'}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </button>

        <button
          type="button"
          onClick={() => handleZoom('in')}
          className="p-1.5 rounded-lg text-[#6B6258] hover:bg-[#FAF7F2] hover:text-[#26211C] transition-all cursor-pointer"
          title="Phóng to"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom('out')}
          className="p-1.5 rounded-lg text-[#6B6258] hover:bg-[#FAF7F2] hover:text-[#26211C] transition-all cursor-pointer"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetView}
          className="px-2 py-1 text-[10px] font-bold text-[#6B6258] hover:text-[#B86244] hover:bg-[#FAF7F2] rounded-lg transition-all cursor-pointer"
          title="Góc nhìn ban đầu"
        >
          Đặt lại
        </button>
      </div>

      {/* Subtle guide hint */}
      <div className="absolute bottom-3 left-3 text-[10px] text-[#8C8276] font-medium pointer-events-none bg-white/80 px-2.5 py-1 rounded-lg hidden sm:block border border-[#E8DFD3]/60 shadow-2xs">
        ✦ Kéo chuột để xoay 360° · Bấm vào hạt để chọn vị trí
      </div>
    </div>
  );
}
