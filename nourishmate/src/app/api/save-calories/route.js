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
      console.error("No cookie header found.");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const token = cookieHeader.split("token=")[1];
    if (!token) {
      console.error("No token found in cookie.");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error("Token verification failed:", error);
      return new Response(JSON.stringify({ message: "Invalid token" }), {
        status: 401,
      });
    }

    const userId = decodedToken.id;
    console.log("Decoded user ID:", userId);

    // ✅ Include activityLevel & goal in the request
    const { bmr, tdee, targetCalories, activityLevel, goal } =
      await request.json();
    console.log("Received data:", {
      bmr,
      tdee,
      targetCalories,
      activityLevel,
      goal,
    });

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    // ✅ Update caloricData, activityLevel, and goal in the database
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          caloricData: {
            bmr,
            tdee,
            targetCalories,
          },
          activityLevel, // ✅ Store activity level
          goal, // ✅ Store goal
        },
      }
    );

    if (result.modifiedCount === 0) {
      console.error("No document updated. User not found.");
      return new Response(
        JSON.stringify({ message: "Failed to update caloric data" }),
        { status: 500 }
      );
    }

    console.log("Caloric data, activity level, and goal updated successfully.");
    return new Response(
      JSON.stringify({ message: "Caloric data saved successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving caloric data:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await client.close();
  }
}
