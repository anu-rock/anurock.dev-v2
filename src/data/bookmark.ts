import { type CollectionEntry, getCollection } from "astro:content";

/** get all bookmarks */
export async function getAllBookmarks(): Promise<CollectionEntry<"bookmark">[]> {
    return await getCollection("bookmark");
}

/** groups bookmarks by year (based on readDate), using the year as the key */
export function groupBookmarksByYear(bookmarks: CollectionEntry<"bookmark">[]) {
    return bookmarks.reduce<Record<string, CollectionEntry<"bookmark">[]>>((acc, bookmark) => {
        const year = bookmark.data.readDate.getFullYear();
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year]?.push(bookmark);
        return acc;
    }, {});
}