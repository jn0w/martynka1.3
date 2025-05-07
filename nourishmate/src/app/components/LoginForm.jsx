"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginForm = () => {
  // LoginForm component: Renders a login form and handles user authentication
  const [formData, setFormData] = useState({
    // formData holds the email and password entered by the user
    email: "",
    password: "",
  });
  // message holds success or error messages to display to the user
  const [message, setMessage] = useState("");
  // useRouter allows redirecting the user after successful login
  const router = useRouter();

  const handleChange = (e) => {
    // handleChange updates formData state when input fields change
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    // handleSubmit submits the login form to the API and processes the response
    e.preventDefault();
    // send a POST request to /api/login with email and password
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // if login succeeds, show success message and redirect to home
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        // if login fails, display the error message from the API
        const errorData = await response.text();
        setMessage("Login failed: " + errorData);
      }
    } catch (error) {
      // catch any network or unexpected errors and display them
      setMessage("Error: " + error.message);
    }
  };

  return (
    // JSX for rendering the login form
    <>
      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
        {/** Email input **/}
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Your email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="name@company.com"
            required
          />
        </div>
        {/** Password input **/}
        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          />
        </div>
        {/** Remember me checkbox (not functional) and Forgot password link **/}
        <div className="flex items-center justify-between">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="remember"
                aria-describedby="remember"
                type="checkbox"
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="remember"
                className="text-gray-500 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
          >
            Forgot password?
          </a>
        </div>
        {/** Submit button **/}
        <button
          type="submit"
          className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        >
          Sign in
        </button>
        {/** Display message: shows success or error feedback **/}
        {message && (
          <div
            className={`p-4 rounded-md ${
              message.includes("successful")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
        {/** Link to registration page for new users **/}
        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
          Don't have an account yet?{" "}
          <Link
            href="/register"
            className="font-medium text-primary-600 hover:underline dark:text-primary-500"
          >
            Sign up
          </Link>
        </p>
      </form>
    </>
  );
};

export default LoginForm;
