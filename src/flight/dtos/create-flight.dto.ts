import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  MinLength,
  MaxLength,
  IsDate,
  Min,
  Max,
} from 'class-validator';

export class CreateFlightDto {
  @IsNumber()
  airplaneId: number;

  @IsDate()
  @Type(() => Date)
  departure: string;

  @IsDate()
  @Type(() => Date)
  arrival: string;

  @IsString()
  @MinLength(2)
  @MaxLength(55)
  origin: string;

  @IsString()
  @MinLength(3)
  @MaxLength(55)
  destination: string;

  @IsNumber()
  @Min(1)
  @Max(1000000000)
  price: number;
}
