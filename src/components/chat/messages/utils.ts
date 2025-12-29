/**
 * Utility functions for message components
 */

/**
 * Formats grade level labels
 * Converts "grade_12_13" -> "Grade 12-13"
 * Converts "grade_6" -> "Grade 6"
 */
export const formatGradeLabel = (raw: string): string => {
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(" ", " ") // Adjust spacing if needed
    .replace(/ (\d+) (\d+)/, " $1-$2"); // Handle range like 12 13 -> 12-13
};
