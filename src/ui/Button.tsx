import type { ButtonHTMLAttributes } from "react";
import { buttonClassName, spinnerClassName, type ButtonVariant } from "./buttonClassName";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Shows a spinner, sets aria-busy and blocks clicks, but keeps the button focusable. */
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading = false,
  // A <button> inside a form defaults to "submit"; make that opt-in so icon buttons never submit by accident.
  type = "button",
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, className)}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      onClick={loading ? (event) => event.preventDefault() : onClick}
      {...props}
    >
      {loading && <span className={spinnerClassName} aria-hidden="true" />}
      {children}
    </button>
  );
}
