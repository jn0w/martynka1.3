import React, { useEffect, useState } from "react";
import Link from "next/link";
import "../globals.css";

function Navbar() {
  // State to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State to track if the user is an admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Function to check the user's login status
    const checkLoginStatus = async () => {
      try {
        const res = await fetch("/api/check-auth");
        if (res.ok) {
          const data = await res.json();
          console.log("Check auth response:", data); // Debugging log
          setIsLoggedIn(true); // User is logged in
          setIsAdmin(data.user.isAdmin); // Check if the user is an admin
        }
      } catch (error) {
        setIsLoggedIn(false); // If there's an error, set logged in status to false
        setIsAdmin(false); // Reset admin status
      }
    };

    checkLoginStatus(); // Call the function to check login status
  }, []);

  // Function to handle user logout
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" }); // Send logout request
    setIsLoggedIn(false); // Update logged in status
    setIsAdmin(false); // Reset admin status
    window.location.href = "/"; // Redirect to home page
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <h1 className="navbar__title">NourishMate</h1>
        <ul className="navbar__list">
          <li className="navbar__item">
            <Link href="/">Home</Link>
          </li>
          <li className="navbar__item">
            <Link href="/about">About</Link>
          </li>
          <li className="navbar__item">
            <Link href="/personalizedMeals">Personalized Meals</Link>
          </li>
          <li className="navbar__item">
            <Link href="/exploreMeals">Explore Meals</Link>
          </li>
          <li className="navbar__item">
            <Link href="/budget-tracker">Budget Tracker</Link>
          </li>
          <li className="navbar__item">
            <Link href="/calorie-calculator">Calorie Calculator</Link>
          </li>
          <li className="navbar__item">
            <Link href="/meal-logger" className="hover:text-blue-500">
              Meal Logger
            </Link>
          </li>
          {isAdmin && ( // Show Admin Panel link if user is an admin
            <li className="navbar__item">
              <Link href="/adminPanel">Admin Panel</Link>
            </li>
          )}
        </ul>
        <div className="navbar__buttons">
          {!isLoggedIn ? ( // If user is not logged in, show Register and Login buttons
            <>
              <Link href="/register">
                <button className="navbar__button">Register</button>
              </Link>
              <Link href="/login">
                <button className="navbar__button">Login</button>
              </Link>
            </>
          ) : (
            // If user is logged in, show Account and Logout buttons
            <>
              <Link href="/account">
                <button className="navbar__button">Account</button>
              </Link>
              <button onClick={handleLogout} className="navbar__button">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
