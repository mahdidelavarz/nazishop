import { MaterialError } from "../icons/icons";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

// components/forms/InputComp.tsx
export type inputType = {
  id: string;
  name: string;
  label?: string;
  placeholder?: string;
  inputStyle?: string;
  type: "text" | "number" | "date" | "email" | "tel" | "checkbox";
  value?: string | number;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string | FieldError;
  register?: UseFormRegisterReturn;
};

function InputComponent({
  id,
  name,
  label,
  placeholder,
  inputStyle,
  type,
  value,
  onBlur,
  onChange,
  error,
  disabled = false,
  register,
}: inputType) {
  const errorMessage = typeof error === "string" ? error : error?.message;

  return (
    <div className="flex flex-col items-start justify-between gap-0.5 text-sm">
      <label htmlFor={id} className="whitespace-nowrap px-2 w-full flex gap-2">
        {label || name}:
        {errorMessage && (
          <span className="text-accent-400 text-[12px] flex items-center gap-2">
            <MaterialError className="w-4 h-4 mb-1" />
            {errorMessage}
          </span>
        )}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          {...(register || {})}
          {...(value !== undefined && !register ? { value } : {})}
          {...(onBlur && !register ? { onBlur } : {})}
          {...(onChange && !register ? { onChange } : {})}
          className={`w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${inputStyle} ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-text"
          }`}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default InputComponent;
