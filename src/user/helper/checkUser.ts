import { NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';

export function checkIfUserExist(user: User) {
  if (!user) {
    throw new NotFoundException('User not found.');
  }
}
