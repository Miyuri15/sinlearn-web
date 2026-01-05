"use client";

import React, { useState, useEffect, useRef } from "react";

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
  disabled = false,
}: NumberInputProps & { disabled?: boolean }) {
  const [localValue, setLocalValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isFocused = document.activeElement === inputRef.current;

    // If focused and empty, and value is 0, keep it empty (user is editing)
    if (isFocused && localValue === "" && value === 0) {
      return;
    }

    // Sync if different
    // Note: Number("") is 0. So if local is "" and value is 0, they are "equal" numerically.
    // But visually we might want "0" if not focused.
    if (localValue === "" && value === 0) {
      setLocalValue("0");
    } else if (Number(localValue) !== value) {
      setLocalValue(value.toString());
    }
  }, [value, localValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (val === "") {
      onChange(0);
      return;
    }

    const num = Number(val);
    if (isNaN(num)) return;

    // Apply min/max bounds
    if (num < min) {
      onChange(min);
      return;
    }
    if (num > max) {
      onChange(max);
      return;
    }

    onChange(num);
  };

  const handleBlur = () => {
    if (localValue === "") {
      setLocalValue("0");
      onChange(0);
    } else {
      // Ensure formatting on blur
      const num = Number(localValue);
      if (!isNaN(num)) {
        // Clamp if we allowed typing out of bounds (though handleChange handles it mostly)
        let final = num;
        if (num < min) final = min;
        if (num > max) final = max;

        setLocalValue(final.toString());
        if (final !== value) onChange(final);
      }
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="number"
        min={min}
        max={max}
        value={localValue}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={`
          px-3 py-2 rounded-lg border outline-none
          bg-white text-gray-900
          dark:bg-[#1A1A1A] dark:text-gray-200 dark:border-[#333]
          focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500
          disabled:opacity-50 disabled:cursor-not-allowed
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          ${className}
        `}
      />
    </div>
  );
}
