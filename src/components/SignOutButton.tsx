"use client";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  if (!session?.user) return null;

  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ redirect: false });
    setLoading(false);
    router.push("/api/auth/signin");
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition cursor-pointer"
    >
      {loading ? "Signing out..." : "Signout"}
    </button>
  );
}
