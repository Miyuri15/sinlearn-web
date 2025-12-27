"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthTokens, isAccessTokenExpired } from "@/lib/localStore";
import UpdatedToast from "@/components/ui/updatedtoast";

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const isAuthRoute = useMemo(() => {
    if (!pathname) return false;
    return pathname === "/auth" || pathname.startsWith("/auth/");
  }, [pathname]);

  useEffect(() => {
    // Allow all auth routes without login
    if (isAuthRoute) {
      setAllowed(true);
      setReady(true);
      return;
    }

    const tokens = getAuthTokens();
    const isAuthed = !!tokens && !isAccessTokenExpired();

    if (isAuthed) {
      setAllowed(true);
    } else {
      setAllowed(false);
      // Show subtle toast once, then redirect to sign in
      try {
        const key = "sinlearn_last_redirect_to_signin";
        const now = Date.now();
        const last = Number(sessionStorage.getItem(key) || 0);
        if (!last || now - last > 1500) {
          setToastMessage("Session expired. Please sign in.");
          setToastType("error");
          setToastVisible(true);
          sessionStorage.setItem(key, String(now));
        }
      } catch {}
      router.replace("/auth/sign-in");
    }

    setReady(true);
  }, [isAuthRoute, pathname, router]);

  const toastNode = (
    <UpdatedToast
      message={toastMessage}
      isVisible={toastVisible}
      type={toastType}
      onClose={() => setToastVisible(false)}
    />
  );

  // System-themed minimal fallback while redirecting/loading
  if (!ready) {
    return (
      <>
        {toastNode}
        <div className="flex min-h-dvh items-center justify-center">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading…</p>
          </div>
        </div>
      </>
    );
  }

  if (!allowed && !isAuthRoute) {
    return (
      <>
        {toastNode}
        <div className="flex min-h-dvh items-center justify-center">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Redirecting to sign in…
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {toastNode}
      {children}
    </>
  );
};

export default AuthenticatedLayout;
