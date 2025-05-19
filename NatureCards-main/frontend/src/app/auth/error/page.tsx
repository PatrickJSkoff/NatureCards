"use client";

import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Authentication Error
        </h1>
        <p className="text-gray-600">
          {error || "An error occurred during authentication"}
        </p>
      </div>
    </div>
  );
}
