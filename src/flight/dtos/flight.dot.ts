import { Expose } from 'class-transformer';

export class FlightDto {
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
}
