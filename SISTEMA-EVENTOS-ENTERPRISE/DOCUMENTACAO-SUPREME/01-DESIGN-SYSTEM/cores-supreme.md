# 🎨 DESIGN SYSTEM - CORES SUPREME

**Versão:** 1.0.0  
**Última Atualização:** 25/08/2025

## 🌈 Paleta Principal - Neon Futurista

### Cores Primárias
```css
/* Azul Neon - Principal */
--neon-blue: #00D4FF;
--neon-blue-dark: #0099CC;
--neon-blue-light: #66E5FF;
--neon-blue-alpha: rgba(0, 212, 255, 0.8);

/* Roxo Neon - Destaque */
--neon-purple: #8B00FF;
--neon-purple-dark: #6600CC;
--neon-purple-light: #B366FF;
--neon-purple-alpha: rgba(139, 0, 255, 0.8);

/* Rosa Neon - Alertas */
--neon-pink: #FF0080;
--neon-pink-dark: #CC0066;
--neon-pink-light: #FF66B3;
--neon-pink-alpha: rgba(255, 0, 128, 0.8);
```

### Cores Secundárias
```css
/* Verde Neon - Sucesso */
--neon-green: #00FF88;
--neon-green-dark: #00CC6A;
--neon-green-light: #66FFB3;
--neon-green-alpha: rgba(0, 255, 136, 0.8);

/* Amarelo Neon - Avisos */
--neon-yellow: #FFD700;
--neon-yellow-dark: #CCAC00;
--neon-yellow-light: #FFE866;
--neon-yellow-alpha: rgba(255, 215, 0, 0.8);

/* Laranja Neon - Especial */
--neon-orange: #FF6B00;
--neon-orange-dark: #CC5500;
--neon-orange-light: #FF9966;
--neon-orange-alpha: rgba(255, 107, 0, 0.8);
```

## 🌑 Backgrounds e Neutros

### Backgrounds
```css
/* Fundos Principais */
--bg-primary: linear-gradient(135deg, #0a0a0a 0%, #1a0033 100%);
--bg-secondary: linear-gradient(135deg, #0a0a0a 0%, #1a0033 50%, #0a0a0a 100%);
--bg-card: rgba(20, 20, 30, 0.8);
--bg-card-hover: rgba(30, 30, 40, 0.9);
--bg-modal: rgba(20, 20, 30, 0.98);
```

### Glassmorphism
```css
/* Efeitos de Vidro */
--glass-light: rgba(255, 255, 255, 0.05);
--glass-medium: rgba(255, 255, 255, 0.1);
--glass-heavy: rgba(255, 255, 255, 0.15);
--glass-blur: blur(20px);
--glass-blur-heavy: blur(30px);
```

### Neutros
```css
/* Escalas de Cinza */
--gray-900: #0a0a0a;
--gray-800: #1a1a1a;
--gray-700: #2a2a2a;
--gray-600: #3a3a3a;
--gray-500: #4a4a4a;
--gray-400: #6a6a6a;
--gray-300: #8a8a8a;
--gray-200: #aaaaaa;
--gray-100: #cacaca;
--white: #ffffff;
```

## 🎆 Gradientes Especiais

### Gradientes Principais
```css
/* Gradientes Multi-cor */
--gradient-supreme: linear-gradient(135deg, #00D4FF, #8B00FF, #FF0080);
--gradient-holographic: linear-gradient(135deg, #00D4FF, #8B00FF, #FF0080, #00FF88);
--gradient-rainbow: linear-gradient(90deg, #00D4FF, #8B00FF, #FF0080, #00FF88, #FFD700);

/* Gradientes Animados */
--gradient-animated: linear-gradient(135deg, #00D4FF, #8B00FF, #FF0080, #00FF88);
background-size: 300% 300%;
animation: gradientShift 3s ease infinite;
```

