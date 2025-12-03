import { Icon } from "@iconify/react";
import { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "accent" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonComponentProps {
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700",
  secondary: "bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700",
  accent: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700",
  outline: "border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100",
  ghost: "text-primary-500 hover:bg-primary-50 active:bg-primary-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-6 py-3.5 text-lg",
};

export default function ButtonComponent({
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  children,
  onClick,
  className = "",
  fullWidth = false,
}: ButtonComponentProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${widthStyle} ${className}`}
    >
      {loading ? (
        <>
          <Icon icon="mdi:loading" className="animate-spin" width={20} />
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Icon icon={icon} width={20} />
          )}
          {children}
          {icon && iconPosition === "right" && (
            <Icon icon={icon} width={20} />
          )}
        </>
      )}
    </button>
  );
}

