import { getCollection } from "astro:content";
import { siteConfig } from "@/site.config";
import rss from "@astrojs/rss";
import { render } from "astro:content";
import { experimental_AstroContainer } from "astro/container"

export const GET = async () => {
	const notes = await getCollection("note");
	const container = await experimental_AstroContainer.create();

	const items = await Promise.all(notes.map(async (note) => {
		// TODO: Cache these expensive operations.
        const { Content } = await render(note);
        const noteContentHtml = await container.renderToString(Content);

		return {
			title: note.data.title,
			pubDate: note.data.publishDate,
			link: `notes/${note.id}/`,
			content: noteContentHtml,
		};
	}));

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: items,
	});
};
