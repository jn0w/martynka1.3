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
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { budgetData: 1 } }
    );

    if (!user || !user.budgetData) {
      return new Response(JSON.stringify({ message: "No budget data found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user.budgetData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching budget:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await client.close();
  }
}
