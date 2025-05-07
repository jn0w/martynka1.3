// src/app/page.js
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./globals.css";
import Navbar from "./components/Navbar";
import toast, { Toaster } from "react-hot-toast";

function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Steps data
  const steps = [
    {
      number: "01",
      title: "Set Your Calories",
      description:
        "Calculate your daily caloric needs based on your gender, weight, height, age, and activity level. Choose your goal (weight loss, maintenance, or muscle gain).",
      link: "/calorie-calculator",
      linkText: "Calculate Calories",
      image: "/calories.png",
    },
    {
      number: "02",
      title: "Set Your Budget",
      description:
        "Enter your budget type (weekly or monthly) and the total amount. This helps us recommend meals that not only meet your caloric needs but also fit your financial plan.",
      link: "/budget-tracker",
      linkText: "Set Budget",
      image: "/Budget.jpg",
    },
    {
      number: "03",
      title: "Get Personalized Meals",
      description:
        "Explore meal options tailored to your caloric needs and budget. Add favorites for easy access and track your meals daily to maintain your health journey.",
      link: "/personalizedMeals",
      linkText: "Explore Meals",
      image: "/mealPlan.png",
    },
    {
      number: "04",
      title: "Track Daily Progress",
      description:
        "Use the meal logger to record what you eat each day. Monitor your calorie intake and maintain your streak.",
      link: "/meal-logger",
      linkText: "Log Meals",
      image: "/tracking.png",
    },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/check-auth", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        console.log("User is authenticated:", data.user);
      } else {
        setIsLoggedIn(false);
        console.log("User is not authenticated");
      }
    } catch (error) {
      console.error("Authentication check error:", error);
      setIsLoggedIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-center" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-20 md:py-32">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-600/90 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Your Personal Nutrition{" "}
                <span className="text-yellow-300">& Budget</span> Assistant
              </h1>
              <p className="text-blue-100 text-lg mb-8 max-w-md">
                NourishMate helps you track calories, manage your meal budget,
                and discover personalized meal options - all in one place.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() =>
                    router.push(isLoggedIn ? "/account" : "/register")
                  }
                  className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-md font-semibold shadow-md transition-colors duration-200"
                >
                  {isLoggedIn ? "account" : "Get Started"}
                </button>
                <button
                  onClick={() => router.push("/about")}
                  className="bg-transparent hover:bg-white/10 border-2 border-white px-8 py-3 rounded-md font-semibold text-white transition-colors duration-200"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md h-80">
                <Image
                  src="/logo.png"
                  alt="NourishMate Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - Made smaller to fit in one row */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-blue-500 transform transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-3xl mb-3 text-blue-500">🍽️</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Calorie Calculator
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Personalized calorie targets based on your body metrics and
                goals
              </p>
              <button
                onClick={() => router.push("/calorie-calculator")}
                className="mt-auto w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Calculate Now
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-green-500 transform transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-3xl mb-3 text-green-500">💰</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Budget Tracker
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Manage your food expenses and stay within your weekly budget
              </p>
              <button
                onClick={() => router.push("/budget-tracker")}
                className="mt-auto w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Track Budget
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-yellow-500 transform transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-3xl mb-3 text-yellow-500">🥗</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Personalized Meals
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Discover meal options that match your calorie goals and budget
              </p>
              <button
                onClick={() => router.push("/personalizedMeals")}
                className="mt-auto w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Find Meals
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-purple-500 transform transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-3xl mb-3 text-purple-500">📝</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Meal Logging
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Track your daily meals logging
              </p>
              <button
                onClick={() => router.push("/meal-logger")}
                className="mt-auto w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Log Meals
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How NourishMate Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How NourishMate Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg mr-4">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Calculate Your Calories
                </h3>
                <p className="text-gray-600 mb-4">
                  Enter your personal details and goals to get a tailored
                  calorie target that matches your needs.
                </p>
                <button
                  onClick={() => router.push("/calorie-calculator")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Start Calculation
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-100 text-green-600 rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg mr-4">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Set Your Budget
                </h3>
                <p className="text-gray-600 mb-4">
                  Determine your weekly food budget and track expenses to help
                  manage your spending.
                </p>
                <button
                  onClick={() => router.push("/budget-tracker")}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Set Budget
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-yellow-100 text-yellow-600 rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg mr-4">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Explore Personalized Meals
                </h3>
                <p className="text-gray-600 mb-4">
                  Discover meals that fit your calorie needs and budget, and
                  save your favorites for easy access.
                </p>
                <button
                  onClick={() => router.push("/personalizedMeals")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Find Meals
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-purple-100 text-purple-600 rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg mr-4">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Track Your Daily Progress
                </h3>
                <p className="text-gray-600 mb-4">
                  Keep track of your daily meals and weight changes. Monitor
                  your progress over time with our meal logging system and
                  weight tracking feature to stay motivated.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.push("/meal-logger")}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    Log Meals
                  </button>
                  <button
                    onClick={() => router.push("/calorie-calculator")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    Log Weight
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Nutrition Journey?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already improved their health and
            nutrition with NourishMate.
          </p>
          {isLoggedIn ? (
            <button
              onClick={() => router.push("/account")}
              className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-md font-semibold shadow-md transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          ) : (
            <div className="space-x-4">
              <button
                onClick={() => router.push("/register")}
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-md font-semibold shadow-md transition-colors duration-200"
              >
                Register
              </button>
              <button
                onClick={() => router.push("/login")}
                className="bg-transparent hover:bg-white/10 border-2 border-white px-8 py-3 rounded-md font-semibold text-white transition-colors duration-200"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">NourishMate</h3>
              <p className="text-gray-400">
                Your personal nutrition and budget assistant for a healthier
                lifestyle.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/meal-logger" className="hover:text-white">
                    Meal Logging
                  </Link>
                </li>
                <li>
                  <Link href="/calorie-calculator" className="hover:text-white">
                    Calorie Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/budget-tracker" className="hover:text-white">
                    Budget Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/personalizedMeals" className="hover:text-white">
                    Meal Recommendations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} NourishMate. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
