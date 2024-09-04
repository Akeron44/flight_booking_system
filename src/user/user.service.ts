import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { FlightService } from 'src/flight/flight.service';
import { CreateBookingDto } from 'src/booking/dtos/create-booking.dto';
import { BookingService } from 'src/booking/booking.service';
import { checkIfUserExist } from './helper/checkUser';
import { PdfService } from 'src/pdf/pdf.service';
import { UserFlightSearchDto } from 'src/flight/dtos/user-flight-search.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private flightService: FlightService,
    private bookingService: BookingService,
    private pdfService: PdfService,
  ) {}

  create(userObj: CreateUserDto) {
    const user = this.userRepo.create(userObj);
    return this.userRepo.save(user);
  }

  async find(email: string) {
    if (!email) return null;
    return this.userRepo.find({ where: { email: email } });
  }

  async findOne(id: number) {
    if (!id) return null;
    const user = await this.userRepo.findOneBy({ id });
    checkIfUserExist(user);

    return user;
  }

  async addUserCredit(id: number, extraCredit: number) {
    if (!id) return null;

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
  }

  async updateUserCredit(users: any) {
    for (let i = 0; i < users.length; i++) {
      let updatedUser = {};
      let user = await this.userRepo.findOneBy({ id: users[i]['id'] });

      updatedUser = {
        ...user,
        credit: user.credit + users[i]['price'],
      };

      await this.userRepo.save({
        id: user.id,
        ...updatedUser,
      });
    }
  }

  async searchFlights(query: UserFlightSearchDto, id: number) {
    if (!id) return null;

    const user = await this.userRepo.findOneBy({ id });
    checkIfUserExist(user);

    return await this.flightService.searchFlights(query, user);
  }

  async getAvailableSeats(id: number) {
    if (!id) return null;

    const flight = await this.flightService.findOne({ id });
    return flight.seats;
  }

  async createBooking(bookingObj: CreateBookingDto, id: number) {
    if (!id) return null;

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
  }

  async getBookings(id: number) {
    if (!id) return null;

    const user = await this.userRepo.findOneBy({ id });
    checkIfUserExist(user);

    return await this.bookingService.getBookings(user);
  }

  async getApprovedBooking(userId: number, bookingId: number) {
    if (!userId || !bookingId) {
      return null;
    }

    await this.bookingService.findOne(bookingId);

    const approvedBooking = await this.bookingService.getApprovedBooking(
      userId,
      bookingId,
    );

    return this.pdfService.generateBookingPdf(approvedBooking);
  }

  async getPassangersNumber() {
    const users = await this.userRepo
      .createQueryBuilder('user')
      .select('COUNT(user)', 'totalNumber')
      .where('user.isAdmin = :isAdmin', { isAdmin: false })
      .getRawOne();

    return users.totalNumber;
  }
}
