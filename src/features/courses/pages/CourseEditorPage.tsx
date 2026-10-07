import type { ReactNode } from "react";
import type { DefaultValues } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../../ui/Button";
import { buttonClassName } from "../../../ui/buttonClassName";
import { isNotFound } from "../api";
import { CourseForm } from "../components/CourseForm";
import type { CourseFormValues } from "../model/courseSchema";
import type { Course } from "../model/types";
import { useCourse } from "../queries/courseQueries";
import { useCreateCourse, useUpdateCourse } from "../queries/courseMutations";
import styles from "./CourseEditorPage.module.css";

const FORM_ID = "course-form";

const EMPTY_VALUES: DefaultValues<CourseFormValues> = {
  name: "",
  city: "",
  country: "DK",
  par: undefined,
  difficulty: undefined,
  featured: false,
  teeLengthMen: null,
  teeLengthWomen: null,
  image: undefined,
};

/** Serves both `courses/new` and `courses/:courseId/edit`. */
export function CourseEditorPage() {
  const { courseId } = useParams();
  // Keyed so going from one course's editor to another starts fresh.
  return courseId ? <EditCourse key={courseId} id={courseId} /> : <CreateCourse />;
}

function CreateCourse() {
  const createCourse = useCreateCourse();

  return (
    <EditorShell title="Create course" saving={createCourse.isPending} canSave>
      <CourseForm id={FORM_ID} defaultValues={EMPTY_VALUES} onSubmit={createCourse.mutateAsync} />
    </EditorShell>
  );
}

function EditCourse({ id }: { id: string }) {
  const { data: course, error, isPending, refetch, isRefetching } = useCourse(id);
  const updateCourse = useUpdateCourse(id);

  let content: ReactNode;
  if (course) {
    content = (
      <CourseForm
        key={course.id}
        id={FORM_ID}
        defaultValues={toFormValues(course)}
        initialImageUrl={course.imageUrl}
        onSubmit={updateCourse.mutateAsync}
      />
    );
  } else if (isPending) {
    content = <EditorSkeleton />;
  } else if (isNotFound(error)) {
    content = (
      <div className={styles.panel} role="alert">
        <h3 className={styles.panelTitle}>Course not found</h3>
        <p className={styles.panelText}>It may have been deleted, or the link is wrong.</p>
        <Link to="/" className={buttonClassName("secondary")}>
          Back to courses
        </Link>
      </div>
    );
  } else {
    content = (
      <div className={styles.panel} role="alert">
        <h3 className={styles.panelTitle}>Could not load the course</h3>
        <p className={styles.panelText}>{error?.message ?? "Something went wrong."}</p>
        <Button variant="secondary" loading={isRefetching} onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <EditorShell title="Edit course" saving={updateCourse.isPending} canSave={!!course}>
      {content}
    </EditorShell>
  );
}

function toFormValues(course: Course): CourseFormValues {
  return {
    name: course.name,
    city: course.city,
    country: course.country,
    par: course.par,
    difficulty: course.difficulty,
    featured: course.featured,
    teeLengthMen: course.teeLengthMen,
    teeLengthWomen: course.teeLengthWomen,
    image: undefined,
  };
}

type EditorShellProps = {
  title: string;
  saving: boolean;
  canSave: boolean;
  children: ReactNode;
};

function EditorShell({ title, saving, canSave, children }: EditorShellProps) {
  return (
    <>
      <h2 className="visually-hidden">{title}</h2>
      <div className={styles.toolbar}>
        <Link to="/" className={buttonClassName("secondary")}>
          Cancel
        </Link>
        {/* Outside the <form>, so it is tied to it with the `form` attribute. */}
        <Button type="submit" form={FORM_ID} loading={saving} disabled={!canSave}>
          Save
        </Button>
      </div>
      {children}
    </>
  );
}

function EditorSkeleton() {
  return (
    <div className={styles.skeleton} role="status">
      <span className="visually-hidden">Loading course…</span>
      <div className={styles.skeletonFields} aria-hidden="true">
        <span className={`${styles.bone} ${styles.boneHeading}`} />
        <span className={styles.bone} />
        <span className={styles.bone} />
        <span className={styles.bone} />
        <span className={styles.bone} />
      </div>
      <span className={`${styles.bone} ${styles.skeletonCard}`} aria-hidden="true" />
    </div>
  );
}
