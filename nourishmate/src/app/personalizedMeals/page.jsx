"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PersonalizedMealsPage() {
  const [userData, setUserData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/check-auth", {
          credentials: "include",
        });

        if (!response.ok) {
          console.error("Failed to fetch user data");
          setLoading(false);
          setIsAuthChecked(true);
          return;
        }

        const data = await response.json();
        if (!data.user || !data.user.email) {
          console.error("User data or email is missing in check-auth response");
          setLoading(false);
          setIsAuthChecked(true);
          return;
        }

        setUserData(data.user);
        setIsAuthChecked(true);

        if (data.user.email) {
          const mealResponse = await fetch(
            `/api/personalizedMeals?email=${encodeURIComponent(
              data.user.email
            )}`
          );
          if (mealResponse.ok) {
            const mealData = await mealResponse.json();
            setMeals(mealData);
          } else {
            console.error("Failed to fetch meals");
          }
        }
      } catch (error) {
        console.error("Error fetching personalized meals:", error);
        setIsAuthChecked(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const addToFavorites = async (meal) => {
    try {
      const response = await fetch("/api/favorites/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mealId: meal._id }),
        credentials: "include",
      });

      if (response.ok) {
        setFavorites((prevFavorites) => [...prevFavorites, meal]);
        toast.success("Meal added to favorites!");
      } else {
        toast.error("Failed to add meal to favorites.");
      }
    } catch (error) {
      console.error("Error adding meal to favorites:", error);
      toast.error("An error occurred while adding to favorites.");
    }
  };

  const logMeal = async (meal) => {
    try {
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

      // First, get the current meals for today
      const getResponse = await fetch(
        `/api/meal-logger/get-logs?date=${today}`,
        {
          credentials: "include",
        }
      );

      let currentMeals = [];
      if (getResponse.ok) {
        const data = await getResponse.json();
        currentMeals = data.meals || [];
      }

      // Create the new meal object
      const newMeal = {
        name: meal.name,
        calories: meal.totalCalories,
        protein: meal.totalProtein,
        carbs: meal.totalCarbs,
        cost: meal.estimatedCost,
        timeOfDay: "dinner", // You might want to add a selector for this
        type: "predefined",
        originalId: meal._id,
      };

      // Append the new meal to existing meals
      const updatedMeals = [...currentMeals, newMeal];

      // Now send the updated list to the API
      const response = await fetch("/api/meal-logger/log-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: today,
          meals: updatedMeals,
        }),
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Meal logged successfully!");
      } else {
        toast.error("Failed to log meal.");
      }
    } catch (error) {
      console.error("Error logging meal:", error);
      toast.error("An error occurred while logging the meal.");
    }
  };

  // If auth check is not complete, show loading spinner
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Personalized Meals
            </h1>
            <p className="text-blue-100 max-w-3xl">
              Loading your personalized recommendations...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth required screen
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Personalized Meals
            </h1>
            <p className="text-blue-100 max-w-3xl">
              Custom meal recommendations based on your nutrition needs and
              budget preferences.
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto mt-16 text-center px-4">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please log in to view your personalized meals and recommendations.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Sign In
            </button>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?
              <button
                onClick={() => router.push("/register")}
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const caloricData = userData.caloricData || { targetCalories: 0 };
  const budgetData = userData.budgetData || {
    budgetAmount: 0,
    budgetType: "weekly",
  };

  // Check if user has properly set up their profile
  const hasCompletedSetup =
    caloricData.targetCalories > 0 && budgetData.budgetAmount > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Personalized Meals
          </h1>
          <p className="text-blue-100 max-w-3xl">
            Custom meal recommendations based on your nutrition needs and budget
            preferences.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Weekly Budget
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              €{budgetData.budgetAmount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Available for meal planning
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Daily Calorie Target
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {caloricData.targetCalories} kcal
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Recommended daily intake
            </p>
          </div>
        </div>
      </div>

      {/* Meals Grid or Setup Prompt */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {hasCompletedSetup ? (
          meals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals.map((meal) => (
                <div
                  key={meal._id}
                  className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden flex flex-col h-full transition-transform duration-200 hover:shadow-lg"
                >
                  {/* Meal Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {meal.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {meal.estimatedCost
                        ? `€${meal.estimatedCost.toFixed(2)}`
                        : "Price not available"}
                    </p>
                  </div>

                  {/* Nutritional Info */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Nutritional Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Calories
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {meal.totalCalories}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Protein
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {meal.totalProtein}g
                        </p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Carbs
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {meal.totalCarbs}g
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Fats
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {meal.totalFats || 0}g
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="p-6 flex-grow overflow-auto">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Ingredients
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      {meal.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>
                            <span className="font-medium">
                              {ingredient.name}
                            </span>{" "}
                            - {ingredient.quantity} {ingredient.unit || "g"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Buttons */}
                  <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToFavorites(meal)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        Favorite
                      </button>
                      <button
                        onClick={() => logMeal(meal)}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Log Meal
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No meals found
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                No meals match your preferences. Try adjusting your budget or
                nutritional requirements.
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <svg
              className="mx-auto h-16 w-16 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
              Complete Your Profile Setup
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              To get personalized meal recommendations, you need to set up your
              budget and caloric requirements first.
            </p>
            <div className="mt-6 flex flex-col md:flex-row justify-center gap-4 px-6">
              <button
                onClick={() => router.push("/calorie-calculator")}
                className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  ></path>
                </svg>
                Set Caloric Needs
              </button>
              <button
                onClick={() => router.push("/budget-tracker")}
                className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Set Budget
              </button>
            </div>
          </div>
        )}
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
