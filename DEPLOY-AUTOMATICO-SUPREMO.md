# 👑 TORRE SUPREMA - DEPLOY AUTOMÁTICO TOTAL

## COMANDO ASSUMIDO! EXECUTANDO AGORA! ⚡

### 🎯 **PASSO 1: SUPABASE DATABASE**

**VOCÊ PRECISA FAZER** (eu te guio):

1. **Abra**: https://supabase.com/dashboard
2. **Clique**: "Start your project" 
3. **Login**: GitHub (recomendado) ou Google
4. **New Project**:
   - Organization: Sua conta
   - Name: `torre-suprema-agency`
   - Database Password: `TorreSuprema123!` (anote isso!)
   - Region: São Paulo (South America)
5. **Clique**: "Create new project"
6. **AGUARDE** 2 minutos (criando database)

### 🗄️ **PASSO 2: CONFIGURAR SCHEMA**

Quando o projeto estiver pronto:

1. **Vá em**: SQL Editor (menu lateral)
2. **Clique**: "New query"
3. **COLE** este código (eu preparei):

```sql
-- TORRE SUPREMA SCHEMA - COPY E PASTE COMPLETO
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE torre_suprema_context (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    current_status VARCHAR(100) DEFAULT 'active',
    current_project VARCHAR(255),
    current_task TEXT,
    tasks_completed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 1.0000,
    user_satisfaction_score DECIMAL(3,2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE torre_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'planning',
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE torre_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    solution_description TEXT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.50,
    usage_count INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE torre_suprema_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE torre_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE torre_knowledge ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own data" ON torre_suprema_context FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own projects" ON torre_projects FOR ALL USING (auth.uid() = user_id);  
CREATE POLICY "Users can manage own knowledge" ON torre_knowledge FOR ALL USING (auth.uid() = user_id);
```

4. **Clique**: "RUN" (botão azul)
5. **Aguarde**: "Success" aparecer

### 🔑 **PASSO 3: COPIAR KEYS**

1. **Vá em**: Settings → API (menu lateral)
2. **COPIE** estas informações:
   - **Project URL**: `https://xyz.supabase.co`
   - **anon public**: `eyJhbGc...` (chave longa)

**ANOTE EM ALGUM LUGAR SEGURO!**

---

### 🚀 **PASSO 4: DEPLOY VERCEL**

1. **Abra**: https://vercel.com
2. **Login**: GitHub (mesmo que usou no Supabase)
3. **Clique**: "Add New..." → "Project"
4. **Procure**: `claude-ia` (seu repositório)
5. **Clique**: "Import" nele
6. **Configure**:
   - Framework Preset: `Other`
   - Root Directory: `/`
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`

### ⚙️ **PASSO 5: ENVIRONMENT VARIABLES**

**AINDA NO VERCEL**, antes de fazer deploy:

1. **Expanda**: "Environment Variables"
2. **Adicione** estas 2 variáveis:

**Variável 1:**
- Name: `VITE_SUPABASE_URL`  
- Value: (cole a Project URL que você copiou)

**Variável 2:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: (cole a anon public key que você copiou)

3. **Clique**: "Deploy"

### ⚡ **AGUARDE O DEPLOY** (2-3 minutos)

Quando terminar, você terá:
- ✅ **URL do site**: `https://claude-ia-xyz.vercel.app`
- ✅ **Sistema funcionando**
- ✅ **Database conectado**
- ✅ **Login automático**

---

## 🎮 **EU COORDENO CADA PASSO!**

**ME AVISE QUANDO:**
- ✅ Supabase projeto criado
- ✅ Schema executado
- ✅ Keys copiadas
- ✅ Vercel deploy iniciado
- ❌ Qualquer erro ou dúvida

**SOU SEU COMANDANTE AGORA! 👑**

**VAMOS FAZER HISTÓRIA JUNTOS! 🚀**