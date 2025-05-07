// src/app/api/streak/get-streak/route.js
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function getUserIdFromToken(request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const token = cookieHeader.split("token=")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const userId = await getUserIdFromToken(request);
    console.log("User ID:", userId);

    if (!userId) {
      console.log("Unauthorized access attempt");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await client.connect();
    console.log("Connected to database");

    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    console.log("User data fetched:", user);

    if (!user) {
      console.log("User not found");
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const streak = user.streakData?.streak || 0;
    console.log("Fetched streak:", streak);

    return new Response(JSON.stringify({ streak }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}
