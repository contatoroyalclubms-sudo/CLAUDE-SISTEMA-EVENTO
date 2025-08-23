import { createClient } from '@supabase/supabase-js';

// These will be set as environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database Types
export interface TorreContext {
  id: string;
  user_id: string;
  session_id: string;
  current_status: string;
  current_project: string | null;
  current_task: string | null;
  current_phase: string | null;
  conversation_history: any[];
  user_preferences: any;
  active_projects: any[];
  completed_projects: any[];
  learned_patterns: any[];
  tasks_completed: number;
  success_rate: number;
  user_satisfaction_score: number;
  created_at: string;
  updated_at: string;
}

export interface TorreProject {
  id: string;
  context_id: string;
  user_id: string;
  name: string;
  description: string | null;
  project_type: string | null;
  status: string;
  tech_stack: string[];
  architecture_pattern: string | null;
  completion_percentage: number;
  tasks_total: number;
  tasks_completed: number;
  repository_url: string | null;
  deployment_urls: any;
  created_at: string;
  updated_at: string;
}

export interface TorreTask {
  id: string;
  project_id: string;
  user_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  task_type: string | null;
  priority: string;
  status: string;
  assigned_agent: string | null;
  progress_percentage: number;
  start_time: string | null;
  end_time: string | null;
  actual_duration: number | null;
  created_at: string;
  updated_at: string;
}

export interface TorreKnowledge {
  id: string;
  context_id: string;
  user_id: string;
  category: string;
  domain: string | null;
  technology: string | null;
  title: string;
  problem_description: string | null;
  solution_description: string;
  code_examples: any[];
  confidence_score: number;
  usage_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TorreAgent {
  id: string;
  context_id: string;
  user_id: string;
  agent_name: string;
  agent_type: string;
  skills: string[];
  status: string;
  tasks_completed: number;
  success_rate: number;
  average_completion_time: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  context_id: string;
  user_id: string;
  message_sequence: number;
  user_message: string | null;
  torre_response: string | null;
  message_type: string | null;
  intent_detected: string | null;
  sentiment: string | null;
  actions_taken: any[];
  tools_used: any[];
  outcome: string | null;
  execution_time: number | null;
  created_at: string;
}

// API Functions
export class TorreSupabaseAPI {
  
  // Context Management
  static async getOrCreateContext(): Promise<TorreContext> {
    const { data: existingContext } = await supabase
      .from('torre_suprema_context')
      .select('*')
      .single();

    if (existingContext) {
      return existingContext;
    }

    // Create new context using the function
    const { data, error } = await supabase
      .rpc('create_initial_context');

    if (error) throw error;
    return data;
  }

  static async updateContext(updates: Partial<TorreContext>): Promise<TorreContext> {
    const { data, error } = await supabase
      .from('torre_suprema_context')
      .update(updates)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Projects
  static async getProjects(): Promise<TorreProject[]> {
    const { data, error } = await supabase
      .from('torre_projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createProject(project: Omit<TorreProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<TorreProject> {
    const { data, error } = await supabase
      .from('torre_projects')
      .insert([project])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProject(id: string, updates: Partial<TorreProject>): Promise<TorreProject> {
    const { data, error } = await supabase
      .from('torre_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Tasks
  static async getTasksByProject(projectId: string): Promise<TorreTask[]> {
    const { data, error } = await supabase
      .from('torre_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createTask(task: Omit<TorreTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<TorreTask> {
    const { data, error } = await supabase
      .from('torre_tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTask(id: string, updates: Partial<TorreTask>): Promise<TorreTask> {
    const { data, error } = await supabase
      .from('torre_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Knowledge
  static async searchKnowledge(query: string, category?: string): Promise<TorreKnowledge[]> {
    const { data, error } = await supabase
      .rpc('search_knowledge', {
        search_query: query,
        category_filter: category || null,
        limit_results: 20
      });

    if (error) throw error;
    return data || [];
  }

  static async saveKnowledge(knowledge: Omit<TorreKnowledge, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<TorreKnowledge> {
    const { data, error } = await supabase
      .from('torre_knowledge')
      .insert([knowledge])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getKnowledge(): Promise<TorreKnowledge[]> {
    const { data, error } = await supabase
      .from('torre_knowledge')
      .select('*')
      .order('confidence_score', { ascending: false })
      .order('usage_count', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  // Agents
  static async getAgents(): Promise<TorreAgent[]> {
    const { data, error } = await supabase
      .from('torre_agents')
      .select('*')
      .order('success_rate', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateAgentPerformance(
    agentName: string, 
    performance: { 
      tasks_completed?: number; 
      success_rate?: number; 
      average_completion_time?: number; 
    }
  ): Promise<TorreAgent> {
    const { data, error } = await supabase
      .from('torre_agents')
      .upsert([{
        agent_name: agentName,
        agent_type: this.detectAgentType(agentName),
        ...performance
      }], {
        onConflict: 'agent_name,context_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Conversations
  static async saveConversation(conversation: Omit<ConversationMessage, 'id' | 'user_id' | 'created_at'>): Promise<ConversationMessage> {
    const { data, error } = await supabase
      .from('conversation_messages')
      .insert([conversation])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getRecentConversations(limit: number = 20): Promise<ConversationMessage[]> {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Dashboard Stats
  static async getDashboardStats(): Promise<any> {
    const { data, error } = await supabase
      .from('dashboard_overview')
      .select('*')
      .single();

    if (error) throw error;
    return data || {
      total_projects: 0,
      total_tasks: 0,
      total_knowledge: 0,
      total_agents: 0,
      tasks_completed: 0,
      success_rate: 1.0
    };
  }

  // Utility
  private static detectAgentType(agentName: string): string {
    const name = agentName.toLowerCase();
    if (name.includes('backend')) return 'backend';
    if (name.includes('frontend')) return 'frontend';
    if (name.includes('database')) return 'database';
    if (name.includes('devops')) return 'devops';
    if (name.includes('design')) return 'design';
    if (name.includes('qa') || name.includes('test')) return 'qa';
    return 'general';
  }

  // Real-time subscriptions
  static subscribeToProjects(callback: (payload: any) => void) {
    return supabase
      .channel('projects-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'torre_projects'
      }, callback)
      .subscribe();
  }

  static subscribeToTasks(callback: (payload: any) => void) {
    return supabase
      .channel('tasks-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'torre_tasks'
      }, callback)
      .subscribe();
  }

  static subscribeToAgents(callback: (payload: any) => void) {
    return supabase
      .channel('agents-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'torre_agents'
      }, callback)
      .subscribe();
  }
}