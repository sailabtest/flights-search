import { FilterByInput, Flight, FlightParams, IContext } from "./types";


/**
 * To find flight details based on the search criteria
 **/
export const searchFlights = async ({departureCity, destinationCity, flightDate, filterBy, sortBy}: FlightParams, {pool, Redis}: IContext) => {
    console.log(`Searching flights from ${departureCity} to ${destinationCity} on ${flightDate} sortBy: ${sortBy} and filterBy: `, filterBy);
    try {

        const redisKey = `Cache-flights-${departureCity}-${destinationCity}-${flightDate}`;
        try {
            const cachedFlights = await Redis.get(redisKey);
            if (cachedFlights) {
                console.log("cached flights: ", cachedFlights);
                return JSON.parse(cachedFlights);
            }            
        } catch (error) {
            console.warn(`Error while fetching cached flights: `, error);            
        }
            
        const res = await pool.query(
            `SELECT * FROM flight WHERE departure_city = $1 AND destination_city = $2 AND DATE(departure_time) = $3`,
            [ departureCity, destinationCity, flightDate ]
        );

        if (res.rows.length === 0) {
            return new Error('No flights found.');         
        }

        // sort the flights based on the sortBy criteria
        let flights = res.rows;
        if (sortBy) {
            flights = sortFlights(sortBy, flights);
            console.log("Sorted flights: ", flights); 
        }

        // Filter the flights based on the filterBy criteria. We assume all the flights are already returned based on the search criteria, 
        // thus we ignore the limit option for the time being.
        if (filterBy) {
            flights = filterFlights(filterBy, flights);
            console.log("Filtered flights: ", flights); 
        }
        
        // recheck if any flights are found after sorting and filtering
        if (flights.length === 0) {
            return new Error('No flights found!');         
        }

        // calculate the CO2 emissions for each flight
        flights = calculateFlightsCO2Emissions(flights);

        
        try {                
            // for now we will cache the flights for 24 hours
            await Redis.set(redisKey, JSON.stringify(flights), 'EX', 60 * 60 * 24);         
        } catch (error) {
            console.warn(`Error while caching flights: `, error);            
        }
        
        return flights;

    } catch (error) {
        console.error(`Error while searching flights: ${error}`);        
    }

    return [];
}

const sortFlights = (sortBy: string, flights: Flight[]) => {
    if (!flights) {
        return flights;
    }

    if (sortBy === "Price") {
        return flights.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Duration") {
        return flights.sort((a, b) => a.duration - b.duration);
    } else if (sortBy === "Departure Time") {
        return flights.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
    }
    return flights;
}

const filterFlights = (filterBy: FilterByInput, flights: Flight[]) => {
    if (!flights) {
        return flights;
    }

    // we assume filtering is either by price or by airline only
    let filteredFlights = flights;
    if (filterBy.price) {
        // filter by min and max prices if both are provided
        if (filterBy.price.min && filterBy.price.max) {
            filteredFlights = flights.filter(flight => (filterBy.price && (flight.price >= filterBy.price.min && flight.price <= filterBy.price.max)));           
        } 
        // filter by min price if only min is provided
        else if (filterBy.price.min) {
            filteredFlights = flights.filter(flight => (filterBy.price && flight.price >= filterBy.price.min));           
        }
        // filter by max price if only max is provided
        else if (filterBy.price.max) {
            filteredFlights = flights.filter(flight => (filterBy.price && flight.price <= filterBy.price.max));           
        }
        // otherwise we ignore the price filter if none of them are provided  

    } else {        
    
        // we also check if there are any airlines to filter by
        if (filterBy.airline && filteredFlights.length) {
            filteredFlights = filteredFlights.filter(flight => flight.airline === filterBy.airline);
        }
    }

    return filteredFlights;
}

// Calculate the CO2 emissions for the given distance dummy amount
const callculateFlightCO2Emission = (distance: number) => {
    const E_PER_MILE = 0.02;
    return distance * E_PER_MILE;
};

const calculateFlightsCO2Emissions = (flights: Flight[]) => {
    return flights.map((flight: Flight) => {
        flight.co2Emissions = callculateFlightCO2Emission(flight.flight_distance);
        return flight;
    });
}
