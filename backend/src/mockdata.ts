import { Flight } from "./types";

export const MockFlights: Flight[] = [
    {
        id: 1,
        flight_number: "E123",
        airline: "Emirat Airlines",
        departure_city: "LONDON",
        destination_city: "KABUL",
        departure_time: "2021-08-15T08:00:00Z",
        arrival_time: "2021-08-15T11:00:00Z",
        price: 100,
        co2Emissions: 100,
        flight_distance: 1000
    },
    {
        id: 2,
        flight_number: "U123",
        airline: "British Airlines",
        departure_city: "Paris",
        destination_city: "Berlin",
        departure_time: "2025-01-13T15:00:00Z",
        arrival_time: "2025-01-13T17:00:00Z",
        price: 150,
        co2Emissions: 150,
        flight_distance: 1000
    }
];