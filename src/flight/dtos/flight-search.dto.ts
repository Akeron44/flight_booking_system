import { IsString, IsOptional } from 'class-validator';

export class FlightSearchDto {
  @IsString()
  @IsOptional()
  origin?: string;

  @IsString()
  @IsOptional()
  destination?: string;

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
