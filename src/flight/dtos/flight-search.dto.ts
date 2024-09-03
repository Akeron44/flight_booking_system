import { IsString, IsOptional } from 'class-validator';

export class FlightSearchDto {
  @IsString()
  @IsOptional()
  departure: string;

  @IsString()
  @IsOptional()
  arrival: string;

  @IsString()
  @IsOptional()
  departureTime: string;

  @IsString()
  @IsOptional()
  arrivalTime: string;
}
