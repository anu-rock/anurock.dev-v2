import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchPageMetadata(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Extract metadata
        const title = 
            document.querySelector('meta[property="og:title"]')?.content ||
            document.querySelector('meta[name="twitter:title"]')?.content ||
            document.querySelector('title')?.textContent ||
            'Untitled';

        const description = 
            document.querySelector('meta[property="og:description"]')?.content ||
            document.querySelector('meta[name="twitter:description"]')?.content ||
            document.querySelector('meta[name="description"]')?.content ||
            '';

        const author = 
            document.querySelector('meta[name="author"]')?.content ||
            document.querySelector('meta[property="article:author"]')?.content ||
            '';

        const siteName = 
            document.querySelector('meta[property="og:site_name"]')?.content ||
            new URL(url).hostname;

        return {
            title: title.trim(),
            description: description.trim(),
            author: author.trim(),
            siteName: siteName.trim()
        };
    } catch (error) {
        console.error('Error fetching metadata:', error.message);
        return {
            title: 'Untitled',
            description: '',
            author: '',
            siteName: new URL(url).hostname
        };
    }
}

function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
}

function generateFrontmatter(url, metadata) {
    const now = new Date();
    const readDate = now.toISOString();
    
    // Clean up title and description for YAML
    const cleanTitle = metadata.title.replace(/"/g, '\\"');
    const cleanDescription = metadata.description.replace(/"/g, '\\"');
    
    return `---
title: "${cleanTitle}"
url: "${url}"
excerpt: "${cleanDescription}"
readDate: "${readDate}"
---

<!-- Add your notes about this bookmark here -->

${metadata.author ? `**Author:** ${metadata.author}` : ''}
${metadata.siteName ? `**Source:** ${metadata.siteName}` : ''}
`;
}

async function createBookmark(url) {
    try {
        // Validate URL
        new URL(url);
        
        console.log(`Fetching metadata for: ${url}`);
        const metadata = await fetchPageMetadata(url);
        
        // Create filename from title
        const slug = createSlug(metadata.title);
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = `${timestamp}-${slug}.md`;
        
        // Create bookmark content
        const content = generateFrontmatter(url, metadata);
        
        // Ensure bookmark directory exists
        const bookmarkDir = path.join(__dirname, '..', 'src', 'content', 'bookmark');
        if (!fs.existsSync(bookmarkDir)) {
            fs.mkdirSync(bookmarkDir, { recursive: true });
        }
        
        // Write file
        const filepath = path.join(bookmarkDir, filename);
        
        if (fs.existsSync(filepath)) {
            console.log(`Warning: File ${filename} already exists. Overwriting...`);
        }
        
        fs.writeFileSync(filepath, content);
        
        console.log(`✅ Bookmark created successfully!`);
        console.log(`📁 File: ${filepath}`);
        console.log(`📝 Title: ${metadata.title}`);
        console.log(`🔗 URL: ${url}`);
        
        return filepath;
    } catch (error) {
        console.error('❌ Error creating bookmark:', error.message);
        process.exit(1);
    }
}

// Main execution
const url = process.argv[2];

if (!url) {
    console.error('❌ Please provide a URL as an argument');
    console.log('Usage: npm run create-bookmark <url>');
    process.exit(1);
}

createBookmark(url);