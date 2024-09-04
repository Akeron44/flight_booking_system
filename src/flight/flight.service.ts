import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateFlightDto } from './dtos/create-flight.dto';
import {
  validateFlight,
  checkIfFlightExist,
  validateDepartureAndArrival,
  adjustDateAndTime,
} from './helper/checkFlight';
import { AirplaneService } from 'src/airplane/airplane.service';
import { generateAirplaneSeats } from './helper/generateSeatNumbers';
import { UpdateFlightDto } from './dtos/update-flight.dto';
import { FlightSearchDto } from './dtos/flight-search.dto';
import { UserFlightSearchDto } from './dtos/user-flight-search.dto';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(Flight) private flightRepo: Repository<Flight>,
    private airplaneService: AirplaneService,
  ) {}

  async createFlight(flightObj: CreateFlightDto) {
    const airplane = await this.airplaneService.findOne(flightObj.airplaneId);

    if (!airplane) {
      throw new NotFoundException(
        `Airplane with the given id ${flightObj.airplaneId} was not found.`,
      );
    }

    validateFlight(flightObj);
    flightObj.departure = adjustDateAndTime(flightObj.departure);
    flightObj.arrival = adjustDateAndTime(flightObj.arrival);

    const newFlight = this.flightRepo.create({
      ...flightObj,
      seats: generateAirplaneSeats(airplane.capacity),
    });
    newFlight.airplane = airplane;

    return this.flightRepo.save(newFlight);
  }

  async findOne({ id }) {
    const flight = await this.flightRepo.findOneBy({ id });
    checkIfFlightExist(flight);

    return flight;
  }

  async searchFlights(query: UserFlightSearchDto, user: User) {
    const currentDateTime = new Date().toISOString();
    const queryBuilder = this.flightRepo.createQueryBuilder('flight');

    if (!query.departure && !query.origin && !query.destination) {
      return await queryBuilder
        .where('flight.origin ILIKE :origin', { origin: `%${user.country}%` })
        .andWhere('flight.departure >= :currentDateTime', { currentDateTime })
        .getMany();
    }

    const flightsArray = await queryBuilder
      .where(
        new Brackets((qb) => {
          if (query.origin) {
            qb.where('flight.origin ILIKE :origin', {
              origin: `%${query.origin}%`,
            });
          }

          if (query.destination) {
            qb.andWhere('flight.destination ILIKE :destination', {
              destination: `%${query.destination}%`,
            });
          }

          if (query.departure) {
            const startOfDay = `${query.departure}T00:00:00.000Z`;
            const endOfDay = `${query.departure}T23:59:59.999Z`;

            qb.andWhere('flight.departure BETWEEN :startOfDay AND :endOfDay', {
              startOfDay,
              endOfDay,
            });
          }
        }),
      )
      .andWhere('flight.departure >= :currentDateTime', { currentDateTime })
      .getMany();

    return flightsArray || [];
  }

  async getFlights(query: FlightSearchDto) {
    const startTime = query.departureTime || '00:00:00';
    const endTime = query.arrivalTime || '23:59:59';

    const flightsArray = await this.flightRepo
      .createQueryBuilder('flight')
      .leftJoinAndSelect('flight.airplane', 'airplane')
      .where(
        new Brackets((qb) => {
          if (query.departure) {
            const startOfDay = new Date(`${query.departure}T${startTime}.000Z`);
            qb.where('flight.departure >= :startOfDay', { startOfDay });
          }

          if (query.arrival) {
            const endOfDay = new Date(`${query.arrival}T${endTime}.999Z`);
            qb.andWhere('flight.arrival <= :endOfDay', { endOfDay });
          }

          if (query.origin) {
            qb.andWhere('flight.origin ILIKE :origin', {
              origin: `%${query.origin}%`,
            });
          }

          if (query.destination) {
            qb.andWhere('flight.destination ILIKE :destination', {
              destination: `%${query.destination}%`,
            });
          }
        }),
      )
      .getMany();

    return flightsArray || [];
  }

  async getFlight(id: number) {
    const flight = await this.flightRepo
      .createQueryBuilder('flight')
      .leftJoinAndSelect('flight.airplane', 'airplane')
      .where('flight.id = :id', { id })
      .getOne();

    checkIfFlightExist(flight);

    return flight;
  }

  async getPreviousFlightsNumber() {
    const currentDateTime = new Date().toISOString();
    const previousFlightsNumber = await this.flightRepo
      .createQueryBuilder('flight')
      .select('COUNT(flight.id)', 'flights')
      .where('flight.departure < :currentDateTime', { currentDateTime })
      .groupBy('flight.id')
      .getRawMany();

    return previousFlightsNumber;
  }

  async updateSeats(id: number, seats: string[], method: string) {
    const flight = await this.flightRepo.findOneBy({ id });
    checkIfFlightExist(flight);

    if (method === 'remove') {
      const updatedSeats = flight.seats.filter(
        (availableSeats) => !seats.includes(availableSeats),
      );

      const updatedFlight = {
        ...flight,
        seats: updatedSeats,
      };

      await this.flightRepo.save({
        id: flight.id,
        ...updatedFlight,
      });
    }

    if (method === 'add') {
      const updatedSeats = [...seats, ...flight.seats];
      const updatedFlight = { ...flight, seats: updatedSeats };
      await this.flightRepo.save(updatedFlight);
    }
  }

  async updateFlight(id: number, updateFlightObj: UpdateFlightDto) {
    if (!id) throw new BadRequestException('Invalid ID.');
    if (Object.keys(updateFlightObj).length === 0) {
      throw new BadRequestException('No data provided.');
    }

    const flight = await this.flightRepo
      .createQueryBuilder('flight')
      .leftJoinAndSelect('flight.airplane', 'airplane')
      .where('flight.id = :id', { id })
      .getOne();

    checkIfFlightExist(flight);
    validateDepartureAndArrival(flight, updateFlightObj);

    if (updateFlightObj.departure) {
      const newDeparture = adjustDateAndTime(updateFlightObj.departure);
      updateFlightObj.departure = newDeparture;
    }

    if (updateFlightObj.arrival) {
      const newArrival = adjustDateAndTime(updateFlightObj.departure);
      updateFlightObj.arrival = newArrival;
    }

    const updatedFlight = {
      ...flight,
      ...updateFlightObj,
    };

    await this.flightRepo.save({
      id: flight.id,
      ...updateFlightObj,
    });

    return updatedFlight;
  }

  async deleteFlight(id: number) {
    return await this.flightRepo.delete({ id });
  }
}
