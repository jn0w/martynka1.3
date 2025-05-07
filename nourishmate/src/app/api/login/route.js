import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    console.log("Received login request:", { email }); // Debugging log

    if (!email || !password) {
      console.log("Missing email or password"); // Debugging log
      return new Response("Missing email or password", { status: 400 });
    }

    await client.connect();
    console.log("Connected to database"); // Debugging log

    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      console.log("User not found"); // Debugging log
      return new Response("User not found", { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Incorrect password"); // Debugging log
      return new Response("Incorrect password", { status: 401 });
    }

    // Determine if the user is an admin
    const isAdmin = user.role === "admin";
    console.log("User role:", user.role); // Debugging log
    console.log("isAdmin set to:", isAdmin); // Debugging log

    // Retrieve activityLevel and goal from user profile
    const activityLevel = user.activityLevel || "Not specified";
    const goal = user.goal || "Not specified";

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        phoneNumber: user.phoneNumber,
        isAdmin: isAdmin, // Include admin status based on the role
        activityLevel: activityLevel, // Include activityLevel
        goal: goal, // Include goal
      },
      JWT_SECRET,
      {
        expiresIn: "1h", // Token expires in 1 hour
      }
    );

    console.log("Token generated:", token); // Debugging log for token

    return new Response(
      JSON.stringify({
        message: "Login successful",
        user: { name: user.name, email: user.email, isAdmin },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict; Secure;`, // Ensure secure cookie
        },
      }
    );
  } catch (error) {
    console.error("Error logging in:", error); // Debugging log for errors
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    console.log("Closing database connection"); // Debugging log for connection closure
    await client.close();
  }
}
