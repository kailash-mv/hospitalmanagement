"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setMessage("User registered successfully!");
        setFormData({ name: "", email: "", password: "", role: "" });
        setTimeout(() => {
          router.push("../api/auth/signin");
        }, 2000);
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      setMessage("Error: Unable to register user");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          required
        />
        <div className="mb-2">
          <label className="block text-gray-700">Role:</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="careworker"
                checked={formData.role === "careworker"}
                onChange={handleChange}
                className="mr-2"
              />
              Careworker
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="manager"
                checked={formData.role === "manager"}
                onChange={handleChange}
                className="mr-2"
              />
              Manager
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="w-full text-white p-2 rounded !bg-[#008C91]"
        >
          Register
        </button>
        {message && <p className="mt-2 text-center text-red-500">{message}</p>}
      </form>
    </div>
  );
}
