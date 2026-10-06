import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Eye, RotateCw } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export const Cyber3DGeometricScene: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || (compact ? 300 : 800));
    let height = (canvas.height = compact ? 180 : 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = compact ? 180 : 360;
    };
    window.addEventListener('resize', handleResize);

    // 3D Icosahedron vertices (Golden ratio phi)
    const phi = (1 + Math.sqrt(5)) / 2;
    const scale = compact ? 55 : 100;
    const baseVertices: Point3D[] = [
      { x: -1, y: phi, z: 0 },
      { x: 1, y: phi, z: 0 },
      { x: -1, y: -phi, z: 0 },
      { x: 1, y: -phi, z: 0 },
      { x: 0, y: -1, z: phi },
      { x: 0, y: 1, z: phi },
      { x: 0, y: -1, z: -phi },
      { x: 0, y: 1, z: -phi },
      { x: phi, y: 0, z: -1 },
      { x: phi, y: 0, z: 1 },
      { x: -phi, y: 0, z: -1 },
      { x: -phi, y: 0, z: 1 },
    ].map((v) => ({ x: v.x * scale, y: v.y * scale, z: v.z * scale }));

    // Edge connections for icosahedron
    const edges: [number, number][] = [
      [0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
      [1, 5], [1, 7], [1, 8], [1, 9],
      [2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
      [3, 4], [3, 6], [3, 8], [3, 9],
      [4, 5], [4, 9], [4, 11],
      [5, 9], [5, 11],
      [6, 7], [6, 8], [6, 10],
      [7, 8], [7, 10],
      [8, 9], [10, 11]
    ];

    // Inner core vertices (Defense Hexagon Core)
    const innerScale = scale * 0.45;
    const coreVertices: Point3D[] = baseVertices.map((v) => ({
      x: (v.x / scale) * innerScale,
      y: (v.y / scale) * innerScale,
      z: (v.z / scale) * innerScale,
    }));

    // Floating particles around the 3D geometric shape
    const particles: Array<{ x: number; y: number; z: number; color: string; speed: number }> = [];
    const colors = ['#22d3ee', '#06b6d4', '#14b8a6', '#6366f1', '#a855f7'];
    for (let i = 0; i < (compact ? 24 : 60); i++) {
      const radius = scale * (1.3 + Math.random() * 0.8);
      const theta = Math.random() * Math.PI * 2;
      const phiAngle = (Math.random() - 0.5) * Math.PI;
      particles.push({
        x: radius * Math.cos(phiAngle) * Math.cos(theta),
        y: radius * Math.sin(phiAngle),
        z: radius * Math.cos(phiAngle) * Math.sin(theta),
        color: colors[i % colors.length],
        speed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    let angleX = 0.2;
    let angleY = 0.4;
    let angleZ = 0.1;

    // Mouse drag rotation support
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      angleY += deltaX * 0.01;
      angleX += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const project = (p: Point3D): { x: number; y: number; scale: number; z: number } => {
      const fov = compact ? 280 : 420;
      const zDistance = p.z + 400;
      const projScale = fov / Math.max(10, zDistance);
      return {
        x: p.x * projScale + width / 2,
        y: p.y * projScale + height / 2,
        scale: projScale,
        z: p.z,
      };
    };

    const rotatePoint = (p: Point3D, ax: number, ay: number, az: number): Point3D => {
      // Rotate Y
      let cos = Math.cos(ay);
      let sin = Math.sin(ay);
      let x1 = p.x * cos - p.z * sin;
      let z1 = p.x * sin + p.z * cos;
      let y1 = p.y;

      // Rotate X
      cos = Math.cos(ax);
      sin = Math.sin(ax);
      let y2 = y1 * cos - z1 * sin;
      let z2 = y1 * sin + z1 * cos;
      let x2 = x1;

      // Rotate Z
      cos = Math.cos(az);
      sin = Math.sin(az);
      let x3 = x2 * cos - y2 * sin;
      let y3 = x2 * sin + y2 * cos;
      let z3 = z2;

      return { x: x3, y: y3, z: z3 };
    };

    const render = () => {
      if (autoRotate && !isDragging) {
        angleY += 0.008 * rotationSpeed;
        angleX += 0.004 * rotationSpeed;
      }

      ctx.clearRect(0, 0, width, height);

      // Background ambient cyber gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * 0.6);
      bgGrad.addColorStop(0, 'rgba(6, 182, 212, 0.07)');
      bgGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.2)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Rotating perspective cyber rings
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, scale * 1.5, scale * 0.45, angleY * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, scale * 1.7, scale * 0.55, -angleX * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Transform outer vertices
      const transformedOuter = baseVertices.map((v) => rotatePoint(v, angleX, angleY, angleZ));
      const projectedOuter = transformedOuter.map(project);

      // Transform inner core vertices
      const transformedInner = coreVertices.map((v) => rotatePoint(v, -angleX * 1.2, -angleY * 1.2, angleZ));
      const projectedInner = transformedInner.map(project);

      // Draw outer edges with depth-based alpha
      edges.forEach(([i, j]) => {
        const p1 = projectedOuter[i];
        const p2 = projectedOuter[j];
        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.12, Math.min(0.85, (avgZ + scale) / (scale * 2.2)));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw inner core edges
      edges.forEach(([i, j]) => {
        const p1 = projectedInner[i];
        const p2 = projectedInner[j];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw outer vertex nodes
      projectedOuter.forEach((p, idx) => {
        const isCritical = idx === 0 || idx === 8;
        const color = isCritical ? '#ef4444' : '#22d3ee';
        const glowColor = isCritical ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 211, 238, 0.6)';

        // Vertex glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, (compact ? 3 : 5) * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = glowColor;
        ctx.fill();

        // Vertex core
        ctx.beginPath();
        ctx.arc(p.x, p.y, (compact ? 2 : 3) * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Draw floating defense particles
      particles.forEach((pt) => {
        pt.x += pt.speed * 20;
        const rotatedPt = rotatePoint(pt, angleX * 0.7, angleY * 0.7, 0);
        const proj = project(rotatedPt);

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 1.8 * proj.scale, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [autoRotate, rotationSpeed, compact]);

  return (
    <div className={`relative w-full rounded-2xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-md overflow-hidden ${compact ? 'h-[200px]' : 'h-[380px]'}`}>
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Badges */}
      <div className="absolute top-3 left-4 flex items-center gap-2 text-xs font-mono">
        <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-cyan-300 font-semibold tracking-wider uppercase text-[11px]">
          3D Live Geometric Lattice · Zero Trust Defense Core
        </span>
      </div>

      <div className="absolute top-3 right-4 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="px-2 py-1 rounded bg-slate-900/80 border border-slate-700 text-xs font-mono text-cyan-300 hover:bg-cyan-950 flex items-center gap-1.5 transition-colors"
          title="Toggle Auto Rotation"
        >
          <RotateCw className={`h-3 w-3 ${autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{autoRotate ? 'Auto Orbit' : 'Paused'}</span>
        </button>
      </div>

      {/* Footer watermark & controls info */}
      <div className="absolute bottom-2 left-4 right-4 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/80 pt-1.5">
        <span>Click and drag mouse to rotate 3D geometric coordinate matrix</span>
        <span className="text-cyan-400/80 font-bold">&copy; 2026 AmanDev. All Rights Reserved.</span>
      </div>
    </div>
  );
};
