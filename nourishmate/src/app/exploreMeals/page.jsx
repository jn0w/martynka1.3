"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

export default function ExploreMealsPage() {
  const [meals, setMeals] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/meals");
        if (response.ok) {
          const data = await response.json();
          setMeals(data);
        }
      } catch (error) {
        console.error("Error fetching meals:", error);
        toast.error("Failed to load meals.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
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
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch("/api/meal-logger/log-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: today,
          meals: [
            {
              name: meal.name,
              calories: meal.totalCalories,
              protein: meal.totalProtein,
              carbs: meal.totalCarbs,
              cost: meal.estimatedCost || 0,
              timeOfDay: "dinner",
              _id: meal._id,
            },
          ],
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Explore Meals
          </h1>
          <p className="text-blue-100 max-w-3xl">
            Discover delicious and nutritious meals that match your preferences.
            Add them to your favorites or log them directly.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : meals.length === 0 ? (
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
              Please check back later for new meal options.
            </p>
          </div>
        ) : (
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
                        {meal.totalFats}g
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
                    {meal.ingredients.map((ingredient) => (
                      <li key={ingredient.name} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>
                          <span className="font-medium">{ingredient.name}</span>{" "}
                          - {ingredient.quantity} {ingredient.unit}
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
        )}
      </div>
    </div>
  );
}
