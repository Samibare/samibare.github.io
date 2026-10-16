/**
 * Which parts of the résumé appear on the website.
 *
 * The site covers cybersecurity only. src/data/resume.ts keeps the full résumé
 * word for word; this file decides what is shown and where. The résumé PDF is
 * not affected.
 */

/** Résumé sections left off the site. */
export const hiddenResumeSections: string[] = [
  'Security Research', // the Research section at the top of the page covers this work
];

/**
 * Résumé lines left off the site, matched by how the line starts.
 * Hiding an entry (a line with a date) also hides the lines under it.
 */
export const hiddenResumeLines: string[] = [
  'Great Oak High School', // high school
];

/**
 * Résumé lines shown in a different section than on the résumé, matched by how
 * the line starts. The text is unchanged; it is added to the end of the named section.
 * Example: { 'National Cyber League': 'Leadership & Awards' }
 */
export const movedResumeLines: Record<string, string> = {};

/** Résumé sections in the order they appear on the home page. Others follow in résumé order. */
export const resumeSectionOrder: string[] = [
  'Technical Skills',
  'Projects & Training',
  'Leadership & Awards',
  'Certifications',
  'Education',
];
