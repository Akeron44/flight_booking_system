import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { FlightModule } from './flight/flight.module';
import { BookingModule } from './booking/booking.module';
import { AirplaneModule } from './airplane/airplane.module';
import { EmailModule } from './email/email.module';
import { PdfModule } from './pdf/pdf.module';

const cookieSession = require('cookie-session');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
    AdminModule,
    FlightModule,
    BookingModule,
    AirplaneModule,
    EmailModule,
    PdfModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: ['flight_booking_system_cookie_key_123'],
        }),
      )
      .forRoutes('*');
  }
}
