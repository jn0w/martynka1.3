import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    const { name, email, password, address, phoneNumber } =
      await request.json();
    if (!email || !password || !name) {
      return new Response("Missing required fields", { status: 400 });
    }

    await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return new Response("User already exists", { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with "user" role by default
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      address,
      phoneNumber,
      role: "user", // Default role for registered users
      createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        id: result.insertedId,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await client.close();
  }
}
