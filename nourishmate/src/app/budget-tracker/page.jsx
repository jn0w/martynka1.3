"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import toast, { Toaster } from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function BudgetTracker() {
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [budgetType, setBudgetType] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [chartType, setChartType] = useState("pie");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/check-auth", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthChecked(true);
      } else {
        setUser(null);
        setIsAuthChecked(true);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
      setIsAuthChecked(true);
    }
  };

  const ExpenseChart = ({ type, expenses }) => {
    const categoryData = groupExpensesByCategory(expenses);

    const data = {
      labels: Object.keys(categoryData),
      datasets: [
        {
          label: "Expenses by Category",
          data: Object.values(categoryData),
          backgroundColor: [
            "#4F46E5", // Indigo
            "#0EA5E9", // Sky
            "#10B981", // Emerald
            "#F59E0B", // Amber
            "#EF4444", // Red
            "#8B5CF6", // Violet
            "#EC4899", // Pink
          ],
          borderColor: "rgba(255, 255, 255, 0.5)",
          borderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            font: {
              family: "Inter, system-ui, sans-serif",
              size: 12,
            },
            padding: 20,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.9)",
          titleFont: {
            family: "Inter, system-ui, sans-serif",
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            family: "Inter, system-ui, sans-serif",
            size: 13,
          },
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function (context) {
              return `${context.label}: €${context.parsed.toFixed(2)}`;
            },
          },
        },
      },
    };

    return (
      <div className="h-80 md:h-96 w-full relative">
        {type === "bar" && <Bar data={data} options={options} />}
        {type === "pie" && <Pie data={data} options={options} />}
      </div>
    );
  };

  const groupExpensesByCategory = (expenses) => {
    const categoryTotals = {};

    expenses.forEach(({ category = "Uncategorized", amount }) => {
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += amount;
    });

    return categoryTotals;
  };

  const fetchBudget = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/budget-tracker");
      if (response.ok) {
        const data = await response.json();
        setBudgetAmount(data.budgetAmount || 0);
        setBudgetType(data.budgetType || "");
        setExpenses(data.expenses || []);
        updateRemainingBudget(data.budgetAmount, data.expenses);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      await checkAuth();
      if (user) {
        await fetchBudget();
      }
    };

    initPage();
  }, []);

  useEffect(() => {
    if (isAuthChecked && user) {
      fetchBudget();
    }
  }, [isAuthChecked, user]);

  const updateRemainingBudget = (budget, exp) => {
    if (!budget || budget <= 0 || !exp || exp.length === 0) {
      // If there's a budget but no expenses, all budget is remaining
      setRemainingBudget(budget || 0);
      return;
    }

    const totalExpenses = exp.reduce((sum, expense) => sum + expense.amount, 0);
    setRemainingBudget(budget - totalExpenses);
  };

  const handleSetBudget = async () => {
    if (!user) {
      toast.error("You must be logged in to set a budget.");
      return;
    }
    if (!budgetAmount) {
      toast.error("Please enter a budget amount.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/budget-tracker/set-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetAmount, budgetType: "weekly" }),
      });

      if (response.ok) {
        toast.success("Budget set successfully!");
        await fetchBudget();
      } else {
        toast.error("Failed to set budget.");
      }
    } catch (error) {
      console.error("Error setting budget:", error);
      toast.error("An error occurred while setting the budget.");
    }
    setIsLoading(false);
  };

  const handleAddExpense = async () => {
    if (!user) {
      toast.error("You must be logged in to add expenses.");
      return;
    }
    if (!expenseAmount || !expenseDescription || !expenseCategory) {
      toast.error("Please fill in all expense details.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/budget-tracker/add-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(expenseAmount),
          description: expenseDescription,
          category: expenseCategory,
        }),
      });

      if (response.ok) {
        toast.success("Expense added successfully!");
        setExpenseAmount("");
        setExpenseDescription("");
        setExpenseCategory("");
        await fetchBudget();
        setActiveTab("overview"); // Return to overview after adding
      } else {
        toast.error("Failed to add expense.");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("An error occurred while adding the expense.");
    }
    setIsLoading(false);
  };

  const handleDeleteExpense = async (id) => {
    if (!user) {
      toast.error("You must be logged in to delete expenses.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Deleting expense with ID:", id);
      const response = await fetch("/api/budget-tracker/delete-expense", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expenseId: id,
        }),
      });

      if (response.ok) {
        toast.success("Expense deleted successfully!");
        await fetchBudget();
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || "Failed to delete expense.");
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("An error occurred while deleting the expense.");
    }
    setIsLoading(false);
  };

  const handleClearExpenses = async () => {
    if (!user) {
      toast.error("You must be logged in to clear expenses.");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to clear all weekly expenses? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/budget-tracker/clear-expenses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetType: "weekly" }),
      });

      if (response.ok) {
        toast.success("All weekly expenses cleared successfully!");
        await fetchBudget();
      } else {
        toast.error("Failed to clear expenses.");
      }
    } catch (error) {
      console.error("Error clearing expenses:", error);
      toast.error("An error occurred while clearing expenses.");
    }
    setIsLoading(false);
  };

  // If auth check is not complete, show loading spinner
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Budget Tracker
            </h1>
            <p className="text-blue-100 max-w-3xl">
              Loading your budget data...
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
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Budget Tracker
            </h1>
            <p className="text-blue-100 max-w-3xl">
              Manage your weekly budget and track your expenses
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
              Please log in to view your budget information and track your
              expenses.
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Budget Tracker
              </h1>
              <p className="text-blue-100 max-w-2xl">
                Manage your weekly food expenses and stay within budget
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setActiveTab("add")}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium shadow-sm transition-all hover:shadow flex items-center"
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
                Add New Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "expenses"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Expenses List
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "analytics"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "settings"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Budget Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Budget Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Budget Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        Budget
                      </h3>
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <svg
                          className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      €{budgetAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Weekly budget
                    </p>
                  </div>

                  {/* Spent Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        Spent
                      </h3>
                      <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                        <svg
                          className="w-5 h-5 text-red-600 dark:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      €{(budgetAmount - remainingBudget).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Total expenses
                    </p>
                  </div>

                  {/* Remaining Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        Remaining
                      </h3>
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <svg
                          className="w-5 h-5 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        remainingBudget >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      €{remainingBudget.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Available funds
                    </p>
                  </div>
                </div>

                {/* Budget Progress */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Budget Progress
                  </h3>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                    <div
                      className={`h-4 rounded-full ${
                        remainingBudget < 0
                          ? "bg-red-600"
                          : remainingBudget < budgetAmount * 0.2
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                      style={{
                        width: `${
                          budgetAmount <= 0
                            ? 0
                            : Math.min(
                                ((budgetAmount - remainingBudget) /
                                  budgetAmount) *
                                  100,
                                100
                              )
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>
                      {budgetAmount <= 0
                        ? 0
                        : Math.min(
                            (
                              ((budgetAmount - remainingBudget) /
                                budgetAmount) *
                              100
                            ).toFixed(0),
                            100
                          )}
                      % used
                    </span>
                    <span>
                      {budgetAmount > 0
                        ? remainingBudget >= 0
                          ? `€${remainingBudget.toFixed(2)} remaining`
                          : `€${Math.abs(remainingBudget).toFixed(
                              2
                            )} over budget`
                        : "No budget set"}
                    </span>
                  </div>
                </div>

                {/* Recent Expenses Table */}
                {expenses.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        Recent Expenses
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                          <tr>
                            <th className="px-6 py-3 text-left">Description</th>
                            <th className="px-6 py-3 text-left">Category</th>
                            <th className="px-6 py-3 text-left">Date</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {expenses.slice(0, 5).map((expense) => (
                            <tr
                              key={expense.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-750"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                {expense.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                {expense.category || "Uncategorized"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm">
                                {new Date(expense.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700 dark:text-gray-300 font-medium">
                                €{expense.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {expenses.length > 5 && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
                        <button
                          onClick={() => setActiveTab("expenses")}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View all expenses
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
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
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                      No expenses recorded
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Start tracking your spending by adding your first expense.
                    </p>
                    <button
                      onClick={() => setActiveTab("add")}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Add Expense
                    </button>
                  </div>
                )}

                {/* Category Breakdown */}
                {expenses.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        Category Breakdown
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setChartType("pie")}
                          className={`px-3 py-1 text-xs rounded-md ${
                            chartType === "pie"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          Pie
                        </button>
                        <button
                          onClick={() => setChartType("bar")}
                          className={`px-3 py-1 text-xs rounded-md ${
                            chartType === "bar"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          Bar
                        </button>
                      </div>
                    </div>
                    <ExpenseChart type={chartType} expenses={expenses} />
                  </div>
                )}
              </div>
            )}

            {/* Expenses List Tab */}
            {activeTab === "expenses" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    All Expenses
                  </h3>
                </div>
                {expenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                        <tr>
                          <th className="px-6 py-3 text-left">Description</th>
                          <th className="px-6 py-3 text-left">Category</th>
                          <th className="px-6 py-3 text-left">Date</th>
                          <th className="px-6 py-3 text-right">Amount</th>
                          <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {expenses.map((expense) => (
                          <tr
                            key={expense.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-750"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {expense.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {expense.category || "Uncategorized"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm">
                              {new Date(expense.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700 dark:text-gray-300 font-medium">
                              €{expense.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="text-red-600 hover:text-red-800 focus:outline-none"
                                disabled={isLoading}
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  ></path>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
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
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                      No expenses found
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Start tracking your spending by adding your first expense.
                    </p>
                    <button
                      onClick={() => setActiveTab("add")}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Add Expense
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
                    Weekly Trend
                  </h3>
                  {expenses.length > 0 ? (
                    <ExpenseChart type={chartType} expenses={expenses} />
                  ) : (
                    <div className="text-center py-10">
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
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        ></path>
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                        No data to analyze
                      </h3>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Add some expenses to see analytics and insights.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                      Spending Insights
                    </h3>
                    {expenses.length > 0 ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300 font-medium">
                            Top spending category
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            {(() => {
                              const categoryData =
                                groupExpensesByCategory(expenses);
                              const topCategory = Object.entries(
                                categoryData
                              ).sort((a, b) => b[1] - a[1])[0];
                              return (
                                <>
                                  <span className="text-lg font-semibold">
                                    {topCategory ? topCategory[0] : "N/A"}
                                  </span>
                                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                                    {topCategory
                                      ? `€${topCategory[1].toFixed(2)}`
                                      : "€0.00"}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300 font-medium">
                            Average expense amount
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-lg font-semibold">
                              Per transaction
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                              €
                              {(
                                expenses.reduce(
                                  (sum, exp) => sum + exp.amount,
                                  0
                                ) / expenses.length
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300 font-medium">
                            Budget status
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-lg font-semibold">
                              {remainingBudget >= 0
                                ? "Within budget"
                                : "Over budget"}
                            </span>
                            <span
                              className={`font-bold ${
                                remainingBudget >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {remainingBudget >= 0
                                ? `€${remainingBudget.toFixed(2)} left`
                                : `€${Math.abs(remainingBudget).toFixed(
                                    2
                                  )} over`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          Add some expenses to see insights.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                      Budget Tips
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <p className="text-gray-600 dark:text-gray-300">
                          Plan your meals in advance to avoid impulse purchases
                        </p>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <p className="text-gray-600 dark:text-gray-300">
                          Buy non-perishable items in bulk when they're on sale
                        </p>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <p className="text-gray-600 dark:text-gray-300">
                          Compare prices between different stores before
                          shopping
                        </p>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <p className="text-gray-600 dark:text-gray-300">
                          Use a shopping list and stick to it when grocery
                          shopping
                        </p>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <p className="text-gray-600 dark:text-gray-300">
                          Cook at home instead of eating out to save money
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Add Expense Tab */}
            {activeTab === "add" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
                  Add New Expense
                </h3>
                <div className="max-w-md mx-auto">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="expenseAmount"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Amount (€)
                      </label>
                      <input
                        type="number"
                        id="expenseAmount"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="expenseDescription"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Description
                      </label>
                      <input
                        type="text"
                        id="expenseDescription"
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                        placeholder="What did you spend on?"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="expenseCategory"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Category
                      </label>
                      <select
                        id="expenseCategory"
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select a category</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Dining Out">Dining Out</option>
                        <option value="Takeaway">Takeaway</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="pt-4">
                      <button
                        onClick={handleAddExpense}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-200 flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            Adding...
                          </>
                        ) : (
                          <>
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
                            Add Expense
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
                    Budget Settings
                  </h3>
                  <div className="max-w-md mx-auto">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="budgetAmount"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Weekly Budget Amount (€)
                        </label>
                        <input
                          type="number"
                          id="budgetAmount"
                          value={budgetAmount}
                          onChange={(e) =>
                            setBudgetAmount(parseFloat(e.target.value))
                          }
                          placeholder="0.00"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="pt-4">
                        <button
                          onClick={handleSetBudget}
                          disabled={isLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-200 flex items-center justify-center"
                        >
                          {isLoading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                              Saving...
                            </>
                          ) : (
                            <>
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
                                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                ></path>
                              </svg>
                              Save Budget
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                      Danger Zone
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-300">
                        The following actions are destructive and cannot be
                        undone. Please proceed with caution.
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={handleClearExpenses}
                          disabled={isLoading || expenses.length === 0}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/30 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-200 flex items-center justify-center"
                        >
                          {isLoading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                              Processing...
                            </>
                          ) : (
                            <>
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                              Clear All Weekly Expenses
                            </>
                          )}
                        </button>
                        {expenses.length === 0 && (
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                            No expenses to clear
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
