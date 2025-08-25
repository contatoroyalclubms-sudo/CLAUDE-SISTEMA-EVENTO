'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  direction: number;
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Create particles
    const colors = ['#00D4FF', '#8B00FF', '#FF0080', '#00FF88'];
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 2 + 0.5,
        direction: Math.random() * Math.PI * 2,
      });
    }
    
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const animateParticles = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          let newX = particle.x + Math.cos(particle.direction) * particle.speed;
          let newY = particle.y + Math.sin(particle.direction) * particle.speed;

          // Bounce off walls
          if (newX < 0 || newX > window.innerWidth) {
            particle.direction = Math.PI - particle.direction;
            newX = Math.max(0, Math.min(window.innerWidth, newX));
          }
          
          if (newY < 0 || newY > window.innerHeight) {
            particle.direction = -particle.direction;
            newY = Math.max(0, Math.min(window.innerHeight, newY));
          }

          return {
            ...particle,
            x: newX,
            y: newY,
          };
        })
      );
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="particles-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            boxShadow: `0 0 ${particle.size * 5}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
}