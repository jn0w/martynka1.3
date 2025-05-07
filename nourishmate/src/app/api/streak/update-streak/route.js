// src/app/api/streak/update-streak/route.js
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

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { date } = await request.json();
    // Format date as YYYY-MM-DD
    const currentDate = new Date(date);
    const formattedDate = currentDate.toISOString().split("T")[0];

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const lastLoggedDate = user?.streakData?.lastLoggedDate
      ? new Date(user.streakData.lastLoggedDate)
      : null;

    // Compare dates using the simple date format
    const currentDay = currentDate.toISOString().split("T")[0];
    const lastDay = lastLoggedDate
      ? lastLoggedDate.toISOString().split("T")[0]
      : null;

    let newStreak = 1;

    if (lastDay) {
      // Get the next day after last logged date
      const nextDay = new Date(lastLoggedDate);
      nextDay.setDate(lastLoggedDate.getDate() + 1);
      const nextDayFormatted = nextDay.toISOString().split("T")[0];

      console.log("Current day:", currentDay);
      console.log("Last logged day:", lastDay);
      console.log("Next day:", nextDayFormatted);

      if (currentDay === nextDayFormatted) {
        // If logging on the next day, increase streak
        newStreak = (user.streakData?.streak || 0) + 1;
        console.log("Streak increased to:", newStreak);
      } else if (currentDay === lastDay) {
        // If logging on the same day, maintain streak
        newStreak = user.streakData?.streak || 1;
        console.log("Same day log, maintaining streak:", newStreak);
      } else {
        // If logging after skipping a day, reset streak
        console.log("Streak reset due to gap in days");
        // Calculate days difference to provide more detailed logging
        const daysDifference = Math.floor(
          (currentDate - lastLoggedDate) / (1000 * 60 * 60 * 24)
        );
        console.log(`Streak broken - ${daysDifference} days since last log`);
      }
    }

    // Update user with new streak
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          "streakData.streak": newStreak,
          "streakData.lastLoggedDate": formattedDate,
        },
      }
    );

    return new Response(
      JSON.stringify({
        streak: newStreak,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating streak:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
