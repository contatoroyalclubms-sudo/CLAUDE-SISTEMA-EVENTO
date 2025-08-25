# 🎨 CATÁLOGO DE COMPONENTES
## Sistema Universal de Gestão de Eventos

### 📋 ÍNDICE
1. [Dashboard Components](#dashboard-components)
2. [Event Management](#event-management)
3. [PDV Components](#pdv-components)
4. [Financial Components](#financial-components)
5. [CRM Components](#crm-components)
6. [Common Components](#common-components)

---

## 🎯 DASHBOARD COMPONENTS

### 1. KPICard
**Propósito:** Exibir métricas principais em tempo real

```typescript
interface KPICardProps {
  title: string;
  value: number | string;
  change: number;
  icon: ReactNode;
  trend: 'up' | 'down' | 'stable';
  period: 'day' | 'week' | 'month';
}

// Uso
<KPICard
  title="Vendas Hoje"
  value="R$ 12.450,00"
  change={15.3}
  icon={<DollarSign />}
  trend="up"
  period="day"
/>
```

### 2. RealtimeChart
**Propósito:** Gráficos com atualização em tempo real via WebSocket

```typescript
interface RealtimeChartProps {
  type: 'line' | 'bar' | 'area' | 'pie';
  dataSource: string; // WebSocket channel
  updateInterval: number;
  height?: number;
  colors?: string[];
}

// Features
- Auto-refresh via WebSocket
- Zoom and pan
- Export to PNG/CSV
- Responsive design
```

### 3. EventCalendar
**Propósito:** Calendário interativo de eventos

```typescript
interface EventCalendarProps {
  events: Event[];
  view: 'month' | 'week' | 'day' | 'agenda';
  onEventClick: (event: Event) => void;
  onDateSelect: (date: Date) => void;
  filters?: EventFilter[];
}

// Features
- Drag & drop events
- Multi-view support
- Event filtering
- Quick event creation
```

---

## 📅 EVENT MANAGEMENT

### 4. EventCreator
**Propósito:** Wizard para criação de eventos

```typescript
interface EventCreatorProps {
  steps: CreationStep[];
  onComplete: (event: EventData) => Promise<void>;
  templates?: EventTemplate[];
}

// Steps
1. Basic Info (name, date, type)
2. Venue & Capacity
3. Ticketing & Pricing
4. Marketing Settings
5. Team Assignment
6. Review & Publish
```

### 5. TicketManager
**Propósito:** Gestão de ingressos e lotes

```typescript
interface TicketManagerProps {
  eventId: string;
  batches: TicketBatch[];
  onBatchCreate: (batch: TicketBatch) => void;
  onPriceUpdate: (batchId: string, price: number) => void;
}

// Features
- Multiple ticket types
- Dynamic pricing
- Batch management
- Discount codes
- Early bird settings
```

### 6. CheckInScanner
**Propósito:** Scanner de QR Code para check-in

```typescript
interface CheckInScannerProps {
  eventId: string;
  onScan: (code: string) => Promise<CheckInResult>;
  mode: 'camera' | 'manual' | 'both';
  allowDuplicate?: boolean;
}

// Features
- QR code scanning
- CPF validation
- Offline mode
- Batch check-in
- Guest list integration
```

---

## 💳 PDV COMPONENTS

### 7. POSInterface
**Propósito:** Interface completa do ponto de venda

```typescript
interface POSInterfaceProps {
  products: Product[];
  categories: Category[];
  tables?: Table[];
  onSale: (sale: Sale) => Promise<void>;
  paymentMethods: PaymentMethod[];
}

// Layout
┌─────────────────────────────────────┐
│  Categories  │   Product Grid       │
│             │                      │
│  Quick Keys │   Cart Summary       │
│             │                      │
│  Tables     │   Payment Options    │
└─────────────────────────────────────┘
```

### 8. ProductGrid
**Propósito:** Grid de produtos com busca rápida

```typescript
interface ProductGridProps {
  products: Product[];
  columns: number;
  onProductSelect: (product: Product) => void;
  searchEnabled?: boolean;
  categoryFilter?: string;
}

// Features
- Image preview
- Quick add buttons
- Stock indicators
- Price variations
- Keyboard shortcuts
```

### 9. PaymentProcessor
**Propósito:** Processamento de pagamentos múltiplos

```typescript
interface PaymentProcessorProps {
  total: number;
  methods: PaymentMethod[];
  onProcess: (payments: Payment[]) => Promise<Receipt>;
  allowSplit?: boolean;
  allowPartial?: boolean;
}

// Supported Methods
- PIX (QR Code generation)
- Credit/Debit cards
- Cash with change calculation
- Vouchers
- Split payment
```

---

## 💰 FINANCIAL COMPONENTS

### 10. CashFlowDashboard
**Propósito:** Visualização do fluxo de caixa

```typescript
interface CashFlowDashboardProps {
  period: DateRange;
  accounts: Account[];
  transactions: Transaction[];
  projections?: Projection[];
}

// Widgets
- Daily/Monthly summary
- Income vs Expenses
- Category breakdown
- Trend analysis
- Alert indicators
```

### 11. SettlementReport
**Propósito:** Relatório de liquidação e splits

```typescript
interface SettlementReportProps {
  eventId: string;
  date: Date;
  settlements: Settlement[];
  onExport: (format: 'pdf' | 'excel') => void;
}

// Sections
- Gross revenue
- Fee breakdown
- Split payment details
- Net settlement
- Transfer schedule
```

### 12. InvoiceGenerator
**Propósito:** Geração de notas fiscais

```typescript
interface InvoiceGeneratorProps {
  sale: Sale;
  customer?: Customer;
  onGenerate: (invoice: Invoice) => Promise<void>;
  template?: InvoiceTemplate;
}

// Features
- NF-e integration
- PDF generation
- Email sending
- Batch processing
- Template customization
```

---

## 👥 CRM COMPONENTS

### 13. CustomerProfile
**Propósito:** Perfil completo do cliente

```typescript
interface CustomerProfileProps {
  customerId: string;
  tabs?: ProfileTab[];
  onUpdate: (data: CustomerData) => void;
}

// Tabs
- Personal Info
- Purchase History
- Preferences
- Loyalty Points
- Communication Log
- Tickets & Events
```

### 14. LoyaltyManager
**Propósito:** Gestão do programa de fidelidade

```typescript
interface LoyaltyManagerProps {
  program: LoyaltyProgram;
  customer: Customer;
  onReward: (reward: Reward) => void;
  onRedeem: (points: number) => void;
}

// Features
- Point accumulation rules
- Tier management
- Reward catalog
- Expiration tracking
- Campaign integration
```

### 15. CampaignBuilder
**Propósito:** Criação de campanhas de marketing

```typescript
interface CampaignBuilderProps {
  templates: CampaignTemplate[];
  segments: CustomerSegment[];
  channels: Channel[];
  onLaunch: (campaign: Campaign) => Promise<void>;
}

// Campaign Types
- Email marketing
- SMS campaigns
- Push notifications
- In-app messages
- Social media
```

---

## 🔧 COMMON COMPONENTS

### 16. DataTable
**Propósito:** Tabela avançada com funcionalidades enterprise

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  filtering?: FilterConfig;
  selection?: SelectionConfig;
  actions?: Action<T>[];
  export?: ExportConfig;
}

// Features
- Virtual scrolling
- Column resizing
- Multi-sort
- Advanced filters
- Bulk actions
- Excel/CSV export
```

### 17. FormBuilder
**Propósito:** Construtor dinâmico de formulários

```typescript
interface FormBuilderProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
  validation?: ValidationRules;
  onSubmit: (values: FormData) => Promise<void>;
}

// Field Types
- Text, Number, Date
- Select, Multi-select
- File upload
- Rich text editor
- Custom components
```

### 18. NotificationCenter
**Propósito:** Central de notificações em tempo real

```typescript
interface NotificationCenterProps {
  userId: string;
  channels: NotificationChannel[];
  onRead: (id: string) => void;
  onAction: (notification: Notification) => void;
}

// Types
- System alerts
- User messages
- Event updates
- Payment confirmations
- Stock alerts
```

### 19. SearchBar
**Propósito:** Busca global com autocomplete

```typescript
interface SearchBarProps {
  placeholder?: string;
  sources: SearchSource[];
  onSelect: (result: SearchResult) => void;
  debounce?: number;
}

// Features
- Multi-source search
- Fuzzy matching
- Recent searches
- Search suggestions
- Keyboard navigation
```

### 20. FileUploader
**Propósito:** Upload de arquivos com preview

```typescript
interface FileUploaderProps {
  accept?: string[];
  maxSize?: number;
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<void>;
  preview?: boolean;
}

// Features
- Drag & drop
- Progress tracking
- Image preview
- Chunk upload
- Resume capability
```

---

## 🎨 DESIGN SYSTEM

### Theme Configuration
```typescript
const theme = {
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  },
  
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};
```

### Component Variants
```typescript
// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Card variants
type CardVariant = 'elevated' | 'outlined' | 'filled';

// Input variants
type InputVariant = 'outline' | 'filled' | 'flushed';
```

---

## 📦 COMPONENT LIBRARY STRUCTURE

```
components/
├── common/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.styles.ts
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Card/
│   ├── Modal/
│   └── Table/
├── dashboard/
│   ├── KPICard/
│   ├── RealtimeChart/
│   └── EventCalendar/
├── events/
│   ├── EventCreator/
│   ├── TicketManager/
│   └── CheckInScanner/
├── pdv/
│   ├── POSInterface/
│   ├── ProductGrid/
│   └── PaymentProcessor/
├── financial/
│   ├── CashFlowDashboard/
│   ├── SettlementReport/
│   └── InvoiceGenerator/
└── crm/
    ├── CustomerProfile/
    ├── LoyaltyManager/
    └── CampaignBuilder/
```

---

## 🚀 USO E IMPLEMENTAÇÃO

### Instalação
```bash
npm install @eventos/ui-components
```

### Importação
```typescript
import { 
  KPICard, 
  EventCreator, 
  POSInterface 
} from '@eventos/ui-components';
```

### Exemplo Completo
```typescript
import React from 'react';
import { 
  DashboardLayout,
  KPICard,
  RealtimeChart,
  EventCalendar 
} from '@eventos/ui-components';

function Dashboard() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Vendas Hoje"
          value="R$ 12.450,00"
          change={15.3}
          trend="up"
        />
        {/* More KPI cards */}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <RealtimeChart
          type="line"
          dataSource="sales"
          updateInterval={5000}
        />
        <EventCalendar
          events={events}
          view="month"
          onEventClick={handleEventClick}
        />
      </div>
    </DashboardLayout>
  );
}
```

---

## 📚 STORYBOOK

Todos os componentes estão documentados no Storybook:

```bash
npm run storybook
```

Acesse: http://localhost:6006

---

## 🧪 TESTING

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

---

## 📖 CONTRIBUTING

### Padrões de Código
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- 100% prop-types coverage

### Checklist para Novos Componentes
- [ ] TypeScript interfaces
- [ ] Props documentation
- [ ] Unit tests (>80% coverage)
- [ ] Storybook stories
- [ ] Accessibility (WCAG 2.1)
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Documentation update