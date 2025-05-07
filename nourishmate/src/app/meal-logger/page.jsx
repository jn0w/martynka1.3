"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";

// At the top of the file, improve the debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add a new throttle helper function at the top level (outside the component)
function throttle(func, limit) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export default function MealLoggerPage() {
  const [userData, setUserData] = useState(null);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [meals, setMeals] = useState([]);
  const [availableMeals, setAvailableMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [customMeal, setCustomMeal] = useState({ name: "", calories: "" });
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [remainingCalories, setRemainingCalories] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("add");
  const router = useRouter();

  // Use a ref to track if we've already fetched data
  const dataFetchedRef = useRef(false);
  // Add a ref to track last fetch time
  const lastFetchTimeRef = useRef(0);
  // Add a ref to track if the component is mounted
  const isMountedRef = useRef(true);

  // Define fetchMeals with useCallback BEFORE any useEffect hooks that use it
  const fetchMeals = useCallback(
    async (forceRefresh = false) => {
      if (!userData) return;

      // Don't fetch if it's been less than 10 seconds since last fetch
      // UNLESS we're explicitly forcing a refresh (like when changing dates)
      const now = Date.now();
      if (!forceRefresh && now - lastFetchTimeRef.current < 10000) {
        console.log("Skipping fetch - too soon since last fetch");
        return;
      }

      // Update last fetch time
      lastFetchTimeRef.current = now;

      setIsLoading(true);
      try {
        console.log(`Fetching meals for date: ${date}`);
        const response = await fetch(`/api/meal-logger/get-logs?date=${date}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setMeals(data.meals || []);

          // Calculate calories consumed
          const consumed = (data.meals || []).reduce(
            (sum, meal) => sum + (parseInt(meal.calories) || 0),
            0
          );
          setCaloriesConsumed(consumed);

          // Calculate remaining calories
          if (userData?.caloricData) {
            setRemainingCalories(
              userData.caloricData.targetCalories - consumed
            );
          }
        }
      } catch (error) {
        console.error("Error fetching meals:", error);
        toast.error("Failed to load meals for this date");
      } finally {
        setIsLoading(false);
      }
    },
    [userData, date]
  );

  // Create a throttled version of fetchMeals instead of debounced
  const throttledFetchMeals = useCallback(
    throttle(() => {
      if (userData && isMountedRef.current) fetchMeals();
    }, 15000), // Only allow once every 15 seconds
    [fetchMeals]
  );

  // Authentication check - runs only once
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/check-auth", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);

          // Initialize remaining calories
          if (data.user.caloricData) {
            setRemainingCalories(data.user.caloricData.targetCalories);
          }
        } else {
          setUserData(null);
        }
        setIsAuthChecked(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        setUserData(null);
        setIsAuthChecked(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array = run once

  // Fetch available meals when user data is available
  useEffect(() => {
    if (userData) {
      fetchAvailableMeals();
    }
  }, [userData]);

  // Fetch meals when user data or date changes
  useEffect(() => {
    if (userData && isAuthChecked) {
      // Always fetch when date changes
      fetchMeals();
      // Reset this after fetch for future date changes
      dataFetchedRef.current = true;
    }
  }, [userData, date, isAuthChecked, fetchMeals]);

  // Update component mount/unmount effect
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Modify the visibility and focus event handlers
  useEffect(() => {
    if (!userData) return;

    // Use a single variable to track if we should fetch
    let shouldFetchOnFocus = true;

    // Define event handler functions
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        shouldFetchOnFocus &&
        isMountedRef.current
      ) {
        console.log("Visibility changed to visible, fetching meals");
        throttledFetchMeals();

        // Prevent additional fetches for a period
        shouldFetchOnFocus = false;
        setTimeout(() => {
          shouldFetchOnFocus = true;
        }, 30000); // Don't allow another visibility fetch for 30 seconds
      }
    };

    const handleFocus = () => {
      if (shouldFetchOnFocus && isMountedRef.current) {
        console.log("Window focused, fetching meals");
        throttledFetchMeals();

        // Prevent additional fetches for a period
        shouldFetchOnFocus = false;
        setTimeout(() => {
          shouldFetchOnFocus = true;
        }, 30000); // Don't allow another focus fetch for 30 seconds
      }
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [userData, throttledFetchMeals]);

  const fetchAvailableMeals = async () => {
    try {
      const response = await fetch("/api/meal-logger/available-meals");
      if (response.ok) {
        const data = await response.json();
        setAvailableMeals(data.meals || []);
      }
    } catch (error) {
      console.error("Error fetching available meals:", error);
      toast.error("Failed to load available meals");
    }
  };

  const handleAddMeal = async () => {
    if (!selectedMeal && (!customMeal.name || !customMeal.calories)) {
      toast.error("Please select a meal or enter custom meal details");
      return;
    }

    let mealToAdd;

    if (selectedMeal) {
      // Find the selected meal from available meals
      const meal = availableMeals.find((m) => m._id === selectedMeal);
      if (!meal) {
        toast.error("Selected meal not found");
        return;
      }

      mealToAdd = {
        name: meal.name,
        calories: meal.totalCalories,
        type: "predefined",
        originalId: meal._id,
      };
    } else {
      // Use custom meal
      if (isNaN(parseInt(customMeal.calories))) {
        toast.error("Calories must be a number");
        return;
      }

      mealToAdd = {
        name: customMeal.name,
        calories: parseInt(customMeal.calories),
        type: "custom",
      };
    }

    // Add the meal to the list
    const updatedMeals = [...meals, mealToAdd];

    // Update the state
    setMeals(updatedMeals);

    // Calculate new calories consumed and remaining
    const newCaloriesConsumed = updatedMeals.reduce(
      (sum, meal) => sum + (parseInt(meal.calories) || 0),
      0
    );
    setCaloriesConsumed(newCaloriesConsumed);

    if (userData.caloricData) {
      setRemainingCalories(
        userData.caloricData.targetCalories - newCaloriesConsumed
      );
    }

    // Save to database
    try {
      const response = await fetch("/api/meal-logger/log-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          meals: updatedMeals,
        }),
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Meal added successfully");

        // Reset form
        setSelectedMeal("");
        setCustomMeal({ name: "", calories: "" });

        // Switch to logged meals tab
        setActiveTab("logged");
      } else {
        toast.error("Failed to save meal");
      }
    } catch (error) {
      console.error("Error saving meal:", error);
      toast.error("Failed to save meal");
    }

    fetchMeals(); // Use direct fetch, not throttled
  };

  const handleRemoveMeal = async (index) => {
    // Update UI first for better user experience
    const updatedMeals = [...meals];
    updatedMeals.splice(index, 1);
    setMeals(updatedMeals);

    // Calculate new calories consumed and remaining
    const newCaloriesConsumed = updatedMeals.reduce(
      (sum, meal) => sum + (parseInt(meal.calories) || 0),
      0
    );
    setCaloriesConsumed(newCaloriesConsumed);

    if (userData.caloricData) {
      setRemainingCalories(
        userData.caloricData.targetCalories - newCaloriesConsumed
      );
    }

    // Use the new delete-meal endpoint
    try {
      const response = await fetch("/api/meal-logger/delete-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          mealIndex: index,
        }),
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Meal removed successfully");
        fetchMeals(); // Update the UI after deletion
      } else {
        toast.error("Failed to remove meal");
      }
    } catch (error) {
      console.error("Error removing meal:", error);
      toast.error("An error occurred while removing the meal");
    }
  };

  // For debugging purposes, add this button to force refresh
  const forceRefresh = () => {
    toast.success("Refreshing meal data...");
    fetchMeals(true); // Pass true to force a refresh
  };

  const handleClearAllMeals = async () => {
    // Ask for confirmation
    if (!confirm("Are you sure you want to remove all meals for this day?")) {
      return;
    }

    try {
      const response = await fetch("/api/meal-logger/clear-meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
        }),
        credentials: "include",
      });

      if (response.ok) {
        toast.success("All meals cleared successfully");
        setMeals([]);
        setCaloriesConsumed(0);

        if (userData?.caloricData) {
          setRemainingCalories(userData.caloricData.targetCalories);
        }
      } else {
        toast.error("Failed to clear meals");
      }
    } catch (error) {
      console.error("Error clearing meals:", error);
      toast.error("An error occurred while clearing meals");
    }
  };

  // Add this function to check if it's a new day
  const checkNewDay = useCallback(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    if (date !== today) {
      // It's a new day, update the date and clear the meals
      setDate(today);
      setMeals([]);
      setCaloriesConsumed(0);
      if (userData?.caloricData) {
        setRemainingCalories(userData.caloricData.targetCalories);
      }
    }
  }, [date, userData]);

  // Add this to your useEffect to check for new day on page load or focus
  useEffect(() => {
    checkNewDay();

    // Also check for new day when window gets focus
    const handleFocus = () => {
      checkNewDay();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkNewDay]);

  // Loading state
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Meal Logger
            </h1>
            <p className="text-blue-100 max-w-3xl">Loading your meal data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth required screen
  if (!userData && isAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Meal Logger
            </h1>
            <p className="text-blue-100 max-w-3xl">
              Track your daily meals and monitor your daily calorie intake
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto mt-16 text-center px-4">
          <div className="bg-white shadow-md rounded-lg p-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to track your meals and monitor your daily calorie
              intake.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Sign In
            </button>
            <p className="mt-4 text-sm text-gray-500">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Meal Logger
              </h1>
              <p className="text-blue-100 max-w-2xl">
                Track your daily meals and monitor your calorie intake
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button
                onClick={() => setActiveTab("add")}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium shadow-sm transition-all hover:shadow flex items-center"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                Add Meal
              </button>
              {/* Add refresh button */}
              <button
                onClick={forceRefresh}
                className="bg-transparent text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
                title="Refresh meal data"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("add")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "add"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Add Meal
            </button>
            <button
              onClick={() => setActiveTab("logged")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "logged"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Logged Meals
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Calorie Progress */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Calorie Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Target Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Daily Target
                </h3>
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {userData.caloricData ? userData.caloricData.targetCalories : 0}{" "}
                kcal
              </p>
              <p className="text-sm text-gray-500 mt-1">Daily calorie goal</p>
            </div>

            {/* Consumed Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Consumed
                </h3>
                <div className="bg-green-100 p-2 rounded-full">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {caloriesConsumed} kcal
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total calories consumed
              </p>
            </div>

            {/* Remaining Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Remaining
                </h3>
                <div
                  className={`${
                    remainingCalories >= 0 ? "bg-yellow-100" : "bg-red-100"
                  } p-2 rounded-full`}
                >
                  <svg
                    className={`w-5 h-5 ${
                      remainingCalories >= 0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
              </div>
              <p
                className={`text-3xl font-bold ${
                  remainingCalories >= 0 ? "text-yellow-600" : "text-red-600"
                }`}
              >
                {typeof remainingCalories === "number"
                  ? remainingCalories.toFixed(2)
                  : "0.00"}{" "}
                kcal
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Calories left for today
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Consumption Progress</span>
              <span className="font-medium">
                {userData.caloricData && userData.caloricData.targetCalories > 0
                  ? Math.round(
                      (caloriesConsumed / userData.caloricData.targetCalories) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  remainingCalories >= 0 ? "bg-green-500" : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    userData.caloricData &&
                      userData.caloricData.targetCalories > 0
                      ? (caloriesConsumed /
                          userData.caloricData.targetCalories) *
                          100
                      : 0
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Active Tab Content */}
        {activeTab === "add" ? (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Add a Meal
            </h2>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-700 border-b pb-2">
                Select from available meals
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="meal-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Choose a meal
                  </label>
                  <select
                    id="meal-select"
                    value={selectedMeal}
                    onChange={(e) => {
                      setSelectedMeal(e.target.value);
                      // Clear custom meal when selecting a predefined meal
                      if (e.target.value) {
                        setCustomMeal({ name: "", calories: "" });
                      }
                    }}
                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select a meal --</option>
                    {availableMeals.map((meal) => (
                      <option key={meal._id} value={meal._id}>
                        {meal.name} - {meal.totalCalories} kcal
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-700 border-b pb-2">
                Or add a custom meal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="meal-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Meal Name
                  </label>
                  <input
                    type="text"
                    id="meal-name"
                    value={customMeal.name}
                    onChange={(e) => {
                      setCustomMeal({ ...customMeal, name: e.target.value });
                      // Clear selected meal when adding custom meal
                      if (e.target.value) {
                        setSelectedMeal("");
                      }
                    }}
                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="E.g., Breakfast Sandwich"
                  />
                </div>
                <div>
                  <label
                    htmlFor="meal-calories"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Calories
                  </label>
                  <input
                    type="number"
                    id="meal-calories"
                    value={customMeal.calories}
                    onChange={(e) => {
                      setCustomMeal({
                        ...customMeal,
                        calories: e.target.value,
                      });
                      // Clear selected meal when adding custom meal
                      if (e.target.value) {
                        setSelectedMeal("");
                      }
                    }}
                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="E.g., 500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddMeal}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Add Meal to Log
            </button>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Today's Logged Meals
            </h2>

            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : meals.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {meals.map((meal, index) => (
                  <li
                    key={index}
                    className="py-5 flex justify-between items-center transition-colors hover:bg-gray-50 px-4 rounded-lg -mx-4"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">
                        {meal.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-gray-600 font-medium">
                          {meal.calories} kcal
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {meal.type === "predefined"
                            ? "From meal database"
                            : "Custom meal"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMeal(index)}
                      className="bg-white text-red-500 border border-red-200 hover:bg-red-50 py-1.5 px-3 rounded-lg flex items-center transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No meals logged
                </h3>
                <p className="mt-1 text-gray-500">
                  No meals logged for this date. Add your first meal to get
                  started!
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab("add")}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                    Add a Meal
                  </button>
                </div>
              </div>
            )}

            {/* Add this button in the "logged" tab section */}
            {activeTab === "logged" && meals.length > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleClearAllMeals}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Clear All Meals
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
