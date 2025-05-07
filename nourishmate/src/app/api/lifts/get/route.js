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

export async function GET(request) {
  try {
    // Authenticate user
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const liftType = searchParams.get("liftType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Connect to database
    await client.connect();
    const db = client.db("testDatabase");
    const liftCollection = db.collection("liftEntries");

    // Build query
    let query = { userId };

    if (liftType) {
      query.liftType = liftType;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    // Fetch lift entries
    const liftEntries = await liftCollection
      .find(query)
      .sort({ date: 1 })
      .toArray();

    return new Response(JSON.stringify(liftEntries), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching lift entries:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
