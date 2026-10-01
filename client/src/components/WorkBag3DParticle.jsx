import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function WorkBag3DParticle({
  imageSrc = '/work_bag.jpg',
  width = '100%',
  height = '500px',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animId;
    let scene, camera, renderer, geometry, material, pointsMesh;
    const clock = new THREE.Clock();

    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      hover: false,
    };

    const containerWidth = container.clientWidth || 500;
    const containerHeight = container.clientHeight || 500;

    // 1. Scene & Camera Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, containerWidth / containerHeight, 0.1, 1000);
    camera.position.set(0, 0, 175);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true, // 100% transparent canvas so it floats directly over the moving text
      powerPreference: 'high-performance',
    });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // 2. Load Images: work_bag.jpg and work_bag_perfect_mask.png
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    const maskImg = new Image();
    maskImg.crossOrigin = 'anonymous';
    maskImg.src = '/work_bag_perfect_mask.png';

    let isCancelled = false;

    let loadedCount = 0;
    const onBothLoaded = () => {
      loadedCount++;
      if (loadedCount < 2 || isCancelled) return;

      const cols = 220;
      const rows = 220;

      // Offscreen canvas for color data
      const offCanvas = document.createElement('canvas');
      offCanvas.width = cols;
      offCanvas.height = rows;
      const ctx = offCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, cols, rows);
      const imgData = ctx.getImageData(0, 0, cols, rows).data;

      // Offscreen canvas for mask data
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = cols;
      maskCanvas.height = rows;
      const maskCtx = maskCanvas.getContext('2d');
      maskCtx.drawImage(maskImg, 0, 0, cols, rows);
      const maskData = maskCtx.getImageData(0, 0, cols, rows).data;

      // 1. SOLID OPAQUE SILHOUETTE BACKING MESH (Guarantees 100% occlusion of text behind)
      const silTexture = new THREE.TextureLoader().load('/work_bag_solid_silhouette.png');
      silTexture.minFilter = THREE.LinearFilter;
      silTexture.magFilter = THREE.LinearFilter;

      const aspectScale = 0.88;
      const worldWidth = cols * aspectScale;
      const worldHeight = rows * aspectScale;

      const silMaterial = new THREE.MeshBasicMaterial({
        map: silTexture,
        transparent: true,
        alphaTest: 0.1, // Clean hard cut: pixels inside bag are solid opaque, outside are 100% transparent
        depthWrite: true,
        depthTest: true,
        side: THREE.DoubleSide,
      });

      const silGeometry = new THREE.PlaneGeometry(worldWidth, worldHeight);
      const silMesh = new THREE.Mesh(silGeometry, silMaterial);
      // Positioned just behind the particles, perfectly aligned with the bag center
      silMesh.position.set(-cols * (0.52 - 0.5) * aspectScale, rows * (0.54 - 0.5) * aspectScale, -1.0);

      // 2. DENSE 3D TACTILE STIPPLED PARTICLES
      const positions = [];
      const homePositions = [];
      const colors = [];
      const depthAmplitude = 32.0;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          
          // Strict mask check: only generate points where mask is white (inside bag)
          const maskVal = maskData[idx];
          if (maskVal < 128) continue;

          const r = imgData[idx] / 255;
          const g = imgData[idx + 1] / 255;
          const b = imgData[idx + 2] / 255;
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          // Normalized coordinates centered at bag
          const px = (x - cols * 0.52) * aspectScale;
          const py = -(y - rows * 0.54) * aspectScale;
          const pz = Math.max(0.0, (lum - 0.15)) * depthAmplitude;

          const isHardware = (r >= 0.35 && g >= 0.28 && r > b * 1.35);
          const normLum = Math.max(0.0, Math.min(1.0, (lum - 0.12) / 0.65));

          // Fine tactile pointillist tone (Matching the reference sculpture)
          const rand = Math.random();
          let stippleTone;

          if (normLum < 0.24) {
            // Deep Velvety Pitch-Black Shadows (almost pure black ink)
            stippleTone = rand < 0.88 ? 0.01 : 0.07;
          } else if (normLum < 0.56) {
            // Granular Stippled Midtones (salt-and-pepper charcoal/silver)
            stippleTone = rand < 0.52 ? 0.02 : 0.72;
          } else {
            // Crisp Specular Highlights (bright silver-white stipple)
            stippleTone = rand < 0.12 ? 0.06 : 0.95;
          }

          if (isHardware) {
            stippleTone = Math.max(stippleTone, 0.86 + Math.random() * 0.14);
          }

          stippleTone = Math.max(0.01, Math.min(1.0, stippleTone));

          // Primary point
          positions.push(px, py, pz);
          homePositions.push(px, py, pz);
          colors.push(stippleTone, stippleTone, stippleTone);

          // Subpixel jittered point for tight, dense grain
          const jx = (Math.random() - 0.5) * 0.38;
          const jy = (Math.random() - 0.5) * 0.38;
          const jz = (Math.random() - 0.5) * 0.20;
          const rand2 = Math.random();
          let stippleTone2 = normLum < 0.32 
            ? (rand2 < 0.80 ? 0.01 : 0.10) 
            : (rand2 < 0.46 ? 0.02 : 0.80);
          if (isHardware) stippleTone2 = 0.88 + Math.random() * 0.12;

          positions.push(px + jx, py + jy, pz + jz);
          homePositions.push(px + jx, py + jy, pz + jz);
          colors.push(stippleTone2, stippleTone2, stippleTone2);
        }
      }

      if (isCancelled) return;

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('aHome', new THREE.Float32BufferAttribute(homePositions, 3));
      geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));

      // 3. Shaders
      const vertexShader = `
        uniform float uTime;
        attribute vec3 aHome;
        attribute vec3 aColor;

        varying vec3 vColor;
        varying float vDepth;

        void main() {
          vec3 pos = aHome;

          // Subtle organic micro-wave while moving tightly as one solid bag
          float microWave = sin(uTime * 1.2 + pos.x * 0.06 + pos.y * 0.06) * 0.22;
          pos.z += microWave;

          vColor = aColor;
          vDepth = pos.z;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          
          // Fine, crisp stipple dots (matching reference sculpture)
          gl_PointSize = 3.6 * (175.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `;

      const fragmentShader = `
        varying vec3 vColor;
        varying float vDepth;

        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;

          gl_FragColor = vec4(vColor, 1.0);
        }
      `;

      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: true,
        depthWrite: false, // Backing mesh already handles depthWrite
        uniforms: {
          uTime: { value: 0 },
        },
      });

      pointsMesh = new THREE.Points(geometry, material);

      // Group silhouette mesh and points so they move together as one rigid 3D object
      const bagGroup = new THREE.Group();
      bagGroup.add(silMesh);
      bagGroup.add(pointsMesh);
      scene.add(bagGroup);

      // Save ref to animate
      scene.userData.bagGroup = bagGroup;

      setLoading(false);
    };

    img.onload = onBothLoaded;
    maskImg.onload = onBothLoaded;

    // Mouse Listeners: Moves all together as the bag, moving only a little
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.hover = true;
    };

    const onMouseLeave = () => {
      mouse.hover = false;
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    window.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    // 4. Render Loop: Moves all together as the bag, moving only a little
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smooth interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const bagGroup = scene.userData.bagGroup;
      if (bagGroup && material) {
        material.uniforms.uTime.value = elapsed;

        // Moves together as a solid 3D bag, tilting just a few degrees
        bagGroup.rotation.y = mouse.x * 0.15 + Math.sin(elapsed * 0.5) * 0.02;
        bagGroup.rotation.x = -mouse.y * 0.11 + Math.cos(elapsed * 0.4) * 0.015;

        bagGroup.position.x = mouse.x * 4.0;
        bagGroup.position.y = mouse.y * 3.0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mouseleave', onMouseLeave);
      if (renderer) {
        renderer.dispose();
      }
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, [imageSrc]);

  return (
    <div
      ref={containerRef}
      style={{
        width: width,
        height: height,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        pointerEvents: 'auto',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      {loading && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            color: '#4d1f27',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          Loading 3D Particle Work Bag...
        </div>
      )}
    </div>
  );
}
