'use client';

import { useState, useEffect, useRef } from 'react';

interface Stat {
  icon: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
  color: string;
}

const stats: Stat[] = [
  {
    icon: '⚡',
    value: 50,
    suffix: 'ms',
    label: 'Response Time',
    description: '10x mais rápido que Sympla',
    color: 'neon-blue'
  },
  {
    icon: '💰',
    value: 2.9,
    suffix: '%',
    label: 'Taxa Única',
    description: '35% menor que concorrência',
    color: 'neon-green'
  },
  {
    icon: '🚀',
    value: 99.99,
    suffix: '%',
    label: 'Uptime SLA',
    description: 'Disponibilidade garantida',
    color: 'neon-purple'
  },
  {
    icon: '👥',
    value: 1000000,
    suffix: '+',
    label: 'Usuários Simultâneos',
    description: 'Escalabilidade infinita',
    color: 'neon-pink'
  },
  {
    icon: '🎯',
    value: 95,
    suffix: '/100',
    label: 'Performance Score',
    description: 'Lighthouse metrics',
    color: 'neon-yellow'
  },
  {
    icon: '🇧🇷',
    value: 100,
    suffix: '%',
    label: 'Nacional',
    description: 'PIX e compliance LGPD',
    color: 'neon-cyan'
  }
];

function AnimatedNumber({ value, suffix, duration = 2000 }: { value: number; suffix: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = value * easedProgress;

      if (value >= 1000000) {
        setDisplayValue(Math.floor(currentValue / 1000) / 1000);
      } else {
        setDisplayValue(Number(currentValue.toFixed(value < 10 ? 1 : 0)));
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, value, duration]);

  return (
    <div ref={ref} className="tabular-nums">
      {value >= 1000000 ? `${displayValue}M` : displayValue}
      {suffix}
    </div>
  );
}

export default function Stats() {
  return (
    <section id="stats" className="py-20 px-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="neon-text-purple">Números</span>{' '}
            <span className="neon-text-blue">Impressionantes</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Métricas que comprovam nossa superioridade técnica e comercial no mercado
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group glass p-8 rounded-2xl text-center hover:bg-white/15 transition-all duration-500 hover:scale-105 relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className={`absolute -inset-1 bg-gradient-to-r from-${stat.color}/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>

                {/* Animated Number */}
                <div className={`text-4xl md:text-5xl font-bold mb-2 neon-text-${stat.color}`}>
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Section */}
        <div className="glass p-8 rounded-2xl">
          <h3 className="text-3xl font-bold text-center mb-8">
            <span className="neon-text">vs Concorrência</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sistema Universal */}
            <div className="text-center">
              <div className="glass p-6 rounded-xl bg-hero-gradient/20">
                <h4 className="text-xl font-bold neon-text-blue mb-4">
                  Sistema Universal
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span className="neon-text-green font-bold">50ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa:</span>
                    <span className="neon-text-green font-bold">2.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PIX:</span>
                    <span className="neon-text-green font-bold">Nativo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>White-label:</span>
                    <span className="neon-text-green font-bold">✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sympla */}
            <div className="text-center">
              <div className="glass p-6 rounded-xl bg-red-500/10">
                <h4 className="text-xl font-bold text-gray-400 mb-4">
                  Sympla
                </h4>
                <div className="space-y-3 text-gray-400">
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span className="text-red-400">500ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa:</span>
                    <span className="text-red-400">4.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PIX:</span>
                    <span className="text-red-400">Terceiros</span>
                  </div>
                  <div className="flex justify-between">
                    <span>White-label:</span>
                    <span className="text-red-400">✗</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Eventbrite */}
            <div className="text-center">
              <div className="glass p-6 rounded-xl bg-red-500/10">
                <h4 className="text-xl font-bold text-gray-400 mb-4">
                  Eventbrite
                </h4>
                <div className="space-y-3 text-gray-400">
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span className="text-red-400">800ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa:</span>
                    <span className="text-red-400">3.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PIX:</span>
                    <span className="text-red-400">Limitado</span>
                  </div>
                  <div className="flex justify-between">
                    <span>White-label:</span>
                    <span className="text-red-400">Premium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}