'use client';

import { useState } from 'react';

interface Plan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
  color: string;
  cta: string;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: 99,
    period: "/mês",
    description: "Perfeito para eventos pequenos e médios",
    features: [
      "Até 1.000 eventos/mês",
      "Sistema de ingressos completo",
      "Dashboard básico",
      "PIX integrado",
      "Suporte por email",
      "Até 5 usuários"
    ],
    highlighted: false,
    color: "neon-blue",
    cta: "Começar Agora"
  },
  {
    name: "Professional",
    price: 299,
    period: "/mês",
    description: "Para empresas em crescimento acelerado",
    features: [
      "Até 10.000 eventos/mês",
      "Todos os módulos inclusos",
      "Dashboard BI avançado",
      "Módulo cashless completo",
      "API e webhooks",
      "Até 20 usuários",
      "Suporte prioritário",
      "Relatórios customizados"
    ],
    highlighted: true,
    badge: "Mais Popular",
    color: "neon-purple",
    cta: "Experimentar Grátis"
  },
  {
    name: "Enterprise",
    price: 799,
    period: "/mês",
    description: "Solução completa para grandes operações",
    features: [
      "Eventos ilimitados",
      "White-label completo",
      "Multi-tenant",
      "Integrações customizadas",
      "SLA 99.99%",
      "Usuários ilimitados",
      "Suporte 24/7",
      "Success manager dedicado",
      "Onboarding personalizado"
    ],
    highlighted: false,
    color: "neon-pink",
    cta: "Falar com Vendas"
  }
];

const addOns = [
  { name: "PIX Premium", price: 0.5, description: "Taxa reduzida PIX", unit: "por transação" },
  { name: "WhatsApp Integration", price: 99, description: "Notificações automáticas", unit: "/mês" },
  { name: "Advanced Analytics", price: 199, description: "IA e previsões", unit: "/mês" },
  { name: "Custom Integrations", price: 499, description: "APIs personalizadas", unit: "/mês" }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(1);

  const getDiscountedPrice = (price: number) => {
    return isAnnual ? Math.round(price * 10) : price; // 2 meses grátis no anual
  };

  return (
    <section id="pricing" className="py-20 px-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="neon-text-purple">Planos</span>{' '}
            <span className="neon-text-pink">Transparentes</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Escolha o plano ideal para sua operação. Sem taxa de setup, sem surpresas.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
              Mensal
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                isAnnual ? 'bg-neon-purple' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                  isAnnual ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
              Anual
              <span className="ml-2 bg-neon-green/20 text-neon-green px-2 py-1 rounded-full text-sm">
                2 meses grátis
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              onClick={() => setSelectedPlan(index)}
              className={`relative cursor-pointer transition-all duration-500 ${
                plan.highlighted || selectedPlan === index 
                  ? 'scale-105 z-10' 
                  : 'hover:scale-102'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-neon-purple px-4 py-2 rounded-full text-sm font-bold">
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className={`glass p-8 rounded-3xl h-full relative overflow-hidden ${
                plan.highlighted || selectedPlan === index 
                  ? 'bg-white/15 border-2 border-neon-purple/50' 
                  : 'hover:bg-white/10'
              }`}>
                {/* Background Glow */}
                <div className={`absolute -inset-1 bg-gradient-to-br from-${plan.color}/20 to-transparent opacity-${
                  plan.highlighted || selectedPlan === index ? '100' : '0'
                } group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
                
                <div className="relative z-10">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {plan.description}
                    </p>
                    
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-4xl md:text-5xl font-bold neon-text">
                          R$ {getDiscountedPrice(plan.price)}
                        </span>
                        <span className="text-gray-400">
                          {isAnnual ? '/ano' : plan.period}
                        </span>
                      </div>
                      
                      {isAnnual && (
                        <div className="text-sm text-gray-500">
                          <span className="line-through">R$ {plan.price * 12}</span>
                          {' '}→{' '}
                          <span className="text-neon-green font-semibold">
                            Economize R$ {(plan.price * 12) - getDiscountedPrice(plan.price)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <span className={`text-${plan.color} text-lg mt-0.5`}>✓</span>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button 
                    className={`w-full py-4 rounded-full font-semibold transition-all duration-300 ${
                      plan.highlighted
                        ? 'btn-neon'
                        : `glass hover:bg-${plan.color}/20 border border-${plan.color}/30`
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add-ons Section */}
        <div className="glass p-8 rounded-3xl mb-16">
          <h3 className="text-3xl font-bold text-center mb-8">
            <span className="neon-text">Add-ons Disponíveis</span>
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => (
              <div key={index} className="glass p-6 rounded-xl hover:bg-white/10 transition-all duration-300">
                <h4 className="font-semibold text-white mb-2">{addon.name}</h4>
                <p className="text-gray-400 text-sm mb-3">{addon.description}</p>
                <div className="neon-text font-bold">
                  R$ {addon.price} {addon.unit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-8">
            <span className="neon-text">Perguntas Frequentes</span>
          </h3>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim, sem multa. Cancele quando quiser através do dashboard."
              },
              {
                q: "Há limite de eventos simultâneos?",
                a: "Não nos planos Professional e Enterprise. Starter: até 10 simultâneos."
              },
              {
                q: "Integração com sistemas existentes?",
                a: "API REST/GraphQL completa. Webhooks em tempo real. Integrações customizadas disponíveis."
              },
              {
                q: "Suporte técnico incluído?",
                a: "Email no Starter, chat prioritário no Professional, 24/7 no Enterprise."
              }
            ].map((faq, index) => (
              <details key={index} className="glass p-6 rounded-xl text-left">
                <summary className="font-semibold cursor-pointer hover:text-neon-blue transition-colors">
                  {faq.q}
                </summary>
                <p className="mt-4 text-gray-400 pl-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="glass p-12 rounded-3xl max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute -inset-1 bg-hero-gradient opacity-20 blur-xl"></div>
            <div className="relative z-10">
              <h3 className="text-4xl font-bold mb-6">
                <span className="neon-text">Pronto para revolucionar seus eventos?</span>
              </h3>
              <p className="text-xl text-gray-400 mb-8">
                Teste grátis por 14 dias. Não precisa cartão de crédito.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-neon text-lg px-12 py-4">
                  Teste Grátis 14 Dias 🚀
                </button>
                <button className="glass px-12 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all">
                  Agendar Demo 📅
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}