import { BadRequestException, Injectable } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(to: string, name: string, subject: string, text: string) {
    if (!to && !subject && !text)
      throw new BadRequestException('Please set all the required fields.');

    const msg = {
      to,
      from: { name: 'GAir', email: 'akeron.allkushi@softup.co' },
      templateId: process.env.TEMPLATE_ID,
      dynamicTemplateData: {
        subject,
        name,
        text,
      },
    };

    await sendgrid.send(msg);
  }
}
