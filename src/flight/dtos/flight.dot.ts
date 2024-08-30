import { Expose } from 'class-transformer';

export class FlightDto {
  @Expose()
  id: number;
  @Expose()
  departure: string;
  @Expose()
  arrival: string;
  @Expose()
  origin: string;
  @Expose()
  destination: string;
  @Expose()
  price: number;
}
