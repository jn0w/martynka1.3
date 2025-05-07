import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Function to convert budget (weekly or monthly) to daily budget category
function getBudgetCategory(budgetAmount, budgetType) {
  let dailyBudget =
    budgetType === "weekly" ? budgetAmount / 7 : budgetAmount / 30;

  if (dailyBudget <= 10) return "low";
  if (dailyBudget <= 20) return "medium";
  return "high";
}

// Function to determine calorie category
function getCalorieCategory(targetCalories) {
  if (targetCalories <= 1800) return "low";
  if (targetCalories <= 2500) return "moderate";
  return "high";
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get("email");

  if (!userEmail) {
    return new Response(JSON.stringify({ message: "User email is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await client.connect();
    const db = client.db("testDatabase");

    // **Fetch user data from MongoDB**
    const user = await db
      .collection("userCollection")
      .findOne(
        { email: userEmail },
        { projection: { caloricData: 1, budgetData: 1 } }
      );

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert budget properly based on type (weekly or monthly)
    const budgetCategory = getBudgetCategory(
      user.budgetData?.budgetAmount || 140,
      user.budgetData?.budgetType || "weekly"
    );

    // Get calorie category based on user data
    const calorieCategory = getCalorieCategory(
      user.caloricData?.targetCalories || 2000
    );

    console.log(`Filtering meals for:
      Budget Category: ${budgetCategory} (includes lower categories),
      Calorie Category: ${calorieCategory}`);

    // **Determine budget filtering logic**
    let budgetFilter = [];
    if (budgetCategory === "high") {
      budgetFilter = ["low", "medium", "high"];
    } else if (budgetCategory === "medium") {
      budgetFilter = ["low", "medium"];
    } else {
      budgetFilter = ["low"];
    }

    // **Filter meals based on budget category and calorie category**
    const mealsCollection = db.collection("meals");
    const meals = await mealsCollection
      .find({
        budgetCategory: { $in: budgetFilter }, // ✅ Includes meals within user's budget and lower
        calorieCategory: calorieCategory, // ✅ Match calorie range exactly
      })
      .toArray();

    return new Response(JSON.stringify(meals), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching personalized meals:", error);
    return new Response("Error fetching meals", { status: 500 });
  } finally {
    await client.close();
  }
}
