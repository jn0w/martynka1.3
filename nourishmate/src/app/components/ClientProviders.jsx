"use client";
import { Toaster } from "react-hot-toast";

export default function ClientProviders() {
  // ClientProviders component: sets up client-side utilities for the app
  // Uses Toaster from react-hot-toast to display notifications
  return <Toaster position="bottom-right" />;
}
