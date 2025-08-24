import { EventEmitter } from 'events';
export interface DataSource {
    id: string;
    name: string;
    type: 'database' | 'api' | 'file' | 'stream' | 'external';
    connectionString: string;
    schema?: any;
    refreshRate: number;
    status: 'connected' | 'disconnected' | 'error' | 'syncing';
    lastSync: Date;
    totalRecords: number;
}
export interface AnalysisRequest {
    id: string;
    name: string;
    description: string;
    dataSources: string[];
    analysisType: 'descriptive' | 'diagnostic' | 'predictive' | 'prescriptive';
    metrics: string[];
    dimensions: string[];
    filters?: Record<string, any>;
    timeRange?: {
        start: Date;
        end: Date;
    };
    outputFormat: 'dashboard' | 'report' | 'alert' | 'api';
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    results?: AnalysisResults;
}
export interface AnalysisResults {
    id: string;
    requestId: string;
    executionTime: number;
    dataPointsAnalyzed: number;
    insights: Insight[];
    visualizations: Visualization[];
    recommendations: Recommendation[];
    confidence: number;
    generatedAt: Date;
}
export interface Insight {
    id: string;
    type: 'trend' | 'anomaly' | 'correlation' | 'pattern' | 'outlier';
    title: string;
    description: string;
    significance: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    data: any;
    impact: string;
}
export interface Visualization {
    id: string;
    type: 'chart' | 'graph' | 'heatmap' | 'dashboard' | 'table';
    title: string;
    config: any;
    data: any;
    interactive: boolean;
}
export interface Recommendation {
    id: string;
    title: string;
    description: string;
    category: 'optimization' | 'warning' | 'opportunity' | 'action_required';
    priority: 'low' | 'medium' | 'high' | 'critical';
    expectedImpact: string;
    implementation: {
        effort: 'low' | 'medium' | 'high';
        timeline: string;
        resources: string[];
    };
}
export interface MLModel {
    id: string;
    name: string;
    type: 'classification' | 'regression' | 'clustering' | 'forecasting' | 'anomaly_detection';
    algorithm: string;
    status: 'training' | 'trained' | 'deployed' | 'retired';
    accuracy: number;
    lastTrained: Date;
    features: string[];
    hyperparameters: Record<string, any>;
}
export declare class DataAnalystAgent extends EventEmitter {
    private readonly logger;
    private dataSources;
    private analysisQueue;
    private analysisHistory;
    private mlModels;
    private realTimeMonitoring;
    constructor();
    private initializeDataAnalytics;
    private setupDataConnections;
    private initializeMLPipeline;
    private startRealTimeMonitoring;
    submitAnalysisRequest(requestInput: Omit<AnalysisRequest, 'id' | 'createdAt' | 'status'>): Promise<string>;
    private processAnalysisRequest;
    private validateDataSources;
    private extractData;
    private extractFromSource;
    private generateMockData;
    private applyFilters;
    private applyTimeRange;
    private performAnalysis;
    private performDescriptiveAnalysis;
    private performDiagnosticAnalysis;
    private performPredictiveAnalysis;
    private performPrescriptiveAnalysis;
    private generateInsights;
    private createVisualizations;
    private generateRecommendations;
    private calculateMedian;
    private calculateStandardDeviation;
    private calculatePercentile;
    private calculateCorrelations;
    private pearsonCorrelation;
    private calculateTrend;
    private detectAnomalies;
    private findBestModelForMetric;
    private makePrediction;
    private generateForecast;
    private generateOptimizations;
    private recommendResourceAllocation;
    private prioritizeActions;
    private calculateConfidence;
    private performRealTimeAnalysis;
    addDataSource(source: Omit<DataSource, 'status' | 'lastSync' | 'totalRecords'>): Promise<string>;
    deployModel(model: Omit<MLModel, 'status' | 'lastTrained'>): Promise<string>;
    getAnalysisStatus(requestId: string): AnalysisRequest | undefined;
    getAnalysisResults(resultsId: string): AnalysisResults | undefined;
    getAllAnalyses(): AnalysisRequest[];
    getDataSources(): DataSource[];
    getMLModels(): MLModel[];
    generateReport(type: 'daily' | 'weekly' | 'monthly'): Promise<any>;
    private getPeriodMs;
}
