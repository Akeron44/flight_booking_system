import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { FlightService } from 'src/flight/flight.service';
import { FlightQueryDto } from './dtos/flight-query.dto';
import { CreateBookingDto } from 'src/booking/dtos/create-booking.dto';
import { BookingService } from 'src/booking/booking.service';
import { checkIfUserExist } from './helper/checkUser';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private flightService: FlightService,
    private bookingService: BookingService,
  ) {}

  create(userObj: CreateUserDto) {
    try {
      const user = this.userRepo.create(userObj);
      return this.userRepo.save(user);
    } catch (error) {
      throw new Error(error);
    }
  }

  async find(email: string) {
    try {
      if (!email) return null;
      return this.userRepo.find({ where: { email: email } });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: number) {
    try {
      if (!id) return null;
      const user = await this.userRepo.findOneBy({ id });
      checkIfUserExist(user);

      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateUserCredit(id: number, extraCredit: number) {
    try {
      const user = await this.userRepo.findOneBy({ id });
      checkIfUserExist(user);

      const updatedUser = {
        ...user,
        credit: user.credit + extraCredit,
      };

      return await this.userRepo.save({
        id: id,
        ...updatedUser,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async getFlights(query: FlightQueryDto, id: number) {
    try {
      const user = await this.userRepo.findOneBy({ id });
      checkIfUserExist(user);

      return await this.flightService.getFlights(query, user);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAvailableSeats(id: number) {
    try {
      const flight = await this.flightService.findOne({ id });
      return flight.seats;
    } catch (error) {}
  }

  async createBooking(bookingObj: CreateBookingDto, id: number) {
    try {
      const user = await this.userRepo.findOneBy({ id });
      checkIfUserExist(user);

      const booking = await this.bookingService.createBooking(bookingObj, user);

      if (!booking) {
        throw new NotFoundException('Booking not found.');
      }

      const updatedUser = {
        ...user,
        credit: user.credit - booking.totalPrice,
      };

      await this.userRepo.save({
        id: id,
        ...updatedUser,
      });

      return booking;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getBookings(id: number) {
    try {
      const user = await this.userRepo.findOneBy({ id });
      checkIfUserExist(user);

      return await this.bookingService.getBookings(user);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getApprovedBooking(userId: number, bookingId: number) {
    try {
      if (!userId || !bookingId) {
        return null;
      }
      return await this.bookingService.getApprovedBooking(userId, bookingId);
    } catch (error) {
      throw new Error(error);
    }
  }
}
