import { defineCollection, z } from 'astro:content';

// ---------------------------------------------------------------------------
// Content Collection Schema — Blog Posts
// ---------------------------------------------------------------------------
// This TypeScript schema enforces frontmatter structure for all blog posts.
// Astro validates every .md file against this schema at build time.

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    /** Article title — should be SEO-optimized (60 chars max for SERP) */
    title: z.string().max(100),

    /** Meta description — 150-160 chars, includes primary keyword */
    description: z.string().max(200),

    /** Publication date in ISO 8601 format: '2024-01-15' */
    pubDate: z.coerce.date(),

    /** Optional last-modified date for evergreen content updates */
    updatedDate: z.coerce.date().optional(),

    /** Author name — defaults to site author if not set */
    author: z.string().default('TechPulse Team'),

    /** Cover image path (relative to /public/) */
    image: z.string().default('/og-default.jpg'),

    /** Alt text for the cover image (accessibility + SEO) */
    imageAlt: z.string().optional(),

    /** Tags for categorization and related posts */
    tags: z.array(z.string()).default([]),

    /** Draft flag — draft posts are excluded from build */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
