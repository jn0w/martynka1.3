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

// **DELETE: Remove Expense from Database**
export async function DELETE(request) {
  let connection = null;

  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    // Get expenseId from request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({
          message: "Invalid request body",
          error: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Request data received:", requestData);

    const { expenseId } = requestData;
    if (!expenseId) {
      return new Response(
        JSON.stringify({
          message: "Expense ID missing",
          received: requestData,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Connect to the database
    connection = await client.connect();
    const db = client.db("testDatabase");
    const usersCollection = db.collection("userCollection");

    // Find the user and expenses
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user || !user.budgetData) {
      return new Response(
        JSON.stringify({ message: "User or budget data not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize expenses array if it doesn't exist
    if (!user.budgetData.expenses) {
      return new Response(
        JSON.stringify({ message: "No expenses found to delete" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Log current expenses and the ID to delete
    console.log(
      "Current expenses:",
      JSON.stringify(user.budgetData.expenses, null, 2)
    );
    console.log("Expense ID to delete:", expenseId);

    // Find the expense and delete it by matching the id field
    const updatedExpenses = user.budgetData.expenses.filter(
      (expense) => expense.id.toString() !== expenseId
    );

    // Check if anything was actually removed
    if (updatedExpenses.length === user.budgetData.expenses.length) {
      return new Response(
        JSON.stringify({
          message: "Expense not found with the given ID",
          expenseId: expenseId,
          expenseIdsInDB: user.budgetData.expenses.map((e) =>
            e.id ? e.id.toString() : null
          ),
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { "budgetData.expenses": updatedExpenses } }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "No changes made to the database" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Expense removed successfully",
        remaining: updatedExpenses.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting expense:", error);
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    if (connection) {
      await client.close();
    }
  }
}
