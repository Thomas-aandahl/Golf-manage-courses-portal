import * as Dialog from "@radix-ui/react-dialog";
import { useRef, type RefObject } from "react";
import { Button } from "../../../ui/Button";
import { CloseIcon } from "../../../ui/icons";
import type { Course } from "../model/types";
import { useDeleteCourse } from "../queries/courseMutations";
import styles from "./DeleteCourseDialog.module.css";

type DeleteCourseDialogProps = {
  /** The course to confirm; `null` closes the dialog. */
  course: Pick<Course, "id" | "name"> | null;
  onClose: () => void;
  /** Focus target after Cancel/Escape/✕: the menu trigger that opened the dialog. */
  returnFocusRef: RefObject<HTMLElement | null>;
  /** Focus target after a confirmed delete, since the card and its menu trigger are gone. */
  focusAfterDeleteRef: RefObject<HTMLElement | null>;
};

export function DeleteCourseDialog({ course, onClose, returnFocusRef, focusAfterDeleteRef }: DeleteCourseDialogProps) {
  const deleteCourse = useDeleteCourse();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmedRef = useRef(false);

  function confirm() {
    if (!course) return;
    confirmedRef.current = true;
    // Optimistic: the card disappears right away; the mutation toasts and rolls back on failure.
    deleteCourse.mutate({ id: course.id, name: course.name });
    onClose();
  }

  return (
    <Dialog.Root open={course !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.content}
          onOpenAutoFocus={(event) => {
            // Cancel is the safe default for a destructive action.
            event.preventDefault();
            cancelRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            // The dialog is opened from a menu, not a Dialog.Trigger, so Radix has nothing to return focus to.
            event.preventDefault();
            const target = confirmedRef.current ? focusAfterDeleteRef.current : returnFocusRef.current;
            confirmedRef.current = false;
            target?.focus();
          }}
        >
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>Delete course</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className={styles.close} aria-label="Close">
                <CloseIcon size={20} />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className={styles.body}>
            Are you sure you want to delete <b>{course?.name}</b>? You will lose all data attached to it.
          </Dialog.Description>
          <div className={styles.footer}>
            <Dialog.Close asChild ref={cancelRef}>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Button variant="danger" onClick={confirm}>
              Delete
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
