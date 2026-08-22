const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const FILE_NAME = __filename || path.basename(__filename);
const DIR_NAME = path.dirname(FILE_NAME);

const FETCH_TIMEOUT_MS = 20000;

// Browser-like headers to avoid getting 403'd (eg. Substack).
// https://www.zenrows.com/blog/user-agent-web-scraping#best
const BROWSER_HEADERS = {
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
	Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
	"Accept-Language": "en-US,en;q=0.9",
	"Sec-Ch-Ua": '"Chromium";v="123", "Not:A-Brand";v="8"',
	"Sec-Ch-Ua-Mobile": "?0",
	"Sec-Ch-Ua-Platform": '"Windows"',
	"Sec-Fetch-Dest": "document",
	"Sec-Fetch-Mode": "navigate",
	"Sec-Fetch-Site": "none",
	"Sec-Fetch-User": "?1",
	"Upgrade-Insecure-Requests": "1",
};

async function fetchHtml(url, options = {}) {
	const response = await fetch(url, {
		...options,
		redirect: "follow",
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	});
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return await response.text();
}

function jinaHeaders() {
	const headers = { ...BROWSER_HEADERS, "X-Return-Format": "html" };
	// Anonymous r.jina.ai requests are rate limited per IP and are routinely
	// 403'd from datacenter IPs (eg. GitHub Actions runners). A free key from
	// https://jina.ai/reader lifts that; set it as the JINA_API_KEY secret.
	if (process.env.JINA_API_KEY) {
		headers.Authorization = `Bearer ${process.env.JINA_API_KEY}`;
	}
	return headers;
}

async function fetchMetadataDirect(url) {
	return parseMetadata(await fetchHtml(url, { headers: BROWSER_HEADERS }), url);
}

async function fetchMetadataViaJina(url) {
	return parseMetadata(
		await fetchHtml(`https://r.jina.ai/${url}`, { headers: jinaHeaders() }),
		url,
	);
}

// Microlink extracts the metadata server side, so it sidesteps the datacenter-IP
// blocks that make direct fetches fail from CI. Free tier: 50 requests/day.
async function fetchMetadataViaMicrolink(url) {
	const body = await fetchHtml(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
		headers: { Accept: "application/json" },
	});
	const { status, data } = JSON.parse(body);
	if (status !== "success" || !data) {
		throw new Error(`unexpected response status "${status}"`);
	}
	return {
		title: (data.title || "Untitled").trim(),
		description: (data.description || "").trim(),
		author: (data.author || "").trim(),
		siteName: (data.publisher || new URL(url).hostname).trim(),
	};
}

// Tried in order; the first one that yields usable metadata wins.
const FETCH_STRATEGIES = [
	{ name: "direct fetch", getMetadata: fetchMetadataDirect },
	{ name: "microlink", getMetadata: fetchMetadataViaMicrolink },
	{ name: "jina reader proxy", getMetadata: fetchMetadataViaJina },
];

function parseMetadata(html, url) {
	const dom = new JSDOM(html);
	const document = dom.window.document;

	// Extract metadata
	const title =
		document.querySelector('meta[property="og:title"]')?.content ||
		document.querySelector('meta[name="twitter:title"]')?.content ||
		document.querySelector("title")?.textContent ||
		"Untitled";

	const description =
		document.querySelector('meta[property="og:description"]')?.content ||
		document.querySelector('meta[name="twitter:description"]')?.content ||
		document.querySelector('meta[name="description"]')?.content ||
		"";

	const author =
		document.querySelector('meta[name="author"]')?.content ||
		document.querySelector('meta[property="article:author"]')?.content ||
		"";

	const siteName =
		document.querySelector('meta[property="og:site_name"]')?.content || new URL(url).hostname;

	return {
		title: title.trim(),
		description: description.trim(),
		author: author.trim(),
		siteName: siteName.trim(),
	};
}

function hasUsableMetadata(metadata) {
	return (metadata.title !== "" && metadata.title !== "Untitled") || metadata.description !== "";
}

async function fetchPageMetadata(url) {
	const failures = [];

	for (const strategy of FETCH_STRATEGIES) {
		try {
			const metadata = await strategy.getMetadata(url);
			// We'd rather fail the run than post an "Untitled"/badly-titled
			// bookmark, so a contentless response counts as a failure too.
			if (!hasUsableMetadata(metadata)) {
				throw new Error("no title or description found in response");
			}
			if (failures.length > 0) {
				console.error(`Recovered via ${strategy.name}.`);
			}
			return metadata;
		} catch (error) {
			failures.push(`${strategy.name}: ${error.message}`);
			console.error(`${strategy.name} failed (${error.message}). Trying next source...`);
		}
	}

	throw new Error(`All metadata sources failed:\n  - ${failures.join("\n  - ")}`);
}

function createSlug(title) {
	return title
		.toLowerCase()
		.replace(/[^\w\s-]/g, "") // Remove special characters
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Replace multiple hyphens with single
		.trim();
}

function generateFrontmatter(url, metadata, commentary) {
	const now = new Date();
	const readDate = now.toISOString();

	// Clean up title and description for YAML
	const cleanTitle = metadata.title.replace(/"/g, '\\"');
	const cleanDescription = metadata.description.replace(/"/g, '\\"');

	const boilerplateCommentary = `<!-- Add your notes about this bookmark here -->

${metadata.author ? `**Author:** ${metadata.author}` : ""}
${metadata.siteName ? `**Source:** ${metadata.siteName}` : ""}`;
	const commentaryToAppend = commentary ?? boilerplateCommentary;

	return `---
title: "${cleanTitle}"
url: "${url}"
excerpt: "${cleanDescription}"
readDate: "${readDate}"
---

${commentaryToAppend}
`;
}

async function createBookmark(url, commentary) {
	try {
		// Validate URL
		new URL(url);

		console.log(`Fetching metadata for: ${url}`);
		const metadata = await fetchPageMetadata(url);

		// Create filename from title
		const slug = createSlug(metadata.title);
		const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
		const filename = `${timestamp}-${slug}.md`;

		// Create bookmark content
		const content = generateFrontmatter(url, metadata, commentary);

		// Ensure bookmark directory exists
		const bookmarkDir = path.join(DIR_NAME, "..", "src", "content", "bookmark");
		if (!fs.existsSync(bookmarkDir)) {
			fs.mkdirSync(bookmarkDir, { recursive: true });
		}

		// Write file
		const filepath = path.join(bookmarkDir, filename);

		if (fs.existsSync(filepath)) {
			console.log(`Warning: File ${filename} already exists. Overwriting...`);
		}

		fs.writeFileSync(filepath, content);

		console.log("✅ Bookmark created successfully!");
		console.log(`📁 File: ${filepath}`);
		console.log(`📝 Title: ${metadata.title}`);
		console.log(`🔗 URL: ${url}`);

		return filepath;
	} catch (error) {
		console.error("❌ Error creating bookmark:", error.message);
		process.exit(1);
	}
}

// Main execution
const url = process.argv[2];
const commentary = process.argv[3]; // optional

if (!url) {
	console.error("❌ Please provide a URL as an argument");
	console.log("Usage: npm run create-bookmark <url>");
	process.exit(1);
}

createBookmark(url, commentary);
