// ===================================
// 🎨 COMPONENTES REUTILIZÁVEIS
// Sistema de Eventos - Design System
// ===================================

// COMPONENTE: Metric Card
class MetricCard {
  constructor(options) {
    this.title = options.title || 'Métrica';
    this.value = options.value || '0';
    this.icon = options.icon || '📊';
    this.change = options.change || 0;
    this.trend = options.trend || 'neutral';
    this.color = options.color || 'primary';
  }

  render() {
    const trendIcon = this.trend === 'up' ? '↑' : this.trend === 'down' ? '↓' : '→';
    const trendClass = this.trend === 'up' ? 'positive' : this.trend === 'down' ? 'negative' : 'neutral';
    
    return `
      <div class="metric-card">
        <div class="metric-icon ${this.color}">
          ${this.icon}
        </div>
        <div class="metric-content">
          <div class="metric-label">${this.title}</div>
          <div class="metric-value">${this.value}</div>
          <div class="metric-change ${trendClass}">
            <span>${trendIcon}</span>
            <span>${Math.abs(this.change)}%</span>
          </div>
        </div>
      </div>
    `;
  }
}

// COMPONENTE: Chart Card
class ChartCard {
  constructor(options) {
    this.title = options.title || 'Gráfico';
    this.type = options.type || 'line';
    this.data = options.data || [];
    this.id = options.id || 'chart-' + Date.now();
  }

