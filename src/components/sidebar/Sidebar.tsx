"use client";

import { useState } from "react";
import { Search, BookOpen, CheckSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ChatItem {
  id: string;
  title: string;
  type: "learning" | "evaluation";
  time: string;
}

interface SidebarProps {
  chats?: ChatItem[];
}

export default function Sidebar({ chats = [] }: SidebarProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 h-screen border-r bg-white dark:bg-gray-900 dark:border-gray-700 flex flex-col">
      
      {/* Header */}
      <div className="p-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Chat History
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm 
                       outline-none 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100 
                       border-gray-300 dark:border-gray-700
                       focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="px-4 space-y-2">
        <button
          onClick={() => router.push("/new-learning-chat")}
          className="w-full flex items-center gap-3 border rounded-lg px-3 py-2 
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     bg-white dark:bg-gray-900
                     text-gray-900 dark:text-gray-100
                     border-gray-300 dark:border-gray-700
                     transition"
        >
          <BookOpen className="h-4 w-4" />
          New Learning Chat
        </button>

        <button
          onClick={() => router.push("/new-evaluation-chat")}
          className="w-full flex items-center gap-3 border rounded-lg px-3 py-2 
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     bg-white dark:bg-gray-900
                     text-gray-900 dark:text-gray-100
                     border-gray-300 dark:border-gray-700
                     transition"
        >
          <CheckSquare className="h-4 w-4" />
          New Evaluation Chat
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto mt-4">
        {filteredChats.map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className="block px-4 py-3 
                       hover:bg-gray-100 dark:hover:bg-gray-800
                       text-gray-900 dark:text-gray-100"
          >
            <div className="font-medium">{chat.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{chat.time}</div>
          </Link>
        ))}

        {filteredChats.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
            No chats found...
          </p>
        )}
      </div>
    </div>
  );
}
