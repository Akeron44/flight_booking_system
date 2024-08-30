import { NotFoundException } from '@nestjs/common';
import { Flight } from '../entities/flight.entity';

export function checkIfFlightExist(flight: Flight) {
  if (!flight) {
    throw new NotFoundException('Flight was not found.');
  }
}
