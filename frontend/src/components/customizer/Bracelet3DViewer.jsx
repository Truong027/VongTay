import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Sparkles, HelpCircle } from 'lucide-react';

export default function Bracelet3DViewer({
  beadPositions = [],
  selectedSlotIndex = null,
  onSelectSlot,
  selectedCord,
  selectedCharm
}) {
  const mountRef = useRef(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const beadMeshesRef = useRef([]);
  const braceletGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Pointer drag state for 360 rotation & zoom
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.004 });
  const zoomLevelRef = useRef(6.2);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, zoomLevelRef.current);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Artisanal Boutique Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfce8d5, 1.0);
    fillLight.position.set(-6, -3, -4);
    scene.add(fillLight);

    const specularGlance = new THREE.PointLight(0xfff3db, 2.2, 15);
    specularGlance.position.set(0, 1, 4.5);
    scene.add(specularGlance);

    // 5. Main Bracelet Group
    const braceletGroup = new THREE.Group();
    // Tilt slightly forward for optimal aesthetic view, shifted up slightly to give room for dangling charms
    braceletGroup.position.y = 0.22;
    braceletGroup.rotation.x = 0.35;
    scene.add(braceletGroup);
    braceletGroupRef.current = braceletGroup;

    // 6. Cord Tube Geometry
    const cordRadius = 2.0;
    const cordCurve = new THREE.EllipseCurve(0, 0, cordRadius, cordRadius, 0, 2 * Math.PI, false, 0);
    const cordPoints = cordCurve.getPoints(64).map(p => new THREE.Vector3(p.x, p.y, 0));
    const cordPath = new THREE.CatmullRomCurve3(cordPoints, true);
    const cordGeo = new THREE.TubeGeometry(cordPath, 64, 0.05, 8, true);
    
    const cordColorHex = selectedCord?.color || '#6A4E36';
    const cordMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cordColorHex),
      roughness: 0.8,
      metalness: 0.1
    });
    const cordMesh = new THREE.Mesh(cordGeo, cordMat);
    braceletGroup.add(cordMesh);

    // 7. Render 3D Beads & Slot Charms (Không gò bó thiết kế - bất kỳ hạt nào cũng có thể là charm)
    const count = beadPositions.length || 21;
    const beadRadius = 0.22;
    const sphereGeo = new THREE.SphereGeometry(beadRadius, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const beadMeshes = [];

    beadPositions.forEach((pos, idx) => {
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      const x = cordRadius * Math.cos(angle);
      const y = cordRadius * Math.sin(angle);

      const isSlotCharm = Boolean(pos.bead?.isCharm || pos.bead?.type === 'charm');
      const isSelected = selectedSlotIndex === pos.index;

      if (isSlotCharm) {
        // RENDER 3D CHARM TRÊN VỊ TRÍ HẠT
        const slotCharmGroup = new THREE.Group();
        slotCharmGroup.position.set(x, y, 0);
        // Rotate tangent to the cord circle
        slotCharmGroup.rotation.z = angle + Math.PI / 2;

        const isGoldCharm = pos.bead?.id?.includes('gold') || pos.bead?.color === '#D4AF37';

        // 1. Bail Ring through cord
        const bailGeo = new THREE.TorusGeometry(0.11, 0.028, 12, 24);
        const metalMat = new THREE.MeshStandardMaterial({
          color: isGoldCharm ? 0xEDC967 : 0xE5E8EC,
          metalness: 0.95,
          roughness: 0.15
        });
        const bailMesh = new THREE.Mesh(bailGeo, metalMat);
        bailMesh.rotation.x = Math.PI / 2;
        slotCharmGroup.add(bailMesh);

        // 2. Medallion Disc
        const discGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.05, 32);
        discGeo.rotateX(Math.PI / 2);

        let faceMat;
        if (pos.bead?.image) {
          const charmTex = textureLoader.load(pos.bead.image, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.needsUpdate = true;
          });
          faceMat = new THREE.MeshPhysicalMaterial({
            map: charmTex,
            roughness: 0.2,
            metalness: 0.3,
            clearcoat: 0.9,
            clearcoatRoughness: 0.1
          });
        } else {
          faceMat = new THREE.MeshPhysicalMaterial({
            color: isGoldCharm ? 0xE8C15A : 0xDCE0E5,
            metalness: 0.92,
            roughness: 0.15,
            clearcoat: 0.8
          });
        }

        const discMesh = new THREE.Mesh(discGeo, faceMat);
        discMesh.position.y = -0.16;
        discMesh.castShadow = true;
        slotCharmGroup.add(discMesh);

        // Outer Bezel Ring around Charm
        const bezelGeo = new THREE.TorusGeometry(0.26, 0.022, 12, 32);
        const bezelMesh = new THREE.Mesh(bezelGeo, metalMat);
        bezelMesh.position.y = -0.16;
        slotCharmGroup.add(bezelMesh);

        // Click selection data
        discMesh.userData = { slotIndex: pos.index };
        bailMesh.userData = { slotIndex: pos.index };

        if (isSelected) {
          const ringGeo = new THREE.RingGeometry(0.32, 0.36, 32);
          const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0xB86244, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95 
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.set(0, -0.16, 0.04);
          slotCharmGroup.add(ringMesh);
        }

        braceletGroup.add(slotCharmGroup);
        beadMeshes.push(discMesh);
      } else {
        // RENDER HẠT ĐÁ QUÝ TỰ NHIÊN
        const colorHex = pos.bead?.color || '#EAA9A9';

        // Realistic gemstone material (smooth crystal sheen with physical clearcoat)
        const beadMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex),
          roughness: 0.18,
          metalness: 0.08,
          clearcoat: 0.95,
          clearcoatRoughness: 0.1,
          reflectivity: 0.85
        });

        const beadMesh = new THREE.Mesh(sphereGeo, beadMat);
        beadMesh.position.set(x, y, 0);
        beadMesh.userData = { slotIndex: pos.index };
        beadMesh.castShadow = true;
        beadMesh.receiveShadow = true;

        // Add selection ring if active
        if (isSelected) {
          const ringGeo = new THREE.RingGeometry(0.28, 0.32, 32);
          const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0xB86244, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95 
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.z = 0.01;
          beadMesh.add(ringMesh);
        }

        braceletGroup.add(beadMesh);
        beadMeshes.push(beadMesh);
      }
    });
    beadMeshesRef.current = beadMeshes;

    // 8. Dangling 3D Central Charm at bottom (Treo Đáy Vòng)
    if (selectedCharm) {
      const charmGroup = new THREE.Group();
      charmGroup.position.set(0, -cordRadius - 0.05, 0);

      const isGold = selectedCharm.id?.includes('gold') || selectedCharm.color === '#D4AF37';

      // Connecting Silver/Gold Bail / Jump Ring
      const ringGeo = new THREE.TorusGeometry(0.13, 0.03, 16, 32);
      const silverMat = new THREE.MeshStandardMaterial({
        color: isGold ? 0xF2D06B : 0xE8ECF0,
        metalness: 0.95,
        roughness: 0.12
      });
      const bailMesh = new THREE.Mesh(ringGeo, silverMat);
      bailMesh.rotation.x = Math.PI / 2;
      charmGroup.add(bailMesh);

      // Charm Body: Dual-sided Medallion Bezel with high-resolution texture
      const discGeo = new THREE.CylinderGeometry(0.40, 0.40, 0.06, 36);
      discGeo.rotateX(Math.PI / 2);

      let charmFaceMat;
      if (selectedCharm.image) {
        const charmTex = textureLoader.load(selectedCharm.image, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
        });
        charmFaceMat = new THREE.MeshPhysicalMaterial({
          map: charmTex,
          roughness: 0.22,
          metalness: 0.25,
          clearcoat: 0.95,
          clearcoatRoughness: 0.1
        });
      } else {
        charmFaceMat = new THREE.MeshPhysicalMaterial({
          color: isGold ? 0xEDC967 : 0xDCE0E5,
          metalness: 0.95,
          roughness: 0.15,
          clearcoat: 0.9
        });
      }

      const charmBody = new THREE.Mesh(discGeo, charmFaceMat);
      charmBody.position.y = -0.34;
      charmBody.castShadow = true;
      charmGroup.add(charmBody);

      // Outer Bezel Ring (Viền kim loại bảo vệ charm)
      const bezelGeo = new THREE.TorusGeometry(0.40, 0.035, 16, 36);
      const bezelMesh = new THREE.Mesh(bezelGeo, silverMat);
      bezelMesh.position.y = -0.34;
      charmGroup.add(bezelMesh);

      // Engraved 925 Hallmark Emblem on back
      const emblemGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const emblemMat = new THREE.MeshStandardMaterial({
        color: isGold ? 0xB8860B : 0x7B8590,
        roughness: 0.25,
        metalness: 0.85
      });
      const emblem = new THREE.Mesh(emblemGeo, emblemMat);
      emblem.position.set(0, -0.34, 0.035);
      charmGroup.add(emblem);

      braceletGroup.add(charmGroup);
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
        braceletGroupRef.current.rotation.y += deltaX * 0.012;
        braceletGroupRef.current.rotation.x += deltaY * 0.012;
      }

      rotationVelocityRef.current = { x: deltaY * 0.002, y: deltaX * 0.002 };
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = (e) => {
      isDraggingRef.current = false;

      // Click detection if tiny movement
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = e.clientX || (e.changedTouches && e.changedTouches[0]?.clientX);
      const clientY = e.clientY || (e.changedTouches && e.changedTouches[0]?.clientY);

      if (clientX !== undefined && clientY !== undefined) {
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(beadMeshesRef.current, false);

        if (intersects.length > 0 && onSelectSlot) {
          const clickedSlot = intersects[0].object.userData.slotIndex;
          if (clickedSlot !== undefined) {
            onSelectSlot(clickedSlot);
          }
        }
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      zoomLevelRef.current = Math.min(8.5, Math.max(4.0, zoomLevelRef.current + e.deltaY * 0.005));
      if (cameraRef.current) {
        cameraRef.current.position.z = zoomLevelRef.current;
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    dom.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // 10. Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      if (braceletGroupRef.current) {
        if (!isDraggingRef.current) {
          if (isAutoRotate) {
            braceletGroupRef.current.rotation.y += 0.007;
          } else {
            // Damping inertial spin
            braceletGroupRef.current.rotation.y += rotationVelocityRef.current.y;
            braceletGroupRef.current.rotation.x += rotationVelocityRef.current.x;
            rotationVelocityRef.current.x *= 0.92;
            rotationVelocityRef.current.y *= 0.92;
          }
        }
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // 11. Handle Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount or options change
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

      // Dispose Three.js resources cleanly
      renderer.dispose();
      cordGeo.dispose();
      cordMat.dispose();
      sphereGeo.dispose();
      beadMeshes.forEach(m => {
        if (m.material) m.material.dispose();
      });
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [beadPositions, selectedSlotIndex, selectedCord, selectedCharm, isAutoRotate]);

  const handleResetView = () => {
    if (braceletGroupRef.current) {
      braceletGroupRef.current.rotation.set(0.35, 0, 0);
    }
    if (cameraRef.current) {
      zoomLevelRef.current = 6.2;
      cameraRef.current.position.z = 6.2;
    }
  };

  const handleZoom = (direction) => {
    const delta = direction === 'in' ? -0.6 : 0.6;
    zoomLevelRef.current = Math.min(8.5, Math.max(4.0, zoomLevelRef.current + delta));
    if (cameraRef.current) {
      cameraRef.current.position.z = zoomLevelRef.current;
    }
  };

  return (
    <div className="relative w-full h-[320px] sm:h-[360px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#FAF7F2]/50 via-white/80 to-[#F5ECE1]/60 border border-[#E8DFD3]/80 shadow-inner">
      {/* Three.js Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* Top floating badge & 360 label */}
      <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#B86244] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#E8DFD3] shadow-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
          <span>3D WebGL 360°</span>
        </span>
      </div>

      {/* Floating control buttons */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-[#E8DFD3] shadow-md">
        <button
          type="button"
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
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
          className="p-1.5 rounded-lg text-[#6B6258] hover:bg-[#FAF7F2] hover:text-[#26211C] transition-all"
          title="Phóng to"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom('out')}
          className="p-1.5 rounded-lg text-[#6B6258] hover:bg-[#FAF7F2] hover:text-[#26211C] transition-all"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetView}
          className="px-2 py-1 text-[10px] font-bold text-[#6B6258] hover:text-[#B86244] hover:bg-[#FAF7F2] rounded-lg transition-all"
          title="Góc nhìn ban đầu"
        >
          Đặt lại
        </button>
      </div>

      {/* Subtle guide hint */}
      <div className="absolute bottom-3 left-3 text-[10px] text-[#8C8276] font-medium pointer-events-none bg-white/70 px-2 py-0.5 rounded-md hidden sm:block">
        ✦ Kéo chuột để xoay 360° · Bấm vào hạt để chọn
      </div>
    </div>
  );
}
