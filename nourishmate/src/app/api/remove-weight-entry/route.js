import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function POST(req) {
  try {
    await client.connect();
    const db = client.db("testDatabase");
    const collection = db.collection("weightEntries");

    const { entryId } = await req.json();

    //  Debugging Log
    console.log("Received entryId:", entryId);

    if (!entryId) {
      console.error(" Missing entry ID in request.");
      return new Response(JSON.stringify({ error: "Missing entry ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    //  Ensure entryId is a valid ObjectId
    let objectId;
    try {
      objectId = new ObjectId(entryId);
    } catch (error) {
      console.error(" Invalid ObjectId format:", entryId);
      return new Response(
        JSON.stringify({ error: "Invalid entry ID format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    //  Try to delete the entry
    const deleteResult = await collection.deleteOne({ _id: objectId });

    if (deleteResult.deletedCount === 0) {
      console.warn(" Entry not found for ID:", entryId);
      return new Response(JSON.stringify({ error: "Entry not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(" Entry deleted successfully:", entryId);
    return new Response(
      JSON.stringify({ message: "Entry deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(" Error deleting weight entry:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
