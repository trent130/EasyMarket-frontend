// In showAndHidePassword.tsx
"use client";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface PasswordInputProps {
  register: UseFormRegisterReturn;
  error?: string;
  id?: string;
}

export default function PasswordInput({ register, error, id: propId }: PasswordInputProps) {
  const id = useId();
  const inputId = propId || `password-${id}`;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          {...register}
          id={inputId}
          className={`pe-9 ${error ? "border-red-500" : ""}`}
          placeholder="Password"
          type={isVisible ? "text" : "password"}
        />
        <button
          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls={inputId}
        >
          {isVisible ? (
            <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Eye size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}