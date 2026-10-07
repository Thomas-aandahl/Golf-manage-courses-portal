import { useId, type ComponentProps } from "react";
import styles from "./Field.module.css";

export type TextFieldProps = Omit<ComponentProps<"input">, "placeholder"> & {
  label: string;
  /** Shown below the field; replaced by `error` when there is one. */
  hint?: string;
  error?: string;
};

/** Text input with a floating label. Spread `register(...)` onto it: `ref` is forwarded to the real input. */
export function TextField({ label, hint, error, id, required, className, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <div className={styles.box}>
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required && <span aria-hidden="true">*</span>}
        </label>
        {/* A blank placeholder lets CSS (:placeholder-shown) know whether the field is empty. */}
        <input
          id={inputId}
          className={styles.control}
          placeholder=" "
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          {...inputProps}
        />
      </div>
      {message && (
        <p id={messageId} className={error ? styles.error : styles.hint}>
          {message}
        </p>
      )}
    </div>
  );
}
