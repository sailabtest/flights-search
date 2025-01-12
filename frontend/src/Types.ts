
export interface Flight {
    id: number;
    flight_number: string;
    airline: string;
    departure_city: string;
    destination_city: string;
    departure_time: string;
    arrival_time: string;
    flight_distance: 1000;
    duration: number;
    price: number;
    /** optional, to be calculated */
    co2Emissions?: number;
}

export const sortByList = ["Price", "Duration", "Departure Time"];

export interface PriceRangeInput {
    min?: number
    max?: number
}

export interface FilterByInput {
    price?: PriceRangeInput
    airline?: string
}
