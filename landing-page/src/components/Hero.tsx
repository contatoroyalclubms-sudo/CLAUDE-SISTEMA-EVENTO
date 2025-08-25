'use client';

import { useState, useEffect } from 'react';

export default function Hero() {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = 'SISTEMA UNIVERSAL DE EVENTOS';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-purple-900/20 to-blue-900/20" />
      
      {/* Main Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="inline-block p-6 rounded-full glass mb-6">
            <div className="w-16 h-16 bg-hero-gradient rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">SE</span>
            </div>
          </div>
        </div>

        {/* Typing Animation Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6">
          <span className="neon-text-blue">
            {text}
            {showCursor && <span className="neon-text-purple">|</span>}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl lg:text-3xl font-light mb-4 text-gray-300">
          <span className="neon-text-purple">Enterprise Edition v4.0.0</span>
        </p>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          A plataforma completa de gestão de eventos que vai{' '}
          <span className="neon-text-pink font-semibold">revolucionar</span> o mercado brasileiro.
          Mais rápido que Sympla, mais completo que Eventbrite.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <button className="btn-neon text-lg px-10 py-5 group">
            <span className="flex items-center gap-3">
              🚀 Começar Agora
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>
          
          <button className="glass px-10 py-5 rounded-full text-lg font-semibold text-white hover:bg-white/20 transition-all duration-300 group">
            <span className="flex items-center gap-3">
              📺 Ver Demo
              <span className="group-hover:scale-110 transition-transform">▶️</span>
            </span>
          </button>
        </div>

        {/* Key Features Pills */}
        <div className="flex flex-wrap gap-4 justify-center">
          {[
            { icon: '⚡', text: '< 50ms', description: 'Response Time' },
            { icon: '💰', text: '2.9%', description: 'Taxa Única' },
            { icon: '🎯', text: '10M+', description: 'Eventos/mês' },
            { icon: '🇧🇷', text: 'PIX', description: 'Nativo' },
          ].map((feature, index) => (
            <div 
              key={index} 
              className="glass px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl group-hover:scale-125 transition-transform">
                  {feature.icon}
                </span>
                <div className="text-left">
                  <div className="neon-text font-bold">{feature.text}</div>
                  <div className="text-xs text-gray-400">{feature.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-neon-blue rounded-full flex justify-center">
              <div className="w-1 h-3 bg-neon-blue rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Scroll para descobrir</p>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-pink/10 rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
      </div>
    </section>
  );
}