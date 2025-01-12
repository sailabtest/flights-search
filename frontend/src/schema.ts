import gql from 'graphql-tag';

export const FLIGHTS_QUERY = gql`
query SearchFlights($departureCity: String!, $destinationCity: String!, $flightDate: String!, $sortBy: String, $filterBy: FilterByInput) {
  getFlights(departureCity: $departureCity, destinationCity: $destinationCity, flightDate: $flightDate, sortBy: $sortBy, filterBy: $filterBy) {
    id
    flight_number
    airline
    departure_city
    destination_city
    departure_time
    arrival_time
    price
    co2Emissions
  }
}
`;