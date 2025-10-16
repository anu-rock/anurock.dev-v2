import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const baseSchema = z.object({
	title: z.string().max(80),
});

const post = defineCollection({
	loader: glob({ base: "./src/content/post", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
			draft: z.boolean().default(false),
			ogImage: z.string().optional(),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
		}),
});

const note = defineCollection({
	loader: glob({ base: "./src/content/note", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) => 
		baseSchema.extend({
		description: z.string().optional(),
		coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
		publishDate: z
			.string()
			.or(z.date())
			.transform((val) => new Date(val)),
	}),
});

const bookmark = defineCollection({
	loader: glob({ base: "./src/content/bookmark", pattern: "**/*.{md,mdx}" }),
	schema: baseSchema.extend({
		url: z.string().url(),
		excerpt: z.string(),
		readDate: z
			.string()
			.datetime({ offset: true })
			.transform((val) => new Date(val)),
	}),
});

export const collections = { post, note, bookmark };
