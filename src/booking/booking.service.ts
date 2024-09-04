import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking } from './entities/Booking.entity';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FlightService } from 'src/flight/flight.service';
import { checkIfResponseIsValid } from './helper/checkResponse';
import { Flight } from 'src/flight/entities/flight.entity';
import { validateReturnFlight } from './helper/validateReturnFlight';
import { checkIfFlightExist } from 'src/flight/helper/checkFlight';
import { checkAndGetSeats } from './helper/checkAndGetSeats';
import { generateTotalPrice } from './helper/generateTotalPrice';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    private flightService: FlightService,
  ) {}

  async findOne(id: number) {
    if (!id) return null;

    const booking = await this.bookingRepo.findOneBy({ id });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    return booking;
  }

  async createBooking(bookingObj: CreateBookingDto, user: User) {
    const { flightId, returnFlightId, ...bookingRequest } = bookingObj;

    const flight = await this.flightService.findOne({
      id: flightId,
    });

    checkIfFlightExist(flight);

    const returnFlight = returnFlightId
      ? await this.flightService.findOne({
          id: returnFlightId,
        })
      : null;

    const totalPrice = generateTotalPrice({
      numOfPassangers: bookingRequest.numOfPassangers,
      seat: bookingRequest.seat || [],
      returnFlightSeat: bookingRequest.returnFlightSeat || [],
      returnFlightId,
      flightPrice: flight.price,
      returnFlightPrice: returnFlight ? returnFlight.price : null,
    });

    bookingRequest.seat = checkAndGetSeats(
      {
        seats: bookingRequest.seat,
        numOfPassangers: bookingRequest.numOfPassangers,
      },
      flight,
    );

    if (user.credit < totalPrice) {
      throw new BadRequestException('Not enough credit.');
    }

    if (returnFlight) {
      checkIfFlightExist(returnFlight);
      validateReturnFlight(flight, returnFlight);

      bookingRequest.returnFlightSeat = checkAndGetSeats(
        {
          seats: bookingRequest.returnFlightSeat,
          numOfPassangers: bookingRequest.numOfPassangers,
        },
        returnFlight,
      );
    }

    const newBooking = this.bookingRepo.create({
      ...bookingRequest,
      totalPrice,
    });
    newBooking.user = user;
    newBooking.flight = flight;

    if (returnFlight) {
      checkIfFlightExist(returnFlight);

      newBooking.returnFlight = returnFlight;

      await this.flightService.updateSeats(
        returnFlightId,
        newBooking.returnFlightSeat,
        'remove',
      );
    }

    await this.flightService.updateSeats(
      flightId,
      bookingRequest.seat,
      'remove',
    );

    return this.bookingRepo.save(newBooking);
  }

  async getBookings(user: User) {
    const queryBuilder = this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.flight', 'flight')
      .leftJoinAndSelect('booking.returnFlight', 'returnFlight')
      .leftJoinAndSelect('booking.user', 'user');

    if (user.isAdmin) {
      const bookings = await queryBuilder.getMany();
      return bookings || [];
    }

    const bookings = await queryBuilder
      .where('booking.user.id = :id', { id: user.id })
      .getMany();

    return bookings || [];
  }

  async getDeletedBookings(flightId: number) {
    const deletedBookings = await this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.flight', 'flight')
      .leftJoinAndSelect('booking.user', 'user')
      .where('booking.flightId = :flightId', { flightId })
      .getMany();

    return deletedBookings || [];
  }

  async deleteBookings(flightId: number) {
    await this.bookingRepo
      .createQueryBuilder('booking')
      .delete()
      .where('"booking"."flightId" = :flightId', { flightId })
      .orWhere('"booking"."returnFlightId" = :returnFlightId', {
        returnFlightId: flightId,
      })
      .execute();
  }

  async getApprovedBooking(userId: number, bookingId: number) {
    const booking = await this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.flight', 'flight')
      .leftJoinAndSelect('booking.user', 'user')
      .where('booking.id = :id', { id: bookingId })
      .getOne();

    if (booking.user.id !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    if (!booking || booking.status !== 'approved') {
      throw new NotFoundException('You can not download this booking.');
    }

    return booking;
  }

  async updateBookingStatus(id: number, response: string) {
    checkIfResponseIsValid(response);

    const booking = await this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.flight', 'flight')
      .where('booking.id = :id', { id })
      .getOne();

    if (!booking) {
      throw new NotFoundException(
        'Booking with the provided id was not found.',
      );
    }

    if (booking.status !== 'pending') {
      throw new BadRequestException(
        'This booking status has already been updated.',
      );
    }

    const updatedBooking = {
      ...booking,
      status: response,
    };

    return this.bookingRepo.save({
      id: booking.id,
      ...updatedBooking,
    });
  }

  async getBookingsRevenue() {
    const bookings = await this.bookingRepo
      .createQueryBuilder('booking')
      .select('SUM(booking.totalPrice)', 'totalSum')
      .where('booking.status = :status', { status: 'approved' })
      .getRawOne();

    return bookings.totalSum || 0;
  }

  async getTopUsersByBookings() {
    const topUsers = await this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoin('booking.user', 'user')
      .where('booking.status = :status', { status: 'approved' })
      .select('user.id', 'userId')
      .addSelect('user.firstName', 'firstName')
      .addSelect('COUNT(booking.id)', 'bookings')
      .groupBy('user.id')
      .orderBy('bookings', 'DESC')
      .limit(3)
      .getRawMany();

    return topUsers;
  }

  async getTopUsersByExpenses() {
    const topUsers = await this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoin('booking.user', 'user')
      .where('booking.status = :status', { status: 'approved' })
      .select('user.id', 'userId')
      .addSelect('user.firstName', 'firstName')
      .addSelect('SUM(booking.totalPrice)', 'totalSpent')
      .groupBy('user.id')
      .orderBy('SUM(booking.totalPrice)', 'DESC')
      .limit(3)
      .getRawMany();

    return topUsers;
  }
}
