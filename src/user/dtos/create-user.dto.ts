import {
  IsString,
  IsEmail,
  Min,
  Max,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(55)
  firstName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(55)
  lastName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(55)
  country: string;

  @IsEmail()
  @MinLength(8)
  @MaxLength(55)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(250)
  password: string;

  @IsNumber()
  @Min(5000)
  @Max(15000)
  credit: number;
}
