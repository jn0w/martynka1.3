"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function UserDetails() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  const activityLevels = [
    "Sedentary",
    "Light Activity",
    "Moderate Activity",
    "Active",
    "Very Active",
  ];

  const goals = ["Maintain Weight", "Weight Loss", "Weight Gain"];

  // Fields that should not be editable by the user
  const excludedFields = [
    "_id",
    "password",
    "role",
    "createdAt",
    "favorites",
    "achievements",
    "streakData",
  ];

  useEffect(() => {
    if (!id) return;

    const checkUserRole = async () => {
      try {
        const response = await fetch("/api/check-auth", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.user.isAdmin === true);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/get-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }),
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        const { caloricData, budgetData, ...filteredUserData } = data;
        setUser(filteredUserData);
        setEditableData(filteredUserData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    checkUserRole();
    fetchUser();
  }, [id]);

  const handleUpdateUser = async () => {
    try {
      // Only include the fields that the API expects
      const { name, email, activityLevel, goal, phoneNumber, address } =
        editableData;

      const res = await fetch(`/api/admin/update-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
          name,
          email,
          activityLevel,
          goal,
          phoneNumber,
          address,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Update error:", errorData);
        throw new Error("Failed to update user");
      }
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      // Show loading state
      setUser({ ...user, _isDeleting: true });

      // Add cache busting parameter
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/admin/delete-user?t=${timestamp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify({ userId: id }),
      });

      if (!res.ok) throw new Error("Failed to delete user");

      alert("User deleted successfully!");

      // Navigate with query parameter to force refresh on admin panel
      router.push(`/adminPanel?refresh=${timestamp}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      // Reset loading state on error
      setUser((prevUser) => ({ ...prevUser, _isDeleting: false }));
      alert("Error deleting user. Please try again.");
    }
  };

  if (!user) return <p>Loading user data...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Edit Profile
        </h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {Object.entries(user)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </label>
                {key === "activityLevel" ? (
                  <select
                    value={editableData[key] || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...editableData,
                        [key]: e.target.value,
                      })
                    }
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Activity Level</option>
                    {activityLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                ) : key === "goal" ? (
                  <select
                    value={editableData[key] || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...editableData,
                        [key]: e.target.value,
                      })
                    }
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Goal</option>
                    {goals.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editableData[key] || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...editableData,
                        [key]: e.target.value,
                      })
                    }
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  />
                )}
              </div>
            ))}

          <div className="flex space-x-4">
            <button
              onClick={handleUpdateUser}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Update Profile
            </button>

            {isAdmin ? (
              <button
                onClick={handleDeleteUser}
                disabled={user?._isDeleting}
                className={`bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 flex items-center ${
                  user?._isDeleting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {user?._isDeleting ? (
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
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            ) : (
              <button
                onClick={() => router.back()}
                className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
