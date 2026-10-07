import { useId, type ComponentProps } from "react";
import styles from "./Field.module.css";

export type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: string;
};

/** Native checkbox tinted with the brand colour. Spread `register(...)` onto it. */
export function Checkbox({ label, id, className, ...inputProps }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label className={[styles.checkbox, className].filter(Boolean).join(" ")} htmlFor={inputId}>
      <input id={inputId} type="checkbox" {...inputProps} />
      {label}
    </label>
  );
}
