/**
 * Calculates reading time in minutes
 * @param {string} content - The body of the blog
 * @returns {string} - Estimated time in minutes
 */
const calculateReadingTime = (content = "") => {
    const wordsPerMinute = 200;
    const words = content.trim()
        ? content.trim().split(/\s+/).length
        : 0;

    const minutes = Math.ceil(words / wordsPerMinute);
    return words > 0 && words < wordsPerMinute
        ? "less than 1 min read"
        : `${minutes} min read`;
};

module.exports = { calculateReadingTime };