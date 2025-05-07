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

    const mealData = await request.json();
    const { meals } = mealData;

    // Always use today's date
    const today = new Date().toISOString().split("T")[0];
    console.log(`Logging meals for today: ${today}`);

    await client.connect();
    const db = client.db("testDatabase");
    const mealLogCollection = db.collection("mealLogs");

    // Check if there's already an entry for today and this user
    const existingLog = await mealLogCollection.findOne({
      userId: new ObjectId(userId),
      date: today,
    });

    let result;

    if (existingLog) {
      // Check if this is a single-meal addition or a full replacement
      const isSingleMealAddition =
        meals.length === 1 && request.headers.get("X-Meal-Operation") === "add";

      if (isSingleMealAddition) {
        // Add a single meal to the existing array
        result = await mealLogCollection.updateOne(
          { userId: new ObjectId(userId), date: today },
          { $push: { meals: { $each: meals } } }
        );
      } else {
        // Replace the entire meals array (useful for both full updates and deletions)
        result = await mealLogCollection.updateOne(
          { userId: new ObjectId(userId), date: today },
          { $set: { meals: meals } }
        );
      }
    } else {
      // Create new log for today
      result = await mealLogCollection.insertOne({
        userId: new ObjectId(userId),
        date: today,
        meals: meals,
        createdAt: new Date(),
      });
    }

    return new Response(
      JSON.stringify({
        message: existingLog ? "Meal log updated" : "Meal log created",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error logging meal:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
