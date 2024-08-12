"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// SignUp page UI
export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUserName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Signup function to onboard new users. Takes input from the UI and passes it to the function.
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name,
        lastname,
        username,
      }),
    });

    if (res.ok) {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      router.push("/");
    } else {
      const data = await res.json();
      setError(data.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSignup}
        className="w-1/3 bg-white p-8 rounded shadow"
      >
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          type="text"
          placeholder="First Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          type="text"
          placeholder="Last Name"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        />
        <input
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          type="text"
          placeholder="UserName"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          className="w-full p-2 mb-6 border border-gray-300 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          type="submit"
        >
          Sign Up
        </button>

        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
