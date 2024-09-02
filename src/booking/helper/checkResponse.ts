import { BadRequestException } from '@nestjs/common';

export function checkIfResponseIsValid(response: string) {
  if (response !== 'approved' && response !== 'rejected') {
    throw new BadRequestException('Please enter a valid booking status.');
  }
}
