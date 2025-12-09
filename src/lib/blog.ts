export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  tags: string[];
  authors?: string[];
  content?: string; // For full blog post pages
}

export interface BlogData {
  allBlogPosts: BlogPost[];
  tagInfo: Record<string, number>;
}

// WordPress API configuration
// Set NEXT_PUBLIC_WORDPRESS_URL in .env.local or use default
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://blog.isharehow.app';
const WORDPRESS_API_BASE = `${WORDPRESS_URL}/wp-json/wp/v2`;

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Helper function to truncate text
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Transform WordPress post to our BlogPost format
function transformWordPressPost(wpPost: any): BlogPost {
  // Extract featured image
  let featuredImage: string | null = null;
  if (wpPost.featured_media && wpPost.featured_media > 0) {
    // Try to get from embedded data first
    const embeddedMedia = wpPost._embedded?.['wp:featuredmedia']?.[0];
    if (embeddedMedia) {
      featuredImage = embeddedMedia.source_url || embeddedMedia.media_details?.sizes?.full?.source_url || null;
    }
  }

  // Extract tags from embedded terms
  const tags: string[] = [];
  
  // Get categories (from wp:term[0] - categories)
  if (wpPost._embedded?.['wp:term']?.[0]) {
    wpPost._embedded['wp:term'][0].forEach((term: any) => {
      if (term.taxonomy === 'category' && term.name) {
        tags.push(term.name);
      }
    });
  }
  
  // Get tags (from wp:term[1] - post_tag)
  if (wpPost._embedded?.['wp:term']?.[1]) {
    wpPost._embedded['wp:term'][1].forEach((term: any) => {
      if (term.taxonomy === 'post_tag' && term.name) {
        tags.push(term.name);
      }
    });
  }

  // Extract author
  const authors: string[] = [];
  if (wpPost._embedded?.author?.[0]) {
    const author = wpPost._embedded.author[0];
    authors.push(author.slug || `author-${author.id}`);
    
    // Store author info in AUTHORS if not already present
    if (!AUTHORS[author.slug || `author-${author.id}`]) {
      AUTHORS[author.slug || `author-${author.id}`] = {
        name: author.name || 'Unknown Author',
        avatar: author.avatar_urls?.['96'] || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name || 'Author')}&background=4B5DBD&color=fff`,
        bio: author.description,
      };
    }
  } else if (wpPost.author) {
    // Fallback if embedded author not available
    authors.push(`author-${wpPost.author}`);
  }

  // Extract excerpt (description) - strip HTML and truncate
  let description = '';
  if (wpPost.excerpt?.rendered) {
    description = truncate(stripHtml(wpPost.excerpt.rendered), 200);
  } else if (wpPost.excerpt) {
    description = truncate(stripHtml(wpPost.excerpt), 200);
  }

  const result: BlogPost = {
    slug: wpPost.slug,
    title: wpPost.title?.rendered || wpPost.title || '',
    description: description,
    date: wpPost.date || wpPost.modified,
    tags: tags,
    authors: authors.length > 0 ? authors : ['isharehow'],
    content: wpPost.content?.rendered || wpPost.content,
  };
  
  // Only include image if it exists (null is serializable, undefined is not)
  if (featuredImage) {
    result.image = featuredImage;
  }
  
  return result;
}

// Author information - dynamically populated from WordPress
export const AUTHORS: Record<string, { name: string; avatar: string; bio?: string }> = {
  isharehow: {
    name: 'iShareHow Labs',
    avatar: 'https://ui-avatars.com/api/?name=iShareHow+Labs&background=4B5DBD&color=fff',
    bio: 'The iShareHow Labs team',
  },
};

export async function getAllBlogPosts(): Promise<BlogData> {
  try {
    // Fetch posts from WordPress REST API with embedded data
    const response = await fetch(
      `${WORDPRESS_API_BASE}/posts?_embed&per_page=100&status=publish&orderby=date&order=desc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const wpPosts = await response.json();

    // Transform WordPress posts to our format
    const allBlogPosts = wpPosts.map(transformWordPressPost);

    // Calculate tag counts
    const tagInfo: Record<string, number> = {};
    allBlogPosts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagInfo[tag] = (tagInfo[tag] || 0) + 1;
      });
    });

    return {
      allBlogPosts,
      tagInfo,
    };
  } catch (error) {
    console.error('Error fetching blog posts from WordPress:', error);
    
    // Fallback to empty data
    return {
      allBlogPosts: [],
      tagInfo: {},
    };
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  try {
    // Fetch single post by slug
    const response = await fetch(
      `${WORDPRESS_API_BASE}/posts?slug=${encodeURIComponent(slug)}&_embed&status=publish`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const wpPosts = await response.json();
    
    if (!wpPosts || wpPosts.length === 0) {
      return undefined;
    }

    return transformWordPressPost(wpPosts[0]);
  } catch (error) {
    console.error('Error fetching blog post from WordPress:', error);
    return undefined;
  }
}

export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const data = await getAllBlogPosts();
  return data.allBlogPosts.filter((post) => post.tags.includes(tag));
}

