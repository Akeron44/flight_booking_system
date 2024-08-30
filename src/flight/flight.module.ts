import { Module } from '@nestjs/common';
import { FlightService } from './flight.service';
import { Flight } from './entities/flight.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirplaneModule } from 'src/airplane/airplane.module';

@Module({
  imports: [TypeOrmModule.forFeature([Flight]), AirplaneModule],
  providers: [FlightService],
  exports: [FlightService],
})
export class FlightModule {}
