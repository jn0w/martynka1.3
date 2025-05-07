import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function GET(req) {
  try {
    await client.connect();
    const db = client.db("testDatabase");
    const mealsCollection = db.collection("meals");

    const meals = await mealsCollection.find().toArray();
    return new Response(JSON.stringify(meals), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching meals:", error);
    return new Response("Failed to fetch meals", { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(req) {
  try {
    const mealData = await req.json(); // Parse the request body
    await client.connect();
    const db = client.db("testDatabase");
    const mealsCollection = db.collection("meals");

    const result = await mealsCollection.insertOne(mealData);
    return new Response(JSON.stringify({ mealId: result.insertedId }), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    console.error("Error adding meal:", error);
    return new Response("Failed to add meal", { status: 500 });
  } finally {
    await client.close();
  }
}
