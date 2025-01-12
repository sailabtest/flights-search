
export const typeDefs = `#graphql
  scalar Date

  # This "Flight" type defines the queryable fields for every flight in our data source.
  type Flight {
    id: ID
    flight_number: String
    airline: String
    departure_city: String
    destination_city: String
    departure_time: Date
    arrival_time: Date
    price: Float!
    co2Emissions: Float
  }

  input PriceRangeInput {
    min: Float
    max: Float
  }

  input FilterByInput {
    price: PriceRangeInput
    airline: String
  }
  

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "flights" query returns an array of zero or more flights (defined above).
  type Query {
    getFlights(departureCity: String!, destinationCity: String!, flightDate: String!, sortBy: String, filterBy: FilterByInput): [Flight]
  }
`;
