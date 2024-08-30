import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateFlightDto } from 'src/flight/dtos/create-flight.dto';
import { FlightService } from 'src/flight/flight.service';
import { AdminGuard } from 'src/guards/admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private flightService: FlightService) {}

  @Post('/flight')
  createFlight(@Body() body: CreateFlightDto) {
    return this.flightService.createFlight(body);
  }
}
