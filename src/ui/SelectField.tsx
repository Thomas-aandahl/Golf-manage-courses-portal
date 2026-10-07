import { useId, type ComponentProps } from "react";
import { ChevronDownIcon } from "./icons";
import styles from "./Field.module.css";

export type SelectFieldProps = ComponentProps<"select"> & {
  label: string;
  /** Adds an empty first option, e.g. "Choose an option". */
  placeholder?: string;
  hint?: string;
  error?: string;
};

/** Native <select> (accessible and mobile-friendly) styled like the Figma input, label always floated. */
export function SelectField({
  label,
  placeholder,
  hint,
  error,
  id,
  required,
  className,
  children,
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const messageId = `${selectId}-message`;
  const message = error ?? hint;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <div className={`${styles.box} ${styles.floating}`}>
        <label className={styles.label} htmlFor={selectId}>
          {label}
          {required && <span aria-hidden="true">*</span>}
        </label>
        <select
          id={selectId}
          className={`${styles.control} ${styles.select}`}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          {...selectProps}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {children}
        </select>
        <ChevronDownIcon className={styles.chevron} size={20} />
      </div>
      {message && (
        <p id={messageId} className={error ? styles.error : styles.hint}>
          {message}
        </p>
      )}
    </div>
  );
}
