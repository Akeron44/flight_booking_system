import { Injectable } from '@nestjs/common';
import { BookingService } from 'src/booking/booking.service';
import { CreateFlightDto } from 'src/flight/dtos/create-flight.dto';
import { UpdateFlightDto } from 'src/flight/dtos/update-flight.dto';
import { FlightService } from 'src/flight/flight.service';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/email/email.service';
import { FlightSearchDto } from 'src/flight/dtos/flight-search.dto';
import { Airplane } from 'src/airplane/entities/airplane.entity';
import { AirplaneService } from 'src/airplane/airplane.service';
import { LimitiedFlightSearchDto } from 'src/flight/dtos/limited-flight-search.dto';

@Injectable()
export class AdminService {
  constructor(
    private flightService: FlightService,
    private bookingService: BookingService,
    private userService: UserService,
    private emailService: EmailService,
    private airplaneService: AirplaneService,
  ) {}

  createFlight(body: CreateFlightDto) {
    return this.flightService.createFlight(body);
  }

  getFlights(query: FlightSearchDto) {
    return this.flightService.getFlights(query);
  }

  getFlight(id: number) {
    if (!id) return null;

    return this.flightService.getFlight(id);
  }

  updateFlight(id: number, body: UpdateFlightDto) {
    return this.flightService.updateFlight(id, body);
  }

  async deleteFlight(id: number) {
    if (!id) return null;

    await this.flightService.findOne({ id });

    const deletedBookings = await this.bookingService.getDeletedBookings(id);
    await this.bookingService.deleteBookings(id);
    await this.flightService.deleteFlight(id);

    if (deletedBookings && deletedBookings.length > 0) {
      const affectedUsers = Object.values(
        deletedBookings.reduce((acc, booking): object => {
          if (!acc[booking.id]) {
            acc[booking.id] = { id: booking.user.id, price: 0 };
          }

          if (booking.status !== 'rejected') {
            acc[booking.id].price += booking.totalPrice;
          }
          return acc;
        }, {}),
      );

      await this.userService.updateUserCredit(affectedUsers);
    }

    return `Flight with id: ${id} and its corresponsding bookings were deleted.`;
  }

  getPreviousFlightsNumber() {
    return this.flightService.getPreviousFlightsNumber();
  }

  getBookings(id: number) {
    return this.userService.getBookings(id);
  }

  async updateBookingStatus(bookingId: number, response: string) {
    if (!bookingId && !response) return null;

    const booking = await this.bookingService.updateBookingStatus(
      bookingId,
      response,
    );

    if (booking.status === 'rejected') {
      this.userService.addUserCredit(booking.user.id, booking.totalPrice);
      this.flightService.updateSeats(booking.flight.id, booking.seat, 'add');

      await this.emailService.sendEmail(
        booking.user.email,
        booking.user.firstName,
        'rejected',
        `We are sorry to inform you, that your booking on ${booking.flight.departure} from ${booking.flight.origin} 
        to ${booking.flight.destination} has been rejected.`,
      );

      return `The booking with id ${booking.id} was rejected and the credit was returned to user with id ${booking.user.id}.`;
    }

    await this.emailService.sendEmail(
      booking.user.email,
      booking.user.firstName,
      'approved',
      `Your booking on ${booking.flight.departure} 
      from ${booking.flight.origin} to ${booking.flight.destination} has been approved.`,
    );

    return `The booking with id ${booking.id} was approved.`;
  }

  async getAvailableAirplanes(query: any) {
    const flights = await this.flightService.getFlights(query);

    const ids = flights.map((flight) => flight.airplane.id);
    const uniqueExludedIds = [...new Set(ids)];

    return this.airplaneService.getAvailableAirplanes(uniqueExludedIds);
  }

  getRevenue() {
    return this.bookingService.getBookingsRevenue();
  }

  getPassangersNumber() {
    return this.userService.getPassangersNumber();
  }

  getTopUsersByBookings() {
    return this.bookingService.getTopUsersByBookings();
  }

  getTopUsersByExpenses() {
    return this.bookingService.getTopUsersByExpenses();
  }
}
