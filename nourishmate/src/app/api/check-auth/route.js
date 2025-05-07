import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    console.log("Cookie Header:", cookieHeader); // Debugging log

    if (!cookieHeader || !cookieHeader.includes("token=")) {
      console.log("No token found in cookie header");
      return new Response(
        JSON.stringify({ message: "Unauthorized - No token found" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    //  Extract and verify token
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      console.log("Token extraction failed");
      return new Response(
        JSON.stringify({ message: "Unauthorized - Token missing" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify the token
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decodedToken); // Debugging log

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    //  Fetch user data including caloricData and budgetData
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decodedToken.id) },
      {
        projection: {
          role: 1,
          activityLevel: 1,
          goal: 1,
          caloricData: 1,
          budgetData: 1,
          address: 1,
          phoneNumber: 1,
        },
      }
    );

    if (!user) {
      console.log("User not found in database");
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    //  Ensure caloricData and budgetData are **ALWAYS** defined
    const caloricData = user.caloricData || {
      bmr: 0,
      tdee: 0,
      targetCalories: 0,
    };

    const budgetData = user.budgetData || {
      budgetAmount: 0,
      budgetType: "weekly",
      expenses: [],
    };

    return new Response(
      JSON.stringify({
        user: {
          id: decodedToken.id,
          name: decodedToken.name,
          email: decodedToken.email,
          isAdmin: user.role === "admin",
          activityLevel: user.activityLevel || "Not specified",
          goal: user.goal || "Not specified",
          caloricData,
          budgetData,
          budgetAmount: budgetData.budgetAmount || 0,
          budgetType: budgetData.budgetType || "weekly",
          address: user.address || "Not provided",
          phoneNumber: user.phoneNumber || "Not provided",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Token verification failed:", error);
    return new Response(
      JSON.stringify({ message: "Unauthorized - Invalid token" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await client.close();
  }
}
