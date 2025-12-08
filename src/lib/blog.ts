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

// Mock blog posts - replace with actual data source (CMS, markdown files, etc.)
const blogPosts: BlogPost[] = [
  {
    slug: 'welcome-to-isharehow-blog',
    title: 'Welcome to the iShareHow Blog',
    description: 'Discover insights, tutorials, and updates from the iShareHow Labs team. Learn about our services, community, and the latest in digital transformation.',
    date: '2025-01-15',
    tags: ['announcement', 'community'],
    authors: ['isharehow'],
    image: '/images/blog/welcome.jpg',
  },
  {
    slug: 'getting-started-with-caas',
    title: 'Getting Started with Creative-as-a-Service',
    description: 'Learn how our Creative-as-a-Service model can transform your business operations and help you scale without the overhead of traditional agencies.',
    date: '2025-01-10',
    tags: ['creative', 'services', 'tutorial'],
    authors: ['isharehow'],
    image: '/images/blog/caas.jpg',
  },
  {
    slug: 'rise-journey-consciousness-levels',
    title: 'Understanding the 7 Levels of Consciousness in Rise Journey',
    description: 'Explore the seven levels of consciousness in our Rise Journey program and discover how each level contributes to your personal and professional growth.',
    date: '2025-01-05',
    tags: ['rise', 'wellness', 'consciousness'],
    authors: ['isharehow'],
    image: '/images/blog/rise.jpg',
  },
  {
    slug: 'cooperation-community-building',
    title: 'Building a Conscious Community: The iShareHow CoOperation',
    description: 'Learn about our CoOperation model and how we\'re building a community of conscious creators who rise together.',
    date: '2024-12-28',
    tags: ['community', 'cooperation', 'growth'],
    authors: ['isharehow'],
    image: '/images/blog/cooperation.jpg',
  },
  {
    slug: 'seo-prospecting-best-practices',
    title: '10X Your SEO Prospecting: Best Practices for Agency Owners',
    description: 'Discover proven strategies and scripts to improve your SEO prospecting and close more high-ticket clients.',
    date: '2024-12-20',
    tags: ['seo', 'prospecting', 'business'],
    authors: ['isharehow'],
    image: '/images/blog/seo.jpg',
  },
  {
    slug: 'dashboard-features-overview',
    title: 'Maximizing Your Co-Work Dashboard: Features and Tips',
    description: 'Get the most out of your Co-Work Dashboard with these tips and tricks for collaboration and productivity.',
    date: '2024-12-15',
    tags: ['dashboard', 'productivity', 'tutorial'],
    authors: ['isharehow'],
    image: '/images/blog/dashboard.jpg',
  },
  {
    slug: 'ai-content-creation-guide',
    title: 'AI Content Creation: A Complete Guide for Modern Creators',
    description: 'Learn how to leverage AI tools for content creation while maintaining authenticity and building your unique voice.',
    date: '2024-12-10',
    tags: ['ai', 'content', 'creativity'],
    authors: ['isharehow'],
    image: '/images/blog/ai.jpg',
  },
];

// Author information
export const AUTHORS: Record<string, { name: string; avatar: string; bio?: string }> = {
  isharehow: {
    name: 'iShareHow Labs',
    avatar: 'https://ui-avatars.com/api/?name=iShareHow+Labs&background=4B5DBD&color=fff',
    bio: 'The iShareHow Labs team',
  },
};

export function getAllBlogPosts(): BlogData {
  const allBlogPosts = [...blogPosts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

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
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter((post) => post.tags.includes(tag));
}

