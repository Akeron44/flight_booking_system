import { BadRequestException } from '@nestjs/common';
import { Flight } from 'src/flight/entities/flight.entity';

interface SeatRequest {
  seats?: string[];
  numOfPassangers: number;
}

function allocateRandomSeat(numOfPassangers: number, seats: string[]) {
  const randomSeat = [];

  for (let i = 0; i < numOfPassangers; i++) {
    randomSeat.push(seats[i]);
  }

  return randomSeat;
}

export function checkAndGetSeats(
  { seats, numOfPassangers }: SeatRequest,
  flight: Flight,
) {
  if (numOfPassangers > flight.seats.length) {
    throw new BadRequestException('Not enough seats left.');
  }

  if (!seats || seats.length === 0) {
    seats = allocateRandomSeat(numOfPassangers, flight.seats);
  } else {
    if (numOfPassangers !== seats.length) {
      throw new BadRequestException(
        'Please choose a seat for every passanger.',
      );
    }
    const hasTheSeats = seats.every((seatsArray) =>
      flight.seats.includes(seatsArray),
    );

    if (!hasTheSeats) {
      throw new BadRequestException('These seats are not available.');
    }
  }

  return seats;
}
