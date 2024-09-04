import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Airplane } from './entities/airplane.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AirplaneService {
  constructor(
    @InjectRepository(Airplane) private airplaneRepo: Repository<Airplane>,
  ) {}

  async findOne(id: number) {
    if (!id) return null;

    const airplane = await this.airplaneRepo.findOneBy({ id });

    if (!airplane) {
      throw new NotFoundException('Airplane was not found.');
    }

    return airplane;
  }

  getAvailableAirplanes(excludedIds: number[]) {
    const queryBuilder = this.airplaneRepo.createQueryBuilder('airplane');
    if (!excludedIds || excludedIds.length === 0) {
      return queryBuilder.getMany();
    }

    return queryBuilder
      .where('airplane.id NOT IN (:...excludedIds)', { excludedIds })
      .getMany();
  }
}
