const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const FILE_NAME = __filename || path.basename(__filename);
const DIR_NAME = path.dirname(FILE_NAME);

async function fetchPageMetadata(url) {
    try {
        const response = await fetch(url, {
            headers: {
                // Send a scraper-friendly user agent to avoid getting 403'd (eg. Substack).
                // https://www.zenrows.com/blog/user-agent-web-scraping#best
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
            }
        });
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

function generateFrontmatter(url, metadata, commentary) {
    const now = new Date();
    const readDate = now.toISOString();
    
    // Clean up title and description for YAML
    const cleanTitle = metadata.title.replace(/"/g, '\\"');
    const cleanDescription = metadata.description.replace(/"/g, '\\"');

    const boilerplateCommentary = `<!-- Add your notes about this bookmark here -->

${metadata.author ? `**Author:** ${metadata.author}` : ''}
${metadata.siteName ? `**Source:** ${metadata.siteName}` : ''}`;
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

        if(metadata.title === 'Untitled' && metadata.description === '') {
            throw new Error('Page metadata could not likely be fetched. Retrying usually fixes this.');
        }
        
        // Create filename from title
        const slug = createSlug(metadata.title);
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = `${timestamp}-${slug}.md`;
        
        // Create bookmark content
        const content = generateFrontmatter(url, metadata, commentary);
        
        // Ensure bookmark directory exists
        const bookmarkDir = path.join(DIR_NAME, '..', 'src', 'content', 'bookmark');
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
const commentary = process.argv[3]; // optional

if (!url) {
    console.error('❌ Please provide a URL as an argument');
    console.log('Usage: npm run create-bookmark <url>');
    process.exit(1);
}

createBookmark(url, commentary);