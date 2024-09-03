import { Airplane } from 'src/airplane/entities/airplane.entity';
import { Flight } from 'src/flight/entities/flight.entity';
import { airplanesSeed, flightSeed } from 'src/seed/initialData';
import { DataSource } from 'typeorm';

async function truncate(dataSource: DataSource) {
  await dataSource.query('TRUNCATE "booking" RESTART IDENTITY CASCADE;');
  await dataSource.query('TRUNCATE "airplane" RESTART IDENTITY CASCADE;');
  await dataSource.query('TRUNCATE "flight" RESTART IDENTITY CASCADE;');
}

export async function seedData(dataSource: DataSource) {
  try {
    await truncate(dataSource);

    const airplaneRepository = dataSource.getRepository(Airplane);
    const flightRepository = dataSource.getRepository(Flight);

    const airplanes = await airplaneRepository.save(airplanesSeed);
    const airplaneMap = new Map(airplanes.map((plane) => [plane.id, plane]));

    const flights = flightSeed.map((flight) => ({
      ...flight,
      airplane: airplaneMap.get(flight.airplaneId),
    }));

    for (const flight of flights) {
      await flightRepository.save(flight);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
