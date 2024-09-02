import { Injectable } from '@nestjs/common';
import { BookingService } from 'src/booking/booking.service';
import { CreateFlightDto } from 'src/flight/dtos/create-flight.dto';
import { UpdateFlightDto } from 'src/flight/dtos/update-flight.dto';
import { FlightService } from 'src/flight/flight.service';
import { checkIfFlightExist } from 'src/flight/helper/checkFlight';
import { FlightQueryDto } from 'src/user/dtos/flight-query.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdminService {
  constructor(
    private flightService: FlightService,
    private bookingService: BookingService,
    private userService: UserService,
  ) {}

  createFlight(body: CreateFlightDto) {
    return this.flightService.createFlight(body);
  }

  getFlights(query: FlightQueryDto, userId: number) {
    return this.userService.getFlights(query, userId);
  }

  getFlight(id: number) {
    return this.flightService.getFlight(id);
  }

  updateFlight(id: number, body: UpdateFlightDto) {
    return this.flightService.updateFlight(id, body);
  }

  async deleteFlight(id: number) {
    if (!id) return null;

    const deletedFlight = await this.flightService.findOne({ id });
    checkIfFlightExist(deletedFlight);

    const deletedBookings = await this.bookingService.getDeletedBookings(id);
    await this.bookingService.deleteBookings(id);
    await this.flightService.deleteFlight(id);

    const affectedUsers = Object.values(
      deletedBookings.reduce((acc, booking): object => {
        if (!acc[booking.id]) {
          acc[booking.id] = { id: booking.user.id, price: 0 };
        }
        acc[booking.id].price += booking.totalPrice;
        return acc;
      }, {}),
    );

    await this.userService.updateUserCredit(affectedUsers);

    return `Flight with id: ${id} and its corresponsding bookings were deleted.`;
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
      return `The booking with id ${booking.id} was rejected and the credit was returned to user with id ${booking.user.id}.`;
    }

    return `The booking with id ${booking.id} was approved.`;
  }
}
