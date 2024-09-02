import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateFlightDto } from './dtos/create-flight.dto';
import { FlightQueryDto } from 'src/user/dtos/flight-query.dto';
import {
  checkFlightDepartureAndArrival,
  checkFlightLogic,
  checkIfFlightExist,
} from './helper/checkFlight';
import { AirplaneService } from 'src/airplane/airplane.service';
import { generateAirplaneSeats } from './helper/generateSeatNumbers';
import { UpdateFlightDto } from './dtos/update-flight.dto';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(Flight) private flightRepo: Repository<Flight>,
    private dataSource: DataSource,
    private airplaneService: AirplaneService,
  ) {}

  async createFlight(flightObj: CreateFlightDto) {
    try {
      const airplane = await this.airplaneService.findOne(flightObj.airplaneId);

      if (!airplane) {
        throw new NotFoundException(
          `Airplane with the given id ${flightObj.airplaneId} was not found.`,
        );
      }

      checkFlightLogic(flightObj);

      const newFlight = this.flightRepo.create({
        ...flightObj,
        seats: generateAirplaneSeats(airplane.capacity),
      });
      newFlight.airplane = airplane;
      return this.flightRepo.save(newFlight);
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne({ id }) {
    try {
      const flight = await this.flightRepo.findOneBy({ id });
      checkIfFlightExist(flight);

      return flight;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getFlights(query: FlightQueryDto, user: User) {
    try {
      const queryBuilder = this.dataSource
        .createQueryBuilder()
        .select('flight')
        .from(Flight, 'flight');

      const currentDateTime = new Date().toISOString();

      if (!query.departure && !query.origin && !query.destination) {
        const flightsArray = await queryBuilder
          .where('flight.origin ILIKE :origin', { origin: `%${user.country}%` })
          .andWhere('flight.departure >= :currentDateTime', { currentDateTime })
          .getMany();

        return flightsArray || [];
      } else {
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

                qb.andWhere(
                  'flight.departure BETWEEN :startOfDay AND :endOfDay',
                  {
                    startOfDay,
                    endOfDay,
                  },
                );
              }
            }),
          )
          .andWhere('flight.departure >= :currentDateTime', { currentDateTime })
          .getMany();

        return flightsArray || [];
      }
    } catch (error) {
      throw new Error(error);
    }
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

  async updateSeats(id: number, seats: string[], method: string) {
    try {
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
        const updatedSeats = [...flight.seats, ...seats];
        const updatedFlight = { ...flight, seats: updatedSeats };
        await this.flightRepo.save(updatedFlight);
      }
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong with updating the number of seats on the flight.',
      );
    }
  }

  async updateFlight(id: number, updateFlightObj: UpdateFlightDto) {
    if (!id) return null;
    if (Object.keys(updateFlightObj).length === 0)
      return new BadRequestException('No data provided.');

    const flight = await this.flightRepo.findOneBy({ id });
    checkIfFlightExist(flight);
    checkFlightDepartureAndArrival(flight, updateFlightObj);

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
