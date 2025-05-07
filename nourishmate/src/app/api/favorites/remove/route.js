import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";

export async function POST(request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const token = cookieHeader.split("token=")[1];
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.id;

    const { mealId } = await request.json();

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { favorites: new ObjectId(mealId) } }
    );

    return new Response(
      JSON.stringify({ message: "Meal removed from favorites" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing meal from favorites:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
