import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    const mealData = await request.json();
    await client.connect();
    const db = client.db("testDatabase");
    const mealsCollection = db.collection("meals");

    const result = await mealsCollection.insertOne(mealData);

    return new Response(
      JSON.stringify({
        message: "Meal added successfully",
        mealId: result.insertedId,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding meal:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await client.close();
  }
}
