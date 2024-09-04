import { Flight } from 'src/flight/entities/flight.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Airplane {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  capacity: number;

  @Column()
  manufacturer: string;

  @Column()
  model: string;

  @OneToMany(() => Flight, (flight) => flight.airplane)
  flights: Flight[];
}
