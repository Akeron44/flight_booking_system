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

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('/flight')
  createFlight(@Body() body: CreateFlightDto) {
    return this.adminService.createFlight(body);
  }

  @Get('flight')
  async getAllFlights(@Query() query: FlightSearchDto) {
    return this.adminService.getAllFlights(query);
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

  @Get('/previous/flight')
  getPreviousFlightsNumber() {
    return this.adminService.getPreviousFlightsNumber();
  }

  @Get('/airplanes')
  getAvailableAirplanes(@Query() query: FlightSearchDto) {
    return this.adminService.getAvailableAirplanes(query);
  }

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
