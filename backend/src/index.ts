import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema'
import Redis from 'ioredis';
import { searchFlights } from './flights';
import { FlightParams, IContext } from './types';
import { Pool } from 'pg';


// Postgres connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'db_flights',
    password: 'test',
    port: 5432,
});

// Redis connection url
const redisURL = 'redis://localhost:6379';
const RedisClient = new Redis(redisURL);


const resolvers = {
    Query: {
        getFlights: (_: any, args: FlightParams, context: IContext) => searchFlights(args, context),
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers    
});

// Start the apollo server
startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => ({ pool, Redis: RedisClient }),
}).then(({ url }) => console.log(`🚀 ApolloServer ready at: ${url}`));