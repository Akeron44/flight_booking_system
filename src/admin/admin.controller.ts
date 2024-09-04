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
import { FlightSearchDto } from 'src/flight/dtos/flight-search.dto';
import { LimitiedFlightSearchDto } from 'src/flight/dtos/limited-flight-search.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { DetailedFlightDto } from 'src/flight/dtos/flight-details.dto';
import { BookingDto } from 'src/booking/dtos/booking.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Serialize(DetailedFlightDto)
  @Post('/flights')
  createFlight(@Body() body: CreateFlightDto) {
    return this.adminService.createFlight(body);
  }

  @Serialize(DetailedFlightDto)
  @Get('flights')
  async getFlights(@Query() query: FlightSearchDto) {
    return this.adminService.getFlights(query);
  }

  @Serialize(DetailedFlightDto)
  @Get('/flights/:flightId')
  getFlight(@Param('flightId') id: string) {
    return this.adminService.getFlight(parseInt(id));
  }

  @Serialize(DetailedFlightDto)
  @Patch('/flights/:flightId')
  updateFlight(@Param('flightId') id: string, @Body() body: UpdateFlightDto) {
    return this.adminService.updateFlight(parseInt(id), body);
  }

  @Delete('/flights/:flightId')
  deleteFlight(@Param('flightId') id: string) {
    return this.adminService.deleteFlight(parseInt(id));
  }

  @Get('/previous/flights')
  getPreviousFlightsNumber() {
    return this.adminService.getPreviousFlightsNumber();
  }

  @Get('/airplanes')
  getAvailableAirplanes(@Query() query: any) {
    return this.adminService.getAvailableAirplanes(query);
  }

  @Serialize(BookingDto)
  @Get('/bookings')
  getBookings(@Session() session: any) {
    return this.adminService.getBookings(session.userId);
  }

  @Patch('/bookings/:bookingId/:response')
  updateBookingStatus(
    @Param('bookingId') bookingId: string,
    @Param('response') response: string,
  ) {
    return this.adminService.updateBookingStatus(parseInt(bookingId), response);
  }

  @Get('/revenue')
  getRevenue() {
    return this.adminService.getRevenue();
  }

  @Get('/passangers')
  getPassangersNumber() {
    return this.adminService.getPassangersNumber();
  }

  @Get('/passangers/booking')
  getTopUsersByBookings() {
    return this.adminService.getTopUsersByBookings();
  }

  @Get('/passangers/credit')
  getTopUsersByExpenses() {
    return this.adminService.getTopUsersByExpenses();
  }
}
