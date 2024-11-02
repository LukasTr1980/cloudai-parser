import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
    console.error('Invalid/Missing enviroment variable: "MONGODB_URI');
    throw new Error('Invalid/Missing enviroment variable: "MONGODB_URI');
}

const uri = process.env.MONGODB_URI;
const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
}

let client: MongoClient

if (process.env.NODE_ENV === 'development') {
    console.info('Running MongoDB in development mode');
    const globalWithMongo = global as typeof globalThis & {
        _mongoClient?: MongoClient
    }

    if (!globalWithMongo._mongoClient) {
        console.info('Creating new MongoDB client instance');
        globalWithMongo._mongoClient = new MongoClient(uri, options);
    } else {
        console.info('Reusing existing MongoDB client instance');
    }
    client = globalWithMongo._mongoClient
} else {
    console.info('Running MongoDB in production mode');
    console.info('Creating new MongoDB client instance');
    client = new MongoClient(uri, options)
}

client.connect()
    .then(() => console.info('Successfully connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

client.on('close', () => console.info('MongoDB connection closed'));

process.on('SIGINT', () => {
    client.close().then(() => {
        console.info('MongoDB connection closed through app termination');
    });
});

export default client