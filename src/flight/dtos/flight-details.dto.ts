import { Expose, Transform } from 'class-transformer';

export class DetailedFlightDto {
  @Expose()
  id: number;
  @Expose()
  departure: Date;
  @Expose()
  arrival: Date;
  @Expose()
  origin: string;
  @Expose()
  destination: string;
  @Expose()
  price: number;

  @Transform(({ obj }) => obj.seats.length)
  @Expose()
  seatsLeft: number;

  @Transform(({ obj }) => [
    {
      id: obj.airplane.id,
      capacity: obj.airplane.capacity,
    },
  ])
  @Expose()
  airplane: object;
}
