import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking } from './entities/Booking.entity';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FlightService } from 'src/flight/flight.service';
import { allocateRandomSeat } from './helper/allocateRandomSeat';
import { checkIfResponseIsValid } from './helper/checkResponse';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    private flightService: FlightService,
  ) {}

  async findOne(id: number) {
    if (!id) return null;

    const booking = this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .where('booking.id = :id', { id })
      .getOne();

    if (!booking) throw new NotFoundException('Booking not found.');

    return booking;
  }

  async createBooking(bookingObj: CreateBookingDto, user: User) {
    try {
      const flight = await this.flightService.findOne({
        id: bookingObj.flightId,
      });

      if (!flight) {
        throw new NotFoundException('Flight not found.');
      }

      const { flightId, ...bookingRequest } = bookingObj;

      if (bookingRequest.numOfPassangers > flight.seats.length) {
        throw new BadRequestException('Not enough seats left.');
      }

      if (user.credit < bookingRequest.totalPrice) {
        throw new BadRequestException('Not enough credit.');
      }

      if (!bookingRequest.seat || bookingRequest.seat.length === 0) {
        bookingRequest.seat = allocateRandomSeat(
          bookingRequest.numOfPassangers,
          flight.seats,
        );
      } else {
        if (bookingRequest.numOfPassangers !== bookingRequest.seat.length) {
          throw new BadRequestException(
            'Please choose a seat for every passanger.',
          );
        }

        const hasTheSeats = bookingRequest.seat.every((seatsArray) =>
          flight.seats.includes(seatsArray),
        );

        if (!hasTheSeats) {
          throw new BadRequestException('These seats are not available.');
        }
      }

      const newBooking = this.bookingRepo.create(bookingRequest);
      newBooking.user = user;
      newBooking.flight = flight;

      await this.flightService.updateSeats(
        bookingObj.flightId,
        newBooking.seat,
        'remove',
      );

      return this.bookingRepo.save(newBooking);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getBookings(user: User) {
    try {
      const queryBuilder = this.bookingRepo
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.flight', 'flight')
        .leftJoinAndSelect('booking.user', 'user');

      if (user.isAdmin) {
        const bookings = await queryBuilder.getMany();
        return bookings || [];
      }

      const bookings = await queryBuilder
        .where('booking.user.id = :id', { id: user.id })
        .getMany();

      return bookings || [];
    } catch (error) {
      throw new Error(error);
    }
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
      .execute();
  }

  async getApprovedBooking(userId: number, bookingId: number) {
    try {
      const booking = await this.bookingRepo
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.flight', 'flight')
        .leftJoinAndSelect('booking.user', 'user')
        .where('booking.id = :id', { id: bookingId })
        .getOne();

      if (booking.user.id !== userId) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      if (!booking || booking.status !== 'approved') {
        throw new NotFoundException('Booking not found.');
      }

      return booking;
    } catch (error) {
      throw new Error(error);
    }
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
}
