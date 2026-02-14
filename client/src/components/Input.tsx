import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

const Input = ({ label, error, helperText, id, className, value, ...rest }: InputProps) => {
  const inputId = id || rest.name || label.toLowerCase().replace(/\s+/g, "-");
  const classes = ["input", error ? "input-error" : "", className]
    .filter(Boolean)
    .join(" ");

  // Ensure value is never undefined/null to avoid controlled component warning
  const safeValue = value === undefined || value === null ? "" : value;

  return (
    <label className="form-field" htmlFor={inputId}>
      <span className="form-label">{label}</span>
      <input id={inputId} className={classes} value={safeValue} {...rest} />
      {helperText && !error && <span className="form-helper">{helperText}</span>}
      {error && <span className="form-error">{error}</span>}
    </label>
  );
};

export default Input;
