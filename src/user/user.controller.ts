import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthService } from './auth/auth.service';
import { SigninUserDto } from './dtos/signin-user.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserService } from './user.service';
import { FlightQueryDto } from './dtos/flight-query.dto';
import { CreateBookingDto } from 'src/booking/dtos/create-booking.dto';
import { BookingDto } from 'src/booking/dtos/booking.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { FlightDto } from 'src/flight/dtos/flight.dot';
import { UserDto } from './dtos/user.dto';

@Controller('user')
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Serialize(UserDto)
  @Post('/signup')
  async signup(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body);
    session.userId = user.id;

    return user;
  }

  @Serialize(UserDto)
  @Post('/signin')
  async signin(@Body() body: SigninUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;

    return user;
  }

  @Post('/signout')
  @UseGuards(AuthGuard)
  singout(@Session() session: any) {
    session.userId = null;
  }

  @Serialize(UserDto)
  @Patch()
  @UseGuards(AuthGuard)
  updateUserCredit(@Session() session: any, @Body() body: UpdateUserDto) {
    return this.userService.addUserCredit(session.userId, body.extraCredit);
  }

  @Serialize(FlightDto)
  @Get('/flights')
  @UseGuards(AuthGuard)
  async getUserFlights(
    @Query() query: FlightQueryDto,
    @Session() session: any,
  ) {
    return this.userService.getFlights(query, session.userId);
  }

  @Get('/flights/:flightId/seats')
  @UseGuards(AuthGuard)
  async getAvailableSeats(@Param('flightId') flightId: string) {
    return this.userService.getAvailableSeats(parseInt(flightId));
  }

  @Serialize(BookingDto)
  @Post('/booking')
  @UseGuards(AuthGuard)
  async createBooking(@Body() body: CreateBookingDto, @Session() session: any) {
    return this.userService.createBooking(body, session.userId);
  }

  @Serialize(BookingDto)
  @Get('/booking')
  @UseGuards(AuthGuard)
  getBookings(@Session() session: any) {
    return this.userService.getBookings(session.userId);
  }

  @Get('/booking/:bookingId')
  @UseGuards(AuthGuard)
  async getApprovedBooking(
    @Session() session: any,
    @Param('bookingId') bookingId: string,
    @Res() response: any,
  ) {
    const pdfBuffer = await this.userService.getApprovedBooking(
      session.userId,
      parseInt(bookingId),
    );

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=booking_receipt.pdf`,
    );
    response.status(200);

    return response.send(pdfBuffer);
  }
}
