import { EventEmitter } from 'events';
export interface ProjectScope {
    id: string;
    name: string;
    description: string;
    objectives: string[];
    deliverables: string[];
    timeline: {
        startDate: Date;
        endDate: Date;
        milestones: Milestone[];
    };
    resources: {
        budget: number;
        teamSize: number;
        technologies: string[];
    };
    risks: Risk[];
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
}
export interface Milestone {
    id: string;
    name: string;
    description: string;
    dueDate: Date;
    dependencies: string[];
    deliverables: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    assignedAgents: string[];
}
export interface Risk {
    id: string;
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
    owner: string;
    status: 'identified' | 'mitigated' | 'resolved';
}
export interface TeamMember {
    agentId: string;
    role: string;
    skills: string[];
    availability: number;
    currentWorkload: number;
    performance: {
        efficiency: number;
        quality: number;
        reliability: number;
    };
}
export declare class ProjectManagerAgent extends EventEmitter {
    private readonly logger;
    private activeProjects;
    private teamMembers;
    private communicationChannels;
    constructor();
    private initializeProjectManagement;
    private setupCommunicationChannels;
    private initializeProjectTemplates;
    createProject(projectInput: Omit<ProjectScope, 'id' | 'status'>): Promise<string>;
    private generateProjectPlan;
    private generateMilestones;
    private getMilestoneDeliverables;
    private getAgentsForPhase;
    private assessProjectRisks;
    private assembleProjectTeam;
    private analyzeRequiredSkills;
    private optimizeTeamComposition;
    private setupProjectMonitoring;
    private monitorProjectProgress;
    private checkForOverdueItems;
    private handleOverdueItems;
    private analyzeTeamPerformance;
    private triggerPerformanceOptimization;
    private monitorResourceUtilization;
    private generateProgressReport;
    private scheduleMilestoneReminders;
    private sendMilestoneReminder;
    private initiateRecoveryPlan;
    updateProjectStatus(projectId: string, status: ProjectScope['status']): Promise<void>;
    completeMilestone(projectId: string, milestoneId: string): Promise<void>;
    getProjectStatus(projectId: string): ProjectScope | undefined;
    getAllProjects(): ProjectScope[];
    getProjectTeam(projectId: string): TeamMember[];
    closeProject(projectId: string): Promise<void>;
    private generateFinalReport;
}
