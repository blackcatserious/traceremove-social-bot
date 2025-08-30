export type Platform = 'X' | 'Facebook' | 'Instagram';

/**
 * Maximum allowed length of the body (the part before the link and hashtags)
 * for each platform.  The text generator will try to respect these limits.
 */
export const BODY_MAX: Record<Platform, number> = {
  X: 270,
  Facebook: 1000,
  Instagram: 2200
};

/**
 * Allowed number of hashtags per platform.  The lower bound is used when
 * normalising a tag list and the upper bound when truncating long lists.
 */
export const TAG_LIMIT: Record<Platform, { min: number; max: number }> = {
  X: { min: 1, max: 3 },
  Facebook: { min: 3, max: 5 },
  Instagram: { min: 5, max: 10 }
};