import { Airplane } from 'src/airplane/entities/airplane.entity';
import { Booking } from 'src/booking/entities/Booking.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Flight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  departure: Date;

  @Column()
  arrival: Date;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column()
  price: number;

  @Column('text', { array: true })
  seats: string[];

  @OneToMany(() => Booking, (booking) => booking.flight)
  bookings: Booking[];

  @ManyToOne(() => Airplane, (airplane) => airplane.flights)
  airplane: Airplane;
}
