import { Injectable } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { createTransport, type Transporter } from 'nodemailer';

export type Mail = {
  recipient: string;
  content: string;
};

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(readonly config: ConfigModule) {
    this.transporter = createTransport({
      host: this.config.SMTP_HOST,
      port: this.config.SMTP_PORT,
      secure: false,
      auth: {
        user: this.config.SMTP_USER,
        pass: this.config.SMTP_PASS,
      },
    });
  }

  async sendGeneric(extendedEmail: Mail & { title: string }): Promise<void> {
    return this.send({
      recipient: extendedEmail.recipient,
      content: `
        <html>
          <head>
            <title>${extendedEmail.title}</title>
          </head>
          <body>
            ${extendedEmail.content}
          </body>
        </html>
      `.replaceAll(/\n\s*/g, ''),
    });
  }

  async send({ recipient, content }: Mail): Promise<void> {
    try {
      const match = content.match(/<title>(.*?)<\/title>/);
      if (!match) throw new Error('No title found in the email template');
      const derivedSubject = match[1];
      const mailOptions = {
        from: `${this.config.SMTP_FROM} <${this.config.SMTP_USER}>`,
        to: recipient,
        subject: derivedSubject,
        html: content,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
