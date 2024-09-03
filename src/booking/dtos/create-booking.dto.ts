import { IsNumber, Min, IsOptional, IsArray } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  flightId: number;

  @IsNumber()
  @Min(1)
  numOfPassangers: number;

  @IsArray()
  @IsOptional()
  seat: string[];

  @IsNumber()
  @IsOptional()
  returnFlightId: number;

  @IsArray()
  @IsOptional()
  returnFlightSeat: string[];
}
