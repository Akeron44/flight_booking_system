import { IsNumber, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @IsNumber()
  @Min(1000)
  @Max(20000)
  extraCredit: number;
}
