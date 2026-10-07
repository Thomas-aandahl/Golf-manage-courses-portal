import { useId, useRef, useState, type DragEvent, type Ref } from "react";
import { buttonClassName } from "../../../ui/buttonClassName";
import { AlertIcon, PencilIcon, UploadIcon } from "../../../ui/icons";
import { ACCEPTED_IMAGE_TYPES, imageFileSchema } from "../model/courseSchema";
import styles from "./ImageDropzone.module.css";

export type ImageDropzoneProps = {
  /** The newly picked file, if any. */
  file?: File;
  /** Object URL for `file`, owned by the parent so the card preview can reuse it. */
  fileUrl: string | null;
  /** The saved image when editing; shown as "Current image" until a new file is picked. */
  currentImageUrl?: string | null;
  /** Only called with a file that passed `imageFileSchema`. */
  onSelect: (file: File) => void;
  error?: string;
  /** Focus target for the form (e.g. RHF's focus-on-error). */
  ref?: Ref<HTMLButtonElement>;
};

export function ImageDropzone({ file, fileUrl, currentImageUrl, onSelect, error, ref }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const hintId = useId();
  const errorId = useId();

  const message = rejection ?? error;
  const thumbnailUrl = fileUrl ?? currentImageUrl ?? null;
  const browse = () => inputRef.current?.click();

  function handleFiles(files: FileList | null) {
    // Only the first file of a multi-file drop is used.
    const picked = files?.[0];
    if (!picked) return;
    const result = imageFileSchema.safeParse(picked);
    if (!result.success) {
      const reason = result.error.issues[0]?.message ?? "Only JPG, PNG or WebP images are allowed";
      setRejection(`“${picked.name}” isn't supported. ${reason}.`);
      return;
    }
    setRejection(null);
    onSelect(result.data);
  }

  const dropHandlers = {
    onDragEnter: (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(true);
    },
    onDragOver: (event: DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (event: DragEvent) => {
      // Ignore leaving into a child element.
      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
      setIsDragging(false);
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
  };

  const describedBy = message ? errorId : undefined;

  return (
    <div className={styles.root}>
      {thumbnailUrl ? (
        <div className={styles.selected} data-dragging={isDragging || undefined} {...dropHandlers}>
          <img className={styles.thumbnail} src={thumbnailUrl} alt="" />
          <span className={styles.fileName} title={file?.name}>
            {file ? file.name : "Current image"}
          </span>
          <button
            ref={ref}
            type="button"
            className={buttonClassName("icon", styles.replace)}
            aria-label="Replace image"
            aria-describedby={describedBy}
            onClick={browse}
          >
            <PencilIcon size={16} />
          </button>
        </div>
      ) : (
        <button
          ref={ref}
          type="button"
          className={styles.zone}
          data-dragging={isDragging || undefined}
          aria-describedby={describedBy ? `${hintId} ${describedBy}` : hintId}
          aria-invalid={message ? true : undefined}
          onClick={browse}
          {...dropHandlers}
        >
          <UploadIcon size={32} className={styles.icon} />
          <span className={styles.title}>Drag &amp; Drop</span>
          <span id={hintId} className={styles.hint}>
            Drag &amp; drop or click to browse — JPG, PNG or WebP, max 10 MB
          </span>
        </button>
      )}

      {/* Visually hidden rather than display:none so it still works everywhere; the buttons above are the focus targets. */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          handleFiles(event.currentTarget.files);
          // Allow picking the same file again after a rejection.
          event.currentTarget.value = "";
        }}
      />

      {message && (
        <p id={errorId} role="alert" className={styles.error}>
          <AlertIcon size={14} />
          {message}
        </p>
      )}
    </div>
  );
}
