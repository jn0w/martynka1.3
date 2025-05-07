const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// MongoDB connection URI
const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db("testDatabase"); // Replace with your database name
    const usersCollection = db.collection("userCollection");

    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({
      email: "admin@gmail.com",
    });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Admin user data
    const adminUser = {
      name: "Admin",
      email: "admin@gmail.com",
      password: await bcrypt.hash("admin", 10), // Hash the password
      address: "Admin Address",
      phoneNumber: "0000000000",
      role: "admin",
      createdAt: new Date(),
    };

    // Insert the admin user into the collection
    await usersCollection.insertOne(adminUser);
    console.log("Admin user created successfully!");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}

// Run the function
createAdminUser();
