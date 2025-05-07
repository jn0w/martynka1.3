import { MongoClient, ObjectId } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    const { userId } = await request.json();
    await client.connect();
    const db = client.db("testDatabase");

    // First check if the user exists
    const userExists = await db.collection("userCollection").findOne({
      _id: new ObjectId(userId),
    });

    if (!userExists) {
      return new Response(JSON.stringify({ message: "User not found." }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    }

    // Delete the user
    const result = await db.collection("userCollection").deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Failed to delete user." }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "User deleted successfully",
        userId: userId,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(
      JSON.stringify({
        message: "Error deleting user",
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } finally {
    await client.close();
  }
}
