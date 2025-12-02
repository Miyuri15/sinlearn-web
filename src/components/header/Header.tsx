"use client";

import { useState } from "react";
import { Plus, Settings, LogOut, BookOpen, CheckSquare } from "lucide-react";
import clsx from "clsx";

export default function Header() {
  const [activeTab, setActiveTab] = useState<"learning" | "evaluation">(
    "learning"
  );

  return (
    <div className="w-full border-b bg-white px-6 py-3 flex items-center justify-between">
      {/* Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("learning")}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition",
            activeTab === "learning"
              ? "bg-gray-100 font-medium"
              : "hover:bg-gray-100"
          )}
        >
          <BookOpen size={16} />
          Learning
        </button>

        <button
          onClick={() => setActiveTab("evaluation")}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition",
            activeTab === "evaluation"
              ? "bg-gray-100 font-medium"
              : "hover:bg-gray-100"
          )}
        >
          <CheckSquare size={16} />
          Evaluation
        </button>
      </div>

      {/* Right section icons */}
      <div className="flex items-center gap-4">
        {/* New Chat */}
        <button className="hover:bg-gray-100 p-2 rounded-full transition">
          <Plus size={20} />
        </button>

        {/* Settings */}
        <button className="hover:bg-gray-100 p-2 rounded-full transition">
          <Settings size={20} />
        </button>

        {/* Logout / Export */}
        <button className="hover:bg-gray-100 p-2 rounded-full transition">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}
