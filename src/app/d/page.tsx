"use client";
import Sidebar from "@/components/sidebar/Sidebar";
import { useState } from "react";

export default function Test() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
      />

      <h1>Welcome to the D Page</h1>
    </div>
  );
}
