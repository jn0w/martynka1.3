// src/app/register/page.jsx
"use client";

import RegisterForm from "../components/RegisterForm";
import Navbar from "../components/Navbar";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Register for NourishMate
          </h1>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
