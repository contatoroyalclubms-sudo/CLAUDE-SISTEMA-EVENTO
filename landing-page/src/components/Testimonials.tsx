'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  name: string;
  company: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  highlight: string;
  stats: {
    label: string;
    value: string;
  }[];
}

const testimonials: Testimonial[] = [
  {
    name: "Carlos Mendes",
    company: "Royal Events Group",
    role: "CEO & Founder",
    avatar: "🤵",
    rating: 5,
    text: "Migrar para o Sistema Universal foi a melhor decisão que tomamos. Em 6 meses aumentamos nossa receita em 300% e reduzimos custos operacionais em 60%.",
    highlight: "300% aumento de receita",
    stats: [
      { label: "Eventos/mês", value: "2,500+" },
      { label: "Economia", value: "R$ 50k/mês" },
      { label: "Satisfação", value: "98%" }
    ]
  },
  {
    name: "Ana Paula Silva",
    company: "Festas Premium SP",
    role: "Diretora Operacional",
    avatar: "👩‍💼",
    rating: 5,
    text: "O módulo cashless revolucionou nossos eventos. Eliminamos filas, aumentamos o ticket médio em 40% e temos controle total em tempo real.",
    highlight: "40% aumento ticket médio",
    stats: [
      { label: "Tempo fila", value: "-85%" },
      { label: "Ticket médio", value: "+40%" },
      { label: "Fraudes", value: "0" }
    ]
  },
  {
    name: "Roberto Santos",
    company: "Balada Tech Club",
    role: "Gerente Geral",
    avatar: "🎭",
    rating: 5,
    text: "A integração com PIX nativo mudou tudo. Processos que levavam dias agora são instantâneos. Nossos clientes adoram a facilidade.",
    highlight: "PIX nativo integrado",
    stats: [
      { label: "Pagamentos PIX", value: "89%" },
      { label: "Conversão", value: "+25%" },
      { label: "Tempo proc.", value: "Instant." }
    ]
  },
  {
    name: "Marina Costa",
    company: "Eventos Corporativos BR",
    role: "Head de Tecnologia",
    avatar: "👩‍💻",
    rating: 5,
    text: "Dashboard BI é impressionante. Dados em tempo real, previsões precisas e relatórios automáticos. Tomamos decisões baseadas em dados reais.",
    highlight: "Decisões data-driven",
    stats: [
      { label: "Precisão IA", value: "94%" },
      { label: "Tempo análise", value: "-90%" },
      { label: "ROI eventos", value: "+180%" }
    ]
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  return (
    <section id="testimonials" className="py-20 px-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="neon-text-pink">Casos</span>{' '}
            <span className="neon-text-blue">de Sucesso</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Empresas que já dominam seus mercados usando nossa plataforma
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="glass p-8 md:p-12 rounded-3xl mb-8 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink/20 via-neon-blue/20 to-neon-purple/20 opacity-50 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar & Info */}
              <div className="flex-shrink-0 text-center md:text-left">
                <div className="text-6xl mb-4">
                  {testimonials[currentIndex].avatar}
                </div>
                <h3 className="text-2xl font-bold neon-text mb-2">
                  {testimonials[currentIndex].name}
                </h3>
                <p className="text-gray-400 mb-2">
                  {testimonials[currentIndex].role}
                </p>
                <p className="text-neon-blue font-semibold mb-4">
                  {testimonials[currentIndex].company}
                </p>
                
                {/* Rating */}
                <div className="flex justify-center md:justify-start gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-2xl ${i < testimonials[currentIndex].rating ? 'text-neon-yellow' : 'text-gray-600'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Highlight */}
                <div className="inline-block bg-neon-pink/20 text-neon-pink px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  📈 {testimonials[currentIndex].highlight}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-6">
                  "{testimonials[currentIndex].text}"
                </blockquote>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {testimonials[currentIndex].stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold neon-text mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button 
            onClick={prevTestimonial}
            className="glass p-3 rounded-full hover:bg-white/20 transition-all duration-300"
          >
            <span className="text-2xl">←</span>
          </button>
          
          {/* Dots Indicator */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'bg-neon-blue' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <button 
            onClick={nextTestimonial}
            className="glass p-3 rounded-full hover:bg-white/20 transition-all duration-300"
          >
            <span className="text-2xl">→</span>
          </button>
        </div>

        {/* All Testimonials Preview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`glass p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                currentIndex === index 
                  ? 'bg-white/20 scale-105 border-2 border-neon-blue/50' 
                  : 'hover:bg-white/10 hover:scale-102'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{testimonial.avatar}</div>
                <h4 className="font-semibold text-white mb-1">{testimonial.name}</h4>
                <p className="text-sm text-gray-400">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="glass p-8 rounded-2xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              <span className="neon-text">Seja o próximo case de sucesso</span>
            </h3>
            <p className="text-gray-400 mb-6">
              Junte-se a centenas de empresas que já revolucionaram seus eventos
            </p>
            <button className="btn-neon">
              Falar com Especialista 💬
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}