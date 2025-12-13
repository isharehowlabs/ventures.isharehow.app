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


/**
 * Cleans up malformed HTML where HTML tags are nested inside attributes
 * This fixes issues where WordPress content has corrupted HTML structure
 */
function cleanMalformedHtml(content: string): string {
  if (!content) return content;
  let cleaned = content;

  // Robust fix for malformed <a> with HTML inside href (e.g., href="<div>...<iframe...>")
  const anchorPattern = /<a\s+[^>]*?href\s*=\s*["'](<[\s\S]*?)["'][^>]*?>([\s\S]*?)<\/a>/gi;
  cleaned = cleaned.replace(anchorPattern, (match, hrefContent, tagContent) => {
    if (hrefContent && /</.test(hrefContent)) {
      const videoIdMatch =
        match.match(/youtube\.com\/(?:embed\/|watch\?v=)([a-zA-Z0-9_-]{11})/i) ||
        match.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
      if (videoIdMatch && videoIdMatch[1]) {
        const videoId = videoIdMatch[1];
        return `
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5rem 0;">
  <iframe
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    src="https://www.youtube.com/embed/${videoId}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    loading="lazy"
  ></iframe>
</div>`;
      }
      if (tagContent && tagContent.trim()) {
        return /<\w+[^>]*>/.test(tagContent.trim()) ? tagContent.trim() : `<p>${tagContent.trim()}</p>`;
      }
      return '';
    }
    return match;
  });

  // Fix malformed iframe with HTML inside src
  const iframePattern = /<iframe[^>]*?src\s*=\s*["'](<[\s\S]*?)["'][^>]*?>[\s\S]*?<\/iframe>/gi;
  cleaned = cleaned.replace(iframePattern, (match, srcContent) => {
    if (srcContent && /</.test(srcContent)) {
      const videoIdMatch =
        match.match(/youtube\.com\/(?:embed\/|watch\?v=)([a-zA-Z0-9_-]{11})/i) ||
        match.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
      if (videoIdMatch && videoIdMatch[1]) {
        const videoId = videoIdMatch[1];
        return `
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5rem 0;">
  <iframe
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    src="https://www.youtube.com/embed/${videoId}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    loading="lazy"
  ></iframe>
</div>`;
      }
      return '';
    }
    return match;
  });

  return cleaned;
}


/**
 * Converts YouTube URLs in blog content to embedded video players
 * Handles various YouTube URL formats including:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * - Bare YouTube links in <a> tags or plain text
 */
export function embedYouTubeVideos(content: string): string {
  if (!content) return content;

  // First, clean up any malformed HTML
  let processedContent = cleanMalformedHtml(content);

  // Regular expression to match YouTube URLs and extract video IDs
  const youtubePatterns = [
    // Match youtube.com/watch?v=VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g,
    // Match youtu.be/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/g,
    // Match youtube.com/embed/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g,
  ];

  // Process each pattern
  youtubePatterns.forEach(pattern => {
    processedContent = processedContent.replace(pattern, (match, videoId) => {
      // Skip if this is already inside an iframe embed
      if (match.includes('youtube.com/embed/')) {
        return match;
      }
      // Create responsive iframe embed
      return `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5rem 0;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      `.trim();
    });
  });

  // Also handle YouTube links wrapped in anchor tags (but not already processed)
  processedContent = processedContent.replace(
    /<a[^>]*href=["'](?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})[^"']*["'][^>]*>.*?<\/a>/gi,
    (match, videoId) => {
      // Skip if already converted to embed
      if (match.includes('youtube.com/embed/')) {
        return match;
      }
      return `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5rem 0;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      `.trim();
    }
  );

  return processedContent;
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
    content: embedYouTubeVideos(wpPost.content?.rendered || wpPost.content || ''),
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

