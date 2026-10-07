import { useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { mockFailures, type FailureKey } from "../features/courses/api";
import { courseKeys } from "../features/courses/queries/courseKeys";
import styles from "./DevPanel.module.css";

const OPTIONS: { key: FailureKey; label: string }[] = [
  { key: "load", label: "Fail loading" },
  { key: "save", label: "Fail saving" },
  { key: "delete", label: "Fail deleting" },
];

/** Reviewer tool: makes the mock API fail on purpose. Shown in every build. */
export function DevPanel() {
  const queryClient = useQueryClient();
  const failures = useSyncExternalStore(mockFailures.subscribe, mockFailures.get);
  const activeCount = OPTIONS.filter(({ key }) => failures[key]).length;

  function toggle(key: FailureKey, value: boolean) {
    mockFailures.set(key, value);
    // Refetch right away so a load failure (or its recovery) is visible without a reload.
    if (key === "load") void queryClient.invalidateQueries({ queryKey: courseKeys.all });
  }

  return (
    <details className={styles.panel}>
      <summary className={styles.summary}>
        Mock API
        {activeCount > 0 && <span className={styles.badge}>{activeCount} failing</span>}
      </summary>
      <div className={styles.body}>
        <p className={styles.hint}>Simulate server errors to see error states and the delete rollback.</p>
        {OPTIONS.map(({ key, label }) => (
          <label key={key} className={styles.option}>
            <input
              type="checkbox"
              checked={failures[key]}
              onChange={(event) => toggle(key, event.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
    </details>
  );
}
