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
      htmlContent: `<p>Para redefinir sua senha, clique no link abaixo:</p><p><a href=\"${resetLink}\">${resetLink}</a></p>`,
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
}
