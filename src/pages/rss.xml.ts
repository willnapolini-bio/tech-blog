import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

// ---------------------------------------------------------------------------
// RSS Feed Endpoint — /rss.xml
// ---------------------------------------------------------------------------
// Generates a valid RSS 2.0 feed from all published blog posts.
// Replace site URL with your actual GitHub Pages URL.

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );

  return rss({
    title: 'TechPulse',
    description: 'Practical guides, framework comparisons, and deployment tutorials for modern web developers.',
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id.replace(/\.md$/, '')}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
    stylesheet: false,
  });
}
