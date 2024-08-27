import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class SigninUserDto {
  @IsEmail()
  @MinLength(8)
  @MaxLength(55)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(250)
  password: string;
}
