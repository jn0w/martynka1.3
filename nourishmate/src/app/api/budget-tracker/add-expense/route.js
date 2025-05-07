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

// **POST: Add Expense (Fixed)**
export async function POST(request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // **Ensure JSON body is correctly parsed**
    let body;
    try {
      body = await request.json();
      console.log("Received body:", body); // Debugging log
    } catch (error) {
      console.error("Error parsing JSON body:", error);
      return new Response(JSON.stringify({ message: "Invalid JSON format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // **Extract category properly**
    const { amount, description, category } = body; // FIXED: Add category
    if (!amount || !description || !category) {
      console.log("Missing expense details:", {
        amount,
        description,
        category,
      });
      return new Response(
        JSON.stringify({ message: "Missing expense details" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newExpense = {
      id: new ObjectId(), // Unique ID for deletion
      amount,
      description,
      category, // FIXED: Save category
      date: new Date(),
    };

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { "budgetData.expenses": newExpense } }
    );

    if (result.modifiedCount === 0) {
      console.log("Failed to update DB for user:", userId);
      return new Response(
        JSON.stringify({ message: "Failed to add expense" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Expense added successfully:", newExpense);
    return new Response(
      JSON.stringify({
        message: "Expense added successfully",
        expense: newExpense,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error adding expense:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}

export async function GET(request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("User ID:", userId);
    console.log("User data:", user);

    const streak = user?.streakData?.streak || 0;
    return new Response(JSON.stringify({ streak }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
