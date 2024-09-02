import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateFlightDto } from 'src/flight/dtos/create-flight.dto';
import { UpdateFlightDto } from 'src/flight/dtos/update-flight.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { AdminService } from './admin.service';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { BookingDto } from 'src/booking/dtos/booking.dto';
import { FlightQueryDto } from 'src/user/dtos/flight-query.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('/flight')
  createFlight(@Body() body: CreateFlightDto) {
    return this.adminService.createFlight(body);
  }

  @Get('flight')
  async getFlights(@Query() query: FlightQueryDto, @Session() session: any) {
    return this.adminService.getFlights(query, session.userId);
  }

  @Get('/flight/:flightId')
  getFlight(@Param('flightId') id: string) {
    return this.adminService.getFlight(parseInt(id));
  }

  @Patch('/flight/:flightId')
  updateFlight(@Param('flightId') id: string, @Body() body: UpdateFlightDto) {
    return this.adminService.updateFlight(parseInt(id), body);
  }

  @Delete('/flight/:flightId')
  deleteFlight(@Param('flightId') id: string) {
    return this.adminService.deleteFlight(parseInt(id));
  }

  @Serialize(BookingDto)
  @Get('/booking')
  getBookings(@Session() session: any) {
    return this.adminService.getBookings(session.userId);
  }

  @Patch('/booking/:bookingId/:response')
  updateBookingStatus(
    @Param('bookingId') bookingId: string,
    @Param('response') response: string,
  ) {
    return this.adminService.updateBookingStatus(parseInt(bookingId), response);
  }
}
