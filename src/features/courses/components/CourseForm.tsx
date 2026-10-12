import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch, type Control, type DefaultValues } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Checkbox } from "../../../ui/Checkbox";
import { SelectField } from "../../../ui/SelectField";
import { TextField } from "../../../ui/TextField";
import { COUNTRIES } from "../model/countries";
import { courseFormSchema, type CourseFormValues } from "../model/courseSchema";
import { CourseCard } from "./CourseCard";
import { ImageDropzone } from "./ImageDropzone";
import styles from "./CourseForm.module.css";

type CourseFormProps = {
  /** Referenced by the Save button in the page toolbar, which sits outside the <form>. */
  id: string;
  defaultValues: DefaultValues<CourseFormValues>;
  /** The saved image when editing. */
  initialImageUrl?: string | null;
  /** Create or update; the form navigates home when it resolves and shows a toast when it rejects. */
  onSubmit: (values: CourseFormValues) => Promise<unknown>;
};

const DIFFICULTIES = [1, 2, 3, 4, 5];

// RHF also runs setValueAs on the default value (null/undefined), not just on input strings.
const isEmpty = (value: unknown) => value === null || value === undefined || String(value).trim() === "";
// Plain decimal numbers only: Number() would also accept "0x48" or "1e3". Anything else becomes NaN,
// which the schema reports as "must be a number".
const parseNumber = (value: unknown) => {
  const text = String(value).trim();
  return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : Number.NaN;
};
const toNumber = (value: unknown) => (isEmpty(value) ? undefined : parseNumber(value));
const toNumberOrNull = (value: unknown) => (isEmpty(value) ? null : parseNumber(value));

export function CourseForm({ id, defaultValues, initialImageUrl = null, onSubmit }: CourseFormProps) {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    // Validate a field when it is first left, then on every change, so errors don't appear mid-typing.
    mode: "onTouched",
    defaultValues,
  });

  // One object URL per picked file, shared by the dropzone thumbnail and the card preview.
  // Revoked when a new file replaces it and on unmount.
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!newImageUrl) return;
    return () => URL.revokeObjectURL(newImageUrl);
  }, [newImageUrl]);

  // The save can resolve after the user has already left (e.g. clicked Cancel and opened another course);
  // navigating then would pull them out of wherever they are now.
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  async function save(values: CourseFormValues) {
    try {
      await onSubmit(values);
      if (isMounted.current) navigate("/");
    } catch (error) {
      // Stay on the page with everything the user typed.
      toast.error(error instanceof Error ? error.message : "Could not save the course");
    }
  }

  return (
    <div className={styles.layout}>
      <form
        id={id}
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          // Enter in a field can submit again while the save is still running.
          if (isSubmitting) {
            event.preventDefault();
            return;
          }
          void handleSubmit(save)(event);
        }}
      >
        <section className={styles.section} aria-labelledby={`${id}-details`}>
          <header className={styles.sectionHeader}>
            <h3 id={`${id}-details`} className={styles.heading}>
              Course details
            </h3>
            <p className={styles.explainer}>Review the information and make changes if necessary.</p>
          </header>

          <div className={styles.row}>
            <TextField
              label="Course name"
              required
              autoComplete="off"
              error={errors.name?.message}
              {...register("name")}
            />
            <SelectField
              label="Difficulty"
              required
              placeholder="Choose an option"
              error={errors.difficulty?.message}
              {...register("difficulty", { setValueAs: toNumber })}
            >
              {DIFFICULTIES.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </SelectField>
          </div>

          <div className={styles.row}>
            <TextField
              label="Par"
              required
              inputMode="numeric"
              autoComplete="off"
              error={errors.par?.message}
              {...register("par", { setValueAs: toNumber })}
            />
          </div>

          <div className={styles.row}>
            <TextField
              label="Men's tee length (m)"
              hint="Optional"
              inputMode="numeric"
              autoComplete="off"
              error={errors.teeLengthMen?.message}
              {...register("teeLengthMen", { setValueAs: toNumberOrNull })}
            />
            <TextField
              label="Women's tee length (m)"
              hint="Optional"
              inputMode="numeric"
              autoComplete="off"
              error={errors.teeLengthWomen?.message}
              {...register("teeLengthWomen", { setValueAs: toNumberOrNull })}
            />
          </div>

          <Checkbox label="Featured course" {...register("featured")} />
        </section>

        <section className={styles.section} aria-labelledby={`${id}-location`}>
          <h3 id={`${id}-location`} className={styles.heading}>
            Location
          </h3>
          <div className={styles.row}>
            <TextField
              label="City"
              required
              autoComplete="off"
              error={errors.city?.message}
              {...register("city")}
            />
            <SelectField label="Country" required error={errors.country?.message} {...register("country")}>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </SelectField>
          </div>
        </section>

        <section className={styles.section} aria-labelledby={`${id}-image`}>
          <h3 id={`${id}-image`} className={styles.heading}>
            Image
          </h3>
          {/* Controller rather than register(): the dropzone is a custom component, not a native input. */}
          <Controller
            name="image"
            control={control}
            render={({ field, fieldState }) => (
              <ImageDropzone
                ref={field.ref}
                file={field.value}
                fileUrl={newImageUrl}
                currentImageUrl={initialImageUrl}
                error={fieldState.error?.message}
                onSelect={(file) => {
                  field.onChange(file);
                  setNewImageUrl(URL.createObjectURL(file));
                }}
              />
            )}
          />
        </section>
      </form>

      <aside className={styles.preview} aria-label="Card preview">
        <p className={styles.previewLabel} aria-hidden="true">
          Card preview
        </p>
        <div className={styles.previewCard}>
          <LivePreview control={control} imageUrl={newImageUrl ?? initialImageUrl} />
        </div>
      </aside>
    </div>
  );
}

/** Its own component so each keystroke re-renders only the card, not the whole form. */
function LivePreview({ control, imageUrl }: { control: Control<CourseFormValues>; imageUrl: string | null }) {
  const values = useWatch({ control });

  return (
    <CourseCard
      name={values.name}
      city={values.city}
      country={values.country}
      par={values.par}
      difficulty={values.difficulty}
      teeLengthMen={values.teeLengthMen}
      teeLengthWomen={values.teeLengthWomen}
      imageUrl={imageUrl}
      featured={!!values.featured}
      titleAs="p"
    />
  );
}
