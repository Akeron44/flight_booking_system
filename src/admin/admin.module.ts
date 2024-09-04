import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FlightModule } from 'src/flight/flight.module';
import { BookingModule } from 'src/booking/booking.module';
import { UserModule } from 'src/user/user.module';
import { EmailModule } from 'src/email/email.module';
import { AirplaneModule } from 'src/airplane/airplane.module';

@Module({
  imports: [
    FlightModule,
    BookingModule,
    UserModule,
    EmailModule,
    AirplaneModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
