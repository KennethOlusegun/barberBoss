import { Injectable } from '@nestjs/common';
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class BrevoService {
  private readonly apiInstance: Brevo.TransactionalEmailsApi;

  constructor() {
    this.apiInstance = new Brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY || '',
    );
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const sendSmtpEmail = {
      to: [{ email: to }],
      subject: 'Redefinição de senha',
      htmlContent: `<p>Para redefinir sua senha, clique no link abaixo:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      sender: { name: 'BarberBoss', email: 'no-reply@barberboss.com' },
    };
    try {
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('[BrevoService] E-mail enviado com sucesso:', response);
    } catch (error) {
      console.error('[BrevoService] Falha ao enviar e-mail:', error);
      throw error;
    }
  }

  /**
   * Envia código de recuperação de senha por email
   */
  async sendRecoveryCodeEmail(to: string, name: string, code: string) {
    const sendSmtpEmail = {
      to: [{ email: to }],
      subject: '🔑 Código de Recuperação - BarberBoss',
      htmlContent: this.getRecoveryEmailTemplate(name, code),
      sender: {
        name: 'BarberBoss',
        email: process.env.BREVO_FROM_EMAIL || 'noreply@barberboss.com',
      },
    };

    try {
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('[BrevoService] Email enviado:', response);
      return response;
    } catch (error) {
      console.error('[BrevoService] Erro ao enviar email:', error);
      throw error;
    }
  }

  /**
   * Template HTML para email de recuperação
   */
  private getRecoveryEmailTemplate(name: string, code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: #3b82f6; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🔑 BarberBoss</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">
        Olá <strong>${name}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #374151; margin: 0 0 30px;">
        Seu código de recuperação de senha é:
      </p>
      
      <!-- Code Box -->
      <div style="background: #f9fafb; border: 2px dashed #3b82f6; border-radius: 8px; padding: 30px; text-align: center; margin: 0 0 30px;">
        <div style="font-size: 48px; font-weight: bold; color: #3b82f6; letter-spacing: 12px; font-family: 'Courier New', monospace;">
          ${code}
        </div>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 20px;">
        ⏰ Este código expira em <strong>15 minutos</strong>.
      </p>
      
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        Se você não solicitou este código, ignore este email. Sua senha permanecerá segura.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
        © 2024 BarberBoss - Gestão de Barbearias
      </p>
    </div>
    
  </div>
</body>
</html>
    `.trim();
  }
}
