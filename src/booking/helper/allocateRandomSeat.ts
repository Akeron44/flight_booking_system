export function allocateRandomSeat(numOfPassangers: number, seats: string[]) {
  const randomSeat = [];

  for (let i = 0; i < numOfPassangers; i++) {
    randomSeat.push(seats[i]);
  }

  return randomSeat;
}
