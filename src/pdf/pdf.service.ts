import { Injectable } from '@nestjs/common';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Injectable()
export class PdfService {
  private pdfMakeInstance;

  constructor() {
    this.pdfMakeInstance = pdfMake;
    this.pdfMakeInstance.vfs = pdfFonts.pdfMake.vfs;
  }

  async generateBookingPdf(bookingData: any): Promise<Buffer> {
    const documentDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Booking Receipt', style: 'header' },
        { text: `Booking ID: ${bookingData.id}`, style: 'subheader' },
        {
          text: `Flight: ${bookingData.flight.id}`,
          style: 'subheader',
        },
        { text: `User: ${bookingData.user.id}`, style: 'subheader' },
        { text: `Seat: ${bookingData.seat}`, style: 'subheader' },
        {
          text: `Total Price: ${bookingData.totalPrice}  ALL`,
          style: 'subheader',
        },
        {
          text: `Booking Status: ${bookingData.status}`,
          style: 'subheader',
        },
        {
          text: `Date: ${new Date().toLocaleDateString()}`,
          style: 'subheader',
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          margin: [0, 10, 0, 5],
        },
      },
    };

    return new Promise((resolve, reject) => {
      const pdfDocGenerator =
        this.pdfMakeInstance.createPdf(documentDefinition);
      pdfDocGenerator.getBuffer((buffer, err) => {
        if (err) {
          reject(err);
        } else {
          resolve(Buffer.from(buffer));
        }
      });
    });
  }
}
