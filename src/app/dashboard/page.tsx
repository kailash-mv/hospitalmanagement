"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; 

    if (!session) {
      router.replace("/auth/login"); 
    } else if (session.user.role === "MANAGER") {
      router.replace("/dashboard/manager");
    } else if (session.user.role === "CAREWORKER") {
      router.replace("/dashboard/careworker");
    }
  }, [session, status, router]);

  return <p>Loading...</p>;
}
