import { MongoClient, ObjectId } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    const { userId, ...updateData } = await request.json();

    // Ensure we only update allowed fields
    const allowedFields = [
      "name",
      "email",
      "activityLevel",
      "goal",
      "phoneNumber",
      "address",
    ];
    const filteredUpdateData = {};

    // Only include fields that are allowed and have values
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        filteredUpdateData[key] = updateData[key];
      }
    });

    await client.connect();
    const db = client.db("testDatabase");

    const result = await db.collection("userCollection").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: filteredUpdateData,
      }
    );

    if (result.modifiedCount === 0) {
      return new Response(JSON.stringify({ message: "No changes made." }), {
        status: 200, // Changed from 400 to 200 - it's not an error if no changes were needed
      });
    }

    return new Response(
      JSON.stringify({ message: "User updated successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response(
      JSON.stringify({ message: "Error updating user", error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await client.close();
  }
}
