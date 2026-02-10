/**
 * Calculates reading time in minutes
 * @param {string} content - The body of the blog
 * @returns {number} - Estimated time in minutes
 */
const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    // Split by whitespace and filter out empty strings to get accurate count
    const words = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / wordsPerMinute);

    return readingTime || 1; // Default to 1 minute if empty
};

module.exports = { calculateReadingTime };