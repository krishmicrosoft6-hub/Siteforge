import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const ForgeCanvas3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLowPerformance, setIsLowPerformance] = useState<boolean>(false);

  useEffect(() => {
    // Hardware & mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const lowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
    const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

    if (isMobile || lowMemory || lowCores) {
      setIsLowPerformance(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      setIsLowPerformance(true);
      return;
    }

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8.5);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const orangePointLight = new THREE.PointLight(0xff6b2b, 4, 20);
    orangePointLight.position.set(3, 3, 4);
    scene.add(orangePointLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 3.5, 20);
    cyanPointLight.position.set(-4, -2, 3);
    scene.add(cyanPointLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 2, 15);
    violetLight.position.set(0, 4, -2);
    scene.add(violetLight);

    // Main Group (Center Laptop & Floating items)
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- Laptop Base ---
    const laptopGroup = new THREE.Group();

    // Base chassis
    const baseGeo = new THREE.BoxGeometry(3.2, 0.12, 2.2);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x11131f,
      roughness: 0.3,
      metalness: 0.8
    });
    const laptopBase = new THREE.Mesh(baseGeo, chassisMat);
    laptopGroup.add(laptopBase);

    // Keyboard area trackpad glow
    const padGeo = new THREE.PlaneGeometry(1.0, 0.6);
    const padMat = new THREE.MeshBasicMaterial({ color: 0x1a1e2e, side: THREE.DoubleSide });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, 0.07, 0.5);
    laptopGroup.add(pad);

    // Laptop Screen Lid
    const screenLidGroup = new THREE.Group();
    screenLidGroup.position.set(0, 0.06, -1.05);

    const lidGeo = new THREE.BoxGeometry(3.2, 2.1, 0.08);
    const lidMesh = new THREE.Mesh(lidGeo, chassisMat);
    lidMesh.position.set(0, 1.05, 0);
    screenLidGroup.add(lidMesh);

    // Screen Display Panel Canvas Texture
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 320;
    const ctx = screenCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0c16';
      ctx.fillRect(0, 0, 512, 320);

      // Header bar
      ctx.fillStyle = '#161a2e';
      ctx.fillRect(0, 0, 512, 36);
      ctx.fillStyle = '#ff5f56'; ctx.beginPath(); ctx.arc(20, 18, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffbd2e'; ctx.beginPath(); ctx.arc(36, 18, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#27c93f'; ctx.beginPath(); ctx.arc(52, 18, 5, 0, Math.PI * 2); ctx.fill();

      // Code / UI lines
      ctx.fillStyle = '#ff6b2b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('⚡ SITEFORGE ENGINE v2.4', 24, 75);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '13px monospace';
      ctx.fillText('const forgeWebsite = async (idea) => {', 24, 110);
      ctx.fillText('  const site = await SiteForge.build({', 40, 135);
      ctx.fillText('    design: "Premium Dark",', 60, 160);
      ctx.fillText('    speed: "Priority ⚡ 3-Days",', 60, 185);
      ctx.fillText('    quality: "Production Ready"', 60, 210);
      ctx.fillText('  });', 40, 235);
      ctx.fillText('  return site.launch();', 40, 260);
      ctx.fillText('};', 24, 285);
    }
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screenDisplay = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.9), screenMat);
    screenDisplay.position.set(0, 1.05, 0.05);
    screenLidGroup.add(screenDisplay);

    screenLidGroup.rotation.x = 0.25; // Open angle
    laptopGroup.add(screenLidGroup);

    laptopGroup.rotation.x = 0.35;
    laptopGroup.rotation.y = -0.4;
    mainGroup.add(laptopGroup);

    // --- Floating UI Panels Around Laptop ---
    const panelGeo = new THREE.PlaneGeometry(1.6, 1.0);
    
    // Panel 1: Analytics / Chart Card
    const panel1Canvas = document.createElement('canvas');
    panel1Canvas.width = 256; panel1Canvas.height = 160;
    const p1Ctx = panel1Canvas.getContext('2d');
    if (p1Ctx) {
      p1Ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      p1Ctx.fillRect(0, 0, 256, 160);
      p1Ctx.strokeStyle = '#06b6d4';
      p1Ctx.lineWidth = 2;
      p1Ctx.strokeRect(4, 4, 248, 152);
      p1Ctx.fillStyle = '#38bdf8';
      p1Ctx.font = 'bold 12px sans-serif';
      p1Ctx.fillText('🚀 Live Status', 16, 28);

      // Bar chart
      p1Ctx.fillStyle = '#ff6b2b'; p1Ctx.fillRect(20, 100, 25, -40);
      p1Ctx.fillStyle = '#06b6d4'; p1Ctx.fillRect(55, 100, 25, -70);
      p1Ctx.fillStyle = '#8b5cf6'; p1Ctx.fillRect(90, 100, 25, -55);
      p1Ctx.fillStyle = '#10b981'; p1Ctx.fillRect(125, 100, 25, -85);
    }
    const panel1Tex = new THREE.CanvasTexture(panel1Canvas);
    const panel1Mat = new THREE.MeshBasicMaterial({ map: panel1Tex, transparent: true, opacity: 0.9 });
    const panel1 = new THREE.Mesh(panelGeo, panel1Mat);
    panel1.position.set(-2.5, 1.2, 1.0);
    panel1.rotation.y = 0.3;
    mainGroup.add(panel1);

    // Panel 2: Fast Service Card
    const panel2Canvas = document.createElement('canvas');
    panel2Canvas.width = 256; panel2Canvas.height = 160;
    const p2Ctx = panel2Canvas.getContext('2d');
    if (p2Ctx) {
      p2Ctx.fillStyle = 'rgba(24, 18, 40, 0.95)';
      p2Ctx.fillRect(0, 0, 256, 160);
      p2Ctx.strokeStyle = '#ff6b2b';
      p2Ctx.lineWidth = 2;
      p2Ctx.strokeRect(4, 4, 248, 152);
      p2Ctx.fillStyle = '#f97316';
      p2Ctx.font = 'bold 14px sans-serif';
      p2Ctx.fillText('⚡ Fast Service', 16, 32);
      p2Ctx.fillStyle = '#ffffff';
      p2Ctx.font = '12px sans-serif';
      p2Ctx.fillText('Delivery: Up to 3 Days', 16, 60);
      p2Ctx.fillStyle = '#f59e0b';
      p2Ctx.font = 'bold 18px sans-serif';
      p2Ctx.fillText('+ ₹200 Add-on', 16, 95);
    }
    const panel2Tex = new THREE.CanvasTexture(panel2Canvas);
    const panel2Mat = new THREE.MeshBasicMaterial({ map: panel2Tex, transparent: true, opacity: 0.95 });
    const panel2 = new THREE.Mesh(panelGeo, panel2Mat);
    panel2.position.set(2.4, -0.8, 1.2);
    panel2.rotation.y = -0.3;
    mainGroup.add(panel2);

    // --- Floating Geometric Items ---
    const octGeo = new THREE.OctahedronGeometry(0.4, 0);
    const octMat = new THREE.MeshStandardMaterial({
      color: 0xff6b2b,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: true
    });
    const octahedron = new THREE.Mesh(octGeo, octMat);
    octahedron.position.set(-2.8, -1.5, 0.5);
    mainGroup.add(octahedron);

    const torusGeo = new THREE.TorusGeometry(0.45, 0.12, 16, 32);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.1,
      metalness: 0.9
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(2.6, 1.6, 0.2);
    torus.rotation.x = 1.0;
    mainGroup.add(torus);

    // --- Particles Cloud ---
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorOrange = new THREE.Color(0xff6b2b);
    const colorCyan = new THREE.Color(0x06b6d4);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const pColor = Math.random() > 0.5 ? colorOrange : colorCyan;
      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse Interaction Target
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      targetMouseX = (e.clientX - windowHalfX) * 0.0006;
      targetMouseY = (e.clientY - windowHalfY) * 0.0006;
    };

    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Resize listener
    const handleResize = () => {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Lerp mouse
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Group float & rotation
      mainGroup.rotation.y = mouseX + Math.sin(elapsedTime * 0.5) * 0.08;
      mainGroup.rotation.x = mouseY + Math.cos(elapsedTime * 0.4) * 0.05;
      mainGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.15 - scrollY * 0.001;

      // Rotate sub-objects
      octahedron.rotation.x += 0.01;
      octahedron.rotation.y += 0.015;
      torus.rotation.y += 0.012;

      panel1.position.y = 1.2 + Math.sin(elapsedTime * 1.5) * 0.1;
      panel2.position.y = -0.8 + Math.cos(elapsedTime * 1.4) * 0.1;

      particleSystem.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  if (isLowPerformance) {
    return (
      <div className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center p-4">
        {/* Glowing background circles fallback */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-3xl animate-pulse-glow" />
        
        {/* Floating 2D Glass Card Representation */}
        <div className="relative z-10 glass-panel border border-amber-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-float">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            </div>
            <span className="text-xs font-mono text-amber-400">⚡ SiteForge 3D Engine</span>
          </div>

          <div className="space-y-4 text-left">
            <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-amber-500/20 rounded w-1/2" />
            
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 font-mono text-xs text-cyan-300">
              <p className="text-amber-400 font-bold">&gt; Initializing Project...</p>
              <p>&gt; Custom Architecture: Ready</p>
              <p>&gt; Delivery: Priority ⚡ Up to 3 Days (+₹200)</p>
              <p className="text-green-400">&gt; Status: Ready to Forge ⚒️</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Lightweight Mode Active</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                100% Performance
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
