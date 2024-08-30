import { Flight } from 'src/flight/entities/flight.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  totalPrice: number;

  @Column()
  numOfPassangers: number;

  @Column('text', { array: true })
  seat: string[];

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => Flight, (flight) => flight.bookings)
  flight: Flight;

  @ManyToOne(() => User, (user) => user.bookings)
  user: User;
}
