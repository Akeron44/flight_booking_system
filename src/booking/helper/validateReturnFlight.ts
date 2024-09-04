import { BadRequestException } from '@nestjs/common';
import { Flight } from 'src/flight/entities/flight.entity';

export function validateReturnFlight(flight: Flight, returnFlight: Flight) {
  if (
    flight.origin !== returnFlight.destination ||
    flight.destination === flight.origin
  ) {
    throw new BadRequestException(
      'Origin flight has to match the destination of your return flight and vice versa.',
    );
  }

  if (
    flight.departure > returnFlight.departure ||
    flight.arrival > returnFlight.arrival
  ) {
    throw new BadRequestException(
      'Your return flight can not be earlier than your original flight.',
    );
  }
}