  render() {
    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${this.title}</h3>
          <div class="card-actions">
            <button class="btn btn-ghost btn-sm">
              <svg width="20" height="20" fill="currentColor">
                <circle cx="10" cy="5" r="1.5"/>
                <circle cx="10" cy="10" r="1.5"/>
                <circle cx="10" cy="15" r="1.5"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="card-body">
          <canvas id="${this.id}" height="300"></canvas>
        </div>
      </div>
    `;
  }

  initChart() {
    const ctx = document.getElementById(this.id).getContext('2d');
    new Chart(ctx, {
      type: this.type,
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}

// COMPONENTE: Event Card
class EventCard {
  constructor(options) {
    this.title = options.title || 'Evento';
    this.date = options.date || new Date();
    this.location = options.location || 'Local';
    this.attendees = options.attendees || 0;
    this.status = options.status || 'active';
    this.image = options.image || 'https://via.placeholder.com/300x200';
  }

  render() {
    const statusBadge = {
      active: '<span class="badge badge-success">Ativo</span>',
      pending: '<span class="badge badge-warning">Pendente</span>',
      finished: '<span class="badge badge-danger">Finalizado</span>'
    };

    return `
      <div class="card event-card">
        <div class="event-image" style="background-image: url('${this.image}')">
          ${statusBadge[this.status]}
        </div>
        <div class="card-body">
          <h4 class="event-title">${this.title}</h4>
          <div class="event-info">
            <div class="event-info-item">
              <span class="icon">📅</span>
              <span>${new Date(this.date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="event-info-item">
              <span class="icon">📍</span>
              <span>${this.location}</span>
            </div>
            <div class="event-info-item">
              <span class="icon">👥</span>
              <span>${this.attendees} participantes</span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-sm">Ver Detalhes</button>
          <button class="btn btn-ghost btn-sm">Editar</button>
        </div>
      </div>
    `;
  }
}

// COMPONENTE: Table
class DataTable {
  constructor(options) {
    this.columns = options.columns || [];
    this.data = options.data || [];
    this.actions = options.actions || false;
  }

  render() {
    const headerHTML = this.columns.map(col => `<th>${col.label}</th>`).join('');
    const actionsHeader = this.actions ? '<th>Ações</th>' : '';
    
    const rowsHTML = this.data.map(row => {
      const cells = this.columns.map(col => `<td>${row[col.key] || ''}</td>`).join('');
      const actionsCell = this.actions ? `
        <td>
          <button class="btn btn-ghost btn-sm">✏️</button>
          <button class="btn btn-ghost btn-sm">🗑️</button>
        </td>
      ` : '';
      
      return `<tr>${cells}${actionsCell}</tr>`;
    }).join('');

    return `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              ${headerHTML}
              ${actionsHeader}
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    `;
  }
}

// COMPONENTE: Modal
class Modal {
  constructor(options) {
    this.title = options.title || 'Modal';
    this.content = options.content || '';
    this.footer = options.footer || '';
    this.id = options.id || 'modal-' + Date.now();
  }

  render() {
    return `
      <div class="modal-backdrop" id="${this.id}-backdrop" style="display: none;">
        <div class="modal" id="${this.id}">
          <div class="modal-header">
            <h3>${this.title}</h3>
            <button class="btn btn-ghost btn-sm" onclick="closeModal('${this.id}')">✕</button>
          </div>
          <div class="modal-body">
            ${this.content}
          </div>
          ${this.footer ? `<div class="modal-footer">${this.footer}</div>` : ''}
        </div>
      </div>
    `;
  }

  show() {
    document.getElementById(`${this.id}-backdrop`).style.display = 'block';
  }

  hide() {
    document.getElementById(`${this.id}-backdrop`).style.display = 'none';
  }
}

// COMPONENTE: Notification
class Notification {
  constructor(options) {
    this.message = options.message || '';
    this.type = options.type || 'info';
    this.duration = options.duration || 3000;
  }

  show() {
    const notificationHTML = `
      <div class="notification notification-${this.type}">
        ${this.getIcon()}
        <span>${this.message}</span>
      </div>
    `;

    const container = document.getElementById('notification-container') || this.createContainer();
    container.insertAdjacentHTML('beforeend', notificationHTML);
    
    const notification = container.lastElementChild;
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, this.duration);
  }

  getIcon() {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[this.type] || icons.info;
  }

  createContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
  }
}

// COMPONENTE: Search Bar
class SearchBar {
  constructor(options) {
    this.placeholder = options.placeholder || 'Buscar...';
    this.onSearch = options.onSearch || function() {};
  }

  render() {
    return `
      <div class="search-bar">
        <input 
          type="text" 
          class="form-control" 
          placeholder="${this.placeholder}"
          onkeyup="handleSearch(event, this.value)"
        />
        <button class="btn btn-primary">
          🔍 Buscar
        </button>
      </div>
    `;
  }
}

// COMPONENTE: Tab Navigation
class TabNavigation {
  constructor(options) {
    this.tabs = options.tabs || [];
    this.activeTab = options.activeTab || 0;
  }

  render() {
    const tabsHTML = this.tabs.map((tab, index) => `
      <button 
        class="tab-button ${index === this.activeTab ? 'active' : ''}"
        onclick="switchTab(${index})"
      >
        ${tab.icon ? `<span class="tab-icon">${tab.icon}</span>` : ''}
        <span>${tab.label}</span>
      </button>
    `).join('');

    const contentHTML = this.tabs.map((tab, index) => `
      <div class="tab-content ${index === this.activeTab ? 'active' : ''}" id="tab-${index}">
        ${tab.content}
      </div>
    `).join('');

    return `
      <div class="tabs">
        <div class="tab-navigation">
          ${tabsHTML}
        </div>
        <div class="tab-panels">
          ${contentHTML}
        </div>
      </div>
    `;
  }
}

// HELPERS: Funções utilitárias
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

function formatNumber(num) {
  return new Intl.NumberFormat('pt-BR').format(num);
}

// THEME TOGGLE
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Atualizar ícone do botão
  const themeButton = document.getElementById('theme-toggle');
  if (themeButton) {
    themeButton.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
  }
}

// Inicializar tema ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
});

// EXPORT para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MetricCard,
    ChartCard,
    EventCard,
    DataTable,
    Modal,
    Notification,
    SearchBar,
    TabNavigation,
    formatCurrency,
    formatDate,
    formatNumber,
    toggleTheme
  };
}