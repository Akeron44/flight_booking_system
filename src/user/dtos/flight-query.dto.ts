import { IsString, IsOptional } from 'class-validator';

export class FlightQueryDto {
  @IsString()
  @IsOptional()
  origin: string;

  @IsString()
  @IsOptional()
  destination: string;

  @IsString()
  @IsOptional()
  departure: string;
}
