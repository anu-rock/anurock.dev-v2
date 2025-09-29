import { getAllBookmarks } from "@/data/bookmark";
import { siteConfig } from "@/site.config";
import rss from "@astrojs/rss";
import { render } from "astro:content";
import { experimental_AstroContainer } from "astro/container"

export const GET = async () => {
    const container = await experimental_AstroContainer.create();
    const bookmarks = await getAllBookmarks();
    const sortedBookmarks = bookmarks.sort((a, b) => 
        b.data.readDate.getTime() - a.data.readDate.getTime()
    );
    const items = await Promise.all(sortedBookmarks.map(async (bookmark) => {
        // TODO: Cache these expensive operations.
        const { Content } = await render(bookmark);
        const bookmarkCommentaryHtml = await container.renderToString(Content);

        return {
            title: bookmark.data.title,
            description: bookmark.data.excerpt,
            pubDate: bookmark.data.readDate,
            link: `bookmarks/${bookmark.id}/`,
            content: bookmarkCommentaryHtml,
            commentsUrl: bookmark.data.url, // a hack to expose the article url
        };
    }));

    return rss({
        title: `${siteConfig.title} - Bookmarks`,
        description: "My collection of bookmarks",
        site: import.meta.env.SITE,
        items: items
    });
};