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

export async function PATCH(request) {
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
    const { liftId, liftType, weight, reps, sets, date } = await request.json();

    // Validate lift ID
    if (!liftId) {
      return new Response(JSON.stringify({ error: "Lift ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Connect to database
    await client.connect();
    const db = client.db("testDatabase");
    const liftCollection = db.collection("liftEntries");

    // Check if entry exists and belongs to user
    const existingLift = await liftCollection.findOne({
      _id: new ObjectId(liftId),
      userId,
    });

    if (!existingLift) {
      return new Response(
        JSON.stringify({ error: "Lift entry not found or unauthorized" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Build update data
    const updateData = {};
    if (liftType) updateData.liftType = liftType;
    if (weight) updateData.weight = parseFloat(weight);
    if (reps) updateData.reps = parseInt(reps);
    if (sets) updateData.sets = parseInt(sets);
    if (date) updateData.date = date;
    updateData.updatedAt = new Date().toISOString();

    // Update lift entry
    const result = await liftCollection.updateOne(
      { _id: new ObjectId(liftId), userId },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to update lift entry" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Lift entry updated successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating lift entry:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
