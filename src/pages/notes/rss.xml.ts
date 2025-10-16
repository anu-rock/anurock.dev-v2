import { getCollection } from "astro:content";
import { siteConfig } from "@/site.config";
import rss from "@astrojs/rss";
import { render } from "astro:content";
import { experimental_AstroContainer } from "astro/container"
import { getImage } from "astro:assets";

export const GET = async () => {
	const notes = await getCollection("note");
	const container = await experimental_AstroContainer.create();
	const sortedNotes = notes.sort((a, b) => 
        b.data.publishDate.getTime() - a.data.publishDate.getTime()
    );

	const items = await Promise.all(sortedNotes.map(async (note) => {
		// TODO: Cache these expensive operations.
        const { Content } = await render(note);
        const noteContentHtml = await container.renderToString(Content);
		const coverImage = note.data.coverImage ? await getImage({ src: note.data.coverImage.src }) : null;

		const item = {
			title: note.data.title,
			pubDate: note.data.publishDate,
			link: `notes/${note.id}/`,
			content: noteContentHtml,
		};

		Object.assign(item, coverImage && {
			enclosure: {
				url: coverImage.src,
				type: "image/jpeg",
				// Length is required but not actually used by most feed readers.
				// Also, it's a bit tricky to get the actual length without fetching the image.
				// So we'll just use 1 if there's a cover image, and 0 if there isn't.
				length: 1,
			}
		});

		return item;
	}));

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: items,
	});
};
