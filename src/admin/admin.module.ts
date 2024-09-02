import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FlightModule } from 'src/flight/flight.module';
import { BookingModule } from 'src/booking/booking.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [FlightModule, BookingModule, UserModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
