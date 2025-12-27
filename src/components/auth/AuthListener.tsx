"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * AuthListener - Listens for auth:logout events and redirects to sign-in
 * This component should be mounted once in the app layout
 */
export default function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = () => {
      router.push("/auth/sign-in");
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [router]);

  return null;
}
