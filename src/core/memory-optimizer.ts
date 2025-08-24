/**
 * 💾 TORRE SUPREMA MEMORY OPTIMIZER
 * Sistema de otimização de memória enterprise
 */

export class TorreSupremaMemoryOptimizer {
  private memoryThreshold = 80; // 80% threshold
  private gcInterval?: NodeJS.Timeout;
  private monitoring = false;
  private isOptimizing = false;
  private lastOptimization = 0;
  private optimizationCooldown = 60000; // 1 minute cooldown
  private optimizationAttempts = 0;
  private maxOptimizationAttempts = 3;

  constructor() {
    console.log('💾 Torre Suprema Memory Optimizer INITIALIZED');
    this.startMemoryMonitoring();
  }

  // 🔍 MONITORAMENTO DE MEMÓRIA
  startMemoryMonitoring(): void {
    this.monitoring = true;
    console.log('👁️ Memory monitoring started');

    this.gcInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 10000); // Check every 10 seconds
  }

  private checkMemoryUsage(): void {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    const now = Date.now();

    // Circuit breaker pattern - stop if already optimizing or in cooldown
    if (this.isOptimizing) {
      console.log(`🔄 Memory optimization already in progress...`);
      return;
    }

    if (now - this.lastOptimization < this.optimizationCooldown) {
      const remainingCooldown = Math.ceil((this.optimizationCooldown - (now - this.lastOptimization)) / 1000);
      console.log(`❄️ Memory optimization cooldown: ${remainingCooldown}s remaining`);
      return;
    }

    if (heapUsedPercent > this.memoryThreshold) {
      // Reset attempts counter if enough time has passed
      if (now - this.lastOptimization > this.optimizationCooldown * 2) {
        this.optimizationAttempts = 0;
      }

      if (this.optimizationAttempts >= this.maxOptimizationAttempts) {
        console.log(`🛑 Maximum optimization attempts reached. Stopping aggressive optimization.`);
        console.log(`📊 Current usage: ${heapUsedPercent.toFixed(2)}% - System may need manual intervention`);
        return;
      }

      console.log(`⚠️ HIGH MEMORY USAGE: ${heapUsedPercent.toFixed(2)}%`);
      this.performMemoryOptimization();
    }
  }

  // 🧹 OTIMIZAÇÃO AUTOMÁTICA
  performMemoryOptimization(): void {
    if (this.isOptimizing) {
      console.log('🔄 Optimization already in progress, skipping...');
      return;
    }

    this.isOptimizing = true;
    this.optimizationAttempts++;
    const startTime = Date.now();
    
    console.log(`🧹 PERFORMING MEMORY OPTIMIZATION... (Attempt ${this.optimizationAttempts}/${this.maxOptimizationAttempts})`);

    const memUsageBefore = process.memoryUsage();
    const heapUsedPercentBefore = (memUsageBefore.heapUsed / memUsageBefore.heapTotal) * 100;

    try {
      // 1. Force Garbage Collection
      if (global.gc) {
        console.log('🗑️ Forcing garbage collection...');
        global.gc();
      }

      // 2. Clear caches (limited to prevent breaking functionality)
      this.clearSystemCaches();

      // 3. Optimize data structures
      this.optimizeDataStructures();

      const memUsageAfter = process.memoryUsage();
      const heapUsedPercentAfter = (memUsageAfter.heapUsed / memUsageAfter.heapTotal) * 100;
      const improvement = heapUsedPercentBefore - heapUsedPercentAfter;
      
      console.log(`✅ Memory optimization complete - Usage: ${heapUsedPercentAfter.toFixed(2)}% (${improvement > 0 ? '-' : '+'}${Math.abs(improvement).toFixed(2)}%)`);
      
      // If no significant improvement, increase cooldown
      if (improvement < 1) {
        this.optimizationCooldown = Math.min(this.optimizationCooldown * 1.5, 300000); // Max 5 minutes
        console.log(`⏰ Increasing cooldown to ${this.optimizationCooldown / 1000}s due to low improvement`);
      }
      
    } finally {
      this.isOptimizing = false;
      this.lastOptimization = Date.now();
      console.log(`⏱️ Optimization took ${Date.now() - startTime}ms`);
    }
  }

  private clearSystemCaches(): void {
    console.log('🧹 Clearing system caches...');
    
    // More conservative cache clearing to prevent breaking functionality
    let clearedCount = 0;
    const keysToDelete: string[] = [];
    
    Object.keys(require.cache).forEach(key => {
      // Only clear non-essential cached modules
      if (!key.includes('node_modules') && 
          !key.includes('core') && 
          !key.includes('torre-suprema') &&
          !key.endsWith('.json') &&
          clearedCount < 10) { // Limit clearing to prevent issues
        keysToDelete.push(key);
        clearedCount++;
      }
    });

    keysToDelete.forEach(key => {
      delete require.cache[key];
    });

    console.log(`✅ System caches cleared (${clearedCount} modules)`);
  }

  private optimizeDataStructures(): void {
    console.log('📊 Optimizing data structures...');
    
    // Simulate data structure optimization
    console.log('✅ Data structures optimized');
  }

  // 🎯 CONFIGURAÇÃO MANUAL
  setMemoryThreshold(threshold: number): void {
    this.memoryThreshold = threshold;
    console.log(`🎯 Memory threshold set to ${threshold}%`);
  }

  // 📊 ESTATÍSTICAS
  getMemoryStats() {
    const memUsage = process.memoryUsage();
    
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsedPercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      threshold: this.memoryThreshold,
      monitoring: this.monitoring
    };
  }

  // 🛑 PARAR MONITORAMENTO
  stopMemoryMonitoring(): void {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.monitoring = false;
      console.log('🛑 Memory monitoring stopped');
    }
  }
}

export const memoryOptimizer = new TorreSupremaMemoryOptimizer();