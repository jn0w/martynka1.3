"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function AccountPage() {
  const [userData, setUserData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [streak, setStreak] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchBudget();
    fetchStreak();
    fetchFavoriteMeals();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/check-auth", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("User data from check-auth:", data.user);
        setUserData(data.user);
      } else {
        console.log("Not authorized");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error:", error);
      router.push("/login");
    }
  };

  const fetchBudget = async () => {
    try {
      const response = await fetch("/api/budget-tracker");
      if (response.ok) {
        const data = await response.json();
        setBudgetData(data);
      } else {
        console.log("No budget data available");
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };

  const fetchStreak = async () => {
    try {
      const response = await fetch("/api/streak/get-streak", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setStreak(data.streak);
      } else {
        console.log("No streak data available");
      }
    } catch (error) {
      console.error("Error fetching streak data:", error);
    }
  };

  const fetchFavoriteMeals = async () => {
    try {
      const response = await fetch("/api/favorites", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFavoriteMeals(data || []);
      } else {
        console.log("No favorite meals available");
      }
    } catch (error) {
      console.error("Error fetching favorite meals:", error);
    }
  };

  const removeFromFavorites = async (mealId) => {
    try {
      const response = await fetch(`/api/favorites/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mealId }),
        credentials: "include",
      });
      if (response.ok) {
        setFavoriteMeals(favoriteMeals.filter((meal) => meal._id !== mealId));
        toast.success("Meal removed from favorites");
      }
    } catch (error) {
      console.error("Error removing meal from favorites:", error);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-blue-200 mb-4"></div>
              <div className="h-4 w-48 bg-blue-200 rounded mb-3"></div>
              <div className="h-3 w-32 bg-blue-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Account Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-white rounded-full p-1 mr-4">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {userData.name}
                </h1>
                <p className="text-blue-100">{userData.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/calorie-calculator")}
                className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition"
              >
                Update Calories
              </button>
              <button
                onClick={() => router.push("/budget-tracker")}
                className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition"
              >
                Manage Budget
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("nutrition")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "nutrition"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Nutrition
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "budget"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Budget
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "favorites"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Favorite Meals
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Profile Information
                </h2>
                <button
                  onClick={() => router.push(`../manageUser/${userData.id}`)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{userData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">
                    {userData.phoneNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {userData.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Nutrition Summary Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Nutrition Summary
                </h2>
                <button
                  onClick={() => router.push("/calorie-calculator")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
              {userData.caloricData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-500">Daily Target</p>
                      <p className="text-xl font-bold text-blue-600">
                        {userData.caloricData.targetCalories} kcal
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-500">Activity Level</p>
                      <p className="text-lg font-medium text-green-600">
                        {userData.activityLevel || "Not set"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Goal</p>
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="font-medium text-indigo-600">
                        {userData.goal || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">
                    No nutrition data available
                  </p>
                  <button
                    onClick={() => router.push("/calorie-calculator")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                  >
                    Calculate Now
                  </button>
                </div>
              )}
            </div>

            {/* Budget Summary Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Budget Summary
                </h2>
                <button
                  onClick={() => router.push("/budget-tracker")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
              {budgetData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="text-xl font-bold text-yellow-600">
                        €{budgetData.budgetAmount}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="text-lg font-medium text-purple-600 capitalize">
                        {budgetData.budgetType}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Recent Expenses
                    </p>
                    {budgetData.expenses && budgetData.expenses.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {budgetData.expenses
                          .slice(0, 3)
                          .map((expense, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center bg-gray-50 p-2 rounded"
                            >
                              <span className="text-sm">
                                {expense.description}
                              </span>
                              <span className="font-medium">
                                €{expense.amount}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No recent expenses
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No budget data available</p>
                  <button
                    onClick={() => router.push("/budget-tracker")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                  >
                    Set Budget
                  </button>
                </div>
              )}
            </div>

            {/* Streak Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Weight Logging Streak
              </h2>
              <div className="flex items-center justify-center flex-col">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
                    <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600">
                          {streak}
                        </div>
                        <div className="text-sm text-gray-500">days</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 bg-yellow-400 rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <p className="text-center text-gray-600 mb-4">
                  Keep logging your weight daily to maintain your streak!
                </p>
                <Link
                  href="/calorie-calculator"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                >
                  Log Today
                </Link>
              </div>
            </div>

            {/* Favorite Meals Preview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Favorite Meals
                </h2>
                <button
                  onClick={() => setActiveTab("favorites")}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View All
                </button>
              </div>
              {favoriteMeals.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {favoriteMeals.slice(0, 3).map((meal) => (
                    <div
                      key={meal._id}
                      className="flex items-center border rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{meal.name}</h4>
                        <div className="flex text-sm text-gray-500">
                          <span className="mr-3">
                            {meal.totalCalories} kcal
                          </span>
                          <span>
                            €{meal.estimatedCost?.toFixed(2) || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No favorite meals yet</p>
                  <Link
                    href="/exploreMeals"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Explore meals
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nutrition Tab */}
        {activeTab === "nutrition" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Nutrition Information
            </h2>

            {userData.caloricData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-3">
                        Caloric Needs
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Basal Metabolic Rate (BMR)
                            </span>
                            <span className="font-bold text-blue-600">
                              {userData.caloricData.bmr} kcal/day
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            The calories your body needs at complete rest
                          </p>
                        </div>

                        <div className="bg-indigo-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Total Daily Energy Expenditure (TDEE)
                            </span>
                            <span className="font-bold text-indigo-600">
                              {userData.caloricData.tdee} kcal/day
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Your BMR adjusted for activity level
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Daily Calorie Target
                            </span>
                            <span className="font-bold text-green-600">
                              {userData.caloricData.targetCalories} kcal/day
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Adjusted for your specific goal
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-3">
                        Personal Factors
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Activity Level
                            </span>
                            <span className="font-medium text-purple-600">
                              {userData.activityLevel || "Not specified"}
                            </span>
                          </div>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Goal</span>
                            <span className="font-medium text-yellow-600">
                              {userData.goal || "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-3">
                        Recommended Macros
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-sm text-gray-500">Protein</div>
                            <div className="font-bold text-gray-800">25%</div>
                            <div className="text-sm text-gray-600">
                              {Math.round(
                                (userData.caloricData.targetCalories * 0.25) / 4
                              )}{" "}
                              g
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Carbs</div>
                            <div className="font-bold text-gray-800">50%</div>
                            <div className="text-sm text-gray-600">
                              {Math.round(
                                (userData.caloricData.targetCalories * 0.5) / 4
                              )}{" "}
                              g
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Fat</div>
                            <div className="font-bold text-gray-800">25%</div>
                            <div className="text-sm text-gray-600">
                              {Math.round(
                                (userData.caloricData.targetCalories * 0.25) / 9
                              )}{" "}
                              g
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 text-center">
                          These are general recommendations. Adjust based on
                          your specific needs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Nutrition Data Available
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Calculate your calories based on your personal details and
                  goals to get personalized nutrition recommendations.
                </p>
                <button
                  onClick={() => router.push("/calorie-calculator")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition"
                >
                  Calculate Now
                </button>
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => router.push("/calorie-calculator")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition"
              >
                Update Nutrition Information
              </button>
            </div>
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === "budget" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Budget Management
            </h2>

            {budgetData ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <p className="text-gray-500 text-sm mb-1">Budget Amount</p>
                    <p className="text-3xl font-bold text-blue-600">
                      €{budgetData.budgetAmount}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 capitalize">
                      {budgetData.budgetType} budget
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <p className="text-gray-500 text-sm mb-1">Remaining</p>
                    <p className="text-3xl font-bold text-green-600">
                      €
                      {(
                        budgetData.budgetAmount -
                        (budgetData.expenses?.reduce(
                          (total, exp) => total + exp.amount,
                          0
                        ) || 0)
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Available to spend
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6 text-center">
                    <p className="text-gray-500 text-sm mb-1">Spent</p>
                    <p className="text-3xl font-bold text-red-600">
                      €
                      {(
                        budgetData.expenses?.reduce(
                          (total, exp) => total + exp.amount,
                          0
                        ) || 0
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Total expenses</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-700 mb-4">
                    Recent Expenses
                  </h3>
                  {budgetData.expenses && budgetData.expenses.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Description
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Category
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {budgetData.expenses.map((expense, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {expense.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {expense.category || "Uncategorized"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(expense.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                                €{expense.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No expenses recorded yet</p>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => router.push("/budget-tracker")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition"
                  >
                    Manage Budget
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Budget Set Up
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Set up a budget to track your food expenses and stay within
                  your financial goals.
                </p>
                <button
                  onClick={() => router.push("/budget-tracker")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition"
                >
                  Set Up Budget
                </button>
              </div>
            )}
          </div>
        )}

        {/* Favorite Meals Tab */}
        {activeTab === "favorites" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Favorite Meals
            </h2>

            {favoriteMeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteMeals.map((meal) => (
                  <div
                    key={meal._id}
                    className="border rounded-lg hover:shadow-md transition p-4 relative"
                  >
                    <button
                      onClick={() => removeFromFavorites(meal._id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    <h3 className="font-bold text-lg mb-2 pr-8">{meal.name}</h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {meal.tags &&
                        meal.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-red-500 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{meal.totalCalories} kcal</span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-green-500 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>€{meal.estimatedCost?.toFixed(2) || "N/A"}</span>
                      </div>
                    </div>

                    {/* Nutritional Information */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Nutritional Information
                      </h4>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Calories</p>
                          <p className="font-medium text-gray-900">
                            {meal.totalCalories}
                          </p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Protein</p>
                          <p className="font-medium text-gray-900">
                            {meal.totalProtein}g
                          </p>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Carbs</p>
                          <p className="font-medium text-gray-900">
                            {meal.totalCarbs}g
                          </p>
                        </div>
                        <div className="bg-red-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Fats</p>
                          <p className="font-medium text-gray-900">
                            {meal.totalFats || 0}g
                          </p>
                        </div>
                      </div>

                      {/* Ingredients */}
                      <h4 className="font-medium text-gray-700 mb-2">
                        Ingredients
                      </h4>
                      {meal.ingredients && meal.ingredients.length > 0 ? (
                        <ul className="space-y-1 text-gray-600 text-sm">
                          {meal.ingredients.map((ingredient, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-500 mr-1">•</span>
                              <span>
                                <span className="font-medium">
                                  {ingredient.name}
                                </span>
                                {ingredient.quantity &&
                                  ` - ${ingredient.quantity}`}{" "}
                                {ingredient.unit || ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No ingredients available
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <div className="mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Favorite Meals
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Explore our meal options and add your favorites to quickly
                  access them later.
                </p>
                <button
                  onClick={() => router.push("/exploreMeals")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition"
                >
                  Explore Meals
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}
