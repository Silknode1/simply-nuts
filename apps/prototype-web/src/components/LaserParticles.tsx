import {useEffect, useRef, useCallback} from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: 'spark' | 'smoke';
  color: string;
  rotation: number;
}

interface LaserParticlesProps {
  width: number;
  height: number;
  laserX: number;
  laserY: number;
  active: boolean;
}

const SPARK_COLORS = ['#ffe8a0', '#ffb84d', '#ff8533', '#ff5e1a', '#fff'];
const SMOKE_COLORS = ['rgba(180,140,100,0.3)', 'rgba(160,120,80,0.2)', 'rgba(200,170,130,0.15)'];

export default function LaserParticles({width, height, laserX, laserY, active}: LaserParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const prevPos = useRef({x: 0, y: 0});

  const spawn = useCallback((x: number, y: number) => {
    const particles = particlesRef.current;

    // Sparks — cartoon star-burst
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 1,
        maxLife: 0.3 + Math.random() * 0.35,
        size: 2 + Math.random() * 4,
        type: 'spark',
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
        rotation: Math.random() * Math.PI
      });
    }

    // Smoke puffs — soft circles drifting up
    if (Math.random() > 0.5) {
      particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y - 2,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.6 - Math.random() * 1.2,
        life: 1,
        maxLife: 0.8 + Math.random() * 0.6,
        size: 6 + Math.random() * 12,
        type: 'smoke',
        color: SMOKE_COLORS[Math.floor(Math.random() * SMOKE_COLORS.length)],
        rotation: 0
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;

    const tick = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;

      // Spawn if active and position changed
      if (active) {
        const dx = laserX - prevPos.current.x;
        const dy = laserY - prevPos.current.y;
        if (dx * dx + dy * dy > 1) {
          spawn(laserX, laserY);
          prevPos.current = {x: laserX, y: laserY};
        }
      }

      // Update + draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt / p.maxLife;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.type === 'spark') {
          p.vy += 0.15; // gravity
          p.rotation += 0.1;
          const alpha = p.life;
          const s = p.size * (0.5 + p.life * 0.5);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = alpha;
          // 4-point star
          ctx.fillStyle = p.color;
          ctx.beginPath();
          for (let j = 0; j < 4; j++) {
            const a = (j / 4) * Math.PI * 2 - Math.PI / 2;
            const outer = s;
            const inner = s * 0.3;
            ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
            const midA = a + Math.PI / 4;
            ctx.lineTo(Math.cos(midA) * inner, Math.sin(midA) * inner);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          // Smoke puff
          const alpha = p.life * 0.6;
          const s = p.size * (1.5 - p.life * 0.5);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, laserX, laserY, active, spawn]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12}}
    />
  );
}
