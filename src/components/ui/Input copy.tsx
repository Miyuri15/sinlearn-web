"use client";

export default function Input({ className = "", ...props }: any) {
  return (
    <input
      {...props}
      className={`
        w-full px-4 py-3 rounded-xl border outline-none transition-colors
        bg-white dark:bg-[#1A1A1A]
        border-[#E2E8F0] dark:border-[#2A2A2A]
        text-[#0A0A0A] dark:text-white
        placeholder-[#64748B] dark:placeholder-[#888888]
        focus:border-[#2563EB] dark:focus:border-[#2563EB]
        focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#2563EB]/30
        ${className}
      `}
    />
  );
}
