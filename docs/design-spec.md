# Design spec

Extracted from the Figma file (copy: `LEsQzQ3MoYcOVCxYqvHWfx`) via the Figma MCP.
Screenshots of every frame are in [`figma/`](figma/).

## Tokens

### Colors
| Token | Value | Used for |
|---|---|---|
| `--color-brand` (TrackMan Orange) | `#EC691A` | Primary buttons, checkbox, focus ring on open select |
| `--color-danger` (Danger Red) | `#EE1B34` | Delete button in modal |
| `--color-bg-black` | `#222222` | Top navigation bar |
| `--color-text` (Text & Element) | `#414141` | Headings, body text, card title |
| `--color-text-muted` (Dark Gray) | `#7B7B7B` | Secondary text |
| `--color-gray` | `#A0A0A0` | Card location, placeholders |
| `--color-light-gray` | `#E0E0E0` | Dropzone background, dividers |
| `--color-lighter-gray` | `#F5F5F5` | Page background, ghost button (Cancel, ⋯) |
| `--color-white` | `#FFFFFF` | Cards, header, inputs, menu |

### Typography (Inter)
| Token | Size / line-height / weight | Used for |
|---|---|---|
| Header 1 | 22 / 30.8 / 700 | Page title "Courses" |
| Header 2 | 15 / 21 / 600 | Section titles ("Course details", "Location", "Image"), modal title |
| Body | 13 / 18.2 / 400 | Body text, inputs |
| Body Bold | 13 / 18.2 / 600 | Card course name, filename |
| Button | 13 / 12 / 600 | Buttons |
| Label | 11 / 15.4 / 400 | Card meta (Par • Difficulty), floating input labels |
| Trumpet | 11 / 10 / 700, letter-spacing 2px, uppercase | "FACILITY PORTAL", "CARD PREVIEW" |

### Effects
- Soft shadow (card hover, menu): `0 5px 15px rgba(0,0,0,0.10)`

## Layout

### Shell
- Top nav: 48px, `#222`, logo + divider + "FACILITY PORTAL" (Trumpet, white).
- Page header: white, 104px desktop (title + subtitle "Browse and add golf courses", 40px left padding). Mobile: 57px, centered "Courses" only, no subtitle.

### List page (1440 desktop)
- Content padding 40px (mobile 16px). Background `#F5F5F5`.
- "Create a course" button right-aligned, 148×32, orange.
- Grid: 4 columns, 32px gap (cards 316px wide at 1360 content width). Mobile: 1 column, 32px vertical gap.
- Card: white, radius ~16px, 12px padding, image fills width with ~4px radius, portrait ratio (~292×342 ≈ 6:7).
  - Under image: location (Body, gray, e.g. "California, US"), name (Body Bold), meta (Label: "Par 72 • Difficulty: 4/5").
  - Featured: white pill top-left on image with ★ + "FEATURED" (bold, 11px uppercase).
  - **Hover**: soft shadow, a 32×32 "⋯" ghost button appears bottom-right of the text block.
- Per-card menu: white popover, 192px wide, items 40px tall with icon (pencil "Edit", trash "Delete"). Item states in Figma: default, hover, on-click, selected, disabled.

### Create / edit page
- Sub-toolbar under header: 48px, white, bottom border, "Save" button right (orange, 96×32).
- Two columns: form ~814px (40px padding) | preview ~626px.
- Form grid: inputs 312×48 in two columns with 32px gap; vertical rhythm 32px; textarea 656×130.
- Inputs: white, 1px border `#7B7B7B`-ish, radius 4px, floating label (Label size) once filled; placeholder "Title*".
- Select: same as input with chevron; open state has orange border and a white dropdown list.
- Checkbox "Featured course": orange when checked.
- Sections: "Course details" (+ explainer "Review the information and make changes if necessary."), "Location", "Image".
- Dropzone: 734×216, `#E0E0E0`, radius 4px, cloud-upload icon, "Drag & Drop", "Drag & drop or click to browse images and videos".
- After upload: white row 312×64 with 40×40 thumbnail, filename (Body Bold) and a 32×32 pencil button that reopens the file picker.
- Preview: centered "CARD PREVIEW" label (Trumpet, gray) above a 304px card. Placeholder image = checkerboard pattern. Sticky.

### Delete modal
- 444px wide, white, radius ~8px. Header "Delete course" (Header 2) + close ✕, divider.
- Body: "Are you sure you want to delete this course? You will lose all data attached to it."
- Footer: "Cancel" (ghost, `#F5F5F5`) + "Delete" (red).

## Where the design and the brief disagree (decisions)

| Topic | Figma | Brief | Decision |
|---|---|---|---|
| Fields | Title, Difficulty, Description, Par, Featured, City/State, Country, Image | Name, Country, Par, Difficulty, Image, Featured | Brief's fields + **City** (required). Description dropped: not shown anywhere. |
| Location on card | "California, US" (city + country code) | "location" | `"{city}, {countryCode}"` |
| Hover card | Shows "Difficulty 4/5" next to location and "M: 5 592m F: 4 800 m" tee lengths | Not mentioned | Add **optional** tee lengths (men/women, metres). Hover moves difficulty up and shows lengths only when set; otherwise meta stays "Par • Difficulty". |
| Delete modal text | Generic, no course name | Must include course name | Include the name: "…delete **{name}**?" |
| Dropzone copy | "images and videos" | jpg/png/webp only | Say "JPG, PNG or WebP" |
| Difficulty default | Empty "Choose an option" in one frame, "1" in another | Fixed 1–5 dropdown | Empty "Choose an option", required – avoids silently saving difficulty 1. |
