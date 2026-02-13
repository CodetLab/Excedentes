import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: ReactNode;
};

const Button = ({
  variant = "primary",
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) => {
  const classes = ["btn", `btn-${variant}`, className].filter(Boolean).join(" ");

  return (
    <button className={classes} disabled={disabled || isLoading} {...rest}>
      {icon}
      {isLoading ? "Cargando..." : children}
    </button>
  );
};

export default Button;
