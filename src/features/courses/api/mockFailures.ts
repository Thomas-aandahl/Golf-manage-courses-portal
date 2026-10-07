// Switches that make the mock service fail on purpose, so error states and the optimistic-delete
// rollback can be seen during review. Toggled from the dev panel; persisted per browser.

export type FailureKey = "load" | "save" | "delete";
export type Failures = Readonly<Record<FailureKey, boolean>>;

const STORAGE_KEY = "golf-portal:mock-failures";
const NONE: Failures = { load: false, save: false, delete: false };

function load(): Failures {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...NONE, ...(JSON.parse(raw) as Partial<Failures>) } : NONE;
  } catch {
    return NONE;
  }
}

let current = load();
const listeners = new Set<() => void>();

export const mockFailures = {
  get: (): Failures => current,
  set(key: FailureKey, value: boolean) {
    current = { ...current, [key]: value };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // Private mode or blocked storage: the toggle still works for this session.
    }
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
