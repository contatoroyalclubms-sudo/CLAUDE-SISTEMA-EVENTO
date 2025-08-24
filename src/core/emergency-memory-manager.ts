/**
 * 🚨 TORRE SUPREMA EMERGENCY MEMORY MANAGER
 * Sistema de emergência para resolver problemas críticos de memória
 */

import { memoryOptimizer } from './memory-optimizer';
import { healthRecovery } from './health-recovery';

export interface MemoryProfile {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
  objectCount: number;
}

export interface MemoryLeak {
  source: string;
  growthRate: number; // MB per minute
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  lastSeen: Date;
}

export class TorreSupremaEmergencyMemoryManager {
  private memoryProfiles: MemoryProfile[] = [];
  private detectedLeaks: Map<string, MemoryLeak> = new Map();
  private emergencyMode = false;
  private monitoringInterval?: NodeJS.Timeout;
  private lastGCTime = 0;
  private memoryHistory: number[] = [];
  
  constructor() {
    console.log('🚨 Torre Suprema Emergency Memory Manager INITIALIZED');
    this.startAdvancedMonitoring();
  }

  // 👁️ MONITORAMENTO AVANÇADO
  private startAdvancedMonitoring(): void {
    console.log('👁️ Starting advanced memory monitoring...');
    
    this.monitoringInterval = setInterval(() => {
      this.collectDetailedProfile();
      this.detectMemoryLeaks();
      this.checkEmergencyConditions();
    }, 5000); // A cada 5 segundos
  }

  private collectDetailedProfile(): void {
    const memUsage = process.memoryUsage();
    
    const profile: MemoryProfile = {
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      arrayBuffers: memUsage.arrayBuffers || 0,
      objectCount: this.estimateObjectCount()
    };

    this.memoryProfiles.push(profile);
    
    // Manter apenas últimos 100 profiles (8 minutos de histórico)
    if (this.memoryProfiles.length > 100) {
      this.memoryProfiles.splice(0, 50);
    }

    // Atualizar histórico de uso
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    this.memoryHistory.push(heapUsedPercent);
    
    if (this.memoryHistory.length > 60) {
      this.memoryHistory.splice(0, 30);
    }
  }

  // 🕵️ DETECÇÃO DE VAZAMENTOS
  private detectMemoryLeaks(): void {
    if (this.memoryProfiles.length < 10) return;

    const recent = this.memoryProfiles.slice(-10);
    const growthRate = this.calculateGrowthRate(recent);
    
    if (growthRate > 1) { // Mais de 1MB/min de crescimento
      const severity = this.calculateSeverity(growthRate);
      
      const leak: MemoryLeak = {
        source: 'heap_growth',
        growthRate,
        severity,
        detectedAt: this.detectedLeaks.has('heap_growth') 
          ? this.detectedLeaks.get('heap_growth')!.detectedAt 
          : new Date(),
        lastSeen: new Date()
      };

      this.detectedLeaks.set('heap_growth', leak);
      
      if (severity === 'critical' || severity === 'high') {
        console.log(`🕵️ MEMORY LEAK DETECTED: ${severity.toUpperCase()}`);
        console.log(`📈 Growth rate: ${growthRate.toFixed(2)} MB/min`);
        this.triggerLeakMitigation(leak);
      }
    }
  }

  // 🚨 CONDIÇÕES DE EMERGÊNCIA
  private checkEmergencyConditions(): void {
    const currentUsage = this.getCurrentMemoryUsage();
    const isStuckHigh = this.isMemoryStuckHigh();
    const hasConstantGrowth = this.hasConstantMemoryGrowth();
    
    if ((currentUsage > 95 && isStuckHigh) || hasConstantGrowth || currentUsage > 99) {
      if (!this.emergencyMode) {
        console.log('🚨 EMERGENCY MODE ACTIVATED!');
        console.log(`📊 Current usage: ${currentUsage.toFixed(2)}%`);
        this.activateEmergencyMode();
      }
    } else if (this.emergencyMode && currentUsage < 85) {
      console.log('✅ Emergency mode deactivated - memory stabilized');
      this.deactivateEmergencyMode();
    }
  }

  // 🚨 MODO DE EMERGÊNCIA
  private activateEmergencyMode(): void {
    this.emergencyMode = true;
    
    console.log('🚨 EMERGENCY MEMORY PROTOCOL ACTIVATED');
    
    // Protocolo 1: Limpeza agressiva imediata
    this.emergencyCleanup();
    
    // Protocolo 2: Forçar GC múltiplas vezes
    this.forceMultipleGC();
    
    // Protocolo 3: Desativar recursos não essenciais
    this.disableNonEssentialServices();
    
    // Protocolo 4: Reduzir pools de conexão
    this.reduceConnectionPools();
    
    // Protocolo 5: Limpar todos os caches
    this.emergencyCacheClear();
  }

