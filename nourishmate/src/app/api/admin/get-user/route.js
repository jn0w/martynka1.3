import { MongoClient, ObjectId } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function POST(req) {
  try {
    const { userId } = await req.json();
    if (!userId) return new Response("User ID missing", { status: 400 });

    await client.connect();
    const db = client.db("testDatabase");
    const user = await db
      .collection("userCollection")
      .findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });

    if (!user) return new Response("User not found", { status: 404 });

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response("Error fetching user", { status: 500 });
  } finally {
    await client.close();
  }
}
