"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UpdatedToast from "@/components/ui/updatedtoast";

/**
 * AuthListener - Listens for auth:logout events and redirects to sign-in
 * This component should be mounted once in the app layout
 */
export default function AuthListener() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleLogout = () => {
      try {
        const key = "sinlearn_last_redirect_to_signin";
        const now = Date.now();
        const last = Number(sessionStorage.getItem(key) || 0);
        if (!last || now - last > 1500) {
          setMessage("Session expired. Please sign in.");
          setVisible(true);
          sessionStorage.setItem(key, String(now));
        }
      } catch {}
      router.push("/auth/sign-in");
    };

    globalThis.addEventListener("auth:logout", handleLogout as EventListener);

    return () => {
      globalThis.removeEventListener(
        "auth:logout",
        handleLogout as EventListener
      );
    };
  }, [router]);

  return (
    <UpdatedToast
      message={message}
      isVisible={visible}
      type="error"
      onClose={() => setVisible(false)}
    />
  );
}
