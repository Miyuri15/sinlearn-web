"use client";

export default function Button({
  children,
  className = "",
  ...props
}: any) {
  return (
    <button
      {...props}
      className={`w-full py-3 rounded-xl font-medium transition-colors
        bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF]
        ${className}`}
    >
      {children}
    </button>
  );
}
