'use client';

import { useState } from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  color: string;
}

const features: Feature[] = [
  {
    icon: '🎫',
    title: 'Sistema de Ingressos Supreme',
    description: 'Plataforma completa de ticketing com QR Code, check-in automático e analytics em tempo real.',
    benefits: ['QR Code único por ingresso', 'Check-in instantâneo', 'Analytics preditivos', 'Fraude zero'],
    color: 'neon-blue'
  },
  {
    icon: '💰',
    title: 'Módulo Cashless Avançado',
    description: 'Sistema de pagamentos sem dinheiro com cartões RFID e integração PIX nativa.',
    benefits: ['PIX instantâneo', 'Cartões RFID', 'Split automático', 'Conciliação real-time'],
    color: 'neon-purple'
  },
  {
    icon: '📊',
    title: 'Dashboard BI Premium',
    description: 'Analytics empresarial com KPIs em tempo real e relatórios executivos automáticos.',
    benefits: ['Métricas real-time', 'Relatórios automáticos', 'Previsões IA', 'Multi-tenant'],
    color: 'neon-pink'
  },
  {
    icon: '🍽️',
    title: 'Gestão de Cardápios Inteligente',
    description: 'Sistema multi-cardápios com troca automática por evento e gestão de estoque integrada.',
    benefits: ['Múltiplos cardápios', 'Troca automática', 'Controle estoque', 'Preços dinâmicos'],
    color: 'neon-green'
  },
  {
    icon: '👥',
    title: 'Sistema de Equipe Completo',
    description: 'Gestão de colaboradores com 129 permissões granulares e auditoria completa.',
    benefits: ['129 permissões', 'Auditoria total', 'Cargos flexíveis', 'Log de ações'],
    color: 'neon-yellow'
  },
  {
    icon: '🔄',
    title: 'Automação Enterprise',
    description: 'Workflows automáticos, integrações API e sincronização com sistemas externos.',
    benefits: ['APIs REST/GraphQL', 'Webhooks', 'Integrações ERP', 'Sync automático'],
    color: 'neon-cyan'
  }
];

export default function Features() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <section id="features" className="py-20 px-4 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="neon-text-blue">Features</span>{' '}
            <span className="neon-text-purple">Supreme</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Cada módulo foi desenvolvido para superar a concorrência e dominar o mercado brasileiro
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group cursor-pointer transition-all duration-500 ${
                activeFeature === index ? 'scale-105' : ''
              }`}
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div className="glass p-8 rounded-2xl h-full hover:bg-white/15 transition-all duration-300 relative overflow-hidden">
                {/* Background Glow */}
                <div 
                  className={`absolute -inset-1 bg-gradient-to-r from-${feature.color}/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
                ></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold mb-4 neon-text-${feature.color} group-hover:animate-glow`}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li 
                        key={benefitIndex}
                        className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-white transition-colors duration-300"
                      >
                        <span className={`text-${feature.color} text-lg`}>✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  {/* Hover Effect - Learn More */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className={`text-${feature.color} font-semibold hover:underline flex items-center gap-2`}>
                      Saiba mais 
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="glass p-8 rounded-2xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              <span className="neon-text">Todos os módulos integrados</span>
            </h3>
            <p className="text-gray-400 mb-6">
              Uma plataforma completa que resolve todos os problemas de gestão de eventos em um só lugar
            </p>
            <button className="btn-neon">
              Ver Demo Completa 🚀
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}