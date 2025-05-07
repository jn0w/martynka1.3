import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function POST(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await client.connect();
    const db = client.db("testDatabase");
    const collection = db.collection("weightEntries");

    //  Extract token from cookies instead of Authorization header
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("token=")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    //  Extract the token safely
    const token = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Token missing" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    //  Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { date, weight } = await req.json();

    if (!date || !weight) {
      return new Response(
        JSON.stringify({ error: "Date and weight are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Save weight entry
    await collection.insertOne({
      userId,
      date,
      weight: parseFloat(weight),
    });

    return new Response(
      JSON.stringify({ message: "Weight entry saved successfully!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving weight entry:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
