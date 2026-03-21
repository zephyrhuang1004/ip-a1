import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error("MONGODB_URI is not defined. Add it to .env.local")
}

const options = {}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

// In development, use a global variable to preserve the MongoClient across HMR
const clientPromise: Promise<MongoClient> =
  globalThis._mongoClientPromise ??
  (globalThis._mongoClientPromise = new MongoClient(uri, options).connect())

export default clientPromise

export async function getDb() {
  const client = await clientPromise
  return client.db()
}

export async function getExpensesCollection() {
  const db = await getDb()
  return db.collection("expenses")
}

export async function getCategoriesCollection() {
  const db = await getDb()
  return db.collection("categories")
}
