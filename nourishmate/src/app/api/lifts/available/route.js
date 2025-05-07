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

// Get available lifts for a user
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

    // Connect to database
    await client.connect();
    const db = client.db("testDatabase");
    const userLiftsCollection = db.collection("userLifts");

    // Get user's lift preferences
    let userLifts = await userLiftsCollection.findOne({ userId });

    // If no preferences exist yet, create default lifts
    if (!userLifts) {
      const defaultLifts = [
        "Bench Press",
        "Squat",
        "Deadlift",
        "Overhead Press",
        "Barbell Row",
        "Pull-ups",
      ];

      await userLiftsCollection.insertOne({
        userId,
        availableLifts: defaultLifts,
        selectedLifts: ["Bench Press", "Squat", "Deadlift"],
        createdAt: new Date().toISOString(),
      });

      userLifts = {
        availableLifts: defaultLifts,
        selectedLifts: ["Bench Press", "Squat", "Deadlift"],
      };
    }

    return new Response(JSON.stringify(userLifts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching available lifts:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}

// Update available lifts for a user
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

    const { availableLifts, selectedLifts, newCustomLift } =
      await request.json();

    // Connect to database
    await client.connect();
    const db = client.db("testDatabase");
    const userLiftsCollection = db.collection("userLifts");

    const existingUserLifts = await userLiftsCollection.findOne({ userId });

    if (existingUserLifts) {
      // Update existing document
      const updateData = {};

      if (availableLifts) {
        updateData.availableLifts = availableLifts;
      }

      if (selectedLifts) {
        updateData.selectedLifts = selectedLifts;
      }

      if (newCustomLift) {
        // Add new custom lift if it doesn't already exist
        if (!existingUserLifts.availableLifts.includes(newCustomLift)) {
          updateData.availableLifts = [
            ...existingUserLifts.availableLifts,
            newCustomLift,
          ];

          // Also add to selected lifts
          updateData.selectedLifts = [
            ...(selectedLifts || existingUserLifts.selectedLifts),
            newCustomLift,
          ];
        }
      }

      await userLiftsCollection.updateOne({ userId }, { $set: updateData });
    } else {
      // Create new document if it doesn't exist
      let newAvailableLifts = [
        "Bench Press",
        "Squat",
        "Deadlift",
        "Overhead Press",
        "Barbell Row",
        "Pull-ups",
      ];

      let newSelectedLifts = ["Bench Press", "Squat", "Deadlift"];

      if (newCustomLift && !newAvailableLifts.includes(newCustomLift)) {
        newAvailableLifts.push(newCustomLift);
        newSelectedLifts.push(newCustomLift);
      }

      await userLiftsCollection.insertOne({
        userId,
        availableLifts: availableLifts || newAvailableLifts,
        selectedLifts: selectedLifts || newSelectedLifts,
        createdAt: new Date().toISOString(),
      });
    }

    // Get updated lifts
    const updatedUserLifts = await userLiftsCollection.findOne({ userId });

    return new Response(JSON.stringify(updatedUserLifts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating available lifts:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
