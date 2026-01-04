"use client";

import { motion, MotionValue, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface AnimatedBackgroundProps {
  scrollYProgress: MotionValue<number>;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'home' | 'person';
  baseX: number;
  baseY: number;
}

export default function AnimatedBackground({ scrollYProgress }: AnimatedBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [connections, setConnections] = useState<[number, number][]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 25, stiffness: 100 });
  const smoothMouseY = useSpring(mouseY, { damping: 25, stiffness: 100 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Generate particles on mount
  useEffect(() => {
    const particleCount = isMobile ? 12 : 20;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      newParticles.push({
        id: i,
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 4 + 3,
        type: Math.random() > 0.5 ? 'home' : 'person'
      });
    }

    setParticles(newParticles);

    // Create sparse connections - only a few key matches, not a full network
    const newConnections: [number, number][] = [];
    const maxConnectionsPerParticle = 2;
    const connectionDistance = isMobile ? 25 : 20;

    for (let i = 0; i < newParticles.length; i++) {
      let connectionCount = 0;

      for (let j = i + 1; j < newParticles.length; j++) {
        if (connectionCount >= maxConnectionsPerParticle) break;

        const dx = newParticles[i].x - newParticles[j].x;
        const dy = newParticles[i].y - newParticles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only connect if reasonably close and different types (home to person)
        if (distance < connectionDistance &&
            newParticles[i].type !== newParticles[j].type &&
            Math.random() > 0.5) { // Add randomness - not everything connects
          newConnections.push([i, j]);
          connectionCount++;
        }
      }
    }

    setConnections(newConnections);
  }, [isMobile]);

  // Track mouse movement on desktop
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, mouseX, mouseY]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

      {/* Soft accent gradient */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-3xl bg-gradient-to-br from-indigo-100/30 to-purple-100/30 dark:from-indigo-900/10 dark:to-purple-900/10"
        style={{
          left: "20%",
          top: "40%",
          y: useTransform(scrollYProgress, [0, 1], [0, 100])
        }}
      />

      {/* Particle connections canvas */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          {/* Glow filter for particles */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {connections.map(([i, j], idx) => {
          const p1 = particles[i];
          const p2 = particles[j];
          if (!p1 || !p2) return null;

          return (
            <motion.line
              key={idx}
              x1={`${p1.x}%`}
              y1={`${p1.y}%`}
              x2={`${p2.x}%`}
              y2={`${p2.y}%`}
              className="stroke-indigo-400/15 dark:stroke-indigo-500/10"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: idx * 0.15 }}
            >
              {/* Animated dash movement to show flow/connection */}
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="8"
                dur="2s"
                repeatCount="indefinite"
              />
            </motion.line>
          );
        })}

        {/* Particle dots */}
        {particles.map((particle) => (
          <motion.circle
            key={particle.id}
            cx={`${particle.x}%`}
            cy={`${particle.y}%`}
            r={particle.size}
            className={
              particle.type === 'home'
                ? 'fill-indigo-500/50 dark:fill-indigo-400/40'
                : 'fill-purple-500/50 dark:fill-purple-400/40'
            }
            filter="url(#glow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: particle.id * 0.05 }}
          >
            {/* Subtle pulse animation */}
            <animate
              attributeName="r"
              values={`${particle.size};${particle.size + 1};${particle.size}`}
              dur={`${3 + Math.random() * 2}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0.7;0.4"
              dur={`${3 + Math.random() * 2}s`}
              repeatCount="indefinite"
            />
          </motion.circle>
        ))}
      </svg>
    </div>
  );
}
