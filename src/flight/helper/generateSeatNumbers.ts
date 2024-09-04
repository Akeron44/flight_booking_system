export function generateAirplaneSeats(capacity: number) {
  const lettersArray = ['A', 'B', 'C', 'D', 'E', 'F'];
  let totalSeats = capacity;
  let numberOfRows = totalSeats / lettersArray.length;

  let seats = [];

  for (let i = 1; i <= numberOfRows; i++) {
    for (let j = 0; j < lettersArray.length; j++) {
      let seatNumber = '';
      seatNumber += i + lettersArray[j];
      seats.push(seatNumber);
    }
  }

  return seats;
}
