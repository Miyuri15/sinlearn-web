"use client";

export default function Button({
  children,
  className = "",
  ...props
}: any) {
  return (
    <button
      {...props}
      className={`w-full py-3 rounded-xl font-medium transition 
        bg-[#2563EB] text-white hover:bg-[#6581bd]
        ${className}`}
    >
      {children}
    </button>
  );
}
