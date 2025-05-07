// src/app/api/save-user-data/route.js
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";

export async function POST(request) {
  try {
    const { activityLevel, goal } = await request.json();

    // Retrieve the token from cookies
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader?.split("token=")[1];
    if (!token) return new Response("Unauthorized", { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    // Update the user's document with the new data
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { activityLevel, goal } }
    );

    return new Response(
      JSON.stringify({ message: "Data saved successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating user data:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await client.close();
  }
}