### Gradientes para Cards
```css
/* Cards e Componentes */
--gradient-card-blue: linear-gradient(135deg, rgba(0, 212, 255, 0.2), transparent);
--gradient-card-purple: linear-gradient(135deg, rgba(139, 0, 255, 0.2), transparent);
--gradient-card-pink: linear-gradient(135deg, rgba(255, 0, 128, 0.2), transparent);
--gradient-card-green: linear-gradient(135deg, rgba(0, 255, 136, 0.2), transparent);
```

## ✨ Efeitos de Luz e Sombra

### Glows
```css
/* Efeitos Neon Glow */
--glow-blue: 0 0 30px rgba(0, 212, 255, 0.6);
--glow-purple: 0 0 30px rgba(139, 0, 255, 0.6);
--glow-pink: 0 0 30px rgba(255, 0, 128, 0.6);
--glow-green: 0 0 30px rgba(0, 255, 136, 0.6);

/* Glow Intenso para Hover */
--glow-blue-intense: 0 0 50px rgba(0, 212, 255, 0.8);
--glow-purple-intense: 0 0 50px rgba(139, 0, 255, 0.8);
```

### Sombras
```css
/* Sombras Premium */
--shadow-sm: 0 5px 15px rgba(0, 0, 0, 0.3);
--shadow-md: 0 10px 30px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 20px 50px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 30px 60px rgba(0, 0, 0, 0.6);

/* Sombras Coloridas */
--shadow-blue: 0 20px 40px rgba(0, 212, 255, 0.3);
--shadow-purple: 0 20px 40px rgba(139, 0, 255, 0.3);
```

## 🎯 Uso por Componente

### Headers e Títulos
- **Título Principal:** `--gradient-supreme`
- **Subtítulos:** `--neon-blue` ou `--neon-purple`
- **Breadcrumbs:** `--neon-blue` com opacity 0.8

### Botões
- **Primary:** Background `--gradient-supreme`
- **Secondary:** Border `--neon-purple`, hover fill
- **Success:** Background `--neon-green`
- **Danger:** Background `--neon-pink`

### Cards
- **Background:** `--bg-card` com `--glass-blur`
- **Hover:** Adicionar `--glow-purple`
- **Active:** Border `--neon-blue`

### Status e Badges
- **Online/Ativo:** `--neon-green`
- **Processando:** `--neon-yellow`
- **Erro:** `--neon-pink`
- **Info:** `--neon-blue`

### Gráficos
- **Linha 1:** `--neon-blue`
- **Linha 2:** `--neon-purple`
- **Linha 3:** `--neon-pink`
- **Linha 4:** `--neon-green`

## 📱 Modo Escuro/Claro

### Dark Mode (Padrão)
```css
:root {
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.8);
  --text-muted: rgba(255, 255, 255, 0.6);
}
```

### Light Mode (Futuro)
```css
[data-theme="light"] {
  --text-primary: #0a0a0a;
  --text-secondary: rgba(10, 10, 10, 0.8);
  --text-muted: rgba(10, 10, 10, 0.6);
  /* Ajustar neons para contraste */
}
```

## 🎨 Combinações Recomendadas

### Combinação 1 - Ultra Futurista
- Background: `--bg-primary`
- Cards: `--bg-card` + `--glass-blur`
- Títulos: `--gradient-supreme`
- CTAs: `--neon-purple`

### Combinação 2 - Neon Vibrante
- Background: `--bg-secondary`
- Acentos: `--neon-blue` + `--neon-pink`
- Hovers: `--glow-purple-intense`

### Combinação 3 - Premium Business
- Background: `--gray-900`
- Destaques: `--neon-blue`
- Sucesso: `--neon-green`
- Cards: Glassmorphism sutil

## ⚠️ Acessibilidade

### Contraste Mínimo
- Texto sobre fundo escuro: WCAG AAA ✅
- Neon sobre preto: Ratio > 7:1 ✅
- Ajustar opacity para legibilidade

### Daltonismo
- Não depender apenas de cor
- Usar ícones + cor
- Testar com simuladores

## 🔄 Animações de Cor

```css
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes neonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes colorRotate {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
```

---

**Documento de Referência para todo o Sistema Supreme**  
**Manter consistência em todos os componentes**