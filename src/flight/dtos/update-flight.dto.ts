import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  MinLength,
  MaxLength,
  IsDate,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class UpdateFlightDto {
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  departure: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  arrival: Date;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(55)
  origin: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(55)
  destination: string;

  @IsNumber()
  @IsOptional()
  @Min(4500)
  @Max(12000)
  price: number;
}
