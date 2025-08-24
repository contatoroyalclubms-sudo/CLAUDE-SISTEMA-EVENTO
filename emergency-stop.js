/**
 * 🚨 EMERGENCY STOP SCRIPT
 * Script para parar todos os processos Torre Suprema
 */

console.log('🚨 EMERGENCY STOP - Torre Suprema');
console.log('🛑 Stopping all processes...');

// Forçar parada de todos os intervalos
if (typeof global !== 'undefined') {
  // Limpar todos os intervalos/timeouts
  let highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
    clearInterval(i);
  }
}

// Forçar GC se disponível
if (global.gc) {
  console.log('🗑️ Forcing garbage collection...');
  global.gc();
  global.gc();
  global.gc();
}

// Limpar require cache
console.log('🧹 Clearing module cache...');
Object.keys(require.cache).forEach(key => {
  if (!key.includes('node_modules')) {
    delete require.cache[key];
  }
});

console.log('✅ Emergency stop completed');
console.log('💡 You can now restart the system safely');

// Forçar saída
process.exit(0);