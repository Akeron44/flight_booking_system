import { IsString, IsOptional } from 'class-validator';

export class UserFlightSearchDto {
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
