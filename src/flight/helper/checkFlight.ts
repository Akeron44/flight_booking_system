import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Flight } from '../entities/flight.entity';
import { UpdateFlightDto } from '../dtos/update-flight.dto';
import { CreateFlightDto } from '../dtos/create-flight.dto';

export function checkIfFlightExist(flight: Flight) {
  if (!flight) {
    throw new NotFoundException('Flight was not found.');
  }
}

export function adjustDateAndTime(date: Date) {
  const originalDate = new Date(date);
  const offsetHours = 2;
  const adjustedDate = new Date(
    originalDate.getTime() + offsetHours * 60 * 60 * 1000,
  );

  return adjustedDate;
}

export function validateFlight(requestBody: CreateFlightDto) {
  const departure = requestBody.departure;
  const arrival = requestBody.arrival;

  const departureDay = departure.getDate();
  const departureMonth = departure.getMonth();
  const departureYear = departure.getFullYear();

  const arrivalDay = arrival.getDate();
  const arrivalMonth = arrival.getMonth();
  const arrivalYear = arrival.getFullYear();

  const currentDateTime = new Date();

  if (departure < currentDateTime) {
    throw new BadRequestException("Can't create a flight in the past");
  }

  if (departure >= arrival) {
    throw new BadRequestException("Departure can't be later than arrival");
  }

  if (arrival <= departure) {
    throw new BadRequestException("Arrival can't be earlier than departure");
  }

  if (
    departureDay !== arrivalDay ||
    departureMonth !== arrivalMonth ||
    departureYear !== arrivalYear
  ) {
    throw new BadRequestException(
      'Departure and arrival have to be on the same day.',
    );
  }
}

export function validateDepartureAndArrival(
  flight: Flight,
  updateBody: UpdateFlightDto,
) {
  const currentDateTime = new Date();
  if (
    updateBody.departure < currentDateTime ||
    updateBody.arrival < currentDateTime
  ) {
    throw new BadRequestException("Flight can't be in the past");
  }

  if (updateBody.departure && !updateBody.arrival) {
    if (updateBody.departure >= flight.arrival) {
      throw new BadRequestException("Departure can't be later than arrival");
    }

    const departureDay = updateBody.departure.getDate();
    const departureMonth = updateBody.departure.getMonth();
    const departureYear = updateBody.departure.getFullYear();

    const arrivalDay = flight.arrival.getDate();
    const arrivalMonth = flight.arrival.getMonth();
    const arrivalYear = flight.arrival.getFullYear();

    if (
      departureDay !== arrivalDay ||
      departureMonth !== arrivalMonth ||
      departureYear !== arrivalYear
    ) {
      throw new BadRequestException(
        "Departure can't be days earlier than arrival",
      );
    }
  }

  if (updateBody.arrival && !updateBody.departure) {
    if (updateBody.arrival <= flight.departure) {
      throw new BadRequestException("Arrival can't be earlier than departure");
    }

    const departureDay = flight.departure.getDate();
    const departureMonth = flight.departure.getMonth();
    const departureYear = flight.departure.getFullYear();

    const arrivalDay = updateBody.arrival.getDate();
    const arrivalMonth = updateBody.arrival.getMonth();
    const arrivalYear = updateBody.arrival.getFullYear();

    if (
      departureDay !== arrivalDay ||
      departureMonth !== arrivalMonth ||
      departureYear !== arrivalYear
    ) {
      throw new BadRequestException(
        "Arrival can't be days later after departure",
      );
    }
  }

  if (updateBody.departure && updateBody.arrival) {
    if (updateBody.departure >= updateBody.arrival) {
      throw new BadRequestException('Bad departure and arrival logic.');
    }

    const departureDay = updateBody.departure.getDate();
    const departureMonth = updateBody.departure.getMonth();
    const departureYear = updateBody.departure.getFullYear();

    const arrivalDay = updateBody.arrival.getDate();
    const arrivalMonth = updateBody.arrival.getMonth();
    const arrivalYear = updateBody.arrival.getFullYear();

    if (
      departureDay !== arrivalDay ||
      departureMonth !== arrivalMonth ||
      departureYear !== arrivalYear
    ) {
      throw new BadRequestException(
        'Departure and arrival have to be on the same day.',
      );
    }
  }
}
