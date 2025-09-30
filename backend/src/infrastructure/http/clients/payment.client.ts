export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
}

export interface PaymentResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  paymentUrl?: string;
}

export class PaymentClient {
  constructor(private baseUrl: string, private apiKey: string) {}

  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!response.ok) {
        throw new Error(`Payment service error: ${response.statusText}`);
      }

      return await response.json() as Promise<PaymentResponse>;
    } catch (error) {
      throw new Error(`Failed to create payment: ${error}`);
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Payment service error: ${response.statusText}`);
      }

      return await response.json() as Promise<PaymentResponse>;
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error}`);
    }
  }
}
