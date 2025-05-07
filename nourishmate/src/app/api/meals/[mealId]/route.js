import { MongoClient, ObjectId } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const dbName = "testDatabase"; // replace with your actual database name

export async function DELETE(request, { params }) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("meals");

    const { mealId } = params;
    const result = await collection.deleteOne({ _id: new ObjectId(mealId) });

    if (result.deletedCount === 1) {
      return new Response(
        JSON.stringify({ message: "Meal deleted successfully" }),
        { status: 200 }
      );
    } else {
      return new Response(JSON.stringify({ message: "Meal not found" }), {
        status: 404,
      });
    }
  } catch (error) {
    console.error("Error deleting meal:", error);
    return new Response(JSON.stringify({ message: "Failed to delete meal" }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
