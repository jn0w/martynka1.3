export async function POST(req) {
  try {
    const body = await req.json();
    const { gender, weight, height, age, activityLevel, goal, specificGoal } =
      body;

    // Validate inputs
    if (!gender || !weight || !height || !age || !activityLevel || !goal) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid input fields." }),
        { status: 400 }
      );
    }

    // Calculate BMR using the Mifflin-St Jeor Equation
    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    // Map activity level to TDEE multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const tdee = bmr * activityMultipliers[activityLevel];

    // Adjust TDEE based on specific goal
    let targetCalories = tdee;
    if (goal === "weight_loss") {
      switch (specificGoal) {
        case "mild_weight_loss":
          targetCalories = tdee - 250; // Mild weight loss
          break;
        case "weight_loss":
          targetCalories = tdee - 500; // Moderate weight loss
          break;
        case "extreme_weight_loss":
          targetCalories = tdee - 1000; // Extreme weight loss
          break;
        default:
          break;
      }
    } else if (goal === "weight_gain") {
      switch (specificGoal) {
        case "mild_weight_gain":
          targetCalories = tdee + 250; // Mild weight gain
          break;
        case "weight_gain":
          targetCalories = tdee + 500; // Moderate weight gain
          break;
        case "extreme_weight_gain":
          targetCalories = tdee + 1000; // Extreme weight gain
          break;
        default:
          break;
      }
    }

    return new Response(
      JSON.stringify({
        bmr: bmr.toFixed(2),
        tdee: tdee.toFixed(2),
        targetCalories: targetCalories.toFixed(2),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in calorie calculator:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