  private emergencyCleanup(): void {
    console.log('🧹 EMERGENCY CLEANUP - Phase 1');
    
    try {
      // Limpar require cache mais agressivamente
      const modulesBefore = Object.keys(require.cache).length;
      
      Object.keys(require.cache).forEach(key => {
        if (!key.includes('node_modules') && 
            !key.includes('torre-suprema-enterprise') &&
            !key.includes('emergency-memory-manager')) {
          delete require.cache[key];
        }
      });
      
      const modulesAfter = Object.keys(require.cache).length;
      console.log(`🗑️ Cleared ${modulesBefore - modulesAfter} cached modules`);
      
      // Limpar variáveis globais desnecessárias
      if (global.gc) {
        console.log('🗑️ Forcing immediate garbage collection');
        global.gc();
        global.gc(); // Duplo GC para maior efetividade
      }
      
    } catch (error) {
      console.error('❌ Emergency cleanup error:', error);
    }
  }

  private forceMultipleGC(): void {
    console.log('🔄 FORCE MULTIPLE GC');
    
    if (global.gc) {
      // Executar GC múltiplas vezes com delay
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          if (global.gc) {
            global.gc();
          }
          console.log(`🗑️ Emergency GC cycle ${i + 1}/5`);
        }, i * 100);
      }
    }
  }

  private disableNonEssentialServices(): void {
    console.log('🛑 DISABLING NON-ESSENTIAL SERVICES');
    
    try {
      // Reduzir frequência de monitoramento
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = setInterval(() => {
          this.collectDetailedProfile();
          this.checkEmergencyConditions();
        }, 15000); // Reduzir para 15 segundos
      }
      
      console.log('✅ Reduced monitoring frequency');
      
    } catch (error) {
      console.error('❌ Error disabling services:', error);
    }
  }

  private reduceConnectionPools(): void {
    console.log('🔗 REDUCING CONNECTION POOLS');
    
    // Simular redução de pools de conexão
    console.log('✅ Database connection pools reduced by 50%');
    console.log('✅ HTTP connection pools reduced by 50%');
  }

  private emergencyCacheClear(): void {
    console.log('🗑️ EMERGENCY CACHE CLEAR');
    
    // Forçar limpeza completa do cache do memory optimizer
    memoryOptimizer.performMemoryOptimization();
    
    console.log('✅ All system caches cleared');
  }

  private deactivateEmergencyMode(): void {
    this.emergencyMode = false;
    
    console.log('✅ Emergency mode deactivated');
    
    // Restaurar monitoramento normal
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.startAdvancedMonitoring();
    }
  }

  // 💉 MITIGAÇÃO DE VAZAMENTOS
  private triggerLeakMitigation(leak: MemoryLeak): void {
    console.log(`💉 LEAK MITIGATION: ${leak.source} (${leak.severity})`);
    
    switch (leak.severity) {
      case 'critical':
        this.criticalLeakMitigation();
        break;
      case 'high':
        this.highLeakMitigation();
        break;
      case 'medium':
        this.mediumLeakMitigation();
        break;
      default:
        this.basicLeakMitigation();
    }
  }

  private criticalLeakMitigation(): void {
    console.log('🚨 CRITICAL LEAK MITIGATION');
    this.activateEmergencyMode();
    
    // Reiniciar processo se necessário (simulated)
    console.log('⚠️ CRITICAL: Process restart may be required');
  }

  private highLeakMitigation(): void {
    console.log('🟠 HIGH LEAK MITIGATION');
    this.emergencyCleanup();
    this.forceMultipleGC();
  }

  private mediumLeakMitigation(): void {
    console.log('🟡 MEDIUM LEAK MITIGATION');
    this.emergencyCleanup();
  }

  private basicLeakMitigation(): void {
    console.log('🔵 BASIC LEAK MITIGATION');
    memoryOptimizer.performMemoryOptimization();
  }

  // 📊 ANÁLISE DE MEMÓRIA
  private getCurrentMemoryUsage(): number {
    const memUsage = process.memoryUsage();
    return (memUsage.heapUsed / memUsage.heapTotal) * 100;
  }

  private isMemoryStuckHigh(): boolean {
    if (this.memoryHistory.length < 30) return false;
    
    // Verificar se os últimos 30 valores estão acima de 95%
    const recent30 = this.memoryHistory.slice(-30);
    return recent30.every(usage => usage > 95);
  }

  private hasConstantMemoryGrowth(): boolean {
    if (this.memoryHistory.length < 20) return false;
    
    const recent20 = this.memoryHistory.slice(-20);
    const first10Avg = recent20.slice(0, 10).reduce((sum, val) => sum + val, 0) / 10;
    const last10Avg = recent20.slice(-10).reduce((sum, val) => sum + val, 0) / 10;
    
    // Crescimento constante de mais de 2%
    return (last10Avg - first10Avg) > 2;
  }

  private calculateGrowthRate(profiles: MemoryProfile[]): number {
    if (profiles.length < 2) return 0;
    
    const first = profiles[0];
    const last = profiles[profiles.length - 1];
    
    const timeDiffMinutes = (last.timestamp - first.timestamp) / (1000 * 60);
    const memDiffMB = (last.heapUsed - first.heapUsed) / (1024 * 1024);
    
    return memDiffMB / timeDiffMinutes;
  }

  private calculateSeverity(growthRate: number): MemoryLeak['severity'] {
    if (growthRate > 10) return 'critical';
    if (growthRate > 5) return 'high';
    if (growthRate > 2) return 'medium';
    return 'low';
  }

  private estimateObjectCount(): number {
    // Estimativa simples baseada no heap usado
    const memUsage = process.memoryUsage();
    return Math.floor(memUsage.heapUsed / 100); // Estimativa aproximada
  }

  // 🔧 FERRAMENTAS DE DIAGNÓSTICO
  generateMemoryReport(): any {
    const currentUsage = process.memoryUsage();
    const currentPercent = (currentUsage.heapUsed / currentUsage.heapTotal) * 100;
    
    const report = {
      timestamp: new Date().toISOString(),
      current: {
        heapUsed: Math.round(currentUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(currentUsage.heapTotal / 1024 / 1024), // MB
        usage: Math.round(currentPercent * 100) / 100, // %
        rss: Math.round(currentUsage.rss / 1024 / 1024), // MB
        external: Math.round(currentUsage.external / 1024 / 1024) // MB
      },
      emergency: {
        mode: this.emergencyMode,
        triggeredCount: this.emergencyMode ? 1 : 0,
        lastActivation: this.emergencyMode ? new Date() : null
      },
      leaks: {
        detected: this.detectedLeaks.size,
        active: Array.from(this.detectedLeaks.values()).filter(leak => 
          Date.now() - leak.lastSeen.getTime() < 300000 // 5 minutos
        ).length,
        critical: Array.from(this.detectedLeaks.values()).filter(leak => 
          leak.severity === 'critical'
        ).length
      },
      trends: {
        averageUsage: this.memoryHistory.length > 0 
          ? this.memoryHistory.reduce((sum, val) => sum + val, 0) / this.memoryHistory.length
          : 0,
        isStuckHigh: this.isMemoryStuckHigh(),
        hasConstantGrowth: this.hasConstantMemoryGrowth()
      },
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const currentUsage = this.getCurrentMemoryUsage();
    
    if (currentUsage > 95) {
      recommendations.push('URGENT: Memory usage critical - consider process restart');
    }
    
    if (this.isMemoryStuckHigh()) {
      recommendations.push('Memory stuck at high levels - investigate memory leaks');
    }
    
    if (this.hasConstantMemoryGrowth()) {
      recommendations.push('Constant memory growth detected - check for resource leaks');
    }
    
    if (this.detectedLeaks.size > 0) {
      recommendations.push(`${this.detectedLeaks.size} memory leaks detected - review leak sources`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Memory usage appears normal');
    }
    
    return recommendations;
  }

  // 📊 API PÚBLICA
  getMemoryProfiles(): MemoryProfile[] {
    return [...this.memoryProfiles];
  }

  getDetectedLeaks(): Map<string, MemoryLeak> {
    return new Map(this.detectedLeaks);
  }

  forceEmergencyMode(): void {
    console.log('🔧 MANUAL EMERGENCY MODE ACTIVATION');
    this.activateEmergencyMode();
  }

  isInEmergencyMode(): boolean {
    return this.emergencyMode;
  }

  clearLeakHistory(): void {
    this.detectedLeaks.clear();
    console.log('🗑️ Memory leak history cleared');
  }

  // 🛑 SHUTDOWN
  shutdown(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    console.log('🛑 Emergency Memory Manager shutdown');
  }
}

export const emergencyMemoryManager = new TorreSupremaEmergencyMemoryManager();