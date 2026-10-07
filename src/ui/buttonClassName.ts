import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "icon";

/** Button styling for elements that are not <button>, e.g. a router <Link> that looks like a button. */
export function buttonClassName(variant: ButtonVariant = "primary", className?: string) {
  return [styles.button, styles[variant], className].filter(Boolean).join(" ");
}

export const spinnerClassName = styles.spinner;
