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
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return null;
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { mealIndex } = await request.json();

    // Always use today's date
    const today = new Date().toISOString().split("T")[0];
    console.log(`Deleting meal at index ${mealIndex} for today: ${today}`);

    await client.connect();
    const db = client.db("testDatabase");
    const mealLogCollection = db.collection("mealLogs");

    // Find the current document for today
    const existingLog = await mealLogCollection.findOne({
      userId: new ObjectId(userId),
      date: today,
    });

    if (
      !existingLog ||
      !existingLog.meals ||
      mealIndex >= existingLog.meals.length
    ) {
      return new Response(JSON.stringify({ message: "Meal not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create a new array without the meal to delete
    const updatedMeals = [...existingLog.meals];
    updatedMeals.splice(mealIndex, 1);

    // Replace the meals array
    const result = await mealLogCollection.updateOne(
      { userId: new ObjectId(userId), date: today },
      { $set: { meals: updatedMeals } }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Failed to delete meal" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Meal deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting meal:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
