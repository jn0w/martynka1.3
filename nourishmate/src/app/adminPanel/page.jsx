"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function AdminPanel() {
  // Meal Management
  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState("");
  const [category, setCategory] = useState("");
  const [calorieCategory, setCalorieCategory] = useState("");
  const [budgetCategory, setBudgetCategory] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState("");
  const [unit, setUnit] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // User Management
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMeals();
    fetchUsers();

    // Simple URL check without using useSearchParams
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("refresh")) {
        // Remove the parameter by replacing the URL without it
        window.history.replaceState({}, "", "/adminPanel");
      }
    }
  }, []);

  const fetchMeals = async () => {
    try {
      const res = await fetch("/api/meals");
      if (!res.ok) throw new Error(`Error fetching meals: ${res.status}`);
      const data = await res.json();
      setMeals(data);
    } catch (error) {
      console.error("Failed to fetch meals:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      // Add cache-busting timestamp parameter to prevent caching
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/admin/get-users?t=${timestamp}`, {
        // Add cache control headers in the request
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddIngredient = () => {
    if (!ingredientName || !unit || !calories || !protein || !carbs || !fats) {
      alert("Please enter all ingredient details including macros.");
      return;
    }

    const newIngredient = {
      name: ingredientName,
      unit,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
    };

    setIngredients([...ingredients, newIngredient]);

    setIngredientName("");
    setUnit("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
  };

  const handleAddMeal = async () => {
    if (
      !mealName ||
      !calorieCategory ||
      !budgetCategory ||
      !estimatedCost ||
      ingredients.length === 0
    ) {
      alert("Please fill in all fields and add at least one ingredient.");
      return;
    }

    const newMeal = {
      name: mealName,
      category,
      calorieCategory,
      budgetCategory,
      estimatedCost: parseFloat(estimatedCost),
      ingredients,
      totalCalories: ingredients.reduce(
        (sum, ing) => sum + Number(ing.calories || 0),
        0
      ),
      totalProtein: ingredients.reduce(
        (sum, ing) => sum + Number(ing.protein || 0),
        0
      ),
      totalCarbs: ingredients.reduce(
        (sum, ing) => sum + Number(ing.carbs || 0),
        0
      ),
      totalFats: ingredients.reduce(
        (sum, ing) => sum + Number(ing.fats || 0),
        0
      ),
    };

    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMeal),
      });

      if (!res.ok) throw new Error("Failed to add meal");
      const data = await res.json();

      setMeals([...meals, { ...newMeal, _id: data.mealId }]);
      setMealName("");
      setCategory("");
      setCalorieCategory("");
      setBudgetCategory("");
      setEstimatedCost("");
      setIngredients([]);
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      const res = await fetch(`/api/meals/${mealId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete meal");
      setMeals(meals.filter((meal) => meal._id !== mealId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("Failed to delete user");

      // Update local state immediately
      setUsers(users.filter((user) => user._id !== userId));

      // Force refetch to ensure UI is synced with database
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-full mx-auto py-12 px-6 flex space-x-6">
        {/* Meal Management Box */}
        <div className="flex-1 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Meal Management
          </h2>
          <input
            type="text"
            placeholder="Meal Name"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          >
            <option value="">Select Category</option>
            <option value="budget_meals">Budget Meals</option>
            <option value="fat_loss">Fat Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
          </select>
          <select
            value={calorieCategory}
            onChange={(e) => setCalorieCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          >
            <option value="">Select Calorie Category</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
          <select
            value={budgetCategory}
            onChange={(e) => setBudgetCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          >
            <option value="">Select Budget Category</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="text"
            placeholder="Estimated Cost (€)"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">
            Add Ingredient
          </h3>
          <input
            type="text"
            placeholder="Ingredient Name"
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <input
            type="text"
            placeholder="Unit (e.g., grams)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <input
            type="number"
            placeholder="Calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <input
            type="number"
            placeholder="Protein (g)"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <input
            type="number"
            placeholder="Carbs (g)"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <input
            type="number"
            placeholder="Fats (g)"
            value={fats}
            onChange={(e) => setFats(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <button
            onClick={handleAddIngredient}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 mb-4"
          >
            Add Ingredient
          </button>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
            Ingredients
          </h4>
          <ul className="mt-4 space-y-2">
            {ingredients.map((ing, index) => (
              <li key={index} className="border-b pb-2">
                <strong>{ing.name}</strong> - {ing.unit},{" "}
                <strong>Calories:</strong> {ing.calories} kcal,{" "}
                <strong>Protein:</strong> {ing.protein}g,{" "}
                <strong>Carbs:</strong> {ing.carbs}g, <strong>Fats:</strong>{" "}
                {ing.fats}g
              </li>
            ))}
          </ul>
          <button
            onClick={handleAddMeal}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-4"
          >
            Add Meal
          </button>
        </div>

        {/* Existing Meals Box */}
        <div className="flex-1 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Existing Meals
          </h3>
          <ul className="mt-4 space-y-4">
            {meals.map((meal) => (
              <li key={meal._id} className="border-b pb-4">
                <strong>{meal.name}</strong> - {meal.category} -{" "}
                {meal.calorieCategory} - {meal.budgetCategory} - €
                {meal.estimatedCost}
                <br />
                <strong>Calories:</strong> {meal.totalCalories} kcal,{" "}
                <strong>Protein:</strong> {meal.totalProtein}g,{" "}
                <strong>Carbs:</strong> {meal.totalCarbs}g,{" "}
                <strong>Fats:</strong> {meal.totalFats}g
                <br />
                <button
                  onClick={() => handleDeleteMeal(meal._id)}
                  className="mt-2 text-sm bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition duration-300"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* User Management Box */}
        <div className="flex-1 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              User Management
            </h2>
            <button
              onClick={fetchUsers}
              disabled={refreshing}
              className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 text-sm flex items-center"
            >
              {refreshing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="border-b pb-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((user) =>
                  user.email.toLowerCase().startsWith(searchQuery)
                )
                .map((user) => (
                  <tr key={user._id}>
                    <td className="border-b py-2">
                      <a
                        href={`../manageUser/${user._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {user.email}
                      </a>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
