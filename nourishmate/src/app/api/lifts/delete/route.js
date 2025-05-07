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
    const body = await request.json();
    const liftId = body.liftId;

    console.log("Received delete request for lift ID:", liftId);

    // Validate lift ID
    if (!liftId) {
      return new Response(
        JSON.stringify({
          error: "Lift ID is required",
          receivedData: body,
        }),
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

    // Delete lift entry (ensuring it belongs to the user)
    const result = await liftCollection.deleteOne({
      _id: new ObjectId(liftId),
      userId,
    });

    console.log("Delete operation result:", result);

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({
          error: "Lift entry not found or unauthorized to delete",
          liftId: liftId,
          userId: userId,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Lift entry deleted successfully",
        deletedId: liftId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting lift entry:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await client.close();
  }
}
