import { MongoClient } from "mongodb";
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

    // ✅ Extract token from cookies
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("token=")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Token missing" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Verify user token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = decoded.id;
    const { data } = await req.json();

    if (!data || !Array.isArray(data)) {
      return new Response(
        JSON.stringify({ error: "Invalid CSV data format." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Attach userId to each entry before saving
    const weightEntries = data.map((entry) => ({
      userId,
      date: entry.date,
      weight: entry.weight,
    }));

    await collection.insertMany(weightEntries);
    console.log("✅ CSV data successfully saved!");

    return new Response(
      JSON.stringify({ message: "CSV data successfully saved!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error saving CSV data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
