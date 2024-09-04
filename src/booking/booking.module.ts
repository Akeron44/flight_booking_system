import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/Booking.entity';
import { FlightModule } from 'src/flight/flight.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), FlightModule],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
