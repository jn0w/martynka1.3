"use client";

import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            About NourishMate
          </h1>
          <p className="text-blue-100 max-w-3xl">
            Your personal health and nutrition companion for a better lifestyle
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Mission Section */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-md p-8 transform transition-transform duration-300 hover:shadow-lg">
              <div className="flex items-start mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Our Mission
                </h2>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                NourishMate is your personal health and nutrition companion. Our
                app helps you track your caloric intake, manage your meals, and
                monitor your progress towards your health goals. Whether you're
                looking to lose weight, gain muscle, or maintain a healthy
                lifestyle, NourishMate provides the tools and insights you need
                to succeed.
              </p>

              <p className="text-gray-700 mb-4 leading-relaxed">
                Our mission is to empower individuals to make informed decisions
                about their nutrition and health. We believe that with the right
                information and support, everyone can achieve their wellness
                goals.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mt-6">
                <p className="text-gray-700 italic">
                  "Thank you for choosing NourishMate as your trusted partner in
                  your health journey. We are committed to providing you with
                  the best experience and continuously improving our app to meet
                  your needs."
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-md p-8 h-full transform transition-transform duration-300 hover:shadow-lg">
              <div className="flex items-start mb-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Key Features
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Calorie Calculation
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Personalized calorie targets based on your body metrics
                      and goals
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m-6-8h6M5 5h14a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z M5 14h14a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 012-2z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Meal Tracking
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Log your daily meals and monitor your calorie intake
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3 mt-1">
                    <svg
                      className="w-4 h-4 text-yellow-600"
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
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Budget Management
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Set and track your weekly food budget to optimize spending
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-red-100 p-2 rounded-full mr-3 mt-1">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Progress Tracking
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Monitor your weight and nutrition progress over time with
                      visual charts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8 transform transition-transform duration-300 hover:shadow-lg">
          <div className="flex items-start mb-6">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              How to Use NourishMate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Set Your Calories
                </h3>
                <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Step 1
                </span>
              </div>
              <p className="text-gray-700 mb-4">
                Navigate to the Calorie Calculator page. Enter your personal
                details such as gender, weight, height, age, and activity level.
                Choose your goal and calculate your daily caloric needs.
              </p>
              <button
                onClick={() => router.push("/calorie-calculator")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
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
                    d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Go to Calorie Calculator
              </button>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Set Your Budget
                </h3>
                <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Step 2
                </span>
              </div>
              <p className="text-gray-700 mb-4">
                Go to the Budget Tracker page. Enter your weekly budget amount.
                Track your food expenses to ensure you stay within your budget
                and analyze your spending patterns.
              </p>
              <button
                onClick={() => router.push("/budget-tracker")}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
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
                    d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Go to Budget Tracker
              </button>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Get Personalized Meals
                </h3>
                <span className="bg-green-200 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Step 3
                </span>
              </div>
              <p className="text-gray-700 mb-4">
                Visit the Personalized Meals page. Based on your caloric needs
                and budget, explore meal options tailored to your preferences.
                Add meals to your favorites for easy access.
              </p>
              <button
                onClick={() => router.push("/personalizedMeals")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
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
                    d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Go to Personalized Meals
              </button>
            </div>

            {/* Step 4 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Log Your Meals
                </h3>
                <span className="bg-purple-200 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Step 4
                </span>
              </div>
              <p className="text-gray-700 mb-4">
                Track your daily meals in the Meal Logger. Consistently logging
                your meals helps you stay on target and meet your nutrition
                goals. Monitor your progress over time to make informed
                decisions about your diet.
              </p>
              <button
                onClick={() => router.push("/meal-logger")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
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
                    d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Go to Meal Logger
              </button>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-md p-8 mt-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to transform your nutrition journey?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get started with NourishMate today and take control of your health
            and nutrition goals.
          </p>
          <button
            onClick={() => router.push("/signup")}
            className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-md font-medium shadow-md transition-colors duration-200"
          >
            Create Your Account
          </button>
        </div>
      </div>
    </div>
  );
}
