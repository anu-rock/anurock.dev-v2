import { getAllBookmarks } from "@/data/bookmark";
import { siteConfig } from "@/site.config";
import rss from "@astrojs/rss";

export const GET = async () => {
    const bookmarks = await getAllBookmarks();
    const sortedBookmarks = bookmarks.sort((a, b) => 
        b.data.readDate.getTime() - a.data.readDate.getTime()
    );
    
    return rss({
        title: `${siteConfig.title} - Bookmarks`,
        description: "My collection of bookmarks",
        site: import.meta.env.SITE,
        items: sortedBookmarks.map((bookmark) => ({
            title: bookmark.data.title,
            description: bookmark.data.excerpt,
            pubDate: bookmark.data.readDate,
            link: `bookmarks/${bookmark.id}/`,
        })),
    });
};