"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  useEffect(() => {
    if (session?.user) {
      if (!session.user.role) {
        setShowRoleSelection(true);
      } else {
        router.push(
          session.user.role === "MANAGER"
            ? "/dashboard/manager"
            : "/dashboard/careworker"
        );
      }
    }
  }, [session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password.");
    }
  };

  const handleRoleSelection = async (role: "MANAGER" | "CAREWORKER") => {
    const res = await fetch("/api/set-role", {
      method: "POST",
      body: JSON.stringify({ role }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      update();
      router.push(
        role === "MANAGER" ? "/dashboard/manager" : "/dashboard/careworker"
      );
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen !bg-[#ffffff]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-4 text-[#00AFAA]">
          Sign In
        </h1>

        {!showRoleSelection ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Email"
                className="w-full p-2 border rounded !text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded !text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                className="w-full !bg-[#00AFAA] text-white p-2 rounded cursor-pointer !hover:bg-[#008C91]"
              >
                Sign In
              </button>
            </form>

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}

            <hr className="my-4" />

            <button
              onClick={() => signIn("google")}
              className="w-full !bg-[#D93025] text-white p-2 rounded cursor-pointer !hover:bg-[#b8281f]"
            >
              Sign in with Google
            </button>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4 !text-[#00AFAA]">
              Select Your Role
            </h2>
            <button
              onClick={() => handleRoleSelection("MANAGER")}
              className="px-4 py-2 !bg-[#00AFAA] text-white rounded-lg m-2 cursor-pointer !hover:bg-[#008C91]"
            >
              Manager
            </button>
            <button
              onClick={() => handleRoleSelection("CAREWORKER")}
              className="px-4 py-2 !bg-[#00AFAA] text-white rounded-lg m-2 cursor-pointer !hover:bg-[#008C91]"
            >
              Care Worker
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
