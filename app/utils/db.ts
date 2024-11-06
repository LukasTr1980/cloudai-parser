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
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    console.info('Running MongoDB in development mode');
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        console.info('Creating new MongoDB client instance');
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    } else {
        console.info('Reusing existing MongoDB client instance');
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    console.info('Running MongoDB in production mode');
    console.info('Creating new MongoDB client instance');
    client = new MongoClient(uri, options)
    clientPromise = client.connect();
}

clientPromise
    .then(() => console.info('Successfully connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

export default clientPromise