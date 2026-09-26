/**
 * GitHub's "Run workflow" form only has single-line text boxes, so Markdown typed
 * there can't contain real newlines. Instead, a typed "\n" becomes a newline
 * ("\n\n" for a new paragraph), and "\\n" stays a literal "\n".
 *
 * @param {string} text - The text to unescape.
 * @returns {string} The text with escaped newline sequences converted back to actual newlines.
 */
function unescapeNewlines(text) {
	return text.replace(/\\\\n|\\n/g, (match) => (match === "\\n" ? "\n" : "\\n"));
}

module.exports = { unescapeNewlines };
