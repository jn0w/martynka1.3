import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Helper function to get user ID from JWT token
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
    // Authenticate user
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { liftType, weight, reps, sets, date } = await request.json();

    // Validate required fields
    if (!liftType || !weight || !reps || !sets || !date) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Connect to database
    await client.connect();
    const db = client.db("testDatabase");
    const liftCollection = db.collection("liftEntries");

    // Create new lift entry
    const newLift = {
      userId,
      liftType,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      sets: parseInt(sets),
      date,
      createdAt: new Date().toISOString(),
    };

    const result = await liftCollection.insertOne(newLift);

    // Get the inserted document with its _id
    const insertedLift = await liftCollection.findOne({
      _id: result.insertedId,
    });

    return new Response(
      JSON.stringify({
        message: "Lift entry saved successfully",
        lift: insertedLift, // Return the complete lift object with _id
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating lift entry:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
