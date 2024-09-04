import { Module } from '@nestjs/common';
import { AirplaneService } from './airplane.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airplane } from './entities/airplane.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Airplane])],
  providers: [AirplaneService],
  exports: [AirplaneService],
})
export class AirplaneModule {}
