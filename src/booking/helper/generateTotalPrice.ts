interface FlightPricing {
  numOfPassangers: number;
  seat?: string[];
  returnFlightSeat?: string[];
  returnFlightId?: number;
  flightPrice: number;
  returnFlightPrice?: number;
}

export function generateTotalPrice({
  numOfPassangers,
  seat,
  returnFlightSeat,
  returnFlightId,
  flightPrice,
  returnFlightPrice,
}: FlightPricing) {
  let totalPrice = flightPrice * numOfPassangers;

  if (returnFlightId) {
    totalPrice += returnFlightPrice * numOfPassangers;
  }

  if (seat && seat.length > 0) {
    totalPrice += numOfPassangers * 3000;
  }

  if (returnFlightId && returnFlightSeat.length > 0) {
    totalPrice += numOfPassangers * 3000;
  }

  return totalPrice;
}
