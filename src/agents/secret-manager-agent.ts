/**
 * 🔐 SECRET MANAGER AGENT - Torre Suprema
 * Sistema autônomo de gerenciamento seguro de chaves, tokens e credenciais
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { TorreAgent } from '../core/simple-orchestrator';

// Interfaces para tipos de secrets
export interface Secret {
  id: string;
  name: string;
  type: SecretType;
  value: string;
  metadata: SecretMetadata;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  rotationPolicy?: RotationPolicy;
}

export interface SecretMetadata {
  description?: string;
  service?: string;
  environment?: string;
  tags?: string[];
  lastAccessedAt?: Date;
  accessCount?: number;
}

export interface RotationPolicy {
  enabled: boolean;
  intervalDays: number;
  alertDaysBefore?: number;
  autoRotate?: boolean;
}

export type SecretType = 
  | 'api_key' 
  | 'jwt_secret' 
  | 'database_url' 
  | 'oauth_token' 
  | 'encryption_key' 
  | 'certificate' 
  | 'webhook_secret'
  | 'third_party_key';

export interface SecretPolicy {
  encryption: {
    algorithm: string;
    keyLength: number;
  };
  access: {
    maxAttempts: number;
    lockoutDuration: number;
  };
  rotation: {
    defaultDays: number;
    mandatoryTypes: SecretType[];
  };
}

export interface SecretAuditEntry {
  id: string;
  secretId: string;
  action: 'created' | 'accessed' | 'updated' | 'deleted' | 'rotated';
  timestamp: Date;
  source: string;
  metadata?: any;
}

export class SecretManagerAgent implements TorreAgent {
  readonly id = 'secret-manager-agent';
  readonly name = 'Secret Manager Agent';
  readonly description = 'Gerenciamento autônomo e seguro de credenciais';
  readonly version = '1.0.0';

  private secrets: Map<string, Secret> = new Map();
  private encryptionKey: string;
  private secretsPath: string;
  private auditLog: SecretAuditEntry[] = [];
  private accessAttempts: Map<string, number> = new Map();
  private policy: SecretPolicy;

  constructor(config?: {
    secretsPath?: string;
    encryptionKey?: string;
    policy?: Partial<SecretPolicy>;
  }) {
    this.secretsPath = config?.secretsPath || path.join(process.cwd(), '.secrets');
    this.encryptionKey = config?.encryptionKey || this.generateMasterKey();
    
    this.policy = {
      encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32
      },
      access: {
        maxAttempts: 3,
        lockoutDuration: 300000 // 5 minutos
      },
      rotation: {
        defaultDays: 90,
        mandatoryTypes: ['api_key', 'jwt_secret', 'oauth_token']
      },
      ...config?.policy
    };

    this.initializeSecretStore();
    this.startRotationMonitoring();
    
    console.log('🔐 Secret Manager Agent initialized successfully');
  }

  private generateMasterKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private initializeSecretStore(): void {
    try {
      if (!fs.existsSync(this.secretsPath)) {
        fs.mkdirSync(this.secretsPath, { recursive: true });
      }

      const secretsFile = path.join(this.secretsPath, 'secrets.enc');
      if (fs.existsSync(secretsFile)) {
        this.loadEncryptedSecrets();
      }
    } catch (error) {
      console.error('❌ Failed to initialize secret store:', error);
    }
  }

  private encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.policy.encryption.algorithm, this.encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: authTag.toString('hex')
    };
  }

  private decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.policy.encryption.algorithm, this.encryptionKey);
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private loadEncryptedSecrets(): void {
    try {
      const secretsFile = path.join(this.secretsPath, 'secrets.enc');
      const encryptedData = JSON.parse(fs.readFileSync(secretsFile, 'utf8'));
      
      const decryptedData = this.decrypt(encryptedData);
      const secretsData = JSON.parse(decryptedData);
      
      secretsData.secrets.forEach((secret: any) => {
        this.secrets.set(secret.id, {
          ...secret,
          createdAt: new Date(secret.createdAt),
          updatedAt: new Date(secret.updatedAt),
          expiresAt: secret.expiresAt ? new Date(secret.expiresAt) : undefined
        });
      });
      
      if (secretsData.auditLog) {
        this.auditLog = secretsData.auditLog.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
      
      console.log(`🔐 Loaded ${this.secrets.size} secrets from encrypted store`);
    } catch (error) {
      console.error('❌ Failed to load secrets:', error);
    }
  }

  private saveEncryptedSecrets(): void {
    try {
      const secretsData = {
        secrets: Array.from(this.secrets.values()),
        auditLog: this.auditLog.slice(-1000) // Manter últimas 1000 entradas
      };
      
      const encryptedData = this.encrypt(JSON.stringify(secretsData));
      const secretsFile = path.join(this.secretsPath, 'secrets.enc');
      
      fs.writeFileSync(secretsFile, JSON.stringify(encryptedData), 'utf8');
    } catch (error) {
      console.error('❌ Failed to save secrets:', error);
    }
  }

  private addAuditEntry(secretId: string, action: SecretAuditEntry['action'], metadata?: any): void {
    const entry: SecretAuditEntry = {
      id: crypto.randomUUID(),
      secretId,
      action,
      timestamp: new Date(),
      source: 'secret-manager-agent',
      metadata
    };
    
    this.auditLog.push(entry);
    
    // Manter apenas últimas 1000 entradas em memória
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
  }

  private startRotationMonitoring(): void {
    // Verificar rotação a cada hora
    setInterval(() => {
      this.checkExpiringSecrets();
    }, 3600000);
    
    // Verificação inicial após 1 minuto
    setTimeout(() => {
      this.checkExpiringSecrets();
    }, 60000);
  }

  private checkExpiringSecrets(): void {
    const now = new Date();
    const alertThreshold = 7 * 24 * 60 * 60 * 1000; // 7 dias
    
    this.secrets.forEach((secret) => {
      if (secret.expiresAt) {
        const timeToExpiry = secret.expiresAt.getTime() - now.getTime();
        
        if (timeToExpiry <= 0) {
          console.log(`🚨 Secret expired: ${secret.name}`);
          if (secret.rotationPolicy?.autoRotate) {
            this.autoRotateSecret(secret.id);
          }
        } else if (timeToExpiry <= alertThreshold) {
          console.log(`⚠️ Secret expiring soon: ${secret.name} (${Math.ceil(timeToExpiry / (24 * 60 * 60 * 1000))} days)`);
        }
      }
    });
  }

  private async autoRotateSecret(secretId: string): Promise<void> {
    try {
      const secret = this.secrets.get(secretId);
      if (!secret) return;
      
      console.log(`🔄 Auto-rotating secret: ${secret.name}`);
      
      const newValue = this.generateSecretValue(secret.type);
      await this.updateSecret(secretId, { value: newValue });
      
      this.addAuditEntry(secretId, 'rotated', { reason: 'auto-rotation' });
      console.log(`✅ Secret auto-rotated: ${secret.name}`);
    } catch (error) {
      console.error(`❌ Failed to auto-rotate secret ${secretId}:`, error);
    }
  }

  private generateSecretValue(type: SecretType): string {
    switch (type) {
      case 'api_key':
        return 'sk_' + crypto.randomBytes(32).toString('hex');
      
      case 'jwt_secret':
        return crypto.randomBytes(64).toString('base64url');
      
      case 'encryption_key':
        return crypto.randomBytes(32).toString('hex');
      
      case 'webhook_secret':
        return 'whsec_' + crypto.randomBytes(32).toString('base64url');
      
      case 'oauth_token':
        return 'at_' + crypto.randomBytes(32).toString('base64url');
      
      default:
        return crypto.randomBytes(32).toString('hex');
    }
  }

  // Public API Methods
  async createSecret(data: {
    name: string;
    type: SecretType;
    value?: string;
    metadata?: SecretMetadata;
    rotationPolicy?: RotationPolicy;
  }): Promise<string> {
    const secretId = crypto.randomUUID();
    const now = new Date();
    
    const secret: Secret = {
      id: secretId,
      name: data.name,
      type: data.type,
      value: data.value || this.generateSecretValue(data.type),
      metadata: {
        accessCount: 0,
        ...data.metadata
      },
      createdAt: now,
      updatedAt: now,
      rotationPolicy: data.rotationPolicy || {
        enabled: this.policy.rotation.mandatoryTypes.includes(data.type),
        intervalDays: this.policy.rotation.defaultDays
      }
    };
    
    // Definir expiração se rotação está habilitada
    if (secret.rotationPolicy?.enabled) {
      secret.expiresAt = new Date(now.getTime() + (secret.rotationPolicy.intervalDays * 24 * 60 * 60 * 1000));
    }
    
    this.secrets.set(secretId, secret);
    this.saveEncryptedSecrets();
    
    this.addAuditEntry(secretId, 'created', { type: data.type });
    
    console.log(`🔐 Secret created: ${data.name} (${data.type})`);
    return secretId;
  }

  async getSecret(secretId: string, source?: string): Promise<string | null> {
    try {
      const secret = this.secrets.get(secretId);
      if (!secret) {
        return null;
      }
      
      // Verificar se expirou
      if (secret.expiresAt && secret.expiresAt < new Date()) {
        console.log(`🚨 Attempted access to expired secret: ${secret.name}`);
        return null;
      }
      
      // Atualizar estatísticas de acesso
      secret.metadata.lastAccessedAt = new Date();
      secret.metadata.accessCount = (secret.metadata.accessCount || 0) + 1;
      secret.updatedAt = new Date();
      
      this.saveEncryptedSecrets();
      this.addAuditEntry(secretId, 'accessed', { source });
      
      return secret.value;
    } catch (error) {
      console.error(`❌ Failed to retrieve secret ${secretId}:`, error);
      return null;
    }
  }

  async updateSecret(secretId: string, updates: {
    value?: string;
    metadata?: Partial<SecretMetadata>;
    rotationPolicy?: RotationPolicy;
  }): Promise<boolean> {
    try {
      const secret = this.secrets.get(secretId);
      if (!secret) {
        return false;
      }
      
      if (updates.value) {
        secret.value = updates.value;
      }
      
      if (updates.metadata) {
        secret.metadata = { ...secret.metadata, ...updates.metadata };
      }
      
      if (updates.rotationPolicy) {
        secret.rotationPolicy = updates.rotationPolicy;
        
        // Atualizar expiração se necessário
        if (updates.rotationPolicy.enabled) {
          secret.expiresAt = new Date(Date.now() + (updates.rotationPolicy.intervalDays * 24 * 60 * 60 * 1000));
        } else {
          secret.expiresAt = undefined;
        }
      }
      
      secret.updatedAt = new Date();
      this.saveEncryptedSecrets();
      
      this.addAuditEntry(secretId, 'updated');
      
      console.log(`🔄 Secret updated: ${secret.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to update secret ${secretId}:`, error);
      return false;
    }
  }

  async deleteSecret(secretId: string): Promise<boolean> {
    try {
      const secret = this.secrets.get(secretId);
      if (!secret) {
        return false;
      }
      
      this.secrets.delete(secretId);
      this.saveEncryptedSecrets();
      
      this.addAuditEntry(secretId, 'deleted', { name: secret.name });
      
      console.log(`🗑️ Secret deleted: ${secret.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete secret ${secretId}:`, error);
      return false;
    }
  }

  listSecrets(filter?: {
    type?: SecretType;
    service?: string;
    environment?: string;
  }): Array<Omit<Secret, 'value'>> {
    const secrets = Array.from(this.secrets.values());
    
    return secrets
      .filter(secret => {
        if (filter?.type && secret.type !== filter.type) return false;
        if (filter?.service && secret.metadata.service !== filter.service) return false;
        if (filter?.environment && secret.metadata.environment !== filter.environment) return false;
        return true;
      })
      .map(({ value, ...secret }) => secret);
  }

  getSecretByName(name: string): string | null {
    for (const secret of this.secrets.values()) {
      if (secret.name === name) {
        return secret.id;
      }
    }
    return null;
  }

  // Auto-configure common secrets
  async autoConfigureSecrets(): Promise<void> {
    console.log('🔄 Auto-configuring common secrets...');
    
    const commonSecrets = [
      {
        name: 'torre-suprema-jwt-secret',
        type: 'jwt_secret' as SecretType,
        metadata: {
          service: 'torre-suprema',
          environment: process.env.NODE_ENV || 'development',
          description: 'JWT signing secret for Torre Suprema authentication'
        }
      },
      {
        name: 'torre-suprema-encryption-key',
        type: 'encryption_key' as SecretType,
        metadata: {
          service: 'torre-suprema',
          environment: process.env.NODE_ENV || 'development',
          description: 'Master encryption key for Torre Suprema data'
        }
      },
      {
        name: 'webhook-verification-secret',
        type: 'webhook_secret' as SecretType,
        metadata: {
          service: 'torre-suprema',
          environment: process.env.NODE_ENV || 'development',
          description: 'Webhook signature verification secret'
        }
      }
    ];
    
    for (const secretConfig of commonSecrets) {
      const existing = this.getSecretByName(secretConfig.name);
      if (!existing) {
        await this.createSecret(secretConfig);
      }
    }
    
    console.log('✅ Auto-configuration completed');
  }

  // Integration with environment variables
  async syncWithEnvironment(): Promise<void> {
    console.log('🔄 Syncing secrets with environment variables...');
    
    const envMappings = [
      { env: 'JWT_SECRET', secretName: 'torre-suprema-jwt-secret' },
      { env: 'ENCRYPTION_KEY', secretName: 'torre-suprema-encryption-key' },
      { env: 'WEBHOOK_SECRET', secretName: 'webhook-verification-secret' }
    ];
    
    for (const mapping of envMappings) {
      const secretId = this.getSecretByName(mapping.secretName);
      if (secretId) {
        const secretValue = await this.getSecret(secretId, 'env-sync');
        if (secretValue) {
          process.env[mapping.env] = secretValue;
        }
      }
    }
    
    console.log('✅ Environment sync completed');
  }

  // Audit and Security
  getAuditLog(filter?: {
    secretId?: string;
    action?: SecretAuditEntry['action'];
    since?: Date;
  }): SecretAuditEntry[] {
    return this.auditLog.filter(entry => {
      if (filter?.secretId && entry.secretId !== filter.secretId) return false;
      if (filter?.action && entry.action !== filter.action) return false;
      if (filter?.since && entry.timestamp < filter.since) return false;
      return true;
    });
  }

  getSecurityMetrics() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentAuditEntries = this.auditLog.filter(entry => entry.timestamp > last24h);
    
    return {
      totalSecrets: this.secrets.size,
      activeSecrets: Array.from(this.secrets.values()).filter(s => !s.expiresAt || s.expiresAt > now).length,
      expiredSecrets: Array.from(this.secrets.values()).filter(s => s.expiresAt && s.expiresAt <= now).length,
      expiringIn7Days: Array.from(this.secrets.values()).filter(s => {
        if (!s.expiresAt) return false;
        const timeToExpiry = s.expiresAt.getTime() - now.getTime();
        return timeToExpiry > 0 && timeToExpiry <= 7 * 24 * 60 * 60 * 1000;
      }).length,
      recentActivity: {
        total: recentAuditEntries.length,
        created: recentAuditEntries.filter(e => e.action === 'created').length,
        accessed: recentAuditEntries.filter(e => e.action === 'accessed').length,
        updated: recentAuditEntries.filter(e => e.action === 'updated').length,
        rotated: recentAuditEntries.filter(e => e.action === 'rotated').length,
        deleted: recentAuditEntries.filter(e => e.action === 'deleted').length
      },
      securityScore: this.calculateSecurityScore()
    };
  }

  private calculateSecurityScore(): number {
    let score = 100;
    const secrets = Array.from(this.secrets.values());
    const now = new Date();
    
    // Penalizar secrets expirados
    const expiredCount = secrets.filter(s => s.expiresAt && s.expiresAt <= now).length;
    score -= expiredCount * 10;
    
    // Penalizar secrets sem rotação
    const noRotationCount = secrets.filter(s => !s.rotationPolicy?.enabled && 
      this.policy.rotation.mandatoryTypes.includes(s.type)).length;
    score -= noRotationCount * 15;
    
    // Penalizar secrets muito antigos
    const oldSecretsCount = secrets.filter(s => {
      const age = now.getTime() - s.updatedAt.getTime();
      return age > 180 * 24 * 60 * 60 * 1000; // 6 meses
    }).length;
    score -= oldSecretsCount * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  // TorreAgent implementation
  async processTask(task: any): Promise<any> {
    try {
      switch (task.action) {
        case 'create_secret':
          return await this.createSecret(task.data);
        
        case 'get_secret':
          return await this.getSecret(task.data.id, task.data.source);
        
        case 'update_secret':
          return await this.updateSecret(task.data.id, task.data.updates);
        
        case 'delete_secret':
          return await this.deleteSecret(task.data.id);
        
        case 'list_secrets':
          return this.listSecrets(task.data.filter);
        
        case 'auto_configure':
          await this.autoConfigureSecrets();
          return { success: true };
        
        case 'sync_environment':
          await this.syncWithEnvironment();
          return { success: true };
        
        case 'security_metrics':
          return this.getSecurityMetrics();
        
        case 'audit_log':
          return this.getAuditLog(task.data.filter);
        
        default:
          throw new Error(`Unknown task action: ${task.action}`);
      }
    } catch (error: any) {
      console.error(`❌ Secret Manager Agent task failed:`, error);
      throw error;
    }
  }

  getStatus() {
    const metrics = this.getSecurityMetrics();
    
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      status: 'active',
      metrics,
      capabilities: [
        'Secure secret storage',
        'Automatic rotation',
        'Audit logging',
        'Environment sync',
        'Auto-configuration'
      ]
    };
  }
}

// Export singleton instance
export const secretManagerAgent = new SecretManagerAgent();