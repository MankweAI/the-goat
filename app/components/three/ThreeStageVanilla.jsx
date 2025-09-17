// FILE: app/components/three/ThreeStageVanilla.jsx
// PURPOSE: Lightweight 3D background using vanilla three (no React peer deps).
// WHAT IT DOES:
// - Creates a tiny three.js scene with ambient/directional light and a torus knot.
// - Reacts to "beat" by adjusting color and camera distance slightly.
// - Optimized for mobile: low poly, modest DPR, alpha renderer.

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const BEAT_COLORS = {
  setup: 0x64748b, // slate-500
  problem: 0x4f46e5, // indigo-600
  confusion: 0xf43f5e, // rose-500
  insight: 0x06b6d4, // cyan-500
  solve: 0x22c55e, // emerald-500
  aha: 0x8b5cf6, // violet-500
  wrap: 0x334155, // slate-700
};

export default function ThreeStageVanilla({
  beat = "setup",
  sceneIndex = 0,
  sceneProgress = 0,
}) {
  const containerRef = useRef(null);
  const threeRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    mesh: null,
    frame: 0,
    raf: 0,
  });

  // Init once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 270;
    const height = container.clientHeight || 480;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Scene + Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 3.3);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.7);
    dir1.position.set(2, 2.5, 2);
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dir2.position.set(-2, 1.5, -1.5);
    scene.add(ambient, dir1, dir2);

    // Mesh (low poly)
    const geo = new THREE.TorusKnotGeometry(0.65, 0.2, 100, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: BEAT_COLORS.setup,
      metalness: 0.3,
      roughness: 0.35,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0.2, 0);
    scene.add(mesh);

    // Ground (subtle)
    const groundGeo = new THREE.PlaneGeometry(8, 8, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      metalness: 0,
      roughness: 1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.9;
    scene.add(ground);

    // Render loop
    let start = performance.now();
    const animate = () => {
      const now = performance.now();
      const delta = (now - start) / 1000;
      start = now;

      // Spin
      mesh.rotation.x += delta * 0.2;
      mesh.rotation.y += delta * 0.3;

      // Gentle breathing scale
      const t = now * 0.001 + sceneIndex;
      const s = 0.85 + 0.05 * Math.sin(t * 1.5);
      mesh.scale.set(s, s, s);

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      threeRef.current.raf = requestAnimationFrame(animate);
    };
    threeRef.current = {
      renderer,
      scene,
      camera,
      mesh,
      raf: requestAnimationFrame(animate),
    };

    // Resize handling
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(threeRef.current.raf);
      ro.disconnect();
      renderer.dispose();
      geo.dispose();
      groundGeo.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [sceneIndex]);

  // React to beat changes (color + camera distance target)
  useEffect(() => {
    const { camera, mesh } = threeRef.current;
    if (!camera || !mesh) return;

    // Update color
    const targetColor = new THREE.Color(BEAT_COLORS[beat] || BEAT_COLORS.setup);
    const mat = mesh.material;
    if (mat && mat.color) mat.color.lerp(targetColor, 0.5);

    // Camera z target
    const targetZ =
      beat === "problem"
        ? 3.4
        : beat === "insight"
        ? 3.1
        : beat === "solve"
        ? 3.0
        : beat === "aha"
        ? 3.2
        : 3.3;

    // Smoothly approach
    const currentZ = camera.position.z;
    camera.position.z = currentZ + (targetZ - currentZ) * 0.4;
  }, [beat, sceneProgress]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
