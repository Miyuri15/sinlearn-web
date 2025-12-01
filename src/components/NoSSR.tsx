"use client";

import { useEffect, useState } from "react";

export default function NoSSR({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}