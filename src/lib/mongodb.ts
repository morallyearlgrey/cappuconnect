import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const options = {};

if (!MONGODB_URI) throw new Error("oh nooo");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
