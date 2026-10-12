import { useState, type ReactNode } from "react";
import { StarIcon } from "../../../ui/icons";
import type { Course } from "../model/types";
import styles from "./CourseCard.module.css";

/** Everything optional except `featured`, so the live preview can render a half-filled form. */
export type CourseCardProps = Partial<
  Pick<Course, "name" | "city" | "country" | "par" | "difficulty" | "teeLengthMen" | "teeLengthWomen" | "imageUrl">
> & {
  featured: boolean;
  /** Rendered bottom-right; shown on hover/focus (always on touch devices). */
  actions?: ReactNode;
  /** h2 in the list; the editor preview uses "p" so it doesn't break the form's heading outline. */
  titleAs?: "h2" | "p";
};

const metres = new Intl.NumberFormat("sv-SE"); // "5 592", as in the design

/** "California, US"; in a half-filled preview the missing part shows as a gray placeholder. */
function Location({ city, country }: { city?: string; country?: string }) {
  const trimmedCity = city?.trim();
  if (trimmedCity && country) return <>{`${trimmedCity}, ${country}`}</>;
  return (
    <>
      {trimmedCity || <Placeholder>City</Placeholder>}
      {", "}
      {country || <Placeholder>Country</Placeholder>}
    </>
  );
}

/** Half-typed numbers in the live preview can be NaN; the card treats them as missing. */
function finite(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function formatTees(men?: number, women?: number) {
  const parts = [
    men != null && `M: ${metres.format(men)} m`,
    women != null && `F: ${metres.format(women)} m`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

export function CourseCard({
  name,
  city,
  country,
  par,
  difficulty,
  teeLengthMen,
  teeLengthWomen,
  imageUrl,
  featured,
  actions,
  titleAs: Title = "h2",
}: CourseCardProps) {
  const tees = formatTees(finite(teeLengthMen), finite(teeLengthWomen));
  const parValue = finite(par);
  const difficultyValue = finite(difficulty);
  const difficultyText = difficultyValue ? `${difficultyValue}/5` : "–/5";

  return (
    // data-has-tees enables the hover swap in CSS: difficulty moves up and the tee lengths take its place.
    <article className={styles.card} data-has-tees={tees ? "" : undefined}>
      <div className={styles.media}>
        <CourseImage src={imageUrl ?? null} />
        {featured && (
          <span className={styles.badge}>
            <StarIcon size={12} />
            Featured
          </span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.text}>
          <p className={styles.location}>
            <span className={styles.truncate}>
              <Location city={city} country={country} />
            </span>
            {tees && <span className={styles.hoverOnly}>Difficulty {difficultyText}</span>}
          </p>
          <Title className={styles.name} title={name || undefined}>
            {name?.trim() || <Placeholder>Course name</Placeholder>}
          </Title>
          <p className={styles.meta}>
            <span>Par {parValue ?? "–"}</span>
            <span className={styles.dot} aria-hidden="true" />
            <span className={tees ? styles.defaultOnly : undefined}>Difficulty: {difficultyText}</span>
            {tees && <span className={styles.hoverOnly}>{tees}</span>}
          </p>
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </article>
  );
}

function Placeholder({ children }: { children: ReactNode }) {
  return <span className={styles.placeholder}>{children}</span>;
}

/** Falls back to the checkerboard placeholder when there is no image or it fails to load. */
function CourseImage({ src }: { src: string | null }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return <div className={styles.imagePlaceholder} />;
  return <img className={styles.image} src={src} alt="" loading="lazy" onError={() => setFailedSrc(src)} />;
}
