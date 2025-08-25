'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produto: [
      { name: "Sistema de Ingressos", href: "#" },
      { name: "Módulo Cashless", href: "#" },
      { name: "Dashboard BI", href: "#" },
      { name: "Sistema de Equipe", href: "#" },
      { name: "Gestão Cardápios", href: "#" },
      { name: "API & Integrações", href: "#" }
    ],
    empresa: [
      { name: "Sobre Nós", href: "#" },
      { name: "Cases de Sucesso", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Carreira", href: "#" },
      { name: "Imprensa", href: "#" },
      { name: "Parceiros", href: "#" }
    ],
    suporte: [
      { name: "Central de Ajuda", href: "#" },
      { name: "Documentação API", href: "#" },
      { name: "Status do Sistema", href: "#" },
      { name: "Falar com Suporte", href: "#" },
      { name: "Treinamentos", href: "#" },
      { name: "Comunidade", href: "#" }
    ],
    legal: [
      { name: "Termos de Uso", href: "#" },
      { name: "Política de Privacidade", href: "#" },
      { name: "LGPD", href: "#" },
      { name: "SLA", href: "#" },
      { name: "Segurança", href: "#" },
      { name: "Compliance", href: "#" }
    ]
  };

  const socialLinks = [
    { name: "LinkedIn", icon: "💼", href: "#" },
    { name: "Twitter", icon: "🐦", href: "#" },
    { name: "Instagram", icon: "📸", href: "#" },
    { name: "YouTube", icon: "📺", href: "#" },
    { name: "GitHub", icon: "💻", href: "#" }
  ];

  return (
    <footer className="relative py-20 px-4 mt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-purple-900/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-hero-gradient rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">SE</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold neon-text-blue">
                  Sistema Universal
                </h3>
                <p className="text-gray-400">de Eventos v4.0.0</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-400 mb-6 leading-relaxed">
              A plataforma mais avançada do Brasil para gestão de eventos. 
              Revolucionamos o mercado com tecnologia de ponta, design supreme 
              e performance incomparável.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-neon-blue text-xl">📧</span>
                <a href="mailto:contato@sistemauniversal.com.br" className="text-gray-300 hover:text-neon-blue transition-colors">
                  contato@sistemauniversal.com.br
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-neon-green text-xl">📱</span>
                <a href="tel:+5511999999999" className="text-gray-300 hover:text-neon-green transition-colors">
                  (11) 99999-9999
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-neon-purple text-xl">📍</span>
                <span className="text-gray-300">
                  São Paulo, SP - Brasil
                </span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-lg font-semibold neon-text mb-4">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold neon-text mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold neon-text mb-4">Suporte</h4>
            <ul className="space-y-3 mb-8">
              {footerLinks.suporte.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Status Indicator */}
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">Sistema Online</span>
              </div>
              <p className="text-sm text-gray-400">
                Uptime: 99.99% • Última verificação: agora
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="glass p-8 rounded-3xl mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">
              <span className="neon-text">Fique por dentro</span>
            </h3>
            <p className="text-gray-400 mb-6">
              Receba atualizações sobre novas funcionalidades, cases de sucesso e dicas exclusivas
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-6 py-3 bg-glass border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue transition-all"
              />
              <button className="btn-neon whitespace-nowrap">
                Inscrever-se 🚀
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              Sem spam. Cancele quando quiser.
            </p>
          </div>
        </div>

        {/* Social Links & Legal */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/10">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-gray-400 mr-4">Siga-nos:</span>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="glass w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                title={social.name}
              >
                <span className="text-xl">{social.icon}</span>
              </a>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
            {footerLinks.legal.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="hover:text-white transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-white/5 mt-8">
          <p className="text-gray-400">
            © {currentYear} Sistema Universal de Eventos. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Desenvolvido com 💜 no Brasil • Versão 4.0.0 Enterprise Edition
          </p>
        </div>

        {/* Certificates */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-8 pt-8 border-t border-white/5">
          {[
            { name: "ISO 27001", icon: "🔒" },
            { name: "LGPD Compliant", icon: "🇧🇷" },
            { name: "PCI DSS", icon: "💳" },
            { name: "SOC 2", icon: "✅" }
          ].map((cert, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-400">
              <span className="text-lg">{cert.icon}</span>
              <span className="text-sm">{cert.name}</span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}