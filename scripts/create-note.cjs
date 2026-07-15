const fs = require("node:fs");
const path = require("node:path");

const DIR_NAME = __dirname;
const NOTE_DIR = path.join(DIR_NAME, "..", "src", "content", "note");
const IMAGES_DIR = path.join(NOTE_DIR, "images");

// Browser-like headers to avoid getting 403'd when downloading images.
const BROWSER_HEADERS = {
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
	Accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
	"Accept-Language": "en-US,en;q=0.9",
};

const CONTENT_TYPE_EXT = {
	"image/jpeg": "jpeg",
	"image/jpg": "jpeg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
	"image/avif": "avif",
	"image/svg+xml": "svg",
};

// IST (UTC+5:30) so notes are dated in the author's local time even from CI (UTC).
function istNow() {
	const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
	const pad = (n) => String(n).padStart(2, "0");
	const date = `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}`;
	const time = `${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())}`;
	return { date, timestamp: `${date}T${time}+05:30` };
}

// Note slugs use underscores between words (e.g. "Devtool Obsession" -> "devtool_obsession").
function createSlug(title) {
	return title
		.toLowerCase()
		.replace(/[^\w\s-]/g, "") // Remove special characters
		.replace(/[\s-]+/g, "_") // Whitespace/hyphens -> underscore
		.replace(/_+/g, "_") // Collapse repeats
		.replace(/^_|_$/g, ""); // Trim leading/trailing underscores
}

function extFromResponse(url, contentType) {
	const ct = (contentType || "").split(";")[0].trim().toLowerCase();
	if (CONTENT_TYPE_EXT[ct]) {
		return CONTENT_TYPE_EXT[ct];
	}
	const urlExt = path.extname(new URL(url).pathname).slice(1).toLowerCase();
	const known = new Set(Object.values(CONTENT_TYPE_EXT));
	if (known.has(urlExt)) {
		return urlExt === "jpg" ? "jpeg" : urlExt;
	}
	throw new Error(`Could not determine image type (content-type: "${contentType}", url: "${url}")`);
}

async function downloadCoverImage(imageUrl, baseName) {
	// Validate URL early.
	new URL(imageUrl);

	console.log(`Downloading cover image: ${imageUrl}`);
	const response = await fetch(imageUrl, { headers: BROWSER_HEADERS });
	if (!response.ok) {
		throw new Error(`Image download failed! status: ${response.status}`);
	}

	const ext = extFromResponse(imageUrl, response.headers.get("content-type"));
	const buffer = Buffer.from(await response.arrayBuffer());

	if (!fs.existsSync(IMAGES_DIR)) {
		fs.mkdirSync(IMAGES_DIR, { recursive: true });
	}

	const imageFilename = `${baseName}.${ext}`;
	const imagePath = path.join(IMAGES_DIR, imageFilename);
	fs.writeFileSync(imagePath, buffer);

	console.log(`🖼️  Saved image: ${imagePath}`);
	return imageFilename;
}

function generateFrontmatter({ title, timestamp, imageFilename, imageAlt }, note) {
	const cleanTitle = (title || "").replace(/"/g, '\\"');

	let frontmatter = `---
title: "${cleanTitle}"
publishDate: "${timestamp}"`;

	if (imageFilename) {
		const cleanAlt = (imageAlt || "").replace(/"/g, '\\"');
		frontmatter += `
coverImage:
    src: ./images/${imageFilename}
    alt: "${cleanAlt}"`;
	}

	frontmatter += `
---

${note.trim()}
`;

	return frontmatter;
}

async function createNote({ note, title, coverImageUrl, imageAlt }) {
	try {
		if (!note || !note.trim()) {
			throw new Error("Note content is required.");
		}

		const { date, timestamp } = istNow();
		const slug = title ? createSlug(title) : "";
		const baseName = slug ? `${date}_${slug}` : date;

		// Download the image first so a failure aborts before we write anything.
		let imageFilename;
		if (coverImageUrl && coverImageUrl.trim()) {
			imageFilename = await downloadCoverImage(coverImageUrl.trim(), baseName);
		}

		const content = generateFrontmatter({ title, timestamp, imageFilename, imageAlt }, note);

		if (!fs.existsSync(NOTE_DIR)) {
			fs.mkdirSync(NOTE_DIR, { recursive: true });
		}

		const filename = `${baseName}.md`;
		const filepath = path.join(NOTE_DIR, filename);
		if (fs.existsSync(filepath)) {
			console.log(`Warning: File ${filename} already exists. Overwriting...`);
		}
		fs.writeFileSync(filepath, content);

		console.log("✅ Note created successfully!");
		console.log(`📁 File: ${filepath}`);
		if (title) {
			console.log(`📝 Title: ${title}`);
		}
		if (imageFilename) {
			console.log(`🖼️  Cover: ./images/${imageFilename}`);
		}

		return filepath;
	} catch (error) {
		console.error("❌ Error creating note:", error.message);
		process.exit(1);
	}
}

// Main execution
// Usage: node scripts/create-note.cjs "<note>" "<title>" "<cover image url>" "<image alt>"
const [, , note, title, coverImageUrl, imageAlt] = process.argv;

if (!note || !note.trim()) {
	console.error("❌ Please provide the note content as the first argument");
	console.log('Usage: npm run create-note "<note>" "<title>" "<cover image url>" "<image alt>"');
	process.exit(1);
}

createNote({ note, title, coverImageUrl, imageAlt });
