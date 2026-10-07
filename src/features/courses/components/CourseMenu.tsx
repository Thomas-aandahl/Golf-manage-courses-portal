import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../ui/Button";
import { MoreIcon, PencilIcon, TrashIcon } from "../../../ui/icons";
import type { Course } from "../model/types";
import styles from "./CourseMenu.module.css";

type CourseMenuProps = {
  course: Pick<Course, "id" | "name">;
  /** Receives the menu trigger so the delete dialog can return focus to it on cancel. */
  onDelete: (trigger: HTMLButtonElement | null) => void;
};

export function CourseMenu({ course, onDelete }: CourseMenuProps) {
  const navigate = useNavigate();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    // Non-modal: opening the delete Dialog from a modal menu can leave `pointer-events: none` on <body>.
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild ref={triggerRef}>
        <Button variant="icon" aria-label={`Actions for ${course.name}`}>
          <MoreIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.content} align="end" sideOffset={4} collisionPadding={8}>
          <DropdownMenu.Item className={styles.item} onSelect={() => navigate(`/courses/${course.id}/edit`)}>
            <PencilIcon />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item className={styles.item} onSelect={() => onDelete(triggerRef.current)}>
            <TrashIcon />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
