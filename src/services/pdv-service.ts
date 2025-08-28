import { Injectable, Logger } from '@nestjs/common';
import { MCPIntegrationManager } from '../mcp-integrations/mcp-integration-manager';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleRequest {
  items: SaleItem[];
  paymentMethod: 'credit' | 'debit' | 'pix' | 'cashless' | 'cash';
  customerCpf?: string;
  discountPercent?: number;
}

export interface SaleResponse {
  success: boolean;
  transactionId?: string;
  receiptNumber?: string;
  totalAmount: number;
  message: string;
  timestamp: Date;
}

@Injectable()
export class PDVService {
  private readonly logger = new Logger(PDVService.name);

  constructor(private mcpManager: MCPIntegrationManager) {}

  async processSale(saleRequest: SaleRequest): Promise<SaleResponse> {
    this.logger.log(`💳 Processing sale with ${saleRequest.items.length} items`);
    
    try {
      const totalAmount = this.calculateTotal(saleRequest.items, saleRequest.discountPercent);
      
      const stockCheck = await this.checkStock(saleRequest.items);
      if (!stockCheck.available) {
        return {
          success: false,
          totalAmount,
          message: `Produto indisponível: ${stockCheck.unavailableItems.join(', ')}`,
          timestamp: new Date()
        };
      }

      const paymentResult = await this.processPayment(saleRequest.paymentMethod, totalAmount, saleRequest.customerCpf);
      
      if (paymentResult.success) {
        await this.updateInventory(saleRequest.items);
        const receiptResult = await this.printReceipt(saleRequest, paymentResult.transactionId, totalAmount);
        
        return {
          success: true,
          transactionId: paymentResult.transactionId,
          receiptNumber: receiptResult.receiptNumber,
          totalAmount,
          message: 'Venda realizada com sucesso!',
          timestamp: new Date()
        };
      }
      
      return {
        success: false,
        totalAmount,
        message: paymentResult.message || 'Falha no processamento do pagamento',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('❌ Error processing sale:', error);
      return {
        success: false,
        totalAmount: 0,
        message: 'Erro interno no sistema de vendas',
        timestamp: new Date()
      };
    }
  }

  private calculateTotal(items: SaleItem[], discountPercent: number = 0): number {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = subtotal * (discountPercent / 100);
    return subtotal - discount;
  }

  private async checkStock(items: SaleItem[]): Promise<{ available: boolean; unavailableItems: string[] }> {
    try {
      const stockChecks = await Promise.all(
        items.map(item => 
          this.mcpManager.executeOperation(
            'inventory_management_mcp',
            'tool',
            'check_stock',
            { productId: item.productId, quantity: item.quantity }
          )
        )
      );

      const unavailableItems = items
        .filter((item, index) => !stockChecks[index]?.available)
        .map(item => item.productName);

      return {
        available: unavailableItems.length === 0,
        unavailableItems
      };
    } catch (error) {
      this.logger.error('❌ Error checking stock:', error);
      return { available: false, unavailableItems: ['Erro na verificação de estoque'] };
    }
  }

  private async processPayment(paymentMethod: string, amount: number, customerCpf?: string): Promise<any> {
    try {
      if (paymentMethod === 'cashless') {
        return await this.mcpManager.executeOperation(
          'cashless_integration_mcp',
          'tool',
          'process_cashless_payment',
          { amount, customerCpf }
        );
      } else {
        return await this.mcpManager.executeOperation(
          'payment_processor_mcp',
          'tool',
          'process_payment',
          { 
            amount, 
            paymentMethod, 
            customerCpf 
          }
        );
      }
    } catch (error) {
      this.logger.error('❌ Error processing payment:', error);
      return { success: false, message: 'Erro no processamento do pagamento' };
    }
  }

  private async updateInventory(items: SaleItem[]): Promise<void> {
    try {
      const updateOperations = items.map(item => ({
        serverId: 'inventory_management_mcp',
        type: 'tool' as const,
        operation: 'update_stock',
        parameters: { 
          productId: item.productId, 
          quantity: -item.quantity 
        }
      }));

      await this.mcpManager.executeBatchOperations(updateOperations);
    } catch (error) {
      this.logger.error('❌ Error updating inventory:', error);
    }
  }

  private async printReceipt(saleRequest: SaleRequest, transactionId: string, totalAmount: number): Promise<any> {
    try {
      const receiptData = {
        transactionId,
        items: saleRequest.items,
        totalAmount,
        paymentMethod: saleRequest.paymentMethod,
        customerCpf: saleRequest.customerCpf,
        timestamp: new Date()
      };

      return await this.mcpManager.executeOperation(
        'fiscal_printer_mcp',
        'tool',
        'print_receipt',
        receiptData
      );
    } catch (error) {
      this.logger.error('❌ Error printing receipt:', error);
      return { receiptNumber: 'ERROR' };
    }
  }

  async loadCashlessCard(cardId: string, amount: number): Promise<any> {
    try {
      return await this.mcpManager.executeOperation(
        'cashless_integration_mcp',
        'tool',
        'load_cashless_card',
        { cardId, amount }
      );
    } catch (error) {
      this.logger.error('❌ Error loading cashless card:', error);
      return { success: false, message: 'Erro ao carregar cartão cashless' };
    }
  }
}
