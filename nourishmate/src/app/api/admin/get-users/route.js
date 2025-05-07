import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db("testDatabase");

    // Fetch all users except admins
    const users = await db
      .collection("userCollection")
      .find({ role: { $ne: "admin" } }) // Exclude admins
      .project({ password: 0 }) // Hide password field
      .toArray();

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Add cache control headers to prevent caching
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response("Error fetching users", { status: 500 });
  } finally {
    await client.close();
  }
}
