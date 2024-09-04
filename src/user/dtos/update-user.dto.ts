import { IsNumber, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @IsNumber()
  @Min(5000)
  @Max(15000)
  extraCredit: number;
}
