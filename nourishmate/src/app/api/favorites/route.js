import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";

export async function GET(request) {
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

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");
    const mealsCollection = db.collection("meals");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { favorites: 1 } }
    );

    if (!user || !user.favorites) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const favoriteMeals = await mealsCollection
      .find({ _id: { $in: user.favorites } })
      .toArray();

    return new Response(JSON.stringify(favoriteMeals), { status: 200 });
  } catch (error) {
    console.error("Error fetching favorite meals:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
