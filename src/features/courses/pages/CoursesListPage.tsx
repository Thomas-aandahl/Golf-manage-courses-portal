import { useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../ui/Button";
import { buttonClassName } from "../../../ui/buttonClassName";
import { AlertIcon } from "../../../ui/icons";
import { CourseCard } from "../components/CourseCard";
import { CourseMenu } from "../components/CourseMenu";
import { DeleteCourseDialog } from "../components/DeleteCourseDialog";
import type { Course } from "../model/types";
import { useCourses } from "../queries/courseQueries";
import styles from "./CoursesListPage.module.css";

const SKELETON_COUNT = 8;

export function CoursesListPage() {
  const { data: courses, error, isFetching, refetch } = useCourses();
  // Lives here, not in the card: the card is removed optimistically while the dialog is closing.
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const createLinkRef = useRef<HTMLAnchorElement>(null);
  const menuTriggerRef = useRef<HTMLElement | null>(null);

  // Data is checked before error: if a background refetch fails, the list stays (with a notice in the toolbar).
  let content: ReactNode;
  if (courses) {
    content =
      courses.length === 0 ? (
        <StatePanel title="No courses yet" text="Create your first course to see it here.">
          <Link to="/courses/new" className={buttonClassName("primary")}>
            Create a course
          </Link>
        </StatePanel>
      ) : (
        <ul className={styles.grid} aria-label="Courses">
          {courses.map((course) => (
            <li key={course.id} className={styles.item}>
              <CourseCard
                {...course}
                actions={
                  <CourseMenu
                    course={course}
                    onDelete={(trigger) => {
                      menuTriggerRef.current = trigger;
                      setCourseToDelete(course);
                    }}
                  />
                }
              />
            </li>
          ))}
        </ul>
      );
  } else if (error) {
    content = (
      <StatePanel
        role="alert"
        icon={<AlertIcon size={32} className={styles.alertIcon} />}
        title="Couldn't load courses"
        text={error.message}
      >
        <Button variant="secondary" loading={isFetching} onClick={() => void refetch()}>
          Try again
        </Button>
      </StatePanel>
    );
  } else {
    content = (
      <div aria-busy="true">
        <p className="visually-hidden" role="status">
          Loading courses…
        </p>
        <ul className={styles.grid} aria-hidden="true">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <li key={index} className={styles.item}>
              <SkeletonCard />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        {/* A background refetch failed: keep showing the last good list, but say so. */}
        {courses && error && (
          <p className={styles.staleNotice} role="status">
            <AlertIcon size={14} />
            Couldn't refresh courses. Showing the last loaded list.
            <button type="button" className={styles.linkButton} onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? "Retrying…" : "Retry"}
            </button>
          </p>
        )}
        <Link ref={createLinkRef} to="/courses/new" className={buttonClassName("primary")}>
          Create a course
        </Link>
      </div>

      {content}

      <DeleteCourseDialog
        course={courseToDelete}
        onClose={() => setCourseToDelete(null)}
        returnFocusRef={menuTriggerRef}
        focusAfterDeleteRef={createLinkRef}
      />
    </div>
  );
}

type StatePanelProps = {
  title: string;
  text: string;
  icon?: ReactNode;
  role?: "alert";
  children: ReactNode;
};

function StatePanel({ title, text, icon, role, children }: StatePanelProps) {
  return (
    <section className={styles.statePanel} role={role}>
      {icon}
      <h2 className={styles.stateTitle}>{title}</h2>
      <p className={styles.stateText}>{text}</p>
      <div className={styles.stateAction}>{children}</div>
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonText}>
        <span className={styles.skeletonBar} style={{ width: "45%" }} />
        <span className={styles.skeletonBar} style={{ width: "75%" }} />
        <span className={styles.skeletonBar} style={{ width: "55%" }} />
      </div>
    </div>
  );
}
