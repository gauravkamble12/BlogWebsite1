/**
 * Calculates the estimated reading time for a given text.
 * @param {string} text - The content to analyze.
 * @param {number} wordsPerMinute - Average reading speed (default 225).
 * @returns {number} Estimated reading time in minutes.
 */
const calculateReadingTime = (text, wordsPerMinute = 225) => {
  if (!text) return 0;
  // Remove HTML tags for accurate word count
  const cleanText = text.replace(/<[^>]*>/g, ' ');
  const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

module.exports = { calculateReadingTime };
