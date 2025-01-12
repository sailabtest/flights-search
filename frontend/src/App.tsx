import { useEffect, useState } from "react";
import './App.scss';

import {  useQuery } from '@apollo/client';
import { FilterByInput, Flight, sortByList } from "./Types";
import { FLIGHTS_QUERY } from "./schema";

const App = () => {
    const [departureCity, setDepartureCity] = useState<string>('');
    const [destinationCity, setDestinationCity] = useState<string>('');
    const [flightDate, setFlightDate] = useState<string>('');

    const [sortBy, setSortBy] = useState<string>('');
    const [filterBy, setFilterBy] = useState<string>('');
    const [filterBySelected, setFilterBySelected] = useState<FilterByInput>();
    
    const [isFormReady, setFormReady] = useState<boolean>(false);
    
    const [flights, setFlights] = useState<Flight[]>();
    
    const { loading, error, data, errors, refetch } = useQuery(FLIGHTS_QUERY, {
        variables: { departureCity, destinationCity, flightDate, sortBy, filterBy: filterBySelected },
        skip: !departureCity || !destinationCity || !flightDate || !isFormReady,
        
    });
    
    const handleSearch = () => {
      // for return flight the return date should be selected
      if (departureCity && destinationCity && flightDate) {
        revalidateFilterByInput();
        setFormReady(true);
        refetch();
      } else {
        console.warn("No departureCity or destinationCity or flightDate selected.");
      }
    }

    // we assume only a single filter is required at a time so remove the other ones
    const revalidateFilterByInput = () => {            
        let filter = (filterBySelected || {}) as FilterByInput;
        if (filterBy === "Price") {
            filter.airline = '';
        } else if (filterBy === "Airline") {
            filter.price = undefined;
        } else {
            filter = {};
        }
        
        setFilterBySelected(filter);
    }

    const sortFlights = (sortBy: string) => {
        if (!flights) {
            return;
        }
        setSortBy(sortBy);
    }

    const filterFlights = (filterBy: string) => {
        if (!flights) {
            return;
        }
        setFilterBy(filterBy);
    }


    const showAirlineFilter = () => {
        const airline = ((filterBySelected || {}) as FilterByInput).airline || '';
        return <div>
            <label>Airline:</label>
            <input type="text" placeholder="Airline Name" value={airline} onChange={(e) => filterByAirline(e.target.value)} />
        </div>
    }

    const showPriceFilter = () => {
        return <div>
            <label>Price Range:</label>
            <input type="number" placeholder="Min Price" onChange={(e) => filterByPrice(e.target.value, 'min')}  />
            <input type="number" placeholder="Max Price" onChange={(e) => filterByPrice(e.target.value, 'max')}  />
        </div>
    }

    // the parameter is using the interface min and max of the price range
    const filterByPrice = (price: string, minmax: 'min'|'max') => {
        const filterByOptions = (filterBySelected || {}) as FilterByInput;
        filterByOptions.price = filterByOptions.price || {};
        
        filterByOptions.price[minmax] = parseInt(price) || 0;
        setFilterBySelected(filterByOptions);
    }

    const filterByAirline = (airline: string) => {
        const filterByOptions = (filterBySelected || {}) as FilterByInput;
        filterByOptions.airline = airline;
        setFilterBySelected(filterByOptions);
    }


    useEffect(() => {
        if (!loading) {
            if (data?.getFlights?.length) {
                setFlights(data?.getFlights);  
                console.log("Data found: ", data.getFlights);
                // turn off auto reloading once the data is there unless search button clicked
                setFormReady(false);
            }           
        }

    }, [data?.getFlights,loading]);


    return <div className="FlightSearch">
      <h1>Flight Search Engine</h1>

      <div className="FlightSearch__filter">
        <input type="text" placeholder="Departure City" value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} />
        <input type="text" placeholder="Destination City" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} />
        <input type="date" placeholder="Flight Date" value={flightDate} onChange={(e) => setFlightDate(e.target.value)} />
                
        <div className="FlightSearch__filter__options">
            <div className="FlightSearch__filter__options__filter">
                <span>Filter By:</span>
                <select value={filterBy} onChange={(e) => filterFlights(e.target.value)}>
                    <option value="">Select</option>
                    <option value="Airline">Airline</option>
                    <option value="Price">Price</option>
                </select>

                {filterBy === "Price" ? 
                    <div className="FlightSearch__filter__options__filter__price">{showPriceFilter()}</div> : filterBy === "Airline" ? 
                    <div className="FlightSearch__filter__options__filter__airline">{showAirlineFilter()}</div> : <div></div>}
            </div>

            <div className="FlightSearch__filter__options__sort">
                <span>Sort By:</span>
                <select value={sortBy} onChange={(e) => sortFlights(e.target.value)}>
                    <option value="">Select</option>
                    {sortByList.map((sort, index) => <option key={index} value={sort}>{sort}</option>)}
                </select>
            </div>
        </div>
        
        {departureCity && destinationCity && flightDate ? <p><button onClick={handleSearch}>Search</button></p> : <p>Use the above form to search for flights!</p>}
        
      </div>

      <div className="FlightSearch__result">
        {loading ? <p>Loading...</p> : 
        (error?.message) ? <p className="FlightSearch__result__error">Error: {error.message}</p> : 
        (errors?.length) ? <p className="FlightSearch__result__error">Errors: {errors[0].message}</p> : 
        flights?.map((flight: Flight, index: number) => {
            return <div key={index} className="FlightSearch__result__flight">
                <div><span>Flight:</span> {flight.airline} ({flight.flight_number})</div>
                <div><span>FROM:</span> {flight.departure_city} - <span>TO: </span> {flight.destination_city}</div>
                <div><span>Departure</span> {flight.departure_time} - <span>Arrival</span> {flight.arrival_time}</div>
                <div className="FlightSearch__result__flight__co2">CO2 Emissions: {flight.co2Emissions}</div>
                <div className="FlightSearch__result__flight__price">Price: <strong>{flight.price}</strong></div>
            </div>
        })}
      </div>

    </div>
}

export default App;