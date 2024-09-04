import { Booking } from 'src/booking/entities/Booking.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  country: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  credit: number;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
}
