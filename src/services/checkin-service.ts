import { Injectable, Logger } from '@nestjs/common';
import { MCPIntegrationManager } from '../mcp-integrations/mcp-integration-manager';

export interface CheckInRequest {
  qrCode?: string;
  imageData?: string;
  guestId?: string;
  vipCode?: string;
}

export interface CheckInResponse {
  success: boolean;
  guestName?: string;
  vipStatus?: boolean;
  message: string;
  timestamp: Date;
}

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(private mcpManager: MCPIntegrationManager) {}

  async processQRCheckIn(qrCode: string): Promise<CheckInResponse> {
    this.logger.log(`🎫 Processing QR check-in: ${qrCode}`);
    
    try {
      const operations = [
        {
          serverId: 'qr_scanner_mcp',
          type: 'tool' as const,
          operation: 'scan_qr_code',
          parameters: { qrCode }
        },
        {
          serverId: 'qr_scanner_mcp',
          type: 'tool' as const,
          operation: 'validate_ticket',
          parameters: { qrCode }
        },
        {
          serverId: 'capacity_control_mcp',
          type: 'tool' as const,
          operation: 'check_capacity',
          parameters: {}
        }
      ];

      const results = await this.mcpManager.executeBatchOperations(operations);
      
      if (results[0]?.success && results[1]?.success) {
        await this.updateCapacity(1);
        
        return {
          success: true,
          guestName: results[1]?.guestName || 'Convidado',
          vipStatus: results[1]?.vipStatus || false,
          message: 'Check-in realizado com sucesso!',
          timestamp: new Date()
        };
      }
      
      return {
        success: false,
        message: 'QR Code inválido ou expirado',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('❌ Error processing QR check-in:', error);
      return {
        success: false,
        message: 'Erro interno no sistema de check-in',
        timestamp: new Date()
      };
    }
  }

  async processFacialRecognition(imageData: string): Promise<CheckInResponse> {
    this.logger.log('👤 Processing facial recognition check-in');
    
    try {
      const recognitionResult = await this.mcpManager.executeOperation(
        'facial_recognition_mcp',
        'tool',
        'recognize_face',
        { imageData }
      );

      if (recognitionResult?.success) {
        const vipStatus = await this.checkVIPStatus(recognitionResult.guestId);
        await this.updateCapacity(1);
        
        return {
          success: true,
          guestName: recognitionResult.guestName,
          vipStatus: vipStatus?.isVip || false,
          message: vipStatus?.isVip ? 'VIP Check-in realizado!' : 'Check-in realizado com sucesso!',
          timestamp: new Date()
        };
      }
      
      return {
        success: false,
        message: 'Rosto não reconhecido',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('❌ Error processing facial recognition:', error);
      return {
        success: false,
        message: 'Erro no sistema de reconhecimento facial',
        timestamp: new Date()
      };
    }
  }

  async checkVIPStatus(guestId: string): Promise<any> {
    try {
      return await this.mcpManager.executeOperation(
        'vip_management_mcp',
        'tool',
        'check_vip_status',
        { guestId }
      );
    } catch (error) {
      this.logger.error('❌ Error checking VIP status:', error);
      return { isVip: false };
    }
  }

  async updateCapacity(increment: number): Promise<void> {
    try {
      await this.mcpManager.executeOperation(
        'capacity_control_mcp',
        'tool',
        'update_capacity',
        { increment }
      );
    } catch (error) {
      this.logger.error('❌ Error updating capacity:', error);
    }
  }

  async getCurrentCapacity(): Promise<number> {
    try {
      const result = await this.mcpManager.executeOperation(
        'capacity_control_mcp',
        'tool',
        'check_capacity',
        {}
      );
      return result?.currentCapacity || 0;
    } catch (error) {
      this.logger.error('❌ Error getting current capacity:', error);
      return 0;
    }
  }
}
