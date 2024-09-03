import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Airplane } from './entities/airplane.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AirplaneService {
  constructor(
    @InjectRepository(Airplane) private airplaneRepo: Repository<Airplane>,
  ) {}

  async findOne(id: number) {
    try {
      const airplane = await this.airplaneRepo.findOneBy({ id });
      return airplane;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAvailableAirplanes(excludedIds: number[]) {
    const airplanes = await this.airplaneRepo
      .createQueryBuilder('airplane')
      .where('airplane.id NOT IN (:...excludedIds)', { excludedIds })
      .getMany();

    return airplanes;
  }
}
