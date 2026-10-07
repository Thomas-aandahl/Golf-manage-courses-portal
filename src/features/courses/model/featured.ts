/**
 * Decides `featuredAt` when a course is saved.
 * - not featured → featured: the save time becomes the moment it was featured
 * - stays featured: keep the original time, so its position in the featured list does not move
 * - featured → not featured: cleared, so re-featuring later puts it at the end
 */
export function resolveFeaturedAt(
  previous: { featured: boolean; featuredAt: string | null } | null,
  nextFeatured: boolean,
  now: string,
): string | null {
  if (!nextFeatured) return null;
  if (previous?.featured && previous.featuredAt) return previous.featuredAt;
  return now;
}
