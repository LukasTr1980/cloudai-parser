import { MongoClient, ServerApiVersion } from "mongodb";
import { readSecretOrEnvVar } from "./readSecretOrEnvVar";

let client: MongoClient
let clientPromise: Promise<MongoClient>;

async function initMongoClient() {
    const uri = await readSecretOrEnvVar('mongodb_tlxtech_uri', 'MONGODB_URI');

    if (!uri) {
        console.error('Invalid/Missing MongoDB URI');
        throw new Error('Invalid/Missing MongoDB URI');
    }

    const options = {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    };

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

    return clientPromise;

}

clientPromise = initMongoClient();

export default clientPromise;