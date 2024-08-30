import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FlightModule } from 'src/flight/flight.module';

@Module({
  imports: [FlightModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
