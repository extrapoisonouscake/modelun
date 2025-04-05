"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface AlphanumericInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function AlphanumericInput({
  value = "",
  onChange,
  placeholder = "•",
  disabled = false,
  className,
}: AlphanumericInputProps) {
  const [values, setValues] = React.useState<string[]>(() =>
    Array(6)
      .fill("")
      .map((_, i) => value[i] || "")
  );

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Update internal state when external value changes
  React.useEffect(() => {
    const newValues = Array(6)
      .fill("")
      .map((_, i) => value[i] || "");
    setValues(newValues);
  }, [value]);

  // Update parent component when values change
  const handleValueChange = (newValues: string[]) => {
    setValues(newValues);
    onChange(newValues.join(""));
  };

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;

    // Only allow alphanumeric characters
    if (val && !/^[a-zA-Z0-9]$/.test(val)) {
      return;
    }

    const newValues = [...values];
    newValues[index] = val.toUpperCase();
    handleValueChange(newValues);
    // Move to next input if a character was entered
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Move to next input on right arrow
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Move to previous input on left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // Only use alphanumeric characters from the pasted content
    const alphanumericOnly = pastedData
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 6);

    if (alphanumericOnly) {
      const newValues = Array(6)
        .fill("")
        .map((_, i) => alphanumericOnly[i] || "");
      handleValueChange(newValues);

      // Focus the next empty input or the last one
      const nextEmptyIndex = newValues.findIndex((val) => !val);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  return (
    <div
      className={cn(
        "flex w-fit relative rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-input overflow-hidden",
        className
      )}
    >
      {values.map((val, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="text"
          value={val}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          maxLength={1}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-12 h-16 text-center text-2xl font-bold border-0 bg-transparent",
            "focus:outline-none focus:ring-0",
            "transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label={`Character ${index + 1} of 6`}
        />
      ))}
    </div>
  );
}
