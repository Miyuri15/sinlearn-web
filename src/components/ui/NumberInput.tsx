"use client";

import React from "react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
}

export default function NumberInput({
  value,
  onChange,
  min = 0,
  max = 100,
  placeholder = "0",
  className = "",
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Convert to number safely
    const num = val === "" ? 0 : Number(val);

    // Apply min/max bounds
    if (num < min) return onChange(min);
    if (num > max) return onChange(max);

    onChange(num);
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      className={`
        px-3 py-2 rounded-lg border outline-none
        bg-white text-gray-900
        dark:bg-[#1A1A1A] dark:text-gray-200 dark:border-[#333]
        focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500
        ${className}
      `}
    />
  );
}
