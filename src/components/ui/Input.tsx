"use client";

export default function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`
        w-full px-4 py-3 rounded-xl border border-[#E2E8F0] outline-none
        text-[#0A0A0A] placeholder-[#64748B]
        focus:border-[#E2E8F0] focus:ring-2 focus:ring-[#E2E8F0]/30
        ${className}
      `}
    />
  );
}
