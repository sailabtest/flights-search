import Redis from "ioredis";
import { Pool } from "pg";

export interface FlightParams {
    departureCity?: string;
    destinationCity?: string;
    flightDate?: string;
    sortBy?: string;
    filterBy?: FilterByInput;
}

export interface PriceRangeInput {
    min: number
    max: number
}

export interface FilterByInput {
    price?: PriceRangeInput
    airline?: String
}

export interface Flight {
  id: number;
  flight_number: string;
  airline: string;
  departure_city: string;
  destination_city: string;
  departure_time: string;
  arrival_time: string;
  flight_distance: number;
  price: number;
  duration: number;
  /** optional, to be calculated */
  co2Emissions?: number;
}

export interface IContext {
    pool: Pool;
    Redis: Redis;
}