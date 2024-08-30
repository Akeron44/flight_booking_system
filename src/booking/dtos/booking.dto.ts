import { Expose, Transform } from 'class-transformer';

export class BookingDto {
  @Expose()
  id: number;
  @Expose()
  totalPrice: number;
  @Expose()
  seat: string;
  @Expose()
  numOfPassangers: number;
  @Expose()
  status: string;

  @Transform(({ obj }) => obj.user.id)
  @Expose()
  userId: number;

  @Transform(({ obj }) => [
    {
      id: obj.flight.id,
      origin: obj.flight.origin,
      destination: obj.flight.destination,
      departure: obj.flight.departure,
      arrival: obj.flight.arrival,
    },
  ])
  @Expose()
  flightInformation: object[];
}
