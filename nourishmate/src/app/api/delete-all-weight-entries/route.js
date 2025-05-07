import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function POST(req) {
  try {
    await client.connect();
    const db = client.db("testDatabase");
    const collection = db.collection("weightEntries");

    // Extract token from cookies
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("token=")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Token missing" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify user token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = decoded.id;

    // Delete all weight entries for the user
    const deleteResult = await collection.deleteMany({ userId });

    if (deleteResult.deletedCount === 0) {
      return new Response(
        JSON.stringify({ message: "No weight entries found for user" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "All weight entries deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting weight entries:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
